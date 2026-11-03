'use strict';
// Scenes for Kiln Lane Pottery and Halfpenny Halt: the kiln. A brick bottle
// kiln in the pottery yard, sooty from years of firings: scrub it back to warm
// red brick, its iron hoops and the iron door at its foot. Same layers as
// every other scene (see scenes.js).

(() => {
  const { W, field, ramp } = SCENES;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };

  // the bottle's outline: half its width at height y (centre line x = 180)
  const CX = 180, BASE = 556, TOP = 76;
  function halfWidth(y) {
    const t = (BASE - y) / (BASE - TOP);
    if (t <= 0.22) return 152 - t * 10;
    if (t >= 0.86) return 42;
    const k = (t - 0.22) / 0.64;
    return 42 + (149.8 - 42) * (0.5 + 0.5 * Math.cos(Math.PI * k));
  }
  function bottle(p) {
    p.moveTo(CX - halfWidth(BASE), BASE);
    for (let y = BASE; y >= TOP; y -= 6) p.lineTo(CX - halfWidth(y), y);
    p.lineTo(CX - 48, TOP); p.lineTo(CX - 48, TOP - 12); p.lineTo(CX + 48, TOP - 12); p.lineTo(CX + 48, TOP);
    for (let y = TOP; y <= BASE; y += 6) p.lineTo(CX + halfWidth(y), y);
    p.lineTo(CX + halfWidth(BASE), BASE);
    p.closePath();
  }
  // the iron door at the kiln's foot: an arch
  const DOOR = { x0: 136, x1: 224, y0: 420, y1: BASE };
  function doorPath(p) {
    const { x0, x1, y0, y1 } = DOOR, rx = (x1 - x0) / 2;
    p.moveTo(x0, y1); p.lineTo(x0, y0 + rx); p.arc(CX, y0 + rx, rx, Math.PI, 0); p.lineTo(x1, y1); p.closePath();
  }
  // iron hoops round the bottle, seen face on they sag a little
  const HOOPS = [492, 396, 300, 214, 150];
  // two small fire mouths either side of the door
  const MOUTHS = [74, 286];

  function kiln(S) {
    const { r, nz, bleed } = S;
    const region = new Path2D();
    bottle(region);
    // where the smoke came out most: above the door and round the neck
    const plume = (x, y) => {
      const door = Math.exp(-((x - CX) ** 2) / 2600 - ((y - 380) ** 2) / 12000);
      const neck = Math.exp(-((y - 120) ** 2) / 5000);
      const mouths = MOUTHS.reduce((m, mx) => m + Math.exp(-((x - mx) ** 2) / 700 - ((y - 500) ** 2) / 2600), 0);
      return Math.min(1, door + neck * 0.8 + mouths * 0.8);
    };
    const bricks = [];
    for (let y = TOP - 12, row = 0; y < BASE; y += 11, row++) {
      for (let x = 20 - (row % 2) * 13; x < 340; x += 26) {
        bricks.push({ x, y, col: U.pick(r, ['#b4553a', '#bf5f40', '#a94e35', '#c66a48', '#b85a3d', '#9f4833']) });
      }
    }

    function brickwork(c) {
      // warm red brick in courses, the bottle rounded with light and shade
      c.fillStyle = '#e3d3bd'; c.fillRect(0, TOP - 14, W, BASE - TOP + 16);
      for (const b of bricks) {
        c.fillStyle = b.col; c.fillRect(b.x + 1, b.y + 1, 24, 9.4);
        c.fillStyle = 'rgba(255,225,195,0.16)'; c.fillRect(b.x + 1, b.y + 1, 24, 1.6);
      }
      // a stone coping round the top of the neck
      c.fillStyle = '#d9cdb8'; c.fillRect(CX - 50, TOP - 14, 100, 12);
      c.fillStyle = 'rgba(80,60,40,0.25)'; c.fillRect(CX - 50, TOP - 4, 100, 2);
      for (let y = TOP; y < BASE; y += 4) {
        const hw = halfWidth(y);
        const g = c.createLinearGradient(CX - hw, 0, CX + hw, 0);
        g.addColorStop(0, 'rgba(60,25,15,0.42)'); g.addColorStop(0.18, 'rgba(60,25,15,0.08)'); g.addColorStop(0.4, 'rgba(255,230,200,0.1)');
        g.addColorStop(0.6, 'rgba(255,230,200,0)'); g.addColorStop(0.85, 'rgba(60,25,15,0.14)'); g.addColorStop(1, 'rgba(60,25,15,0.45)');
        c.fillStyle = g; c.fillRect(CX - hw, y, hw * 2, 4.2);
      }
      // the iron hoops
      for (const y of HOOPS) {
        const hw = halfWidth(y);
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(30,20,15,0.35)'; c.lineWidth = 6;
        c.beginPath(); c.moveTo(CX - hw, y + 2); c.quadraticCurveTo(CX, y + 12, CX + hw, y + 2); c.stroke();
        c.strokeStyle = '#4a4f55'; c.lineWidth = 4.4;
        c.beginPath(); c.moveTo(CX - hw, y); c.quadraticCurveTo(CX, y + 10, CX + hw, y); c.stroke();
        c.strokeStyle = 'rgba(200,210,220,0.35)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(CX - hw + 6, y - 1.4); c.quadraticCurveTo(CX, y + 8.4, CX + hw - 6, y - 1.4); c.stroke();
        for (const t of [0.15, 0.38, 0.62, 0.85]) dot(c, CX - hw + hw * 2 * t, y + 20 * t * (1 - t), 1.6, '#2f3337');
      }
      // fire mouths: small arches with soot-dark mouths
      for (const mx of MOUTHS) {
        c.fillStyle = '#7a3a28'; c.beginPath(); c.moveTo(mx - 20, BASE); c.lineTo(mx - 20, 520); c.arc(mx, 520, 20, Math.PI, 0); c.lineTo(mx + 20, BASE); c.fill();
        c.fillStyle = '#2b2422'; c.beginPath(); c.moveTo(mx - 14, BASE); c.lineTo(mx - 14, 522); c.arc(mx, 522, 14, Math.PI, 0); c.lineTo(mx + 14, BASE); c.fill();
        c.fillStyle = 'rgba(255,150,80,0.12)'; c.beginPath(); c.ellipse(mx, BASE - 6, 12, 5, 0, 0, 7); c.fill();
      }
      // the door: an arch of brick on edge, then the iron door with rivets
      const { x0, x1, y0, y1 } = DOOR, rx = (x1 - x0) / 2;
      c.strokeStyle = '#8f4330'; c.lineWidth = 16;
      c.beginPath(); c.moveTo(x0 - 4, y1); c.lineTo(x0 - 4, y0 + rx); c.arc(CX, y0 + rx, rx + 4, Math.PI, 0); c.lineTo(x1 + 4, y1); c.stroke();
      c.strokeStyle = 'rgba(255,220,190,0.35)'; c.lineWidth = 1;
      for (let k = 0; k <= 12; k++) {
        const a = Math.PI + (k / 12) * Math.PI;
        c.beginPath(); c.moveTo(CX + Math.cos(a) * (rx - 4), y0 + rx + Math.sin(a) * (rx - 4)); c.lineTo(CX + Math.cos(a) * (rx + 12), y0 + rx + Math.sin(a) * (rx + 12)); c.stroke();
      }
      const dp = new Path2D(); doorPath(dp);
      const dg = c.createLinearGradient(x0, 0, x1, 0);
      dg.addColorStop(0, '#3d464f'); dg.addColorStop(0.45, '#5b6670'); dg.addColorStop(1, '#3a424a');
      c.fillStyle = dg; c.fill(dp);
      c.save(); c.clip(dp);
      for (const y of [462, 510]) { c.fillStyle = '#2f363d'; c.fillRect(x0, y, x1 - x0, 9); c.fillStyle = 'rgba(220,230,240,0.25)'; c.fillRect(x0, y, x1 - x0, 1.4); for (let x = x0 + 8; x < x1; x += 14) dot(c, x, y + 4.5, 1.8, '#808b95'); }
      c.restore();
      c.strokeStyle = '#2a3036'; c.lineWidth = 3; c.stroke(dp);
      for (let k = 0; k <= 10; k++) { const a = Math.PI + (k / 10) * Math.PI; dot(c, CX + Math.cos(a) * (rx - 6), y0 + rx + Math.sin(a) * (rx - 6), 1.8, '#8a959f'); }
      for (let y = y0 + rx + 10; y < y1; y += 16) { dot(c, x0 + 6, y, 1.8, '#8a959f'); dot(c, x1 - 6, y, 1.8, '#8a959f'); }
      // the latch and a little round spy hole, shut
      c.strokeStyle = '#22272c'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x1 - 26, 490); c.lineTo(x1 - 6, 490); c.stroke();
      dot(c, x1 - 26, 490, 4.6, '#2a3036'); dot(c, CX, 446, 8, '#2a3036'); dot(c, CX, 446, 5.4, '#6b7680'); dot(c, CX - 1.6, 444.4, 1.6, 'rgba(255,255,255,0.5)');
    }

    return {
      family: 'scrub', particle: 'dust', region, depth: false,
      tough: (x, y) => (plume(x, y) > 0.55 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // a soft sky and a field beyond the lane
        const g = c.createLinearGradient(0, y0, 0, 470);
        g.addColorStop(0, '#b9dcec'); g.addColorStop(1, '#eef3e4');
        c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, 480 - y0);
        c.fillStyle = 'rgba(255,255,255,0.85)';
        for (const [x, y, s] of [[44, 60, 1], [300, 120, 0.8], [330, 34, 0.6]]) { c.beginPath(); c.ellipse(x, y, 30 * s, 10 * s, 0, 0, 7); c.ellipse(x + 20 * s, y - 6 * s, 18 * s, 11 * s, 0, 0, 7); c.fill(); }
        c.fillStyle = '#a9c98a'; c.beginPath(); c.moveTo(x0, 430); c.quadraticCurveTo(90, 400, 200, 424); c.quadraticCurveTo(300, 446, x1, 414); c.lineTo(x1, 560); c.lineTo(x0, 560); c.fill();
        c.fillStyle = '#8fb874'; c.beginPath(); c.moveTo(x0, 470); c.quadraticCurveTo(160, 450, x1, 478); c.lineTo(x1, 560); c.lineTo(x0, 560); c.fill();
        // the cobbled yard at the kiln's foot
        field(c, x0, 548, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.05, y * 0.05, 3); return [168 + v * 24, 150 + v * 20, 128 + v * 18]; });
        for (let y = 552; y < y1; y += 13) {
          for (let x = x0 + ((y / 13) % 2) * 9; x < x1; x += 18) {
            c.fillStyle = 'rgba(70,55,40,0.3)'; c.beginPath(); c.ellipse(x + 1, y + 2, 8, 5, 0, 0, 7); c.fill();
            c.fillStyle = U.pick(r, ['#b9ab95', '#a89a84', '#c6b9a3', '#9e917d']); c.beginPath(); c.ellipse(x, y, 8, 5, 0, 0, 7); c.fill();
          }
        }
        c.fillStyle = 'rgba(60,40,25,0.3)'; c.beginPath(); c.ellipse(CX, BASE + 4, 160, 9, 0, 0, 7); c.fill();
        // a stack of saggars at one side, a little pile of logs at the other
        for (let i = 0; i < 3; i++) {
          const y = 584 - i * 12;
          c.fillStyle = '#c9b48f'; c.fillRect(6, y - 12, 26, 12); c.fillStyle = 'rgba(90,70,40,0.35)'; c.fillRect(6, y - 2, 26, 2);
        }
        for (const [x, y] of [[334, 588], [350, 588], [342, 578]]) { dot(c, x, y, 7, '#7a5236'); dot(c, x, y, 5, '#d9b27c'); dot(c, x, y, 2, '#b98a54'); }
      },
      clean: brickwork,
      dirt(c) {
        const soot = ramp(['#262220', '#322c29', '#41372f', '#56443a', '#6d4f40']);
        field(c, 20, TOP - 16, 340, BASE + 2, 2, (x, y) => soot(U.clamp(0.75 - plume(x, y) * 0.55 + (nz.fbm(x * 0.03, y * 0.03, 4) - 0.5) * 0.7, 0, 1)));
        // the shape of the bricks still shows faintly through
        c.strokeStyle = 'rgba(120,105,92,0.28)'; c.lineWidth = 1;
        for (let y = TOP - 1; y < BASE; y += 11) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        for (const b of bricks) if (r() < 0.55) { c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x, b.y + 11); c.stroke(); }
        // soot streaks drawn upwards by the heat
        c.lineCap = 'round';
        for (let i = 0; i < 260; i++) {
          const x = 30 + r() * 300, y = TOP + r() * (BASE - TOP), l = 20 + r() * 70 * (0.4 + plume(x, y));
          c.strokeStyle = `rgba(${18 + (r() * 20) | 0},${16 + (r() * 16) | 0},${15 + (r() * 14) | 0},${(0.18 + r() * 0.3).toFixed(2)})`;
          c.lineWidth = 1.5 + r() * 4;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 8, y - l / 2, x + (r() - 0.5) * 12, y - l); c.stroke();
        }
        // dark blooms round the door and the fire mouths
        for (let i = 0; i < 90; i++) {
          const k = r(), x = k < 0.5 ? CX + (r() - 0.5) * 140 : U.pick(r, MOUTHS) + (r() - 0.5) * 50;
          const y = k < 0.5 ? 340 + r() * 200 : 470 + r() * 80;
          c.fillStyle = `rgba(20,18,16,${(0.12 + r() * 0.2).toFixed(2)})`;
          c.beginPath(); c.ellipse(x, y, 10 + r() * 24, 6 + r() * 16, r() * 3, 0, 7); c.fill();
        }
        // pale ash and flecks
        for (let i = 0; i < 26; i++) {
          const x = 30 + r() * 300, y = TOP + r() * (BASE - TOP), rad = 8 + r() * 16;
          const g = c.createRadialGradient(x, y, 0, x, y, rad);
          g.addColorStop(0, 'rgba(170,162,150,0.22)'); g.addColorStop(1, 'rgba(170,162,150,0)');
          c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        for (let i = 0; i < 400; i++) dot(c, 20 + r() * 320, TOP - 12 + r() * (BASE - TOP + 12), 0.6 + r() * 1.2, U.pick(r, ['#1d1a18', '#5e5650', '#7a716a', '#2a2522']));
      },
      top(c) {
        // a thread of smoke from the neck, against the sky
        c.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          c.strokeStyle = `rgba(240,240,236,${0.5 - k * 0.12})`; c.lineWidth = 9 - k * 2;
          c.beginPath(); c.moveTo(CX - 6 + k * 6, TOP - 16);
          c.bezierCurveTo(CX - 20 + k * 8, TOP - 40, CX + 26 + k * 4, TOP - 56, CX + 8 + k * 10, TOP - 84 - k * 6); c.stroke();
        }
      },
    };
  }

  Object.assign(SCENES.KINDS, { kiln });
})();
