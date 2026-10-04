import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { z } from 'zod'
import { ResumeEditor } from '@/components/ResumeEditor'
import { SiteHeader } from '@/components/SiteHeader'
import { getServerUser } from '@/lib/auth'
import { resumeInputSchema } from '@/lib/resume'
import { openResumeForEditing, updateEditors, updateResume } from '@/server/resumes.functions'

export const Route = createFileRoute('/r/$slug/edit')({
  validateSearch: z.object({ key: z.string().optional() }),
  beforeLoad: async ({ location }) => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
    if (user.mfaPending) throw redirect({ to: '/login', search: { mode: 'mfa', redirect: location.href } })
    return { user }
  },
  loaderDeps: ({ search }) => ({ key: search.key }),
  loader: ({ params, deps }) => openResumeForEditing({ data: { slug: params.slug, editToken: deps.key } }),
  head: () => ({ meta: [{ title: 'Edit your Relationship Resume' }, { name: 'robots', content: 'noindex' }] }),
  component: EditPage,
})

function EditPage() {
  const result = Route.useLoaderData()
  const { slug } = Route.useParams()
  const navigate = useNavigate()

  if (result.status !== 'ok') {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="label text-rose">{result.status === 'missing' ? 'Position filled?' : 'Access denied'}</p>
          <h1 className="mt-3 font-display text-4xl">
            {result.status === 'missing' ? "We couldn't find that resume." : "This resume isn't yours to edit."}
          </h1>
          <p className="mt-3 text-ink-soft">
            {result.status === 'missing'
              ? 'The link may be mistyped, or the page may have been removed.'
              : "Only its owner and the members they've added as co-editors can make changes. Signed in with a different account?"}
          </p>
          <Link to="/r/$slug" params={{ slug }} className="btn-ghost mt-8">
            View the resume
          </Link>
        </main>
      </>
    )
  }

  const initial = resumeInputSchema.parse(result.resume)

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-4 pt-6 pb-8 sm:px-6">
        <p className="label text-rose">Revisions</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">Update your resume</h1>
        {result.canManage ? <CoEditors slug={slug} initial={result.editors} /> : null}
      </div>
      <ResumeEditor
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (next) => {
          await updateResume({ data: { slug, resume: next } })
          await navigate({ to: '/r/$slug', params: { slug } })
        }}
      />
    </>
  )
}

function CoEditors({ slug, initial }: { slug: string; initial: string[] }) {
  const [editors, setEditors] = useState(initial)
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function save(next: string[]) {
    setPending(true)
    setError('')
    try {
      const res = await updateEditors({ data: { slug, emails: next } })
      setEditors(res.editors)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update co-editors.")
      return false
    } finally {
      setPending(false)
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value || editors.includes(value)) return setEmail('')
    if (await save([...editors, value])) setEmail('')
  }

  return (
    <details className="no-print mt-5 max-w-xl rounded-lg border border-rule bg-sheet/60 p-4">
      <summary className="cursor-pointer text-sm">
        <span className="label text-ink-soft">Co-editors</span>{' '}
        <span className="text-ink-soft">
          · {editors.length ? `${editors.length} trusted ${editors.length === 1 ? 'friend' : 'friends'}` : 'just you'}
        </span>
      </summary>
      <p className="mt-3 text-sm text-ink-soft">
        Add a member's email to let them edit this resume when they're signed in. Your wingperson, your best friend,
        your mum. Choose wisely.
      </p>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          className="field"
          type="email"
          required
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn-ghost shrink-0" disabled={pending}>
          Add
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-rose">{error}</p> : null}
      {editors.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {editors.map((e) => (
            <li key={e} className="inline-flex items-center gap-1 rounded-full border border-rule bg-sheet py-1 pr-1 pl-3 text-sm">
              {e}
              <button
                type="button"
                aria-label={`Remove ${e}`}
                disabled={pending}
                onClick={() => void save(editors.filter((x) => x !== e))}
                className="rounded-full p-1 text-ink-soft hover:bg-blush hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  )
}
