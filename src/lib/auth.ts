import { createServerFn } from '@tanstack/react-start'
import { getUser } from '@netlify/identity'
import { socialProviderOf } from '@/lib/member'
import { getProfile, statusOf, type IdentityStatus } from '@/server/members'
import { mfaState } from '@/server/mfa'

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  /** Two-factor is on for this member but hasn't been passed in this browser yet. */
  mfaPending: boolean
  /** Whether the one-time identity check (name, date of birth, sex) is done. */
  identity: IdentityStatus
}

/**
 * The signed-in member for the current request, or null. Only Google/GitHub sessions count; retired email + password
 * sessions come back as null. Safe to call from loaders.
 */
export const getServerUser = createServerFn({ method: 'GET' }).handler(async (): Promise<SessionUser | null> => {
  const user = await getUser()
  if (!user || !socialProviderOf(user)) return null
  const [mfa, profile] = await Promise.all([mfaState(user.id), getProfile(user.id)])
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    mfaPending: !mfa.verified,
    identity: statusOf(profile),
  }
})

/**
 * Where a member goes after signing in: the two-factor prompt if it's owed, then the one-time identity check, then
 * `redirect`. Returns null for sessions that don't count (not signed in, or not Google/GitHub).
 */
export async function nextStepAfterSignIn(redirect: string): Promise<string | null> {
  const user = await getServerUser()
  if (!user) return null
  const back = encodeURIComponent(redirect)
  if (user.mfaPending) return `/login?mode=mfa&redirect=${back}`
  if (user.identity === 'missing') return `/verify?redirect=${back}`
  return redirect
}
