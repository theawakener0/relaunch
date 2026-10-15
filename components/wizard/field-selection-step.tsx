"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDraft,
  getUsers,
  mergeDraft,
  normalizeEmail,
  saveSession,
  saveUsers,
  wait,
  type UserProfile,
} from "@/lib/auth";
import {
  fieldByValue,
  fieldImageSizes,
  fieldImageSrcSet,
  listFields,
  optimizedFieldImageUrl,
} from "@/lib/fields";
import { fieldSchema, type FieldValues } from "@/lib/schemas";
import { Field } from "./field";
import { focusLastInvalid } from "./focus";
import { toastOk } from "./toast";
import type { WelcomePayload } from "./types";

const FIELD_IDS: Record<string, string> = { field: "f4field" };
const ORDER = ["field"] as const;

function preloadFieldImage(value: string | null | undefined) {
  if (!value || typeof window === "undefined") return;
  if (window.matchMedia("(max-width: 900px)").matches) return;
  const field = fieldByValue(value);
  if (!field) return;
  // Warm the same Next.js optimized variant step 5 renders (same quality,
  // srcset and sizes) so the browser picks the identical candidate from its
  // cache. Preloading the raw PNG would download the bytes twice.
  const img = new window.Image();
  img.decoding = "async";
  img.sizes = fieldImageSizes(field.value);
  img.src = optimizedFieldImageUrl(field.image, 640);
  img.srcset = fieldImageSrcSet(field.image);
}

type FieldSelectionStepProps = {
  onBack: () => void;
  onContinue: (payload: WelcomePayload) => void;
};

// Step 4: pick a field, then create the account. This is where the profile
// finally becomes complete — the legacy education page used to write the
// account itself, but the field is not known until here.
function FieldSelectionStep({ onBack, onContinue }: FieldSelectionStepProps) {
  const fields = listFields();
  const [initial] = useState(() => ({ field: getDraft().field ?? "" }));
  const form = useForm<FieldValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: initial,
    shouldFocusError: false,
  });
  const [submitting, setSubmitting] = useState(false);
  // Bumped per failed submit so the trigger re-shakes per attempt.
  const [shakeSeq, setShakeSeq] = useState(0);

  const finish = form.handleSubmit(async () => {
    preloadFieldImage(form.getValues().field);
    setSubmitting(true);
    await wait(600);
    setSubmitting(false);
    // Re-read after the wait so a late change to the picker is what persists,
    // matching the legacy steps' post-wait read.
    const field = form.getValues().field;
    const draft = getDraft();
    const users = getUsers();
    const email = normalizeEmail(draft.email ?? "");
    const profile: UserProfile = {
      phone: draft.phone ?? "",
      gender: draft.gender ?? "",
      system: draft.system ?? "",
      grade: draft.grade ?? "",
      school: draft.school ?? "",
      city: draft.city ?? "",
      field,
      // Answers are index-aligned to one field's `questions` list (see
      // lib/fields.ts), so they only survive a revisit when the field itself
      // is unchanged. Picking a different field must clear them — carrying the
      // old array across would answer the new field's questions with the old
      // field's answers. Re-submitting this step after a Back press therefore
      // wipes the answers instead of destroying them unconditionally.
      answers: draft.field === field ? (draft.answers ?? []) : [],
    };
    users[email] = { name: draft.name ?? "", profile };
    saveUsers(users);
    saveSession({ email });
    mergeDraft(profile);
    toastOk("Account created successfully.");
    onContinue({
      name: draft.name ?? "",
      email,
      profile,
      origin: "field",
    });
  }, (errors) => {
    setShakeSeq((n) => n + 1);
    focusLastInvalid(ORDER, FIELD_IDS, errors);
  });

  return (
    <Form {...form}>
      <form id="form4" noValidate onSubmit={finish}>
        <div className="page-head">
          <h1>Choose your field</h1>
          <p>Pick the track you want to study.</p>
        </div>

        <div className="pick-wrap">
          <Card>
            <CardTitle>How to choose</CardTitle>
            <ul className="pick-list">
              {fields.map((item) => (
                <li key={item.value} className="pick-list-item">
                  <span className="pick-list-lead">{item.short}</span>
                  <span className="pick-list-tail">
                    {" — "}
                    {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <FormField
          control={form.control}
          name="field"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <label className="pick-label" htmlFor="f4field">
                Field
              </label>
              <Select
                value={field.value || null}
                onValueChange={(value) => {
                  field.onChange(value ?? "");
                  preloadFieldImage(value);
                }}
              >
                <SelectTrigger
                  id="f4field"
                  ref={field.ref}
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="Choose your field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        variant="field"
                      >
                        <Icon className="pick-option-icon" aria-hidden="true" />
                        {item.short}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <div className="step3-nav">
          <button
            type="button"
            className="arrow static with-text"
            aria-label="Back"
            onClick={onBack}
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <Button
            type="submit"
            className="w-full min-w-60 max-sm:min-w-0 shrink"
            disabled={submitting}
          >
            <span className={cn(submitting && "opacity-60")}>Continue</span>
            {submitting && <Loader2Icon className="size-5 animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { FieldSelectionStep };