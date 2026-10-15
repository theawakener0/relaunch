"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDraft,
  getUsers,
  mergeDraft,
  normalizeEmail,
  saveUsers,
} from "@/lib/auth";
import {
  FIELD_IMAGE_QUALITY,
  fieldByValue,
  fieldImageSizes,
  type Field as QuestionsField,
} from "@/lib/fields";
import { fieldAnswersSchema, type FieldAnswersValues } from "@/lib/schemas";
import { Field } from "./field";
import { focusLastInvalid } from "./focus";

type FieldQuestionsStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

type QuestionsFormProps = FieldQuestionsStepProps & {
  field: QuestionsField;
};

// Step 5: answer the questions for the field chosen in step 4. Legacy had no
// step 5 at all — it printed the list read-only — so these are now collected
// one input per question instead. Split from the step so the form hooks only
// mount on the branch that actually renders a field.
function FieldQuestionsStep({ onBack, onContinue }: FieldQuestionsStepProps) {
  // The draft is written by step 4 before this step mounts, so it is safe to
  // read during the first client render (no SSR pass to mismatch against).
  const field = fieldByValue(getDraft().field);

  if (!field) {
    // Unreachable through the wizard (step 4 requires a field), but the draft
    // can be cleared out from under it. Never render an empty shell.
    return (
      <>
        <div className="page-head">
          <h1>Questions</h1>
          <p>No field selected yet.</p>
        </div>
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
            type="button"
            className="w-full min-w-60 max-sm:min-w-0 shrink"
            onClick={() => onContinue()}
          >
            Skip
          </Button>
        </div>
      </>
    );
  }

  return (
    <QuestionsForm field={field} onBack={onBack} onContinue={onContinue} />
  );
}

function QuestionsForm({ field, onBack, onContinue }: QuestionsFormProps) {
  // Form names are the question indexes, so the value object IS the answers
  // array once mapped in order — no separate key mapping to keep in sync.
  // fieldByValue hands back the same module object every call, so these are
  // stable identities and the persistence effect below does not re-run.
  const order = useMemo(
    () => field.questions.map((_, index) => String(index)),
    [field],
  );
  const answerIds = useMemo(() => {
    const ids: Record<string, string> = {};
    for (const name of order) {
      ids[name] = `f5q${name}`;
    }
    return ids;
  }, [order]);

  const [initial] = useState(() => {
    const draft = getDraft();
    // Going Back to step 4 and picking a DIFFERENT field leaves the old
    // field's answers in the draft, index-aligned to the wrong questions. A
    // length match is the only alignment signal available, so anything else
    // starts blank and the persistence effect below overwrites the stale
    // array on mount.
    const answers =
      draft.answers?.length === field.questions.length ? draft.answers : [];
    const values: Record<string, string> = {};
    for (const name of order) {
      values[name] = answers[Number(name)] ?? "";
    }
    return values;
  });

  const form = useForm<FieldAnswersValues>({
    resolver: zodResolver(fieldAnswersSchema(field.questions.length)),
    shouldFocusError: false,
    defaultValues: initial,
  });
  // Bumped per failed submit so invalid answers re-shake per attempt.
  const [shakeSeq, setShakeSeq] = useState(0);

  // Legacy's form.watch persistence, via the React-Compiler-safe useWatch.
  const values = useWatch({ control: form.control });

  useEffect(() => {
    mergeDraft({
      answers: order.map((name) => String(values[name] ?? "").trim()),
    });
  }, [order, values]);

  const onInvalid = (errors: FieldErrors<FieldAnswersValues>) => {
    setShakeSeq((n) => n + 1);
    focusLastInvalid(order, answerIds, errors);
  };

  const finish = form.handleSubmit(() => {
    const live = form.getValues();
    const answers = order.map((name) => String(live[name] ?? "").trim());
    const draft = getDraft();
    mergeDraft({ answers });
    // Step 4 already created the account and the session, so this only
    // patches answers onto the existing record. Read-modify-write happens in
    // one synchronous tick with no await in between, so nothing else can
    // interleave its own saveUsers and drop the merge.
    const users = getUsers();
    const email = normalizeEmail(draft.email ?? "");
    const user = users[email];
    if (user) {
      saveUsers({
        ...users,
        [email]: { ...user, profile: { ...user.profile, answers } },
      });
    }
    onContinue();
  }, onInvalid);

  return (
    <>
    <Form {...form}>
      <form id="form5" noValidate onSubmit={finish}>
        <div className="page-head">
          <h1>{field.label} questions</h1>
          <p>Answer each one so we know where you stand.</p>
        </div>

        {field.questions.map((question, index) => {
          const name = String(index);
          const id = answerIds[name];
          return (
            <FormField
              key={question}
              control={form.control}
              name={name}
              render={({ field: answer, fieldState }) => (
                <Field error={fieldState.error} shakeKey={shakeSeq}>
                  <Label htmlFor={id}>{`Q${index + 1} — ${question}`}</Label>
                  <Input
                    id={id}
                    type="text"
                    placeholder="Type your answer"
                    aria-invalid={!!fieldState.error}
                    ref={answer.ref}
                    value={answer.value}
                    onChange={answer.onChange}
                    onBlur={answer.onBlur}
                  />
                </Field>
              )}
            />
          );
        })}

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
    <Image
      className="questions-art"
      data-field={field.value}
      src={field.image}
      alt=""
      aria-hidden="true"
      width={field.width}
      height={field.height}
      priority
      fetchPriority="high"
      decoding="async"
      quality={FIELD_IMAGE_QUALITY}
      sizes={fieldImageSizes(field.value)}
      data-loaded="false"
      onLoad={(event) => {
        event.currentTarget.dataset.loaded = "true";
      }}
    />
    </>
  );
}

export { FieldQuestionsStep };