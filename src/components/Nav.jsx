import { useEffect, useRef, useState } from "react";
import MusicToggle from "./MusicToggle";
import profile from "../data/profile";

function hasContact() {
  return Boolean(profile.contact.email) || profile.contact.socials.length > 0;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      setScrolled(h.scrollTop > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const links = [
    { href: "#about", label: "About" },
    { href: "#expertise", label: "Expertise" },
    { href: "#project", label: "Project" },
    { href: "#machine", label: "3D" },
    { href: "#services", label: "Services" },
    { href: "#faq", label: "FAQ" },
    { href: "#education", label: "Education" },
  ];
  if (hasContact()) links.push({ href: "#contact", label: "Contact" });

  return (
    <>
      {/* Scroll progress — transform-only scaleX, rAF-throttled */}
      <div className="fixed inset-x-0 top-0 z-[70] h-[2px]" aria-hidden="true">
        <div
          ref={bar}
          className="h-full w-full origin-left bg-gradient-to-r from-neon via-electric to-amber"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className={`flex items-center gap-1 rounded-full border border-line bg-abyss/70 px-3 py-2 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? "shadow-[0_12px_40px_-12px_rgba(34,211,238,0.25)]" : ""
        }`}
      >
        <a
          href="#top"
          className="pressable mr-1 flex items-center gap-2 rounded-full px-3 py-1.5"
          aria-label="Back to top"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-node rounded-full bg-neon" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon" />
          </span>
          <span className="font-display text-sm font-bold tracking-wide text-ink">
            ES
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="pressable rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <MusicToggle />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="pressable rounded-full p-2 text-ink md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown — grid-rows trick, no height animation jank */}
      <div
        className={`absolute top-full mt-2 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line bg-abyss/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transform: open ? "translateY(0)" : "translateY(-8px)" }}
      >
        <div className="flex flex-col p-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-left text-sm font-medium text-muted transition-colors hover:bg-panel hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      </header>
    </>
  );
}
