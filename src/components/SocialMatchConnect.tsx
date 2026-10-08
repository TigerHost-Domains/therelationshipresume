import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, Heart, Loader2, X } from 'lucide-react'
import { MFA_REQUIRED } from '@/lib/mfa'
import { SOCIAL_MATCH_API } from '@/lib/social-match'
import { cn } from '@/lib/utils'
import { sendToSocialMatch } from '@/server/resumes.functions'

/**
 * Opens the dialog that sends this resume to The Social Match Game, which attaches it to the member's profile. `compact` renders a small text
 * action for lists (the account page); `returnTo` is where a 2FA prompt sends the member back to.
 */
export function SocialMatchButton({
  slug,
  className,
  compact,
  returnTo,
}: {
  slug: string
  className?: string
  compact?: boolean
  returnTo?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        className={cn(compact ? 'inline-flex items-center gap-1 text-ink-soft hover:text-ink' : 'btn-ghost', className)}
        onClick={() => setOpen(true)}
      >
        <Heart className={compact ? 'size-3.5' : 'size-4'} /> Add to Social Match
      </button>
      {open ? (
        <SocialMatchDialog slug={slug} returnTo={returnTo ?? `/r/${slug}`} onClose={() => setOpen(false)} />
      ) : null}
    </>
  )
}

function SocialMatchDialog({ slug, returnTo, onClose }: { slug: string; returnTo: string; onClose: () => void }) {
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [joinUrl, setJoinUrl] = useState<string>()

  useEffect(() => {
    dialog.current?.showModal()
    // The Social Match Game's server naps when idle. Nudge it now so it's awake by the time we ask for an invite.
    fetch(`${SOCIAL_MATCH_API}/api/auth/providers`, { mode: 'no-cors' }).catch(() => {})
  }, [])

  const send = async () => {
    setBusy(true)
    setError(undefined)
    try {
      const res = await sendToSocialMatch({ data: { slug } })
      if (res.ok) {
        setJoinUrl(res.joinUrl)
        window.location.assign(res.joinUrl)
      } else {
        setError(res.error)
      }
    } catch (err) {
      if (err instanceof Error && err.message === MFA_REQUIRED) {
        await navigate({ to: '/login', search: { mode: 'mfa', redirect: returnTo } })
        return
      }
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
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

        <p className="label text-rose">Cross-Posting</p>
        {joinUrl ? (
          <>
            <h2 className="mt-2 font-display text-3xl">Application Forwarded.</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Taking you to The Social Match Game to finish the interview. If nothing happens, use the button below.
            </p>
            <a href={joinUrl} className="btn-primary mt-6 w-full">
              Continue to The Social Match Game <ArrowUpRight className="size-4" />
            </a>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-display text-3xl">Send to The Social Match Game</h2>
            <p className="mt-2 text-sm text-ink-soft">
              We'll hand your resume and your verified name, age and sex to The Social Match Game, then send you over to finish the paperwork:
            </p>
            <ol className="mt-3 grid list-decimal gap-1 pl-5 text-sm text-ink-soft">
              <li>Sign in there with the same Google or GitHub account you use here — they check it matches.</li>
              <li>Confirm you're 21 or older and accept their policies.</li>
              <li>Your resume is pinned to your profile automatically.</li>
            </ol>
            {error ? (
              <p role="alert" className="mt-4 text-sm text-rose">
                {error}
              </p>
            ) : null}
            <button type="button" className="btn-primary mt-6 w-full" onClick={send} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
              {busy ? 'Forwarding Your Application…' : 'Send My Resume'}
            </button>
            {busy ? (
              <p className="mt-2 text-center text-xs text-ink-soft">
                The Social Match Game can take up to a minute to wake up after a quiet spell.
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-ink-soft">
                The invite is good for a week, and no passwords change hands.
              </p>
            )}
          </>
        )}
      </div>
    </dialog>
  )
}
