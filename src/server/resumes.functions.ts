import { createServerFn } from '@tanstack/react-start'
import type { User } from '@netlify/identity'
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { memberProfiles, resumes } from '../../db/schema.js'
import {
  displayName,
  IDENTITY_REQUIRED,
  MIN_AGE_RESUME,
  MIN_AGE_SOCIAL_MATCH,
  type NameStyle,
  type ResumeIdentity,
} from '@/lib/member'
import { resumeInputSchema, type Resume, type ResumeInput } from '@/lib/resume'
import { identityMiddleware, requireAuthMiddleware, requireSignInMiddleware } from '@/middleware/identity'
import { getProfile, identityOf, requireIdentity, type ProfileRow } from '@/server/members'
import { createSocialMatchInvite, SocialMatchError } from '@/server/social-match'

const slugId = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 6)
const tokenId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789', 32)

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return `${base || 'resume'}-${slugId()}`
}

/**
 * The public view of a resume. Name, age and sex come from the owner's identity on file whenever they've completed
 * the check; older resumes from unchecked owners keep their saved text and carry no verified mark.
 */
function toPublic(row: Row, owner?: ProfileRow | null): Resume {
  const identity = identityOf(owner)
  return {
    slug: row.slug,
    name: identity ? displayName(identity.legalName, row.nameStyle as NameStyle) : row.name,
    age: identity ? String(identity.age) : row.age,
    nameStyle: row.nameStyle as NameStyle,
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
    accent: row.accent as Resume['accent'],
    createdAt: row.createdAt.toISOString(),
  }
}

export const getResume = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string().min(1).max(60) }))
  .handler(async ({ data }) => {
    const [found] = await db
      .select({ row: resumes, owner: memberProfiles })
      .from(resumes)
      .leftJoin(memberProfiles, eq(memberProfiles.userId, resumes.ownerId))
      .where(eq(resumes.slug, data.slug))
      .limit(1)
    return found ? toPublic(found.row, found.owner) : null
  })

/** Identity roles (assigned in the Netlify dashboard) that may edit and manage any member's resume. */
const PROXY_ROLES = ['admin', 'proxy']

type Row = typeof resumes.$inferSelect

function access(row: Row, user: User) {
  const email = user.email?.toLowerCase()
  const isOwner = row.ownerId === user.id
  const isProxy = (user.roles ?? []).some((r) => PROXY_ROLES.includes(r))
  const isCoEditor = !!email && row.editorEmails.includes(email)
  return { canEdit: isOwner || isProxy || isCoEditor, canManage: isOwner || isProxy }
}

/** What the browser sent, minus anything identity-related: those fields are always taken from the record on file. */
function contentOf(input: ResumeInput, identity: ResumeIdentity | null) {
  const content: Omit<ResumeInput, 'name' | 'age'> & Partial<Pick<ResumeInput, 'name' | 'age'>> = { ...input }
  delete content.name
  delete content.age
  return identity
    ? { ...content, name: displayName(identity.legalName, input.nameStyle), age: String(identity.age) }
    : content
}

async function ownerIdentity(row: Row) {
  return row.ownerId ? identityOf(await getProfile(row.ownerId)) : null
}

async function findRow(slug: string) {
  const [row] = await db.select().from(resumes).where(eq(resumes.slug, slug)).limit(1)
  return row
}

export const createResume = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(resumeInputSchema)
  .handler(async ({ data, context }) => {
    const identity = await requireIdentity(context.user, MIN_AGE_RESUME)
    const [row] = await db
      .insert(resumes)
      .values({
        ...contentOf(data, null),
        name: displayName(identity.legalName, data.nameStyle),
        age: String(identity.age),
        slug: slugify(identity.legalName.split(/\s+/)[0] ?? ''),
        editToken: tokenId(),
        ownerId: context.user.id,
      })
      .returning({ slug: resumes.slug })
    return { slug: row.slug }
  })

const slugInput = z.string().min(1).max(60)

/**
 * Loads a resume for the editor. Owners, co-editors and proxy roles get in; an unowned (legacy) resume is claimed
 * by the signed-in member when they present its private edit key.
 */
export const openResumeForEditing = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ slug: slugInput, editToken: z.string().max(64).optional() }))
  .handler(async ({ data, context }) => {
    await requireIdentity(context.user, MIN_AGE_RESUME)
    let row = await findRow(data.slug)
    if (!row) return { status: 'missing' as const }

    if (!row.ownerId && data.editToken && row.editToken === data.editToken) {
      const [claimed] = await db
        .update(resumes)
        .set({ ownerId: context.user.id, updatedAt: new Date() })
        .where(and(eq(resumes.id, row.id), isNull(resumes.ownerId)))
        .returning()
      if (claimed) row = claimed
    }

    const { canEdit, canManage } = access(row, context.user)
    if (!canEdit) return { status: 'denied' as const }
    const owner = row.ownerId ? await getProfile(row.ownerId) : null
    return {
      status: 'ok' as const,
      resume: toPublic(row, owner),
      // Whose name, age and sex the resume carries. Null while the owner hasn't completed the identity check.
      identity: identityOf(owner),
      canManage,
      editors: canManage ? row.editorEmails : [],
    }
  })

