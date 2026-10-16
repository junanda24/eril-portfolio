import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Single source of truth for "should we animate?" */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Refresh triggers after layout settles (fonts, images). */
export function refreshTriggers() {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  } else {
    ScrollTrigger.refresh();
  }
}
