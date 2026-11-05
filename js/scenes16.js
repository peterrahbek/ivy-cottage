'use strict';
// Scenes for Owl Hill Observatory: the copper dome, the great lens, the brass
// telescope and the map room. Each is a variant of an older kind, built
// through SCENES.VARIANTS, with the same layers as every other scene (see
// scenes.js):
//   roof { what: 'dome' }          the copper dome close to, plates and rivets (scrub)
//   roundWindow { what: 'lens' }   the great lens in its brass ring (wash, indoors)
//   counter { what: 'telescope' }  the eyepiece end of the telescope on its mount (wipe, indoors)
//   attic { where: 'charts' }      the map room: plan chest, rolled charts, star chart, star globe (dust, indoors)

(() => {
  const { W, H, field, ramp, softShadow, grime } = SCENES;
  const TAU = Math.PI * 2, HALF = Math.PI / 2;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };
  const rad = (c, x0, y0, r0, x1, y1, r1, stops) => { const g = c.createRadialGradient(x0, y0, r0, x1, y1, r1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };
  // polished brass, lit from one side
  const BRASS = [[0, '#7a5a1e'], [0.14, '#c99a3a'], [0.32, '#f8e39b'], [0.48, '#e7c05a'], [0.76, '#b98a2f'], [1, '#6e4f1a']];

  // the star figures on the charts, as lines of points about their middles
  const PLOUGH = [[-1, 0.3], [-0.62, 0.02], [-0.34, -0.06], [0, -0.02], [0.06, 0.34], [0.52, 0.3], [0.54, -0.1], [0, -0.02]];
  const CASSIOPEIA = [[[-0.6, -0.2], [-0.3, 0.24], [0, 0], [0.3, 0.3], [0.6, -0.1]]];
  const CYGNUS = [[[0, -0.7], [0, 0], [0.1, 0.7]], [[-0.5, -0.2], [0, 0], [0.5, 0.2]]];
  const ORION = [[[-0.3, -0.7], [0.3, -0.6], [0.12, -0.04], [0.4, 0.7], [-0.4, 0.7], [-0.12, 0.04], [-0.3, -0.7]], [[-0.12, 0.04], [0, 0], [0.12, -0.04]]];
  const SCORPION = [[[0.6, -0.7], [0.4, -0.4], [0.2, -0.2], [0.1, 0.1], [0.1, 0.4], [0.2, 0.6], [-0.1, 0.75], [-0.4, 0.6], [-0.5, 0.4]]];
  const CROSS = [[[0, -0.6], [0, 0.6]], [[-0.4, -0.08], [0.4, -0.08]]];

  // ------------------------------------------------------------ shared bits
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * HALF; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 10; ring < len; ring += 10) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * HALF; c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
  }
  // a dust bunny: a soft grey tuft
  function bunny(c, r, x, y, s) {
    for (let k = 0; k < 9; k++) {
      const v = (150 + r() * 40) | 0;
      c.fillStyle = `rgba(${v},${v - 5},${v - 10},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.6, s * 0.4, 0, TAU); c.fill();
    }
  }
  // a smudge left by a finger: an oval with faint ridges
  function fingerprint(c, x, y, a, rgb = '60,45,30') {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = `rgba(${rgb},0.15)`; c.beginPath(); c.ellipse(0, 0, 6, 8.5, 0, 0, TAU); c.fill();
    c.strokeStyle = `rgba(${rgb},0.18)`; c.lineWidth = 0.7;
    for (let k = 2; k < 8; k += 2) { c.beginPath(); c.ellipse(0, 1, k * 0.7, k, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    c.restore();
  }
  // a little star with four soft points
  function glint(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU, d = k % 2 ? s * 0.24 : s; c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    c.closePath(); c.fill();
  }

  // the observatory's boards, painted indigo, with a dark line between each
  function indigoBoards(c, nz, x0, y0, x1, y1, step = 34) {
    const g = ramp(['#191e47', '#1f2553', '#262d61', '#2d346b']);
    field(c, x0, y0, x1, y1, 3, (x, y) => g(U.clamp((nz.fbm(x * 0.05 + 3, y * 0.008, 3) - 0.3) * 2.4, 0, 1)));
    for (let x = Math.floor(x0 / step) * step; x < x1; x += step) {
      c.fillStyle = 'rgba(6,8,28,0.55)'; c.fillRect(x, y0, 1.6, y1 - y0);
      c.fillStyle = 'rgba(160,170,240,0.11)'; c.fillRect(x + 1.6, y0, 1.2, y1 - y0);
    }
  }
  // an oil lamp on a wall bracket, its flame at x, y, and the glow it throws
  function oilLamp(c, x, y) {
    c.fillStyle = rad(c, x, y, 4, x, y, 150, [[0, 'rgba(255,208,136,0.62)'], [0.26, 'rgba(255,190,110,0.26)'], [1, 'rgba(255,190,110,0)']]); c.fillRect(x - 154, y - 154, 308, 308);
    c.fillStyle = 'rgba(6,6,24,0.3)'; c.beginPath(); c.ellipse(x + 3, y + 50, 7, 5, 0, 0, TAU); c.fill();
    c.fillStyle = lin(c, x - 8, 0, x + 8, 0, BRASS); c.beginPath(); c.roundRect(x - 5, y + 28, 10, 26, 4); c.fill();
    c.beginPath(); c.moveTo(x - 13, y + 18); c.quadraticCurveTo(x, y + 38, x + 13, y + 18); c.closePath(); c.fill();
    c.fillStyle = rad(c, x - 4, y + 14, 1, x, y + 18, 15, [[0, '#fff2c0'], [0.5, '#e2b851'], [1, '#7a5a1e']]); c.beginPath(); c.ellipse(x, y + 18, 13, 8.4, 0, 0, TAU); c.fill();
    c.fillStyle = lin(c, x - 6, 0, x + 6, 0, BRASS); c.fillRect(x - 6, y + 7, 12, 6);
    // the glass chimney, a soft flame inside it
    c.fillStyle = 'rgba(255,232,190,0.26)'; c.beginPath(); c.moveTo(x - 5, y + 8); c.quadraticCurveTo(x - 11, y - 2, x - 5, y - 13); c.lineTo(x - 3.6, y - 30); c.lineTo(x + 3.6, y - 30); c.lineTo(x + 5, y - 13); c.quadraticCurveTo(x + 11, y - 2, x + 5, y + 8); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,245,225,0.55)'; c.lineWidth = 0.8; c.stroke();
    c.fillStyle = '#ffd98a'; c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x - 6, y, x, y - 12); c.quadraticCurveTo(x + 6, y, x, y + 6); c.fill();
    c.fillStyle = '#fff6d8'; c.beginPath(); c.ellipse(x, y + 1, 1.7, 4, 0, 0, TAU); c.fill();
  }

  // numbers cut into brass: a lit edge below a dark one
  function cut(c, text, x, y) {
    c.fillStyle = 'rgba(255,244,205,0.6)'; c.fillText(text, x + 0.5, y + 0.6);
    c.fillStyle = '#4a3212'; c.fillText(text, x, y);
  }
  // turned metal catches the light in long soft wedges from its centre; the
  // caller clips to the shape. Each wedge is [direction, half width, strength].
  function turned(c, x, y, R, wedges) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [a, w, al] of wedges) for (const [k, f] of [[1.9, 0.26], [1.3, 0.36], [0.7, 0.38]]) {
      c.fillStyle = `rgba(255,232,170,${(al * f).toFixed(3)})`; c.beginPath(); c.moveTo(x, y); c.arc(x, y, R + 2, a - w * k, a + w * k); c.closePath(); c.fill();
    }
    c.restore();
  }

  // ------------------------------------------------- OWL HILL: THE COPPER DOME
  // The dome from the roof walk at dusk, close enough to count the rivets: rows
  // of lapped copper plates on a short upright skirt, the shutter slit open down
  // one side with the lamp on inside, and the owl on the finial. Years of
  // verdigris and bird droppings scrub off, the warm copper comes up, and a
  // little green stays in the seams.
  // roof { what: 'dome' }
  function copperDome(S) {
    const { r, nz, bleed } = S;
    const seed = (r() * 1e6) | 0;
    const cx = 180, BASE = 456, RX = 171, CAP = 246, SKIRT = 86, BOW = 26;
    const TOP = BASE - SKIRT - CAP;
    // a point on the dome: lon round it from the front, a up it (below 0 is
    // the skirt, down to -1 at its foot). Seen from below, so rings arch upwards.
    const pt = (lon, a) => {
      const p = a > 0 ? Math.cos(a) : 1, h = a > 0 ? SKIRT + CAP * Math.sin(a) : SKIRT * (1 + a);
      return [cx + RX * p * Math.sin(lon), BASE - h - BOW * p * Math.cos(lon)];
    };
    const line = (p, pts) => { pts.forEach(([x, y], i) => { if (i) p.lineTo(x, y); else p.moveTo(x, y); }); };
    const outline = (p) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) pts.push(pt(-HALF + (i / 40) * Math.PI, -1));
      for (let i = 1; i <= 40; i++) pts.push(pt(HALF, -1 + (i / 40) * (1 + HALF)));
      for (let i = 39; i > 0; i--) pts.push(pt(-HALF, -1 + (i / 40) * (1 + HALF)));
      line(p, pts); p.closePath();
    };
    // the slit runs up over the dome at one width, like a strip of the true thing
    const LON = 0.5, WID = 0.135, A0 = -0.84, A1 = 1.18;
    const slitPt = (a, s) => pt(LON + Math.asin(U.clamp((s * WID) / (a > 0 ? Math.cos(a) : 1), -0.98, 0.98)), a);
    const slitEdge = (s) => { const pts = []; for (let i = 0; i <= 36; i++) pts.push(slitPt(U.lerp(A0, A1, i / 36), s)); return pts; };
    const slit = (p) => {
      const pts = slitEdge(-1);
      for (let i = 1; i < 8; i++) pts.push(slitPt(A1 + Math.sin((i / 8) * Math.PI) * 0.05, -1 + (i / 8) * 2));
      pts.push(...slitEdge(1).reverse());
      line(p, pts); p.closePath();
    };
    const region = new Path2D(); outline(region); slit(region);
    const dome = new Path2D(); outline(dome);
    const slitPath = new Path2D(); slit(slitPath);

    // the rows of plates, from the foot of the skirt to the cap: where each
    // row starts and how many plates go across the half we can see
    const ROWS = [[-1, 14], [-0.5, 14], [0, 14], [0.2, 12], [0.4, 12], [0.6, 10], [0.8, 8], [1.02, 6], [1.24, 4], [1.42, 0]];
    const rowLons = (i) => { const n = ROWS[i][1], l = []; for (let k = 0; k <= n + 1; k++) l.push(-HALF + ((k - (i % 2) * 0.5) / n) * Math.PI); return l; };
    const row = (a, l0, l1, n = 12) => { const pts = []; for (let i = 0; i <= n; i++) pts.push(pt(U.lerp(l0, l1, i / n), a)); return pts; };
    function plates(c, q) {
      for (let i = 0; i < ROWS.length - 1; i++) {
        const a0 = ROWS[i][0], a1 = ROWS[i + 1][0], l = rowLons(i);
        for (let k = 0; k + 1 < l.length; k++) {
          const p = new Path2D(), low = row(a0, l[k], l[k + 1], 6), high = row(a1, l[k], l[k + 1], 6).reverse();
          line(p, low.concat(high)); p.closePath();
          c.fillStyle = U.shade(U.pick(q, ['#c8763e', '#d18248', '#bd6a35', '#cc7b42', '#b9652f', '#d68c52', '#c26f39']), (nz.n2(k * 1.3 + 2, i * 1.7) - 0.5) * 0.14); c.fill(p);
        }
      }
    }
    // every seam of the plates, as lists of points
    function seams() {
      const out = [];
      for (let i = 0; i < ROWS.length - 1; i++) {
        const a0 = ROWS[i][0], a1 = ROWS[i + 1][0], l = rowLons(i);
        out.push({ across: true, a: a1, pts: row(a1, -HALF, HALF, 44) });
        for (let k = 1; k + 1 < l.length; k++) { const pts = []; for (let j = 0; j <= 6; j++) pts.push(pt(l[k], U.lerp(a0, a1, j / 6))); out.push({ across: false, lon: l[k], a0, a1, pts }); }
      }
      return out;
    }
    const SEAMS = seams();
    // where the rivets sit, a little in from each seam
    const RIVETS = [];
    for (const s of SEAMS) {
      if (s.across) {
        const p = s.a > 0 ? Math.cos(s.a) : 1, step = 10.5 / (RX * p);
        for (let l = -HALF + step / 2; l < HALF; l += step) RIVETS.push(pt(l, s.a - 0.016));
      } else {
        const n = Math.max(2, Math.round((s.a1 - s.a0) * (s.a0 < 0 ? 3.2 : 12)));
        for (let j = 0; j < n; j++) { const a = U.lerp(s.a0, s.a1, (j + 0.5) / n), p = a > 0 ? Math.cos(a) : 1; RIVETS.push(pt(s.lon + 4 / (RX * p), a)); }
      }
    }
    // the round of the dome, lit by the low sun to the left, with the indigo
    // sky in its far edge: gives how lit a point is and how near the edge, 0..1
    function roundness(x, y) {
      let h = BASE - y - BOW * 0.7, p = 1, cl = 1, X = 0, sa = 0;
      for (let k = 0; k < 3; k++) {
        sa = h > SKIRT ? U.clamp((h - SKIRT) / CAP, 0, 0.9995) : 0;
        p = Math.sqrt(1 - sa * sa);
        X = U.clamp((x - cx) / (RX * p), -0.999, 0.999); cl = Math.sqrt(1 - X * X);
        h = BASE - y - BOW * p * cl;
      }
      const nx = p * X, ny = sa, nz2 = p * cl;
      return [U.clamp(nx * -0.56 + ny * 0.36 + nz2 * 0.74, 0, 1), 1 - nz2];
    }
    function shading(c, deep, warm) {
      field(c, 0, TOP - 3, W, BASE + 3, 3, (x, y) => [38, 14, 26, Math.pow(1 - roundness(x, y)[0], 1.5) * deep * 255]);
      field(c, 0, TOP - 3, W, BASE + 3, 3, (x, y) => [255, 228, 182, U.smooth(0.78, 1, roundness(x, y)[0]) * warm * 255]);
      field(c, 0, TOP - 3, W, BASE + 3, 3, (x, y) => [70, 78, 168, U.smooth(0.72, 1, roundness(x, y)[1]) * (x > cx ? 0.5 : 0.22) * 255]);
    }
    // a dropping: a chalky splash with a few spots flung round it and a grey
    // heart off to one side, and the runs down the dome from it
    function drop(c, q, x, y, s) {
      const lean = (x - cx) / RX;
      const blob = (bx, by, br, n = 9) => { c.beginPath(); for (let k = 0; k < n; k++) { const a = (k / n) * TAU, d = br * (0.62 + q() * 0.62); c.lineTo(bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.86); } c.closePath(); c.fill(); };
      const shape = [];
      for (let k = 0; k < 4; k++) shape.push([(q() - 0.5) * s * 2.6, (q() - 0.5) * s * 1.8, s * (0.1 + q() * 0.16)]);
      const runs = [];
      for (let k = 0, n = 1 + ((q() * 3) | 0); k < n; k++) runs.push([(q() - 0.5) * s * 1.1, s * (0.9 + q() * 2.4), s * (0.2 + q() * 0.14)]);
      c.lineCap = 'round';
      const run = (ox, oy, col, extra) => { for (const [dx, l, w] of runs) { c.strokeStyle = col; c.lineWidth = w + extra; c.beginPath(); c.moveTo(x + dx + ox, y + oy); c.quadraticCurveTo(x + dx + ox, y + oy + l * 0.6, x + dx + lean * l * 0.35 + ox, y + oy + l); c.stroke(); } };
      run(0.8, 1.2, 'rgba(24,60,54,0.3)', 0.3);
      c.fillStyle = 'rgba(24,60,54,0.3)'; blob(x + 0.8, y + 1.2, s);
      run(0, 0, '#ece8da', 0);
      c.fillStyle = '#f4f0e4'; blob(x, y, s);
      for (const [dx, dy, d] of shape) dot(c, x + dx, y + dy, d, '#efeadc');
      c.fillStyle = 'rgba(150,146,128,0.7)'; blob(x + s * 0.2, y + s * 0.1, s * 0.46, 7);
      c.fillStyle = 'rgba(92,90,78,0.75)'; blob(x + s * 0.26, y + s * 0.12, s * 0.16, 6);
    }
    // droppings, thickest under the finial where the owl sits
    const DROPS = [];
    for (let i = 0; i < 9; i++) { const l = (r() - 0.5) * 2.2, a = 1.16 - r() * 0.34; DROPS.push([...pt(l, a), 4.4 + r() * 3.6]); }
    for (let i = 0; i < 13; i++) { const l = (r() - 0.5) * 2.6, a = -0.5 + r() * 1.4; DROPS.push([...pt(l, a), 4 + r() * 4.4]); }
    const owlAt = { x: cx, y: TOP - 34 };
    function owl(c) {
      const { x, y } = owlAt;
      c.save(); c.translate(x, y);
      c.fillStyle = '#54412f'; c.beginPath(); c.moveTo(-6, -2); c.lineTo(-3, 9); c.lineTo(3, 9); c.lineTo(6, -2); c.closePath(); c.fill();
      c.fillStyle = lin(c, -11, -28, 13, 4, [[0, '#b79468'], [1, '#634b35']]);
      c.beginPath(); c.moveTo(-9, 3); c.quadraticCurveTo(-14, -12, -10.5, -22); c.lineTo(-11, -30); c.lineTo(-5, -26.5); c.quadraticCurveTo(0, -28, 5, -26.5); c.lineTo(11, -30); c.lineTo(10.5, -22); c.quadraticCurveTo(14, -12, 9, 3); c.quadraticCurveTo(0, 6, -9, 3); c.fill();
      c.fillStyle = '#e8d8b8'; c.beginPath(); c.ellipse(0, -5, 7.4, 9.4, 0, 0, TAU); c.fill();
      c.strokeStyle = '#8a6c4c'; c.lineWidth = 0.9;
      for (const [dx, dy] of [[-3.6, -9], [0, -10], [3.6, -9], [-1.8, -6], [1.8, -6], [-3.6, -3], [0, -3], [3.6, -3], [-1.8, 0], [1.8, 0]]) { c.beginPath(); c.moveTo(dx - 1.3, dy - 0.8); c.lineTo(dx, dy + 0.8); c.lineTo(dx + 1.3, dy - 0.8); c.stroke(); }
      c.fillStyle = '#6e5238'; c.beginPath(); c.ellipse(-10, -9, 3, 9, 0.16, 0, TAU); c.ellipse(10, -9, 3, 9, -0.16, 0, TAU); c.fill();
      for (const sx of [-1, 1]) {
        dot(c, sx * 4.8, -19.5, 5.2, '#f0e4cc');
        dot(c, sx * 4.8, -19.5, 3.4, '#e9b23c');
        dot(c, sx * 4.8, -19.5, 2, '#1f1a18');
        dot(c, sx * 4.8 - 0.7, -20.3, 0.7, '#ffffff');
      }
      c.fillStyle = '#c9972f'; c.beginPath(); c.moveTo(-1.6, -17.5); c.lineTo(1.6, -17.5); c.lineTo(0, -13.8); c.closePath(); c.fill();
      c.strokeStyle = '#c9972f'; c.lineWidth = 1.3; c.lineCap = 'round';
      for (const sx of [-1, 1]) for (const d of [-1.4, 0, 1.4]) { c.beginPath(); c.moveTo(sx * 3 + d * 0.6, 3); c.lineTo(sx * 3 + d, 7); c.stroke(); }
      c.restore();
    }
    // the stone of the drum, in courses that bow with the dome
    const bowY = (x, y) => y - 22 * Math.sqrt(Math.max(0, 1 - ((x - cx) / 230) ** 2));
    function stonework(c, q, x0, x1) {
      const top = [], edge = new Path2D(), body = new Path2D();
      for (let x = x0; x <= x1 + 6; x += 6) top.push([x, bowY(x, BASE + 4)]);
      line(edge, top); line(body, top); body.lineTo(x1 + 6, H + 200); body.lineTo(x0, H + 200); body.closePath();
      c.fillStyle = '#6d6470'; c.fill(body);
      for (let row = 0, y = BASE + 8; y < bleed.y1 + 30; y += 25, row++) {
        for (let x = x0 - 46 + (row % 2) * 23; x < x1 + 46; x += 46) {
          const w = 44, p = new Path2D(), t0 = bowY(x, y), t1 = bowY(x + w / 2, y), t2 = bowY(x + w, y);
          line(p, [[x, t0], [x + w / 2, t1], [x + w, t2], [x + w, t2 + 23], [x + w / 2, t1 + 23], [x, t0 + 23]]); p.closePath();
          c.fillStyle = U.shade(U.pick(q, ['#8d8391', '#857b8b', '#958a92', '#7f768a', '#92868c']), (nz.n2(x * 0.03, y * 0.05) - 0.5) * 0.14); c.fill(p);
          c.strokeStyle = 'rgba(255,240,225,0.14)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 1, t0 + 1.4); c.lineTo(x + w / 2, t1 + 1.4); c.lineTo(x + w - 1, t2 + 1.4); c.stroke();
        }
      }
      c.strokeStyle = '#a79c9e'; c.lineWidth = 6; c.stroke(edge);
      c.strokeStyle = 'rgba(255,240,225,0.3)'; c.lineWidth = 1; c.save(); c.translate(0, -2.4); c.stroke(edge); c.restore();
    }
    function archWindow(c, x, y, w, h) {
      const arch = new Path2D(); arch.moveTo(x - w / 2, y + h); arch.lineTo(x - w / 2, y + w / 2); arch.arc(x, y + w / 2, w / 2, Math.PI, 0); arch.lineTo(x + w / 2, y + h); arch.closePath();
      c.fillStyle = rad(c, x, y + h * 0.5, 4, x, y + h * 0.5, 96, [[0, 'rgba(255,196,110,0.5)'], [1, 'rgba(255,196,110,0)']]); c.fillRect(x - 100, y - 60, 200, h + 120);
      c.lineWidth = 9; c.strokeStyle = '#c4b6a8'; c.stroke(arch);
      c.lineWidth = 1.2; c.strokeStyle = 'rgba(40,30,40,0.45)'; c.stroke(arch);
      c.fillStyle = lin(c, 0, y, 0, y + h, [[0, '#ffe7ae'], [0.6, '#ffc46e'], [1, '#e8933f']]); c.fill(arch);
      c.save(); c.clip(arch);
      c.strokeStyle = '#2a2740'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + h); for (const k of [0.34, 0.56, 0.78]) { c.moveTo(x - w, y + h * k); c.lineTo(x + w, y + h * k); } c.stroke();
      c.lineWidth = 1.4; c.beginPath(); c.arc(x, y + h * 0.34, w * 0.26, Math.PI, 0); c.stroke();
      c.restore();
    }
    return {
      family: 'scrub', particle: 'moss', region, depth: true,
      tough(x, y) { for (const [dx, dy, s] of DROPS) if (Math.hypot(x - dx, y - dy) < s * 1.3) return 1.7; return nz.fbm(x * 0.03 + 3, y * 0.03, 3) > 0.6 ? 1.35 : 1; },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(seed + 1);
        // the sky going indigo over the hill, the last of the sun low down
        c.fillStyle = lin(c, 0, y0, 0, 470, [[0, '#12163f'], [0.44, '#272a6c'], [0.7, '#5f5496'], [0.86, '#c98a84'], [1, '#f6c98e']]);
        c.fillRect(x0, y0, x1 - x0, 480 - y0);
        for (let i = 0; i < 170; i++) {
          const x = x0 + q() * (x1 - x0), y = y0 + q() * q() * 340, a = 0.3 + q() * 0.6;
          dot(c, x, y, 0.5 + q() * 0.8, `rgba(255,${(236 + q() * 18) | 0},${(200 + q() * 50) | 0},${a.toFixed(2)})`);
        }
        for (const [x, y, s] of [[34, 150, 5], [326, 96, 5.5], [292, 40, 4], [108, 34, 4.5], [346, 214, 4], [14, 244, 3.6]]) { c.fillStyle = rad(c, x, y, 0, x, y, s * 2.2, [[0, 'rgba(255,240,205,0.3)'], [1, 'rgba(255,240,205,0)']]); c.fillRect(x - s * 2.2, y - s * 2.2, s * 4.4, s * 4.4); glint(c, x, y, s, '#fff4d2'); }
        // a thin moon
        c.fillStyle = rad(c, 66, 74, 6, 66, 74, 44, [[0, 'rgba(255,240,205,0.28)'], [1, 'rgba(255,240,205,0)']]); c.fillRect(16, 24, 100, 100);
        const moon = new Path2D(); moon.arc(66, 74, 17, 0.9, 5.2); moon.arc(75, 70, 15.5, 5.0, 1.0, true); moon.closePath();
        c.fillStyle = '#fbefc8'; c.fill(moon);
        // the last of the sun in thin cloud low down, and the far hills
        for (const [x, y, w] of [[-20, 408, 120], [24, 430, 90], [392, 396, 130], [340, 426, 96]]) {
          c.fillStyle = 'rgba(255,214,176,0.3)'; c.beginPath(); c.ellipse(x, y, w, 2.6, 0, 0, TAU); c.ellipse(x + w * 0.3, y - 2, w * 0.5, 2, 0, 0, TAU); c.fill();
        }
        c.fillStyle = '#4c4a80'; c.beginPath(); c.moveTo(x0, 452); c.quadraticCurveTo(60, 428, 150, 448); c.quadraticCurveTo(280, 462, x1, 436); c.lineTo(x1, 500); c.lineTo(x0, 500); c.fill();
        // the drum of the observatory under the dome, and its lit windows
        stonework(c, q, x0, x1);
        c.fillStyle = lin(c, 0, BASE - 26, 0, BASE + 70, [[0, 'rgba(24,20,50,0.6)'], [1, 'rgba(24,20,50,0)']]); c.fillRect(x0, BASE - 30, x1 - x0, 100);
        archWindow(c, 96, 494, 44, 74); archWindow(c, 264, 494, 44, 74);
        c.fillStyle = lin(c, x0, 0, x1, 0, [[0, 'rgba(255,190,130,0.12)'], [0.5, 'rgba(255,190,130,0)'], [1, 'rgba(30,26,70,0.34)']]); c.fillRect(x0, BASE, x1 - x0, y1 - BASE);
        softShadow(c, dome, 12, 0.5, 2, 10);
        // inside the slit: the dark of the dome, the lamp on and the telescope looking out
        c.save(); c.clip(slitPath);
        c.fillStyle = lin(c, 0, 170, 0, 420, [[0, '#0b0f2c'], [0.5, '#1c2050'], [0.84, '#5a3c34'], [1, '#a8693a']]); c.fillRect(150, 150, 210, 300);
        c.strokeStyle = 'rgba(190,170,190,0.16)'; c.lineWidth = 2;
        for (const a of [-0.3, 0, 0.26, 0.52, 0.78, 1]) { c.beginPath(); line(c, row(a, 0.1, 1.1, 12).map(([x, y]) => [x, y + 10])); c.stroke(); }
        c.save(); c.translate(250, 318); c.rotate(0.15);
        c.fillStyle = lin(c, -14, 0, 14, 0, BRASS); c.fillRect(-14, -74, 28, 200);
        for (const y of [-26, 40, 92]) { c.fillStyle = lin(c, -16, 0, 16, 0, BRASS); c.fillRect(-16, y, 32, 7); c.fillStyle = 'rgba(40,20,10,0.4)'; c.fillRect(-14, y + 7, 28, 2.4); }
        c.fillStyle = lin(c, -19, 0, 19, 0, BRASS); c.fillRect(-19, -112, 38, 40);
        c.fillStyle = 'rgba(40,20,10,0.4)'; c.fillRect(-14, -72, 28, 3);
        c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(0, -112, 19, 5.6, 0, 0, TAU); c.fill();
        c.fillStyle = '#141a3e'; c.beginPath(); c.ellipse(0, -112, 16, 4.2, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(150,190,255,0.5)'; c.beginPath(); c.ellipse(-4, -113, 5, 1.2, 0, 0, TAU); c.fill();
        c.restore();
        c.fillStyle = rad(c, 262, 430, 6, 262, 430, 110, [[0, 'rgba(255,204,120,0.9)'], [0.5, 'rgba(255,170,90,0.3)'], [1, 'rgba(255,170,90,0)']]); c.fillRect(150, 300, 220, 170);
        c.restore();
        // the iron rail round the roof walk, dark against the stone
        c.fillStyle = '#1b1c38';
        for (let x = Math.floor(x0 / 22) * 22; x < x1 + 22; x += 22) {
          c.fillRect(x - 1.5, 558, 3, y1 - 558);
          c.beginPath(); c.moveTo(x - 3.4, 558); c.lineTo(x, 546); c.lineTo(x + 3.4, 558); c.closePath(); c.fill();
        }
        c.fillRect(x0, 562, x1 - x0, 5);
        c.fillStyle = 'rgba(255,214,170,0.22)'; c.fillRect(x0, 562, x1 - x0, 1.2);
        c.fillStyle = '#1b1c38'; c.fillRect(x0, 590, x1 - x0, y1 - 590);
        c.fillStyle = '#26284a'; c.fillRect(x0, 590, x1 - x0, 3);
        // the top of the oak, dark against the last of the light
        for (let i = 0; i < 150; i++) {
          const x = x0 - 10 + q() * (x1 - x0 + 20), top = 612 - (Math.abs(x - cx) / 180) * 26, y = top + q() * q() * (y1 + 10 - top), s = 11 + q() * 13;
          c.fillStyle = U.pick(q, ['#121832', '#17203a', '#1c2842', '#141c36']); c.beginPath(); c.ellipse(x, y, s, s * 0.66, (q() - 0.5) * 0.8, 0, TAU); c.fill();
          c.fillStyle = 'rgba(150,170,190,0.12)'; c.beginPath(); c.ellipse(x - s * 0.2, y - s * 0.26, s * 0.42, s * 0.2, -0.3, 0, TAU); c.fill();
        }
      },
      clean(c) {
        const q = U.rng(seed + 2);
        c.fillStyle = '#b9652f'; c.fillRect(0, TOP - 4, W, BASE - TOP + 8);
        plates(c, q);
        // a little green stays in the seams, and round the odd rivet
        c.lineCap = 'round';
        for (const s of SEAMS) {
          for (let i = 0; i + 1 < s.pts.length; i++) {
            const [ax, ay] = s.pts[i], [bx, by] = s.pts[i + 1];
            if (nz.fbm(ax * 0.03 + 11, ay * 0.03, 3) > 0.46) { c.strokeStyle = `rgba(92,176,152,${(0.28 + q() * 0.42).toFixed(2)})`; c.lineWidth = 2 + q() * 1.8; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
          }
        }
        // the lapped edges: a dark line and a lit one
        for (const s of SEAMS) {
          c.strokeStyle = 'rgba(58,24,12,0.6)'; c.lineWidth = 1; c.beginPath(); line(c, s.pts); c.stroke();
          c.strokeStyle = 'rgba(255,220,180,0.3)'; c.lineWidth = 0.8; c.beginPath(); line(c, s.pts.map(([x, y]) => [x + (s.across ? 0 : 1), y + (s.across ? 1 : 0)])); c.stroke();
        }
        for (const [x, y] of RIVETS) {
          if (q() < 0.14) dot(c, x + 0.4, y + 1, 3.2, 'rgba(92,176,152,0.4)');
          dot(c, x + 0.7, y + 0.9, 2.1, 'rgba(58,24,12,0.5)');
          dot(c, x, y, 1.8, '#dd9c66');
          dot(c, x - 0.6, y - 0.6, 0.75, '#ffe9cc');
        }
        shading(c, 0.62, 0.3);
      },
      dirt(c) {
        const q = U.rng(seed + 3);
        const g = ramp(['#2c6b64', '#3c8577', '#52a08e', '#6cb7a2', '#8acbb6', '#aee0cc']), rust = U.hex('#7c5234');
        field(c, 0, TOP - 4, W, BASE + 4, 2, (x, y) => {
          const big = nz.fbm(x * 0.02 + 40, y * 0.024, 5), fine = nz.fbm(x * 0.13 + 9, y * 0.05, 3), col = g(U.clamp((big - 0.26) * 2 + (fine - 0.5) * 0.7, 0, 1));
          // brown where the old copper still shows through, in patches
          const k = U.smooth(0.56, 0.68, nz.fbm(x * 0.03 + 70, y * 0.04 + 8, 4)) * 0.62;
          return [U.lerp(col[0], rust[0], k), U.lerp(col[1], rust[1], k), U.lerp(col[2], rust[2], k)];
        });
        // the seams and rivets still read through it, the rain has run from each
        c.lineCap = 'round';
        for (let i = 0; i < 230; i++) {
          const l = (q() - 0.5) * Math.PI, a0 = -0.8 + q() * 2.2, a1 = a0 - 0.08 - q() * 0.3, pts = [];
          for (let k = 0; k <= 4; k++) pts.push(pt(l, U.lerp(a0, a1, k / 4)));
          c.strokeStyle = q() < 0.6 ? `rgba(194,236,222,${(0.1 + q() * 0.2).toFixed(2)})` : `rgba(20,66,62,${(0.1 + q() * 0.18).toFixed(2)})`;
          c.lineWidth = 1.4 + q() * 4; c.beginPath(); line(c, pts); c.stroke();
        }
        for (const s of SEAMS) {
          c.strokeStyle = 'rgba(20,70,66,0.55)'; c.lineWidth = 1.5; c.beginPath(); line(c, s.pts); c.stroke();
          c.strokeStyle = 'rgba(200,240,226,0.26)'; c.lineWidth = 0.8; c.beginPath(); line(c, s.pts.map(([x, y]) => [x + (s.across ? 0 : 1.2), y + (s.across ? 1.2 : 0)])); c.stroke();
        }
        for (const [x, y] of RIVETS) { dot(c, x + 0.6, y + 0.8, 2, 'rgba(20,66,62,0.5)'); dot(c, x, y, 1.7, '#8fd0ba'); }
        grime(c, q, 10, TOP + 20, 350, BASE, 16);
        shading(c, 0.6, 0.16);
        for (const [x, y, s] of DROPS) drop(c, q, x, y, s);
      },
      top(c) {
        // the rails the shutters run on, down both sides of the slit
        for (const s of [-1, 1]) {
          const p = new Path2D(); line(p, slitEdge(s));
          c.lineCap = 'round'; c.lineJoin = 'round';
          c.strokeStyle = 'rgba(20,12,16,0.5)'; c.lineWidth = 8; c.save(); c.translate(1, 1.6); c.stroke(p); c.restore();
          c.strokeStyle = '#4b3a34'; c.lineWidth = 7; c.stroke(p);
          c.strokeStyle = '#7c6248'; c.lineWidth = 4; c.stroke(p);
          c.strokeStyle = 'rgba(255,226,180,0.4)'; c.lineWidth = 1; c.save(); c.translate(-0.8, -0.6); c.stroke(p); c.restore();
          for (let i = 1; i < 11; i++) { const [x, y] = slitPt(U.lerp(A0, A1, i / 11), s); dot(c, x, y, 2.8, '#3a2c28'); dot(c, x - 0.5, y - 0.5, 1.5, '#c9a24a'); }
        }
        // the sill at the foot of the slit and the hood at its top
        const sill = new Path2D(); line(sill, [slitPt(A0 - 0.02, -1.26), slitPt(A0 - 0.02, 1.26), slitPt(A0 + 0.14, 1.26), slitPt(A0 + 0.14, -1.26)]); sill.closePath();
        c.fillStyle = lin(c, 200, 0, 300, 0, [[0, '#4b3a34'], [0.4, '#8a6c50'], [1, '#3e2f2a']]); c.fill(sill);
        // the bronze track the dome turns on
        const track = new Path2D(); line(track, row(-1, -HALF, HALF, 40));
        c.strokeStyle = 'rgba(16,10,20,0.45)'; c.lineWidth = 12; c.save(); c.translate(0, 3); c.stroke(track); c.restore();
        c.strokeStyle = '#3f3030'; c.lineWidth = 11; c.stroke(track);
        c.strokeStyle = '#7c5c42'; c.lineWidth = 7; c.stroke(track);
        c.strokeStyle = 'rgba(255,226,180,0.34)'; c.lineWidth = 1.2; c.save(); c.translate(0, -2.4); c.stroke(track); c.restore();
        for (let i = 0; i <= 16; i++) { const [x, y] = pt(-1.4 + (i / 16) * 2.8, -1); dot(c, x, y, 3.2, '#2f2528'); dot(c, x - 0.6, y - 0.8, 1.7, '#b08a5a'); }
        // the lead cap, the brass finial and the owl who sits on it
        const cap = new Path2D(); line(cap, row(ROWS[ROWS.length - 1][0], -HALF, HALF, 20)); cap.lineTo(cx, TOP - 3); cap.closePath();
        c.fillStyle = lin(c, cx - 36, 0, cx + 36, 0, [[0, '#6e5a58'], [0.34, '#b4a6a2'], [1, '#4e4048']]); c.fill(cap);
        c.strokeStyle = 'rgba(30,20,20,0.45)'; c.lineWidth = 1; c.stroke(cap);
        c.fillStyle = lin(c, cx - 4, 0, cx + 4, 0, BRASS); c.beginPath(); c.moveTo(cx - 3.2, TOP + 2); c.lineTo(cx - 1.8, TOP - 26); c.lineTo(cx + 1.8, TOP - 26); c.lineTo(cx + 3.2, TOP + 2); c.closePath(); c.fill();
        c.fillStyle = rad(c, cx - 2.4, TOP - 30, 0.5, cx, TOP - 28, 7, [[0, '#fff2c0'], [0.5, '#e2b851'], [1, '#7a5a1e']]); c.beginPath(); c.arc(cx, TOP - 28, 6.4, 0, TAU); c.fill();
        owl(c);
      },
      liveTop(c, t) {
        // the owl blinks now and then
        const k = (t + 4) % 9;
        if (k < 0.16 || (k > 0.36 && k < 0.5)) for (const sx of [-1, 1]) dot(c, owlAt.x + sx * 4.8, owlAt.y - 19.5, 3.8, '#b79468');
      },
    };
  }

  // -------------------------------------------------- OWL HILL: THE GREAT LENS
  // The telescope's object glass, out of its tube and resting in an oak cradle
  // on the bench: a heavy brass cell with slotted screws and degrees cut round
  // it. Dust and greasy smears wash off, and the glass comes up dark and clear
  // with a faint blue bloom and the night sky lying in it the wrong way round.
  // Once it is clean the stars in it twinkle.
  // roundWindow { what: 'lens' }
  function greatLens(S) {
    const { r, nz, bleed } = S;
    const seed = (r() * 1e6) | 0;
    const cx = 180, cy = 268, R = 136, RR = 147, RO = 172, BENCH = 502;
    const region = new Path2D(); region.arc(cx, cy, R, 0, TAU);
    const cell = new Path2D(); cell.arc(cx, cy, RO + 3, 0, TAU);
    const inDisc = (q, k = 0.98) => { for (;;) { const x = (q() * 2 - 1) * R, y = (q() * 2 - 1) * R; if (x * x + y * y < R * R * k) return [cx + x, cy + y]; } };
    // the Milky Way crosses the glass from top left to bottom right
    const across = (x, y) => ((x - cx) * -0.7 + (y - cy) * 0.72) / R;
    const STARS = [];
    {
      const q = U.rng(seed + 5);
      for (let i = 0; i < 420; i++) {
        let [x, y] = inDisc(q);
        if (q() < 0.5) { const d = across(x, y) * R * (0.42 + q() * 0.3); x += 0.7 * d; y -= 0.72 * d; } // half of them gather along it
        const big = q() < 0.07;
        STARS.push({ x, y, s: big ? 1.3 + q() * 0.9 : 0.45 + q() * 0.6, a: big ? 1 : 0.35 + q() * 0.6, col: U.pick(q, ['#ffffff', '#dfe8ff', '#cfdcff', '#fff0d0', '#ffe2c0']), ph: q() * TAU, sp: 0.5 + q() * 0.9, big });
      }
    }
    const TWINKLE = STARS.filter((s) => s.big);
    function sky(c) {
      c.fillStyle = rad(c, cx - R * 0.34, cy - R * 0.4, R * 0.04, cx, cy, R * 1.06, [[0, '#2c4490'], [0.32, '#1c2c6c'], [0.68, '#111a4c'], [1, '#090d2c']]);
      c.fillRect(cx - R - 2, cy - R - 2, R * 2 + 4, R * 2 + 4);
      field(c, cx - R, cy - R, cx + R, cy + R, 2, (x, y) => {
        const d = across(x, y), n = nz.fbm(x * 0.028 + 21, y * 0.028 + 4, 5), rift = nz.fbm(x * 0.05 + 3, y * 0.05 + 40, 4);
        const a = Math.exp(-d * d * 7) * U.smooth(0.3, 0.68, n) * (1 - U.smooth(0.52, 0.66, rift) * 0.7);
        return [178, 196, 255, a * 118];
      });
      for (const s of STARS) {
        if (s.big) { const k = s.s * 4.4; c.fillStyle = rad(c, s.x, s.y, 0, s.x, s.y, k, [[0, U.rgba(s.col, 0.34)], [1, U.rgba(s.col, 0)]]); c.fillRect(s.x - k, s.y - k, k * 2, k * 2); }
        dot(c, s.x, s.y, s.s, U.rgba(s.col, s.a));
      }
      // the Plough, its handle pointing the wrong way
      for (const [px, py] of PLOUGH.slice(0, 7)) {
        const x = cx - 48 - px * 54, y = cy + 64 + py * 54;
        c.fillStyle = rad(c, x, y, 0, x, y, 9, [[0, 'rgba(220,232,255,0.4)'], [1, 'rgba(220,232,255,0)']]); c.fillRect(x - 9, y - 9, 18, 18); glint(c, x, y, 4.2, '#f4f7ff'); dot(c, x, y, 1.5, '#ffffff');
      }
      // a low moon, small and far away
      const mx = cx - 88, my = cy - 34;
      c.fillStyle = rad(c, mx, my, 2, mx, my, 34, [[0, 'rgba(230,236,255,0.34)'], [1, 'rgba(230,236,255,0)']]); c.fillRect(mx - 36, my - 36, 72, 72);
      const moon = new Path2D(); moon.arc(mx, my, 12, -2.3, 1.7); moon.arc(mx - 6, my + 2.4, 11, 1.4, -2.0, true); moon.closePath();
      c.fillStyle = '#f2f1e4'; c.fill(moon);
      // the lamp, twice over, from the two faces of the glass
      for (const [x, y, s, a] of [[cx + 74, cy - 76, 20, 0.5], [cx - 38, cy + 39, 11, 0.2]]) {
        c.fillStyle = rad(c, x, y, 1, x, y, s, [[0, `rgba(255,214,150,${a})`], [0.3, `rgba(255,190,110,${a * 0.34})`], [1, 'rgba(255,190,110,0)']]); c.fillRect(x - s, y - s, s * 2, s * 2);
      }
      // the bloom on the glass: faintly blue, strongest towards the edge
      c.save(); c.globalCompositeOperation = 'lighter';
      c.fillStyle = rad(c, cx, cy, R * 0.5, cx, cy, R, [[0, 'rgba(70,120,255,0)'], [0.7, 'rgba(70,120,255,0.04)'], [1, 'rgba(120,170,255,0.2)']]); c.fillRect(cx - R, cy - R, R * 2, R * 2);
      for (const [ox, oy, a] of [[0.17, 0.2, 0.16], [-0.1, -0.12, 0.06]]) {
        c.fillStyle = rad(c, cx + R * ox, cy + R * oy, R * 0.76, cx + R * ox, cy + R * oy, R * 1.06, [[0, 'rgba(150,196,255,0)'], [1, `rgba(150,196,255,${a})`]]); c.fillRect(cx - R, cy - R, R * 2, R * 2);
      }
      c.restore();
    }
    function round(c, text, rr, mid, step) {
      const n = text.length;
      [...text].forEach((ch, i) => {
        const a = mid + (i - (n - 1) / 2) * step;
        c.save(); c.translate(cx + Math.sin(a) * rr, cy - Math.cos(a) * rr); c.rotate(a); cut(c, ch, 0, 0); c.restore();
      });
    }
    function brassCell(c) {
      const q = U.rng(seed + 7);
      // the seat of the glass, stepped down to it
      const lip = new Path2D(); lip.arc(cx, cy, RR, 0, TAU); lip.arc(cx, cy, R, 0, TAU, true);
      c.fillStyle = lin(c, cx - RR, cy - RR, cx + RR, cy + RR, [[0, '#7c5a1e'], [0.3, '#b98a2f'], [0.56, '#e7c05a'], [0.84, '#f8e39b'], [1, '#c99a3a']]); c.fill(lip);
      // the wide ring with its screws and its degrees
      const band = new Path2D(); band.arc(cx, cy, RO, 0, TAU); band.arc(cx, cy, RR, 0, TAU, true);
      c.fillStyle = lin(c, cx - RO, cy - RO, cx + RO, cy + RO, [[0, '#f8e39b'], [0.2, '#d8ac4a'], [0.42, '#f0cf79'], [0.6, '#b98a2f'], [0.8, '#dcb355'], [1, '#6e4f1a']]); c.fill(band);
      c.save(); c.clip(band, 'evenodd'); turned(c, cx, cy, RO, [[-0.85, 0.26, 0.3], [-2.5, 0.2, 0.2], [2.3, 0.3, 0.26], [0.62, 0.18, 0.12]]); c.restore();
      c.strokeStyle = 'rgba(60,38,10,0.55)'; c.lineWidth = 1;
      for (const k of [RO - 0.5, RR + 0.5, R + 0.5]) { c.beginPath(); c.arc(cx, cy, k, 0, TAU); c.stroke(); }
      c.strokeStyle = 'rgba(255,246,210,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.arc(cx, cy, RR + 2, 0, TAU); c.stroke();
      // the milled edge
      c.strokeStyle = 'rgba(70,46,14,0.5)'; c.lineWidth = 0.8; c.beginPath();
      for (let i = 0; i < 300; i++) { const a = (i / 300) * TAU, s = Math.sin(a), k = Math.cos(a); c.moveTo(cx + s * (RO - 3), cy + k * (RO - 3)); c.lineTo(cx + s * RO, cy + k * RO); } c.stroke();
      // the degrees, cut in every five
      c.strokeStyle = '#4a3212'; c.lineWidth = 0.8; c.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU, s = Math.sin(a), k = Math.cos(a), l = i % 6 === 0 ? 8 : i % 2 === 0 ? 5.5 : 3.6;
        c.moveTo(cx + s * (RO - 4), cy - k * (RO - 4)); c.lineTo(cx + s * (RO - 4 - l), cy - k * (RO - 4 - l));
      }
      c.stroke();
      c.font = 'bold 10px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.save(); c.translate(cx + Math.sin(a) * 155.5, cy - Math.cos(a) * 155.5); c.rotate(a); cut(c, String(i * 30), 0, 0); c.restore(); }
      // what it is, cut small round the seat
      c.font = 'bold 7px Georgia, "Times New Roman", serif';
      round(c, 'OWL HILL OBSERVATORY', 141.8, 0, 0.0525);
      round(c, 'XII INCH OBJECT GLASS', 141.8, Math.PI, 0.0525);
      // the slotted screws
      for (let i = 0; i < 6; i++) {
        const a = ((15 + i * 60) / 180) * Math.PI, x = cx + Math.sin(a) * 159, y = cy - Math.cos(a) * 159, slot = q() * Math.PI;
        dot(c, x + 0.8, y + 1, 7.6, 'rgba(50,30,8,0.5)');
        c.fillStyle = rad(c, x - 2.6, y - 2.8, 0.6, x, y, 7.4, [[0, '#fff2c0'], [0.5, '#e0b652'], [1, '#8a6824']]); c.beginPath(); c.arc(x, y, 7.2, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(80,52,14,0.7)'; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y, 6.6, 0, TAU); c.stroke();
        c.save(); c.translate(x, y); c.rotate(slot);
        c.fillStyle = '#3a2810'; c.fillRect(-6.4, -1.2, 12.8, 2.4);
        c.fillStyle = 'rgba(255,240,195,0.6)'; c.fillRect(-6.4, 1.2, 12.8, 0.7);
        c.restore();
      }
      // the shade of the seat on the glass, whatever is on it
      c.strokeStyle = 'rgba(5,7,24,0.42)'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R - 0.6, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(5,7,24,0.2)'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R - 3.4, 0, TAU); c.stroke();
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => (Math.hypot(x - cx, y - cy) > R - 16 ? 1.4 : nz.fbm(x * 0.03 + 14, y * 0.03, 3) > 0.6 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(seed + 1);
        indigoBoards(c, nz, x0, y0, x1, BENCH);
        oilLamp(c, 324, 74);
        // a small print of the moon's phases, pinned up long ago
        c.fillStyle = 'rgba(6,8,30,0.4)'; c.fillRect(21, 29, 78, 58);
        c.fillStyle = '#6b4228'; c.fillRect(16, 24, 78, 58);
        c.fillStyle = '#efe4c8'; c.fillRect(21, 29, 68, 48);
        c.fillStyle = '#20275a'; c.fillRect(24, 32, 62, 42);
        for (let k = 0; k < 5; k++) {
          const x = 31 + k * 12, y = 53 + Math.abs(k - 2) * 2.4, cover = [8, 4, 0, 4, 8][k] * (k < 2 ? -1 : 1);
          dot(c, x, y, 5, '#f2e7c6');
          if (k !== 2) { c.save(); c.beginPath(); c.arc(x, y, 5.2, 0, TAU); c.clip(); dot(c, x + cover * 0.9, y, 5.6, '#20275a'); c.restore(); }
        }
        // the oak cradle, its green baize just showing round the brass
        const block = new Path2D();
        block.moveTo(8, BENCH + 12); block.lineTo(20, 372); block.quadraticCurveTo(30, 362, 44, 366); block.lineTo(316, 366); block.quadraticCurveTo(330, 362, 340, 372); block.lineTo(352, BENCH + 12); block.closePath();
        softShadow(c, block, 14, 0.4, -8, 6);
        c.fillStyle = lin(c, 0, 366, 0, BENCH + 12, [[0, '#9a6a3e'], [0.5, '#7c5230'], [1, '#553420']]); c.fill(block);
        c.save(); c.clip(block);
        const grain = ramp(['#6a4226', '#7e5230', '#93653c', '#7a4e2e']);
        field(c, 0, 360, W, BENCH + 12, 2, (x, y) => [...grain(nz.fbm(x * 0.012 + 3, y * 0.11, 4)), 150]);
        c.fillStyle = 'rgba(255,226,180,0.22)'; c.fillRect(0, 366, W, 2);
        c.fillStyle = 'rgba(30,14,6,0.3)'; c.fillRect(0, BENCH - 22, W, 34);
        c.restore();
        softShadow(c, cell, 18, 0.5, -10, 10);
        c.lineWidth = 7; c.strokeStyle = '#3f5e4b'; c.beginPath(); c.arc(cx, cy, RO + 3, 0.34, Math.PI - 0.34); c.stroke();
        // the brass plate on the cradle
        c.fillStyle = lin(c, 96, 0, 264, 0, BRASS); c.beginPath(); c.roundRect(112, 466, 136, 22, 3); c.fill();
        c.strokeStyle = 'rgba(70,46,14,0.6)'; c.lineWidth = 1; c.strokeRect(115.5, 469.5, 129, 15);
        c.font = 'bold 9px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#3a2810'; c.fillText('OWL HILL  1887', 180, 477.5);
        for (const x of [117.5, 242.5]) { dot(c, x, 477, 1.6, '#3a2810'); }
        // the bench, and what is laid out to clean the glass with
        c.fillStyle = lin(c, 0, BENCH, 0, BENCH + 34, [[0, '#8c5e38'], [1, '#a87446']]); c.fillRect(x0, BENCH, x1 - x0, 34);
        for (const y of [BENCH + 11, BENCH + 23]) { c.fillStyle = 'rgba(50,26,10,0.3)'; c.fillRect(x0, y, x1 - x0, 1.2); }
        c.fillStyle = '#6c4226'; c.fillRect(x0, BENCH + 34, x1 - x0, 12);
        c.fillStyle = 'rgba(255,226,180,0.3)'; c.fillRect(x0, BENCH + 34, x1 - x0, 1.6);
        c.fillStyle = '#2a2448'; c.fillRect(x0, BENCH + 46, x1 - x0, y1 - BENCH - 46);
        c.fillStyle = 'rgba(0,0,10,0.4)'; c.fillRect(x0, BENCH + 46, x1 - x0, 7);
        for (const [a, b] of [[x0 - 40, 54], [62, 176], [184, 298], [306, x1 + 40]]) {
          c.fillStyle = '#343060'; c.fillRect(a, BENCH + 58, b - a, y1 - BENCH);
          c.fillStyle = '#2d2a56'; c.fillRect(a + 10, BENCH + 68, b - a - 20, y1 - BENCH);
          c.fillStyle = 'rgba(190,190,255,0.14)'; c.fillRect(a, BENCH + 58, b - a, 1.4);
        }
        for (const x of [164, 196]) { dot(c, x, BENCH + 74, 4, '#c9a24a'); dot(c, x - 1, BENCH + 73, 1.4, '#f2d88a'); }
        c.fillStyle = 'rgba(30,14,6,0.34)'; c.beginPath(); c.ellipse(180, BENCH + 12, 188, 6, 0, 0, TAU); c.fill();
        // a folded chamois, its corner turned back
        c.fillStyle = 'rgba(30,14,6,0.3)'; c.beginPath(); c.ellipse(52, BENCH + 26, 46, 5, 0, 0, TAU); c.fill();
        c.fillStyle = '#b48f50'; c.beginPath(); c.moveTo(10, BENCH + 26); c.quadraticCurveTo(5, BENCH + 20, 12, BENCH + 16); c.lineTo(92, BENCH + 16); c.quadraticCurveTo(98, BENCH + 21, 92, BENCH + 26); c.closePath(); c.fill();
        c.fillStyle = '#e4c586'; c.beginPath(); c.moveTo(12, BENCH + 22); c.quadraticCurveTo(7, BENCH + 16, 14, BENCH + 12); c.lineTo(90, BENCH + 10); c.quadraticCurveTo(97, BENCH + 15, 92, BENCH + 21); c.closePath(); c.fill();
        c.fillStyle = '#f2dca6'; c.beginPath(); c.moveTo(14, BENCH + 12); c.quadraticCurveTo(50, BENCH + 8, 90, BENCH + 10); c.quadraticCurveTo(92, BENCH + 12.6, 90, BENCH + 15); c.quadraticCurveTo(50, BENCH + 12, 14, BENCH + 16); c.quadraticCurveTo(12, BENCH + 14, 14, BENCH + 12); c.fill();
        c.fillStyle = '#c9a766'; c.beginPath(); c.moveTo(66, BENCH + 21); c.lineTo(88, BENCH + 21); c.lineTo(74, BENCH + 13); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(120,84,36,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(18, BENCH + 18); c.quadraticCurveTo(40, BENCH + 16, 64, BENCH + 18.6); c.moveTo(20, BENCH + 24); c.quadraticCurveTo(56, BENCH + 22, 90, BENCH + 24); c.stroke();
        // a bottle of spirit with a cork, and a soft brush
        c.fillStyle = 'rgba(30,14,6,0.3)'; c.beginPath(); c.ellipse(300, BENCH + 27, 22, 4, 0, 0, TAU); c.fill();
        c.fillStyle = '#6e8a84'; c.globalAlpha = 0.8; c.beginPath(); c.roundRect(284, BENCH - 14, 30, 40, 5); c.fill(); c.fillRect(293, BENCH - 26, 12, 14); c.globalAlpha = 1;
        c.fillStyle = 'rgba(190,226,226,0.6)'; c.fillRect(285, BENCH + 2, 28, 22);
        c.fillStyle = '#f4ecd8'; c.fillRect(287, BENCH + 2, 24, 14);
        c.strokeStyle = '#6b5a3e'; c.lineWidth = 0.8; for (const y of [6, 9, 12]) { c.beginPath(); c.moveTo(290, BENCH + y); c.lineTo(308, BENCH + y); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(287, BENCH - 11, 3, 34);
        c.fillStyle = '#c29a66'; c.beginPath(); c.roundRect(292, BENCH - 33, 14, 9, 2); c.fill();
        c.save(); c.translate(216, BENCH + 26); c.rotate(-0.07);
        c.fillStyle = 'rgba(30,14,6,0.28)'; c.fillRect(0, 3, 62, 3);
        c.fillStyle = '#2f2a24'; c.beginPath(); c.roundRect(0, -2.6, 42, 5.2, 2.6); c.fill();
        c.fillStyle = lin(c, 0, -3, 0, 3, BRASS); c.fillRect(40, -3.2, 10, 6.4);
        c.fillStyle = '#d9c29a'; c.beginPath(); c.moveTo(50, -3.2); c.lineTo(64, -4.4); c.lineTo(66, 0); c.lineTo(64, 4.4); c.lineTo(50, 3.2); c.closePath(); c.fill();
        c.restore();
      },
      clean(c) { sky(c); },
      cleanOver(c) {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(190,215,255,0.05)'; c.beginPath(); c.moveTo(cx + 30, cy - R); c.lineTo(cx + 92, cy - R); c.lineTo(cx - 60, cy + R); c.lineTo(cx - 122, cy + R); c.fill();
        c.fillStyle = 'rgba(190,215,255,0.035)'; c.beginPath(); c.moveTo(cx + 104, cy - R); c.lineTo(cx + 124, cy - R); c.lineTo(cx - 28, cy + R); c.lineTo(cx - 48, cy + R); c.fill();
        c.restore();
      },
      live(c, t) {
        c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
        for (const s of TWINKLE) {
          const k = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
          c.globalAlpha = k * k * 0.85; glint(c, s.x, s.y, s.s * 3.4, '#ffffff');
        }
        c.globalAlpha = 1;
        // now and then a meteor slips across the glass
        const k = ((t + 11) % 31) / 0.9;
        if (k < 1) {
          const x = cx + 90 - k * 150, y = cy - 96 + k * 62, g = c.createLinearGradient(x, y, x + 44, y - 18);
          g.addColorStop(0, `rgba(255,255,255,${(0.9 * (1 - k)).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.strokeStyle = g; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 44, y - 18); c.stroke();
        }
        c.restore();
      },
      dirt(c) {
        const q = U.rng(seed + 3);
        const g = ramp(['#8d877c', '#a0998d', '#b3ada1', '#c4beb2', '#d2cdc1']);
        field(c, cx - R - 2, cy - R - 2, cx + R + 2, cy + R + 2, 2, (x, y) => {
          const low = U.smooth(cy, cy + R, y) * 0.2;
          return [...g(U.clamp((nz.fbm(x * 0.03 + 6, y * 0.03, 5) - 0.26) * 1.9 + low, 0, 1)), 243];
        });
        grime(c, q, cx - R, cy - R, cx + R, cy + R, 12);
        // greasy smears, where someone once went round it with an oily cloth
        c.lineCap = 'butt';
        for (let i = 0; i < 14; i++) {
          const rr = 30 + q() * 150, a0 = q() * TAU, span = 0.5 + q() * 1.1, ox = (q() - 0.5) * 120, oy = (q() - 0.5) * 120, w = 12 + q() * 26;
          for (let k = 0; k < 26; k++) {
            const d = (q() - 0.5) * w, cut = (0.5 - Math.abs(d) / w) * 0.5 + q() * 0.24, a1 = a0 + span * cut, a2 = a0 + span * (1 - cut);
            c.strokeStyle = q() < 0.72 ? `rgba(100,78,46,${(0.07 + q() * 0.12).toFixed(2)})` : `rgba(252,248,234,${(0.07 + q() * 0.11).toFixed(2)})`;
            c.lineWidth = 1 + q() * 2.6; c.beginPath(); c.arc(cx + ox, cy + oy, rr + d, a1, a2); c.stroke();
          }
        }
        for (let i = 0; i < 9; i++) { const [x, y] = inDisc(q, 0.8); fingerprint(c, x, y, q() * 3); }
        for (let i = 0; i < 800; i++) { const [x, y] = inDisc(q, 1); c.fillStyle = q() < 0.7 ? 'rgba(84,70,50,0.28)' : 'rgba(246,242,230,0.34)'; c.fillRect(x, y, 1.2, 1.2); }
        // fluff caught along the bottom of the seat, and an old web across it
        for (let i = 0; i < 13; i++) { const a = 0.5 + q() * 2.1, d = R - 6 - q() * 8; bunny(c, q, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 6 + q() * 8); }
        cobweb(c, cx + Math.cos(0.8) * R, cy + Math.sin(0.8) * R, Math.PI + 0.1, 56);
      },
      top: brassCell,
    };
  }

  // --------------------------------------------- OWL HILL: THE BRASS TELESCOPE
  // The eye end of the great refractor on its iron pier, under the dome with
  // the lamp lit: eyepiece, drawtube with its little scale, focusing wheel, the
  // big graduated circle, the hour circle below it and the long slow-motion rod
  // that brings a wheel to the observer's hand. All of it has gone brown and
  // green. Wipe it and the brass comes up bright. Past the last ring the tube
  // is painted, so it can go on out of the picture towards the slit.
  // counter { what: 'telescope' }
  function brassTelescope(S) {
    const { r, nz, bleed } = S;
    const seed = (r() * 1e6) | 0;
    const EX = 64, EY = 470, SLOPE = -0.9, FLOOR = 566;
    const ux = Math.cos(SLOPE), uy = Math.sin(SLOPE), nx = -uy, ny = ux;
    // a point by its distance t up the tube from the eye and s across it
    const at = (t, s) => [EX + ux * t + nx * s, EY + uy * t + ny * s];
    const poly = (p, pts) => { pts.forEach(([t, s], i) => { const [x, y] = at(t, s); if (i) p.lineTo(x, y); else p.moveTo(x, y); }); p.closePath(); };
    const seg = (p, t0, t1, w0, w1 = w0, s = 0) => poly(p, [[t0, s - w0], [t1, s - w1], [t1, s + w1], [t0, s + w0]]);
    const circle = (p, x, y, R) => { p.moveTo(x + R, y); p.arc(x, y, R, 0, TAU); };
    // the brass, eye end first: from, to, half width at each end, offset across
    const TUBE = [[14, 34, 13.5, 13.5], [44, 54, 13.5, 13.5], [34, 44, 16, 16], [54, 62, 20, 20], [62, 148, 24, 24], [148, 156, 31, 31], [156, 188, 37, 37], [188, 196, 40, 40], [196, 228, 40, 50], [228, 402, 50, 50], [402, 416, 56, 56], [250, 262, 54, 54], [332, 344, 54, 54]];
    const FS = -74, FINDER = [[256, 264, 8, 8, -57], [338, 346, 8, 8, -57], [232, 244, 6, 6, FS], [244, 388, 10, 10, FS], [388, 398, 12.6, 12.6, FS]];
    const PARTS = FINDER.concat(TUBE);
    const DEC = { x: 272, y: 408, R: 84 }, HOUR = { x: 272, y: 524, rx: 80, ry: 14, h: 22 }, WHEEL = { x: 128, y: 538, R: 23 };
    const FOCUS = (() => { const [x, y] = at(172, 2); return { x, y, R: 27 }; })();
    const rod = (p, w) => {
      const ax = 206, ay = 468, bx = WHEEL.x + 8, by = WHEEL.y - 8, l = Math.hypot(bx - ax, by - ay), ox = ((ay - by) / l) * w, oy = ((bx - ax) / l) * w;
      p.moveTo(ax - ox, ay - oy); p.lineTo(ax + ox, ay + oy); p.lineTo(bx + ox, by + oy); p.lineTo(bx - ox, by - oy); p.closePath();
    };
    function cyl(p, x, y, rx, ry, h) {
      p.moveTo(x + rx, y - h); p.ellipse(x, y - h, rx, ry, 0, 0, TAU);
      p.rect(x - rx, y - h, rx * 2, h);
      p.moveTo(x + rx, y); p.ellipse(x, y, rx, ry, 0, 0, Math.PI);
    }
    const region = new Path2D();
    for (const [t0, t1, a, b, s] of PARTS) seg(region, t0, t1, a, b, s || 0);
    circle(region, DEC.x, DEC.y, DEC.R); circle(region, FOCUS.x, FOCUS.y, FOCUS.R); circle(region, WHEEL.x, WHEEL.y, WHEEL.R);
    cyl(region, HOUR.x, HOUR.y, HOUR.rx, HOUR.ry, HOUR.h);
    rod(region, 3);
    // the whole shape at once, for its shadow on the wall
    const shape = new Path2D();
    poly(shape, [[14, -13.5], [54, -13.5], [54, -24], [148, -24], [148, -37], [196, -40], [228, -50], [416, -56], [416, 56], [228, 50], [196, 40], [148, 37], [148, 24], [54, 24], [54, 13.5], [14, 13.5]]);
    const rounds = new Path2D(); circle(rounds, DEC.x, DEC.y, DEC.R); circle(rounds, WHEEL.x, WHEEL.y, WHEEL.R); cyl(rounds, HOUR.x, HOUR.y, HOUR.rx, HOUR.ry, HOUR.h);
    const spy = new Path2D(); seg(spy, 232, 398, 10, 10, FS);
    const eyecup = new Path2D(); poly(eyecup, [[0, -17], [3, -18], [11, -16], [15, -14], [15, 14], [11, 16], [3, 18], [0, 17]]);

    function part(c, t0, t1, w0, w1, s, stops) {
      const p = new Path2D(); seg(p, t0, t1, w0, w1, s);
      const w = Math.max(w0, w1), [ax, ay] = at((t0 + t1) / 2, s - w), [bx, by] = at((t0 + t1) / 2, s + w);
      c.fillStyle = lin(c, ax, ay, bx, by, stops); c.fill(p);
    }
    // a line right round the tube
    function hoop(c, t, w, col, lw, s = 0) {
      const [ax, ay] = at(t, s - w), [bx, by] = at(t, s + w);
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    }
    // the milling on a ring: lines side by side, closer towards its edges
    function milled(c, t0, t1, w, n) {
      c.strokeStyle = 'rgba(70,46,14,0.6)'; c.lineWidth = 0.9; c.beginPath();
      for (let k = 0; k < n; k++) { const s = Math.sin(((k + 0.5) / n - 0.5) * Math.PI) * w, [ax, ay] = at(t0, s), [bx, by] = at(t1, s); c.moveTo(ax, ay); c.lineTo(bx, by); }
      c.stroke();
    }
    // the shoulders and rings where one part meets the next
    const JOINS = [[34, 16], [44, 16], [54, 20], [62, 24], [148, 31], [156, 37], [188, 40], [196, 40], [228, 50], [250, 54], [262, 54], [332, 54], [344, 54], [402, 56], [416, 56]];
    function telescope(c) {
      for (const [t0, t1, a, b, s] of PARTS) part(c, t0, t1, a, b, s || 0, BRASS);
      for (const [t, w] of JOINS) { hoop(c, t, w, 'rgba(60,38,10,0.5)', 1.2); hoop(c, t + 1.2, w, 'rgba(255,244,205,0.5)', 0.8); }
      for (const [t, w] of [[240, 50], [392, 50], [172, 37]]) { hoop(c, t, w, 'rgba(60,38,10,0.34)', 0.8); hoop(c, t + 3, w, 'rgba(60,38,10,0.34)', 0.8); }
      hoop(c, 244, 10, 'rgba(60,38,10,0.5)', 1, FS); hoop(c, 388, 12.6, 'rgba(60,38,10,0.5)', 1, FS);
      milled(c, 34.5, 43.5, 15.6, 22); milled(c, 402.5, 415.5, 55.6, 56);
      // the little silvered scale on the drawtube
      const strip = new Path2D(); poly(strip, [[68, 6], [144, 6], [144, 19], [68, 19]]);
      c.fillStyle = lin(c, ...at(106, 6), ...at(106, 19), [[0, '#f4f2ea'], [1, '#bdb8a8']]); c.fill(strip);
      c.strokeStyle = 'rgba(60,44,20,0.7)'; c.lineWidth = 0.8; c.stroke(strip);
      c.strokeStyle = '#3e3424'; c.lineWidth = 0.7; c.beginPath();
      for (let k = 0; k <= 34; k++) { const [ax, ay] = at(71 + k * 2, 6.5), [bx, by] = at(71 + k * 2, k % 5 ? 10 : 12.5); c.moveTo(ax, ay); c.lineTo(bx, by); }
      c.stroke();
      c.fillStyle = '#3e3424'; c.font = 'bold 6px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let k = 0; k <= 6; k++) { const [x, y] = at(71 + k * 10, 15.4); c.save(); c.translate(x, y); c.rotate(SLOPE); c.fillText(String(k), 0, 0); c.restore(); }
      // the name cut along the barrel
      c.save(); c.translate(...at(316, 17)); c.rotate(SLOPE);
      c.font = 'bold 10.5px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      cut(c, 'OWL HILL OBSERVATORY', 0, 0); c.font = 'italic bold 8.5px Georgia, "Times New Roman", serif'; cut(c, 'No. 7, 1887', 0, 13);
      c.restore();
      // the focusing wheel, milled round its edge
      const { x, y, R } = FOCUS;
      dot(c, x + 2, y + 3, R + 1, 'rgba(50,30,8,0.45)');
      c.fillStyle = rad(c, x - R * 0.4, y - R * 0.44, 2, x, y, R, [[0, '#fbeab0'], [0.55, '#dcb04a'], [1, '#8f6c26']]); c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip(); turned(c, x, y, R, [[-0.9, 0.24, 0.34], [2.2, 0.26, 0.28]]); c.restore();
      c.strokeStyle = 'rgba(70,46,14,0.6)'; c.lineWidth = 1; c.beginPath();
      for (let k = 0; k < 64; k++) { const a = (k / 64) * TAU; c.moveTo(x + Math.cos(a) * (R - 4.4), y + Math.sin(a) * (R - 4.4)); c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } c.stroke();
      c.strokeStyle = 'rgba(70,46,14,0.45)'; c.lineWidth = 0.9; c.beginPath(); c.arc(x, y, R - 5, 0, TAU); c.moveTo(x + R - 12, y); c.arc(x, y, R - 12, 0, TAU); c.stroke();
      stud(c, x, y, 7);
      c.fillStyle = '#3a2810'; c.save(); c.translate(x, y); c.rotate(0.5); c.fillRect(-6, -1, 12, 2); c.restore();
    }
    function stud(c, x, y, s) {
      dot(c, x + 0.6, y + 0.8, s + 0.6, 'rgba(50,30,8,0.5)');
      c.fillStyle = rad(c, x - s * 0.36, y - s * 0.4, 0.3, x, y, s, [[0, '#fff2c0'], [0.5, '#e0b652'], [1, '#8a6824']]); c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill();
    }
    // the big graduated circle: turned brass with a silvered ring cut in degrees
    function bigCircle(c) {
      const { x, y, R } = DEC, R1 = R - 7, R0 = R - 27;
      c.fillStyle = rad(c, x - 30, y - 34, 6, x, y, R, [[0, '#eccb78'], [0.6, '#c99a3a'], [1, '#8a6824']]); c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip(); turned(c, x, y, R, [[-0.8, 0.24, 0.3], [2.34, 0.24, 0.3], [0.8, 0.14, 0.12], [-2.4, 0.14, 0.12]]); c.restore();
      c.strokeStyle = 'rgba(70,46,14,0.55)'; c.lineWidth = 1; c.beginPath();
      for (let k = 0; k < 150; k++) { const a = (k / 150) * TAU; c.moveTo(x + Math.cos(a) * (R - 3.6), y + Math.sin(a) * (R - 3.6)); c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } c.stroke();
      c.strokeStyle = 'rgba(70,46,14,0.2)'; c.lineWidth = 0.7; c.beginPath(); for (let k = 28; k < R0; k += 4.4) { c.moveTo(x + k, y); c.arc(x, y, k, 0, TAU); } c.stroke();
      const ring = new Path2D(); ring.arc(x, y, R1, 0, TAU); ring.arc(x, y, R0, 0, TAU, true);
      c.fillStyle = lin(c, x - R, y - R, x + R, y + R, [[0, '#fbfaf4'], [0.4, '#d9d6cc'], [0.62, '#f2f0e8'], [1, '#aaa698']]); c.fill(ring);
      c.save(); c.clip(ring, 'evenodd'); turned(c, x, y, R, [[-0.8, 0.2, 0.24], [2.34, 0.2, 0.24]]); c.restore();
      c.strokeStyle = 'rgba(60,38,10,0.6)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, R1, 0, TAU); c.moveTo(x + R0, y); c.arc(x, y, R0, 0, TAU); c.moveTo(x + R - 5, y); c.arc(x, y, R - 5, 0, TAU); c.stroke();
      c.strokeStyle = '#332a1c'; c.lineWidth = 0.6; c.beginPath();
      for (let k = 0; k < 180; k++) { const a = (k / 180) * TAU, l = k % 15 === 0 ? 9 : k % 5 === 0 ? 7 : 3.6; c.moveTo(x + Math.cos(a) * R1, y + Math.sin(a) * R1); c.lineTo(x + Math.cos(a) * (R1 - l), y + Math.sin(a) * (R1 - l)); }
      c.stroke();
      c.fillStyle = '#332a1c'; c.font = 'bold 7.4px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; c.save(); c.translate(x + Math.sin(a) * (R1 - 14), y - Math.cos(a) * (R1 - 14)); c.rotate(a); c.fillText(String(k * 30), 0, 0); c.restore(); }
      // the hub with its clamp, and the index that reads the scale
      dot(c, x + 1, y + 2, 27, 'rgba(50,30,8,0.4)');
      c.fillStyle = rad(c, x - 9, y - 10, 2, x, y, 26, [[0, '#fff0b8'], [0.5, '#e2b851'], [1, '#8a6824']]); c.beginPath(); c.arc(x, y, 26, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(70,46,14,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 20, 0, TAU); c.stroke();
      for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU + 0.26; stud(c, x + Math.cos(a) * 15.5, y + Math.sin(a) * 15.5, 2.7); }
      stud(c, x, y, 7);
      c.fillStyle = lin(c, x - 7, 0, x + 7, 0, BRASS); c.beginPath(); c.moveTo(x - 6, y - R0 + 4); c.lineTo(x + 6, y - R0 + 4); c.lineTo(x + 3, y - R0 - 10); c.lineTo(x, y - R0 - 15); c.lineTo(x - 3, y - R0 - 10); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(60,38,10,0.6)'; c.lineWidth = 0.8; c.stroke();
    }
    // the hour circle, a shallow drum round the head of the pier
    function hourCircle(c) {
      const { x, y, rx, ry, h } = HOUR;
      const side = new Path2D(); side.rect(x - rx, y - h, rx * 2, h); side.moveTo(x + rx, y); side.ellipse(x, y, rx, ry, 0, 0, Math.PI);
      c.fillStyle = lin(c, x - rx, 0, x + rx, 0, BRASS); c.fill(side);
      c.fillStyle = rad(c, x - 30, y - h - 4, 4, x, y - h, rx, [[0, '#f8e39b'], [1, '#c99a3a']]); c.beginPath(); c.ellipse(x, y - h, rx, ry, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(90,60,20,0.5)'; c.lineWidth = 0.8; c.stroke();
      c.strokeStyle = 'rgba(60,38,10,0.55)'; c.lineWidth = 0.7; c.beginPath();
      for (let k = -24; k <= 24; k++) {
        const a = k * 0.058, px = x + Math.sin(a) * rx, py = y - h + 1 + Math.cos(a) * ry;
        c.moveTo(px, py); c.lineTo(px, py + (k % 4 === 0 ? 7 : 4));
      }
      c.stroke();
      c.font = 'bold 8px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      ['IX', 'X', 'XI', 'XII', 'I', 'II', 'III'].forEach((t, i) => {
        const a = (i - 3) * 0.4; c.save(); c.translate(x + Math.sin(a) * rx, y - h + 15 + Math.cos(a) * ry); c.scale(Math.cos(a), 1); cut(c, t, 0, 0); c.restore();
      });
    }
    function handWheel(c) {
      c.fillStyle = '#b98a2f'; const p = new Path2D(); rod(p, 3); c.fill(p);
      c.strokeStyle = 'rgba(255,244,205,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(206, 466.6); c.lineTo(WHEEL.x + 7, WHEEL.y - 10); c.stroke();
      for (const k of [0.3, 0.7]) { const x = U.lerp(206, WHEEL.x + 8, k), y = U.lerp(468, WHEEL.y - 8, k); c.save(); c.translate(x, y); c.rotate(Math.atan2(WHEEL.y - 476, WHEEL.x - 198) + HALF); c.fillStyle = lin(c, -5, 0, 5, 0, BRASS); c.fillRect(-5, -2.4, 10, 4.8); c.restore(); }
      const { x, y, R } = WHEEL;
      c.fillStyle = '#0f1230'; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      for (let k = 0; k < 4; k++) { c.save(); c.translate(x, y); c.rotate((k / 4) * TAU + 0.5); c.fillStyle = lin(c, -3.6, 0, 3.6, 0, BRASS); c.fillRect(-3.2, 0, 6.4, R - 3); c.restore(); }
      c.strokeStyle = lin(c, x - R, y - R, x + R, y + R, BRASS); c.lineWidth = 6.4; c.beginPath(); c.arc(x, y, R - 3.2, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(70,46,14,0.55)'; c.lineWidth = 0.9; c.beginPath();
      for (let k = 0; k < 48; k++) { const a = (k / 48) * TAU; c.moveTo(x + Math.cos(a) * (R - 3), y + Math.sin(a) * (R - 3)); c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } c.stroke();
      stud(c, x, y, 7.4);
    }
    return {
      family: 'wipe', particle: 'suds', region, fillRule: 'nonzero',
      tough: (x, y) => (nz.fbm(x * 0.06 + 31, y * 0.06, 4) > 0.6 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(seed + 1);
        // the inside of the dome: ribs running up to the crown, rings across them
        const ZX = 300, ZY = -300;
        const g = ramp(['#151a40', '#1b214e', '#232a62', '#2a316e']);
        field(c, x0, y0, x1, 472, 3, (x, y) => g(U.clamp((nz.fbm(x * 0.012 + 5, y * 0.012, 3) - 0.3) * 2.2 + (1 - Math.hypot(x - 56, y - 104) / 400) * 0.5, 0, 1)));
        for (let a = 0.4; a < 2.8; a += 0.044) { c.strokeStyle = 'rgba(6,8,28,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ZX, ZY); c.lineTo(ZX + Math.cos(a) * 1200, ZY + Math.sin(a) * 1200); c.stroke(); }
        for (let a = 0.5; a < 2.8; a += 0.22) { c.strokeStyle = '#2c3370'; c.lineWidth = 8; c.beginPath(); c.moveTo(ZX, ZY); c.lineTo(ZX + Math.cos(a) * 1200, ZY + Math.sin(a) * 1200); c.stroke(); c.strokeStyle = 'rgba(190,190,255,0.14)'; c.lineWidth = 1.4; c.stroke(); }
        for (const rr of [420, 500, 590, 690]) {
          c.strokeStyle = 'rgba(6,8,28,0.5)'; c.lineWidth = 10; c.beginPath(); c.arc(ZX, ZY + 4, rr, 0.3, 2.9); c.stroke();
          c.strokeStyle = '#2c3370'; c.lineWidth = 8; c.beginPath(); c.arc(ZX, ZY, rr, 0.3, 2.9); c.stroke();
          c.strokeStyle = 'rgba(190,190,255,0.16)'; c.lineWidth = 1.2; c.beginPath(); c.arc(ZX, ZY, rr - 3.4, 0.3, 2.9); c.stroke();
        }
        // the slit, with the night in it
        const slit = new Path2D(); slit.moveTo(236, y0); slit.lineTo(248, 36); slit.quadraticCurveTo(300, 150, x1 + 80, 262); slit.lineTo(x1 + 80, y0); slit.closePath();
        c.save(); c.clip(slit);
        c.fillStyle = lin(c, 0, y0, 0, 270, [[0, '#0a0e2c'], [1, '#1c2466']]); c.fillRect(200, y0, x1 - 200, 270 - y0);
        for (let i = 0; i < 90; i++) dot(c, 230 + q() * (x1 - 230), y0 + q() * (262 - y0), 0.5 + q() * 0.8, `rgba(255,246,220,${(0.4 + q() * 0.6).toFixed(2)})`);
        for (const [x, y] of [[300, 24], [346, 52], [272, 56]]) glint(c, x, y, 4.6, '#fff4d2');
        c.restore();
        c.strokeStyle = '#4a3a30'; c.lineWidth = 7; c.stroke(slit); c.strokeStyle = 'rgba(255,214,160,0.3)'; c.lineWidth = 1.2; c.stroke(slit);
        // the painted tube, on past the last ring
        const paint = new Path2D(); seg(paint, 416, 900, 52);
        c.fillStyle = lin(c, ...at(500, -52), ...at(500, 52), [[0, '#11153a'], [0.3, '#3c4596'], [0.5, '#2a3072'], [1, '#0c0f2c']]); c.fill(paint);
        c.strokeStyle = 'rgba(232,200,120,0.6)'; c.lineWidth = 1; for (const s of [-40, 40]) { c.beginPath(); c.moveTo(...at(418, s)); c.lineTo(...at(900, s)); c.stroke(); }
        // the lamp on the wall and the shelf beside it
        oilLamp(c, 58, 104);
        c.fillStyle = 'rgba(8,8,28,0.34)'; c.fillRect(x0, 240, 124 - x0, 8);
        c.fillStyle = '#8a5a35'; c.fillRect(x0, 232, 122 - x0, 8);
        c.fillStyle = 'rgba(255,220,170,0.34)'; c.fillRect(x0, 232, 122 - x0, 1.6);
        for (const x of [24, 100]) { c.fillStyle = '#6b4228'; c.beginPath(); c.moveTo(x - 3, 240); c.lineTo(x + 3, 240); c.lineTo(x + 3, 256); c.closePath(); c.fill(); }
        let bx = 8;
        for (const [w, h, col] of [[11, 38, '#7a2a2a'], [9, 34, '#3f5e4b'], [12, 40, '#b58a3e'], [8, 30, '#2f3a6a'], [10, 36, '#7a2a2a']]) {
          c.fillStyle = col; c.fillRect(bx, 232 - h, w, h);
          c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(bx + 1, 232 - h, 2, h);
          c.fillStyle = '#e3c37a'; c.fillRect(bx, 232 - h + 6, w, 1.4); c.fillRect(bx, 232 - 9, w, 1.4);
          bx += w + 0.6;
        }
        c.fillStyle = '#6b4228'; c.beginPath(); c.roundRect(64, 208, 52, 24, 2); c.fill();
        c.fillStyle = '#7f5230'; c.fillRect(64, 208, 52, 8);
        c.fillStyle = 'rgba(30,14,6,0.4)'; c.fillRect(64, 216, 52, 1.2);
        c.fillStyle = lin(c, 86, 0, 94, 0, BRASS); c.fillRect(87, 213, 6, 8);
        // a map of the moon pinned to the boards
        c.save(); c.translate(56, 318); c.rotate(-0.03);
        c.fillStyle = 'rgba(6,8,28,0.4)'; c.fillRect(-37, -35, 80, 80);
        c.fillStyle = '#efe4c8'; c.fillRect(-40, -39, 80, 80);
        c.fillStyle = rad(c, -6, -8, 2, 0, 0, 31, [[0, '#f8f4e6'], [0.7, '#d9d3c0'], [1, '#a9a290']]); c.beginPath(); c.arc(0, 0, 31, 0, TAU); c.fill();
        for (const [mx, my, s] of [[-10, -12, 8], [8, -16, 5], [13, 4, 9], [-14, 10, 6], [2, 18, 4.4], [-1, -1, 3.4], [-20, -4, 3]]) dot(c, mx, my, s, 'rgba(112,106,92,0.42)');
        for (const [mx, my] of [[-4, -22], [19, -8], [-22, 8], [10, 15]]) dot(c, mx, my, 1.5, 'rgba(90,84,72,0.6)');
        dot(c, -32, -33, 2, '#b0352c'); dot(c, 32, -33, 2, '#b0352c');
        c.restore();
        // the drum wall below the dome, its rail and the floor
        c.fillStyle = '#2d2850'; c.fillRect(x0, 472, x1 - x0, FLOOR - 472);
        for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { c.fillStyle = 'rgba(8,6,28,0.45)'; c.fillRect(x, 480, 1.4, FLOOR - 480); c.fillStyle = 'rgba(180,170,240,0.1)'; c.fillRect(x + 1.4, 480, 1.2, FLOOR - 480); }
        c.fillStyle = '#7a4c2c'; c.fillRect(x0, 470, x1 - x0, 11);
        c.fillStyle = 'rgba(255,220,170,0.3)'; c.fillRect(x0, 470, x1 - x0, 1.6);
        c.fillStyle = 'rgba(8,6,28,0.4)'; c.fillRect(x0, 481, x1 - x0, 5);
        c.fillStyle = '#6b4228'; c.fillRect(x0, FLOOR - 8, x1 - x0, 8);
        const fl = ramp(['#6a4226', '#7e5230', '#93653c']);
        field(c, x0, FLOOR, x1, y1, 3, (x, y) => fl(nz.fbm(x * 0.01 + 3, y * 0.09, 4)));
        c.strokeStyle = 'rgba(40,20,10,0.4)'; c.lineWidth = 1;
        for (let k = -14; k <= 14; k++) { c.beginPath(); c.moveTo(180 + k * 34, FLOOR); c.lineTo(180 + k * 70, y1); c.stroke(); }
        c.fillStyle = lin(c, 0, FLOOR, 0, FLOOR + 16, [[0, 'rgba(20,10,8,0.4)'], [1, 'rgba(20,10,8,0)']]); c.fillRect(x0, FLOOR, x1 - x0, 16);
        // the iron pier: a head under the saddle, a fluted column, a wide foot
        const X = HOUR.x;
        c.fillStyle = 'rgba(16,8,6,0.4)'; c.beginPath(); c.ellipse(X - 6, 596, 92, 8, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, X - 66, 0, X + 66, 0, [[0, '#0e1130'], [0.34, '#39417e'], [0.56, '#232a5a'], [1, '#0c0e28']]);
        c.beginPath(); c.moveTo(X - 38, 520); c.lineTo(X - 42, 566); c.quadraticCurveTo(X - 46, 584, X - 72, 592); c.lineTo(X - 72, 598); c.lineTo(X + 72, 598); c.lineTo(X + 72, 592); c.quadraticCurveTo(X + 46, 584, X + 42, 566); c.lineTo(X + 38, 520); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(8,8,28,0.6)'; c.lineWidth = 1.4; for (const k of [-27, -15, -5, 5, 15, 27]) { c.beginPath(); c.moveTo(X + k, 530); c.lineTo(X + k * 1.1, 572); c.stroke(); }
        c.strokeStyle = 'rgba(232,200,120,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(X - 44, 572); c.lineTo(X + 44, 572); c.moveTo(X - 66, 590); c.lineTo(X + 66, 590); c.stroke();
        // and the iron fork that carries the tube by its two rings
        c.lineCap = 'round';
        for (const [t, x, y] of [[256, 256, 352], [338, 306, 352]]) {
          const [ax, ay] = at(t, 54);
          c.strokeStyle = '#0a0c24'; c.lineWidth = 27; c.beginPath(); c.moveTo(ax, ay); c.lineTo(x, y); c.stroke();
          c.strokeStyle = lin(c, x - 14, 0, x + 14, 0, [[0, '#343c7a'], [0.4, '#20265a'], [1, '#10122f']]); c.lineWidth = 23; c.stroke();
          c.strokeStyle = 'rgba(232,200,120,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(ax - 7, ay + 4); c.lineTo(x - 7, y); c.stroke();
        }
        c.lineCap = 'butt';
        softShadow(c, shape, 16, 0.36, 9, 14); softShadow(c, spy, 10, 0.3, 7, 10); softShadow(c, rounds, 14, 0.34, 8, 9);
        // the ebony eyecup
        c.fillStyle = lin(c, ...at(8, -18), ...at(8, 18), [[0, '#1a1614'], [0.3, '#6f6660'], [0.46, '#2c2622'], [1, '#0e0c0b']]); c.fill(eyecup);
        c.strokeStyle = 'rgba(255,240,220,0.3)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(...at(1, -12)); c.lineTo(...at(1, 12)); c.stroke();
      },
      clean(c) {
        hourCircle(c);
        handWheel(c);
        bigCircle(c);
        telescope(c);
      },
      cleanOver(c) {
        // the lamp along the barrel and the drawtube
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(255,252,232,0.5)'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(...at(232, -22)); c.lineTo(...at(398, -22)); c.stroke();
        c.lineWidth = 2; c.beginPath(); c.moveTo(...at(66, -9)); c.lineTo(...at(146, -9)); c.stroke();
        c.strokeStyle = 'rgba(255,252,232,0.32)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(...at(248, FS - 3)); c.lineTo(...at(386, FS - 3)); c.stroke();
        for (const [x, y, s] of [[DEC.x - 44, DEC.y - 62, 6], [FOCUS.x - 11, FOCUS.y - 14, 4.6]]) glint(c, x, y, s, 'rgba(255,255,240,0.85)');
      },
      dirt(c) {
        const q = U.rng(seed + 3);
        const g = ramp(['#322a1c', '#493d26', '#5e5030', '#73643a', '#867747']), verd = U.hex('#5c8a74');
        field(c, 0, 40, W, 560, 2, (x, y) => {
          const col = g(U.clamp((nz.fbm(x * 0.035 + 17, y * 0.035, 5) - 0.26) * 1.9, 0, 1));
          const k = U.smooth(0.55, 0.74, nz.fbm(x * 0.05 + 60, y * 0.05 + 3, 4)) * 0.46;
          return [U.lerp(col[0], verd[0], k), U.lerp(col[1], verd[1], k), U.lerp(col[2], verd[2], k)];
        });
        // it keeps its shape under the tarnish: dark sides and a dull sheen
        const DULL = [[0, 'rgba(16,10,5,0.62)'], [0.3, 'rgba(255,226,170,0.18)'], [0.54, 'rgba(0,0,0,0)'], [1, 'rgba(16,10,5,0.66)']];
        for (const [t0, t1, a, b, s] of PARTS) part(c, t0, t1, a, b, s || 0, DULL);
        for (const [t, w] of JOINS) { hoop(c, t, w, 'rgba(20,12,6,0.6)', 1.4); hoop(c, t + 1.4, w, 'rgba(230,214,170,0.2)', 0.8); }
        milled(c, 34.5, 43.5, 15.6, 22); milled(c, 402.5, 415.5, 55.6, 56);
        // the circles: a darker rim, the ring and its cuts just showing
        const { x, y, R } = DEC;
        c.fillStyle = rad(c, x - 26, y - 30, 8, x, y, R, [[0, 'rgba(255,226,170,0.14)'], [0.7, 'rgba(0,0,0,0)'], [1, 'rgba(16,10,5,0.5)']]); c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(20,12,6,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, R - 7, 0, TAU); c.moveTo(x + R - 27, y); c.arc(x, y, R - 27, 0, TAU); c.moveTo(x + 26, y); c.arc(x, y, 26, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(20,12,6,0.34)'; c.lineWidth = 0.7; c.beginPath();
        for (let k = 0; k < 90; k++) { const a = (k / 90) * TAU, l = k % 5 === 0 ? 8 : 4; c.moveTo(x + Math.cos(a) * (R - 7), y + Math.sin(a) * (R - 7)); c.lineTo(x + Math.cos(a) * (R - 7 - l), y + Math.sin(a) * (R - 7 - l)); }
        c.stroke();
        c.fillStyle = 'rgba(255,226,170,0.1)'; c.beginPath(); c.arc(x - 2, y - 2, 22, 0, TAU); c.fill();
        const f = FOCUS;
        c.fillStyle = rad(c, f.x - 8, f.y - 9, 2, f.x, f.y, f.R, [[0, 'rgba(255,226,170,0.16)'], [0.7, 'rgba(0,0,0,0)'], [1, 'rgba(16,10,5,0.55)']]); c.beginPath(); c.arc(f.x, f.y, f.R, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(20,12,6,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(f.x, f.y, f.R - 5, 0, TAU); c.moveTo(f.x + 8, f.y); c.arc(f.x, f.y, 8, 0, TAU); c.stroke();
        const h = HOUR;
        c.fillStyle = lin(c, h.x - h.rx, 0, h.x + h.rx, 0, DULL); c.fillRect(h.x - h.rx, h.y - h.h, h.rx * 2, h.h + h.ry);
        c.strokeStyle = 'rgba(20,12,6,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(h.x, h.y - h.h, h.rx, h.ry, 0, 0, TAU); c.stroke();
        const w = WHEEL;
        c.strokeStyle = 'rgba(20,12,6,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(w.x, w.y, w.R - 6.4, 0, TAU); c.moveTo(w.x + 7.4, w.y); c.arc(w.x, w.y, 7.4, 0, TAU); c.stroke();
        grime(c, q, 40, 60, 350, 530, 34);
        for (let i = 0; i < 12; i++) { const t = 70 + q() * 320, [fx, fy] = at(t, (q() - 0.5) * (t > 228 ? 70 : 28)); fingerprint(c, fx, fy, q() * 3, '30,22,12'); }
        for (let i = 0; i < 5; i++) { const a = q() * TAU, d = 34 + q() * 44; fingerprint(c, x + Math.cos(a) * d, y + Math.sin(a) * d, q() * 3, '30,22,12'); }
        for (let i = 0; i < 900; i++) { c.fillStyle = q() < 0.6 ? 'rgba(30,22,12,0.3)' : 'rgba(226,214,180,0.24)'; c.fillRect(q() * W, 50 + q() * 500, 1.2, 1.2); }
        // dust lying along the upper edges
        c.lineCap = 'round';
        for (const [t0, t1, s, lw] of [[232, 400, -47, 5], [64, 146, -22, 3.4], [246, 386, FS - 8, 3], [158, 186, -35, 3]]) { c.strokeStyle = 'rgba(206,198,178,0.4)'; c.lineWidth = lw; c.beginPath(); c.moveTo(...at(t0, s)); c.lineTo(...at(t1, s)); c.stroke(); }
        c.strokeStyle = 'rgba(206,198,178,0.34)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, R - 3, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      },
    };
  }

  // ------------------------------------------------- OWL HILL: THE STAR CHARTS
  // The map room, papered in indigo with small gold stars: the great chart of
  // the two skies on the wall, the long plan chest under it with a drawer left
  // open, an oak tub of rolled charts and map tubes, a lamp and a star globe on
  // the chest. Dust and old cobwebs sweep away and the room comes up deep blue
  // and gold in the lamplight.
  // attic { where: 'charts' }
  function chartRoom(S) {
    const { r, nz, bleed } = S;
    const seed = (r() * 1e6) | 0;
    const X0 = -6, X1 = 366, Y0 = 74, Y1 = 566, FLOOR = 552;
    const CH = { x0: 14, x1: 346, y0: 404, y1: 546, top: 390 };
    const CHART = { x: 24, y: 88, w: 312, h: 192 };
    const GLOBE = { x: 276, y: 326, R: 52 };
    const LAMP = { x: 168, y: 318 };
    const DRAWERS = [['NORTHERN SKY', 0], ['SOUTHERN SKY', 1], ['THE MOON', 2], ['COMETS', 3], ['THE PLANETS', 4]];
    const region = new Path2D(); region.rect(X0, Y0, X1 - X0, Y1 - Y0);

    function wall(c, x0, y0, x1, y1) {
      c.fillStyle = lin(c, 0, 0, 0, FLOOR, [[0, '#1b214e'], [1, '#262d62']]); c.fillRect(x0, y0, x1 - x0, y1 - y0);
      const s = 30, h = 26;
      for (let j = Math.floor(y0 / h); j * h < y1; j++) for (let i = Math.floor(x0 / s) - 1; i * s < x1; i++) glint(c, i * s + (j % 2 ? s / 2 : 0), j * h, 3.2, 'rgba(226,192,112,0.36)');
    }
    function floor(c, x0, y0, x1, y1) {
      const fl = ramp(['#5a3722', '#6e462a', '#845634']);
      field(c, x0, y0, x1, y1, 3, (x, y) => fl(nz.fbm(x * 0.01 + 3, y * 0.09, 4)));
      c.strokeStyle = 'rgba(30,14,8,0.4)'; c.lineWidth = 1;
      for (let k = -24; k <= 24; k++) { c.beginPath(); c.moveTo(180 + k * (26 + (y0 - FLOOR) * 0.28), y0); c.lineTo(180 + k * (26 + (y1 - FLOOR) * 0.28), y1); c.stroke(); }
    }
    // one sky on the chart: a blue disc with its grid, stars and figures
    function hemisphere(c, x, y, R, figs, q) {
      c.fillStyle = rad(c, x - R * 0.2, y - R * 0.24, 4, x, y, R, [[0, '#2c3a8c'], [0.7, '#1b2464'], [1, '#121847']]);
      c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
      c.strokeStyle = 'rgba(230,206,140,0.3)'; c.lineWidth = 0.6;
      for (const k of [0.34, 0.67]) { c.beginPath(); c.arc(x, y, R * k, 0, TAU); c.stroke(); }
      for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); c.stroke(); }
      c.setLineDash([2.4, 2.4]); c.strokeStyle = 'rgba(240,160,110,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(x + R * 0.1, y - R * 0.06, R * 0.86, R * 0.62, -0.3, 0, TAU); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 70; i++) { const a = q() * TAU, d = Math.sqrt(q()) * R; dot(c, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.4 + q() * 0.6, 'rgba(255,244,214,0.8)'); }
      for (const f of figs) {
        const px = (p) => [x + (f.x + p[0] * f.s) * R, y + (f.y + p[1] * f.s) * R];
        c.strokeStyle = 'rgba(242,216,150,0.8)'; c.lineWidth = 0.8;
        for (const l of f.fig) { c.beginPath(); l.forEach((p, i) => { const [a, b] = px(p); if (i) c.lineTo(a, b); else c.moveTo(a, b); }); c.stroke(); }
        for (const l of f.fig) for (const p of l) { const [a, b] = px(p); dot(c, a, b, 1.5, '#fff4d2'); }
      }
      c.restore();
      c.strokeStyle = '#a9812e'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
      c.strokeStyle = '#5a4420'; c.lineWidth = 0.7; c.beginPath();
      for (let k = 0; k < 72; k++) { const a = (k / 72) * TAU, l = k % 6 ? 2 : 3.6; c.moveTo(x + Math.cos(a) * (R + 1), y + Math.sin(a) * (R + 1)); c.lineTo(x + Math.cos(a) * (R + 1 + l), y + Math.sin(a) * (R + 1 + l)); }
      c.stroke();
    }
    function bigChart(c) {
      const { x, y, w, h } = CHART, q = U.rng(seed + 21), t = 11;
      c.fillStyle = 'rgba(6,6,26,0.45)'; c.fillRect(x + 5, y + 8, w, h);
      c.fillStyle = lin(c, x, y, x + w, y + h, [[0, '#7a4a2c'], [0.5, '#54301c'], [1, '#6e4026']]); c.fillRect(x, y, w, h);
      c.fillStyle = 'rgba(255,226,180,0.3)'; c.fillRect(x, y, w, 2); c.fillRect(x, y, 2, h);
      c.fillStyle = 'rgba(20,8,4,0.34)'; c.fillRect(x, y + h - 2, w, 2); c.fillRect(x + w - 2, y, 2, h);
      c.strokeStyle = 'rgba(30,14,6,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + t, y + t); c.moveTo(x + w, y); c.lineTo(x + w - t, y + t); c.moveTo(x, y + h); c.lineTo(x + t, y + h - t); c.moveTo(x + w, y + h); c.lineTo(x + w - t, y + h - t); c.stroke();
      c.fillStyle = lin(c, x, y, x + w, y + h, [[0, '#e7c870'], [0.5, '#a9812e'], [1, '#e7c870']]); c.fillRect(x + t - 2, y + t - 2, w - 2 * t + 4, h - 2 * t + 4);
      const px = x + t, py = y + t, pw = w - 2 * t, ph = h - 2 * t;
      c.fillStyle = lin(c, px, py, px + pw, py + ph, [[0, '#f4ead0'], [1, '#e7d8b4']]); c.fillRect(px, py, pw, ph);
      for (let i = 0; i < 26; i++) dot(c, px + q() * pw, py + q() * ph, 0.8 + q() * 2.2, 'rgba(150,110,60,0.12)');
      c.strokeStyle = 'rgba(90,60,30,0.5)'; c.lineWidth = 0.7; c.strokeRect(px + 3.5, py + 3.5, pw - 7, ph - 7);
      c.fillStyle = '#2b2f5a'; c.font = 'bold 10.5px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('THE  STARRY  HEAVENS', x + w / 2, py + 13);
      const R = 61, ky = py + 24 + R + 3, ax = x + w / 2 - 74, bx = x + w / 2 + 74;
      hemisphere(c, ax, ky, R, [{ fig: [PLOUGH], x: -0.1, y: -0.34, s: 0.46 }, { fig: CASSIOPEIA, x: 0.42, y: 0.28, s: 0.34 }, { fig: CYGNUS, x: -0.42, y: 0.36, s: 0.34 }], q);
      hemisphere(c, bx, ky, R, [{ fig: ORION, x: -0.36, y: -0.28, s: 0.44 }, { fig: SCORPION, x: 0.36, y: 0.24, s: 0.46 }, { fig: CROSS, x: -0.3, y: 0.46, s: 0.3 }], q);
      c.fillStyle = '#5a4420'; c.font = 'italic bold 6.4px Georgia, "Times New Roman", serif';
      c.fillText('Northern Sky', ax, py + 21); c.fillText('Southern Sky', bx, py + 21);
      // a little sun and moon between the two skies
      const mx = x + w / 2;
      for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; c.strokeStyle = '#c98a2c'; c.lineWidth = 1; c.beginPath(); c.moveTo(mx + Math.cos(a) * 5, py + 40 + Math.sin(a) * 5); c.lineTo(mx + Math.cos(a) * 8.4, py + 40 + Math.sin(a) * 8.4); c.stroke(); }
      dot(c, mx, py + 40, 4.4, '#e7b84e');
      dot(c, mx, py + 128, 6, '#4a5088'); dot(c, mx + 2.6, py + 126.6, 5.2, '#ecdfbe');
    }
    // the star globe, deep blue with gold figures, in its brass meridian
    function starGlobe(c) {
      const { x, y, R } = GLOBE, foot = CH.top + 4;
      c.fillStyle = 'rgba(16,8,6,0.4)'; c.beginPath(); c.ellipse(x + 2, foot + 1, 34, 5, 0, 0, TAU); c.fill();
      c.fillStyle = lin(c, x - 26, 0, x + 26, 0, BRASS);
      c.beginPath(); c.moveTo(x - 7, y + R + 2); c.quadraticCurveTo(x - 4, foot - 12, x - 12, foot - 6); c.lineTo(x - 28, foot - 2); c.quadraticCurveTo(x, foot + 7, x + 28, foot - 2); c.lineTo(x + 12, foot - 6); c.quadraticCurveTo(x + 4, foot - 12, x + 7, y + R + 2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(70,46,14,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(x, foot - 3, 16, 3, 0, 0, Math.PI); c.stroke();
      c.fillStyle = rad(c, x - R * 0.34, y - R * 0.36, R * 0.06, x, y, R * 1.02, [[0, '#3f4fa8'], [0.46, '#222c76'], [0.82, '#141a50'], [1, '#0c1034']]);
      c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
      c.translate(x, y); c.rotate(0.38);
      c.strokeStyle = 'rgba(232,204,130,0.36)'; c.lineWidth = 0.7;
      for (const k of [0.34, 0.68, 0.94]) { c.beginPath(); c.ellipse(0, 0, R * k, R, 0, 0, TAU); c.stroke(); }
      c.beginPath(); c.moveTo(0, -R); c.lineTo(0, R); c.stroke();
      for (const k of [-0.66, -0.34, 0.34, 0.66]) { const w = R * Math.sqrt(1 - k * k); c.beginPath(); c.ellipse(0, R * k, w, w * 0.16, 0, 0, Math.PI); c.stroke(); }
      c.strokeStyle = 'rgba(240,180,110,0.7)'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, R, R * 0.14, 0, 0, Math.PI); c.stroke();
      c.strokeStyle = 'rgba(240,214,150,0.8)'; c.lineWidth = 1.1; c.setLineDash([3, 2]); c.beginPath(); c.ellipse(0, -2, R, R * 0.4, 0.42, 0, Math.PI); c.stroke(); c.setLineDash([]);
      c.rotate(-0.38);
      const q = U.rng(seed + 22);
      for (let i = 0; i < 90; i++) { const a = q() * TAU, d = Math.sqrt(q()) * R * 0.98; dot(c, Math.cos(a) * d, Math.sin(a) * d, 0.4 + q() * 0.7, 'rgba(255,244,214,0.85)'); }
      for (const f of [{ fig: ORION, x: 0.12, y: 0.24, s: 0.4 }, { fig: CASSIOPEIA, x: -0.34, y: -0.5, s: 0.32 }, { fig: CYGNUS, x: 0.42, y: -0.42, s: 0.3 }, { fig: [PLOUGH], x: -0.42, y: 0.1, s: 0.32 }]) {
        c.strokeStyle = 'rgba(242,216,150,0.9)'; c.lineWidth = 0.9;
        for (const l of f.fig) { c.beginPath(); l.forEach((p, i) => { const a = (f.x + p[0] * f.s) * R, b = (f.y + p[1] * f.s) * R; if (i) c.lineTo(a, b); else c.moveTo(a, b); }); c.stroke(); }
        for (const l of f.fig) for (const p of l) glint(c, (f.x + p[0] * f.s) * R, (f.y + p[1] * f.s) * R, 3, '#fff0c0');
      }
      c.restore();
      // the shine on the ball and the shade round its far side
      c.fillStyle = rad(c, x - R * 0.2, y - R * 0.2, R * 0.5, x, y, R, [[0, 'rgba(10,12,40,0)'], [1, 'rgba(6,8,30,0.6)']]); c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x - R * 0.44, y - R * 0.46, R * 0.16, R * 0.08, -0.7, 0, TAU); c.fill();
      // the meridian ring, slanting with the axis
      const M = R + 6.5;
      c.strokeStyle = 'rgba(20,10,8,0.3)'; c.lineWidth = 6; c.beginPath(); c.arc(x + 1.5, y + 2.4, M, -1.2, 1.94); c.stroke();
      c.strokeStyle = lin(c, x - M, y - M, x + M, y + M, BRASS); c.lineWidth = 5.4; c.beginPath(); c.arc(x, y, M, -1.2, 1.94); c.stroke();
      c.strokeStyle = 'rgba(70,46,14,0.55)'; c.lineWidth = 0.6; c.beginPath();
      for (let k = 0; k < 40; k++) { const a = -1.2 + (k / 40) * 3.14; c.moveTo(x + Math.cos(a) * (M - 2.6), y + Math.sin(a) * (M - 2.6)); c.lineTo(x + Math.cos(a) * (M + 0.6), y + Math.sin(a) * (M + 0.6)); } c.stroke();
      for (const a of [-1.2, 1.94]) { dot(c, x + Math.cos(a) * M, y + Math.sin(a) * M, 3.4, '#8a6a26'); dot(c, x + Math.cos(a) * M - 0.6, y + Math.sin(a) * M - 0.6, 1.8, '#f2d88a'); }
    }
    // a rolled chart or a map tube standing up: base at x, y, leaning by a
    function roll(c, x, y, h, w, a, kind) {
      c.save(); c.translate(x, y); c.rotate(a);
      const stops = kind === 'paper' ? [[0, '#9f8c62'], [0.3, '#f6edd4'], [0.62, '#e2d4b0'], [1, '#a08e66']]
        : kind === 'leather' ? [[0, '#3f1d14'], [0.3, '#a0583a'], [0.6, '#7a3e28'], [1, '#34160e']]
          : [[0, '#101538'], [0.3, '#4852a4'], [0.6, '#2a3274'], [1, '#0d1130']];
      c.fillStyle = lin(c, -w / 2, 0, w / 2, 0, stops); c.fillRect(-w / 2, -h, w, h);
      if (kind === 'paper') {
        c.fillStyle = '#efe3c6'; c.beginPath(); c.ellipse(0, -h, w / 2, w * 0.2, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(110,84,50,0.6)'; c.lineWidth = 0.7; for (const k of [0.8, 0.5, 0.2]) { c.beginPath(); c.ellipse(0, -h, (w / 2) * k, w * 0.2 * k, 0, 0.6, TAU); c.stroke(); }
        c.fillStyle = '#b0352c'; c.fillRect(-w / 2, -h * 0.5, w, 3.6); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(w * 0.16, -h * 0.5, w * 0.34, 3.6);
      } else {
        c.fillStyle = lin(c, -w / 2 - 1, 0, w / 2 + 1, 0, BRASS); c.fillRect(-w / 2 - 1, -h - 2, w + 2, 11); c.fillRect(-w / 2 - 0.5, -h * 0.46, w + 1, 3);
        c.fillStyle = '#f2d88a'; c.beginPath(); c.ellipse(0, -h - 2, w / 2 + 1, w * 0.2, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(70,46,14,0.6)'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(0, -h - 2, w / 2 - 1.4, w * 0.13, 0, 0, TAU); c.stroke();
      }
      c.restore();
    }
    function rolls(c) {
      const by = CH.top + 2;
      const X = 72, ROLLS = [[-22, 92, 14, -0.17, 'tin'], [20, 100, 15, 0.14, 'paper'], [-8, 110, 13, -0.07, 'paper'], [8, 116, 16, 0.05, 'leather'], [-30, 76, 13, -0.24, 'paper'], [30, 80, 14, 0.24, 'leather'], [0, 86, 12, 0.01, 'tin']];
      for (const [dx, h, w, a, kind] of ROLLS) roll(c, X + dx, by, h, w, a, kind);
      // the oak tub they stand in, with two brass hoops
      const top = by - 50;
      c.fillStyle = 'rgba(16,8,6,0.4)'; c.beginPath(); c.ellipse(X + 2, by + 3, 46, 5, 0, 0, TAU); c.fill();
      const tub = new Path2D(); tub.moveTo(X - 42, top); tub.quadraticCurveTo(X, top + 13, X + 42, top); tub.lineTo(X + 36, by); tub.quadraticCurveTo(X, by + 8, X - 36, by); tub.closePath();
      c.fillStyle = lin(c, X - 42, 0, X + 42, 0, [[0, '#4a2a18'], [0.3, '#a06c40'], [0.6, '#845430'], [1, '#3e2214']]); c.fill(tub);
      c.save(); c.clip(tub);
      c.strokeStyle = 'rgba(30,14,6,0.5)'; c.lineWidth = 1; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(X + k * 12, top); c.lineTo(X + k * 10.2, by + 6); c.stroke(); }
      for (const y of [top + 9, by - 13]) {
        c.strokeStyle = lin(c, X - 42, 0, X + 42, 0, BRASS); c.lineWidth = 5; c.beginPath(); c.moveTo(X - 44, y); c.quadraticCurveTo(X, y + 12, X + 44, y); c.stroke();
      }
      c.restore();
      c.strokeStyle = 'rgba(30,14,6,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X - 42, top); c.quadraticCurveTo(X, top + 13, X + 42, top); c.stroke();
    }
    function chestTop(c) {
      const { x0, x1, y0, top } = CH;
      const p = new Path2D(); p.moveTo(x0 + 12, top); p.lineTo(x1 - 12, top); p.lineTo(x1 + 2, y0); p.lineTo(x0 - 2, y0); p.closePath();
      c.fillStyle = lin(c, 0, top, 0, y0, [[0, '#7a4228'], [1, '#a2663e']]); c.fill(p);
      c.fillStyle = rad(c, LAMP.x, top + 6, 6, LAMP.x, top + 6, 150, [[0, 'rgba(255,214,150,0.5)'], [1, 'rgba(255,214,150,0)']]); c.fill(p);
    }
    function deskLamp(c) {
      const { x, y } = LAMP, foot = CH.top + 6;
      c.fillStyle = 'rgba(16,8,6,0.36)'; c.beginPath(); c.ellipse(x + 2, foot + 1, 24, 4.4, 0, 0, TAU); c.fill();
      c.fillStyle = lin(c, x - 24, 0, x + 24, 0, BRASS);
      c.beginPath(); c.moveTo(x - 22, foot); c.quadraticCurveTo(x - 8, foot - 7, x - 5, foot - 22); c.lineTo(x - 3, y + 26); c.lineTo(x + 3, y + 26); c.lineTo(x + 5, foot - 22); c.quadraticCurveTo(x + 8, foot - 7, x + 22, foot); c.quadraticCurveTo(x, foot + 6, x - 22, foot); c.fill();
      c.fillStyle = rad(c, x - 5, y + 17, 1, x, y + 20, 15, [[0, '#fff2c0'], [0.5, '#e2b851'], [1, '#7a5a1e']]); c.beginPath(); c.ellipse(x, y + 20, 14, 10, 0, 0, TAU); c.fill();
      // the glass shade, lit from inside
      c.fillStyle = lin(c, x - 40, 0, x + 40, 0, [[0, '#e8913a'], [0.3, '#ffcf7a'], [0.5, '#ffefb8'], [0.72, '#ffc768'], [1, '#df8430']]);
      c.beginPath(); c.moveTo(x - 40, y + 8); c.bezierCurveTo(x - 40, y - 26, x - 12, y - 34, x - 8, y - 38); c.lineTo(x + 8, y - 38); c.bezierCurveTo(x + 12, y - 34, x + 40, y - 26, x + 40, y + 8); c.quadraticCurveTo(x, y + 16, x - 40, y + 8); c.fill();
      c.strokeStyle = 'rgba(150,80,30,0.6)'; c.lineWidth = 1; c.stroke();
      c.strokeStyle = lin(c, x - 40, 0, x + 40, 0, BRASS); c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - 40, y + 8); c.quadraticCurveTo(x, y + 16, x + 40, y + 8); c.stroke();
      c.fillStyle = lin(c, x - 9, 0, x + 9, 0, BRASS); c.fillRect(x - 9, y - 41, 18, 4);
      c.fillStyle = 'rgba(255,250,235,0.8)'; c.beginPath(); c.ellipse(x - 2, y - 12, 13, 15, 0, 0, TAU); c.globalAlpha = 0.4; c.fill(); c.globalAlpha = 1;
    }
    // a rolled chart lying on the chest, dividers and a reading glass beside it
    function onChest(c) {
      const y = CH.top + 5;
      c.fillStyle = 'rgba(16,8,6,0.34)'; c.fillRect(204, y + 3, 56, 3);
      c.fillStyle = lin(c, 0, y - 8, 0, y + 4, [[0, '#f6edd4'], [0.6, '#dccdab'], [1, '#9f8c62']]); c.fillRect(204, y - 8, 46, 12);
      c.fillStyle = '#efe3c6'; c.beginPath(); c.ellipse(250, y - 2, 3, 6, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(110,84,50,0.6)'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(250, y - 2, 1.5, 3.2, 0, 0, TAU); c.stroke();
      c.fillStyle = '#b0352c'; c.fillRect(224, y - 8, 4, 12);
      // the reading glass
      c.save(); c.translate(118, y + 2); c.rotate(-0.16);
      c.fillStyle = 'rgba(16,8,6,0.3)'; c.beginPath(); c.ellipse(1, 3, 13, 3, 0, 0, TAU); c.fill();
      c.fillStyle = lin(c, 12, 0, 34, 0, BRASS); c.fillRect(11, -1.4, 22, 2.8);
      c.fillStyle = '#2a1a12'; c.beginPath(); c.roundRect(20, -2, 16, 4, 2); c.fill();
      c.strokeStyle = lin(c, -12, 0, 12, 0, BRASS); c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 12, 3.6, 0, 0, TAU); c.stroke();
      c.fillStyle = 'rgba(190,220,255,0.3)'; c.beginPath(); c.ellipse(0, 0, 11, 3, 0, 0, TAU); c.fill();
      c.restore();
    }
    function mahogany(c, x0, y0, x1, y1) {
      const g = ramp(['#45190d', '#5a2414', '#6e301b', '#843f24', '#97502e']);
      field(c, x0, y0, x1, y1, 2, (x, y) => g(U.clamp(0.42 + (nz.fbm(x * 0.012 + 5, y * 0.09, 3) - 0.5) * 1, 0, 1)));
    }
    function drawer(c, x0, x1, y, h, name) {
      const m = (x0 + x1) / 2;
      c.fillStyle = 'rgba(16,6,2,0.55)'; c.fillRect(x0 - 1, y - 1, x1 - x0 + 2, h + 2);
      c.save(); c.beginPath(); c.rect(x0, y, x1 - x0, h); c.clip(); mahogany(c, x0, y, x1, y + h); c.restore();
      c.fillStyle = 'rgba(255,214,170,0.22)'; c.fillRect(x0, y, x1 - x0, 1.4);
      c.fillStyle = 'rgba(16,6,2,0.3)'; c.fillRect(x0, y + h - 1.6, x1 - x0, 1.6);
      // the brass label frame, and a card written long ago
      c.fillStyle = lin(c, m - 34, 0, m + 34, 0, BRASS); c.fillRect(m - 34, y + h / 2 - 7, 68, 14);
      c.fillStyle = '#f2e8d0'; c.fillRect(m - 31.5, y + h / 2 - 5, 63, 10);
      c.fillStyle = '#2b2f5a'; c.font = 'italic bold 7px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, m, y + h / 2 + 0.4);
      // the cup pulls
      for (const px of [x0 + 54, x1 - 54]) {
        c.fillStyle = 'rgba(16,6,2,0.4)'; c.beginPath(); c.arc(px + 0.8, y + h / 2 - 2, 12, 0, Math.PI); c.fill();
        c.fillStyle = lin(c, px - 12, 0, px + 12, 0, BRASS); c.beginPath(); c.arc(px, y + h / 2 - 3.4, 12, 0, Math.PI); c.closePath(); c.fill();
        c.fillStyle = 'rgba(20,10,4,0.5)'; c.beginPath(); c.ellipse(px, y + h / 2 - 3.4, 11, 1.6, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,250,220,0.6)'; c.fillRect(px - 8, y + h / 2 + 1, 4, 1.2);
      }
    }
    function chest(c) {
      const { x0, x1, y0, y1 } = CH;
      c.fillStyle = 'rgba(8,6,20,0.4)'; c.fillRect(x0 - 8, FLOOR - 2, x1 - x0 + 16, 8);
      mahogany(c, x0, y0, x1, y1);
      c.fillStyle = 'rgba(255,214,170,0.26)'; c.fillRect(x0, y0, x1 - x0, 2);
      c.fillStyle = '#3c170c'; c.fillRect(x0, y1 - 3, x1 - x0, 3);
      for (const x of [x0 + 2, x1 - 30]) { c.fillStyle = '#4a1e10'; c.beginPath(); c.moveTo(x, y1); c.lineTo(x + 28, y1); c.lineTo(x + 26, y1 + 11); c.lineTo(x + 4, y1 + 11); c.closePath(); c.fill(); }
      const H0 = 25, gap = 2.6, top = y0 + 6;
      const rows = DRAWERS.map(([name, i]) => ({ name, i, y: top + i * (H0 + gap) }));
      for (const d of rows) if (d.i !== 1) drawer(c, x0 + 8, x1 - 8, d.y, H0, d.name);
      // the one left open: the sheets inside show above its front
      const d = rows[1], pull = 20;
      c.fillStyle = '#1a0a05'; c.fillRect(x0 + 7, d.y - 1, x1 - x0 - 14, pull + 6);
      c.fillStyle = '#efe3c6'; c.fillRect(x0 + 14, d.y + 4, x1 - x0 - 28, pull);
      c.fillStyle = '#20275f'; c.fillRect(x0 + 18, d.y + 6, x1 - x0 - 60, pull);
      c.fillStyle = '#f2d88a'; for (let k = 0; k < 18; k++) dot(c, x0 + 26 + k * 15, d.y + 8.6 + (k % 3) * 2.4, 0.9, '#f2d88a');
      c.fillStyle = 'rgba(10,4,2,0.34)'; c.fillRect(x0 + 2, d.y + pull + H0 + 5, x1 - x0 - 4, 6);
      drawer(c, x0 + 2, x1 - 2, d.y + pull, H0 + 5, d.name);
    }
    function room(c) {
      wall(c, X0, Y0 - 4, X1, FLOOR);
      c.fillStyle = 'rgba(8,8,30,0.3)'; c.fillRect(X0, Y0, X1 - X0, 5);
      // the lamp warms the paper near it
      c.fillStyle = rad(c, LAMP.x, LAMP.y, 8, LAMP.x, LAMP.y, 190, [[0, 'rgba(255,190,110,0.5)'], [0.4, 'rgba(255,180,100,0.2)'], [1, 'rgba(255,170,90,0)']]); c.fillRect(X0, Y0, X1 - X0, FLOOR - Y0);
      c.fillStyle = '#3a2418'; c.fillRect(X0, FLOOR - 14, X1 - X0, 14);
      c.fillStyle = 'rgba(255,214,170,0.2)'; c.fillRect(X0, FLOOR - 14, X1 - X0, 1.4);
      floor(c, X0, FLOOR, X1, Y1 + 2);
      bigChart(c);
      chestTop(c);
      rolls(c);
      starGlobe(c);
      onChest(c);
      deskLamp(c);
      chest(c);
    }
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 24 || x > 336 || y > 540 || y < 90 ? 1.4 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(seed + 1);
        wall(c, x0, y0, x1, FLOOR);
        // the ceiling, painted with stars, and a deep moulding along the wall
        c.fillStyle = lin(c, 0, y0, 0, 58, [[0, '#10143a'], [1, '#191f4c']]); c.fillRect(x0, y0, x1 - x0, 58 - y0);
        for (let i = 0; i < 70; i++) dot(c, x0 + q() * (x1 - x0), y0 + q() * (54 - y0), 0.5 + q() * 0.9, 'rgba(240,214,150,0.8)');
        for (const [x, y] of [[62, 26], [168, 14], [262, 34], [330, 12], [120, 44], [18, 40]]) glint(c, x, y, 4.6, '#f2d88a');
        c.fillStyle = '#5e3a24'; c.fillRect(x0, 56, x1 - x0, 18);
        c.fillStyle = 'rgba(255,226,180,0.3)'; c.fillRect(x0, 56, x1 - x0, 1.6); c.fillRect(x0, 64, x1 - x0, 1);
        c.fillStyle = 'rgba(16,8,4,0.4)'; c.fillRect(x0, 62, x1 - x0, 2);
        c.fillStyle = '#c9a24a'; c.fillRect(x0, 70, x1 - x0, 1.4);
        c.fillStyle = 'rgba(8,8,30,0.34)'; c.fillRect(x0, 74, x1 - x0, 6);
        c.fillStyle = '#3a2418'; c.fillRect(x0, FLOOR - 14, x1 - x0, 14);
        floor(c, x0, FLOOR, x1, y1);
        // the worn rug under the chest
        c.fillStyle = 'rgba(16,8,6,0.3)'; c.fillRect(x0, Y1 + 12, x1 - x0, 4);
        c.fillStyle = '#6e2a2a'; c.fillRect(x0, Y1 + 8, x1 - x0, y1 - Y1);
        c.strokeStyle = '#d9b676'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0, Y1 + 13); c.lineTo(x1, Y1 + 13); c.stroke();
        c.strokeStyle = 'rgba(217,182,118,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y1 + 18); c.lineTo(x1, Y1 + 18); c.stroke();
        for (let x = Math.floor(x0 / 16) * 16; x < x1; x += 16) { c.fillStyle = '#d9b676'; c.beginPath(); c.moveTo(x, Y1 + 26); c.lineTo(x + 5, Y1 + 21); c.lineTo(x + 10, Y1 + 26); c.lineTo(x + 5, Y1 + 31); c.closePath(); c.fill(); }
        for (let j = 0, y = Y1 + 58; y < y1; j++, y += 34) for (let x = Math.floor(x0 / 44) * 44 + (j % 2) * 22; x < x1; x += 44) glint(c, x, y, 8, 'rgba(217,182,118,0.5)');
      },
      clean: room,
      liveTop(c, t) {
        // the lamp's warmth with dust still drifting in it
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = rad(c, LAMP.x, LAMP.y, 10, LAMP.x, LAMP.y, 170, [[0, `rgba(255,214,150,${(0.15 + 0.012 * Math.sin(t * 1.3)).toFixed(3)})`], [1, 'rgba(255,214,150,0)']]);
        c.fillRect(LAMP.x - 172, LAMP.y - 172, 344, 344);
        for (let i = 0; i < 18; i++) {
          const ph = i * 1.7, x = 30 + ((i * 53) % 300) + Math.sin(t * 0.3 + ph) * 10, y = 110 + ((i * 67 + t * 5) % 400);
          c.fillStyle = `rgba(255,240,205,${(0.2 + 0.18 * Math.sin(t + ph)).toFixed(3)})`; c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const q = U.rng(seed + 3);
        // the whole room lies under it, showing faintly where the dust is thin
        room(c);
        const g = ramp(['#a29a8c', '#b2aa9c', '#c1baac', '#cdc7ba']);
        field(c, X0, Y0 - 4, X1, Y1 + 4, 2, (x, y) => [...g(nz.fbm(x * 0.03 + 5, y * 0.03, 5)), 204 + U.clamp(nz.fbm(x * 0.02 + 40, y * 0.02 + 9, 4) * 1.6 - 0.3, 0, 1) * 40]);
        // and it lies thickest along the tops of things
        c.fillStyle = 'rgba(208,202,190,0.7)';
        c.fillRect(CHART.x - 3, CHART.y - 3, CHART.w + 6, 7); c.fillRect(CH.x0 + 8, CH.top, CH.x1 - CH.x0 - 16, 13);
        for (const [x, y, w] of [[40, CH.top - 53, 66], [LAMP.x - 22, LAMP.y - 40, 44], [GLOBE.x - 26, GLOBE.y - GLOBE.R + 2, 40]]) { c.beginPath(); c.ellipse(x + w / 2, y + 3, w / 2, 5.6, 0, 0, TAU); c.fill(); }
        // bunnies along the ledges, specks everywhere
        for (let i = 0; i < 14; i++) bunny(c, q, 20 + q() * 320, CH.top + 2 + q() * 8, 7 + q() * 9);
        for (let i = 0; i < 10; i++) bunny(c, q, CHART.x + 6 + q() * (CHART.w - 12), CHART.y - 1, 6 + q() * 7);
        for (let i = 0; i < 12; i++) bunny(c, q, q() * W, FLOOR + 2 + q() * 10, 7 + q() * 9);
        for (let i = 0; i < 800; i++) { c.fillStyle = 'rgba(90,80,66,0.24)'; c.fillRect(X0 + q() * (X1 - X0), Y0 + q() * (Y1 - Y0), 1.2, 1.2); }
        // old cobwebs in the corners and across the things on the chest
        cobweb(c, 0, Y0, 0, 74); cobweb(c, W, Y0, HALF, 66);
        cobweb(c, CHART.x + CHART.w, CHART.y + CHART.h, Math.PI, 40); cobweb(c, CHART.x, CHART.y + CHART.h, -HALF, 34);
        cobweb(c, 0, CH.top, -HALF, 44); cobweb(c, W, CH.top - 8, Math.PI, 40);
        cobweb(c, CH.x1 - 6, CH.y1 + 6, Math.PI, 30);
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.7;
        for (const [ax, ay, bx, by, sag] of [[126, 300, 210, 296, 34], [124, 288, 208, 300, 42], [124, 330, 224, 328, 26], [322, 300, 356, 396, -18]]) {
          for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(ax, ay + k * 2); c.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag + k * 3, bx, by + k * 2); c.stroke(); }
        }
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'roof', test: (o) => o.what === 'dome', make: copperDome },
    { kind: 'roundWindow', test: (o) => o.what === 'lens', make: greatLens },
    { kind: 'counter', test: (o) => o.what === 'telescope', make: brassTelescope },
    { kind: 'attic', test: (o) => o.where === 'charts', make: chartRoom },
  );
})();
