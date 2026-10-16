import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

const BOOT_LINES = [
  "> ERIL.SYS v2.4 — boot sequence",
  "> mounting /dev/optics ......... OK",
  "> linking sensor mesh .......... OK",
  "> loading inspection models .... OK",
  "> calibrating servo arm ........ OK",
];

/**
 * Preloader — cinematic boot sequence overlay.
 * Mono log lines stagger in, progress bar fills, then the whole
 * panel lifts away. Skipped instantly under reduced motion.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const [gone, setGone] = useState(() => reduced);

  useEffect(() => {
    if (reduced) {
      onDone?.();
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setGone(true);
          onDone?.();
        },
      });
      tl.from("[data-boot='line']", { x: -14, autoAlpha: 0, duration: 0.32, stagger: 0.16, ease: "power2.out" })
        .fromTo("[data-boot='bar']", { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0.2)
        .from("[data-boot='ready']", { autoAlpha: 0, y: 8, duration: 0.3 }, "-=0.25")
        .to(root.current, { yPercent: -100, duration: 0.7, ease: "power4.inOut", delay: 0.25 });
    }, root);
    return () => ctx.revert();
  }, [reduced, onDone]);

  useEffect(() => {
    document.body.style.overflow = gone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
    >
      <div className="w-[min(90vw,26rem)] px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse-node rounded-full bg-neon" />
          <span className="font-mono text-xs tracking-[0.3em] text-muted">SYSTEM BOOT</span>
        </div>
        <div className="space-y-2.5 font-mono text-[13px] leading-relaxed text-muted">
          {BOOT_LINES.map((l) => (
            <p key={l} data-boot="line" className="whitespace-nowrap">
              {l}
            </p>
          ))}
        </div>
        <div className="mt-8 h-[3px] w-full overflow-hidden rounded-full bg-panel">
          <div data-boot="bar" className="h-full w-full origin-left bg-neon" />
        </div>
        <p data-boot="ready" className="mt-4 font-mono text-xs tracking-[0.3em] text-neon">
          SYSTEM READY
        </p>
      </div>
    </div>
  );
}
