import { getItem, setItem, removeItem } from './storage';

export interface User {
  phone: string;
  token: string;
  createdAt: string;
}

const USER_KEY = 'current_user';
const USER_PREFIX = 'user_';

/** Generate a random 6-digit verification code */
export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Simulate sending SMS (returns the code directly for display).
 * Future: replace with real SMS API call + Netlify Identity.
 */
export function simulateSendSms(phone: string): string {
  const code = generateCode();
  return code;
}

/** Register or login with phone number. Auto-creates account if not exists. */
export function loginOrRegister(phone: string): User {
  const existing = getItem<User>(USER_PREFIX + phone);
  if (existing) {
    setItem(USER_KEY, existing);
    return existing;
  }

  const newUser: User = {
    phone,
    token: `token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };

  setItem(USER_PREFIX + phone, newUser);
  setItem(USER_KEY, newUser);
  return newUser;
}

/** Get currently logged-in user */
export function getCurrentUser(): User | null {
  return getItem<User>(USER_KEY);
}

/** Logout: clear current session */
export function logout(): void {
  removeItem(USER_KEY);
}

/** Check if user is logged in */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
