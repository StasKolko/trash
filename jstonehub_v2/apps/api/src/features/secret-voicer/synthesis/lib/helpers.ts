import path from "node:path";
import { SYNTHESIS_CONSTANTS } from "./constants";

export function generateStorageFolderName(
  projectName: string,
  projectId: string,
): string {
  const safeName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, SYNTHESIS_CONSTANTS.PROJECT_NAME_MAX_LENGTH);

  const idPrefix = projectId.slice(
    0,
    SYNTHESIS_CONSTANTS.PROJECT_ID_PREFIX_LENGTH,
  );

  return `${safeName}_${idPrefix}`;
}

export function getProjectStoragePath(folderName: string): string {
  return path.join(SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH, folderName);
}

export function generateTaskFilename(
  orderIndex: number,
  totalTasks: number,
): string {
  const digits = String(totalTasks).length;
  const paddedIndex = String(orderIndex).padStart(digits, "0");
  return `${paddedIndex}${SYNTHESIS_CONSTANTS.FILE_EXTENSION}`;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  const maxProgress = 100;
  return Math.round((completed / total) * maxProgress);
}

export function validateRate(rate: number | undefined): number {
  if (rate === undefined) {
    return SYNTHESIS_CONSTANTS.DEFAULT_RATE;
  }
  return Math.max(
    SYNTHESIS_CONSTANTS.MIN_RATE,
    Math.min(SYNTHESIS_CONSTANTS.MAX_RATE, rate),
  );
}
