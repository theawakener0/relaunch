"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";

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
import { getDraft, mergeDraft } from "@/lib/auth";
import { educationSchema, type EducationValues } from "@/lib/schemas";
import { Field } from "./field";
import { focusLastInvalid } from "./focus";

const EDUCATION_IDS: Record<string, string> = {
  system: "f3sys",
  grade: "f3grade",
  school: "f3school",
  city: "f3city",
};

const ORDER = ["system", "grade", "school", "city"] as const;

type EducationStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

// Legacy step3.html: system, grade, school, city. Unlike the legacy page, this
// step no longer creates the account — the field-selection step does that once
// the field is known, so it hands off instead of finishing.
function EducationStep({ onBack, onContinue }: EducationStepProps) {
  const [initial] = useState(() => {
    const draft = getDraft();
    return {
      system: draft.system ?? "",
      grade: draft.grade ?? "",
      school: draft.school ?? "",
      city: draft.city ?? "",
    };
  });
  const form = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: initial,
    shouldFocusError: false,
  });
  // Bumped per failed submit so invalid fields re-shake per attempt.
  const [shakeSeq, setShakeSeq] = useState(0);

  // Legacy's form.watch persistence, via the React-Compiler-safe useWatch.
  const values = useWatch({ control: form.control });

  useEffect(() => {
    mergeDraft({
      system: String(values.system ?? ""),
      grade: String(values.grade ?? ""),
      school: String(values.school ?? "").trim(),
      city: String(values.city ?? "").trim(),
    });
  }, [values]);

  const onInvalid = (errors: FieldErrors<EducationValues>) => {
    setShakeSeq((n) => n + 1);
    focusLastInvalid(ORDER, EDUCATION_IDS, errors);
  };

  // The useWatch effect above already persists every keystroke, so Continue
  // only has to re-read the live values, trim them into the draft and hand
  // off. The legacy 800ms wait and the account write both moved to the
  // field-selection step, which is now the point where the profile is
  // complete.
  const finish = form.handleSubmit(() => {
    const live = form.getValues();
    mergeDraft({
      system: live.system,
      grade: live.grade,
      school: live.school.trim(),
      city: live.city.trim(),
    });
    onContinue();
  }, onInvalid);

  return (
    <Form {...form}>
      <form id="form3" noValidate onSubmit={finish}>
        <div className="page-head">
          <h1>Education</h1>
          <p>Tell us where you study.</p>
        </div>
        <FormField
          control={form.control}
          name="system"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f3sys">Educational System</Label>
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="f3sys"
                  ref={field.ref}
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="Educational System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="American">American</SelectItem>
                  <SelectItem value="British (IGCSE)">
                    British (IGCSE)
                  </SelectItem>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="Azhar">Azhar</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <FormField
          control={form.control}
          name="grade"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f3grade">Grade</Label>
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="f3grade"
                  ref={field.ref}
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                  <SelectItem value="Grade 11">Grade 11</SelectItem>
                  <SelectItem value="Grade 12">Grade 12</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <FormField
          control={form.control}
          name="school"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f3school">High School/University Name</Label>
              <Input
                id="f3school"
                type="text"
                autoComplete="organization"
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
          name="city"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error} shakeKey={shakeSeq}>
              <Label htmlFor="f3city">Governorate/City</Label>
              <Input
                id="f3city"
                type="text"
                autoComplete="address-level1"
                aria-invalid={!!fieldState.error}
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
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
          >
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { EducationStep };
