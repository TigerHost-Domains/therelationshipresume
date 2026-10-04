import { useEffect, useState } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Check, Copy, PenLine, Printer } from 'lucide-react'
import { z } from 'zod'
import { ResumeSheet } from '@/components/ResumeSheet'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { getEditKey } from '@/lib/edit-keys'
import { useIdentity } from '@/lib/identity-context'
import { getEditAccess, getResume } from '@/server/resumes.functions'

export const Route = createFileRoute('/r/$slug/')({
  validateSearch: z.object({ published: z.boolean().optional() }),
  loader: async ({ params }) => {
    const resume = await getResume({ data: { slug: params.slug } })
    if (!resume) throw notFound()
    return resume
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Relationship Resume` },
          { name: 'description', content: loaderData.headline || loaderData.objective.slice(0, 150) },
          { property: 'og:title', content: `${loaderData.name}'s Relationship Resume` },
          { property: 'og:description', content: loaderData.headline || loaderData.objective.slice(0, 150) },
        ]
      : [],
  }),
  notFoundComponent: NotFound,
  component: ResumePage,
})

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
  }
  return { copied, copy }
}

function ResumePage() {
  const resume = Route.useLoaderData()
  const { published } = Route.useSearch()
  const { slug } = Route.useParams()
  const { user, ready } = useIdentity()
  const [canEdit, setCanEdit] = useState(false)
  // Edit keys only matter for resumes made before accounts: they let a member claim ownership.
  const [claimKey, setClaimKey] = useState<string>()
  const [origin, setOrigin] = useState('')
  const { copied, copy } = useCopy()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!ready) return
    let live = true
    const key = getEditKey(slug)
    if (!user) {
      setCanEdit(false)
      setClaimKey(key)
      return
    }
    getEditAccess({ data: { slug } })
      .then((access) => {
        if (!live) return
        setCanEdit(access.canEdit)
        setClaimKey(access.unowned ? key : undefined)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [ready, user, slug])

  const shareUrl = `${origin}/r/${slug}`
  const showEdit = canEdit || !!claimKey

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {published ? (
          <div className="no-print mb-8 rounded-lg border border-rose/25 bg-blush/50 p-5 sm:p-6">
            <p className="font-display text-2xl">Your resume is live. 💌</p>
            <p className="mt-1 text-sm text-ink-soft">
              Share the public link anywhere. It's tied to your account, so sign in from any device to make
              revisions or add co-editors.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[{ id: 'share', label: 'Public link', value: shareUrl }].map((row) => (
                <div key={row.id}>
                  <span className="label text-ink-soft">{row.label}</span>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-rule bg-sheet py-1.5 pr-1.5 pl-3">
                    <span className="flex-1 truncate font-mono text-xs">{row.value}</span>
                    <button
                      type="button"
                      onClick={() => copy(row.id, row.value)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-blush"
                    >
                      {copied === row.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied === row.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="no-print mb-4 flex flex-wrap items-center justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => copy('share', shareUrl)}>
            {copied === 'share' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied === 'share' ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </button>
          {showEdit ? (
            <Link to="/r/$slug/edit" params={{ slug }} search={{ key: claimKey }} className="btn-ghost">
              <PenLine className="size-4" /> Edit
            </Link>
          ) : null}
        </div>

        <ResumeSheet resume={resume} />

        {!showEdit ? (
          <div className="no-print mt-12 text-center">
            <p className="font-display text-2xl italic">Looking for love too?</p>
            <Link to="/create" className="btn-primary mt-4">
              Write your own Relationship Resume
            </Link>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}

function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="label text-rose">Position filled?</p>
        <h1 className="mt-3 font-display text-4xl">We couldn't find that resume.</h1>
        <p className="mt-3 text-ink-soft">The link may be mistyped, or the page may have been removed.</p>
        <Link to="/create" className="btn-primary mt-8">
          Write your own
        </Link>
      </main>
    </>
  )
}
