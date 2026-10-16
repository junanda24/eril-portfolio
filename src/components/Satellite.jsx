import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Satellite — small orbiting satellite with radiating signal waves.
 * Lives in the Hero (top-right). Pure SVG + CSS: the orbit group spins,
 * the satellite counter-spins to stay upright, waves expand from the planet.
 * All transform/opacity; CSS layer only, so the global reduced-motion net
 * freezes it automatically.
 */
export default function Satellite() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-[5%] top-[14%] hidden h-28 w-28 md:block lg:right-[8%]">
      <svg viewBox="0 0 112 112" className="h-full w-full">
        {/* Circular orbit path */}
        <circle cx="56" cy="56" r="40" fill="none" stroke="rgba(148,178,255,0.25)" strokeWidth="1" strokeDasharray="4 5" />
        {/* Planet + signal waves */}
        <circle cx="56" cy="56" r="7" fill="#0d1424" stroke="#5b8cff" strokeWidth="1.5" />
        {!reduced && [0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="56" cy="56" r="7" fill="none" stroke="#5b8cff" strokeWidth="1"
            className="sat-wave"
            style={{ animationDelay: `${i * 1.4}s` }}
          />
        ))}
        {/* Satellite riding the circular orbit */}
        <g className={reduced ? undefined : "sat-orbit"}>
          <g transform="translate(56 16)">
            <g className={reduced ? undefined : "sat-upright"}>
              <rect x="-9" y="-4" width="18" height="8" rx="2" fill="#0d1424" stroke="#22d3ee" strokeWidth="1.2" />
              <rect x="-22" y="-6" width="11" height="12" rx="1.5" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
              <rect x="11" y="-6" width="11" height="12" rx="1.5" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
              <line x1="0" y1="-4" x2="0" y2="-12" stroke="#22d3ee" strokeWidth="1.2" />
              <circle cx="0" cy="-13" r="1.6" fill="#22d3ee" className={reduced ? undefined : "animate-pulse-node"} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
