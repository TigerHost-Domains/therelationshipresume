// Server-only helpers for the identity on file (member_profiles): lookups, age gates, and what a resume displays.
import type { User } from '@netlify/identity'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { memberProfiles } from '../../db/schema.js'
import { ageOn, IDENTITY_REQUIRED, type ResumeIdentity, type Sex, type SocialProvider } from '@/lib/member'

export type ProfileRow = typeof memberProfiles.$inferSelect

export type IdentityStatus = 'missing' | 'verified' | 'refused'

export async function getProfile(userId: string): Promise<ProfileRow | undefined> {
  const [row] = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1)
  return row
}

export function statusOf(row: ProfileRow | undefined | null): IdentityStatus {
  if (!row) return 'missing'
  if (row.refusedAt) return 'refused'
  return row.legalName && row.birthDate && row.sex ? 'verified' : 'missing'
}

/** The resume-facing identity for a verified profile, or null. */
export function identityOf(row: ProfileRow | undefined | null): ResumeIdentity | null {
  if (statusOf(row) !== 'verified' || !row) return null
  return {
    legalName: row.legalName!,
    age: ageOn(row.birthDate!),
    sex: row.sex as Sex,
    provider: row.provider as SocialProvider,
  }
}

/**
 * The signed-in member's verified identity, provided they're at least `minAge`. Throws `IDENTITY_REQUIRED` when the
 * check hasn't been done, and a member-facing message when they're too young.
 */
export async function requireIdentity(user: User, minAge: number): Promise<ResumeIdentity> {
  const row = await getProfile(user.id)
  const status = statusOf(row)
  if (status === 'refused') throw new Error('Relationship Resumes are for members 18 and over.')
  const identity = identityOf(row)
  if (!identity) throw new Error(IDENTITY_REQUIRED)
  if (identity.age < minAge) throw new Error(`This is open to members ${minAge} and over.`)
  return identity
}
