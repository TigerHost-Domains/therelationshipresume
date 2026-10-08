import { boolean, date, index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

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
  // How the owner's verified name appears on the page: 'first-initial', 'first' or 'full'. The name itself always
  // comes from member_profiles; `name` and `age` above are a snapshot written on each save.
  nameStyle: text('name_style').notNull().default('first-initial'),
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

// Each member's identity on file. The name comes from their Google/GitHub account (or is sworn when the account
// shares none); date of birth and sex are sworn once. None of it can be changed by the member afterwards.
export const memberProfiles = pgTable('member_profiles', {
  userId: text('user_id').primaryKey(),
  provider: text().notNull(),
  providerEmail: text('provider_email'),
  legalName: text('legal_name'),
  // 'provider' when the name came from Google/GitHub, 'attested' when the member typed it in.
  nameSource: text('name_source'),
  birthDate: date('birth_date', { mode: 'string' }),
  sex: text(),
  policyVersion: text('policy_version'),
  attestedAt: timestamp('attested_at'),
  // Set when the member reported an age under 18. Nothing else about them is kept, and the check can't be retried.
  refusedAt: timestamp('refused_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
