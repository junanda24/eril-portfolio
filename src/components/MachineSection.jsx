import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import MachineCell3D from "./MachineCell3D";

const CHIPS = ["GLOWING CORE", "MESH NETWORK", "ORBIT RINGS", "DRAG TO ORBIT"];

/**
 * MachineSection — the 3D inspection cell, introduced with anime.js:
 * kicker line draw, masked character-stagger title, staggered chips,
 * all triggered when the section scrolls into view.
 */
export default function MachineSection() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const title = el.querySelector(".m3d-title");
    const kicker = el.querySelector(".m3d-kicker-line");
    const lede = el.querySelector(".m3d-lede");
    const chips = el.querySelectorAll(".m3d-chip");

    // Split the title into masked characters for the rise-in effect.
    const chars = [];
    if (title) {
      const text = title.textContent;
      title.setAttribute("aria-label", text);
      title.innerHTML = "";
      [...text].forEach((ch) => {
        const mask = document.createElement("span");
        mask.className = "inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom";
        mask.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.className = "m3d-char inline-block will-change-transform";
        inner.textContent = ch === " " ? "\u00A0" : ch;
        mask.appendChild(inner);
        title.appendChild(mask);
        chars.push(inner);
      });
    }

    if (reduced) return; // content is already visible; no motion needed

    // Start hidden, reveal on scroll into view.
    animate(chars, { y: "110%", opacity: 0, duration: 0 });
    animate([kicker, lede, ...chips], { opacity: 0, duration: 0 });
    animate(kicker, { scaleX: 0, duration: 0 });

    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || done) return;
          done = true;
          animate(kicker, { scaleX: [0, 1], opacity: [0, 1], duration: 900, easing: "outExpo" });
          animate(chars, {
            y: ["110%", "0%"],
            opacity: [0, 1],
            rotateX: [55, 0],
            duration: 950,
            delay: stagger(26),
            easing: "outExpo",
          });
          animate(lede, { opacity: [0, 1], y: [14, 0], duration: 800, delay: 350, easing: "outExpo" });
          animate(chips, {
            opacity: [0, 1],
            y: [16, 0],
            duration: 700,
            delay: stagger(85, { start: 500 }),
            easing: "outExpo",
          });
          io.disconnect();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} id="machine" className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-36">
      <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-neon">
        <span aria-hidden="true" className="m3d-kicker-line block h-px w-8 origin-left bg-neon/60" />
        INTERACTIVE 3D MODEL
      </p>
      <h2 className="m3d-title font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
        IoT sensor node, live in 3D
      </h2>
      <p className="m3d-lede mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        A stylised 3D sketch of a connected sensor node — the eyes and ears of the
        inspection systems Eril builds. Drag to orbit it.
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5" aria-label="Model features">
        {CHIPS.map((c) => (
          <span
            key={c}
            className="m3d-chip rounded-full border border-line bg-panel/60 px-4 py-1.5 font-mono text-[11px] tracking-[0.18em] text-muted"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-10">
        <MachineCell3D />
      </div>
      <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-muted/60">
        CONCEPT VISUALISATION — NOT THE ACTUAL PRODUCTION SYSTEM
      </p>
    </section>
  );
}
