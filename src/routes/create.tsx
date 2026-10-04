import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ResumeEditor } from '@/components/ResumeEditor'
import { SiteHeader } from '@/components/SiteHeader'
import { useIdentity } from '@/lib/identity-context'
import { MFA_REQUIRED } from '@/lib/mfa'
import { emptyResume, resumeInputSchema, type ResumeInput } from '@/lib/resume'
import { createResume } from '@/server/resumes.functions'

export const Route = createFileRoute('/create')({
  head: () => ({ meta: [{ title: 'Write your Relationship Resume' }] }),
  component: CreatePage,
})

// Drafts survive the trip to the sign-in page, since publishing needs an account.
const DRAFT_KEY = 'relationship-resume:draft'

function loadDraft(): ResumeInput | null {
  try {
    const parsed = resumeInputSchema.safeParse(JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null'))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

function CreatePage() {
  const navigate = useNavigate()
  const { user, ready } = useIdentity()
  const [initial, setInitial] = useState<ResumeInput>(emptyResume)
  const [draftVersion, setDraftVersion] = useState(0)

  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setInitial(draft)
      setDraftVersion((v) => v + 1)
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-4 pt-6 pb-8 sm:px-6">
        <p className="label text-rose">New application</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Write your <em>Relationship Resume</em>
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Fill in as much or as little as you like — your page updates as you type. When you publish, you get a link
          to share on your dating profile, in your bio, or with a friend who loves to set people up.
        </p>
        {ready && !user ? (
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            Drafting is open to all; publishing takes a member account so only you can make revisions.{' '}
            <Link to="/login" search={{ redirect: '/create' }} className="text-rose underline">
              Sign in
            </Link>{' '}
            any time — we'll keep your draft.
          </p>
        ) : null}
      </div>
      <ResumeEditor
        key={draftVersion}
        initial={initial}
        submitLabel={ready && !user ? 'Sign in to publish' : 'Publish my resume'}
        onSubmit={async (resume) => {
          if (!user) {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(resume))
            await navigate({ to: '/login', search: { redirect: '/create' } })
            return
          }
          let slug: string
          try {
            ;({ slug } = await createResume({ data: resume }))
          } catch (err) {
            if (err instanceof Error && err.message === MFA_REQUIRED) {
              window.localStorage.setItem(DRAFT_KEY, JSON.stringify(resume))
              await navigate({ to: '/login', search: { mode: 'mfa', redirect: '/create' } })
              return
            }
            throw err
          }
          window.localStorage.removeItem(DRAFT_KEY)
          await navigate({ to: '/r/$slug', params: { slug }, search: { published: true } })
        }}
      />
    </>
  )
}
