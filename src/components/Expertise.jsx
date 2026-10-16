import { useRef } from "react";
import useShine from "../hooks/useShine";
import profile from "../data/profile";
import SectionHead from "./SectionHead";
import NeuralNet from "./NeuralNet";
import { Stagger, Item } from "./motion";

const ACCENTS = {
  cyan: { text: "text-neon", ring: "group-hover:border-neon/40" },
  blue: { text: "text-electric", ring: "group-hover:border-electric/40" },
  amber: { text: "text-amber", ring: "group-hover:border-amber/40" },
};

const ICONS = {
  "Computer Vision QC": (
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeWidth="1.6" />
  ),
  "Sensor Integration": (
    <path d="M4 14a8 8 0 0 1 16 0M7 14a5 5 0 0 1 10 0M12 14h.01M10 18h4" strokeWidth="1.6" strokeLinecap="round" />
  ),
  "Edge Deployment": (
    <rect x="7" y="7" width="10" height="10" rx="2" strokeWidth="1.6" />
  ),
  "Data Pipelines": (
    <path d="M4 6h6l2 4h8M4 18h6l2-4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const SPANS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];

/**
 * Capabilities — clean bento, one calm hover per card.
 * NeuralNet stays as a dimmed backdrop; GpuChip and 3D tilt removed
 * for the cleaner read.
 */
export default function Expertise() {
  const root = useRef(null);
  useShine(root);

  return (
    <section id="expertise" className="relative scroll-mt-28 overflow-hidden px-6 py-28 md:py-40">
      <div className="opacity-60" aria-hidden="true">
        <NeuralNet />
      </div>
      <div ref={root} className="relative mx-auto max-w-6xl">
        <SectionHead
          title="What I work on"
          lede="Four capabilities, one thread: making the physical line legible to software."
          kicker="02 · CAPABILITIES"
        />

        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-6 [grid-auto-flow:dense]" gap={0.1}>
          {profile.expertise.map((item, i) => {
            const a = ACCENTS[item.accent];
            return (
              <Item key={item.title} className={SPANS[i]}>
                <article
                  data-shine
                  className={`group shine glass relative h-full overflow-hidden rounded-3xl p-8 transition-colors duration-300 ${a.ring} ${i % 2 ? "glass-deep" : ""}`}
                >
                  <div className={`mb-6 inline-flex rounded-2xl border border-line bg-abyss/80 p-3.5 ${a.text}`}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      {ICONS[item.title]}
                      {item.title === "Computer Vision QC" && (
                        <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
                      )}
                      {item.title === "Edge Deployment" && (
                        <path d="M10 10.5h4v3h-4z M12 7V4M12 20v-3M7 12H4M20 12h-3" strokeLinecap="round" />
                      )}
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{item.body}</p>
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
