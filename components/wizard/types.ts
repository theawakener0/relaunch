import type { UserProfile } from "@/lib/auth";

export type WelcomePayload = {
  name: string;
  email: string;
  profile: Partial<UserProfile>;
  origin: "auth" | "field";
};
