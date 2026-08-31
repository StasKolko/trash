// apps/hub/src/features/voiceover/ui/voiceover-page.tsx
import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";
import { Show } from "solid-js";
import { useVoiceover } from "../model/hooks";
import { JsonEditor } from "./json-editor";
import { PreviewPanel } from "./preview-panel";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectsList } from "./projects-list";
import { VoiceReplacer } from "./voice-replacer";

export function VoiceoverPage() {
  const {
    state,
    voices,
    selectedProject,
    jsonInput,
    setJsonInput,
    preview,
    isCreating,
    openDialog,
    closeDialog,
    updatePreview,
    replaceVoice,
    createProject,
    deleteProject,
    retryFailedTasks,
    restartProject,
    fetchProjectDetails,
    refetch,
  } = useVoiceover();

  const handleViewProject = async (id: string) => {
    await fetchProjectDetails(id);
    openDialog("details", id);
  };

  return (
    <Container class="py-8 space-y-8">
      {/* Header */}
      <div>
        <Typography type="title" level={1}>
          Озвучка
        </Typography>
        <Typography color="muted" class="mt-2">
          Создавайте проекты озвучки текстов с помощью Secret Voicer
        </Typography>
      </div>

      {/* Create Section */}
      <div class="space-y-4">
        <Show
          when={preview()}
          fallback={
            <JsonEditor
              value={jsonInput()}
              onChange={setJsonInput}
              onPreview={updatePreview}
              disabled={isCreating()}
            />
          }
        >
          {(p) => (
            <>
              <VoiceReplacer
                preview={p()}
                voices={voices()}
                onReplace={replaceVoice}
              />
              <PreviewPanel
                preview={p()}
                isCreating={isCreating()}
                onSubmit={createProject}
                onCancel={() => {
                  setJsonInput("");
                  updatePreview();
                }}
              />
            </>
          )}
        </Show>
      </div>

      {/* Projects List */}
      <ProjectsList
        projects={state().projects}
        isLoading={state().isLoading}
        error={state().error}
        onRefresh={refetch}
        onView={handleViewProject}
        onDelete={deleteProject}
        onRetry={retryFailedTasks}
      />

      {/* Details Dialog */}
      <Show when={selectedProject()}>
        {(project) => (
          <ProjectDetailsDialog
            open={state().activeDialog === "details"}
            project={project()}
            onClose={closeDialog}
            onRetryFailed={() => retryFailedTasks(project().id)}
            onRestart={() => restartProject(project().id)}
            onDelete={() => deleteProject(project().id)}
          />
        )}
      </Show>
    </Container>
  );
}
