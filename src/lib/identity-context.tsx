import { createContext, useContext, type ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'
import { endMfaSession } from '@/server/mfa.functions'

interface ClientUser {
  id: string
  email: string
  name: string
}

interface IdentityContextValue {
  user: ClientUser | null
  ready: boolean
  logout: () => Promise<void>
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession()

  const logout = async () => {
    await endMfaSession().catch(() => {})
    await authClient.signOut()
  }

  const user = data?.user ? { id: data.user.id, email: data.user.email, name: data.user.name } : null
  return <IdentityContext.Provider value={{ user, ready: !isPending, logout }}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within an IdentityProvider')
  return ctx
}
