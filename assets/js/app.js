/*
 * app.js — live standings logic.
 *
 * Depends on globals defined by config.js and data.js (loaded before this file):
 *   CONFIG, TEAMS, ROSTER, ROUNDS
 *
 * Flow:
 *   1. Build a STATE map of "player|team" -> per-round points + out flag.
 *   2. refresh() fetches the published CSV and applyCSV() writes it into STATE.
 *   3. render() aggregates points per player, ranks, and paints the cards.
 *   4. A timer re-runs refresh() every CONFIG.pollSeconds.
 */

// Per (player, team) scoring state, seeded to zero for every drafted team.
let STATE = {};
ROSTER.forEach(([p, ts]) => ts.forEach(t => STATE[p + "|" + t] = {gs: 0, r32: 0, r16: 0, qf: 0, sf: 0, fin: 0, out: false}));

/*
 * SCORING — how raw feed points become pool points.
 *
 * The scores feed (CSV) records the *raw result* of each round: group-stage
 * points (1/win, 0.5/draw) and a flat 1 for each knockout win. The pool weights
 * later rounds more heavily, so we scale those raw values here — the feed stays
 * simple and all the pool-specific scoring lives in this one place.
 *
 *   Group win 1 (draw 0.5) · R32 2 · R16 3 · QF 4 · SF 5 · runner-up 7 · champion 10
 *
 * The final is asymmetric (the loser still scores), so it's handled in
 * finalPoints() rather than as a simple multiplier. To retune the pool, edit
 * the numbers below.
 */
const SCORING = {
  roundWeight: {gs: 1, r32: 2, r16: 3, qf: 4, sf: 5}, // multiplied against raw feed points
  champion: 10, // winning the final
  runnerUp: 7   // reaching the final and losing it
};

// Points a team earns for the final: champion if it won, runner-up if it
// reached the final (won its semi) but is now eliminated, otherwise none.
function finalPoints(s) {
  if (Number(s.fin || 0) >= 1) return SCORING.champion;
  if (s.out && Number(s.sf || 0) >= 1) return SCORING.runnerUp;
  return 0;
}

// Weighted per-round points for a single (player, team) state.
function roundPoints(s) {
  const w = SCORING.roundWeight;
  return {
    gs: Number(s.gs || 0) * w.gs,
    r32: Number(s.r32 || 0) * w.r32,
    r16: Number(s.r16 || 0) * w.r16,
    qf: Number(s.qf || 0) * w.qf,
    sf: Number(s.sf || 0) * w.sf,
    fin: finalPoints(s)
  };
}

/*
 * Points Possible Remaining (PPR) — bracket-aware.
 *
 * The naive ceiling (assume every surviving team wins out) overcounts, because
 * a player's own teams can meet in the bracket and knock each other out. The
 * real PPR is the MAX total remaining points a player can still earn given the
 * actual bracket (BRACKET32) and current results (STATE): in every match one
 * team advances, and when two of your teams collide only one path continues.
 *
 * We solve it with a tree DP over the bracket. Remaining points per round:
 * R32 2, R16 3, QF 4, SF 5, and the final gives champion 10 / runner-up 7
 * (the loser still scores). Matches already played contribute 0 (banked, not
 * "remaining"); eliminated teams contribute 0.
 */
const KO_KEYS = ['r32', 'r16', 'qf', 'sf', 'fin'];      // round index 0..4

// name -> owner (static, from the draft).
const TEAM_OWNER = {};
ROSTER.forEach(([p, ts]) => ts.forEach(t => TEAM_OWNER[t] = p));

// Turn the flat BRACKET32 list into a nested binary tree by pairing upward.
function buildBracketTree(list) {
  let nodes = list.slice();
  while (nodes.length > 1) {
    const next = [];
    for (let i = 0; i < nodes.length; i += 2) next.push([nodes[i], nodes[i + 1]]);
    nodes = next;
  }
  return nodes[0];
}
const BRACKET_TREE = (typeof BRACKET32 !== 'undefined') ? buildBracketTree(BRACKET32) : null;

function stByName(name) { return STATE[TEAM_OWNER[name] + "|" + name]; }
function wonRound(name, idx) { const s = stByName(name); return !!(s && Number(s[KO_KEYS[idx]] || 0) >= 1); }
function teamOut(name) { const s = stByName(name); return !!(s && s.out); }
function leavesOf(node) { return (typeof node === 'string') ? [node] : leavesOf(node[0]).concat(leavesOf(node[1])); }

