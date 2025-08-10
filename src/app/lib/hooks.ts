import { useEffect, useRef, useState } from "react";

/** Mount flag so we avoid hydration mismatches */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}

/** Auto-refresh helper. Pauses when tab is hidden. */
export function useAutoRefresh(enabled: boolean, fn: () => void, ms: number) {
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; }, [fn]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState === "visible") fnRef.current();
    };

    const id = setInterval(tick, ms);
    const onVis = () => { if (document.visibilityState === "visible") fnRef.current(); };

    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled, ms]);
}
