import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * RobotArm — signature animated illustration.
 * An inspection robot arm on a production line: it swings between poses,
 * the gripper opens/closes, a camera scans each product box as the conveyor
 * feeds it through, and the QC readout flips SCANNING → PASS.
 *
 * GEOMETRY (viewBox 420x400, verified by construction):
 * - Shoulder pivot at (330,190); upper arm 118, forearm 96.
 * - A wrist counter-rotation joint keeps the tool (camera + beam + gripper)
 *   hanging vertically in every pose: wrist rotation = -(shoulder + elbow).
 * - Scan pose: shoulder 112°, elbow 87° → wrist at (195,268).
 *   Beam center x = 195 + 15 = 210 = box center (box parks at x=186, 48 wide).
 *   Beam bottom y = 268 + 60 = 328 lands inside the box (top 308).
 *   Gripper fingertips reach y = 308, exactly the box top.
 * - The loop is one GSAP playhead driving a plain joint-state object;
 *   one onUpdate paints every SVG attribute (deterministic, no
 *   transform-box ambiguity). Only opacity + SVG transforms animate.
 *
 * VISIBILITY FIX: the component lives inside a sticky rail, where
 * ScrollTrigger's scroll-math misfires (the stuck element's rect no longer
 * tracks scroll, so onLeave can pause the loop while it's still on screen).
 * Play/pause is therefore driven by IntersectionObserver, which observes
 * actual viewport intersection and is immune to sticky weirdness.
 * Entrance is owned by the parent <Reveal>; this component never hides
 * itself, so it can't get stuck invisible.
 *
 * Reduced motion: frozen mid-scan pose, PASS state, no loop.
 */
