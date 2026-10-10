import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { c as createServerFn } from "../server.js";
import { k as socialProviderOf, l as ageOn, M as MIN_AGE_SOCIAL_MATCH, j as MIN_AGE_RESUME, i as identityInputSchema, d as db, f as memberProfiles, o as IDENTITY_POLICY_VERSION, p as legalNameSchema } from "./mfa-DWEh_Kis.js";
import { r as requireSignInMiddleware, a as requireAuthMiddleware } from "./identity-DwbvUTDg.js";
import { g as getProfile, s as statusOf } from "./members-DV04sj37.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "zod";
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "@netlify/identity";
function providerName(name) {
  const parsed = legalNameSchema.safeParse(name ?? "");
  return parsed.success ? parsed.data.replace(/\s+/g, " ") : null;
}
const getMyIdentity_createServerFn_handler = createServerRpc({
  id: "9c2f77572ad60d31a23e34a959b34a6873d7baf274743fc07c5588fb83d5f1f8",
  name: "getMyIdentity",
  filename: "src/server/members.functions.ts"
}, (opts) => getMyIdentity.__executeServer(opts));
const getMyIdentity = createServerFn({
  method: "GET"
}).middleware([requireSignInMiddleware]).handler(getMyIdentity_createServerFn_handler, async ({
  context
}) => {
  const {
    user
  } = context;
  const row = await getProfile(user.id);
  const status = statusOf(row);
  const provider = row?.provider ?? socialProviderOf(user);
  const age = status === "verified" && row?.birthDate ? ageOn(row.birthDate) : null;
  return {
    status,
    provider,
    email: row?.providerEmail ?? user.email ?? null,
    // Before the check, this is what Google/GitHub sent; afterwards, what's on file.
    legalName: row?.legalName ?? providerName(user.name),
    nameSource: row?.nameSource ?? (providerName(user.name) ? "provider" : "attested"),
    birthDate: status === "verified" ? row?.birthDate ?? null : null,
    sex: status === "verified" ? row?.sex ?? null : null,
    age,
    attestedAt: row?.attestedAt?.toISOString() ?? null,
    canPublish: age !== null && age >= MIN_AGE_RESUME,
    canSendToSocialMatch: age !== null && age >= MIN_AGE_SOCIAL_MATCH
  };
});
const submitIdentity_createServerFn_handler = createServerRpc({
  id: "d30c38c4a115b52d82d85894ad1b82b63262bb9f19bbe363fad265c0a97f7635",
  name: "submitIdentity",
  filename: "src/server/members.functions.ts"
}, (opts) => submitIdentity.__executeServer(opts));
const submitIdentity = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(identityInputSchema).handler(submitIdentity_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    user
  } = context;
  const existing = await getProfile(user.id);
  if (existing) {
    throw new Error(statusOf(existing) === "refused" ? "Relationship Resumes are for members 18 and over." : "Your identity is already on file. Contact us if something needs correcting.");
  }
  const provider = socialProviderOf(user);
  const now = /* @__PURE__ */ new Date();
  if (ageOn(data.birthDate, now) < MIN_AGE_RESUME) {
    await db.insert(memberProfiles).values({
      userId: user.id,
      provider,
      refusedAt: now
    }).onConflictDoNothing();
    return {
      status: "refused"
    };
  }
  const fromProvider = providerName(user.name);
  const legalName = fromProvider ?? data.legalName;
  if (!legalName) throw new Error("Enter your full legal name.");
  const inserted = await db.insert(memberProfiles).values({
    userId: user.id,
    provider,
    providerEmail: user.email?.toLowerCase() ?? null,
    legalName,
    nameSource: fromProvider ? "provider" : "attested",
    birthDate: data.birthDate,
    sex: data.sex,
    policyVersion: IDENTITY_POLICY_VERSION,
    attestedAt: now
  }).onConflictDoNothing().returning({
    userId: memberProfiles.userId
  });
  if (!inserted.length) throw new Error("Your identity is already on file.");
  return {
    status: "verified"
  };
});
export {
  getMyIdentity_createServerFn_handler,
  submitIdentity_createServerFn_handler
};
