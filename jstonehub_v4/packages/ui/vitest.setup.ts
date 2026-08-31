import "@testing-library/jest-dom/vitest";

// biome-ignore lint/suspicious/noEmptyBlockStatements: FALSE_POSITIVE
window.scrollTo = (() => {}) as unknown as typeof window.scrollTo;
