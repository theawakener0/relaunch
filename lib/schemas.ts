import { z } from "zod";

import { emailOk } from "@/lib/auth";

const phoneOk = (value: string) => value.replace(/\D/g, "").length >= 8;

export const authSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z
    .string()
    .trim()
    .refine(emailOk, "Enter a valid email address."),
});

export const detailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().refine(emailOk, "Enter a valid email."),
  phone: z
    .string()
    .trim()
    .refine(phoneOk, "Enter a valid phone, e.g. +20 1X XXX XXXX."),
  gender: z.string().min(1, "Select a gender."),
});

export const educationSchema = z.object({
  system: z.string().min(1, "Choose your educational system."),
  grade: z.string().min(1, "Choose your grade."),
  school: z.string().trim().min(2, "Enter your school / university."),
  city: z.string().trim().min(2, "Enter your governorate / city."),
});

// The picker only ever submits a value from lib/fields.ts, so min(1) is
// enough here; refine() would need the field list imported into the schema.
export const fieldSchema = z.object({
  field: z.string().min(1, "Choose your field."),
});

// One entry per question, keyed by the question's index in Field.questions so
// the persisted array stays index-aligned with lib/fields.ts. Built from the
// question count at runtime: every field carries its own list, so a fixed
// object shape would go stale the moment a field gains or loses a question.
export function fieldAnswersSchema(count: number) {
  const shape: Record<string, z.ZodType<string>> = {};
  for (let index = 0; index < count; index += 1) {
    shape[String(index)] = z
      .string()
      .trim()
      .min(1, "Answer this question before continuing.");
  }
  return z.object(shape);
}

export type AuthValues = z.infer<typeof authSchema>;
export type DetailsValues = z.infer<typeof detailsSchema>;
export type EducationValues = z.infer<typeof educationSchema>;
export type FieldValues = z.infer<typeof fieldSchema>;
export type FieldAnswersValues = z.infer<ReturnType<typeof fieldAnswersSchema>>;
