import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { memberMfa } from '../../db/schema.js'
import { identityMiddleware, requireSignInMiddleware } from '@/middleware/identity'
import { checkCode, endCurrentMfaSession, endMfaSessions, getMfaRow, mfaState, newSecret, startMfaSession, totpFor } from '@/server/mfa'

const codeInput = z.object({ code: z.string().regex(/^\s*\d{3}\s?\d{3}\s*$/, 'Enter the 6-digit code.') })

export const getMfaStatus = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) return { signedIn: false, enabled: false, verified: false }
    return { signedIn: true, ...(await mfaState(context.user.id)) }
  })

/** Creates (or replaces) a pending secret and returns what the authenticator app needs to scan. */
export const startMfaSetup = createServerFn({ method: 'POST' })
  .middleware([requireSignInMiddleware])
  .handler(async ({ context }) => {
    const existing = await getMfaRow(context.user.id)
    if (existing?.enabled) throw new Error('Two-factor authentication is already on.')

    const secret = newSecret()
    await db
      .insert(memberMfa)
      .values({ userId: context.user.id, secret })
      .onConflictDoUpdate({
        target: memberMfa.userId,
        set: { secret, lastStep: 0, failedAttempts: 0, lockedUntil: null, updatedAt: new Date() },
      })

    const uri = totpFor(secret, context.user.email ?? context.user.id).toString()
    return { secret, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }) }
  })

export const confirmMfaSetup = createServerFn({ method: 'POST' })
  .middleware([requireSignInMiddleware])
  .inputValidator(codeInput)
  .handler(async ({ data, context }) => {
    await checkCode(context.user.id, data.code)
    await db.update(memberMfa).set({ enabled: true, updatedAt: new Date() }).where(eq(memberMfa.userId, context.user.id))
    await startMfaSession(context.user.id)
    return { enabled: true }
  })

export const verifyMfa = createServerFn({ method: 'POST' })
  .middleware([requireSignInMiddleware])
  .inputValidator(codeInput)
  .handler(async ({ data, context }) => {
    const row = await getMfaRow(context.user.id)
    if (!row?.enabled) return { verified: true }
    await checkCode(context.user.id, data.code)
    await startMfaSession(context.user.id)
    return { verified: true }
  })

/** Turning two-factor off takes a current code, so a borrowed laptop can't quietly remove it. */
export const disableMfa = createServerFn({ method: 'POST' })
  .middleware([requireSignInMiddleware])
  .inputValidator(codeInput)
  .handler(async ({ data, context }) => {
    await checkCode(context.user.id, data.code)
    await db.delete(memberMfa).where(eq(memberMfa.userId, context.user.id))
    await endMfaSessions(context.user.id)
    return { enabled: false }
  })

/** Forgets this browser's two-factor pass on sign-out. */
export const endMfaSession = createServerFn({ method: 'POST' }).handler(async () => {
  await endCurrentMfaSession()
  return { ok: true }
})
