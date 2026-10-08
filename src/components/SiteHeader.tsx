import { Link } from '@tanstack/react-router'
import { useIdentity } from '@/lib/identity-context'
import { cn } from '@/lib/utils'

export function Monogram({ className = '' }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-grid size-8 place-items-center rounded-full border border-rose/40 font-display text-[0.95rem] italic text-rose',
        className,
      )}
      aria-hidden
    >
      R♥
    </span>
  )
}

type Tone = 'light' | 'dark'

export function SiteHeader({ tone = 'light' }: { tone?: Tone }) {
  const { user, ready, logout } = useIdentity()
  const navLink =
    tone === 'dark'
      ? 'whitespace-nowrap px-2 py-2 text-sm text-smoke transition hover:text-cream sm:px-3'
      : 'whitespace-nowrap px-2 py-2 text-sm text-ink-soft hover:text-ink sm:px-3'
  return (
    <header className="no-print relative z-10 mx-auto flex max-w-site items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
      <Link to="/" className="flex items-center gap-3">
        <Monogram className={tone === 'dark' ? 'border-gold/50 text-gold-bright' : ''} />
        <span className="font-display text-base leading-tight tracking-tight sm:text-lg">
          The Relationship <em className={tone === 'dark' ? 'text-gold-bright' : 'text-rose'}>Resume</em>
        </span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        <Link to="/" hash="example" className={`hidden sm:inline ${navLink}`}>
          See an Example
        </Link>
        {ready &&
          (user ? (
            <>
            <Link to="/account" className={navLink}>
              Account
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className={`hidden sm:inline ${navLink}`}
              title={user.email}
            >
              Sign Out
            </button>
            </>
          ) : (
            <Link to="/login" className={navLink}>
              Sign In
            </Link>
          ))}
        <Link to="/create" className="btn-primary whitespace-nowrap px-4 sm:px-5">
          Write Yours
        </Link>
      </nav>
    </header>
  )
}

export function SiteFooter({ tone = 'light' }: { tone?: Tone }) {
  return (
    <footer
      className={`no-print relative z-10 mx-auto max-w-site border-t px-6 py-8 text-sm lg:px-10 ${
        tone === 'dark' ? 'border-ember text-smoke' : 'mt-24 border-rule text-ink-soft'
      }`}
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <span className="font-display italic">References available upon request.</span>
        <span className="label">The Relationship Resume · Est. 2026</span>
      </div>
    </footer>
  )
}
