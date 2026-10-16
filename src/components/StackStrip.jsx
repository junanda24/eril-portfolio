import profile from "../data/profile";
import { Spring } from "./motion";

/**
 * "Tools of the trade" — a slim, calm strip. One slow marquee of the
 * toolbox, no noise. Thematic, not a certification claim.
 */
export default function StackStrip() {
  const row = [...profile.stack, ...profile.stack];
  return (
    <section aria-label="Tools of the trade" className="border-t border-line bg-abyss/40 py-14">
      <Spring y={16}>
        <p className="mb-8 text-center font-mono text-xs tracking-[0.3em] text-muted">
          TOOLS OF THE TRADE
        </p>
      </Spring>
      <div className="relative overflow-hidden" aria-hidden="true">
        <div className="animate-marquee-slow flex w-max">
          {row.map((t, i) => (
            <span key={i} className="flex items-center">
              <span className="px-7 font-display text-lg font-semibold tracking-wide text-muted/80">
                {t}
              </span>
              <span className="h-1 w-1 rounded-full bg-neon/40" />
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-void to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-void to-transparent" />
      </div>
    </section>
  );
}
