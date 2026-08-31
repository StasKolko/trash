import type { RoleVoiceMapping } from "@packages/contract/segment";

import type { TtsJobSegmentEntry } from "./_tts-jobs-types";

const DOWNLOAD_STAGGER_MS = 300;

function buildMappingsFromSegments(
  segments: TtsJobSegmentEntry[],
): RoleVoiceMapping[] {
  const seen = new Map<string, string>();
  for (const seg of segments) {
    const key = seg.role.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, seg.voiceId);
    }
  }
  return [...seen.entries()].map(([, voiceId], i) => ({
    role:
      segments.find((s) => s.role.toLowerCase() === [...seen.keys()][i])?.role
      ?? "",
    voiceId,
  }));
}

function getUniqueRoles(segments: { role: string }[]): string[] {
  const seen = new Set<string>();
  const roles: string[] = [];
  for (const seg of segments) {
    const key = seg.role.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      roles.push(seg.role.trim());
    }
  }
  return roles;
}

function handleFileDownload(
  blobUrl: string | null,
  downloadUrl: string,
  fileName: string,
): void {
  if (blobUrl) {
    triggerDownload(blobUrl, fileName);
  } else {
    fetch(downloadUrl)
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
      });
  }
}

function downloadFile(url: string, fileName: string): void {
  fetch(url)
    .then((r) => r.blob())
    .then((b) => {
      const blobUrl = URL.createObjectURL(b);
      triggerDownload(blobUrl, fileName);
      URL.revokeObjectURL(blobUrl);
    });
}

async function downloadAllFiles(
  files: { downloadUrl: string; fileName: string }[],
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) {
      continue;
    }
    downloadFile(file.downloadUrl, file.fileName);
    if (i < files.length - 1) {
      // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER
      await sleep(DOWNLOAD_STAGGER_MS);
    }
  }
}

function triggerDownload(blobUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export {
  buildMappingsFromSegments,
  downloadAllFiles,
  downloadFile,
  getUniqueRoles,
  handleFileDownload,
};
