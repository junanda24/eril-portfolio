import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import useShine from "../hooks/useShine";
import profile from "../data/profile";

/**
 * Education as a scroll-drawn timeline — the rail draws itself via
 * framer-motion useScroll (spring-smoothed). Only confirmed facts.
 */
export default function Education() {
  const ed = profile.education;
  const root = useRef(null);
  useShine(root);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start 0.75", "end 0.6"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    <section ref={root} id="education" className="scroll-mt-28 px-6 py-28 md:py-40">
      <div className="mx-auto max-w-5xl">
        <SectionHead
          title="Education"
          lede="Where it all started."
          kicker="06 · BACKGROUND"
        />

        <div className="relative mx-auto max-w-3xl">
          {/* Timeline rail */}
          <div
            aria-hidden="true"
            className="absolute bottom-4 left-[9px] top-2 w-px bg-line md:left-[11px]"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY }}
            className="absolute bottom-4 left-[9px] top-2 w-px origin-top bg-gradient-to-b from-neon via-electric to-amber md:left-[11px]"
          />

          <div className="space-y-10">
            {/* Node 1 — degree */}
            <Reveal>
              <div className="relative pl-12 md:pl-14">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1.5 grid h-5 w-5 place-items-center rounded-full border border-neon/50 bg-void md:h-6 md:w-6"
                >
                  <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-neon" />
                </span>
                <p className="font-mono text-xs tracking-[0.24em] text-muted">UNIVERSITY</p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
                  {ed.university}
                </h3>
                <p className="mt-1 text-lg text-muted">{ed.degree}</p>
                <p className="mt-3 max-w-xl leading-relaxed text-muted">{ed.note}</p>
              </div>
            </Reveal>

            {/* Node 2 — distinction */}
            <Reveal delay={0.1}>
              <div className="relative pl-12 md:pl-14">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1.5 grid h-5 w-5 place-items-center rounded-full border border-amber/50 bg-void md:h-6 md:w-6"
                >
                  <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-amber" />
                </span>
                <div
                  data-shine
                  className="glass shine relative inline-flex items-center gap-4 overflow-hidden rounded-2xl px-6 py-5"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f5a524"
                    strokeWidth="1.7"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="9" r="5.5" />
                    <path d="M8.5 13.5 7 21l5-2.4L17 21l-1.5-7.5" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <div className="font-display text-xl font-bold text-amber">{ed.distinction}</div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
                      HIGHEST DISTINCTION
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
