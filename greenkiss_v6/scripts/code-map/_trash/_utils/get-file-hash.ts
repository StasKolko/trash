import { createHash } from "crypto";
import { createReadStream } from "fs";
import path from "path";

export function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!path.isAbsolute(filePath)) {
      return reject(new Error("File path must be absolute"));
    }

    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("error", (err) => reject(err));

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      const digest = hash.digest("hex");
      resolve(digest);
    });
  });
}
