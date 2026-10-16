import useShine from "../hooks/useShine";
import { useRef } from "react";
import profile from "../data/profile";
import SectionHead from "./SectionHead";
import { Stagger, Item } from "./motion";

const ACCENTS = {
  cyan: { text: "text-neon", ring: "group-hover:border-neon/40" },
  blue: { text: "text-electric", ring: "group-hover:border-electric/40" },
  amber: { text: "text-amber", ring: "group-hover:border-amber/40" },
};

const ICONS = [
  // network / system design
  <path key="s" d="M9 4h6M12 4v5m0 0-5 5m5-5 5 5M7 20h10M4 9l3 5m12-5-3 5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  // eye / inspection
  <path key="s" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeWidth="1.6" />,
  // plug / integration
  <path key="s" d="M9 7V3m6 4V3M7 7h10v4a5 5 0 0 1-10 0V7Zm5 9v5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  // chip / edge
  <rect key="s" x="7" y="7" width="10" height="10" rx="2" strokeWidth="1.6" />,
];

/**
 * "What I do" — service offerings (not history claims).
 * Clean 2x2 grid, staggered spring entrance, one calm hover per card.
 */
export default function Services() {
  const root = useRef(null);
  useShine(root);

  return (
    <section id="services" className="scroll-mt-28 border-t border-line px-6 py-28 md:py-40">
      <div ref={root} className="mx-auto max-w-6xl">
        <SectionHead
          title="What I do"
          lede="Four ways to work together — from a single inspection rig to a full connected system."
          kicker="04 · SERVICES"
        />

        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2" gap={0.12}>
          {profile.services.map((s, i) => {
            const a = ACCENTS[s.accent];
            return (
              <Item key={s.title}>
                <article
                  data-shine
                  className={`group shine glass relative h-full overflow-hidden rounded-3xl p-8 transition-colors duration-300 md:p-10 ${a.ring}`}
                >
                  <div className={`mb-6 inline-flex rounded-2xl border border-line bg-abyss/80 p-3.5 ${a.text}`}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      {ICONS[i]}
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
                  <span className={`mt-6 block font-mono text-[11px] tracking-[0.24em] ${a.text}`}>
                    0{i + 1}
                  </span>
                </article>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
