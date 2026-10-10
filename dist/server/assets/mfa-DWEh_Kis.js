import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { Secret, TOTP } from "otpauth";
import { drizzle } from "drizzle-orm/netlify-db";
import { pgTable, timestamp, integer, boolean, text, index, date, jsonb, serial } from "drizzle-orm/pg-core";
import { b as getCookie, s as setCookie, d as deleteCookie } from "../server.js";
const resumes = pgTable("resumes", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  editToken: text("edit_token").notNull(),
  // Netlify Identity user id of the member who owns this resume. Null for resumes made before accounts existed;
  // those are claimed by the first signed-in member who opens a valid private edit link.
  ownerId: text("owner_id"),
  // Lower-cased emails of members the owner has invited to co-edit.
  editorEmails: jsonb("editor_emails").$type().notNull().default([]),
  name: text().notNull(),
  age: text().notNull().default(""),
  location: text().notNull().default(""),
  headline: text().notNull().default(""),
  objective: text().notNull().default(""),
  lookingFor: text("looking_for").notNull().default(""),
  qualities: jsonb().$type().notNull().default([]),
  likes: jsonb().$type().notNull().default([]),
  dislikes: jsonb().$type().notNull().default([]),
  dealbreakers: jsonb().$type().notNull().default([]),
  loveLanguages: jsonb("love_languages").$type().notNull().default([]),
  experience: jsonb().$type().notNull().default([]),
  references: jsonb().$type().notNull().default([]),
  contact: text().notNull().default(""),
  accent: text().notNull().default("rose"),
  // How the owner's verified name appears on the page: 'first-initial', 'first' or 'full'. The name itself always
  // comes from member_profiles; `name` and `age` above are a snapshot written on each save.
  nameStyle: text("name_style").notNull().default("first-initial"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const memberMfa = pgTable("member_mfa", {
  userId: text("user_id").primaryKey(),
  secret: text().notNull(),
  enabled: boolean().notNull().default(false),
  // Last accepted 30-second time step, so a code can't be replayed.
  lastStep: integer("last_step").notNull().default(0),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const mfaSessions = pgTable(
  "mfa_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at").notNull()
  },
  (t) => [index("mfa_sessions_user_id_idx").on(t.userId)]
);
const memberProfiles = pgTable("member_profiles", {
  userId: text("user_id").primaryKey(),
  provider: text().notNull(),
  providerEmail: text("provider_email"),
  legalName: text("legal_name"),
  // 'provider' when the name came from Google/GitHub, 'attested' when the member typed it in.
  nameSource: text("name_source"),
  birthDate: date("birth_date", { mode: "string" }),
  sex: text(),
  policyVersion: text("policy_version"),
  attestedAt: timestamp("attested_at"),
  // Set when the member reported an age under 18. Nothing else about them is kept, and the check can't be retried.
  refusedAt: timestamp("refused_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  memberMfa,
  memberProfiles,
  mfaSessions,
  resumes
}, Symbol.toStringTag, { value: "Module" }));
const db = drizzle({ schema });
const SOCIAL_PROVIDERS = ["google", "github"];
const PROVIDER_LABELS = { google: "Google", github: "GitHub" };
const MIN_AGE_RESUME = 18;
const MIN_AGE_SOCIAL_MATCH = 21;
const IDENTITY_POLICY_VERSION = "2026-10-08";
const IDENTITY_REQUIRED = "Identity check required.";
const SOCIAL_SIGN_IN_REQUIRED = "Password sign-in has been retired. Please sign in with Google or GitHub.";
const SEXES = { female: "Female", male: "Male", intersex: "Intersex" };
const NAME_STYLES = ["first-initial", "first", "full"];
function socialProviderOf(user) {
  if (!user) return null;
  const linked = Array.isArray(user.appMetadata?.providers) ? user.appMetadata.providers : [];
  const candidates = [user.provider, user.appMetadata?.provider, ...linked];
  return SOCIAL_PROVIDERS.find((p) => candidates.includes(p)) ?? null;
}
function ageOn(birthDate, today = /* @__PURE__ */ new Date()) {
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = today.getUTCFullYear() - y;
  const month = today.getUTCMonth() + 1;
  if (month < m || month === m && today.getUTCDate() < d) age--;
  return age;
}
function displayName(legalName, style) {
  const parts = legalName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (style === "full" || parts.length === 1) return parts.join(" ");
  if (style === "first") return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase()}.`;
}
const namePattern = new RegExp("^(?=(?:.*\\p{L}){2})[\\p{L}\\p{M}' .-]+$", "u");
const legalNameSchema = z.string().trim().max(80).regex(namePattern, "Enter your real name as letters only — no handles or emoji.");
const identityInputSchema = z.object({
  /** Only used when the Google/GitHub account didn't share a name. Otherwise the provider's name wins. */
  legalName: legalNameSchema.optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth.").refine((v) => {
    const date2 = /* @__PURE__ */ new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(date2.getTime()) && date2.toISOString().slice(0, 10) === v;
  }, "That date of birth isn’t a real date.").refine((v) => {
    const age = ageOn(v);
    return age >= 0 && age <= 120;
  }, "Check your date of birth."),
  sex: z.enum(Object.keys(SEXES), { error: "Select your sex." }),
  attest: z.literal(true, { error: "Please confirm the details are true." })
});
const COOKIE = "rr_mfa";
const SESSION_HOURS = 12;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 10;
const PERIOD = 30;
function newSecret() {
  return new Secret({ size: 20 }).base32;
}
function totpFor(secret, label) {
  return new TOTP({
    issuer: "The Relationship Resume",
    label,
    algorithm: "SHA1",
    digits: 6,
    period: PERIOD,
    secret: Secret.fromBase32(secret)
  });
}
const hash = (token) => createHash("sha256").update(token).digest("hex");
async function getMfaRow(userId) {
  const [row] = await db.select().from(memberMfa).where(eq(memberMfa.userId, userId)).limit(1);
  return row;
}
async function checkCode(userId, code) {
  const row = await getMfaRow(userId);
  if (!row) throw new Error("Two-factor authentication is not set up.");
  if (row.lockedUntil && row.lockedUntil > /* @__PURE__ */ new Date()) {
    throw new Error("Too many incorrect codes. Please wait a few minutes and try again.");
  }
  const delta = totpFor(row.secret, userId).validate({ token: code.replace(/\s/g, ""), window: 1 });
  const step = Math.floor(Date.now() / 1e3 / PERIOD) + (delta ?? 0);
  if (delta === null || step <= row.lastStep) {
    const failures = row.failedAttempts + 1;
    await db.update(memberMfa).set({
      failedAttempts: failures >= MAX_FAILURES ? 0 : failures,
      lockedUntil: failures >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 6e4) : row.lockedUntil,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(memberMfa.userId, userId));
    throw new Error("That code didn't match. Check your authenticator app and try again.");
  }
  await db.update(memberMfa).set({ lastStep: step, failedAttempts: 0, lockedUntil: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(memberMfa.userId, userId));
}
async function startMfaSession(userId) {
  const token = randomBytes(32).toString("base64url");
  await db.insert(mfaSessions).values({
    tokenHash: hash(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 36e5)
  });
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600
  });
}
async function endMfaSessions(userId) {
  await db.delete(mfaSessions).where(eq(mfaSessions.userId, userId));
  deleteCookie(COOKIE, { path: "/" });
}
async function hasMfaSession(userId) {
  const token = getCookie(COOKIE);
  if (!token) return false;
  const [row] = await db.select({ userId: mfaSessions.userId }).from(mfaSessions).where(and(eq(mfaSessions.tokenHash, hash(token)), eq(mfaSessions.userId, userId), gt(mfaSessions.expiresAt, /* @__PURE__ */ new Date()))).limit(1);
  return !!row;
}
async function mfaState(userId) {
  const row = await getMfaRow(userId);
  const enabled = !!row?.enabled;
  return { enabled, verified: enabled ? await hasMfaSession(userId) : true };
}
async function endCurrentMfaSession() {
  const token = getCookie(COOKIE);
  if (token) await db.delete(mfaSessions).where(eq(mfaSessions.tokenHash, hash(token)));
  deleteCookie(COOKIE, { path: "/" });
}
export {
  IDENTITY_REQUIRED as I,
  MIN_AGE_SOCIAL_MATCH as M,
  NAME_STYLES as N,
  PROVIDER_LABELS as P,
  SOCIAL_SIGN_IN_REQUIRED as S,
  memberMfa as a,
  endCurrentMfaSession as b,
  checkCode as c,
  db as d,
  endMfaSessions as e,
  memberProfiles as f,
  getMfaRow as g,
  displayName as h,
  identityInputSchema as i,
  MIN_AGE_RESUME as j,
  socialProviderOf as k,
  ageOn as l,
  mfaState as m,
  newSecret as n,
  IDENTITY_POLICY_VERSION as o,
  legalNameSchema as p,
  SEXES as q,
  resumes as r,
  startMfaSession as s,
  totpFor as t
};
