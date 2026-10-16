import { motion } from "framer-motion";
import { SPRING } from "./motion";

/**
 * Scroll-triggered entrance — now Framer-style spring.
 * Same props API as before (children, y, delay, duration, className, as),
 * so every existing usage upgrades to the buttery spring automatically.
 * Reduced motion handled globally by MotionConfig reducedMotion="user".
 */
export default function Reveal({
  children,
  y = 32,
  delay = 0,
  className = "",
  as: Tag = "div",
}) {
  const MotionTag = motion[Tag] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </MotionTag>
  );
}
