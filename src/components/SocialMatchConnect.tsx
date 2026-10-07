import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, Check, Copy, Heart, Loader2, X } from 'lucide-react'
import { MFA_REQUIRED } from '@/lib/mfa'
import { SOCIAL_MATCH_API, SOCIAL_MATCH_SITE } from '@/lib/social-match'
import { cn } from '@/lib/utils'
import { pushToSocialMatch } from '@/server/resumes.functions'

/** Opens the dialog that adds this resume to the member's Social Match Game profile. */
export function SocialMatchButton({ slug, className }: { slug: string; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={cn('btn-ghost', className)} onClick={() => setOpen(true)}>
        <Heart className="size-4" /> Add to Social Match
      </button>
      {open ? <SocialMatchDialog slug={slug} onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function SocialMatchDialog({ slug, onClose }: { slug: string; onClose: () => void }) {
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [profileUrl, setProfileUrl] = useState<string>()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
    // The Social Match Game's server naps when idle. Nudge it now so it's awake by the time the form is sent.
    fetch(`${SOCIAL_MATCH_API}/api/auth/providers`, { mode: 'no-cors' }).catch(() => {})
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      const res = await pushToSocialMatch({ data: { slug, email, password } })
      if (res.ok) {
        setPassword('')
        setProfileUrl(res.profileUrl)
      } else {
        setError(res.error)
      }
    } catch (err) {
      if (err instanceof Error && err.message === MFA_REQUIRED) {
        await navigate({ to: '/login', search: { mode: 'mfa', redirect: `/r/${slug}` } })
        return
      }
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const copySlug = async () => {
    await navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="no-print m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-rule bg-sheet p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="absolute top-4 right-4 rounded-full p-1.5 text-ink-soft hover:bg-blush"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <p className="label text-rose">Cross-posting</p>
        {profileUrl ? (
          <>
            <h2 className="mt-2 font-display text-3xl">You're on the shortlist.</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Your Relationship Resume now appears on your Social Match Game profile, so anyone who likes your card
              can read the full application.
            </p>
            <a href={profileUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full">
              View my Social Match profile <ArrowUpRight className="size-4" />
            </a>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-display text-3xl">Attach to your Social Match profile</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Sign in with your Social Match Game account and we'll pin this resume to your profile. Your password
              goes straight to The Social Match Game; we never keep it.
            </p>

            <form onSubmit={submit} className="mt-5 grid gap-3">
              <label className="grid gap-1">
                <span className="label text-ink-soft">Social Match email</span>
                <input
                  type="email"
                  className="field"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="label text-ink-soft">Social Match password</span>
                <input
                  type="password"
                  className="field"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {error ? (
                <p role="alert" className="text-sm text-rose">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="btn-primary mt-1" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
                {busy ? 'Submitting your application…' : 'Add to my profile'}
              </button>
              {busy ? (
                <p className="text-center text-xs text-ink-soft">
                  The Social Match Game takes its time reviewing applicants — this can take up to half a minute.
                </p>
              ) : null}
            </form>

            <div className="mt-6 border-t border-rule pt-4 text-xs text-ink-soft">
              <p>
                Joined The Social Match Game with Google or GitHub? Copy your resume username below, then paste it
                into <em>Edit details → Relationship Resume username</em> on your{' '}
                <a href={`${SOCIAL_MATCH_SITE}/dashboard`} target="_blank" rel="noreferrer" className="underline">
                  Social Match profile
                </a>
                .
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-rule bg-paper py-1.5 pr-1.5 pl-3">
                <span className="flex-1 truncate font-mono">{slug}</span>
                <button
                  type="button"
                  onClick={copySlug}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-blush"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
