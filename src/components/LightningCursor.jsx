import { useEffect, useRef } from "react";

/**
 * Lightning cursor trail — jagged electric bolts follow the mouse.
 * Canvas-based, site-wide, pointer-events none. Skips touch devices
 * and users who prefer reduced motion.
 */
export default function LightningCursor() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const trail = [];
    const sparks = [];
    let raf = 0;

    const onMove = (e) => {
      trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (trail.length > 16) trail.shift();
      // electric spark burst at the cursor head
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1 + Math.random() * 3;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const bolt = (ax, ay, bx, by, jag, color, width) => {
      const mx = (ax + bx) / 2 + (Math.random() - 0.5) * jag;
      const my = (ay + by) / 2 + (Math.random() - 0.5) * jag;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(mx, my);
      ctx.lineTo(bx, by);
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      ctx.lineCap = "round";

      // fading lightning bolts along the recent path
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const age = now - b.t;
        if (age > 160) continue;
        const fade = 1 - age / 160;
        bolt(a.x, a.y, b.x, b.y, 16, `rgba(56,189,248,${0.28 * fade})`, 5);
        bolt(a.x, a.y, b.x, b.y, 10, `rgba(224,242,254,${0.85 * fade})`, 1.6);
      }
      while (trail.length && now - trail[0].t > 220) trail.shift();

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.life -= 0.06;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(125,211,252,${s.life * 0.9})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6 * s.life + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true" />;
}
