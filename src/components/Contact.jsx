import Reveal from "./Reveal";
import profile from "../data/profile";

/**
 * Renders NOTHING unless contact data exists in profile.ts.
 * No dead buttons, no placeholder links — ever.
 */
export default function Contact() {
  const { email, socials } = profile.contact;
  const hasAnything = Boolean(email) || socials.length > 0;
  if (!hasAnything) return null;

  return (
    <section id="contact" className="scroll-mt-28 border-t border-line px-6 py-32 md:py-48">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight text-ink md:text-6xl">
            Have a line that needs <span className="text-circuit">better eyes?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            I work on IoT and AI inspection systems. If that sounds like what you're building, let's talk.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {email && (
            <a
              href={`mailto:${email}`}
              className="pressable rounded-full bg-neon px-8 py-3.5 font-display text-sm font-bold tracking-wide text-void"
            >
              {email}
            </a>
          )}
          {socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="pressable rounded-full border border-line bg-panel/50 px-8 py-3.5 font-display text-sm font-bold tracking-wide text-ink backdrop-blur transition-colors hover:border-neon/50"
            >
              {s.label}
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
