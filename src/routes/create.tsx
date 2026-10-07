import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { FilePlus2, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { ResumeEditor } from '@/components/ResumeEditor'
import { SiteHeader } from '@/components/SiteHeader'
import {
  clearDraft,
  DRAFT_SLOTS,
  listDrafts,
  loadDraft,
  saveDraft,
  type DraftSlot,
  type DraftSummary,
} from '@/lib/drafts'
import { useIdentity } from '@/lib/identity-context'
import { MFA_REQUIRED } from '@/lib/mfa'
import { emptyResume, type ResumeInput } from '@/lib/resume'
import { cn } from '@/lib/utils'
import { createResume } from '@/server/resumes.functions'

export const Route = createFileRoute('/create')({
  validateSearch: z.object({ draft: z.union([z.literal(1), z.literal(2)]).optional().catch(undefined) }),
  head: () => ({ meta: [{ title: 'Write your Relationship Resume' }] }),
  component: CreatePage,
})

function savedAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60_000)
  if (mins < 1) return 'saved just now'
  if (mins < 60) return `saved ${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `saved ${hours} hr ago`
  return `saved ${new Date(ts).toLocaleDateString()}`
}

function CreatePage() {
  const navigate = useNavigate()
  const { user, ready } = useIdentity()
  const slot: DraftSlot = Route.useSearch().draft ?? 1
  // Drafts live in localStorage, so they're read after mount. Autosave only runs once the current slot is loaded,
  // so switching slots never copies one draft into the other.
  const [loaded, setLoaded] = useState<{ slot: DraftSlot; resume: ResumeInput; version: number } | null>(null)
  const [drafts, setDrafts] = useState<Record<DraftSlot, DraftSummary | null>>({ 1: null, 2: null })

  useEffect(() => {
    setLoaded((prev) => ({ slot, resume: loadDraft(slot) ?? emptyResume, version: (prev?.version ?? 0) + 1 }))
    setDrafts(listDrafts())
  }, [slot])

  const autosave = (resume: ResumeInput) => {
    if (loaded?.slot !== slot) return
    saveDraft(slot, resume)
    setDrafts(listDrafts())
  }

  const discard = (s: DraftSlot) => {
    const name = drafts[s]?.name
    if (!window.confirm(`Discard ${name ? `${name}'s draft` : `draft ${s}`}? This can't be undone.`)) return
    clearDraft(s)
    setDrafts(listDrafts())
    if (s === slot) setLoaded((prev) => ({ slot, resume: emptyResume, version: (prev?.version ?? 0) + 1 }))
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-studio px-4 pt-6 pb-8 sm:px-6 lg:px-10 lg:pt-8 lg:pb-10">
        <p className="label text-rose">New application</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl xl:text-6xl">
          Write your <em>Relationship Resume</em>
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Fill in as much or as little as you like — your page updates as you type. When you publish, you get a link
          to share on your dating profile, in your bio, or with a friend who loves to set people up.
        </p>
        {ready && !user ? (
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            Drafting is open to all; publishing takes a member account so only you can make revisions.{' '}
            <Link to="/login" search={{ redirect: `/create?draft=${slot}` }} className="text-rose underline">
              Sign in
            </Link>{' '}
            any time — we'll keep your drafts.
          </p>
        ) : null}

        <div className="no-print mt-6">
          <p className="label text-ink-soft">Drafts in progress · saved in this browser, two at a time</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DRAFT_SLOTS.map((s) => {
              const draft = drafts[s]
              const active = s === slot
              return (
                <div
                  key={s}
                  className={cn(
                    'flex items-center rounded-md border text-sm',
                    active ? 'border-ink bg-sheet' : 'border-rule hover:border-ink/40',
                  )}
                >
                  <Link
                    to="/create"
                    search={{ draft: s }}
                    aria-current={active ? 'page' : undefined}
                    className="flex items-center gap-2 py-2 pr-2 pl-3"
                  >
                    {draft ? null : <FilePlus2 className="size-4 text-ink-soft" />}
                    <span className={draft ? 'font-medium' : 'text-ink-soft'}>
                      {draft ? draft.name || 'Untitled draft' : `Start draft ${s}`}
                    </span>
                    {draft ? <span className="text-xs text-ink-soft">{savedAgo(draft.updatedAt)}</span> : null}
                  </Link>
                  {draft ? (
                    <button
                      type="button"
                      onClick={() => discard(s)}
                      className="mr-1 rounded p-1.5 text-ink-soft hover:bg-blush hover:text-rose"
                      aria-label={`Discard ${draft.name || `draft ${s}`}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <ResumeEditor
        key={loaded ? `${loaded.slot}-${loaded.version}` : 'loading'}
        initial={loaded?.resume ?? emptyResume}
        submitLabel={ready && !user ? 'Sign in to publish' : 'Publish my resume'}
        onChange={autosave}
        onSubmit={async (resume) => {
          const here = `/create?draft=${slot}`
          if (!user) {
            saveDraft(slot, resume)
            await navigate({ to: '/login', search: { redirect: here } })
            return
          }
          let slug: string
          try {
            ;({ slug } = await createResume({ data: resume }))
          } catch (err) {
            if (err instanceof Error && err.message === MFA_REQUIRED) {
              saveDraft(slot, resume)
              await navigate({ to: '/login', search: { mode: 'mfa', redirect: here } })
              return
            }
            throw err
          }
          clearDraft(slot)
          await navigate({ to: '/r/$slug', params: { slug }, search: { published: true } })
        }}
      />
    </>
  )
}