// DP: returns {P, O} = max remaining points for `player` within this subtree,
// given the team advancing out of this match is Player-owned (P) or Other (O).
function pprSolve(node, roundIdx, player) {
  const NEG = -Infinity, w = SCORING.roundWeight;
  const own = t => (TEAM_OWNER[t] === player) ? 'P' : 'O';

  // R32 match: children are team names.
  if (typeof node[0] === 'string') {
    const [a, b] = node, r = { P: NEG, O: NEG };
    const decided = wonRound(a, 0) ? a : (wonRound(b, 0) ? b : null);
    if (decided) { r[own(decided)] = 0; return r; }        // played -> winner banked
    [a, b].forEach(t => {                                    // pending -> non-out team can win
      if (!teamOut(t)) { const bonus = TEAM_OWNER[t] === player ? w.r32 : 0; r[own(t)] = Math.max(r[own(t)], bonus); }
    });
    return r;
  }

  const L = pprSolve(node[0], roundIdx - 1, player);
  const R = pprSolve(node[1], roundIdx - 1, player);
  const isFinal = roundIdx === 4;
  const roundW = [w.r32, w.r16, w.qf, w.sf][roundIdx];
  const winBonus = adv => adv === 'P' ? (isFinal ? SCORING.champion : roundW) : 0;
  const loseBonus = lo => (isFinal && lo === 'P') ? SCORING.runnerUp : 0;
  const bestFinite = xs => { const f = xs.filter(x => x > NEG); return f.length ? Math.max(...f) : NEG; };

  const decided = leavesOf(node).find(t => wonRound(t, roundIdx));
  if (decided) {                                            // this match already played
    const winSide = leavesOf(node[0]).includes(decided) ? L : R;
    const loseSide = winSide === L ? R : L;
    const wo = own(decided), loserPts = bestFinite([loseSide.P, loseSide.O]);
    const r = { P: NEG, O: NEG };
    if (winSide[wo] > NEG && loserPts > NEG) r[wo] = winSide[wo] + loserPts;
    return r;
  }

  const r = { P: NEG, O: NEG };                             // undecided -> pick the winner freely
  ['P', 'O'].forEach(adv => {
    let best = NEG;
    [[L, R], [R, L]].forEach(([ws, ls]) => {
      if (ws[adv] <= NEG) return;
      const loserPts = bestFinite([
        ls.P > NEG ? ls.P + loseBonus('P') : NEG,
        ls.O > NEG ? ls.O + loseBonus('O') : NEG
      ]);
      if (loserPts <= NEG) return;
      best = Math.max(best, ws[adv] + winBonus(adv) + loserPts);
    });
    r[adv] = best;
  });
  return r;
}

// Max remaining points a player can still earn across the whole bracket.
function computePPR(player) {
  if (!BRACKET_TREE) return 0;
  const r = pprSolve(BRACKET_TREE, 4, player);
  const v = Math.max(r.P, r.O);
  return v > -Infinity ? v : 0;
}

