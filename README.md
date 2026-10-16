# Eril Sanjaya — Portfolio

React + Vite + Tailwind CSS v4 portfolio for **Eril Sanjaya**, IoT Engineer specializing in AI Inspection.

## Run it

```bash
npm install
npm run dev      # dev server, default http://localhost:5173
npm run build    # production build → dist/
```

## Edit content — `src/data/profile.ts`

**All personal content lives in one file: `src/data/profile.ts`.** Nothing else needs touching for content updates.

| What | Where in the file |
|---|---|
| Name, role, tagline, location | top-level fields |
| Hero headline + sub | `hero` |
| About paragraphs | `about.paragraphs` |
| Expertise cards | `expertise[]` (title, body, accent) |
| Featured project | `projects[]` (title, tagline, description, stack, points) |
| University + distinction | `education` |
| Email + socials | `contact` |

**Rules the site enforces:**
- Leave unknown fields as `""` or `[]` — the component hides them automatically. No dead buttons, no `href="#"`, no lorem ipsum, ever.
- The **Contact section and its nav link only render** when `contact.email` or `contact.socials` is filled in.
- Do not invent companies, dates, metrics, or testimonials. If a fact isn't confirmed, it doesn't go in.

## Change language

The site is in **English**. To switch to Indonesian: translate the strings in `src/data/profile.ts` (hero, about, expertise, project, education note) plus the small hardcoded UI strings in `src/components/` (nav labels: About, Expertise, Project, Education, Contact; section headings passed to `SectionHead`; Contact CTA copy in `Contact.jsx`; footer labels).

## Design system

- **Theme:** dark futuristic — neon cyan `#22d3ee`, electric blue `#5b8cff`, amber `#f5a524` on near-black `#05070d`. Tokens in `src/index.css` (`@theme`).
- **Type:** Space Grotesk (display) + Inter (body) + JetBrains Mono (labels), via Google Fonts in `index.html`.
- **Motion:** GSAP + ScrollTrigger (`src/lib/anim.js`). One entrance timeline in Hero, scroll-scrubbed word reveal in About, batched card reveals in Expertise, parallax on hero. Floating sensor nodes + circuit canvas run on compositor-friendly transforms / rAF canvas. Everything gates behind `prefers-reduced-motion`.
- **Performance rules followed:** transform/opacity only, no layout animation, glow shadows animate via pseudo-element opacity, canvas pauses offscreen.

## Structure

```
src/
  data/profile.ts        ← edit content here
  lib/anim.js            ← GSAP registration + reduced-motion helper
  hooks/useReducedMotion.js
  components/
    Nav.jsx              ← floating glass pill, conditional Contact link
    Hero.jsx             ← cinematic center, entrance timeline, parallax
    CircuitCanvas.jsx    ← ambient data-stream canvas
    Marquee.jsx          ← domain term ticker
    About.jsx            ← scrub word-reveal + fact chips
    Expertise.jsx        ← gapless bento (grid-flow-dense)
    Project.jsx          ← sticky title rail + pipeline diagram
    Education.jsx        ← best-graduate distinction card
    Contact.jsx          ← renders only when contact data exists
    Footer.jsx
    Reveal.jsx           ← reusable scroll reveal
    SectionHead.jsx
```

## Skills applied

- `web-animation-skills/gsap-web` — timelines, ScrollTrigger, `gsap.context()` cleanup
- `web-animation-skills/60fps-animation` — transform/opacity only, pseudo-element shadows
- `web-animation-skills/micro-interaction` — 100–250ms press/hover feedback, asymmetric timing
- `taste-skill/gpt-tasteskill` — AIDA structure, 2-line hero rule, gapless bento, huge section rhythm, no meta-labels
- `designer-skills` — design-token discipline
- `anti-ai-slop` — copy kept specific, no invented facts, no AI-tell vocabulary
