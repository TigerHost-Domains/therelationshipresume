import { createServerFn } from '@tanstack/react-start'
import { getProfile, statusOf, type IdentityStatus } from '@/server/members'
import { mfaState } from '@/server/mfa'
import { enabledProviders } from '@/server/auth'
import { currentUser } from '@/server/session'
import type { SocialProvider } from '@/lib/member'

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  /** Two-factor is on for this member but hasn't been passed in this browser yet. */
  mfaPending: boolean
  /** Whether the one-time identity check (name, date of birth, sex) is done. */
  identity: IdentityStatus
}

/** Providers with credentials configured on the server. */
export const getEnabledProviders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SocialProvider[]> => enabledProviders,
)

/** The signed-in member for the current request, or null. Safe to call from loaders. */
export const getServerUser = createServerFn({ method: 'GET' }).handler(async (): Promise<SessionUser | null> => {
  const user = await currentUser()
  if (!user) return null
  const [mfa, profile] = await Promise.all([mfaState(user.id), getProfile(user.id)])
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    mfaPending: !mfa.verified,
    identity: statusOf(profile),
  }
})

/**
 * Where a member goes after signing in: the two-factor prompt if it's owed, then the one-time identity check, then
 * `redirect`. Returns null when nobody is signed in.
 */
export async function nextStepAfterSignIn(redirect: string): Promise<string | null> {
  const user = await getServerUser()
  if (!user) return null
  const back = encodeURIComponent(redirect)
  if (user.mfaPending) return `/login?mode=mfa&redirect=${back}`
  if (user.identity === 'missing') return `/verify?redirect=${back}`
  return redirect
}
