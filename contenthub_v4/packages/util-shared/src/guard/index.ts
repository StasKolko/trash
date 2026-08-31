import { emptyGuards } from "./_empty";
import { notPrimitiveGuards } from "./_not-primitive";
import { objectGuards } from "./_object";
import { primitiveGuards } from "./_primitive";

const is = {
  ...primitiveGuards,
  ...objectGuards,

  not: {
    ...notPrimitiveGuards,
  },

  empty: {
    ...emptyGuards,
  },
} as const;

export { is };
