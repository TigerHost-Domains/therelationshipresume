import { createServerFn } from '@tanstack/react-start'
import { getUser } from '@netlify/identity'
import { mfaState } from '@/server/mfa'

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  /** Two-factor is on for this member but hasn't been passed in this browser yet. */
  mfaPending: boolean
}

/** The signed-in member for the current request, or null. Safe to call from loaders. */
export const getServerUser = createServerFn({ method: 'GET' }).handler(async (): Promise<SessionUser | null> => {
  const user = await getUser()
  if (!user) return null
  const mfa = await mfaState(user.id)
  return { id: user.id, email: user.email ?? null, name: user.name ?? null, mfaPending: !mfa.verified }
})
