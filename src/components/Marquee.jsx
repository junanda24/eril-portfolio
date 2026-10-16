const TERMS = [
  "Computer Vision",
  "Edge AI",
  "Sensor Fusion",
  "Defect Detection",
  "Embedded Linux",
  "Real-time Inference",
  "MQTT",
  "Industrial IoT",
];

export default function Marquee({ items = TERMS, reverse = false, className = "" }) {
  const row = [...items, ...items];
  return (
    <div className={`relative overflow-hidden border-y border-line bg-abyss/40 py-5 ${className}`} aria-hidden="true">
      <div
        className="flex w-max animate-marquee gap-0"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 font-mono text-sm tracking-[0.24em] text-muted">{t.toUpperCase()}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-neon/60" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-void to-transparent" />
    </div>
  );
}
