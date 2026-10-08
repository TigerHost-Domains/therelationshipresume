// Server-only client for The Social Match Game's Relationship Resume integration. We ask their API for a one-time
// invite for a resume, then send the member to the invite's join page; they sign in there with Google or GitHub,
// pass age verification, and The Social Match Game attaches the resume to their profile itself.
import type { Sex, SocialProvider } from '@/lib/member'
import { SOCIAL_MATCH_API, SOCIAL_MATCH_SITE } from '@/lib/social-match'

export class SocialMatchError extends Error {}

export type SocialMatchInvite = { joinUrl: string; expiresAt?: string }

/**
 * The verified identity behind the resume, sent with the invite so The Social Match Game can build the profile from
 * it and refuse the claim unless the Google/GitHub account signing in there has the same provider and email. Their
 * API requires the sworn date of birth (they run their own age check from it), not just the age.
 */
export type SocialMatchMember = {
  provider: SocialProvider
  email: string | null
  name: string
  dateOfBirth: string
  age: number
  over21: true
  sex: Sex
  attestedAt: string | null
  policyVersion: string | null
}

/**
 * Creates a Social Match Game invite for this slug and its verified owner, authenticated with the shared
 * `RESUME_INTEGRATION_SECRET`.
 * Throws `SocialMatchError` with a member-facing message.
 */
export async function createSocialMatchInvite(slug: string, member: SocialMatchMember): Promise<SocialMatchInvite> {
  const secret = process.env.RESUME_INTEGRATION_SECRET
  if (!secret) {
    console.error('RESUME_INTEGRATION_SECRET is not set; Social Match invites are disabled.')
    throw new SocialMatchError("The Social Match Game handshake isn't set up yet. Please try again later.")
  }

  let res: Response
  try {
    res = await fetch(`${SOCIAL_MATCH_API}/api/integrations/relationship-resume/invites`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-integration-secret': secret },
      // They validate name, dateOfBirth and sex at the top level of the body (a 400 "Name, date of birth and sex are
      // required." otherwise); `member` carries the full record for the provider/email match.
      body: JSON.stringify({
        slug,
        name: member.name,
        dateOfBirth: member.dateOfBirth,
        sex: member.sex,
        email: member.email,
        provider: member.provider,
        member,
      }),
      // Their backend naps when idle and can take most of a minute to wake; the dialog nudges it on open.
      signal: AbortSignal.timeout(45_000),
    })
  } catch {
    throw new SocialMatchError('The Social Match Game is still waking up. Give it a few seconds and try again.')
  }

  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (res.status === 401 || res.status === 403) {
    console.error(`Social Match Game rejected the integration secret (${res.status}).`)
    throw new SocialMatchError("The Social Match Game didn't accept our handshake. Please try again later.")
  }
  if (!res.ok) {
    throw new SocialMatchError(
      typeof body?.message === 'string' ? body.message : "The Social Match Game couldn't take your resume just now.",
    )
  }

  const invite = typeof body?.invite === 'string' ? body.invite : undefined
  const joinUrl =
    typeof body?.joinUrl === 'string'
      ? body.joinUrl
      : invite
        ? `${SOCIAL_MATCH_SITE}/join?invite=${encodeURIComponent(invite)}`
        : undefined
  // Only ever send members to The Social Match Game itself.
  if (!joinUrl || new URL(joinUrl).origin !== SOCIAL_MATCH_SITE) {
    throw new SocialMatchError("The Social Match Game couldn't take your resume just now.")
  }
  return { joinUrl, expiresAt: typeof body?.expiresAt === 'string' ? body.expiresAt : undefined }
}
