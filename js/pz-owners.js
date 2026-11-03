'use strict';
// Lost property, a thinking job for Halfpenny Halt. Four things wait on the
// counter and four people stand behind it, each with two things you can see
// (glasses, a hat, a stripy scarf, a little dog ...). A few notes pinned on
// the wall say who lost what ("The kite is not for anyone with a dog"), and
// together they fit only one way. Drag each thing to its owner: the right
// one smiles and holds it; anyone else shakes their head and it glides back.
// opts.what: 'lost' (the station, the default), 'cafe' (left behind at the
// café) or 'leads' (the rescue: whose lead, collar or coat is whose).
//   node test/run.mjs puzzle js/pz-owners.js owners --seeds 30 [--opts '{"what":"leads"}']

(() => {
  const INK = PZ.INK, INK2 = PZ.INK2, PAPER = PZ.PAPER;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const oval = (c, x, y, rx, ry, rot, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
  const line = (c, col, w, pts) => {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  };
  function heart(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.7, y - s * 1.3, x, y - s * 0.4);
    c.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9);
    c.fill();
  }
  function starPath(c, x, y, s) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? s * 0.45 : s;
      if (i) c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else c.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    c.closePath();
  }
  const EDGE = 'rgba(59,53,46,0.42)';

  // ---------------------------------------------------------------- THINGS
  // Each is drawn around 0, 0 inside about 52 x 44, so it is easy to hold.
  const THINGS = {
    umbrella: { name: 'The umbrella', draw(c) {
      c.save(); c.rotate(-0.35);
      c.fillStyle = '#5d7fd8'; c.beginPath(); c.moveTo(-24, 2); c.quadraticCurveTo(-22, -22, 0, -22); c.quadraticCurveTo(22, -22, 24, 2);
      for (let k = 3; k >= 0; k--) { const x = -24 + k * 12; c.quadraticCurveTo(x + 18 - 6, -4, x, 2); }
      c.closePath(); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(255,250,241,0.65)'; c.lineWidth = 1.4;
      for (const x of [-12, 0, 12]) { c.beginPath(); c.moveTo(0, -21); c.quadraticCurveTo(x * 0.7, -10, x, 1); c.stroke(); }
      line(c, '#7a5a3a', 3, [[0, -22], [0, -27]]);
      line(c, '#7a5a3a', 3.4, [[0, 2], [0, 18], [0, 20]]);
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 3.4; c.beginPath(); c.arc(-5, 19, 5, 0, Math.PI); c.stroke();
      c.restore();
    } },
    teddy: { name: 'The teddy', draw(c) {
      const fur = '#c98f52', lt = '#efd2a8';
      dot(c, -12, -19, 6, fur); dot(c, 12, -19, 6, fur); dot(c, -12, -19, 3, lt); dot(c, 12, -19, 3, lt);
      oval(c, 0, 10, 15, 13, 0, fur); oval(c, 0, 12, 8, 8, 0, lt);
      oval(c, -15, 5, 6, 9, 0.5, fur); oval(c, 15, 5, 6, 9, -0.5, fur);
      oval(c, -9, 21, 7, 5, 0, fur); oval(c, 9, 21, 7, 5, 0, fur); dot(c, -9, 22, 3, lt); dot(c, 9, 22, 3, lt);
      dot(c, 0, -9, 14, fur); oval(c, 0, -4, 6.5, 5, 0, lt); oval(c, 0, -6, 2.6, 2, 0, INK);
      dot(c, -5.5, -12, 1.9, INK); dot(c, 5.5, -12, 1.9, INK);
      c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(0, 3); c.lineTo(-8, -1); c.lineTo(-8, 7); c.closePath(); c.moveTo(0, 3); c.lineTo(8, -1); c.lineTo(8, 7); c.closePath(); c.fill();
      dot(c, 0, 3, 2.4, '#c4463c');
    } },
    book: { name: 'The book', draw(c) {
      c.save(); c.rotate(-0.12);
      c.fillStyle = '#f6efe3'; PZ.rr(c, -19, -22, 40, 44, 3); c.fill();
      c.fillStyle = '#6f9a6a'; PZ.rr(c, -22, -24, 40, 46, 4); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = 'rgba(40,60,35,0.25)'; c.fillRect(-22, -24, 6, 46);
      c.fillStyle = '#f2d88a'; PZ.rr(c, -10, -14, 22, 12, 2); c.fill();
      line(c, '#8a6a4a', 1.2, [[-6, -10], [8, -10]]); line(c, '#8a6a4a', 1.2, [[-6, -6], [4, -6]]);
      c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(6, 22); c.lineTo(6, 30); c.lineTo(9, 27); c.lineTo(12, 30); c.lineTo(12, 22); c.closePath(); c.fill();
      c.restore();
    } },
    kite: { name: 'The kite', draw(c) {
      c.save(); c.rotate(0.2);
      const q = [[0, -24], [16, -4], [0, 20], [-16, -4]];
      c.fillStyle = '#efb4ae'; c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
      c.fillStyle = '#f2d88a'; c.beginPath(); c.moveTo(0, -24); c.lineTo(16, -4); c.lineTo(0, -4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 20); c.lineTo(-16, -4); c.lineTo(0, -4); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.2; c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke();
      line(c, '#8a6a4a', 1.2, [[0, -24], [0, 20]]); line(c, '#8a6a4a', 1.2, [[-16, -4], [16, -4]]);
      c.strokeStyle = '#8a6a4a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 20); c.quadraticCurveTo(10, 26, 4, 32); c.quadraticCurveTo(-4, 38, 6, 42); c.stroke();
      for (const [x, y, col] of [[6, 26, '#8fbfe6'], [1, 35, '#6f9a6a']]) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y - 3); c.lineTo(x - 5, y + 3); c.closePath(); c.moveTo(x, y); c.lineTo(x + 5, y - 3); c.lineTo(x + 5, y + 3); c.closePath(); c.fill(); }
      c.restore();
    } },
    mittens: { name: 'The mittens', many: true, draw(c) {
      for (const [sx, col] of [[-1, '#e2574c'], [1, '#e2574c']]) {
        c.save(); c.translate(sx * 11, 2); c.rotate(sx * 0.18); if (sx > 0) c.scale(-1, 1);
        c.fillStyle = col; c.beginPath(); c.moveTo(-10, 20); c.lineTo(-11, -6); c.quadraticCurveTo(-11, -20, 0, -20); c.quadraticCurveTo(11, -20, 11, -6); c.lineTo(10, 20); c.closePath(); c.fill();
        c.beginPath(); c.ellipse(-12, -2, 5, 8, -0.5, 0, 7); c.fill();
        c.strokeStyle = EDGE; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-10, 20); c.lineTo(-11, -6); c.quadraticCurveTo(-11, -20, 0, -20); c.quadraticCurveTo(11, -20, 11, -6); c.lineTo(10, 20); c.stroke();
        c.fillStyle = '#fffaf1'; c.fillRect(-11, 12, 21, 8);
        c.fillStyle = '#e2574c'; for (let x = -9; x < 10; x += 4) c.fillRect(x, 12, 2, 8);
        c.fillStyle = '#fffaf1'; starPath(c, 0, -4, 5); c.fill();
        c.restore();
      }
    } },
    suitcase: { name: 'The suitcase', draw(c) {
      c.strokeStyle = '#6b4a32'; c.lineWidth = 3.4; c.beginPath(); c.roundRect(-8, -22, 16, 10, 4); c.stroke();
      c.fillStyle = '#b5683f'; PZ.rr(c, -25, -15, 50, 34, 5); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#8a4e2e'; c.fillRect(-15, -15, 4, 34); c.fillRect(11, -15, 4, 34);
      c.fillStyle = '#f2d88a'; c.fillRect(-16, -2, 6, 5); c.fillRect(10, -2, 6, 5);
      c.fillStyle = '#a6d3d4'; c.save(); c.translate(-2, 6); c.rotate(-0.2); PZ.rr(c, -7, -5, 14, 10, 2); c.fill(); c.restore();
      c.fillStyle = '#fffaf1'; c.save(); c.translate(2, -6); c.rotate(0.25); c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.restore();
    } },
    wool: { name: 'The ball of wool', draw(c) {
      line(c, '#b98f5a', 2.6, [[-20, -18], [16, 20]]); line(c, '#b98f5a', 2.6, [[20, -18], [-14, 20]]);
      dot(c, -20, -18, 3, '#d98b63'); dot(c, 20, -18, 3, '#d98b63');
      dot(c, 0, 4, 17, '#bba9df');
      c.strokeStyle = '#8f7bc0'; c.lineWidth = 1.3;
      for (const [a, b] of [[-0.6, 2.2], [0.2, 3.1], [1.2, 3.8], [2.4, 5.2]]) { c.beginPath(); c.arc(0, 4, 13, a, b); c.stroke(); }
      c.beginPath(); c.moveTo(-14, 12); c.quadraticCurveTo(0, -6, 14, 10); c.stroke();
      c.strokeStyle = '#bba9df'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(14, 16); c.quadraticCurveTo(24, 22, 20, 26); c.stroke();
    } },
    cardigan: { name: 'The cardigan', draw(c) {
      const col = '#9cc5a1';
      c.fillStyle = col; c.beginPath(); c.moveTo(-10, -20); c.lineTo(-24, -12); c.lineTo(-26, 10); c.lineTo(-18, 12); c.lineTo(-17, -2); c.lineTo(-16, 20); c.lineTo(16, 20); c.lineTo(17, -2); c.lineTo(18, 12); c.lineTo(26, 10); c.lineTo(24, -12); c.lineTo(10, -20); c.quadraticCurveTo(0, -10, -10, -20); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = 'rgba(255,250,241,0.35)'; for (let y = -12; y < 20; y += 5) c.fillRect(-16, y, 32, 1.4);
      line(c, '#6f9a6a', 1.4, [[0, -12], [0, 20]]);
      for (const y of [-6, 2, 10]) dot(c, 3, y, 2, '#f2d88a');
      c.fillStyle = '#7fb086'; c.fillRect(-26, 6, 8, 5); c.fillRect(18, 6, 8, 5); c.fillRect(-16, 15, 32, 5);
    } },
    paper: { name: 'The newspaper', draw(c) {
      c.save(); c.rotate(-0.1);
      c.fillStyle = '#e9e2d2'; PZ.rr(c, -21, -20, 44, 42, 2); c.fill();
      c.fillStyle = '#f6f1e6'; PZ.rr(c, -24, -22, 44, 42, 2); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = '#6b6157'; c.fillRect(-19, -17, 34, 5);
      c.fillStyle = '#c6dcb4'; c.fillRect(-19, -8, 15, 13);
      dot(c, -11.5, -2, 3.6, '#e9962c');
      c.strokeStyle = '#b5ab9c'; c.lineWidth = 1.1; c.beginPath();
      for (const y of [-7, -3, 1, 5]) { c.moveTo(-1, y); c.lineTo(15, y); }
      for (const y of [10, 14]) { c.moveTo(-19, y); c.lineTo(15, y); }
      c.stroke();
      c.restore();
    } },
    cakebox: { name: 'The cake box', draw(c) {
      c.fillStyle = '#fbe3ec'; PZ.rr(c, -23, -14, 46, 34, 3); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = '#f7d0de'; c.fillRect(-23, -14, 46, 7);
      c.fillStyle = 'rgba(217,120,150,0.35)'; for (let x = -19; x < 23; x += 8) c.fillRect(x, -7, 3, 27);
      c.fillStyle = '#e9bf4f'; c.fillRect(-2.5, -14, 5, 34); c.fillRect(-23, 1, 46, 4);
      c.fillStyle = '#e9bf4f'; c.beginPath(); c.ellipse(-6, -18, 7, 4, -0.5, 0, 7); c.ellipse(6, -18, 7, 4, 0.5, 0, 7); c.fill();
      dot(c, 0, -16, 3, '#c99a2e');
    } },
    keys: { name: 'The keys', many: true, draw(c) {
      c.strokeStyle = '#c99a2e'; c.lineWidth = 3; c.beginPath(); c.arc(-6, -10, 9, 0, 7); c.stroke();
      const key = (a, col) => {
        c.save(); c.translate(-6, -10); c.rotate(a);
        c.fillStyle = col; c.beginPath(); c.arc(0, 14, 6, 0, 7); c.fill(); c.fillRect(-2.2, 18, 4.4, 20); c.fillRect(1, 30, 6, 3); c.fillRect(1, 35, 4, 3);
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(-1.5, 12.5, 1.8, 0, 7); c.fill();
        c.restore();
      };
      key(-0.5, '#e9bf4f'); key(0.35, '#c9c3bb');
      c.save(); c.translate(-6, -10); c.rotate(-1.4); c.fillStyle = '#efb4ae'; PZ.rr(c, 8, -6, 18, 12, 3); c.fill(); dot(c, 12, 0, 1.6, '#fffaf1'); c.restore();
    } },
    purse: { name: 'The purse', draw(c) {
      c.fillStyle = '#bba9df'; c.beginPath(); c.moveTo(-22, -8); c.quadraticCurveTo(-26, 20, 0, 20); c.quadraticCurveTo(26, 20, 22, -8); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.strokeStyle = 'rgba(255,250,241,0.55)'; c.lineWidth = 1.4;
      for (const k of [-12, 0, 12]) { c.beginPath(); c.moveTo(k - 4, 0); c.lineTo(k, 6); c.lineTo(k + 4, 0); c.stroke(); }
      c.strokeStyle = '#c99a2e'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(-22, -8); c.quadraticCurveTo(0, -14, 22, -8); c.stroke();
      dot(c, -4, -15, 3.4, '#e9bf4f'); dot(c, 4, -15, 3.4, '#e9bf4f'); dot(c, -5, -16, 1.1, '#fff8dc'); dot(c, 3, -16, 1.1, '#fff8dc');
    } },
    flowers: { name: 'The flowers', many: true, draw(c) {
      for (const [x, y, col] of [[-9, -14, '#efb4ae'], [6, -18, '#f2d88a'], [12, -6, '#bba9df'], [-4, -4, '#fffaf1'], [-14, -2, '#e2574c']]) {
        for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; dot(c, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, col); }
        dot(c, x, y, 2.4, '#e9962c');
      }
      c.fillStyle = '#a6d3d4'; c.beginPath(); c.moveTo(-18, 2); c.lineTo(18, 2); c.lineTo(5, 26); c.lineTo(-5, 26); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = 'rgba(255,250,241,0.5)'; c.beginPath(); c.moveTo(-10, 2); c.lineTo(-2, 24); c.lineTo(-5, 26); c.lineTo(-14, 2); c.closePath(); c.fill();
      c.fillStyle = '#e2574c'; c.beginPath(); c.ellipse(-4, 14, 5, 3, -0.4, 0, 7); c.ellipse(4, 14, 5, 3, 0.4, 0, 7); c.fill();
    } },
    lead: { name: 'The stripy lead', draw(c) {
      c.lineCap = 'round';
      const loop = (rx, ry, w) => { c.lineWidth = w; c.beginPath(); c.ellipse(-2, 0, rx, ry, -0.3, 0, 7); c.stroke(); };
      c.strokeStyle = '#e2574c'; loop(20, 13, 6); loop(13, 8, 6);
      c.setLineDash([3, 4]); c.strokeStyle = '#fffaf1'; loop(20, 13, 3); loop(13, 8, 3); c.setLineDash([]);
      c.strokeStyle = '#e2574c'; c.lineWidth = 6; c.beginPath(); c.moveTo(14, 8); c.lineTo(20, 18); c.stroke();
      c.fillStyle = '#c9c3bb'; PZ.rr(c, 16, 16, 9, 12, 3); c.fill(); c.strokeStyle = '#8d8578'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = '#8d8578'; c.lineWidth = 2; c.beginPath(); c.arc(20.5, 31, 3.6, 0, 7); c.stroke();
    } },
    bell: { name: 'The bell collar', draw(c) {
      c.strokeStyle = '#3d5a86'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, -4, 21, 12, 0, 0, 7); c.stroke();
      c.strokeStyle = '#8fbfe6'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -4, 21, 12, 0, 0, 7); c.stroke();
      c.fillStyle = '#e9bf4f'; c.beginPath(); c.arc(0, 15, 9, 0, 7); c.fill(); c.strokeStyle = '#c99a2e'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#c99a2e'; c.fillRect(-8, 13, 16, 2); dot(c, 0, 20, 2, '#8a6a2a'); dot(c, -3, 12, 2, 'rgba(255,255,255,0.6)');
      c.fillStyle = '#c9c3bb'; c.fillRect(-3, 5, 6, 4);
    } },
    starcoat: { name: 'The star coat', draw(c) {
      c.fillStyle = '#3d5a86'; c.beginPath(); c.moveTo(-24, -12); c.quadraticCurveTo(0, -24, 24, -12); c.lineTo(22, 10); c.quadraticCurveTo(0, 22, -22, 10); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = '#f2d88a'; for (const [x, y, s] of [[-12, -6, 5], [6, -10, 4], [14, 4, 4.5], [-2, 6, 5]]) { starPath(c, x, y, s); c.fill(); }
      c.fillStyle = '#c9c3bb'; c.fillRect(-26, -10, 5, 18); c.fillRect(21, -10, 5, 18);
    } },
    hearttag: { name: 'The heart tag', draw(c) {
      c.strokeStyle = '#6f9a6a'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, -6, 21, 12, 0, 0, 7); c.stroke();
      c.fillStyle = '#c9c3bb'; c.fillRect(-2, 4, 4, 5);
      heart(c, 0, 16, 9, '#e9bf4f'); heart(c, 0, 15.5, 6.5, '#f6d77a');
    } },
    jumper: { name: 'The zigzag jumper', draw(c) {
      c.fillStyle = '#d98b63'; c.beginPath(); c.moveTo(-24, -12); c.quadraticCurveTo(0, -24, 24, -12); c.lineTo(22, 10); c.quadraticCurveTo(0, 22, -22, 10); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.strokeStyle = '#fffaf1'; c.lineWidth = 2.6; c.lineJoin = 'round';
      for (const y of [-6, 4]) { c.beginPath(); for (let x = -20; x <= 20; x += 5) c.lineTo(x, y + ((x / 5) % 2 ? 3 : -3)); c.stroke(); }
      c.fillStyle = '#c4704b'; c.fillRect(-26, -10, 6, 18); c.fillRect(20, -10, 6, 18);
    } },
    checks: { name: 'The checked coat', draw(c) {
      c.save();
      c.beginPath(); c.moveTo(-24, -12); c.quadraticCurveTo(0, -24, 24, -12); c.lineTo(22, 10); c.quadraticCurveTo(0, 22, -22, 10); c.closePath();
      c.fillStyle = '#f2d88a'; c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke(); c.clip();
      c.fillStyle = 'rgba(78,123,91,0.55)'; for (let x = -24; x < 24; x += 10) c.fillRect(x, -24, 4, 48); for (let y = -24; y < 24; y += 10) c.fillRect(-24, y, 48, 4);
      c.restore();
      c.fillStyle = '#6f9a6a'; c.fillRect(-26, -10, 5, 18); c.fillRect(21, -10, 5, 18);
    } },
  };

  // ---------------------------------------------------------------- PEOPLE
  // A friendly figure standing with its feet at 0, 0. g = { coat, skin, hair,
  // style, legs, tr: Set of traits, hat, bow }; o = { smile, shake, hold }
  function person(c, g, o) {
    const tr = g.tr, sm = o.smile;
    // legs and shoes
    c.fillStyle = g.legs; c.fillRect(-12, -26, 8, 24); c.fillRect(4, -26, 8, 24);
    oval(c, -9, -2.5, 9, 4.4, 0, '#5a4a3e'); oval(c, 9, -2.5, 9, 4.4, 0, '#5a4a3e');
    // the coat, its sleeves and hands
    const coat = g.coat, deep = U.shade(coat, -0.14);
    c.strokeStyle = deep; c.lineWidth = 10; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-20, -92); c.quadraticCurveTo(-29, -70, -27, -46); c.moveTo(20, -92); c.quadraticCurveTo(29, -70, 27, -46); c.stroke();
    c.fillStyle = coat; c.beginPath(); c.moveTo(-15, -101); c.quadraticCurveTo(-24, -99, -24, -88); c.lineTo(-27, -22); c.quadraticCurveTo(0, -17, 27, -22); c.lineTo(24, -88); c.quadraticCurveTo(24, -99, 15, -101); c.closePath(); c.fill();
    c.fillStyle = deep; c.beginPath(); c.moveTo(-8, -101); c.lineTo(0, -86); c.lineTo(8, -101); c.closePath(); c.fill();
    line(c, deep, 1.4, [[0, -86], [0, -22]]);
    for (const y of [-74, -58, -42]) dot(c, 3.5, y, 2, U.shade(coat, -0.3));
    dot(c, -27, -43, 5.6, g.skin);
    if (!o.hold) dot(c, 27, -43, 5.6, g.skin);
    if (tr.has('basket')) basket(c, -29, -41);
    if (tr.has('dog')) line(c, '#8a5a3a', 1.6, [[-27, -40], [-28, -26], [-26, -20]]);
    // the head, which shakes a little for "not mine"
    c.save(); c.translate(0, -104); c.rotate(o.shake * 0.16); c.translate(0, 104);
    c.fillStyle = g.skin; c.fillRect(-5, -110, 10, 10);
    if (tr.has('scarf')) scarf(c, g);
    if (g.style === 'bob' || g.style === 'long') { c.fillStyle = g.hair; c.beginPath(); c.roundRect(-23, -138, 46, g.style === 'long' ? 44 : 32, [20, 20, 8, 8]); c.fill(); }
    dot(c, -20, -122, 4.2, g.skin); dot(c, 20, -122, 4.2, g.skin);
    dot(c, 0, -124, 20, g.skin);
    hair(c, g);
    if (tr.has('beard')) {
      c.fillStyle = g.hair; c.beginPath(); c.moveTo(-18, -124); c.quadraticCurveTo(-18, -96, 0, -95); c.quadraticCurveTo(18, -96, 18, -124);
      c.quadraticCurveTo(12, -112, 0, -113); c.quadraticCurveTo(-12, -112, -18, -124); c.closePath(); c.fill();
    }
    // the face
    dot(c, -7, -126, 2.5, INK); dot(c, 7, -126, 2.5, INK);
    dot(c, -6.2, -126.8, 0.9, '#fff'); dot(c, 7.8, -126.8, 0.9, '#fff');
    dot(c, -12.5, -118, 3.2, 'rgba(239,138,166,' + (0.28 + 0.2 * sm).toFixed(2) + ')'); dot(c, 12.5, -118, 3.2, 'rgba(239,138,166,' + (0.28 + 0.2 * sm).toFixed(2) + ')');
    c.strokeStyle = tr.has('beard') ? '#fffaf1' : '#5a2f26'; c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath(); c.arc(0, -119 - sm, 3.5 + sm * 2.5, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    if (tr.has('glasses')) {
      c.strokeStyle = '#4a3f36'; c.lineWidth = 1.8;
      c.beginPath(); c.arc(-7, -126, 6, 0, 7); c.moveTo(13, -126); c.arc(7, -126, 6, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(-1.5, -127); c.quadraticCurveTo(0, -129, 1.5, -127); c.moveTo(-13, -127); c.lineTo(-19, -129); c.moveTo(13, -127); c.lineTo(19, -129); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(-7, -126, 5, 0, 7); c.arc(7, -126, 5, 0, 7); c.fill();
    }
    if (tr.has('hat')) hat(c, g.hat);
    if (tr.has('bow')) bow(c, 13, -143, g.bow);
    c.restore();
    if (o.hold) { c.save(); c.translate(29, -50); c.scale(0.62, 0.62); THINGS[o.hold].draw(c); c.restore(); dot(c, 27, -43, 5.6, g.skin); }
    // the little dog sits in front, right at its person's feet
    if (tr.has('dog')) littleDog(c, -21, 1, g.pup, o.wag);
  }
  function hair(c, g) {
    c.fillStyle = g.hair;
    if (g.style === 'curly') {
      for (let k = 0; k < 9; k++) { const a = Math.PI * (1.02 + k * 0.12); dot(c, Math.cos(a) * 19, -126 + Math.sin(a) * 19, 7, g.hair); }
      return;
    }
    c.beginPath(); c.arc(0, -124, 21, Math.PI * 0.96, Math.PI * 2.04);
    c.quadraticCurveTo(12, -133, 2, -134); c.quadraticCurveTo(-10, -136, -21, -121); c.closePath(); c.fill();
    if (g.style === 'bun') { dot(c, 0, -148, 8, g.hair); dot(c, -3, -150, 2.4, 'rgba(255,255,255,0.18)'); }
  }
  function hat(c, col) {
    oval(c, 0, -140, 27, 6.5, 0, U.shade(col, -0.12));
    c.fillStyle = col; c.beginPath(); c.moveTo(-15, -141); c.lineTo(-13, -161); c.quadraticCurveTo(0, -166, 13, -161); c.lineTo(15, -141); c.closePath(); c.fill();
    c.fillStyle = U.shade(col, -0.3); c.fillRect(-15, -149, 30, 5);
    dot(c, -8, -158, 2, 'rgba(255,255,255,0.2)');
  }
  function bow(c, x, y, col) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - 13, y - 8); c.lineTo(x - 13, y + 8); c.closePath(); c.moveTo(x, y); c.lineTo(x + 13, y - 8); c.lineTo(x + 13, y + 8); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,250,241,0.7)'; for (const [dx, dy] of [[-8, -2], [-9, 3], [8, -2], [9, 3]]) dot(c, x + dx, y + dy, 1.3, 'rgba(255,250,241,0.75)');
    dot(c, x, y, 3.6, U.shade(col, -0.2));
  }
  function scarf(c, g) {
    const a = g.scarf[0], b = g.scarf[1];
    c.save(); c.beginPath(); c.roundRect(-16, -107, 32, 10, 5); c.clip();
    c.fillStyle = a; c.fillRect(-16, -107, 32, 10); c.fillStyle = b; for (let x = -16; x < 16; x += 8) c.fillRect(x, -107, 4, 10);
    c.restore();
    c.save(); c.translate(-9, -100); c.rotate(0.12); c.beginPath(); c.rect(-5, 0, 11, 32); c.clip();
    c.fillStyle = a; c.fillRect(-5, 0, 11, 32); c.fillStyle = b; for (let y = 2; y < 32; y += 7) c.fillRect(-5, y, 11, 3.5);
    c.restore();
    c.strokeStyle = a; c.lineWidth = 1.2; c.beginPath(); for (let x = -13; x <= -4; x += 3) { c.moveTo(x + 1.5, -68); c.lineTo(x + 1.8, -63); } c.stroke();
  }
  function basket(c, x, y) {
    c.strokeStyle = '#8f6a3e'; c.lineWidth = 2.2; c.beginPath(); c.arc(x, y + 6, 9, Math.PI, 0); c.stroke();
    c.fillStyle = '#c99e69'; c.beginPath(); c.moveTo(x - 12, y + 6); c.lineTo(x + 12, y + 6); c.lineTo(x + 9, y + 24); c.lineTo(x - 9, y + 24); c.closePath(); c.fill();
    c.strokeStyle = '#a47a49'; c.lineWidth = 1; c.beginPath(); for (const yy of [11, 16, 21]) { c.moveTo(x - 11, y + yy); c.lineTo(x + 11, y + yy); } c.stroke();
    dot(c, x - 4, y + 4, 3.4, '#e2574c'); dot(c, x + 4, y + 3, 3.4, '#9cc58a');
  }
  // the little dog that comes with someone (not one of the owners)
  function littleDog(c, x, y, col, wag) {
    c.save(); c.translate(x, y);
    c.strokeStyle = col; c.lineWidth = 3.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(9, -8); c.quadraticCurveTo(16, -12 + wag * 2, 15 + wag * 3, -20); c.stroke();
    oval(c, 0, -8, 11, 9, 0, col); oval(c, -4, -2, 4, 3, 0, U.shade(col, 0.3)); oval(c, 5, -1, 4, 3, 0, U.shade(col, 0.3));
    dot(c, -6, -20, 8, col); oval(c, -12, -19, 3, 6, 0.3, U.shade(col, -0.25)); oval(c, 0, -19, 3, 6, -0.3, U.shade(col, -0.25));
    oval(c, -7, -16, 4, 3, 0, U.shade(col, 0.35)); dot(c, -7, -17.5, 1.5, INK); dot(c, -9, -22, 1.2, INK); dot(c, -3.5, -22, 1.2, INK);
    c.strokeStyle = '#e2574c'; c.lineWidth = 2; c.beginPath(); c.arc(-6, -20, 7.5, 0.35 * Math.PI, 0.75 * Math.PI); c.stroke();
    c.restore();
  }

  // ------------------------------------------------------------------ DOGS
  // A dog sitting with its paws at 0, 0. d = { fur, light, spot, tr, band, bow }
  function sitDog(c, d, o) {
    const tr = d.tr, deep = U.shade(d.fur, -0.22);
    // the tail, wagging when it is happy
    const wag = Math.sin(o.t * (o.smile > 0.5 ? 11 : 2)) * (o.smile > 0.5 ? 1 : 0.25);
    if (tr.has('curly')) {
      c.strokeStyle = d.fur; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(18, -16); c.quadraticCurveTo(32, -18, 31, -30); c.arc(25, -30, 6, 0, Math.PI * 1.5, true); c.arc(25, -29, 2.5, Math.PI * 1.5, Math.PI * 0.6, true); c.stroke();
    } else { c.save(); c.translate(18, -14); c.rotate(-0.7 + wag * 0.35); c.strokeStyle = d.fur; c.lineWidth = 5.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -4, 16, -16); c.stroke(); c.restore(); }
    oval(c, 0, -32, 25, 30, 0, d.fur);
    oval(c, 0, -40, 13, 21, 0, d.light);
    if (tr.has('spots')) for (const [x, y, rr] of [[-15, -28, 5.5], [14, -40, 4.5], [17, -20, 5], [-11, -48, 3.6]]) dot(c, x, y, rr, d.spot);
    c.fillStyle = d.fur; PZ.rr(c, -15, -26, 10, 26, 4); c.fill(); PZ.rr(c, 5, -26, 10, 26, 4); c.fill();
    oval(c, -10, -3, 7, 4, 0, d.light); oval(c, 10, -3, 7, 4, 0, d.light);
    if (tr.has('bandana')) {
      c.fillStyle = d.band; c.beginPath(); c.moveTo(-17, -62); c.quadraticCurveTo(0, -56, 17, -62); c.lineTo(0, -40); c.closePath(); c.fill();
      for (const [x, y] of [[-8, -57], [6, -57], [0, -49]]) dot(c, x, y, 1.6, 'rgba(255,250,241,0.85)');
    }
    // the head, which shakes a little for "not mine"
    c.save(); c.translate(0, -62); c.rotate(o.shake * 0.18); c.translate(0, 62);
    const hy = -80;
    if (tr.has('ears')) { oval(c, -18, hy + 8, 7, 18, 0.25, deep); oval(c, 18, hy + 8, 7, 18, -0.25, deep); }
    else for (const sd of [-1, 1]) { oval(c, sd * 14, hy - 14, 6.5, 8.5, sd * 0.6, deep); oval(c, sd * 16.5, hy - 9.5, 4.5, 3.5, sd * 0.4, U.shade(deep, -0.1)); }
    dot(c, 0, hy, 19, d.fur);
    if (tr.has('spots')) { dot(c, -9, hy - 9, 3.6, d.spot); dot(c, 11, hy + 5, 3, d.spot); }
    if (tr.has('patch')) oval(c, 7.5, hy - 3, 7.5, 6.5, 0.2, d.spot);
    oval(c, 0, hy + 8, 10, 8, 0, d.light);
    oval(c, 0, hy + 4, 3.6, 2.6, 0, INK);
    dot(c, -7.5, hy - 3, 2.6, INK); dot(c, 7.5, hy - 3, 2.6, INK); dot(c, -6.7, hy - 3.8, 0.9, '#fff'); dot(c, 8.3, hy - 3.8, 0.9, '#fff');
    c.strokeStyle = INK; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, hy + 6); c.lineTo(0, hy + 9); c.arc(-3, hy + 9, 3, 0, Math.PI * 0.8); c.moveTo(0, hy + 9); c.arc(3, hy + 9, 3, Math.PI, Math.PI * 0.2, true); c.stroke();
    if (o.smile > 0.3) { c.fillStyle = '#e9808c'; c.beginPath(); c.ellipse(0, hy + 14, 3.4, 4.4 * o.smile, 0, 0, 7); c.fill(); }
    dot(c, -12, hy + 4, 3, 'rgba(239,138,166,0.3)'); dot(c, 12, hy + 4, 3, 'rgba(239,138,166,0.3)');
    if (tr.has('bow')) bow(c, -12, hy - 17, d.bow);
    c.restore();
    if (o.hold) { c.save(); c.translate(-22, -10); c.rotate(-0.15); c.scale(0.55, 0.55); THINGS[o.hold].draw(c); c.restore(); }
  }

  // ---------------------------------------------------------------- TRAITS
  // say: the words after "someone" or "a dog"; icon: its little picture on a note
  const PEOPLE_TRAITS = {
    glasses: { say: 'with glasses', icon(c) { c.strokeStyle = '#4a3f36'; c.lineWidth = 2.2; c.beginPath(); c.arc(-7, 0, 6, 0, 7); c.moveTo(13, 0); c.arc(7, 0, 6, 0, 7); c.moveTo(-1.5, -1); c.quadraticCurveTo(0, -3, 1.5, -1); c.stroke(); } },
    hat: { say: 'with a hat', icon(c, f) { c.save(); c.translate(0, 10); c.scale(0.8, 0.8); c.translate(0, 140); hat(c, f.hat); c.restore(); } },
    beard: { say: 'with a beard', icon(c, f) { dot(c, 0, -2, 10, f.skin); c.fillStyle = f.hair; c.beginPath(); c.moveTo(-10, -2); c.quadraticCurveTo(-10, 14, 0, 14); c.quadraticCurveTo(10, 14, 10, -2); c.quadraticCurveTo(6, 4, 0, 4); c.quadraticCurveTo(-6, 4, -10, -2); c.fill(); dot(c, -4, -4, 1.4, INK); dot(c, 4, -4, 1.4, INK); } },
    bow: { say: 'with a bow', icon(c, f) { bow(c, 0, 0, f.bow); } },
    scarf: { say: 'with a stripy scarf', icon(c, f) { c.save(); c.beginPath(); c.roundRect(-13, -9, 26, 8, 4); c.rect(-10, -3, 9, 16); c.clip(); c.fillStyle = f.scarf[0]; c.fillRect(-13, -9, 26, 22); c.fillStyle = f.scarf[1]; for (let x = -13; x < 13; x += 6) c.fillRect(x, -9, 3, 8); for (let y = 0; y < 14; y += 5) c.fillRect(-10, y, 9, 2.5); c.restore(); } },
    dog: { say: 'with a dog', icon(c, f) { littleDog(c, 4, 12, f.pup, 0); } },
    basket: { say: 'with a basket', icon(c) { basket(c, 0, -12); } },
  };
  const DOG_TRAITS = {
    spots: { say: 'with spots', icon(c, f) { oval(c, 0, 0, 13, 10, 0, f.fur); dot(c, -5, -3, 3.4, f.spot); dot(c, 5, 3, 3, f.spot); dot(c, 6, -5, 2, f.spot); } },
    bandana: { say: 'with a bandana', icon(c, f) { c.fillStyle = f.band; c.beginPath(); c.moveTo(-14, -8); c.quadraticCurveTo(0, -3, 14, -8); c.lineTo(0, 12); c.closePath(); c.fill(); for (const [x, y] of [[-6, -4], [6, -4], [0, 4]]) dot(c, x, y, 1.6, '#fffaf1'); } },
    ears: { say: 'with long ears', icon(c, f) { oval(c, -11, 4, 5, 12, 0.25, U.shade(f.fur, -0.22)); oval(c, 11, 4, 5, 12, -0.25, U.shade(f.fur, -0.22)); dot(c, 0, -1, 11, f.fur); dot(c, -4, -3, 1.6, INK); dot(c, 4, -3, 1.6, INK); oval(c, 0, 3, 2.4, 1.8, 0, INK); } },
    curly: { say: 'with a curly tail', icon(c, f) { c.strokeStyle = f.fur; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, 8); c.quadraticCurveTo(4, 8, 6, -2); c.arc(0, -2, 6, 0, Math.PI * 1.5, true); c.arc(0, -1, 2.4, Math.PI * 1.5, Math.PI * 0.6, true); c.stroke(); } },
    patch: { say: 'with an eye patch', icon(c, f) { dot(c, 0, 0, 12, f.fur); oval(c, 5, -3, 5.6, 5, 0.2, f.spot); dot(c, -5, -3, 1.8, INK); dot(c, 5, -3, 1.8, INK); oval(c, 0, 4, 2.4, 1.8, 0, INK); } },
    bow: { say: 'with a bow', icon(c, f) { bow(c, 0, 0, f.bow); } },
  };

  // ---------------------------------------------------------------- VARIANTS
  const COATS = ['#9cc5a1', '#d98b63', '#3d5a86', '#e3b65a', '#bba9df', '#c9474f', '#8fbfe6', '#7d8f6a'];
  const SKINS = ['#f6d3b3', '#e8b48f', '#c98d63', '#8d5a3b', '#f1c9a5', '#a8714c'];
  const HAIRS = ['#6b4a32', '#3b2a22', '#c4703f', '#e8c87a', '#9a948c', '#8a5a3a'];
  const STYLES = ['short', 'bun', 'bob', 'curly', 'long'];
  const HATS = ['#6b6157', '#3d5a86', '#7d8f6a', '#9b3b45'];
  const BOWS = ['#efb4ae', '#f2d88a', '#bba9df', '#a6d3d4'];
  const SCARVES = [['#e2574c', '#fffaf1'], ['#3d5a86', '#f2d88a'], ['#6f9a6a', '#fffaf1'], ['#bba9df', '#fffaf1']];
  const FURS = [['#d9a05b', '#f4dcb6'], ['#f1e3cb', '#fffaf1'], ['#b98a62', '#ecd6b8'], ['#c9c3bb', '#f0ece6'], ['#e7c08f', '#fbeedd'], ['#9a7a5a', '#e2cfb4']];
  const VARIANTS = {
    lost: {
      people: true, traits: PEOPLE_TRAITS, things: ['umbrella', 'teddy', 'book', 'kite', 'mittens', 'suitcase', 'wool'],
      verb: 'belongs to', verbs: 'belong to', who: 'someone', anyone: 'anyone', ask: 'Read the notes, then give everything back',
      exclude: [['hat', 'bow'], ['beard', 'bow'], ['dog', 'basket'], ['beard', 'scarf']],
    },
    cafe: {
      people: true, traits: PEOPLE_TRAITS, things: ['umbrella', 'cardigan', 'paper', 'cakebox', 'keys', 'purse', 'flowers'],
      verb: 'belongs to', verbs: 'belong to', who: 'someone', anyone: 'anyone', ask: 'Read the notes, then give everything back',
      exclude: [['hat', 'bow'], ['beard', 'bow'], ['dog', 'basket'], ['beard', 'scarf']],
    },
    leads: {
      people: false, traits: DOG_TRAITS, things: ['lead', 'bell', 'starcoat', 'hearttag', 'jumper', 'checks'],
      verb: 'goes to', verbs: 'go to', who: 'a dog', anyone: 'a dog', ask: 'Read the notes, then give every dog its own',
      exclude: [['spots', 'patch']],
    },
  };

  // a hair colour that stands out from the face
  function hairFor(skin, k) {
    for (let j = 0; j < HAIRS.length; j++) { const h = HAIRS[(k + j) % HAIRS.length]; if (Math.abs(U.lum(h) - U.lum(skin)) > 0.22) return h; }
    return HAIRS[k % HAIRS.length];
  }
  function perms(n) {
    const out = [];
    const go = (a, used) => { if (a.length === n) { out.push(a.slice()); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; a.push(i); go(a, used); a.pop(); used[i] = false; } };
    go([], []);
    return out;
  }
  const ALL = perms(4);
  // a note { t, X, pos }: thing t's owner has (pos) or has not got trait X;
  // p[t] is the owner of thing t
  const holds = (cl, p, owners) => owners[p[cl.t]].tr.has(cl.X) === cl.pos;

  // Four owners with two traits each (no two alike, no trait on more than
  // two), four things, a random answer; then notes true for it until only
  // the answer fits, picked from the stronger half of those that still rule
  // something out, and any note the others make unneeded comes down again.
  // Three or four notes, each about a different thing if it can be (two at
  // most), at least one that says who it is for.
  function makePuzzle(r, V) {
    const ids = Object.keys(V.traits);
    const clash = (a, b) => V.exclude.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    for (let tries = 0; tries < 400; tries++) {
      const owners = [];
      const count = {};
      for (let i = 0; i < 4; i++) {
        let tr = null;
        for (let k = 0; k < 40 && !tr; k++) {
          const [a, b] = PZ.shuffle(r, ids.slice());
          if (clash(a, b) || (count[a] || 0) >= 2 || (count[b] || 0) >= 2) continue;
          const key = [a, b].sort().join();
          if (owners.some((o) => o.key === key)) continue;
          tr = { a, b, key };
        }
        if (!tr) break;
        count[tr.a] = (count[tr.a] || 0) + 1; count[tr.b] = (count[tr.b] || 0) + 1;
        owners.push({ key: tr.key, tr: new Set([tr.a, tr.b]) });
      }
      if (owners.length < 4) continue;
      const things = PZ.shuffle(r, V.things.slice()).slice(0, 4);
      const sol = PZ.shuffle(r, [0, 1, 2, 3]);          // sol[t] = the owner of thing t
      const used = ids.filter((X) => count[X]);
      const cands = [];
      for (let t = 0; t < 4; t++) for (const X of used) cands.push({ t, X, pos: owners[sol[t]].tr.has(X) });
      PZ.shuffle(r, cands);
      let left = ALL;
      const clues = [];
      const per = [0, 0, 0, 0], most = tries < 200 ? 1 : 2;
      while (left.length > 1 && clues.length < 6) {
        const opts = [];
        for (const cl of cands) {
          if (clues.includes(cl) || per[cl.t] >= most) continue;
          const out = left.filter((p) => !holds(cl, p, owners)).length;
          if (out > 0) opts.push({ cl, out });
        }
        if (!opts.length) break;
        opts.sort((x, y) => y.out - x.out);
        const pick = opts[(r() * Math.ceil(opts.length / 2)) | 0].cl;
        clues.push(pick); per[pick.t]++;
        left = left.filter((p) => holds(pick, p, owners));
      }
      if (left.length !== 1) continue;
      for (let i = clues.length - 1; i >= 0; i--) {
        const rest = clues.filter((_, k) => k !== i);
        if (ALL.filter((p) => rest.every((cl) => holds(cl, p, owners))).length === 1) clues.splice(i, 1);
      }
      if (clues.length < 3 || clues.length > 4 || !clues.some((cl) => cl.pos)) continue;
      return { owners, things, sol, clues: PZ.shuffle(r, clues) };
    }
    return null;
  }

  // ---------------------------------------------------------------- SCENE
  const GX = [50, 136.7, 223.3, 310], FEET = 426;
  const TX = [50, 136.7, 223.3, 310], TY = 518;
  const R = 30;

  function owners(S) {
    const r = S.r, what = VARIANTS[S.opts.what] ? S.opts.what : 'lost', V = VARIANTS[what];
    let P = makePuzzle(r, V);
    for (let k = 0; !P && k < 20; k++) P = makePuzzle(U.rng(9001 + k), V);
    const sol = P.sol;
    // how each owner looks, beyond the two traits the notes talk about
    const looks = PZ.shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7]);
    const styles = PZ.shuffle(r, STYLES.slice());
    // a trait looks the same on everyone who has it and on the notes
    const skinOf = (i) => SKINS[(looks[i] + i * 2) % SKINS.length];
    const bearded = P.owners.map((o, i) => (o.tr.has('beard') ? skinOf(i) : null)).filter(Boolean);
    let beard = HAIRS[looks[4] % HAIRS.length];
    for (let j = 0; j < HAIRS.length; j++) { const h = HAIRS[(looks[4] + j) % HAIRS.length]; if (bearded.every((sk) => Math.abs(U.lum(h) - U.lum(sk)) > 0.22)) { beard = h; break; } }
    const same = {
      hat: HATS[(looks[0] + 1) % HATS.length], bow: BOWS[looks[1] % BOWS.length], scarf: SCARVES[looks[2] % SCARVES.length],
      pup: ['#c98f52', '#f1e3cb', '#8a6a4a'][looks[3] % 3], band: ['#5d7fd8', '#e2574c', '#6f9a6a', '#e9962c'][looks[0] % 4],
    };
    const folk = P.owners.map((o, i) => {
      const f = { tr: o.tr, shake: 0, shakeT: 0, smile: 0, joy: -1, hold: null };
      if (V.people) {
        Object.assign(f, {
          coat: COATS[looks[i]], skin: skinOf(i), hair: o.tr.has('beard') ? beard : hairFor(skinOf(i), looks[(i + 1) % 8] + i),
          style: o.tr.has('beard') ? 'short' : o.tr.has('hat') && styles[i] === 'bun' ? 'bob' : styles[i], legs: ['#5d6470', '#6b4a32', '#4b4a52', '#7a6a8a'][i],
          hat: same.hat, bow: same.bow, scarf: same.scarf, pup: same.pup,
        });
      } else {
        const fur = FURS[looks[i] % FURS.length];
        Object.assign(f, { fur: fur[0], light: fur[1], spot: '#6b4a32', band: same.band, bow: same.bow });
      }
      return f;
    });
    const items = P.things.map((id, t) => {
      const hx = TX[t] + (r() - 0.5) * 16, hy = TY + (r() - 0.5) * 22, rot = (r() - 0.5) * 0.3;
      return { t, id, hx, hy, rot, x: hx, y: hy, tx: hx, ty: hy, given: false };
    });
    const n = 4;
    const CW = 336, CH = 44, top = 30 + (206 - (P.clues.length * 50 - 6)) / 2;
    const cards = P.clues.map((cl, k) => ({ cl, x: 12, y: top + k * 50, tick: 0 }));
    let held = null, gdx = 0, gdy = 0, hint = null, hintT = 0, fx = null, clock = 0;

    function give(it, snap) {
      it.given = true; const f = folk[sol[it.t]]; f.hold = it.id;
      if (snap) { f.smile = 1; f.joy = 9; }
    }
    const solved = () => items.every((it) => it.given);

    function noteWords(cl) {
      const T = THINGS[P.things[cl.t]], X = V.traits[cl.X];
      const verb = cl.pos ? (T.many ? V.verbs : V.verb) : T.many ? 'are not for' : 'is not for';
      return [`${T.name} ${verb}`, `${cl.pos ? V.who : V.anyone} ${X.say}`];
    }

    // ------------------------------------------------------------ the room
    function wall(c) {
      const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(733);
      if (what === 'leads') {
        // the rescue: painted boards in the porch where the leads hang
        c.fillStyle = '#a9bf98'; c.fillRect(x0, y0, x1 - x0, FEET + 2 - y0);
        for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) {
          c.fillStyle = `rgba(${rr() < 0.5 ? '255,250,230' : '60,80,50'},${(0.04 + rr() * 0.06).toFixed(3)})`; c.fillRect(x, y0, 30, FEET + 2 - y0);
          c.fillStyle = 'rgba(50,70,45,0.22)'; c.fillRect(x, y0, 1.5, FEET + 2 - y0);
        }
        // a row of empty hooks
        c.fillStyle = '#8a6a4a'; c.fillRect(x0, 252, x1 - x0, 9);
        for (let x = 30; x < 360; x += 50) { c.strokeStyle = '#6b6157'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, 258); c.lineTo(x, 266); c.arc(x + 3, 266, 3, Math.PI, 0, true); c.stroke(); }
        c.fillStyle = '#d2ac78'; c.fillRect(x0, FEET - 4, x1 - x0, y1 - FEET + 4);
        c.fillStyle = 'rgba(90,60,30,0.2)'; for (let y = FEET + 8; y < 446; y += 10) c.fillRect(x0, y, x1 - x0, 1.2);
        // straw about
        c.strokeStyle = 'rgba(214,176,86,0.7)'; c.lineWidth = 1.2;
        for (let i = 0; i < 40; i++) { const x = rr() * 360, y = FEET + 2 + rr() * 16, a = rr() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 3); c.stroke(); }
      } else if (what === 'cafe') {
        // the café: warm plaster, a duck-egg stripe and a panelled dado
        c.fillStyle = '#f3e7d4'; c.fillRect(x0, y0, x1 - x0, FEET - y0);
        c.fillStyle = 'rgba(166,211,212,0.25)'; for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) c.fillRect(x, y0, 9, 350 - y0);
        c.fillStyle = '#a6d3d4'; c.fillRect(x0, 350, x1 - x0, FEET - 350);
        c.fillStyle = 'rgba(255,250,241,0.4)'; c.fillRect(x0, 350, x1 - x0, 3);
        c.strokeStyle = 'rgba(60,110,112,0.3)'; c.lineWidth = 1.5;
        for (let x = 6; x < 360; x += 60) { c.beginPath(); c.roundRect(x, 362, 48, FEET - 372, 3); c.stroke(); }
        // black and white floor tiles
        for (let y = FEET - 2, row = 0; y < 446; y += 10, row++) for (let x = x0 - 20 + (row % 2) * 10; x < x1; x += 20) { c.fillStyle = '#4b4a52'; c.fillRect(x, y, 10, 10); c.fillStyle = '#f6efe3'; c.fillRect(x + 10, y, 10, 10); }
      } else {
        // the station: cream above, wine-red boards below, a lamp bracket
        c.fillStyle = '#f3e9d4'; c.fillRect(x0, y0, x1 - x0, FEET - y0);
        c.fillStyle = 'rgba(160,120,80,0.08)'; for (let y = Math.floor(y0 / 18) * 18; y < 350; y += 18) c.fillRect(x0, y, x1 - x0, 1.2);
        c.fillStyle = '#9b3b45'; c.fillRect(x0, 350, x1 - x0, FEET - 350);
        c.fillStyle = 'rgba(255,240,230,0.12)'; for (let x = Math.floor(x0 / 16) * 16; x < x1; x += 16) c.fillRect(x, 352, 1.5, FEET - 352);
        c.fillStyle = '#7a2c34'; c.fillRect(x0, 346, x1 - x0, 6);
        c.fillStyle = 'rgba(255,240,230,0.35)'; c.fillRect(x0, 346, x1 - x0, 1.5);
        c.fillStyle = '#c4a57a'; c.fillRect(x0, FEET - 2, x1 - x0, 448 - FEET);
        c.fillStyle = 'rgba(90,60,30,0.2)'; for (let y = FEET + 6; y < 446; y += 9) c.fillRect(x0, y, x1 - x0, 1.2);
      }
      PZ.text(c, V.ask, 180, 16, { size: 13, color: INK2, weight: 700, maxW: 340 });
    }
    // the counter (a table at the rescue) the things wait on
    function counter(c) {
      const { x0, x1, y1 } = S.bleed, rr = U.rng(917);
      const top = what === 'cafe' ? '#efe6da' : '#c9a372', edge = what === 'cafe' ? '#b98f5a' : '#9c7448';
      c.fillStyle = 'rgba(60,40,20,0.22)'; c.fillRect(x0, 444, x1 - x0, 8);
      c.fillStyle = edge; c.fillRect(x0, 444, x1 - x0, 10);
      c.fillStyle = 'rgba(255,240,210,0.4)'; c.fillRect(x0, 444, x1 - x0, 1.5);
      c.fillStyle = top; c.fillRect(x0, 454, x1 - x0, y1 - 454);
      if (what === 'cafe') {
        c.strokeStyle = 'rgba(160,140,120,0.22)'; c.lineWidth = 1;
        for (let i = 0; i < 14; i++) { const x = rr() * 360, y = 460 + rr() * 130; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 20, y + 6, x + 30, y - 8, x + 60, y + 4); c.stroke(); }
      } else {
        c.strokeStyle = 'rgba(110,70,35,0.18)'; c.lineWidth = 0.8;
        for (let i = 0; i < 70; i++) { const x = rr() * 360, y = 458 + rr() * 140, l = 14 + rr() * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (rr() - 0.5)); c.stroke(); }
        c.fillStyle = 'rgba(90,60,30,0.16)'; for (let y = 494; y < 600; y += 40) c.fillRect(x0, y, x1 - x0, 1.5);
      }
      // a label tag in the corner says what this is
      const label = what === 'cafe' ? 'LEFT BEHIND' : what === 'leads' ? 'LEADS & COATS' : 'LOST PROPERTY';
      c.save(); c.translate(180, 580); c.rotate(-0.02);
      c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, -61, -9, 124, 22, 4); c.fill();
      c.fillStyle = what === 'cafe' ? '#4f5a58' : '#f6efe3'; PZ.rr(c, -62, -11, 124, 22, 4); c.fill();
      PZ.text(c, label, 0, 0.5, { size: 12, weight: 900, color: what === 'cafe' ? '#f6efe3' : '#9b3b45' });
      c.restore();
    }
    function note(c, cd) {
      const { cl, x, y } = cd, cy = y + CH / 2;
      c.fillStyle = 'rgba(50,40,30,0.2)'; c.beginPath(); c.roundRect(x + 1.5, y + 3, CW, CH, 10); c.fill();
      c.fillStyle = PAPER; c.beginPath(); c.roundRect(x, y, CW, CH, 10); c.fill();
      c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.5; c.stroke();
      // the thing on the left, the trait on the right (crossed out for "not")
      dot(c, x + 28, cy, 19, '#f3e9d4');
      c.save(); c.translate(x + 28, cy); c.scale(0.62, 0.62); THINGS[P.things[cl.t]].draw(c); c.restore();
      dot(c, x + CW - 28, cy, 19, '#f3e9d4');
      c.save(); c.translate(x + CW - 28, cy); V.traits[cl.X].icon(c, folk.find((f) => f.tr.has(cl.X))); c.restore();
      if (!cl.pos) {
        c.strokeStyle = 'rgba(217,139,99,0.9)'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x + CW - 40, cy - 12); c.lineTo(x + CW - 16, cy + 12); c.moveTo(x + CW - 16, cy - 12); c.lineTo(x + CW - 40, cy + 12); c.stroke();
      }
      const [a, b] = noteWords(cl);
      PZ.text(c, a, x + CW / 2, cy - 8.5, { size: 14, weight: 900, color: INK, maxW: CW - 116 });
      PZ.text(c, b, x + CW / 2, cy + 9.5, { size: 13.5, weight: 700, color: INK2, maxW: CW - 116 });
      dot(c, x + CW / 2, y + 4, 3.6, '#d98b63'); dot(c, x + CW / 2 - 1, y + 3, 1.2, 'rgba(255,255,255,0.7)');
    }
    function tickMark(c, x, y, k) {
      const rad = 10 * (k >= 1 ? 1 : U.easeBack(k));
      dot(c, x, y, rad, '#6f9a6a');
      c.strokeStyle = '#fffaf1'; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - rad * 0.42, y + rad * 0.02); c.lineTo(x - rad * 0.1, y + rad * 0.34); c.lineTo(x + rad * 0.45, y - rad * 0.3); c.stroke();
    }
    function drawOwner(c, f, i, t) {
      c.save(); c.translate(GX[i], FEET);
      const o = { smile: f.smile, shake: f.shakeT > 0 ? Math.sin(f.shakeT * 26) * Math.min(1, f.shakeT * 2.2) : 0, hold: f.hold, wag: Math.sin(t * (f.smile > 0.5 ? 9 : 2)), t };
      if (V.people) person(c, f, o); else sitDog(c, f, o);
      c.restore();
      if (f.joy >= 0 && f.joy < 1.4) { const k = f.joy / 1.4; heart(c, GX[i] + 10, FEET - (V.people ? 160 : 108) - k * 24, 6 + k * 2, `rgba(233,128,140,${(1 - k).toFixed(2)})`); }
    }
    function drawItem(c, it, s) {
      c.save(); c.translate(it.x, it.y); c.rotate(it === held ? 0 : it.rot); c.scale(s, s); THINGS[it.id].draw(c); c.restore();
    }

    const sc = {
      puzzle: true, indoor: true, steps: n,
      crop: { x: 0, y: 228, w: 360, h: 360 },
      decor(c) {
        wall(c);
        counter(c);
        for (const cd of cards) note(c, cd);
      },
      draw(c, t, still) {
        if (hint && hintT > 0 && !still && !hint.given) {
          PZ.glow(c, hint.x, hint.y, R, t);
          PZ.glow(c, GX[sol[hint.t]], FEET - (V.people ? 74 : 50), V.people ? 46 : 40, t);
        }
        folk.forEach((f, i) => drawOwner(c, f, i, still ? 0 : t));
        for (const cd of cards) if (cd.tick > 0.02) tickMark(c, cd.x + CW - 6, cd.y + 4, cd.tick);
        for (const it of items) {
          if (it.given || (it === held && !still)) continue;
          PZ.shadow(c, it.x, it.y + 22, 24, 5, 0.18);
          drawItem(c, it, 1);
        }
        if (held && !still) { PZ.shadow(c, held.x + 4, held.y + 34, 22, 5, 0.13); drawItem(c, held, 1.1); }
      },
      step(dt) {
        clock += dt; hintT -= dt;
        for (const it of items) { it.x = PZ.approach(it.x, it.tx, dt); it.y = PZ.approach(it.y, it.ty, dt); }
        for (const f of folk) {
          if (f.shakeT > 0) f.shakeT = Math.max(0, f.shakeT - dt);
          f.smile = PZ.approach(f.smile, f.hold ? 1 : 0, dt, 6);
          if (f.joy >= 0) f.joy += dt;
        }
        for (const cd of cards) cd.tick = PZ.approach(cd.tick, items[cd.cl.t].given ? 1 : 0, dt, 9);
      },
      down(x, y) {
        if (held) return;
        let best = null, bd = R + 8;
        for (const it of items) { const d = PZ.dist(it.x, it.y, x, y); if (!it.given && d < bd) { best = it; bd = d; } }
        if (!best) return;
        held = best; gdx = best.x - x; gdy = best.y - y;
        best.tx = x + gdx; best.ty = y + gdy - PZ.LIFT;
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x + gdx; held.ty = y + gdy - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const it = held; held = null;
        const dx = x + gdx, dy = y + gdy - PZ.LIFT; // judged where it is drawn
        let at = -1;
        if (dy > FEET - (V.people ? 172 : 118) && dy < 446) GX.forEach((gx, i) => { if (Math.abs(dx - gx) < 43 && (at < 0 || Math.abs(dx - gx) < Math.abs(dx - GX[at]))) at = i; });
        it.tx = it.hx; it.ty = it.hy;
        if (at >= 0 && at === sol[it.t]) {
          give(it); const f = folk[at]; f.joy = 0;
          fx.sound('happy'); fx.good(GX[at], FEET - (V.people ? 80 : 56));
          if (hint === it) hintT = 0;
          return;
        }
        if (at >= 0) { folk[at].shakeT = 0.7; fx.sound('nope'); return; } // a friendly "not mine", and it glides back
        fx.sound(dy >= 446 ? 'drop' : 'nope');
      },
      cancel() { if (held) { held.tx = held.hx; held.ty = held.hy; held = null; } },
      progress: () => items.filter((it) => it.given).length / n,
      solved,
      hint() {
        if (solved()) return;
        hint = items.find((it) => !it.given && it !== held) || null; hintT = 3.5;
      },
      save: () => ({ given: items.map((it) => it.given) }),
      load(s) {
        if (!s || !Array.isArray(s.given) || s.given.length !== n) return;
        s.given.forEach((v, t) => { if (v === true) give(items[t], true); });
      },
      solveAll() { items.forEach((it) => { if (!it.given) give(it, true); }); },
      // finger positions: pick the thing up, let go PZ.LIFT below its owner's middle
      debugPlan: () => items.filter((it) => !it.given).map((it) => ({ drag: [it.hx, it.hy, GX[sol[it.t]], FEET - (V.people ? 80 : 56) + PZ.LIFT] })),
      // for the tests: the notes, and whether they fit only one way
      debugNotes() {
        const fits = ALL.filter((p) => P.clues.every((cl) => holds(cl, p, P.owners)));
        return { notes: P.clues.map(noteWords).map((w) => w.join(' ')), fits: fits.length, sol: fits.length === 1 && fits[0].join() === sol.join(), traits: P.owners.map((o) => [...o.tr].join('+')), things: P.things };
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { owners });
})();
