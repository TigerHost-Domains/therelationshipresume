import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { Check, Copy, FileText, PenLine, Plus, ShieldCheck } from 'lucide-react'
import { IdentityOnFile } from '@/components/IdentityOnFile'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { SocialMatchButton } from '@/components/SocialMatchConnect'
import { getServerUser } from '@/lib/auth'
import { useIdentity } from '@/lib/identity-context'
import { MIN_AGE_SOCIAL_MATCH } from '@/lib/member'
import { ACCENTS } from '@/lib/resume'
import { confirmMfaSetup, disableMfa, getMfaStatus, startMfaSetup } from '@/server/mfa.functions'
import { getMyIdentity } from '@/server/members.functions'
import { listMyResumes } from '@/server/resumes.functions'

export const Route = createFileRoute('/account')({
  beforeLoad: async ({ location }) => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
    return { user }
  },
  loader: async () => {
    const [status, myResumes, identity] = await Promise.all([getMfaStatus(), listMyResumes(), getMyIdentity()])
    return { status, myResumes, identity }
  },
  head: () => ({ meta: [{ title: 'Your account · The Relationship Resume' }, { name: 'robots', content: 'noindex' }] }),
  component: AccountPage,
})

function AccountPage() {
  const { user } = Route.useRouteContext()
  const { status, myResumes, identity } = Route.useLoaderData()
  const router = useRouter()
  const { logout } = useIdentity()
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null)
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function run(action: () => Promise<unknown>) {
    setPending(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const begin = () => run(async () => setSetup(await startMfaSetup()))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void run(async () => {
      if (status.enabled) await disableMfa({ data: { code } })
      else await confirmMfaSetup({ data: { code } })
      setSetup(null)
      setCode('')
      await router.invalidate()
    })
  }

  const codeField = (
    <form onSubmit={submit} className="mt-5 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="label text-ink-soft">6-digit code</span>
        <input
          className="field mt-1.5 w-44 text-center font-mono text-lg tracking-[0.4em]"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </label>
      <button type="submit" className={status.enabled ? 'btn-ghost' : 'btn-primary'} disabled={pending}>
        {pending ? 'One moment…' : status.enabled ? 'Turn off two-factor' : 'Confirm and turn on'}
      </button>
    </form>
  )

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <p className="label text-rose">Personnel file</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Your account</h1>
        <p className="mt-3 text-ink-soft">
          Signed in as <strong className="text-ink">{user.email}</strong>.{' '}
          <button
            type="button"
            className="underline hover:text-ink"
            onClick={() => void logout().then(() => window.location.assign('/'))}
          >
            Sign out
          </button>
        </p>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Identity on file</h2>
          {identity.status === 'verified' ? (
            <IdentityOnFile identity={identity} />
          ) : identity.status === 'refused' ? (
            <p className="mt-2 text-sm text-ink-soft">
              This account reported an age under 18, so it can't publish resumes. No other details were kept.
            </p>
          ) : (
            <div className="sheet mt-4 rounded-lg p-6 text-sm">
              <p className="text-ink-soft">
                Not yet. Publishing and editing need a one-time identity check: your name from your sign-in account,
                plus your sworn date of birth and sex.
              </p>
              <Link to="/verify" search={{ redirect: '/account' }} className="btn-primary mt-4">
                Complete your identity check
              </Link>
            </div>
          )}
        </section>

        <MyResumes resumes={myResumes} canSendToSocialMatch={identity.canSendToSocialMatch} />

        <section className="sheet mt-10 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className={`mt-1 size-5 shrink-0 ${status.enabled ? 'text-rose' : 'text-ink-soft'}`} />
            <div>
              <h2 className="font-display text-2xl">Two-factor authentication</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {status.enabled
                  ? "On. Publishing and editing ask for a code from your authenticator app once per browser, every 12 hours."
                  : 'Off. Add a code from an authenticator app (Google Authenticator, 1Password, Authy…) as a second reference check before anyone can publish or edit as you.'}
              </p>
            </div>
          </div>

          {status.enabled ? (
            <>
              <p className="mt-5 text-sm text-ink-soft">To turn it off, enter a current code.</p>
              {codeField}
            </>
          ) : setup ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
              <img src={setup.qr} alt="QR code for your authenticator app" className="size-44 rounded-md border border-rule bg-white p-1" />
              <div className="text-sm">
                <p>1. Scan this code with your authenticator app.</p>
                <p className="mt-2 text-ink-soft">Can't scan? Enter this key instead:</p>
                <code className="mt-1 block break-all rounded bg-blush/50 px-2 py-1 font-mono text-xs">{setup.secret}</code>
                <p className="mt-4">2. Enter the 6-digit code it shows.</p>
                {codeField}
              </div>
            </div>
          ) : (
            <button type="button" className="btn-primary mt-6" onClick={() => void begin()} disabled={pending}>
              Set up authenticator app
            </button>
          )}

          {error ? <p className="mt-4 text-sm text-rose" role="alert">{error}</p> : null}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

type MyResume = Awaited<ReturnType<typeof listMyResumes>>[number]

function MyResumes({ resumes, canSendToSocialMatch }: { resumes: MyResume[]; canSendToSocialMatch: boolean }) {
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <section className="sheet mt-10 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <FileText className="mt-1 size-5 shrink-0 text-rose" />
        <div>
          <h2 className="font-display text-2xl">Your resumes</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {resumes.length
              ? 'Every resume on file under your name, plus any you’ve been asked to co-edit. Share the link with anyone worth interviewing.'
              : 'No applications on file yet. Write one and its link will be kept here.'}
            {resumes.length
              ? canSendToSocialMatch
                ? ' You can also pin your own to your Social Match Game profile.'
                : ` From ${MIN_AGE_SOCIAL_MATCH}, you can also pin your own to a Social Match Game profile.`
              : null}
          </p>
        </div>
      </div>

      {resumes.length ? (
        <>
          <ul className="mt-6 divide-y divide-rule border-y border-rule">
            {resumes.map((r) => {
              const path = `/r/${r.slug}`
              return (
                <li key={r.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: ACCENTS[r.accent]?.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <Link to="/r/$slug" params={{ slug: r.slug }} className="font-display text-lg hover:underline">
                      {r.name}
                    </Link>
                    {r.role === 'co-editor' ? <span className="label ml-2 text-ink-soft">Co-editor</span> : null}
                    {r.headline ? <p className="truncate text-sm text-ink-soft">{r.headline}</p> : null}
                    <p className="mt-0.5 break-all font-mono text-xs text-ink-soft">
                      {origin}
                      {path}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                      onClick={() => void copy(r.slug)}
                    >
                      {copied === r.slug ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied === r.slug ? 'Copied' : 'Copy link'}
                    </button>
                    <Link
                      to="/r/$slug/edit"
                      params={{ slug: r.slug }}
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                    >
                      <PenLine className="size-3.5" />
                      Edit
                    </Link>
                    {canSendToSocialMatch && r.role === 'owner' ? (
                      <SocialMatchButton slug={r.slug} compact returnTo="/account" />
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
          <Link to="/create" className="btn-ghost mt-6">
            <Plus className="size-4" /> Write another resume
          </Link>
        </>
      ) : (
        <Link to="/create" className="btn-primary mt-6 inline-block">
          Write your resume
        </Link>
      )}
    </section>
  )
}
