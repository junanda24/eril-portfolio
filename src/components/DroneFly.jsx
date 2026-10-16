import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * DroneFly — a small inspection drone that flies horizontally across the
 * viewport, driven by page scroll (ScrollTrigger scrub). Fixed position,
 * transform-only, pointer-events none. Propellers spin via CSS.
 * Not rendered at all when reduced motion is on.
 */
export default function DroneFly() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.current,
        { x: "-18vw" },
        {
          x: "112vw",
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [reduced ]);

  if (reduced) return null;

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed left-0 top-[16%] z-30 opacity-80">
      <div className="animate-float-mid">
        <svg width="76" height="40" viewBox="0 0 76 40">
          {/* Arms */}
          <line x1="14" y1="12" x2="38" y2="22" stroke="rgba(148,178,255,0.5)" strokeWidth="2" />
          <line x1="62" y1="12" x2="38" y2="22" stroke="rgba(148,178,255,0.5)" strokeWidth="2" />
          {/* Propellers */}
          <ellipse cx="14" cy="10" rx="11" ry="2.6" fill="rgba(34,211,238,0.35)" className="drone-prop" />
          <ellipse cx="62" cy="10" rx="11" ry="2.6" fill="rgba(34,211,238,0.35)" className="drone-prop" style={{ animationDelay: "0.12s" }} />
          <circle cx="14" cy="10" r="2" fill="#0d1424" stroke="#22d3ee" strokeWidth="1" />
          <circle cx="62" cy="10" r="2" fill="#0d1424" stroke="#22d3ee" strokeWidth="1" />
          {/* Body */}
          <rect x="28" y="16" width="20" height="12" rx="6" fill="#0a0f1c" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="38" cy="22" r="3" fill="none" stroke="#f5a524" strokeWidth="1.5" />
          <circle cx="38" cy="22" r="1.2" fill="#f5a524" className="animate-pulse-node" />
          {/* Landing skid */}
          <line x1="30" y1="28" x2="30" y2="34" stroke="rgba(148,178,255,0.4)" strokeWidth="1.5" />
          <line x1="46" y1="28" x2="46" y2="34" stroke="rgba(148,178,255,0.4)" strokeWidth="1.5" />
          <line x1="26" y1="34" x2="50" y2="34" stroke="rgba(148,178,255,0.4)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
