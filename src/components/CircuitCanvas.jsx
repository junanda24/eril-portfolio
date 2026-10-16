import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/anim";

/**
 * Ambient circuit / data-stream canvas.
 * Draws faint traces with traveling pulses. Pure canvas — no DOM churn,
 * pauses when offscreen or tab-hidden, fully off under reduced motion.
 */
export default function CircuitCanvas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Horizontal traces with different speeds; pulses ride them.
    const traces = [];
    const TRACE_COUNT = 14;
    const pulses = [];

    function build() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      traces.length = 0;
      pulses.length = 0;
      for (let i = 0; i < TRACE_COUNT; i++) {
        const y = ((i + 0.5) / TRACE_COUNT) * h + (Math.random() - 0.5) * 24;
        traces.push({ y, speed: 0.25 + Math.random() * 0.5 });
      }
      const PULSE_COUNT = Math.floor(w / 220);
      for (let i = 0; i < PULSE_COUNT; i++) {
        pulses.push({
          trace: i % TRACE_COUNT,
          x: Math.random() * w,
          hue: Math.random() < 0.7 ? "34,211,238" : "245,165,36",
        });
      }
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // Traces
      ctx.lineWidth = 1;
      for (const t of traces) {
        ctx.strokeStyle = "rgba(120,160,255,0.10)";
        ctx.beginPath();
        ctx.moveTo(0, t.y);
        // slight jog mid-trace for a circuit feel
        const jogX = w * 0.5;
        ctx.lineTo(jogX - 60, t.y);
        ctx.lineTo(jogX - 30, t.y + 18);
        ctx.lineTo(jogX + 30, t.y + 18);
        ctx.lineTo(jogX + 60, t.y);
        ctx.lineTo(w, t.y);
        ctx.stroke();
      }

      // Pulses
      for (const p of pulses) {
        const t = traces[p.trace];
        p.x += t.speed;
        if (p.x > w + 20) p.x = -20;
        const g = ctx.createRadialGradient(p.x, t.y, 0, p.x, t.y, 26);
        g.addColorStop(0, `rgba(${p.hue},0.9)`);
        g.addColorStop(1, `rgba(${p.hue},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, t.y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${p.hue},1)`;
        ctx.beginPath();
        ctx.arc(p.x, t.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );

    const onVis = () => {
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        const r = canvas.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      }
    };

    build();
    raf = requestAnimationFrame(frame);
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", build);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
