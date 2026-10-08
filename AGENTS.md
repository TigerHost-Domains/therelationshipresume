# AGENTS.md

The Relationship Resume: a builder where anyone writes a dating-focused, one-page resume and shares it by link.

## Architecture

- **TanStack Start** app (`src/routes`, file-based). Server logic uses `createServerFn` in
  `src/server/resumes.functions.ts` — there are no separate Netlify Functions.
- **Netlify Database** (Postgres) through Drizzle (`drizzle-orm@beta` / `drizzle-kit@beta` — the beta line is required
  for the `drizzle-orm/netlify-db` adapter). Schema: `db/schema.ts`, client: `db/index.ts`, migrations:
  `netlify/database/migrations/` (generated with `npx drizzle-kit generate --name <name>`; never hand-edit applied ones).
- Tables: `resumes`, `member_profiles` (identity on file), `member_mfa`, `mfa_sessions`. List-like resume fields (likes, experience, references, …) are `jsonb` columns.

## Key files

| Path | Purpose |
| --- | --- |
| `src/lib/resume.ts` | Zod schema (`resumeInputSchema`) shared by client and server, accent palette, love languages, sample resume |
| `src/components/ResumeSheet.tsx` | The rendered resume page; used on landing, builder preview, and shared page |
| `src/components/ResumeEditor.tsx` | Builder form + live preview, used by create and edit routes |
| `src/components/SiteHeader.tsx` | Header, footer, monogram |
| `src/lib/edit-keys.ts` | localStorage map of slug → edit key |
| `src/routes/index.tsx` | Landing page |
| `src/routes/create.tsx`, `src/lib/drafts.ts` | New resume; two autosaved localStorage draft slots (`?draft=1\|2`) |
| `src/routes/r/$slug/index.tsx` | Public resume (`?published=true` shows share/edit links after publishing) |
| `src/routes/r/$slug/edit.tsx` | Edit (owner, co-editors, proxy roles) + owner's co-editor panel; `?key=` only claims legacy resumes |
| `src/routes/login.tsx` | Google/GitHub sign-in and the two-factor code screen (`?redirect=` returns the member afterwards) |
| `src/routes/verify.tsx`, `src/components/IdentityOnFile.tsx` | One-time identity check (name from provider, sworn date of birth + sex) and the locked summary |
| `src/lib/member.ts`, `src/server/members.ts`, `src/server/members.functions.ts` | Identity rules (providers, 18/21 age gates, policy version, name styles), `requireIdentity`, `getMyIdentity` / `submitIdentity` |
| `src/lib/auth.ts`, `src/middleware/identity.ts`, `src/lib/identity-context.tsx` | Netlify Identity (`@netlify/identity`): server user lookup, `requireAuthMiddleware`, client auth state |
| `src/routes/account.tsx`, `src/server/mfa.ts`, `src/server/mfa.functions.ts` | Account page: the member's resume links (`listMyResumes`, owned + co-edited) and optional authenticator-app (TOTP) two-factor setup/disable, code checks, 2FA browser sessions |
| `src/components/SocialMatchConnect.tsx`, `src/server/social-match.ts`, `src/lib/social-match.ts` | "Add to Social Match" button/dialog on the public resume page (and, compact, on each account-page resume row) and the server-side client that requests a Social Match Game invite for the resume |

## Non-obvious decisions

- **Ownership.** Publishing requires a Netlify Identity sign-in; `owner_id` stores the creator's Identity user id.
  Edit permission (`access()` in `resumes.functions.ts`) = owner, a co-editor (`editor_emails`, managed by the owner),
  or a member with an Identity role in `PROXY_ROLES` (`admin`, `proxy`, assigned in the Netlify dashboard). Every edit
  server function re-checks this; the UI checks are cosmetic. Viewing stays public.
- **Legacy edit tokens.** Resumes predating accounts have no owner; the first signed-in member who opens a valid
  `?key=` edit link claims them. `edit_token` is still generated but no longer shown. `toPublic()` strips it, along with
  owner and editor fields — never return the raw row to the client.
