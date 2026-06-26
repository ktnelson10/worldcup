# World Cup 2026 Pool

A friendly competition where **8 players run a snake draft over all 48 nations** at the
2026 World Cup, then track how their teams do as the tournament unfolds. This repo holds
the **live standings web page** that everyone opens on their phone to see who's winning.

🔗 **Live site:** https://worldcup-pool.pages.dev

---

## How the whole thing fits together

There are three moving parts. Only the third one lives in this repo — the first two are
Google Sheets — but it helps to understand all of them.

```
┌──────────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│  1. DRAFT SHEET       │     │  2. SCORES BACKEND     │     │  3. STANDINGS PAGE      │
│  (Google Sheet)       │     │  (Google Sheet)        │     │  (this repo)            │
│                       │     │                        │     │                         │
│  Run the 8-player     │ →   │  Commissioner enters   │ →   │  Fetches the published  │
│  snake draft. Output: │     │  each team's points    │     │  CSV every few minutes, │
│  who owns which 6     │     │  per round + OUT flag.  │     │  ranks players, paints  │
│  teams.               │     │  Published to web as   │     │  the live card.         │
│                       │     │  a CSV link.           │     │                         │
└──────────────────────┘     └───────────────────────┘     └────────────────────────┘
        one-time                 updated during the              auto-refreshes,
       (before the cup)             tournament                   no input needed
```

1. **Draft sheet** — used once, before the tournament, to run the snake draft. Each of the
   8 players ends up with 6 nations (8 × 6 = 48, the full field).
   <br>Sheet: https://docs.google.com/spreadsheets/d/17Y2CHCb8jeJ59mU9xPXEIX2ubKxjn0bL/edit
2. **Scores backend** — where the commissioner enters results as the games happen. It is
   **published to the web as a CSV**, which is the data feed the page reads.
   <br>Sheet: https://docs.google.com/spreadsheets/d/1GvQQcUtk5iZUGpEzpkMvTQFcySHOQLO2/edit
3. **Standings page** — the code in this repo, deployed on Cloudflare Pages. Players just
   open the URL; it pulls the latest CSV and re-sorts the standings automatically.

> The roster (who drafted whom) is baked into the page's code so it renders instantly even
> before any scores exist. The **scores** are the only thing that comes from the live feed.

---

## Scoring rules

- **1 point** for a win, **0.5 points** for a draw (entered into the scores sheet per team).
- Points are tracked **per round**, group stage through the final:

  | Column | Round            |
  |--------|------------------|
  | `gs`   | Group Stage      |
  | `r32`  | Round of 32      |
  | `r16`  | Round of 16      |
  | `qf`   | Quarter-final    |
  | `sf`   | Semi-final       |
  | `fin`  | Final            |

- A team marked `OUT` in the `status` column is shown struck-through. A player's score is
  the sum of all their teams' points across every round.
- **Ranking tiebreakers:** total points, then number of teams still alive, then name.

---

## The data feed (CSV contract)

The page expects the published CSV to have a header row with these columns
(case-insensitive, order doesn't matter):

```
owner, team, gs, r32, r16, qf, sf, fin, status
```

- `owner` must exactly match a player name in the roster (`Alain`, `Zools`, `Tyson`,
  `Kyle`, `Jordan`, `Tuna`, `Levi`, `Brian`).
- `team` must exactly match a nation name as spelled in `assets/js/data.js`
  (e.g. `Bosnia & Herzegovina`, `Ivory Coast`, `DR Congo`).
- `gs`..`fin` are numeric points for that round (blank = 0).
- `status` = `OUT` once the team is eliminated; anything else means still alive.

Rows whose `owner|team` pair isn't in the roster are ignored, so extra/helper rows in the
sheet are harmless.

> ⚠️ **Gotcha:** the parser only accepts rows that have **at least 10 columns**, so the
> published sheet needs one extra trailing column beyond the 9 named ones (any helper
> column works). A sheet with exactly the 9 columns above would have all its rows skipped.
> See `applyCSV` in [`assets/js/app.js`](assets/js/app.js).

---

## Updating things

**Enter scores during the tournament**
Edit the scores backend sheet. Because it's published to the web, the CSV link updates on
its own (Google refreshes it every few minutes) and the page picks it up on its next poll.
Nothing in this repo needs to change.

**Change the roster (e.g. after a re-draft)**
Edit `ROSTER` in [`assets/js/data.js`](assets/js/data.js), commit, and redeploy.

**Point the page at a different scores sheet**
Edit `CONFIG.csvUrl` in [`assets/js/config.js`](assets/js/config.js). To generate a CSV
link from a sheet: **File → Share → Publish to web → pick the results tab → CSV → Publish**.

**Tune the refresh rate**
Edit `CONFIG.pollSeconds` in [`assets/js/config.js`](assets/js/config.js) (default 180s).

---

## Project structure

```
.
├── index.html              # Page shell: markup + loads the assets below
├── assets/
│   ├── css/
│   │   └── styles.css      # All styling (dark, phone-first standings card)
│   └── js/
│       ├── config.js       # CSV feed URL + poll interval (edit this to re-point the feed)
│       ├── data.js         # TEAMS, ROSTER, ROUNDS — the static draft data
│       └── app.js          # Fetch + parse CSV, aggregate, rank, render
├── _headers                # Cloudflare Pages cache headers
├── LICENSE                 # MIT
└── README.md
```

No framework, no build step, no dependencies — it's plain static HTML/CSS/JS. The only
external resources are Google Fonts (Anton + Poppins) loaded via CDN.

---

## Running it locally

Because the browser fetches a cross-origin CSV, serve the folder over HTTP rather than
opening the file directly:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

---

## Deployment (Cloudflare Pages)

The site is hosted on **Cloudflare Pages** at https://worldcup-pool.pages.dev.

Because there's no build step, the Pages project just serves this repo as static files:

- **Build command:** _(none)_
- **Build output directory:** `/` (repo root)

If the Pages project is connected to this GitHub repo, pushing to `main` triggers an
automatic deploy. Otherwise you can drag-and-drop the folder in the Cloudflare dashboard.
The `_headers` file keeps `index.html` uncached so score updates appear promptly.

---

## License

[MIT](LICENSE)
