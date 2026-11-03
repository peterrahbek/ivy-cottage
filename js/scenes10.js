'use strict';
// Kingfisher Lock: the side of the narrowboat's cabin to paint, with roses
// and castles once the new colour is on, and its round brass portholes to
// wash, with the cosy cabin behind them. Same layers as every other scene
// (see scenes.js). Needs scenes2.js first for the paint helpers.

(() => {
  const { W, H, field, ramp, softShadow, paintStamp, peelingPaint, grime, mowedLawn } = SCENES;

  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const rr = (c, x, y, w, h, rad) => { c.beginPath(); c.roundRect(x, y, w, h, rad); };
  const CREAM = '#f3e2b0', RED = '#c9343a', HULL = '#26282b', FONT = 'Georgia, "Times New Roman", serif';

  // ------------------------------------------------------------ shared bits
  function sky(c, y0, y1, x0, x1, top = '#a3d4ec', bot = '#e8f3ee') {
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  function cloud(c, x, y, s, a = 0.9) {
    c.fillStyle = `rgba(255,255,255,${a})`;
    for (const [dx, dy, k] of [[0, 0, 1], [0.9, 0.15, 0.75], [-0.85, 0.2, 0.7], [0.4, -0.35, 0.7], [-0.35, -0.3, 0.6]]) { c.beginPath(); c.ellipse(x + dx * s, y + dy * s, k * s, k * s * 0.7, 0, 0, 7); c.fill(); }
  }
  // the far bank of the canal: a row of soft trees over a hedge
  function farBank(c, r, x0, x1, y) {
    for (let x = x0 - 20; x < x1 + 30; x += 24 + r() * 20) {
      const h = 30 + r() * 46;
      c.fillStyle = U.pick(r, ['#7fae74', '#6f9f68', '#8cba7c', '#76a66d', '#679860']);
      c.beginPath(); c.ellipse(x, y - h * 0.45, 20 + r() * 16, h * 0.6, 0, 0, 7); c.fill();
    }
    c.fillStyle = '#5f8f55'; c.fillRect(x0, y - 16, x1 - x0, 20);
    for (let x = x0; x < x1; x += 9) { c.fillStyle = U.pick(r, ['#54834b', '#6a9a5e']); c.beginPath(); c.arc(x, y - 16, 6 + r() * 4, 0, 7); c.fill(); }
  }
  // canal water seen from the towpath: dark, still, a few ripples of sky
  function canalWater(c, r, nz, x0, y0, x1, y1) {
    const g = ramp(['#2c463b', '#365646', '#436452', '#53725f']);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(U.clamp(nz.fbm(x * 0.01, y * 0.06, 3) * 0.6 + ((y - y0) / (y1 - y0)) * 0.4, 0, 1)));
    c.fillStyle = 'rgba(214,234,226,0.32)';
    for (let i = 0; i < 46; i++) { const y = y0 + 6 + r() * (y1 - y0 - 10), l = 6 + r() * 24; c.fillRect(x0 + r() * (x1 - x0), y, l, 1.2); }
  }
  // the edge of the towpath in front: worn coping stones, then grass
  function towpathEdge(c, r, nz, x0, y0, x1, y1) {
    c.fillStyle = '#7d786d'; c.fillRect(x0, y0, x1 - x0, 24);
    for (let x = x0 - r() * 30; x < x1; x += 40 + r() * 12) {
      c.fillStyle = U.pick(r, ['#a6a093', '#b3ad9f', '#9c968a', '#aca596']); c.fillRect(x + 1, y0 + 2, 38, 19);
      c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x + 1, y0 + 2, 38, 3);
    }
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x0, y0 + 21, x1 - x0, 3);
    mowedLawn(c, nz, x0, y0 + 24, x1, y1, true);
  }
  function rustStreak(c, r, x, y, l) {
    dot(c, x, y, 1.3, '#5a3a24');
    const g = c.createLinearGradient(0, y, 0, y + l);
    g.addColorStop(0, 'rgba(150,80,30,0.6)'); g.addColorStop(1, 'rgba(150,80,30,0)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(x - 1.4, y); c.lineTo(x + 1.4, y); c.lineTo(x + 0.6 + (r() - 0.5) * 2, y + l); c.lineTo(x - 0.6 + (r() - 0.5) * 2, y + l); c.closePath(); c.fill();
  }
  // a canal rose: a round bloom of curled strokes and a white highlight
  function rose(c, x, y, s, col) {
    dot(c, x, y, s, col);
    c.lineCap = 'round';
    c.strokeStyle = U.shade(col, -0.38); c.lineWidth = s * 0.22;
    c.beginPath(); c.arc(x, y + s * 0.12, s * 0.56, 3.5, 5.95); c.stroke();
    c.beginPath(); c.arc(x, y - s * 0.02, s * 0.26, 0.3, 3.3); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = s * 0.14;
    c.beginPath(); c.arc(x, y, s * 0.8, 3.7, 4.9); c.stroke();
    c.beginPath(); c.arc(x, y, s * 0.8, 0.25, 0.95); c.stroke();
  }
  function leaf(c, x, y, s, a, col = '#3f8a4a') {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.5, -s * 0.45, s, 0); c.quadraticCurveTo(s * 0.5, s * 0.45, 0, 0); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(s * 0.12, 0); c.lineTo(s * 0.8, 0); c.stroke();
    c.restore();
  }
  // three roses with leaves, the way they are painted on boats and cans
  function roseBunch(c, x, y, s) {
    for (const [a, d] of [[-2.6, 1.5], [-0.5, 1.6], [0.9, 1.45], [2.4, 1.5], [-1.6, 1.7], [1.7, 1.55]]) leaf(c, x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.5, s * d, a);
    rose(c, x - s * 0.9, y + s * 0.35, s * 0.8, '#e98aa2');
    rose(c, x + s * 0.9, y + s * 0.4, s * 0.8, '#f2c230');
    rose(c, x, y - s * 0.25, s, RED);
  }
  // signwriting: cream letters with a dark shadow
  function signwrite(c, text, x, y, size) {
    c.save();
    c.font = `italic bold ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(20,15,10,0.55)'; c.fillText(text, x + size * 0.06, y + size * 0.07);
    c.fillStyle = CREAM; c.fillText(text, x, y);
    c.restore();
  }
  // the thin painted lines that frame a boat's panels
  function coachline(c, x, y, w, h, rad) {
    c.lineWidth = 2.4; c.strokeStyle = CREAM; rr(c, x, y, w, h, rad); c.stroke();
    c.lineWidth = 1.2; c.strokeStyle = RED; rr(c, x + 5, y + 5, w - 10, h - 10, Math.max(2, rad - 4)); c.stroke();
  }
  // a roses-and-castles panel: a castle by a river, a bridge, roses at the corners
  function castlePanel(c, x0, y0, x1, y1) {
    const w = x1 - x0, h = y1 - y0;
    c.fillStyle = '#1d2722'; rr(c, x0, y0, w, h, 8); c.fill();
    c.save(); rr(c, x0 + 6, y0 + 6, w - 12, h - 12, 5); c.clip();
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#7fb6dd'); g.addColorStop(0.55, '#f6e3a8'); g.addColorStop(1, '#f2c86a');
    c.fillStyle = g; c.fillRect(x0, y0, w, h);
    c.fillStyle = '#6aa65a'; c.beginPath(); c.moveTo(x0, y1 - h * 0.3);
    c.quadraticCurveTo(x0 + w * 0.28, y1 - h * 0.56, x0 + w * 0.58, y1 - h * 0.36); c.quadraticCurveTo(x0 + w * 0.8, y1 - h * 0.24, x1, y1 - h * 0.42);
    c.lineTo(x1, y1); c.lineTo(x0, y1); c.closePath(); c.fill();
    c.fillStyle = '#3d6fa8'; c.beginPath(); c.moveTo(x0, y1 - h * 0.17); c.quadraticCurveTo(x0 + w * 0.5, y1 - h * 0.27, x1, y1 - h * 0.15); c.lineTo(x1, y1); c.lineTo(x0, y1); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 5; i++) c.fillRect(x0 + 10 + i * w * 0.2, y1 - h * 0.1 + (i % 2) * 4, 12, 1.5);
    // the castle: a tall keep, two towers, red roofs, a flag
    const cx = x0 + w * 0.6, base = y1 - h * 0.3, k = h / 96;
    const tower = (x, top, tw) => {
      c.fillStyle = '#f4ecdc'; c.fillRect(x - tw / 2, top, tw, base - top);
      c.fillStyle = RED; c.beginPath(); c.moveTo(x - tw / 2 - 3 * k, top); c.lineTo(x, top - 16 * k); c.lineTo(x + tw / 2 + 3 * k, top); c.closePath(); c.fill();
      c.fillStyle = '#2d2a33'; c.fillRect(x - 2 * k, top + 7 * k, 4 * k, 6 * k);
    };
    c.fillStyle = '#efe4cf'; c.fillRect(cx - 26 * k, base - 24 * k, 52 * k, 24 * k);
    for (let i = 0; i < 6; i++) c.fillRect(cx - 26 * k + i * 9.6 * k, base - 29 * k, 5 * k, 5 * k);
    tower(cx - 26 * k, base - 40 * k, 12 * k); tower(cx + 26 * k, base - 40 * k, 12 * k); tower(cx, base - 58 * k, 16 * k);
    c.fillStyle = '#2d2a33'; c.beginPath(); c.arc(cx, base - 2 * k, 6 * k, Math.PI, 0); c.fill(); c.fillRect(cx - 6 * k, base - 2 * k, 12 * k, 2 * k);
    c.strokeStyle = '#2d2a33'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx, base - 74 * k); c.lineTo(cx, base - 88 * k); c.stroke();
    c.fillStyle = RED; c.beginPath(); c.moveTo(cx, base - 88 * k); c.lineTo(cx + 10 * k, base - 84 * k); c.lineTo(cx, base - 80 * k); c.closePath(); c.fill();
    // a little arched bridge over the river
    c.strokeStyle = '#f4ecdc'; c.lineWidth = 4 * k; c.beginPath(); c.arc(x0 + w * 0.2, y1 - h * 0.08, 14 * k, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    c.restore();
    c.lineWidth = 2; c.strokeStyle = CREAM; rr(c, x0 + 3, y0 + 3, w - 6, h - 6, 6); c.stroke();
    for (const [x, y] of [[x0 + 4, y0 + 4], [x1 - 4, y0 + 4], [x0 + 4, y1 - 4], [x1 - 4, y1 - 4]]) rose(c, x, y, 6.5, RED);
  }
  // a plant pot of red geraniums, a coil of rope and a painted can for the roof
  function geraniums(c, r, x, y) {
    c.fillStyle = '#b8653f'; c.beginPath(); c.moveTo(x - 15, y - 26); c.lineTo(x + 15, y - 26); c.lineTo(x + 11, y); c.lineTo(x - 11, y); c.closePath(); c.fill();
    c.fillStyle = '#cf7a50'; c.fillRect(x - 17, y - 30, 34, 6);
    for (let k = 0; k < 9; k++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#3f7a32']); c.beginPath(); c.ellipse(x + (r() - 0.5) * 34, y - 34 - r() * 16, 8, 5.5, r() * 3, 0, 7); c.fill(); }
    for (let k = 0; k < 6; k++) { const fx = x + (r() - 0.5) * 30, fy = y - 44 - r() * 16; for (let j = 0; j < 5; j++) dot(c, fx + (r() - 0.5) * 7, fy + (r() - 0.5) * 7, 2.6, U.pick(r, ['#e0485a', '#f06a7e', '#d93b4f'])); }
  }
  function ropeCoil(c, x, y) {
    for (let k = 0; k < 4; k++) {
      c.strokeStyle = k % 2 ? '#c9a46a' : '#b8925a'; c.lineWidth = 4;
      c.beginPath(); c.ellipse(x, y - 4 - k * 3.2, 22 - k * 3, 6 - k * 0.6, 0, 0, 7); c.stroke();
    }
    c.strokeStyle = 'rgba(90,60,30,0.35)'; c.lineWidth = 1;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x, y - 4 - k * 3.2, 22 - k * 3, 6 - k * 0.6, 0, 0.2, 2.9); c.stroke(); }
  }
  function paintedCan(c, x, y) {
    c.fillStyle = '#1f2a25'; rr(c, x - 13, y - 34, 26, 34, 4); c.fill();
    c.fillStyle = RED; c.fillRect(x - 13, y - 30, 26, 5); c.fillRect(x - 13, y - 8, 26, 4);
    c.strokeStyle = '#1f2a25'; c.lineWidth = 3; c.beginPath(); c.arc(x, y - 38, 9, Math.PI, 0); c.stroke();
    c.beginPath(); c.moveTo(x + 12, y - 24); c.lineTo(x + 22, y - 36); c.stroke();
    rose(c, x - 3, y - 17, 5, RED); rose(c, x + 6, y - 15, 3.6, '#f2c230');
  }
  // a stove chimney with two brass bands and a wisp of smoke
  function chimney(c, x, top, base) {
    c.fillStyle = 'rgba(235,235,235,0.5)';
    for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + 6 + k * 8, top - 12 - k * 15, 8 + k * 3, 6 + k * 2, 0, 0, 7); c.fill(); }
    c.fillStyle = '#2b2d30'; c.fillRect(x - 8, top, 16, base - top);
    c.fillStyle = '#3c3f43'; c.fillRect(x - 11, top - 5, 22, 7);
    for (const y of [top + 18, base - 16]) { const g = c.createLinearGradient(x - 9, 0, x + 9, 0); g.addColorStop(0, '#9c7a2e'); g.addColorStop(0.5, '#f2d37e'); g.addColorStop(1, '#a8822f'); c.fillStyle = g; c.fillRect(x - 9, y, 18, 6); }
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - 6, top, 3, base - top);
  }
  // a round brass rim with bolts, a hinge at the side and a little clamp
  function brassRim(c, x, y, rIn, rOut, bolts) {
    c.save();
    c.fillStyle = 'rgba(25,20,15,0.35)'; c.beginPath(); c.arc(x + 1.5, y + 2.5, rOut + 1, 0, 7); c.arc(x + 1.5, y + 2.5, rIn, 0, 7, true); c.fill();
    const g = c.createLinearGradient(x - rOut, y - rOut, x + rOut, y + rOut);
    g.addColorStop(0, '#fff0b8'); g.addColorStop(0.35, '#e2b850'); g.addColorStop(0.62, '#a7792a'); g.addColorStop(1, '#e9c56a');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, rOut, 0, 7); c.arc(x, y, rIn, 0, 7, true); c.fill();
    c.strokeStyle = 'rgba(90,60,20,0.55)'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(x, y, rOut - 0.5, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y, rIn + 0.5, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, (rIn + rOut) / 2, 3.5, 4.6); c.stroke();
    for (let k = 0; k < bolts; k++) {
      const a = (k / bolts) * 6.283 + 0.2, bx = x + Math.cos(a) * (rIn + rOut) / 2, by = y + Math.sin(a) * (rIn + rOut) / 2;
      dot(c, bx, by, Math.max(1.4, (rOut - rIn) * 0.18), '#8a6424'); dot(c, bx - 0.5, by - 0.5, Math.max(0.8, (rOut - rIn) * 0.09), '#fff1c4');
    }
    c.restore();
  }

  // --------------------------------------------------------- NARROWBOAT
  // The cabin side of a narrowboat, side on from the towpath, painted in the
  // player's colour. Portholes and the side doors are left out of the paint;
  // coachlines, the boat's name, a castle panel and roses go on top of it.
  function narrowboat(S) {
    const { r, nz, bleed } = S;
    const xL = 18, xR = 342, yT = 172, yB = 412;
    const PR = 22, RIM = 7, ports = [{ x: 66, y: 234 }, { x: 140, y: 234 }, { x: 298, y: 234 }];
    const door = { x0: 184, x1: 252, y0: 206, y1: yB };
    const region = new Path2D();
    region.roundRect(xL, yT, xR - xL, yB - yT, [10, 10, 0, 0]);
    for (const p of ports) { region.moveTo(p.x + PR + RIM, p.y); region.arc(p.x, p.y, PR + RIM, 0, Math.PI * 2); }
    region.rect(door.x0, door.y0, door.x1 - door.x0, door.y1 - door.y0);
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (x < xL + 12 || x > xR - 12 || y < yT + 10 || y > yB - 12 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        sky(c, y0, 176, x0, x1);
        cloud(c, 64, 46, 18); cloud(c, 292, 24, 14, 0.8);
        farBank(c, r, x0, x1, 168);
        // the deck beyond each end of the cabin: a cratch board in front, the stern rail behind
        c.fillStyle = '#7a5236'; c.beginPath(); c.moveTo(x0 - 40, 412); c.lineTo(xL - 30, 300); c.lineTo(xL - 4, 412); c.closePath(); c.fill();
        c.fillStyle = '#b8925a'; c.fillRect(xR + 8, 330, 4, 82); c.fillRect(xR + 8, 330, 60, 4);
        // the roof: its top, a red handrail along the edge, and what lives up there
        chimney(c, 300, 84, 156);
        geraniums(c, r, 84, 156);
        ropeCoil(c, 176, 156);
        paintedCan(c, 236, 156);
        c.fillStyle = '#5a5f66'; c.fillRect(x0, 150, x1 - x0, 8);
        c.fillStyle = '#9a2f2c'; c.fillRect(x0, 158, x1 - x0, 9);
        c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x0, 158, x1 - x0, 2);
        c.fillStyle = '#2b2d30'; c.fillRect(x0, 167, x1 - x0, 5);
        // the side doors: varnished planks, a brass knob each, a rose on each
        const dg = c.createLinearGradient(door.x0, 0, door.x1, 0);
        dg.addColorStop(0, '#7a4a2a'); dg.addColorStop(0.5, '#9c6438'); dg.addColorStop(1, '#7a4a2a');
        c.fillStyle = dg; c.fillRect(door.x0, door.y0, door.x1 - door.x0, door.y1 - door.y0);
        c.strokeStyle = 'rgba(40,20,10,0.35)'; c.lineWidth = 1;
        for (let i = 0; i < 40; i++) { const x = door.x0 + 3 + r() * (door.x1 - door.x0 - 6), y = door.y0 + r() * (door.y1 - door.y0), l = 20 + r() * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, Math.min(door.y1, y + l)); c.stroke(); }
        const mid = (door.x0 + door.x1) / 2;
        c.fillStyle = 'rgba(25,15,8,0.55)'; c.fillRect(mid - 1, door.y0, 2, door.y1 - door.y0);
        for (const [a, b] of [[door.x0 + 6, mid - 6], [mid + 6, door.x1 - 6]]) {
          c.strokeStyle = 'rgba(25,15,8,0.4)'; c.lineWidth = 2; c.strokeRect(a, door.y0 + 10, b - a, 86); c.strokeRect(a, door.y0 + 108, b - a, door.y1 - door.y0 - 122);
          rose(c, (a + b) / 2, door.y0 + 53, 7, RED); leaf(c, (a + b) / 2 - 6, door.y0 + 60, 9, 2.4); leaf(c, (a + b) / 2 + 6, door.y0 + 60, 9, 0.7);
        }
        for (const kx of [mid - 7, mid + 7]) { dot(c, kx, door.y0 + 112, 3.6, '#a7792a'); dot(c, kx - 0.6, door.y0 + 111, 1.6, '#fff1c4'); }
        // the hull: gunwale, black sides, two rope fenders
        c.fillStyle = '#1b1c1e'; c.fillRect(x0, yB, x1 - x0, 9);
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x0, yB, x1 - x0, 1.5);
        const hg = c.createLinearGradient(0, yB + 9, 0, 474);
        hg.addColorStop(0, '#34373b'); hg.addColorStop(1, HULL);
        c.fillStyle = hg; c.fillRect(x0, yB + 9, x1 - x0, 474 - yB - 9);
        c.fillStyle = '#9a2f2c'; c.fillRect(x0, yB + 16, x1 - x0, 3);
        for (const fx of [56, 304]) {
          c.strokeStyle = '#b8925a'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, yB + 4); c.lineTo(fx, yB + 18); c.stroke();
          c.fillStyle = '#b8925a'; rr(c, fx - 9, yB + 16, 18, 42, 8); c.fill();
          c.strokeStyle = 'rgba(90,60,30,0.45)'; c.lineWidth = 1.2; for (let y = yB + 22; y < yB + 56; y += 5) { c.beginPath(); c.moveTo(fx - 8, y); c.lineTo(fx + 8, y + 2); c.stroke(); }
        }
        // water with the hull's dark reflection, then the towpath in front
        canalWater(c, r, nz, x0, 474, x1, 548);
        c.fillStyle = 'rgba(20,24,24,0.4)'; c.fillRect(x0, 474, x1 - x0, 16);
        towpathEdge(c, r, nz, x0, 546, x1, y1);
        // a mooring rope from the deck in front down to a ring on the towpath
        c.strokeStyle = '#c9a46a'; c.lineWidth = 3; c.beginPath(); c.moveTo(6, 414); c.quadraticCurveTo(2, 500, 30, 556); c.stroke();
        c.strokeStyle = '#6b6f75'; c.lineWidth = 2.4; c.beginPath(); c.arc(30, 560, 5, 0, 7); c.stroke();
        const cab = new Path2D(); cab.rect(xL, yT, xR - xL, yB - yT);
        softShadow(c, cab, 10, 0.25, 0, 4);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // steel, not wood: shade under the roof, a soft sheen, darker low down
        const g = c.createLinearGradient(0, yT, 0, yB);
        g.addColorStop(0, 'rgba(0,0,0,0.26)'); g.addColorStop(0.08, 'rgba(255,255,255,0.1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.02)'); g.addColorStop(1, 'rgba(0,0,0,0.16)');
        c.fillStyle = g; c.fillRect(xL, yT, xR - xL, yB - yT);
        coachline(c, xL + 9, yT + 9, door.x0 - xL - 18, yB - yT - 18, 8);
        coachline(c, door.x1 + 9, yT + 9, xR - door.x1 - 18, yB - yT - 18, 8);
        signwrite(c, 'Kingfisher', 103, 282, 21);
        castlePanel(c, 36, 300, 168, 396);
        c.fillStyle = '#1d2722'; rr(c, 268, 290, 60, 104, 8); c.fill();
        c.lineWidth = 2; c.strokeStyle = CREAM; rr(c, 271, 293, 54, 98, 6); c.stroke();
        roseBunch(c, 298, 336, 12);
        for (const [x, y] of [[282, 372], [312, 370], [298, 380]]) { dot(c, x, y, 3, '#ffffff'); dot(c, x, y, 1.3, '#f2c230'); }
        // round each porthole, a fine cream ring
        c.strokeStyle = CREAM; c.lineWidth = 1.6;
        for (const p of ports) { c.beginPath(); c.arc(p.x, p.y, PR + RIM + 5, 0, 7); c.stroke(); }
      },
      dirt(c) {
        // the old paint, faded to a chalky grey-green
        const g = ramp(['#7f8f7f', '#8d9b8a', '#9aa695', '#a7b09f']);
        field(c, xL, yT, xR, yB, 2, (x, y) => g(nz.fbm(x * 0.012, y * 0.03, 4)));
        c.strokeStyle = 'rgba(240,230,190,0.22)'; c.lineWidth = 2; rr(c, xL + 10, yT + 10, xR - xL - 20, yB - yT - 20, 8); c.stroke();
        // primer and bare steel where the old paint has flaked away
        peelingPaint(c, r, xL, yT, xR, yB, 32, '#a5583c');
        peelingPaint(c, r, xL, yT, xR, yB, 18, '#c8c2b4');
        // green grime creeping up from the waterline
        field(c, xL, yT, xR, yB, 2, (x, y) => { const v = nz.fbm(x * 0.03 + 5, y * 0.03, 4) + ((y - yT) / (yB - yT)) * 0.42; return [86, 112, 62, Math.max(0, v - 0.6) * 620]; });
        grime(c, r, xL, yT, xR, yB, 30);
        for (const p of ports) for (let k = 0; k < 3; k++) rustStreak(c, r, p.x - 9 + k * 9 + (r() - 0.5) * 4, p.y + PR + RIM + 2, 18 + r() * 40);
        for (let i = 0; i < 6; i++) rustStreak(c, r, xL + 20 + r() * (xR - xL - 40), yT + 6, 16 + r() * 30);
      },
      top(c) {
        for (const p of ports) {
          // the glass first: the cabin glowing warm behind a lace curtain
          const gl = c.createRadialGradient(p.x - 6, p.y - 6, 2, p.x, p.y, PR);
          gl.addColorStop(0, '#f7d58a'); gl.addColorStop(0.7, '#b9773c'); gl.addColorStop(1, '#5a3a22');
          c.fillStyle = gl; c.beginPath(); c.arc(p.x, p.y, PR, 0, 7); c.fill();
          c.save(); c.beginPath(); c.arc(p.x, p.y, PR, 0, 7); c.clip();
          for (const sd of [-1, 1]) {
            c.fillStyle = '#f7f3ea'; c.beginPath(); c.moveTo(p.x + sd * PR, p.y - PR); c.lineTo(p.x + sd * PR * 0.5, p.y - PR);
            c.quadraticCurveTo(p.x + sd * PR * 0.42, p.y - PR * 0.1, p.x + sd * PR, p.y + PR * 0.55); c.closePath(); c.fill();
            c.fillStyle = 'rgba(201,71,79,0.55)'; for (let k = -PR; k < PR; k += 5) c.fillRect(p.x + sd * PR * 0.75 + k * 0.2, p.y - PR, 2, PR * 1.4);
          }
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(p.x - 12, p.y + 14); c.lineTo(p.x + 2, p.y - 18); c.lineTo(p.x + 7, p.y - 18); c.lineTo(p.x - 7, p.y + 14); c.closePath(); c.fill();
          c.restore();
          brassRim(c, p.x, p.y, PR, PR + RIM, 6);
        }
      },
      stamp: paintStamp,
    };
  }

  // ---------------------------------------------------------- PORTHOLE
  // Two round brass portholes in the cabin side, close up. Behind the glass
  // is the cosy cabin: panelled walls, lace plates, an oil lamp, a little
  // stove with a kettle on and the cat's tail hanging off the bench. Frost
  // in winter comes from the seasonal overlay (scenes4.js) like any glass.
  function porthole(S) {
    const { r, nz, bleed, opts } = S;
    const R = 70, RIM = 13, ports = [{ x: 94, y: 300 }, { x: 266, y: 300 }];
    const side = opts.boatColor || '#3f6b52';
    const region = new Path2D();
    for (const p of ports) { region.moveTo(p.x + R, p.y); region.arc(p.x, p.y, R, 0, Math.PI * 2); }
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) {
        for (const p of ports) { const d = Math.hypot(x - p.x, y - p.y); if (d <= R) return d > R - 14 ? 1.4 : 1; }
        return 1;
      },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        sky(c, y0, 124, x0, x1);
        cloud(c, 290, 40, 16, 0.85);
        farBank(c, r, x0, x1, 118);
        // the roof edge with its red handrail, a pot of geraniums and the rope
        geraniums(c, r, 300, 112);
        ropeCoil(c, 62, 112);
        c.fillStyle = '#5a5f66'; c.fillRect(x0, 108, x1 - x0, 8);
        c.fillStyle = '#9a2f2c'; c.fillRect(x0, 116, x1 - x0, 11);
        c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x0, 116, x1 - x0, 2);
        c.fillStyle = '#2b2d30'; c.fillRect(x0, 127, x1 - x0, 6);
        // the painted steel side, shaded under the roof
        const base = U.hex(side);
        field(c, x0, 133, x1, 470, 3, (x, y) => { const v = 0.94 + nz.fbm(x * 0.01, y * 0.02, 3) * 0.1; return [base[0] * v, base[1] * v, base[2] * v]; });
        const sg = c.createLinearGradient(0, 133, 0, 470);
        sg.addColorStop(0, 'rgba(0,0,0,0.3)'); sg.addColorStop(0.08, 'rgba(255,255,255,0.08)'); sg.addColorStop(1, 'rgba(0,0,0,0.18)');
        c.fillStyle = sg; c.fillRect(x0, 133, x1 - x0, 337);
        coachline(c, x0 - 20, 145, x1 - x0 + 40, 310, 10);
        signwrite(c, 'Kingfisher', 180, 186, 27);
        // a garland of roses below the portholes
        for (const x of [40, 180, 320]) roseBunch(c, x, 418, 10);
        for (let x = 66; x < 300; x += 28) if (Math.abs(x - 180) > 30) { leaf(c, x, 424, 12, 0.2 + (x % 3) * 0.3); dot(c, x + 6, 420, 2.6, '#ffffff'); }
        // the hull, the water and a fender
        c.fillStyle = '#1b1c1e'; c.fillRect(x0, 470, x1 - x0, 9);
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x0, 470, x1 - x0, 1.5);
        c.fillStyle = HULL; c.fillRect(x0, 479, x1 - x0, 58);
        c.fillStyle = '#9a2f2c'; c.fillRect(x0, 486, x1 - x0, 3);
        c.fillStyle = '#b8925a'; rr(c, 171, 484, 18, 44, 8); c.fill();
        canalWater(c, r, nz, x0, 537, x1, y1);
        c.fillStyle = 'rgba(20,24,24,0.4)'; c.fillRect(x0, 537, x1 - x0, 14);
        for (const p of ports) { const ring = new Path2D(); ring.arc(p.x, p.y, R + RIM, 0, 7); softShadow(c, ring, 10, 0.35, 1, 4); }
      },
      clean(c) {
        // pine boards inside, warm in the lamplight and the glow of the stove
        const g = ramp(['#b9824c', '#c98f57', '#d6a066', '#e1b377']);
        field(c, 0, 220, W, 380, 2, (x, y) => g(U.clamp(nz.fbm(x * 0.006, y * 0.05, 3) * 0.6 + 0.4 - Math.abs(y - 290) / 300, 0, 1)));
        c.fillStyle = 'rgba(90,50,20,0.35)';
        for (let x = 4; x < W; x += 15) c.fillRect(x, 220, 1.4, 160);
        for (const [lx, ly, rad] of [[108, 322, 110], [280, 350, 90]]) {
          const lamp = c.createRadialGradient(lx, ly, 4, lx, ly, rad);
          lamp.addColorStop(0, 'rgba(255,224,150,0.6)'); lamp.addColorStop(1, 'rgba(255,224,150,0)');
          c.fillStyle = lamp; c.fillRect(lx - rad, ly - rad, rad * 2, rad * 2);
        }
        // left: three lace plates over a shelf of jars, and the oil lamp
        c.fillStyle = '#7a4a2a'; c.fillRect(38, 282, 114, 6);
        for (const [x, col] of [[66, '#3d6fa8'], [94, RED], [122, '#4e7b5b']]) {
          dot(c, x, 260, 13, '#fbf6ec'); c.strokeStyle = col; c.lineWidth = 2.6; c.beginPath(); c.arc(x, 260, 10.5, 0, 7); c.stroke();
          for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.283; dot(c, x + Math.cos(a) * 11.8, 260 + Math.sin(a) * 11.8, 1.1, '#d8cfbf'); }
          rose(c, x, 260, 4, col === RED ? '#e98aa2' : RED);
        }
        for (const [x, h, col] of [[54, 16, '#e7c27a'], [136, 18, '#c98e5a']]) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x - 6, 282 - h, 12, h); c.fillStyle = col; c.fillRect(x - 5, 282 - h * 0.7, 10, h * 0.7 - 1); c.fillStyle = RED; c.fillRect(x - 7, 282 - h - 4, 14, 5); }
        c.fillStyle = '#a7792a'; c.fillRect(98, 342, 22, 4); c.fillRect(106, 328, 4, 16);
        c.fillStyle = '#d9b35a'; c.beginPath(); c.ellipse(108, 330, 11, 6, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,250,230,0.85)'; rr(c, 101, 300, 14, 28, 5); c.fill();
        dot(c, 108, 314, 4, '#ffd27a');
        // right: a shelf with a mug and books, the stove with the kettle on,
        // a cushion on the bench with the cat's striped tail hanging down
        c.fillStyle = '#7a4a2a'; c.fillRect(226, 262, 80, 6);
        c.fillStyle = '#f4ecdc'; rr(c, 232, 246, 16, 16, 3); c.fill(); c.strokeStyle = '#f4ecdc'; c.lineWidth = 2.4; c.beginPath(); c.arc(249, 254, 5, -1.3, 1.3); c.stroke();
        c.fillStyle = '#3d6fa8'; c.fillRect(262, 238, 9, 24); c.fillStyle = '#e9bd55'; c.fillRect(272, 242, 7, 20); c.fillStyle = '#4e7b5b'; c.fillRect(280, 240, 8, 22);
        c.fillStyle = '#2b2d30'; rr(c, 258, 336, 46, 60, 6); c.fill();
        c.fillStyle = '#3c3f43'; c.fillRect(252, 330, 58, 8);
        c.fillStyle = '#ffb347'; rr(c, 268, 350, 26, 18, 4); c.fill();
        c.fillStyle = '#ff8a3d'; c.beginPath(); c.moveTo(271, 368); c.quadraticCurveTo(276, 352, 281, 362); c.quadraticCurveTo(286, 350, 291, 368); c.closePath(); c.fill();
        c.fillStyle = '#d9534f'; c.beginPath(); c.ellipse(282, 316, 18, 14, 0, Math.PI, 0); c.fill(); c.fillRect(264, 314, 36, 16);
        c.strokeStyle = '#3d3d42'; c.lineWidth = 3; c.beginPath(); c.arc(282, 304, 9, Math.PI, 0); c.stroke();
        c.strokeStyle = '#d9534f'; c.lineWidth = 4; c.beginPath(); c.moveTo(266, 322); c.lineTo(254, 310); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2; c.lineCap = 'round';
        for (const dx of [-3, 5]) { c.beginPath(); c.moveTo(252 + dx, 304); c.bezierCurveTo(246 + dx, 294, 260 + dx, 286, 254 + dx, 274); c.stroke(); }
        c.fillStyle = '#8fa9c9'; rr(c, 214, 312, 46, 16, 6); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(218, 314, 38, 2);
        c.strokeStyle = '#e09a4a'; c.lineWidth = 7; c.lineCap = 'round';
        c.beginPath(); c.moveTo(224, 322); c.bezierCurveTo(218, 338, 232, 344, 224, 362); c.stroke();
        c.strokeStyle = '#b9702e'; c.setLineDash([4, 6]);
        c.beginPath(); c.moveTo(224, 322); c.bezierCurveTo(218, 338, 232, 344, 224, 362); c.stroke();
        c.setLineDash([]);
        c.fillStyle = '#e09a4a'; c.beginPath(); c.ellipse(238, 304, 19, 11, 0, 0, 7); c.fill();
        c.beginPath(); c.arc(254, 302, 8, 0, 7); c.fill();
        c.beginPath(); c.moveTo(250, 296); c.lineTo(252, 288); c.lineTo(256, 295); c.fill();
        c.beginPath(); c.moveTo(256, 296); c.lineTo(261, 289); c.lineTo(261, 299); c.fill();
        c.strokeStyle = '#b9702e'; c.lineWidth = 2;
        for (const dx of [-10, -3, 4]) { c.beginPath(); c.moveTo(238 + dx, 294); c.quadraticCurveTo(240 + dx, 302, 237 + dx, 310); c.stroke(); }
        c.strokeStyle = '#6b4022'; c.lineWidth = 1.2;
        c.beginPath(); c.arc(252, 303, 2, 0.2, 2.9); c.stroke(); c.beginPath(); c.arc(258, 302, 2, 0.2, 2.9); c.stroke();
        // gingham curtains, gathered back at both sides of both portholes
        for (const p of ports) for (const s of [-1, 1]) {
          c.save(); c.beginPath(); c.moveTo(p.x + s * R, p.y - R); c.lineTo(p.x + s * (R - 26), p.y - R); c.quadraticCurveTo(p.x + s * (R - 34), p.y, p.x + s * R, p.y + R * 0.7); c.closePath(); c.clip();
          c.fillStyle = '#f7f3ea'; c.fillRect(p.x - R - 2, p.y - R - 2, R * 2 + 4, R * 2 + 4);
          c.fillStyle = 'rgba(201,71,79,0.5)';
          for (let k = -R; k < R; k += 8) { c.fillRect(p.x + k, p.y - R, 4, R * 2); c.fillRect(p.x - R, p.y + k, R * 2, 4); }
          c.restore();
        }
      },
      cleanOver(c) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const p of ports) {
          c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.moveTo(p.x - 10, p.y - R); c.lineTo(p.x + 24, p.y - R); c.lineTo(p.x - 40, p.y + R); c.lineTo(p.x - 74, p.y + R); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.moveTo(p.x + 34, p.y - R); c.lineTo(p.x + 44, p.y - R); c.lineTo(p.x - 20, p.y + R); c.lineTo(p.x - 30, p.y + R); c.closePath(); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#7d7766', '#8f8875', '#a19a85', '#b1aa95']);
        for (const p of ports) {
          field(c, p.x - R, p.y - R, p.x + R, p.y + R, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 5)), 248]);
          // green slime low on the glass where the rain runs down
          field(c, p.x - R, p.y, p.x + R, p.y + R, 2, (x, y) => { const v = nz.fbm(x * 0.04 + 9, y * 0.04, 4) + ((y - p.y) / R) * 0.5; return [96, 118, 70, Math.max(0, v - 0.7) * 700]; });
          for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = r() * R; c.strokeStyle = 'rgba(240,235,220,0.45)'; c.lineWidth = 0.8; c.beginPath(); c.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 2 + r() * 5, 0, 7); c.stroke(); }
          for (let i = 0; i < 420; i++) { c.fillStyle = 'rgba(90,75,50,0.3)'; c.fillRect(p.x - R + r() * R * 2, p.y - R + r() * R * 2, 1.2, 1.2); }
          for (let i = 0; i < 12; i++) {
            const x = p.x - R * 0.8 + r() * R * 1.6, y = p.y - R * 0.7 + r() * R * 0.5, l = 20 + r() * 60;
            c.strokeStyle = `rgba(230,225,210,${0.15 + r() * 0.25})`; c.lineWidth = 1 + r() * 1.5;
            c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 4, y + l); c.stroke();
          }
        }
        // a cobweb in the top of the right one
        const wx = ports[1].x + 30, wy = ports[1].y - 44;
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.7;
        for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * 40, wy + Math.sin(a) * 40); c.stroke(); }
        for (let ring = 8; ring < 40; ring += 8) { c.beginPath(); c.arc(wx, wy, ring, 0, 7); c.stroke(); }
      },
      top(c) {
        for (const p of ports) {
          brassRim(c, p.x, p.y, R, R + RIM, 8);
          // the hinge on the outer side and a wing nut below
          const sd = p.x < W / 2 ? -1 : 1, hx = p.x + sd * (R + RIM + 1);
          const hg = c.createLinearGradient(0, p.y - 12, 0, p.y + 12);
          hg.addColorStop(0, '#f2d37e'); hg.addColorStop(1, '#9c7a2e');
          c.fillStyle = hg; rr(c, hx - 7, p.y - 12, 14, 24, 3); c.fill();
          c.fillStyle = '#8a6424'; c.fillRect(hx - 2, p.y - 12, 4, 24);
          const ny = p.y + R + RIM + 1;
          c.fillStyle = hg; rr(c, p.x - 7, ny - 7, 14, 14, 3); c.fill();
          c.fillStyle = '#d9b35a'; c.beginPath(); c.ellipse(p.x, ny + 2, 11, 4, 0, 0, 7); c.fill();
        }
      },
    };
  }

  Object.assign(SCENES.KINDS, { narrowboat, porthole });
})();
