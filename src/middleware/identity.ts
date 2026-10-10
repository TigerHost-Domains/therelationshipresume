import { createMiddleware } from '@tanstack/react-start'
import { MFA_REQUIRED } from '@/lib/mfa'
import { mfaState } from '@/server/mfa'
import { currentUser } from '@/server/session'

/** Adds the signed-in member (or null) to the server function context. Never throws. */
export const identityMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await currentUser()
  return next({ context: { user } })
})

/** Signed in, but two-factor not enforced. Used by the two-factor setup and verification steps themselves. */
export const requireSignInMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await currentUser()
  if (!user) throw new Error('Please sign in to continue.')
  return next({ context: { user } })
})

/**
 * Rejects calls from visitors who aren't signed in, and from members with two-factor turned on who haven't
 * entered a code in this browser yet.
 */
export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await currentUser()
  if (!user) throw new Error('Please sign in to continue.')
  const mfa = await mfaState(user.id)
  if (!mfa.verified) throw new Error(MFA_REQUIRED)
  return next({ context: { user } })
})
