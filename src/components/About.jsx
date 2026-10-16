import { useEffect, useRef } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";
import useShine from "../hooks/useShine";
import profile from "../data/profile";
import SectionHead from "./SectionHead";
import RadarSweep from "./RadarSweep";
import Terminal from "./Terminal";
import { Spring, Stagger, Item } from "./motion";

/**
 * About — scroll-scrubbed word reveal + graduation portrait in an
 * inspection-viewfinder frame. Calm: one entrance, gentle parallax.
 */
export default function About() {
  const root = useRef(null);
  const photo = useRef(null);
  const reduced = useReducedMotion();
  useShine(root);
  const words = profile.about.paragraphs.join(" ").split(" ");

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-about-word]", {
        opacity: 1,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: {
          trigger: root.current,
          start: "top 70%",
          end: "bottom 55%",
          scrub: 0.6,
        },
      });
      // Gentle parallax on the portrait while the section scrolls.
      gsap.to(photo.current, {
        yPercent: -7,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="about" className="scroll-mt-28 px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          title="Engineer of seeing machines"
          lede="Who I am, in short."
          kicker="01 · PROFILE"
        />

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Portrait — viewfinder frame */}
          <Spring className="lg:col-span-4" y={40}>
            <div
              ref={photo}
              className="relative -rotate-2 rounded-[1.75rem] border border-line bg-panel/60 p-3 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.35)]"
            >
              <div className="relative overflow-hidden rounded-[1.15rem]">
                <img
                  src="/eril.jpg"
                  alt="Monkey D. Luffy — Gear 5"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
                {/* Viewfinder corner brackets */}
                <span aria-hidden="true" className="vf-corner left-3 top-3 border-l-2 border-t-2 border-neon/90" />
                <span aria-hidden="true" className="vf-corner right-3 top-3 border-r-2 border-t-2 border-neon/90" />
                <span aria-hidden="true" className="vf-corner bottom-3 left-3 border-b-2 border-l-2 border-neon/90" />
                <span aria-hidden="true" className="vf-corner bottom-3 right-3 border-b-2 border-r-2 border-neon/90" />
              </div>
              <div className="flex items-center justify-between px-2 pb-1 pt-3 font-mono text-[10px] tracking-[0.24em]">
                <span className="text-muted">ERIL SANJAYA</span>
                <span className="text-amber">BEST GRADUATE</span>
              </div>
            </div>
          </Spring>

          {/* Bio copy */}
          <div className="lg:col-span-8">
            <p className="font-display text-2xl leading-[1.65] font-medium text-ink md:text-[2rem] md:leading-[1.6]">
              {words.map((w, i) => (
                <span
                  key={i}
                  data-about-word
                  className="mr-[0.32em] inline-block"
                  style={reduced ? undefined : { opacity: 0.14 }}
                >
                  {w}
                </span>
              ))}
            </p>

            <Stagger className="mt-12 flex flex-wrap gap-3" gap={0.08}>
              {[
                { k: "Focus", v: `IoT × ${profile.specialty}` },
                { k: "Base", v: profile.location },
                { k: "Distinction", v: `Best Graduate — ${profile.education.university}` },
              ].map((f) => (
                <Item key={f.k}>
                  <div
                    data-shine
                    className="glass shine rounded-2xl px-5 py-4"
                  >
                    <div className="font-mono text-[11px] tracking-[0.2em] text-muted">{f.k.toUpperCase()}</div>
                    <div className="mt-1 font-display text-sm font-semibold text-ink">{f.v}</div>
                  </div>
                </Item>
              ))}
            </Stagger>

            <Spring className="mt-12" y={24}>
              <Terminal />
            </Spring>

            <RadarSweep />
          </div>
        </div>
      </div>
    </section>
  );
}
