import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Magnetic — micro-interaction wrapper (per micro-interaction skill).
 * Element drifts toward the cursor and springs back on leave.
 * Transform-only (quickTo), desktop fine-pointer only, reduced-motion safe.
 */
export default function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { xTo(0); yTo(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
