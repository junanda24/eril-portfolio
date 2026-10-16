import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profile from "../data/profile";
import SectionHead from "./SectionHead";
import { Spring, SPRING } from "./motion";

/**
 * FAQ — calm accordion. Framer-motion height animation (AnimatePresence),
 * one open at a time. Generic professional questions only.
 */
function Row({ item, open, onToggle }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="pressable flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-base font-semibold text-ink md:text-lg">
          {item.q}
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: open ? 45 : 0 }}
          transition={SPRING}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-neon"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...SPRING, stiffness: 120, damping: 26 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 leading-relaxed text-muted">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-28 border-t border-line px-6 py-28 md:py-40">
      <div className="mx-auto max-w-3xl">
        <SectionHead
          title="Questions, answered"
          lede="The ones I actually get asked."
          kicker="07 · FAQ"
        />
        <Spring className="space-y-3" y={20}>
          {profile.faq.map((item, i) => (
            <Row
              key={item.q}
              item={item}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </Spring>
      </div>
    </section>
  );
}
