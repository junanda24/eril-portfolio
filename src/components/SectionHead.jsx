import { Spring } from "./motion";

/**
 * Section heading — calm and confident. Mono kicker, tight display title,
 * one supporting line. No scramble, no noise: hierarchy does the talking.
 */
export default function SectionHead({ title, lede, kicker }) {
  return (
    <Spring className="mb-14 max-w-3xl md:mb-20">
      {kicker && (
        <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-neon">
          <span aria-hidden="true" className="h-px w-8 bg-neon/60" />
          {kicker}
        </p>
      )}
      <h2 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p>
      )}
    </Spring>
  );
}
