import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * NeuralNet — ambient neural network background for the Expertise section.
 * Three layers of nodes, full bipartite edges, and signal pulses shuttling
 * along random edges on one GSAP playhead. Transform-only (x/y translates),
 * paused off-screen via IntersectionObserver, static when reduced motion.
 */
const LAYERS = [
  { x: 150, n: 4, color: "#22d3ee" },
  { x: 600, n: 4, color: "#5b8cff" },
  { x: 1050, n: 4, color: "#f5a524" },
];
const YS = [110, 230, 350, 470];
const PULSES = 9;

const EDGES = [];
for (let a = 0; a < LAYERS[0].n; a++) {
  for (let b = 0; b < LAYERS[1].n; b++) {
    EDGES.push({ x1: LAYERS[0].x, y1: YS[a], x2: LAYERS[1].x, y2: YS[b] });
    EDGES.push({ x1: LAYERS[1].x, y1: YS[a], x2: LAYERS[2].x, y2: YS[b] });
  }
}

export default function NeuralNet() {
  const root = useRef(null);
  const reduced = useReducedMotion();

  const nodes = LAYERS.flatMap((l) =>
    YS.slice(0, l.n).map((y, i) => ({ x: l.x, y, color: l.color, key: `${l.x}-${i}` }))
  );

  useEffect(() => {
    if (reduced || !root.current) return;
    const edges = EDGES;
    const dots = root.current.querySelectorAll("[data-pulse]");
    const tweens = [];
    dots.forEach((dot, i) => {
      const e = edges[(i * 7 + 3) % edges.length];
      const dur = 1.6 + ((i * 37) % 14) / 10;
      gsap.set(dot, { x: 0, y: 0, opacity: 0 });
      const tw = gsap.timeline({ repeat: -1, delay: (i * 0.53) % 2.4, paused: true })
        .set(dot, { attr: { cx: e.x1, cy: e.y1 } })
        .to(dot, { opacity: 0.95, duration: 0.25, ease: "power1.in" }, 0)
        .to(dot, { x: e.x2 - e.x1, y: e.y2 - e.y1, duration: dur, ease: "power1.inOut" }, 0)
        .to(dot, { opacity: 0, duration: 0.3, ease: "power1.out" }, dur - 0.3);
      tweens.push(tw);
    });
    const io = new IntersectionObserver(
      ([entry]) => tweens.forEach((t) => (entry.isIntersecting ? t.play() : t.pause())),
      { threshold: 0.05 }
    );
    io.observe(root.current);
    return () => { io.disconnect(); tweens.forEach((t) => t.kill()); };
  }, [reduced]);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {EDGES.map((e, i) => (
          <line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="rgba(148,178,255,0.10)"
            strokeWidth="1"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={n.key}>
            <circle cx={n.x} cy={n.y} r="9" fill="none" stroke={n.color} strokeOpacity="0.35" strokeWidth="1" />
            <circle
              cx={n.x} cy={n.y} r="3.5" fill={n.color} opacity="0.85"
              className={reduced ? undefined : "animate-pulse-node"}
              style={reduced ? undefined : { animationDelay: `${(i % 6) * 0.45}s` }}
            />
          </g>
        ))}
        {!reduced && Array.from({ length: PULSES }, (_, i) => (
          <circle key={`p${i}`} data-pulse r="4" fill="#22d3ee" opacity="0" />
        ))}
      </svg>
    </div>
  );
}
