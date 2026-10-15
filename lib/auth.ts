// Shared auth across the wizard steps. Demo storage only (localStorage) —
// use a real backend in production. Mirrors the legacy app.js storage layer.

export type UserProfile = {
  phone: string;
  gender: string;
  system: string;
  grade: string;
  school: string;
  city: string;
  // Set by the field-selection step; "" when the user skipped it.
  field: string;
  // Set by the field-questions step, index-aligned to that field's
  // `questions` array in lib/fields.ts. Empty until that step is submitted.
  answers: string[];
};

export type StoredUser = {
  name: string;
  profile: Partial<UserProfile>;
};

export type Draft = Partial<UserProfile> & {
  name?: string;
  email?: string;
};

export type Session = {
  email: string;
};

const DB_KEY = "ra_users";
const SESSION_KEY = "ra_session";
const DRAFT_KEY = "ra_draft";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const hasStorage = () => typeof window !== "undefined";

function load<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode / quota) — ignore like legacy did not, but never crash.
  }
}

function remove(key: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Logout must never throw mid-handler — ignore like load/save do.
  }
}

export function getUsers(): Record<string, StoredUser> {
  return load<Record<string, StoredUser>>(DB_KEY, {});
}

export function saveUsers(users: Record<string, StoredUser>): void {
  save(DB_KEY, users);
}

export function getSession(): Session | null {
  return load<Session | null>(SESSION_KEY, null);
}

export function saveSession(session: Session): void {
  save(SESSION_KEY, session);
}

export function getDraft(): Draft {
  return load<Draft>(DRAFT_KEY, {});
}

export function saveDraft(draft: Draft): void {
  save(DRAFT_KEY, draft);
}

export function mergeDraft(patch: Partial<Draft>): void {
  save(DRAFT_KEY, { ...getDraft(), ...patch });
}

export function logout(): void {
  remove(SESSION_KEY);
  remove(DRAFT_KEY);
}

export function emailOk(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
