import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { handleAuthCallback } from '@netlify/identity'
import { OAUTH_REDIRECT_KEY } from '@/lib/oauth'
import { getMfaStatus } from '@/server/mfa.functions'

const AUTH_HASH_PATTERN = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/

/**
 * Completes email confirmation, OAuth, invite and password-recovery links, which can land on any page.
 * Invites and recoveries still need a new password, so those continue on the sign-in page.
 */
// Social sign-in leaves the site, so the page to return to is parked in sessionStorage before the redirect.
async function finishSocialSignIn() {
  const stored = window.sessionStorage.getItem(OAUTH_REDIRECT_KEY)
  window.sessionStorage.removeItem(OAUTH_REDIRECT_KEY)
  const redirect = stored && /^\/(?!\/)/.test(stored) ? stored : '/'
  const mfa = await getMfaStatus()
  if (mfa.enabled && !mfa.verified) {
    window.location.assign(`/login?mode=mfa&redirect=${encodeURIComponent(redirect)}`)
  } else if (redirect !== window.location.pathname + window.location.search) {
    window.location.assign(redirect)
  }
}

export function CallbackHandler({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!AUTH_HASH_PATTERN.test(window.location.hash)) return
    handleAuthCallback()
      .then((result) => {
        if (result?.type === 'recovery') void navigate({ to: '/login', search: { mode: 'reset' } })
        else if (result?.type === 'invite' && result.token)
          void navigate({ to: '/login', search: { mode: 'invite', invite: result.token } })
        else if (result?.type === 'oauth') return finishSocialSignIn()
      })
      .catch(() => {})
  }, [navigate])

  return <>{children}</>
}
