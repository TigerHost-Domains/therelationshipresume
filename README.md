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
- Netlify Database (managed Postgres) via Drizzle ORM
- Zod for validation on both client and server
- Deployed on Netlify

## Running locally

```bash
pnpm install
netlify dev
```

`netlify dev` provides local emulation of Netlify Database. Schema changes live in `db/schema.ts`; generate a
migration with `npx drizzle-kit generate --name <change_name>` — migrations are applied automatically on deploy.

## Ideas for later

- Optional accounts so people can manage several resumes
- Photo upload
- A "Request a date" form on each resume
- Unpublish / delete from the edit screen