// Render a circular flag emblem for a team as inline SVG.
function svgEmblem(team, size) {
  const T = TEAMS[team] || ["", 'v', ['#888']];
  const cols = T[2], k = T[1], n = cols.length;
  let body;
  if (n === 1) {
    body = `<circle cx="50" cy="50" r="50" fill="${cols[0]}"/>`;
  } else if (k === "d") {
    body = `<circle cx="50" cy="50" r="50" fill="${cols[0]}"/><circle cx="50" cy="50" r="26" fill="${cols[1]}"/>` +
      (n > 2 ? `<circle cx="50" cy="50" r="26" fill="none" stroke="${cols[2]}" stroke-width="7"/>` : "");
  } else if (k === "v" || k === "h") {
    const w = 100 / n;
    let p = "";
    cols.forEach((c, i) => {
      p += k === "v"
        ? `<rect x="${i * w}" y="0" width="${w + 0.4}" height="100" fill="${c}"/>`
        : `<rect x="0" y="${i * w}" width="100" height="${w + 0.4}" fill="${c}"/>`;
    });
    body = `<g clip-path="url(#cc)">${p}</g>`;
  } else {
    const w = 100 / n;
    let b = "";
    cols.forEach((c, i) => {
      b += `<rect x="${i * w - 30}" y="-40" width="${w + 0.5}" height="180" fill="${c}"/>`;
    });
    body = `<g clip-path="url(#cc)"><g transform="rotate(-45 50 50)">${b}</g></g>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:${size}px;height:${size}px;border-radius:50%;flex-shrink:0;box-shadow:inset 0 0 0 2px rgba(255,255,255,.5),0 1px 3px rgba(0,0,0,.4)"><defs><clipPath id="cc"><circle cx="50" cy="50" r="50"/></clipPath></defs>${body}<circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="3"/></svg>`;
}

// Aggregate a player's totals across their teams.
function agg(p, ts) {
  let a = {gs: 0, r32: 0, r16: 0, qf: 0, sf: 0, fin: 0, total: 0, alive: 0, ppr: 0};
  ts.forEach(t => {
    const s = STATE[p + "|" + t];
    const pts = roundPoints(s);
    ROUNDS.forEach(([k]) => a[k] += pts[k]);
    if (!s.out) a.alive++;
  });
  a.ppr = computePPR(p);
  a.total = ROUNDS.reduce((x, [k]) => x + a[k], 0);
  return a;
}

// Paint the ranked standings into the DOM.
function render() {
  const ranked = ROSTER.map(([p, ts]) => ({p, ts, a: agg(p, ts)}))
    .sort((x, y) => y.a.total - x.a.total || y.a.alive - x.a.alive || x.p.localeCompare(y.p));
  const rows = document.getElementById("rows");
  rows.innerHTML = "";
  ranked.forEach((r, i) => {
    const lead = i === 0 && r.a.total > 0;
    const rk = i + 1;
    const cls = rk === 1 ? "g1" : rk === 2 ? "g2" : rk === 3 ? "g3" : "";
    let brk = "";
    ROUNDS.forEach(([k, l]) => {
      const v = r.a[k];
      brk += `<div class="brk ${v ? '' : 'zero'}"><div class="bl">${l}</div><div class="bv">${v}</div></div>`;
    });
    let tiles = "";
    r.ts.forEach(t => {
      const s = STATE[r.p + "|" + t];
      const p = roundPoints(s);
      const tp = p.gs + p.r32 + p.r16 + p.qf + p.sf + p.fin;
      const code = (TEAMS[t] || [t])[0];
      tiles += `<div class="tile ${s.out ? 'out' : ''}">${svgEmblem(t, 30)}<span class="tmeta"><span class="tcode">${code}</span><span class="tname">${t}</span></span><span class="tpts ${tp ? '' : 'z'}">${tp}</span></div>`;
    });
    const d = document.createElement("div");
    d.className = "row" + (lead ? " lead" : "");
    d.innerHTML = `<div class="rtop"><div class="rank ${cls}">${rk}</div><div class="who"><div class="pname">${r.p}</div><div class="psub">${lead ? '<span class="crown">◆ Pool Leader</span> · ' : ''}Teams alive <b>${r.a.alive}/6</b> · <span title="Points Possible Remaining — the most you could still add if every surviving team won out">PPR <b>${r.a.ppr}</b></span></div></div><div class="total"><div class="tv">${r.a.total}</div><div class="tl">PTS</div></div></div><div class="breaks">${brk}</div><div class="tiles">${tiles}</div>`;
    rows.appendChild(d);
  });
}

// Parse the CSV text and write per-team points into STATE.
function applyCSV(text) {
  const lines = text.trim().split(/\r?\n/).map(l => l.split(","));
  const head = lines[0].map(s => s.trim().toLowerCase());
  const ix = n => head.indexOf(n);
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i];
    if (c.length < 10) continue;
    const owner = (c[ix("owner")] || "").trim(), team = (c[ix("team")] || "").trim();
    const k = owner + "|" + team;
    if (!STATE[k]) continue;
    STATE[k] = {
      gs: +c[ix("gs")] || 0,
      r32: +c[ix("r32")] || 0,
      r16: +c[ix("r16")] || 0,
      qf: +c[ix("qf")] || 0,
      sf: +c[ix("sf")] || 0,
      fin: +c[ix("fin")] || 0,
      out: (c[ix("status")] || "").trim().toUpperCase() === "OUT"
    };
  }
}

// Fetch the latest CSV, update STATE, and re-render.
async function refresh() {
  const u = document.getElementById("upd");
  if (!CONFIG.csvUrl || CONFIG.csvUrl.indexOf("PASTE_") === 0) {
    u.innerHTML = '<span class="err">Set CONFIG.csvUrl to your published CSV link.</span>';
    render();
    return;
  }
  try {
    const r = await fetch(CONFIG.csvUrl + (CONFIG.csvUrl.includes("?") ? "&" : "?") + "t=" + Date.now());
    const txt = await r.text();
    applyCSV(txt);
    render();
    u.textContent = "Updated " + new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}) + " · auto-refreshes";
  } catch (e) {
    u.innerHTML = '<span class="err">Could not reach the sheet — retrying…</span>';
    render();
  }
}

// Boot: paint zeros immediately, fetch live data, then poll.
render();
refresh();
setInterval(refresh, CONFIG.pollSeconds * 1000);
