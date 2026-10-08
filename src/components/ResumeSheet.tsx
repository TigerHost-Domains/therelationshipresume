import type { CSSProperties, ReactNode } from 'react'
import { BadgeCheck, Heart, MapPin, Mail, X } from 'lucide-react'
import { PROVIDER_LABELS, SEXES, type Sex, type SocialProvider } from '@/lib/member'
import { ACCENTS, type ResumeInput } from '@/lib/resume'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="label flex items-center gap-3 text-[var(--accent)]">
        {title}
        <span className="h-px flex-1 bg-[var(--accent)]/25" />
      </h3>
      {children}
    </section>
  )
}

function Bullets({ items, marker }: { items: string[]; marker: ReactNode }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[0.95rem] leading-snug">
          <span className="mt-[0.2rem] shrink-0 text-[var(--accent)]">{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Placeholder({ children }: { children: ReactNode }) {
  return <p className="text-sm italic text-ink-soft/60">{children}</p>
}

/** The printable one-page resume. Used on the landing page, in the builder preview and on shared pages. */
export function ResumeSheet({
  resume,
  compact = false,
}: {
  /** `sex` and `verifiedVia` come from the owner's identity on file, when there is one. */
  resume: ResumeInput & { sex?: Sex | null; verifiedVia?: SocialProvider | null }
  compact?: boolean
}) {
  const accent = ACCENTS[resume.accent]?.color ?? ACCENTS.rose.color
  const meta = [resume.age && `${resume.age} years`, resume.sex && SEXES[resume.sex], resume.location].filter(Boolean)

  return (
    <article
      style={{ '--accent': accent } as CSSProperties}
      className={`sheet @container relative overflow-hidden rounded-sm ${compact ? 'p-7 sm:p-9' : 'p-8 sm:p-12 lg:p-14 xl:p-16'}`}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--accent)]" />

      <header className="border-b border-ink/10 pb-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="label text-ink-soft">Relationship Resume</p>
          {resume.verifiedVia ? (
            <p
              className="label inline-flex items-center gap-1 text-[var(--accent)]"
              title="Name from their sign-in account; age and sex sworn under our truthful identity policy."
            >
              <BadgeCheck className="size-3.5" /> ID Checked · {PROVIDER_LABELS[resume.verifiedVia]}
            </p>
          ) : null}
        </div>
        <h1
          className={`mt-3 font-display font-semibold leading-[0.95] tracking-tight ${compact ? 'text-4xl @3xl:text-5xl' : 'text-5xl sm:text-6xl xl:text-7xl'}`}
        >
          {resume.name || <span className="text-ink/25">Your Name</span>}
        </h1>
        {resume.headline ? (
          <p className="mt-3 max-w-[40rem] font-display text-lg italic leading-snug text-ink-soft sm:text-xl">
            {resume.headline}
          </p>
        ) : null}
        {meta.length > 0 || resume.contact ? (
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-ink-soft">
            {meta.length > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[var(--accent)]" />
                {meta.join(' · ')}
              </span>
            ) : null}
            {resume.contact ? (
              <span className="inline-flex items-center gap-1.5 break-all">
                <Mail className="size-3.5 text-[var(--accent)]" />
                {resume.contact}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="grid gap-10 pt-8 @2xl:grid-cols-[1.55fr_1fr] @4xl:gap-14">
        <div className="space-y-9">
          <Section title="Objective">
            {resume.objective ? (
              <p className="max-w-[38rem] font-display text-[1.1rem] leading-[1.65]">{resume.objective}</p>
            ) : (
              <Placeholder>What are you hoping to find?</Placeholder>
            )}
          </Section>

          {resume.lookingFor ? (
            <Section title="Ideal Candidate">
              <p className="max-w-[38rem] leading-relaxed text-ink/85">{resume.lookingFor}</p>
            </Section>
          ) : null}

          <Section title="Relevant Experience">
            {resume.experience.length > 0 ? (
              <div className="space-y-6">
                {resume.experience.map((job, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h4 className="font-display text-lg font-semibold">{job.role}</h4>
                      {job.years ? <span className="font-mono text-xs tabular-nums text-ink-soft">{job.years}</span> : null}
                    </div>
                    {job.place ? <p className="text-sm italic text-ink-soft">{job.place}</p> : null}
                    {job.description ? (
                      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink/85">{job.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <Placeholder>Past relationships, life lessons, the dog you raised…</Placeholder>
            )}
          </Section>

          {resume.references.length > 0 ? (
            <Section title="References">
              <div className="grid gap-x-6 gap-y-5 @lg:grid-cols-2">
                {resume.references.map((ref, i) => (
                  <figure key={i} className="border-l-2 border-[var(--accent)]/40 pl-4">
                    <blockquote className="font-display text-[0.98rem] italic leading-snug">“{ref.quote}”</blockquote>
                    <figcaption className="mt-2 text-sm">
                      <span className="font-medium">{ref.name}</span>
                      {ref.relation ? <span className="text-ink-soft"> — {ref.relation}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Section>
          ) : null}
        </div>

        <aside className="space-y-8 @2xl:border-l @2xl:border-ink/10 @2xl:pl-8 @4xl:pl-12">
          <Section title="Core Qualities">
            {resume.qualities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {resume.qualities.map((q, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] px-3 py-1 text-sm"
                  >
                    {q}
                  </span>
                ))}
              </div>
            ) : (
              <Placeholder>Kind, curious, punctual…</Placeholder>
            )}
          </Section>

          <Section title="Likes">
            {resume.likes.length > 0 ? (
              <Bullets items={resume.likes} marker={<Heart className="size-3.5 fill-current" />} />
            ) : (
              <Placeholder>The things that light you up.</Placeholder>
            )}
          </Section>

          <Section title="Dislikes">
            {resume.dislikes.length > 0 ? (
              <Bullets items={resume.dislikes} marker={<span className="font-mono text-xs">—</span>} />
            ) : (
              <Placeholder>Pet peeves welcome.</Placeholder>
            )}
          </Section>

          {resume.dealbreakers.length > 0 ? (
            <Section title="Dealbreakers">
              <Bullets items={resume.dealbreakers} marker={<X className="size-3.5" strokeWidth={3} />} />
            </Section>
          ) : null}

          {resume.loveLanguages.length > 0 ? (
            <Section title="Love Languages">
              <ol className="space-y-1">
                {resume.loveLanguages.map((l, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[var(--accent)]">0{i + 1}</span>
                    <span className="font-display text-[1.02rem]">{l}</span>
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}
        </aside>
      </div>
    </article>
  )
}
