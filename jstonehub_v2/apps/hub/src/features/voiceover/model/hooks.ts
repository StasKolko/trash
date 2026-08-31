import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { synthesisApi, voicesApi } from "./api";
import type {
  CreateProjectInput,
  ProjectPreview,
  ProjectWithTasks,
  PublicVoice,
  TaskPreview,
  VoiceoverDialogType,
  VoiceoverState,
} from "./types";

const RATE_MIN = 0.5;
const RATE_MAX = 2.0;
const DEFAULT_RATE = 1;
const POLLING_INTERVAL_MS = 3000;

function formatApiError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  // Ошибки авторизации
  if (msg.includes("Auth Failed") || msg.includes("Session expired")) {
    return "Сессия истекла. Обновите credentials в админке.";
  }

  if (msg.includes("No active credentials")) {
    return "Нет активных credentials. Добавьте их в админке.";
  }

  if (msg.includes("redirect") || msg.includes("302")) {
    return "Ошибка авторизации. Проверьте credentials в админке.";
  }

  // Ошибки валидации
  if (msg.includes("Invalid voice")) {
    return "Один или несколько голосов не найдены в базе.";
  }

  return msg;
}

function buildVoiceMap(voices: PublicVoice[]): Map<string, PublicVoice> {
  const map = new Map<string, PublicVoice>();
  for (const voice of voices) {
    map.set(voice.externalVoiceId, voice);
  }
  return map;
}

function extractActiveProjectIds(
  projects: VoiceoverState["projects"],
): string[] {
  return projects
    .filter((p) => p.status === "PROCESSING" || p.status === "PENDING")
    .map((p) => p.id);
}

function validateTaskFields(
  task: Record<string, unknown>,
  voiceMapRef: Map<string, PublicVoice>,
): { errors: string[]; voiceName: string | null } {
  const taskErrors: string[] = [];

  if (!task.text || typeof task.text !== "string") {
    taskErrors.push("text обязателен");
  }

  if (!task.voiceId || typeof task.voiceId !== "string") {
    taskErrors.push("voiceId обязателен");
  }

  const rate = typeof task.rate === "number" ? task.rate : DEFAULT_RATE;
  if (rate < RATE_MIN || rate > RATE_MAX) {
    taskErrors.push(`rate должен быть от ${RATE_MIN} до ${RATE_MAX}`);
  }

  const voiceId = String(task.voiceId || "");
  const voice = voiceMapRef.get(voiceId);

  if (voiceId && !voice) {
    taskErrors.push(`Голос "${voiceId}" не найден`);
  }

  return { errors: taskErrors, voiceName: voice?.name ?? null };
}

function mapTaskToPreview(
  task: unknown,
  index: number,
  voiceMapRef: Map<string, PublicVoice>,
): TaskPreview {
  const t = task as Record<string, unknown>;
  const { errors: taskErrors, voiceName } = validateTaskFields(t, voiceMapRef);

  const rate = typeof t.rate === "number" ? t.rate : DEFAULT_RATE;
  const voiceId = String(t.voiceId || "");

  return {
    index: index + 1,
    text: String(t.text || ""),
    voiceId,
    voiceName,
    rate,
    isValid: taskErrors.length === 0,
    error: taskErrors.join("; "),
  };
}

function validateProjectStructure(parsed: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!parsed.name || typeof parsed.name !== "string") {
    errors.push("Поле 'name' обязательно");
  }

  if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    errors.push("Массив 'tasks' должен содержать хотя бы одну задачу");
  }

  return errors;
}

function parseProjectJson(
  json: string,
  voiceMapRef: Map<string, PublicVoice>,
): ProjectPreview | null {
  if (!json.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(json);
    const errors = validateProjectStructure(parsed);

    const tasks: TaskPreview[] = (parsed.tasks || []).map(
      (task: unknown, index: number) =>
        mapTaskToPreview(task, index, voiceMapRef),
    );

    const invalidTasks = tasks.filter((t) => !t.isValid);
    if (invalidTasks.length > 0) {
      errors.push(`${invalidTasks.length} задач с ошибками`);
    }

    return {
      name: String(parsed.name || ""),
      tasks,
      isValid: errors.length === 0 && tasks.every((t) => t.isValid),
      errors,
    };
  } catch {
    return {
      name: "",
      tasks: [],
      isValid: false,
      errors: ["Невалидный JSON"],
    };
  }
}

