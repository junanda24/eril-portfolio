import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import RobotArm from "./RobotArm";
import Drone3D from "./Drone3D";
import LaserLock from "./LaserLock";
import InspectionCam from "./InspectionCam";
import PassFailStamp from "./PassFailStamp";
import useShine from "../hooks/useShine";
import { useRef } from "react";
import profile from "../data/profile";
import { Stagger, Item } from "./motion";

const STAGES = [
  { id: "capture", label: "Capture", desc: "Cameras + sensors on the line", dot: "bg-neon" },
  { id: "infer", label: "Inspect", desc: "AI models flag defects live", dot: "bg-electric" },
  { id: "act", label: "Act", desc: "Results feed QC workflow", dot: "bg-amber" },
];

function Pipeline() {
  return (
    <div className="relative rounded-3xl border border-line bg-abyss/70 p-6 backdrop-blur md:p-10" aria-hidden="true">
      <div className="relative flex flex-col items-stretch gap-8 md:flex-row md:items-center md:gap-0">
        {STAGES.map((s, i) => (
          <div key={s.id} className="relative flex-1">
            {/* Connector line with traveling pulse */}
            {i > 0 && (
              <div className="absolute top-1/2 left-0 hidden h-px w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-neon/40 to-transparent md:block" style={{ width: "100%", left: "-50%" }}>
                <span className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-neon animate-pulse-node" style={{ animationDelay: `${i * 0.7}s` }} />
              </div>
            )}
            <div className="relative mx-auto flex max-w-[240px] flex-col items-center rounded-2xl border border-line bg-panel/80 px-6 py-7 text-center">
              <span className={`mb-4 h-3 w-3 animate-pulse-node rounded-full ${s.dot}`} style={{ animationDelay: `${i * 0.5}s` }} />
              <div className="font-display text-lg font-bold text-ink">{s.label}</div>
              <div className="mt-1.5 text-sm text-muted">{s.desc}</div>
              <div className="mt-3 font-mono text-[10px] tracking-[0.24em] text-muted/70">
                STAGE 0{i + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile vertical connectors */}
      <div className="mt-2 flex justify-center md:hidden">
        <div className="h-8 w-px bg-gradient-to-b from-neon/50 to-transparent" />
      </div>
    </div>
  );
}

export default function Project() {
  const project = profile.projects[0];
  const root = useRef(null);
  useShine(root);
  if (!project) return null;

  return (
    <section ref={root} id="project" className="relative scroll-mt-28 border-y border-line bg-abyss/30 px-6 py-28 md:py-40">
      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          title="Featured project"
          lede="One system, built for a real production floor."
          kicker="03 · FIELD WORK"
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* Sticky title rail */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="font-mono text-xs tracking-[0.24em] text-neon">AI INSPECTION</p>
              <h3 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl">
                {project.title}
              </h3>
              <p className="mt-3 text-lg text-muted">{project.tagline}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line bg-panel/70 px-4 py-1.5 font-mono text-xs tracking-wider text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
              {/* Signature: the inspection arm, pinned while details scroll past */}
              <div className="mt-10">
                <RobotArm />
              </div>
              <div className="mt-6">
                <Drone3D />
              </div>
            </Reveal>
          </div>

          {/* Scrolling detail column */}
          <div className="space-y-8">
            <Reveal>
              <p className="text-lg leading-relaxed text-muted">{project.description}</p>
            </Reveal>
            <Stagger className="space-y-4" gap={0.08}>
              {project.points.map((p) => (
                <Item key={p}>
                  <div
                    data-shine
                    className="glass shine flex items-start gap-4 rounded-2xl p-5"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 bg-neon" aria-hidden="true" />
                    <span className="leading-relaxed text-ink/90">{p}</span>
                  </div>
                </Item>
              ))}
            </Stagger>
            <Reveal delay={0.1}>
              <LaserLock />
            </Reveal>
            <Reveal delay={0.12}>
              <InspectionCam />
            </Reveal>
            <Reveal delay={0.14} className="relative">
              <PassFailStamp />
              <Pipeline />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
