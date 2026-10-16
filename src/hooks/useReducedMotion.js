import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../lib/anim";

/** Reactive prefers-reduced-motion flag. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
