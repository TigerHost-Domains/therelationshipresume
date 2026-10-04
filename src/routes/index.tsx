import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, Heart, KeyRound, Send, ShieldCheck, Users, PenLine, Quote } from 'lucide-react'
import { ResumeSheet } from '@/components/ResumeSheet'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { sampleResume } from '@/lib/resume'

export const Route = createFileRoute('/')({
  component: Landing,
})

const COMPANION_URL = 'https://socialmatchapp.onrender.com/'

const STEPS = [
  {
    no: '01',
    tag: 'Write',
    icon: PenLine,
    title: 'Fill in the page',
    body: 'Qualities, likes, dislikes, dealbreakers and love languages, plus “experience” in the field. It typesets as you type.',
  },
  {
    no: '02',
    tag: 'Vouch',
    icon: Quote,
    title: 'Collect references',
    body: 'Quotes from the people who know you best. Your ex-roommate, your sister, the barista who’s seen it all.',
  },
  {
    no: '03',
    tag: 'Send',
    icon: Send,
    title: 'Share one link',
    body: 'Drop it in your dating profile, your bio, or hand it to the friend who swears they know someone perfect.',
  },
]

const SECTIONS = [
  'Objective',
  'Ideal Candidate',
  'Core Qualities',
  'Likes',
  'Dislikes',
  'Dealbreakers',
  'Love Languages',
  'Relevant Experience',
  'References',
]

const ghostDark =
  'btn border border-cream/20 text-cream hover:border-gold hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-gold'

