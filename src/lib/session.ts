/**
 * Client-side session for the custom auth flow (user row stored after OTP/login).
 * Not Supabase Auth JWT session — see login pages for how `StoredUser` is written.
 */
import type { StoredUser } from '../types/models';

const USER_KEY = 'user';

/** @returns Parsed user or null when missing / corrupted localStorage */
export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

/** Guard helper for pages that require a logged-in citizen */
export function requireUserId(): number | null {
  return getStoredUser()?.user_id ?? null;
}
