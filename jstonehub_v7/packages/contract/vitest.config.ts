import { createBackendConfig } from "@configs/vitest";

export default createBackendConfig({
  test: {
    coverage: {
      exclude: [
        "src/auth-error.ts",
        "src/http-status.ts",
        "src/pagination/client.ts",
        "src/pagination/server.ts",
      ],
    },
  },
});
