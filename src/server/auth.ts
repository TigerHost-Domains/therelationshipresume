// Server-only Better Auth instance: Google and GitHub sign-in, sessions stored in Postgres.
import { betterAuth } from 'better-auth'
import { pool } from '../../db/index.js'
import type { SocialProvider } from '@/lib/member'

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:3000'

const providerCredentials: Record<SocialProvider, { clientId?: string; clientSecret?: string }> = {
  google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
  github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET },
}

/** Providers with credentials configured; the sign-in page only offers these. */
export const enabledProviders = (Object.keys(providerCredentials) as SocialProvider[]).filter(
  (p) => providerCredentials[p].clientId && providerCredentials[p].clientSecret,
)

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  socialProviders: Object.fromEntries(enabledProviders.map((p) => [p, providerCredentials[p]])),
  account: { accountLinking: { enabled: true, trustedProviders: ['google', 'github'] } },
})
