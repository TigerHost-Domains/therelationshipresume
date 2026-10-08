import { useEffect } from 'react'
import { handleAuthCallback } from '@netlify/identity'
import { nextStepAfterSignIn } from '@/lib/auth'
import { OAUTH_REDIRECT_KEY } from '@/lib/oauth'

const AUTH_HASH_PATTERN = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/

// Social sign-in leaves the site, so the page to return to is parked in sessionStorage before the redirect.
async function finishSocialSignIn() {
  const stored = window.sessionStorage.getItem(OAUTH_REDIRECT_KEY)
  window.sessionStorage.removeItem(OAUTH_REDIRECT_KEY)
  const redirect = stored && /^\/(?!\/)/.test(stored) ? stored : '/'
  const next = (await nextStepAfterSignIn(redirect)) ?? '/login'
  if (next !== window.location.pathname + window.location.search) window.location.assign(next)
}

/**
 * Completes Google/GitHub sign-in, which can land on any page. Links left over from the retired email + password
 * sign-in (confirmations, invites, recoveries) are sent to the sign-in page instead.
 */
export function CallbackHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!AUTH_HASH_PATTERN.test(window.location.hash)) return
    if (!window.location.hash.startsWith('#access_token=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      window.location.assign('/login')
      return
    }
    handleAuthCallback()
      .then((result) => {
        if (result?.type === 'oauth') return finishSocialSignIn()
      })
      .catch(() => {})
  }, [])

  return <>{children}</>
}
