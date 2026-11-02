'use strict';
// A thinking job for Marigold Café: putting the clean cups away. The cup
// shelf has three shelves and three places on each. A little chalkboard at
// the left end of a shelf shows which kind of cup lives there, and a painted
// tile at the top of each column shows its glaze, with a coaster of the same
// glaze at every place. Each cup on the drying tray has exactly one home:
// where its shelf and its column meet.

(() => {
  const W = 360;
  const R = 30;                            // a cup is held by a 60-unit circle
  const COLS = [124, 206, 288];            // the three places along a shelf
  const FLOOR = [170, 266, 362];           // where a cup stands on each shelf
  const TRAY_X = [68, 180, 292], TRAY_Y = [432, 496, 560];
  const UP = 24;                           // a cup's middle sits this far above its foot

  // soft glazes, each with its own little pattern so colour is never the only clue
  const GLAZES = [
    { id: 'sky', col: '#8fbfe6', deep: '#4c80b6', pat: 'dots' },
    { id: 'mint', col: '#a5d7ba', deep: '#4c9470', pat: 'stripes' },
    { id: 'rose', col: '#efb4ae', deep: '#c4625a', pat: 'heart' },
    { id: 'butter', col: '#f2d88a', deep: '#bb8e2a', pat: 'star' },
    { id: 'lavender', col: '#bba9df', deep: '#7660b0', pat: 'band' },
  ];
  // a plain chalk version for the shelf labels
  const CHALK = { col: '#f6efe3', deep: '#f6efe3', pat: null, chalk: true };

  // the cup shapes, seen from the front, standing with their foot at 0, 0
  const p2 = (f) => { const p = new Path2D(); f(p); return p; };
  const KINDS = {
    tea: {
      saucer: [27, 4.6], rim: [-26, 22, 4], box: [-22, -26, 22, -3],
      body: p2((p) => { p.moveTo(-22, -26); p.bezierCurveTo(-22, -12, -16, -4, -9, -3); p.lineTo(9, -3); p.bezierCurveTo(16, -4, 22, -12, 22, -26); p.closePath(); }),
      handle: p2((p) => { p.moveTo(19, -21); p.bezierCurveTo(33, -24, 31, -8, 14, -8); }), hw: 4.5,
    },
    mug: {
      rim: [-40, 17, 3.6], box: [-17, -40, 17, 0],
      body: p2((p) => p.roundRect(-17, -40, 34, 40, [2, 2, 6, 6])),
      handle: p2((p) => { p.moveTo(16, -32); p.bezierCurveTo(32, -32, 32, -10, 16, -10); }), hw: 5.5,
    },
    espresso: {
      saucer: [19, 3.6], rim: [-24, 11, 2.6], box: [-11, -24, 11, -3],
      body: p2((p) => { p.moveTo(-11, -24); p.lineTo(-11, -9); p.quadraticCurveTo(-11, -3, -5, -3); p.lineTo(5, -3); p.quadraticCurveTo(11, -3, 11, -9); p.lineTo(11, -24); p.closePath(); }),
      handle: p2((p) => { p.moveTo(10, -20); p.bezierCurveTo(19, -21, 19, -11, 10, -11); }), hw: 3.5,
    },
    latte: {
      rim: [-54, 13, 3], box: [-13, -54, 13, 0], glass: true,
      body: p2((p) => { p.moveTo(-13, -54); p.lineTo(-11, -3); p.quadraticCurveTo(-11, 0, -8, 0); p.lineTo(8, 0); p.quadraticCurveTo(11, 0, 11, -3); p.lineTo(13, -54); p.closePath(); }),
    },
    cocoa: {
      rim: [-36, 20, 4], box: [-23, -36, 23, 0], mallow: true,
      body: p2((p) => { p.moveTo(-20, -36); p.bezierCurveTo(-25, -20, -22, -4, -13, 0); p.lineTo(13, 0); p.bezierCurveTo(22, -4, 25, -20, 20, -36); p.closePath(); }),
      handle: p2((p) => { p.moveTo(20, -30); p.bezierCurveTo(36, -30, 36, -8, 17, -8); }), hw: 6,
    },
  };
  const KIND_IDS = Object.keys(KINDS);

  function heart(p, x, y, s) {
    p.moveTo(x, y + s * 0.5);
    p.bezierCurveTo(x - s * 0.9, y - s * 0.05, x - s * 0.42, y - s * 0.72, x, y - s * 0.26);
    p.bezierCurveTo(x + s * 0.42, y - s * 0.72, x + s * 0.9, y - s * 0.05, x, y + s * 0.5);
    p.closePath();
  }
  function star(p, x, y, s) {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? s * 0.42 : s;
      if (i) p.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else p.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    p.closePath();
  }
  // a glaze's pattern filling a box (the caller clips it to the shape)
  function pattern(c, g, x0, y0, x1, y1, sym) {
    const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    c.fillStyle = g.deep;
    const p = new Path2D();
    if (g.pat === 'dots') {
      for (let y = y0 + 5, row = 0; y < y1; y += 7.5, row++) for (let x = x0 + (row % 2 ? 7 : 3); x < x1; x += 8) { p.moveTo(x + 1.9, y); p.arc(x, y, 1.9, 0, 7); }
    } else if (g.pat === 'stripes') {
      for (let y = y0 + 5; y < y1 - 1; y += 7.5) p.rect(x0, y, w, 2.8);
    } else if (g.pat === 'heart') heart(p, cx, cy + h * 0.06, sym || Math.min(w, h) * 0.5);
    else if (g.pat === 'star') star(p, cx, cy + h * 0.04, sym || Math.min(w, h) * 0.34);
    else if (g.pat === 'band') { const b = Math.max(4, h * 0.24); p.rect(x0, cy - b / 2, w, b); }
    c.fill(p);
  }

  // one cup, its foot at x, y; glaze CHALK draws the shelf label's picture
  function drawCup(c, kind, g, x, y, s = 1) {
    const k = KINDS[kind], chalk = g.chalk;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    const edge = chalk ? 'rgba(246,239,227,0.95)' : 'rgba(59,53,46,0.42)';
    if (k.saucer) {
      const [rx, ry] = k.saucer;
      c.fillStyle = chalk ? 'rgba(246,239,227,0.25)' : g.col;
      c.beginPath(); c.ellipse(0, -2, rx, ry, 0, 0, 7); c.fill();
      c.strokeStyle = edge; c.lineWidth = 1.2; c.stroke();
      if (!chalk) { c.fillStyle = 'rgba(255,250,241,0.45)'; c.beginPath(); c.ellipse(0, -3, rx * 0.72, ry * 0.55, 0, 0, 7); c.fill(); }
    }
    if (k.handle) {
      c.strokeStyle = edge; c.lineWidth = k.hw + 2.2; c.stroke(k.handle);
      c.strokeStyle = chalk ? '#59615f' : g.col; c.lineWidth = k.hw; c.stroke(k.handle);
    }
    const [bx0, by0, bx1, by1] = k.box;
    if (chalk) {
      c.fillStyle = 'rgba(246,239,227,0.14)'; c.fill(k.body);
    } else {
      c.globalAlpha = k.glass ? 0.82 : 1;
      c.fillStyle = g.col; c.fill(k.body);
      c.save(); c.clip(k.body);
      pattern(c, g, bx0, by0 + 4, bx1, by1 - (k.glass ? 7 : 0));
      // a soft shine down the left and a shade down the right
      c.fillStyle = 'rgba(255,255,255,0.32)'; c.fillRect(bx0 + (bx1 - bx0) * 0.14, by0, (bx1 - bx0) * 0.12, by1 - by0);
      c.fillStyle = 'rgba(70,50,30,0.12)'; c.fillRect(bx1 - (bx1 - bx0) * 0.2, by0, (bx1 - bx0) * 0.2, by1 - by0);
      if (k.glass) { c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(bx0, by1 - 7, bx1 - bx0, 7); }
      c.restore();
      c.globalAlpha = 1;
    }
    c.strokeStyle = edge; c.lineWidth = chalk ? 1.8 : 1.2; c.stroke(k.body);
    // the rim, with a glimpse of the inside
    const [ry0, rrx, rry] = k.rim;
    c.fillStyle = chalk ? '#59615f' : '#efe4d2'; c.beginPath(); c.ellipse(0, ry0, rrx, rry, 0, 0, 7); c.fill();
    c.strokeStyle = chalk ? edge : g.col; c.lineWidth = chalk ? 1.8 : 2; c.stroke();
    if (k.mallow) {
      // two marshmallows peeping over the rim of the cocoa mug
      for (const [mx, my, a, col] of [[-6, -39, -0.3, '#fffaf1'], [5, -40, 0.25, '#f7c6d4']]) {
        c.save(); c.translate(mx, my); c.rotate(a);
        c.fillStyle = chalk ? (col === '#fffaf1' ? '#f6efe3' : '#efb4ae') : col;
        c.beginPath(); c.roundRect(-5, -5, 10, 9, 3); c.fill();
        c.strokeStyle = chalk ? 'rgba(246,239,227,0.6)' : 'rgba(59,53,46,0.3)'; c.lineWidth = 1; c.stroke();
        c.restore();
      }
    }
    c.restore();
  }

  // a small seeded random of our own, so the painted wood is the same every time
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // a wooden board with a little grain
  function wood(c, r, x, y, w, h, col, grain = 'rgba(110,70,35,0.18)') {
    c.fillStyle = col; c.fillRect(x, y, w, h);
    c.strokeStyle = grain; c.lineWidth = 0.8;
    for (let i = 0; i < (w * h) / 260; i++) {
      const gx = x + r() * w, gy = y + 2 + r() * (h - 4), l = 10 + r() * 40;
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(Math.min(x + w, gx + l), gy + (r() - 0.5) * 0.8); c.stroke();
    }
  }

  function cups(S) {
    const r = S.r;
    const kinds = PZ.shuffle(r, KIND_IDS.slice()).slice(0, 3);       // shelf j holds kinds[j]
    const glazes = PZ.shuffle(r, GLAZES.slice()).slice(0, 3);        // column i is glazes[i]
    const places = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) places.push({ kind: kinds[j], g: glazes[i], x: COLS[i], y: FLOOR[j] - UP, cup: null });
    const spots = [];
    for (const y of TRAY_Y) for (const x of TRAY_X) spots.push([x, y]);
    PZ.shuffle(r, spots);
    const pieces = PZ.shuffle(r, places.slice()).map((home, n) => {
      const hx = spots[n][0] + (r() - 0.5) * 22, hy = spots[n][1] + (r() - 0.5) * 6;
      return { kind: home.kind, g: home.g, home, hx, hy, x: hx, y: hy, tx: hx, ty: hy, placed: false };
    });
    let held = null, gdx = 0, gdy = 0, hint = null, hintT = 0, fx = null;
    const order = pieces.slice();

    function settle(p, snap) {
      p.placed = true; p.home.cup = p; p.tx = p.home.x; p.ty = p.home.y;
      if (snap) { p.x = p.tx; p.y = p.ty; }
    }

    const sc = {
      puzzle: true, indoor: true, steps: pieces.length,
      crop: { x: 0, y: 34, w: 360, h: 360 },
      decor(c) {
        const { x0, y0, x1, y1 } = S.bleed, rr = rng(4127);
        // the café wall: warm plaster with a faint duck-egg stripe
        c.fillStyle = '#f3e7d4'; c.fillRect(x0, y0, x1 - x0, 390 - y0);
        c.fillStyle = 'rgba(166,211,212,0.22)';
        for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) c.fillRect(x, y0, 9, 390 - y0);
        PZ.text(c, 'Each cup goes where its shelf and colour meet', W / 2, 24, { size: 13, color: PZ.INK2, maxW: 340 });
        // the cupboard: a wooden frame, a cream back of planks and a crown on top
        c.fillStyle = 'rgba(60,40,20,0.16)'; PZ.rr(c, 17, 48, 334, 338, 8); c.fill();
        c.fillStyle = '#b98f5a'; PZ.rr(c, 14, 42, 332, 340, 8); c.fill();
        c.fillStyle = '#efe3cd'; c.fillRect(24, 98, 312, 274);
        c.fillStyle = 'rgba(150,110,65,0.16)'; for (let x = 24 + 52; x < 336; x += 52) c.fillRect(x, 98, 1.5, 274);
        wood(c, rr, 14, 42, 332, 54, '#c19a64');
        c.fillStyle = 'rgba(255,240,210,0.35)'; c.fillRect(14, 42, 332, 3);
        c.fillStyle = 'rgba(90,55,25,0.3)'; c.fillRect(24, 96, 312, 2);
        // the glaze tiles across the top, one for each column
        for (let i = 0; i < 3; i++) {
          const g = glazes[i], x = COLS[i], y = 69;
          PZ.shadow(c, x + 1, y + 3, 21, 21, 0.18);
          c.fillStyle = '#fffaf1'; c.beginPath(); c.arc(x, y, 21, 0, 7); c.fill();
          c.fillStyle = g.col; c.beginPath(); c.arc(x, y, 18, 0, 7); c.fill();
          c.save(); c.beginPath(); c.arc(x, y, 18, 0, 7); c.clip();
          pattern(c, g, x - 18, y - 18, x + 18, y + 18, g.pat === 'heart' ? 22 : 15);
          c.restore();
          // a small arrow down the column
          c.fillStyle = 'rgba(107,97,87,0.55)'; c.beginPath(); c.moveTo(x - 5, 91); c.lineTo(x + 5, 91); c.lineTo(x, 96); c.closePath(); c.fill();
        }
        // two carved coffee beans in the corner of the crown (not a heart: that is a glaze)
        for (const [bx, by, a] of [[42, 72, -0.5], [57, 66, 0.4]]) {
          c.save(); c.translate(bx, by); c.rotate(a);
          c.fillStyle = 'rgba(110,70,35,0.35)'; c.beginPath(); c.ellipse(0, 0, 6, 8.5, 0, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,240,210,0.45)'; c.lineWidth = 1.4;
          c.beginPath(); c.moveTo(0, -6.5); c.bezierCurveTo(-3, -2, 3, 2, 0, 6.5); c.stroke();
          c.restore();
        }
        for (let j = 0; j < 3; j++) {
          const F = FLOOR[j];
          // the shelf's shadow on the back, its top and its front edge
          c.fillStyle = 'rgba(90,60,30,0.14)'; c.fillRect(24, F + 16, 312, 7);
          wood(c, rr, 24, F - 7, 312, 13, '#d4ae7b');
          wood(c, rr, 20, F + 6, 320, 10, '#a77d4b', 'rgba(80,50,20,0.2)');
          c.fillStyle = 'rgba(255,240,210,0.4)'; c.fillRect(20, F + 6, 320, 1.2);
          // a chalkboard label standing at the left end: the kind of cup for this shelf
          const lx = 50, ly = F - 32;
          c.fillStyle = 'rgba(40,30,20,0.2)'; PZ.rr(c, lx - 25, ly - 25, 52, 52, 6); c.fill();
          c.fillStyle = '#9a7146'; PZ.rr(c, lx - 27, ly - 28, 54, 54, 6); c.fill();
          c.fillStyle = '#4f5a58'; PZ.rr(c, lx - 23, ly - 24, 46, 46, 4); c.fill();
          drawCup(c, kinds[j], CHALK, lx, ly + 18, kinds[j] === 'latte' ? 0.72 : 0.8);
          c.fillStyle = 'rgba(107,97,87,0.55)'; c.beginPath(); c.moveTo(80, ly - 5); c.lineTo(80, ly + 5); c.lineTo(85, ly); c.closePath(); c.fill();
          // a coaster at each place, in its column's glaze
          for (let i = 0; i < 3; i++) {
            const g = glazes[i], x = COLS[i];
            c.fillStyle = 'rgba(90,60,30,0.2)'; c.beginPath(); c.ellipse(x, F + 1.5, 29, 8, 0, 0, 7); c.fill();
            c.fillStyle = '#fffaf1'; c.beginPath(); c.ellipse(x, F, 29, 8, 0, 0, 7); c.fill();
            c.fillStyle = g.col; c.beginPath(); c.ellipse(x, F, 25.5, 6.5, 0, 0, 7); c.fill();
            c.save(); c.beginPath(); c.ellipse(x, F, 25.5, 6.5, 0, 0, 7); c.clip();
            c.save(); c.translate(x, F); c.scale(1, 0.55); pattern(c, g, -26, -12, 26, 12, g.pat === 'heart' ? 15 : 10); c.restore();
            c.restore();
          }
        }
        // the counter below, and the wooden drying tray
        c.fillStyle = '#e9dcc6'; c.fillRect(x0, 384, x1 - x0, 6);
        wood(c, rr, x0, 390, x1 - x0, y1 - 390, '#c9a372');
        c.fillStyle = 'rgba(60,40,20,0.18)'; c.fillRect(x0, 390, x1 - x0, 4);
        c.fillStyle = 'rgba(60,40,20,0.18)'; PZ.rr(c, 18, 406, 330, 184, 12); c.fill();
        c.fillStyle = '#b98f5a'; PZ.rr(c, 14, 402, 332, 186, 12); c.fill();
        c.fillStyle = '#d9b884'; PZ.rr(c, 22, 410, 316, 170, 8); c.fill();
        c.fillStyle = 'rgba(120,80,40,0.22)'; for (let y = 422; y < 578; y += 14) c.fillRect(24, y, 312, 3);
      },
      draw(c, t, still) {
        if (hint && hintT > 0 && !still && !hint.placed) { PZ.glow(c, hint.x, hint.y, R, t); PZ.glow(c, hint.home.x, hint.home.y, R, t); }
        order.sort((a, b) => a.y - b.y);
        for (const p of order) {
          if (p === held) continue;
          if (still && !p.placed) continue; // the pictures show the shelf only
          if (!p.placed) PZ.shadow(c, p.x, p.y + UP - 1, 24, 5, 0.2);
          drawCup(c, p.kind, p.g, p.x, p.y + UP);
        }
        if (held && !still) {
          PZ.shadow(c, held.x + 4, held.y + UP + 14, 22, 5, 0.13);
          drawCup(c, held.kind, held.g, held.x, held.y + UP, 1.1);
        }
      },
      step(dt) {
        hintT -= dt;
        for (const p of pieces) { p.x = PZ.approach(p.x, p.tx, dt); p.y = PZ.approach(p.y, p.ty, dt); }
      },
      down(x, y) {
        if (held) return;
        let best = null, bd = R + 6;
        for (const p of pieces) { const d = PZ.dist(p.x, p.y, x, y); if (!p.placed && d < bd) { best = p; bd = d; } }
        if (!best) return;
        held = best; gdx = best.x - x; gdy = best.y - y;
        best.tx = x + gdx; best.ty = y + gdy - PZ.LIFT;
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x + gdx; held.ty = y + gdy - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const p = held; held = null;
        const dx = x + gdx, dy = y + gdy - PZ.LIFT; // judged where it is drawn
        let at = null, bd = 40;
        for (const h of places) { const d = PZ.dist(h.x, h.y, dx, dy); if (!h.cup && d < bd) { at = h; bd = d; } }
        if (at && at === p.home) { settle(p); fx.sound('clink'); fx.good(at.x, at.y); return; }
        p.tx = p.hx; p.ty = p.hy; // not its place: it glides back to the tray
        fx.sound(dy > 392 ? 'drop' : 'nope'); // set down on the tray again is not a wrong move
      },
      cancel() { if (held) { held.tx = held.hx; held.ty = held.hy; held = null; } },
      progress: () => pieces.filter((p) => p.placed).length / pieces.length,
      solved: () => pieces.every((p) => p.placed),
      hint() { hint = pieces.find((p) => !p.placed && p !== held) || null; hintT = 3.5; },
      save: () => ({ placed: pieces.map((p) => p.placed) }),
      load(s) { if (s && s.placed) s.placed.forEach((v, i) => { if (v && pieces[i]) settle(pieces[i], true); }); },
      solveAll() { pieces.forEach((p) => settle(p, true)); },
      // finger positions: pick up at the cup, let go PZ.LIFT below its place
      debugPlan: () => pieces.filter((p) => !p.placed).map((p) => ({ drag: [p.hx, p.hy, p.home.x, p.home.y + PZ.LIFT] })),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { cups });
})();
