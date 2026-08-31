import type {
  CreateTaskResponse,
  SynthesizePayload,
  TaskStatusResponse,
  VoiceRequestConfig,
} from "./types";

const BASE_URL = "https://secret-voicer.ru/api";

export class SecretVoicerExternalService {
  private getHeaders(config: VoiceRequestConfig) {
    // Очистка токенов от пробелов и переносов строк при копировании
    const csrf = config.csrfToken.trim();
    const session = config.sessionId.trim();

    return {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,ru;q=0.8",
      "content-type": "application/json",
      // Формируем cookie строго
      cookie: `csrftoken=${csrf}; sessionid=${session}`,
      origin: "https://secret-voicer.ru",
      referer: "https://secret-voicer.ru/app/",
      "sec-ch-ua": config.secChUa,
      "sec-ch-ua-mobile": config.secChUaMobile,
      // Убедимся, что кавычки в платформе корректны (они должны быть в базе, но на всякий случай)
      "sec-ch-ua-platform": config.secChUaPlatform,
      "user-agent": config.userAgent,
      "x-csrftoken": csrf,
    };
  }

  public async createTask(
    config: VoiceRequestConfig,
    payload: SynthesizePayload,
  ): Promise<CreateTaskResponse> {
    const body = {
      model_id: "eleven_multilingual_v2",
      provider: "default",
      rate: payload.rate ?? 1,
      similarity_boost: 0.75,
      stability: 0.5,
      style: 0,
      text: payload.text,
      voice_id: payload.voice_id,
    };

    try {
      const response = await fetch(`${BASE_URL}/synthesize/`, {
        method: "POST",
        headers: this.getHeaders(config),
        body: JSON.stringify(body),
        // ВАЖНО: Не следовать за редиректами. Если сессия мертва, сервер вернет 302, а не 404 html
        redirect: "manual",
      });

      const redirectStatus = 300;
      const maxRedirectStatus = 400;
      // Обработка потери авторизации (Редирект на логин)
      if (
        response.status >= redirectStatus
        && response.status < maxRedirectStatus
      ) {
        throw new Error(
          `Auth Failed (Redirected with status ${response.status}). Check Session ID/CSRF.`,
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        // Если вернулся HTML (например 404 страница сайта), значит мы стучимся не туда или нас отшили
        if (
          errorText.trim().startsWith("<html")
          || errorText.trim().startsWith("<!DOCTYPE")
        ) {
          throw new Error(
            `External API Error (${response.status}): Probably Invalid Credentials or Blocked Request.`,
          );
        }
      }

      return (await response.json()) as CreateTaskResponse;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Network/Fetch Error: ${e.message}`);
      }
      throw e;
    }
  }

  public async checkTaskStatus(
    config: VoiceRequestConfig,
    taskId: string,
  ): Promise<TaskStatusResponse> {
    const response = await fetch(`${BASE_URL}/task/${taskId}/`, {
      method: "GET",
      headers: this.getHeaders(config),
      redirect: "manual", // Также отключаем редиректы здесь
    });

    const maxRedirects = 300;
    const redirectCount = 400;
    if (response.status >= maxRedirects && response.status < redirectCount) {
      throw new Error(
        `Auth Failed (Redirected ${response.status}) during Status Check.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("<html")) {
        throw new Error(
          `Invalid Status Check Response (HTML). Status: ${response.status}`,
        );
      }
      const maxLength = 100;
      throw new Error(
        `Check Status Error (${response.status}): ${errorText.substring(0, maxLength)}`,
      );
    }

    return (await response.json()) as TaskStatusResponse;
  }

  public async downloadAudio(
    config: VoiceRequestConfig,
    audioPath: string,
  ): Promise<ArrayBuffer> {
    const url = `https://secret-voicer.ru${audioPath}`;
    const response = await fetch(url, {
      headers: this.getHeaders(config),
      redirect: "manual",
    });

    if (!response.ok) {
      throw new Error(`Download Error (${response.status})`);
    }

    return await response.arrayBuffer();
  }
}

export const externalApiService = new SecretVoicerExternalService();