- **Sign-in is Google or GitHub only** (the same doors as The Social Match Game), via Identity's `oauthLogin`; buttons
  only render for providers enabled in Project configuration > Identity > External providers (`getSettings()`). There
  is no email/password: the middleware and `getServerUser` treat any session without a Google/GitHub provider as
  signed out (`socialProviderOf`). The return path is parked in sessionStorage (`src/lib/oauth.ts`); after sign-in
  `nextStepAfterSignIn` routes to the 2FA code, then `/verify`, then the redirect.
- **Truthful identity.** `member_profiles` holds each member's name (from the provider; typed only if the provider
  shared none), sworn date of birth and sex, policy version and attestation time — written once, never editable by
  the member. Under-18 answers store only `refused_at`. Resumes never trust typed name/age: the server derives them
  from the *owner's* profile (`name_style` picks first / first + initial / full) and `toPublic()` adds sex and
  `verifiedVia`. Publishing and editing need `requireIdentity(user, 18)`; `IDENTITY_REQUIRED` → `/verify`.
- **Two-factor is ours, not Identity's.** `member_mfa` holds each member's TOTP secret; passing a code sets an httpOnly
  `rr_mfa` cookie backed by a hashed row in `mfa_sessions` (12h). `requireAuthMiddleware` enforces it for publishing
  and editing (`MFA_REQUIRED` error → `/login?mode=mfa`); `requireSignInMiddleware` skips it for the 2FA endpoints.
- Identity only works on deployed Netlify sites, not localhost. `/create` autosaves up to two drafts in localStorage (signed in or not); publishing clears that slot.
- Slugs are `<name-slug>-<6 random chars>` so they're friendly but not guessable/enumerable.
- Design system: Fraunces (display), Instrument Sans (body), IBM Plex Mono (labels), loaded from Google Fonts in
  `__root.tsx`. Colour tokens (`paper`, `sheet`, `ink`, `rose`, `blush`, `rule`) are in `src/styles.css` `@theme`;
  `btn-primary`, `btn-ghost`, `field`, `label` are `@utility` classes. Each resume's accent is applied via the
  `--accent` CSS variable.
- **Landing page is "after hours".** `src/routes/index.tsx` uses a dark palette (`night`, `velvet`, `cream`, `smoke`,
  `gold`, `ember` tokens; `.after-hours`, `.film-grain`, `.gold-foil` classes) inspired by the companion site, The
  Social Match Game (https://socialmatchapp.onrender.com/). `SiteHeader` / `SiteFooter` take `tone="dark"` there; the
  rest of the app stays on the light paper theme.
- **Social Match Game handshake.** The Social Match Game has no passwords and no hand-entered resume links: members
  sign in there with Google/GitHub only, and resumes arrive through an invite. `sendToSocialMatch` (the resume's owner
  only, verified and 21+, 2FA enforced) calls `createSocialMatchInvite`, which POSTs `{ slug, name, dateOfBirth, sex, email, provider, member }` (their API
  validates name, `dateOfBirth` (YYYY-MM-DD) and sex at the top level; `member` repeats them plus age, `over21`,
  attestation date and policy version) to
  `/api/integrations/relationship-resume/invites` with the `x-integration-secret: $RESUME_INTEGRATION_SECRET` header
  and gets back `{ invite, expiresAt (7 days), joinUrl }`. The dialog sends the member to `joinUrl`
  (`socialmatchapp.onrender.com/join?invite=…`); there they sign in, pass age verification, and their site claims the
  invite (`/claim`) and pins the resume to the profile; they're expected to refuse the claim unless the signed-in
  provider and email match `member`. Their CORS only allows their own origin, so the invite call
  must stay server-side, and the secret never reaches the browser. Their backend naps when idle (45s timeout; the
  dialog pings `/api/auth/providers` on open to wake it).
- `.no-print` hides chrome when a resume is printed.

## Conventions

- `@/` alias → `src/`. Strict TypeScript. Server functions use `.inputValidator(...)` with Zod schemas.
- Match the editorial tone in copy: resume/hiring puns, warm and witty, never cheesy.
- UI chrome (headings, buttons, links, nav, field labels, eyebrows, page titles) is Title Case (Chicago: lowercase
  a/an/the, short conjunctions and prepositions unless first/last). Body copy, hints, placeholders, errors and
  user-data strings (`LOVE_LANGUAGES`, suggestions, sample resume) stay sentence case.
- Resume field limits live in `LIMITS` (`src/lib/resume.ts`); the schema and the builder's counters both read it.
