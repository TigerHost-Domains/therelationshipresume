// Server-only helpers for optional authenticator-app (TOTP) two-factor auth.
import { createHash, randomBytes } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { and, eq, gt } from 'drizzle-orm'
import { Secret, TOTP } from 'otpauth'
import { db } from '../../db/index.js'
import { memberMfa, mfaSessions } from '../../db/schema.js'

export { MFA_REQUIRED } from '@/lib/mfa'

const COOKIE = 'rr_mfa'
const SESSION_HOURS = 12
const MAX_FAILURES = 5
const LOCK_MINUTES = 10
const PERIOD = 30

export function newSecret() {
  return new Secret({ size: 20 }).base32
}

export function totpFor(secret: string, label: string) {
  return new TOTP({
    issuer: 'The Relationship Resume',
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: PERIOD,
    secret: Secret.fromBase32(secret),
  })
}

const hash = (token: string) => createHash('sha256').update(token).digest('hex')

export async function getMfaRow(userId: string) {
  const [row] = await db.select().from(memberMfa).where(eq(memberMfa.userId, userId)).limit(1)
  return row
}

/** Checks a 6-digit code, with replay protection and a short lockout after repeated failures. */
export async function checkCode(userId: string, code: string): Promise<void> {
  const row = await getMfaRow(userId)
  if (!row) throw new Error('Two-factor authentication is not set up.')
  if (row.lockedUntil && row.lockedUntil > new Date()) {
    throw new Error('Too many incorrect codes. Please wait a few minutes and try again.')
  }

  const delta = totpFor(row.secret, userId).validate({ token: code.replace(/\s/g, ''), window: 1 })
  const step = Math.floor(Date.now() / 1000 / PERIOD) + (delta ?? 0)

  if (delta === null || step <= row.lastStep) {
    const failures = row.failedAttempts + 1
    await db
      .update(memberMfa)
      .set({
        failedAttempts: failures >= MAX_FAILURES ? 0 : failures,
        lockedUntil: failures >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60_000) : row.lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(memberMfa.userId, userId))
    throw new Error("That code didn't match. Check your authenticator app and try again.")
  }

  await db
    .update(memberMfa)
    .set({ lastStep: step, failedAttempts: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(memberMfa.userId, userId))
}

/** Marks this browser as having passed two-factor for the signed-in member. */
export async function startMfaSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  await db.insert(mfaSessions).values({
    tokenHash: hash(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 3_600_000),
  })
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  })
}

export async function endMfaSessions(userId: string) {
  await db.delete(mfaSessions).where(eq(mfaSessions.userId, userId))
  deleteCookie(COOKIE, { path: '/' })
}

async function hasMfaSession(userId: string) {
  const token = getCookie(COOKIE)
  if (!token) return false
  const [row] = await db
    .select({ userId: mfaSessions.userId })
    .from(mfaSessions)
    .where(and(eq(mfaSessions.tokenHash, hash(token)), eq(mfaSessions.userId, userId), gt(mfaSessions.expiresAt, new Date())))
    .limit(1)
  return !!row
}

/** Whether the member has two-factor turned on, and whether this browser has passed it. */
export async function mfaState(userId: string) {
  const row = await getMfaRow(userId)
  const enabled = !!row?.enabled
  return { enabled, verified: enabled ? await hasMfaSession(userId) : true }
}

/** Forgets this browser's two-factor pass (on sign-out). */
export async function endCurrentMfaSession() {
  const token = getCookie(COOKIE)
  if (token) await db.delete(mfaSessions).where(eq(mfaSessions.tokenHash, hash(token)))
  deleteCookie(COOKIE, { path: '/' })
}
