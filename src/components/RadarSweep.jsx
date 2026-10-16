import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * RadarSweep — proximity radar HUD for the About section. (v2 rebuild)
 *
 * Modern military-radar aesthetic:
 * - Pulsing range rings, 72 degree ticks, cardinal labels (000/090/180/270)
 * - Conic-gradient sweep with fading trail + bright leading edge (GPU-composited div)
 * - Blips pop with expanding pulse rings + ID/distance labels EXACTLY when the
 *   sweep passes them (blip at angle θ fires at t = θ/360 × PERIOD) — genuinely
 *   synced, not faked. Contacts dim between revolutions like a real display.
 * - Sonar ping expanding from the hub each revolution, live AZ° readout.
 * One GSAP playhead, paused off-screen via IntersectionObserver.
 */

const PERIOD = 4;
const SIZE = 320;
const C = SIZE / 2;
const FACE_R = 140;
const MAX_RANGE_M = 120;

const BLIPS = [
  { id: "OBJ-01", angle: 35, r: 54, color: "#22d3ee" },
  { id: "OBJ-02", angle: 118, r: 98, color: "#5b8cff" },
  { id: "OBJ-03", angle: 197, r: 66, color: "#22d3ee" },
  { id: "OBJ-04", angle: 262, r: 110, color: "#f5a524" },
  { id: "OBJ-05", angle: 318, r: 46, color: "#22d3ee" },
];

const RINGS = [35, 70, 105, 140];
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const CARDINALS = [
  { deg: 0, label: "000" },
  { deg: 90, label: "090" },
  { deg: 180, label: "180" },
  { deg: 270, label: "270" },
];

const polar = (angleDeg, r) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
};