export default function RobotArm() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  const upperRef = useRef(null);
  const foreRef = useRef(null);
  const wristRef = useRef(null);
  const finLRef = useRef(null);
  const finRRef = useRef(null);
  const beamRef = useRef(null);
  const scanRef = useRef(null);
  const boxRef = useRef(null);
  const stARef = useRef(null);
  const stBRef = useRef(null);
  const dotARef = useRef(null);
  const dotBRef = useRef(null);

  useEffect(() => {
    const upper = upperRef.current;
    const fore = foreRef.current;
    const wrist = wristRef.current;
    const finL = finLRef.current;
    const finR = finRRef.current;
    const beam = beamRef.current;
    const scan = scanRef.current;
    const box = boxRef.current;
    const stA = stARef.current;
    const stB = stBRef.current;
    const dotA = dotARef.current;
    const dotB = dotBRef.current;
    if (!upper || !root.current) return;

    // Plain-object joint state; one onUpdate paints every SVG attribute.
    // wrist rotation is derived: -(shoulder + elbow) keeps the tool vertical.
    const j = { shoulder: 179, elbow: 145, grip: 1.5, boxX: 30, boxO: 0, beamO: 0, scanY: 0, stA: 1, stB: 0 };
    const apply = (t) => {
      upper.setAttribute("transform", `rotate(${j.shoulder.toFixed(2)})`);
      fore.setAttribute("transform", `rotate(${j.elbow.toFixed(2)})`);
      wrist.setAttribute(
        "transform",
        `translate(96 0) rotate(${(-j.shoulder - j.elbow).toFixed(2)})`
      );
      finL.setAttribute("transform", `translate(${(-j.grip).toFixed(2)} 0)`);
      finR.setAttribute("transform", `translate(${j.grip.toFixed(2)} 0)`);
      box.setAttribute("transform", `translate(${j.boxX.toFixed(1)} 0)`);
      box.setAttribute("opacity", j.boxO.toFixed(2));
      beam.setAttribute("opacity", j.beamO.toFixed(2));
      scan.setAttribute("y", j.scanY.toFixed(1));
      stA.setAttribute("opacity", j.stA.toFixed(2));
      stB.setAttribute("opacity", j.stB.toFixed(2));
      const blink = 0.55 + 0.45 * Math.sin(t * 7);
      dotA.setAttribute("opacity", (j.stA * blink).toFixed(2));
      dotB.setAttribute("opacity", j.stB.toFixed(2));
    };

    // Frozen, honest mid-scan pose for reduced motion.
    if (reduced) {
      Object.assign(j, {
        shoulder: 112, elbow: 87, grip: 4,
        boxX: 186, boxO: 1, beamO: 0.55, scanY: 30, stA: 0, stB: 1,
      });
      apply(0);
      return;
    }

    const tl = gsap.timeline({
      repeat: -1,
      paused: true,
      defaults: { ease: "sine.inOut" },
      onUpdate() { apply(this.time()); },
    });
    // Poses (verified IK): HOME (179,145) → SCAN (112,87) → LIFT (121,98) → HOME
    tl.set(j, { shoulder: 179, elbow: 145, grip: 1.5, boxX: 30, boxO: 0, beamO: 0, scanY: 0, stA: 1, stB: 0 }, 0);
    tl.to(j, { boxO: 1, duration: 0.5, ease: "power1.out" }, 0.1);            // box rolls in
    tl.to(j, { boxX: 186, duration: 2.2, ease: "power2.inOut" }, 0.6);        // …parks under the beam
    tl.to(j, { shoulder: 112, elbow: 87, duration: 1.7 }, 2.0);              // arm swings to scan pose
    tl.to(j, { beamO: 0.9, duration: 0.4, ease: "power1.out" }, 3.5);        // beam on
    tl.to(j, { scanY: 52, duration: 1.1, ease: "power1.inOut" }, 3.6);       // scanline sweep
    tl.to(j, { grip: 7, duration: 0.55, ease: "power2.out" }, 4.5);          // gripper opens
    tl.to(j, { grip: 1.5, duration: 0.55, ease: "power2.in" }, 5.15);        // …closes
    tl.to(j, { stA: 0, stB: 1, duration: 0.4, ease: "power1.out" }, 5.7);    // readout → PASS
    tl.to(j, { beamO: 0, duration: 0.6, ease: "power1.in" }, 5.8);           // beam off
    tl.to(j, { shoulder: 121, elbow: 98, duration: 1.2 }, 6.0);             // lift slightly
    tl.to(j, { shoulder: 179, elbow: 145, duration: 1.4 }, 6.8);           // …back home
    tl.to(j, { boxX: 365, duration: 1.7, ease: "power2.in" }, 6.8);          // box exits
    tl.to(j, { boxO: 0, duration: 0.4, ease: "power1.in" }, 8.1);            // …fades at loop seam
    tl.to({}, { duration: 0.3 });

    // IntersectionObserver: play only while actually visible.
    // (ScrollTrigger misfires inside the sticky rail — the stuck element's
    // rect stops tracking scroll, so onLeave could pause the loop on screen.)
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) tl.play();
        else tl.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(root.current);
    return () => { io.disconnect(); tl.kill(); };
  }, [reduced]);

  return (
    <div ref={root} className="relative">
      <div>
        <svg
          viewBox="0 0 420 400"
          className="h-auto w-full"
          role="img"
          aria-label="Animated robot arm performing optical quality inspection on a production line"
        >
          <defs>
            <linearGradient id="ra-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <pattern id="ra-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="rgba(148,178,255,0.10)" />
            </pattern>
            <pattern id="ra-hazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill="#f5a524" opacity="0.8" />
              <rect width="7" height="14" fill="#0a0f1c" />
            </pattern>
          </defs>

          {/* Backdrop grid */}
          <rect x="8" y="8" width="404" height="360" rx="18" fill="url(#ra-dots)" opacity="0.55" />

          {/* Readout */}
          <text x="26" y="42" fill="#8b98ad" fontSize="10" letterSpacing="2.5" fontFamily="ui-monospace, monospace">
            OPTICAL QC — LINE 01
          </text>
          <circle ref={dotARef} cx="16" cy="63" r="4" fill="#f5a524" opacity="1" />
          <circle ref={dotBRef} cx="16" cy="63" r="4" fill="#22d3ee" opacity="0" />
          <text ref={stARef} x="28" y="68" fill="#f5a524" fontSize="13" letterSpacing="3" fontFamily="ui-monospace, monospace" opacity="1">
            SCANNING
          </text>
          <text ref={stBRef} x="28" y="68" fill="#22d3ee" fontSize="13" letterSpacing="3" fontFamily="ui-monospace, monospace" opacity="0">
            PASS
          </text>

          {/* Static rig: pedestal, column, mount (right side) */}
          <rect x="278" y="326" width="104" height="42" rx="10" fill="#0d1424" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />
          <rect x="278" y="326" width="104" height="9" fill="url(#ra-hazard)" opacity="0.75" />
          <rect x="318" y="206" width="26" height="120" fill="#0a0f1c" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />
          <line x1="318" y1="240" x2="344" y2="240" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />
          <line x1="318" y1="272" x2="344" y2="272" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />
          <line x1="318" y1="304" x2="344" y2="304" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />
          <rect x="306" y="172" width="48" height="18" rx="6" fill="#0d1424" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />

          {/* Articulated arm — pivots at local (0,0) of each rotating group.
              The wrist counter-rotates (-(shoulder+elbow)) so the tool hangs vertical. */}
          <g transform="translate(330 190)">
            <g ref={upperRef} transform="rotate(179)">
              <circle r="18" fill="#0a0f1c" stroke="#22d3ee" strokeWidth="2" />
              <circle r="5.5" fill="#22d3ee" opacity="0.9" />
              <rect x="6" y="-13" width="112" height="26" rx="13" fill="#0d1424" stroke="#5b8cff" strokeWidth="2" />
              <line x1="18" y1="0" x2="106" y2="0" stroke="rgba(91,140,255,0.4)" strokeWidth="1.5" strokeDasharray="5 5" />
              <g transform="translate(118 0)">
                <g ref={foreRef} transform="rotate(145)">
                  <circle r="13" fill="#0a0f1c" stroke="#f5a524" strokeWidth="2" />
                  <circle r="4" fill="#f5a524" opacity="0.9" />
                  <rect x="4" y="-10" width="92" height="20" rx="10" fill="#0d1424" stroke="#22d3ee" strokeWidth="2" />
                  <g ref={wristRef} transform="translate(96 0) rotate(-324)">
                    <circle r="9" fill="#0a0f1c" stroke="#5b8cff" strokeWidth="2" />
                    {/* Camera head */}
                    <rect x="-4" y="-36" width="38" height="21" rx="6" fill="#0a0f1c" stroke="#5b8cff" strokeWidth="1.5" />
                    <circle cx="15" cy="-25.5" r="6" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                    <circle cx="15" cy="-25.5" r="2.4" fill="#22d3ee" />
                    {/* Scan beam (shortened: bottom y=60 so it lands on the box) */}
                    <g ref={beamRef} opacity="0">
                      <polygon points="-2,-12 32,-12 44,60 -14,60" fill="url(#ra-beam)" />
                      <rect ref={scanRef} x="-24" y="0" width="54" height="3" fill="#22d3ee" opacity="0.9" />
                    </g>
                    {/* Gripper */}
                    <rect x="-14" y="6" width="28" height="8" rx="3" fill="#0d1424" stroke="rgba(148,178,255,0.2)" strokeWidth="1.5" />
                    <g ref={finLRef} transform="translate(-1.5 0)">
                      <rect x="-11" y="14" width="7" height="26" rx="3.5" fill="#0d1424" stroke="#f5a524" strokeWidth="1.5" />
                    </g>
                    <g ref={finRRef} transform="translate(1.5 0)">
                      <rect x="4" y="14" width="7" height="26" rx="3.5" fill="#0d1424" stroke="#f5a524" strokeWidth="1.5" />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* Conveyor */}
          <rect x="16" y="344" width="388" height="12" rx="6" fill="#0a0f1c" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />
          {Array.from({ length: 11 }, (_, i) => (
            <circle key={i} cx={40 + i * 34} cy="350" r="3.2" fill="none" stroke="rgba(148,178,255,0.2)" strokeWidth="1.5" />
          ))}
          {/* Product box — parks at x=186 so its center (210) sits under the beam */}
          <g ref={boxRef} transform="translate(30 0)" opacity="0">
            <rect x="0" y="308" width="48" height="36" rx="5" fill="#0d1424" stroke="#f5a524" strokeWidth="2" />
            <rect x="9" y="317" width="15" height="8" rx="2" fill="#f5a524" opacity="0.3" />
            <rect x="28" y="317" width="11" height="8" rx="2" fill="#22d3ee" opacity="0.3" />
            <line x1="9" y1="332" x2="39" y2="332" stroke="rgba(148,178,255,0.25)" strokeWidth="1.5" />
          </g>

          {/* Floor */}
          <line x1="20" y1="372" x2="400" y2="372" stroke="rgba(148,178,255,0.14)" strokeWidth="1.5" />

          {/* Ambient data particles — translate-only CSS float */}
          <circle cx="140" cy="280" r="3" fill="#22d3ee" opacity="0.5" className="animate-float-slow" />
          <circle cx="292" cy="250" r="2.4" fill="#5b8cff" opacity="0.5" className="animate-float-mid" />
          <circle cx="320" cy="300" r="3" fill="#f5a524" opacity="0.4" className="animate-float-fast" />
        </svg>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] tracking-[0.28em] text-muted/70">
        OPTICAL QC — LIVE LOOP
      </p>
    </div>
  );
}
