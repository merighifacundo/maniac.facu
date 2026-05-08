# Mansion PoC

Maniac-Mansion-style point-and-click starter. Next.js + TypeScript, deployable to Vercel.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's here

- One room (kitchen-ish) drawn in SVG with EGA-style colors
- 9-verb grid (Give / Pick up / Use / Open / Look at / Push / Close / Talk to / Pull) plus default "Walk to"
- Inventory panel
- Sentence line at the top of the verb area
- One puzzle: pick up the key, then `Open` the door

## Try

1. Click `Pick up`, then click the small key on the floor.
2. Click `Open`, then click the door.
3. Try `Look at` on the rug, window, etc.

## Deploy

```bash
npx vercel
```

## Where to extend

- `components/Game.tsx` — verb/object interaction logic. Add more rooms by switching `ROOM_OBJECTS` and the SVG in `Room.tsx`.
- `components/Room.tsx` — replace SVG with a sprite sheet (`<img style={{ imageRendering: 'pixelated' }} />`) once you have art.
- Walking character: add a sprite + simple A* on a walkable polygon.
