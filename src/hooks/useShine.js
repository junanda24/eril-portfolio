import { useEffect } from "react";

/**
 * useShine — cursor-reactive glass shine.
 * On pointermove within the container, sets --mx/--my on the closest
 * [data-shine] descendant; the .shine::before radial highlight follows.
 * Cheap: style mutations only, no re-renders. Pointer-fine only.
 */
export default function useShine(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let last = null;
    const onMove = (e) => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!last) return;
        const t = last.target instanceof Element ? last.target.closest("[data-shine]") : null;
        if (!t || !el.contains(t)) return;
        const r = t.getBoundingClientRect();
        t.style.setProperty("--mx", `${(last.clientX - r.left).toFixed(1)}px`);
        t.style.setProperty("--my", `${(last.clientY - r.top).toFixed(1)}px`);
      });
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}
