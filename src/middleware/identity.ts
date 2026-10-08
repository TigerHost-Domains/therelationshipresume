import { createMiddleware } from '@tanstack/react-start'
import { getUser, type User } from '@netlify/identity'
import { socialProviderOf, SOCIAL_SIGN_IN_REQUIRED } from '@/lib/member'
import { MFA_REQUIRED } from '@/lib/mfa'
import { mfaState } from '@/server/mfa'

/**
 * The signed-in member, provided they came through Google or GitHub. Retired email + password sessions don't count
 * as signed in anywhere.
 */
async function socialUser(): Promise<{ user: User | null; retired: boolean }> {
  const user = (await getUser()) ?? null
  if (!user) return { user: null, retired: false }
  return socialProviderOf(user) ? { user, retired: false } : { user: null, retired: true }
}

/** Adds the signed-in member (or null) to the server function context. Never throws. */
export const identityMiddleware = createMiddleware().server(async ({ next }) => {
  const { user } = await socialUser()
  return next({ context: { user } })
})

/** Signed in, but two-factor not enforced. Used by the two-factor setup and verification steps themselves. */
export const requireSignInMiddleware = createMiddleware().server(async ({ next }) => {
  const { user, retired } = await socialUser()
  if (!user) throw new Error(retired ? SOCIAL_SIGN_IN_REQUIRED : 'Please sign in to continue.')
  return next({ context: { user } })
})

/**
 * Rejects calls from visitors who aren't signed in, and from members with two-factor turned on who haven't
 * entered a code in this browser yet.
 */
export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const { user, retired } = await socialUser()
  if (!user) throw new Error(retired ? SOCIAL_SIGN_IN_REQUIRED : 'Please sign in to continue.')
  const mfa = await mfaState(user.id)
  if (!mfa.verified) throw new Error(MFA_REQUIRED)
  return next({ context: { user } })
})
