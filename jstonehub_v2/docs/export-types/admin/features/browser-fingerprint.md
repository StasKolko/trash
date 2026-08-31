```tsx
import {
  BrowserFingerprintsPage,
  browserFingerprintApi,
} from "#admin/features/browser-fingerprint";

type BrowserFingerprintsPage = Component;

const browserFingerprintApi = {
  getAll: () => Promise<BrowserFingerprint[]>;
  getById: (id: string) => Promise<BrowserFingerprint>;
  create: (data: CreateBrowserFingerprintInput) => Promise<BrowserFingerprint>;
  update: (id: string, data: UpdateBrowserFingerprintInput) => Promise<BrowserFingerprint>;
  delete: (id: string) => Promise<{ success: boolean; id: string }>;
};
```