import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * InspectionCam — a "CAM-02 · LIVE" camera feed card for the Project section.
 * A stylized inspected part sits in a viewfinder; on scroll into view the
 * defect bounding box draws itself on (stroke draw-on via pathLength=1)
 * and the "DEFECT 98.2%" label pops in with a connector. A scanline sweeps
 * while visible. No invented metrics beyond the illustrative label.
 */
export default function InspectionCam() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });
      tl.fromTo("[data-cam='box']", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9 }, 0)
        .fromTo("[data-cam='tag']", { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.6 }, 0.55)
        .fromTo("[data-cam='tick']", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.7)
        .fromTo("[data-cam='sweep']", { y: -70 }, { y: 70, duration: 1.6, ease: "power1.inOut", repeat: 1, yoyo: false }, 0.2);
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { tl.play(0); } },
        { threshold: 0.35 }
      );
      io.observe(root.current);
      return () => io.disconnect();
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="glass overflow-hidden rounded-3xl" data-shine>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-muted">
          <span className={`h-2 w-2 rounded-full bg-red-400 ${reduced ? "" : "animate-pulse-node"}`} />
          CAM-02 · LIVE
        </span>
        <span className="font-mono text-[11px] tracking-[0.22em] text-muted/70">1080p · 60FPS</span>
      </div>
      <div className="relative">
        <svg viewBox="0 0 400 220" className="block h-auto w-full" role="img" aria-label="Camera feed showing a defect bounding box labeled 98.2 percent">
          {/* The inspected part */}
          <rect x="120" y="55" width="160" height="110" rx="10" fill="#0d1424" stroke="rgba(148,178,255,0.25)" strokeWidth="1.5" />
          <circle cx="200" cy="110" r="26" fill="none" stroke="rgba(148,178,255,0.25)" strokeWidth="1.5" />
          <line x1="120" y1="110" x2="280" y2="110" stroke="rgba(148,178,255,0.15)" strokeWidth="1" />
          {/* Scan sweep */}
          {!reduced && (
            <rect data-cam="sweep" x="100" y="40" width="200" height="3" fill="#22d3ee" opacity="0.5" />
          )}
          {/* Defect bounding box — draws on via pathLength trick */}
          <rect
            data-cam="box"
            x="222" y="88" width="52" height="40" fill="none"
            stroke="#f5a524" strokeWidth="2" strokeDasharray="0.08 0.04"
            pathLength="1"
            style={reduced ? undefined : { strokeDashoffset: 1 }}
          />
          {/* Defect tick */}
          <g data-cam="tick" style={{ transformOrigin: "248px 108px" }} opacity={reduced ? 1 : 0}>
            <circle cx="248" cy="108" r="5" fill="#f5a524" />
            <circle cx="248" cy="108" r="9" fill="none" stroke="#f5a524" strokeWidth="1.5" opacity="0.6" />
          </g>
          {/* Label */}
          <g data-cam="tag" opacity={reduced ? 1 : 0}>
            <line x1="274" y1="96" x2="310" y2="60" stroke="#f5a524" strokeWidth="1" opacity="0.7" />
            <rect x="310" y="42" width="82" height="26" rx="6" fill="#0a0f1c" stroke="#f5a524" strokeWidth="1.2" />
            <text x="351" y="59" textAnchor="middle" fill="#f5a524" fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1">
              98.2%
            </text>
          </g>
          {/* Viewfinder corners */}
          {[
            "left-3 top-3 border-l-2 border-t-2",
            "right-3 top-3 border-r-2 border-t-2",
            "bottom-3 left-3 border-b-2 border-l-2",
            "bottom-3 right-3 border-b-2 border-r-2",
          ].map((c) => (
            <span key={c} aria-hidden="true" className={`vf-corner ${c} border-neon/60`} />
          ))}
        </svg>
        <p className="border-t border-line px-5 py-3 font-mono text-[10px] tracking-[0.24em] text-muted/70">
          DEFECT LOCKED · REGION 7
        </p>
      </div>
    </div>
  );
}
