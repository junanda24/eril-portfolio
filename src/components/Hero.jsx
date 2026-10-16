import { motion } from "framer-motion";
import { useRef } from "react";
import useReducedMotion from "../hooks/useReducedMotion";
import profile from "../data/profile";
import CircuitCanvas from "./CircuitCanvas";
import HeroScene3D from "./HeroScene3D";
import Magnetic from "./Magnetic";
import Satellite from "./Satellite";
import Typewriter from "./Typewriter";
import { SPRING } from "./motion";

/**
 * Hero — calm and cinematic. One canvas, one satellite, one message.
 * Entrance runs on framer-motion (gated on preloader `start`), parallax
 * stays on GSAP-free motion via plain scroll listener for zero conflicts.
 */
export default function Hero({ start = true }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const play = start || reduced;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: SPRING },
  };

  return (
    <section ref={root} id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Backdrop — dimmed so type leads */}
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <HeroScene3D />
        <CircuitCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-void)_90%)]" />
      </div>
      <Satellite />

      <motion.div
        variants={container}
        initial="hidden"
        animate={play ? "show" : "hidden"}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20 text-center"
      >
        <motion.p
          variants={rise}
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/60 px-4 py-2 font-mono text-xs tracking-[0.22em] text-muted backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-neon" />
          {profile.role.toUpperCase()} · {profile.specialty.toUpperCase()}
        </motion.p>

        <h1 className="font-display font-bold tracking-tight text-ink">
          <motion.span variants={rise} className="block text-[clamp(2.8rem,7.5vw,6rem)] leading-[1.02]">
            Eril Sanjaya
          </motion.span>
          <motion.span
            variants={rise}
            className="text-circuit block min-h-[1.15em] text-[clamp(2.8rem,7.5vw,6rem)] leading-[1.02]"
          >
            <Typewriter text={profile.hero.headline} startDelay={play ? 1.1 : 0} />
          </motion.span>
        </h1>

        <motion.p
          variants={rise}
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          {profile.hero.sub}
        </motion.p>

        <motion.div variants={rise} className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <a
              href="#project"
              className="pressable rounded-full bg-neon px-8 py-3.5 font-display text-sm font-bold tracking-wide text-void"
            >
              See the inspection system
            </a>
          </Magnetic>
          <Magnetic strength={0.28}>
            <a
              href="#services"
              className="pressable rounded-full border border-line bg-panel/50 px-8 py-3.5 font-display text-sm font-bold tracking-wide text-ink backdrop-blur transition-colors hover:border-neon/50"
            >
              What I do
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to about"
        className="pressable absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted transition-colors hover:text-neon"
      >
        <svg width="22" height="34" viewBox="0 0 22 34" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="20" height="32" rx="10" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="3" fill="#22d3ee">
            <animate attributeName="cy" values="11;21;11" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </a>
    </section>
  );
}
