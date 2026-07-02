/*
 * bracket.js — static seeding of the 2026 World Cup knockout bracket.
 *
 * BRACKET32 lists the 32 Round-of-32 participants in *tree order*: adjacent
 * pairs are R32 matches, and simple binary pairing back up the list rebuilds
 * R16 -> QF -> SF -> Final (see buildBracketTree() in app.js). The first 16
 * names are the left half (feed Semifinal M101); the last 16 are the right
 * half (feed Semifinal M102).
 *
 * Only the *structure* lives here. Who has advanced or been eliminated is NOT
 * hardcoded — it comes from the live feed (STATE), so PPR updates on its own as
 * results are entered. Names must exactly match TEAMS keys in data.js.
 *
 * Update this only if the seeding itself changes (e.g. a re-draw). Loaded after
 * data.js and before app.js.
 */
const BRACKET32 = [
  // ---- Left half (-> Semifinal M101) ----
  "Germany", "Paraguay",              // M74  (1E v 3D)
  "France", "Sweden",                 // M77  (1I v 3F)
  "South Africa", "Canada",           // M73  (2A v 2B)
  "Netherlands", "Morocco",           // M75  (1F v 2C)
  "Portugal", "Croatia",              // M83  (2K v 2L)
  "Spain", "Austria",                 // M84  (1H v 2J)
  "USA", "Bosnia & Herzegovina",      // M81  (1D v 3B)
  "Belgium", "Senegal",               // M82  (1G v 3I)
  // ---- Right half (-> Semifinal M102) ----
  "Brazil", "Japan",                  // M76  (1C v 2F)
  "Ivory Coast", "Norway",            // M78  (2E v 2I)
  "Mexico", "Ecuador",                // M79  (1A v 3E)
  "England", "DR Congo",              // M80  (1L v 3K)
  "Argentina", "Cape Verde",          // M86  (1J v 2H)
  "Australia", "Egypt",               // M88  (2D v 2G)
  "Switzerland", "Algeria",           // M85  (1B v 3J)
  "Colombia", "Ghana"                 // M87  (1K v 3L)
];
