import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export type ExperienceEntry = {
  role: string
  place: string
  years: string
  description: string
}

export type ReferenceEntry = {
  name: string
  relation: string
  quote: string
}

export const resumes = pgTable('resumes', {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  editToken: text('edit_token').notNull(),
  // Netlify Identity user id of the member who owns this resume. Null for resumes made before accounts existed;
  // those are claimed by the first signed-in member who opens a valid private edit link.
  ownerId: text('owner_id'),
  // Lower-cased emails of members the owner has invited to co-edit.
  editorEmails: jsonb('editor_emails').$type<string[]>().notNull().default([]),
  name: text().notNull(),
  age: text().notNull().default(''),
  location: text().notNull().default(''),
  headline: text().notNull().default(''),
  objective: text().notNull().default(''),
  lookingFor: text('looking_for').notNull().default(''),
  qualities: jsonb().$type<string[]>().notNull().default([]),
  likes: jsonb().$type<string[]>().notNull().default([]),
  dislikes: jsonb().$type<string[]>().notNull().default([]),
  dealbreakers: jsonb().$type<string[]>().notNull().default([]),
  loveLanguages: jsonb('love_languages').$type<string[]>().notNull().default([]),
  experience: jsonb().$type<ExperienceEntry[]>().notNull().default([]),
  references: jsonb().$type<ReferenceEntry[]>().notNull().default([]),
  contact: text().notNull().default(''),
  accent: text().notNull().default('rose'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Optional authenticator-app (TOTP) two-factor auth, layered on top of Netlify Identity. One row per member who has
// started setup; `enabled` flips once they confirm a first code.
export const memberMfa = pgTable('member_mfa', {
  userId: text('user_id').primaryKey(),
  secret: text().notNull(),
  enabled: boolean().notNull().default(false),
  // Last accepted 30-second time step, so a code can't be replayed.
  lastStep: integer('last_step').notNull().default(0),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Browser sessions that have passed the two-factor check. The cookie holds a random token; only its SHA-256 is stored.
export const mfaSessions = pgTable(
  'mfa_sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (t) => [index('mfa_sessions_user_id_idx').on(t.userId)],
)
