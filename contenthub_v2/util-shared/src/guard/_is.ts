import { emptyGuards } from "./_empty";
import { objectGuards } from "./_object";
import { primitiveGuards } from "./_primitive";

const is = {
  ...primitiveGuards,
  ...objectGuards,
  ...emptyGuards,
} as const;

export { is };
