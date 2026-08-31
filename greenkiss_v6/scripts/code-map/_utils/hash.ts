import { createHash } from 'node:crypto';
import { promises } from 'node:fs';

export async function calculateFileHash(filePath: string): Promise<string> {
  const hash = createHash('sha256');

  const fileHandle = await promises.open(filePath, 'r');
  try {
    const stream = fileHandle.createReadStream();
    return await new Promise<string>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        hash.update(chunk);
      });
      stream.on('error', (error) => {
        reject(error);
      });
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
    });
  } finally {
    await fileHandle.close();
  }
}
