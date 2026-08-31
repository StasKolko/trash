import type {
  BrowserFingerprintSort,
  BrowserFingerprintStatus,
} from "@packages/contract/browser-fingerprint";
import type { PaginationOrder } from "@packages/contract/pagination";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { browserFingerprintsTable } from "./browser-fingerprint.table";

export type BrowserFingerprint = InferSelectModel<
  typeof browserFingerprintsTable
>;
export type BrowserFingerprintInsert = InferInsertModel<
  typeof browserFingerprintsTable
>;

export type GetBrowserFingerprintsParams = {
  query: string;
  sort: BrowserFingerprintSort;
  order: PaginationOrder;
  status: "all" | BrowserFingerprintStatus[];
};
