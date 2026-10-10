import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { memberProfiles } from '../../db/schema.js'
import {
  ageOn,
  IDENTITY_POLICY_VERSION,
  identityInputSchema,
  legalNameSchema,
  MIN_AGE_RESUME,
  MIN_AGE_SOCIAL_MATCH,
  type Sex,
  type SocialProvider,
} from '@/lib/member'
import { requireAuthMiddleware, requireSignInMiddleware } from '@/middleware/identity'
import { getProfile, statusOf } from '@/server/members'

/** The name the member's Google/GitHub account shared, if it reads as a real name. */
function providerName(name: string | undefined) {
  const parsed = legalNameSchema.safeParse(name ?? '')
  return parsed.success ? parsed.data.replace(/\s+/g, ' ') : null
}

/** The member's own identity record, for the identity check, builder and account pages. */
export const getMyIdentity = createServerFn({ method: 'GET' })
  .middleware([requireSignInMiddleware])
  .handler(async ({ context }) => {
    const { user } = context
    const row = await getProfile(user.id)
    const status = statusOf(row)
    const provider = (row?.provider as SocialProvider | undefined) ?? user.provider
    const age = status === 'verified' && row?.birthDate ? ageOn(row.birthDate) : null
    return {
      status,
      provider,
      email: row?.providerEmail ?? user.email ?? null,
      // Before the check, this is what Google/GitHub sent; afterwards, what's on file.
      legalName: row?.legalName ?? providerName(user.name ?? undefined),
      nameSource: (row?.nameSource ?? (providerName(user.name ?? undefined) ? 'provider' : 'attested')) as 'provider' | 'attested',
      birthDate: status === 'verified' ? (row?.birthDate ?? null) : null,
      sex: status === 'verified' ? ((row?.sex as Sex | null) ?? null) : null,
      age,
      attestedAt: row?.attestedAt?.toISOString() ?? null,
      canPublish: age !== null && age >= MIN_AGE_RESUME,
      canSendToSocialMatch: age !== null && age >= MIN_AGE_SOCIAL_MATCH,
    }
  })

/**
 * Records the member's sworn identity, once. The name comes from Google/GitHub whenever it shared one; date of birth
 * and sex are attested. Under-18s are turned away and only the refusal is kept — no birth date, name or sex.
 */
export const submitIdentity = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(identityInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    const existing = await getProfile(user.id)
    if (existing) {
      throw new Error(
        statusOf(existing) === 'refused'
          ? 'Relationship Resumes are for members 18 and over.'
          : 'Your identity is already on file. Contact us if something needs correcting.',
      )
    }

    const provider = user.provider
    const now = new Date()
    if (ageOn(data.birthDate, now) < MIN_AGE_RESUME) {
      await db.insert(memberProfiles).values({ userId: user.id, provider, refusedAt: now }).onConflictDoNothing()
      return { status: 'refused' as const }
    }

    const fromProvider = providerName(user.name ?? undefined)
    const legalName = fromProvider ?? data.legalName
    if (!legalName) throw new Error('Enter your full legal name.')

    const inserted = await db
      .insert(memberProfiles)
      .values({
        userId: user.id,
        provider,
        providerEmail: user.email?.toLowerCase() ?? null,
        legalName,
        nameSource: fromProvider ? 'provider' : 'attested',
        birthDate: data.birthDate,
        sex: data.sex,
        policyVersion: IDENTITY_POLICY_VERSION,
        attestedAt: now,
      })
      .onConflictDoNothing()
      .returning({ userId: memberProfiles.userId })
    if (!inserted.length) throw new Error('Your identity is already on file.')
    return { status: 'verified' as const }
  })
