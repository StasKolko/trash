## credential

> Credentials (csrf + session) for secret-voicer authorization, linked to browser fingerprint

### Internal API

```ts
import { secretVoicerCredentialTable } from "../credential/table";
import { secretVoicerCredentialControllerV1 } from "../credential/controller-v1";
import {
  getAllSecretVoicerCredentials,
  getSecretVoicerCredentialById,
  createSecretVoicerCredential,
  updateSecretVoicerCredential,
  deleteSecretVoicerCredential,
} from "../credential/repository";

type secretVoicerCredentialTable = PgTable<{
  id: text;                    // primaryKey, default: createId()
  fingerprintId: text;         // FK → browserFingerprintTable.id
  name: text;
  csrfToken: text;
  sessionId: text;
  isActive: boolean;           // default: true
  createdAt: timestamp;        // default: now()
  updatedAt: timestamp;        // default: now(), onUpdate
}>;

// Elysia controller, prefix: "/credentials"
//
// GET    /                → SecretVoicerCredential[]
// GET    /:id             → SecretVoicerCredential
// POST   /                → SecretVoicerCredential (201)
//          body: { name, fingerprintId, csrfToken, sessionId, isActive? }
// PUT    /:id             → SecretVoicerCredential
//          body: Partial<{ name, fingerprintId, csrfToken, sessionId, isActive }>
// DELETE /:id             → { success: boolean; id: string }

function getAllSecretVoicerCredentials(): Promise<SecretVoicerCredential[]>;
function getSecretVoicerCredentialById(id: string): Promise<SecretVoicerCredential | undefined>;
function createSecretVoicerCredential(data: NewSecretVoicerCredential): Promise<SecretVoicerCredential | undefined>;
function updateSecretVoicerCredential(id: string, data: UpdateSecretVoicerCredential): Promise<SecretVoicerCredential | undefined>;
function deleteSecretVoicerCredential(id: string): Promise<SecretVoicerCredential | undefined>;
```

### Public API

```ts
import {
  secretVoicerCredentialTable,
} from "#api/features/secret-voicer";
```

```ts
import type {
  SecretVoicerCredential,
  NewSecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "#api/features/secret-voicer/types";

type SecretVoicerCredential = {
  id: string;
  fingerprintId: string;
  name: string;
  csrfToken: string;
  sessionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NewSecretVoicerCredential = {
  id?: string;
  fingerprintId: string;
  name: string;
  csrfToken: string;
  sessionId: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateSecretVoicerCredential = Partial<
  Omit<NewSecretVoicerCredential, "id" | "createdAt" | "updatedAt">
>;
```