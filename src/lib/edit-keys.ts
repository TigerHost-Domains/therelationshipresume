// Edit keys are kept in the browser that created a resume so the owner can come back and edit.
const STORAGE_KEY = 'relationship-resume:edit-keys'

function read(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function saveEditKey(slug: string, key: string) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [slug]: key }))
}

export function getEditKey(slug: string): string | undefined {
  return read()[slug]
}
