import type { JSX } from "solid-js";

import { createContext, createSignal, onCleanup } from "solid-js";

import { getStrictContext } from "../../_util/context";

const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
} as const;

const BreakpointContext = createContext<{
  isMobile: () => boolean;
  isTablet: () => boolean;
  isDesktop: () => boolean;
  isTabletOrLarger: () => boolean;
}>();

function useBreakpoint() {
  return getStrictContext(BreakpointContext, "useBreakpoint");
}

function BreakpointProvider(props: { children: JSX.Element }) {
  const sm = createBreakpointSignal(BREAKPOINTS.sm);
  const md = createBreakpointSignal(BREAKPOINTS.md);
  const lg = createBreakpointSignal(BREAKPOINTS.lg);

  const value = {
    isMobile: () => !sm(),
    isTablet: () => sm() && !lg(),
    isDesktop: () => lg(),
    isTabletOrLarger: () => md(),
  };

  return (
    <BreakpointContext.Provider value={value}>
      {props.children}
    </BreakpointContext.Provider>
  );
}

function createBreakpointSignal(query: string) {
  const mql = window.matchMedia(query);
  const [matches, setMatches] = createSignal(mql.matches);

  const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
  mql.addEventListener("change", handler);
  onCleanup(() => mql.removeEventListener("change", handler));

  return matches;
}

export { BREAKPOINTS, BreakpointProvider, useBreakpoint };
