import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getSettings, oauthLogin } from '@netlify/identity'
import { z } from 'zod'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { nextStepAfterSignIn } from '@/lib/auth'
import { useIdentity } from '@/lib/identity-context'
import { socialProviderOf, type SocialProvider } from '@/lib/member'
import { OAUTH_REDIRECT_KEY } from '@/lib/oauth'
import { verifyMfa } from '@/server/mfa.functions'

// Sign-in is Google or GitHub only, the same doors as The Social Match Game. No passwords are made or kept here.
const modes = ['signin', 'mfa'] as const
type Mode = (typeof modes)[number]

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    // Old links (?mode=signup, reset, invite…) fall back to the sign-in screen.
    mode: z.enum(modes).optional().catch(undefined),
    // Only same-site paths, so the redirect can't be used to bounce people elsewhere.
    redirect: z
      .string()
      .regex(/^\/(?!\/)/)
      .optional()
      .catch(undefined),
  }),
  head: () => ({ meta: [{ title: 'Sign In · The Relationship Resume' }, { name: 'robots', content: 'noindex' }] }),
  component: LoginPage,
})

const copy: Record<Mode, { eyebrow: string; title: string; blurb: string }> = {
  signin: {
    eyebrow: 'Members Only',
    title: 'Sign In to Apply.',
    blurb:
      'One tap with Google or GitHub — the same accounts The Social Match Game uses. New here? Signing in opens your member file. No passwords to forget.',
  },
  mfa: {
    eyebrow: 'Second Interview',
    title: 'Enter Your Authenticator Code.',
    blurb: 'Open your authenticator app and type the 6-digit code for The Relationship Resume.',
  },
}

const SOCIAL: { id: SocialProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z" />
      </svg>
    ),
  },
]

function LoginPage() {
  const search = Route.useSearch()
  const { user, ready, logout } = useIdentity()
  const [mode, setMode] = useState<Mode>(search.mode ?? 'signin')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  // Which social providers are switched on in the Identity settings; null until known.
  const [providers, setProviders] = useState<SocialProvider[] | null>(null)

  useEffect(() => {
    getSettings()
      .then((settings) => setProviders(SOCIAL.map((p) => p.id).filter((id) => settings.providers[id])))
      .catch(() => setProviders([]))
  }, [])

  const redirect = search.redirect ?? '/'
  // Sessions from the retired email + password sign-in don't count any more.
  const retired = ready && !!user && !socialProviderOf(user)

  // Two-factor code if owed, then the one-time identity check, then on to where they were headed.
  const carryOn = async () => {
    const next = await nextStepAfterSignIn(redirect)
    if (!next) return
    if (next.startsWith('/login?mode=mfa')) {
      setMode('mfa')
      setError('')
    } else {
      // A full load so the server sees the fresh session cookie on the protected page.
      window.location.assign(next)
    }
  }

  const social = (provider: SocialProvider) => {
    window.sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirect)
    oauthLogin(provider)
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      await verifyMfa({ data: { code } })
      await carryOn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const c = copy[mode]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="label text-rose">{c.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">{c.title}</h1>
        <p className="mt-3 text-ink-soft">{c.blurb}</p>

        {mode === 'mfa' ? (
          <form onSubmit={onSubmitCode} className="sheet mt-8 space-y-4 rounded-lg p-6">
            <label className="block">
              <span className="label text-ink-soft">6-Digit Code</span>
              <input
                className="field mt-1.5 text-center font-mono text-lg tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
            {error && <p className="text-sm text-rose">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={pending}>
              {pending ? 'One Moment…' : 'Verify'}
            </button>
          </form>
        ) : retired ? (
          <div className="sheet mt-8 rounded-lg p-6">
            <p>
              Password sign-in has been retired. Sign out, then continue with Google or GitHub using{' '}
              <strong>{user?.email}</strong> to pick up where you left off.
            </p>
            <button type="button" className="btn-primary mt-5" onClick={() => void logout()}>
              Sign Out
            </button>
          </div>
        ) : ready && user ? (
          <div className="sheet mt-8 rounded-lg p-6">
            <p>
              You're signed in as <strong>{user.email}</strong>.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => void carryOn()}>
                Continue
              </button>
              <button type="button" className="btn-ghost" onClick={() => void logout()}>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="sheet mt-8 space-y-3 rounded-lg p-6">
            {providers === null ? (
              <p className="text-sm text-ink-soft">Checking the guest list…</p>
            ) : providers.length ? (
              SOCIAL.filter((p) => providers.includes(p.id)).map((p) => (
                <button key={p.id} type="button" className="btn-ghost w-full" onClick={() => social(p.id)}>
                  {p.icon} Continue with {p.label}
                </button>
              ))
            ) : (
              <p className="text-sm text-ink-soft">
                Sign-in is closed for a moment while we tidy the lobby. Please try again shortly.
              </p>
            )}
            <p className="pt-2 text-xs text-ink-soft">
              Your name comes from the account you choose. After your first sign-in we ask for your date of birth
              and sex, once, so everyone here is who they say they are.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-ink-soft">
          {mode === 'mfa' && <span>Lost your phone? Ask the site's admins to reset your two-factor.</span>}
          <Link to="/" className="underline hover:text-ink">
            Back to the Homepage
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
