'use strict';
// The maze: a quiet thinking job in the grounds of Wisteria Manor (and in the
// puzzle room). A little hedge maze seen from above, grown by a depth-first walk
// from S.r, so there is always exactly one way from the gate to the fountain in
// the middle. Drag from the gate and a line of light follows the finger along
// the gravel. A hedge just stops it there, nothing starts over. Lift the finger
// and the line stays; put it back on the end and it carries on. Going back along
// the line rubs it out softly. Each turn on the way to the middle pays its
// share, once, however often it is walked.
//   node test/run.mjs puzzle js/pz-maze.js maze --seeds 30

(() => {
  const W = 360;
  const N = 7, C = 46;            // seven by seven cells, each wide enough for a finger
  const T = 13;                   // how thick a hedge is
  const X0 = (W - N * C) / 2, Y0 = 124, X1 = X0 + N * C, Y1 = Y0 + N * C;
  const MID = (N * N - 1) / 2;    // the cell in the very middle
  const MIN_TURNS = 6, MAX_TURNS = 12;
  const STRAIGHT = 0.65;          // how often the walk keeps straight on when it can
  const GRAB = C;                 // the finger takes the end of the line from this far away
  const SLACK = 6;                // the finger has to be this far out of a cell to leave it
  const STRIDE = 6;               // a stroke is followed in bites this small
  const RIM = 18;                 // the fountain's stone rim, from its middle
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];   // up, right, down, left

  const cx = (i) => X0 + (i % N + 0.5) * C, cy = (i) => Y0 + (((i / N) | 0) + 0.5) * C;
  const near = (i, d) => { const a = i % N + DX[d], b = ((i / N) | 0) + DY[d]; return a >= 0 && a < N && b >= 0 && b < N ? b * N + a : -1; };
  const cellAt = (x, y) => { const a = Math.floor((x - X0) / C), b = Math.floor((y - Y0) / C); return a >= 0 && a < N && b >= 0 && b < N ? b * N + a : -1; };

  // One maze: a depth-first walk over the grid from the gate, keeping straight
  // on more often than not, so the alleys are long and the turns few. The middle
  // stays out of the walk and is opened to one neighbour afterwards, so it has
  // one way in. Every cell is reached once, so between two cells there is
  // exactly one way. way = the cells from the gate to the middle; turnNo = for
  // each cell where that way turns, which turn it is, counted from 1.
  function grow(r) {
    const gate = N * (N - 1) + ((r() * N) | 0);
    const doors = Array.from({ length: N * N }, () => []), from = new Array(N * N).fill(-1), seen = new Array(N * N).fill(false);
    seen[MID] = seen[gate] = true;
    const stack = [[gate, 0]];
    while (stack.length) {
      const [i, ahead] = stack[stack.length - 1];
      const ways = [0, 1, 2, 3].filter((d) => near(i, d) >= 0 && !seen[near(i, d)]);
      if (!ways.length) { stack.pop(); continue; }
      const d = ways.includes(ahead) && r() < STRAIGHT ? ahead : U.pick(r, ways), j = near(i, d);
      seen[j] = true; from[j] = i; doors[i].push(j); doors[j].push(i);
      stack.push([j, d]);
    }
    const last = near(MID, (r() * 4) | 0);
    doors[last].push(MID); doors[MID].push(last);
    const way = [MID, last];
    while (way[way.length - 1] !== gate) way.push(from[way[way.length - 1]]);
    way.reverse();
    const turnNo = new Array(N * N).fill(0);
    let turns = 0;
    for (let k = 1; k + 1 < way.length; k++) if (way[k] - way[k - 1] !== way[k + 1] - way[k]) turnNo[way[k]] = ++turns;
    return { gate, doors, way, turnNo, turns };
  }

  function maze(S) {
    const r = S.r;
    // more than half of all walks land in range, so this takes a try or two
    let g;
    do g = grow(r); while (g.turns < MIN_TURNS || g.turns > MAX_TURNS);
    const { gate, doors, way, turnNo } = g, steps = g.turns, deco = (r() * 1e9) | 0;
    const gx = cx(gate);

    let path = [gate], paid = 0, held = null, hintT = 0, shine = 0, nudge = 0, bumpT = 0, fx = null;
    let rest = [0, 0];                // the tip of the line, drawing back after the finger lifts
    const ghosts = [], leaves = [];   // line being rubbed out; leaves shaken from a hedge
    const head = () => path[path.length - 1];
    const solved = () => head() === MID;

    // ------------------------------------------------- the finger and the line
    function stepTo(j) {
      if (path[path.length - 2] === j) { ghosts.push({ a: path.pop(), b: j, k: 1 }); return; }
      path.push(j); hintT = 0;
      if (turnNo[j] > paid) { paid = turnNo[j]; fx.sound('clink'); fx.good(cx(j), cy(j)); }
      if (j === MID) {
        fx.sound('chime');
        for (let k = 0; k < 9; k++) fx.sparkle(cx(j) + Math.cos(k * 0.7) * 24, cy(j) + Math.sin(k * 0.7) * 24);
      }
    }
    // the way along the gravel from a to b, if it is one or two cells long, so a
    // finger that cuts a corner over the end of a hedge still gets round it
    function routeTo(a, b) {
      if (doors[a].includes(b)) return [b];
      const via = doors[a].find((q) => doors[q].includes(b));
      return via === undefined ? null : [via, b];
    }
    function rustle(x, y) {
      if (bumpT > 0) return;
      bumpT = 0.5;
      for (let k = 0; k < 5; k++) leaves.push({ x, y, vx: (Math.random() - 0.5) * 36, vy: -8 - Math.random() * 20, a: Math.random() * 6, t: 0 });
    }
    function follow(x, y) {
      const h = head(), inside = Math.abs(x - cx(h)) <= C / 2 + SLACK && Math.abs(y - cy(h)) <= C / 2 + SLACK;
      if (!held.on) { held.on = inside; return; }
      if (inside) return;
      const i = cellAt(x, y), route = i < 0 ? null : routeTo(h, i);
      if (route) route.forEach(stepTo);
      else if (i >= 0 && [0, 1, 2, 3].some((d) => near(h, d) === i)) rustle((cx(h) + cx(i)) / 2, (cy(h) + cy(i)) / 2);
    }
    // a stroke is followed in small bites, however fast the finger went
    function stroke(ax, ay, bx, by) {
      const n = Math.ceil(PZ.dist(ax, ay, bx, by) / STRIDE);
      for (let k = 1; k <= n && !solved(); k++) follow(U.lerp(ax, bx, k / n), U.lerp(ay, by, k / n));
    }
    // where the tip of the line is, from the middle of the last cell: along the
    // gravel towards the finger, and only up to the hedge if there is one
    function tip() {
      if (!held || !held.on || solved()) return rest;
      const h = head(), ox = held.x - cx(h), oy = held.y - cy(h), across = Math.abs(ox) >= Math.abs(oy);
      const d = across ? (ox > 0 ? 1 : 3) : (oy > 0 ? 2 : 0);
      const v = Math.min(doors[h].includes(near(h, d)) ? C / 2 : C / 2 - T / 2 - 6, Math.abs(across ? ox : oy));
      return [DX[d] * v, DY[d] * v];
    }
    function trail(still) {
      const pts = [[gx, Y1 + 12]].concat(path.map((i) => [cx(i), cy(i)]));
      const [ox, oy] = still ? [0, 0] : tip(), [ax, ay] = pts[pts.length - 1], [bx, by] = pts[pts.length - 2];
      if (solved()) {
        // the line stops at the rim of the fountain, not in the water
        const d = PZ.dist(ax, ay, bx, by);
        pts[pts.length - 1] = [ax + ((bx - ax) * RIM) / d, ay + ((by - ay) * RIM) / d];
      } else if (ox || oy) {
        // heading back towards the cell before: the corner in this cell is not reached
        if (ox * (bx - ax) + oy * (by - ay) > 0) pts.pop();
        pts.push([ax + ox, ay + oy]);
      }
      return pts;
    }
    // the cells of the hint: on to the next turn, or back to where the line left the way
    function hintWay() {
      const at = way.indexOf(head());
      if (at < 0) {
        const back = path.slice().reverse();
        return back.slice(0, back.findIndex((q) => way.includes(q)) + 1);
      }
      let e = at + 1;
      while (e < way.length - 1 && !turnNo[way[e]]) e++;
      return way.slice(at, e + 1);
    }

    // ----------------------------------------------------------- the garden
    function ground(c) {
      const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(deco);
      c.fillStyle = '#a3c784'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = Math.floor(y0 / 72) * 72; y < y1; y += 72) c.fillRect(x0, y, x1 - x0, 36);
      for (let i = 0; i < 420; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(70,110,60,0.14)' : 'rgba(230,245,200,0.16)'; c.fillRect(x0 + rr() * (x1 - x0), y0 + rr() * (y1 - y0), 1.4, 3.2); }
      // the gravel inside the hedges and the walk up to the gate
      const gravel = (x, y, w, h) => {
        c.fillStyle = '#ece1ca'; c.fillRect(x, y, w, h);
        for (let i = 0, n = (w * h) / 26; i < n; i++) { c.fillStyle = ['rgba(150,125,90,0.3)', 'rgba(255,255,255,0.55)', 'rgba(120,100,80,0.2)'][(rr() * 3) | 0]; c.fillRect(x + rr() * w, y + rr() * h, 1.5, 1.5); }
      };
      gravel(X0, Y0, N * C, N * C);
      gravel(gx - C / 2 + 2, Y1, C - 4, y1 - Y1);
    }
    // the terrace of the house along the top
    function terrace(c) {
      const { x0, x1, y0 } = S.bleed;
      c.fillStyle = '#d9cfbc'; c.fillRect(x0, y0, x1 - x0, 74 - y0);
      c.strokeStyle = 'rgba(120,105,85,0.3)'; c.lineWidth = 1;
      for (let y = 18 - Math.ceil((18 - y0) / 56) * 56; y < 74; y += 28) {
        c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y);
        for (let x = Math.floor(x0 / 60) * 60 + ((y - 18) % 56 ? 30 : 0); x < x1; x += 60) { c.moveTo(x, y); c.lineTo(x, y + 28); }
        c.stroke();
      }
      // a stone balustrade, with an urn at each post
      c.fillStyle = 'rgba(60,50,40,0.2)'; c.fillRect(x0, 92, x1 - x0, 5);
      c.fillStyle = '#c4b8a2';
      for (let x = Math.floor(x0 / 14) * 14; x < x1; x += 14) { c.beginPath(); c.ellipse(x + 7, 82, 3.6, 8, 0, 0, 7); c.fill(); }
      c.fillStyle = '#efe7d6'; c.fillRect(x0, 66, x1 - x0, 7); c.fillRect(x0, 89, x1 - x0, 5);
      c.fillStyle = 'rgba(120,105,85,0.35)'; c.fillRect(x0, 72, x1 - x0, 1.4);
      for (const x of [34, 326]) {
        c.fillStyle = '#efe7d6'; c.fillRect(x - 9, 62, 18, 32);
        c.fillStyle = '#b9ad98'; c.fillRect(x - 9, 90, 18, 4);
        c.fillStyle = '#b08b64'; c.beginPath(); c.moveTo(x - 9, 46); c.quadraticCurveTo(x - 8, 60, x - 4, 62); c.lineTo(x + 4, 62); c.quadraticCurveTo(x + 8, 60, x + 9, 46); c.closePath(); c.fill();
        c.fillStyle = '#6f9a5e'; c.beginPath(); c.arc(x, 41, 10, 0, 7); c.fill();
        c.fillStyle = '#a486c9'; for (const [a, b] of [[-5, -3], [2, -6], [6, 0], [-1, 2]]) { c.beginPath(); c.arc(x + a, 41 + b, 2.3, 0, 7); c.fill(); }
      }
      PZ.text(c, 'From the gate to the fountain', W / 2, 34, { size: 13.5, color: PZ.INK2, maxW: 230 });
    }
    function hedgeLines() {
      const out = [];
      for (let i = 0; i < N * N; i++) {
        const x = X0 + (i % N) * C, y = Y0 + ((i / N) | 0) * C;
        if (near(i, 1) >= 0 && !doors[i].includes(i + 1)) out.push([x + C, y, x + C, y + C]);
        if (near(i, 2) >= 0 && !doors[i].includes(i + N)) out.push([x, y + C, x + C, y + C]);
      }
      const a = gx - C / 2, b = gx + C / 2;
      out.push([X0, Y0, X1, Y0], [X0, Y0, X0, Y1], [X1, Y0, X1, Y1]);
      if (a > X0) out.push([X0, Y1, a, Y1]);
      if (b < X1) out.push([b, Y1, X1, Y1]);
      return out;
    }
    function hedges(c) {
      const lines = hedgeLines(), rr = U.rng(deco + 1);
      const all = (dx, dy, col, w) => {
        c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
        c.beginPath();
        for (const [ax, ay, bx, by] of lines) { c.moveTo(ax + dx, ay + dy); c.lineTo(bx + dx, by + dy); }
        c.stroke();
      };
      all(3, 4.5, 'rgba(50,56,32,0.3)', T + 1);
      all(0, 0, '#2c5334', T + 1);
      all(-0.5, -1, '#47784b', T - 2.5);
      // thousands of little leaves, lighter where the sun catches the top left
      const DARK = ['#2f5a38', '#3a6b43', '#467a4c'], LITE = ['#5f9559', '#79ad69', '#97c480'];
      for (const [ax, ay, bx, by] of lines) {
        const len = Math.hypot(bx - ax, by - ay), flat = ay === by;
        for (let k = 0, n = len * 1.2; k < n; k++) {
          const f = rr(), w = (rr() - 0.5) * (T - 1.5), x = ax + (bx - ax) * f + (flat ? 0 : w), y = ay + (by - ay) * f + (flat ? w : 0);
          const set = rr() * T - T / 2 > w ? LITE : DARK;
          c.fillStyle = set[(rr() * 3) | 0];
          c.beginPath(); c.ellipse(x, y, 2 + rr() * 0.9, 1.1 + rr() * 0.5, rr() * 3.2, 0, 7); c.fill();
        }
      }
    }
    // two stone posts with a ball on top, one each side of the gap
    function gatePosts(c) {
      for (const x of [gx - C / 2 + 1, gx + C / 2 - 1]) {
        c.fillStyle = 'rgba(50,56,32,0.3)'; c.fillRect(x - 6, Y1 - 4, 15, 15);
        c.fillStyle = '#d6cdbb'; PZ.rr(c, x - 8, Y1 - 8, 16, 16, 2); c.fill();
        c.strokeStyle = 'rgba(90,75,60,0.5)'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#efe7d6'; c.beginPath(); c.arc(x - 0.6, Y1 - 0.8, 5.2, 0, 7); c.fill(); c.stroke();
      }
    }
    // a clipped box ball, with its leaves
    function boxBall(c, x, y, rad, rr) {
      c.fillStyle = 'rgba(50,56,32,0.28)'; c.beginPath(); c.ellipse(x + 3, y + rad * 0.8, rad, rad * 0.45, 0, 0, 7); c.fill();
      c.fillStyle = '#2c5334'; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
      for (let k = 0, n = rad * rad * 1.6; k < n; k++) {
        const a = rr() * 6.283, d = Math.sqrt(rr()) * rad * 0.96, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
        c.fillStyle = (px - x) + (py - y) < -rad * 0.2 ? '#7fb26e' : (px - x) + (py - y) < rad * 0.5 ? '#528a50' : '#376641';
        c.beginPath(); c.ellipse(px, py, 2.1, 1.2, rr() * 3.2, 0, 7); c.fill();
      }
    }
    // the lawn below: box balls beside the walk and a bench to sit on afterwards
    function lawnThings(c) {
      const rr = U.rng(deco + 2);
      const side = gate % N < N / 2 ? 1 : -1, bx = 180 + side * 96, by = 524;
      boxBall(c, gx - C / 2 - 16, Y1 + 40, 15, rr);
      boxBall(c, gx + C / 2 + 16, Y1 + 40, 15, rr);
      c.fillStyle = 'rgba(50,56,32,0.28)'; PZ.rr(c, bx - 40, by + 18, 88, 12, 6); c.fill();
      c.fillStyle = '#9a6f47'; for (const a of [-34, 26]) c.fillRect(bx + a, by + 8, 8, 16);
      c.fillStyle = '#b98f5a'; PZ.rr(c, bx - 42, by - 12, 84, 8, 2); c.fill(); PZ.rr(c, bx - 42, by - 2, 84, 8, 2); c.fill(); PZ.rr(c, bx - 42, by + 8, 84, 8, 2); c.fill();
      c.strokeStyle = 'rgba(90,60,35,0.55)'; c.lineWidth = 1;
      PZ.rr(c, bx - 42, by - 12, 84, 8, 2); c.stroke(); PZ.rr(c, bx - 42, by - 2, 84, 8, 2); c.stroke(); PZ.rr(c, bx - 42, by + 8, 84, 8, 2); c.stroke();
    }
    function fountain(c) {
      const x = cx(MID), y = cy(MID);
      c.fillStyle = 'rgba(60,50,30,0.25)'; c.beginPath(); c.arc(x + 1.6, y + 2.4, RIM, 0, 7); c.fill();
      c.fillStyle = '#d7cfbf'; c.beginPath(); c.arc(x, y, RIM, 0, 7); c.fill();
      c.strokeStyle = 'rgba(90,75,60,0.6)'; c.lineWidth = 1.1; c.stroke();
      c.lineWidth = 0.9; c.strokeStyle = 'rgba(90,75,60,0.35)';
      for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * 13.6, y + Math.sin(a) * 13.6); c.lineTo(x + Math.cos(a) * RIM, y + Math.sin(a) * RIM); c.stroke(); }
      c.fillStyle = '#86c4d6'; c.beginPath(); c.arc(x, y, 13.6, 0, 7); c.fill();
      c.strokeStyle = 'rgba(40,80,100,0.45)'; c.lineWidth = 1; c.stroke();
    }

    // ---------------------------------------------------------- what moves
    function polyline(c, pts) {
      c.beginPath();
      pts.forEach(([x, y], i) => { if (i) c.lineTo(x, y); else c.moveTo(x, y); });
    }
    function ribbon(c, pts, a, t, still) {
      c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.lineJoin = 'round';
      polyline(c, pts);
      c.strokeStyle = 'rgba(255,196,84,0.34)'; c.lineWidth = 22; c.stroke();
      c.strokeStyle = '#b97a1c'; c.lineWidth = 11.5; c.stroke();
      c.strokeStyle = '#ffd873'; c.lineWidth = 8.8; c.stroke();
      // a row of little lights along the middle, so it is more than a colour
      c.strokeStyle = '#fffef2'; c.lineWidth = 3.6; c.setLineDash([0.1, 11]);
      if (solved() && !still) c.lineDashOffset = -t * 8;
      c.stroke();
      c.restore();
    }
    // the end of the line, breathing slowly, where the finger picks it up again
    function bead(c, x, y, t, still) {
      const b = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2);
      c.strokeStyle = `rgba(255,250,225,${(0.5 + 0.4 * b + 0.3 * Math.min(1, nudge)).toFixed(3)})`; c.lineWidth = 2.2;
      c.beginPath(); c.arc(x, y, 13 + 2.6 * b + 5 * Math.min(1, nudge), 0, 7); c.stroke();
      c.fillStyle = '#ffd873'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill();
      c.strokeStyle = '#b97a1c'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#fffef2'; c.beginPath(); c.arc(x, y, 3.4, 0, 7); c.fill();
    }
    function water(c, t, still) {
      const x = cx(MID), y = cy(MID), whole = solved(), k = whole ? (still ? 1 : U.smooth(0, 1, shine)) : 0;
      // once it is reached the fountain catches the light
      if (k > 0) {
        c.strokeStyle = `rgba(255,232,150,${(0.4 * k).toFixed(3)})`; c.lineWidth = 6; c.beginPath(); c.arc(x, y, RIM + 3, 0, 7); c.stroke();
        c.strokeStyle = `rgba(255,214,110,${(0.9 * k).toFixed(3)})`; c.lineWidth = 2.2; c.beginPath(); c.arc(x, y, RIM + 1, 0, 7); c.stroke();
      }
      c.save(); c.beginPath(); c.arc(x, y, 13.4, 0, 7); c.clip();
      c.lineWidth = 1.2;
      for (let q = 0; q < 3; q++) {
        const f = still ? 0.2 + q * 0.3 : (t * 0.3 + q / 3) % 1;
        c.strokeStyle = `rgba(255,255,255,${(0.75 * (1 - f)).toFixed(3)})`;
        c.beginPath(); c.arc(x, y, 3 + f * 11, 0, 7); c.stroke();
      }
      c.restore();
      // the spout in the middle and the drops falling round it
      for (let q = 0; q < 6; q++) {
        const a = (q / 6) * 6.283 + (still ? 0 : t * 0.4), d = 6.4 + 2.6 * k;
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.3, 0, 7); c.fill();
      }
      c.fillStyle = '#efe7d6'; c.beginPath(); c.arc(x, y, 4.6, 0, 7); c.fill();
      c.strokeStyle = 'rgba(90,75,60,0.55)'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#cfe9f1'; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill();
    }
    function leavesArt(c) {
      for (const q of leaves) {
        c.save(); c.globalAlpha = 1 - q.t; c.translate(q.x, q.y); c.rotate(q.a);
        c.fillStyle = '#4f8a50'; c.beginPath(); c.ellipse(0, 0, 3.4, 1.7, 0, 0, 7); c.fill();
        c.restore();
      }
    }
    function sign(c, a) {
      const s = 'The middle at last';
      c.save(); c.globalAlpha = a; c.font = PZ.font(16, 800);
      const w = c.measureText(s).width + 34;
      c.fillStyle = 'rgba(60,50,30,0.22)'; PZ.rr(c, W / 2 - w / 2 + 2, 555, w, 34, 17); c.fill();
      c.fillStyle = PZ.PAPER; PZ.rr(c, W / 2 - w / 2, 552, w, 34, 17); c.fill();
      c.strokeStyle = 'rgba(107,97,87,0.4)'; c.lineWidth = 1.2; c.stroke();
      PZ.text(c, s, W / 2, 569.5, { size: 16 });
      c.restore();
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: { x: 0, y: 106, w: 360, h: 360 },
      decor(c) { ground(c); terrace(c); fountain(c); hedges(c); gatePosts(c); lawnThings(c); },
      draw(c, t, still) {
        water(c, t, still);
        if (!still) for (const q of ghosts) ribbon(c, [[cx(q.a), cy(q.a)], [cx(q.b), cy(q.b)]], Math.max(0, q.k), t, still);
        const pts = trail(still);
        ribbon(c, pts, 1, t, still);
        if (!still) leavesArt(c);
        const whole = solved();
        if (!whole && (still || !held || !held.on)) { const [x, y] = pts[pts.length - 1]; bead(c, x, y, t, still); }
        if (!still && !whole && hintT > 0) {
          const cells = hintWay(), end = cells[cells.length - 1];
          c.save(); c.strokeStyle = '#ffffff'; c.lineWidth = 4.4; c.lineCap = 'round'; c.setLineDash([0.1, 9]);
          polyline(c, cells.map((i) => [cx(i), cy(i)])); c.stroke();
          c.restore();
          PZ.glow(c, cx(end), cy(end), 19, t);
        }
        if (whole) sign(c, still ? 1 : U.smooth(0.3, 1.1, shine));
      },
      step(dt) {
        hintT -= dt; bumpT -= dt; nudge = Math.max(0, nudge - dt * 1.6);
        rest = rest.map((v) => (Math.abs(v) < 0.3 ? 0 : PZ.approach(v, 0, dt, 12)));
        for (let k = ghosts.length - 1; k >= 0; k--) { ghosts[k].k -= dt / 0.45; if (ghosts[k].k <= 0) ghosts.splice(k, 1); }
        for (let k = leaves.length - 1; k >= 0; k--) {
          const q = leaves[k];
          q.t += dt / 0.7; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 70 * dt; q.a += dt * 3;
          if (q.t >= 1) leaves.splice(k, 1);
        }
        if (solved()) shine += dt;
      },
      down(x, y) {
        if (held || solved()) return;
        const h = head(), on = PZ.dist(x, y, cx(h), cy(h)) <= GRAB;
        held = { x, y, on };
        if (on) stroke(cx(h), cy(h), x, y); else nudge = 1;
      },
      move(x, y) {
        if (!held) return;
        const ax = held.x, ay = held.y;
        held.x = x; held.y = y;
        stroke(ax, ay, x, y);
      },
      up(x, y) {
        if (!held) return;
        stroke(held.x, held.y, x, y);
        held.x = x; held.y = y;
        rest = solved() ? [0, 0] : tip();
        held = null;
      },
      cancel() { if (held) { rest = solved() ? [0, 0] : tip(); held = null; } },
      // the end of the job is the fountain, a little past the last turn
      progress: () => (solved() ? 1 : paid / (steps + 1)),
      solved,
      hint() { if (!solved()) hintT = 3.5; },
      save: () => ({ p: path.slice(), m: paid }),
      load(st) {
        if (!st || !Array.isArray(st.p) || st.p[0] !== gate || new Set(st.p).size !== st.p.length) return;
        if (!st.p.every((q, i) => !i || doors[st.p[i - 1]].includes(q))) return;
        path = st.p.slice();
        paid = U.clamp(Math.max(Math.round(+st.m) || 0, ...path.map((q) => turnNo[q])), 0, steps);
      },
      solveAll() { path = way.slice(); paid = steps; held = null; ghosts.length = 0; },
      // finger positions: one straight stroke for each stretch still to walk,
      // first back to the right way if the line has left it
      debugPlan() {
        const walk = path.slice().reverse();
        walk.length = walk.findIndex((q) => way.includes(q)) + 1;
        walk.push(...way.slice(way.indexOf(walk[walk.length - 1]) + 1));
        const plan = [];
        for (let a = 0, k = 1; k < walk.length; k++) {
          if (k < walk.length - 1 && walk[k] - walk[k - 1] === walk[k + 1] - walk[k]) continue;
          plan.push({ drag: [cx(walk[a]), cy(walk[a]), cx(walk[k]), cy(walk[k])] });
          a = k;
        }
        return plan;
      },
      // for the tests: where everything is
      debugLayout: () => ({ gate, way, doors, turnNo, steps, path: path.slice(), cell: C }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { maze });
})();