export const updateResume = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ slug: slugInput, resume: resumeInputSchema }))
  .handler(async ({ data, context }) => {
    await requireIdentity(context.user, MIN_AGE_RESUME)
    const row = await findRow(data.slug)
    if (!row || !access(row, context.user).canEdit) {
      throw new Error("You don't have permission to edit this resume.")
    }
    await db
      .update(resumes)
      .set({ ...contentOf(data.resume, await ownerIdentity(row)), updatedAt: new Date() })
      .where(eq(resumes.id, row.id))
    return { slug: row.slug }
  })

/** Replaces the co-editor list. Only the owner or a proxy role may do this. */
export const updateEditors = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ slug: slugInput, emails: z.array(z.email().max(254)).max(20) }))
  .handler(async ({ data, context }) => {
    const row = await findRow(data.slug)
    if (!row || !access(row, context.user).canManage) {
      throw new Error("Only the resume's owner can change who may edit it.")
    }
    const emails = [...new Set(data.emails.map((e) => e.trim().toLowerCase()))]
    await db.update(resumes).set({ editorEmails: emails, updatedAt: new Date() }).where(eq(resumes.id, row.id))
    return { editors: emails }
  })

/** Whether the current visitor may edit, so the public page can offer an Edit button. Never throws. */
export const getEditAccess = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .inputValidator(z.object({ slug: slugInput }))
  .handler(async ({ data, context }) => {
    const none = { canEdit: false, unowned: false, isOwner: false, canSendToSocialMatch: false }
    if (!context.user) return none
    const row = await findRow(data.slug)
    if (!row) return none
    const isOwner = row.ownerId === context.user.id
    const identity = isOwner ? identityOf(await getProfile(context.user.id)) : null
    return {
      canEdit: access(row, context.user).canEdit,
      unowned: !row.ownerId,
      isOwner,
      // The Social Match Game profile has to be the person on the resume, so only its owner can send it, from 21.
      canSendToSocialMatch: !!identity && identity.age >= MIN_AGE_SOCIAL_MATCH,
    }
  })

/**
 * The signed-in member's resumes for their account page: ones they own plus ones they've been invited to co-edit.
 * Links are public anyway, so this asks for sign-in but not a two-factor code.
 */
export const listMyResumes = createServerFn({ method: 'GET' })
  .middleware([requireSignInMiddleware])
  .handler(async ({ context }) => {
    const email = context.user.email?.toLowerCase()
    const rows = await db
      .select({
        slug: resumes.slug,
        name: resumes.name,
        headline: resumes.headline,
        accent: resumes.accent,
        ownerId: resumes.ownerId,
        updatedAt: resumes.updatedAt,
      })
      .from(resumes)
      .where(
        email
          ? or(eq(resumes.ownerId, context.user.id), sql`${resumes.editorEmails} @> ${JSON.stringify([email])}::jsonb`)
          : eq(resumes.ownerId, context.user.id),
      )
      .orderBy(desc(resumes.updatedAt))
      .limit(100)
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      headline: r.headline,
      accent: r.accent as Resume['accent'],
      role: r.ownerId === context.user.id ? ('owner' as const) : ('co-editor' as const),
      updatedAt: r.updatedAt.toISOString(),
    }))
  })

/**
 * Starts the Social Match Game handshake for a published resume: asks their API for a one-time invite and returns its
 * join link. Only the resume's owner may send it, from age 21, and the invite carries their verified identity so The
 * Social Match Game can check it against the Google/GitHub account that claims it.
 */
export const sendToSocialMatch = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ slug: slugInput }))
  .handler(async ({ data, context }) => {
    const row = await findRow(data.slug)
    if (!row || row.ownerId !== context.user.id) {
      return { ok: false as const, error: 'Only the person on this resume can send it to The Social Match Game.' }
    }
    const profile = await getProfile(context.user.id)
    const identity = identityOf(profile)
    if (!identity || !profile) throw new Error(IDENTITY_REQUIRED)
    if (identity.age < MIN_AGE_SOCIAL_MATCH) {
      return {
        ok: false as const,
        error: `The Social Match Game is open to members ${MIN_AGE_SOCIAL_MATCH} and over.`,
      }
    }
    try {
      const invite = await createSocialMatchInvite(row.slug, {
        provider: identity.provider,
        email: profile.providerEmail ?? context.user.email?.toLowerCase() ?? null,
        name: identity.legalName,
        age: identity.age,
        over21: true,
        sex: identity.sex,
        attestedAt: profile.attestedAt?.toISOString() ?? null,
        policyVersion: profile.policyVersion,
      })
      return { ok: true as const, ...invite }
    } catch (err) {
      if (err instanceof SocialMatchError) return { ok: false as const, error: err.message }
      throw err
    }
  })
