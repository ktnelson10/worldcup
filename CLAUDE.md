# CLAUDE.md

Guidance for AI agents (and humans) working in this repo. Keep it current — if you
change how something works, update this file in the same commit.

## What this is

The **live standings web page** for an 8-player World Cup 2026 draft pool. Plain static
HTML/CSS/JS, no framework, no build step, no dependencies. Deployed on Cloudflare Pages at
https://worldcup-pool.pages.dev. See `README.md` for the human-facing overview.

## The bigger system (only part 3 lives here)

1. **Draft sheet** (Google Sheet) — ran the snake draft once. Not in this repo.
2. **Scores backend** (Google Sheet) — commissioner enters results; published to web as a
   CSV. This CSV is the page's only live input. Not in this repo.
3. **Standings page** (this repo) — fetches that CSV on a timer, aggregates, ranks, renders.

The roster is hardcoded in the page; only **scores** come from the live feed.

## File map — where to make changes

| You want to…                          | Edit…                          |
|---------------------------------------|--------------------------------|
| Point at a different scores sheet     | `assets/js/config.js` (`csvUrl`) |
| Change refresh rate                   | `assets/js/config.js` (`pollSeconds`) |
| Update rosters after a re-draft       | `assets/js/data.js` (`ROSTER`) |
| Add/fix a nation's flag, code, colors | `assets/js/data.js` (`TEAMS`)  |
| Change scoring/rendering logic        | `assets/js/app.js`             |
| Restyle the card                      | `assets/css/styles.css`        |
| Change page markup                    | `index.html`                   |

`index.html` loads scripts in this order — **do not reorder**: `config.js` → `data.js` →
`app.js`. They share globals via classic-script scope (`CONFIG`, `TEAMS`, `ROSTER`,
`ROUNDS`), so `app.js` must load last.

## Data contract (CSV)

Header row, case-insensitive, any order: `owner, team, gs, r32, r16, qf, sf, fin, status`.

- `owner` must exactly match a `ROSTER` name; `team` must exactly match a `TEAMS` key
  (mind exact spelling: `Bosnia & Herzegovina`, `Ivory Coast`, `DR Congo`).
- `gs`..`fin` = numeric points per round (group stage → final). Scoring: 1/win, 0.5/draw.
- `status` = `OUT` once eliminated (shown struck-through); anything else = alive.
- Unknown `owner|team` rows are ignored.

⚠️ **Gotcha:** `applyCSV` skips any row with **< 10 columns**. The published sheet must
carry a 10th (helper) column or every row is dropped. If you ever touch `applyCSV`, decide
deliberately whether to keep that guard.

## Conventions / guardrails

- **No build step. Keep it that way** unless explicitly asked. It's the reason deploys are
  trivial. Don't introduce npm/bundlers/frameworks casually.
- **Preserve behavior** when refactoring; this drives a real, live pool. Verify changes.
- Only external runtime deps are Google Fonts (Anton, Poppins) via CDN.

## Run & verify locally

Serve over HTTP (the CSV fetch is cross-origin; `file://` won't work):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

For logic changes, a fast headless check: load `config.js`+`data.js`+`app.js` as one
combined script in a Node `vm` context with a stubbed `document`/`fetch`, feed a sample
CSV (remember the ≥10-column rule), call `applyCSV` then `render`, and assert totals /
ranking. (This is how the modular split was validated.)

## Deploy

Cloudflare Pages, static root (`/`), no build command. Pushing to `main` auto-deploys if
the Pages project is linked to the GitHub repo. `_headers` keeps `index.html` uncached so
score updates surface quickly.

## Session log

Record notable session work in `archive.md` (newest first). Update it when you finish a
meaningful change.
