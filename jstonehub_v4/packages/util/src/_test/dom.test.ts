import { focusFirstElement, getElementByIdOrThrow } from "../dom";

const EXISTING_ID = "test-element";
const NON_EXISTING_ID = "non-existing";

describe("[getElementByIdOrThrow]", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="${EXISTING_ID}"></div>`;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should return element when it exists", () => {
    const element = getElementByIdOrThrow(EXISTING_ID);

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.id).toBe(EXISTING_ID);
  });

  it("should throw when element does not exist", () => {
    expect(() => getElementByIdOrThrow(NON_EXISTING_ID)).toThrow(
      `DOM element with id "${NON_EXISTING_ID}" was not found`,
    );
  });
});

describe("[focusFirstElement]", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should focus first focusable element and return true", () => {
    document.body.innerHTML = `
      <div id="container">
        <span>Not focusable</span>
        <button>Click me</button>
        <input type="text" />
      </div>
    `;
    const container = document.getElementById("container");

    const result = focusFirstElement(container);

    expect(result).toBe(true);
    expect(document.activeElement?.tagName).toBe("BUTTON");
  });

  it("should return false when container has no focusable elements", () => {
    document.body.innerHTML = `
      <div id="container">
        <span>Not focusable</span>
        <p>Also not focusable</p>
      </div>
    `;
    const container = document.getElementById("container");

    const result = focusFirstElement(container);

    expect(result).toBe(false);
  });

  it("should return false when container is null", () => {
    const result = focusFirstElement(null);

    expect(result).toBe(false);
  });

  it("should return false when container is undefined", () => {
    const result = focusFirstElement(undefined);

    expect(result).toBe(false);
  });

  it("should skip disabled elements", () => {
    document.body.innerHTML = `
      <div id="container">
        <button disabled>Disabled</button>
        <input type="text" disabled />
        <select disabled></select>
        <a href="/link">Focusable link</a>
      </div>
    `;
    const container = document.getElementById("container");

    const result = focusFirstElement(container);

    expect(result).toBe(true);
    expect(document.activeElement?.tagName).toBe("A");
  });

  it("should skip elements with tabindex -1", () => {
    document.body.innerHTML = `
      <div id="container">
        <div tabindex="-1">Skip me</div>
        <input type="text" />
      </div>
    `;
    const container = document.getElementById("container");

    const result = focusFirstElement(container);

    expect(result).toBe(true);
    expect(document.activeElement?.tagName).toBe("INPUT");
  });
});