export default function RadarSweep() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const azEl = root.current.querySelector("[data-radar='az']");
      const tl = gsap.timeline({ repeat: -1, paused: true });

      // Sweep rotation — absolute 360° per loop so repeat is seamless.
      tl.to(
        "[data-radar='sweep']",
        {
          rotate: 360,
          duration: PERIOD,
          ease: "none",
          onUpdate() {
            const rot = gsap.getProperty(this.targets()[0], "rotation");
            const deg = Math.round((((rot % 360) + 360) % 360));
            if (azEl) azEl.textContent = `${String(deg).padStart(3, "0")}°`;
          },
        },
        0
      );

      // Sonar ping from the hub, once per revolution.
      tl.fromTo(
        "[data-radar='ping']",
        { scale: 0.25, autoAlpha: 0.65, transformOrigin: `${C}px ${C}px` },
        { scale: 3.6, autoAlpha: 0, duration: 1.6, ease: "power1.out" },
        0
      );

      // Refresh: dim all contacts at the top of each revolution (real-radar behavior).
      tl.to("[data-blip]", { autoAlpha: 0.3, duration: 0.6, ease: "power1.inOut" }, 0);
      tl.to("[data-radar-label]", { autoAlpha: 0, duration: 0.4 }, 0);

      // Blip detections, synced to the sweep angle.
      BLIPS.forEach((b, i) => {
        const at = (b.angle / 360) * PERIOD;
        const g = `[data-radar='blip-${i}']`;
        tl.fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "power1.out" }, at);
        tl.fromTo(
          `[data-radar='core-${i}']`,
          { scale: 0.2 },
          { scale: 1, duration: 0.45, ease: "back.out(2.4)" },
          at
        );
        tl.fromTo(
          `[data-radar='ring-${i}-a']`,
          { scale: 0.5, autoAlpha: 0.9 },
          { scale: 2.9, autoAlpha: 0, duration: 1.15, ease: "power1.out" },
          at
        );
        tl.fromTo(
          `[data-radar='ring-${i}-b']`,
          { scale: 0.5, autoAlpha: 0.9 },
          { scale: 2.9, autoAlpha: 0, duration: 1.15, ease: "power1.out" },
          at + 0.35
        );
        tl.fromTo(
          `[data-radar='label-${i}']`,
          { autoAlpha: 0, y: 5 },
          { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" },
          at + 0.12
        );
      });

      const io = new IntersectionObserver(
        ([e]) => (e.isIntersecting ? tl.play() : tl.pause()),
        { threshold: 0.25 }
      );
      io.observe(root.current);
      return () => io.disconnect();
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const insetPct = `${(((SIZE - FACE_R * 2) / 2 / SIZE) * 100).toFixed(2)}%`; // 6.25%

  return (
    <div ref={root} className="glass mt-10 overflow-hidden rounded-3xl" data-shine aria-hidden="true">
      {/* HUD header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {!reduced && <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-neon" />}
          <span className="font-mono text-[11px] tracking-[0.28em] text-neon">PROXIMITY SCAN</span>
        </div>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted">
          AZ <span data-radar="az" className="tabular-nums text-ink">{reduced ? "---" : "000°"}</span>
        </div>
      </div>

      {/* Radar face */}
      <div className="relative mx-auto my-3 w-[min(330px,82vw)]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block h-auto w-full">
          <defs>
            <radialGradient id="radar-face" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.07" />
            </radialGradient>
          </defs>

          {/* Face + range rings */}
          <circle cx={C} cy={C} r={FACE_R} fill="url(#radar-face)" />
          {RINGS.map((r) => (
            <circle
              key={r}
              cx={C}
              cy={C}
              r={r}
              fill="none"
              stroke="rgba(148,178,255,0.18)"
              strokeWidth="1"
              className={r === 70 && !reduced ? "radar-ring-pulse" : undefined}
            />
          ))}

          {/* Degree ticks */}
          {TICKS.map((deg) => {
            const major = deg % 30 === 0;
            const p1 = polar(deg, major ? 132 : 139);
            const p2 = polar(deg, 145);
            return (
              <line
                key={deg}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={major ? "rgba(34,211,238,0.55)" : "rgba(148,178,255,0.22)"}
                strokeWidth={major ? 1.4 : 1}
              />
            );
          })}

          {/* Cardinal labels */}
          {CARDINALS.map(({ deg, label }) => {
            const p = polar(deg, 118);
            return (
              <text
                key={label}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dy="3"
                fontSize="9"
                fill="rgba(139,152,173,0.75)"
                className="font-mono"
                letterSpacing="0.1em"
              >
                {label}
              </text>
            );
          })}

          {/* Crosshair */}
          <line x1={C - FACE_R} y1={C} x2={C + FACE_R} y2={C} stroke="rgba(148,178,255,0.10)" strokeWidth="1" />
          <line x1={C} y1={C - FACE_R} x2={C} y2={C + FACE_R} stroke="rgba(148,178,255,0.10)" strokeWidth="1" />
          <line x1={C - 99} y1={C - 99} x2={C + 99} y2={C + 99} stroke="rgba(148,178,255,0.06)" strokeWidth="1" />
          <line x1={C - 99} y1={C + 99} x2={C + 99} y2={C - 99} stroke="rgba(148,178,255,0.06)" strokeWidth="1" />

          {/* Blips */}
          {BLIPS.map((b, i) => {
            const p = polar(b.angle, b.r);
            const lp = polar(b.angle, Math.min(b.r + 24, FACE_R - 8));
            const dist = Math.round((b.r / FACE_R) * MAX_RANGE_M);
            const origin = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`;
            return (
              <g key={b.id} data-radar={`blip-${i}`} data-blip opacity={reduced ? 0.85 : 1}>
                <circle
                  data-radar={`ring-${i}-a`}
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  fill="none"
                  stroke={b.color}
                  strokeWidth="1.5"
                  style={{ transformOrigin: origin }}
                  opacity={0}
                />
                <circle
                  data-radar={`ring-${i}-b`}
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  fill="none"
                  stroke={b.color}
                  strokeWidth="1.5"
                  style={{ transformOrigin: origin }}
                  opacity={0}
                />
                <g data-radar={`core-${i}`} style={{ transformOrigin: origin }}>
                  <circle cx={p.x} cy={p.y} r="9" fill={b.color} opacity="0.16" />
                  <circle cx={p.x} cy={p.y} r="3.4" fill={b.color} />
                  <circle cx={p.x} cy={p.y} r="3.4" fill="#fff" opacity="0.55" />
                </g>
                <text
                  data-radar={`label-${i}`}
                  data-radar-label
                  x={lp.x}
                  y={lp.y}
                  textAnchor="middle"
                  dy="3"
                  fontSize="8.5"
                  fill={b.color}
                  className="font-mono"
                  letterSpacing="0.08em"
                  opacity={reduced ? 0.9 : 0}
                >
                  {b.id} · {dist}M
                </text>
              </g>
            );
          })}

          {/* Hub */}
          <circle
            data-radar="ping"
            cx={C}
            cy={C}
            r="18"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.5"
            opacity={0}
          />
          <circle cx={C} cy={C} r="7" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx={C} cy={C} r="2.6" fill="#22d3ee" />
        </svg>

        {/* Sweep: conic-gradient wedge with fading trail + bright leading edge (GPU-composited) */}
        {!reduced && (
          <div
            data-radar="sweep"
            className="pointer-events-none absolute rounded-full"
            style={{
              inset: insetPct,
              background:
                "conic-gradient(from 0deg, rgba(34,211,238,0.85) 0deg, rgba(34,211,238,0.30) -55deg, rgba(34,211,238,0) -100deg)",
            }}
          >
            <div className="absolute left-1/2 top-[1%] h-[49%] w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-neon via-neon/70 to-transparent" />
          </div>
        )}
      </div>

      {/* HUD footer */}
      <div className="flex items-center justify-between border-t border-line px-5 py-3.5 font-mono text-[10px] tracking-[0.2em] text-muted/70">
        <span>
          <span className="text-neon">{BLIPS.length}</span> CONTACTS TRACKED
        </span>
        <span>RNG {MAX_RANGE_M}M · 360°</span>
      </div>
    </div>
  );
}
