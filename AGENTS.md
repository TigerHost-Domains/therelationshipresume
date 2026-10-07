# AGENTS.md

The Relationship Resume: a builder where anyone writes a dating-focused, one-page resume and shares it by link.

## Architecture

- **TanStack Start** app (`src/routes`, file-based). Server logic uses `createServerFn` in
  `src/server/resumes.functions.ts` — there are no separate Netlify Functions.
- **Netlify Database** (Postgres) through Drizzle (`drizzle-orm@beta` / `drizzle-kit@beta` — the beta line is required
  for the `drizzle-orm/netlify-db` adapter). Schema: `db/schema.ts`, client: `db/index.ts`, migrations:
  `netlify/database/migrations/` (generated with `npx drizzle-kit generate --name <name>`; never hand-edit applied ones).
- One table, `resumes`. List-like fields (likes, experience, references, …) are `jsonb` columns.

## Key files

| Path | Purpose |
| --- | --- |
| `src/lib/resume.ts` | Zod schema (`resumeInputSchema`) shared by client and server, accent palette, love languages, sample resume |
| `src/components/ResumeSheet.tsx` | The rendered resume page; used on landing, builder preview, and shared page |
| `src/components/ResumeEditor.tsx` | Builder form + live preview, used by create and edit routes |
| `src/components/SiteHeader.tsx` | Header, footer, monogram |
| `src/lib/edit-keys.ts` | localStorage map of slug → edit key |
| `src/routes/index.tsx` | Landing page |
| `src/routes/create.tsx` | New resume |
| `src/routes/r/$slug/index.tsx` | Public resume (`?published=true` shows share/edit links after publishing) |
| `src/routes/r/$slug/edit.tsx` | Edit (owner, co-editors, proxy roles) + owner's co-editor panel; `?key=` only claims legacy resumes |
| `src/routes/login.tsx` | Sign in / sign up / password reset / invite acceptance (`?redirect=` returns the member afterwards) |
| `src/lib/auth.ts`, `src/middleware/identity.ts`, `src/lib/identity-context.tsx` | Netlify Identity (`@netlify/identity`): server user lookup, `requireAuthMiddleware`, client auth state |
| `src/routes/account.tsx`, `src/server/mfa.ts`, `src/server/mfa.functions.ts` | Account page: the member's resume links (`listMyResumes`, owned + co-edited) and optional authenticator-app (TOTP) two-factor setup/disable, code checks, 2FA browser sessions |

## Non-obvious decisions

- **Ownership.** Publishing requires a Netlify Identity sign-in; `owner_id` stores the creator's Identity user id.
  Edit permission (`access()` in `resumes.functions.ts`) = owner, a co-editor (`editor_emails`, managed by the owner),
  or a member with an Identity role in `PROXY_ROLES` (`admin`, `proxy`, assigned in the Netlify dashboard). Every edit
  server function re-checks this; the UI checks are cosmetic. Viewing stays public.
- **Legacy edit tokens.** Resumes predating accounts have no owner; the first signed-in member who opens a valid
  `?key=` edit link claims them. `edit_token` is still generated but no longer shown. `toPublic()` strips it, along with
  owner and editor fields — never return the raw row to the client.
- **Social sign-in** (Google, Facebook, GitHub) uses Identity's `oauthLogin`; buttons only render for providers enabled
  in Project configuration > Identity > External providers (`getSettings()`). The return path is parked in
  sessionStorage (`src/lib/oauth.ts`) across the redirect. Netlify Identity has no Apple provider.
- **Two-factor is ours, not Identity's.** `member_mfa` holds each member's TOTP secret; passing a code sets an httpOnly
  `rr_mfa` cookie backed by a hashed row in `mfa_sessions` (12h). `requireAuthMiddleware` enforces it for publishing
  and editing (`MFA_REQUIRED` error → `/login?mode=mfa`); `requireSignInMiddleware` skips it for the 2FA endpoints.
- Identity only works on deployed Netlify sites, not localhost. `/create` keeps an unsigned-in draft in localStorage.
- Slugs are `<name-slug>-<6 random chars>` so they're friendly but not guessable/enumerable.
- Design system: Fraunces (display), Instrument Sans (body), IBM Plex Mono (labels), loaded from Google Fonts in
  `__root.tsx`. Colour tokens (`paper`, `sheet`, `ink`, `rose`, `blush`, `rule`) are in `src/styles.css` `@theme`;
  `btn-primary`, `btn-ghost`, `field`, `label` are `@utility` classes. Each resume's accent is applied via the
  `--accent` CSS variable.
- **Landing page is "after hours".** `src/routes/index.tsx` uses a dark palette (`night`, `velvet`, `cream`, `smoke`,
  `gold`, `ember` tokens; `.after-hours`, `.film-grain`, `.gold-foil` classes) inspired by the companion site, The
  Social Match Game (https://socialmatchapp.onrender.com/). `SiteHeader` / `SiteFooter` take `tone="dark"` there; the
  rest of the app stays on the light paper theme.
- `.no-print` hides chrome when a resume is printed.

## Conventions

- `@/` alias → `src/`. Strict TypeScript. Server functions use `.inputValidator(...)` with Zod schemas.
- Match the editorial tone in copy: resume/hiring puns, warm and witty, never cheesy.
