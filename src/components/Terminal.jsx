import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../hooks/useReducedMotion";

const SCRIPT = [
  { cmd: "$ qc-inspect --src CAM-02 --mode live" },
  { out: "▸ handshake ............ OK" },
  { out: "▸ frame 0101 ........... OK" },
  { out: "▸ frame 0102 ........... OK" },
  { out: "▸ frame 0103 ... re-checking" },
  { out: "▸ frame 0103 ........... OK" },
  { out: "▸ stream stable — watching" },
];

/**
 * Terminal — simulated inspection feed terminal.
 * Clearly labeled as a simulated feed; types the script once on enter.
 */
export default function Terminal() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [lines, setLines] = useState(() => (reduced ? SCRIPT.length : 0));
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (reduced || !ref.current) return;
    let li = 0;
    let ci = 0;
    let iv;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          iv = setInterval(() => {
            const cur = SCRIPT[li];
            const full = cur.cmd ?? cur.out;
            ci += 1;
            setChars(ci);
            if (ci >= full.length) {
              li += 1;
              ci = 0;
              setLines(li);
              setChars(0);
              if (li >= SCRIPT.length && iv) clearInterval(iv);
            }
          }, 26);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      if (iv) clearInterval(iv);
    };
  }, [reduced]);

  const done = SCRIPT.slice(0, lines);
  const current = SCRIPT[lines];
  const partial = current ? (current.cmd ?? current.out).slice(0, chars) : "";

  return (
    <div ref={ref} className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-3 font-mono text-[11px] tracking-[0.2em] text-muted">
          QC-FEED — SIMULATED
        </span>
      </div>
      <div className="min-h-[11.5rem] space-y-1.5 p-4 font-mono text-[13px] leading-relaxed" aria-label="Simulated inspection log">
        {done.map((l, i) => (
          <p key={i} className={l.cmd ? "text-ink" : "text-neon/90"}>
            {l.cmd ?? l.out}
          </p>
        ))}
        {current && (
          <p className={current.cmd ? "text-ink" : "text-neon/90"}>
            {partial}
            <span aria-hidden="true" className="tw-caret">
              ▍
            </span>
          </p>
        )}
        {!current && !reduced && (
          <p>
            <span aria-hidden="true" className="tw-caret">
              ▍
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
