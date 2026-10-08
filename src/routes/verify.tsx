import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { z } from 'zod'
import { IdentityOnFile as OnFile } from '@/components/IdentityOnFile'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { getServerUser } from '@/lib/auth'
import { useIdentity } from '@/lib/identity-context'
import {
  identityInputSchema,
  IDENTITY_POLICY_VERSION,
  MIN_AGE_RESUME,
  MIN_AGE_SOCIAL_MATCH,
  PROVIDER_LABELS,
  SEXES,
  type Sex,
} from '@/lib/member'
import { getMyIdentity, submitIdentity } from '@/server/members.functions'

export const Route = createFileRoute('/verify')({
  validateSearch: z.object({
    redirect: z
      .string()
      .regex(/^\/(?!\/)/)
      .optional()
      .catch(undefined),
  }),
  beforeLoad: async ({ location }) => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
    if (user.mfaPending) throw redirect({ to: '/login', search: { mode: 'mfa', redirect: location.href } })
  },
  loader: () => getMyIdentity(),
  head: () => ({ meta: [{ title: 'Identity check · The Relationship Resume' }, { name: 'robots', content: 'noindex' }] }),
  component: VerifyPage,
})

type Identity = Awaited<ReturnType<typeof getMyIdentity>>

function VerifyPage() {
  const identity: Identity = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const { logout } = useIdentity()
  const [legalName, setLegalName] = useState(identity.legalName ?? '')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState<Sex | ''>('')
  const [attest, setAttest] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const provider = PROVIDER_LABELS[identity.provider] ?? 'your sign-in account'
  const nameLocked = identity.nameSource === 'provider' && !!identity.legalName
  const next = search.redirect ?? '/create'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const parsed = identityInputSchema.safeParse({
      legalName: nameLocked ? undefined : legalName,
      birthDate,
      sex: sex || undefined,
      attest,
    })
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Please check your entries.')
    setPending(true)
    try {
      await submitIdentity({ data: parsed.data })
      await router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (identity.status === 'refused') {
    return (
      <Shell eyebrow="Application on hold" title="Come back when you’re 18.">
        <p className="mt-3 text-ink-soft">
          Relationship Resumes are for adults, {MIN_AGE_RESUME} and over. We haven’t kept your date of birth or any
          other details — just a note that this account can’t apply.
        </p>
        <button
          type="button"
          className="btn-ghost mt-8"
          onClick={() => void logout().then(() => window.location.assign('/'))}
        >
          Sign out
        </button>
      </Shell>
    )
  }

  if (identity.status === 'verified') {
    return (
      <Shell eyebrow="Background check complete" title="You’re on file.">
        <OnFile identity={identity} />
        <a href={next} className="btn-primary mt-8">
          Continue
        </a>
      </Shell>
    )
  }

  return (
    <Shell eyebrow="Background check" title="Who’s applying?">
      <p className="mt-3 text-ink-soft">
        Name, age and sex appear on every resume and keep the community safe, so we take them once and lock them.
        What you say you are is who you are.
      </p>

      <form onSubmit={onSubmit} className="sheet mt-8 space-y-5 rounded-lg p-6">
        <label className="block">
          <span className="label text-ink-soft">Full legal name</span>
          {nameLocked ? (
            <>
              <span className="field mt-1.5 flex items-center gap-2 bg-blush/30">
                <Lock className="size-3.5 text-ink-soft" /> {identity.legalName}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">
                From your {provider} account. If it’s wrong, fix it with {provider} before you continue.
              </span>
            </>
          ) : (
            <>
              <input
                className="field mt-1.5"
                value={legalName}
                maxLength={80}
                autoComplete="name"
                required
                onChange={(e) => setLegalName(e.target.value)}
              />
              <span className="mt-1 block text-xs text-ink-soft">
                Your {provider} account didn’t share a name, so enter it as it appears on your ID.
              </span>
            </>
          )}
        </label>

        <label className="block">
          <span className="label text-ink-soft">Date of birth</span>
          <input
            className="field mt-1.5"
            type="date"
            required
            autoComplete="bday"
            max={new Date().toISOString().slice(0, 10)}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <span className="mt-1 block text-xs text-ink-soft">
            Only your age is shown. {MIN_AGE_RESUME}+ to publish a resume; {MIN_AGE_SOCIAL_MATCH}+ to send it to The
            Social Match Game.
          </span>
        </label>

        <fieldset>
          <legend className="label text-ink-soft">Sex</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(SEXES) as Sex[]).map((key) => (
              <label
                key={key}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition ${
                  sex === key ? 'border-rose bg-rose text-white' : 'border-ink/15 hover:border-rose/60'
                }`}
              >
                <input
                  type="radio"
                  name="sex"
                  value={key}
                  className="sr-only"
                  checked={sex === key}
                  onChange={() => setSex(key)}
                />
                {SEXES[key]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex gap-3 rounded-md border border-rule bg-paper/60 p-4 text-sm">
          <input type="checkbox" className="mt-0.5" checked={attest} onChange={(e) => setAttest(e.target.checked)} />
          <span>
            I confirm this is my real name, date of birth and sex, that I’m at least {MIN_AGE_RESUME}, and that
            giving false details may get my resumes removed and my account closed. I understand they can’t be
            changed later except by contacting The Relationship Resume.
            <span className="mt-1 block font-mono text-[0.7rem] text-ink-soft">
              Truthful identity policy · v{IDENTITY_POLICY_VERSION}
            </span>
          </span>
        </label>

        {error ? (
          <p className="text-sm text-rose" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? 'Filing your paperwork…' : 'Swear me in'}
        </button>
      </form>
    </Shell>
  )
}

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-16">
        <p className="label text-rose">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">{title}</h1>
        {children}
        <p className="mt-8 text-sm text-ink-soft">
          <Link to="/" className="underline hover:text-ink">
            Back to the homepage
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
