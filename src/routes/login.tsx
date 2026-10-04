import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  acceptInvite,
  getSettings,
  login,
  oauthLogin,
  requestPasswordRecovery,
  signup,
  updateUser,
  type AuthProvider,
} from '@netlify/identity'
import { z } from 'zod'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { useIdentity } from '@/lib/identity-context'
import { OAUTH_REDIRECT_KEY } from '@/lib/oauth'
import { getMfaStatus, verifyMfa } from '@/server/mfa.functions'

const modes = ['signin', 'signup', 'forgot', 'reset', 'invite', 'mfa'] as const
type Mode = (typeof modes)[number]

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    mode: z.enum(modes).optional(),
    // Only same-site paths, so the redirect can't be used to bounce people elsewhere.
    redirect: z
      .string()
      .regex(/^\/(?!\/)/)
      .optional()
      .catch(undefined),
    invite: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: 'Sign in · The Relationship Resume' }, { name: 'robots', content: 'noindex' }] }),
  component: LoginPage,
})

const copy: Record<Mode, { eyebrow: string; title: string; blurb: string; submit: string }> = {
  signin: {
    eyebrow: 'Members only',
    title: 'Sign in to make revisions.',
    blurb: 'Editing a resume is reserved for signed-in members. Your public resume stays open to everyone.',
    submit: 'Sign in',
  },
  signup: {
    eyebrow: 'New applicant',
    title: 'Open your member file.',
    blurb: "Create an account to edit your resume. We'll email you a link to confirm it's really you.",
    submit: 'Create account',
  },
  forgot: {
    eyebrow: 'Lost credentials',
    title: 'Reset your password.',
    blurb: "Enter your email and we'll send a link to choose a new one.",
    submit: 'Send reset link',
  },
  reset: {
    eyebrow: 'Fresh start',
    title: 'Choose a new password.',
    blurb: "You're signed in. Pick a new password to finish up.",
    submit: 'Save password',
  },
  invite: {
    eyebrow: "You're invited",
    title: 'Accept your invitation.',
    blurb: 'Choose a password to activate your membership.',
    submit: 'Accept invite',
  },
  mfa: {
    eyebrow: 'Second interview',
    title: 'Enter your authenticator code.',
    blurb: 'Open your authenticator app and type the 6-digit code for The Relationship Resume.',
    submit: 'Verify',
  },
}

const SOCIAL: { id: AuthProvider; label: string; icon: React.ReactNode }[] = [
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
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [code, setCode] = useState('')
  // Which social providers are switched on in the Identity settings; null until known.
  const [providers, setProviders] = useState<AuthProvider[] | null>(null)

  useEffect(() => {
    getSettings()
      .then((settings) => setProviders(SOCIAL.map((p) => p.id).filter((id) => settings.providers[id])))
      .catch(() => setProviders([]))
  }, [])

  const goOn = () => {
    // A full load so the server sees the fresh session cookie on the protected page.
    window.location.assign(search.redirect ?? '/')
  }

  // Members with two-factor on still owe a code before heading on.
  const afterSignIn = async () => {
    const mfa = await getMfaStatus()
    if (mfa.enabled && !mfa.verified) switchMode('mfa')
    else goOn()
  }

  const social = (provider: AuthProvider) => {
    window.sessionStorage.setItem(OAUTH_REDIRECT_KEY, search.redirect ?? '/')
    oauthLogin(provider)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setNotice('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signin') {
        await login(email, password)
        await afterSignIn()
      } else if (mode === 'signup') {
        await signup(email, password, { full_name: name })
        setNotice(`Check ${email} for a confirmation link, then come back and sign in.`)
      } else if (mode === 'forgot') {
        await requestPasswordRecovery(email)
        setNotice(`If ${email} has an account, a reset link is on its way.`)
      } else if (mode === 'reset') {
        await updateUser({ password })
        goOn()
      } else if (mode === 'invite') {
        if (!search.invite) throw new Error('This invitation link is incomplete.')
        await acceptInvite(search.invite, password)
        goOn()
      } else if (mode === 'mfa') {
        await verifyMfa({ data: { code } })
        goOn()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const c = copy[mode]
  const needsEmail = mode === 'signin' || mode === 'signup' || mode === 'forgot'
  const needsPassword = mode !== 'forgot' && mode !== 'mfa'
  const showSocial = (mode === 'signin' || mode === 'signup') && !!providers?.length

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="label text-rose">{c.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">{c.title}</h1>
        <p className="mt-3 text-ink-soft">{c.blurb}</p>

        {ready && user && (mode === 'signin' || mode === 'signup') ? (
          <div className="sheet mt-8 rounded-lg p-6">
            <p>
              You're signed in as <strong>{user.email}</strong>.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => void afterSignIn()}>
                Continue
              </button>
              <button type="button" className="btn-ghost" onClick={() => void logout()}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="sheet mt-8 space-y-4 rounded-lg p-6">
            {mode === 'mfa' && (
              <label className="block">
                <span className="label text-ink-soft">6-digit code</span>
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
            )}
            {mode === 'signup' && (
              <label className="block">
                <span className="label text-ink-soft">Name</span>
                <input className="field mt-1.5" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
            )}
            {needsEmail && (
              <label className="block">
                <span className="label text-ink-soft">Email</span>
                <input
                  className="field mt-1.5"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
            )}
            {needsPassword && (
              <label className="block">
                <span className="label text-ink-soft">{mode === 'signin' ? 'Password' : 'New password'}</span>
                <input
                  className="field mt-1.5"
                  type="password"
                  required
                  minLength={mode === 'signin' ? undefined : 8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </label>
            )}

            {error && <p className="text-sm text-rose">{error}</p>}
            {notice && <p className="text-sm text-ink">{notice}</p>}

            <button type="submit" className="btn-primary w-full" disabled={pending}>
              {pending ? 'One moment…' : c.submit}
            </button>

            {showSocial ? (
              <>
                <div className="flex items-center gap-3 pt-2 text-ink-soft">
                  <span className="h-px flex-1 bg-rule" />
                  <span className="label">or {mode === 'signup' ? 'sign up' : 'continue'} with</span>
                  <span className="h-px flex-1 bg-rule" />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SOCIAL.filter((p) => providers?.includes(p.id)).map((p) => (
                    <button key={p.id} type="button" className="btn-ghost w-full" onClick={() => social(p.id)}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </form>
        )}

        <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-ink-soft">
          {mode === 'signin' && (
            <>
              <button type="button" className="underline hover:text-ink" onClick={() => switchMode('signup')}>
                New here? Create an account
              </button>
              <button type="button" className="underline hover:text-ink" onClick={() => switchMode('forgot')}>
                Forgot password?
              </button>
            </>
          )}
          {(mode === 'signup' || mode === 'forgot') && (
            <button type="button" className="underline hover:text-ink" onClick={() => switchMode('signin')}>
              Already a member? Sign in
            </button>
          )}
          {mode === 'mfa' && <span>Lost your phone? Ask the site's admins to reset your two-factor.</span>}
          {(mode === 'reset' || mode === 'invite' || mode === 'mfa') && (
            <Link to="/" className="underline hover:text-ink">
              Back to the homepage
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
