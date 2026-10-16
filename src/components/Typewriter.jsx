import { useEffect, useState } from "react";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Typewriter — types text char-by-char with a blinking block caret.
 * Renders the full text instantly under reduced motion.
 */
export default function Typewriter({ text, startDelay = 0, speed = 55, className = "" }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(() => (reduced ? text.length : 0));

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    let iv;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length && iv) clearInterval(iv);
      }, speed);
    }, startDelay * 1000);
    return () => {
      clearTimeout(t);
      if (iv) clearInterval(iv);
    };
  }, [text, startDelay, speed, reduced]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      <span aria-hidden="true" className="tw-caret">
        ▍
      </span>
    </span>
  );
}
