"use client";

import { Fragment } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toastOk } from "./toast";
import type { WelcomePayload } from "./types";

type WelcomeCardProps = {
  name: string;
  email: string;
  profile: WelcomePayload["profile"];
  onLogout: () => void;
};

// Legacy .card welcome block (shared by index.html and step3.html): first-name
// greeting, "Signed in as", the profile <dl> summary, Log out + Start learning.
function WelcomeCard({ name, email, profile, onLogout }: WelcomeCardProps) {
  // `answers` is the profile's per-question string[]: it would print as one
  // comma-joined blob here (and an empty one is still truthy), so it lives in
  // the profile but never in this summary.
  const entries = Object.entries(profile).filter(
    ([key, value]) => key !== "answers" && value,
  );
  const greeting = name ? `, ${name.split(" ")[0]}` : "";

  return (
    <Card>
      <Image
        className="brand small"
        src="/assets/logo.png"
        alt="RD Academy logo"
        width={190}
        height={183}
        sizes="88px"
        decoding="async"
      />
      <h2>Welcome{greeting}</h2>
      <p>{`Signed in as ${email}.`}</p>
      <dl className="summary">
        {entries.map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key[0].toUpperCase() + key.slice(1)}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
      <div className="btn-row">
        <Button variant="secondary" className="w-full" onClick={onLogout}>
          Log out
        </Button>
        <Button
          className="w-full"
          onClick={() =>
            toastOk("Dashboard coming next — auth is wired and ready.")
          }
        >
          Start learning
        </Button>
      </div>
    </Card>
  );
}

export { WelcomeCard };
