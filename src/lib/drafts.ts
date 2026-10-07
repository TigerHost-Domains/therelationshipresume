import { emptyResume, type ResumeInput } from '@/lib/resume'

/** Unpublished resumes live in the browser, in one of two slots, until they're published or discarded. */
export const DRAFT_SLOTS = [1, 2] as const
export type DraftSlot = (typeof DRAFT_SLOTS)[number]

export type DraftSummary = { name: string; updatedAt: number }

type StoredDraft = { resume: ResumeInput; updatedAt: number }

const LEGACY_KEY = 'relationship-resume:draft'
const keyFor = (slot: DraftSlot) => `relationship-resume:draft:${slot}`

// Drafts are saved mid-thought, so they needn't pass the publish schema; only keep fields of the expected shape.
function toResume(value: unknown): ResumeInput | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const resume = { ...emptyResume } as Record<string, unknown>
  for (const [key, fallback] of Object.entries(emptyResume)) {
    const v = raw[key]
    if (Array.isArray(fallback) ? Array.isArray(v) : typeof v === typeof fallback) resume[key] = v
  }
  return resume as ResumeInput
}

function read(slot: DraftSlot): StoredDraft | null {
  try {
    // Before there were two slots, the single draft was stored unwrapped under the legacy key; it becomes draft 1.
    if (slot === 1 && !window.localStorage.getItem(keyFor(1))) {
      const legacy = toResume(JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? 'null'))
      window.localStorage.removeItem(LEGACY_KEY)
      if (legacy) write(1, { resume: legacy, updatedAt: Date.now() })
    }
    const stored = JSON.parse(window.localStorage.getItem(keyFor(slot)) ?? 'null') as Partial<StoredDraft> | null
    const resume = toResume(stored?.resume)
    return resume ? { resume, updatedAt: typeof stored?.updatedAt === 'number' ? stored.updatedAt : 0 } : null
  } catch {
    return null
  }
}

function write(slot: DraftSlot, draft: StoredDraft) {
  try {
    window.localStorage.setItem(keyFor(slot), JSON.stringify(draft))
  } catch {
    // Storage full or blocked (private browsing); the draft just won't outlive the tab.
  }
}

export function loadDraft(slot: DraftSlot): ResumeInput | null {
  return read(slot)?.resume ?? null
}

/** Saves the draft, or clears the slot if the form is back to blank. Unchanged drafts keep their timestamp. */
export function saveDraft(slot: DraftSlot, resume: ResumeInput) {
  const json = JSON.stringify(resume)
  if (json === JSON.stringify(emptyResume)) return clearDraft(slot)
  if (JSON.stringify(read(slot)?.resume) === json) return
  write(slot, { resume, updatedAt: Date.now() })
}

export function clearDraft(slot: DraftSlot) {
  window.localStorage.removeItem(keyFor(slot))
}

export function listDrafts(): Record<DraftSlot, DraftSummary | null> {
  const summary = (slot: DraftSlot) => {
    const draft = read(slot)
    return draft ? { name: draft.resume.name.trim(), updatedAt: draft.updatedAt } : null
  }
  return { 1: summary(1), 2: summary(2) }
}
