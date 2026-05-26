# desk.train · CS

A browser-only Counter-Strike trainer for the hours between matches. Built to look unremarkable on a work monitor.

## What's in it

- **Aim trainer** (`/aim`) — Canvas-based flick and tracking drills. 30s sessions, three difficulty tiers, personal best tracked locally.
- **Strategy board** (`/strategy`) — Top-down Dust 2. Drop T/CT players, smokes, flashes, mollies. Drag to position, save setups by name.
- **Quizzes** (`/quizzes`) — Callout quiz on a Dust 2 map, economy decision scenarios, and a spray-pattern reference for AK / M4A4 / M4A1-S.

## Boss key

Press `Esc` anywhere — the screen swaps to a fake quarterly-forecast spreadsheet and the tab title changes. Press `Esc` again to return.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- No backend — everything runs client-side; progress is in `localStorage`.

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build

```bash
npm run build
npm start
```

## Roadmap

- More maps for the strategy board (Mirage, Inferno, Nuke)
- Lineup memorizer (spaced repetition for smokes/flashes)
- Crosshair-placement quiz (screenshot → click where you should pre-aim)
- Reaction-time leaderboard (Supabase / Vercel KV)
- Map veto / scrim coin-flip helper
