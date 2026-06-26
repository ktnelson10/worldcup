/*
 * data.js — the static draft data for the pool.
 *
 * TEAMS: map of full nation name -> [code, flagStyle, [colors...]]
 *   - code:      3-letter display code (e.g. "ESP")
 *   - flagStyle: how svgEmblem() renders the flag swatch
 *                "h" horizontal stripes, "v" vertical stripes,
 *                "d" disc/roundel, "x" diagonal, single color otherwise
 *   - colors:    hex colors used to draw the flag, in order
 *
 * ROSTER: ordered list of [player, [their 6 drafted teams]].
 *   Order here is the snake-draft order and also the default display order
 *   before live points re-sort the standings.
 *
 * ROUNDS: [key, label] pairs for each scoring round, group stage -> final.
 *   These keys must match the CSV column names (gs, r32, r16, qf, sf, fin).
 *
 * To update rosters after a (re)draft, edit ROSTER below. To add/adjust a
 * nation's flag or code, edit TEAMS. No build step — just save and redeploy.
 */
const TEAMS = {"Spain": ["ESP", "h", ["#AA151B", "#F1BF00", "#AA151B"]], "Mexico": ["MEX", "v", ["#006847", "#FFFFFF", "#CE1126"]], "Croatia": ["CRO", "h", ["#FF0000", "#FFFFFF", "#171796"]], "Panama": ["PAN", "x", ["#005293", "#FFFFFF", "#D21034"]], "Tunisia": ["TUN", "d", ["#E70013", "#FFFFFF"]], "Haiti": ["HAI", "h", ["#00209F", "#D21034"]], "Argentina": ["ARG", "h", ["#74ACDF", "#FFFFFF", "#74ACDF"]], "Japan": ["JPN", "d", ["#FFFFFF", "#BC002D"]], "Uruguay": ["URU", "h", ["#7B9FD4", "#FFFFFF"]], "Algeria": ["ALG", "v", ["#006233", "#FFFFFF", "#D21034"]], "Bosnia & Herzegovina": ["BIH", "x", ["#002395", "#FECB00"]], "Curacao": ["CUW", "h", ["#002B7F", "#F9E814"]], "France": ["FRA", "v", ["#0055A4", "#FFFFFF", "#EF4135"]], "USA": ["USA", "x", ["#3C3B6E", "#FFFFFF", "#B22234"]], "Ecuador": ["ECU", "h", ["#FFD100", "#0072CE", "#EF3340"]], "Egypt": ["EGY", "h", ["#CE1126", "#FFFFFF", "#000000"]], "Iran": ["IRN", "h", ["#239F40", "#FFFFFF", "#DA0000"]], "Qatar": ["QAT", "v", ["#8A1538", "#FFFFFF"]], "England": ["ENG", "x", ["#FFFFFF", "#CF142B"]], "Turkiye": ["TUR", "d", ["#E30A17", "#FFFFFF"]], "Switzerland": ["SUI", "x", ["#D52B1E", "#FFFFFF"]], "Paraguay": ["PAR", "h", ["#D52B1E", "#FFFFFF", "#0038A8"]], "Czechia": ["CZE", "x", ["#11457E", "#FFFFFF", "#D7141A"]], "Uzbekistan": ["UZB", "h", ["#0099B5", "#FFFFFF", "#1EB53A"]], "Portugal": ["POR", "v", ["#006600", "#FF0000"]], "Norway": ["NOR", "x", ["#BA0C2F", "#FFFFFF", "#00205B"]], "Senegal": ["SEN", "v", ["#00853F", "#FDEF42", "#E31B23"]], "Australia": ["AUS", "x", ["#00247D", "#FFFFFF", "#E4002B"]], "Jordan": ["JOR", "h", ["#000000", "#FFFFFF", "#007A3D", "#CE1126"]], "New Zealand": ["NZL", "x", ["#00247D", "#FFFFFF", "#CC142B"]], "Netherlands": ["NED", "h", ["#AE1C28", "#FFFFFF", "#21468B"]], "Colombia": ["COL", "h", ["#FCD116", "#003893", "#CE1126"]], "Canada": ["CAN", "v", ["#FF0000", "#FFFFFF", "#FF0000"]], "Austria": ["AUT", "h", ["#ED2939", "#FFFFFF", "#ED2939"]], "Saudi Arabia": ["KSA", "d", ["#006C35", "#FFFFFF"]], "DR Congo": ["COD", "x", ["#007FFF", "#F7D618", "#CE1021"]], "Brazil": ["BRA", "d", ["#009C3B", "#FFDF00", "#002776"]], "Morocco": ["MAR", "d", ["#C1272D", "#006233"]], "Ivory Coast": ["CIV", "v", ["#F77F00", "#FFFFFF", "#009E60"]], "Scotland": ["SCO", "x", ["#005EB8", "#FFFFFF"]], "Ghana": ["GHA", "h", ["#CE1126", "#FCD116", "#006B3F"]], "Cape Verde": ["CPV", "h", ["#003893", "#FFFFFF", "#CF2027"]], "Germany": ["GER", "h", ["#000000", "#DD0000", "#FFCE00"]], "Belgium": ["BEL", "v", ["#000000", "#FAE042", "#ED2939"]], "Sweden": ["SWE", "x", ["#006AA7", "#FECC00"]], "South Korea": ["KOR", "d", ["#FFFFFF", "#CD2E3A", "#0047A0"]], "Iraq": ["IRQ", "h", ["#CE1126", "#FFFFFF", "#000000"]], "South Africa": ["RSA", "x", ["#007A4D", "#FFB915", "#DE3831", "#002395"]]};

const ROSTER = [["Alain", ["Spain", "Mexico", "Croatia", "Panama", "Tunisia", "Haiti"]], ["Zools", ["Argentina", "Japan", "Uruguay", "Algeria", "Bosnia & Herzegovina", "Curacao"]], ["Tyson", ["France", "USA", "Ecuador", "Egypt", "Iran", "Qatar"]], ["Kyle", ["England", "Turkiye", "Switzerland", "Paraguay", "Czechia", "Uzbekistan"]], ["Jordan", ["Portugal", "Norway", "Senegal", "Australia", "Jordan", "New Zealand"]], ["Tuna", ["Netherlands", "Colombia", "Canada", "Austria", "Saudi Arabia", "DR Congo"]], ["Levi", ["Brazil", "Morocco", "Ivory Coast", "Scotland", "Ghana", "Cape Verde"]], ["Brian", ["Germany", "Belgium", "Sweden", "South Korea", "Iraq", "South Africa"]]];

const ROUNDS = [["gs", "GS"], ["r32", "R32"], ["r16", "R16"], ["qf", "QF"], ["sf", "SF"], ["fin", "F"]];
