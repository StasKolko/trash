let totalHashedFiles = 0;
let totalOkFiles = 0;
let totalErrorFiles = 0;

export function printStats(): void {
  console.log("Hashed files:", totalHashedFiles);
  console.log("OK files:", totalOkFiles);
  console.log("Error files:", totalErrorFiles);

  const okPercent =
    totalHashedFiles === 0 ? 0 : (totalOkFiles / totalHashedFiles) * 100;

  console.log(`OK files percent: ${okPercent.toFixed(2)}%`);
}

export function incrementFiles(status: "ok" | "error"): void {
  totalHashedFiles += 1;

  if (status === "ok") {
    totalOkFiles += 1;
  } else {
    totalErrorFiles += 1;
  }
}
