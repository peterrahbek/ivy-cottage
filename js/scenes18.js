'use strict';
// Scenes for The Little Theatre: the foyer floor, the velvet seats, the big red
// curtains, the tin roof, the ticket booth, the dressing-room mirror and the
// props waiting for their chalk marks. Each is a variant of an older kind, built
// through SCENES.VARIANTS, with the same layers as every other scene (see
// scenes.js):
//   cafeFloor { where: 'theatre' }   the foyer floor (dust)
//   tables { what: 'seats' }         rows of red velvet seats (wipe)
//   awning { what: 'curtains' }      the big red stage curtains (scrub)
//   roof { what: 'tin' }             the corrugated tin roof (scrub)
//   window { room: 'booth' }         the ticket booth and its little room (wash)
//   roundWindow { what: 'mirror' }   the round mirror ringed with bulbs (wash)
//   serve { what: 'props' }          props on chalk marks on the stage (arrange)

(() => {
  const { W, field, ramp, softShadow, grime } = SCENES;
  const TAU = Math.PI * 2;
  const RED = '#a8222e', RED_DK = '#6e1320', RED_LT = '#d24a4e', GOLD = '#d8ae4e', GOLD_LT = '#f6e19a', GOLD_DK = '#8f6a26', NAVY = '#1c2a4e', NAVY_LT = '#33497c', NAVY_DK = '#101a36', CREAM = '#f3e7cd';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };

  // ------------------------------------------------------------ shared bits
  function glow(c, x, y, rad, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  function star(c, x, y, rad, col, rot = -Math.PI / 2) {
    c.fillStyle = col; c.beginPath();
    for (let k = 0; k < 10; k++) { const a = rot + (k / 10) * TAU, d = k % 2 ? rad * 0.42 : rad; c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    c.closePath(); c.fill();
  }
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 12; ring < len; ring += 12) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
  }
  // a sweet paper, twisted at both ends and dropped in the interval
  function sweetPaper(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * TAU);
    c.fillStyle = 'rgba(40,28,18,0.22)'; c.beginPath(); c.ellipse(1, 1.6, s * 1.5, s * 0.7, 0, 0, TAU); c.fill();
    c.fillStyle = U.pick(r, [GOLD, '#d8404a', '#3f6fb0', '#e8b7c4', '#5f9e7a', '#e98a3a']);
    c.beginPath(); c.moveTo(-s * 1.7, -s * 0.7); c.lineTo(-s * 0.7, -s * 0.16); c.quadraticCurveTo(0, -s * 0.7, s * 0.7, -s * 0.16); c.lineTo(s * 1.7, -s * 0.7);
    c.lineTo(s * 1.5, s * 0.7); c.lineTo(s * 0.7, s * 0.16); c.quadraticCurveTo(0, s * 0.7, -s * 0.7, s * 0.16); c.lineTo(-s * 1.5, s * 0.7); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.ellipse(-s * 0.1, -s * 0.2, s * 0.42, s * 0.12, 0, 0, TAU); c.fill();
    c.restore();
  }
  // the torn half of a ticket
  function ticketStub(c, r, x, y) {
    c.save(); c.translate(x, y); c.rotate(r() * TAU);
    c.fillStyle = 'rgba(40,28,18,0.22)'; c.fillRect(-8, -4, 18, 10);
    c.fillStyle = U.pick(r, ['#e9c9c0', '#e6d6a6', '#bcd0e4']); c.beginPath(); c.moveTo(-9, -5); c.lineTo(8, -5); c.lineTo(6, -2.5); c.lineTo(8.4, 0); c.lineTo(6, 2.5); c.lineTo(8, 5); c.lineTo(-9, 5); c.closePath(); c.fill();
    c.fillStyle = 'rgba(110,19,32,0.6)'; c.fillRect(-7, -3, 11, 1.3); c.fillRect(-7, 0, 8, 1.1);
    c.restore();
  }
  function popcorn(c, r, x, y, s) {
    for (let k = 0; k < 4; k++) dot(c, x + (r() - 0.5) * s * 1.5, y + (r() - 0.5) * s * 1.3, s * (0.42 + r() * 0.3), U.pick(r, ['#f6ecd2', '#fbf4e0', '#efdfb8']));
    dot(c, x, y + s * 0.2, s * 0.16, '#b98a4a');
  }
  // the plain dark blue cloth at the back of the stage, stars sewn on, and a moon
  function starCloth(c, q, x0, y0, x1, y1) {
    c.fillStyle = lin(c, 0, y0, 0, y1, [[0, NAVY_DK], [0.6, NAVY], [1, NAVY_LT]]); c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let x = x0 + 8; x < x1; x += 24) { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(x + q() * 6, y0, 5, y1 - y0); }
    for (let i = 0; i < 46; i++) { const on = q() < 0.3; star(c, x0 + q() * (x1 - x0), y0 + q() * (y1 - y0), on ? 3.4 + q() * 2 : 1.6 + q() * 1.2, on ? GOLD : U.rgba(GOLD_LT, 0.7)); }
  }
  // boards running up the stage, closing together towards the back
  function stageBoards(c, q, x0, x1, y0, y1) {
    const vy = y0 - 260, at = (x, y) => 180 + (x - 180) * ((y - vy) / (y1 - vy)), n = 18;
    c.fillStyle = '#4a2f1e'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let i = -n; i < n; i++) {
      const a = 180 + i * 34, b = a + 34, ax = at(a, y0), bx = at(b, y0), dx = at(a, y1), ex = at(b, y1);
      c.fillStyle = U.shade(U.pick(q, ['#a0704a', '#ac7c50', '#94663f', '#b48655', '#a87548']), (q() - 0.5) * 0.1);
      c.beginPath(); c.moveTo(ax + 0.4, y0); c.lineTo(bx - 0.4, y0); c.lineTo(ex - 0.8, y1); c.lineTo(dx + 0.8, y1); c.closePath(); c.fill();
      // the grain, and a butt joint here and there
      c.lineWidth = 0.8;
      for (let k = 0; k < 4; k++) {
        const u = 0.14 + q() * 0.72, ya = y0 + q() * (y1 - y0) * 0.8, yb = ya + 30 + q() * 90, tx = (y) => U.lerp(at(a, y), at(b, y), u);
        c.strokeStyle = q() < 0.6 ? 'rgba(60,34,18,0.2)' : 'rgba(255,226,180,0.13)'; c.beginPath(); c.moveTo(tx(ya), ya); c.lineTo(tx(Math.min(yb, y1)), Math.min(yb, y1)); c.stroke();
      }
      const jy = y0 + q() * (y1 - y0), jt = (jy - y0) / (y1 - y0);
      c.fillStyle = 'rgba(40,22,12,0.5)'; c.fillRect(at(a, jy) + 1, jy, at(b, jy) - at(a, jy) - 2, 1 + jt);
      for (const u of [0.2, 0.8]) dot(c, U.lerp(at(a, jy), at(b, jy), u), jy - 3 - jt * 3, 0.7 + jt * 0.6, 'rgba(40,26,18,0.75)');
    }
    // the back of the stage lies in shade, and the wear runs down the middle
    c.fillStyle = lin(c, 0, y0, 0, y0 + 60, [[0, 'rgba(20,12,16,0.5)'], [1, 'rgba(20,12,16,0)']]); c.fillRect(x0, y0, x1 - x0, 60);
    const g = c.createRadialGradient(180, y1 - 30, 10, 180, y1 - 30, 240); g.addColorStop(0, 'rgba(255,232,190,0.2)'); g.addColorStop(1, 'rgba(255,232,190,0)');
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  // the brass hoods along the front of the stage, each with its pool of light
  function footlights(c, x0, x1, y) {
    for (let x = x0 + 22; x < x1; x += 56) {
      glow(c, x, y - 12, 54, 'rgba(255,214,140,0.5)');
      c.fillStyle = 'rgba(20,12,10,0.4)'; c.beginPath(); c.ellipse(x, y + 3, 22, 4, 0, 0, TAU); c.fill();
      c.fillStyle = lin(c, x - 20, 0, x + 20, 0, [[0, GOLD_DK], [0.4, GOLD_LT], [1, GOLD_DK]]); c.beginPath(); c.moveTo(x - 20, y); c.quadraticCurveTo(x - 17, y - 15, x, y - 15); c.quadraticCurveTo(x + 17, y - 15, x + 20, y); c.closePath(); c.fill();
      c.fillStyle = 'rgba(90,60,20,0.4)'; for (const dx of [-8, 0, 8]) c.fillRect(x + dx - 0.5, y - 13, 1, 13);
    }
  }
  // the front of the stage: the gold lip, the panelling and the footlights
  function stageFront(c, x0, x1, y, y1) {
    c.fillStyle = GOLD; c.fillRect(x0, y, x1 - x0, 3); c.fillStyle = GOLD_LT; c.fillRect(x0, y, x1 - x0, 1);
    c.fillStyle = lin(c, 0, y + 3, 0, y1, [[0, RED_DK], [1, '#3e0c14']]); c.fillRect(x0, y + 3, x1 - x0, y1 - y - 3);
    for (let x = 6; x < 360; x += 58) { c.strokeStyle = 'rgba(216,174,78,0.45)'; c.lineWidth = 1.4; c.strokeRect(x, y + 10, 50, 50); }
    footlights(c, 0, W + 10, y + 1);
  }
  // the two masks of the stage, one laughing and one in tears
  function masks(c, x, y, s) {
    const mask = (mx, my, rot, face, ink, sad) => {
      c.save(); c.translate(mx, my); c.rotate(rot); c.scale(s, s);
      const shape = () => { c.beginPath(); c.moveTo(-12, -12); c.quadraticCurveTo(0, -16, 12, -12); c.quadraticCurveTo(14, 6, 0, 18); c.quadraticCurveTo(-14, 6, -12, -12); c.closePath(); };
      c.save(); c.translate(1.5, 2); c.fillStyle = 'rgba(10,8,20,0.4)'; shape(); c.fill(); c.restore();
      c.fillStyle = face; shape(); c.fill();
      c.strokeStyle = ink; c.lineWidth = 1.7; c.lineCap = 'round';
      for (const d of [-1, 1]) {
        c.beginPath(); c.arc(d * 5.2, -3 + (sad ? 1.2 : 0), 3, sad ? 0.2 : Math.PI + 0.2, sad ? Math.PI - 0.2 : TAU - 0.2); c.stroke();
        c.beginPath(); c.moveTo(d * 2.4, sad ? -9.6 : -8.6); c.lineTo(d * 8.8, sad ? -7.4 : -9.6); c.stroke();
      }
      c.beginPath(); if (sad) c.arc(0, 12, 5.4, Math.PI + 0.45, TAU - 0.45); else c.arc(0, 3.6, 5.8, 0.25, Math.PI - 0.25); c.stroke();
      c.restore();
    };
    mask(x + 12 * s, y + 2 * s, 0.24, GOLD, RED_DK, true);
    mask(x - 12 * s, y, -0.24, CREAM, NAVY_DK, false);
  }

  // ----------------------------------------------- THE THEATRE: THE FOYER FLOOR
  // Looking down on the foyer from the doors of the stalls to the street: cream
  // and dark blue tiles laid on the diagonal in a gold band, the red runner up
  // the middle and its velvet rope, the round settee with a palm growing out of
  // it and the stand of programmes. A long dark season has left dust and every
  // sweet paper that was ever dropped in an interval.
  // cafeFloor { where: 'theatre' }
  function foyerFloor(S) {
    const { r, nz, bleed } = S;
    const top = 92, bot = 584, RX0 = 124, RX1 = 236;   // the floor, and the edges of the runner
    const BORNE = { x: 64, y: 346, r: 52 }, STAND = { x: 304, y: 226, r: 31 }, POSTS = [[262, 142], [262, 330], [262, 518]], POST_R = 11;
    const region = new Path2D();
    region.rect(0, top, W, bot - top);
    for (const t of [BORNE, STAND]) { region.moveTo(t.x + t.r, t.y); region.arc(t.x, t.y, t.r, 0, TAU); }
    for (const [x, y] of POSTS) { region.moveTo(x + POST_R, y); region.arc(x, y, POST_R, 0, TAU); }

    // the floor itself, crisp or dull under the dust
    function floor(c, x0, x1, dull) {
      const q = U.rng(1802), s = 31, col = (v) => (dull ? U.mix(v, '#8f8778', 0.62) : v);
      c.save(); c.beginPath(); c.rect(x0, top, x1 - x0, bot - top); c.clip();
      c.fillStyle = col('#cbbd9f'); c.fillRect(x0, top, x1 - x0, bot - top);
      for (let i = -1; i * s < x1 + s; i++) for (let y = top - s * 2 + (i & 1 ? s : 0); y < bot + s; y += s * 2) {
        const x = i * s, base = i & 1 ? CREAM : NAVY_LT;
        c.fillStyle = col(U.shade(base, (q() - 0.5) * 0.12));
        c.beginPath(); c.moveTo(x, y - s + 0.8); c.lineTo(x + s - 0.8, y); c.lineTo(x, y + s - 0.8); c.lineTo(x - s + 0.8, y); c.closePath(); c.fill();
      }
      // a gold band and a dark line round the whole floor
      c.strokeStyle = col(GOLD); c.lineWidth = 4; c.strokeRect(10, top + 10, W - 20, bot - top - 20);
      c.strokeStyle = col(NAVY_DK); c.lineWidth = 1.4; c.strokeRect(16, top + 16, W - 32, bot - top - 32);
      // the runner, with gold edges and stars woven into it
      c.fillStyle = 'rgba(30,14,14,0.3)'; c.fillRect(RX0 - 2, top, RX1 - RX0 + 5, bot - top);
      c.fillStyle = col(RED); c.fillRect(RX0, top, RX1 - RX0, bot - top);
      c.fillStyle = col(RED_DK); c.fillRect(RX0 + 7, top, RX1 - RX0 - 14, bot - top);
      c.fillStyle = col(RED); c.fillRect(RX0 + 10, top, RX1 - RX0 - 20, bot - top);
      c.fillStyle = col(GOLD); c.fillRect(RX0 + 2, top, 3.4, bot - top); c.fillRect(RX1 - 5.4, top, 3.4, bot - top);
      for (let y = top + 58, k = 0; y < bot; y += 94, k++) { star(c, 180, y, k % 2 ? 11 : 17, col(GOLD)); star(c, 180, y, k % 2 ? 4 : 7, col(RED_DK)); }
      c.restore();
    }
    // the round settee: eight buttoned seats about a drum with a palm in it
    function borne(c, b) {
      const q = U.rng(18021), { x, y } = b;
      dot(c, x + 5, y + 7, b.r + 3, 'rgba(30,20,20,0.3)');
      dot(c, x, y, b.r, RED_DK);
      for (let k = 0; k < 8; k++) {
        const a0 = (k / 8) * TAU + 0.05, a1 = ((k + 1) / 8) * TAU - 0.05, am = (a0 + a1) / 2, mx = x + Math.cos(am) * (b.r - 12), my = y + Math.sin(am) * (b.r - 12);
        const g = c.createRadialGradient(mx - 6, my - 7, 2, mx, my, 26); g.addColorStop(0, RED_LT); g.addColorStop(0.55, RED); g.addColorStop(1, RED_DK);
        c.fillStyle = g; c.beginPath(); c.arc(x, y, b.r - 2, a0, a1); c.arc(x, y, 24, a1, a0, true); c.closePath(); c.fill();
        dot(c, mx, my, 2.2, GOLD_DK); dot(c, mx - 0.6, my - 0.6, 1.2, GOLD_LT);
      }
      c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.arc(x, y, b.r - 1, 0, TAU); c.stroke();
      dot(c, x, y, 25, NAVY_DK); dot(c, x, y, 23, NAVY); c.strokeStyle = GOLD; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 22, 0, TAU); c.stroke();
      dot(c, x, y, 17, '#3d2a1e');
      for (let k = 0; k < 11; k++) {
        const a = (k / 11) * TAU + q() * 0.3, len = 28 + q() * 16;
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = U.pick(q, ['#3f7a3a', '#4f8a3c', '#5d9644', '#467e37']);
        c.beginPath(); c.ellipse(len * 0.55, 0, len * 0.55, 6 + q() * 3, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(4, 0); c.lineTo(len, 0); c.stroke();
        c.restore();
      }
    }
    // a round table with the evening's programmes fanned out on it
    function stand(c, b) {
      const { x, y } = b;
      dot(c, x + 4, y + 6, b.r + 2, 'rgba(30,20,20,0.3)');
      dot(c, x, y, b.r, GOLD_DK); dot(c, x, y, b.r - 1.6, GOLD);
      c.fillStyle = lin(c, x - b.r, y - b.r, x + b.r, y + b.r, [[0, '#5a3524'], [1, '#34201a']]); c.beginPath(); c.arc(x, y, b.r - 4, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,230,190,0.2)'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, b.r - 9, 3.5, 5.2); c.stroke();
      for (const [a, col] of [[-0.55, NAVY], [-0.1, RED], [0.34, CREAM]]) {
        c.save(); c.translate(x - 1, y + 3); c.rotate(a);
        c.fillStyle = 'rgba(20,10,10,0.3)'; c.fillRect(-10, -16, 22, 31);
        c.fillStyle = col; c.fillRect(-11, -17, 22, 31);
        c.fillStyle = col === CREAM ? RED : GOLD; c.fillRect(-8, -13, 16, 2.2); c.fillRect(-8, 7, 16, 1.4);
        star(c, 0, -3, 5.4, col === CREAM ? RED : GOLD);
        c.restore();
      }
    }
    function post(c, x, y) {
      dot(c, x + 3, y + 4, POST_R + 1, 'rgba(30,20,20,0.3)');
      const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, POST_R); g.addColorStop(0, GOLD_LT); g.addColorStop(0.55, GOLD); g.addColorStop(1, GOLD_DK);
      dot(c, x, y, POST_R, g);
      c.strokeStyle = GOLD_DK; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.stroke();
      dot(c, x, y, 3.8, '#f9eab6'); dot(c, x - 1, y - 1, 1.4, '#ffffff');
    }
    function rope(c, a, b) {
      const mx = (a[0] + b[0]) / 2 + 11, my = (a[1] + b[1]) / 2;
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(30,20,20,0.25)'; c.lineWidth = 8; c.beginPath(); c.moveTo(a[0] + 3, a[1] + 4); c.quadraticCurveTo(mx + 3, my + 4, b[0] + 3, b[1] + 4); c.stroke();
      c.strokeStyle = RED_DK; c.lineWidth = 7.5; c.beginPath(); c.moveTo(...a); c.quadraticCurveTo(mx, my, ...b); c.stroke();
      c.strokeStyle = RED; c.lineWidth = 5; c.stroke();
      c.save(); c.strokeStyle = RED_LT; c.lineWidth = 3; c.lineCap = 'butt'; c.setLineDash([3, 4]); c.stroke(); c.restore();
    }
    return {
      family: 'dust', particle: 'dust', region, indoor: true,
      tough: (x, y) => (x < 18 || x > 342 || y < top + 14 || y > bot - 14 ? 1.35 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        floor(c, x0, x1, false);
        // the back wall, in dark blue, over a dark skirting with a line of gold
        c.fillStyle = lin(c, 0, y0, 0, top, [[0, NAVY_DK], [1, NAVY]]); c.fillRect(x0, y0, x1 - x0, top - y0);
        c.fillStyle = GOLD_DK; c.fillRect(x0, 9, x1 - x0, 1.6);
        c.fillStyle = '#2c1a16'; c.fillRect(x0, top - 8, x1 - x0, 8);
        c.fillStyle = GOLD; c.fillRect(x0, top - 9, x1 - x0, 1.6);
        // the padded doors of the stalls, studded, each with a round window
        for (const [a, b] of [[126, 178], [182, 234]]) {
          c.fillStyle = '#2c1a16'; c.fillRect(a - 3, 12, b - a + 6, top - 12);
          c.fillStyle = lin(c, a, 0, b, 0, [[0, RED_DK], [0.5, RED], [1, RED_DK]]); c.fillRect(a, 15, b - a, top - 15);
          for (let y = 20, k = 0; y < top - 3; y += 10, k++) for (let x = a + 6 + (k % 2) * 8; x < b - 3; x += 16) { dot(c, x, y, 1.6, GOLD_DK); dot(c, x - 0.4, y - 0.4, 0.7, GOLD_LT); }
          const cx = (a + b) / 2;
          dot(c, cx, 40, 14.5, GOLD_DK); dot(c, cx, 40, 13, GOLD); dot(c, cx, 40, 11, '#ffd98e');
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.moveTo(cx - 6, 47); c.lineTo(cx + 2, 31); c.lineTo(cx + 6, 34); c.lineTo(cx - 2, 49); c.closePath(); c.fill();
          c.fillStyle = GOLD; c.fillRect(a === 126 ? b - 7 : a + 3, 60, 4, 22);
        }
        // playbills in gold frames either side, and the lamps above them
        for (const [x, paper, ink, word] of [[32, CREAM, RED, 'TONIGHT'], [268, RED_DK, GOLD, 'ENCORE']]) {
          glow(c, x + 30, 16, 62, 'rgba(255,214,140,0.34)');
          c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 2, 17, 60, 62);
          c.fillStyle = GOLD; c.fillRect(x, 14, 60, 62); c.fillStyle = GOLD_LT; c.fillRect(x, 14, 60, 1.4);
          c.fillStyle = paper; c.fillRect(x + 4, 18, 52, 54);
          star(c, x + 30, 38, 12, ink);
          c.fillStyle = ink; c.font = `700 8.6px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, x + 30, 60);
          c.fillRect(x + 12, 26, 36, 1.2); c.fillRect(x + 12, 66, 36, 1.2);
        }
        // the brass threshold and the mat at the street door
        c.fillStyle = GOLD; c.fillRect(x0, bot, x1 - x0, 5); c.fillStyle = GOLD_LT; c.fillRect(x0, bot, x1 - x0, 1.2);
        c.fillStyle = '#332019'; c.fillRect(x0, bot + 5, x1 - x0, y1 - bot);
        c.fillStyle = RED_DK; c.fillRect(70, bot + 9, 220, y1 - bot);
      },
      clean(c) {
        floor(c, 0, W, false);
        // the pile of the runner, and light gliding over the tiles
        field(c, RX0, top, RX1, bot, 2, (x, y) => { const v = nz.n2(x * 0.5, y * 0.5); return v > 0.5 ? [255, 190, 170, (v - 0.5) * 60] : [40, 0, 10, (0.5 - v) * 80]; });
        for (const [o, w, a] of [[-160, 70, 0.1], [20, 26, 0.07], [150, 90, 0.07]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(o, bot); c.lineTo(o + w, bot); c.lineTo(o + w + 300, top); c.lineTo(o + 300, top); c.closePath(); c.fill();
        }
      },
      cleanOver(c) {
        // the chandelier's pool of warm light
        glow(c, 180, 320, 210, 'rgba(255,226,160,0.2)');
      },
      dirt(c) {
        floor(c, 0, W, true);
        const g = ramp(['#978e7e', '#a89f90', '#b9b1a3', '#c9c2b5']);
        field(c, 0, top, W, bot, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 138 + v * 104]; });
        grime(c, r, 0, top, W, bot, 26);
        // dust bunnies along the walls and against the settee
        for (let i = 0; i < 34; i++) {
          const x = r() < 0.5 ? r() * 40 + (r() < 0.5 ? 0 : 320) : r() * W, y = top + 6 + r() * (bot - top - 12), s = 5 + r() * 9;
          for (let k = 0; k < 9; k++) { const v = 150 + r() * 40; c.fillStyle = `rgba(${v},${v - 5},${v - 12},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, TAU); c.fill(); }
        }
        // what an audience leaves behind, most of it round the doors
        for (let i = 0; i < 46; i++) popcorn(c, r, 20 + r() * 320, top + 12 + r() * 470, 2.4 + r() * 1.4);
        for (let i = 0; i < 30; i++) sweetPaper(c, r, 14 + r() * 332, top + 12 + r() * 470, 4 + r() * 2.4);
        for (let i = 0; i < 12; i++) ticketStub(c, r, 20 + r() * 320, top + 16 + r() * 460);
        // a programme somebody dropped and trod on
        c.save(); c.translate(116, 188); c.rotate(-0.42);
        c.fillStyle = 'rgba(40,28,18,0.25)'; c.fillRect(-27, -33, 58, 74);
        c.fillStyle = '#e2d6bb'; c.fillRect(-29, -36, 58, 74);
        c.fillStyle = 'rgba(110,19,32,0.6)'; c.fillRect(-23, -30, 46, 9);
        c.fillStyle = 'rgba(70,65,55,0.35)'; for (let y = -16; y < 32; y += 5) c.fillRect(-23, y, 46, 1.8);
        c.fillStyle = 'rgba(105,88,66,0.4)'; c.beginPath(); c.ellipse(6, 8, 13, 19, 0.4, 0, TAU); c.fill();
        c.restore();
        // shoe prints from the street up the runner to the doors
        c.fillStyle = 'rgba(95,78,60,0.34)';
        for (let i = 0, y = bot - 16; y > top + 30; i++, y -= 30) {
          const x = 180 + Math.sin(y * 0.012) * 26 + (i % 2 ? 11 : -11), a = Math.cos(y * 0.012) * 0.3;
          c.save(); c.translate(x, y); c.rotate(a);
          c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, TAU); c.fill();
          c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, TAU); c.fill();
          c.restore();
        }
        cobweb(c, 0, top, 0, 70);
        cobweb(c, W, top, Math.PI / 2, 60);
      },
      top(c) {
        // the wall's shadow on the floor
        c.fillStyle = lin(c, 0, top, 0, top + 22, [[0, 'rgba(20,14,26,0.4)'], [1, 'rgba(20,14,26,0)']]); c.fillRect(bleed.x0, top, bleed.x1 - bleed.x0, 22);
        borne(c, BORNE); stand(c, STAND);
        for (let k = 0; k < POSTS.length - 1; k++) rope(c, POSTS[k], POSTS[k + 1]);
        for (const [x, y] of POSTS) post(c, x, y);
      },
    };
  }

  // ---------------------------------------------- THE THEATRE: THE VELVET SEATS
  // The stalls as the actors see them, four rows rising away from the stage on
  // either side of the aisle: padded backs and cushions in red velvet, dark
  // arms with brass tips, a letter at the end of every row and a brass number
  // on every seat. Only the velvet is dirty: dust on the backs, and toffee and
  // popcorn trodden into the cushions, which take a little more wiping.
  // tables { what: 'seats' }
  function velvetSeats(S) {
    const { r, nz, bleed } = S;
    const ROWS = [[122, 0.92, 'D'], [214, 1.02, 'C'], [316, 1.14, 'B'], [430, 1.26, 'A']].map(([y, s, letter]) => ({ y, s, letter, bh: 58 * s, ch: 26 * s, w: 46 * s, p: 56 * s, a: 15 * s }));
    const seats = [];
    for (const R of ROWS) for (const side of [-1, 1]) for (let k = 0; R.a + k * R.p < 190; k++) {
      const x = side < 0 ? 180 - R.a - k * R.p - R.w : 180 + R.a + k * R.p;
      seats.push({ x, y: R.y, w: R.w, bh: R.bh, ch: R.ch, s: R.s, R, side, k, no: side < 0 ? 2 * k + 2 : 2 * k + 1 });
    }
    const outline = (p, st) => {
      p.roundRect(st.x, st.y, st.w, st.bh + 2, [12 * st.s, 12 * st.s, 2, 2]);
      p.roundRect(st.x - 2 * st.s, st.y + st.bh, st.w + 4 * st.s, st.ch, [4 * st.s, 4 * st.s, 9 * st.s, 9 * st.s]);
    };
    const region = new Path2D();
    for (const st of seats) outline(region, st);

    function seat(c, st, [dk, md, lt]) {
      const { x, y, w, bh, ch, s } = st, cy = y + bh;
      c.fillStyle = lin(c, x, 0, x + w, 0, [[0, dk], [0.2, md], [0.6, lt], [1, dk]]);
      c.beginPath(); c.roundRect(x, y, w, bh + 2, [12 * s, 12 * s, 2, 2]); c.fill();
      // the channels of the upholstery, a shadow beside a line of light
      for (const t of [0.34, 0.67]) {
        const lx = x + w * t;
        c.fillStyle = U.rgba(dk, 0.75); c.fillRect(lx, y + 7 * s, 1.5 * s, bh - 8 * s);
        c.fillStyle = 'rgba(255,225,215,0.16)'; c.fillRect(lx + 1.5 * s, y + 7 * s, 1.2 * s, bh - 8 * s);
      }
      c.fillStyle = lin(c, 0, y, 0, y + 22 * s, [[0, 'rgba(255,225,215,0.3)'], [1, 'rgba(255,225,215,0)']]);
      c.beginPath(); c.roundRect(x + 2, y + 1, w - 4, 22 * s, [11 * s, 11 * s, 0, 0]); c.fill();
      // shade where the back meets the cushion, then the cushion, lit along its front edge
      c.fillStyle = lin(c, 0, cy - 12 * s, 0, cy + 2, [[0, U.rgba(dk, 0)], [1, U.rgba(dk, 0.9)]]); c.fillRect(x, cy - 12 * s, w, 14 * s);
      c.fillStyle = lin(c, 0, cy, 0, cy + ch, [[0, dk], [0.35, lt], [0.7, md], [1, dk]]);
      c.beginPath(); c.roundRect(x - 2 * s, cy, w + 4 * s, ch, [4 * s, 4 * s, 9 * s, 9 * s]); c.fill();
      c.fillStyle = 'rgba(255,225,215,0.16)'; c.beginPath(); c.ellipse(x + w * 0.42, cy + ch * 0.36, w * 0.3, ch * 0.16, 0, 0, TAU); c.fill();
    }
    return {
      family: 'wipe', particle: 'dust', region, fillRule: 'nonzero', indoor: true,
      tough(x, y) {
        for (const R of ROWS) if (y > R.y + R.bh && y < R.y + R.bh + R.ch) return 1.35;
        return 1;
      },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1803);
        // the rake of the floor, dark blue, each step catching a little of the light
        c.fillStyle = lin(c, 0, 100, 0, y1, [[0, NAVY_DK], [1, NAVY]]); c.fillRect(x0, 100, x1 - x0, y1 - 100);
        for (const R of ROWS) {
          const fy = R.y + R.bh + R.ch;
          c.fillStyle = 'rgba(120,140,190,0.13)'; c.fillRect(x0, fy + 2 * R.s, x1 - x0, 12 * R.s);
          c.fillStyle = 'rgba(150,170,220,0.18)'; c.fillRect(x0, fy + 13 * R.s, x1 - x0, 1.4);
        }
        // the aisle, a red carpet with a gold nosing on each step and a light at each row
        c.fillStyle = lin(c, 0, 112, 0, y1, [[0, RED_DK], [1, RED]]);
        c.beginPath(); c.moveTo(180 - 9, 112); c.lineTo(180 + 9, 112); c.lineTo(180 + 22, y1); c.lineTo(180 - 22, y1); c.closePath(); c.fill();
        for (const R of ROWS) {
          const fy = R.y + R.bh + R.ch + 13 * R.s, ww = 8 + ((fy - 112) / 490) * 14;
          c.fillStyle = GOLD; c.fillRect(180 - ww, fy, ww * 2, 2);
          for (const dir of [-1, 1]) { glow(c, 180 + dir * (ww + 2), fy - 6, 16, 'rgba(255,214,140,0.5)'); dot(c, 180 + dir * (ww + 2), fy - 6, 1.7, GOLD_LT); }
        }
        // the back wall: dark blue panels, gold lines, three lamps and an exit
        c.fillStyle = lin(c, 0, y0, 0, 112, [[0, NAVY_DK], [1, NAVY_LT]]); c.fillRect(x0, y0, x1 - x0, 112 - y0);
        c.fillStyle = GOLD_DK; c.fillRect(x0, 12, x1 - x0, 1.6); c.fillRect(x0, 92, x1 - x0, 1.6);
        c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x0, 100, x1 - x0, 12);
        c.strokeStyle = 'rgba(216,174,78,0.5)'; c.lineWidth = 1.4;
        for (const x of [14, 134, 254]) c.strokeRect(x, 22, 92, 62);
        for (const x of [60, 300]) {
          glow(c, x, 50, 58, 'rgba(255,214,140,0.5)');
          c.fillStyle = GOLD; c.beginPath(); c.moveTo(x - 9, 42); c.lineTo(x + 9, 42); c.lineTo(x + 5, 56); c.lineTo(x - 5, 56); c.closePath(); c.fill();
          c.fillStyle = '#fff1c4'; c.beginPath(); c.ellipse(x, 42, 9, 2.6, 0, 0, TAU); c.fill();
          c.fillStyle = GOLD_DK; c.fillRect(x - 1, 56, 2, 8);
        }
        c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(150, 30, 60, 22);
        c.fillStyle = '#7a1723'; c.fillRect(148, 28, 60, 22);
        c.fillStyle = '#ffd9cf'; c.font = `700 12px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', 178, 39.5);
        glow(c, 178, 39, 46, 'rgba(230,80,70,0.26)');
        // the rows throw a soft shadow on the floor behind them
        const shape = new Path2D(); for (const st of seats) shape.rect(st.x, st.y + 4, st.w, st.bh + st.ch);
        softShadow(c, shape, 6, 0.5, 0, 6);
        // the rail of the pit and the footlights in the bottom of the picture
        c.fillStyle = '#21140f'; c.fillRect(x0, 580, x1 - x0, y1 - 580);
        c.fillStyle = GOLD; c.fillRect(x0, 580, x1 - x0, 2);
        for (let x = 18; x < 360; x += 54) { glow(c, x, 584, 44, 'rgba(255,214,140,0.6)'); c.fillStyle = '#3a2418'; c.beginPath(); c.ellipse(x, 592, 18, 11, 0, Math.PI, 0); c.fill(); c.fillStyle = GOLD_LT; c.fillRect(x - 14, 590, 28, 2); }
        for (let i = 0; i < 300; i++) { c.fillStyle = q() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)'; c.fillRect(x0 + q() * (x1 - x0), 112 + q() * 470, 2, 1.4); }
      },
      clean(c) {
        for (const st of seats) seat(c, st, [RED_DK, RED, RED_LT]);
        // velvet bruised lighter and darker where it has been brushed against
        field(c, 0, 120, W, 545, 2, (x, y) => { const v = nz.fbm(x * 0.05, y * 0.03, 3); return v > 0.5 ? [255, 200, 190, (v - 0.5) * 90] : [50, 0, 10, (0.5 - v) * 70]; });
      },
      cleanOver(c) {
        // the footlights reach the front rows
        c.fillStyle = lin(c, 0, 330, 0, 570, [[0, 'rgba(255,214,150,0)'], [1, 'rgba(255,214,150,0.18)']]); c.fillRect(0, 330, W, 240);
      },
      dirt(c) {
        for (const st of seats) seat(c, st, ['#4e4142', '#73655f', '#8d7f76']);
        const g = ramp(['#85796c', '#988d7f', '#ab9f91']);
        field(c, 0, 120, W, 545, 2, (x, y) => { const v = nz.fbm(x * 0.035, y * 0.035, 5); return [...g(v), 70 + v * 130]; });
        grime(c, r, 0, 120, W, 545, 40);
        for (const st of seats) {
          const { x, y, w, bh, ch, s } = st, cy = y + bh;
          // dust settled along the top of the back, and on every fold
          c.strokeStyle = 'rgba(214,206,190,0.75)'; c.lineWidth = 3.4 * s; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x + 5 * s, y + 7 * s); c.quadraticCurveTo(x + w / 2, y + 1.5, x + w - 5 * s, y + 7 * s); c.stroke();
          // toffee stuck to the cushion
          if (r() < 0.6) {
            const tx = x + 8 * s + r() * (w - 16 * s), ty = cy + 7 * s + r() * (ch - 13 * s);
            c.fillStyle = 'rgba(112,70,34,0.72)'; c.beginPath(); c.ellipse(tx, ty, (6 + r() * 7) * s, (2.6 + r() * 2.4) * s, r() * 0.6 - 0.3, 0, TAU); c.fill();
            c.fillStyle = 'rgba(255,235,200,0.5)'; c.beginPath(); c.ellipse(tx - 2, ty - 1, 2.6 * s, 0.9 * s, 0, 0, TAU); c.fill();
          }
          const n = (r() * 5) | 0;
          for (let i = 0; i < n; i++) popcorn(c, r, x + 5 * s + r() * (w - 10 * s), cy + 5 * s + r() * (ch - 9 * s), (2.3 + r() * 1.1) * s);
          if (r() < 0.32) sweetPaper(c, r, x + 10 * s + r() * (w - 20 * s), cy + ch * 0.5, (3.6 + r() * 1.6) * s);
          // crumbs in the channels of the back
          for (let i = 0; i < 12; i++) { c.fillStyle = U.pick(r, ['#c98e4a', '#a8702e', '#d9c7a4']); c.fillRect(x + 3 + r() * (w - 6), y + 8 * s + r() * (bh - 12 * s), 1.2 + r() * 1.3, 1.2 + r()); }
        }
        // a programme left on a seat in the front row
        const st = seats.find((u) => u.R.letter === 'A' && u.side > 0 && u.k === 0);
        c.save(); c.translate(st.x + st.w * 0.5, st.y + st.bh + st.ch * 0.5); c.rotate(0.2);
        c.fillStyle = 'rgba(30,20,20,0.3)'; c.fillRect(-15, -7, 32, 17);
        c.fillStyle = '#ddd0b5'; c.fillRect(-17, -9, 32, 17);
        c.fillStyle = 'rgba(110,19,32,0.6)'; c.fillRect(-14, -7, 26, 4);
        c.fillStyle = 'rgba(70,65,55,0.4)'; c.fillRect(-14, -1, 26, 1.4); c.fillRect(-14, 2, 26, 1.4); c.fillRect(-14, 5, 18, 1.4);
        c.restore();
      },
      top(c) {
        const arm = (x, R) => {
          const s = R.s, ax = x - 4 * s, ay = R.y + R.bh * 0.46, ah = R.bh * 0.54 + R.ch + 8 * s;
          c.fillStyle = 'rgba(10,8,16,0.4)'; c.beginPath(); c.roundRect(ax + 2, ay + 3, 8 * s, ah, 3 * s); c.fill();
          c.fillStyle = lin(c, ax, 0, ax + 8 * s, 0, [[0, '#6e452c'], [0.45, '#4a2c1c'], [1, '#2c1a12']]); c.beginPath(); c.roundRect(ax, ay, 8 * s, ah, 3 * s); c.fill();
          dot(c, x, ay + 3.4 * s, 3.5 * s, GOLD_DK); dot(c, x - 0.5, ay + 2.9 * s, 2.5 * s, GOLD); dot(c, x - 1, ay + 2.4 * s, 1 * s, GOLD_LT);
        };
        for (const R of ROWS) {
          const gap = (R.p - R.w) / 2;
          for (const st of seats.filter((u) => u.R === R)) {
            arm(st.side < 0 ? st.x - gap : st.x + st.w + gap, R);
            // the brass number
            const s = st.s, nx = st.x + st.w / 2, ny = st.y + 8 * s;
            c.fillStyle = GOLD_DK; c.fillRect(nx - 7 * s, ny - 4.4 * s, 14 * s, 9 * s);
            c.fillStyle = GOLD; c.fillRect(nx - 6.4 * s, ny - 3.8 * s, 12.8 * s, 7.8 * s);
            c.fillStyle = '#3a2810'; c.font = `700 ${6.8 * s}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(st.no, nx, ny + 0.5);
          }
          // the end of each row, by the aisle, with its letter
          for (const dir of [-1, 1]) {
            const s = R.s, ex = 180 + dir * (R.a - 5 * s), ey = R.y + R.bh * 0.36, eh = R.bh * 0.64 + R.ch + 13 * s;
            c.fillStyle = 'rgba(10,8,16,0.4)'; c.beginPath(); c.roundRect(ex - 5 * s + 2, ey + 3, 10 * s, eh, 4 * s); c.fill();
            c.fillStyle = lin(c, ex - 5 * s, 0, ex + 5 * s, 0, [[0, '#6e452c'], [0.45, '#4a2c1c'], [1, '#2c1a12']]); c.beginPath(); c.roundRect(ex - 5 * s, ey, 10 * s, eh, 4 * s); c.fill();
            dot(c, ex, ey + eh * 0.45, 6.6 * s, GOLD_DK); dot(c, ex, ey + eh * 0.45, 5.8 * s, GOLD);
            c.fillStyle = '#3a2810'; c.font = `700 ${8.4 * s}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(R.letter, ex, ey + eh * 0.45 + 0.5);
          }
        }
      },
    };
  }

  // ---------------------------------------------- THE THEATRE: THE RED CURTAINS
  // The stage from the front row: two great curtains of red velvet tied back
  // with gold cord under a swagged pelmet, in a dark blue arch with the two
  // masks at its crown. Between them the bare stage waits, with its one small
  // light left burning. Every fold is full of grey dust; it scrubs out and the
  // red comes up, a gold braid along the hem with it.
  // awning { what: 'curtains' }
  function redCurtains(S) {
    const { r, nz, bleed } = S;
    const OUT = 24, TOP = 66, TIE = 352, HEM = 524, FOLDS = 7.5;
    // how far a curtain reaches in towards the middle at a height
    const edge = (y) => (y < TIE ? U.lerp(180, 88, Math.pow(U.clamp((y - TOP) / (TIE - TOP), 0, 1), 1.5)) : U.lerp(88, 126, Math.sin((Math.min(y - TIE, HEM - TIE) / (HEM - TIE)) * Math.PI * 0.5)));
    // the lower edge of the pelmet: three swags, hung from four points
    const swag = (x) => 92 + 40 * Math.abs(Math.sin((Math.PI * 3 * (x - OUT)) / (W - OUT * 2)));
    const ROSES = [0, 1, 2, 3].map((k) => OUT + (k * (W - OUT * 2)) / 3);
    const hem = (px) => HEM + 3.4 * Math.sin(((px - OUT) / (edge(HEM) - OUT)) * FOLDS * TAU);

    // one outline round everything: over the top, down each side, along the
    // hems and up the inner edges to where they meet under the middle swag
    const region = new Path2D();
    const inner = [];
    for (let y = HEM; y > TOP; y -= 6) { if (y < swag(edge(y))) break; inner.push([edge(y), y]); }
    region.moveTo(OUT, TOP - 6); region.lineTo(W - OUT, TOP - 6);
    for (let px = OUT; px <= edge(HEM); px += 3) region.lineTo(W - px, hem(px));
    for (const [x, y] of inner) region.lineTo(W - x, y);
    const midL = inner[inner.length - 1][0];
    for (let x = W - midL; x > midL; x -= 4) region.lineTo(x, swag(x));
    for (const [x, y] of inner.slice().reverse()) region.lineTo(x, y);
    for (let px = edge(HEM); px >= OUT; px -= 3) region.lineTo(px, hem(px));
    region.closePath();

    // the shade of the velvet at a point, 0 down in a fold, 1 on its crest
    function cloth(x, y) {
      if (y < swag(x)) {
        const v = (y - TOP + 6) / (swag(x) - TOP + 6);
        return 0.44 + 0.3 * Math.sin(v * 3.1 * TAU + 0.6 + nz.n2(x * 0.02, 3) * 1.4) + 0.1 * v;
      }
      const side = x < 180 ? 0 : 40, px = x < 180 ? x : W - x, e = edge(y), u = U.clamp((px - OUT) / (e - OUT), 0, 1);
      const w = (nz.n2(y * 0.011 + side, u * 5) - 0.5) * 0.9;
      const pinch = Math.exp(-Math.pow((y - TIE) / 16, 2)) * 0.2, under = Math.exp(-Math.max(0, y - swag(x)) / 14) * 0.26;
      return 0.47 + 0.34 * Math.sin((u * FOLDS + w) * TAU) + 0.09 * Math.sin((u * FOLDS * 2 + w) * TAU + 1) - pinch - under + (y > TIE ? 0.05 : 0);
    }
    const hemLine = (c, side, dy) => {
      c.beginPath();
      for (let px = OUT; px <= edge(HEM); px += 3) { const x = side < 0 ? px : W - px, y = hem(px) + dy; if (px === OUT) c.moveTo(x, y); else c.lineTo(x, y); }
    };
    const twinkles = [];
    { const q = U.rng(18041); for (let i = 0; i < 40 && twinkles.length < 7; i++) { const y = 196 + q() * 200, x = 180 + (q() - 0.5) * 2 * (180 - edge(y) - 12); if (y > swag(x) + 20) twinkles.push({ x, y, s: 2.4 + q() * 1.8, ph: q() * TAU }); } }

    return {
      family: 'scrub', particle: 'dust', region, indoor: true,
      tough: (x, y) => (y < swag(x) ? 1.4 : Math.abs(y - TIE) < 20 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1804), FLOOR = 440;
        // behind the curtains: the cloth, the boards and the light left on
        starCloth(c, q, x0, y0, x1, FLOOR);
        c.fillStyle = 'rgba(8,10,24,0.55)'; c.fillRect(x0, FLOOR - 26, x1 - x0, 26);
        stageBoards(c, q, x0, x1, FLOOR, 552);
        c.fillStyle = 'rgba(30,20,20,0.3)'; c.beginPath(); c.ellipse(186, 504, 26, 5, 0, 0, TAU); c.fill();
        glow(c, 180, 404, 98, 'rgba(255,226,160,0.6)');
        c.fillStyle = '#23201f'; c.fillRect(178.6, 412, 2.8, 88);
        c.beginPath(); c.moveTo(166, 505); c.lineTo(194, 505); c.lineTo(190, 498); c.lineTo(170, 498); c.closePath(); c.fill();
        dot(c, 180, 404, 8.6, '#fff4cf'); dot(c, 180, 404, 5, '#ffffff');
        c.strokeStyle = '#23201f'; c.lineWidth = 1; c.beginPath(); c.arc(180, 404, 9.5, 0, TAU); c.moveTo(180, 394.5); c.lineTo(180, 413.5); c.moveTo(170.5, 404); c.lineTo(189.5, 404); c.stroke();
        // the arch, dark blue with gold lines and a gold star up each side
        const frame = new Path2D(); frame.rect(x0, y0, x1 - x0, TOP - y0); frame.rect(x0, TOP - 2, OUT - x0, 552 - TOP + 2); frame.rect(W - OUT, TOP - 2, x1 - W + OUT, 552 - TOP + 2);
        c.fillStyle = lin(c, 0, y0, 0, 552, [[0, NAVY_LT], [1, NAVY]]); c.fill(frame);
        c.strokeStyle = GOLD; c.lineWidth = 2.4; c.strokeRect(OUT - 3, TOP - 9, W - OUT * 2 + 6, 552);
        c.strokeStyle = GOLD_DK; c.lineWidth = 1; c.strokeRect(OUT - 7.5, TOP - 13.5, W - OUT * 2 + 15, 552); c.strokeRect(5, 8, W - 10, 552);
        for (let y = 96; y < 540; y += 46) for (const x of [10.5, W - 10.5]) star(c, x, y, 4.4, GOLD);
        // the crown of the arch: a gold shell behind the two masks
        for (let k = -6; k <= 6; k++) { const a = -Math.PI / 2 + k * 0.24; c.strokeStyle = k % 2 ? GOLD_DK : GOLD; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(180 + Math.cos(a) * 14, 46 + Math.sin(a) * 14); c.lineTo(180 + Math.cos(a) * 38, 46 + Math.sin(a) * 34); c.stroke(); }
        masks(c, 180, 29, 0.98);
        for (const dir of [-1, 1]) { c.strokeStyle = GOLD; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(180 + dir * 44, 44); c.bezierCurveTo(180 + dir * 74, 26, 180 + dir * 96, 58, 180 + dir * 122, 38); c.stroke(); dot(c, 180 + dir * 124, 37, 3, GOLD_LT); }
        stageFront(c, x0, x1, 552, y1);
      },
      clean(c) {
        const g = ramp(['#3c0912', '#6e1320', '#a01f2c', '#c8333c', '#e8686a']);
        field(c, 0, TOP - 8, W, HEM + 8, 2, (x, y) => g(cloth(x, y)));
        // a gold braid above the hem
        for (const side of [-1, 1]) {
          hemLine(c, side, -16); c.strokeStyle = GOLD_DK; c.lineWidth = 6; c.stroke();
          hemLine(c, side, -16.6); c.strokeStyle = GOLD; c.lineWidth = 3.6; c.stroke();
          hemLine(c, side, -17); c.strokeStyle = GOLD_LT; c.lineWidth = 0.9; c.stroke();
        }
      },
      cleanOver(c) {
        // the footlights on the velvet from below, shade high up under the arch
        c.fillStyle = lin(c, 0, 340, 0, HEM, [[0, 'rgba(255,190,110,0)'], [1, 'rgba(255,190,110,0.3)']]); c.fillRect(0, 340, W, HEM + 8 - 340);
        c.fillStyle = lin(c, 0, TOP - 8, 0, 110, [[0, 'rgba(20,6,16,0.34)'], [1, 'rgba(20,6,16,0)']]); c.fillRect(0, TOP - 8, W, 118 - TOP);
      },
      dirt(c) {
        const g = ramp(['#3e3431', '#5a4c46', '#776960', '#92867a', '#aca295']);
        field(c, 0, TOP - 8, W, HEM + 8, 2, (x, y) => g(U.clamp(cloth(x, y) * 0.66 + nz.fbm(x * 0.02, y * 0.012, 4) * 0.42, 0, 1)));
        grime(c, r, 0, TOP, W, HEM, 34);
        // long runs of dust caught along the folds, top to bottom
        c.lineCap = 'round';
        const along = (u, y0, y1, side) => { c.beginPath(); for (let y = y0; y < y1; y += 8) { const px = OUT + u * (edge(y) - OUT), x = side ? W - px : px; if (y === y0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); };
        for (let i = 0; i < 150; i++) {
          const y = 96 + r() * 400;
          c.strokeStyle = `rgba(212,204,190,${(0.14 + r() * 0.26).toFixed(2)})`; c.lineWidth = 1 + r() * 2.8;
          along(r(), y, y + 30 + r() * 110, r() < 0.5);
        }
        // dust lying thick on the swags, and fluff in the gathers at the cords
        for (const k of [0, 1, 2]) for (let t = 0.3; t < 0.92; t += 0.16) {
          c.strokeStyle = `rgba(222,214,200,${(0.26 + r() * 0.24).toFixed(2)})`; c.lineWidth = 2 + r() * 2;
          const a = ROSES[k], b = ROSES[k + 1]; c.beginPath();
          for (let x = a + 6; x <= b - 6; x += 5) { const y = TOP - 6 + (swag(x) - TOP + 6) * t; if (x === a + 6) c.moveTo(x, y); else c.lineTo(x, y); }
          c.stroke();
        }
        for (let i = 0; i < 90; i++) {
          const side = r() < 0.5, y = TIE + (r() - 0.5) * 70, px = OUT + r() * (edge(y) - OUT), s = 3 + r() * 7;
          c.fillStyle = `rgba(204,197,184,${(0.3 + r() * 0.34).toFixed(2)})`; c.beginPath(); c.ellipse(side ? W - px : px, y, s, s * 0.7, r() * 3, 0, TAU); c.fill();
        }
        for (let i = 0; i < 2200; i++) { c.fillStyle = r() < 0.5 ? 'rgba(225,218,205,0.26)' : 'rgba(40,30,26,0.2)'; c.fillRect(r() * W, TOP + r() * (HEM - TOP), 1.3, 1.3); }
        cobweb(c, OUT, TOP - 6, 0, 88);
        cobweb(c, W - OUT, TOP - 6, Math.PI / 2, 76);
        cobweb(c, OUT, TIE + 10, -Math.PI / 2, 40);
      },
      top(c) {
        const q = U.rng(18042);
        // the gold fringe along the pelmet, a braid above it and a rose at each join
        c.lineCap = 'butt';
        for (let x = OUT; x < W - OUT; x += 2.6) {
          const y = swag(x), len = 11 + (q() - 0.5) * 2;
          c.strokeStyle = q() < 0.3 ? GOLD_DK : q() < 0.5 ? GOLD_LT : GOLD; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x, y - 1); c.lineTo(x + 0.4, y + len); c.stroke();
        }
        c.lineJoin = 'round'; c.beginPath();
        for (let x = OUT; x <= W - OUT; x += 3) { if (x === OUT) c.moveTo(x, swag(x)); else c.lineTo(x, swag(x)); }
        c.strokeStyle = GOLD_DK; c.lineWidth = 4.4; c.stroke(); c.strokeStyle = GOLD; c.lineWidth = 2.6; c.stroke();
        for (const x of ROSES) {
          for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; dot(c, x + Math.cos(a) * 7.4, 92 + Math.sin(a) * 7.4, 4.2, k % 2 ? GOLD : GOLD_DK); }
          dot(c, x, 92, 5.6, GOLD_LT); dot(c, x, 92, 2.8, RED);
        }
        // the cords tying back each curtain, with a heavy tassel
        for (const side of [-1, 1]) {
          const ax = side < 0 ? OUT - 2 : W - OUT + 2, bx = side < 0 ? edge(TIE) + 5 : W - edge(TIE) - 5;
          const cord = () => { c.beginPath(); c.moveTo(ax, TIE - 7); c.quadraticCurveTo((ax + bx) / 2, TIE + 15, bx, TIE - 5); };
          c.lineCap = 'round';
          c.save(); c.translate(1.5, 2.4); cord(); c.strokeStyle = 'rgba(30,6,12,0.45)'; c.lineWidth = 7; c.stroke(); c.restore();
          cord(); c.strokeStyle = GOLD_DK; c.lineWidth = 7; c.stroke(); c.strokeStyle = GOLD; c.lineWidth = 4.8; c.stroke();
          c.save(); c.lineCap = 'butt'; c.setLineDash([2.6, 4]); c.strokeStyle = GOLD_LT; c.lineWidth = 3; cord(); c.stroke(); c.restore();
          const tx = U.lerp(ax, bx, 0.72), ty = TIE + 8;
          c.fillStyle = 'rgba(30,6,12,0.4)'; c.beginPath(); c.ellipse(tx + 3, ty + 34, 9, 30, 0, 0, TAU); c.fill();
          for (let k = -7; k <= 7; k++) { c.strokeStyle = k % 3 ? GOLD : GOLD_DK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(tx + k * 0.7, ty + 16); c.lineTo(tx + k * 1.4, ty + 56); c.stroke(); }
          c.fillStyle = lin(c, tx - 8, 0, tx + 8, 0, [[0, GOLD_DK], [0.45, GOLD_LT], [1, GOLD_DK]]); c.beginPath(); c.ellipse(tx, ty + 8, 8.5, 10, 0, 0, TAU); c.fill();
          c.fillStyle = GOLD_DK; c.fillRect(tx - 7.5, ty + 16, 15, 2.4);
          c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx, ty - 8); c.stroke();
          dot(c, ax, TIE - 7, 4.6, GOLD); dot(c, ax - 0.8, TIE - 8, 1.7, GOLD_LT);
        }
      },
      liveTop(c, t) {
        // the stars on the back cloth catch the little light now and then
        for (const s of twinkles) { const a = Math.pow(0.5 + 0.5 * Math.sin(t * 0.7 + s.ph), 3); if (a > 0.04) star(c, s.x, s.y, s.s, U.rgba(GOLD_LT, a * 0.9)); }
      },
    };
  }

  // -------------------------------------------------- THE THEATRE: THE TIN ROOF
  // The old hall's roof from the top of a ladder: long sheets of corrugated tin
  // painted dark blue, lapped over each other and nailed down in rows, with a
  // stove pipe through it, a gold star on a rod at the ridge and the dove that
  // lives up here. Rust and moss have had years at it; they scrub off and the
  // ribs come up shining. The seasons' leaves and snow (scenes4.js) settle on it
  // like any other roof.
  // roof { what: 'tin' }
  function tinRoof(S) {
    const { r, nz, bleed, opts } = S;
    const Y0 = 70, Y1 = 540, PITCH = 19, LAPS = [226, 382], NAILS = [112, 214, 274, 370, 430, 528], SHEET = 152;
    const FLUE = { x: 254, y: 196, rx: 31, ry: 13 };
    const winter = opts.dirt === 'snow';
    const region = new Path2D();
    region.rect(0, Y0, W, Y1 - Y0);
    region.moveTo(FLUE.x + FLUE.rx, FLUE.y); region.ellipse(FLUE.x, FLUE.y, FLUE.rx, FLUE.ry, 0, 0, TAU);
    const TONES = [0, 0.05, -0.04, 0.03, -0.06, 0.02, 0.07];
    const row = (y) => (y < LAPS[0] ? 0 : y < LAPS[1] ? 1 : 2);
    // light on the ribs, from the left: 0 down in a valley's shade, 1 on the sunny flank
    const rib = (x, y) => {
      const w = x + (nz.n2(x * 0.012, y * 0.008) - 0.5) * 3, a = (w / PITCH) * TAU;
      return 0.46 + 0.3 * Math.cos(a) + 0.24 * Math.pow(Math.max(0, Math.cos(a - 0.55)), 10);
    };
    const tone = (x, y) => { const j = row(y); return TONES[(Math.floor((x + j * 57) / SHEET) * 7 + j * 3 + 70) % TONES.length]; };
    const lapY = (x, k) => LAPS[k] + 2.2 * Math.sin((x / PITCH) * TAU);
    // where one sheet lies over the next: a shadow and a bright cut edge
    function laps(c, dark, light) {
      for (let k = 0; k < 2; k++) {
        const wave = (dy) => { c.beginPath(); for (let x = -2; x <= W + 2; x += 2) { const y = lapY(x, k) + dy; if (x === -2) c.moveTo(x, y); else c.lineTo(x, y); } };
        wave(2.4); c.strokeStyle = dark; c.lineWidth = 4; c.stroke();
        wave(0); c.strokeStyle = light; c.lineWidth = 1.1; c.stroke();
      }
      for (let j = 0; j < 3; j++) {
        const y0 = j ? LAPS[j - 1] : Y0, y1 = j < 2 ? LAPS[j] : Y1;
        for (let x = SHEET - j * 57; x < W; x += SHEET) if (x > 0) { c.fillStyle = dark; c.fillRect(x, y0, 1.6, y1 - y0); c.fillStyle = light; c.fillRect(x - 1, y0, 1, y1 - y0); }
      }
    }
    const nails = [];
    for (const y of NAILS) for (let x = PITCH * (y % 2 ? 0.92 : 1.92); x < W; x += PITCH * 2) nails.push([x, y]);
    // a line of snow lying along an edge
    function snowLine(c, q, x0, x1, y, h) {
      c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(x0, y);
      for (let x = x0; x <= x1; x += 7) c.lineTo(x, y - h * (0.6 + q() * 0.5));
      c.lineTo(x1, y + 2); c.lineTo(x0, y + 2); c.closePath(); c.fill();
      c.fillStyle = 'rgba(170,195,220,0.5)'; c.fillRect(x0, y, x1 - x0, 1.6);
    }
    return {
      family: 'scrub', particle: 'moss', region, depth: true,
      tough: (x, y) => (nz.fbm(x * 0.025 + 7, y * 0.025, 3) > 0.58 ? 1.6 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1805);
        // the sky over the ridge, and a little of the hills
        c.fillStyle = lin(c, 0, y0, 0, 70, [[0, '#a9d6ec'], [1, '#e8f1ea']]); c.fillRect(x0, y0, x1 - x0, 74 - y0);
        c.fillStyle = 'rgba(255,255,255,0.9)'; for (const [x, y, s] of [[64, 26, 1], [206, 18, 0.7]]) { c.beginPath(); c.ellipse(x, y, 28 * s, 8 * s, 0, 0, TAU); c.ellipse(x + 20 * s, y - 5 * s, 17 * s, 9 * s, 0, 0, TAU); c.fill(); }
        // under the gutter, the top of the theatre's front, with its row of bulbs
        c.fillStyle = lin(c, 0, 556, 0, y1, [[0, NAVY_DK], [1, NAVY]]); c.fillRect(x0, 556, x1 - x0, y1 - 556);
        c.fillStyle = GOLD; c.fillRect(x0, 570, x1 - x0, 2); c.fillRect(x0, 592, x1 - x0, 2);
        for (let x = 6 + q() * 4; x < x1; x += 22) { glow(c, x, 581, 15, 'rgba(255,214,140,0.7)'); dot(c, x, 581, 3.2, '#fff0bd'); dot(c, x - 1, 580, 1.2, '#ffffff'); }
      },
      clean(c) {
        const g = ramp(['#121d36', '#1e3259', '#2c4a7f', '#47699f', '#9db8d8']);
        field(c, 0, Y0 - 4, W, Y1 + 4, 1.5, (x, y) => g(rib(x, y) + tone(x, y)));
        laps(c, 'rgba(8,14,32,0.55)', 'rgba(190,212,236,0.5)');
        for (const [x, y] of nails) { dot(c, x + 0.8, y + 1, 3.6, 'rgba(8,14,32,0.4)'); dot(c, x, y, 3.3, '#8c98a6'); dot(c, x, y, 2, '#d6dde4'); dot(c, x - 0.6, y - 0.6, 0.8, '#ffffff'); }
      },
      cleanOver(c) {
        // the sky lying along the wet tin in a long soft band
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = lin(c, 0, 170, 360, 470, [[0.25, 'rgba(255,255,255,0)'], [0.5, 'rgba(190,215,240,0.08)'], [0.75, 'rgba(255,255,255,0)']]); c.fillRect(0, Y0, W, Y1 - Y0);
        c.restore();
      },
      dirt(c) {
        const rust = ramp(['#42301f', '#664429', '#8c5a30', '#ad7a42', '#cfa873']), moss = ramp(['#34491f', '#4d672b', '#688536', '#8ba34a']), old = ramp(['#4e4c4a', '#6f6b64', '#8e8a7e', '#b0aa9a']);
        const mix3 = (a, b, t) => [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)];
        field(c, 0, Y0 - 4, W, Y1 + 4, 2, (x, y) => {
          const s = rib(x, y), v = nz.fbm(x * 0.03, y * 0.03, 4);
          // rust and what is left of the old paint on the ribs, moss down the valleys
          const m = nz.fbm(x * 0.02 + 31, y * 0.012, 4), metal = mix3(rust(s * 0.74 + v * 0.34), old(s * 0.7 + v * 0.4), U.smooth(0.5, 0.58, nz.fbm(x * 0.02 + 5, y * 0.02 + 9, 4)));
          return mix3(metal, moss(s * 0.6 + v * 0.5), U.smooth(0.5, 0.62, m + (0.5 - s) * 0.34));
        });
        laps(c, 'rgba(20,16,10,0.5)', 'rgba(210,190,150,0.3)');
        // the nails have bled rust down the sheets
        c.lineCap = 'round';
        for (const [x, y] of nails) {
          const l = 18 + r() * 52, g = c.createLinearGradient(0, y, 0, y + l); g.addColorStop(0, 'rgba(96,48,20,0.8)'); g.addColorStop(1, 'rgba(96,48,20,0)');
          c.strokeStyle = g; c.lineWidth = 1.6 + r() * 2.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + l); c.stroke();
          dot(c, x, y, 3.4, '#5c3c24'); dot(c, x - 0.5, y - 0.5, 1.6, '#8d6a48');
        }
        // moss cushions along the valleys, bigger where it is thick
        for (let i = 0; i < 230; i++) {
          const x = PITCH * (Math.floor(r() * 20) + 0.5), y = Y0 + 6 + r() * (Y1 - Y0 - 8), big = nz.fbm(x * 0.025 + 7, y * 0.025, 3) > 0.58, s = big ? 6 + r() * 4 : 2.6 + r() * 3;
          c.fillStyle = 'rgba(20,30,10,0.26)'; c.beginPath(); c.ellipse(x + s * 0.15, y + s * 0.4, s * 0.9, s * 1.1, 0, 0, TAU); c.fill();
          for (let k = 0; k < 9; k++) {
            const a = r() * TAU, d = r() * s * 0.6;
            c.fillStyle = U.pick(r, ['#5c7a2e', '#6f9037', '#4b6626', '#86a646', '#7fa83e']);
            c.beginPath(); c.arc(x + Math.cos(a) * d * 0.8, y + Math.sin(a) * d * 1.1, s * (0.22 + r() * 0.22), 0, TAU); c.fill();
          }
          c.fillStyle = 'rgba(230,245,170,0.35)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x - s * 0.3 + r() * s * 0.6, y - s * 0.4 + r() * s * 0.4, 0.9, 0, TAU); c.fill(); }
        }
        // rings of lichen, what the dove has left, and the twigs and leaves caught in the laps
        for (let i = 0; i < 22; i++) {
          const x = r() * W, y = Y0 + 8 + r() * 460, s = 2.4 + r() * 3.6;
          for (let k = 0; k < 7; k++) { const a = r() * TAU, d = r() * s; dot(c, x + Math.cos(a) * d, y + Math.sin(a) * d, s * (0.3 + r() * 0.3), U.pick(r, ['#c9c98f', '#b8bb7c', '#d8d6a8'])); }
        }
        for (let i = 0; i < 12; i++) { const x = 230 + r() * 110, y = 82 + r() * 110; dot(c, x, y, 2.4 + r() * 2.6, 'rgba(238,236,226,0.92)'); dot(c, x + 1, y + 1.4, 1.2, 'rgba(120,120,110,0.7)'); }
        for (let i = 0; i < 26; i++) {
          c.save(); c.translate(r() * W, LAPS[i % 2] - 3 + r() * 8); c.rotate(r() * TAU);
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#c9a24a', '#6e4a26']); c.beginPath(); c.ellipse(0, 0, 7, 3.4, 0, 0, TAU); c.fill(); c.restore();
        }
      },
      top(c) {
        const q = U.rng(18051), f = FLUE;
        // the ridge roll, in plain galvanised tin
        c.fillStyle = 'rgba(12,16,30,0.3)'; c.fillRect(bleed.x0, Y0, bleed.x1 - bleed.x0, 7);
        c.fillStyle = lin(c, 0, 54, 0, 74, [[0, '#f0f3f6'], [0.4, '#bcc6d0'], [1, '#6c7886']]); c.fillRect(bleed.x0, 54, bleed.x1 - bleed.x0, 20);
        for (let x = 40; x < W; x += 96) { c.fillStyle = 'rgba(50,60,74,0.5)'; c.fillRect(x, 54, 1.6, 20); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x + 1.6, 54, 1, 20); }
        // the gold star on its rod
        const vx = 96;
        c.strokeStyle = GOLD_DK; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(vx, 54); c.lineTo(vx, 22); c.stroke();
        c.fillStyle = '#5b6470'; c.fillRect(vx - 7, 50, 14, 5);
        c.strokeStyle = GOLD; c.lineWidth = 1.8; c.beginPath(); c.moveTo(vx - 16, 34); c.lineTo(vx + 16, 34); c.stroke();
        c.fillStyle = GOLD; c.beginPath(); c.moveTo(vx + 21, 34); c.lineTo(vx + 13, 29.6); c.lineTo(vx + 13, 38.4); c.closePath(); c.fill();
        c.fillStyle = GOLD; c.beginPath(); c.moveTo(vx - 20, 29); c.lineTo(vx - 12, 34); c.lineTo(vx - 20, 39); c.closePath(); c.fill();
        star(c, vx + 0.8, 15.6, 11.4, 'rgba(60,40,10,0.35)'); star(c, vx, 15, 11, GOLD); star(c, vx - 0.8, 14, 5, GOLD_LT);
        // the dove on the ridge, looking down at the work
        const dx = 296, dy = 54;
        c.fillStyle = 'rgba(40,50,60,0.3)'; c.beginPath(); c.ellipse(dx, dy + 1, 14, 2.2, 0, 0, TAU); c.fill();
        c.fillStyle = '#d9a173'; c.fillRect(dx - 4, dy - 4, 1.6, 4); c.fillRect(dx + 1, dy - 4, 1.6, 4);
        c.fillStyle = '#f7f6f1'; c.beginPath(); c.moveTo(dx + 15, dy - 10); c.quadraticCurveTo(dx + 8, dy - 2, dx - 4, dy - 3); c.quadraticCurveTo(dx - 12, dy - 6, dx - 13, dy - 15); c.quadraticCurveTo(dx - 6, dy - 18, dx + 2, dy - 15); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(dx + 8, dy - 9); c.lineTo(dx + 24, dy - 4); c.lineTo(dx + 12, dy - 3); c.closePath(); c.fill();
        dot(c, dx - 13, dy - 19, 6.2, '#fdfcf8');
        c.fillStyle = '#dcdcd4'; c.beginPath(); c.moveTo(dx - 7, dy - 12); c.quadraticCurveTo(dx + 6, dy - 15, dx + 15, dy - 7); c.quadraticCurveTo(dx + 2, dy - 5, dx - 7, dy - 12); c.closePath(); c.fill();
        c.fillStyle = '#d9a173'; c.beginPath(); c.moveTo(dx - 18.6, dy - 20); c.lineTo(dx - 23, dy - 18.6); c.lineTo(dx - 18.2, dy - 17.6); c.closePath(); c.fill();
        dot(c, dx - 15, dy - 20, 1, '#2a2622');
        // the stove pipe, in a lead collar, under a little tin hat
        c.fillStyle = 'rgba(10,14,26,0.3)'; c.beginPath(); c.ellipse(f.x + 6, f.y + 7, f.rx + 4, f.ry + 3, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, 0, f.y - f.ry, 0, f.y + f.ry, [[0, '#a8b0b8'], [1, '#6a7480']]); c.beginPath(); c.ellipse(f.x, f.y, f.rx, f.ry, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(40,48,60,0.35)'; c.lineWidth = 1; c.beginPath(); c.ellipse(f.x, f.y, f.rx - 7, f.ry - 3, 0, 0, TAU); c.stroke();
        c.fillStyle = lin(c, f.x - 13, 0, f.x + 13, 0, [[0, '#59616c'], [0.3, '#a7b0ba'], [1, '#30363f']]); c.fillRect(f.x - 13, 112, 26, f.y - 112);
        c.fillStyle = lin(c, f.x - 13, 0, f.x + 13, 0, [[0, '#4a525c'], [0.3, '#8e98a2'], [1, '#262b33']]); c.beginPath(); c.ellipse(f.x, f.y, 13, 5, 0, 0, Math.PI); c.fill();
        for (const y of [132, 164]) { c.fillStyle = 'rgba(20,24,32,0.45)'; c.fillRect(f.x - 13, y, 26, 1.8); }
        c.strokeStyle = '#4a525c'; c.lineWidth = 2; c.beginPath(); c.moveTo(f.x - 10, 112); c.lineTo(f.x - 10, 104); c.moveTo(f.x + 10, 112); c.lineTo(f.x + 10, 104); c.stroke();
        c.fillStyle = lin(c, f.x - 21, 0, f.x + 21, 0, [[0, '#6f7883'], [0.35, '#c2cad2'], [1, '#3c434d']]); c.beginPath(); c.moveTo(f.x - 22, 106); c.lineTo(f.x, 88); c.lineTo(f.x + 22, 106); c.quadraticCurveTo(f.x, 111, f.x - 22, 106); c.fill();
        // the iron gutter along the eaves, on its brackets
        c.fillStyle = 'rgba(12,16,30,0.4)'; c.fillRect(bleed.x0, Y1 - 5, bleed.x1 - bleed.x0, 5);
        c.fillStyle = lin(c, 0, Y1, 0, 557, [[0, '#59616c'], [0.3, '#2c323b'], [1, '#14181f']]); c.fillRect(bleed.x0, Y1, bleed.x1 - bleed.x0, 17);
        c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(bleed.x0, Y1 + 1.5, bleed.x1 - bleed.x0, 1.4);
        for (let x = 30; x < W; x += 90) { c.fillStyle = '#14181f'; c.fillRect(x, Y1 - 2, 6, 20); c.fillStyle = '#6a7480'; c.fillRect(x, Y1 - 2, 6, 1.6); }
        if (winter) {
          snowLine(c, q, bleed.x0, bleed.x1, 56, 9); snowLine(c, q, bleed.x0, bleed.x1, Y1 + 2, 6);
          c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(f.x - 24, 106); c.quadraticCurveTo(f.x - 12, 92, f.x, 84); c.quadraticCurveTo(f.x + 12, 92, f.x + 24, 106); c.quadraticCurveTo(f.x, 100, f.x - 24, 106); c.fill();
        }
      },
      liveTop(c, t) {
        // a thread of smoke from the pipe, the stove being lit for the rehearsal
        for (let k = 0; k < 5; k++) {
          const p = (t * 0.05 + k / 5) % 1, x = FLUE.x + 2 + Math.sin(p * 6 + k) * (3 + p * 9) + p * 16, y = 90 - p * 96, a = Math.min(1, p * 5) * (1 - p) * 0.34;
          dot(c, x, y, 3 + p * 9, `rgba(240,240,244,${a.toFixed(3)})`);
        }
      },
    };
  }

  // --------------------------------------------- THE THEATRE: THE TICKET BOOTH
  // The box office let into the front of the theatre: one tall arched pane in a
  // dark blue kiosk, a brass speaking grille and a pay slot, a counter with its
  // bell. Behind the glass is the clerk's whole world: pigeonholes of tickets,
  // the plan of the seats, rolls on a shelf, a lamp, the ledger and a cat. The
  // glass hides all that under dirt and a card saying CLOSED; washing it finds
  // the gold letters on the pane. Rain, snow, leaves and frost (scenes4.js) all
  // lie on the same glass.
  // window { room: 'booth' }
  function ticketBooth(S) {
    const { r, nz, bleed, opts } = S;
    const CX = 180, GX0 = 54, GX1 = 306, AR = (GX1 - GX0) / 2, AY = 232, GY1 = 440, GY0 = AY - AR;   // the glass: sides, arch, foot
    const TALK = { x: CX, y: 348, r: 25 }, SLOT = 44, LEDGE = 24;
    const winter = opts.dirt === 'snow';
    const glassPath = (p) => { p.moveTo(GX0, GY1); p.lineTo(GX0, AY); p.arc(CX, AY, AR, Math.PI, 0); p.lineTo(GX1, GY1); p.closePath(); };
    const region = new Path2D();
    glassPath(region);
    region.moveTo(TALK.x + TALK.r, TALK.y); region.arc(TALK.x, TALK.y, TALK.r, 0, TAU);
    region.moveTo(CX - SLOT, GY1); region.arc(CX, GY1, SLOT, Math.PI, 0); region.closePath();

    function room(c) {
      const q = U.rng(1806);
      // the wall, papered dark red with a small gold star
      c.fillStyle = lin(c, 0, GY0, 0, 390, [[0, '#4c1620'], [1, '#7c2832']]); c.fillRect(GX0, GY0, GX1 - GX0, 300);
      for (let y = 116, k = 0; y < 330; y += 22, k++) for (let x = GX0 + 8 + (k % 2) * 13; x < GX1; x += 26) star(c, x, y, 2.5, 'rgba(216,174,78,0.42)');
      // a dado of dark boards
      c.fillStyle = lin(c, 0, 330, 0, 396, [[0, '#4a2a1c'], [1, '#2e1a12']]); c.fillRect(GX0, 330, GX1 - GX0, 66);
      c.fillStyle = GOLD_DK; c.fillRect(GX0, 328, GX1 - GX0, 2.4);
      for (let x = GX0 + 10; x < GX1; x += 34) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x, 338, 26, 50); c.fillStyle = 'rgba(255,220,170,0.08)'; c.fillRect(x + 1.4, 339.4, 24, 47); }
      // the pigeonholes, a little bundle of tickets in each
      const PX = 70, PY = 190, PW = 88, PH = 120, NC = 4, NR = 5, cw = PW / NC, ch = PH / NR;
      c.fillStyle = 'rgba(20,6,10,0.4)'; c.fillRect(PX + 3, PY + 4, PW + 8, PH + 8);
      c.fillStyle = '#6e452c'; c.fillRect(PX - 3, PY - 3, PW + 6, PH + 6);
      c.fillStyle = '#21120c'; c.fillRect(PX, PY, PW, PH);
      for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) {
        const x = PX + i * cw, y = PY + j * ch, n = (q() * 3) | 0;
        for (let k = 0; k <= n; k++) { c.fillStyle = U.pick(q, ['#e9c9c0', '#e6d6a6', '#bcd0e4', '#f3e7cd', '#d8404a']); c.fillRect(x + 3 + k * 1.2, y + ch - 12 + k * 1.4, cw - 8, 10 - k * 1.4); }
      }
      c.fillStyle = '#7d5234';
      for (let i = 1; i < NC; i++) c.fillRect(PX + i * cw - 0.8, PY, 1.6, PH);
      for (let j = 1; j < NR; j++) c.fillRect(PX, PY + j * ch - 0.8, PW, 1.6);
      // the plan of the seats in a gold frame
      c.fillStyle = 'rgba(20,6,10,0.4)'; c.fillRect(216, 188, 72, 74);
      c.fillStyle = GOLD; c.fillRect(212, 184, 72, 74); c.fillStyle = GOLD_LT; c.fillRect(212, 184, 72, 1.4);
      c.fillStyle = CREAM; c.fillRect(216, 188, 64, 66);
      c.fillStyle = RED_DK; c.fillRect(226, 192, 44, 6);
      for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) { if (i === 3) continue; const sold = q() < 0.32; dot(c, 222 + i * 8.6, 206 + j * 9.6, 2.7, sold ? RED : '#c9b48a'); }
      // the shelf of ticket rolls, and a tin of toffee
      c.fillStyle = 'rgba(20,6,10,0.4)'; c.fillRect(208, 311, 94, 6);
      c.fillStyle = '#7d5234'; c.fillRect(204, 304, 102, 8); c.fillStyle = '#a06f48'; c.fillRect(204, 304, 102, 2);
      for (const [x, col] of [[224, '#d8404a'], [253, '#3f6fb0'], [282, GOLD]]) {
        dot(c, x, 289, 16.6, 'rgba(20,6,10,0.3)'); dot(c, x, 288, 16, col); c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1; for (const rad of [7, 10, 13]) { c.beginPath(); c.arc(x, 288, rad, 0, TAU); c.stroke(); }
        dot(c, x, 288, 4.4, '#efe3c9'); dot(c, x, 288, 2, '#2e1a12');
      }
      // the counter inside, the ledger and its ink, and the cat, who has the warm end
      c.fillStyle = lin(c, 0, 392, 0, GY1, [[0, '#9a6a44'], [1, '#6b4429']]); c.fillRect(GX0, 392, GX1 - GX0, GY1 - 392);
      c.fillStyle = '#c0905e'; c.fillRect(GX0, 392, GX1 - GX0, 2);
      c.fillStyle = 'rgba(20,10,6,0.3)'; c.beginPath(); c.moveTo(214, 430); c.lineTo(296, 430); c.lineTo(286, 404); c.lineTo(224, 404); c.closePath(); c.fill();
      c.fillStyle = '#f6eedd'; c.beginPath(); c.moveTo(218, 426); c.lineTo(256, 428); c.lineTo(255, 402); c.lineTo(226, 400); c.closePath(); c.fill();
      c.fillStyle = '#ece1ca'; c.beginPath(); c.moveTo(294, 426); c.lineTo(256, 428); c.lineTo(255, 402); c.lineTo(286, 400); c.closePath(); c.fill();
      c.fillStyle = 'rgba(60,50,60,0.45)'; for (let k = 0; k < 4; k++) { c.fillRect(228 - k, 406 + k * 5, 22, 1.2); c.fillRect(262, 406 + k * 5, 22 + k, 1.2); }
      dot(c, 200, 416, 7.4, NAVY_DK); dot(c, 200, 414, 5.4, NAVY_LT); dot(c, 200, 413.4, 2.4, '#0a0a14');
      c.strokeStyle = '#2a1a12'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(199, 413); c.lineTo(190, 390); c.stroke();
      c.strokeStyle = GOLD; c.lineWidth = 1.2; c.beginPath(); c.moveTo(195, 402); c.lineTo(190, 390); c.stroke();
      const kx = 100, ky = 410;
      c.fillStyle = 'rgba(20,10,6,0.35)'; c.beginPath(); c.ellipse(kx + 2, ky + 16, 34, 7, 0, 0, TAU); c.fill();
      c.fillStyle = '#d98f4a'; c.beginPath(); c.ellipse(kx, ky + 3, 32, 15, 0, 0, TAU); c.fill();
      c.strokeStyle = '#d98f4a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(kx + 26, ky + 8); c.quadraticCurveTo(kx + 18, ky + 19, kx - 12, ky + 15); c.stroke();
      c.strokeStyle = '#b8712f'; c.lineWidth = 2.4; for (const dx of [-8, 3, 14]) { c.beginPath(); c.moveTo(kx + dx, ky - 10); c.quadraticCurveTo(kx + dx + 4, ky - 2, kx + dx + 1, ky + 6); c.stroke(); }
      dot(c, kx - 26, ky + 2, 12, '#e09a55');
      c.fillStyle = '#e09a55'; c.beginPath(); c.moveTo(kx - 36, ky - 4); c.lineTo(kx - 34, ky - 17); c.lineTo(kx - 26, ky - 9); c.lineTo(kx - 17, ky - 15); c.lineTo(kx - 16, ky - 3); c.closePath(); c.fill();
      c.strokeStyle = '#6b3f1c'; c.lineWidth = 1.2; for (const dx of [-31, -21]) { c.beginPath(); c.arc(kx + dx, ky + 1, 2.6, 0.3, Math.PI - 0.3); c.stroke(); }
      c.fillStyle = '#c96a6a'; c.beginPath(); c.arc(kx - 26, ky + 6, 1.3, 0, TAU); c.fill();
      // the hanging lamp, and its light on everything
      c.strokeStyle = '#2a1a12'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(CX, GY0); c.lineTo(CX, 148); c.stroke();
      c.fillStyle = lin(c, CX - 26, 0, CX + 26, 0, [[0, GOLD_DK], [0.45, GOLD_LT], [1, GOLD_DK]]); c.beginPath(); c.moveTo(CX - 9, 148); c.lineTo(CX + 9, 148); c.quadraticCurveTo(CX + 21, 158, CX + 26, 176); c.lineTo(CX - 26, 176); c.quadraticCurveTo(CX - 21, 158, CX - 9, 148); c.closePath(); c.fill();
      c.fillStyle = '#fff4cf'; c.beginPath(); c.ellipse(CX, 176, 26, 5, 0, 0, TAU); c.fill();
      glow(c, CX, 190, 210, 'rgba(255,214,140,0.34)');
      c.fillStyle = lin(c, 0, 176, 0, GY1, [[0, 'rgba(255,226,160,0.22)'], [1, 'rgba(255,226,160,0)']]); c.beginPath(); c.moveTo(CX - 24, 176); c.lineTo(CX + 24, 176); c.lineTo(CX + 130, GY1); c.lineTo(CX - 130, GY1); c.closePath(); c.fill();
    }
    // gold leaf on the inside of the glass, in an arc under the top of the pane
    function goldLetters(c) {
      const word = 'BOX OFFICE', R = AR - 19, span = 1.72;
      c.save(); c.font = `700 19px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      [...word].forEach((ch, i) => {
        const a = -Math.PI / 2 + (i / (word.length - 1) - 0.5) * span;
        c.save(); c.translate(CX + Math.cos(a) * R, AY + Math.sin(a) * R); c.rotate(a + Math.PI / 2);
        c.fillStyle = 'rgba(40,16,10,0.75)'; c.fillText(ch, 1, 1.4);
        c.fillStyle = lin(c, 0, -10, 0, 10, [[0, '#fff3c0'], [0.5, GOLD], [0.6, '#b8822a'], [1, '#f2d37e']]); c.fillText(ch, 0, 0);
        c.restore();
      });
      c.restore();
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) {
        const d = y < AY ? AR - Math.hypot(x - CX, y - AY) : Math.min(x - GX0, GX1 - x);
        return Math.min(d, GY1 - y) < 14 ? 1.4 : 1;
      },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(18061);
        // the front of the theatre, in dark blue boards
        c.fillStyle = lin(c, 0, y0, 0, y1, [[0, NAVY_LT], [1, NAVY]]); c.fillRect(x0, y0, x1 - x0, y1 - y0);
        for (let x = x0 + 2; x < x1; x += 20) { c.fillStyle = 'rgba(0,0,0,0.26)'; c.fillRect(x, y0, 1.4, y1 - y0); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(x + 1.4, y0, 1, y1 - y0); }
        for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${q() < 0.5 ? '0,0,0' : '255,255,255'},${(0.03 + q() * 0.04).toFixed(2)})`; c.beginPath(); c.ellipse(x0 + q() * (x1 - x0), y0 + q() * (y1 - y0), 4 + q() * 12, 2 + q() * 6, q() * 3, 0, TAU); c.fill(); }
        // the panels under the counter, each with a star
        for (const [a, b] of [[30, 172], [188, 330]]) {
          c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(a + 2, 482, b - a, 90);
          c.fillStyle = NAVY_DK; c.fillRect(a, 480, b - a, 90);
          c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(a + 5, 485, b - a - 10, 80);
          star(c, (a + b) / 2, 525, 20, GOLD); star(c, (a + b) / 2, 525, 8, NAVY);
        }
        c.fillStyle = '#b9b2a6'; c.fillRect(x0, 584, x1 - x0, y1 - 584); c.fillStyle = '#8f887c'; c.fillRect(x0, 584, x1 - x0, 2);
        // the kiosk stands a little proud of the wall
        const fr = new Path2D(); glassPath(fr);
        softShadow(c, fr, 16, 0.45, 0, 5);
      },
      clean: room,
      cleanOver(c) {
        goldLetters(c);
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [o, wd, a] of [[-70, 44, 0.08], [0, 14, 0.06], [110, 56, 0.05]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(GX0 + o + 170, GY0); c.lineTo(GX0 + o + 170 + wd, GY0); c.lineTo(GX0 + o - 70 + wd, GY1); c.lineTo(GX0 + o - 70, GY1); c.closePath(); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#857c6c', '#988f7e', '#a79e8b', '#b6ad9a']);
        field(c, GX0, GY0, GX1, GY1, 2, (x, y) => { const v = nz.fbm(x * 0.025, y * 0.025, 5); return [...g(v), 250 - v * 22]; });
        // dried rain, water spots, a dusting of pollen
        for (let i = 0; i < 70; i++) {
          const x = GX0 + r() * (GX1 - GX0), y = GY0 + r() * (GY1 - GY0) * 0.7, l = 30 + r() * 110;
          c.strokeStyle = `rgba(230,225,210,${(0.15 + r() * 0.25).toFixed(2)})`; c.lineWidth = 1 + r() * 1.5;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 6, y + l / 2, x + (r() - 0.5) * 4, y + l); c.stroke();
        }
        for (let i = 0; i < 80; i++) { c.strokeStyle = 'rgba(240,235,220,0.45)'; c.lineWidth = 0.8; c.beginPath(); c.arc(GX0 + r() * (GX1 - GX0), GY0 + r() * (GY1 - GY0), 2 + r() * 6, 0, TAU); c.stroke(); }
        grime(c, r, GX0, GY0, GX1, GY1, 14);
        for (let i = 0; i < 800; i++) { c.fillStyle = r() < 0.5 ? 'rgba(90,75,50,0.35)' : 'rgba(230,210,140,0.35)'; c.fillRect(GX0 + r() * (GX1 - GX0), GY0 + r() * (GY1 - GY0), 1.2, 1.2); }
        // fingers round the grille and the slot, from every queue there has been
        for (let i = 0; i < 26; i++) {
          const near = i % 2, a = r() * TAU, d = near ? 34 + r() * 44 : 56 + r() * 50, x = CX + Math.cos(a) * d * 1.3, y = (near ? TALK.y : GY1 - 26) + Math.sin(a) * d * 0.7;
          c.save(); c.translate(x, y); c.rotate(r() * 1.4 - 0.7);
          c.fillStyle = 'rgba(245,240,226,0.2)'; c.beginPath(); c.ellipse(0, 0, 6, 8.4, 0, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(70,58,44,0.32)'; c.lineWidth = 0.7;
          for (let k = 1; k < 5; k++) { c.beginPath(); c.ellipse(0, 1, k * 1.3, k * 1.9, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
          c.restore();
        }
        // the card that has hung in the window for far too long
        c.save(); c.translate(236, 186); c.rotate(0.07);
        c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(-41, -19, 86, 46);
        c.fillStyle = '#e4d6b4'; c.fillRect(-43, -22, 86, 46);
        c.strokeStyle = RED_DK; c.lineWidth = 1.6; c.strokeRect(-39, -18, 78, 38);
        c.fillStyle = RED_DK; c.font = `700 17px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CLOSED', 0, 2);
        c.fillStyle = 'rgba(230,226,205,0.6)'; c.save(); c.rotate(-0.6); c.fillRect(-10, -30, 20, 8); c.restore();
        c.restore();
        // and a web in the shoulder of the arch
        cobweb(c, GX1 - 26, GY0 + 44, Math.PI / 2, 66);
      },
      top(c) {
        const q = U.rng(18062), fx = 12;
        // gold pilasters either side of the window
        for (const px of [18, W - 18]) {
          c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(px - 11, 100, 25, 372);
          c.fillStyle = lin(c, px - 12, 0, px + 12, 0, [[0, GOLD_DK], [0.4, GOLD_LT], [1, GOLD_DK]]); c.fillRect(px - 12, 96, 24, 372);
          for (let k = -1; k <= 1; k++) { c.fillStyle = 'rgba(90,60,20,0.5)'; c.fillRect(px + k * 7 - 1, 108, 2, 346); }
          c.fillStyle = GOLD_LT; c.fillRect(px - 15, 92, 30, 7);
        }
        // the arched frame round the glass
        const frame = new Path2D();
        frame.moveTo(GX0 - fx, GY1 + 2); frame.lineTo(GX0 - fx, AY); frame.arc(CX, AY, AR + fx, Math.PI, 0); frame.lineTo(GX1 + fx, GY1 + 2); frame.closePath();
        glassPath(frame);
        c.fillStyle = lin(c, 0, GY0 - fx, 0, GY1, [[0, '#7a1723'], [1, RED_DK]]); c.fill(frame, 'evenodd');
        c.lineWidth = 1.8; c.strokeStyle = GOLD; c.beginPath(); glassPath(c); c.stroke();
        c.strokeStyle = GOLD_DK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(GX0 - fx, GY1); c.lineTo(GX0 - fx, AY); c.arc(CX, AY, AR + fx, Math.PI, 0); c.lineTo(GX1 + fx, GY1); c.stroke();
        c.fillStyle = 'rgba(0,0,0,0.14)'; c.beginPath(); c.arc(CX, AY, AR, Math.PI, 0); c.arc(CX, AY + 5, AR, 0, Math.PI, true); c.closePath(); c.fill();
        // the name board over the arch, with a row of lamps along its top
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(44, 18, 276, 66);
        c.fillStyle = lin(c, 0, 14, 0, 80, [[0, NAVY_LT], [1, NAVY_DK]]); c.fillRect(40, 14, 280, 64);
        c.strokeStyle = GOLD; c.lineWidth = 2.6; c.strokeRect(45, 19, 270, 54);
        c.fillStyle = 'rgba(30,14,6,0.8)'; c.font = `700 32px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TICKETS', 181, 48.5);
        c.fillStyle = lin(c, 0, 32, 0, 62, [[0, '#fff3c0'], [0.5, GOLD], [0.6, '#b8822a'], [1, '#f2d37e']]); c.fillText('TICKETS', 180, 47);
        for (const x of [72, 288]) star(c, x, 46, 11, GOLD);
        for (let x = 56; x < 320; x += 25) { dot(c, x, 12, 4, GOLD_DK); glow(c, x, 11, 12, 'rgba(255,214,140,0.7)'); dot(c, x, 11, 3.2, '#fff0bd'); dot(c, x - 1, 10, 1.1, '#ffffff'); }
        // the speaking grille: a brass ring and holes in circles
        const t = TALK;
        dot(c, t.x + 1, t.y + 2.4, t.r + 4, 'rgba(20,10,10,0.4)');
        dot(c, t.x, t.y, t.r + 3, GOLD_DK); dot(c, t.x, t.y, t.r + 1.4, GOLD); dot(c, t.x, t.y, t.r - 3, '#c79c3e');
        c.strokeStyle = GOLD_LT; c.lineWidth = 1; c.beginPath(); c.arc(t.x, t.y, t.r + 1, 3.3, 5.2); c.stroke();
        for (const [n, rad] of [[1, 0], [6, 7], [12, 14]]) for (let k = 0; k < n; k++) { const a = (k / n) * TAU; dot(c, t.x + Math.cos(a) * rad, t.y + Math.sin(a) * rad, 1.9, '#2e1a12'); }
        // the pay slot, worn bright where the coins go through
        c.fillStyle = '#21120c'; c.beginPath(); c.arc(CX, GY1, SLOT, Math.PI, 0); c.closePath(); c.fill();
        c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(CX, GY1, SLOT, Math.PI, 0); c.stroke();
        c.strokeStyle = GOLD_LT; c.lineWidth = 1.2; c.beginPath(); c.arc(CX, GY1, SLOT + 1.4, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
        // the counter along the front, the brass bell and the ticket waiting to be torn
        c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(22, GY1 + LEDGE - 2, 316, 8);
        c.fillStyle = lin(c, 0, GY1, 0, GY1 + LEDGE, [[0, '#c0905e'], [0.2, '#8f5f3c'], [1, '#54321f']]); c.beginPath(); c.roundRect(22, GY1, 316, LEDGE, 3); c.fill();
        c.fillStyle = GOLD; c.fillRect(22, GY1 + LEDGE - 5, 316, 2.4);
        c.fillStyle = 'rgba(30,14,10,0.35)'; c.beginPath(); c.ellipse(36, GY1 + 3, 16, 3.6, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, 22, 0, 50, 0, [[0, GOLD_DK], [0.4, GOLD_LT], [1, GOLD_DK]]); c.beginPath(); c.moveTo(21, GY1 + 2); c.quadraticCurveTo(23, GY1 - 20, 35, GY1 - 20); c.quadraticCurveTo(47, GY1 - 20, 49, GY1 + 2); c.closePath(); c.fill();
        c.fillStyle = GOLD_DK; c.fillRect(20, GY1, 30, 3.2); dot(c, 35, GY1 - 21.6, 2.8, GOLD); dot(c, 34.2, GY1 - 22.4, 1, GOLD_LT);
        c.fillStyle = 'rgba(30,14,10,0.3)'; c.fillRect(246, GY1 + 2, 52, 11);
        c.fillStyle = '#e9c9c0'; c.beginPath(); c.moveTo(244, GY1 + 1); c.lineTo(296, GY1 + 1); c.lineTo(293, GY1 + 5); c.lineTo(296, GY1 + 9); c.lineTo(244, GY1 + 9); c.closePath(); c.fill();
        c.fillStyle = RED_DK; c.font = `700 6.4px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ADMIT ONE', 268, GY1 + 5.4);
        if (winter) for (const [x0, x1, y, h] of [[40, 320, 14, 8], [22, 338, GY1, 6], [-4, 364, 584, 8]]) {
          c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(x0, y + 2);
          for (let x = x0; x <= x1; x += 9) c.lineTo(x, y - h * (0.6 + q() * 0.5));
          c.lineTo(x1, y + 2); c.closePath(); c.fill();
        }
      },
    };
  }

  // ------------------------------------- THE THEATRE: THE DRESSING-ROOM MIRROR
  // The round mirror over the dressing table, in a gold ring of lit bulbs with
  // good-luck cards tucked into it. Under seasons of powder, greasepaint and a
  // word in lipstick from a good night, it still holds the room behind you: the
  // striped wall, a rail of costumes and the door with its star.
  // roundWindow { what: 'mirror' }
  function dressingMirror(S) {
    const { r, nz, bleed } = S;
    const cx = 180, cy = 258, R = 136, RB = R + 18, N = 16, TABLE = 462;
    const region = new Path2D();
    region.moveTo(cx + R, cy); region.arc(cx, cy, R, 0, TAU);
    const BULBS = Array.from({ length: N }, (_, k) => { const a = -Math.PI / 2 + ((k + 0.5) / N) * TAU; return [cx + Math.cos(a) * RB, cy + Math.sin(a) * RB, k]; });

    function reflection(c) {
      const x0 = cx - R, x1 = cx + R, y0 = cy - R, y1 = cy + R, FLOOR = 358;
      // the wall behind you, striped dark blue and gold
      c.fillStyle = lin(c, 0, y0, 0, FLOOR, [[0, '#2a3c69'], [1, '#3b5288']]); c.fillRect(x0, y0, x1 - x0, FLOOR - y0);
      for (let x = x0 + 6; x < x1; x += 26) { c.fillStyle = 'rgba(216,174,78,0.2)'; c.fillRect(x, y0, 9, FLOOR - y0); c.fillStyle = 'rgba(246,225,154,0.16)'; c.fillRect(x + 11, y0, 1.6, FLOOR - y0); }
      c.fillStyle = GOLD_DK; c.fillRect(x0, 176, x1 - x0, 3);
      // the boards of the floor
      c.fillStyle = lin(c, 0, FLOOR, 0, y1, [[0, '#6e452c'], [1, '#8f6240']]); c.fillRect(x0, FLOOR, x1 - x0, y1 - FLOOR);
      c.fillStyle = '#2c1a12'; c.fillRect(x0, FLOOR - 6, x1 - x0, 7);
      c.fillStyle = 'rgba(40,20,10,0.4)'; for (let k = -6; k < 7; k++) { c.beginPath(); c.moveTo(cx + k * 30, FLOOR); c.lineTo(cx + k * 52, y1); c.lineTo(cx + k * 52 + 1.6, y1); c.lineTo(cx + k * 30 + 1, FLOOR); c.closePath(); c.fill(); }
      // the door, with its gold star
      c.fillStyle = 'rgba(10,14,30,0.35)'; c.fillRect(219, 196, 92, 160);
      c.fillStyle = '#ece0c6'; c.fillRect(222, 192, 84, 162);
      c.fillStyle = lin(c, 228, 0, 300, 0, [[0, '#8c2f39'], [1, '#6e1f2a']]); c.fillRect(228, 198, 72, 156);
      for (const [y, h] of [[208, 58], [278, 66]]) { c.strokeStyle = 'rgba(30,6,12,0.5)'; c.lineWidth = 2; c.strokeRect(236, y, 56, h); }
      star(c, 264, 237, 17, GOLD); star(c, 263, 236, 7, GOLD_LT);
      dot(c, 236, 300, 4, GOLD); dot(c, 235, 299, 1.4, GOLD_LT);
      // the rail of costumes, three gowns and a cape
      c.fillStyle = '#23201f'; c.fillRect(66, 200, 3, 156); c.fillRect(176, 200, 3, 156); c.fillRect(62, 200, 120, 3.4);
      for (const [x, col, wd] of [[86, RED, 18], [114, GOLD, 17], [140, NAVY_DK, 16], [163, '#e8b7c4', 13]]) {
        c.strokeStyle = '#23201f'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, 203); c.lineTo(x, 212); c.stroke();
        c.fillStyle = col; c.beginPath(); c.moveTo(x - wd * 0.5, 214); c.quadraticCurveTo(x, 208, x + wd * 0.5, 214); c.lineTo(x + wd * 0.42, 240); c.lineTo(x + wd, 330); c.quadraticCurveTo(x, 338, x - wd, 330); c.lineTo(x - wd * 0.42, 240); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(x - 3, 216, 3, 112);
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + wd * 0.3, 240, 3, 90);
      }
      // the chair in front of the mirror, seen from behind
      c.fillStyle = 'rgba(30,14,10,0.3)'; c.beginPath(); c.ellipse(cx, 394, 56, 10, 0, 0, TAU); c.fill();
      c.strokeStyle = '#3a2418'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 34, 392); c.lineTo(cx - 34, 322); c.quadraticCurveTo(cx, 296, cx + 34, 322); c.lineTo(cx + 34, 392); c.stroke();
      c.fillStyle = RED_DK; c.beginPath(); c.moveTo(cx - 28, 330); c.quadraticCurveTo(cx, 308, cx + 28, 330); c.lineTo(cx + 28, 372); c.lineTo(cx - 28, 372); c.closePath(); c.fill();
      // all of it a little silvered, and warm from the bulbs
      c.fillStyle = 'rgba(214,226,238,0.12)'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      glow(c, cx, cy, R + 10, 'rgba(255,226,170,0.2)');
    }
    return {
      family: 'wash', particle: 'suds', region, indoor: true,
      tough: (x, y) => (Math.hypot(x - cx, y - cy) > R - 16 ? 1.4 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1807);
        // the wall of the dressing room, a dark red paper with gold stripes
        c.fillStyle = lin(c, 0, y0, 0, TABLE, [[0, '#4c1620'], [1, '#6e1f2a']]); c.fillRect(x0, y0, x1 - x0, TABLE - y0);
        for (let x = x0 + 4; x < x1; x += 30) { c.fillStyle = 'rgba(216,174,78,0.16)'; c.fillRect(x, y0, 1.6, TABLE - y0); c.fillRect(x + 5, y0, 1.6, TABLE - y0); for (let y = 16; y < TABLE; y += 30) star(c, x + 18, y, 3.2, 'rgba(216,174,78,0.3)'); }
        glow(c, cx, cy, 262, 'rgba(255,214,140,0.42)');
        // the mirror hangs a little off the wall
        const p = new Path2D(); p.arc(cx, cy, R + 34, 0, TAU); softShadow(c, p, 16, 0.5, 2, 7);
        // the dressing table: its top, a drawer, the brass knobs
        c.fillStyle = 'rgba(20,6,10,0.3)'; c.fillRect(x0, TABLE - 4, x1 - x0, 4);
        c.fillStyle = lin(c, 0, TABLE, 0, 552, [[0, '#6b4429'], [1, '#8f6240']]); c.fillRect(x0, TABLE, x1 - x0, 552 - TABLE);
        for (let i = 0; i < 40; i++) { const y = TABLE + q() * (552 - TABLE), x = x0 + q() * 360; c.strokeStyle = q() < 0.6 ? 'rgba(40,22,12,0.2)' : 'rgba(255,226,180,0.1)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + q() * 70, y + (q() - 0.5) * 2); c.stroke(); }
        c.fillStyle = lin(c, 0, 552, 0, y1, [[0, '#4a2c1c'], [1, '#2c1a12']]); c.fillRect(x0, 552, x1 - x0, y1 - 552);
        c.fillStyle = GOLD; c.fillRect(x0, 552, x1 - x0, 2);
        for (const [a, b] of [[12, 172], [188, 348]]) { c.strokeStyle = 'rgba(216,174,78,0.45)'; c.lineWidth = 1.4; c.strokeRect(a, 560, b - a, 40); dot(c, (a + b) / 2, 578, 5, GOLD_DK); dot(c, (a + b) / 2, 577.4, 3.6, GOLD); }
        const shadow = (x, y, rx) => { c.fillStyle = 'rgba(30,14,10,0.35)'; c.beginPath(); c.ellipse(x + 3, y + 2, rx, rx * 0.24, 0, 0, TAU); c.fill(); };
        // a box of powder with its puff
        shadow(58, 528, 34);
        c.fillStyle = lin(c, 26, 0, 90, 0, [[0, '#d9a8b4'], [0.5, '#f4d3da'], [1, '#c58f9d']]); c.beginPath(); c.moveTo(26, 512); c.lineTo(26, 526); c.quadraticCurveTo(58, 538, 90, 526); c.lineTo(90, 512); c.closePath(); c.fill();
        c.fillStyle = GOLD; c.fillRect(26, 520, 64, 2);
        c.fillStyle = '#fff4ee'; c.beginPath(); c.ellipse(58, 512, 32, 8.4, 0, 0, TAU); c.fill();
        for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; dot(c, 58 + Math.cos(a) * 15, 506 + Math.sin(a) * 6, 5, '#fbe4ea'); }
        dot(c, 58, 502, 8, '#ffffff'); dot(c, 58, 499, 2.4, RED_LT);
        // a tray of greasepaint sticks
        c.save(); c.translate(148, 524); c.rotate(-0.05);
        c.fillStyle = 'rgba(30,14,10,0.35)'; c.fillRect(-42, 7, 88, 7);
        c.fillStyle = lin(c, 0, -10, 0, 12, [[0, '#a9b2bb'], [1, '#6f7883']]); c.fillRect(-44, -11, 88, 22);
        ['#f0ead8', '#e8b28f', RED, GOLD, NAVY_LT, '#2c2622'].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.roundRect(-40 + k * 13.6, -8, 11, 16, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-38 + k * 13.6, -7, 2, 13); });
        c.restore();
        // a stub of lipstick, standing
        shadow(214, 528, 9);
        c.fillStyle = lin(c, 205, 0, 223, 0, [[0, GOLD_DK], [0.45, GOLD_LT], [1, GOLD_DK]]); c.fillRect(206, 506, 16, 22);
        c.fillStyle = RED; c.beginPath(); c.moveTo(208, 506); c.lineTo(208, 492); c.lineTo(220, 498); c.lineTo(220, 506); c.closePath(); c.fill();
        // a jar of brushes, and red roses from an admirer
        shadow(254, 530, 17);
        for (const [dx, tip, col] of [[-10, -38, '#8c5a2b'], [-2, -46, NAVY_LT], [7, -42, RED], [13, -34, '#2c2622']]) { c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(254, 524); c.lineTo(254 + dx, 500 + tip); c.stroke(); c.strokeStyle = '#3a2418'; c.lineWidth = 4; c.beginPath(); c.moveTo(254 + dx * 0.95, 500 + tip * 0.9); c.lineTo(254 + dx, 500 + tip); c.stroke(); }
        c.fillStyle = 'rgba(214,232,240,0.72)'; c.beginPath(); c.roundRect(238, 498, 32, 32, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(243, 502, 3.4, 24);
        shadow(314, 532, 17);
        for (const [x, y] of [[300, 472], [316, 462], [332, 474], [312, 482], [326, 488], [298, 488]]) { c.strokeStyle = '#4c7a3e'; c.lineWidth = 2; c.beginPath(); c.moveTo(314, 516); c.quadraticCurveTo(x, y + 24, x, y); c.stroke(); }
        for (const [x, y] of [[300, 472], [316, 462], [332, 474], [312, 482], [326, 488], [298, 488]]) { dot(c, x, y, 8, RED_DK); dot(c, x, y - 1, 6.2, RED); dot(c, x - 1, y - 2, 3, RED_LT); }
        c.fillStyle = lin(c, 298, 0, 330, 0, [[0, NAVY_LT], [0.45, '#7f97c8'], [1, NAVY]]); c.beginPath(); c.moveTo(304, 506); c.lineTo(324, 506); c.lineTo(330, 534); c.lineTo(298, 534); c.closePath(); c.fill();
      },
      clean: reflection,
      cleanOver(c) {
        // the sheen of the glass, the bulbs caught round its rim, a dark bevel at the edge
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [o, wd, a] of [[-44, 60, 0.11], [34, 18, 0.08]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(cx + o + 80, cy - R); c.lineTo(cx + o + 80 + wd, cy - R); c.lineTo(cx + o - 130 + wd, cy + R); c.lineTo(cx + o - 130, cy + R); c.closePath(); c.fill();
        }
        for (const [x, y] of BULBS) { const dx = cx + (x - cx) * 0.84, dy = cy + (y - cy) * 0.84; dot(c, dx, dy, 5, 'rgba(255,226,170,0.2)'); dot(c, dx, dy, 2, 'rgba(255,244,214,0.75)'); }
        c.restore();
        const g = c.createRadialGradient(cx, cy, R * 0.8, cx, cy, R);
        g.addColorStop(0, 'rgba(10,14,30,0)'); g.addColorStop(1, 'rgba(10,14,30,0.32)');
        c.fillStyle = g; c.fillRect(cx - R, cy - R, R * 2, R * 2);
      },
      dirt(c) {
        // a skin of old face powder, pink and grey
        const g = ramp(['#ab9c90', '#bdaea1', '#cbbdb0', '#dacdc1']);
        field(c, cx - R, cy - R, cx + R, cy + R, 2, (x, y) => { const v = nz.fbm(x * 0.022, y * 0.022, 5); return [...g(v), 248 - v * 16]; });
        for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(232,184,190,${(0.1 + r() * 0.2).toFixed(2)})`; c.beginPath(); c.ellipse(cx + (r() - 0.5) * R * 1.7, cy + (r() - 0.5) * R * 1.7, 14 + r() * 30, 8 + r() * 16, r() * 3, 0, TAU); c.fill(); }
        grime(c, r, cx - R, cy - R, cx + R, cy + R, 18);
        // the swipes of a sleeve across it
        c.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
          const x = cx - 100 + r() * 200, y = cy - 100 + r() * 200, a = r() * 0.8 - 0.4, l = 50 + r() * 70;
          c.strokeStyle = `rgba(238,232,220,${(0.16 + r() * 0.2).toFixed(2)})`; c.lineWidth = 10 + r() * 16;
          c.beginPath(); c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); c.quadraticCurveTo(x, y + 14, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
        }
        // greasepaint: fingers in red, blue and gold, wiped wherever was nearest
        for (let i = 0; i < 30; i++) {
          const x = cx + (r() - 0.5) * R * 1.7, y = cy + (r() - 0.5) * R * 1.7, col = U.pick(r, ['168,34,46', '51,73,124', '216,174,78', '120,60,40']);
          c.save(); c.translate(x, y); c.rotate(r() * TAU);
          c.fillStyle = `rgba(${col},${(0.26 + r() * 0.3).toFixed(2)})`; c.beginPath(); c.ellipse(0, 0, 4.6 + r() * 2, 6.6 + r() * 5, 0, 0, TAU); c.fill();
          c.restore();
        }
        for (let i = 0; i < 900; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,250,240,0.32)' : 'rgba(90,70,60,0.2)'; c.fillRect(cx - R + r() * R * 2, cy - R + r() * R * 2, 1.2, 1.2); }
        // a word in lipstick from a good night, and a kiss to go with it
        c.save(); c.translate(cx - 6, cy - 34); c.rotate(-0.13);
        c.font = `italic 700 56px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = 'rgba(120,20,34,0.3)'; c.fillText('Bravo!', 1.6, 2);
        c.fillStyle = '#b81f33'; c.fillText('Bravo!', 0, 0);
        c.strokeStyle = 'rgba(255,200,200,0.3)'; c.lineWidth = 0.8; c.strokeText('Bravo!', -0.8, -1);
        c.restore();
        c.save(); c.translate(cx + 66, cy + 66); c.rotate(0.3); c.fillStyle = '#b81f33';
        c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-14, -15, -3, -9); c.quadraticCurveTo(0, -7, 3, -9); c.quadraticCurveTo(14, -15, 26, 0); c.quadraticCurveTo(0, -3, -26, 0); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-25, 2); c.quadraticCurveTo(0, 0, 25, 2); c.quadraticCurveTo(10, 16, 0, 16); c.quadraticCurveTo(-10, 16, -25, 2); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(70,10,20,0.5)'; c.lineWidth = 0.7; for (let k = -18; k <= 18; k += 4) { c.beginPath(); c.moveTo(k, -6 + Math.abs(k) * 0.2); c.lineTo(k * 1.05, 12 - Math.abs(k) * 0.3); c.stroke(); }
        c.restore();
        cobweb(c, cx - 96, cy - 96, 0, 58);
      },
      top(c) {
        // the gold ring, turned, with a bright bead each side of it
        c.lineWidth = 36; c.strokeStyle = lin(c, cx - R, cy - R, cx + R, cy + R, [[0, '#f0d287'], [0.45, GOLD], [1, GOLD_DK]]); c.beginPath(); c.arc(cx, cy, R + 18, 0, TAU); c.stroke();
        c.lineWidth = 2.2; c.strokeStyle = GOLD_DK; c.beginPath(); c.arc(cx, cy, R + 1, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, R + 35, 0, TAU); c.stroke();
        c.lineWidth = 1.6; c.strokeStyle = GOLD_LT; c.beginPath(); c.arc(cx, cy, R + 4, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, R + 32, 0, TAU); c.stroke();
        // a brass cup and a lit bulb, all the way round
        for (const [x, y] of BULBS) {
          dot(c, x + 1, y + 1.6, 12, 'rgba(70,40,10,0.45)'); dot(c, x, y, 11.5, GOLD_DK); dot(c, x, y, 10, '#c79c3e');
          glow(c, x, y, 24, 'rgba(255,226,150,0.5)');
          dot(c, x, y, 8.6, '#fff0bd'); dot(c, x, y, 6, '#fffbe9'); dot(c, x - 2.4, y - 2.6, 2, '#ffffff');
        }
        // good-luck cards tucked into the ring
        const card = (x, y, a, w, h, paper, draw) => {
          c.save(); c.translate(x, y); c.rotate(a);
          c.fillStyle = 'rgba(30,14,10,0.35)'; c.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
          c.fillStyle = paper; c.fillRect(-w / 2, -h / 2, w, h);
          draw(); c.restore();
        };
        card(73, 368, -0.62, 56, 38, '#f6efe0', () => { c.strokeStyle = RED; c.lineWidth = 1.2; c.strokeRect(-24, -15, 48, 30); star(c, 0, -3, 7, GOLD); c.fillStyle = RED_DK; c.font = `italic 700 7.4px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Good luck!', 0, 9); });
        card(291, 372, 0.56, 50, 34, '#e8dcc0', () => { c.fillStyle = NAVY; c.fillRect(-25, -17, 50, 8); c.fillStyle = 'rgba(60,50,40,0.5)'; for (let k = 0; k < 4; k++) c.fillRect(-20, -5 + k * 5, 40 - k * 5, 1.6); });
        card(66, 138, 0.68, 40, 50, '#d9c7a4', () => { c.fillStyle = '#6f5a44'; c.fillRect(-16, -20, 32, 34); dot(c, 0, -8, 7, '#d9c7a4'); c.fillStyle = '#d9c7a4'; c.beginPath(); c.moveTo(-11, 14); c.quadraticCurveTo(0, -2, 11, 14); c.closePath(); c.fill(); });
      },
      liveTop(c, t) {
        // the bulbs breathe a little, never all together
        for (const [x, y, k] of BULBS) dot(c, x, y, 11, `rgba(255,236,180,${(0.09 + 0.07 * Math.sin(t * 0.9 + k * 2.4)).toFixed(3)})`);
      },
    };
  }

  // ------------------------------------------------- THE THEATRE: SET THE STAGE
  // Up the bare stage from the footlights, with the cloth of stars at the back
  // and the stage manager's chalk on the boards: an outline, a cross and a name
  // for every piece. Work over a mark and its prop drops onto it: the throne
  // between two columns, a painted tree, a street lamp, the treasure chest, the
  // crown on its stool, and a hat stand with its top peg empty. The same pieces
  // as the café tables in scenes9.js.
  // serve { what: 'props' }
  const pop = (k) => (k >= 1 ? 1 : Math.max(0, U.easeBack(Math.min(1, k))));   // a little overshoot, then it settles
  const CHALK = '"Chalkboard SE", "Comic Sans MS", ui-rounded, system-ui, sans-serif';
  // each prop stands on 0, 0 and goes up from there
  const PROPS = {
    throne(c) {
      const gold = lin(c, -40, 0, 40, 0, [[0, GOLD_DK], [0.4, GOLD_LT], [1, GOLD_DK]]), wood = (x0, y0, x1, y1, w) => { c.strokeStyle = gold; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
      c.fillStyle = GOLD_DK; c.fillRect(-32, -36, 7, 36); c.fillRect(25, -36, 7, 36);
      // the tall back, a gold frame round buttoned velvet
      c.fillStyle = gold; c.beginPath(); c.moveTo(-33, -40); c.lineTo(-33, -100); c.quadraticCurveTo(-30, -128, 0, -135); c.quadraticCurveTo(30, -128, 33, -100); c.lineTo(33, -40); c.closePath(); c.fill();
      c.fillStyle = lin(c, -26, 0, 26, 0, [[0, RED_DK], [0.42, RED_LT], [1, RED_DK]]); c.beginPath(); c.moveTo(-25, -42); c.lineTo(-25, -98); c.quadraticCurveTo(-23, -119, 0, -125); c.quadraticCurveTo(23, -119, 25, -98); c.lineTo(25, -42); c.closePath(); c.fill();
      for (let j = 0; j < 3; j++) for (let i = -1; i <= 1; i++) { if (j === 0 && i) continue; dot(c, i * 13, -112 + j * 20 + (j === 2 ? 2 : 0), 2, GOLD); }
      for (let i = -1.5; i <= 1.5; i++) dot(c, i * 13, -58, 2, GOLD);
      star(c, 1, -143, 11, 'rgba(50,30,10,0.35)'); star(c, 0, -144, 11, GOLD); star(c, -0.6, -145, 4.6, GOLD_LT);
      // the cushion, the rail under it and the front legs
      wood(-33, -30, -35, -3, 8); wood(33, -30, 35, -3, 8);
      c.fillStyle = gold; c.beginPath(); c.roundRect(-40, -38, 80, 13, 3); c.fill();
      c.fillStyle = lin(c, 0, -52, 0, -36, [[0, RED_LT], [1, RED_DK]]); c.beginPath(); c.roundRect(-37, -52, 74, 16, 7); c.fill();
      c.fillStyle = 'rgba(255,225,215,0.3)'; c.beginPath(); c.ellipse(-8, -48, 22, 3, 0, 0, TAU); c.fill();
      // the arms, each ending in a gold ball
      for (const d of [-1, 1]) { wood(d * 33, -74, d * 41, -72, 7); wood(d * 41, -72, d * 41, -44, 6); dot(c, d * 41, -75, 6, GOLD_LT); dot(c, d * 41, -75, 4.6, GOLD); }
    },
    column(c) {
      const body = lin(c, -22, 0, 22, 0, [[0, '#c7b490'], [0.35, '#fdf6e6'], [0.7, '#e9dcc2'], [1, '#a99776']]);
      c.fillStyle = body; c.beginPath(); c.moveTo(-19, -122); c.lineTo(19, -122); c.lineTo(22, -14); c.lineTo(-22, -14); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(110,90,60,0.4)'; c.lineWidth = 1.8;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 7.4, -120); c.lineTo(k * 8.6, -16); c.stroke(); }
      c.fillStyle = body; c.fillRect(-27, -136, 54, 9); c.fillRect(-23, -127, 46, 6); c.fillRect(-25, -14, 50, 7); c.fillRect(-29, -7, 58, 7);
      c.fillStyle = GOLD; c.fillRect(-23, -123, 46, 2.4); c.fillRect(-25, -15, 50, 2);
      c.fillStyle = 'rgba(90,70,40,0.3)'; c.fillRect(-27, -128, 54, 1.2); c.fillRect(-29, -7, 58, 1.2);
    },
    tree(c) {
      // a flat tree in poster paint on a board, with a strut behind to hold it up
      c.strokeStyle = '#7d5a3a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, -42); c.lineTo(32, -2); c.stroke();
      c.fillStyle = '#8f6a44'; c.fillRect(-27, -6, 54, 6);
      c.fillStyle = '#6a4326'; c.beginPath(); c.moveTo(-11, -4); c.lineTo(11, -4); c.lineTo(7, -50); c.lineTo(19, -72); c.lineTo(-19, -72); c.lineTo(-7, -50); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,22,12,0.4)'; c.lineWidth = 1.6; for (const dx of [-4, 3]) { c.beginPath(); c.moveTo(dx, -8); c.lineTo(dx, -52); c.stroke(); }
      for (const [x, y, rad, col] of [[0, -118, 30, '#3f7a3a'], [-27, -92, 25, '#37703a'], [27, -92, 25, '#37703a'], [-12, -80, 22, '#467e37'], [14, -78, 22, '#467e37'], [0, -100, 26, '#4f8a3c']]) dot(c, x, y, rad, col);
      for (const [x, y, rad] of [[-12, -122, 12], [14, -110, 10], [-26, -96, 9], [24, -88, 8], [0, -88, 9]]) dot(c, x, y, rad, '#6aa54c');
      for (const [x, y] of [[-20, -110], [10, -128], [24, -102], [-8, -90], [-32, -86], [16, -74]]) { dot(c, x, y, 5, GOLD_DK); dot(c, x - 0.4, y - 0.6, 4, GOLD); dot(c, x - 1.4, y - 1.8, 1.2, GOLD_LT); }
    },
    lamp(c) {
      glow(c, 0, -104, 58, 'rgba(255,214,140,0.55)');
      c.fillStyle = lin(c, -6, 0, 6, 0, [[0, '#15203c'], [0.4, NAVY_LT], [1, NAVY_DK]]); c.fillRect(-3.4, -92, 6.8, 88);
      c.fillRect(-12, -7, 24, 7); c.fillRect(-7, -14, 14, 8); c.fillRect(-6, -60, 12, 3);
      c.fillStyle = GOLD; c.fillRect(-12, -7, 24, 1.6); c.fillRect(-6, -60, 12, 1.2);
      c.fillStyle = '#ffe9ad'; c.beginPath(); c.moveTo(-11, -94); c.lineTo(11, -94); c.lineTo(16, -122); c.lineTo(-16, -122); c.closePath(); c.fill();
      c.fillStyle = '#fffbe9'; c.beginPath(); c.ellipse(0, -106, 5, 8, 0, 0, TAU); c.fill();
      c.strokeStyle = NAVY_DK; c.lineWidth = 2; c.beginPath(); c.moveTo(-11, -94); c.lineTo(-16, -122); c.moveTo(11, -94); c.lineTo(16, -122); c.moveTo(0, -94); c.lineTo(0, -122); c.moveTo(-12, -94); c.lineTo(12, -94); c.stroke();
      c.fillStyle = lin(c, -20, 0, 20, 0, [[0, NAVY_DK], [0.4, NAVY_LT], [1, NAVY_DK]]); c.beginPath(); c.moveTo(-21, -121); c.lineTo(21, -121); c.lineTo(0, -138); c.closePath(); c.fill();
      dot(c, 0, -140, 3.4, GOLD);
    },
    chest(c) {
      // the lid thrown back, with the gold heaped up inside it
      c.fillStyle = '#5a3524'; c.beginPath(); c.moveTo(-48, -50); c.quadraticCurveTo(-48, -90, 0, -92); c.quadraticCurveTo(48, -90, 48, -50); c.closePath(); c.fill();
      c.fillStyle = '#2c1a12'; c.beginPath(); c.moveTo(-41, -50); c.quadraticCurveTo(-41, -83, 0, -85); c.quadraticCurveTo(41, -83, 41, -50); c.closePath(); c.fill();
      for (const x of [-30, 30]) { c.fillStyle = GOLD_DK; c.fillRect(x - 3.5, -86, 7, 36); }
      const coins = 26;
      for (let k = 0; k < coins; k++) { const x = -38 + (k * 29) % 76, y = -50 - 18 * Math.pow(Math.sin(((x + 38) / 76) * Math.PI), 1.3) * (0.45 + ((k * 7) % 11) / 18); dot(c, x, y, 5.4, GOLD_DK); dot(c, x - 0.5, y - 0.6, 4.4, k % 3 ? GOLD : GOLD_LT); }
      dot(c, -12, -66, 5.4, RED_LT); dot(c, -13, -67, 1.6, '#ffffff'); dot(c, 15, -62, 4.8, '#4f7fd0'); dot(c, 14, -63, 1.4, '#ffffff');
      // the front of the chest, banded in gold
      c.fillStyle = lin(c, 0, -52, 0, 0, [[0, '#8f5f3c'], [1, '#54321f']]); c.beginPath(); c.roundRect(-49, -50, 98, 50, 3); c.fill();
      c.strokeStyle = 'rgba(30,14,8,0.35)'; c.lineWidth = 1; for (const y of [-37, -25, -13]) { c.beginPath(); c.moveTo(-48, y); c.lineTo(48, y); c.stroke(); }
      c.fillStyle = lin(c, -49, 0, 49, 0, [[0, GOLD_DK], [0.4, GOLD_LT], [1, GOLD_DK]]);
      c.fillRect(-49, -53, 98, 6); for (const x of [-34, 26]) c.fillRect(x, -48, 8, 48);
      c.fillRect(-10, -42, 20, 21);
      dot(c, 0, -34, 3, '#2c1a12'); c.fillStyle = '#2c1a12'; c.fillRect(-1.2, -34, 2.4, 8);
    },
    crown(c) {
      // a low gold stool, a red cushion, and the cardboard crown on top
      const gold = lin(c, -30, 0, 30, 0, [[0, GOLD_DK], [0.4, GOLD_LT], [1, GOLD_DK]]);
      c.strokeStyle = gold; c.lineWidth = 5; c.lineCap = 'round'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 22, -36); c.quadraticCurveTo(d * 30, -18, d * 24, -3); c.stroke(); }
      c.fillStyle = NAVY_DK; c.beginPath(); c.roundRect(-33, -41, 66, 9, 3); c.fill();
      c.fillStyle = GOLD; c.fillRect(-33, -34, 66, 2);
      c.fillStyle = lin(c, 0, -56, 0, -40, [[0, RED_LT], [1, RED_DK]]); c.beginPath(); c.moveTo(-34, -42); c.quadraticCurveTo(-26, -60, 0, -58); c.quadraticCurveTo(26, -60, 34, -42); c.quadraticCurveTo(0, -36, -34, -42); c.closePath(); c.fill();
      for (const d of [-1, 1]) { c.strokeStyle = GOLD; c.lineWidth = 2.4; c.beginPath(); c.moveTo(d * 34, -42); c.lineTo(d * 37, -33); c.stroke(); dot(c, d * 34, -42, 2.8, GOLD_LT); }
      c.fillStyle = lin(c, -26, 0, 26, 0, [[0, GOLD_DK], [0.45, '#fff0b8'], [1, GOLD_DK]]);
      c.beginPath(); c.moveTo(-23, -56); c.lineTo(-28, -90); c.lineTo(-13, -74); c.lineTo(0, -97); c.lineTo(13, -74); c.lineTo(28, -90); c.lineTo(23, -56); c.quadraticCurveTo(0, -50, -23, -56); c.closePath(); c.fill();
      c.strokeStyle = GOLD_DK; c.lineWidth = 1; c.stroke();
      c.fillStyle = RED_DK; c.beginPath(); c.moveTo(-22, -64); c.quadraticCurveTo(0, -58, 22, -64); c.lineTo(23, -56); c.quadraticCurveTo(0, -50, -23, -56); c.closePath(); c.fill();
      for (const [x, y] of [[-28, -91], [0, -98], [28, -91]]) { dot(c, x, y, 3.6, RED); dot(c, x - 0.8, y - 1, 1.2, '#ffffff'); }
      dot(c, -11, -59, 2.8, '#7fb0ea'); dot(c, 0, -57, 3, GOLD_LT); dot(c, 11, -59, 2.8, '#7fb0ea');
    },
    hatstand(c) {
      // a bentwood stand, a scarf and a cane on it, and one peg with a question on it
      const peg = (d, y, len) => { c.strokeStyle = '#4a2c1c'; c.lineWidth = 4.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, y + 8); c.quadraticCurveTo(d * len, y + 8, d * len, y - 4); c.stroke(); dot(c, d * len, y - 5, 3, GOLD); };
      c.strokeStyle = '#3a2418'; c.lineWidth = 5; c.lineCap = 'round'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(d * 16, -12, d * 26, -2); c.stroke(); }
      c.strokeStyle = 'rgba(40,20,10,0.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -18); c.lineTo(5, -2); c.stroke();
      c.fillStyle = lin(c, -4, 0, 4, 0, [[0, '#2c1a12'], [0.4, '#6e452c'], [1, '#2c1a12']]); c.fillRect(-3.4, -136, 6.8, 118);
      dot(c, 0, -139, 6, GOLD_DK); dot(c, -0.6, -139.6, 4.6, GOLD); dot(c, -1.8, -141, 1.4, GOLD_LT);
      peg(1, -122, 22); peg(-1, -122, 22); peg(-1, -96, 19); peg(1, -96, 19);
      // the scarf
      c.fillStyle = RED; c.beginPath(); c.moveTo(-23, -101); c.quadraticCurveTo(-17, -106, -13, -100); c.lineTo(-11, -46); c.lineTo(-27, -46); c.closePath(); c.fill();
      c.fillStyle = GOLD; c.fillRect(-26.4, -58, 15, 3); c.fillRect(-26.6, -52, 15.4, 3);
      c.strokeStyle = GOLD_LT; c.lineWidth = 1; for (let x = -26; x < -11; x += 3) { c.beginPath(); c.moveTo(x, -46); c.lineTo(x, -40); c.stroke(); }
      // the cane
      c.strokeStyle = '#7a4f2e'; c.lineWidth = 3; c.beginPath(); c.moveTo(21, -92); c.arc(15, -92, 6, 0, Math.PI, true); c.moveTo(21, -92); c.lineTo(23, -30); c.stroke(); dot(c, 23, -29, 2, GOLD);
      // the luggage label on the empty peg
      c.strokeStyle = 'rgba(240,230,210,0.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(22, -125); c.lineTo(27, -112); c.stroke();
      c.save(); c.translate(29, -105); c.rotate(-0.16); c.fillStyle = '#efe3c9'; c.fillRect(-7, -9, 14, 19);
      c.fillStyle = RED_DK; c.font = `700 12px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1.5); c.restore();
    },
  };
  function drawProp(c, u, k) {
    const e = pop(k), drop = (1 - e) * 18, sq = k >= 1 ? 1 : 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.1, fy = u.y + u.h - 6;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    // the shadow stays on the boards while the piece drops into place
    c.fillStyle = 'rgba(40,24,16,0.32)'; c.beginPath(); c.ellipse(u.cx + 5, fy, u.w * 0.5, 7 * u.s, 0, 0, TAU); c.fill();
    c.translate(u.cx, fy - drop); c.scale(sq * u.s, u.s / sq);
    PROPS[u.kind](c);
    c.restore();
  }
  function setTheStage(S) {
    const { r, opts, bleed } = S;
    const BACK = 150, EDGE = 552;
    const units = [], region = new Path2D();
    // back to front, so that nearer pieces stand in front of farther ones
    for (const [kind, name, cx, foot, w, h, s] of [
      ['column', 'COLUMN', 52, 286, 54, 116, 0.8], ['throne', 'THRONE', 180, 290, 92, 130, 0.86], ['column', 'COLUMN', 306, 286, 54, 116, 0.8],
      ['tree', 'TREE', 86, 404, 84, 106, 0.8], ['lamp', 'LAMP', 272, 404, 50, 106, 0.8],
      ['chest', 'CHEST', 80, 526, 108, 84, 1.02], ['crown', 'CROWN', 190, 526, 78, 96, 1.02], ['hatstand', 'HAT STAND', 294, 526, 66, 112, 0.84],
    ]) {
      const u = { shape: 'rect', x: cx - w / 2, y: foot - h, w, h, cx, cy: foot - h / 2, kind, name, s, seed: (r() * 1e9) | 0 };
      units.push(u); region.rect(u.x, u.y, u.w, u.h);
    }
    return {
      family: 'arrange', particle: 'dust', region, depth: false, indoor: true,
      unitKind: 'build', unitParticle: 'dust', unitThreshold: 0.4, unitDur: 0.42,
      units: opts.dirt ? [] : units, drawUnit: drawProp,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1811);
        starCloth(c, q, x0, y0, x1, BACK + 2);
        c.fillStyle = 'rgba(8,10,24,0.55)'; c.fillRect(x0, BACK - 22, x1 - x0, 22);
        stageBoards(c, q, x0, x1, BACK, EDGE);
        // a line of tape down the middle of the stage, for the actors
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.6; c.setLineDash([12, 12]); c.beginPath(); c.moveTo(180, BACK + 4); c.lineTo(180, EDGE - 4); c.stroke(); c.setLineDash([]);
        // red legs in the wings, nearer ones lower, and a border along the top
        const g = ramp(['#3c0912', '#6e1320', '#a01f2c', '#c8333c']), folds = (x, y) => g(0.5 + 0.42 * Math.sin(x * 0.62 + Math.sin(y * 0.016) * 0.8));
        for (const [a, b, foot] of [[x0, 32, 236], [W - 32, x1, 236], [x0, 15, EDGE], [W - 15, x1, EDGE]]) {
          c.fillStyle = 'rgba(20,8,10,0.34)'; c.fillRect(a, y0, b - a + (a < 100 ? 7 : 0), foot + 6 - y0); if (a > 100) c.fillRect(a - 7, y0, 7, foot + 6 - y0);
          field(c, a, y0, b, foot, 2, folds);
        }
        field(c, x0, y0, x1, 30, 2, (x, y) => g(0.5 + 0.42 * Math.sin(x * 0.2 + y * 0.03)));
        c.fillStyle = 'rgba(14,6,10,0.4)'; c.fillRect(x0, 30, x1 - x0, 8);
        c.fillStyle = GOLD; c.fillRect(x0, 27, x1 - x0, 3.4); c.fillStyle = GOLD_LT; c.fillRect(x0, 27, x1 - x0, 1);
        for (let x = x0; x < x1; x += 2.6) { c.strokeStyle = q() < 0.3 ? GOLD_DK : GOLD; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, 30); c.lineTo(x + 0.3, 37 + q() * 2); c.stroke(); }
        // a sandbag flown high on its rope in the wing
        c.strokeStyle = '#cdb98e'; c.lineWidth = 2; c.beginPath(); c.moveTo(333, 34); c.lineTo(333, 98); c.stroke();
        c.fillStyle = lin(c, 318, 0, 348, 0, [[0, '#8f7f5e'], [0.45, '#c6b58c'], [1, '#7b6b4e']]); c.beginPath(); c.moveTo(326, 96); c.lineTo(340, 96); c.quadraticCurveTo(350, 116, 344, 134); c.quadraticCurveTo(333, 140, 322, 134); c.quadraticCurveTo(316, 116, 326, 96); c.closePath(); c.fill();
        stageFront(c, x0, x1, EDGE, y1);
      },
      clean(c) { if (opts.dirt) for (const u of units) drawProp(c, u, 1); },
      dirt(c) {
        // the stage manager's chalk: where each piece goes, and what it is
        c.lineCap = 'round';
        for (const u of units) {
          c.fillStyle = 'rgba(255,255,255,0.09)'; c.beginPath(); c.ellipse(u.cx + (r() - 0.5) * 12, u.cy + (r() - 0.5) * 16, u.w * 0.42, u.h * 0.3, r() * 3, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = 2.3; c.setLineDash([7, 6]);
          c.beginPath(); c.roundRect(u.x + 3.5, u.y + 3.5, u.w - 7, u.h - 7, 6); c.stroke(); c.setLineDash([]);
          const sx = 9, sy = 9, my = u.cy - 8;
          c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.8)';
          c.beginPath(); c.moveTo(u.cx - sx, my - sy); c.lineTo(u.cx + sx, my + sy); c.moveTo(u.cx + sx, my - sy); c.lineTo(u.cx - sx, my + sy); c.stroke();
          c.fillStyle = 'rgba(255,255,255,0.86)'; c.font = `700 10px ${CHALK}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(u.name, u.cx, u.y + u.h - 15);
        }
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'cafeFloor', test: (o) => o.where === 'theatre', make: foyerFloor },
    { kind: 'tables', test: (o) => o.what === 'seats', make: velvetSeats },
    { kind: 'awning', test: (o) => o.what === 'curtains', make: redCurtains },
    { kind: 'roof', test: (o) => o.what === 'tin', make: tinRoof },
    { kind: 'window', test: (o) => o.room === 'booth', make: ticketBooth },
    { kind: 'roundWindow', test: (o) => o.what === 'mirror', make: dressingMirror },
    { kind: 'serve', test: (o) => o.what === 'props', make: setTheStage },
  );
})();
