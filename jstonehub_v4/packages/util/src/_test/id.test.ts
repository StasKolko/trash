import { createId } from "../id";

const CUID2_LENGTH = 24;
const URL_FRIENDLY_PATTERN = /^[a-z0-9]+$/;

describe("[createId]", () => {
  it("should generate URL-friendly id of consistent length", () => {
    const id = createId();

    expect(id).toMatch(URL_FRIENDLY_PATTERN);
    expect(id.length).toBe(CUID2_LENGTH);
  });
});
