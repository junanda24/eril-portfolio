/**
 * ERIL SANJAYA — profile config
 * --------------------------------
 * This file is the ONLY place personal content lives.
 * Components must not render links, buttons, or sections whose data is empty.
 *
 * HOW TO EDIT:
 *  - Fill in the empty strings / arrays below with Eril's real info.
 *  - Leave anything unknown as "" or [] — the site hides it automatically.
 *  - Do NOT invent: no fake companies, dates, metrics, or testimonials.
 */

export interface SocialLink {
  label: string; // e.g. "GitHub"
  href: string; // full URL, e.g. "https://github.com/erilsanjaya"
}

export interface Project {
  title: string;
  tagline: string; // one line, factual
  description: string; // 2-3 sentences, factual only
  stack: string[]; // technologies actually used
  points: string[]; // capability bullets, no invented numbers
}

const profile = {
  name: "Eril Sanjaya",
  role: "IoT Engineer",
  specialty: "AI Inspection",
  tagline:
    "Building machines that see — IoT systems and AI inspection for the production floor.",
  location: "Batam, Indonesia",

  hero: {
    // Words after the name in the hero headline. Keep it short.
    headline: "Machines that see.",
    sub: "I'm an IoT engineer focused on AI inspection — sensors, edge devices, and computer vision wired into systems that keep production lines honest.",
  },

  about: {
    paragraphs: [
      "I'm Eril Sanjaya, an IoT engineer working where hardware meets machine intelligence. My focus is AI inspection: teaching cameras and sensors to catch what human eyes miss on the production floor.",
      "I graduated from Universitas Batam as its best graduate. I hold my systems to the same standard: measured, reliable, and built for real factory floors.",
    ],
  },

  expertise: [
    {
      title: "Computer Vision QC",
      body: "I put cameras on production lines and train models to flag faulty goods in real time.",
      accent: "cyan" as const,
    },
    {
      title: "Sensor Integration",
      body: "I wire the physical world into software: industrial sensors, microcontrollers, and data acquisition that survive the factory floor.",
      accent: "blue" as const,
    },
    {
      title: "Edge Deployment",
      body: "Running inference where the data is born — low-latency, offline-capable systems that don't wait on the cloud.",
      accent: "amber" as const,
    },
    {
      title: "Data Pipelines",
      body: "From raw signal to decision: streaming, storing, and visualizing inspection data so problems surface before they spread.",
      accent: "cyan" as const,
    },
  ],

  projects: [
    {
      title: "AI Production Inspection System",
      tagline: "Automated visual inspection for manufactured goods",
      description:
        "An AI-based inspection system for checking production goods at a large manufacturing company. Cameras watch products on the line, models flag defects as they pass, and results flow back into quality control — replacing manual checks that were slow and got inconsistent by end of shift.",
      stack: ["Computer Vision", "IoT Sensors", "Edge Computing"],
      points: [
        "Catches defects in real time, on a live line",
        "Cameras and sensors rigged for consistent capture",
        "Results stream straight into the QC workflow",
      ],
    },
  ] as Project[],

  education: {
    university: "Universitas Batam",
    degree: "Bachelor's degree",
    distinction: "Best Graduate",
    // year: "", // add graduation year when confirmed
    note: "Finished first — best graduate of the university.",
  },

  // Service offerings — what Eril can do for a client.
  // These describe services, not personal history. Safe to list.
  services: [
    {
      title: "IoT System Design",
      body: "End-to-end design of connected systems: the right sensors and boards, a sane data path, and a dashboard you can actually read. Shaped by what the site needs, not what's trendy.",
      accent: "cyan" as const,
    },
    {
      title: "AI Visual Inspection",
      body: "Cameras plus trained models that flag defects on the line as they happen. I handle capture, the training data, and the model running at the edge.",
      accent: "blue" as const,
    },
    {
      title: "Sensor Integration",
      body: "Getting industrial sensors, PLCs, and microcontrollers talking to each other and to your software. Modbus, MQTT — whatever the floor already speaks.",
      accent: "amber" as const,
    },
    {
      title: "Edge AI Deployment",
      body: "Inference where the data is born: low-latency boxes that keep working when the internet doesn't. The critical path never waits on the cloud.",
      accent: "cyan" as const,
    },
  ],

  // The toolbox — domain tools, not certification claims.
  stack: [
    "ESP32",
    "STM32",
    "Raspberry Pi",
    "Python",
    "C/C++",
    "OpenCV",
    "TensorFlow",
    "PyTorch",
    "YOLO",
    "MQTT",
    "Docker",
    "Linux",
    "Node-RED",
    "Grafana",
  ],

  // How engagements run — a process description, not history.
  process: [
    {
      step: "Discover",
      body: "We walk the floor — or the problem — together. What needs measuring, what counts as a defect, what 'good' looks like. Defined before any hardware is ordered.",
    },
    {
      step: "Design",
      body: "Architecture, parts list, and a prototype you can touch. The hard decisions happen here, so there are no surprises later.",
    },
    {
      step: "Deploy",
      body: "Installed, calibrated, and tested against real production conditions — not lab conditions.",
    },
    {
      step: "Maintain",
      body: "Monitoring, retraining, and someone to call when the line changes. Systems drift; I plan for it.",
    },
  ],

  // Generic professional FAQ — no personal claims.
  faq: [
    {
      q: "Are you open to freelance or consulting work?",
      a: "Yes — especially inspection and IoT projects where I can be hands-on with the hardware. Tell me about the line and I'll tell you honestly if I'm the right fit.",
    },
    {
      q: "Do you work with existing production lines?",
      a: "That's the usual case. I design around what's already there — retrofitting sensors and cameras without stopping the line is most of the job.",
    },
    {
      q: "How do you handle the AI part — do I need a data science team?",
      a: "No. I handle data collection, the labeling strategy, model training, and deployment myself. You get a working system, not a research project.",
    },
    {
      q: "Edge or cloud — which do you recommend?",
      a: "Edge for anything the line depends on minute to minute; cloud for history, dashboards, and retraining. I'll push back if a project doesn't need either.",
    },
    {
      q: "Can you help choose hardware?",
      a: "Yes. Boards, cameras, sensors, enclosures — I'll spec parts that survive factory conditions and don't blow the budget.",
    },
    {
      q: "Where are you based?",
      a: "Batam, Indonesia. On-site across the region for installation work, remote for design and software.",
    },
  ],

  contact: {
    // Fill these in. Empty = hidden automatically. No dead buttons, ever.
    email: "",
    socials: [] as SocialLink[],
    // Example:
    // email: "eril@example.com",
    // socials: [
    //   { label: "GitHub", href: "https://github.com/..." },
    //   { label: "LinkedIn", href: "https://linkedin.com/in/..." },
    // ],
  },
};

export default profile;
