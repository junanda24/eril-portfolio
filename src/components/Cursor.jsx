import { useEffect } from "react";
import { gsap } from "../lib/anim";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Cursor — non-intrusive custom cursor (desktop fine-pointer only).
 * A dot that tracks instantly + a ring that trails behind; the ring
 * swells over interactive elements. Native cursor is hidden via CSS
 * only when this component is active. Transform-only, quickTo-driven.
 */
export default function Cursor() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = document.createElement("div");
    dot.id = "cursor-dot";
    const ring = document.createElement("div");
    ring.id = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3" });

    // Trail particles: tiny pool, spawned at most every 120ms, transform+opacity only.
    const pool = [];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "cursor-trail";
      document.body.appendChild(p);
      gsap.set(p, { xPercent: -50, yPercent: -50, x: -100, y: -100, scale: 0, opacity: 0 });
      pool.push(p);
    }
    let pi = 0;
    let lastSpawn = 0;
    const spawnTrail = (x, y) => {
      const now = performance.now();
      if (now - lastSpawn < 120) return;
      lastSpawn = now;
      const p = pool[pi++ % pool.length];
      gsap.killTweensOf(p);
      gsap.set(p, { x, y, scale: 1, opacity: 0.65 });
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.7, ease: "power2.out" });
    };

    const onMove = (e) => {
      dx(e.clientX); dy(e.clientY);
      rx(e.clientX); ry(e.clientY);
      spawnTrail(e.clientX, e.clientY);
    };
    const onOver = (e) => {
      ring.classList.toggle("cursor-active", !!e.target.closest("a, button, [data-cursor]"));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("has-custom-cursor");
      dot.remove();
      ring.remove();
      pool.forEach((p) => p.remove());
    };
  }, [reduced]);

  return null;
}
