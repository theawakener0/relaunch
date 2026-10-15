"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent } from "react";

function Glows() {
  return (
    <>
      <div className="glow glow-left" aria-hidden="true" />
      <div className="glow glow-right" aria-hidden="true" />
      <div className="glow glow-bottom" aria-hidden="true" />
    </>
  );
}

function Orbit() {
  return (
    <svg className="orbit show" viewBox="0 0 300 300" aria-hidden="true">
      <circle className="orbit-glow" cx="260" cy="20" r="42" />
      <circle className="orbit-ring" cx="260" cy="20" r="150" opacity="0.35" />
      <circle className="orbit-ring" cx="260" cy="20" r="115" opacity="0.5" />
      <circle className="orbit-ring" cx="260" cy="20" r="82" opacity="0.65" />
      <circle className="orbit-ring" cx="260" cy="20" r="52" opacity="0.85" />
      <g className="orbit-spin orbit-spin-a">
        <circle className="orbit-dot" cx="130.1" cy="95" r="10" />
      </g>
      <g className="orbit-spin orbit-spin-b">
        <circle className="orbit-dot" cx="186.1" cy="108.1" r="8" />
      </g>
      <g className="orbit-spin orbit-spin-c">
        <circle className="orbit-dot" cx="225.3" cy="94.3" r="6.5" />
      </g>
      <g className="orbit-spin orbit-spin-d">
        <circle className="orbit-dot" cx="220.2" cy="53.4" r="5" />
      </g>
    </svg>
  );
}

type CornerLogoProps = { onHome?: () => void; step?: string };

function CornerLogo({ onHome, step }: CornerLogoProps) {
  const reduceMotion = useReducedMotion();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (reduceMotion) {
      onHome?.();
      return;
    }
    const el = event.currentTarget;
    if (el.classList.contains("logo-spinning")) return;
    el.classList.add("logo-spinning");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      el.classList.remove("logo-spinning");
      onHome?.();
    };
    const timer = setTimeout(finish, 650);
    const handleAnimationEnd = () => {
      clearTimeout(timer);
      el.removeEventListener("animationend", handleAnimationEnd);
      finish();
    };
    el.addEventListener("animationend", handleAnimationEnd);
  }

  return (
    <motion.button
      type="button"
      className="corner-logo"
      data-step={step ?? undefined}
      aria-label="Go to home"
      onClick={handleClick}
      whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
    >
      <Image
        src="/assets/logo.png"
        alt="RD Academy logo"
        width={190}
        height={183}
        priority
        sizes="(max-width: 640px) 14vw, 76px"
        decoding="async"
      />
    </motion.button>
  );
}

export { Glows, Orbit, CornerLogo };
export type { CornerLogoProps };
