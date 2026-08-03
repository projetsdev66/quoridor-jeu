# Quoridor

A Quoridor (Wall Chess) board game built with React + Vite + TypeScript.

## Features
- Solo mode vs AI
- Online multiplayer via Firebase Realtime Database (room codes)

## Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite 7
- **Multiplayer**: Firebase Realtime Database (client-side only, no backend server)
- **UI**: shadcn/ui (Radix primitives), Framer Motion, Lucide icons

## Running on Replit

The dev server runs on port 5000 via the **Start application** workflow (`npm run dev`).

Environment variables set in Replit (shared):
- `PORT=5000`
- `BASE_PATH=/`

## Deployment (Vercel)

Import the repo on [vercel.com/new](https://vercel.com/new). Vite is auto-detected — no manual configuration needed. `PORT` and `BASE_PATH` are not required on Vercel (the config falls back to sensible defaults).

## Development

```bash
npm install
npm run dev       # dev server
npm run build     # production build → dist/public/
npm run typecheck # TypeScript check
```

## User preferences
- Keep as a simple standalone Vite project (no monorepo, no pnpm workspaces).
- Deploy on Vercel; never break `npm run build` in a clean environment.
- All Replit-specific plugins must be conditional on `REPL_ID` being set.
- Always work on a feature branch and open a PR — never push directly to `main`.
- Firebase RTDB: always merge reads with `getFreshState()` defaults; never access nested fields without null-checks.
