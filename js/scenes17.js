'use strict';
// Scenes for Sunnybank Lido: the pale blue pool, drained for a scrub, the row
// of changing huts, the iron way in with its turnstile, the ice-cream counter,
// the deck chairs along the edge and the tiled fountain. Each is a variant of
// an older kind, built through SCENES.VARIANTS, with the same layers as every
// other scene (see scenes.js):
//   stones { shape: 'pool' }                   the tiles of the empty pool (scrub)
//   hut { what: 'lido' }                       the huts, in the player's colour (paint)
//   fence { what: 'turnstile' }                the iron gate, in the player's colour (paint)
//   counter { what: 'kiosk' }                  tubs of ice cream on the counter (wipe)
//   serve { what: 'deckchairs' }               deck chairs on their chalk marks (arrange)
//   pond { what: 'fountain', where: 'lido' }   the tiled fountain (skim)

(() => {
  const { W, H, field, ramp, rrPath, blob, softShadow, paintStamp, peelingPaint, grime, weatheredWood } = SCENES;
  const TAU = Math.PI * 2;
  const AQUA = '#a8dde6', LANE = '#3f94b4', CREAM = '#f7eedc', CORAL = '#e8674f', CORAL_DK = '#c44f3b', NAVY = '#2b4a68', BRASS = '#d8ae4e', WOOD = '#c99a5e', SHADE = '#2c6a8c', WATER = '#7cc9dc';
  const DECO = 'Futura, "Avenir Next", "Gill Sans", ui-rounded, system-ui, sans-serif';
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };
  // a closed outline on a path or a context
  const outline = (p, pts) => { pts.forEach(([x, y], i) => { if (i) p.lineTo(x, y); else p.moveTo(x, y); }); p.closePath(); };

  // ------------------------------------------------------------ shared bits
  // pale terrazzo paving: cream cement full of chips, in bays split by brass strips
  function terrazzo(c, nz, x0, y0, x1, y1, seed) {
    const q = U.rng(seed), g = ramp(['#e4d7be', '#ebdfc9', '#f2e9d7']);
    field(c, x0, y0, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.02, y * 0.02, 3)));
    const n = ((x1 - x0) * (y1 - y0)) / 60;
    for (const col of ['rgba(170,150,120,0.5)', 'rgba(232,103,79,0.3)', 'rgba(90,150,170,0.32)', 'rgba(255,255,255,0.75)']) {
      c.fillStyle = col;
      for (let i = 0; i < n / 4; i++) c.fillRect(x0 + q() * (x1 - x0), y0 + q() * (y1 - y0), 0.9 + q() * 1.7, 0.8 + q() * 1.2);
    }
    c.fillStyle = 'rgba(170,135,70,0.45)';
    for (let x = Math.floor(x0 / 90) * 90 + 30; x < x1; x += 90) c.fillRect(x, y0, 1, y1 - y0);
    for (let y = Math.floor(y0 / 90) * 90 + 10; y < y1; y += 90) c.fillRect(x0, y, x1 - x0, 1);
  }
  // light on the upper left edges of a shape made of overlapping parts, dark on
  // the lower right, following only the outline of the whole
  function bevel(c, path, light, dark) {
    const k = c.getTransform().a, m = U.canvas(W * k, H * k), x = m.getContext('2d');
    const sliver = (dx, dy, col) => {
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, m.width, m.height);
      x.setTransform(k, 0, 0, k, 0, 0); x.fillStyle = col; x.fill(path, 'nonzero');
      x.globalCompositeOperation = 'destination-out'; x.translate(dx, dy); x.fillStyle = '#000'; x.fill(path, 'nonzero');
      c.drawImage(m, 0, 0, W, H);
    };
    sliver(1.7, 1.9, light); sliver(-1.7, -1.9, dark);
    m.width = m.height = 1; // iOS frees a canvas's memory late unless it is told
  }
  // a parasol seen from above
  function parasolTop(c, x, y, s, a0) {
    dot(c, x + 7, y + 9, s, 'rgba(60,50,40,0.2)');
    for (let k = 0; k < 8; k++) {
      c.fillStyle = k % 2 ? CREAM : CORAL;
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, s, a0 + (k / 8) * TAU, a0 + ((k + 1) / 8) * TAU); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(90,50,40,0.25)'; c.lineWidth = 1;
    for (let k = 0; k < 8; k++) { const a = a0 + (k / 8) * TAU; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); c.stroke(); }
    dot(c, x, y, 3.6, BRASS);
  }
  // a folded towel, striped, lying on the ground
  function towel(c, x, y, w, h, a, cols) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(60,50,40,0.2)'; c.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
    const n = cols.length * 3, sw = w / n;
    for (let k = 0; k < n; k++) { c.fillStyle = cols[k % cols.length]; c.fillRect(-w / 2 + k * sw, -h / 2, sw + 0.5, h); }
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(-w / 2, -h / 2, w, 2.4);
    c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(-w / 2, h / 2 - 2, w, 2);
    c.restore();
  }

  function puff(c, x, y, s, a = 0.85) {
    c.fillStyle = `rgba(255,255,255,${a})`;
    for (const [dx, dy, rr] of [[-1.3, 0.12, 0.7], [-0.45, -0.34, 1], [0.6, -0.2, 0.84], [1.4, 0.16, 0.6]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, rr * s, 0, TAU); c.fill(); }
  }
  // a palm: a leaning ringed trunk and a head of drooping fronds
  function palm(c, q, x, y, h, lean) {
    const tx = x + lean, ty = y - h, bend = (t) => [U.lerp(U.lerp(x, x + lean * 0.1, t), U.lerp(x + lean * 0.1, tx, t), t), U.lerp(U.lerp(y, y - h * 0.6, t), U.lerp(y - h * 0.6, ty, t), t)];
    c.lineCap = 'round';
    c.strokeStyle = '#a58a66'; c.lineWidth = 3 + h * 0.05; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + lean * 0.1, y - h * 0.6, tx, ty); c.stroke();
    c.strokeStyle = 'rgba(70,50,30,0.32)'; c.lineWidth = 1;
    for (let t = 0.06; t < 0.95; t += 0.07) { const [px, py] = bend(t), w = 1.5 + h * 0.025; c.beginPath(); c.moveTo(px - w, py); c.lineTo(px + w, py + 1); c.stroke(); }
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI * 1.08 + (k / 9) * Math.PI * 1.16 + (q() - 0.5) * 0.16, len = h * (0.44 + q() * 0.14);
      const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.42 + len * 0.5;
      const mx = tx + Math.cos(a) * len * 0.56, my = ty + Math.sin(a) * len * 0.74 - len * 0.1;
      const col = U.pick(q, ['#4f8f5a', '#5ea566', '#3f7f52', '#6cb06e']);
      c.fillStyle = col; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.quadraticCurveTo(mx, my + len * 0.2, tx, ty); c.fill();
      c.strokeStyle = col; c.lineWidth = 1.4;
      for (let j = 2; j < 11; j++) {
        const t = j / 11, u = 1 - t, px = u * u * tx + 2 * u * t * mx + t * t * ex, py = u * u * ty + 2 * u * t * my + t * t * ey;
        c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * 3, py + 6 + len * 0.06 * Math.sin(t * Math.PI) + (j % 2) * 3); c.stroke();
      }
    }
    dot(c, tx, ty + 2, 2.4 + h * 0.018, '#7d6444');
  }
  // a string of little flags
  function pennants(c, x0, y0, x1, y1, sag) {
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 17), cols = [CORAL, CREAM, WATER];
    const pt = (t) => [U.lerp(x0, x1, t), U.lerp(y0, y1, t) + sag * 4 * t * (1 - t)];
    c.strokeStyle = 'rgba(70,60,50,0.6)'; c.lineWidth = 1; c.beginPath();
    for (let k = 0; k <= 30; k++) { const [x, y] = pt(k / 30); if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke();
    for (let k = 0; k < n; k++) {
      const [ax, ay] = pt((k + 0.14) / n), [bx, by] = pt((k + 0.86) / n);
      c.fillStyle = cols[k % 3]; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo((ax + bx) / 2 + 1, (ay + by) / 2 + 12); c.closePath(); c.fill();
    }
  }
  // the pool's edge seen across the terrace: coping stones, then open water
  function poolEdge(c, q, x0, y, x1, y1) {
    c.fillStyle = lin(c, 0, y + 15, 0, y1, [[0, '#6cc3d7'], [1, '#a5e0e8']]); c.fillRect(x0, y + 15, x1 - x0, y1 - y - 15);
    for (let i = 0; i < ((x1 - x0) * (y1 - y - 15)) / 500; i++) {
      const py = y + 18 + q() * (y1 - y - 18), px = x0 + q() * (x1 - x0), l = 12 + q() * 24;
      c.strokeStyle = q() < 0.6 ? 'rgba(255,255,255,0.5)' : 'rgba(30,110,140,0.24)'; c.lineWidth = 1.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + l / 2, py - 2.4, px + l, py); c.stroke();
    }
    c.fillStyle = 'rgba(30,80,110,0.22)'; c.fillRect(x0, y + 15, x1 - x0, 5);
    c.fillStyle = '#f4ead6'; c.fillRect(x0, y, x1 - x0, 15);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(x0, y, x1 - x0, 1.6);
    c.fillStyle = '#cdbd9f'; c.fillRect(x0, y + 12.5, x1 - x0, 2.5);
    c.fillStyle = 'rgba(130,105,75,0.4)'; for (let x = Math.floor(x0 / 52) * 52 + 12; x < x1; x += 52) c.fillRect(x, y, 1.2, 13);
    c.fillStyle = CORAL; c.fillRect(x0, y + 5, x1 - x0, 2.2);
  }

  // ---------------------------------------------------- THE LIDO: THE POOL TILES
  // The pool drained and looked down into from above: four walls of tiles with
  // a cream and coral frieze under the rim, and the floor with its one dark
  // lane stripe, a drain and the depth set into the tiles. Algae and lime have
  // had the place to themselves; they scrub off and the blue comes back. Leaves
  // and snow settle in it through the seasons' overlay (scenes4.js).
  // stones { shape: 'pool' }
  function poolTiles(S) {
    const { r, nz, bleed } = S;
    const X0 = 24, Y0 = 58, X1 = 336, Y1 = 548;      // the rim
    const T = 25, COLS = 10, ROWS = 17;
    const FX0 = 55, FY0 = 90, FX1 = FX0 + COLS * T, FY1 = FY0 + ROWS * T;   // the floor
    const V = [0, 0.3, 0.55, 0.75, 0.9, 1];           // the courses down a wall, widest under the rim
    // each wall goes from its top edge (a to b) down to the floor (d to e)
    const WALLS = [
      { a: [X0, Y0], b: [X1, Y0], d: [FX0, FY0], e: [FX1, FY0], n: COLS, dark: 0.3 },
      { a: [X0, Y0], b: [X0, Y1], d: [FX0, FY0], e: [FX0, FY1], n: ROWS, dark: 0.2 },
      { a: [X1, Y0], b: [X1, Y1], d: [FX1, FY0], e: [FX1, FY1], n: ROWS, dark: 0 },
      { a: [X0, Y1], b: [X1, Y1], d: [FX0, FY1], e: [FX1, FY1], n: COLS, dark: 0.04 },
    ];
    const wallPt = (w, u, v) => [U.lerp(U.lerp(w.a[0], w.b[0], u), U.lerp(w.d[0], w.e[0], u), v), U.lerp(U.lerp(w.a[1], w.b[1], u), U.lerp(w.d[1], w.e[1], u), v)];
    const wallCell = (w, i, j) => [wallPt(w, i / w.n, V[j]), wallPt(w, (i + 1) / w.n, V[j]), wallPt(w, (i + 1) / w.n, V[j + 1]), wallPt(w, i / w.n, V[j + 1])];
    const region = new Path2D();
    rrPath(region, X0, Y0, X1 - X0, Y1 - Y0, 6);

    // every joint between tiles, on the walls and the floor
    const joints = new Path2D();
    for (const w of WALLS) {
      for (let i = 0; i <= w.n; i++) { const [ax, ay] = wallPt(w, i / w.n, 0), [bx, by] = wallPt(w, i / w.n, 1); joints.moveTo(ax, ay); joints.lineTo(bx, by); }
      for (const v of V) { const [ax, ay] = wallPt(w, 0, v), [bx, by] = wallPt(w, 1, v); joints.moveTo(ax, ay); joints.lineTo(bx, by); }
    }
    for (let i = 0; i <= COLS; i++) { joints.moveTo(FX0 + i * T, FY0); joints.lineTo(FX0 + i * T, FY1); }
    for (let j = 0; j <= ROWS; j++) { joints.moveTo(FX0, FY0 + j * T); joints.lineTo(FX1, FY0 + j * T); }

    function tiles(c) {
      const q = U.rng(1701);
      // the walls, cooler and darker on the two sides the sun does not reach
      for (const w of WALLS) for (let j = 0; j < 5; j++) for (let i = 0; i < w.n; i++) {
        const base = j === 0 ? (i % 3 === 1 ? CORAL : CREAM) : U.shade(AQUA, (q() - 0.5) * 0.14);
        c.fillStyle = U.mix(base, SHADE, w.dark);
        c.beginPath(); outline(c, wallCell(w, i, j)); c.fill();
      }
      // the floor, with the lane stripe and the bars across its two ends
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const x = FX0 + i * T, y = FY0 + j * T;
        const lane = ((i === 4 || i === 5) && j >= 3 && j <= 13) || ((j === 3 || j === 13) && i >= 3 && i <= 6);
        c.fillStyle = U.shade(lane ? LANE : AQUA, (q() - 0.5) * 0.13);
        c.fillRect(x, y, T, T);
        c.fillStyle = 'rgba(255,255,255,0.34)'; c.fillRect(x + 2, y + 2, T - 4, 1.8);
        c.fillStyle = 'rgba(25,70,95,0.1)'; c.fillRect(x + 2, y + T - 3.6, T - 4, 1.8);
      }
      c.strokeStyle = '#e9f3f1'; c.lineWidth = 1.5; c.stroke(joints);
    }
    // a depth set into the floor on two cream tiles
    function depth(c, x, y, txt) {
      c.fillStyle = CREAM; c.fillRect(x + 1, y + 1, T * 2 - 2, T - 2);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x + 2, y + 2, T * 2 - 4, 1.8);
      c.fillStyle = '#e9f3f1'; c.fillRect(x + T - 0.7, y, 1.5, T);
      c.fillStyle = NAVY; c.font = `700 15px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(txt, x + T, y + T / 2 + 0.5);
    }
    function drain(c, x, y) {
      dot(c, x + 1, y + 1.5, 16, 'rgba(25,70,95,0.3)');
      dot(c, x, y, 15.5, '#c6ced2'); dot(c, x, y, 13, '#5b6a72');
      c.save(); c.beginPath(); c.arc(x, y, 13, 0, TAU); c.clip();
      c.fillStyle = '#c6ced2'; for (let k = -2; k <= 2; k++) c.fillRect(x - 14, y + k * 5.4 - 1.2, 28, 2.4);
      c.restore();
      dot(c, x - 4, y - 5, 1.2, 'rgba(255,255,255,0.8)');
    }
    return {
      family: 'scrub', particle: 'moss', region, depth: true,
      tough(x, y) {
        const i = (x - FX0) / T, j = (y - FY0) / T;
        if (i < 0 || i > COLS || j < 0 || j > ROWS) return 1.25;
        const fx = i - Math.floor(i), fy = j - Math.floor(j);
        return fx < 0.08 || fx > 0.92 || fy < 0.08 || fy > 0.92 ? 1.5 : 1;
      },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        terrazzo(c, nz, x0, y0, x1, y1, 1701);
        // the coping: a ring of cream stones with a coral line let into it
        const P = 16, cop = new Path2D();
        rrPath(cop, X0 - P, Y0 - P, X1 - X0 + P * 2, Y1 - Y0 + P * 2, 15);
        softShadow(c, cop, 7, 0.32, 1, 3);
        c.fillStyle = lin(c, 0, Y0 - P, 0, Y1 + P, [[0, '#f6ecda'], [1, '#efe2ca']]); c.fill(cop);
        c.strokeStyle = 'rgba(130,105,75,0.4)'; c.lineWidth = 1.2;
        c.beginPath();
        for (let x = X0 + 30; x < X1; x += 50) { c.moveTo(x, Y0 - P); c.lineTo(x, Y0); c.moveTo(x, Y1); c.lineTo(x, Y1 + P); }
        for (let y = Y0 + 35; y < Y1; y += 56) { c.moveTo(X0 - P, y); c.lineTo(X0, y); c.moveTo(X1, y); c.lineTo(X1 + P, y); }
        c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.4; c.beginPath(); c.roundRect(X0 - P + 1.2, Y0 - P + 1.2, X1 - X0 + P * 2 - 2.4, Y1 - Y0 + P * 2 - 2.4, 14); c.stroke();
        c.strokeStyle = CORAL; c.lineWidth = 2.4; c.beginPath(); c.roundRect(X0 - 9, Y0 - 9, X1 - X0 + 18, Y1 - Y0 + 18, 9); c.stroke();
        // words painted on the rim, the parasol and towels on the terrace
        c.fillStyle = NAVY; c.font = `700 9.5px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = CREAM; c.fillRect(138, Y0 - 13, 84, 11); c.fillRect(126, Y1 + 2, 108, 11);
        c.fillStyle = NAVY; c.fillText('DEEP END', 180, Y0 - 7); c.fillText('SHALLOW END', 180, Y1 + 8);
        parasolTop(c, 38, 4, 42, 0.3);
        towel(c, 300, 22, 66, 26, -0.1, [CORAL, CREAM, WATER]);
        towel(c, 72, 584, 70, 26, 0.08, [WATER, CREAM]);
        // a bucket with a brush in it, left by whoever had a go last
        c.fillStyle = 'rgba(60,50,40,0.22)'; c.beginPath(); c.ellipse(292, 590, 24, 9, 0, 0, TAU); c.fill();
        dot(c, 288, 582, 17, '#9fa9ae'); dot(c, 288, 582, 14, '#cdd5d9'); dot(c, 288, 583, 11.5, '#6f8f9c');
        c.fillStyle = WOOD; c.save(); c.translate(288, 582); c.rotate(-0.7); c.fillRect(-3, -3, 46, 6); c.restore();
      },
      clean(c) {
        tiles(c);
        depth(c, FX0 + T, FY1 - T * 2, '1.2m');
        depth(c, FX1 - T * 3, FY0 + T, '2.4m');
        drain(c, FX0 + T * 2, FY0 + T * 1.5 + 2);
        // the far wall and the left wall throw their shade on the floor
        c.fillStyle = lin(c, 0, FY0, 0, FY0 + 54, [[0, 'rgba(20,62,92,0.36)'], [1, 'rgba(20,62,92,0)']]); c.fillRect(FX0, FY0, FX1 - FX0, 54);
        c.fillStyle = lin(c, FX0, 0, FX0 + 40, 0, [[0, 'rgba(20,62,92,0.3)'], [1, 'rgba(20,62,92,0)']]); c.fillRect(FX0, FY0, 40, FY1 - FY0);
        // the corner where the walls meet the floor
        c.strokeStyle = 'rgba(20,62,92,0.3)'; c.lineWidth = 1.6; c.strokeRect(FX0, FY0, FX1 - FX0, FY1 - FY0);
        c.strokeStyle = 'rgba(20,62,92,0.2)'; c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(X0, Y0); c.lineTo(FX0, FY0); c.moveTo(X1, Y0); c.lineTo(FX1, FY0); c.moveTo(X0, Y1); c.lineTo(FX0, FY1); c.moveTo(X1, Y1); c.lineTo(FX1, FY1); c.stroke();
        // sun lying warm on the shallow end
        const g = c.createRadialGradient(240, 430, 10, 240, 430, 200);
        g.addColorStop(0, 'rgba(255,250,225,0.26)'); g.addColorStop(1, 'rgba(255,250,225,0)');
        c.fillStyle = g; c.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0);
      },
      dirt(c) {
        // a skin of green, thickest along the walls, with drifts of pale lime over it
        const g = ramp(['#4c5f38', '#5f7040', '#76824c', '#8f9560']), weed = ramp(['#3c5a2a', '#4d7232', '#648a3c']), crust = ramp(['#c5c1a4', '#d9d4ba', '#e8e4d0']);
        const over = (a, b, t) => [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)];
        const near = (x, y) => U.clamp(1 - Math.min(x - FX0, FX1 - x, y - FY0, FY1 - y) / 60, 0, 1);
        const algae = (x, y) => nz.fbm(x * 0.03 + 31, y * 0.03 + 9, 4) + near(x, y) * 0.1, lime = (x, y) => nz.fbm(x * 0.02 + 11, y * 0.02 + 4, 4) - near(x, y) * 0.05;
        field(c, X0 - 3, Y0 - 3, X1 + 3, Y1 + 3, 2, (x, y) => {
          const fine = nz.n2(x * 0.09, y * 0.09), m = algae(x, y) + fine * 0.05, l = lime(x, y) + fine * 0.05;
          const col = over(g(nz.fbm(x * 0.017, y * 0.017, 4) * 0.84 + fine * 0.16), weed(U.clamp((m - 0.5) * 6, 0, 1)), U.smooth(0.48, 0.6, m));
          return [...over(col, crust(fine), U.smooth(0.56, 0.63, l) * 0.84), 247];
        });
        // the tiles still show through as a dark net of joints, furred with green
        c.strokeStyle = 'rgba(40,52,28,0.4)'; c.lineWidth = 1.5; c.stroke(joints);
        c.save(); c.strokeStyle = 'rgba(96,142,54,0.6)'; c.lineWidth = 2.6; c.lineCap = 'round'; c.setLineDash([16, 30, 7, 46]); c.stroke(joints); c.restore();
        // the old waterline round the walls, with lime running down from it
        for (const w of WALLS) {
          c.beginPath(); outline(c, [wallPt(w, 0, 0.16), wallPt(w, 1, 0.16), wallPt(w, 1, 0.34), wallPt(w, 0, 0.34)]);
          c.fillStyle = 'rgba(232,226,200,0.7)'; c.fill();
          c.lineCap = 'round';
          for (let i = 0; i < w.n * 2; i++) {
            const u = 0.02 + r() * 0.96, [ax, ay] = wallPt(w, u, 0.3), [bx, by] = wallPt(w, u + (r() - 0.5) * 0.01, 0.56 + r() * 0.44);
            c.strokeStyle = `rgba(236,232,208,${(0.26 + r() * 0.3).toFixed(2)})`; c.lineWidth = 1 + r() * 2.8;
            c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
          }
        }
        // crumbs of lime and tufts of weed, each where it grows, so nothing is smooth
        const bits = [[], [], [], []];
        for (let i = 0; i < 2600; i++) {
          const x = X0 + r() * (X1 - X0), y = Y0 + r() * (Y1 - Y0), a = r() < 0.5, k = lime(x, y) > 0.57 ? (a ? 0 : 1) : algae(x, y) > 0.52 ? (a ? 2 : 3) : (a ? 3 : 1);
          bits[k].push([x, y, 0.7 + r() * r() * 2.6]);
        }
        ['rgba(244,240,222,0.8)', 'rgba(120,118,86,0.45)', 'rgba(126,164,70,0.7)', 'rgba(52,76,36,0.55)'].forEach((col, k) => {
          c.fillStyle = col; c.beginPath();
          for (const [x, y, s] of bits[k]) { c.moveTo(x + s, y); c.ellipse(x, y, s, s * 0.74, 0, 0, TAU); }
          c.fill();
        });
        // puddles left in the low places, and a few of last year's leaves
        for (const [x, y, rx, ry] of [[118, 214, 36, 14], [236, 346, 44, 17], [146, 452, 28, 11]]) {
          const p = new Path2D(); blob(p, x, y, rx, ry, r, 0.2, 12);
          c.strokeStyle = 'rgba(214,214,176,0.55)'; c.lineWidth = 3; c.stroke(p);
          c.fillStyle = 'rgba(70,98,74,0.86)'; c.fill(p);
          c.strokeStyle = 'rgba(220,235,214,0.5)'; c.lineWidth = 1.3; c.lineCap = 'round'; c.beginPath(); c.ellipse(x - rx * 0.1, y - ry * 0.2, rx * 0.62, ry * 0.46, 0.1, 3.5, 5.2); c.stroke();
        }
        for (let i = 0; i < 9; i++) {
          c.save(); c.translate(FX0 + r() * (FX1 - FX0), FY0 + r() * (FY1 - FY0)); c.rotate(r() * TAU);
          c.fillStyle = U.pick(r, ['#8c5a2b', '#a9742f', '#6e4a26']); c.beginPath(); c.ellipse(0, 0, 5.5, 2.6, 0, 0, TAU); c.fill(); c.restore();
        }
      },
      top(c) {
        // the steel ladder hooked over the rim on the sunny side
        const rail = (y) => {
          c.strokeStyle = 'rgba(30,45,55,0.35)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(350, y + 3); c.lineTo(FX1 + 3, y + 3); c.stroke();
          c.strokeStyle = lin(c, 0, y - 3, 0, y + 3, [[0, '#f4f7f8'], [0.5, '#c4ced3'], [1, '#7f8b92']]); c.lineWidth = 5.4; c.beginPath(); c.moveTo(350, y); c.lineTo(FX1 + 3, y); c.stroke();
          dot(c, 350, y, 4.2, '#8f9ba2'); dot(c, 349.2, y - 0.8, 1.6, '#f4f7f8');
        };
        for (let k = 0; k < 4; k++) {
          const x = 312 + k * 6.4;
          c.fillStyle = 'rgba(30,45,55,0.25)'; c.fillRect(x + 1.5, 168, 4.6, 40);
          c.fillStyle = lin(c, x, 0, x + 4, 0, [[0, '#f4f7f8'], [1, '#9aa6ad']]); c.fillRect(x, 166, 4, 40);
        }
        rail(165); rail(208);
      },
    };
  }

  // ---------------------------------------------- THE LIDO: THE CHANGING HUTS
  // Three changing huts in a row on the terrace, front on, with stepped tops,
  // speed lines and round windows in the way of the thirties, and a number on
  // every door. Render and doors take the player's colour; the cream trim, the
  // louvres' frames and the plates sit above the paint.
  // hut { what: 'lido' }
  function changingHuts(S) {
    const { r, nz, bleed } = S;
    const FOOT = 478, LINTEL = 284;
    const HUTS = [
      { x0: 12, x1: 120, top: 188, no: '7', port: 240 },
      { x0: 126, x1: 234, top: 128, no: '8', port: 174 },
      { x0: 240, x1: 348, top: 188, no: '9', port: 240 },
    ];
    for (const h of HUTS) { h.cx = (h.x0 + h.x1) / 2; h.d0 = h.cx - 27; h.d1 = h.cx + 27; }
    const stepped = (h) => [[h.x0, FOOT], [h.x0, h.top + 32], [h.x0 + 12, h.top + 32], [h.x0 + 12, h.top + 16], [h.x0 + 28, h.top + 16], [h.x0 + 28, h.top], [h.x1 - 28, h.top], [h.x1 - 28, h.top + 16], [h.x1 - 12, h.top + 16], [h.x1 - 12, h.top + 32], [h.x1, h.top + 32], [h.x1, FOOT]];
    const PORT = 16;
    const region = new Path2D(), shape = new Path2D();
    for (const h of HUTS) {
      outline(region, stepped(h)); outline(shape, stepped(h));
      region.moveTo(h.cx + PORT, h.port); region.arc(h.cx, h.port, PORT, 0, TAU);
    }
    const LOUVRES = [[300, 342], [432, 466]];

    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > FOOT - 16 ? 1.35 : x < 24 || x > 336 ? 1.2 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1704);
        c.fillStyle = lin(c, 0, y0, 0, 330, [[0, '#86cdea'], [0.75, '#cfeaf0'], [1, '#f1f1e2']]); c.fillRect(x0, y0, x1 - x0, 340 - y0);
        puff(c, 64, 70, 17); puff(c, 296, 112, 13, 0.75); puff(c, 214, 42, 10, 0.6);
        // palms over the back wall, and flags from the top of the middle hut
        palm(c, q, 66, 262, 148, -20); palm(c, q, 322, 262, 176, 24); palm(c, q, 270, 262, 112, -10);
        pennants(c, x0 - 8, 104, 180, 84, 26); pennants(c, 180, 84, x1 + 8, 118, 28);
        // the back wall behind the huts, with its own band of coral
        c.fillStyle = '#f4ead6'; c.fillRect(x0, 232, x1 - x0, FOOT - 232);
        c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x0, 232, x1 - x0, 2);
        c.fillStyle = CORAL; c.fillRect(x0, 246, x1 - x0, 3);
        c.fillStyle = 'rgba(70,60,50,0.14)'; c.fillRect(x0, 249, x1 - x0, FOOT - 249);
        // the terrace, and the pool just coming into the bottom of the picture
        terrazzo(c, nz, x0, FOOT, x1, y1, 1704);
        c.fillStyle = lin(c, 0, FOOT, 0, FOOT + 30, [[0, 'rgba(70,55,40,0.34)'], [1, 'rgba(70,55,40,0)']]); c.fillRect(x0, FOOT, x1 - x0, 30);
        poolEdge(c, q, x0, 564, x1, y1);
        // a step at every door
        for (const h of HUTS) {
          c.fillStyle = 'rgba(70,55,40,0.22)'; c.fillRect(h.d0 - 12, FOOT + 15, h.d1 - h.d0 + 28, 6);
          c.fillStyle = '#cfc2a8'; c.fillRect(h.d0 - 12, FOOT + 8, h.d1 - h.d0 + 24, 9);
          c.fillStyle = '#f6eedd'; c.fillRect(h.d0 - 12, FOOT - 1, h.d1 - h.d0 + 24, 10);
        }
        // someone has lost a flip-flop, and left a towel to dry
        c.save(); c.translate(306, 515); c.rotate(0.5);
        c.fillStyle = 'rgba(60,50,40,0.22)'; c.beginPath(); c.ellipse(2, 2, 17, 8, 0, 0, TAU); c.fill();
        c.fillStyle = CORAL; c.beginPath(); c.moveTo(-16, -1); c.bezierCurveTo(-10, -9, 6, -7, 15, -5); c.quadraticCurveTo(19, 0, 15, 5); c.bezierCurveTo(6, 7, -10, 8, -16, 1); c.fill();
        c.strokeStyle = CREAM; c.lineWidth = 1.6; c.beginPath(); c.moveTo(5, 0); c.quadraticCurveTo(-3, -6, -7, -5); c.moveTo(5, 0); c.quadraticCurveTo(-3, 6, -7, 5); c.stroke();
        c.restore();
        towel(c, 74, 534, 84, 30, -0.05, [WATER, CREAM, CORAL]);
        softShadow(c, shape, 9, 0.24, 2, 3);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // a little grain in the render
        for (let i = 0; i < 620; i++) { c.fillStyle = r() < 0.6 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)'; c.fillRect(8 + r() * 344, 126 + r() * 354, 1.4, 1.4); }
        for (const h of HUTS) {
          // light from the left of each hut, shade under the steps of the top and low down
          c.fillStyle = lin(c, h.x0, 0, h.x1, 0, [[0, 'rgba(255,255,255,0.14)'], [0.55, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.13)']]); c.fillRect(h.x0, h.top, h.x1 - h.x0, FOOT - h.top);
          c.fillStyle = lin(c, 0, FOOT - 46, 0, FOOT, [[0, 'rgba(20,15,10,0)'], [1, 'rgba(20,15,10,0.16)']]); c.fillRect(h.x0, FOOT - 46, h.x1 - h.x0, 46);
          // the door: boards, a dark gap all round, and slats in the two louvres
          const dw = h.d1 - h.d0;
          c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(h.d0, LINTEL, dw, FOOT - LINTEL);
          for (let x = h.d0 + 9; x < h.d1 - 3; x += 9) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, LINTEL, 1.2, FOOT - LINTEL); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x + 1.2, LINTEL, 1, FOOT - LINTEL); }
          for (const [a, b] of LOUVRES) {
            c.fillStyle = 'rgba(0,0,0,0.24)'; c.fillRect(h.d0 + 6, a, dw - 12, b - a);
            for (let y = a + 1; y < b - 3; y += 6) {
              c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(h.d0 + 6, y, dw - 12, 2.6);
              c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(h.d0 + 6, y + 2.6, dw - 12, 1);
            }
            c.strokeStyle = 'rgba(0,0,0,0.26)'; c.lineWidth = 1.4; c.strokeRect(h.d0 + 6, a, dw - 12, b - a);
          }
        }
      },
      dirt(c) {
        // old render gone grey and crazed, with what is left of the last coat
        const g = ramp(['#a7a294', '#b9b4a6', '#c9c4b6', '#d5d1c4']);
        field(c, 8, 124, 352, FOOT + 4, 2, (x, y) => g(nz.fbm(x * 0.03, y * 0.03, 4) * 0.8 + nz.n2(x * 0.4, y * 0.4) * 0.2));
        peelingPaint(c, r, 14, 134, 346, FOOT, 62, '#d7a79e');
        for (const h of HUTS) {
          c.save(); c.beginPath(); c.rect(h.d0, LINTEL, h.d1 - h.d0, FOOT - LINTEL); c.clip();
          weatheredWood(c, r, nz, h.d0 - 2, LINTEL - 2, h.d1 + 2, FOOT + 2);
          peelingPaint(c, r, h.d0, LINTEL, h.d1, FOOT, 13, '#c9a79c');
          for (const [a, b] of LOUVRES) {
            c.fillStyle = 'rgba(40,34,28,0.6)'; c.fillRect(h.d0 + 6, a, h.d1 - h.d0 - 12, b - a);
            c.fillStyle = 'rgba(190,180,162,0.75)'; for (let y = a + 1; y < b - 3; y += 6) c.fillRect(h.d0 + 6, y, h.d1 - h.d0 - 12, 2.6);
          }
          c.restore();
          c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; c.strokeRect(h.d0 + 1, LINTEL + 1, h.d1 - h.d0 - 2, FOOT - LINTEL - 2);
        }
        // hairline cracks, damp rising from the ground and rust from the fixings
        c.strokeStyle = 'rgba(70,62,50,0.42)'; c.lineWidth = 1; c.lineCap = 'round';
        for (let i = 0; i < 26; i++) {
          let x = 16 + r() * 328, y = 134 + r() * 330; c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 18; y += 5 + r() * 14; c.lineTo(x, y); }
          c.stroke();
        }
        c.fillStyle = lin(c, 0, 410, 0, FOOT, [[0, 'rgba(96,112,78,0)'], [1, 'rgba(96,112,78,0.5)']]); c.fillRect(8, 410, 344, FOOT - 410);
        grime(c, r, 12, 130, 348, FOOT, 34);
        for (const h of HUTS) for (const y of [LINTEL + 16, FOOT - 40]) {
          const g2 = c.createLinearGradient(0, y, 0, y + 52); g2.addColorStop(0, 'rgba(130,70,30,0.5)'); g2.addColorStop(1, 'rgba(130,70,30,0)');
          c.fillStyle = g2; c.fillRect(h.d0 + 1, y, 5, 52);
        }
      },
      top(c) {
        for (const h of HUTS) {
          // the cream line round the stepped top
          c.save(); c.lineJoin = 'miter'; c.lineCap = 'butt';
          c.beginPath(); stepped(h).slice(1, 11).forEach(([x, y], i) => { if (i) c.lineTo(x, y); else c.moveTo(x, y); });
          c.strokeStyle = 'rgba(60,45,35,0.25)'; c.lineWidth = 7; c.translate(0, 1.4); c.stroke(); c.translate(0, -1.4);
          c.strokeStyle = CREAM; c.lineWidth = 6.4; c.stroke();
          c.restore();
          // speed lines either side of the door
          for (const y of [316, 330, 344]) for (const [a, b] of [[h.x0, h.d0 - 6], [h.d1 + 6, h.x1]]) {
            c.fillStyle = CREAM; c.fillRect(a, y, b - a, 5.4);
            c.fillStyle = 'rgba(70,55,40,0.2)'; c.fillRect(a, y + 5.4, b - a, 1.4);
          }
          // the skirting, the door frame and its stepped head
          c.fillStyle = 'rgba(70,55,40,0.2)'; c.fillRect(h.x0, FOOT - 17, h.x1 - h.x0, 2);
          for (const [a, b] of [[h.x0, h.d0 - 3], [h.d1 + 3, h.x1]]) { c.fillStyle = CREAM; c.fillRect(a, FOOT - 15, b - a, 16); }
          c.fillStyle = CREAM; c.fillRect(h.d0 - 6, LINTEL - 6, 6, FOOT - LINTEL + 7); c.fillRect(h.d1, LINTEL - 6, 6, FOOT - LINTEL + 7); c.fillRect(h.d0 - 6, LINTEL - 6, h.d1 - h.d0 + 12, 6);
          c.fillRect(h.cx - 18, LINTEL - 12, 36, 6);
          c.fillStyle = CORAL; c.fillRect(h.cx - 9, LINTEL - 18, 18, 6);
          c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(h.d0 - 1, LINTEL, 1, FOOT - LINTEL); c.fillRect(h.d1, LINTEL, 1.6, FOOT - LINTEL); c.fillRect(h.d0 - 6, LINTEL, h.d1 - h.d0 + 12, 1.4);
          // the round window
          dot(c, h.cx, h.port, PORT + 4, CREAM);
          c.strokeStyle = 'rgba(70,55,40,0.3)'; c.lineWidth = 1.2; c.beginPath(); c.arc(h.cx, h.port, PORT + 4, 0, TAU); c.stroke();
          dot(c, h.cx, h.port, PORT, BRASS); dot(c, h.cx, h.port, PORT - 2.6, '#35607d');
          c.fillStyle = 'rgba(190,232,242,0.55)'; c.beginPath(); c.moveTo(h.cx - 9, h.port + 9); c.lineTo(h.cx + 4, h.port - 12); c.lineTo(h.cx + 11, h.port - 7); c.lineTo(h.cx - 3, h.port + 12); c.closePath(); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(h.cx, h.port, PORT - 2.6, Math.PI * 1.1, Math.PI * 1.75); c.lineTo(h.cx, h.port); c.closePath(); c.fill();
          // the number on the door, the handle and two hinges
          dot(c, h.cx + 0.6, 389, 17, 'rgba(40,30,20,0.3)');
          dot(c, h.cx, 387.5, 17, CREAM); dot(c, h.cx, 387.5, 14.6, NAVY); dot(c, h.cx, 387.5, 13.2, CREAM);
          c.fillStyle = NAVY; c.font = `700 21px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(h.no, h.cx, 388.5);
          dot(c, h.d1 - 8, 414, 4.6, '#a98534'); dot(c, h.d1 - 8, 414, 3.2, BRASS); dot(c, h.d1 - 9, 413, 1.1, '#fff3c4');
          for (const y of [LINTEL + 14, FOOT - 38]) { c.fillStyle = '#a98534'; c.fillRect(h.d0, y, 11, 4.4); c.fillStyle = BRASS; c.fillRect(h.d0, y, 11, 1.8); }
        }
        // the sun over the middle door, and the pole for its flag
        const m = HUTS[1], fy = LINTEL - 21, rays = 9;
        for (let k = 0; k < rays; k++) {
          const a0 = Math.PI + (k / rays) * Math.PI, a1 = a0 + Math.PI / rays;
          if (k % 2 === 0) { c.fillStyle = CREAM; c.beginPath(); c.arc(m.cx, fy, 54, a0, a1); c.arc(m.cx, fy, 15, a1, a0, true); c.closePath(); c.fill(); }
        }
        c.fillStyle = CORAL; c.beginPath(); c.arc(m.cx, fy, 15, Math.PI, TAU); c.closePath(); c.fill();
        c.fillStyle = '#c6ced2'; c.fillRect(m.cx - 1.6, 80, 3.2, 48);
        dot(c, m.cx, 79, 3.2, BRASS);
      },
      liveTop(c, t) {
        // the flag lifting in the breeze
        c.fillStyle = CORAL; c.beginPath(); c.moveTo(181, 83);
        for (let k = 1; k <= 8; k++) { const x = 181 + k * 4.4, y = 83 + Math.sin(t * 3 + k * 0.8) * k * 0.34; c.lineTo(x, y + k * 0.7); }
        for (let k = 8; k >= 1; k--) { const x = 181 + k * 4.4, y = 83 + Math.sin(t * 3 + k * 0.8) * k * 0.34; c.lineTo(x, y + 20 - k * 1.3); }
        c.lineTo(181, 103); c.closePath(); c.fill();
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------- THE LIDO: THE WAY IN
  // The way in from the road, between two cream piers: an iron screen with a
  // rising sun in its top half and, below, a turnstile with four arms that
  // lets one swimmer through at a time. All of the iron takes the player's
  // colour; the lido lies waiting beyond it, and bars of rust give way to paint.
  // fence { what: 'turnstile' }
  function turnstileGate(S) {
    const { r, nz, bleed } = S;
    const L = 50, R = 310, TOP = 128, MID = 292, FOOT = 520, cx = 180, cy = MID + 2;
    const region = new Path2D();
    // an iron bar with the same winding as a rect, wider at one end if asked
    function bar(p, x0, y0, x1, y1, w0, w1 = w0) {
      const l = Math.hypot(x1 - x0, y1 - y0), nx = (y1 - y0) / l, ny = -(x1 - x0) / l;
      outline(p, [[x0 + (nx * w0) / 2, y0 + (ny * w0) / 2], [x1 + (nx * w1) / 2, y1 + (ny * w1) / 2], [x1 - (nx * w1) / 2, y1 - (ny * w1) / 2], [x0 - (nx * w0) / 2, y0 - (ny * w0) / 2]]);
    }
    const ring = (p, x, y, r1, r0, a0 = 0, a1 = TAU) => { p.moveTo(x + Math.cos(a0) * r1, y + Math.sin(a0) * r1); p.arc(x, y, r1, a0, a1); p.arc(x, y, r0, a1, a0, true); p.closePath(); };
    // the frame, the rail across its middle and the two posts of the turnstile's bay
    region.rect(L, TOP, R - L, 13); region.rect(L, MID, R - L, 14);
    region.rect(L, TOP, 14, FOOT - TOP); region.rect(R - 14, TOP, 14, FOOT - TOP);
    const POSTS = [106, 254];
    for (const x of POSTS) region.rect(x - 6.5, MID, 13, FOOT - MID);
    // the rising sun: a disc, rays out to the frame and a hoop that ties them
    region.moveTo(cx - 42, cy); region.arc(cx, cy, 42, Math.PI, TAU); region.closePath();
    const RAYS = 11, rays = [];
    for (let k = 1; k < RAYS; k++) {
      const a = Math.PI + (k / RAYS) * Math.PI, ux = Math.cos(a), uy = Math.sin(a);
      const t = Math.min((cy - TOP - 8) / -uy, (cx - L - 9) / Math.abs(ux));
      rays.push([ux, uy, t]);
      bar(region, cx + ux * 38, cy + uy * 38, cx + ux * t, cy + uy * t, k % 2 ? 7 : 5.5, k % 2 ? 15 : 11);
    }
    ring(region, cx, cy, 98, 90, Math.PI, TAU);
    ring(region, cx, cy, 58, 52, Math.PI, TAU);
    // low panels at either side, with a diamond in each
    for (const [a, b] of [[L + 14, POSTS[0] - 6], [POSTS[1] + 6, R - 14]]) {
      const m = (a + b) / 2, dy = 396;
      for (const x of [a + 9, b - 9]) { region.rect(x - 4, MID + 14, 8, dy - 42 - MID - 14 + 8); region.rect(x - 4, dy + 34, 8, FOOT - dy - 34); }
      region.rect(a - 1, dy - 42, b - a + 2, 8); region.rect(a - 1, dy + 34, b - a + 2, 8);
      region.rect(m - 4, MID + 14, 8, dy - 26 - MID - 14); region.rect(m - 4, dy + 26, 8, FOOT - dy - 26);
      outline(region, [[m, dy - 26], [m + 19, dy], [m, dy + 26], [m - 19, dy]]);
    }
    const SOLID = new Path2D(); SOLID.addPath(region);
    // the turnstile: a stout post with four arms, turned a little so that one
    // of them points nearly at you; each arm is two bars and an upright
    const POST = { y0: 388, y1: FOOT }, TIERS = [418, 464];
    const ARMS = [{ dx: 19, dy: -13, far: true }, { dx: -62, dy: -6 }, { dx: 62, dy: 6 }, { dx: -20, dy: 14, near: true }];
    for (const a of ARMS) {
      for (const y of TIERS) bar(region, cx, y, cx + a.dx, y + a.dy, 8);
      bar(region, cx + a.dx, TIERS[0] + a.dy - 4, cx + a.dx, TIERS[1] + a.dy + 4, 9);
    }
    region.rect(cx - 10, POST.y0, 20, POST.y1 - POST.y0);
    region.moveTo(cx - 13, POST.y0 + 6); region.quadraticCurveTo(cx, POST.y0 - 22, cx + 13, POST.y0 + 6); region.closePath();
    // Chrome keeps the fill rule a path was last drawn with, so the region itself
    // never goes to softShadow (evenodd), only copies do
    const copy = () => { const p = new Path2D(); p.addPath(region); return p; };
    const iron = copy();

    return {
      family: 'paint', particle: 'paint', region, fillRule: 'nonzero',
      tough: (x, y) => (y > FOOT - 34 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1705);
        // the far side of the lido, seen through the gate
        c.fillStyle = lin(c, 0, y0, 0, 400, [[0, '#7fc6e6'], [0.8, '#c4e6ee'], [1, '#ecefdf']]); c.fillRect(x0, y0, x1 - x0, 410 - y0);
        puff(c, 118, 186, 16); puff(c, 250, 232, 12, 0.75);
        palm(c, q, 96, 398, 150, -14); palm(c, q, 266, 398, 186, 18);
        // the row of huts over the water, small and far off
        c.fillStyle = '#f4ead6'; c.fillRect(x0, 346, x1 - x0, 56);
        for (let x = 66, k = 0; x < 300; x += 42, k++) {
          c.fillStyle = k % 2 ? CORAL : WATER; c.fillRect(x, 358, 22, 44);
          c.fillStyle = 'rgba(255,255,255,0.65)'; c.fillRect(x, 358, 22, 2);
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 18, 358, 4, 44);
        }
        c.fillStyle = '#e8dcc2'; c.fillRect(x0, 342, x1 - x0, 6);
        c.fillStyle = lin(c, 0, 402, 0, 462, [[0, '#62bdd3'], [1, '#a0dfe8']]); c.fillRect(x0, 402, x1 - x0, 60);
        for (let i = 0; i < 44; i++) { const y = 406 + q() * 52, x = 56 + q() * 240, l = 8 + q() * 20; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 2, x + l, y); c.stroke(); }
        c.fillStyle = '#f4ead6'; c.fillRect(x0, 460, x1 - x0, 7);
        terrazzo(c, nz, x0, 466, x1, y1, 1705);
        // the two piers, stepped at the top, and the lintel between them
        const pier = (a, b, sx) => {
          c.fillStyle = lin(c, a, 0, b, 0, sx > 0 ? [[0, '#f8f1e2'], [1, '#e2d4ba']] : [[0, '#e2d4ba'], [1, '#f4ead8']]);
          const o = sx > 0 ? b : a, s = sx > 0 ? -1 : 1;
          c.beginPath(); outline(c, [[o, y1], [o, 62], [o + s * 12, 62], [o + s * 12, 44], [o + s * 26, 44], [o + s * 26, 26], [sx > 0 ? a : b, 26], [sx > 0 ? a : b, y1]]); c.fill();
          for (const y of [176, 192, 208]) { c.fillStyle = CORAL; c.fillRect(a, y, b - a, 4.6); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(a, y, b - a, 1.2); }
          for (const y of [176, 192, 208]) { c.fillStyle = 'rgba(60,45,35,0.2)'; c.fillRect(a, y + 4.6, b - a, 1.2); }
          c.fillStyle = '#d9cbb0'; c.fillRect(a, FOOT + 8, b - a, y1 - FOOT - 8);
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(a, FOOT + 8, b - a, 2);
        };
        pier(x0 - 20, L - 4, 1); pier(R + 4, x1 + 20, -1);
        // a globe lamp on each pier
        for (const x of [24, 336]) {
          c.fillStyle = BRASS; c.fillRect(x - 5, 136, 10, 7); c.fillRect(x - 2, 122, 4, 15);
          dot(c, x, 108, 16, '#fff6dd'); dot(c, x - 5, 103, 5, '#ffffff');
          c.strokeStyle = 'rgba(180,140,70,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, 108, 16, 0, TAU); c.stroke();
        }
        // the lintel, with a stepped crest, and its shade on what is behind
        c.fillStyle = lin(c, 0, TOP, 0, TOP + 30, [[0, 'rgba(30,60,80,0.4)'], [1, 'rgba(30,60,80,0)']]); c.fillRect(L, TOP, R - L, 30);
        c.fillStyle = lin(c, 0, 56, 0, TOP, [[0, '#f8f1e2'], [1, '#ece0c8']]);
        c.beginPath(); outline(c, [[40, TOP], [40, 96], [112, 96], [112, 80], [132, 80], [132, 64], [150, 64], [150, 50], [210, 50], [210, 64], [228, 64], [228, 80], [248, 80], [248, 96], [320, 96], [320, TOP]]); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(40, 96, 72, 1.6); c.fillRect(248, 96, 72, 1.6); c.fillRect(150, 50, 60, 1.6);
        for (const y of [106, 114]) { c.fillStyle = CORAL; c.fillRect(40, y, 280, 3); }
        for (let k = 0; k < 7; k++) { const a = Math.PI + ((k + 0.5) / 7) * Math.PI; c.strokeStyle = BRASS; c.lineWidth = 3; c.beginPath(); c.moveTo(180 + Math.cos(a) * 15, 90 + Math.sin(a) * 15); c.lineTo(180 + Math.cos(a) * 30, 90 + Math.sin(a) * 30); c.stroke(); }
        c.fillStyle = CORAL; c.beginPath(); c.arc(180, 90, 12, Math.PI, TAU); c.closePath(); c.fill();
        c.fillStyle = 'rgba(60,45,35,0.25)'; c.fillRect(40, TOP - 2, 280, 2);
        pennants(c, 26, 30, 150, 52, 8); pennants(c, 210, 52, 334, 30, 8);
        // a potted palm at the foot of each pier
        for (const [x, s] of [[20, 1], [340, -1]]) {
          palm(c, q, x, 516, 66, 4 * s);
          c.fillStyle = 'rgba(60,50,40,0.24)'; c.beginPath(); c.ellipse(x + 3, 556, 28, 8, 0, 0, TAU); c.fill();
          c.fillStyle = lin(c, x - 22, 0, x + 22, 0, [[0, '#ef8069'], [1, CORAL_DK]]); c.beginPath(); c.moveTo(x - 22, 512); c.lineTo(x + 22, 512); c.lineTo(x + 16, 556); c.lineTo(x - 16, 556); c.closePath(); c.fill();
          c.fillStyle = CREAM; c.fillRect(x - 23, 510, 46, 6);
        }
        // the threshold, a mat of tiles under the turnstile, and the shade of the iron on it
        c.fillStyle = '#d4c6aa'; c.fillRect(L - 4, FOOT - 2, R - L + 8, 12);
        c.fillStyle = '#f3e9d6'; c.fillRect(L - 4, FOOT - 2, R - L + 8, 7);
        c.fillStyle = lin(c, 0, FOOT + 10, 0, 580, [[0, 'rgba(40,50,60,0.16)'], [1, 'rgba(40,50,60,0)']]);
        for (let i = 0; i < 9; i++) { const x = 74 + i * 26.5; c.beginPath(); c.moveTo(x - 4, FOOT + 10); c.lineTo(x + 4, FOOT + 10); c.lineTo(x + 7 + (x - 180) * 0.14, 580); c.lineTo(x - 7 + (x - 180) * 0.14, 580); c.closePath(); c.fill(); }
        softShadow(c, copy(), 3, 0.3, 3, 4);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        bevel(c, iron, 'rgba(255,255,255,0.46)', 'rgba(10,25,35,0.36)');
        // the sun's disc is round: lighter at the top, with rings turned into it
        c.fillStyle = lin(c, 0, cy - 42, 0, cy, [[0, 'rgba(255,255,255,0.3)'], [1, 'rgba(255,255,255,0)']]); c.beginPath(); c.arc(cx, cy, 42, Math.PI, TAU); c.fill();
        c.strokeStyle = 'rgba(10,25,35,0.22)'; c.lineWidth = 1.4; for (const rr of [18, 31]) { c.beginPath(); c.arc(cx, cy, rr, Math.PI, TAU); c.stroke(); }
        // the post of the turnstile is round too; the far arm sits in shade behind it
        c.fillStyle = 'rgba(10,25,35,0.22)';
        for (const a of ARMS) if (a.far) { const p = new Path2D(); for (const y of TIERS) bar(p, cx, y, cx + a.dx, y + a.dy, 9); p.rect(cx + a.dx - 5, TIERS[0] + a.dy - 5, 10, TIERS[1] - TIERS[0] + 10); c.fill(p, 'nonzero'); }
        c.fillStyle = lin(c, cx - 10, 0, cx + 10, 0, [[0, 'rgba(0,0,0,0.18)'], [0.34, 'rgba(255,255,255,0.32)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.26)']]); c.fillRect(cx - 10, POST.y0 - 12, 20, POST.y1 - POST.y0 + 12);
        // the near arm crosses in front of the post
        for (const a of ARMS) if (a.near) for (const y of TIERS) { c.strokeStyle = 'rgba(10,25,35,0.3)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx + 6, y - 5); c.lineTo(cx + a.dx, y + a.dy - 5); c.moveTo(cx + 6, y + 5); c.lineTo(cx + a.dx, y + a.dy + 5); c.stroke(); }
      },
      dirt(c) {
        // rust, dark and scabby, with flakes of the old green still hanging on
        const g = ramp(['#3f2a20', '#5e3a26', '#7d4d2e', '#9c6538', '#b07c4c']);
        field(c, L - 4, TOP - 4, R + 4, FOOT + 4, 1.5, (x, y) => g(nz.fbm(x * 0.06, y * 0.06, 4) * 0.62 + nz.n2(x * 0.7, y * 0.7) * 0.38));
        peelingPaint(c, r, L, TOP, R, FOOT, 110, '#8fae9c');
        for (let i = 0; i < 900; i++) { c.fillStyle = U.pick(r, ['rgba(40,26,18,0.5)', 'rgba(200,120,60,0.5)', 'rgba(230,170,110,0.35)']); c.beginPath(); c.arc(L + r() * (R - L), TOP + r() * (FOOT - TOP), 0.6 + r() * 1.5, 0, TAU); c.fill(); }
        c.lineCap = 'round';
        for (let i = 0; i < 26; i++) { const x = L + r() * (R - L), y = TOP + r() * (FOOT - TOP - 40), l = 16 + r() * 50; c.strokeStyle = 'rgba(120,62,30,0.42)'; c.lineWidth = 2 + r() * 3.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + l); c.stroke(); }
      },
      top(c) {
        // rivets at the corners of the frame and along the rails
        const rivet = (x, y) => { dot(c, x + 0.5, y + 0.7, 2.6, 'rgba(10,25,35,0.4)'); dot(c, x, y, 2.3, '#8d969c'); dot(c, x - 0.7, y - 0.7, 0.9, '#e6ecee'); };
        for (const x of [L + 7, 80, 106, 254, 280, R - 7]) { rivet(x, TOP + 6.5); rivet(x, MID + 7); }
        for (const y of [340, 420, 500]) { rivet(L + 7, y); rivet(R - 7, y); }
        // the brass on the turnstile, the plate it stands on and the sign over it
        const b = lin(c, cx - 14, 0, cx + 14, 0, [[0, '#a98534'], [0.4, '#f6e19a'], [1, '#a07b2e']]);
        c.fillStyle = b; for (const y of TIERS) { c.fillRect(cx - 12, y - 7, 24, 3.4); c.fillRect(cx - 12, y + 3.6, 24, 3.4); }
        dot(c, cx, POST.y0 - 11, 6, '#a98534'); dot(c, cx, POST.y0 - 11, 4.6, BRASS); dot(c, cx - 1.6, POST.y0 - 12.6, 1.4, '#fff3c4');
        c.fillStyle = '#b9ad93'; c.beginPath(); c.ellipse(cx, FOOT + 1, 26, 7, 0, 0, TAU); c.fill();
        c.fillStyle = '#d6cbb2'; c.beginPath(); c.ellipse(cx, FOOT - 1, 26, 7, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, cx - 15, 0, cx + 15, 0, [[0, '#8d969c'], [0.4, '#e6ecee'], [1, '#6f787e']]); c.beginPath(); c.ellipse(cx, FOOT - 3, 15, 4.4, 0, 0, TAU); c.fill();
        const sign = (x, y, w, h) => {
          c.fillStyle = 'rgba(30,40,50,0.3)'; c.beginPath(); c.roundRect(x + 1.5, y + 2.5, w, h, 4); c.fill();
          c.fillStyle = CREAM; c.beginPath(); c.roundRect(x, y, w, h, 4); c.fill();
          c.strokeStyle = NAVY; c.lineWidth = 1.4; c.beginPath(); c.roundRect(x + 2.4, y + 2.4, w - 4.8, h - 4.8, 2.4); c.stroke();
          for (const px of [x + 9, x + w - 9]) { c.fillStyle = '#7d8990'; c.fillRect(px - 1, y - 12, 2, 12); }
        };
        sign(134, 322, 92, 26);
        c.fillStyle = NAVY; c.font = `700 12.5px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WAY IN', 172, 335.5);
        c.beginPath(); outline(c, [[204, 330], [213, 335], [204, 340]]); c.fill(); c.fillRect(197, 334, 8, 2.4);
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------ THE LIDO: THE KIOSK COUNTER
  // Close up at the kiosk, under its striped awning: six tubs of ice cream let
  // into a steel top with a card for each flavour, stacks of wafer cones on the
  // ledge behind and the signs on the tiled wall. A hot day has left melted ice
  // over all of it, and sand from every hand that leaned there.
  // counter { what: 'kiosk' }
  function kioskCounter(S) {
    const { r, nz, bleed } = S;
    const BACK = 298, FRONT = 468, EDGE = 494;   // the counter top: back edge, front edge, foot of its chrome lip
    // seen from a little above, so the top narrows towards the back
    const P = (x, y) => [180 + (x - 180) * U.lerp(0.9, 1, (y - BACK) / (FRONT - BACK)), y];
    const quad = (x, y, w, h) => [P(x, y), P(x + w, y), P(x + w, y + h), P(x, y + h)];
    const TUBS = [
      { name: 'VANILLA', col: '#fbecc4', fleck: '#d8b878' }, { name: 'STRAWBERRY', col: '#f6b2b6', fleck: '#d9545f' }, { name: 'MINT', col: '#bfe9d3', fleck: '#3c2a22' },
      { name: 'TOFFEE', col: '#dca85f', fleck: '#f5dca6' }, { name: 'LEMON', col: '#fae68f', fleck: '#fff6c8' }, { name: 'CHOCOLATE', col: '#8d5d40', fleck: '#5e3a26' },
    ];
    TUBS.forEach((t, i) => Object.assign(t, { x: 30 + (i % 3) * 102, y: i < 3 ? 316 : 390, w: 96, h: i < 3 ? 66 : 70 }));
    const region = new Path2D();
    rrPath(region, 0, BACK - 3, W, EDGE - BACK + 7, 5);
    // where the ice has run and set, which takes a little more wiping
    const POOLS = [];
    for (let i = 0; i < 22; i++) POOLS.push({ x: 14 + r() * 332, y: BACK + 12 + r() * (FRONT - BACK - 20), s: 8 + r() * r() * 26, col: U.pick(r, ['#f6c4c6', '#fbeecb', '#c8ecd9', '#e3bb7d', '#fbeecb', '#f6c4c6']) });

    function counterTop(c, x0, x1) {
      terrazzo(c, nz, x0, BACK - 4, x1, FRONT + 2, 1707);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0, BACK - 3, x1 - x0, 1.6);
      // the chrome lip with three ribs
      c.fillStyle = lin(c, 0, FRONT, 0, EDGE, [[0, '#f2f5f6'], [0.25, '#c3ccd1'], [0.5, '#eef2f3'], [0.75, '#aeb8be'], [1, '#7f8a91']]); c.fillRect(x0, FRONT, x1 - x0, EDGE - FRONT);
      for (const y of [FRONT + 8, FRONT + 17]) { c.fillStyle = 'rgba(40,55,65,0.3)'; c.fillRect(x0, y, x1 - x0, 1.2); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(x0, y + 1.2, x1 - x0, 1); }
    }
    function tub(c, t) {
      const q = U.rng(t.x * 7 + t.y), lipPts = quad(t.x, t.y, t.w, t.h), ice = quad(t.x + 5, t.y + 5, t.w - 10, t.h - 9);
      c.lineJoin = 'round';
      c.beginPath(); outline(c, lipPts);
      c.fillStyle = lin(c, 0, t.y, 0, t.y + t.h, [[0, '#dfe5e8'], [1, '#b4bec4']]); c.strokeStyle = c.fillStyle; c.lineWidth = 4; c.stroke(); c.fill();
      c.beginPath(); outline(c, ice); c.fillStyle = 'rgba(40,55,65,0.5)'; c.strokeStyle = 'rgba(40,55,65,0.5)'; c.lineWidth = 2.5; c.stroke();
      c.save(); c.beginPath(); outline(c, ice); c.clip();
      c.fillStyle = t.col; c.fillRect(t.x - 4, t.y, t.w + 8, t.h);
      // the ridges left by the scoop, and a hollow where the last one was taken
      for (let k = 0; k < 8; k++) {
        const y = t.y + 2 + k * (t.h / 7), ph = q() * 6, amp = 3 + q() * 3.4, wave = () => { c.beginPath(); for (let x = t.x - 4; x <= t.x + t.w + 4; x += 6) { const py = y + Math.sin(x * 0.085 + ph) * amp; if (x === t.x - 4) c.moveTo(x, py); else c.lineTo(x, py); } };
        c.lineCap = 'round'; c.lineJoin = 'round';
        wave(); c.strokeStyle = U.shade(t.col, -0.16); c.lineWidth = 5; c.stroke();
        c.save(); c.translate(0, -2.4); wave(); c.strokeStyle = U.shade(t.col, 0.42); c.lineWidth = 2.6; c.stroke(); c.restore();
      }
      const hx = t.x + 26 + q() * (t.w - 52), hy = t.y + 24 + q() * (t.h - 44);
      c.fillStyle = U.shade(t.col, -0.2); c.beginPath(); c.ellipse(hx, hy, 19, 11, -0.2, 0, TAU); c.fill();
      c.fillStyle = U.shade(t.col, -0.06); c.beginPath(); c.ellipse(hx + 1, hy + 2, 16, 8.4, -0.2, 0, TAU); c.fill();
      c.strokeStyle = U.shade(t.col, 0.5); c.lineWidth = 2; c.beginPath(); c.ellipse(hx, hy, 19, 11, -0.2, 0.3, 2.4); c.stroke();
      for (let k = 0; k < 15; k++) dot(c, t.x + 6 + q() * (t.w - 12), t.y + 6 + q() * (t.h - 12), 0.9 + q() * 1.5, t.fleck);
      // shade from the rim of the tub
      c.fillStyle = lin(c, 0, t.y, 0, t.y + 18, [[0, 'rgba(40,40,50,0.26)'], [1, 'rgba(40,40,50,0)']]); c.fillRect(t.x - 4, t.y, t.w + 8, 18);
      c.restore();
    }
    // wafer cones stacked one in the next, in a glass tube on the ledge
    function coneStack(c, x, y, n) {
      const w = 38, step = 11, body = lin(c, x - w / 2, 0, x + w / 2, 0, [[0, '#bf8440'], [0.35, '#f1c87e'], [0.65, '#e0ad62'], [1, '#a9702f']]);
      const hatch = (x0, y0, wd, ht) => {
        c.save(); c.beginPath(); c.rect(x0, y0, wd, ht); c.clip();
        c.strokeStyle = 'rgba(130,80,30,0.5)'; c.lineWidth = 0.9;
        for (let k = -8; k < 12; k++) { c.beginPath(); c.moveTo(x0 + k * 7, y0); c.lineTo(x0 + k * 7 + ht, y0 + ht); c.moveTo(x0 + k * 7 + ht, y0); c.lineTo(x0 + k * 7, y0 + ht); c.stroke(); }
        c.restore();
      };
      // the bottom cone, point down
      c.fillStyle = body; c.beginPath(); c.moveTo(x - w / 2, y - 44); c.lineTo(x + w / 2, y - 44); c.lineTo(x + 2, y); c.lineTo(x - 2, y); c.closePath(); c.fill();
      c.save(); c.beginPath(); c.moveTo(x - w / 2, y - 44); c.lineTo(x + w / 2, y - 44); c.lineTo(x + 2, y); c.lineTo(x - 2, y); c.closePath(); c.clip(); hatch(x - w / 2, y - 44, w, 44); c.restore();
      // then each one above it, from the bottom up, showing its rim
      for (let k = n - 1; k >= 0; k--) {
        const ry = y - 44 - k * step;
        c.fillStyle = body; c.fillRect(x - w / 2 + 1, ry, w - 2, step + 3);
        hatch(x - w / 2 + 1, ry, w - 2, step + 3);
        c.fillStyle = '#f7dca2'; c.beginPath(); c.ellipse(x, ry, w / 2 + 1, 4, 0, 0, TAU); c.fill();
        c.fillStyle = '#c08a48'; c.beginPath(); c.ellipse(x, ry + 0.6, w / 2 - 2, 2.4, 0, 0, TAU); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x - w / 2 + 4, y - 44 - n * step, 5, n * step + 34);
    }
    function glassJar(c, x, y, w, h, fill) {
      c.fillStyle = 'rgba(70,60,50,0.2)'; c.beginPath(); c.ellipse(x + 3, y + 1, w / 2 + 2, 4, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(225,240,245,0.55)'; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 7); c.fill();
      fill(x - w / 2 + 3, y - h, w - 6, h - 3);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - w / 2 + 4, y - h + 8, 4, h - 18);
      c.strokeStyle = 'rgba(120,150,160,0.7)'; c.lineWidth = 1.4; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 7); c.stroke();
    }

    return {
      family: 'wipe', particle: 'suds', region,
      tough(x, y) { for (const p of POOLS) if (Math.hypot(x - p.x, (y - p.y) * 1.4) < p.s) return 1.45; return 1; },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1707);
        // the wall of pale blue tiles behind the counter
        const tw = 40, th = 20;
        c.fillStyle = '#d7ece9'; c.fillRect(x0, y0, x1 - x0, 300 - y0);
        for (let j = Math.floor(y0 / th); j * th < 300; j++) for (let i = Math.floor(x0 / tw) - 1; i * tw < x1; i++) {
          const x = i * tw + (j % 2 ? tw / 2 : 0), y = j * th;
          c.fillStyle = j === 9 ? U.shade(CORAL, (q() - 0.5) * 0.1) : U.shade('#b4e0e6', (q() - 0.5) * 0.08);
          c.fillRect(x + 0.8, y + 0.8, tw - 1.6, th - 1.6);
          c.fillStyle = 'rgba(255,255,255,0.32)'; c.fillRect(x + 1.6, y + 1.6, tw - 3.2, 1.4);
        }
        // the big enamel sign with a low sun behind its letters
        const sx = 88, sy = 74, sw = 184, sh = 64;
        c.fillStyle = 'rgba(40,50,60,0.25)'; c.beginPath(); c.roundRect(sx + 3, sy + 4, sw, sh, 8); c.fill();
        c.save(); c.beginPath(); c.roundRect(sx, sy, sw, sh, 8); c.clip();
        c.fillStyle = CORAL; c.fillRect(sx, sy, sw, sh);
        for (let k = 0; k < 13; k++) { const a = Math.PI + (k / 13) * Math.PI; c.fillStyle = k % 2 ? 'rgba(255,240,215,0.22)' : 'rgba(255,240,215,0)'; c.beginPath(); c.moveTo(180, sy + sh); c.arc(180, sy + sh, 120, a, a + Math.PI / 13); c.closePath(); c.fill(); }
        c.restore();
        c.strokeStyle = CREAM; c.lineWidth = 3; c.beginPath(); c.roundRect(sx + 4, sy + 4, sw - 8, sh - 8, 5); c.stroke();
        c.fillStyle = CREAM; c.font = `700 40px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ICES', 180, sy + sh / 2 + 2);
        for (const x of [sx + 10, sx + sw - 10]) for (const y of [sy + 10, sy + sh - 10]) dot(c, x, y, 1.8, '#8d969c');
        // two small signs either side of it
        const card = (x, y, w, h, txt, sub) => {
          c.fillStyle = 'rgba(40,50,60,0.22)'; c.beginPath(); c.roundRect(x + 2, y + 3, w, h, 5); c.fill();
          c.fillStyle = CREAM; c.beginPath(); c.roundRect(x, y, w, h, 5); c.fill();
          c.strokeStyle = NAVY; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x + 3, y + 3, w - 6, h - 6, 3); c.stroke();
          c.fillStyle = NAVY; c.font = `700 11px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x + w / 2, y + h / 2 - 7);
          c.fillStyle = CORAL_DK; c.font = `700 7.6px ${DECO}`; c.fillText(sub, x + w / 2, y + h / 2 + 8);
        };
        card(10, 84, 68, 46, 'CONES', 'ONE OR TWO'); card(282, 84, 68, 46, 'WAFERS', 'AND TUBS');
        // the ledge along the back of the kiosk, and what stands on it
        c.fillStyle = 'rgba(40,60,70,0.22)'; c.fillRect(x0, 247, x1 - x0, 8);
        c.fillStyle = lin(c, 0, 254, 0, BACK, [[0, '#f8f0e0'], [1, '#e2d4ba']]); c.fillRect(x0, 254, x1 - x0, BACK - 254);
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(x0, 254, x1 - x0, 1.6);
        c.fillStyle = CORAL; c.fillRect(x0, 268, x1 - x0, 2.4);
        coneStack(c, 34, 276, 7); coneStack(c, 80, 276, 5); coneStack(c, 326, 276, 8);
        // a jar of wafers, the scoops standing in water, a jar of sprinkles
        glassJar(c, 136, 280, 40, 64, (x, y, w, h) => { c.fillStyle = '#efd8a8'; for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#efd8a8' : '#e2c48a'; c.fillRect(x + 1, y + 16 + k * 6.6, w - 2, 5.4); } });
        glassJar(c, 186, 280, 34, 52, (x, y, w, h) => { c.fillStyle = 'rgba(150,205,225,0.55)'; c.fillRect(x, y + 12, w, h - 12); });
        for (const [dx, a] of [[-6, -0.16], [7, 0.2]]) { c.save(); c.translate(186 + dx, 272); c.rotate(a); c.fillStyle = lin(c, -3, 0, 3, 0, [[0, '#8d969c'], [0.5, '#f4f7f8'], [1, '#7f8a91']]); c.fillRect(-2.2, -70, 4.4, 70); c.fillStyle = CORAL; c.beginPath(); c.roundRect(-3.6, -76, 7.2, 22, 3); c.fill(); c.restore(); }
        glassJar(c, 234, 280, 40, 58, (x, y, w, h) => { for (let k = 0; k < 16; k++) { c.fillStyle = U.pick(q, [CORAL, '#f6b2b6', '#fae68f', WATER, CREAM]); c.save(); c.translate(x + 3 + q() * (w - 6), y + h - 3 - q() * (h - 18)); c.rotate(q() * 3); c.fillRect(-1.2, -5, 2.4, 10); c.restore(); } });
        // the bell for service
        c.fillStyle = 'rgba(70,60,50,0.22)'; c.beginPath(); c.ellipse(279, 283, 15, 3.6, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, 266, 0, 292, 0, [[0, '#a98534'], [0.4, '#f6e19a'], [1, '#9a7428']]); c.beginPath(); c.moveTo(265, 280); c.quadraticCurveTo(268, 257, 279, 257); c.quadraticCurveTo(290, 257, 293, 280); c.closePath(); c.fill();
        c.fillStyle = '#a98534'; c.fillRect(263, 279, 32, 3.6); dot(c, 279, 255, 2.8, '#c9a24a');
        // the counter's front: cream panels with a sun in each
        c.fillStyle = '#f2e7d2'; c.fillRect(x0, EDGE, x1 - x0, y1 - EDGE);
        c.fillStyle = 'rgba(40,40,50,0.3)'; c.fillRect(x0, EDGE, x1 - x0, 6);
        for (const px of [60, 180, 300]) {
          c.save(); c.beginPath(); c.rect(px - 54, 512, 108, 88); c.clip();
          for (let k = 0; k < 11; k++) { const a = Math.PI + (k / 11) * Math.PI; c.fillStyle = k % 2 ? '#b9e2e8' : CREAM; c.beginPath(); c.moveTo(px, 600); c.arc(px, 600, 110, a, a + Math.PI / 11); c.closePath(); c.fill(); }
          dot(c, px, 600, 26, CORAL); dot(c, px, 600, 20, CREAM);
          c.restore();
          c.strokeStyle = 'rgba(120,100,70,0.5)'; c.lineWidth = 2; c.strokeRect(px - 54, 512, 108, 88);
        }
        for (const x of [0, 120, 240, 360]) { c.fillStyle = CORAL; c.fillRect(x - 3, EDGE + 6, 6, y1 - EDGE); }
        if (y1 > 600) { c.fillStyle = '#d8c9ac'; c.fillRect(x0, 600, x1 - x0, y1 - 600); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0, 600, x1 - x0, 2); }
        // the striped awning over everything, hanging in scallops
        const AW = 54, s = 40;
        for (let k = Math.floor(x0 / s) - 1; k * s < x1; k++) {
          const x = k * s; c.fillStyle = k % 2 ? CREAM : CORAL;
          c.beginPath(); c.moveTo(x, y0 - 2); c.lineTo(x + s, y0 - 2); c.lineTo(x + s, AW); c.arc(x + s / 2, AW, s / 2, 0, Math.PI); c.closePath(); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.05)'; c.fillRect(x + s - 8, y0 - 2, 8, AW - y0 + 2);
        }
        c.fillStyle = lin(c, 0, AW - 30, 0, AW + 16, [[0, 'rgba(60,30,20,0)'], [1, 'rgba(60,30,20,0.14)']]); c.fillRect(x0, AW - 30, x1 - x0, 46);
        c.fillStyle = lin(c, 0, 66, 0, 96, [[0, 'rgba(40,60,70,0.26)'], [1, 'rgba(40,60,70,0)']]); c.globalCompositeOperation = 'multiply'; c.fillRect(x0, 66, x1 - x0, 30); c.globalCompositeOperation = 'source-over';
      },
      clean(c) {
        counterTop(c, 0, W);
        // the steel top the tubs are let into
        c.lineJoin = 'round';
        const well = quad(20, 308, 320, 156);
        c.beginPath(); outline(c, well); c.fillStyle = lin(c, 0, 308, 0, 464, [[0, '#d3dade'], [0.5, '#e9edef'], [1, '#c6ced3']]); c.strokeStyle = c.fillStyle; c.lineWidth = 6; c.stroke(); c.fill();
        c.strokeStyle = 'rgba(40,55,65,0.3)'; c.lineWidth = 1.2; c.beginPath(); outline(c, quad(17, 305, 326, 162)); c.stroke();
        for (const t of TUBS) tub(c, t);
      },
      dirt(c) {
        // a dull film of old sugar and sun cream
        const g = ramp(['#b4a584', '#c4b698', '#d3c8ae']);
        field(c, 0, BACK - 4, W, EDGE + 5, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 110 + nz.fbm(x * 0.04 + 3, y * 0.05, 3) * 130]);
        for (let i = 0; i < 34; i++) { c.strokeStyle = 'rgba(150,132,100,0.2)'; c.lineWidth = 6 + r() * 12; c.lineCap = 'round'; const x = r() * W, y = BACK + r() * (FRONT - BACK), l = 30 + r() * 60, a = (r() - 0.5) * 0.9; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 + 8, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
        // melted ice, set in glossy pools
        for (const p of POOLS) {
          const b = new Path2D(); blob(b, p.x, p.y, p.s, p.s * 0.66, r, 0.34, 10);
          c.save(); c.translate(0.8, 2); c.fillStyle = 'rgba(90,70,50,0.28)'; c.fill(b); c.restore();
          c.fillStyle = p.col; c.fill(b);
          c.strokeStyle = U.shade(p.col, -0.14); c.lineWidth = 1.6; c.stroke(b);
          c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.ellipse(p.x - p.s * 0.1, p.y - p.s * 0.14, p.s * 0.58, p.s * 0.3, 0, 3.5, 5.1); c.stroke();
          dot(c, p.x + p.s * 0.4, p.y + p.s * 0.12, 1.6, 'rgba(255,255,255,0.7)');
        }
        // runs of it over the chrome
        for (let i = 0; i < 17; i++) {
          const x = 8 + r() * 344, h = 10 + r() * 20, w = 3 + r() * 5, col = U.pick(r, ['#f6c4c6', '#fbeecb', '#c8ecd9', '#e3bb7d']);
          c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, FRONT - 6, w, h + 6, w / 2); c.fill(); dot(c, x, FRONT + h, w * 0.66, col);
          c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x - w * 0.22, FRONT - 2, 1.2, h - 4);
        }
        // sand, in drifts where arms have leaned, and one small handprint
        const drifts = [];
        for (let d = 0; d < 13; d++) drifts.push([r() * W, BACK + 6 + r() * (FRONT - BACK), 80 + r() * 130]);
        for (const col of ['#d9bf85', '#e8d3a4', '#c3a36a', '#f1e2bd']) {
          c.fillStyle = col; c.beginPath();
          for (const [cx, cy, n] of drifts) for (let i = 0; i < n / 4; i++) { const a = r() * TAU, rr = r() * r() * 46, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.6, g = 0.5 + r() * 0.5; c.moveTo(x + g, y); c.arc(x, y, g, 0, TAU); }
          c.fill();
        }
        const hand = (x, y, a) => {
          c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = 'rgba(200,172,120,0.75)';
          c.beginPath(); c.ellipse(0, 0, 9, 10.5, 0, 0, TAU); c.fill();
          for (const [dx, dy, l, t] of [[-6.5, -11, 7, -0.2], [-2, -13, 8, -0.05], [2.6, -13, 8, 0.05], [7, -11, 7, 0.2], [-11, -1, 7, -0.9]]) { c.save(); c.translate(dx, dy); c.rotate(t); c.beginPath(); c.roundRect(-1.9, -l, 3.8, l + 3, 2); c.fill(); c.restore(); }
          c.restore();
        };
        hand(292, 442, 0.3); hand(62, 330, -0.4);
        // two lolly sticks, left where they were finished
        for (const [x, y, a] of [[132, 452, 0.5], [216, 318, -1.1]]) {
          c.save(); c.translate(x, y); c.rotate(a);
          c.fillStyle = 'rgba(90,70,50,0.3)'; c.beginPath(); c.roundRect(-16, -2.6, 34, 7, 3); c.fill();
          c.fillStyle = '#e4c78f'; c.beginPath(); c.roundRect(-17, -3.6, 34, 7, 3.4); c.fill();
          c.fillStyle = 'rgba(232,103,79,0.7)'; c.beginPath(); c.roundRect(2, -3.6, 15, 7, 3.4); c.fill();
          c.restore();
        }
      },
      top(c) {
        // a card on a pin for each flavour, so nothing hangs on the colour alone
        for (const t of TUBS) {
          const [mx] = P(t.x + t.w / 2, t.y), y = t.y - 6, w = t.name.length > 7 ? 72 : 58;
          c.fillStyle = 'rgba(40,40,50,0.3)'; c.beginPath(); c.roundRect(mx - w / 2 + 1, y + 1.6, w, 14, 3); c.fill();
          c.fillStyle = CREAM; c.beginPath(); c.roundRect(mx - w / 2, y, w, 14, 3); c.fill();
          c.fillStyle = NAVY; c.font = `700 9.4px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t.name, mx, y + 7.4);
          dot(c, mx - w / 2 + 3.6, y + 3.6, 1, BRASS); dot(c, mx + w / 2 - 3.6, y + 3.6, 1, BRASS);
        }
      },
    };
  }

  // ------------------------------------------------- THE LIDO: DECK CHAIRS OUT
  // The sun terrace along the pool, first thing in the morning, with a chalk
  // mark for every chair. Work over a mark and a striped deck chair drops onto
  // it, facing the water. The same pieces as the café tables in scenes9.js.
  // serve { what: 'deckchairs' }
  const pop = (k) => (k >= 1 ? 1 : Math.max(0, U.easeBack(Math.min(1, k))));   // a little overshoot, then it settles
  const CANVAS = [[CORAL, CREAM], [LANE, CREAM], [CORAL, CREAM, WATER, CREAM], [NAVY, CREAM], [WATER, CREAM], [CORAL_DK, CREAM, CORAL, CREAM]];
  function drawDeckChair(c, u, k) {
    const e = pop(k), drop = (1 - e) * 18, sq = k >= 1 ? 1 : 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.1, s = u.w / 70, fy = u.y + u.h - 5;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    // the shadow stays on the ground while the chair drops into place
    c.fillStyle = 'rgba(70,55,40,0.24)'; c.beginPath(); c.moveTo(u.cx - 30 * s, fy + 3); c.lineTo(u.cx + 34 * s, fy + 3); c.lineTo(u.cx + 46 * s, fy - 40 * s); c.lineTo(u.cx - 14 * s, fy - 40 * s); c.closePath(); c.fill();
    c.translate(u.cx, fy - drop); c.scale(sq * s, s / sq); c.transform(1, 0, u.lean, 1, 0, 0);
    const wood = lin(c, -34, 0, 34, 0, [[0, '#a8783f'], [0.3, '#deb477'], [0.7, '#cf9f62'], [1, '#9c6e38']]);
    const stick = (x0, y0, x1, y1, w) => { c.strokeStyle = 'rgba(70,45,25,0.5)'; c.lineWidth = w + 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = wood; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    // the back legs and the strut behind the canvas
    stick(-27, -66, -21, -34, 5); stick(27, -66, 21, -34, 5);
    stick(-22, -34, 22, -34, 4.4);
    // the long rails, top bar to the ground
    stick(-29, -104, -33, -2, 5.4); stick(29, -104, 33, -2, 5.4);
    // the canvas, hung from the top bar, down the back and out over the seat
    const sling = new Path2D();
    sling.moveTo(-25, -105); sling.lineTo(25, -105); sling.quadraticCurveTo(23, -72, 24, -48); sling.quadraticCurveTo(25, -33, 29, -22);
    sling.quadraticCurveTo(0, -16, -29, -22); sling.quadraticCurveTo(-25, -33, -24, -48); sling.quadraticCurveTo(-23, -72, -25, -105); sling.closePath();
    c.save(); c.clip(sling);
    const n = 9, sw = 58 / n, cols = u.stripes;
    for (let i = 0; i < n; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(-29 + i * sw, -108, sw + 0.4, 96); }
    // light down the back, the fold of the seat, and the sag across it
    c.fillStyle = lin(c, 0, -105, 0, -18, [[0, 'rgba(255,255,255,0.16)'], [0.46, 'rgba(255,255,255,0)'], [0.66, 'rgba(50,30,20,0.3)'], [0.78, 'rgba(50,30,20,0.06)'], [1, 'rgba(255,255,255,0.14)']]); c.fillRect(-32, -108, 64, 96);
    c.fillStyle = lin(c, -29, 0, 29, 0, [[0, 'rgba(50,30,20,0.2)'], [0.2, 'rgba(50,30,20,0)'], [0.8, 'rgba(50,30,20,0)'], [1, 'rgba(50,30,20,0.2)']]); c.fillRect(-32, -108, 64, 96);
    c.restore();
    c.strokeStyle = 'rgba(70,45,25,0.3)'; c.lineWidth = 0.9; c.stroke(sling);
    // the two bars the canvas is nailed round, with their brass pins
    stick(-31, -103, 31, -103, 6); stick(-30, -21, 30, -21, 5.4);
    for (const [x, y] of [[-29, -103], [29, -103], [-29, -21], [29, -21]]) { dot(c, x, y, 1.7, '#7d6030'); dot(c, x - 0.4, y - 0.4, 0.9, '#f6e19a'); }
    c.restore();
  }
  // warm quarry tiles laid in rows, closing up towards the back
  function quarryTiles(c, q, x0, x1, y0, y1) {
    const at = (x, y) => 180 + (x - 180) * U.lerp(0.8, 1, (y - y0) / (y1 - y0));
    c.fillStyle = '#efdcc6'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = y0, row = 0; y < y1; row++) {
      const h = 27 + row * 3.4, b = Math.min(y + h, y1);
      for (let i = -14; i < 15; i++) {
        const xa = 180 + (i + (row % 2) * 0.5) * 42;
        c.fillStyle = U.shade(U.pick(q, ['#d9987f', '#d28e76', '#dea28a', '#cf8a72']), (q() - 0.5) * 0.08);
        c.beginPath(); outline(c, [[at(xa + 1, y + 1), y + 1], [at(xa + 41, y + 1), y + 1], [at(xa + 41, b - 1), b - 1], [at(xa + 1, b - 1), b - 1]]); c.fill();
        c.fillStyle = 'rgba(255,240,225,0.22)'; c.fillRect(at(xa + 3, y + 2), y + 2, at(xa + 39, y + 2) - at(xa + 3, y + 2), 1.4);
      }
      y += h;
    }
  }
  // a parasol standing on its weight, seen from the side
  function parasolSide(c, x, y, h, s) {
    c.fillStyle = 'rgba(70,40,30,0.24)'; c.beginPath(); c.ellipse(x + 6, y + 2, 20, 5, 0, 0, TAU); c.fill();
    c.fillStyle = '#8d969c'; c.beginPath(); c.ellipse(x, y, 13, 4.4, 0, 0, TAU); c.fill();
    c.fillStyle = lin(c, x - 2, 0, x + 2, 0, [[0, '#e8dcc6'], [1, '#b09e84']]); c.fillRect(x - 2, y - h, 4, h);
    const n = 7, top = y - h - s * 0.46, rim = (t) => [x + t * s, y - h + (1 - t * t) * 7];
    for (let k = 0; k < n; k++) {
      const [ax, ay] = rim(-1 + (k * 2) / n), [bx, by] = rim(-1 + ((k + 1) * 2) / n);
      c.fillStyle = k % 2 ? CREAM : CORAL;
      c.beginPath(); c.moveTo(x, top); c.quadraticCurveTo(ax + (ax - x) * 0.12, top + s * 0.12, ax, ay);
      c.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - 5, bx, by); c.quadraticCurveTo(bx + (bx - x) * 0.12, top + s * 0.12, x, top); c.closePath(); c.fill();
    }
    dot(c, x, top, 2.6, BRASS);
  }
  function deckChairs(S) {
    const { r, nz, opts, bleed } = S;
    const EDGE = 478, WALL = 170;      // the pool's edge, and the foot of the wall at the back
    const units = [], region = new Path2D();
    // two rows along the water, every chair in the next canvas round
    const first = (r() * CANVAS.length) | 0;
    for (const [y, w, h, xs] of [[208, 62, 100, [52, 136, 224, 308]], [338, 70, 114, [50, 134, 226, 310]]]) for (const cx of xs) {
      const u = { shape: 'rect', x: cx - w / 2, y, w, h, cx, cy: y + h / 2, stripes: CANVAS[(first + units.length * 5) % CANVAS.length], lean: (cx - 180) * -0.00024, seed: (r() * 1e9) | 0 };
      units.push(u); region.rect(u.x, u.y, u.w, u.h);
    }
    return {
      family: 'arrange', particle: 'dust', region, depth: false,
      unitKind: 'build', unitParticle: 'dust', unitThreshold: 0.4, unitDur: 0.42,
      units: opts.dirt ? [] : units, drawUnit: drawDeckChair,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1714);
        // the morning sky over the wall at the back of the terrace
        c.fillStyle = lin(c, 0, y0, 0, 110, [[0, '#8fd2ec'], [1, '#e4f2ee']]); c.fillRect(x0, y0, x1 - x0, 120 - y0);
        puff(c, 92, 44, 15); puff(c, 268, 30, 10, 0.7);
        palm(c, q, 40, 100, 86, -10); palm(c, q, 310, 100, 96, 12);
        // the wall itself: cream, with speed lines and its name in raised letters
        c.fillStyle = lin(c, 0, 92, 0, WALL, [[0, '#f8f0e0'], [1, '#ebdfc8']]); c.fillRect(x0, 92, x1 - x0, WALL - 92);
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(x0, 92, x1 - x0, 1.8);
        for (const y of [100, 108]) { c.fillStyle = CORAL; c.fillRect(x0, y, x1 - x0, 2.6); }
        c.fillStyle = 'rgba(120,95,60,0.4)'; c.font = `700 19px ${DECO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        const name = 'SUN  TERRACE';
        c.fillText(name, 181, 138.5); c.fillStyle = CORAL_DK; c.fillText(name, 180, 137);
        for (const x of [78, 282]) { dot(c, x, 138, 13, BRASS); dot(c, x, 138, 10.8, '#35607d'); c.fillStyle = 'rgba(190,232,242,0.55)'; c.beginPath(); c.moveTo(x - 6, 144); c.lineTo(x + 3, 129); c.lineTo(x + 7, 132); c.lineTo(x - 2, 147); c.closePath(); c.fill(); }
        c.fillStyle = 'rgba(60,45,35,0.2)'; c.fillRect(x0, WALL - 8, x1 - x0, 8);
        // the terrace, the shade at the foot of the wall, the edge of the pool
        quarryTiles(c, q, x0, x1, WALL, EDGE + 2);
        c.fillStyle = lin(c, 0, WALL, 0, WALL + 22, [[0, 'rgba(70,40,30,0.3)'], [1, 'rgba(70,40,30,0)']]); c.fillRect(x0, WALL, x1 - x0, 22);
        poolEdge(c, q, x0, EDGE, x1, y1);
        // a rope of floats across the water, and spare chairs folded against the wall
        const ry = 556;
        c.strokeStyle = 'rgba(40,60,70,0.4)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x0, ry); c.lineTo(x1, ry); c.stroke();
        for (let x = Math.floor(x0 / 16) * 16; x < x1; x += 16) { c.fillStyle = Math.floor(x / 16) % 2 ? CREAM : CORAL; c.beginPath(); c.ellipse(x + 8, ry, 6.4, 4.6, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(x + 7, ry - 1.6, 3, 1.2, 0, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(70,55,40,0.2)'; c.beginPath(); c.ellipse(334, 186, 26, 6, 0, 0, TAU); c.fill();
        for (const [x, a, col] of [[328, -0.08, CORAL], [340, 0.04, LANE]]) {
          c.save(); c.translate(x, 184); c.rotate(a);
          c.fillStyle = '#b98a4e'; c.fillRect(-9, -66, 18, 66);
          for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? CREAM : col; c.fillRect(-7 + k * 2.8, -62, 2.9, 58); }
          c.fillStyle = '#deb477'; c.fillRect(-10, -66, 20, 4.4); c.fillRect(-10, -6, 20, 4.4);
          c.restore();
        }
        // a parasol in the far corner, and a towel left by the edge
        parasolSide(c, 34, 196, 88, 42);
        towel(c, 180, 465, 74, 15, 0, [CORAL, CREAM, WATER]);
      },
      clean(c) { if (opts.dirt) for (const u of units) drawDeckChair(c, u, 1); },
      dirt(c) {
        // chalk marks where everything goes
        c.lineCap = 'round';
        for (const u of units) {
          c.fillStyle = 'rgba(255,255,255,0.09)'; c.beginPath(); c.ellipse(u.cx + (r() - 0.5) * 12, u.cy + (r() - 0.5) * 16, u.w * 0.42, u.h * 0.3, r() * 3, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = 2.3; c.setLineDash([7, 6]);
          c.beginPath(); c.roundRect(u.x + 3.5, u.y + 3.5, u.w - 7, u.h - 7, 6); c.stroke(); c.setLineDash([]);
          const sx = 9, sy = 9;
          c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.8)';
          c.beginPath(); c.moveTo(u.cx - sx, u.cy - sy); c.lineTo(u.cx + sx, u.cy + sy); c.moveTo(u.cx + sx, u.cy - sy); c.lineTo(u.cx - sx, u.cy + sy); c.stroke();
        }
      },
    };
  }

  // --------------------------------------------- THE LIDO: THE TILED FOUNTAIN
  // The fountain on the poolside, from a little above: an eight-sided basin in
  // pale blue tiles and a stepped tower in the middle, with water falling from
  // tray to tray. A green skin covers the water; under it are the tiled floor,
  // a sun laid in coral, wished-on coins and a rubber duck going slowly round.
  // Works with the seasons' leaves and snow like the pond.
  // pond { what: 'fountain', where: 'lido' }
  function lidoFountain(S) {
    const { r, nz, bleed, opts } = S;
    const cx = 180, cy = 342;
    const K = Math.cos(Math.PI / 8);
    // eight corners, flats to the front and the back
    const oct = (y, rx, ry) => Array.from({ length: 8 }, (_, k) => { const a = Math.PI / 8 + (k * Math.PI) / 4; return [cx + (Math.cos(a) * rx) / K, y + (Math.sin(a) * ry) / K]; });
    const RIM = oct(cy, 170, 138), INNER = oct(cy, 150, 118), POOL = oct(cy + 8, 144, 106);
    const FACE = 30;
    const TIERS = [
      { w: 68, y0: 366, y1: 312, ry: 22 },
      { w: 44, y0: 310, y1: 248, ry: 14 },
      { w: 24, y0: 246, y1: 190, ry: 8 },
    ];
    const region = new Path2D();
    outline(region, POOL);
    // the tower stands in the water, so that part of the board is not skimmed
    const TOPY = cy + 8 - 106, T1 = TIERS[0], T2 = TIERS[1];
    outline(region, [[cx - T2.w, TOPY], [cx + T2.w, TOPY], [cx + T2.w, T1.y1 + 4], [cx + T1.w, T1.y1 + 6], [cx + T1.w, T1.y0 - 6], [cx + T1.w * 0.42, T1.y0 + 6], [cx - T1.w * 0.42, T1.y0 + 6], [cx - T1.w, T1.y0 - 6], [cx - T1.w, T1.y1 + 6], [cx - T2.w, T1.y1 + 4]]);
    const STREAMS = [-58, -30, 30, 58].map((dx, i) => ({ x: cx + dx, y0: T1.y1 + 8 + (58 - Math.abs(dx)) * 0.2, x1: cx + dx * 1.24, y1: T1.y0 + 6 - Math.abs(dx) * 0.14, ph: i * 0.37 }));
    const coins = [];
    for (let i = 0; i < 30 && coins.length < 13; i++) {
      const a = r() * TAU, d = 0.5 + r() * 0.42, x = cx + Math.cos(a) * 138 * d, y = cy + 8 + Math.sin(a) * 100 * d;
      if (Math.abs(x - cx) < 78 && y < T1.y0 + 14) continue;
      coins.push({ x, y, s: 3.6 + r() * 2.2, kind: U.pick(r, ['copper', 'copper', 'silver', 'gold']), a: r() * 3 });
    }
    const winter = opts.dirt === 'snow', autumn = opts.dirt === 'leaves';

    function surround(c) {
      const { x0, y0, x1, y1 } = bleed, q = U.rng(1703);
      // beyond the terrace: a low cream wall, sky, palms over it
      c.fillStyle = lin(c, 0, y0, 0, 110, [[0, '#8fd2ec'], [1, '#e2f1ee']]); c.fillRect(x0, y0, x1 - x0, 124 - y0);
      puff(c, 262, 44, 14); puff(c, 104, 26, 9, 0.7);
      palm(c, q, 58, 112, 96, -12); palm(c, q, 300, 112, 84, 10);
      c.fillStyle = lin(c, 0, 92, 0, 130, [[0, '#f8f0e0'], [1, '#e8dcc4']]); c.fillRect(x0, 92, x1 - x0, 38);
      c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(x0, 92, x1 - x0, 1.8);
      for (const y of [100, 107, 114]) { c.fillStyle = y === 107 ? WATER : CORAL; c.fillRect(x0, y, x1 - x0, 2.4); }
      terrazzo(c, nz, x0, 128, x1, y1, 1703);
      c.fillStyle = lin(c, 0, 128, 0, 150, [[0, 'rgba(70,55,40,0.28)'], [1, 'rgba(70,55,40,0)']]); c.fillRect(x0, 128, x1 - x0, 22);
      // potted palms at the two far corners
      for (const [x, y, h, s] of [[30, 200, 64, 1], [332, 196, 70, -1]]) pottedPalm(c, q, x, y, h, s);
    }
    function pottedPalm(c, q, x, y, h, s) {
      c.fillStyle = 'rgba(60,50,40,0.25)'; c.beginPath(); c.ellipse(x + 4, y + 2, 22, 6, 0, 0, TAU); c.fill();
      palm(c, q, x, y - 26, h, 6 * s);
      c.fillStyle = lin(c, x - 18, 0, x + 18, 0, [[0, '#ef8069'], [1, CORAL_DK]]); c.beginPath(); c.moveTo(x - 18, y - 30); c.lineTo(x + 18, y - 30); c.lineTo(x + 13, y); c.lineTo(x - 13, y); c.closePath(); c.fill();
      c.fillStyle = CREAM; c.fillRect(x - 19, y - 32, 38, 5);
    }
    function basin(c) {
      const q = U.rng(17031);
      const rimPath = new Path2D(); outline(rimPath, RIM);
      softShadow(c, rimPath, 14, 0.36, 0, FACE + 6);
      // the outer faces round the front, tiled, with a coral band and a cream kerb
      for (let k = 0; k < 4; k++) {
        const a = RIM[(k + 7) % 8], b = RIM[k];
        const dark = k === 0 ? 0.04 : k === 3 ? 0.26 : k === 1 ? 0.02 : 0.1;
        const pt = (u, v) => [U.lerp(a[0], b[0], u), U.lerp(a[1], b[1], u) + v * FACE];
        if (b[1] < cy - 20) continue;
        const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 16));
        for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) {
          c.fillStyle = U.mix(j === 0 ? (i % 2 ? CORAL : CREAM) : U.shade(AQUA, (q() - 0.5) * 0.14), SHADE, dark);
          c.beginPath(); outline(c, [pt(i / n, j / 3), pt((i + 1) / n, j / 3), pt((i + 1) / n, (j + 1) / 3), pt(i / n, (j + 1) / 3)]); c.fill();
          c.strokeStyle = 'rgba(235,245,243,0.8)'; c.lineWidth = 1; c.stroke();
        }
      }
      // the far walls inside, in shade, above the water
      c.fillStyle = lin(c, 0, cy - 118, 0, cy + 8, [[0, '#6da6bb'], [0.3, '#82bccb'], [1, '#93cdd8']]); c.beginPath(); outline(c, INNER); c.fill();
      // the rim: wide cream stones, a joint at every corner and between
      const top = new Path2D(); outline(top, RIM); outline(top, INNER);
      c.fillStyle = lin(c, 0, cy - 138, 0, cy + 138, [[0, '#f8f1e1'], [1, '#ecdfc7']]); c.fill(top, 'evenodd');
      c.strokeStyle = 'rgba(120,98,70,0.42)'; c.lineWidth = 1.2; c.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = RIM[k], b = INNER[k], a2 = RIM[(k + 1) % 8], b2 = INNER[(k + 1) % 8];
        c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
        c.moveTo((a[0] + a2[0]) / 2, (a[1] + a2[1]) / 2); c.lineTo((b[0] + b2[0]) / 2, (b[1] + b2[1]) / 2);
      }
      c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.4; c.beginPath(); outline(c, RIM); c.stroke();
      c.strokeStyle = 'rgba(50,70,80,0.35)'; c.lineWidth = 1.5; c.beginPath(); outline(c, INNER); c.stroke();
      c.strokeStyle = CORAL; c.lineWidth = 2.2; c.beginPath(); outline(c, oct(cy, 160, 128)); c.stroke();
    }
    function floor(c) {
      // pale tiles seen through the water, a little foreshortened
      const fy = cy + 8, g = c.createRadialGradient(cx, fy + 10, 30, cx, fy, 170);
      g.addColorStop(0, '#a4e0e8'); g.addColorStop(0.7, '#86d0dc'); g.addColorStop(1, '#68bccd');
      c.fillStyle = g; c.fillRect(0, 190, W, 320);
      c.strokeStyle = 'rgba(240,250,250,0.42)'; c.lineWidth = 1.2; c.beginPath();
      for (let x = 0; x <= W; x += 24) { c.moveTo(x, 200); c.lineTo(x, 500); }
      for (let y = 216; y < 500; y += 18) { c.moveTo(0, y); c.lineTo(W, y); }
      c.stroke();
      // a sun laid into the floor round the foot of the tower: a cream ring, coral rays
      const sun = (a, d) => [cx + Math.cos(a) * 118 * d, fy + 8 + Math.sin(a) * 88 * d];
      c.fillStyle = CREAM; c.beginPath(); c.ellipse(cx, fy + 8, 96, 71, 0, 0, TAU); c.ellipse(cx, fy + 8, 76, 56, 0, 0, TAU); c.fill('evenodd');
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * TAU, w = TAU / 60;
        c.fillStyle = k % 2 ? '#f09a80' : CORAL;
        c.beginPath(); outline(c, [sun(a - w, 0.82), sun(a, k % 2 ? 1 : 1.12), sun(a + w, 0.82)]); c.fill();
      }
      c.strokeStyle = CORAL; c.lineWidth = 1.6; c.beginPath(); c.ellipse(cx, fy + 8, 76, 56, 0, 0, TAU); c.stroke();
      for (const k of coins) coin(c, k);
      // light dancing on the bottom
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) { const x = 40 + r() * 280, y = 244 + r() * 210; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 11, y - 6, x + 20, y + 6, x + 31, y); c.stroke(); }
      // the far wall's shade on the water, and the tower's
      c.fillStyle = lin(c, 0, TOPY, 0, TOPY + 42, [[0, 'rgba(20,70,90,0.42)'], [1, 'rgba(20,70,90,0)']]); c.fillRect(0, TOPY, W, 42);
    }
    function coin(c, k) {
      const col = { copper: ['#e3a174', '#b8673f', '#7d4426'], silver: ['#f2f4f4', '#b8c0c4', '#7d868c'], gold: ['#fff1b0', '#e9bf4f', '#9a7428'] }[k.kind];
      c.save(); c.translate(k.x, k.y); c.rotate(k.a); c.scale(1, 0.6);
      const g = c.createRadialGradient(-k.s * 0.3, -k.s * 0.3, 0.5, 0, 0, k.s);
      g.addColorStop(0, col[0]); g.addColorStop(0.6, col[1]); g.addColorStop(1, col[2]);
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, k.s, 0, TAU); c.fill();
      c.restore();
    }
    // the little yellow duck, going round the tower on the current
    function duck(c, t) {
      const a = t * 0.13 + 2.2, x = cx + Math.cos(a) * 112, y = cy + 26 + Math.sin(a) * 72, bob = Math.sin(t * 2.2) * 1.2, dir = -Math.sin(a) >= 0 ? 1 : -1;
      c.save(); c.translate(x, y + bob); c.scale(dir, 1);
      c.fillStyle = 'rgba(0,50,70,0.2)'; c.beginPath(); c.ellipse(1, 8, 13, 4, 0, 0, TAU); c.fill();
      c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-13, 9, 0, 9); c.quadraticCurveTo(13, 9, 11, -1); c.quadraticCurveTo(0, 3, -12, 0); c.fill();
      dot(c, 7, -6, 6.4, '#f7d04a');
      c.fillStyle = '#e8674f'; c.beginPath(); c.moveTo(12, -7); c.lineTo(18, -5); c.lineTo(12, -3.4); c.closePath(); c.fill();
      dot(c, 8.6, -7.6, 1, '#2b2a33');
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(-3, 3, 5, 2, 0.1, 0, TAU); c.fill();
      c.restore();
    }
    // one tier of the tower: three tiled faces and a tray of water on top
    function tier(c, t, n) {
      const { w, y0, y1, ry } = t, m = w * 0.42, q = U.rng(n * 31 + 9);
      const face = (a, b, ya, yb, dark) => {
        const cols = Math.max(1, Math.round((b - a) / 10)), rows = Math.round((y0 - y1) / 12), tw = (b - a) / cols, th = (y0 - y1) / rows;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const x = a + i * tw, top = (u) => U.lerp(ya, yb, u) + (j * (y0 - y1)) / rows, u0 = i / cols, u1 = (i + 1) / cols;
          c.fillStyle = U.mix(j === 0 ? (i % 2 ? CREAM : CORAL) : U.shade(AQUA, (q() - 0.5) * 0.14), SHADE, dark);
          c.beginPath(); c.moveTo(x, top(u0)); c.lineTo(x + tw, top(u1)); c.lineTo(x + tw, top(u1) + th); c.lineTo(x, top(u0) + th); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(235,245,243,0.75)'; c.lineWidth = 0.9; c.stroke();
        }
      };
      const f = ry * 0.6;
      face(cx - w, cx - m, y1, y1 + f, 0.1); face(cx - m, cx + m, y1 + f, y1 + f, 0); face(cx + m, cx + w, y1 + f, y1, 0.3);
      // the tray, a cream lip round a little water
      const tray = (dx, dy) => [[cx - dx, y1], [cx - dx * 0.42, y1 - dy], [cx + dx * 0.42, y1 - dy], [cx + dx, y1], [cx + dx * 0.42, y1 + dy], [cx - dx * 0.42, y1 + dy]];
      c.fillStyle = CREAM; c.beginPath(); outline(c, tray(w + 3, ry * 0.76)); c.fill();
      c.fillStyle = 'rgba(120,98,70,0.5)'; c.fillRect(cx - m - 1, y1 + ry * 0.76 - 0.5, 2 * m + 2, 2);
      c.fillStyle = lin(c, 0, y1 - ry * 0.5, 0, y1 + ry * 0.5, [[0, '#5fa9bc'], [1, '#a4e0e8']]); c.beginPath(); outline(c, tray(w - 4, ry * 0.5)); c.fill();
    }
    function tower(c) {
      TIERS.forEach(tier.bind(null, c));
      const T3 = TIERS[2], y = T3.y1 - 4;
      // a stepped cream cap and a small coral sun on top of it
      c.fillStyle = lin(c, cx - 14, 0, cx + 14, 0, [[0, '#d9cbb0'], [0.4, '#faf3e4'], [1, '#c8b99c']]);
      c.fillRect(cx - 12, y - 14, 24, 14); c.fillRect(cx - 8, y - 26, 16, 12); c.fillRect(cx - 4.5, y - 36, 9, 10);
      c.fillStyle = 'rgba(70,55,40,0.25)'; c.fillRect(cx - 12, y - 14, 24, 1.4); c.fillRect(cx - 8, y - 26, 16, 1.4);
      for (let k = 0; k < 5; k++) { const a = Math.PI + ((k + 0.5) / 5) * Math.PI; c.strokeStyle = CORAL; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + Math.cos(a) * 10, y - 38 + Math.sin(a) * 10); c.lineTo(cx + Math.cos(a) * 17, y - 38 + Math.sin(a) * 17); c.stroke(); }
      c.fillStyle = CORAL; c.beginPath(); c.arc(cx, y - 37, 7, Math.PI, TAU); c.closePath(); c.fill();
      if (winter) {
        c.fillStyle = '#f6f9fc';
        for (const t of TIERS) { c.beginPath(); c.ellipse(cx, t.y1, t.w, t.ry * 0.7, 0, 0, TAU); c.fill(); }
        c.beginPath(); c.ellipse(cx, y - 38, 12, 5, 0, Math.PI, TAU); c.fill();
      }
      if (autumn) {
        for (const [x, yy, a, col] of [[cx - 34, T1.y1 - 2, 0.6, '#d9822b'], [cx + 28, T1.y1 + 4, -0.4, '#c4462f'], [cx + 10, T2.y1 + 1, 1.2, '#e9b23c']]) {
          c.save(); c.translate(x, yy); c.rotate(a); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, TAU); c.fill(); c.restore();
        }
      }
    }

    return {
      family: 'skim', particle: 'water', region, depth: true,
      tough: (x, y) => (nz.n2(x * 0.03, y * 0.03) > 0.7 ? 1.5 : 1),
      decor(c) {
        surround(c); basin(c);
        // two more palms, nearer than the basin, and a towel by the steps
        const q = U.rng(1733);
        pottedPalm(c, q, 26, 586, 60, 1); pottedPalm(c, q, 336, 590, 54, -1);
        towel(c, 178, 548, 82, 24, -0.04, [WATER, CREAM, CORAL]);
      },
      clean(c) { floor(c); },
      live(c, t) {
        // rings spreading where the water falls in
        for (const s of STREAMS) {
          for (const off of [0, 0.5]) {
            const k = (t * 0.7 + s.ph + off) % 1, rad = 4 + k * 18;
            c.strokeStyle = `rgba(255,255,255,${(0.42 * (1 - k)).toFixed(3)})`; c.lineWidth = 1.2;
            c.beginPath(); c.ellipse(s.x1, s.y1, rad, rad * 0.42, 0, 0, TAU); c.stroke();
          }
        }
        duck(c, t);
        c.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 6; i++) { const gx = 60 + ((i * 53 + t * 9) % 240), gy = 260 + ((i * 67) % 180); c.beginPath(); c.ellipse(gx, gy, 9, 1.4, 0, 0, TAU); c.fill(); }
      },
      dirt(c) {
        // a green skin of algae, darker in the corners, with dead leaves and old foam
        const g = ramp(['#4c6a24', '#5d7d2c', '#728f35', '#8aa244', '#9fae55']);
        field(c, 26, 232, 334, 462, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 5)), 238]);
        for (let i = 0; i < 1500; i++) { c.fillStyle = U.pick(r, ['#7cbf45', '#8fd04f', '#6aa83c', '#a3d65f']); c.beginPath(); c.arc(36 + r() * 288, 240 + r() * 216, 1.3 + r() * 1.5, 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(60,90,30,0.6)'; c.lineWidth = 1.2;
        for (let i = 0; i < 36; i++) { let x = 40 + r() * 280, y = 246 + r() * 204; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 26; y += (r() - 0.5) * 20; c.lineTo(x, y); } c.stroke(); }
        for (let i = 0; i < 9; i++) {
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#c9a24a']);
          c.save(); c.translate(44 + r() * 272, 250 + r() * 196); c.rotate(r() * 6.28); c.beginPath(); c.ellipse(0, 0, 8, 4, 0, 0, TAU); c.fill(); c.restore();
        }
        for (let i = 0; i < 26; i++) { c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.arc(36 + r() * 288, 246 + r() * 204, 1.5 + r() * 3, 0, TAU); c.stroke(); }
      },
      top(c) { tower(c); },
      liveTop(c, t) {
        c.save(); c.lineCap = 'round';
        const head = TIERS[2].y1 - 42;
        // a plume from the top, falling either side into the first tray
        for (const side of [-1, 1]) {
          const h = 18 + Math.sin(t * 4 + side) * 2, path = new Path2D();
          path.moveTo(cx, head); path.bezierCurveTo(cx + side * 6, head - h, cx + side * 20, head - h * 0.5, cx + side * 21, TIERS[2].y1 - 2);
          c.strokeStyle = 'rgba(200,232,240,0.6)'; c.lineWidth = 2; c.stroke(path);
          c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.1; c.setLineDash([3, 8]); c.lineDashOffset = -t * 34; c.stroke(path); c.setLineDash([]);
        }
        // thin curtains spilling from tray to tray, then into the basin
        const spill = (x0, y0, x1, y1, ph) => {
          const path = new Path2D(); path.moveTo(x0, y0); path.quadraticCurveTo(x1, y0 + 4, x1, y1);
          c.strokeStyle = 'rgba(200,232,240,0.5)'; c.lineWidth = 2.2; c.stroke(path);
          c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1; c.setLineDash([3, 9]); c.lineDashOffset = -t * 40 - ph * 12; c.stroke(path); c.setLineDash([]);
        };
        for (const dx of [-1, 1]) {
          spill(cx + dx * 22, TIERS[2].y1 + 3, cx + dx * 27, TIERS[1].y1 - 2, 1);
          spill(cx + dx * 11, TIERS[2].y1 + 6, cx + dx * 13, TIERS[1].y1 + 4, 2);
          spill(cx + dx * 41, TIERS[1].y1 + 4, cx + dx * 50, TIERS[0].y1 - 2, 3);
          spill(cx + dx * 20, TIERS[1].y1 + 8, cx + dx * 24, TIERS[0].y1 + 6, 4);
        }
        for (const s of STREAMS) {
          spill(s.x, s.y0, s.x1, s.y1, s.ph);
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(s.x1, s.y1, 3.4 + Math.sin(t * 9 + s.ph * 10), 1.4, 0, 0, TAU); c.fill();
        }
        c.restore();
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'stones', test: (o) => o.shape === 'pool', make: poolTiles },
    { kind: 'hut', test: (o) => o.what === 'lido', make: changingHuts },
    { kind: 'fence', test: (o) => o.what === 'turnstile', make: turnstileGate },
    { kind: 'counter', test: (o) => o.what === 'kiosk', make: kioskCounter },
    { kind: 'serve', test: (o) => o.what === 'deckchairs', make: deckChairs },
  );
  // scenes13.js has a variant for every fountain, so this one has to be found first
  SCENES.VARIANTS.unshift({ kind: 'pond', test: (o) => o.what === 'fountain' && o.where === 'lido', make: lidoFountain });
})();
