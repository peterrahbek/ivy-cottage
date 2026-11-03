'use strict';
// Scenes for Marchbank's Curiosities: the grandfather clock, the cabinet of
// twenty little drawers, the old globe on its stand and the stone fountain
// in the walled yard. Each is a variant of an older kind, built through
// SCENES.VARIANTS, with the same layers as every other scene (see scenes.js):
//   counter { what: 'clock' }      the grandfather clock (wipe)
//   attic { where: 'curio' }       the cabinet of drawers (dust)
//   roundWindow { what: 'globe' }  the old globe (wash, indoors)
//   pond { what: 'fountain' }      the stone fountain (skim)

(() => {
  const { W, field, ramp, softShadow, inside, barnBricks } = SCENES;
  const TAU = Math.PI * 2;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const shuffle = (r, a) => { for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ------------------------------------------------------------ shared bits
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 10; ring < len; ring += 10) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
  }
  function grime(c, r, x0, y0, x1, y1, n, rgb = '70,55,40') {
    for (let i = 0; i < n; i++) {
      c.fillStyle = `rgba(${rgb},${(0.08 + r() * 0.14).toFixed(2)})`;
      c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 6 + r() * 20, 4 + r() * 12, r() * 3, 0, TAU); c.fill();
    }
  }
  // a dust bunny: a soft grey tuft
  function bunny(c, r, x, y, s) {
    for (let k = 0; k < 9; k++) {
      const v = (150 + r() * 40) | 0;
      c.fillStyle = `rgba(${v},${v - 5},${v - 10},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.6, s * 0.4, 0, TAU); c.fill();
    }
  }
  // a smudge left by a finger: an oval with faint ridges
  function fingerprint(c, x, y, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(60,45,30,0.16)'; c.beginPath(); c.ellipse(0, 0, 6, 8.5, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(60,45,30,0.18)'; c.lineWidth = 0.7;
    for (let k = 2; k < 8; k += 1.6) { c.beginPath(); c.ellipse(0, 1, k * 0.7, k, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    c.restore();
  }
  // brass, bright in the middle of a shape and dark at its edges
  function brass(c, x0, y0, x1, y1) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#8a6a26'); g.addColorStop(0.38, '#f2d88a'); g.addColorStop(0.62, '#c9952a'); g.addColorStop(1, '#6e521c');
    return g;
  }
  function star(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU - Math.PI / 2, rr = k % 2 ? s * 0.45 : s; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }
  // The shop's walls: deep green paper with a faint stripe and a little gold
  // sprig, warm near the lamp, and dark panelling under the rail. It uses the
  // noise only, so a scene can paint it again under its glass and match.
  function shopWall(c, S, x0, y0, x1, y1, lamp, rail) {
    const { nz } = S;
    const g = ramp(['#1b2c23', '#24392e', '#2e4839', '#3a5845', '#4b6b53']);
    field(c, x0, y0, x1, y1, 3, (x, y) => {
      const d = Math.hypot(x - lamp.x, y - lamp.y) / lamp.r;
      return g(U.clamp(0.92 - d * 0.7 + (nz.fbm(x * 0.012 + 40, y * 0.012, 3) - 0.5) * 0.3, 0, 1));
    });
    const top = rail ? Math.min(rail, y1) : y1;
    c.fillStyle = 'rgba(255,236,190,0.045)';
    for (let x = Math.floor(x0 / 28) * 28; x < x1; x += 28) c.fillRect(x, y0, 8, top - y0);
    c.fillStyle = 'rgba(214,180,100,0.15)';
    for (let x = Math.floor(x0 / 28) * 28 + 18; x < x1; x += 28) {
      for (let y = Math.floor(y0 / 36) * 36 + 12; y < top - 6; y += 36) { c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 2.6, y); c.lineTo(x, y + 4); c.lineTo(x - 2.6, y); c.closePath(); c.fill(); }
    }
    if (rail && rail < y1) {
      c.fillStyle = 'rgba(8,16,12,0.34)'; c.fillRect(x0, rail, x1 - x0, y1 - rail);
      for (let x = Math.floor(x0 / 84) * 84 + 12; x < x1; x += 84) {
        c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 2; c.strokeRect(x + 1.5, rail + 17.5, 60, y1 - rail - 34);
        c.strokeStyle = 'rgba(150,180,150,0.14)'; c.strokeRect(x, rail + 16, 60, y1 - rail - 34);
      }
      c.fillStyle = '#4e2e1b'; c.fillRect(x0, rail - 5, x1 - x0, 10);
      c.fillStyle = 'rgba(255,214,160,0.22)'; c.fillRect(x0, rail - 5, x1 - x0, 2);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x0, rail + 5, x1 - x0, 3);
    }
  }
  // wide old boards on the shop floor, the nearer ones a little wider, and a
  // skirting board where they meet the wall
  function boards(c, S, x0, y0, x1, y1) {
    const { nz } = S, q = U.rng(4242);
    c.fillStyle = '#4e301d'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = y0, k = 0; y < y1; k++) {
      const h = 9 + k * 2.4;
      for (let x = x0 - q() * 60; x < x1;) {
        const w = 70 + q() * 90;
        c.fillStyle = U.shade(U.pick(q, ['#8d5f3a', '#9a6a42', '#83563a', '#a3734a']), (nz.n2(x * 0.02, y * 0.05) - 0.5) * 0.12);
        c.fillRect(x + 1, y + 1, w - 2, h - 1.5);
        c.fillStyle = 'rgba(255,230,190,0.08)'; c.fillRect(x + 1, y + 1, w - 2, 1.5);
        x += w;
      }
      y += h;
    }
    c.fillStyle = '#3e2416'; c.fillRect(x0, y0 - 12, x1 - x0, 13);
    c.fillStyle = 'rgba(255,214,160,0.15)'; c.fillRect(x0, y0 - 12, x1 - x0, 2);
  }

  // -------------------------------------- MARCHBANK'S: THE GRANDFATHER CLOCK
  // A tall longcase clock in a dark corner of the shop, front on: an arched
  // hood with three brass finials, a painted moon dial behind the glass, a
  // long trunk with a little window onto the pendulum and a panelled base
  // with an inlaid fan. Years of grime to wipe off; once the little window is
  // clean, the pendulum swings. The hands rest at ten past ten.
  // counter { what: 'clock' }
  function grandfatherClock(S) {
    const { r, nz, bleed } = S;
    const CX = 180, FLOOR = 560;
    const LAMP = { x: 20, y: 90, r: 430 };
    const GLASS = { x0: 126, x1: 234, y0: 112, y1: 248 };
    const DIAL = { cx: 180, cy: 204, ar: 46, ay: 160, x0: 134, x1: 226, y1: 246, ring: 39 };
    const TRUNK = { x0: 130, x1: 230, y0: 274, y1: 452 };
    const DOOR = { x0: 144, x1: 216, y0: 298, y1: 440 };
    const LENS = { x: 180, y: 384, rx: 16, ry: 24 };
    const BASE = { x0: 112, x1: 248, y0: 470, y1: 548 };
    const KEY = { x: 206, y: 352 };
    const PIVOT = 120; // the pendulum hangs from far up inside the hood
    const outline = (p) => {
      p.moveTo(108, 568); p.lineTo(108, 558); p.lineTo(106, 558); p.lineTo(106, 548); p.lineTo(112, 548);
      p.lineTo(112, 470); p.lineTo(116, 470); p.lineTo(116, 461); p.lineTo(123, 461); p.lineTo(123, 452); p.lineTo(130, 452);
      p.lineTo(130, 274); p.lineTo(118, 274); p.lineTo(118, 268); p.lineTo(106, 268); p.lineTo(106, 262); p.lineTo(110, 262);
      p.lineTo(110, 98); p.lineTo(104, 98); p.lineTo(104, 86); p.lineTo(114.5, 86);
      p.ellipse(CX, 90, 66, 34, 0, Math.PI + 0.12, TAU - 0.12);
      p.lineTo(256, 86); p.lineTo(256, 98); p.lineTo(250, 98); p.lineTo(250, 262); p.lineTo(254, 262); p.lineTo(254, 268);
      p.lineTo(242, 268); p.lineTo(242, 274); p.lineTo(230, 274); p.lineTo(230, 452); p.lineTo(237, 452); p.lineTo(237, 461);
      p.lineTo(244, 461); p.lineTo(244, 470); p.lineTo(248, 470); p.lineTo(248, 548); p.lineTo(254, 548); p.lineTo(254, 558);
      p.lineTo(252, 558); p.lineTo(252, 568); p.lineTo(228, 568); p.lineTo(228, 558); p.lineTo(132, 558); p.lineTo(132, 568);
      p.closePath();
      return p;
    };
    const region = outline(new Path2D());
    const doorPath = new Path2D();
    doorPath.moveTo(DOOR.x0, DOOR.y1); doorPath.lineTo(DOOR.x0, DOOR.y0 + 12); doorPath.quadraticCurveTo(CX, DOOR.y0 - 14, DOOR.x1, DOOR.y0 + 12); doorPath.lineTo(DOOR.x1, DOOR.y1); doorPath.closePath();
    const plate = new Path2D();
    plate.moveTo(DIAL.x0, DIAL.y1); plate.lineTo(DIAL.x0, DIAL.ay); plate.arc(DIAL.cx, DIAL.ay, DIAL.ar, Math.PI, 0); plate.lineTo(DIAL.x1, DIAL.y1); plate.closePath();

    const wood = ramp(['#45190d', '#5a2414', '#6e301b', '#843f24', '#97502e']);
    function mahogany(c, x0, y0, x1, y1) {
      field(c, x0, y0, x1, y1, 2, (x, y) => wood(U.clamp(0.4 + (nz.fbm(x * 0.09 + 5, y * 0.012, 3) - 0.5) * 0.9, 0, 1)));
    }
    // a soft rounding across a part: dark at its sides, a sheen left of middle
    function rounding(c, x0, y0, x1, y1, a = 0.35) {
      const g = c.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, `rgba(20,6,2,${a})`); g.addColorStop(0.32, 'rgba(255,220,180,0.10)'); g.addColorStop(0.55, 'rgba(255,220,180,0)'); g.addColorStop(1, `rgba(20,6,2,${a})`);
      c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // a moulding: a lit top edge, a little sheen and a shadow under it
    function moulding(c, x0, x1, y0, y1) {
      c.fillStyle = 'rgba(255,214,170,0.24)'; c.fillRect(x0, y0, x1 - x0, 2);
      c.fillStyle = 'rgba(255,214,170,0.10)'; c.fillRect(x0, y0 + 2, x1 - x0, (y1 - y0) * 0.35);
      c.fillStyle = 'rgba(20,6,2,0.38)'; c.fillRect(x0, y1 - 2.5, x1 - x0, 2.5);
    }
    function rose(c, x, y) {
      c.fillStyle = '#8fae7a'; c.beginPath(); c.ellipse(x - 5, y + 2, 3.6, 1.8, 0.5, 0, TAU); c.ellipse(x + 5, y + 2, 3.6, 1.8, -0.5, 0, TAU); c.fill();
      dot(c, x, y, 4, '#e59aa6'); dot(c, x - 0.6, y - 0.6, 2.4, '#f2b9c2');
      c.strokeStyle = 'rgba(170,70,90,0.6)'; c.lineWidth = 0.7; c.beginPath(); c.arc(x, y, 1.6, 0, 5); c.stroke();
    }
    function hand(c, ang, len, wid) {
      c.save(); c.translate(DIAL.cx, DIAL.cy); c.rotate(ang);
      c.fillStyle = 'rgba(20,10,5,0.22)'; c.beginPath(); c.moveTo(-wid * 0.5 + 1.2, 6.2); c.lineTo(1.2, -len + 1.2); c.lineTo(wid * 0.5 + 1.2, 6.2); c.closePath(); c.fill();
      c.fillStyle = '#2b3550';
      c.beginPath(); c.moveTo(-wid * 0.45, 5); c.lineTo(-wid * 0.3, -len * 0.55); c.lineTo(-wid, -len * 0.62); c.lineTo(0, -len); c.lineTo(wid, -len * 0.62); c.lineTo(wid * 0.3, -len * 0.55); c.lineTo(wid * 0.45, 5); c.closePath(); c.fill();
      c.restore();
    }
    // the painted dial: a sleepy moon in the arch, roses in the corners
    function dial(c) {
      const { cx, cy, ar, ay, x0, x1, y1, ring } = DIAL;
      c.fillStyle = '#24130b'; c.fillRect(GLASS.x0, GLASS.y0, GLASS.x1 - GLASS.x0, GLASS.y1 - GLASS.y0);
      let g = c.createLinearGradient(x0, ay - ar, x1, y1);
      g.addColorStop(0, '#fbf3df'); g.addColorStop(1, '#e8d9b6');
      c.fillStyle = g; c.fill(plate);
      c.save(); c.beginPath(); c.arc(cx, ay, ar - 4, Math.PI, 0); c.closePath(); c.clip();
      g = c.createLinearGradient(0, ay - ar, 0, ay);
      g.addColorStop(0, '#22406e'); g.addColorStop(1, '#3d6198');
      c.fillStyle = g; c.fillRect(cx - ar, ay - ar, ar * 2, ar);
      for (const [sx, sy, s] of [[146, 142, 2.4], [158, 126, 1.8], [204, 124, 2.2], [216, 144, 1.8], [170, 119, 1.4], [192, 120, 1.4]]) star(c, sx, sy, s, '#f2d88a');
      dot(c, cx, ay - 28, 15, '#fbefc8');
      c.fillStyle = 'rgba(220,190,130,0.35)'; c.beginPath(); c.arc(cx, ay - 28, 15, -0.9, 1.6); c.arc(cx - 4, ay - 28, 13, 1.6, -0.9, true); c.fill();
      c.strokeStyle = '#8a6a40'; c.lineWidth = 1.2; c.lineCap = 'round';
      for (const ex of [cx - 5, cx + 5]) { c.beginPath(); c.arc(ex, ay - 32, 2.6, 0.25, Math.PI - 0.25); c.stroke(); }
      c.beginPath(); c.arc(cx, ay - 26, 4, 0.4, Math.PI - 0.4); c.stroke();
      dot(c, cx - 8.5, ay - 26.5, 2.2, 'rgba(236,150,140,0.55)'); dot(c, cx + 8.5, ay - 26.5, 2.2, 'rgba(236,150,140,0.55)');
      // two half worlds at the foot of the arch
      for (const hx of [cx - 30, cx + 30]) {
        c.save(); c.beginPath(); c.arc(hx, ay, 14, Math.PI, 0); c.closePath(); c.clip();
        c.fillStyle = '#9cc3d6'; c.fillRect(hx - 14, ay - 14, 28, 14);
        c.fillStyle = '#9db67a'; c.beginPath(); c.ellipse(hx - 4, ay - 5, 6, 4, 0.4, 0, TAU); c.ellipse(hx + 6, ay - 10, 4, 3, -0.3, 0, TAU); c.fill();
        c.restore();
        c.strokeStyle = '#c9a24a'; c.lineWidth = 1.2; c.beginPath(); c.arc(hx, ay, 14, Math.PI, 0); c.stroke();
      }
      c.restore();
      // a little scroll with the maker's name, under the moon
      c.fillStyle = '#f6ecd2'; c.beginPath(); c.roundRect(cx - 15, ay - 10, 30, 8, 2); c.fill();
      c.fillStyle = '#5a3a22'; c.font = 'italic 700 5.6px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('Marchbank', cx, ay - 5.8, 27);
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1.4; c.beginPath(); c.arc(cx, ay, ar - 3, Math.PI, 0); c.stroke();
      for (const [fx, fy] of [[x0 + 8, ay + 8], [x1 - 8, ay + 8], [x0 + 8, y1 - 8], [x1 - 8, y1 - 8]]) rose(c, fx, fy);
      // the chapter ring: a minute track and the hours in roman numerals
      c.strokeStyle = '#3a2c20'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(cx, cy, ring, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, ring - 4, 0, TAU); c.stroke();
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU, rin = i % 5 ? ring - 4 : ring - 6.5;
        c.lineWidth = i % 5 ? 0.7 : 1.5;
        c.beginPath(); c.moveTo(cx + Math.sin(a) * rin, cy - Math.cos(a) * rin); c.lineTo(cx + Math.sin(a) * ring, cy - Math.cos(a) * ring); c.stroke();
      }
      c.fillStyle = '#2e2218'; c.font = '700 7.4px Georgia, serif';
      ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((n, h) => {
        const a = (h / 12) * TAU;
        c.fillText(n, cx + Math.sin(a) * (ring - 12), cy - Math.cos(a) * (ring - 12) + 0.5);
      });
      for (const wx of [cx - 10, cx + 10]) { dot(c, wx, cy + 10, 3, '#c9a24a'); dot(c, wx, cy + 10, 1.9, '#1c1410'); }
      hand(c, ((10 + 10 / 60) / 12) * TAU, 20, 3.2);
      hand(c, (10 / 60) * TAU, 31, 2.2);
      dot(c, cx, cy, 2.6, '#2b3550'); dot(c, cx, cy, 1.1, '#c9a24a');
    }
    // inside the little window: the dark case and the brass pendulum bob
    function lensInside(c, a) {
      const { x, y, ry } = LENS;
      const g = c.createRadialGradient(x, y, 2, x, y, ry);
      g.addColorStop(0, '#3a2416'); g.addColorStop(1, '#140a05');
      c.fillStyle = g; c.fillRect(x - 20, y - ry - 2, 40, ry * 2 + 4);
      const L = y - PIVOT, bx = x + Math.sin(a) * L, by = PIVOT + Math.cos(a) * L;
      c.strokeStyle = '#a8862f'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x + Math.sin(a) * (L - 60), PIVOT + Math.cos(a) * (L - 60)); c.lineTo(bx, by); c.stroke();
      const bg = c.createRadialGradient(bx - 4, by - 4, 1, bx, by, 12);
      bg.addColorStop(0, '#fff3c4'); bg.addColorStop(0.35, '#e9bf4f'); bg.addColorStop(1, '#8a6a26');
      c.fillStyle = bg; c.beginPath(); c.arc(bx, by, 11, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.13)'; c.beginPath(); c.ellipse(x - 5, y - 9, 4, 10, 0.3, 0, TAU); c.fill();
    }
    function trunkDoor(c) {
      // book-matched flame veneer, like two pages of the same tree
      c.save(); c.clip(doorPath);
      field(c, DOOR.x0, DOOR.y0 - 14, DOOR.x1, DOOR.y1, 2, (x, y) => {
        const dx = Math.abs(x - CX), v = nz.fbm(dx * 0.06 + 30, y * 0.009 + dx * 0.012, 3);
        return wood(U.clamp(0.5 + (v - 0.5) * 1.2, 0, 1));
      });
      c.restore();
      c.strokeStyle = 'rgba(255,214,170,0.3)'; c.lineWidth = 1.6; c.stroke(doorPath);
      c.save(); c.translate(1.5, 1.5); c.strokeStyle = 'rgba(20,6,2,0.45)'; c.lineWidth = 1; c.stroke(doorPath); c.restore();
      c.save(); c.beginPath(); c.ellipse(LENS.x, LENS.y, LENS.rx, LENS.ry, 0, 0, TAU); c.clip(); lensInside(c, 0); c.restore();
      c.strokeStyle = brass(c, LENS.x - LENS.rx, 0, LENS.x + LENS.rx, 0); c.lineWidth = 4;
      c.beginPath(); c.ellipse(LENS.x, LENS.y, LENS.rx + 2, LENS.ry + 2, 0, 0, TAU); c.stroke();
      c.fillStyle = brass(c, KEY.x - 5, 0, KEY.x + 5, 0); c.beginPath(); c.ellipse(KEY.x, KEY.y, 5, 7.5, 0, 0, TAU); c.fill();
      c.fillStyle = '#1c1410'; c.beginPath(); c.arc(KEY.x, KEY.y - 1.5, 1.6, 0, TAU); c.fill(); c.fillRect(KEY.x - 0.8, KEY.y - 1, 1.6, 4.5);
    }
    function basePanel(c) {
      const x0 = 126, x1 = 234, y0 = 482, y1 = 536;
      c.fillStyle = 'rgba(20,6,2,0.3)'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.save(); c.beginPath(); c.rect(x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6); c.clip();
      field(c, x0, y0, x1, y1, 2, (x, y) => wood(U.clamp(0.55 + (nz.fbm(Math.abs(x - CX) * 0.05 + 70, y * 0.02, 3) - 0.5), 0, 1)));
      // an inlaid fan of pale wood
      const fx = CX, fy = y1 - 5, fr = 32;
      for (let k = 0; k < 9; k++) {
        c.fillStyle = k % 2 ? '#ead2a0' : '#d4b27a';
        c.beginPath(); c.moveTo(fx, fy); c.arc(fx, fy, fr, Math.PI + (k / 9) * Math.PI, Math.PI + ((k + 1) / 9) * Math.PI); c.closePath(); c.fill();
      }
      c.strokeStyle = 'rgba(110,60,25,0.55)'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(fx, fy, fr, Math.PI, TAU); c.stroke(); c.beginPath(); c.arc(fx, fy, 6, Math.PI, TAU); c.stroke();
      c.restore();
      c.strokeStyle = 'rgba(255,214,170,0.26)'; c.lineWidth = 1.5; c.strokeRect(x0 + 1.5, y0 + 1.5, x1 - x0 - 3, y1 - y0 - 3);
    }
    // a carved shell in the arch of the hood
    function carvedShell(c, x, y) {
      for (let k = 0; k < 7; k++) {
        c.fillStyle = k % 2 ? '#a35c35' : '#8a4526';
        c.beginPath(); c.moveTo(x, y + 6); c.arc(x, y + 6, 16, Math.PI + (k / 7) * Math.PI, Math.PI + ((k + 1) / 7) * Math.PI); c.closePath(); c.fill();
      }
      c.strokeStyle = 'rgba(255,214,170,0.3)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y + 6, 16, Math.PI, TAU); c.stroke();
      dot(c, x, y + 6, 3, '#6e301b');
    }
    function finial(c, x, baseY, k) {
      c.fillStyle = '#4a1d0f'; c.fillRect(x - 6 * k, baseY - 6 * k, 12 * k, 6 * k);
      c.fillStyle = 'rgba(255,214,170,0.2)'; c.fillRect(x - 6 * k, baseY - 6 * k, 12 * k, 1.5);
      const by = baseY - 6 * k - 7 * k;
      const g = c.createRadialGradient(x - 2.5 * k, by - 2.5 * k, 0.5, x, by, 7.5 * k);
      g.addColorStop(0, '#fff3c4'); g.addColorStop(0.4, '#d9ad45'); g.addColorStop(1, '#7a5a1e');
      c.fillStyle = g; c.beginPath(); c.arc(x, by, 7 * k, 0, TAU); c.fill();
      c.fillStyle = '#c9952a'; c.beginPath(); c.moveTo(x - 3 * k, by - 6 * k); c.quadraticCurveTo(x - 2 * k, by - 13 * k, x, by - 18 * k); c.quadraticCurveTo(x + 2 * k, by - 13 * k, x + 3 * k, by - 6 * k); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,250,220,0.5)'; c.fillRect(x - 1 * k, by - 14 * k, 1, 6 * k);
    }

    return {
      family: 'wipe', particle: 'suds', region,
      tough: (x, y) => (nz.fbm(x * 0.05 + 3, y * 0.05, 4) > 0.62 || [86, 262, 452, 548].some((m) => Math.abs(y - m) < 8) ? 1.45 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        shopWall(c, S, x0, y0, x1, FLOOR, LAMP, 400);
        boards(c, S, x0, FLOOR, x1, y1);
        // the corner of an old red rug
        c.fillStyle = '#7a2a2a'; c.beginPath(); c.moveTo(40, 574); c.lineTo(330, 574); c.lineTo(350, y1); c.lineTo(20, y1); c.closePath(); c.fill();
        c.strokeStyle = '#d9b36a'; c.lineWidth = 2; c.beginPath(); c.moveTo(50, 580); c.lineTo(320, 580); c.stroke();
        for (let x = 60; x < 320; x += 16) { c.fillStyle = '#e9cf9a'; c.beginPath(); c.moveTo(x, 586); c.lineTo(x + 5, 591); c.lineTo(x, 596); c.lineTo(x - 5, 591); c.closePath(); c.fill(); }
        // a cat's silhouette in an oval frame, on the right
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(306, 192, 30, 38, 0, 0, TAU); c.fill();
        c.fillStyle = brass(c, 272, 150, 332, 230); c.beginPath(); c.ellipse(302, 188, 30, 38, 0, 0, TAU); c.fill();
        c.fillStyle = '#f2e8d2'; c.beginPath(); c.ellipse(302, 188, 23, 31, 0, 0, TAU); c.fill();
        c.fillStyle = '#1f1a17';
        c.beginPath(); c.ellipse(304, 202, 11, 13, 0, 0, TAU); c.fill();
        c.beginPath(); c.arc(300, 182, 7.5, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(294, 178); c.lineTo(294, 168); c.lineTo(299, 175); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(304, 175); c.lineTo(308, 167); c.lineTo(307.5, 178); c.closePath(); c.fill();
        c.strokeStyle = '#1f1a17'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(314, 210); c.quadraticCurveTo(324, 206, 318, 194); c.stroke();
        // a little shelf on the left with two brass candlesticks and a bell
        c.fillStyle = '#5a3520'; c.fillRect(14, 238, 82, 7); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(14, 245, 82, 4);
        c.fillStyle = '#4a2b18'; c.beginPath(); c.moveTo(22, 245); c.lineTo(30, 245); c.lineTo(22, 262); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(88, 245); c.lineTo(80, 245); c.lineTo(88, 262); c.closePath(); c.fill();
        for (const sx of [28, 50]) {
          c.fillStyle = brass(c, sx - 7, 0, sx + 7, 0); c.fillRect(sx - 7, 234, 14, 4); c.fillRect(sx - 2, 210, 4, 24); c.fillRect(sx - 5, 207, 10, 4);
          c.fillStyle = '#f4ead2'; c.fillRect(sx - 2.5, 186, 5, 21);
        }
        c.fillStyle = brass(c, 66, 0, 86, 0); c.beginPath(); c.moveTo(68, 238); c.quadraticCurveTo(68, 216, 76, 214); c.quadraticCurveTo(84, 216, 84, 238); c.closePath(); c.fill();
        dot(c, 76, 211, 2.4, '#c9952a');
        // an umbrella stand by the clock, with an umbrella and a walking stick
        c.strokeStyle = '#5a3520'; c.lineWidth = 3; c.beginPath(); c.moveTo(64, 480); c.lineTo(68, 412); c.arc(76, 412, 8, Math.PI, 0); c.stroke();
        c.fillStyle = '#7a2a2a'; c.beginPath(); c.moveTo(46, 486); c.lineTo(52, 420); c.lineTo(58, 486); c.closePath(); c.fill();
        c.strokeStyle = '#2b2a33'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(52, 422); c.lineTo(52, 404); c.arc(46, 404, 6, 0, Math.PI, true); c.stroke();
        c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(58, 560, 28, 5, 0, 0, TAU); c.fill();
        const ug = c.createLinearGradient(32, 0, 84, 0);
        ug.addColorStop(0, '#9fb6c9'); ug.addColorStop(0.4, '#f2f2ee'); ug.addColorStop(1, '#8aa1b6');
        c.fillStyle = ug; c.beginPath(); c.moveTo(34, 478); c.lineTo(82, 478); c.lineTo(80, 558); c.lineTo(36, 558); c.closePath(); c.fill();
        c.strokeStyle = '#3d5a86'; c.lineWidth = 1.6;
        for (const y of [490, 548]) { c.beginPath(); c.moveTo(35, y); c.lineTo(81, y); c.stroke(); }
        c.beginPath(); c.moveTo(42, 512); c.quadraticCurveTo(50, 500, 58, 512); c.quadraticCurveTo(66, 524, 74, 512); c.stroke();
        dot(c, 50, 528, 3, '#3d5a86'); dot(c, 66, 530, 3, '#3d5a86');
        // a pile of books on the floor, on the right
        for (const [y, w, col] of [[546, 62, '#7a2a2a'], [534, 56, '#3f5e4b'], [523, 50, '#c9952a']]) {
          c.fillStyle = col; c.fillRect(306 - w / 2, y, w, 12); c.fillStyle = 'rgba(255,240,200,0.5)'; c.fillRect(306 - w / 2 + 4, y + 3, w - 8, 1.4);
        }
        softShadow(c, region, 16, 0.5, 9, 6);
      },
      clean(c) {
        mahogany(c, 100, 50, 260, 572);
        // the arched top, its cornice and a carved shell
        rounding(c, 104, 50, 256, 98, 0.22);
        carvedShell(c, CX, 66);
        c.strokeStyle = 'rgba(255,214,170,0.22)'; c.lineWidth = 2; c.beginPath(); c.ellipse(CX, 90, 63, 31, 0, Math.PI + 0.2, TAU - 0.2); c.stroke();
        moulding(c, 104, 256, 86, 98);
        // the hood: turned pillars either side of the glazed door
        for (const px of [112, 240]) {
          c.fillStyle = '#9a5631'; c.fillRect(px, 106, 8, 148);
          c.fillStyle = 'rgba(255,220,180,0.25)'; c.fillRect(px + 1.5, 106, 2, 148);
          c.fillStyle = 'rgba(20,6,2,0.35)'; c.fillRect(px + 6, 106, 2, 148);
          c.fillStyle = brass(c, px - 1, 0, px + 9, 0); c.fillRect(px - 1, 99, 10, 7); c.fillRect(px - 1, 253, 10, 8);
        }
        c.fillStyle = '#5a2414'; c.fillRect(GLASS.x0 - 6, GLASS.y0 - 6, GLASS.x1 - GLASS.x0 + 12, GLASS.y1 - GLASS.y0 + 12);
        c.fillStyle = 'rgba(255,214,170,0.2)'; c.fillRect(GLASS.x0 - 6, GLASS.y0 - 6, GLASS.x1 - GLASS.x0 + 12, 2);
        dial(c);
        moulding(c, 106, 254, 262, 268); moulding(c, 118, 242, 268, 274);
        // the trunk, its door and the little window onto the pendulum
        rounding(c, TRUNK.x0, TRUNK.y0, TRUNK.x1, TRUNK.y1);
        trunkDoor(c);
        // the base
        moulding(c, 123, 237, 452, 461); moulding(c, 116, 244, 461, 470);
        rounding(c, BASE.x0, BASE.y0, BASE.x1, BASE.y1);
        basePanel(c);
        moulding(c, 106, 254, 548, 558);
        for (const fx of [108, 228]) { c.fillStyle = '#4a1d0f'; c.fillRect(fx, 558, 24, 10); c.fillStyle = 'rgba(255,214,170,0.16)'; c.fillRect(fx, 558, 24, 2); }
      },
      cleanOver(c) {
        // the glass in the hood door catches the lamp
        c.save(); c.beginPath(); c.rect(GLASS.x0, GLASS.y0, GLASS.x1 - GLASS.x0, GLASS.y1 - GLASS.y0); c.clip();
        c.fillStyle = 'rgba(255,255,255,0.13)'; c.beginPath(); c.moveTo(GLASS.x0 + 22, GLASS.y0); c.lineTo(GLASS.x0 + 46, GLASS.y0); c.lineTo(GLASS.x0 - 8, GLASS.y1); c.lineTo(GLASS.x0 - 32, GLASS.y1); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.07)'; c.beginPath(); c.moveTo(GLASS.x0 + 54, GLASS.y0); c.lineTo(GLASS.x0 + 62, GLASS.y0); c.lineTo(GLASS.x0 + 8, GLASS.y1); c.lineTo(GLASS.x0, GLASS.y1); c.fill();
        c.restore();
        c.fillStyle = 'rgba(255,225,190,0.12)'; c.fillRect(134, 280, 3, 160); c.fillRect(116, 476, 3, 66);
      },
      live(c, t) {
        // a slow pendulum: one swing a second
        c.save(); c.beginPath(); c.ellipse(LENS.x, LENS.y, LENS.rx, LENS.ry, 0, 0, TAU); c.clip();
        lensInside(c, Math.sin(t * Math.PI) * 0.045);
        c.restore();
      },
      dirt(c) {
        // a dull film of dust and old polish over the whole case
        const g = ramp(['#3f3128', '#4f3f33', '#605042', '#726252']);
        field(c, 100, 50, 260, 572, 2, (x, y) => [...g(nz.fbm(x * 0.03 + 9, y * 0.03, 5)), 238]);
        // the glass in the hood and over the pendulum: a pale haze
        const hz = ramp(['#948d7e', '#a59e8e', '#b7b0a0']);
        field(c, GLASS.x0, GLASS.y0, GLASS.x1, GLASS.y1, 2, (x, y) => [...hz(nz.fbm(x * 0.04, y * 0.04 + 7, 4)), 232]);
        c.fillStyle = 'rgba(168,160,146,0.8)'; c.beginPath(); c.ellipse(LENS.x, LENS.y, LENS.rx, LENS.ry, 0, 0, TAU); c.fill();
        // the clock still shows faintly through: dial, doors and panel
        c.fillStyle = 'rgba(236,226,206,0.2)'; c.fill(plate);
        c.strokeStyle = 'rgba(40,28,18,0.4)'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(DIAL.cx, DIAL.cy, DIAL.ring, 0, TAU); c.stroke();
        c.strokeRect(GLASS.x0 - 3, GLASS.y0 - 3, GLASS.x1 - GLASS.x0 + 6, GLASS.y1 - GLASS.y0 + 6);
        c.stroke(doorPath); c.strokeRect(126, 482, 108, 54);
        c.beginPath(); c.ellipse(LENS.x, LENS.y, LENS.rx + 2, LENS.ry + 2, 0, 0, TAU); c.stroke();
        // dust lies thick on every ledge
        for (const [x0, x1, y] of [[104, 256, 86], [106, 254, 262], [118, 242, 268], [123, 237, 452], [116, 244, 461], [106, 254, 548]]) {
          c.fillStyle = 'rgba(196,188,172,0.62)'; c.fillRect(x0, y - 1, x1 - x0, 5);
          for (let i = 0; i < (x1 - x0) / 16; i++) bunny(c, r, x0 + 4 + r() * (x1 - x0 - 8), y + 1, 4 + r() * 4);
        }
        c.fillStyle = 'rgba(196,188,172,0.5)'; c.beginPath(); c.ellipse(CX, 90, 66, 34, 0, Math.PI + 0.3, TAU - 0.3); c.lineTo(CX + 50, 84); c.ellipse(CX, 92, 54, 26, 0, TAU - 0.3, Math.PI + 0.3, true); c.closePath(); c.fill();
        // grime where hands opened the doors, scuffs low on the base
        grime(c, r, 112, 98, 250, 262, 8, '90,75,60');
        grime(c, r, 130, 280, 230, 450, 16);
        grime(c, r, 112, 500, 248, 566, 14, '50,38,26');
        for (const [x, y, a] of [[236, 176, 0.3], [238, 198, -0.2], [214, 344, 0.5], [212, 368, 0.1], [150, 312, -0.4]]) fingerprint(c, x, y, a);
        // old polish that ran and dried down the trunk
        c.lineCap = 'round';
        for (let i = 0; i < 30; i++) {
          const x = 132 + r() * 96, y = 276 + r() * 120, l = 16 + r() * 70;
          c.strokeStyle = `rgba(60,46,34,${(0.16 + r() * 0.18).toFixed(2)})`; c.lineWidth = 1 + r() * 2.2;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, Math.min(448, y + l)); c.stroke();
        }
        for (let i = 0; i < 500; i++) { c.fillStyle = 'rgba(200,192,176,0.35)'; c.fillRect(104 + r() * 152, 56 + r() * 510, 1.2, 1.2); }
        cobweb(c, 110, 98, 0, 44); cobweb(c, 250, 98, Math.PI / 2, 40);
        cobweb(c, 130, 274, 0, 30); cobweb(c, 230, 274, Math.PI / 2, 30);
        cobweb(c, 112, 548, -Math.PI / 2, 34);
      },
      top(c) {
        // the three brass finials
        finial(c, CX, 57, 1); finial(c, 109, 86, 0.82); finial(c, 251, 86, 0.82);
        // a key left in the trunk door, with a faded silk tassel
        c.strokeStyle = '#6f8f5a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(KEY.x, KEY.y + 6); c.quadraticCurveTo(KEY.x + 3, KEY.y + 16, KEY.x + 1, KEY.y + 22); c.stroke();
        c.fillStyle = '#6f8f5a'; c.beginPath(); c.moveTo(KEY.x - 2, KEY.y + 22); c.lineTo(KEY.x + 4, KEY.y + 22); c.lineTo(KEY.x + 6, KEY.y + 36); c.lineTo(KEY.x - 4, KEY.y + 36); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(40,60,30,0.5)'; c.lineWidth = 0.6; for (let k = -3; k <= 5; k += 2) { c.beginPath(); c.moveTo(KEY.x + k * 0.6, KEY.y + 24); c.lineTo(KEY.x + k, KEY.y + 36); c.stroke(); }
        c.fillStyle = '#c9952a'; c.fillRect(KEY.x - 1.5, KEY.y - 2, 3, 6);
        c.strokeStyle = brass(c, KEY.x - 7, 0, KEY.x + 7, 0); c.lineWidth = 2.6; c.beginPath(); c.ellipse(KEY.x, KEY.y - 7, 5.5, 4.4, 0, 0, TAU); c.stroke();
      },
    };
  }

  // ---------------------------------- MARCHBANK'S: THE CABINET OF DRAWERS
  // A collector's cabinet of twenty little drawers, four across and five
  // down, each with a brass cup handle and a card in a brass frame saying
  // what is inside. Curiosities stand on top, and one drawer is a little
  // open. Thick dust to dust off. attic { where: 'curio' }
  function curioCabinet(S) {
    const { r, nz, bleed } = S;
    const X0 = 34, X1 = 326, CT = 94, TOP = 114, BOT = 532, FLOOR = 566;
    const LAMP = { x: 300, y: 40, r: 470 };
    const COLS = 4, ROWS = 5, GX0 = 46, GX1 = 314, GY0 = 124, GY1 = 522;
    const cw = (GX1 - GX0) / COLS, ch = (GY1 - GY0) / ROWS;
    const NAMES = ['KEYS', 'SHELLS', 'BUTTONS', 'STAMPS', 'MAPS', 'FEATHERS', 'COINS', 'MARBLES', 'SEEDS', 'STARS', 'BELLS', 'THIMBLES', 'STONES', 'TICKETS', 'LETTERS', 'SPOONS', 'CORKS', 'COGS', 'RIBBONS', 'SECRETS'];
    const names = shuffle(r, NAMES.slice());
    // one drawer stands a little open, low enough to see into
    const openName = U.pick(r, ['MARBLES', 'RIBBONS', 'FEATHERS', 'BUTTONS', 'SHELLS', 'KEYS']), openAt = 8 + ((r() * 8) | 0);
    const from = names.indexOf(openName); [names[from], names[openAt]] = [names[openAt], names[from]];
    const drawers = [];
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const k = i * COLS + j;
        drawers.push({ x: GX0 + j * cw + 4, y: GY0 + i * ch + 4, w: cw - 8, h: ch - 8, name: names[k], open: k === openAt, seed: k * 13.7 });
      }
    }
    const open = drawers[openAt], DROP = 10;
    const jar = (p) => { p.moveTo(138, CT); p.lineTo(138, 86); p.lineTo(143, 86); p.lineTo(143, 58); p.ellipse(167, 58, 24, 28, 0, Math.PI, TAU); p.lineTo(191, 86); p.lineTo(196, 86); p.lineTo(196, CT); p.closePath(); return p; };
    const CANDLE = [[222, CT], [222, 88], [231, 86], [233, 60], [227, 58], [227, 54], [232, 54], [232, 26], [242, 26], [242, 54], [247, 54], [247, 58], [241, 60], [243, 86], [252, 88], [252, CT]];
    const candle = (p) => { p.moveTo(CANDLE[0][0], CANDLE[0][1]); for (const q of CANDLE.slice(1)) p.lineTo(q[0], q[1]); p.closePath(); return p; };
    const shell = (p) => {
      p.moveTo(262, 86); p.quadraticCurveTo(272, 72, 296, 68); p.bezierCurveTo(312, 66, 324, 72, 324, 82);
      p.quadraticCurveTo(324, 91, 314, CT); p.lineTo(282, CT); p.quadraticCurveTo(268, 92, 262, 86); p.closePath();
      return p;
    };
    const region = new Path2D();
    region.moveTo(26, CT); region.lineTo(334, CT); region.lineTo(334, TOP); region.lineTo(X1, TOP); region.lineTo(X1, BOT); region.lineTo(332, BOT);
    region.lineTo(332, 552); region.lineTo(28, 552); region.lineTo(28, BOT); region.lineTo(X0, BOT); region.lineTo(X0, TOP); region.lineTo(26, TOP); region.closePath();
    // the curiosities standing on top
    region.rect(58, 66, 62, 28);
    jar(region); candle(region);
    shell(region);
    const jarPath = jar(new Path2D()), shellPath = shell(new Path2D());

    const wal = ramp(['#45271a', '#583322', '#6b402a', '#7e4f34', '#915f3f']);
    function front(c, d, oy) {
      const x = d.x, y = d.y + oy, w = d.w, h = d.h;
      field(c, x, y, x + w, y + h, 2, (px, py) => wal(U.clamp(0.55 + (nz.fbm(px * 0.012 + d.seed, py * 0.09 + d.seed, 3) - 0.5) * 0.8, 0, 1)));
      c.fillStyle = 'rgba(255,220,180,0.2)'; c.fillRect(x, y, w, 2.5); c.fillRect(x, y, 2.5, h);
      c.fillStyle = 'rgba(20,8,2,0.4)'; c.fillRect(x, y + h - 3, w, 3); c.fillRect(x + w - 3, y, 3, h);
      c.strokeStyle = 'rgba(20,8,2,0.22)'; c.lineWidth = 1; c.strokeRect(x + 6.5, y + 6.5, w - 13, h - 13);
      // the card in its brass frame
      const lx = x + w / 2, ly = y + 21;
      c.fillStyle = brass(c, lx - 22, ly - 8, lx + 22, ly + 8); c.beginPath(); c.roundRect(lx - 22, ly - 8.5, 44, 17, 2); c.fill();
      c.fillStyle = '#f7eedb'; c.fillRect(lx - 19, ly - 6, 38, 12);
      c.fillStyle = '#4a3324'; c.font = '800 7px ui-rounded, "SF Pro Rounded", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(d.name, lx, ly + 0.5, 35);
      dot(c, lx - 20.5, ly, 1, '#6e521c'); dot(c, lx + 20.5, ly, 1, '#6e521c');
      // the brass cup handle
      const hy = y + h - 22;
      c.fillStyle = 'rgba(20,8,2,0.35)'; c.beginPath(); c.ellipse(lx + 1.5, hy + 8, 16, 5, 0, 0, TAU); c.fill();
      c.fillStyle = brass(c, lx - 17, hy - 6, lx + 17, hy + 8);
      c.beginPath(); c.moveTo(lx - 17, hy - 4); c.lineTo(lx + 17, hy - 4); c.quadraticCurveTo(lx + 15, hy + 9, lx, hy + 9); c.quadraticCurveTo(lx - 15, hy + 9, lx - 17, hy - 4); c.closePath(); c.fill();
      c.fillStyle = 'rgba(40,25,10,0.55)'; c.beginPath(); c.ellipse(lx, hy - 3, 14, 2.4, 0, 0, TAU); c.fill();
      for (const sx of [lx - 19.5, lx + 19.5]) { dot(c, sx, hy - 4, 2.4, '#b8892a'); dot(c, sx, hy - 4, 1, '#6e521c'); }
      c.fillStyle = 'rgba(255,250,220,0.55)'; c.fillRect(lx - 9, hy + 1, 6, 1.5);
    }
    // what shows in the open drawer
    function peek(c, d) {
      const x = d.x, y = d.y, w = d.w;
      c.save(); c.beginPath(); c.rect(x + 1, y, w - 2, DROP + 1); c.clip();
      c.fillStyle = '#6e4a2e'; c.fillRect(x, y, w, DROP + 1);
      const q = U.rng(d.seed * 100 + 7);
      if (d.name === 'MARBLES') {
        for (let k = 0; k < 9; k++) { const mx = x + 6 + k * 6.3 + q() * 2, my = y + 6 + q() * 3; dot(c, mx, my, 3.2, U.pick(q, ['#5f8fbf', '#d9534f', '#6fb3b3', '#e9b23c', '#9a72b0'])); dot(c, mx - 1, my - 1, 1, 'rgba(255,255,255,0.8)'); }
      } else if (d.name === 'BUTTONS') {
        for (let k = 0; k < 8; k++) { const bx = x + 7 + k * 7 + q() * 2, by = y + 6 + q() * 3; dot(c, bx, by, 3.4, U.pick(q, ['#efb4ae', '#a6d3d4', '#f2d88a', '#c9474f'])); dot(c, bx - 0.9, by, 0.6, '#3b352e'); dot(c, bx + 0.9, by, 0.6, '#3b352e'); }
      } else if (d.name === 'SHELLS') {
        for (let k = 0; k < 7; k++) {
          const sx = x + 8 + k * 8 + q() * 2, sy = y + 9;
          c.fillStyle = U.pick(q, ['#f6e3d0', '#efc2b0', '#f2dcc0']); c.beginPath(); c.moveTo(sx, sy); c.arc(sx, sy, 4.5, Math.PI * 1.1, Math.PI * 1.9); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(150,90,70,0.5)'; c.lineWidth = 0.5; for (let j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + j * 1.6, sy - 4); c.stroke(); }
        }
      } else {
        // a velvet lining
        c.fillStyle = '#7a2a3a'; c.fillRect(x + 3, y, w - 6, DROP + 1);
        c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 3, y + 2, w - 6, 2);
      }
      c.restore();
      c.fillStyle = '#c89a6a'; c.fillRect(x + 1, y, 3, DROP); c.fillRect(x + w - 4, y, 3, DROP);
    }
    // what hangs out of the open drawer, over its front
    function spill(c, d) {
      const x = d.x, y = d.y + DROP, w = d.w;
      if (d.name === 'RIBBONS') {
        c.fillStyle = '#d9707e';
        c.beginPath(); c.moveTo(x + w * 0.62, y - 2); c.bezierCurveTo(x + w * 0.66, y + 20, x + w * 0.5, y + 34, x + w * 0.58, y + 52); c.lineTo(x + w * 0.66, y + 50); c.lineTo(x + w * 0.7, y + 56);
        c.bezierCurveTo(x + w * 0.62, y + 36, x + w * 0.8, y + 20, x + w * 0.74, y - 2); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x + w * 0.64, y + 2, 2, 14);
      } else if (d.name === 'FEATHERS') {
        c.save(); c.translate(x + w * 0.72, y - 4); c.rotate(0.35);
        c.strokeStyle = '#f2ece0'; c.lineWidth = 1;
        for (let k = 0; k < 16; k++) { c.beginPath(); c.moveTo(0, -k * 2.4); c.lineTo(-6 + k * 0.2, -k * 2.4 - 5); c.moveTo(0, -k * 2.4); c.lineTo(6 - k * 0.2, -k * 2.4 - 5); c.stroke(); }
        c.strokeStyle = '#c9b89c'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -40); c.stroke();
        c.restore();
      } else if (d.name === 'KEYS') {
        c.strokeStyle = '#3f5e4b'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + w * 0.3, y - 2); c.quadraticCurveTo(x + w * 0.26, y + 14, x + w * 0.3, y + 24); c.stroke();
        c.strokeStyle = brass(c, x + w * 0.24, 0, x + w * 0.36, 0); c.lineWidth = 2.2; c.beginPath(); c.arc(x + w * 0.3, y + 28, 4, 0, TAU); c.stroke();
        c.fillStyle = '#c9952a'; c.fillRect(x + w * 0.3 - 1.2, y + 32, 2.4, 12); c.fillRect(x + w * 0.3, y + 40, 4, 2); c.fillRect(x + w * 0.3, y + 36, 3, 2);
      }
    }
    // the curiosities on top: two old books, a bell jar, a candlestick, a shell
    function curiosities(c) {
      for (const [y, col, band] of [[80, '#7a2a2a', '#d9b36a'], [66, '#3f5e4b', '#e9cf9a']]) {
        c.fillStyle = col; c.fillRect(58, y, 62, 14);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(58, y, 62, 2);
        c.fillStyle = band; for (const bx of [64, 112]) c.fillRect(bx, y + 1, 2, 12);
        c.fillStyle = '#f2e6c8'; c.fillRect(76, y + 4, 26, 6);
        c.fillStyle = 'rgba(80,60,40,0.6)'; c.fillRect(80, y + 6.5, 18, 1);
      }
      // under the glass: the wall behind, a mossy stone, a fern and a toadstool
      c.save(); c.clip(jarPath);
      shopWall(c, S, bleed.x0, bleed.y0, bleed.x1, FLOOR, LAMP, 470);
      c.fillStyle = '#5d3a24'; c.fillRect(138, 86, 58, 8); c.fillStyle = 'rgba(255,220,180,0.2)'; c.fillRect(138, 86, 58, 1.5);
      c.fillStyle = '#6f8f4a'; c.beginPath(); c.ellipse(167, 86, 22, 8, 0, Math.PI, TAU); c.fill();
      c.strokeStyle = '#4f7a3a'; c.lineWidth = 1.4;
      for (const a of [-1.2, -0.8, -0.4]) { c.beginPath(); c.moveTo(160, 84); c.quadraticCurveTo(160 + Math.cos(a - 1) * 12, 84 + Math.sin(a - 1) * 16, 160 + Math.cos(a) * 20 - 18, 84 + Math.sin(a) * 26); c.stroke(); }
      c.fillStyle = '#efe6d4'; c.fillRect(175, 72, 3, 12);
      c.fillStyle = '#c9474f'; c.beginPath(); c.ellipse(176.5, 72, 8, 5.5, 0, Math.PI, TAU); c.fill();
      dot(c, 173, 69.5, 1.1, '#fff'); dot(c, 179, 68.5, 1, '#fff');
      c.fillStyle = 'rgba(220,240,240,0.13)'; c.fill(jarPath);
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(150, 82); c.lineTo(150, 58); c.ellipse(167, 58, 17, 21, 0, Math.PI, Math.PI * 1.35); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1; c.stroke(jarPath);
      // the candlestick
      c.fillStyle = brass(c, 222, 0, 252, 0);
      c.beginPath(); c.moveTo(222, CT); c.lineTo(222, 88); c.lineTo(231, 86); c.lineTo(233, 60); c.lineTo(227, 58); c.lineTo(227, 54); c.lineTo(247, 54); c.lineTo(247, 58); c.lineTo(241, 60); c.lineTo(243, 86); c.lineTo(252, 88); c.lineTo(252, CT); c.closePath(); c.fill();
      c.fillStyle = '#f4ead2'; c.fillRect(232, 26, 10, 28);
      c.fillStyle = 'rgba(200,180,140,0.5)'; c.fillRect(239, 26, 3, 28);
      c.fillStyle = '#f4ead2'; c.beginPath(); c.ellipse(234, 34, 2, 5, 0, 0, TAU); c.fill();
      c.strokeStyle = '#3b352e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(237, 26); c.lineTo(237, 21); c.stroke();
      // a big spiral shell, its pink mouth to the right
      const sg = c.createLinearGradient(262, 68, 300, 96);
      sg.addColorStop(0, '#f6e6d4'); sg.addColorStop(0.6, '#eecbb4'); sg.addColorStop(1, '#d9a184');
      c.fillStyle = sg; c.fill(shellPath);
      c.save(); c.clip(shellPath);
      c.strokeStyle = 'rgba(160,96,70,0.5)'; c.lineWidth = 1.1;
      for (let k = 0; k < 6; k++) { const x = 300 - k * 6.5; c.beginPath(); c.moveTo(x + 3, 68); c.quadraticCurveTo(x - 5, 82, x + 2, 96); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(288, 73, 14, 2.4, -0.1, 0, TAU); c.fill();
      c.restore();
      for (let k = 0; k < 5; k++) { c.fillStyle = '#e8c6ac'; c.beginPath(); c.moveTo(276 + k * 6, 72 - k * 0.6); c.lineTo(279 + k * 6, 64 - k * 0.6); c.lineTo(282 + k * 6, 71 - k * 0.6); c.closePath(); c.fill(); }
      c.fillStyle = '#f0a59c'; c.beginPath(); c.ellipse(312, 83, 9.5, 8.5, 0.2, 0, TAU); c.fill();
      c.fillStyle = '#d97b74'; c.beginPath(); c.ellipse(314, 84, 5, 4.6, 0.2, 0, TAU); c.fill();
    }

    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 50 || x > 310 || y < TOP + 6 || y > BOT - 4 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        shopWall(c, S, x0, y0, x1, FLOOR, LAMP, 470);
        boards(c, S, x0, FLOOR, x1, y1);
        for (const fx of [46, 314]) { c.fillStyle = '#3f2314'; c.beginPath(); c.ellipse(fx, 559, 14, 7.5, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,220,180,0.15)'; c.beginPath(); c.ellipse(fx - 3, 556, 6, 2.4, 0, 0, TAU); c.fill(); }
        softShadow(c, region, 14, 0.45, -5, 6);
      },
      clean(c) {
        // the walnut carcass and its fine upright grain
        field(c, 20, 20, 340, 556, 2, (x, y) => wal(U.clamp(0.4 + (nz.fbm(x * 0.07 + 3, y * 0.012, 3) - 0.5) * 0.9, 0, 1)));
        // the cornice, with a little brass plate in the middle
        c.fillStyle = 'rgba(255,214,170,0.24)'; c.fillRect(26, CT, 308, 2.5);
        c.fillStyle = 'rgba(255,214,170,0.1)'; c.fillRect(26, CT + 3, 308, 6);
        c.fillStyle = 'rgba(20,8,2,0.35)'; c.fillRect(26, TOP - 4, 308, 4); c.fillRect(X0, TOP, X1 - X0, 3);
        c.fillStyle = brass(c, 136, 98, 224, 110); c.beginPath(); c.roundRect(136, 97, 88, 13, 2); c.fill();
        c.fillStyle = '#5a3f16'; c.font = '800 5.8px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('MARCHBANK & DAUGHTER', 180, 103.8, 82);
        // the plinth
        c.fillStyle = 'rgba(255,214,170,0.22)'; c.fillRect(28, BOT, 304, 2.5);
        c.fillStyle = 'rgba(20,8,2,0.35)'; c.fillRect(28, 549, 304, 3);
        // shadows in the gaps round every drawer
        c.fillStyle = 'rgba(20,8,2,0.5)';
        for (const d of drawers) c.fillRect(d.x - 2, d.y - 2, d.w + 4, d.h + 4);
        for (const d of drawers) if (!d.open) front(c, d, 0);
        // the open drawer last, over the one below it
        c.fillStyle = '#1f120a'; c.fillRect(open.x - 1, open.y - 1, open.w + 2, open.h + 2);
        peek(c, open);
        c.fillStyle = 'rgba(20,8,2,0.45)'; c.fillRect(open.x - 2, open.y + open.h + DROP - 1, open.w + 4, 6);
        front(c, open, DROP);
        spill(c, open);
        curiosities(c);
      },
      liveTop(c, t) {
        // a slant of lamplight with dust drifting in it
        c.save();
        c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(0, -20, 0, 540);
        g.addColorStop(0, 'rgba(255,236,190,0.06)'); g.addColorStop(1, 'rgba(255,236,190,0)');
        c.fillStyle = g;
        for (const k of [1, 0.78, 0.56]) { c.beginPath(); c.moveTo(300 - 45 * k, -20); c.lineTo(300 + 45 * k, -20); c.lineTo(130 + 70 * k, 540); c.lineTo(130 - 70 * k, 540); c.closePath(); c.fill(); }
        for (let i = 0; i < 22; i++) {
          const ph = i * 1.9, x = 140 + ((i * 41) % 150) + Math.sin(t * 0.3 + ph) * 10 - ((t * 4 + i * 11) % 50);
          const y = 90 + ((i * 61 + t * 6) % 420);
          c.fillStyle = `rgba(255,248,220,${(0.22 + 0.22 * Math.sin(t + ph)).toFixed(3)})`; c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#a39a8e', '#b3ab9f', '#c3bcb0', '#cec8bc']);
        field(c, 20, 20, 340, 556, 2, (x, y) => [...g(nz.fbm(x * 0.03 + 5, y * 0.03, 5)), 249]);
        // the drawers still show faintly: their edges, cards and handles
        c.lineWidth = 1.5;
        for (const d of drawers) {
          const oy = d.open ? DROP : 0;
          c.strokeStyle = 'rgba(96,86,72,0.32)'; c.strokeRect(d.x, d.y + oy, d.w, d.h);
          c.fillStyle = 'rgba(128,112,86,0.28)'; c.fillRect(d.x + d.w / 2 - 21, d.y + oy + 13, 42, 16);
          c.beginPath(); c.ellipse(d.x + d.w / 2, d.y + oy + d.h - 19, 15, 6, 0, 0, TAU); c.fill();
        }
        // dust lies thickest along every ledge
        for (let i = 0; i <= ROWS; i++) { c.fillStyle = 'rgba(150,140,128,0.45)'; c.fillRect(X0, GY0 + i * ch - 4, X1 - X0, 7); }
        c.fillStyle = 'rgba(150,140,128,0.5)'; c.fillRect(26, CT - 2, 308, 6); c.fillRect(28, BOT - 2, 304, 6);
        for (let i = 0; i < 28; i++) bunny(c, r, X0 + 8 + r() * (X1 - X0 - 16), GY0 + ((r() * (ROWS + 1)) | 0) * ch - 2, 6 + r() * 8);
        for (let i = 0; i < 6; i++) bunny(c, r, 60 + r() * 260, CT - 1, 5 + r() * 6);
        // finger marks where drawers have been opened
        for (let i = 0; i < 7; i++) {
          const d = U.pick(r, drawers), oy = d.open ? DROP : 0;
          c.fillStyle = 'rgba(120,108,92,0.35)'; c.beginPath(); c.ellipse(d.x + d.w / 2 + (r() - 0.5) * 10, d.y + oy + d.h - 14, 10, 5, (r() - 0.5) * 0.6, 0, TAU); c.fill();
        }
        // a coat of dust on the things on top
        c.fillStyle = 'rgba(160,150,136,0.35)'; c.fillRect(150, 30, 34, 50);
        for (let i = 0; i < 600; i++) { c.fillStyle = 'rgba(90,80,66,0.25)'; c.fillRect(26 + r() * 308, 24 + r() * 530, 1.2, 1.2); }
        cobweb(c, X0, TOP, 0, 54); cobweb(c, X1, TOP, Math.PI / 2, 46);
        cobweb(c, X0, BOT, -Math.PI / 2, 30);
      },
    };
  }

  // ------------------------------------------------ MARCHBANK'S: THE OLD GLOBE
  // An old globe in a brass ring on a turned wooden stand, on the shop's
  // writing desk: lands painted in faded colours, a little ship, a sea
  // serpent and a compass rose on the oceans. Dust and grime to wash off;
  // once it is clean it turns, very slowly. roundWindow { what: 'globe' }
  const LANDS = [
    ['#ebd49c', [[-17, 21], [-16, 13], [-12, 8], [-8, 4.5], [-2, 5], [5, 6], [9, 4], [10, -1], [12, -6], [13, -12], [12, -17], [15, -27], [18, -34], [22, -34.5], [27, -33.5], [31, -29], [33, -25], [35, -22], [40, -15], [40.5, -10], [39, -5], [42, 0], [46, 3], [51, 11], [44, 11], [43, 13], [39, 18], [35, 26], [33, 30], [31, 31.5], [25, 32], [20, 31], [15, 32], [10, 35], [11, 37], [3, 37], [-2, 35.5], [-6, 35.8], [-9.5, 32], [-10, 29], [-13, 27]]],
    ['#dfe3a6', [[-9, 37], [-9, 43], [-2, 43.5], [-1, 46], [-4.5, 48], [-1, 49.5], [2, 51], [5, 53], [8, 54], [8.5, 57], [10.5, 57.5], [10, 59], [5, 59], [5, 62], [10, 64], [14, 67], [18, 69.5], [24, 71], [30, 70], [33, 69], [41, 67], [44, 68.5], [54, 68.5], [60, 69.5], [68, 72.5], [73, 72], [80, 73], [87, 75], [100, 77], [107, 78], [113, 76], [120, 73], [130, 71], [140, 72.5], [150, 71], [160, 70], [170, 70], [180, 68], [177, 64], [170, 60], [163, 59], [162, 56], [156, 51], [156, 57], [150, 59], [142, 59], [136, 55], [140, 48], [135, 43], [130, 42], [129, 36], [126, 37.5], [126, 34.5], [121, 31], [120, 26], [116, 23], [110, 21], [108, 17], [109, 12], [105, 9], [103, 11], [100, 13], [99, 9], [101, 6], [104, 1.5], [100, 3], [98, 8], [98, 16], [95, 17], [93, 22], [90, 22], [86, 20], [80, 15], [80, 10], [77, 8], [74, 15], [72, 21], [68, 23], [66, 25], [61, 25], [57, 25.5], [54, 27], [50.5, 29.5], [48, 30], [50, 26.5], [51.5, 24.5], [56, 25.5], [56.5, 24], [59.5, 22.5], [57.5, 19], [55, 17], [52, 16], [45, 13], [43.5, 12.6], [42, 15.5], [39, 21], [35, 28], [34.5, 31.5], [35.5, 34], [36, 36], [32, 36.2], [29, 36.5], [27, 37.5], [26.5, 40], [29, 41], [26, 40.8], [24, 40], [23, 38], [22, 36.5], [21, 38], [20, 39.5], [19.5, 41.5], [16, 43.5], [13.5, 45.5], [12.5, 44.2], [14, 42], [16, 41], [18, 40], [16, 38], [15.6, 38], [15.5, 40], [12, 41.8], [10.5, 43.5], [8.5, 44.3], [7, 43.6], [3, 43.3], [3.2, 42], [0.5, 40.5], [-0.5, 38.5], [-2, 36.7], [-5.5, 36], [-6, 37]]],
    ['#f0c8a8', [[-168, 66], [-162, 70], [-156, 71.5], [-145, 70], [-135, 69], [-125, 70], [-115, 68], [-108, 68.5], [-97, 68], [-95, 72], [-86, 69], [-82, 66], [-87, 64], [-93, 61], [-94, 58], [-90, 57], [-85, 55], [-82, 52], [-79, 52], [-78, 57], [-77, 61], [-72, 61], [-65, 60], [-61, 56], [-56, 52], [-59, 48], [-65, 49], [-66, 45], [-70, 43.5], [-70, 41.5], [-74, 40.5], [-76, 38], [-76, 35], [-79, 33], [-81, 31], [-80.5, 28], [-80, 25.5], [-81.5, 25], [-82.5, 27.5], [-83, 29.5], [-85, 30], [-89, 30.3], [-94, 29.5], [-97, 28], [-97.5, 25], [-97.5, 22], [-96, 19], [-94, 18], [-91, 19], [-90.5, 21], [-87, 21.5], [-88, 18], [-88.5, 16], [-84, 15.8], [-83.5, 11], [-81.5, 9], [-79, 9.5], [-77.5, 8], [-79, 7.5], [-81, 8], [-83, 8.5], [-86, 11], [-87.5, 13], [-91, 14], [-94, 16], [-97, 16], [-101, 17.5], [-105, 20], [-105.5, 23], [-109, 25.5], [-112.5, 29.5], [-114.5, 31.5], [-114, 30], [-112, 27], [-110, 23], [-112.5, 25], [-115, 28], [-117, 32.5], [-120.5, 34.5], [-122.5, 37.5], [-124, 40.5], [-124.5, 43], [-124, 46.5], [-124.5, 48.5], [-123, 49], [-127, 51], [-130, 54.5], [-133, 57], [-137, 58.5], [-141, 60], [-146, 61], [-150, 61], [-152, 59], [-156, 57.5], [-162, 55], [-158, 58], [-162, 59], [-165, 62], [-166, 64]]],
    ['#c9dca2', [[-77.5, 8], [-75, 11], [-71.5, 12.5], [-68, 10.6], [-62, 10.7], [-60, 8.5], [-57, 6], [-52, 5], [-50, 2], [-50, 0], [-48, -1], [-44, -2.5], [-40, -3], [-35, -5.5], [-35, -9], [-38.5, -13], [-39, -17.5], [-41, -22], [-44.5, -23], [-48, -26], [-48.5, -28.5], [-51, -31], [-53, -34], [-55, -35], [-57, -36], [-57.5, -38], [-62, -39], [-63, -41], [-65, -42], [-64.5, -45], [-67.5, -46.5], [-66, -48], [-68.5, -50.5], [-69, -52.5], [-68.5, -54.5], [-71, -55], [-74, -52.5], [-75.5, -48], [-74, -43], [-73.5, -37], [-71.5, -32], [-71.3, -25], [-70.3, -18], [-75, -15], [-77, -12], [-79.5, -7], [-81, -5], [-80, -2], [-80.5, 0.5], [-78.5, 2], [-77.3, 4]]],
    ['#f3d78f', [[113.5, -22], [114, -26], [115, -31], [115, -34], [118, -35], [123, -33.8], [126, -32.3], [131, -31.5], [134, -32.5], [137.5, -35], [138.5, -34.8], [140, -38], [144, -38.5], [146.5, -39], [150, -37.5], [151.5, -33], [153.5, -28], [153, -25], [150.5, -22], [146, -18.5], [145.5, -15], [143.5, -14], [142.5, -10.7], [141.5, -13], [141.5, -17], [139, -17.3], [136, -15], [137, -12], [133, -11.5], [130, -12.5], [127, -14], [125, -15], [123, -17], [122, -18.5], [119, -20], [116.5, -20.7]]],
    ['#f4f0e4', [[-73, 78], [-68, 80], [-60, 82], [-45, 83], [-30, 83.5], [-20, 82], [-18, 79], [-21, 76], [-19, 74], [-23, 71], [-26, 68.5], [-34, 66], [-40, 65], [-43, 60], [-48, 61], [-51, 64], [-53, 67], [-54, 70], [-56, 73], [-61, 76], [-68, 77]]],
    ['#f4f0e4', [[-24, 65.5], [-22, 66.4], [-16, 66.5], [-13.5, 65.2], [-15, 64.3], [-20, 63.5], [-22.5, 63.8]]],
    ['#dfe3a6', [[-5.7, 50], [-1, 50.7], [1.5, 51.2], [1.7, 52.7], [0, 53.5], [-0.5, 54.5], [-1.6, 55.6], [-2, 57], [-3.5, 58.6], [-5, 58.6], [-6, 57.5], [-5.5, 56], [-4.8, 54.8], [-3, 54], [-3, 53.4], [-4.5, 53], [-4.2, 51.6], [-5.3, 51.7]]],
    ['#dfe3a6', [[-6, 52], [-6.2, 53.5], [-6, 54.5], [-7.5, 55.2], [-9, 54.2], [-10, 53.5], [-9.5, 52], [-10.3, 51.6], [-8.5, 51.6]]],
    ['#dfe3a6', [[130, 31], [131.5, 34], [133, 34.5], [135, 33.6], [136.8, 34.5], [139, 35], [140.8, 35.7], [141, 38], [142, 40], [141.4, 41.5], [140, 40], [139.8, 38], [138.5, 37.5], [136.5, 36.7], [133, 35.5], [131, 34.5], [130, 33]]],
    ['#dfe3a6', [[140, 42], [141.2, 41.5], [143, 42], [145.5, 43.3], [145, 44.4], [141.6, 45.4], [141.2, 43.2]]],
    ['#ebd49c', [[44, -25], [47, -25], [49.5, -17], [50.5, -15.5], [49.3, -12], [48, -13.5], [44.5, -16], [43.8, -20]]],
    ['#f3d78f', [[172.7, -34.5], [174.5, -36], [176, -37.5], [178.5, -37.7], [177, -39.5], [176, -41.5], [174.7, -41.3], [175, -39.5], [173.8, -39], [174.5, -37]]],
    ['#f3d78f', [[172.7, -40.5], [174, -41.5], [173, -43], [171, -44.5], [169, -46.6], [166.5, -46], [168, -44], [171.5, -41.5]]],
    ['#dfe3a6', [[95.3, 5.6], [98, 3.5], [103.5, -1], [106, -3], [106, -5.9], [104.5, -5.9], [101, -2], [98.5, 1.5]]],
    ['#dfe3a6', [[109, 1.5], [110, -2], [114, -3.5], [116.5, -3], [118, 1], [119, 5], [117, 7], [115.5, 5], [113, 3.2], [110.5, 1.6]]],
    ['#f3d78f', [[131, -1], [135, -3.3], [138, -1.6], [141, -2.6], [145, -4.5], [147.5, -6.5], [150, -10.4], [147, -10.1], [144, -7.7], [141, -9], [138, -8.3], [137.6, -5], [133, -4]]],
    ['#dfe3a6', [[105.2, -6.8], [108, -6.3], [111, -6.6], [114.5, -7.8], [114.4, -8.6], [110, -8.2], [106, -7.4]]],
    ['#f0c8a8', [[-85, 21.8], [-82, 23.1], [-77, 21.5], [-74.2, 20.2], [-77.5, 19.8], [-80, 21.6], [-83, 22]]],
    ['#f6f3ea', [[-180, -78], [-160, -77], [-140, -75], [-120, -73], [-100, -72], [-80, -73], [-60, -64], [-58, -63], [-62, -66], [-60, -72], [-40, -77], [-20, -71], [0, -70], [20, -70], [40, -68], [60, -67], [80, -66], [100, -66], [120, -66], [140, -66.5], [160, -70], [170, -72], [180, -78]]],
  ].map(([col, pts]) => ({ col, pts }));
  // little pictures painted on the oceans
  const SIGHTS = [[-35, 28, 'ship'], [-150, 12, 'serpent'], [75, -28, 'rose'], [160, -40, 'ship'], [-28, -32, 'rose'], [-120, -30, 'serpent']];

  function oldGlobe(S) {
    const { r, nz, bleed } = S;
    const cx = 180, cy = 250, R = 128, RI = 138, RO = 148, RR = 150;
    const TILT = 0.4, VIEW = 0.2, DESK = 520, SPIN = TAU / 80;
    const LAMP = { x: 330, y: 40, r: 440 };
    const cv = Math.cos(VIEW), sv = Math.sin(VIEW), ct = Math.cos(TILT), st = Math.sin(TILT);
    // a point on the globe, seen a little from above, the axis leaning right
    function P(lon, lat, spin) {
      const l = (lon * Math.PI) / 180 + spin, p = (lat * Math.PI) / 180;
      const cp = Math.cos(p), sp = Math.sin(p);
      const x = cp * Math.sin(l), y = cv * sp - sv * cp * Math.cos(l), z = sv * sp + cv * cp * Math.cos(l);
      return [cx + R * (x * ct + y * st), cy + R * (x * st - y * ct), z];
    }
    // a point round the back is laid on the edge, so a land half turned
    // away ends at the rim
    function rim(q) {
      if (q[2] > 0) return q;
      const dx = q[0] - cx, dy = q[1] - cy, d = Math.hypot(dx, dy) || 1;
      return [cx + (dx / d) * R, cy + (dy / d) * R];
    }
    function sight(c, x, y, kind, z) {
      const k = 0.55 + 0.45 * z;
      c.save(); c.translate(x, y); c.scale(k, k); c.globalAlpha = Math.min(1, (z - 0.25) * 3);
      if (kind === 'ship') {
        c.fillStyle = '#7a5a3a'; c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.lineTo(4.5, 3.4); c.lineTo(-4.5, 3.4); c.closePath(); c.fill();
        c.fillRect(-0.5, -11, 1, 11);
        c.fillStyle = '#fbf3df'; c.beginPath(); c.moveTo(0.8, -10); c.quadraticCurveTo(7, -5, 1, -1); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-0.8, -8); c.quadraticCurveTo(-6, -4, -0.8, -1.5); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(122,90,58,0.6)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-9, 5.5); c.quadraticCurveTo(-6, 4, -3, 5.5); c.quadraticCurveTo(0, 7, 3, 5.5); c.stroke();
      } else if (kind === 'serpent') {
        c.strokeStyle = '#4f7a6a'; c.lineWidth = 2.6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-12, 2); c.quadraticCurveTo(-9, -6, -6, 2); c.moveTo(-3, 2); c.quadraticCurveTo(0, -7, 3, 2); c.moveTo(6, 2); c.quadraticCurveTo(8, -8, 12, -6); c.stroke();
        dot(c, 12.5, -6.4, 2.4, '#4f7a6a'); dot(c, 13.2, -7, 0.7, '#fbf3df');
        c.strokeStyle = 'rgba(79,122,106,0.5)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-14, 4); c.lineTo(14, 4); c.stroke();
      } else {
        c.fillStyle = '#c9a24a';
        for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -10); c.lineTo(2.2, 0); c.lineTo(-2.2, 0); c.closePath(); c.fill(); }
        c.rotate(Math.PI / 4); c.fillStyle = '#a0522d';
        for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -6); c.lineTo(1.6, 0); c.lineTo(-1.6, 0); c.closePath(); c.fill(); }
        dot(c, 0, 0, 1.6, '#fbf3df');
      }
      c.restore();
    }
    // the painted ball itself, turned by spin
    function sphere(c, spin) {
      c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
      let g = c.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      g.addColorStop(0, '#d7e7dc'); g.addColorStop(0.6, '#b3cfc2'); g.addColorStop(1, '#86a89c');
      c.fillStyle = g; c.fillRect(cx - R, cy - R, R * 2, R * 2);
      const line = (fn, n) => {
        c.beginPath(); let pen = false;
        for (let i = 0; i <= n; i++) {
          const [lo, la] = fn(i / n), q = P(lo, la, spin);
          if (q[2] > 0) { if (pen) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); pen = true; } else pen = false;
        }
        c.stroke();
      };
      c.strokeStyle = 'rgba(120,90,60,0.32)'; c.lineWidth = 0.8;
      for (let lon = 0; lon < 360; lon += 30) line((t) => [lon, -80 + t * 160], 32);
      for (const lat of [-60, -30, 30, 60]) line((t) => [t * 360, lat], 72);
      c.strokeStyle = 'rgba(160,70,50,0.5)'; c.lineWidth = 1.4; line((t) => [t * 360, 0], 72);
      for (const land of LANDS) {
        const pts = land.pts.map(([lo, la]) => P(lo, la, spin));
        if (!pts.some((q) => q[2] > 0)) continue;
        const path = new Path2D();
        pts.forEach((q, i) => { const [x, y] = rim(q); if (i) path.lineTo(x, y); else path.moveTo(x, y); });
        path.closePath();
        c.strokeStyle = 'rgba(255,255,245,0.4)'; c.lineWidth = 4; c.stroke(path);
        c.fillStyle = land.col; c.fill(path);
        c.strokeStyle = '#86644a'; c.lineWidth = 0.9; c.stroke(path);
      }
      for (const [lo, la, kind] of SIGHTS) { const q = P(lo, la, spin); if (q[2] > 0.25) sight(c, q[0], q[1], kind, q[2]); }
      // the light from the upper left, shade round the edge and a gleam
      g = c.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R * 1.02);
      g.addColorStop(0, 'rgba(255,252,240,0.35)'); g.addColorStop(0.4, 'rgba(255,252,240,0)'); g.addColorStop(0.8, 'rgba(40,50,45,0.12)'); g.addColorStop(1, 'rgba(30,38,34,0.5)');
      c.fillStyle = g; c.fillRect(cx - R, cy - R, R * 2, R * 2);
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.ellipse(cx - R * 0.42, cy - R * 0.45, R * 0.16, R * 0.08, -0.7, 0, TAU); c.fill();
      c.restore();
    }
    // the stand: a turned column from the cup that holds the ring to a round foot
    const PROFILE = [[398, 26], [404, 23], [412, 17], [418, 11], [426, 11], [432, 19], [441, 23], [450, 18], [457, 10], [463, 14], [474, 23], [484, 23], [492, 14], [497, 19], [503, 19], [507, 64], [512, 70], [519, 70], [522, 64]];
    const a0 = Math.atan2(PROFILE[0][0] - cy, -PROFILE[0][1]), a1 = Math.atan2(PROFILE[0][0] - cy, PROFILE[0][1]);
    const region = new Path2D();
    region.moveTo(cx + PROFILE[0][1], PROFILE[0][0]);
    region.arc(cx, cy, RR, a1, a0, true);
    for (const [y, w] of PROFILE) region.lineTo(cx - w, y);
    for (const [y, w] of PROFILE.slice().reverse()) region.lineTo(cx + w, y);
    region.closePath();
    const standPath = new Path2D();
    standPath.moveTo(cx - 28, 388); standPath.quadraticCurveTo(cx - 27, 402, cx - 17, 412);
    for (const [y, w] of PROFILE.slice(3)) standPath.lineTo(cx - w, y);
    for (const [y, w] of PROFILE.slice(3).reverse()) standPath.lineTo(cx + w, y);
    standPath.lineTo(cx + 17, 412); standPath.quadraticCurveTo(cx + 27, 402, cx + 28, 388); standPath.closePath();

    function ringAndStand(c) {
      // the wall in the gap behind the ball, in its shadow
      c.save(); c.beginPath(); c.arc(cx, cy, RI, 0, TAU); c.arc(cx, cy, R, 0, TAU, true); c.clip();
      c.fillStyle = 'rgba(8,16,12,0.35)'; c.fillRect(cx - RI, cy - RI, RI * 2, RI * 2);
      c.restore();
      // the brass ring with its degrees engraved
      const ring = new Path2D(); ring.arc(cx, cy, RO, 0, TAU); ring.arc(cx, cy, RI, 0, TAU, true);
      let g = c.createLinearGradient(cx - RO, cy - RO, cx + RO, cy + RO);
      g.addColorStop(0, '#f2d88a'); g.addColorStop(0.3, '#c9952a'); g.addColorStop(0.55, '#e6c06a'); g.addColorStop(0.8, '#9a7428'); g.addColorStop(1, '#6e521c');
      c.fillStyle = g; c.fill(ring);
      c.strokeStyle = 'rgba(90,60,20,0.6)'; c.lineWidth = 0.7;
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU, l = i % 9 === 0 ? 6 : i % 3 === 0 ? 4 : 2.4;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * RO, cy + Math.sin(a) * RO); c.lineTo(cx + Math.cos(a) * (RO - l), cy + Math.sin(a) * (RO - l)); c.stroke();
      }
      c.strokeStyle = 'rgba(70,45,15,0.55)'; c.lineWidth = 1;
      c.beginPath(); c.arc(cx, cy, RO - 0.5, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, RI + 0.5, 0, TAU); c.stroke();
      // the pins the ball turns on, at its two poles
      for (const a of [TILT - Math.PI / 2, TILT + Math.PI / 2]) {
        const px = cx + Math.cos(a) * (RI - 3), py = cy + Math.sin(a) * (RI - 3);
        dot(c, px, py, 4.8, '#8a6a26'); dot(c, px - 0.8, py - 0.8, 2.6, '#f2d88a');
      }
      // the turned stand
      g = c.createLinearGradient(cx - 70, 0, cx + 70, 0);
      g.addColorStop(0, '#3c2212'); g.addColorStop(0.36, '#8a5a35'); g.addColorStop(0.55, '#6b4228'); g.addColorStop(1, '#2e190d');
      c.fillStyle = g; c.fill(standPath);
      c.save(); c.clip(standPath);
      for (const y of [404, 418, 426, 457, 463, 492, 497, 503]) { c.fillStyle = 'rgba(20,8,2,0.4)'; c.fillRect(cx - 70, y - 0.6, 140, 1.2); c.fillStyle = 'rgba(255,220,180,0.18)'; c.fillRect(cx - 70, y + 0.6, 140, 1); }
      c.fillStyle = '#82522f'; c.beginPath(); c.ellipse(cx, 508, 64, 5, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,220,180,0.2)'; c.beginPath(); c.ellipse(cx - 12, 507, 40, 2, 0, 0, TAU); c.fill();
      c.restore();
      c.fillStyle = 'rgba(255,220,180,0.28)'; c.beginPath(); c.ellipse(cx, 389, 28, 3.2, 0, 0, TAU); c.fill();
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => (Math.hypot(x - cx, y - cy) > R + 2 ? 1.4 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        shopWall(c, S, x0, y0, x1, DESK, LAMP, 0);
        // an old map in a frame, and a brass lamp on the wall
        c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(13, 31, 80, 68);
        c.fillStyle = '#6b4228'; c.fillRect(8, 26, 80, 68);
        c.fillStyle = '#efe0bc'; c.fillRect(15, 33, 66, 54);
        c.fillStyle = '#cfe0d6'; c.fillRect(19, 37, 58, 46);
        c.fillStyle = '#e6c487'; c.beginPath(); c.moveTo(26, 46); c.quadraticCurveTo(40, 40, 46, 52); c.quadraticCurveTo(52, 68, 38, 76); c.quadraticCurveTo(26, 70, 26, 46); c.fill();
        c.fillStyle = '#c9dca2'; c.beginPath(); c.moveTo(54, 44); c.quadraticCurveTo(70, 42, 72, 56); c.quadraticCurveTo(64, 66, 56, 60); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(120,90,60,0.4)'; c.lineWidth = 0.6; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(19, 37 + k * 11.5); c.lineTo(77, 37 + k * 11.5); c.stroke(); }
        const glow = c.createRadialGradient(330, 64, 2, 330, 64, 60);
        glow.addColorStop(0, 'rgba(255,214,140,0.55)'); glow.addColorStop(1, 'rgba(255,214,140,0)');
        c.fillStyle = glow; c.fillRect(270, 4, 120, 120);
        c.fillStyle = brass(c, 322, 0, 338, 0); c.fillRect(326, 74, 8, 20); c.beginPath(); c.ellipse(330, 94, 10, 3, 0, 0, TAU); c.fill();
        c.fillStyle = '#f4ead2'; c.fillRect(326.5, 52, 7, 22);
        c.fillStyle = '#ffd98a'; c.beginPath(); c.ellipse(330, 46, 3, 6, 0, 0, TAU); c.fill();
        softShadow(c, region, 18, 0.45, -12, 10);
        // the writing desk: a green leather top, its edge and a drawer
        c.fillStyle = '#4a2416'; c.fillRect(x0, DESK, x1 - x0, 28);
        c.fillStyle = '#3f5e4b'; c.fillRect(16, DESK + 3, 328, 21);
        c.strokeStyle = '#c9a24a'; c.lineWidth = 0.8; c.strokeRect(19.5, DESK + 6.5, 321, 15);
        c.fillStyle = '#6b301d'; c.fillRect(x0, DESK + 28, x1 - x0, 11);
        c.fillStyle = 'rgba(255,214,170,0.24)'; c.fillRect(x0, DESK + 28, x1 - x0, 2);
        c.fillStyle = '#4a2416'; c.fillRect(x0, DESK + 39, x1 - x0, y1 - DESK - 39);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x0, DESK + 39, x1 - x0, 4);
        c.strokeStyle = 'rgba(255,214,170,0.14)'; c.lineWidth = 1.4; c.strokeRect(60, DESK + 48, 240, 40);
        c.fillStyle = brass(c, 168, 0, 192, 0); c.beginPath(); c.roundRect(168, DESK + 62, 24, 8, 3); c.fill();
        // the globe's foot on the desk
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(cx + 4, 522, 70, 5, 0, 0, TAU); c.fill();
        // an open book, an inkwell with a quill
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(64, 534, 46, 5, 0, 0, TAU); c.fill();
        c.fillStyle = '#7a2a2a'; c.beginPath(); c.moveTo(20, 530); c.lineTo(64, 534); c.lineTo(108, 530); c.lineTo(104, 506); c.lineTo(64, 510); c.lineTo(24, 506); c.closePath(); c.fill();
        c.fillStyle = '#fbf3df'; c.beginPath(); c.moveTo(26, 526); c.quadraticCurveTo(46, 522, 64, 529); c.lineTo(64, 507); c.quadraticCurveTo(46, 500, 28, 504); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(102, 526); c.quadraticCurveTo(82, 522, 64, 529); c.lineTo(64, 507); c.quadraticCurveTo(82, 500, 100, 504); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(80,60,40,0.4)'; c.lineWidth = 0.8;
        for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(32, 509 + k * 3.6); c.lineTo(58, 511 + k * 3.6); c.moveTo(70, 511 + k * 3.6); c.lineTo(96, 509 + k * 3.6); c.stroke(); }
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(288, 534, 18, 4, 0, 0, TAU); c.fill();
        c.fillStyle = '#2f3a44'; c.beginPath(); c.moveTo(274, 532); c.lineTo(302, 532); c.lineTo(298, 514); c.lineTo(278, 514); c.closePath(); c.fill();
        c.fillStyle = brass(c, 280, 0, 296, 0); c.fillRect(281, 508, 14, 7);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(279, 518, 3, 12);
        c.save(); c.translate(290, 508); c.rotate(0.45);
        c.fillStyle = '#f2ece0'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-9, -24, -2, -52); c.quadraticCurveTo(6, -26, 0, 0); c.fill();
        c.strokeStyle = '#c9b89c'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(-2, -24, -2, -52); c.stroke();
        c.restore();
      },
      clean(c) {
        shopWall(c, S, bleed.x0, bleed.y0, bleed.x1, DESK, LAMP, 0);
        sphere(c, 0);
        ringAndStand(c);
      },
      cleanOver(c) {
        // the ring catches the lamp along its top
        c.strokeStyle = 'rgba(255,250,220,0.5)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, RO - 3, -1.2, -0.4); c.stroke();
        c.strokeStyle = 'rgba(255,250,220,0.25)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, RO - 4, 3.6, 4.4); c.stroke();
      },
      live(c, t) {
        sphere(c, t * SPIN);
      },
      dirt(c) {
        const g = ramp(['#8f877a', '#a1998b', '#b2ab9d', '#c2bcae']);
        field(c, cx - RR - 2, cy - RR - 2, cx + RR + 2, 526, 2, (x, y) => [...g(nz.fbm(x * 0.028 + 3, y * 0.028, 5)), 242]);
        // the globe still shows faintly: its round edge and its ring
        c.strokeStyle = 'rgba(70,60,48,0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(120,96,44,0.32)'; c.lineWidth = RO - RI; c.beginPath(); c.arc(cx, cy, (RO + RI) / 2, 0, TAU); c.stroke();
        c.fillStyle = 'rgba(80,60,40,0.25)'; c.fill(standPath);
        // grime, rings from cups once set down on it, fingerprints, specks
        grime(c, r, cx - R, cy - R, cx + R, cy + R, 30);
        c.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const x = cx + (r() - 0.5) * R * 1.2, y = cy + (r() - 0.5) * R * 1.2, rad = 9 + r() * 7;
          c.strokeStyle = `rgba(120,80,40,${(0.2 + r() * 0.14).toFixed(2)})`; c.lineWidth = 1.4 + r() * 1.6;
          c.beginPath(); c.arc(x, y, rad, r() * 2, r() * 2 + 5.4); c.stroke();
        }
        for (let i = 0; i < 7; i++) fingerprint(c, cx + (r() - 0.5) * R * 1.4, cy + (r() - 0.2) * R * 0.9, r() * 3);
        for (let i = 0; i < 700; i++) { c.fillStyle = 'rgba(80,68,52,0.3)'; c.fillRect(cx - RR + r() * RR * 2, cy - RR + r() * (RR + 272), 1.2, 1.2); }
        // dust thick along the top of the ring and on the stand's ledges
        c.strokeStyle = 'rgba(206,199,186,0.6)'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, (RO + RI) / 2, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
        for (const [y, w] of [[404, 24], [457, 12], [492, 15], [507, 62]]) { c.fillStyle = 'rgba(206,199,186,0.55)'; c.fillRect(cx - w, y - 2, w * 2, 4); }
        // a cobweb across the gap between the ball and its ring
        cobweb(c, cx + Math.cos(2.36) * RI, cy + Math.sin(2.36) * RI, -Math.PI / 2, 40);
        cobweb(c, cx + Math.cos(-0.5) * RI, cy + Math.sin(-0.5) * RI, Math.PI / 2, 30);
      },
    };
  }

  // -------------------------------------------- MARCHBANK'S: THE STONE FOUNTAIN
  // The round stone fountain in the walled yard behind the shop, seen from a
  // little above: a wide basin, a stone bowl on a pillar in the middle and a
  // trickle of water. Duckweed all over the water; under it, coins people
  // made wishes on and three goldfish. Works with the seasons' leaves and
  // snow like the pond. pond { what: 'fountain' }
  function stoneFountain(S) {
    const { r, nz, bleed, opts } = S;
    const cx = 180;
    const RIM = { y: 340, rx: 174, ry: 140 }, INNER = { y: 340, rx: 156, ry: 124 }, WATER = { y: 350, rx: 150, ry: 112 };
    const FACE = 26, BOWL = { y: 268, rx: 52, ry: 13 }, FALL = 78;
    const pillar = (p) => {
      p.moveTo(cx - BOWL.rx, BOWL.y);
      p.ellipse(cx, BOWL.y, BOWL.rx, BOWL.ry, 0, Math.PI, TAU);
      p.quadraticCurveTo(cx + 44, 292, cx + 14, 296);
      p.lineTo(cx + 15, 340);
      p.ellipse(cx, 344, 25, 10, 0, -0.16, Math.PI + 0.16);
      p.lineTo(cx - 14, 296);
      p.quadraticCurveTo(cx - 44, 292, cx - BOWL.rx, BOWL.y);
      p.closePath();
      return p;
    };
    const region = new Path2D();
    region.ellipse(cx, WATER.y, WATER.rx, WATER.ry, 0, 0, TAU);
    pillar(region);
    const pillarPath = pillar(new Path2D());
    // where the bowl spills over its lip, and where that lands on the water
    const lip = (dx) => BOWL.y + BOWL.ry * Math.sqrt(Math.max(0, 1 - (dx / BOWL.rx) ** 2));
    const STREAMS = [-44, -16, 16, 44].map((dx, i) => ({ x: cx + dx, y0: lip(dx) - 1, x1: cx + dx * 1.12, y1: lip(dx) + FALL, ph: i * 0.37 }));
    const coins = [];
    for (let i = 0; i < 26 && coins.length < 14; i++) {
      const a = r() * TAU, d = Math.sqrt(r());
      const x = cx + Math.cos(a) * WATER.rx * 0.82 * d, y = WATER.y + Math.sin(a) * WATER.ry * 0.82 * d;
      if (inside(pillarPath, x, y) || Math.hypot(x - cx, (y - 344) * 2.2) < 34) continue;
      coins.push({ x, y, s: 4 + r() * 2.4, kind: U.pick(r, ['copper', 'copper', 'silver', 'gold']), a: r() * 3 });
    }
    const pebbles = [];
    for (let i = 0; i < 40; i++) { const a = r() * TAU, d = 0.3 + r() * 0.65; pebbles.push([cx + Math.cos(a) * WATER.rx * d, WATER.y + Math.sin(a) * WATER.ry * d, 2 + r() * 3.5, U.pick(r, ['#a9b7a8', '#c3c7b6', '#8fa496', '#d2cfbf'])]); }
    const fish = [
      { col: '#f08a3c', fin: '#ffb070', ph: 0, sp: 0.21, k: 1 },
      { col: '#f2c230', fin: '#ffe08a', ph: 2.2, sp: -0.17, k: 0.86 },
      { col: '#e0485a', fin: '#ff9aa6', ph: 4.1, sp: 0.25, k: 0.92 },
    ];
    const pads = [[cx + 106, 316, 13, 0.4, false], [cx - 100, 404, 15, 2.1, true], [cx + 62, 428, 11, 4.4, false]];
    const winter = opts.dirt === 'snow', autumn = opts.dirt === 'leaves';

    function flagstones(c) {
      const { x0, y0, x1, y1 } = bleed, q = U.rng(77);
      c.fillStyle = '#5f6b4a'; c.fillRect(x0, 140, x1 - x0, y1 - 140);
      for (let y = 142; y < y1;) {
        const h = 38 + q() * 16;
        for (let x = x0 - q() * 40; x < x1;) {
          const w = 48 + q() * 52;
          c.fillStyle = U.shade(U.pick(q, ['#c9c1b1', '#bdb4a3', '#d3cbbd', '#b6ad9c']), (nz.n2(x * 0.03, y * 0.03) - 0.5) * 0.14);
          c.beginPath(); c.roundRect(x + 2, y + 2, w - 4, h - 4, 4); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x + 5, y + 3, w - 10, 2);
          c.fillStyle = 'rgba(60,50,40,0.12)'; c.fillRect(x + 5, y + h - 6, w - 10, 2);
          x += w;
        }
        y += h;
      }
      for (let i = 0; i < 70; i++) { c.fillStyle = U.pick(q, ['rgba(110,140,70,0.5)', 'rgba(200,190,110,0.35)', 'rgba(150,160,90,0.4)']); c.beginPath(); c.arc(x0 + q() * (x1 - x0), 150 + q() * (y1 - 150), 1.5 + q() * 3.5, 0, TAU); c.fill(); }
      void y0;
    }
    function wall(c) {
      const { x0, y0, x1 } = bleed;
      barnBricks(c, r, nz, x0, y0, x1, 150);
      c.fillStyle = '#6e6a5c'; c.fillRect(x0, 146, x1 - x0, 10);
      c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(x0, 156, x1 - x0, 6);
      // ivy tumbling over the wall
      const leaf = (x, y, s, a, col) => {
        c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-s, -s * 0.2, -s * 0.7, -s); c.lineTo(0, -s * 0.6); c.lineTo(s * 0.7, -s); c.quadraticCurveTo(s, -s * 0.2, 0, 0); c.fill(); c.restore();
      };
      for (const [bx, len] of [[20, 120], [96, 60], [250, 100], [330, 136]]) {
        c.strokeStyle = '#5a4a2e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx, y0); c.quadraticCurveTo(bx + 14, y0 + len * 0.5, bx - 4, y0 + len); c.stroke();
        for (let k = 0; k < len / 7; k++) {
          const t = k / (len / 7), x = bx + Math.sin(t * 3) * 10 + (r() - 0.5) * 14, y = y0 + t * len + (r() - 0.5) * 8;
          leaf(x, y, 6 + r() * 3, (r() - 0.5) * 1.6, U.pick(r, ['#4f7a3a', '#5f8f45', '#3f6a30', '#6f9a50']));
        }
      }
    }
    function fern(c, x, y) {
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(x + 3, y + 22, 18, 5, 0, 0, TAU); c.fill();
      c.strokeStyle = '#4f7a3a'; c.lineWidth = 1.4;
      for (let k = 0; k < 9; k++) {
        const a = -Math.PI / 2 + (k - 4) * 0.34, len = 26 + (4 - Math.abs(k - 4)) * 4;
        const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len * 0.8;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.6 - 6, ex, ey); c.stroke();
        for (let j = 1; j < 6; j++) { const t = j / 6, px = x + (ex - x) * t, py = y + (ey - y) * t - Math.sin(t * Math.PI) * 6; c.fillStyle = j % 2 ? '#5f8f45' : '#6f9a50'; c.beginPath(); c.ellipse(px, py, 3.4, 1.6, a + 0.9, 0, TAU); c.fill(); }
      }
      c.fillStyle = '#c4714a'; c.beginPath(); c.moveTo(x - 15, y); c.lineTo(x + 15, y); c.lineTo(x + 11, y + 22); c.lineTo(x - 11, y + 22); c.closePath(); c.fill();
      c.fillStyle = '#d98b63'; c.fillRect(x - 16, y - 2, 32, 5);
    }
    function basin(c) {
      const rimPath = new Path2D(); rimPath.ellipse(cx, RIM.y, RIM.rx, RIM.ry, 0, 0, TAU);
      softShadow(c, rimPath, 16, 0.4, 0, FACE + 6);
      // the basin's outer wall, curving round the front
      const face = new Path2D();
      face.ellipse(cx, RIM.y, RIM.rx, RIM.ry, 0, 0, Math.PI);
      face.lineTo(cx - RIM.rx, RIM.y + FACE);
      face.ellipse(cx, RIM.y + FACE, RIM.rx, RIM.ry, 0, Math.PI, 0, true);
      face.closePath();
      let g = c.createLinearGradient(cx - RIM.rx, 0, cx + RIM.rx, 0);
      g.addColorStop(0, '#7d766a'); g.addColorStop(0.35, '#b2aa9a'); g.addColorStop(0.6, '#a39b8b'); g.addColorStop(1, '#6f695e');
      c.fillStyle = g; c.fill(face);
      c.strokeStyle = 'rgba(50,45,38,0.35)'; c.lineWidth = 1.2;
      for (let x = cx - RIM.rx + 30; x < cx + RIM.rx; x += 36) {
        const t = (x - cx) / RIM.rx, yt = RIM.y + RIM.ry * Math.sqrt(1 - t * t);
        c.beginPath(); c.moveTo(x, yt + 1); c.lineTo(x, yt + FACE - 1); c.stroke();
      }
      for (let i = 0; i < 26; i++) { const t = (r() - 0.5) * 1.9, x = cx + t * RIM.rx, yt = RIM.y + RIM.ry * Math.sqrt(Math.max(0, 1 - t * t)); c.fillStyle = U.pick(r, ['rgba(110,140,70,0.55)', 'rgba(90,120,60,0.5)']); c.beginPath(); c.ellipse(x, yt + FACE - 2, 4 + r() * 6, 2 + r() * 2, 0, 0, TAU); c.fill(); }
      // the inside of the far wall, above the water
      g = c.createLinearGradient(0, INNER.y - INNER.ry, 0, WATER.y);
      g.addColorStop(0, '#5f594e'); g.addColorStop(0.25, '#7a7366'); g.addColorStop(1, '#8a8274');
      c.fillStyle = g; c.beginPath(); c.ellipse(cx, INNER.y, INNER.rx, INNER.ry, 0, 0, TAU); c.fill();
      // the rim: pale coping stones laid round in a ring
      const top = new Path2D(); top.ellipse(cx, RIM.y, RIM.rx, RIM.ry, 0, 0, TAU); top.ellipse(cx, INNER.y, INNER.rx, INNER.ry, 0, 0, TAU);
      g = c.createLinearGradient(0, RIM.y - RIM.ry, 0, RIM.y + RIM.ry);
      g.addColorStop(0, '#d6cfc0'); g.addColorStop(1, '#c4bcab');
      c.fillStyle = g; c.fill(top, 'evenodd');
      c.strokeStyle = 'rgba(60,52,42,0.4)'; c.lineWidth = 1.2;
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU + 0.1;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * INNER.rx, INNER.y + Math.sin(a) * INNER.ry); c.lineTo(cx + Math.cos(a) * RIM.rx, RIM.y + Math.sin(a) * RIM.ry); c.stroke();
      }
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(cx, RIM.y, RIM.rx - 3, RIM.ry - 3, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      c.strokeStyle = 'rgba(50,44,36,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, INNER.y, INNER.rx, INNER.ry, 0, 0, TAU); c.stroke();
      for (let i = 0; i < 30; i++) {
        const a = r() * TAU, d = 0.5 + r() * 0.5, x = cx + Math.cos(a) * (INNER.rx + (RIM.rx - INNER.rx) * d), y = RIM.y + Math.sin(a) * (INNER.ry + (RIM.ry - INNER.ry) * d);
        c.fillStyle = U.pick(r, ['rgba(110,140,70,0.6)', 'rgba(200,190,110,0.45)', 'rgba(150,160,90,0.5)']); c.beginPath(); c.arc(x, y, 1.5 + r() * 3, 0, TAU); c.fill();
      }
    }
    function coin(c, k) {
      const col = { copper: ['#e3a174', '#b8673f', '#7d4426'], silver: ['#f2f4f4', '#b8c0c4', '#7d868c'], gold: ['#fff1b0', '#e9bf4f', '#9a7428'] }[k.kind];
      c.save(); c.translate(k.x, k.y); c.rotate(k.a); c.scale(1, 0.6);
      const g = c.createRadialGradient(-k.s * 0.3, -k.s * 0.3, 0.5, 0, 0, k.s);
      g.addColorStop(0, col[0]); g.addColorStop(0.6, col[1]); g.addColorStop(1, col[2]);
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, k.s, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(40,30,20,0.3)'; c.lineWidth = 0.8; c.beginPath(); c.arc(0, 0, k.s * 0.68, 0, TAU); c.stroke();
      c.restore();
    }
    function goldfish(c, f, t) {
      const a = t * f.sp + f.ph, ox = cx, oy = 372, rx = 112 * f.k, ry = 62 * f.k;
      const x = ox + Math.cos(a) * rx, y = oy + Math.sin(a) * ry;
      const dir = Math.sign(f.sp) || 1, ang = Math.atan2(Math.cos(a) * ry * dir, -Math.sin(a) * rx * dir);
      c.save(); c.translate(x, y); c.rotate(ang);
      c.fillStyle = 'rgba(0,30,40,0.18)'; c.beginPath(); c.ellipse(3, 6, 12, 5, 0, 0, TAU); c.fill();
      const wig = Math.sin(t * 8 + f.ph) * 0.4;
      c.fillStyle = f.fin;
      c.save(); c.translate(-10, 0); c.rotate(wig); c.beginPath(); c.moveTo(0, 0); c.lineTo(-9, -6); c.lineTo(-6, 0); c.lineTo(-9, 6); c.closePath(); c.fill(); c.restore();
      c.fillStyle = f.col; c.beginPath(); c.ellipse(0, 0, 12, 5, 0, 0, TAU); c.fill();
      c.fillStyle = f.fin; c.beginPath(); c.ellipse(1, -5, 3.4, 1.8, -0.5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(1, 5, 3.4, 1.8, 0.5, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(2, -1.6, 6, 1.4, 0, 0, TAU); c.fill();
      c.fillStyle = '#222'; c.beginPath(); c.arc(8, -1.6, 0.9, 0, TAU); c.arc(8, 1.6, 0.9, 0, TAU); c.fill();
      c.restore();
    }
    function pad(c, x, y, s, rot, flower, t) {
      c.save(); c.translate(x, y); c.rotate(rot + Math.sin(t * 0.8 + x) * 0.05); c.scale(1, 0.72);
      c.fillStyle = 'rgba(0,30,20,0.2)'; c.beginPath(); c.arc(2, 3, s, 0.25, 6.0); c.lineTo(2, 3); c.fill();
      c.fillStyle = '#5fae5a'; c.beginPath(); c.arc(0, 0, s, 0.25, 6.0); c.lineTo(0, 0); c.closePath(); c.fill();
      c.strokeStyle = '#4c9447'; c.lineWidth = 1; for (let k = 0; k < 5; k++) { const aa = 0.6 + k * 1.1; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(aa) * s * 0.9, Math.sin(aa) * s * 0.9); c.stroke(); }
      if (flower) { for (let k = 0; k < 8; k++) { const aa = (k / 8) * TAU; c.fillStyle = k % 2 ? '#f7b6c8' : '#fbd2dc'; c.beginPath(); c.ellipse(Math.cos(aa) * 4, Math.sin(aa) * 4, 4.5, 2.2, aa, 0, TAU); c.fill(); } dot(c, 0, 0, 2.2, '#f2c230'); }
      c.restore();
    }
    // the bowl on its pillar and the little stone bud on top
    function statue(c) {
      const sg = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#8f8778'); g.addColorStop(0.35, '#dcd5c6'); g.addColorStop(0.6, '#c3bbab'); g.addColorStop(1, '#7d766a'); return g; };
      // the base where the pillar meets the water
      c.fillStyle = sg(cx - 25, cx + 25); c.beginPath(); c.ellipse(cx, 344, 25, 10, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(cx - 4, 340, 18, 4, 0, 0, TAU); c.fill();
      // the fluted pillar
      c.fillStyle = sg(cx - 15, cx + 15); c.fillRect(cx - 14, 288, 28, 54);
      c.strokeStyle = 'rgba(70,62,52,0.35)'; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(cx + k * 5, 294); c.lineTo(cx + k * 5, 338); c.stroke(); }
      for (let i = 0; i < 14; i++) dot(c, cx - 14 + r() * 28, 320 + r() * 26, 1 + r() * 2, U.pick(r, ['rgba(110,140,70,0.6)', 'rgba(90,120,60,0.55)']));
      // the bowl, seen a little from above
      c.fillStyle = sg(cx - BOWL.rx, cx + BOWL.rx);
      c.beginPath(); c.moveTo(cx - BOWL.rx, BOWL.y); c.quadraticCurveTo(cx - 44, 292, cx - 14, 296); c.lineTo(cx + 14, 296); c.quadraticCurveTo(cx + 44, 292, cx + BOWL.rx, BOWL.y); c.ellipse(cx, BOWL.y, BOWL.rx, BOWL.ry, 0, 0, Math.PI); c.closePath(); c.fill();
      // a scalloped lip where the water spills over
      c.fillStyle = '#cfc7b7';
      for (let k = 0; k < 9; k++) { const t = -0.9 + (k / 8) * 1.8, x = cx + t * BOWL.rx * 0.98, y = lip(t * BOWL.rx * 0.98); c.beginPath(); c.arc(x, y, 5.4, 0, Math.PI); c.fill(); }
      c.fillStyle = '#d6cfc0'; c.beginPath(); c.ellipse(cx, BOWL.y, BOWL.rx, BOWL.ry, 0, 0, TAU); c.fill();
      const wg = c.createLinearGradient(0, BOWL.y - 10, 0, BOWL.y + 10);
      wg.addColorStop(0, '#5f9fa6'); wg.addColorStop(1, '#8fcfc8');
      c.fillStyle = wg; c.beginPath(); c.ellipse(cx, BOWL.y + 1, BOWL.rx - 6, BOWL.ry - 3.4, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, BOWL.y + 1, BOWL.rx - 14, BOWL.ry - 6, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
      // the bud on top, where the water bubbles out
      c.fillStyle = sg(cx - 6, cx + 6); c.fillRect(cx - 5, 246, 10, 22);
      c.fillStyle = sg(cx - 10, cx + 10); c.beginPath(); c.ellipse(cx, 240, 9.5, 11, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(70,62,52,0.45)'; c.lineWidth = 0.9;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(cx, 236 + k * 4.6, 8.6 - Math.abs(k - 1.5) * 1.4, 0.4, Math.PI - 0.4); c.stroke(); }
      c.fillStyle = sg(cx - 4, cx + 4); c.beginPath(); c.arc(cx, 228, 4, 0, TAU); c.fill();
      if (winter) {
        c.fillStyle = '#f6f9fc';
        c.beginPath(); c.ellipse(cx, BOWL.y - 3, BOWL.rx - 4, BOWL.ry - 4, 0, Math.PI, TAU); c.ellipse(cx, BOWL.y - 1, BOWL.rx - 10, 3, 0, 0, Math.PI); c.fill();
        c.beginPath(); c.ellipse(cx, 230, 9, 5, 0, Math.PI, TAU); c.fill();
        c.beginPath(); c.ellipse(cx, 341, 22, 5, 0, Math.PI, TAU); c.fill();
      }
      if (autumn) {
        for (const [x, y, a, col] of [[cx - 30, BOWL.y - 3, 0.6, '#d9822b'], [cx + 22, BOWL.y + 6, -0.4, '#c4462f'], [cx + 4, 342, 1.2, '#e9b23c']]) {
          c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, TAU); c.fill(); c.restore();
        }
      }
    }

    return {
      family: 'skim', particle: 'water', region, depth: true,
      tough: (x, y) => (nz.n2(x * 0.03, y * 0.03) > 0.7 ? 1.5 : 1),
      decor(c) {
        flagstones(c);
        wall(c);
        fern(c, 34, 176); fern(c, 326, 182);
        basin(c);
      },
      clean(c) {
        // clear water over the pale stone floor of the basin
        const g = c.createRadialGradient(cx, WATER.y + 10, 20, cx, WATER.y, WATER.rx);
        g.addColorStop(0, '#8fcfc8'); g.addColorStop(0.65, '#6bb5b4'); g.addColorStop(1, '#4b979c');
        c.fillStyle = g; c.fillRect(0, 200, W, 300);
        c.strokeStyle = 'rgba(40,90,95,0.22)'; c.lineWidth = 1.4;
        for (let y = WATER.y - 80; y < WATER.y + 110; y += 34) { c.beginPath(); for (let x = 20; x <= 340; x += 10) c.lineTo(x, y + Math.sin(x * 0.05 + y) * 2); c.stroke(); }
        for (let x = 40; x < 340; x += 46) { c.beginPath(); c.moveTo(x, 230); c.lineTo(x + 6, 470); c.stroke(); }
        for (const [x, y, s, col] of pebbles) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, s, s * 0.6, 0, 0, TAU); c.fill(); }
        for (const k of coins) coin(c, k);
        // light dancing on the bottom
        c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1.4;
        for (let i = 0; i < 36; i++) { const x = 30 + r() * 300, y = 240 + r() * 220; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 12, y - 6, x + 20, y + 6, x + 32, y); c.stroke(); }
        // the shadow of the far wall falls on the water
        const sh = c.createLinearGradient(0, WATER.y - WATER.ry, 0, WATER.y - WATER.ry + 46);
        sh.addColorStop(0, 'rgba(20,50,55,0.5)'); sh.addColorStop(1, 'rgba(20,50,55,0)');
        c.fillStyle = sh; c.fillRect(0, WATER.y - WATER.ry, W, 46);
      },
      live(c, t) {
        // rings spreading where the water falls in
        for (const s of STREAMS) {
          for (const off of [0, 0.5]) {
            const k = (t * 0.7 + s.ph + off) % 1, rad = 4 + k * 18;
            c.strokeStyle = `rgba(255,255,255,${(0.4 * (1 - k)).toFixed(3)})`; c.lineWidth = 1.2;
            c.beginPath(); c.ellipse(s.x1, s.y1, rad, rad * 0.42, 0, 0, TAU); c.stroke();
          }
        }
        for (const f of fish) goldfish(c, f, t);
        for (const [x, y, s, rot, flower] of pads) pad(c, x, y, s, rot, flower, t);
        c.fillStyle = 'rgba(255,255,255,0.18)';
        for (let i = 0; i < 6; i++) { const gx = 60 + ((i * 53 + t * 9) % 240), gy = 260 + ((i * 67) % 190); c.beginPath(); c.ellipse(gx, gy, 9, 1.4, 0, 0, TAU); c.fill(); }
      },
      dirt(c) {
        // a green skin of duckweed and algae
        const g = ramp(['#4c6a24', '#5d7d2c', '#728f35', '#8aa244', '#9fae55']);
        field(c, 20, 230, 340, 470, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 5)), 236]);
        for (let i = 0; i < 1700; i++) { c.fillStyle = U.pick(r, ['#7cbf45', '#8fd04f', '#6aa83c', '#a3d65f']); c.beginPath(); c.arc(30 + r() * 300, 236 + r() * 230, 1.3 + r() * 1.5, 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(60,90,30,0.6)'; c.lineWidth = 1.2;
        for (let i = 0; i < 40; i++) { let x = 30 + r() * 300, y = 240 + r() * 220; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 26; y += (r() - 0.5) * 20; c.lineTo(x, y); } c.stroke(); }
        for (let i = 0; i < 10; i++) {
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#c9a24a']);
          c.save(); c.translate(40 + r() * 280, 250 + r() * 200); c.rotate(r() * 6.28); c.beginPath(); c.ellipse(0, 0, 8, 4, 0, 0, TAU); c.fill(); c.restore();
        }
        for (let i = 0; i < 30; i++) { c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.arc(30 + r() * 300, 240 + r() * 220, 1.5 + r() * 3, 0, TAU); c.stroke(); }
      },
      top(c) {
        statue(c);
      },
      liveTop(c, t) {
        c.save(); c.lineCap = 'round';
        // water bubbling out of the bud and falling into the bowl
        for (const side of [-1, 1]) {
          const h = 10 + Math.sin(t * 5 + side) * 1.5;
          c.strokeStyle = 'rgba(214,238,246,0.6)'; c.lineWidth = 1.8;
          c.beginPath(); c.moveTo(cx, 226); c.quadraticCurveTo(cx + side * 6, 226 - h, cx + side * 18, BOWL.y - 2); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1; c.setLineDash([2, 7]); c.lineDashOffset = -t * 30;
          c.stroke(); c.setLineDash([]);
        }
        // thin curtains spilling from the lip to the basin
        for (const s of STREAMS) {
          const path = new Path2D(); path.moveTo(s.x, s.y0); path.quadraticCurveTo(s.x1, s.y0 + 6, s.x1, s.y1 - 2);
          c.strokeStyle = 'rgba(200,232,240,0.5)'; c.lineWidth = 2.4; c.stroke(path);
          c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.1; c.setLineDash([3, 9]); c.lineDashOffset = -t * 40 - s.ph * 12; c.stroke(path); c.setLineDash([]);
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(s.x1, s.y1 - 1, 3.4 + Math.sin(t * 9 + s.ph * 10), 1.4, 0, 0, TAU); c.fill();
        }
        c.restore();
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'counter', test: (o) => o.what === 'clock', make: grandfatherClock },
    { kind: 'attic', test: (o) => o.where === 'curio', make: curioCabinet },
    { kind: 'roundWindow', test: (o) => o.what === 'globe', make: oldGlobe },
    { kind: 'pond', test: (o) => o.what === 'fountain', make: stoneFountain },
  );
})();
