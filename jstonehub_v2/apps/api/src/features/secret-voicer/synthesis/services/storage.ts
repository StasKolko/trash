import fs from "node:fs/promises";
import path from "node:path";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import {
  generateStorageFolderName,
  generateTaskFilename,
  getProjectStoragePath,
} from "../lib/helpers";

export async function createProjectFolder(
  projectName: string,
  projectId: string,
): Promise<string> {
  const folderName = generateStorageFolderName(projectName, projectId);
  const folderPath = getProjectStoragePath(folderName);

  await fs.mkdir(folderPath, { recursive: true });

  return folderName;
}

export async function saveTaskAudio(
  storagePath: string,
  orderIndex: number,
  totalTasks: number,
  audioBuffer: ArrayBuffer,
): Promise<string> {
  const filename = generateTaskFilename(orderIndex, totalTasks);
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
    filename,
  );

  await fs.writeFile(fullPath, Buffer.from(audioBuffer));

  return filename;
}

export async function deleteProjectFolder(storagePath: string): Promise<void> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    await fs.rm(fullPath, { recursive: true, force: true });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn(`[Storage] Could not delete folder: ${fullPath}`, error);
  }
}

export async function getProjectFiles(storagePath: string): Promise<string[]> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    const files = await fs.readdir(fullPath);
    return files.filter((f) => f.endsWith(SYNTHESIS_CONSTANTS.FILE_EXTENSION));
  } catch {
    return [];
  }
}

export function readProjectFile(
  storagePath: string,
  filename: string,
): Promise<Buffer> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
    filename,
  );
  return fs.readFile(fullPath);
}

export async function projectFolderExists(
  storagePath: string,
): Promise<boolean> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
