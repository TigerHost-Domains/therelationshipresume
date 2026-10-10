# The Relationship Resume

A one-page "resume" for your love life. Anyone can write one — objective, ideal candidate, core qualities, likes,
dislikes, dealbreakers, love languages, relevant experience and references — watch it typeset live, then publish it
to a shareable link for dating profiles, bios, or matchmaking friends.

## Features

- **Landing page** (`/`) with a full example resume.
- **Builder** (`/create`) with a live, side-by-side preview, tag inputs with suggestions, ranked love languages,
  repeatable experience and reference entries, and four accent "inks".
- **Shareable resume page** (`/r/:slug`) with copy-link and print-friendly styling.
- **Private editing** (`/r/:slug/edit?key=…`) — no account needed; a secret edit key is issued on publish and
  remembered in the creator's browser.

## Tech

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, server functions)
- Tailwind CSS 4
- Postgres via Drizzle ORM, sign-in via Better Auth (Google / GitHub)
- Zod for validation on both client and server
- Deployed on Render (`render.yaml`)

## Running locally

```bash
npm install
export DATABASE_URL=postgres://user:pass@localhost:5432/resume
export BETTER_AUTH_SECRET=<random string> BETTER_AUTH_URL=http://localhost:3000
export GITHUB_CLIENT_ID=… GITHUB_CLIENT_SECRET=…   # and/or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
npm run db:migrate
npm run dev
```

Schema changes live in `db/schema.ts`; generate a migration with `npx drizzle-kit generate --name <change_name>`.
On Render, `npm start` applies pending migrations before the server starts. Set `PROXY_EMAILS` (comma-separated) to
give admins edit access to any resume.

## Ideas for later

- Optional accounts so people can manage several resumes
- Photo upload
- A "Request a date" form on each resume
- Unpublish / delete from the edit screen
