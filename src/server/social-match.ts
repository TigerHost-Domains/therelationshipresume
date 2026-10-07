// Server-only client for The Social Match Game's API. Its CORS policy only admits its own site, so the browser
// can't call it from here; we do it server-to-server instead.
import { SOCIAL_MATCH_API, SOCIAL_MATCH_LINK_LABEL, SOCIAL_MATCH_SITE } from '@/lib/social-match'

/** The companion site builds Relationship Resume links on this host, so the pushed link matches its format. */
const PUBLIC_ORIGIN = 'https://therelationshipresume.netlify.app'

type SocialMatchLink = { label?: string; url?: string }

export class SocialMatchError extends Error {}

async function call(path: string, init: RequestInit & { token?: string; timeoutMs?: number } = {}) {
  const { token, headers, timeoutMs = 5_000, ...rest } = init
  let res: Response
  try {
    res = await fetch(`${SOCIAL_MATCH_API}${path}`, {
      ...rest,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch {
    throw new SocialMatchError('The Social Match Game is still waking up. Give it a few seconds and try again.')
  }
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null
  return { ok: res.ok, status: res.status, body }
}

/** Reads the member id out of the Social Match Game's JWT without verifying it; their API does that. */
function memberIdFromToken(token: string): string | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'))
    const id = payload.id ?? payload._id ?? payload.memberId ?? payload.userId ?? payload.sub
    return id ? String(id) : undefined
  } catch {
    return undefined
  }
}

/**
 * Signs in to the Social Match Game as the member, sets the Relationship Resume link on their profile (keeping any
 * other links), then signs back out. Credentials are used for this one request only. Throws `SocialMatchError`
 * with a member-facing message.
 */
export async function linkResumeToProfile(slug: string, email: string, password: string) {
  // A successful sign-in there routinely takes ~25s (failed ones return at once), and their backend also naps when
  // idle; the dialog wakes it as soon as it opens. 40s here plus 5s per follow-up call stays under Netlify's 60s limit.
  const login = await call('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    timeoutMs: 40_000,
  })
  const token = typeof login.body?.token === 'string' ? login.body.token : undefined
  if (!login.ok || !token) {
    throw new SocialMatchError(
      login.status === 400 || login.status === 401
        ? "The Social Match Game didn't recognise that email and password."
        : "The Social Match Game couldn't sign you in just now. Please try again.",
    )
  }

  try {
    const memberId = memberIdFromToken(token)
    let existing: SocialMatchLink[] = []
    if (memberId) {
      const profile = await call(`/api/members/${encodeURIComponent(memberId)}`, { token })
      if (profile.ok && Array.isArray(profile.body?.links)) existing = profile.body.links as SocialMatchLink[]
    }
    const links = [
      ...existing.filter((l) => l?.label?.toLowerCase() !== SOCIAL_MATCH_LINK_LABEL.toLowerCase()),
      { label: SOCIAL_MATCH_LINK_LABEL, url: `${PUBLIC_ORIGIN}/r/${encodeURIComponent(slug)}` },
    ]

    const update = await call('/api/members/aboutme', { method: 'PATCH', token, body: JSON.stringify({ links }) })
    if (!update.ok) throw new SocialMatchError("The Social Match Game didn't accept the update. Please try again.")

    return memberId
      ? `${SOCIAL_MATCH_SITE}/dashboard/profile?id=${encodeURIComponent(memberId)}`
      : `${SOCIAL_MATCH_SITE}/dashboard`
  } finally {
    // Signing in marked the member as online there; sign back out so their status stays truthful.
    await call('/api/login/logout', { method: 'POST', token }).catch(() => {})
  }
}
