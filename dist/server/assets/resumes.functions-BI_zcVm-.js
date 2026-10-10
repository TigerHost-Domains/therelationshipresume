import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { c as createServerFn } from "../server.js";
import { eq, and, isNull, or, sql, desc } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { d as db, f as memberProfiles, r as resumes, h as displayName, M as MIN_AGE_SOCIAL_MATCH, I as IDENTITY_REQUIRED, j as MIN_AGE_RESUME } from "./mfa-DWEh_Kis.js";
import { r as resumeInputSchema } from "./resume-CLkl9H33.js";
import { a as requireAuthMiddleware, i as identityMiddleware, r as requireSignInMiddleware } from "./identity-DwbvUTDg.js";
import { r as requireIdentity, g as getProfile, i as identityOf } from "./members-DV04sj37.js";
import { S as SOCIAL_MATCH_API, a as SOCIAL_MATCH_SITE } from "./social-match-C-j9rk_j.js";
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
import "node:crypto";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "@netlify/identity";
class SocialMatchError extends Error {
}
async function createSocialMatchInvite(slug, member) {
  const secret = process.env.RESUME_INTEGRATION_SECRET;
  if (!secret) {
    console.error("RESUME_INTEGRATION_SECRET is not set; Social Match invites are disabled.");
    throw new SocialMatchError("The Social Match Game handshake isn't set up yet. Please try again later.");
  }
  let res;
  try {
    res = await fetch(`${SOCIAL_MATCH_API}/api/integrations/relationship-resume/invites`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-integration-secret": secret },
      // They validate name, dateOfBirth and sex at the top level of the body (a 400 "Name, date of birth and sex are
      // required." otherwise); `member` carries the full record for the provider/email match.
      body: JSON.stringify({
        slug,
        name: member.name,
        dateOfBirth: member.dateOfBirth,
        sex: member.sex,
        email: member.email,
        provider: member.provider,
        member
      }),
      // Their backend naps when idle and can take most of a minute to wake; the dialog nudges it on open.
      signal: AbortSignal.timeout(45e3)
    });
  } catch {
    throw new SocialMatchError("The Social Match Game is still waking up. Give it a few seconds and try again.");
  }
  const body = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403) {
    console.error(`Social Match Game rejected the integration secret (${res.status}).`);
    throw new SocialMatchError("The Social Match Game didn't accept our handshake. Please try again later.");
  }
  if (!res.ok) {
    throw new SocialMatchError(
      typeof body?.message === "string" ? body.message : "The Social Match Game couldn't take your resume just now."
    );
  }
  const invite = typeof body?.invite === "string" ? body.invite : void 0;
  const joinUrl = typeof body?.joinUrl === "string" ? body.joinUrl : invite ? `${SOCIAL_MATCH_SITE}/join?invite=${encodeURIComponent(invite)}` : void 0;
  if (!joinUrl || new URL(joinUrl).origin !== SOCIAL_MATCH_SITE) {
    throw new SocialMatchError("The Social Match Game couldn't take your resume just now.");
  }
  return { joinUrl, expiresAt: typeof body?.expiresAt === "string" ? body.expiresAt : void 0 };
}
const slugId = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 6);
const tokenId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789", 32);
function slugify(name) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
  return `${base || "resume"}-${slugId()}`;
}
function toPublic(row, owner) {
  const identity = identityOf(owner);
  return {
    slug: row.slug,
    name: identity ? displayName(identity.legalName, row.nameStyle) : row.name,
    age: identity ? String(identity.age) : row.age,
    nameStyle: row.nameStyle,
    sex: identity?.sex ?? null,
    verifiedVia: identity?.provider ?? null,
    location: row.location,
    headline: row.headline,
    objective: row.objective,
    lookingFor: row.lookingFor,
    qualities: row.qualities,
    likes: row.likes,
    dislikes: row.dislikes,
    dealbreakers: row.dealbreakers,
    loveLanguages: row.loveLanguages,
    experience: row.experience,
    references: row.references,
    contact: row.contact,
    accent: row.accent,
    createdAt: row.createdAt.toISOString()
  };
}
const getResume_createServerFn_handler = createServerRpc({
  id: "54a68125e5f762cbe731cd6992c5e8d8e61d6e25a492390513ed256f9f19a42f",
  name: "getResume",
  filename: "src/server/resumes.functions.ts"
}, (opts) => getResume.__executeServer(opts));
const getResume = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  slug: z.string().min(1).max(60)
})).handler(getResume_createServerFn_handler, async ({
  data
}) => {
  const [found] = await db.select({
    row: resumes,
    owner: memberProfiles
  }).from(resumes).leftJoin(memberProfiles, eq(memberProfiles.userId, resumes.ownerId)).where(eq(resumes.slug, data.slug)).limit(1);
  return found ? toPublic(found.row, found.owner) : null;
});
const PROXY_ROLES = ["admin", "proxy"];
function access(row, user) {
  const email = user.email?.toLowerCase();
  const isOwner = row.ownerId === user.id;
  const isProxy = (user.roles ?? []).some((r) => PROXY_ROLES.includes(r));
  const isCoEditor = !!email && row.editorEmails.includes(email);
  return {
    canEdit: isOwner || isProxy || isCoEditor,
    canManage: isOwner || isProxy
  };
}
function contentOf(input, identity) {
  const content = {
    ...input
  };
  delete content.name;
  delete content.age;
  return identity ? {
    ...content,
    name: displayName(identity.legalName, input.nameStyle),
    age: String(identity.age)
  } : content;
}
async function ownerIdentity(row) {
  return row.ownerId ? identityOf(await getProfile(row.ownerId)) : null;
}
async function findRow(slug) {
  const [row] = await db.select().from(resumes).where(eq(resumes.slug, slug)).limit(1);
  return row;
}
const createResume_createServerFn_handler = createServerRpc({
  id: "8b916d9325d5aa8fb91d66dafb2383ef3abb599e4de818e9c51c521f6817c0f7",
  name: "createResume",
  filename: "src/server/resumes.functions.ts"
}, (opts) => createResume.__executeServer(opts));
const createResume = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(resumeInputSchema).handler(createResume_createServerFn_handler, async ({
  data,
  context
}) => {
  const identity = await requireIdentity(context.user, MIN_AGE_RESUME);
  const [row] = await db.insert(resumes).values({
    ...contentOf(data, null),
    name: displayName(identity.legalName, data.nameStyle),
    age: String(identity.age),
    slug: slugify(identity.legalName.split(/\s+/)[0] ?? ""),
    editToken: tokenId(),
    ownerId: context.user.id
  }).returning({
    slug: resumes.slug
  });
  return {
    slug: row.slug
  };
});
const slugInput = z.string().min(1).max(60);
const openResumeForEditing_createServerFn_handler = createServerRpc({
  id: "fad0a2752dff549dc95771c1f7c040a35ba4a9c2b8aa57c285db4f6a91919eda",
  name: "openResumeForEditing",
  filename: "src/server/resumes.functions.ts"
}, (opts) => openResumeForEditing.__executeServer(opts));
const openResumeForEditing = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput,
  editToken: z.string().max(64).optional()
})).handler(openResumeForEditing_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireIdentity(context.user, MIN_AGE_RESUME);
  let row = await findRow(data.slug);
  if (!row) return {
    status: "missing"
  };
  if (!row.ownerId && data.editToken && row.editToken === data.editToken) {
    const [claimed] = await db.update(resumes).set({
      ownerId: context.user.id,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and(eq(resumes.id, row.id), isNull(resumes.ownerId))).returning();
    if (claimed) row = claimed;
  }
  const {
    canEdit,
    canManage
  } = access(row, context.user);
  if (!canEdit) return {
    status: "denied"
  };
  const owner = row.ownerId ? await getProfile(row.ownerId) : null;
  return {
    status: "ok",
    resume: toPublic(row, owner),
    // Whose name, age and sex the resume carries. Null while the owner hasn't completed the identity check.
    identity: identityOf(owner),
    canManage,
    editors: canManage ? row.editorEmails : []
  };
});
const updateResume_createServerFn_handler = createServerRpc({
  id: "26612a0a5d42a315747d45b4781fd2d6066e7ba0f6a13451e784604f3c26cf50",
  name: "updateResume",
  filename: "src/server/resumes.functions.ts"
}, (opts) => updateResume.__executeServer(opts));
const updateResume = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput,
  resume: resumeInputSchema
})).handler(updateResume_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireIdentity(context.user, MIN_AGE_RESUME);
  const row = await findRow(data.slug);
  if (!row || !access(row, context.user).canEdit) {
    throw new Error("You don't have permission to edit this resume.");
  }
  await db.update(resumes).set({
    ...contentOf(data.resume, await ownerIdentity(row)),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(resumes.id, row.id));
  return {
    slug: row.slug
  };
});
const updateEditors_createServerFn_handler = createServerRpc({
  id: "52969441072aa7fff7648f39f784918e2cb2ae38214fa152894f156c6d1fcc14",
  name: "updateEditors",
  filename: "src/server/resumes.functions.ts"
}, (opts) => updateEditors.__executeServer(opts));
const updateEditors = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput,
  emails: z.array(z.email().max(254)).max(20)
})).handler(updateEditors_createServerFn_handler, async ({
  data,
  context
}) => {
  const row = await findRow(data.slug);
  if (!row || !access(row, context.user).canManage) {
    throw new Error("Only the resume's owner can change who may edit it.");
  }
  const emails = [...new Set(data.emails.map((e) => e.trim().toLowerCase()))];
  await db.update(resumes).set({
    editorEmails: emails,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(resumes.id, row.id));
  return {
    editors: emails
  };
});
const getEditAccess_createServerFn_handler = createServerRpc({
  id: "2a1b86c197518a91f412a30013ec467a63184e4e600d0f0a57e6ae40084241c2",
  name: "getEditAccess",
  filename: "src/server/resumes.functions.ts"
}, (opts) => getEditAccess.__executeServer(opts));
const getEditAccess = createServerFn({
  method: "GET"
}).middleware([identityMiddleware]).inputValidator(z.object({
  slug: slugInput
})).handler(getEditAccess_createServerFn_handler, async ({
  data,
  context
}) => {
  const none = {
    canEdit: false,
    unowned: false,
    isOwner: false,
    canSendToSocialMatch: false
  };
  if (!context.user) return none;
  const row = await findRow(data.slug);
  if (!row) return none;
  const isOwner = row.ownerId === context.user.id;
  const identity = isOwner ? identityOf(await getProfile(context.user.id)) : null;
  return {
    canEdit: access(row, context.user).canEdit,
    unowned: !row.ownerId,
    isOwner,
    // The Social Match Game profile has to be the person on the resume, so only its owner can send it, from 21.
    canSendToSocialMatch: !!identity && identity.age >= MIN_AGE_SOCIAL_MATCH
  };
});
const listMyResumes_createServerFn_handler = createServerRpc({
  id: "c4d680e62f771c38faac16ace2293d0420c17e86ab417bfa47844203ef3f9e19",
  name: "listMyResumes",
  filename: "src/server/resumes.functions.ts"
}, (opts) => listMyResumes.__executeServer(opts));
const listMyResumes = createServerFn({
  method: "GET"
}).middleware([requireSignInMiddleware]).handler(listMyResumes_createServerFn_handler, async ({
  context
}) => {
  const email = context.user.email?.toLowerCase();
  const rows = await db.select({
    slug: resumes.slug,
    name: resumes.name,
    headline: resumes.headline,
    accent: resumes.accent,
    ownerId: resumes.ownerId,
    updatedAt: resumes.updatedAt
  }).from(resumes).where(email ? or(eq(resumes.ownerId, context.user.id), sql`${resumes.editorEmails} @> ${JSON.stringify([email])}::jsonb`) : eq(resumes.ownerId, context.user.id)).orderBy(desc(resumes.updatedAt)).limit(100);
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    headline: r.headline,
    accent: r.accent,
    role: r.ownerId === context.user.id ? "owner" : "co-editor",
    updatedAt: r.updatedAt.toISOString()
  }));
});
const sendToSocialMatch_createServerFn_handler = createServerRpc({
  id: "5d52de2e542e85c8322a26c7a89c80d32b9eb229e40e5cd0d02e91835759eda3",
  name: "sendToSocialMatch",
  filename: "src/server/resumes.functions.ts"
}, (opts) => sendToSocialMatch.__executeServer(opts));
const sendToSocialMatch = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput
})).handler(sendToSocialMatch_createServerFn_handler, async ({
  data,
  context
}) => {
  const row = await findRow(data.slug);
  if (!row || row.ownerId !== context.user.id) {
    return {
      ok: false,
      error: "Only the person on this resume can send it to The Social Match Game."
    };
  }
  const profile = await getProfile(context.user.id);
  const identity = identityOf(profile);
  if (!identity || !profile?.birthDate) throw new Error(IDENTITY_REQUIRED);
  if (identity.age < MIN_AGE_SOCIAL_MATCH) {
    return {
      ok: false,
      error: `The Social Match Game is open to members ${MIN_AGE_SOCIAL_MATCH} and over.`
    };
  }
  try {
    const invite = await createSocialMatchInvite(row.slug, {
      provider: identity.provider,
      email: profile.providerEmail ?? context.user.email?.toLowerCase() ?? null,
      name: identity.legalName,
      dateOfBirth: profile.birthDate,
      age: identity.age,
      over21: true,
      sex: identity.sex,
      attestedAt: profile.attestedAt?.toISOString() ?? null,
      policyVersion: profile.policyVersion
    });
    return {
      ok: true,
      ...invite
    };
  } catch (err) {
    if (err instanceof SocialMatchError) return {
      ok: false,
      error: err.message
    };
    throw err;
  }
});
export {
  createResume_createServerFn_handler,
  getEditAccess_createServerFn_handler,
  getResume_createServerFn_handler,
  listMyResumes_createServerFn_handler,
  openResumeForEditing_createServerFn_handler,
  sendToSocialMatch_createServerFn_handler,
  updateEditors_createServerFn_handler,
  updateResume_createServerFn_handler
};