function Landing() {
  return (
    <div className="after-hours relative min-h-screen overflow-hidden">
      <div className="film-grain" aria-hidden />
      <SiteHeader tone="dark" />

      <main className="relative z-[2]">
        <Hero />
        <Marquee />
        <HowItWorks />
        <Lounge />
        <Example />
        <Companion />
        <Closing />
      </main>

      <SiteFooter tone="dark" />
    </div>
  )
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 pt-8 pb-24 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
      <div>
        <p className="label inline-flex animate-in items-center gap-2 rounded-full border border-gold/30 bg-velvet/70 px-3 py-1.5 text-gold-bright fade-in fill-mode-both duration-700">
          <Heart className="size-3 animate-pulse-heart fill-rose text-rose motion-safe-only" />
          Now accepting applications
        </p>
        <h1 className="mt-7 animate-in font-display text-[3.4rem] leading-[0.92] font-medium tracking-tight fade-in slide-in-from-bottom-4 fill-mode-both delay-100 duration-700 sm:text-[5.5rem]">
          We’re here to find <em className="gold-foil pr-2 font-semibold">love,</em>
          <span className="block text-rose italic">baby.</span>
        </h1>
        <p className="mt-7 max-w-lg animate-in text-lg leading-relaxed text-smoke fade-in slide-in-from-bottom-3 fill-mode-both delay-200 duration-700">
          Dating profiles show what you look like. A Relationship Resume shows what it’s like to love you: what you
          adore, what you won’t tolerate, and why you’re worth the second date. One page, one link.
        </p>
        <div className="mt-9 flex animate-in flex-wrap items-center gap-3 fade-in slide-in-from-bottom-3 fill-mode-both delay-300 duration-700">
          <Link
            to="/create"
            className="btn-primary px-7 py-3.5 text-base shadow-[0_10px_40px_-10px_rgba(179,38,62,0.9)]"
          >
            Write your resume <ArrowRight className="size-4" />
          </Link>
          <a href="#example" className={`${ghostDark} px-7 py-3.5 text-base`}>
            Read an example
          </a>
        </div>
        <p className="label mt-8 animate-in text-smoke/80 fade-in fill-mode-both delay-500 duration-700">
          Free · Sign in with Google, Facebook or GitHub · Only you hold the pen
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-md animate-in fade-in zoom-in-95 fill-mode-both delay-200 duration-1000 lg:max-w-none">
        <div className="absolute inset-0 translate-x-6 translate-y-5 rotate-[5deg] rounded-sm bg-velvet-soft" aria-hidden />
        <div className="absolute inset-0 -translate-x-4 translate-y-3 -rotate-[4deg] rounded-sm bg-cream/80" aria-hidden />
        <div
          className="relative max-h-[540px] animate-drift overflow-hidden rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] motion-safe-only [--tilt:-1.5deg]"
        >
          <ResumeSheet resume={sampleResume} compact />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sheet to-transparent" />
        </div>

        {/* Wax seal */}
        <div className="absolute -bottom-7 -left-5 grid size-28 rotate-[-12deg] place-items-center rounded-full bg-rose text-center shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)] ring-4 ring-gold/70 ring-offset-4 ring-offset-night sm:-left-10">
          <span className="font-display text-xl leading-none text-cream italic">
            Hired
            <Heart className="mx-auto mt-1 size-4 fill-cream" />
          </span>
        </div>

        {/* Match notification */}
        <div className="absolute -top-5 -right-3 flex rotate-[3deg] items-center gap-3 rounded-xl border border-gold/25 bg-velvet/95 px-4 py-3 shadow-2xl backdrop-blur sm:-right-8">
          <span className="grid size-9 place-items-center rounded-full bg-rose/15">
            <Heart className="size-4 fill-rose text-rose" />
          </span>
          <span className="text-sm leading-tight">
            <span className="block font-display text-base text-cream">It’s a match.</span>
            <span className="text-smoke">References checked out.</span>
          </span>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const row = [...SECTIONS, ...SECTIONS]
  return (
    <section className="border-y border-ember bg-velvet/60" aria-label="Sections on every resume">
      <div className="overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 motion-safe-only">
          {row.map((s, i) => (
            <span key={i} className="label flex items-center gap-10 whitespace-nowrap text-gold" aria-hidden={i >= SECTIONS.length}>
              {s}
              <Heart className="size-2.5 fill-rose/70 text-rose/70" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <p className="label text-gold">How it works</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl">
            Skip the small talk. <em className="text-rose">Send the summary.</em>
          </h2>
        </div>
        <p className="max-w-md text-smoke lg:justify-self-end">
          Five minutes from blank page to a beautifully set, one-page case for why you’re a catch.
        </p>
      </div>

      <ol className="mt-16 grid gap-5 md:grid-cols-3">
        {STEPS.map(({ no, tag, icon: Icon, title, body }, i) => (
          <li
            key={no}
            className={`group relative rounded-2xl border border-ember bg-velvet/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/50 ${
              i === 1 ? 'md:translate-y-10 md:hover:translate-y-9' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="label text-gold">
                {no} / {tag}
              </span>
              <Icon className="size-5 text-smoke transition group-hover:text-gold-bright" />
            </div>
            <span className="mt-6 block font-display text-7xl leading-none text-cream/10 transition group-hover:text-rose/40">
              {no}
            </span>
            <h3 className="mt-2 font-display text-2xl text-cream">{title}</h3>
            <p className="mt-2 leading-relaxed text-smoke">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Lounge() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-28">
      <p className="label text-gold">The members’ lounge</p>
      <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl">
        Your love life, <em className="gold-foil">under lock and key.</em>
      </h2>

      <div className="mt-14 grid gap-5 md:grid-cols-6">
        <article className="relative overflow-hidden rounded-2xl border border-ember bg-gradient-to-br from-velvet-soft to-velvet p-8 md:col-span-4">
          <KeyRound className="size-6 text-gold-bright" />
          <h3 className="mt-5 font-display text-3xl text-cream">Only you hold the pen.</h3>
          <p className="mt-3 max-w-md leading-relaxed text-smoke">
            Your resume is tied to your account. Anyone can read it; nobody can rewrite it. Revise it from any
            device whenever your dealbreakers evolve.
          </p>
          <div className="pointer-events-none absolute -right-10 -bottom-12 font-display text-[11rem] leading-none text-cream/[0.04] italic" aria-hidden>
            ♥
          </div>
        </article>

        <article className="rounded-2xl border border-rose/30 bg-rose/10 p-8 md:col-span-2">
          <Users className="size-6 text-rose" />
          <h3 className="mt-5 font-display text-2xl text-cream">Bring a wingperson.</h3>
          <p className="mt-3 leading-relaxed text-smoke">
            Add your best friend as a co-editor. They know your best angles better than you do.
          </p>
        </article>

        <article className="rounded-2xl border border-ember bg-velvet/80 p-8 md:col-span-3">
          <ShieldCheck className="size-6 text-gold-bright" />
          <h3 className="mt-5 font-display text-2xl text-cream">A second reference check.</h3>
          <p className="mt-3 leading-relaxed text-smoke">
            Turn on an authenticator app and every edit needs a 6-digit code. Heartbreak-proof, or at least
            password-proof.
          </p>
        </article>

        <article className="rounded-2xl border border-ember bg-velvet/80 p-8 md:col-span-3">
          <p className="label text-gold">Sign in your way</p>
          <h3 className="mt-4 font-display text-2xl text-cream">One tap and you’re on the list.</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Google', 'Facebook', 'GitHub', 'Email'].map((p) => (
              <span key={p} className="rounded-full border border-cream/15 px-4 py-1.5 text-sm text-cream">
                {p}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function Example() {
  return (
    <section id="example" className="relative scroll-mt-6 bg-paper py-28 text-ink">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="label text-rose">Example application</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">
              Meet Juniper. <em className="text-rose">Very employable.</em>
            </h2>
          </div>
          <Link to="/create" className="btn shrink-0 bg-ink text-cream hover:bg-rose">
            Start from scratch <ArrowRight className="size-4" />
          </Link>
        </div>
        <ResumeSheet resume={sampleResume} />
      </div>
    </section>
  )
}

function Companion() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-velvet-soft via-velvet to-night p-10 sm:p-14">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/10 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="label text-gold">A companion to The Social Match Game</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl">
              Found your people? <em className="text-rose">Now send your resume.</em>
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-smoke">
              The Social Match Game is where you meet the community and the details that make each member themselves.
              The Relationship Resume is the follow-up: the one page that tells your match what a second date would
              actually be like.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <a
              href={COMPANION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-gold px-7 py-3.5 text-base text-night hover:bg-gold-bright"
            >
              Play The Social Match Game <ArrowUpRight className="size-4" />
            </a>
            <Link to="/create" className={`${ghostDark} px-7 py-3.5 text-base`}>
              Write your resume first
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Closing() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-6 pb-32 text-center">
      <Heart className="mx-auto size-8 animate-pulse-heart fill-rose text-rose motion-safe-only" />
      <p className="mt-8 font-display text-3xl leading-snug italic sm:text-[2.6rem]">
        “The position of <span className="gold-foil not-italic">great love</span> is open. Applications close when
        you stop looking.”
      </p>
      <Link
        to="/create"
        className="btn-primary mt-12 px-8 py-4 text-base shadow-[0_10px_40px_-10px_rgba(179,38,62,0.9)]"
      >
        Write yours in five minutes <ArrowRight className="size-4" />
      </Link>
    </section>
  )
}
