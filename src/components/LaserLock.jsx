import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * LaserLock — crosshair lock-on accent for the Project section.
 * Brackets converge, the dashed ring spins down and stops, "LOCK" stamps in.
 * Plays once when scrolled into view. Transform/opacity only.
 */
export default function LaserLock() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.fromTo("[data-lock='ring']", { rotate: 120, autoAlpha: 0 }, { rotate: 0, autoAlpha: 1, duration: 1.1, ease: "power2.out" }, 0)
        .fromTo("[data-lock='br']", { scale: 1.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9 }, 0.15)
        .fromTo("[data-lock='dot']", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, 0.8)
        .fromTo("[data-lock='txt']", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.95);
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) tl.play(0); },
        { threshold: 0.5 }
      );
      io.observe(root.current);
      return () => io.disconnect();
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="flex items-center gap-5" aria-hidden="true">
      <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
        <g data-lock="ring" style={{ transformOrigin: "36px 36px" }} opacity={reduced ? 1 : 0}>
          <circle cx="36" cy="36" r="24" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="6 7" opacity="0.7" />
        </g>
        <g data-lock="br" style={{ transformOrigin: "36px 36px" }} opacity={reduced ? 1 : 0} stroke="#f5a524" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M14 26 V14 H26" />
          <path d="M46 14 H58 V26" />
          <path d="M58 46 V58 H46" />
          <path d="M26 58 H14 V46" />
        </g>
        <circle data-lock="dot" cx="36" cy="36" r="3.5" fill="#22d3ee" style={{ transformOrigin: "36px 36px" }} opacity={reduced ? 1 : 0} />
        <line x1="36" y1="4" x2="36" y2="12" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
        <line x1="36" y1="60" x2="36" y2="68" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
        <line x1="4" y1="36" x2="12" y2="36" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
        <line x1="60" y1="36" x2="68" y2="36" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
      </svg>
      <div data-lock="txt" style={reduced ? undefined : { opacity: 0 }}>
        <div className="font-mono text-[11px] tracking-[0.28em] text-neon">TARGET LOCK</div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted/70">TRACKING · STABLE</div>
      </div>
    </div>
  );
}
