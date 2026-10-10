import { z } from 'zod'

/**
 * Member identity rules, shared by client and server. Sign-in is Google or GitHub only (the same doors as The Social
 * Match Game); a member's name comes from that account, and their date of birth and sex are sworn once and then
 * locked. Resumes display what's on file, never what's typed into the builder.
 */

export const SOCIAL_PROVIDERS = ['google', 'github'] as const
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]

export const PROVIDER_LABELS: Record<SocialProvider, string> = { google: 'Google', github: 'GitHub' }

/** Minimum age to publish or edit a resume. */
export const MIN_AGE_RESUME = 18
/** Minimum age to send a resume to The Social Match Game. */
export const MIN_AGE_SOCIAL_MATCH = 21

/** Bumped whenever the truthful-identity attestation wording changes, so we know which version each member agreed to. */
export const IDENTITY_POLICY_VERSION = '2026-10-08'

/** Error message server functions throw when the member hasn't completed the identity check yet. */
export const IDENTITY_REQUIRED = 'Identity check required.'
export const SEXES = { female: 'Female', male: 'Male', intersex: 'Intersex' } as const
export type Sex = keyof typeof SEXES

export const NAME_STYLES = ['first-initial', 'first', 'full'] as const
export type NameStyle = (typeof NAME_STYLES)[number]

/** Whole years between an ISO `YYYY-MM-DD` birth date and `today` (UTC). */
export function ageOn(birthDate: string, today = new Date()): number {
  const [y, m, d] = birthDate.split('-').map(Number)
  let age = today.getUTCFullYear() - y
  const month = today.getUTCMonth() + 1
  if (month < m || (month === m && today.getUTCDate() < d)) age--
  return age
}

/** The resume headline name, always derived from the name on file. */
export function displayName(legalName: string, style: NameStyle): string {
  const parts = legalName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (style === 'full' || parts.length === 1) return parts.join(' ')
  if (style === 'first') return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase()}.`
}

/** Letters (any script), spaces, hyphens, apostrophes and periods. At least two letters. */
const namePattern = /^(?=(?:.*\p{L}){2})[\p{L}\p{M}' .-]+$/u

export const legalNameSchema = z
  .string()
  .trim()
  .max(80)
  .regex(namePattern, 'Enter your real name as letters only — no handles or emoji.')

export const identityInputSchema = z.object({
  /** Only used when the Google/GitHub account didn't share a name. Otherwise the provider's name wins. */
  legalName: legalNameSchema.optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter your date of birth.')
    .refine((v) => {
      const date = new Date(`${v}T00:00:00Z`)
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === v
    }, 'That date of birth isn’t a real date.')
    .refine((v) => {
      const age = ageOn(v)
      return age >= 0 && age <= 120
    }, 'Check your date of birth.'),
  sex: z.enum(Object.keys(SEXES) as [Sex, ...Sex[]], { error: 'Select your sex.' }),
  attest: z.literal(true, { error: 'Please confirm the details are true.' }),
})
export type IdentityInput = z.infer<typeof identityInputSchema>

/** What the builder and resume pages need to know about the person a resume belongs to. */
export type ResumeIdentity = {
  legalName: string
  age: number
  sex: Sex
  provider: SocialProvider
}
