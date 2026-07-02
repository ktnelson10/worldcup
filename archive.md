# Session Archive

A running log of work done on this project, newest first. Each entry: what we set out to
do, what changed, and anything worth remembering next time. Keep entries short.

---

## 2026-07-02 — Eliminated tiles keep their score

**Change:** eliminated (`OUT`) team tiles used to hide the score badge and show a red "OUT"
tag. Now they keep the score badge in place, dulled (via existing `.tile.out{opacity:.42}`)
with a red strikethrough — so you can still see the points that team banked toward the
player's total. Removed the `:after "OUT"` label and the `.tpts{display:none}`; added
`.tile.out .tpts` to the strikethrough selector. Assets bumped to `?v=5`.

**Also:** confirmed Cloudflare→GitHub auto-deploy isn't possible on this project — Direct
Upload projects can't convert to Git integration (would need a new Git-connected project or
GitHub Actions). User chose to stay on manual zip upload for now.

---

## 2026-06-29 — Mobile tile overflow fix (restructure regression)

**Symptom:** on phones, team tiles rendered code+name on one line ("MAR Morocco"),
overflowing off-screen — names cut, point badges pushed out of view.

**Cause:** `.tmeta` lost its vertical stacking in the modular restructure, so `.tcode` and
`.tname` (plain inline spans) sat side by side instead of stacked. The live site had been
running the *old single-file* index.html (Pages isn't linked to the repo, so the modular
version only went live with the manual zip deploy on 2026-06-28 — that's when it surfaced).

**Fix:** `assets/css/styles.css` — `.tmeta` → add `display:flex;flex-direction:column`
(stacks code over name; `min-width:0` + `.tname` ellipsis already truncate). Bumped all
asset cache-busters to `?v=3` (incl. the previously-unversioned `styles.css` link).

**Couldn't pixel-verify** (no browser engine in sandbox; Claude-in-Chrome read/screenshot
times out on document_idle for every page here). Verified by rule inspection only.

---

## 2026-06-28 — Escalating knockout scoring (in the page)

**Goal:** R32 wins were only scoring 1 pt; pool wants later rounds to count more.

**Did:**
- Added a `SCORING` object + `roundPoints()` / `finalPoints()` helpers to `assets/js/app.js`
  and routed `agg()` and the per-team tile total through them. Weights: GS 1 (draw 0.5),
  R32 2, R16 3, QF 4, SF 5, final = 10 champion / 7 runner-up. `applyCSV` untouched.
- Updated `README.md` + `CLAUDE.md` scoring sections.
- Verified with a stubbed-DOM Node test (11 cases: per-round weights, champion, runner-up,
  SF-loser, group unchanged, player aggregate).

**Why in the page, not the sheet:** the scores sheet only has a single global
"Points per WIN" setting, so it can't scale by round without a formula rewrite — and Google
Sheets' canvas can't be driven reliably through the browser tools. Weighting in the page
keeps the feed a simple win/draw recorder and all pool logic in one editable object.
The runner-up (7) is inferred as a team that won its semi (`sf`≥1) but is `OUT` with no
final win.

**Cache gotcha (fixed):** `_headers` caches `/assets/*` for 1h, and `index.html` loaded
the scripts unversioned — so the new `app.js` didn't reach browsers after deploy (still
showed 1 pt). Added `?v=2` to the three `<script>` tags in `index.html` (which is
`no-cache`), forcing a fresh fetch. Bump the version on future asset-logic changes. Also
refreshed the footer legend, which still read "1 pt per win."

**Still on the commissioner (sheet-side, manual):**
- The R32 team-picker dropdown is missing **South Africa** (a valid A2 qualifier) — needs
  adding to that column's data-validation list.
- The sheet's own internal Leaderboard tab still shows flat 1/win; only the website applies
  the weights.

---

## 2026-06-26 — Repo foundation: modular restructure + docs

**Goal:** Get the codebase into great shape. It had previously been a one-off spreadsheet
setup plus a single `index.html`; now it has a real repo (`github.com/ktnelson10/worldcup`).

**Did:**
- Split the monolithic 18 KB `index.html` into a build-free static structure:
  `index.html` (shell) + `assets/css/styles.css` + `assets/js/{config,data,app}.js`.
  Behavior preserved exactly.
- Wrote a comprehensive `README.md`: architecture/data-flow diagram, the 3-part system
  (draft sheet → scores sheet → page), scoring rules, CSV contract, update/deploy guides.
- Added repo hygiene: `.gitignore`, MIT `LICENSE`, Cloudflare `_headers` (uncached HTML).
- Added `CLAUDE.md` with agent guidance.
- Set up git locally and pushed: commit `52866ec` on top of the existing `e06c26e`
  ("Initial commit"), history preserved, no force-push.

**Learned / gotchas:**
- `applyCSV` skips rows with **< 10 columns**, so the live scores sheet must keep a 10th
  helper column. Documented in README + CLAUDE.md.
- The sandbox/mount used during the session couldn't run git (no file unlink permitted);
  git was run manually from the user's terminal. Not a repo issue.
- Verified the modular split renders identically via a stubbed-DOM Node test (totals,
  alive counts, ranking, OUT handling, all 48 teams, all flag styles).

**Open / possible next:**
- Confirm live site still renders after the restructure.
- Candidate features discussed, not yet built: match schedule/fixtures, per-round history
  trend, commissioner scoring cheat-sheet.

---

## (pre-history) — Original ad-hoc build

Before this repo existed, an earlier session produced: the draft Google Sheet (8-player
snake draft over 48 nations), the scores backend Google Sheet (published-to-CSV feed), and
the original single-file `index.html` standings page deployed to Cloudflare Pages.
