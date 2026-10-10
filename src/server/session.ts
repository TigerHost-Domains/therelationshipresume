// Server-only: who is signed in for the current request.
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { authAccounts } from '../../db/schema.js'
import { SOCIAL_PROVIDERS, type SocialProvider } from '@/lib/member'
import { auth } from '@/server/auth'

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  provider: SocialProvider
  /** `proxy` for emails listed in PROXY_EMAILS: they may edit and manage any member's resume. */
  roles: string[]
}

const proxyEmails = (process.env.PROXY_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function currentUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: new Headers(getRequestHeaders() as HeadersInit) })
  if (!session) return null
  const { id, email, name, emailVerified } = session.user
  const [account] = await db
    .select({ providerId: authAccounts.providerId })
    .from(authAccounts)
    .where(and(eq(authAccounts.userId, id), inArray(authAccounts.providerId, [...SOCIAL_PROVIDERS])))
    .limit(1)
  if (!account) return null
  const isProxy = emailVerified && proxyEmails.includes(email.toLowerCase())
  return { id, email, name, provider: account.providerId as SocialProvider, roles: isProxy ? ['proxy'] : [] }
}
