import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { refreshTriggers } from "./lib/anim";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Expertise from "./components/Expertise";
import Project from "./components/Project";
import MachineSection from "./components/MachineSection";
import Services from "./components/Services";
import StackStrip from "./components/StackStrip";
import Process from "./components/Process";
import Education from "./components/Education";
import Faq from "./components/Faq";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Cursor from "./components/Cursor";
import LightningCursor from "./components/LightningCursor";
import DroneFly from "./components/DroneFly";
import Preloader from "./components/Preloader";
import BackToTop from "./components/BackToTop";

export default function App() {
  const [booted, setBooted] = useState(false);

  // Recalculate scroll triggers once fonts/layout settle.
  useEffect(() => {
    if (booted) refreshTriggers();
  }, [booted]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="ambient grain min-h-screen font-body text-ink">
        <Preloader onDone={() => setBooted(true)} />
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-neon focus:px-5 focus:py-2.5 focus:font-bold focus:text-void"
        >
          Skip to content
        </a>
        <Nav />
        {/* overflow-x-hidden: off-canvas animation must never cause a scrollbar */}
        <main className="w-full max-w-full overflow-x-hidden">
          <Hero start={booted} />
          <Marquee />
          <About />
          <Expertise />
          <Project />
          <MachineSection />
          <Services />
          <StackStrip />
          <Process />
          <Education />
          <Faq />
          <Contact />
        </main>
        <Footer />
        <Cursor />
        <LightningCursor />
        <DroneFly />
        <BackToTop />
      </div>
    </MotionConfig>
  );
}
