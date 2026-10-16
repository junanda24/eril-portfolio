import { useEffect, useState } from "react";
import profile from "../data/profile";
import Globe3D from "./Globe3D";

/** Ticking local time for Batam (Asia/Jakarta) — factual, live. */
function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  if (!time) return null;
  return (
    <span className="font-mono text-xs tracking-wider text-muted/70">
      BATAM, ID · <span className="text-neon/90 tabular-nums">{time}</span> WIB
    </span>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { href: "#about", label: "About" },
    { href: "#expertise", label: "Expertise" },
    { href: "#project", label: "Project" },
    { href: "#services", label: "Services" },
    { href: "#faq", label: "FAQ" },
    { href: "#education", label: "Education" },
  ];
  const hasContact = Boolean(profile.contact.email) || profile.contact.socials.length > 0;
  if (hasContact) links.push({ href: "#contact", label: "Contact" });

  return (
    <footer className="relative overflow-hidden border-t border-line px-6 py-12">
      {/* Ambient network globe — decorative, auto-rotating */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/2 -translate-y-1/2 scale-[0.62] opacity-50 md:-right-12 md:scale-90"
      >
        <Globe3D />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute h-2.5 w-2.5 animate-pulse-node rounded-full bg-neon" />
          </span>
          <span className="font-display text-sm font-bold text-ink">{profile.name}</span>
          <span className="text-sm text-muted">· {profile.role}</span>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="pressable text-sm text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 md:items-end">
          <LocalTime />
          <p className="font-mono text-xs tracking-wider text-muted/70">© {year} · {profile.location}</p>
        </div>
      </div>
    </footer>
  );
}
