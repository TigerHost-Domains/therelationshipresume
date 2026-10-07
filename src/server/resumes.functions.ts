import { createServerFn } from '@tanstack/react-start'
import type { User } from '@netlify/identity'
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { resumes } from '../../db/schema.js'
import { resumeInputSchema, type Resume } from '@/lib/resume'
import { identityMiddleware, requireAuthMiddleware, requireSignInMiddleware } from '@/middleware/identity'

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

function toPublic(row: Row): Resume {
  return {
    slug: row.slug,
    name: row.name,
    age: row.age,
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
    const [row] = await db.select().from(resumes).where(eq(resumes.slug, data.slug)).limit(1)
    return row ? toPublic(row) : null
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

async function findRow(slug: string) {
  const [row] = await db.select().from(resumes).where(eq(resumes.slug, slug)).limit(1)
  return row
}

export const createResume = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(resumeInputSchema)
  .handler(async ({ data, context }) => {
    const [row] = await db
      .insert(resumes)
      .values({ ...data, slug: slugify(data.name), editToken: tokenId(), ownerId: context.user.id })
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
    return {
      status: 'ok' as const,
      resume: toPublic(row),
      canManage,
      editors: canManage ? row.editorEmails : [],
    }
  })

export const updateResume = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ slug: slugInput, resume: resumeInputSchema }))
  .handler(async ({ data, context }) => {
    const row = await findRow(data.slug)
    if (!row || !access(row, context.user).canEdit) {
      throw new Error("You don't have permission to edit this resume.")
    }
    await db
      .update(resumes)
      .set({ ...data.resume, updatedAt: new Date() })
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
    if (!context.user) return { canEdit: false, unowned: false }
    const row = await findRow(data.slug)
    if (!row) return { canEdit: false, unowned: false }
    return { canEdit: access(row, context.user).canEdit, unowned: !row.ownerId }
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
