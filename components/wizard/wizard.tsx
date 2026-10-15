"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { CornerLogo, Glows, Orbit } from "@/components/decorations";
import { getDraft, getSession, getUsers, logout } from "@/lib/auth";
import { AuthStep } from "./auth-step";
import { DetailsStep } from "./details-step";
import { EducationStep } from "./education-step";
import { FieldQuestionsStep } from "./field-questions-step";
import { FieldSelectionStep } from "./field-selection-step";
import type { WelcomePayload } from "./types";
import { WelcomeCard } from "./welcome-card";

type Step = "auth" | "details" | "education" | "field" | "questions" | "welcome";

// Layout effect that is SSR-safe: React only warns about useLayoutEffect on the
// server, so the server build resolves to the passive useEffect (never runs).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Single-route shell around the three legacy pages. Decorations mirror legacy
// markup: glows everywhere, orbit + corner logo on details/education (and the
// welcome card that replaces the education form), glows only after Log in.
function Wizard() {
  const [step, setStep] = useState<Step>("auth");
  const [welcome, setWelcome] = useState<WelcomePayload | null>(null);
  // Session restore resolves pre-paint: server HTML and the first client render
  // both render the non-restored tree (no AnimatePresence), so hydration matches
  // and returning users never see the auth step flash or a swap animation.
  const [restored, setRestored] = useState(false);
  const reducedMotion = useReducedMotion();

  useIsoLayoutEffect(() => {
    const session = getSession();
    const user = session ? getUsers()[session.email] : undefined;
    if (session && user) {
      setWelcome({
        name: user.name,
        email: session.email,
        profile: user.profile ?? {},
        origin: "auth",
      });
      setStep("welcome");
    }
    setRestored(true);
  }, []);

  const showOrbit =
    step === "details" ||
    step === "education" ||
    step === "field" ||
    step === "questions" ||
    (step === "welcome" && welcome?.origin === "field");

  // Field art owns the right side on the field/questions steps, so the orbit
  // rings stay off those pages (corner logo stays).
  const showOrbitRings = showOrbit && step !== "field" && step !== "questions";

  const handleSignup = () => {
    const draft = getDraft();
    if (!draft.name || !draft.email) {
      setStep("auth");
      return;
    }
    setStep("details");
  };

  const handleContinue = () => {
    const draft = getDraft();
    if (!draft.phone || !draft.gender) {
      setStep("details");
      return;
    }
    setStep("education");
  };

  const handleField = (payload: WelcomePayload) => {
    // Step 4 created the account and stored the chosen field; step 5 just
    // shows that field's questions before the welcome card.
    setWelcome(payload);
    setStep("questions");
  };

  const handleWelcome = (payload: WelcomePayload) => {
    setWelcome(payload);
    setStep("welcome");
  };

  const handleLogout = () => {
    logout();
    setWelcome(null);
    setStep("auth");
  };

  let content: ReactNode = null;
  if (step === "auth") {
    content = <AuthStep onSignup={handleSignup} onWelcome={handleWelcome} />;
  } else if (step === "details") {
    content = (
      <DetailsStep
        onBack={() => setStep("auth")}
        onContinue={handleContinue}
      />
    );
  } else if (step === "education") {
    content = (
      <EducationStep
        onBack={() => setStep("details")}
        onContinue={() => setStep("field")}
      />
    );
  } else if (step === "field") {
    content = (
      <FieldSelectionStep
        onBack={() => setStep("education")}
        onContinue={handleField}
      />
    );
  } else if (step === "questions") {
    content = (
      <FieldQuestionsStep
        onBack={() => setStep("field")}
        // The payload was already set by step 4; the questions step only
        // carries no data of its own, so reuse it verbatim.
        onContinue={() => welcome && handleWelcome(welcome)}
      />
    );
  } else if (welcome) {
    content = (
      <WelcomeCard
        name={welcome.name}
        email={welcome.email}
        profile={welcome.profile}
        onLogout={handleLogout}
      />
    );
  }

  // `initial` is unconditional: useReducedMotion() is null on the server but
  // true on the client for reduced-motion users, so branching it would mismatch
  // hydration on the rendered style attribute. The duration/exit branches don't
  // serialize to HTML, so they stay reduced-motion-aware. The cubic bezier
  // matches the legacy `fade` keyframe's ease timing function.
  const section = (
    <motion.section
      key={step}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } }}
      transition={{
        duration: reducedMotion ? 0 : 0.28,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {content}
    </motion.section>
  );

  return (
    <>
      <Glows />
      {showOrbitRings && <Orbit />}
      {showOrbit && <CornerLogo />}
      <main className="wrap">
        {restored ? (
          <AnimatePresence mode="wait">{section}</AnimatePresence>
        ) : (
          section
        )}
      </main>
    </>
  );
}

export { Wizard };
