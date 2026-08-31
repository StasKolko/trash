export async function hashFile(path: string): Promise<string> {
  const algo = "sha256" as const;

  const file = Bun.file(path);
  const hasher = new Bun.CryptoHasher(algo);

  const data = await file.arrayBuffer();
  hasher.update(data);

  return hasher.digest("hex");
}
