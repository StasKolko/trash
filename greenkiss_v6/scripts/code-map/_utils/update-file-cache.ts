import type { EntryInfo, Cache } from "../_types";
import { getFileHash } from "./get-file-hash";

export async function updateFileCache({
  files,
  cache
}: {
  files: EntryInfo[];
  cache: Cache;
}) {
  for (const { name, path } of files) {
    const fileHash = await getFileHash(path);

    if (!(name in cache)) {
      cache[name] = {
        status: "error",
        hash: fileHash,
        newHash: fileHash
      };
    }

    cache[name].newHash = fileHash;
    if (cache[name].newHash !== cache[name].hash) {
      cache[name].status = "error";
    }
  }
}