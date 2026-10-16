import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Shared Framer-style motion primitives.
 * Buttery springs, staggered children, soft parallax — one consistent
 * "page-turn" language across every section.
 *
 * Reduced motion is handled globally via <MotionConfig reducedMotion="user">
 * in App.jsx: framer-motion then renders final states instantly.
 */

export const SPRING = { type: "spring", stiffness: 90, damping: 22, mass: 0.9 };
export const SPRING_SOFT = { type: "spring", stiffness: 60, damping: 20, mass: 1 };

/** Fade-up spring when the element enters the viewport. */
export function Spring({ children, y = 28, delay = 0, className, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered children container — pair with <Item>. */
export function Stagger({ children, className, gap = 0.1, delay = 0, y = 26 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Item({ children, className, y = 26 }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: SPRING },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Soft parallax wrapper — content drifts gently against scroll. */
export function Parallax({ children, amount = 50, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Section shell: consistent enter treatment so sections feel like pages. */
export function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-28 px-6 py-28 md:py-40 ${className}`}>
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={SPRING_SOFT}
      >
        {children}
      </motion.div>
    </section>
  );
}
