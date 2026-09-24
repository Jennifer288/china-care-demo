import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { User, MedicalCase } from "./types";
type Account = User & { hash: string; salt: string };
type State = {
  accounts: Map<string, Account>;
  sessions: Map<string, { id: string; expires: number }>;
  cases: Map<string, MedicalCase>;
  blobs: Map<string, Buffer>;
  consents: {
    user_id: string;
    case_id: string;
    version: string;
    accepted_at: string;
  }[];
  rates: Map<string, { count: number; until: number }>;
};
const scope = globalThis as unknown as { careStore?: State };
export const store: State = (scope.careStore ??= {
  accounts: new Map(),
  sessions: new Map(),
  cases: new Map(),
  blobs: new Map(),
  consents: [],
  rates: new Map(),
});
export function addAccount(
  data: Omit<User, "id" | "admin">,
  password: string,
  admin = false,
) {
  if ([...store.accounts.values()].some((a) => a.email === data.email))
    throw Error("Unable to register this email. Try logging in.");
  const salt = randomUUID();
  const a = {
    ...data,
    id: randomUUID(),
    admin,
    salt,
    hash: scryptSync(password, salt, 64).toString("hex"),
  };
  store.accounts.set(a.id, a);
  return a;
}
export function login(email: string, password: string) {
  const a = [...store.accounts.values()].find((a) => a.email === email);
  const candidate = scryptSync(password, a?.salt ?? "dummy-salt", 64);
  if (!a || !timingSafeEqual(candidate, Buffer.from(a.hash, "hex")))
    return null;
  return a;
}
export function session(id: string) {
  const token = randomUUID() + randomUUID();
  store.sessions.set(token, { id, expires: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}
export function sessionUser(token: string) {
  const s = store.sessions.get(token);
  if (!s || s.expires < Date.now()) {
    store.sessions.delete(token);
    return null;
  }
  return store.accounts.get(s.id) ?? null;
}
export function publicUser(a: User): User {
  return {
    id: a.id,
    email: a.email,
    full_name: a.full_name,
    country: a.country,
    preferred_language: a.preferred_language,
    admin: a.admin,
  };
}
export function rateLimit(key: string, limit = 30) {
  const now = Date.now();
  let r = store.rates.get(key);
  if (!r || r.until < now) {
    r = { count: 0, until: now + 60000 };
    store.rates.set(key, r);
  }
  if (++r.count > limit)
    throw Error("Too many requests. Please wait a minute.");
}
