"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDraft,
  getUsers,
  normalizeEmail,
  saveDraft,
  saveSession,
  wait,
} from "@/lib/auth";
import { authSchema, type AuthValues } from "@/lib/schemas";
import { Field } from "./field";
import { focusLastInvalid } from "./focus";
import { toastBad, toastOk } from "./toast";
import type { WelcomePayload } from "./types";

const AUTH_IDS: Record<string, string> = { name: "f1name", email: "f1email" };

type AuthStepProps = {
  onSignup: () => void;
  onWelcome: (payload: WelcomePayload) => void;
};

// Legacy index.html + its half of app.js: name + email only, Log in matches a
// stored account, Sign Up stores the draft and hands off to details.
function AuthStep({ onSignup, onWelcome }: AuthStepProps) {
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { name: "", email: "" },
    shouldFocusError: false,
  });
  // Draft prefill happens after mount: localStorage does not exist during SSR,
  // and the first client render must match the server HTML exactly. The
  // details/education steps mount only after client navigation, so they may
  // read the draft during their own first render.
  useEffect(() => {
    const draft = getDraft();
    if (draft.name || draft.email) {
      form.reset({ name: draft.name ?? "", email: draft.email ?? "" });
    }
  }, [form]);
  const [loggingIn, setLoggingIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  // Bumped on every invalid-validation pass so fields re-shake per attempt,
  // exactly like legacy's setErr-per-submit.
  const [shakeSeq, setShakeSeq] = useState(0);

  const onInvalid = (errors: FieldErrors<AuthValues>) => {
    setShakeSeq((n) => n + 1);
    focusLastInvalid(["name", "email"], AUTH_IDS, errors);
  };

  const login = form.handleSubmit(async () => {
    setLoggingIn(true);
    await wait(600);
    setLoggingIn(false);
    // Legacy re-read the live fields after its 600ms wait — use the latest
    // values for the lookup, not the ones validated at submit time.
    const live = form.getValues();
    const users = getUsers();
    const email = normalizeEmail(live.email);
    const user = users[email];
    if (!user || user.name.toLowerCase() !== live.name.trim().toLowerCase()) {
      form.setError("email", {
        message: "No account found for this name + email. Hit Sign Up instead.",
      });
      setShakeSeq((n) => n + 1);
      document.getElementById("f1email")?.focus();
      toastBad("No account found — sign up to create one.");
      return;
    }
    saveSession({ email });
    toastOk(`Welcome back, ${user.name.split(" ")[0]}.`);
    onWelcome({
      name: user.name,
      email,
      profile: user.profile ?? {},
      origin: "auth",
    });
  }, onInvalid);

  const signup = form.handleSubmit(async (values) => {
    const users = getUsers();
    const email = normalizeEmail(values.email);
    if (users[email]) {
      form.setError("email", {
        message: "Account already exists. Hit Log in instead.",
      });
      setShakeSeq((n) => n + 1);
      document.getElementById("f1email")?.focus();
      toastBad("Email already registered — please log in.");
      return;
    }
    setSigningUp(true);
    await wait(400);
    setSigningUp(false);
    // Re-read after the wait; the duplicate-email check above stays pre-wait,
    // exactly like legacy.
    const live = form.getValues();
    saveDraft({ name: live.name.trim(), email: live.email.trim() });
    onSignup();
  }, onInvalid);

  return (
    <>
      <header className="hero-head">
        <Image
          className="brand"
          src="/assets/logo.png"
          alt="RD Academy logo"
          width={190}
          height={183}
          priority
          sizes="(max-width: 640px) 16vw, 104px"
          decoding="async"
        />
        <h1>
          <span className="title-text">Relaunched Academy</span>
          <Image
            className="title-icon"
            src="/assets/book-icon.png"
            alt=""
            aria-hidden="true"
            width={71}
            height={71}
            priority={false}
            loading="eager"
            decoding="async"
            sizes="48px"
          />
        </h1>
      </header>

      <div className="books-center">
        <Image
          src="/assets/books-hero.png"
          alt="Stack of red books"
          width={520}
          height={349}
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 82vw, 420px"
          quality={80}
          decoding="async"
        />
      </div>

      <Form {...form}>
        <form id="form1" noValidate onSubmit={login}>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field error={fieldState.error} shakeKey={shakeSeq}>
                <Label htmlFor="f1name">Name</Label>
                <Input
                  id="f1name"
                  type="text"
                  placeholder="Type your name"
                  autoComplete="name"
                  aria-invalid={!!fieldState.error}
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field error={fieldState.error} shakeKey={shakeSeq}>
                <Label htmlFor="f1email">Email</Label>
                <Input
                  id="f1email"
                  type="email"
                  placeholder="Example@gmail.com"
                  autoComplete="email"
                  aria-invalid={!!fieldState.error}
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </Field>
            )}
          />
          <div className="btn-row">
            <Button type="submit" className="w-full" disabled={loggingIn}>
              <span className={cn(loggingIn && "opacity-60")}>Log in</span>
              {loggingIn && <Loader2Icon className="size-5 animate-spin" />}
            </Button>
            <Button
              type="button"
              className="w-full"
              disabled={signingUp}
              onClick={signup}
            >
              <span className={cn(signingUp && "opacity-60")}>Sign Up</span>
              {signingUp && <Loader2Icon className="size-5 animate-spin" />}
              <Image
                className="spark-img"
                src="/assets/spark.png"
                alt=""
                aria-hidden="true"
                width={89}
                height={94}
                priority={false}
                loading="lazy"
                decoding="async"
                sizes="36px"
              />
            </Button>
          </div>
          <p className="hint">
            New here? Fill name + email and hit <b>Sign Up</b> to continue.
            Returning? Hit <b>Log in</b>.
          </p>
        </form>
      </Form>
    </>
  );
}

export { AuthStep };
