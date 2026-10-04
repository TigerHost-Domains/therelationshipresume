import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser, logout as nlLogout, onAuthChange, type User } from '@netlify/identity'
import { endMfaSession } from '@/server/mfa.functions'

interface IdentityContextValue {
  user: User | null
  ready: boolean
  logout: () => Promise<void>
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getUser().then((u) => {
      setUser(u ?? null)
      setReady(true)
    })
    return onAuthChange((_event, u) => setUser(u ?? null))
  }, [])

  const logout = async () => {
    await endMfaSession().catch(() => {})
    await nlLogout()
  }

  return <IdentityContext.Provider value={{ user, ready, logout }}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within an IdentityProvider')
  return ctx
}
