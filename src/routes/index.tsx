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
    title: 'Fill in the Page',
    body: 'Qualities, likes, dislikes, dealbreakers and love languages, plus “experience” in the field. It typesets as you type.',
  },
  {
    no: '02',
    tag: 'Vouch',
    icon: Quote,
    title: 'Collect References',
    body: 'Quotes from the people who know you best. Your ex-roommate, your sister, the barista who’s seen it all.',
  },
  {
    no: '03',
    tag: 'Send',
    icon: Send,
    title: 'Share One Link',
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

const PHOTOS = [
  {
    src: '/images/black-love/field-embrace.jpg',
    alt: 'A Black couple embracing in a sunlit field, the man resting his head on the woman’s arm',
    tag: 'Exhibit A · Long-Term Position',
    credit: { name: 'Ricardo Esquivel', url: 'https://unsplash.com/photos/O8i3pW1leYs' },
    className: 'col-span-2 row-span-2 lg:col-span-5 lg:row-span-4',
  },
  {
    src: '/images/black-love/forehead-kiss.jpg',
    alt: 'A Black man kissing his partner’s forehead outdoors on a bright day',
    tag: 'References: Glowing',
    credit: { name: 'LaShawn Dobbs', url: 'https://unsplash.com/photos/Qx-jCqiTezY' },
    className: 'col-span-2 lg:col-span-4 lg:row-span-2',
  },
  {
    src: '/images/black-love/after-dark.jpg',
    alt: 'A Black couple posing together in black tank tops against a dark backdrop',
    tag: 'Culture Fit: Perfect',
    credit: { name: 'MONIQUE BEN', url: 'https://unsplash.com/photos/gW_uUms6Rrw' },
    className: 'lg:col-span-3 lg:row-span-2 [&_img]:object-top',
  },
  {
    src: '/images/black-love/hands-on-heart.jpg',
    alt: 'A woman’s hands, wearing an engagement ring, resting on the chest of a Black man in a tuxedo',
    tag: 'Tenure: For Life',
    credit: { name: 'Clay Banks', url: 'https://unsplash.com/photos/_3Sud4WPPYE' },
    className: 'lg:col-span-3 lg:row-span-2',
  },
  {
    src: '/images/black-love/close-embrace.jpg',
    alt: 'A Black couple holding each other close, about to kiss',
    tag: 'Mutual Offer Accepted',
    credit: { name: 'One zone Studio', url: 'https://unsplash.com/photos/9B4hD5joEk4' },
    className: 'col-span-2 lg:col-span-4 lg:row-span-2',
  },
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
        <OnTheRecord />
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
    <section className="mx-auto grid max-w-site items-center gap-16 px-6 pt-8 pb-24 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:pt-14 xl:gap-24 xl:pb-32">
      <div>
        <p className="label inline-flex animate-in items-center gap-2 rounded-full border border-gold/30 bg-velvet/70 px-3 py-1.5 text-gold-bright fade-in fill-mode-both duration-700">
          <Heart className="size-3 animate-pulse-heart fill-rose text-rose motion-safe-only" />
          Now Accepting Applications
        </p>
        <h1 className="mt-7 animate-in font-display text-[3.4rem] leading-[0.92] font-medium tracking-tight fade-in slide-in-from-bottom-4 fill-mode-both delay-100 duration-700 sm:text-[5.5rem] xl:text-[6.5rem] 2xl:text-[7.25rem]">
          We’re Here to Find <em className="gold-foil pr-2 font-semibold">Love,</em>
          <span className="block text-rose italic">Baby.</span>
        </h1>
        <p className="mt-7 max-w-[34rem] animate-in text-lg leading-relaxed text-smoke xl:text-xl xl:leading-relaxed fade-in slide-in-from-bottom-3 fill-mode-both delay-200 duration-700">
          Dating profiles show what you look like. A Relationship Resume shows what it’s like to love you: what you
          adore, what you won’t tolerate, and why you’re worth the second date. One page, one link.
        </p>
        <div className="mt-9 flex animate-in flex-wrap items-center gap-3 fade-in slide-in-from-bottom-3 fill-mode-both delay-300 duration-700">
          <Link
            to="/create"
            className="btn-primary px-7 py-3.5 text-base shadow-[0_10px_40px_-10px_rgba(179,38,62,0.9)]"
          >
            Write Your Resume <ArrowRight className="size-4" />
          </Link>
          <a href="#example" className={`${ghostDark} px-7 py-3.5 text-base`}>
            Read an Example
          </a>
        </div>
        <p className="label mt-8 animate-in text-smoke/80 fade-in fill-mode-both delay-500 duration-700">
          Free · Sign In with Google or GitHub · ID-Checked Members · Only You Hold the Pen
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-md animate-in fade-in zoom-in-95 fill-mode-both delay-200 duration-1000 lg:max-w-none">
        <div className="absolute inset-0 translate-x-6 translate-y-5 rotate-[5deg] rounded-sm bg-velvet-soft" aria-hidden />
        <div className="absolute inset-0 -translate-x-4 translate-y-3 -rotate-[4deg] rounded-sm bg-cream/80" aria-hidden />
        <div
          className="relative max-h-[540px] animate-drift xl:max-h-[640px] overflow-hidden rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] motion-safe-only [--tilt:-1.5deg]"
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
            <span className="block font-display text-base text-cream">It’s a Match.</span>
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

function OnTheRecord() {
  return (
    <section className="mx-auto max-w-site px-6 pt-28 lg:px-10 xl:pt-36" aria-labelledby="on-the-record">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="label text-gold">Proof of Concept</p>
          <h2 id="on-the-record" className="mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
            Black Love, <em className="gold-foil">on the Record.</em>
          </h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-smoke lg:justify-self-end">
          Tender, joyful, and built to last. Here’s to the partnerships with a track record worth putting on paper,
          and to yours being next.
        </p>
      </div>

      <div className="mt-14 grid auto-rows-[170px] grid-cols-2 gap-4 sm:auto-rows-[220px] lg:auto-rows-[150px] lg:grid-cols-12 lg:gap-5 xl:auto-rows-[185px] 2xl:auto-rows-[215px]">
        {PHOTOS.map(({ src, alt, tag, className }) => (
          <figure
            key={src}
            className={`group relative overflow-hidden rounded-2xl border border-ember bg-velvet ${className}`}
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.04]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent"
              aria-hidden
            />
            <figcaption className="label absolute bottom-3 left-3 rounded-full border border-gold/30 bg-night/70 px-3 py-1.5 text-gold-bright backdrop-blur sm:bottom-4 sm:left-4">
              {tag}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-5 text-xs text-smoke/70">
        Photos by{' '}
        {PHOTOS.map(({ credit }, i) => (
          <span key={credit.url}>
            <a href={credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-gold-bright hover:underline">
              {credit.name}
            </a>
            {i < PHOTOS.length - 2 ? ', ' : i === PHOTOS.length - 2 ? ' and ' : ''}
          </span>
        ))}{' '}
        on Unsplash.
      </p>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-site px-6 py-28 lg:px-10 xl:py-36">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <p className="label text-gold">How It Works</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
            Skip the Small Talk. <em className="text-rose">Send the Summary.</em>
          </h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-smoke lg:justify-self-end">
          Five minutes from blank page to a beautifully set, one-page case for why you’re a catch.
        </p>
      </div>

      <ol className="mt-16 grid gap-5 md:grid-cols-3 xl:gap-7">
        {STEPS.map(({ no, tag, icon: Icon, title, body }, i) => (
          <li
            key={no}
            className={`group relative rounded-2xl border border-ember bg-velvet/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/50 xl:p-9 ${
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
            <h3 className="mt-2 font-display text-2xl text-cream xl:text-[1.75rem]">{title}</h3>
            <p className="mt-2 leading-relaxed text-smoke">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Lounge() {
  return (
    <section className="mx-auto max-w-site px-6 pt-10 pb-28 lg:px-10 xl:pb-36">
      <p className="label text-gold">The Members’ Lounge</p>
      <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl xl:text-6xl">
        Your Love Life, <em className="gold-foil">Under Lock and Key.</em>
      </h2>

      <div className="mt-14 grid gap-5 md:grid-cols-6 xl:gap-7">
        <article className="relative overflow-hidden rounded-2xl border border-ember bg-gradient-to-br from-velvet-soft to-velvet p-8 xl:p-10 md:col-span-4">
          <KeyRound className="size-6 text-gold-bright" />
          <h3 className="mt-5 font-display text-3xl text-cream">Only You Hold the Pen.</h3>
          <p className="mt-3 max-w-md leading-relaxed text-smoke">
            Your resume is tied to your account. Anyone can read it; nobody can rewrite it. Revise it from any
            device whenever your dealbreakers evolve.
          </p>
          <div className="pointer-events-none absolute -right-10 -bottom-12 font-display text-[11rem] leading-none text-cream/[0.04] italic" aria-hidden>
            ♥
          </div>
        </article>

        <article className="rounded-2xl border border-rose/30 bg-rose/10 p-8 xl:p-10 md:col-span-2">
          <Users className="size-6 text-rose" />
          <h3 className="mt-5 font-display text-2xl text-cream">Bring a Wingperson.</h3>
          <p className="mt-3 leading-relaxed text-smoke">
            Add your best friend as a co-editor. They know your best angles better than you do.
          </p>
        </article>

        <article className="rounded-2xl border border-ember bg-velvet/80 p-8 xl:p-10 md:col-span-3">
          <ShieldCheck className="size-6 text-gold-bright" />
          <h3 className="mt-5 font-display text-2xl text-cream">A Second Reference Check.</h3>
          <p className="mt-3 leading-relaxed text-smoke">
            Turn on an authenticator app and every edit needs a 6-digit code. Heartbreak-proof, or at least
            hijack-proof.
          </p>
        </article>

        <article className="rounded-2xl border border-ember bg-velvet/80 p-8 xl:p-10 md:col-span-3">
          <p className="label text-gold">Sign In Your Way</p>
          <h3 className="mt-4 font-display text-2xl text-cream">One Tap and You’re on the List.</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Google', 'GitHub'].map((p) => (
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
    <section id="example" className="relative scroll-mt-6 bg-paper py-28 text-ink xl:py-36">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="label text-rose">Example Application</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl xl:text-7xl">
              Meet Juniper. <em className="text-rose">Very Employable.</em>
            </h2>
          </div>
          <Link to="/create" className="btn shrink-0 bg-ink text-cream hover:bg-rose">
            Start from Scratch <ArrowRight className="size-4" />
          </Link>
        </div>
        <ResumeSheet resume={sampleResume} />
      </div>
    </section>
  )
}

function Companion() {
  return (
    <section className="mx-auto max-w-site px-6 py-28 lg:px-10 xl:py-36">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-velvet-soft via-velvet to-night p-10 sm:p-14 xl:p-20">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/10 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="label text-gold">A Companion to The Social Match Game</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl xl:text-6xl">
              Found Your People? <em className="text-rose">Now Send Your Resume.</em>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-smoke">
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
              Write Your Resume First
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Closing() {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-6 pb-32 text-center xl:max-w-5xl xl:pb-40">
      <Heart className="mx-auto size-8 animate-pulse-heart fill-rose text-rose motion-safe-only" />
      <p className="mt-8 font-display text-3xl leading-snug italic sm:text-[2.6rem] xl:text-[3.25rem] xl:leading-[1.2]">
        “The position of <span className="gold-foil not-italic">great love</span> is open. Applications close when
        you stop looking.”
      </p>
      <Link
        to="/create"
        className="btn-primary mt-12 px-8 py-4 text-base shadow-[0_10px_40px_-10px_rgba(179,38,62,0.9)]"
      >
        Write Yours in Five Minutes <ArrowRight className="size-4" />
      </Link>
    </section>
  )
}
