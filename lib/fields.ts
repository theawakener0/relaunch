import {
  Atom,
  Bot,
  BrainCircuit,
  Dna,
  Telescope,
  type LucideIcon,
} from "lucide-react";

// Single source of truth for the field-selection step and the per-field
// questions page. Hand-transcribed from Plank.md — edit here, not there.
//
// `order` follows the field-selection.png mockup (Robotics, AI, Astronomy,
// Nuclear, Biotech), which differs from Plank.md's own ordering. Bump a value
// to move a row.
//
// `description` and `questions` must stay beside the metadata: the "How to
// choose" card and the questions page both read from here, so they cannot
// drift apart.

export type Field = {
  // Persisted in the user profile (lib/auth.ts UserProfile.field).
  value: string;
  // Full name for the questions page heading and the welcome summary.
  label: string;
  // Mockup's casing, used in the picker rows ("AI & Machine learning").
  short: string;
  icon: LucideIcon;
  image: string;
  width: number;
  height: number;
  description: string;
  questions: string[];
  order: number;
};

const FIELDS: Field[] = [
  {
    value: "Robotics",
    label: "Robotics",
    short: "Robotics",
    icon: Bot,
    image: "/assets/Robotics.png",
    width: 440,
    height: 888,
    description:
      "Design, build, and program machines that interact with the real world — from robotic arms to autonomous drones.",
    questions: [
      "What is a robot?",
      "What is the main difference between an autonomous robot and a remotely controlled robot?",
      "How does artificial intelligence help robots?",
    ],
    order: 0,
  },
  {
    value: "AI & Machine Learning",
    label: "AI & Machine Learning",
    short: "AI & Machine learning",
    icon: BrainCircuit,
    image: "/assets/AI.png",
    width: 555,
    height: 640,
    description:
      "Dive into algorithms that learn from data, recognize patterns, and power everything from chatbots to self-driving cars.",
    questions: [
      "What is a robot?",
      "What is the main difference between an autonomous robot and a remotely controlled robot?",
      "How does artificial intelligence help robots?",
    ],
    order: 1,
  },
  {
    value: "Astronomy",
    label: "Astronomy",
    short: "Astronomy",
    icon: Telescope,
    image: "/assets/Astronomy.png",
    width: 483,
    height: 768,
    description:
      "Study stars, planets, and galaxies to understand our place in the universe and what lies beyond it.",
    questions: [
      "What is a robot?",
      "What is the main difference between an autonomous robot and a remotely controlled robot?",
      "How does artificial intelligence help robots?",
    ],
    order: 2,
  },
  {
    value: "Nuclear Science",
    label: "Nuclear Science",
    short: "Nuclear science",
    icon: Atom,
    image: "/assets/Nuclear.png",
    width: 732,
    height: 1024,
    description:
      "Explore atomic energy, radiation, and nuclear reactions — the science behind power plants and medical imaging.",
    questions: [
      "What is a robot?",
      "What is the main difference between an autonomous robot and a remotely controlled robot?",
      "How does artificial intelligence help robots?",
    ],
    order: 3,
  },
  {
    value: "Biotechnology & Bioinformatics",
    label: "Biotechnology & Bioinformatics",
    short: "Biotechnology & Bioinformatics",
    icon: Dna,
    image: "/assets/BioScience.png",
    width: 498,
    height: 641,
    description:
      "Merge biology and computing to study genes, proteins, and diseases — and help shape the future of medicine.",
    questions: [
      "What is a robot?",
      "What is the main difference between an autonomous robot and a remotely controlled robot?",
      "How does artificial intelligence help robots?",
    ],
    order: 4,
  },
];

// Shared image-pipeline constants for the field art. Step 5 renders these
// through next/image (quality + sizes below), and step 4's preload warms the
// same optimized URLs — preloading the raw PNG would download the bytes twice
// (once raw, once via /_next/image).
export const FIELD_IMAGE_QUALITY = 75;

// Next.js default deviceSizes
// (node_modules/next/dist/shared/lib/image-config.js). Step 5's `sizes` all
// contain vw units, so next/image advertises exactly these widths in its
// srcset — mirroring them here lets the preload warm the same candidate the
// browser will pick on step 5.
const FIELD_IMAGE_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function fieldImageSizes(value: string): string {
  switch (value) {
    case "Nuclear Science":
      return "(max-width: 900px) 0vw, min(600px, 50vw)";
    case "Astronomy":
      return "(max-width: 900px) 0vw, min(520px, 44vw)";
    case "AI & Machine Learning":
      return "(max-width: 900px) 0vw, min(560px, 46vw)";
    case "Biotechnology & Bioinformatics":
      return "(max-width: 900px) 0vw, min(420px, 36vw)";
    default:
      return "(max-width: 900px) 0vw, min(340px, 30vw)";
  }
}

function optimizedFieldImageUrl(
  image: string,
  width: number,
  quality: number = FIELD_IMAGE_QUALITY,
): string {
  return `/_next/image?url=${encodeURIComponent(image)}&w=${width}&q=${quality}`;
}

function fieldImageSrcSet(
  image: string,
  quality: number = FIELD_IMAGE_QUALITY,
): string {
  return FIELD_IMAGE_WIDTHS.map(
    (width) => `${optimizedFieldImageUrl(image, width, quality)} ${width}w`,
  ).join(", ");
}

// Picker order: the mockup's `order`, not the array's declaration order.
const SORTED_FIELDS = [...FIELDS].sort((a, b) => a.order - b.order);

// Radix/Base UI select values are the persisted `value` strings.
const BY_VALUE = new Map(FIELDS.map((field) => [field.value, field]));

function listFields(): Field[] {
  return SORTED_FIELDS;
}

function fieldByValue(value: string | null | undefined): Field | undefined {
  if (!value) return undefined;
  return BY_VALUE.get(value);
}

export { FIELDS, fieldByValue, fieldImageSizes, fieldImageSrcSet, listFields, optimizedFieldImageUrl };