import { createId as cuid2CreateId } from "@paralleldrive/cuid2";

function createId() {
  return cuid2CreateId();
}

export { createId };
