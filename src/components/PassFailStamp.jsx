import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * PassFailStamp — a "QC PASSED" inspection stamp that slams onto the
 * pipeline card when scrolled into view: scale slam + shockwave ring.
 * Transform/opacity only, plays once.
 */
export default function PassFailStamp() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        "[data-stamp='badge']",
        { scale: 2.6, autoAlpha: 0, rotate: -30 },
        { scale: 1, autoAlpha: 1, rotate: -12, duration: 0.32, ease: "power4.in" },
        0
      )
        .to("[data-stamp='badge']", { scale: 1.07, duration: 0.12, ease: "power2.out" }, 0.32)
        .to("[data-stamp='badge']", { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.45)" }, 0.44)
        .fromTo(
          "[data-stamp='wave']",
          { scale: 0.4, autoAlpha: 0.8 },
          { scale: 1.9, autoAlpha: 0, duration: 0.7, ease: "power2.out" },
          0.3
        );
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) tl.play(0); },
        { threshold: 0.6 }
      );
      io.observe(root.current);
      return () => io.disconnect();
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute -top-7 right-4 z-10 md:-right-6">
      <div className="relative">
        <div
          data-stamp="wave"
          className="absolute inset-0 rounded-2xl border-2 border-neon"
          style={reduced ? { display: "none" } : { opacity: 0 }}
        />
        <div
          data-stamp="badge"
          className="rounded-2xl border-[3px] border-neon bg-abyss/90 px-5 py-3 shadow-[0_0_36px_rgba(34,211,238,0.4)] backdrop-blur"
          style={reduced ? { transform: "rotate(-12deg)" } : { opacity: 0 }}
        >
          <div className="font-display text-lg font-black tracking-[0.18em] text-neon">QC PASSED</div>
          <div className="mt-0.5 text-center font-mono text-[9px] tracking-[0.3em] text-muted">0 DEFECTS</div>
        </div>
      </div>
    </div>
  );
}
