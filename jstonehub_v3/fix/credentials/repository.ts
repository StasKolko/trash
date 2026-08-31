// import { eq } from "drizzle-orm";
// import { browserFingerprintTable } from "#api/features/browser-fingerprint/table";
// import { db } from "#api/shared/db/instance";
// import { secretVoicerCredentialTable } from "./table";
// import type {
//   NewSecretVoicerCredential,
//   SecretVoicerCredential,
//   UpdateSecretVoicerCredential,
// } from "./types";

// export type SecretVoicerCredentialWithFingerprint = SecretVoicerCredential & {
//   fingerprint: {
//     id: string;
//     name: string;
//   };
// };

// export const secretVoicerCredentialRepository = {
//   async getAll(): Promise<SecretVoicerCredentialWithFingerprint[]> {
//     const results = await db
//       .select({
//         id: secretVoicerCredentialTable.id,
//         fingerprintId: secretVoicerCredentialTable.fingerprintId,
//         name: secretVoicerCredentialTable.name,
//         csrfToken: secretVoicerCredentialTable.csrfToken,
//         sessionId: secretVoicerCredentialTable.sessionId,
//         isActive: secretVoicerCredentialTable.isActive,
//         createdAt: secretVoicerCredentialTable.createdAt,
//         updatedAt: secretVoicerCredentialTable.updatedAt,
//         fingerprintName: browserFingerprintTable.name,
//       })
//       .from(secretVoicerCredentialTable)
//       .innerJoin(
//         browserFingerprintTable,
//         eq(
//           secretVoicerCredentialTable.fingerprintId,
//           browserFingerprintTable.id,
//         ),
//       );

//     return results.map((row) => ({
//       id: row.id,
//       fingerprintId: row.fingerprintId,
//       name: row.name,
//       csrfToken: row.csrfToken,
//       sessionId: row.sessionId,
//       isActive: row.isActive,
//       createdAt: row.createdAt,
//       updatedAt: row.updatedAt,
//       fingerprint: {
//         id: row.fingerprintId,
//         name: row.fingerprintName,
//       },
//     }));
//   },

//   async create(
//     data: NewSecretVoicerCredential,
//   ): Promise<SecretVoicerCredential> {
//     const [result] = await db
//       .insert(secretVoicerCredentialTable)
//       .values(data)
//       .returning();

//     if (!result) {
//       throw new Error("Failed to create credential");
//     }

//     return result;
//   },

//   async update(
//     id: string,
//     data: UpdateSecretVoicerCredential,
//   ): Promise<SecretVoicerCredential | null> {
//     const [result] = await db
//       .update(secretVoicerCredentialTable)
//       .set(data)
//       .where(eq(secretVoicerCredentialTable.id, id))
//       .returning();
//     return result ?? null;
//   },

//   async delete(id: string): Promise<boolean> {
//     const result = await db
//       .delete(secretVoicerCredentialTable)
//       .where(eq(secretVoicerCredentialTable.id, id))
//       .returning({ id: secretVoicerCredentialTable.id });
//     return result.length > 0;
//   },
// };

export const FIX_THIS_FILE_LATER = 123;
