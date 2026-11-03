'use strict';
// Back on the shelves: a thinking job in the bookshop. The books of a few
// series have been put back anyhow. Only the book at the end of a shelf can
// be taken off, and it can go to the end of any shelf with room. Every
// series should end up together on a shelf of its own. There is always a
// way: any move can be undone by moving the book straight back, so the
// thinking is all in the little room there is. Each series has its own
// colour, its own mark on the spine and its own height and thickness.
//   node test/run.mjs puzzle js/pz-books.js books --seeds 20

(() => {
  const SERIES = [
    { id: 'star', name: 'Stars', col: '#3d5a86', deep: '#283f63', ink: '#f2d88a', h: 0.95, w: 32 },
    { id: 'moon', name: 'Moons', col: '#7a63b3', deep: '#56448a', ink: '#f6efe3', h: 0.81, w: 36 },
    { id: 'leaf', name: 'Leaves', col: '#4e7b5b', deep: '#355841', ink: '#c3e5c8', h: 0.9, w: 28 },
    { id: 'heart', name: 'Hearts', col: '#c9474f', deep: '#972f37', ink: '#ffe3df', h: 0.76, w: 34 },
    { id: 'wave', name: 'Waves', col: '#2e8587', deep: '#1d6163', ink: '#e2f5f2', h: 0.86, w: 38 },
    { id: 'sun', name: 'Suns', col: '#d4873a', deep: '#a5631f', ink: '#fff0b5', h: 1.0, w: 30 },
  ];
  // how hard, by size: series x books, and the range of the shortest solution
  const SIZES = [
    { n: 3, cap: 3, lo: 5, hi: 8 }, { n: 3, cap: 4, lo: 6, hi: 10 },
    { n: 4, cap: 3, lo: 6, hi: 11 }, { n: 4, cap: 4, lo: 8, hi: 14 },
  ];
  const PL = 12;                               // the front of a shelf board
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };

  // --------------------------------------------------------------- LOGIC
  // A layout is a list of shelves, each a list of series numbers from the
  // left. Shelves are alike, so a state is looked up by its sorted shelves.
  const code = (sh) => { let c = 0; for (let i = sh.length - 1; i >= 0; i--) c = c * 6 + sh[i] + 1; return c; };
  function key(st) {
    const cs = st.map(code).sort((a, b) => a - b);
    let k = 0;
    for (const c of cs) k = k * 1296 + c;
    return k;
  }
  // the longest run of each series standing at the left of a shelf
  function baseRuns(st, n) {
    const best = new Array(n).fill(0);
    for (const sh of st) {
      if (!sh.length) continue;
      let r = 1;
      while (r < sh.length && sh[r] === sh[0]) r++;
      if (r > best[sh[0]]) best[sh[0]] = r;
    }
    return best;
  }
  const complete = (sh, cap) => sh.length === cap && sh.every((s) => s === sh[0]);
  const isSolved = (st, cap) => st.every((sh) => !sh.length || complete(sh, cap));
  // every book not in a base run has to move at least once, and one move
  // changes that count by one at most: a lower bound that never overshoots
  const lower = (st, n, total) => total - baseRuns(st, n).reduce((a, b) => a + b, 0);

  // A* over the moves; w > 1 trades the shortest path for speed, and with
  // w = 1 it stops as soon as the way is sure to be longer than limit
  function search(start, n, cap, maxNodes, w, limit = Infinity) {
    const total = start.reduce((a, s) => a + s.length, 0);
    const nodes = [{ st: start, g: 0, up: -1, mv: null }], heap = [];
    const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] > b[1]);
    const push = (it) => {
      heap.push(it);
      for (let i = heap.length - 1; i > 0;) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < heap.length && less(heap[l], heap[m])) m = l;
          if (r < heap.length && less(heap[r], heap[m])) m = r;
          if (m === i) break;
          [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;
        }
      }
      return top;
    };
    const seen = new Map([[key(start), 0]]);
    push([w * lower(start, n, total), 0, 0]);
    let expanded = 0;
    while (heap.length) {
      const [f, g, idx] = pop(), nd = nodes[idx];
      if (nd.g < g) continue;
      if (f > limit) return null;
      if (isSolved(nd.st, cap)) {
        const path = [];
        for (let k = idx; nodes[k].up >= 0; k = nodes[k].up) path.push(nodes[k].mv);
        return path.reverse();
      }
      if (++expanded > maxNodes) return null;
      const st = nd.st;
      for (let a = 0; a < st.length; a++) {
        if (!st[a].length) continue;
        const book = st[a][st[a].length - 1];
        let empty = false;
        for (let b = 0; b < st.length; b++) {
          if (b === a || st[b].length >= cap) continue;
          // empty shelves are all alike; and moving a lone book to one changes nothing
          if (!st[b].length) { if (empty || st[a].length === 1) continue; empty = true; }
          if (nd.mv && nd.mv[0] === b && nd.mv[1] === a) continue;
          const ns = st.slice();
          ns[a] = st[a].slice(0, -1); ns[b] = st[b].concat(book);
          const k = key(ns), ng = g + 1, old = seen.get(k);
          if (old !== undefined && nodes[old].g <= ng) continue;
          nodes.push({ st: ns, g: ng, up: idx, mv: [a, b] });
          seen.set(k, nodes.length - 1);
          push([ng + w * lower(ns, n, total), ng, nodes.length - 1]);
        }
      }
    }
    return null;
  }
  // the shortest way from here, or a short one when that would take too long
  // (only far from home, after a lot of wandering; it stays quick on a phone)
  function solve(st, n, cap) {
    if (isSolved(st, cap)) return [];
    return search(st, n, cap, 2500, 1) || search(st, n, cap, 6000, 2) || search(st, n, cap, 30000, 5) || [];
  }
  // start sorted, then take random moves (each one could be undone)
  function scramble(r, n, cap, moves) {
    const st = [];
    for (let s = 0; s < n; s++) st.push(new Array(cap).fill(s));
    st.push([]);
    let last = null;
    for (let i = 0; i < moves; i++) {
      const opts = [];
      for (let a = 0; a < st.length; a++) {
        for (let b = 0; b < st.length; b++) {
          if (a !== b && st[a].length && st[b].length < cap && !(last && last[0] === b && last[1] === a)) opts.push([a, b]);
        }
      }
      const [a, b] = opts[(r() * opts.length) | 0];
      st[b].push(st[a].pop()); last = [a, b];
    }
    return PZ.shuffle(r, st);
  }
  // properly jumbled: no shelf nearly finished from the start (on a shelf of
  // three no two alike at the left, on a shelf of four no three)
  const jumbled = (st, cap) => st.every((sh) => sh.length < cap - 1 || sh.slice(0, cap - 1).some((s) => s !== sh[0]));
  function generate(r) {
    const u = r(), size = SIZES[u < 0.25 ? 0 : u < 0.45 ? 1 : u < 0.65 ? 2 : 3];
    const { n, cap, lo, hi } = size;
    let last = null;
    for (let tries = 0; tries < 80; tries++) {
      const st = scramble(r, n, cap, 10 + n * cap + ((r() * 12) | 0));
      if (!jumbled(st, cap) || lower(st, n, n * cap) > hi) continue;
      last = st;
      const path = search(st, n, cap, 6000, 1, hi);
      if (path && path.length >= lo) return { size, st, dist: path.length };
    }
    // hardly ever: take the last jumbled one, however long its way
    const st = last || [[1, 0], [2, 1, 0], [0, 2], [1, 2]];
    return { size: last ? size : SIZES[0], st, dist: solve(st, last ? n : 3, last ? cap : 3).length };
  }

  // -------------------------------------------------------------- DRAWING
  function markPath(c, id, x, y, s) {
    c.beginPath();
    if (id === 'star') {
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? s * 0.21 : s * 0.5;
        if (k) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      c.closePath();
    } else if (id === 'heart') {
      const t = y - s * 0.22;
      c.moveTo(x, y + s * 0.42);
      c.bezierCurveTo(x - s * 0.62, y + s * 0.02, x - s * 0.5, t - s * 0.34, x, t + s * 0.04);
      c.bezierCurveTo(x + s * 0.5, t - s * 0.34, x + s * 0.62, y + s * 0.02, x, y + s * 0.42);
      c.closePath();
    } else if (id === 'leaf') {
      c.moveTo(x, y - s * 0.52);
      c.bezierCurveTo(x + s * 0.44, y - s * 0.2, x + s * 0.34, y + s * 0.3, x, y + s * 0.5);
      c.bezierCurveTo(x - s * 0.34, y + s * 0.3, x - s * 0.44, y - s * 0.2, x, y - s * 0.52);
      c.closePath();
    } else {
      c.arc(x, y, s * 0.26, 0, 7);
    }
  }
  // the mark on a spine, in the series' light ink, a little shape on its own
  function mark(c, sr, x, y, s, bg) {
    c.fillStyle = sr.ink; c.strokeStyle = sr.ink;
    if (sr.id === 'moon') {
      // the full moon less a bite, kept inside its own circle
      c.save(); c.beginPath(); c.arc(x, y, s * 0.42, 0, 7); c.clip();
      c.beginPath(); c.arc(x, y, s * 0.42, 0, 7); c.moveTo(x + s * 0.56, y - s * 0.1); c.arc(x + s * 0.2, y - s * 0.1, s * 0.36, 0, 7);
      c.fill('evenodd'); c.restore();
    } else if (sr.id === 'wave') {
      c.lineWidth = s * 0.13; c.lineCap = 'round';
      for (const dy of [-s * 0.2, s * 0.18]) {
        c.beginPath(); c.moveTo(x - s * 0.46, y + dy);
        c.bezierCurveTo(x - s * 0.2, y + dy - s * 0.24, x - s * 0.06, y + dy + s * 0.22, x + s * 0.12, y + dy);
        c.quadraticCurveTo(x + s * 0.3, y + dy - s * 0.18, x + s * 0.46, y + dy - s * 0.02); c.stroke();
      }
    } else if (sr.id === 'sun') {
      markPath(c, 'sun', x, y, s); c.fill();
      c.lineWidth = s * 0.09; c.lineCap = 'round';
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        c.beginPath(); c.moveTo(x + Math.cos(a) * s * 0.36, y + Math.sin(a) * s * 0.36); c.lineTo(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5); c.stroke();
      }
    } else {
      markPath(c, sr.id, x, y, s); c.fill();
      if (sr.id === 'leaf') { c.strokeStyle = bg; c.lineWidth = s * 0.07; c.beginPath(); c.moveTo(x, y - s * 0.36); c.lineTo(x, y + s * 0.44); c.stroke(); }
    }
  }
  // a book standing up, spine to the front, foot at 0, 0
  function drawBook(c, sr, w, h) {
    const x = -w / 2, y = -h;
    c.fillStyle = sr.col; PZ.rr(c, x, y, w, h, 3.5); c.fill();
    c.fillStyle = sr.deep; c.fillRect(x + 1.5, y, w - 3, 5); c.fillRect(x + 1.5, -5, w - 3, 5);
    c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(x + 3, y + 5, w * 0.16, h - 10);
    c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(x + w * 0.82, y + 5, w * 0.16, h - 10);
    // gilt bands top and bottom, a little title plate on the taller books,
    // and the mark in the middle of what is left
    c.fillStyle = 'rgba(232,197,106,0.9)';
    c.fillRect(x + 3, y + 8, w - 6, 1.6); c.fillRect(x + 3, y + 11, w - 6, 1); c.fillRect(x + 3, -10, w - 6, 1.6); c.fillRect(x + 3, -13, w - 6, 1);
    let top = y + 14;
    if (h >= 62) {
      const ty = y + 16;
      c.fillStyle = sr.ink; c.globalAlpha = 0.9; PZ.rr(c, x + w * 0.2, ty, w * 0.6, 8, 2); c.fill(); c.globalAlpha = 1;
      c.fillStyle = sr.deep; c.fillRect(x + w * 0.27, ty + 2.6, w * 0.46, 1); c.fillRect(x + w * 0.33, ty + 4.8, w * 0.34, 1);
      top = ty + 10;
    }
    const room = -15 - top;
    mark(c, sr, 0, top + room / 2, Math.min(w * 0.62, 22, room * 0.95), sr.col);
  }
  // every book is drawn once, large, then stamped wherever it stands
  const K = 3, sprites = new Map();
  function sprite(sr, w, h) {
    const k = `${sr.id}|${w}|${h}`;
    if (sprites.has(k)) return sprites.get(k);
    const cv = U.canvas((w + 4) * K, (h + 4) * K), x = cv.getContext('2d');
    x.scale(K, K); x.translate(w / 2 + 2, h + 2);
    drawBook(x, sr, w, h);
    sprites.set(k, cv);
    return cv;
  }

  // ---------------------------------------------------------------- SCENE
  function books(S) {
    const r = S.r, home = S.opts && S.opts.where === 'cottage';
    const gen = generate(r);
    const { n, cap } = gen.size, rows = n + 1, total = n * cap;
    const series = PZ.shuffle(r, SERIES.slice()).slice(0, n);
    // the case: rows shelves of cap places
    const P = rows === 5 ? 90 : 104, slotW = cap === 4 ? 48 : 54, side = 12;
    const X0 = 180 - (cap * slotW) / 2, X1 = 180 + (cap * slotW) / 2, FX0 = X0 - side, FX1 = X1 + side;
    const TOP = rows === 5 ? 78 : 88, IN0 = TOP + 14, BOT = IN0 + rows * P, PLINTH = BOT + 14;
    const HMAX = P - PL - 8;
    const bw = (s) => series[s].w, bh = (s) => Math.round(series[s].h * HMAX);
    const footY = (k) => IN0 + (k + 1) * P - PL;          // where the books on shelf k stand
    const slotX = (j) => X0 + (j + 0.5) * slotW;
    const rowAt = (x, y) => (x < FX0 - 24 || x > FX1 + 24 || y < IN0 || y >= BOT ? -1 : Math.floor((y - IN0) / P));

    // the books, each with an id, and the shelves as lists of ids
    const kind = [];
    let shelves = [];
    function setShelves(st) {
      kind.length = 0;
      shelves = st.map((sh) => sh.map((s) => { kind.push(s); return kind.length - 1; }));
    }
    setShelves(gen.st);
    const state = () => shelves.map((sh) => sh.map((id) => kind[id]));
    const pos = [];                                         // where each book is drawn (its foot)
    const snap = () => shelves.forEach((sh, k) => sh.forEach((id, j) => { pos[id] = { x: slotX(j), y: footY(k) }; }));
    snap();
    const paid = new Set(), labelK = new Array(rows).fill(0);
    let held = null, hint = null, hintT = 0, fx = null, sparkleT = -1, sparks = 0;

    const doneRow = (k) => complete(shelves[k].map((id) => kind[id]), cap);
    const solvedNow = () => isSolved(state(), cap);
    // how many books still have to move at least once, against the start:
    // nought at first, one exactly when every series is together
    const h0 = Math.max(1, lower(gen.st, n, total));
    const progressNow = () => U.clamp((h0 - lower(state(), n, total)) / h0, 0, 1);

    // a book glides towards its place, or towards the finger
    function target(id) {
      if (held && held.id === id) return { x: held.tx, y: held.ty };
      for (let k = 0; k < rows; k++) { const j = shelves[k].indexOf(id); if (j >= 0) return { x: slotX(j), y: footY(k) }; }
      return pos[id];
    }
    function stampBook(c, id, x, y, tilt = 0) {
      const s = kind[id], w = bw(s), h = bh(s);
      c.save(); c.translate(x, y); if (tilt) c.rotate(tilt);
      c.drawImage(sprite(series[s], w, h), -w / 2 - 2, -h - 2, w + 4, h + 4);
      c.restore();
    }
    // the little card in the brass holder under a finished shelf
    function label(c, k, a) {
      const s = kind[shelves[k][0]], sr = series[s], y = footY(k) + 1.5, w = 84;
      c.save(); c.globalAlpha = a;
      c.translate(0, (1 - a) * 5);
      c.fillStyle = '#fffaf1'; PZ.rr(c, 180 - w / 2 + 3, y + 1.5, w - 6, 8, 1.5); c.fill();
      mark(c, Object.assign({}, sr, { ink: sr.col }), 180 - w / 2 + 13, y + 5.5, 8, '#fffaf1');
      // the name in the colour of its books
      c.fillStyle = sr.deep; c.font = PZ.font(7.5, 800); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(sr.name.toUpperCase(), 184, y + 5.8);
      c.restore();
    }

    const sc = {
      puzzle: true, indoor: true, steps: n,
      crop: { x: 0, y: Math.round((TOP + PLINTH) / 2 - 180), w: 360, h: 360 },
      decor(c) {
        const B = S.bleed, bwid = B.x1 - B.x0, dr = U.rng(4127);
        // the wall: papered in the shop, sprigged in the cottage
        c.fillStyle = home ? '#f1e6d3' : '#e6dcc5'; c.fillRect(B.x0, B.y0, bwid, PLINTH - B.y0);
        if (home) {
          for (let y = B.y0 + 14; y < PLINTH; y += 34) {
            for (let x = Math.floor(B.x0 / 34) * 34 + ((y / 34) % 2 ? 17 : 0); x < B.x1; x += 34) {
              c.strokeStyle = 'rgba(111,154,106,0.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y + 5); c.quadraticCurveTo(x + 2, y, x + 1, y - 5); c.stroke();
              dot(c, x - 2, y - 2, 2.2, 'rgba(229,140,155,0.55)'); dot(c, x + 3, y - 5, 1.8, 'rgba(242,216,138,0.7)');
            }
          }
        } else {
          for (let x = Math.floor(B.x0 / 24) * 24; x < B.x1; x += 24) { c.fillStyle = 'rgba(160,140,100,0.12)'; c.fillRect(x, B.y0, 9, PLINTH - B.y0); }
          c.fillStyle = 'rgba(120,90,55,0.25)'; c.fillRect(B.x0, 70, bwid, 2);
        }
        // the floor: old boards and a rug
        c.fillStyle = home ? '#c9a77c' : '#b98c5c'; c.fillRect(B.x0, PLINTH, bwid, B.y1 - PLINTH);
        for (let y = PLINTH + 12; y < B.y1; y += 16) { c.fillStyle = 'rgba(90,60,30,0.22)'; c.fillRect(B.x0, y, bwid, 1.4); }
        for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(90,60,30,0.18)'; c.fillRect(B.x0 + dr() * bwid, PLINTH + dr() * (B.y1 - PLINTH), 1.2, 9); }
        c.fillStyle = 'rgba(40,25,10,0.2)'; c.fillRect(B.x0, PLINTH, bwid, 4);
        const rugY = PLINTH + 12;
        if (B.y1 > rugY + 10) {
          c.fillStyle = home ? '#a6c8b1' : '#b4574a'; PZ.rr(c, 70, rugY, 220, B.y1 - rugY + 30, 10); c.fill();
          c.strokeStyle = home ? '#f6efe3' : '#e9c47c'; c.lineWidth = 2; c.setLineDash([5, 4]); PZ.rr(c, 78, rugY + 7, 204, B.y1 - rugY + 30, 7); c.stroke(); c.setLineDash([]);
        }
        // a little painting and a clock on the wall either side
        if (FX0 > 56) {
          const fx0 = FX0 / 2, fy = TOP + 70;
          c.fillStyle = 'rgba(60,40,20,0.18)'; PZ.rr(c, fx0 - 22, fy - 26, 48, 60, 3); c.fill();
          c.fillStyle = home ? '#f6efe3' : '#c49a64'; PZ.rr(c, fx0 - 25, fy - 30, 50, 62, 3); c.fill();
          c.fillStyle = '#cfe3e6'; c.fillRect(fx0 - 19, fy - 24, 38, 50);
          dot(c, fx0 + 8, fy - 12, 5, '#f6d465');
          c.fillStyle = '#9cc5a1'; c.beginPath(); c.moveTo(fx0 - 19, fy + 10); c.quadraticCurveTo(fx0 - 4, fy - 6, fx0 + 19, fy + 6); c.lineTo(fx0 + 19, fy + 26); c.lineTo(fx0 - 19, fy + 26); c.closePath(); c.fill();
          c.fillStyle = '#6f9a6a'; c.beginPath(); c.moveTo(fx0 - 19, fy + 18); c.quadraticCurveTo(fx0 + 4, fy + 6, fx0 + 19, fy + 16); c.lineTo(fx0 + 19, fy + 26); c.lineTo(fx0 - 19, fy + 26); c.closePath(); c.fill();
          const cx = 360 - FX0 / 2, cy = TOP + 60;
          dot(c, cx + 2, cy + 3, 19, 'rgba(60,40,20,0.18)'); dot(c, cx, cy, 19, home ? '#9cc5a1' : '#8a5f37'); dot(c, cx, cy, 15, PZ.PAPER);
          for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; dot(c, cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, k % 3 ? 0.8 : 1.4, PZ.INK2); }
          c.strokeStyle = PZ.INK; c.lineCap = 'round'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 5, cy - 5); c.moveTo(cx, cy); c.lineTo(cx, cy - 10); c.stroke();
          dot(c, cx, cy, 1.8, PZ.INK);
        }
        // a plant and a lamp beside the case when there is room
        if (FX0 > 56) {
          const px = FX0 / 2 - 2, py = PLINTH + 4;
          c.fillStyle = 'rgba(40,25,10,0.2)'; c.beginPath(); c.ellipse(px, py + 2, 20, 4, 0, 0, 7); c.fill();
          for (let k = 0; k < 9; k++) {
            const a = -Math.PI / 2 + (k - 4) * 0.32, l = 44 + (k % 3) * 12;
            c.strokeStyle = k % 2 ? '#5d8a58' : '#6f9a6a'; c.lineWidth = 6; c.lineCap = 'round';
            c.beginPath(); c.moveTo(px, py - 22); c.quadraticCurveTo(px + Math.cos(a) * l * 0.5, py - 22 + Math.sin(a) * l * 0.7, px + Math.cos(a) * l * 0.8, py - 22 + Math.sin(a) * l); c.stroke();
          }
          c.fillStyle = '#d98b63'; c.beginPath(); c.moveTo(px - 17, py - 26); c.lineTo(px + 17, py - 26); c.lineTo(px + 13, py); c.lineTo(px - 13, py); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(px - 12, py - 22, 4, 18);
          const lx = 360 - px;
          c.fillStyle = 'rgba(40,25,10,0.2)'; c.beginPath(); c.ellipse(lx, py + 2, 16, 3.5, 0, 0, 7); c.fill();
          c.fillStyle = '#6b5a48'; c.fillRect(lx - 1.5, py - 150, 3, 150); PZ.rr(c, lx - 12, py - 5, 24, 6, 3); c.fill();
          c.fillStyle = home ? '#f2d88a' : '#e9d3a6'; c.beginPath(); c.moveTo(lx - 22, py - 150); c.lineTo(lx + 22, py - 150); c.lineTo(lx + 14, py - 182); c.lineTo(lx - 14, py - 182); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,240,190,0.25)'; c.beginPath(); c.ellipse(lx, py - 145, 30, 8, 0, 0, 7); c.fill();
        }
        // the bookcase: a frame, a back, a cornice and a plinth
        const wood = home ? '#9cc5a1' : '#a8784a', woodD = home ? '#7fa985' : '#8a5f37', back = home ? '#eef1e6' : '#6f4e33';
        c.fillStyle = 'rgba(40,25,10,0.22)'; PZ.rr(c, FX0 + 6, TOP + 8, FX1 - FX0, PLINTH - TOP, 6); c.fill();
        c.fillStyle = wood; PZ.rr(c, FX0, TOP, FX1 - FX0, PLINTH - TOP, 6); c.fill();
        c.fillStyle = back; c.fillRect(X0, IN0, X1 - X0, BOT - IN0);
        if (!home) for (let x = X0 + 30; x < X1; x += 31) { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x, IN0, 1.4, BOT - IN0); }
        else for (let x = X0 + 24; x < X1; x += 24) { c.fillStyle = 'rgba(111,154,106,0.12)'; c.fillRect(x, IN0, 1.2, BOT - IN0); }
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(X0, IN0, 7, BOT - IN0); c.fillRect(X1 - 5, IN0, 5, BOT - IN0);
        c.fillStyle = woodD; PZ.rr(c, FX0 - 7, TOP - 6, FX1 - FX0 + 14, 16, 4); c.fill();
        c.fillStyle = 'rgba(255,240,215,0.3)'; c.fillRect(FX0 - 4, TOP - 5, FX1 - FX0 + 8, 2);
        c.fillStyle = woodD; PZ.rr(c, FX0 - 3, BOT, FX1 - FX0 + 6, PLINTH - BOT, 3); c.fill();
        for (let k = 0; k < rows; k++) {
          const y = footY(k);
          c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(X0, y - 9, X1 - X0, 9);
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(X0, IN0 + k * P, X1 - X0, 5);
          c.fillStyle = woodD; c.fillRect(X0 - 2, y - 3, X1 - X0 + 4, 3);
          c.fillStyle = wood; c.fillRect(FX0, y, FX1 - FX0, PL);
          c.fillStyle = 'rgba(255,240,215,0.28)'; c.fillRect(FX0, y, FX1 - FX0, 1.5);
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(FX0, y + PL - 2, FX1 - FX0, 2);
          // an empty brass label holder on every shelf
          c.fillStyle = '#c8a24f'; PZ.rr(c, 138, y + 1.5, 84, 9, 2); c.fill();
          c.fillStyle = home ? '#e9e2cf' : '#e4d8bd'; PZ.rr(c, 141, y + 3, 78, 6, 1.5); c.fill();
          dot(c, 140.5, y + 6, 1.2, '#8f7232'); dot(c, 219.5, y + 6, 1.2, '#8f7232');
        }
        if (!home) for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(70,40,15,0.22)'; c.fillRect(FX0 + 2 + dr() * 7, TOP + 14 + dr() * (BOT - TOP - 30), 1, 10 + dr() * 16); c.fillRect(FX1 - 9 + dr() * 7, TOP + 14 + dr() * (BOT - TOP - 30), 1, 10 + dr() * 16); }
        // the rule, on a card pinned up above the case
        c.fillStyle = 'rgba(80,60,40,0.12)'; PZ.rr(c, 54, 15, 252, 50, 13); c.fill();
        c.fillStyle = PZ.PAPER; PZ.rr(c, 54, 11, 252, 50, 13); c.fill();
        c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.2; c.stroke();
        dot(c, 74, 19, 3.6, '#d98b63'); dot(c, 286, 19, 3.6, '#8fbfe6');
        PZ.text(c, 'One kind of book on every shelf', 180, 28.5, { size: 15.5, maxW: 228 });
        PZ.text(c, 'Only the book at the end can move', 180, 47.5, { size: 12.5, color: PZ.INK2, weight: 700, maxW: 228 });
      },
      draw(c, t, still) {
        // room on a shelf: a soft outline where a book could go
        const over = held && !still ? rowAt(held.tx, held.ty - bh(kind[held.id]) / 2) : -1;
        for (let k = 0; k < rows; k++) {
          const len = shelves[k].length - (held && !still && held.from === k ? 1 : 0);
          const ok = over === k && k !== held.from && shelves[k].length < cap;
          if (ok) { c.fillStyle = 'rgba(255,244,205,0.13)'; c.fillRect(X0, IN0 + k * P + 5, X1 - X0, P - PL - 5); }
          for (let j = len; j < cap; j++) {
            const x = slotX(j), y = footY(k), h = HMAX * 0.82;
            c.strokeStyle = ok && j === shelves[k].length ? 'rgba(255,250,235,0.9)' : home ? 'rgba(111,154,106,0.35)' : 'rgba(255,240,215,0.22)';
            c.lineWidth = ok && j === shelves[k].length ? 2 : 1.4; c.setLineDash([5, 5]);
            PZ.rr(c, x - slotW / 2 + 8, y - h, slotW - 16, h - 3, 4); c.stroke(); c.setLineDash([]);
          }
        }
        // the books on the shelves, the one in the hand last
        for (let k = 0; k < rows; k++) {
          for (const id of shelves[k]) {
            if (held && !still && held.id === id) continue;
            const p = still ? { x: slotX(shelves[k].indexOf(id)), y: footY(k) } : pos[id];
            c.fillStyle = 'rgba(30,18,8,0.22)'; c.beginPath(); c.ellipse(p.x + 2, p.y - 1, bw(kind[id]) * 0.55, 2.4, 0, 0, 7); c.fill();
            stampBook(c, id, p.x, p.y);
          }
        }
        for (let k = 0; k < rows; k++) {
          const a = still ? (doneRow(k) ? 1 : 0) : labelK[k];
          if (a > 0.02 && shelves[k].length) label(c, k, Math.min(1, a));
        }
        if (!still && hint && hintT > 0) {
          const [a, b] = hint, ida = shelves[a][shelves[a].length - 1];
          if (ida !== undefined && shelves[b].length < cap) {
            const p = pos[ida], h = bh(kind[ida]);
            PZ.glow(c, p.x, p.y - h / 2, Math.max(h, bw(kind[ida])) / 2 + 6, t);
            PZ.glow(c, slotX(shelves[b].length), footY(b) - HMAX * 0.4, HMAX * 0.45, t);
          }
        }
        if (held && !still) {
          const p = pos[held.id], s = kind[held.id];
          PZ.shadow(c, p.x + 5, p.y + 8, bw(s) * 0.55, 4, 0.14);
          stampBook(c, held.id, p.x, p.y, -0.06);
        }
      },
      step(dt) {
        hintT -= dt;
        for (let id = 0; id < kind.length; id++) {
          const to = target(id), p = pos[id];
          if (!p) { pos[id] = { x: to.x, y: to.y }; continue; }
          const sp = held && held.id === id ? 24 : 13;
          p.x = PZ.approach(p.x, to.x, dt, sp); p.y = PZ.approach(p.y, to.y, dt, sp);
        }
        for (let k = 0; k < rows; k++) labelK[k] = PZ.approach(labelK[k], doneRow(k) && !(held && held.from === k) ? 1 : 0, dt, 8);
        // a gentle sparkle along the shelves once everything is back
        if (sparkleT >= 0 && fx) {
          sparkleT += dt;
          const due = Math.min(12, Math.floor(sparkleT / 0.08));
          while (sparks < due) { const k = sparks % rows; fx.sparkle(X0 + 20 + ((sparks * 53) % (X1 - X0 - 40)), footY(k) - 30); sparks++; }
          if (sparkleT > 1.2) sparkleT = -1;
        }
      },
      down(x, y) {
        if (held || solvedNow()) return;
        const k = rowAt(x, y);
        if (k < 0 || !shelves[k].length) return;
        // whichever book is touched, the one at the end comes off
        const id = shelves[k][shelves[k].length - 1];
        held = { id, from: k, tx: x, ty: y - PZ.LIFT };
        hintT = 0;
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x; held.ty = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const h = held; held = null;
        // judged where the book is drawn: its middle, above the finger
        const to = rowAt(x, y - PZ.LIFT - bh(kind[h.id]) / 2);
        if (to === h.from) { fx.sound('drop'); return; }
        if (to < 0 || shelves[to].length >= cap) { fx.sound('nope'); return; }
        shelves[h.from].pop(); shelves[to].push(h.id);
        const s = kind[h.id];
        if (doneRow(to) && !paid.has(s)) {
          paid.add(s);
          fx.good(slotX((cap - 1) / 2), footY(to) - HMAX / 2);
          fx.sound(solvedNow() ? 'chime' : 'happy');
        } else fx.sound(solvedNow() ? 'chime' : 'drop');
        if (solvedNow()) { sparkleT = 0; sparks = 0; }
      },
      cancel() { held = null; },
      progress: () => progressNow(),
      solved: () => solvedNow(),
      // the next move of a shortest way from here: the book and where it goes
      hint() {
        if (solvedNow()) return;
        const path = solve(state(), n, cap);
        if (!path.length) return;
        hint = path[0]; hintT = 3.5;
      },
      // the shelves as series numbers, '.' between shelves; paid as a bit mask
      save: () => ({ sh: state().map((sh) => sh.join('')).join('.'), paid: [...paid].reduce((m, s) => m | (1 << s), 0) }),
      load(sv) {
        if (!sv || typeof sv.sh !== 'string') return;
        const parts = sv.sh.split('.');
        if (parts.length !== rows || parts.some((p) => p.length > cap || !/^[0-9]*$/.test(p))) return;
        const st = parts.map((p) => [...p].map(Number));
        const count = new Array(n).fill(0);
        for (const sh of st) for (const s of sh) { if (s >= n) return; count[s]++; }
        if (count.some((k) => k !== cap)) return;
        const mask = Number.isInteger(sv.paid) ? sv.paid : 0;
        setShelves(st); snap();
        paid.clear();
        for (let s = 0; s < n; s++) if (mask & (1 << s)) paid.add(s);
        // a finished shelf counts as paid; nothing is paid again
        for (let k = 0; k < rows; k++) if (doneRow(k)) paid.add(kind[shelves[k][0]]);
        held = null; hint = null;
        for (let k = 0; k < rows; k++) labelK[k] = doneRow(k) ? 1 : 0;
      },
      solveAll() {
        const st = state(), best = baseRuns(st, n), out = new Array(rows).fill(null);
        // each series on the shelf where most of it already stands, the rest anywhere free
        const order = [...Array(n).keys()].sort((a, b) => best[b] - best[a]);
        for (const s of order) {
          let k = st.findIndex((sh, i) => !out[i] && sh.length && sh[0] === s && baseRuns([sh], n)[s] === best[s]);
          if (k < 0) k = out.findIndex((o) => !o);
          out[k] = new Array(cap).fill(s);
        }
        setShelves(out.map((o) => o || [])); snap();
        for (let s = 0; s < n; s++) paid.add(s);
        held = null;
        for (let k = 0; k < rows; k++) labelK[k] = doneRow(k) ? 1 : 0;
      },
      // finger positions: press on the end book, let go PZ.LIFT under the
      // foot of the place it goes to (the book is drawn above the finger)
      debugPlan() {
        const st = state(), out = [];
        for (const [a, b] of solve(st, n, cap)) {
          const s = st[a][st[a].length - 1];
          out.push({ drag: [slotX(st[a].length - 1), footY(a) - bh(s) / 2, slotX(st[b].length), footY(b) + PZ.LIFT] });
          st[b].push(st[a].pop());
        }
        return out;
      },
      // test hooks for the generator sweep
      debugLayout: () => ({ n, cap, rows, shelves: state(), dist: gen.dist, series: series.map((x) => x.id) }),
      debugSolve: () => solve(state(), n, cap),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { books });
})();
