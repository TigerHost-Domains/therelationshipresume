import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Eye, PenLine, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { ResumeSheet } from '@/components/ResumeSheet'
import {
  ACCENTS,
  LOVE_LANGUAGES,
  resumeInputSchema,
  sampleResume,
  type ResumeInput,
} from '@/lib/resume'

type ListKey = 'qualities' | 'likes' | 'dislikes' | 'dealbreakers'

function Step({ n, title, hint, children }: { n: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-rule pt-7 first:border-t-0 first:pt-0">
      <legend className="contents">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-rose">{n}</span>
          <h2 className="font-display text-2xl font-medium tracking-tight">{title}</h2>
        </div>
        {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between">
        <span className="label text-ink-soft">{label}</span>
        {note ? <span className="text-xs text-ink-soft/70">{note}</span> : null}
      </span>
      {children}
    </label>
  )
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
  max,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder: string
  suggestions?: string[]
  max: number
}) {
  const [draft, setDraft] = useState('')
  const add = (value: string) => {
    const v = value.trim().slice(0, 80)
    if (!v || values.length >= max || values.some((x) => x.toLowerCase() === v.toLowerCase())) return
    onChange([...values, v])
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
      setDraft('')
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1))
    }
  }
  const open = suggestions.filter((s) => !values.includes(s)).slice(0, 5)

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="label text-ink-soft">{label}</span>
        <span className="text-xs text-ink-soft/70">
          {values.length}/{max}
        </span>
      </div>
      <div className="field flex min-h-11 flex-wrap items-center gap-1.5 py-1.5">
        {values.map((v, i) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-0.5 text-sm text-rose-deep">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="rounded-full p-0.5 hover:bg-rose/15"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            add(draft)
            setDraft('')
          }}
          placeholder={values.length ? 'Add another…' : placeholder}
          disabled={values.length >= max}
          className="min-w-[8rem] flex-1 bg-transparent py-1 text-[0.95rem] outline-none placeholder:text-ink-soft/50"
        />
      </div>
      {open.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {open.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed border-ink/20 px-2.5 py-0.5 text-xs text-ink-soft hover:border-rose hover:text-rose"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const SUGGESTIONS: Record<ListKey, string[]> = {
  qualities: ['Great listener', 'Patient', 'Funny', 'Ambitious', 'Affectionate', 'Honest', 'Adventurous', 'Calm in a crisis'],
  likes: ['Live music', 'Cooking together', 'Hiking', 'Road trips', 'Museums', 'Cozy nights in', 'Travel', 'Coffee shops'],
  dislikes: ['Bad tippers', 'Loud chewing', 'Small talk', 'Being rushed', 'Reality TV', 'Mornings'],
  dealbreakers: ['Dishonesty', 'Rude to others', "Doesn't want kids", 'Wants kids', 'Smoking', 'No sense of humor'],
}

export function ResumeEditor({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: ResumeInput
  submitLabel: string
  onSubmit: (resume: ResumeInput) => Promise<void>
}) {
  const [resume, setResume] = useState<ResumeInput>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')

  const set = <K extends keyof ResumeInput>(key: K, value: ResumeInput[K]) =>
    setResume((r) => ({ ...r, [key]: value }))

  const toggleLanguage = (lang: string) =>
    set(
      'loveLanguages',
      resume.loveLanguages.includes(lang)
        ? resume.loveLanguages.filter((l) => l !== lang)
        : [...resume.loveLanguages, lang],
    )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleaned: ResumeInput = {
      ...resume,
      experience: resume.experience.filter((x) => x.role.trim()),
      references: resume.references.filter((x) => x.name.trim() && x.quote.trim()),
    }
    const parsed = resumeInputSchema.safeParse(cleaned)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your entries.')
      return
    }
    setSaving(true)
    try {
      await onSubmit(parsed.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="no-print sticky top-0 z-10 -mx-4 mb-6 flex gap-2 bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        {(['edit', 'preview'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMobileView(v)}
            className={`btn flex-1 ${mobileView === v ? 'bg-ink text-paper' : 'border border-ink/15'}`}
          >
            {v === 'edit' ? <PenLine className="size-4" /> : <Eye className="size-4" />}
            {v === 'edit' ? 'Write' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className={`space-y-8 pb-16 ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}>
          <Step n="01" title="The basics" hint="How you'd introduce yourself at the top of the page.">
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
              <Field label="Name *">
                <input className="field" value={resume.name} maxLength={60} onChange={(e) => set('name', e.target.value)} placeholder="First name, or first + last initial" required />
              </Field>
              <Field label="Age">
                <input className="field" value={resume.age} maxLength={10} onChange={(e) => set('age', e.target.value)} placeholder="32" />
              </Field>
            </div>
            <Field label="Location">
              <input className="field" value={resume.location} maxLength={80} onChange={(e) => set('location', e.target.value)} placeholder="City, State" />
            </Field>
            <Field label="Headline" note={`${resume.headline.length}/120`}>
              <input className="field" value={resume.headline} maxLength={120} onChange={(e) => set('headline', e.target.value)} placeholder="Weekend hiker, weeknight cook, lifelong romantic" />
            </Field>
            <Field label="How to reach you" note="Shown publicly">
              <input className="field" value={resume.contact} maxLength={160} onChange={(e) => set('contact', e.target.value)} placeholder="Email, Instagram handle, or dating-app username" />
            </Field>
          </Step>

          <Step n="02" title="Objective" hint="The one-paragraph pitch. What are you looking for in love?">
            <Field label="Objective" note={`${resume.objective.length}/600`}>
              <textarea className="field min-h-28" value={resume.objective} maxLength={600} onChange={(e) => set('objective', e.target.value)} placeholder="To find a partner who…" />
            </Field>
            <Field label="Ideal candidate" note={`${resume.lookingFor.length}/400`}>
              <textarea className="field min-h-24" value={resume.lookingFor} maxLength={400} onChange={(e) => set('lookingFor', e.target.value)} placeholder="Describe the person you'd love to meet." />
            </Field>
          </Step>

          <Step n="03" title="Qualities & preferences" hint="Press Enter after each one, or tap a suggestion.">
            <TagInput label="Core qualities" values={resume.qualities} onChange={(v) => set('qualities', v)} placeholder="What makes you a great partner?" suggestions={SUGGESTIONS.qualities} max={12} />
            <TagInput label="Likes" values={resume.likes} onChange={(v) => set('likes', v)} placeholder="Things you love" suggestions={SUGGESTIONS.likes} max={16} />
            <TagInput label="Dislikes" values={resume.dislikes} onChange={(v) => set('dislikes', v)} placeholder="Pet peeves" suggestions={SUGGESTIONS.dislikes} max={16} />
            <TagInput label="Dealbreakers" values={resume.dealbreakers} onChange={(v) => set('dealbreakers', v)} placeholder="Non-negotiables" suggestions={SUGGESTIONS.dealbreakers} max={10} />
            <div className="space-y-2">
              <span className="label text-ink-soft">Love languages · tap in order of importance</span>
              <div className="flex flex-wrap gap-2">
                {LOVE_LANGUAGES.map((lang) => {
                  const idx = resume.loveLanguages.indexOf(lang)
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
                        idx >= 0 ? 'border-rose bg-rose text-white' : 'border-ink/15 hover:border-rose/60'
                      }`}
                    >
                      {idx >= 0 ? <span className="font-mono text-xs opacity-80">{idx + 1}</span> : null}
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>
          </Step>

          <Step n="04" title="Relevant experience" hint="Past relationships, lessons learned, or anything that proves you're ready.">
            {resume.experience.map((job, i) => (
              <div key={i} className="relative space-y-3 rounded-lg border border-rule bg-sheet/60 p-4">
                <button
                  type="button"
                  aria-label="Remove experience"
                  onClick={() => set('experience', resume.experience.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 rounded-full p-1.5 text-ink-soft hover:bg-blush hover:text-rose"
                >
                  <Trash2 className="size-4" />
                </button>
                <div className="grid gap-3 pr-8 sm:grid-cols-[1fr_9rem]">
                  <input className="field" placeholder="Role (e.g. Long-term Partner)" value={job.role} maxLength={80}
                    onChange={(e) => set('experience', resume.experience.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} />
                  <input className="field" placeholder="2019 – 2023" value={job.years} maxLength={30}
                    onChange={(e) => set('experience', resume.experience.map((x, j) => (j === i ? { ...x, years: e.target.value } : x)))} />
                </div>
                <input className="field" placeholder="Where / with whom" value={job.place} maxLength={80}
                  onChange={(e) => set('experience', resume.experience.map((x, j) => (j === i ? { ...x, place: e.target.value } : x)))} />
                <textarea className="field min-h-20" placeholder="What you learned or brought to the table" value={job.description} maxLength={300}
                  onChange={(e) => set('experience', resume.experience.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
              </div>
            ))}
            {resume.experience.length < 6 ? (
              <button type="button" className="btn-ghost" onClick={() => set('experience', [...resume.experience, { role: '', place: '', years: '', description: '' }])}>
                <Plus className="size-4" /> Add experience
              </button>
            ) : null}
          </Step>

          <Step n="05" title="References" hint="Quotes from friends, family, or an ex who'd vouch for you.">
            {resume.references.map((ref, i) => (
              <div key={i} className="relative space-y-3 rounded-lg border border-rule bg-sheet/60 p-4">
                <button
                  type="button"
                  aria-label="Remove reference"
                  onClick={() => set('references', resume.references.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 rounded-full p-1.5 text-ink-soft hover:bg-blush hover:text-rose"
                >
                  <Trash2 className="size-4" />
                </button>
                <div className="grid gap-3 pr-8 sm:grid-cols-2">
                  <input className="field" placeholder="Name" value={ref.name} maxLength={60}
                    onChange={(e) => set('references', resume.references.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <input className="field" placeholder="Relationship (e.g. College roommate)" value={ref.relation} maxLength={60}
                    onChange={(e) => set('references', resume.references.map((x, j) => (j === i ? { ...x, relation: e.target.value } : x)))} />
                </div>
                <textarea className="field min-h-20" placeholder="What would they say about you?" value={ref.quote} maxLength={300}
                  onChange={(e) => set('references', resume.references.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))} />
              </div>
            ))}
            {resume.references.length < 4 ? (
              <button type="button" className="btn-ghost" onClick={() => set('references', [...resume.references, { name: '', relation: '', quote: '' }])}>
                <Plus className="size-4" /> Add reference
              </button>
            ) : null}
          </Step>

          <Step n="06" title="Finishing touch" hint="Pick the ink for your page.">
            <div className="flex flex-wrap gap-3">
              {Object.entries(ACCENTS).map(([key, { label, color }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('accent', key as ResumeInput['accent'])}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    resume.accent === key ? 'border-ink bg-sheet' : 'border-ink/15 hover:border-ink/40'
                  }`}
                >
                  <span className="size-4 rounded-full" style={{ background: color }} />
                  {label}
                </button>
              ))}
            </div>
          </Step>

          <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-rule bg-paper/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            {error ? (
              <p className="text-sm text-rose" role="alert">{error}</p>
            ) : (
              <button type="button" onClick={() => setResume(sampleResume)} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-rose">
                <Sparkles className="size-4" /> Fill with an example
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>

        <div className={`${mobileView === 'edit' ? 'hidden lg:block' : ''}`}>
          <div className="lg:sticky lg:top-6">
            <p className="label no-print mb-3 hidden text-ink-soft lg:block">Live preview</p>
            <div className="lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:rounded-sm">
              <ResumeSheet resume={resume} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
