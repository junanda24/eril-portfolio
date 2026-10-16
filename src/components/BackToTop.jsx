import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../hooks/useReducedMotion";

const R = 20;
const CIRC = 2 * Math.PI * R;

/**
 * BackToTop — fixed button with an SVG scroll-progress ring.
 * Appears past 700px; ring fill via stroke-dashoffset updated on a
 * rAF-throttled scroll listener. Show/hide is transform+opacity only.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (ring.current) ring.current.style.strokeDashoffset = String(CIRC * (1 - p));
      setShow(window.scrollY > 700);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (reduced) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`pressable fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-line bg-abyss/80 backdrop-blur-md transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(148,178,255,0.15)" strokeWidth="2.5" />
        <circle
          ref={ring}
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
        />
      </svg>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="absolute text-neon"
        aria-hidden="true"
      >
        <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
