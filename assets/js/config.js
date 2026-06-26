/*
 * config.js — runtime configuration for the live standings page.
 *
 * csvUrl:
 *   The "Publish to web" CSV link from the scores backend Google Sheet.
 *   To (re)generate it: open the scores sheet, then
 *     File -> Share -> Publish to web -> pick the results tab -> CSV -> Publish,
 *   and paste the resulting link here. It should look like:
 *     https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=...&single=true&output=csv
 *   The CSV must have a header row with these columns (case-insensitive):
 *     owner, team, gs, r32, r16, qf, sf, fin, status
 *   where gs..fin are points earned in each round and status is "OUT" when the
 *   team is eliminated (anything else = still alive).
 *
 * pollSeconds:
 *   How often the page re-fetches the CSV, in seconds.
 */
const CONFIG = {
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4iNiLbGeGYP9ew2-IdGMqEifdtRXjInpLi-gZsqPfZQn3TRZ810wgjGUpa1PDoQ/pub?gid=474875392&single=true&output=csv",
  pollSeconds: 180
};
