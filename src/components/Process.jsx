import profile from "../data/profile";
import SectionHead from "./SectionHead";
import { Stagger, Item } from "./motion";

/**
 * "How I work" — four steps, calm horizontal rail on desktop.
 * A process description, not a history claim.
 */
export default function Process() {
  return (
    <section id="process" className="scroll-mt-28 px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          title="How I work"
          lede="Same four moves every time — the boring reliability is the point."
          kicker="05 · PROCESS"
        />

        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
          {profile.process.map((p, i) => (
            <Item key={p.step}>
              <div className="glass relative h-full rounded-3xl p-7">
                <span aria-hidden="true" className="font-display text-5xl font-bold text-line">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
                  {p.step}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{p.body}</p>
                {i < profile.process.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 top-1/2 hidden h-2 w-2 -translate-y-1/2 rotate-45 bg-neon/50 lg:block"
                  />
                )}
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
