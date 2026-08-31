import { Target } from "../scripts/context-builder/types";

export const targets: Target[] = [
  {
    name: "core",
    isActive: false,
    includes: ['./'],
    ignoreFiles: ['css.ts', 'id.ts', 'react.ts', 'only-dev-card.tsx'],
    ignoreFolders: ['image-kit'],
  },
  {
    name: "code-map",
    isActive: true,
    includes: ['./scripts/code-map'],
    ignoreFiles: [],
    ignoreFolders: [],
  }
]