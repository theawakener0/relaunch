"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDraft, mergeDraft, saveDraft } from "@/lib/auth";
import { detailsSchema, type DetailsValues } from "@/lib/schemas";
import { Field } from "./field";
import { focusLastInvalid } from "./focus";

const DETAIL_IDS: Record<string, string> = {
  name: "f2name",
  email: "f2email",
  phone: "f2phone",
  gender: "f2gender",
};

const ORDER = ["name", "email", "phone", "gender"] as const;

type DetailsStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

// Legacy step2.html: name, email, number, gender. Each field was persisted to
// the draft as it was typed, and Continue re-validated all four in order.
function DetailsStep({ onBack, onContinue }: DetailsStepProps) {
  const [initial] = useState(() => {
    const draft = getDraft();
    return {
      name: draft.name ?? "",
      email: draft.email ?? "",
      phone: draft.phone ?? "",
      gender: draft.gender ?? "",
    };
  });
  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: initial,
    shouldFocusError: false,
  });
  // Bumped per failed Continue so invalid fields re-shake per attempt.
  const [shakeSeq, setShakeSeq] = useState(0);

  // Legacy's form.watch persistence, via the React-Compiler-safe useWatch.
  const values = useWatch({ control: form.control });

  useEffect(() => {
    mergeDraft({
      name: String(values.name ?? "").trim(),
      email: String(values.email ?? "").trim(),
      phone: String(values.phone ?? "").trim(),
      gender: String(values.gender ?? ""),
    });
  }, [values]);

  const handleContinue = async () => {
    const valid = await form.trigger(["name", "email", "phone", "gender"]);
    if (!valid) {
      setShakeSeq((n) => n + 1);
      focusLastInvalid(ORDER, DETAIL_IDS, form.formState.errors);
      return;
    }
    const values = form.getValues();
    // Legacy `to3` REPLACED the draft with exactly these four keys, wiping
    // system/grade/school/city so the education step always starts blank.
    saveDraft({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      gender: values.gender,
    });
    onContinue();
  };

  return (
    <Form {...form}>
      <form id="form2" noValidate>
        <div className="page-head">
          <h1>Your details</h1>
          <p>Tell us how to reach you.</p>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f2name">Name</Label>
              <Input
                id="f2name"
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
              <Label htmlFor="f2email">Email</Label>
              <Input
                id="f2email"
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
        <FormField
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f2phone">Number</Label>
              <Input
                id="f2phone"
                type="tel"
                placeholder="Ex:+20"
                autoComplete="tel"
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
          name="gender"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f2gender">Gender</Label>
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="f2gender"
                  ref={field.ref}
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <div className="row-between">
          <button type="button" className="link" onClick={onBack}>
            ← Back
          </button>
          <Button
            type="button"
            size="arrow"
            aria-label="Continue"
            onClick={handleContinue}
          >
            Continue <span aria-hidden="true">→</span>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { DetailsStep };
