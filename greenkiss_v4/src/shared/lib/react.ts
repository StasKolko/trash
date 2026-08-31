import { useEffect, useRef, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useRenderLogger(name: string) {
  const renderCountRef = useRef(0);
  const mountCountRef = useRef(0);

  renderCountRef.current += 1;

  useEffect(() => {
    mountCountRef.current += 1;

    console.log(
      `[${name}] mounted ${mountCountRef.current} time(s), rendered ${renderCountRef.current} time(s)`,
    );
  }, [name]);

  console.log(`[${name}] render #${renderCountRef.current}`);
}