function replaceVoiceInJson(
  json: string,
  oldVoiceId: string,
  newVoiceId: string,
): string | null {
  try {
    const parsed = JSON.parse(json);
    parsed.tasks = parsed.tasks.map((task: Record<string, unknown>) => {
      if (task.voiceId === oldVoiceId) {
        return { ...task, voiceId: newVoiceId };
      }
      return task;
    });
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

function buildCreateProjectInput(preview: ProjectPreview): CreateProjectInput {
  return {
    name: preview.name,
    tasks: preview.tasks.map((t) => ({
      text: t.text,
      voiceId: t.voiceId,
      rate: t.rate,
    })),
  };
}

export function useVoiceover() {
  const [state, setState] = createSignal<VoiceoverState>({
    projects: [],
    isLoading: true,
    error: null,
    activeDialog: null,
    selectedProjectId: null,
  });

  const [voices, setVoices] = createSignal<PublicVoice[]>([]);
  const [selectedProject, setSelectedProject] =
    createSignal<ProjectWithTasks | null>(null);
  const [jsonInput, setJsonInput] = createSignal("");
  const [preview, setPreview] = createSignal<ProjectPreview | null>(null);
  const [isCreating, setIsCreating] = createSignal(false);
  const [pollingEnabled, setPollingEnabled] = createSignal(true);

  const voiceMap = createMemo(() => buildVoiceMap(voices()));

  const activeProjectIds = createMemo(() =>
    extractActiveProjectIds(state().projects),
  );

  const hasActiveProjects = createMemo(() => activeProjectIds().length > 0);

  const openDialog = (type: VoiceoverDialogType, projectId?: string) => {
    setState((s) => ({
      ...s,
      activeDialog: type,
      selectedProjectId: projectId ?? null,
    }));
  };

  const closeDialog = () => {
    setState((s) => ({
      ...s,
      activeDialog: null,
      selectedProjectId: null,
    }));
    setSelectedProject(null);
  };

  const fetchProjects = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const projects = await synthesisApi.getAll();
      setState((s) => ({ ...s, projects, isLoading: false }));
    } catch (e) {
      const msg = formatApiError(e); // <-- Изменить здесь
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  const fetchVoices = async () => {
    try {
      const data = await voicesApi.getAll();
      setVoices(data as PublicVoice[]);
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to fetch voices:", e);
    }
  };

  const fetchProjectDetails = async (id: string) => {
    try {
      const project = await synthesisApi.getById(id);
      setSelectedProject(project);
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to fetch project details:", e);
    }
  };

  createEffect(() => {
    if (!(hasActiveProjects() && pollingEnabled())) {
      return;
    }

    const pollProjects = async () => {
      try {
        const projects = await synthesisApi.getAll();
        setState((s) => ({ ...s, projects }));

        const selectedId = state().selectedProjectId;
        if (selectedId && activeProjectIds().includes(selectedId)) {
          const details = await synthesisApi.getById(selectedId);
          setSelectedProject(details);
        }
      } catch (e) {
        // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
        console.error("Polling error:", e);
      }
    };

    const intervalId = setInterval(pollProjects, POLLING_INTERVAL_MS);

    onCleanup(() => {
      clearInterval(intervalId);
    });
  });

  const updatePreview = () => {
    const result = parseProjectJson(jsonInput(), voiceMap());
    setPreview(result);
  };

  const replaceVoice = (oldVoiceId: string, newVoiceId: string) => {
    const updated = replaceVoiceInJson(jsonInput(), oldVoiceId, newVoiceId);
    if (updated) {
      setJsonInput(updated);
      updatePreview();
    }
  };

  const createProject = async () => {
    const p = preview();
    if (!p?.isValid) {
      return;
    }

    setIsCreating(true);
    try {
      const input = buildCreateProjectInput(p);
      const { project } = await synthesisApi.create(input);

      await synthesisApi.start(project.id);
      await fetchProjects();

      setJsonInput("");
      setPreview(null);

      openDialog("details", project.id);
      await fetchProjectDetails(project.id);
    } catch (e) {
      const msg = formatApiError(e);
      setState((s) => ({ ...s, error: msg }));
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await synthesisApi.delete(id);
      await fetchProjects();
      closeDialog();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to delete project:", e);
    }
  };

  const retryFailedTasks = async (id: string) => {
    try {
      await synthesisApi.retryFailed(id);
      await fetchProjectDetails(id);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to retry:", e);
    }
  };

  const restartProject = async (id: string) => {
    try {
      await synthesisApi.restart(id);
      await fetchProjectDetails(id);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to restart:", e);
    }
  };

  const pauseProject = async (id: string) => {
    try {
      await synthesisApi.pause(id);
      await fetchProjectDetails(id);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to pause:", e);
    }
  };

  const cancelProject = async (id: string) => {
    try {
      await synthesisApi.cancel(id);
      await fetchProjectDetails(id);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to cancel:", e);
    }
  };

  const retryTask = async (taskId: string, projectId: string) => {
    try {
      await synthesisApi.retryTask(taskId);
      await fetchProjectDetails(projectId);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to retry task:", e);
    }
  };

  onMount(async () => {
    await Promise.all([fetchProjects(), fetchVoices()]);
  });

  return {
    state,
    voices,
    voiceMap,
    selectedProject,
    jsonInput,
    setJsonInput,
    preview,
    isCreating,
    hasActiveProjects,

    openDialog,
    closeDialog,

    updatePreview,
    replaceVoice,

    createProject,
    deleteProject,
    retryFailedTasks,
    restartProject,
    pauseProject,
    cancelProject,
    retryTask,

    fetchProjectDetails,
    refetch: fetchProjects,

    setPollingEnabled,
  };
}
