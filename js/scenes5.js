'use strict';
// Café scenes: the dusty floor, the striped awning, the name board over the
// door, the bistro tables and the old espresso machine on the counter. Same
// layers as every other scene (see scenes.js). Needs scenes2.js first.

(() => {
  const { W, H, field, ramp, softShadow, paintStamp, peelingPaint, grime } = SCENES;

  // ------------------------------------------------------------ shared bits
  function glow(c, x, y, rad, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // brick wall in running bond, every brick a slightly different red
  function bricks(c, r, nz, x0, y0, x1, y1, bw = 30, bh = 12) {
    c.fillStyle = '#d3c3a8'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    const cols = ['#b5644a', '#a85a42', '#c06d50', '#9c5240', '#b86a4e', '#ad6650'];
    for (let row = 0, y = y0; y < y1; y += bh, row++) {
      for (let x = x0 - (row % 2 ? bw / 2 : 0); x < x1; x += bw) {
        c.fillStyle = U.shade(U.pick(r, cols), (nz.n2(x * 0.03, y * 0.03) - 0.5) * 0.3);
        c.fillRect(x + 1, y + 1, bw - 2, bh - 2);
        c.fillStyle = 'rgba(255,225,190,0.12)'; c.fillRect(x + 1, y + 1, bw - 2, 2);
        c.fillStyle = 'rgba(60,25,15,0.15)'; c.fillRect(x + 1, y + bh - 3, bw - 2, 2);
      }
    }
    // a little soot so it does not look brand new
    field(c, x0, y0, x1, y1, 4, (x, y) => [70, 50, 40, Math.max(0, nz.fbm(x * 0.015 + 40, y * 0.015, 3) - 0.42) * 170]);
  }

  // checked tiles laid on the diagonal; the shade of each tile comes from its
  // position, so the same floor painted twice lines up exactly
  const TILE_A = '#efe5cf', TILE_B = '#2e6a5a';
  function checker(c, nz, x0, y0, x1, y1, a, b, s = 34) {
    c.save();
    c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
    c.fillStyle = '#d4c7ad'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.translate(W / 2, H / 2); c.rotate(Math.PI / 4);
    const n = Math.ceil(Math.hypot(W, H) / s / 2) + 3;
    for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
      c.fillStyle = U.shade((i + j) & 1 ? a : b, (nz.n2(i * 0.9 + 20, j * 0.9) - 0.5) * 0.14);
      c.fillRect(i * s + 0.9, j * s + 0.9, s - 1.8, s - 1.8);
    }
    c.restore();
  }

  function deadLeaf(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    c.fillStyle = U.pick(r, ['#b5762f', '#9c5a2a', '#c98c3a', '#8c5a2b', '#d0903e']);
    c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.65, s, 0); c.quadraticCurveTo(0, s * 0.65, -s, 0); c.fill();
    c.strokeStyle = 'rgba(70,40,15,0.5)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.stroke();
    c.restore();
  }
  function paperScrap(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    c.fillStyle = U.pick(r, ['#f4f1ea', '#ebe6da', '#f7efe0']);
    c.beginPath();
    for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283, rr = s * (0.6 + r() * 0.5); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,110,95,0.5)'; c.lineWidth = 0.7;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo((r() - 0.5) * s, (r() - 0.5) * s); c.lineTo((r() - 0.5) * s, (r() - 0.5) * s); c.stroke(); }
    c.restore();
  }
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 12; ring < len; ring += 12) {
      c.beginPath();
      for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2), rr = ring + (k % 2) * 2; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      c.stroke();
    }
  }
  function dropping(c, r, x, y, s) {
    c.fillStyle = 'rgba(245,243,235,0.95)';
    c.beginPath();
    for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.283, rr = s * (0.5 + r() * 0.6); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,115,105,0.7)'; c.beginPath(); c.arc(x + (r() - 0.5) * s * 0.4, y + (r() - 0.5) * s * 0.4, s * 0.3, 0, 7); c.fill();
    c.strokeStyle = 'rgba(245,243,235,0.9)'; c.lineWidth = s * 0.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y + s * 0.5); c.lineTo(x + (r() - 0.5) * 2, y + s * (1.5 + r() * 1.5)); c.stroke();
  }

  // ------------------------------------------------------------------ FLOOR
  // Looking down at the café floor, from the counter to the door.
  function cafeFloor(S) {
    const { r, nz, bleed } = S;
    const top = 92, bot = 584;
    const stools = [80, 180, 280].map((x) => ({ x, y: 140, r: 17 }));
    const table = { x: 128, y: 384, r: 48 };
    const chairs = [{ x: 56, y: 324, r: 18, a: -2.45 }, { x: 206, y: 446, r: 18, a: 0.7 }];
    const plant = { x: 298, y: 526, r: 30 };
    const region = new Path2D();
    region.rect(0, top, W, bot - top);
    for (const t of [...stools, table, ...chairs, plant]) { region.moveTo(t.x + t.r, t.y); region.arc(t.x, t.y, t.r, 0, Math.PI * 2); }
    const shadowOf = (c, x, y, rad) => { c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(x + 4, y + 5, rad, 0, 7); c.fill(); };
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 18 || x > 342 || y < top + 14 || y > bot - 14 ? 1.35 : 1),
      decor(c) {
        checker(c, nz, bleed.x0, top, bleed.x1, bleed.y1, TILE_A, TILE_B);
        // the counter along the top, seen from above
        c.fillStyle = '#6b452c'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
        for (let i = 0; i < 90; i++) {
          const y = bleed.y0 + r() * (top - 14 - bleed.y0), x = bleed.x0 + r() * (bleed.x1 - bleed.x0);
          c.strokeStyle = r() < 0.6 ? 'rgba(40,22,12,0.25)' : 'rgba(255,220,180,0.1)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + r() * 80, y + (r() - 0.5) * 2); c.stroke();
        }
        c.fillStyle = '#8a5d3d'; c.fillRect(bleed.x0, top - 14, bleed.x1 - bleed.x0, 8);
        c.fillStyle = '#3e2718'; c.fillRect(bleed.x0, top - 6, bleed.x1 - bleed.x0, 6);
        // cups, a cake stand and the bell on the counter
        for (const [x, y] of [[44, 34], [318, 46]]) {
          c.fillStyle = 'rgba(30,18,10,0.3)'; c.beginPath(); c.arc(x + 2, y + 3, 11, 0, 7); c.fill();
          c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill();
          c.fillStyle = '#e9e2d3'; c.beginPath(); c.arc(x, y, 7.5, 0, 7); c.fill();
          c.fillStyle = '#6b4022'; c.beginPath(); c.arc(x, y, 5.5, 0, 7); c.fill();
          c.fillStyle = '#c9a07a'; c.beginPath(); c.arc(x - 1, y - 1, 2.6, 0, 7); c.fill();
          c.fillStyle = '#f7f3ea'; c.fillRect(x + 7, y - 2, 6, 4);
        }
        c.fillStyle = 'rgba(30,18,10,0.3)'; c.beginPath(); c.arc(186, 42, 26, 0, 7); c.fill();
        c.fillStyle = '#f4efe6'; c.beginPath(); c.arc(183, 38, 26, 0, 7); c.fill();
        c.fillStyle = '#efb4ae'; c.beginPath(); c.arc(183, 38, 18, 0, 7); c.fill();
        c.strokeStyle = '#f8e7e3'; c.lineWidth = 1.5;
        for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; c.beginPath(); c.moveTo(183, 38); c.lineTo(183 + Math.cos(a) * 18, 38 + Math.sin(a) * 18); c.stroke(); }
        c.fillStyle = '#c9474f'; for (let k = 0; k < 6; k++) { const a = (k / 6 + 0.08) * 6.283; c.beginPath(); c.arc(183 + Math.cos(a) * 12, 38 + Math.sin(a) * 12, 2, 0, 7); c.fill(); }
        c.fillStyle = '#d9b35a'; c.beginPath(); c.arc(250, 30, 8, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(248, 28, 4, 0, 7); c.fill();
        // brass threshold and a coir mat by the door
        c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 5);
        c.fillStyle = '#a77d48'; c.fillRect(bleed.x0, bot + 5, bleed.x1 - bleed.x0, bleed.y1 - bot);
        c.fillStyle = '#8a6236'; c.fillRect(70, bot + 12, 220, bleed.y1 - bot);
        c.fillStyle = '#b8915a'; c.fillRect(78, bot + 18, 204, bleed.y1 - bot);
      },
      clean(c) {
        checker(c, nz, 0, top, W, bot, TILE_A, TILE_B);
        // freshly mopped: soft light gliding over the tiles
        for (const [o, w, a] of [[-150, 70, 0.1], [20, 26, 0.08], [130, 90, 0.07]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(o, bot); c.lineTo(o + w, bot); c.lineTo(o + w + 300, top); c.lineTo(o + 300, top); c.closePath(); c.fill();
        }
      },
      cleanOver(c) {
        glow(c, 110, 250, 110, 'rgba(255,244,214,0.16)');
        glow(c, 270, 330, 90, 'rgba(255,244,214,0.12)');
      },
      dirt(c) {
        checker(c, nz, 0, top, W, bot, '#cfc5b0', '#87907e');
        const g = ramp(['#a29a8c', '#b3ac9e', '#c3bcaf', '#d0c9bd']);
        field(c, 0, top, W, bot, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 212 + v * 40]; });
        grime(c, r, 0, top, W, bot, 26);
        // dust bunnies along the walls and under the stools
        for (let i = 0; i < 34; i++) {
          const x = r() < 0.5 ? r() * 40 + (r() < 0.5 ? 0 : 320) : r() * W, y = top + 6 + r() * (bot - top - 12), s = 5 + r() * 9;
          for (let k = 0; k < 9; k++) { const v = 150 + r() * 40; c.fillStyle = `rgba(${v},${v - 5},${v - 12},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, 7); c.fill(); }
        }
        // leaves blown in under the door, scraps of paper, sugar packets
        for (let i = 0; i < 40; i++) deadLeaf(c, r, r() * W, bot - Math.pow(r(), 1.8) * 300, 5 + r() * 6);
        for (let i = 0; i < 9; i++) paperScrap(c, r, 20 + r() * 320, top + 20 + r() * 440, 7 + r() * 6);
        for (let i = 0; i < 7; i++) {
          c.save(); c.translate(20 + r() * 320, top + 20 + r() * 460); c.rotate(r() * 6.28);
          c.fillStyle = U.pick(r, ['#f3c2cf', '#ffffff', '#d9c6a0']); c.fillRect(-7, -3.5, 14, 7);
          c.fillStyle = 'rgba(120,90,60,0.35)'; c.fillRect(-7, -1, 14, 2); c.restore();
        }
        // an old newspaper page
        c.save(); c.translate(250, 250); c.rotate(0.35);
        c.fillStyle = '#e9e2cf'; c.fillRect(-34, -44, 68, 88);
        c.fillStyle = 'rgba(70,65,55,0.55)'; c.fillRect(-28, -38, 56, 9);
        c.fillStyle = 'rgba(70,65,55,0.3)'; for (let y = -24; y < 40; y += 5) { c.fillRect(-28, y, 25, 2); c.fillRect(3, y, 25, 2); }
        c.restore();
        // shoe prints from the door up to the counter
        c.fillStyle = 'rgba(105,88,66,0.32)';
        for (let i = 0, y = bot - 16; y > top + 40; i++, y -= 30) {
          const x = 176 + Math.sin(y * 0.012) * 30 + (i % 2 ? 9 : -9), a = Math.cos(y * 0.012) * 0.35;
          c.save(); c.translate(x, y); c.rotate(a);
          c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, 7); c.fill();
          c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, 7); c.fill();
          c.restore();
        }
        cobweb(c, 0, top, 0, 70);
        cobweb(c, W, top, Math.PI / 2, 60);
      },
      top(c) {
        // the counter's shadow on the floor
        const g = c.createLinearGradient(0, top, 0, top + 22);
        g.addColorStop(0, 'rgba(40,25,15,0.35)'); g.addColorStop(1, 'rgba(40,25,15,0)');
        c.fillStyle = g; c.fillRect(bleed.x0, top, bleed.x1 - bleed.x0, 22);
        // bar stools: red leather on chrome rings
        for (const s of stools) {
          shadowOf(c, s.x, s.y, s.r + 3);
          c.strokeStyle = '#aab1b8'; c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y, s.r + 3, 0, 7); c.stroke();
          c.fillStyle = '#c9ced3'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill();
          c.fillStyle = '#b8443b'; c.beginPath(); c.arc(s.x, s.y, s.r - 3, 0, 7); c.fill();
          c.fillStyle = '#d0645a'; c.beginPath(); c.arc(s.x - 3, s.y - 3, s.r - 8, 0, 7); c.fill();
          c.fillStyle = '#8e2f29'; c.beginPath(); c.arc(s.x, s.y, 2, 0, 7); c.fill();
        }
        // bentwood chairs with cane seats
        for (const ch of chairs) {
          shadowOf(c, ch.x, ch.y, ch.r);
          c.fillStyle = '#7a4b2e'; c.beginPath(); c.arc(ch.x, ch.y, ch.r, 0, 7); c.fill();
          c.fillStyle = '#dcc28a'; c.beginPath(); c.arc(ch.x, ch.y, ch.r - 4, 0, 7); c.fill();
          c.strokeStyle = 'rgba(150,110,50,0.5)'; c.lineWidth = 0.8;
          c.save(); c.beginPath(); c.arc(ch.x, ch.y, ch.r - 4, 0, 7); c.clip();
          for (let k = -20; k <= 20; k += 4) { c.beginPath(); c.moveTo(ch.x + k - 20, ch.y - 20); c.lineTo(ch.x + k + 20, ch.y + 20); c.moveTo(ch.x + k + 20, ch.y - 20); c.lineTo(ch.x + k - 20, ch.y + 20); c.stroke(); }
          c.restore();
          c.strokeStyle = '#5e3a24'; c.lineWidth = 5; c.lineCap = 'round';
          c.beginPath(); c.arc(ch.x, ch.y, ch.r + 2, ch.a - 1.1, ch.a + 1.1); c.stroke();
        }
        // the round table with a little vase of flowers
        shadowOf(c, table.x, table.y, table.r);
        c.fillStyle = '#b8913d'; c.beginPath(); c.arc(table.x, table.y, table.r, 0, 7); c.fill();
        const mg = c.createRadialGradient(table.x - 16, table.y - 18, 4, table.x, table.y, table.r);
        mg.addColorStop(0, '#ffffff'); mg.addColorStop(1, '#ddd8cf');
        c.fillStyle = mg; c.beginPath(); c.arc(table.x, table.y, table.r - 4, 0, 7); c.fill();
        c.strokeStyle = 'rgba(130,130,140,0.35)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(table.x - 34, table.y + 10); c.quadraticCurveTo(table.x - 4, table.y - 4, table.x + 30, table.y + 22); c.stroke();
        c.fillStyle = '#5f8fc7'; c.beginPath(); c.arc(table.x + 4, table.y - 4, 7, 0, 7); c.fill();
        for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.283; c.fillStyle = '#ef8aa6'; c.beginPath(); c.arc(table.x + 4 + Math.cos(a) * 5, table.y - 4 + Math.sin(a) * 5, 3.2, 0, 7); c.fill(); }
        c.fillStyle = '#f7c548'; c.beginPath(); c.arc(table.x + 4, table.y - 4, 2.4, 0, 7); c.fill();
        // a big leafy plant by the door
        shadowOf(c, plant.x, plant.y, plant.r + 8);
        c.fillStyle = '#b5652f'; c.beginPath(); c.arc(plant.x, plant.y, plant.r, 0, 7); c.fill();
        c.fillStyle = '#4a3324'; c.beginPath(); c.arc(plant.x, plant.y, plant.r - 5, 0, 7); c.fill();
        for (let k = 0; k < 11; k++) {
          const a = (k / 11) * 6.283 + r() * 0.3, len = 26 + r() * 16;
          c.save(); c.translate(plant.x, plant.y); c.rotate(a);
          c.fillStyle = U.pick(r, ['#3f7a3a', '#4f8a3c', '#5d9644', '#467e37']);
          c.beginPath(); c.ellipse(len * 0.55, 0, len * 0.55, 8 + r() * 4, 0, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(4, 0); c.lineTo(len, 0); c.stroke();
          c.restore();
        }
      },
    };
  }

  // ----------------------------------------------------------------- AWNING
  // The striped awning over the shop window, seen from across the street.
  const STRIPE_A = '#f4ecda', STRIPE_B = '#2f8068';
  function awning(S) {
    const { r, nz, bleed } = S;
    const yT = 122, yF = 318, yV = 360, N = 9;
    const xT0 = 40, xT1 = 320, xF0 = 14, xF1 = 346, sw = (xF1 - xF0) / N;
    // x of stripe edge k at height y on the sloping face
    const at = (k, y) => { const t = (y - yT) / (yF - yT), a = U.lerp(xT0, xF0, t), b = U.lerp(xT1, xF1, t); return a + ((b - a) * k) / N; };
    const region = new Path2D();
    region.moveTo(xT0, yT); region.lineTo(xT1, yT); region.lineTo(xF1, yF); region.lineTo(xF1, yV);
    for (let k = N - 1; k >= 0; k--) region.arc(xF0 + sw * (k + 0.5), yV, sw / 2, 0, Math.PI);
    region.lineTo(xF0, yF); region.closePath();
    const yB = yV + sw / 2;
    // the second colour; the first one is laid underneath so no seams show
    function stripes(c, col) {
      c.fillStyle = col;
      for (let k = 1; k < N; k += 2) {
        c.beginPath(); c.moveTo(at(k, yT), yT); c.lineTo(at(k + 1, yT), yT); c.lineTo(at(k + 1, yF), yF); c.lineTo(at(k, yF), yF); c.closePath(); c.fill();
        c.fillRect(xF0 + sw * k, yF - 0.5, sw, yB - yF + 1);
      }
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => (y < yT + 30 ? 1.4 : 1),
      decor(c) {
        bricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // the bottom of the name board peeks in at the top
        c.fillStyle = '#4a3322'; c.fillRect(18, bleed.y0, 324, 62 - bleed.y0);
        c.fillStyle = '#2f4f45'; c.fillRect(30, bleed.y0, 300, 50 - bleed.y0);
        c.fillStyle = '#d8ad4c'; c.fillRect(42, 36, 276, 2);
        // the shop window underneath
        const wx0 = 26, wx1 = 334, wy0 = 380, wy1 = 566;
        c.fillStyle = '#2f4f45'; c.fillRect(wx0 - 10, wy0 - 10, wx1 - wx0 + 20, wy1 - wy0 + 20);
        const gl = c.createLinearGradient(0, wy0, 0, wy1); gl.addColorStop(0, '#1d2f33'); gl.addColorStop(1, '#344a4a');
        c.fillStyle = gl; c.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
        for (const x of [96, 264]) {
          glow(c, x, 420, 80, 'rgba(255,196,120,0.55)');
          c.strokeStyle = '#111'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, wy0); c.lineTo(x, 404); c.stroke();
          c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(x, 412, 14, 9, 0, Math.PI, 0); c.fill();
          c.fillStyle = '#ffe6a8'; c.beginPath(); c.ellipse(x, 412, 9, 3, 0, 0, Math.PI); c.fill();
        }
        c.fillStyle = '#3a2a22'; c.fillRect(wx0, 500, wx1 - wx0, wy1 - 500);
        c.fillStyle = '#5c4434'; c.fillRect(wx0, 500, wx1 - wx0, 5);
        // a cake under a glass dome and the coffee machine on the counter
        c.fillStyle = '#d9cbb0'; c.fillRect(118, 494, 30, 4); c.fillRect(131, 482, 4, 12);
        c.fillStyle = '#efb4ae'; c.fillRect(114, 462, 38, 20); c.fillStyle = '#fff3ea'; c.fillRect(114, 470, 38, 3);
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(133, 482, 30, Math.PI, 0); c.stroke();
        c.fillStyle = '#9aa4ae'; c.fillRect(226, 456, 54, 40); c.fillStyle = '#c87a45'; c.beginPath(); c.ellipse(253, 456, 22, 16, 0, Math.PI, 0); c.fill();
        // reflections on the glass, the mullion and the sill
        c.fillStyle = 'rgba(255,255,255,0.08)';
        for (const [o, w] of [[40, 50], [120, 18], [210, 60]]) { c.beginPath(); c.moveTo(wx0 + o, wy1); c.lineTo(wx0 + o + w, wy1); c.lineTo(wx0 + o + w + 90, wy0); c.lineTo(wx0 + o + 90, wy0); c.closePath(); c.fill(); }
        c.fillStyle = '#2f4f45'; c.fillRect(176, wy0, 8, wy1 - wy0);
        c.fillStyle = '#b9b2a6'; c.fillRect(bleed.x0, wy1 + 10, bleed.x1 - bleed.x0, bleed.y1 - wy1);
        c.fillStyle = '#a39b8f'; for (let x = bleed.x0; x < bleed.x1; x += 46) c.fillRect(x, wy1 + 10, 2, bleed.y1 - wy1);
        // the awning's shadow on the wall and window
        const sg = c.createLinearGradient(0, yV, 0, yV + 70);
        sg.addColorStop(0, 'rgba(30,20,15,0.4)'); sg.addColorStop(1, 'rgba(30,20,15,0)');
        c.fillStyle = sg; c.fillRect(xF0 - 6, yV - 10, xF1 - xF0 + 12, 80);
      },
      clean(c) {
        c.fillStyle = STRIPE_A; c.fillRect(0, yT - 2, W, yB - yT + 4);
        stripes(c, STRIPE_B);
        // darker up under the wall, a soft light along the front edge
        let g = c.createLinearGradient(0, yT, 0, yF);
        g.addColorStop(0, 'rgba(30,20,10,0.34)'); g.addColorStop(0.55, 'rgba(30,20,10,0.06)'); g.addColorStop(1, 'rgba(255,250,235,0.14)');
        c.fillStyle = g; c.fillRect(0, yT, W, yF - yT);
        g = c.createLinearGradient(0, yF, 0, yB);
        g.addColorStop(0, 'rgba(30,20,10,0.3)'); g.addColorStop(0.3, 'rgba(30,20,10,0.02)'); g.addColorStop(1, 'rgba(30,20,10,0.2)');
        c.fillStyle = g; c.fillRect(0, yF, W, yB - yF);
        // canvas weave and the seams between stripes
        field(c, 0, yT, W, yB, 1.5, (x, y) => { const v = nz.n2(x * 0.9, y * 0.9); return v > 0.5 ? [255, 255, 255, (v - 0.5) * 50] : [0, 0, 0, (0.5 - v) * 34]; });
        c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1;
        for (let k = 1; k < N; k++) { c.beginPath(); c.moveTo(at(k, yT), yT); c.lineTo(at(k, yF), yF); c.lineTo(xF0 + sw * k, yB); c.stroke(); }
      },
      dirt(c) {
        // faded, grubby stripes that barely show
        c.fillStyle = '#cbbfa6'; c.fillRect(0, yT - 2, W, yB - yT + 4);
        stripes(c, '#76897a');
        const g = ramp(['#5f5444', '#74685a', '#8c8170']);
        field(c, 0, yT, W, yB, 2, (x, y) => {
          const v = nz.fbm(x * 0.02, y * 0.03, 5), streak = nz.n2(x * 0.12, y * 0.006);
          return [...g(v), 110 + v * 100 + streak * 60];
        });
        // green algae creeping in from the wall and the edges
        field(c, 0, yT, W, yB, 2, (x, y) => {
          const v = nz.fbm(x * 0.03 + 70, y * 0.03, 4) + (y < yT + 50 ? 0.15 : 0) + (x < 60 || x > 300 ? 0.1 : 0);
          return [84, 108, 50, Math.max(0, v - 0.52) * 560];
        });
        // dirty water has run down the slope
        for (let i = 0; i < 70; i++) {
          const k = r() * N, y = yT + r() * (yF - yT) * 0.7, l = 40 + r() * 110;
          c.strokeStyle = `rgba(55,45,32,${0.15 + r() * 0.2})`; c.lineWidth = 1 + r() * 2.5;
          c.beginPath(); c.moveTo(at(k, y), y); c.lineTo(at(k, Math.min(yF, y + l)), Math.min(yF, y + l)); c.stroke();
        }
        // tide marks along the scallops
        c.strokeStyle = 'rgba(60,48,32,0.35)'; c.lineWidth = 2;
        for (let k = 0; k < N; k++) { c.beginPath(); c.arc(xF0 + sw * (k + 0.5), yV - 3, sw / 2 - 3, 0.2, Math.PI - 0.2); c.stroke(); }
        for (let i = 0; i < 6; i++) dropping(c, r, 40 + r() * 280, yT + 20 + r() * 200, 4 + r() * 3);
        for (let i = 0; i < 26; i++) { const y = yF - Math.pow(r(), 2) * (yF - yT); deadLeaf(c, r, at(r() * N, y), y, 6 + r() * 5); }
        cobweb(c, xT0, yT, 0, 60);
        cobweb(c, xT1, yT, Math.PI / 2, 50);
      },
      top(c) {
        // the roller box along the wall
        c.fillStyle = '#29332f'; c.beginPath(); c.roundRect(xT0 - 12, yT - 16, xT1 - xT0 + 24, 18, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(xT0 - 8, yT - 14, xT1 - xT0 + 16, 3);
        // arms from the wall out to the front rail
        c.strokeStyle = '#2b2b30'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(xT0 - 4, yT + 4); c.lineTo(xF0 + 2, yF); c.moveTo(xT1 + 4, yT + 4); c.lineTo(xF1 - 2, yF); c.stroke();
        // the front rail with brass ends
        c.fillStyle = '#2b2b30'; c.beginPath(); c.roundRect(xF0 - 6, yF - 3, xF1 - xF0 + 12, 6, 3); c.fill();
        c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(xF0 - 6, yF, 5, 0, 7); c.arc(xF1 + 6, yF, 5, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(xF0 - 7.5, yF - 1.5, 1.8, 0, 7); c.arc(xF1 + 4.5, yF - 1.5, 1.8, 0, 7); c.fill();
      },
    };
  }

  // ------------------------------------------------------------------- SIGN
  // The name board over the café front, painted in the player's colour.
  // Gold-leaf letters with a dark outline read on every colour in the paint
  // box, and they sit above the paint so the brush never covers them.
  function sign(S) {
    const { r, nz, bleed, opts } = S;
    // the café's sign by default; other places bring their own words, a paw
    // instead of the cup, and a barn wall instead of the café front
    const title = opts.title || 'CAFÉ', sub = opts.sub || '· COFFEE & CAKE ·';
    // the canal's sign (the one with the fish) hangs on the lock-keeper's cottage
    const lock = opts.lock || opts.icon === 'fish';
    const ghostTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const ox0 = 20, oy0 = 160, ox1 = 340, oy1 = 392, f = 16;
    const ix0 = ox0 + f, iy0 = oy0 + f, ix1 = ox1 - f, iy1 = oy1 - f, cx = (ix0 + ix1) / 2;
    const region = new Path2D();
    region.rect(ix0, iy0, ix1 - ix0, iy1 - iy0);
    const seams = [iy0 + (iy1 - iy0) / 3, iy0 + ((iy1 - iy0) * 2) / 3];
    const FONT = 'Georgia, "Times New Roman", serif';
    function gold(c, y0, y1) {
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#fff3c0'); g.addColorStop(0.45, '#e9bd55'); g.addColorStop(0.56, '#b8822a'); g.addColorStop(1, '#f2d37e');
      return g;
    }
    function letters(c, text, y, size, ghost) {
      c.save();
      c.font = `bold ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (ghost) { c.fillStyle = ghost; c.fillText(text, cx, y); c.restore(); return; }
      c.lineJoin = 'round';
      c.fillStyle = 'rgba(30,20,10,0.5)'; c.fillText(text, cx + size * 0.05, y + size * 0.06);
      c.strokeStyle = '#3a2814'; c.lineWidth = Math.max(2.5, size * 0.09); c.strokeText(text, cx, y);
      c.fillStyle = gold(c, y - size * 0.45, y + size * 0.45); c.fillText(text, cx, y);
      c.restore();
    }
    // shrink a word until it fits the board with a margin
    function fit(c, text, size) {
      c.save(); c.font = `bold ${size}px ${FONT}`; const w = c.measureText(text).width; c.restore();
      const max = ix1 - ix0 - 32;
      return w > max ? Math.floor((size * max) / w) : size;
    }
    function pawIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.ellipse(0, s * 0.35, s * 0.62, s * 0.5, 0, 0, 7);
        for (const [dx, dy] of [[-0.66, -0.28], [-0.24, -0.66], [0.24, -0.66], [0.66, -0.28]]) { c.moveTo(dx * s + s * 0.24, dy * s); c.ellipse(dx * s, dy * s, s * 0.24, s * 0.3, 0, 0, 7); }
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.restore();
    }
    function cup(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
      const body = () => { c.beginPath(); c.moveTo(-s, -s * 0.35); c.lineTo(s, -s * 0.35); c.quadraticCurveTo(s * 0.95, s * 0.75, 0, s * 0.75); c.quadraticCurveTo(-s * 0.95, s * 0.75, -s, -s * 0.35); c.closePath(); };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5;
      body(); c.stroke();
      c.beginPath(); c.arc(s * 1.05, s * 0.05, s * 0.32, -1.3, 1.6); c.stroke();
      c.beginPath(); c.ellipse(0, s * 0.85, s * 1.35, s * 0.22, 0, 0, 7); c.stroke();
      for (const dx of [-s * 0.35, s * 0.3]) { c.beginPath(); c.moveTo(dx, -s * 0.6); c.bezierCurveTo(dx - s * 0.3, -s * 0.9, dx + s * 0.3, -s * 1.1, dx, -s * 1.45); c.stroke(); }
      c.strokeStyle = c.fillStyle = gold(c, -s * 1.4, s);
      c.lineWidth = 2.2;
      body(); c.fill();
      c.beginPath(); c.arc(s * 1.05, s * 0.05, s * 0.32, -1.3, 1.6); c.stroke();
      c.beginPath(); c.ellipse(0, s * 0.85, s * 1.35, s * 0.22, 0, 0, 7); c.fill();
      for (const dx of [-s * 0.35, s * 0.3]) { c.beginPath(); c.moveTo(dx, -s * 0.6); c.bezierCurveTo(dx - s * 0.3, -s * 0.9, dx + s * 0.3, -s * 1.1, dx, -s * 1.45); c.stroke(); }
      c.restore();
    }
    function fishIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(-s * 1.1, 0);
        c.quadraticCurveTo(-s * 0.2, -s * 0.85, s * 0.72, -s * 0.1);
        c.lineTo(s * 1.25, -s * 0.55); c.lineTo(s * 1.12, 0); c.lineTo(s * 1.25, s * 0.55); c.lineTo(s * 0.72, s * 0.1);
        c.quadraticCurveTo(-s * 0.2, s * 0.85, -s * 1.1, 0); c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.fillStyle = '#3a2814'; c.beginPath(); c.arc(-s * 0.62, -s * 0.12, s * 0.12, 0, 7); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(-s * 0.32, 0, s * 0.34, -1.1, 1.1); c.stroke();
      for (const dx of [0.05, 0.3]) { c.beginPath(); c.arc(s * dx, 0, s * 0.22, -0.9, 0.9); c.stroke(); }
      c.restore();
    }
    function bookIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(0, -s * 0.55);
        c.quadraticCurveTo(-s * 0.6, -s * 0.85, -s * 1.3, -s * 0.6); c.lineTo(-s * 1.3, s * 0.6);
        c.quadraticCurveTo(-s * 0.6, s * 0.35, 0, s * 0.65);
        c.quadraticCurveTo(s * 0.6, s * 0.35, s * 1.3, s * 0.6); c.lineTo(s * 1.3, -s * 0.6);
        c.quadraticCurveTo(s * 0.6, -s * 0.85, 0, -s * 0.55); c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      // the spine and a few lines of print on each page
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(0, -s * 0.5); c.lineTo(0, s * 0.6); c.stroke();
      c.lineWidth = 1.2;
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const yy = -s * 0.22 + k * s * 0.24; c.beginPath(); c.moveTo(sd * s * 0.25, yy); c.quadraticCurveTo(sd * s * 0.7, yy - s * 0.12, sd * s * 1.08, yy - s * 0.02); c.stroke(); }
      c.restore();
    }
    // sun-bleached grey planks running along the board
    function oldWood(c) {
      const g = ramp(['#746d66', '#88817a', '#9b948a', '#aea79c']);
      field(c, ix0, iy0, ix1, iy1, 1.5, (x, y) => g(nz.fbm(x * 0.008, y * 0.09, 4) * 0.85 + nz.n2(x * 0.05, y * 0.7) * 0.15));
      for (let i = 0; i < 160; i++) {
        const x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0), l = 30 + r() * 90;
        c.strokeStyle = r() < 0.7 ? 'rgba(55,48,40,0.35)' : 'rgba(255,255,255,0.16)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y + (r() - 0.5) * 4, x + l, y + (r() - 0.5) * 3); c.stroke();
      }
    }
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (x < ix0 + 12 || x > ix1 - 12 || y < iy0 + 12 || y > iy1 - 12 ? 1.35 : 1),
      decor(c) {
        if (lock) {
          // the lock-keeper's whitewashed wall with a window and geraniums,
          // and the lock below: grass, the black and white beam, dark water
          const { x0, y0, x1, y1 } = bleed;
          field(c, x0, y0, x1, 446, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.03, 3); return [240 - v * 22, 236 - v * 22, 226 - v * 24]; });
          c.fillStyle = '#f7f3ea'; c.fillRect(128, y0, 104, 102 - y0);
          const gl = c.createLinearGradient(0, y0, 0, 92); gl.addColorStop(0, '#9ec9de'); gl.addColorStop(1, '#d8ecf2');
          c.fillStyle = gl; c.fillRect(136, y0, 88, 92 - y0);
          c.fillStyle = '#f7f3ea'; c.fillRect(177, y0, 6, 92 - y0); c.fillRect(136, 44, 88, 5);
          c.fillStyle = '#4b4a52'; c.fillRect(120, 96, 120, 10);
          for (let i = 0; i < 7; i++) {
            const x = 140 + i * 13;
            c.fillStyle = '#4f8a3a'; c.beginPath(); c.ellipse(x, 92, 7, 5, r(), 0, 7); c.fill();
            c.fillStyle = U.pick(r, ['#e0485a', '#f06a7e', '#d93b4f']); c.beginPath(); c.arc(x + (r() - 0.5) * 6, 86 - r() * 6, 3.6, 0, 7); c.fill();
          }
          c.fillStyle = '#6d9a58'; c.fillRect(x0, 440, x1 - x0, 34);
          const wg = c.createLinearGradient(0, 474, 0, y1); wg.addColorStop(0, '#2c463b'); wg.addColorStop(1, '#436452');
          c.fillStyle = wg; c.fillRect(x0, 474, x1 - x0, y1 - 474);
          c.fillStyle = 'rgba(214,234,226,0.35)'; for (let i = 0; i < 24; i++) c.fillRect(x0 + r() * (x1 - x0), 480 + r() * Math.max(1, y1 - 486), 8 + r() * 20, 1.2);
          c.fillStyle = '#1f2124'; c.fillRect(x0, 452, x1 - x0, 16);
          c.fillStyle = '#f4f1ea'; c.fillRect(x1 - 70, 452, 70, 16);
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x0, 452, x1 - x0, 3);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.farm) {
          // barn-red boards, a hayloft door with straw poking out, and the farm gate
          field(c, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 3, (x, y) => { const v = nz.fbm(x * 0.01, y * 0.04, 3); return [166 + v * 26, 72 + v * 16, 54 + v * 12]; });
          for (let x = Math.floor(bleed.x0 / 24) * 24; x < bleed.x1; x += 24) {
            c.fillStyle = 'rgba(60,20,12,0.35)'; c.fillRect(x, bleed.y0, 2, bleed.y1 - bleed.y0);
            c.fillStyle = 'rgba(255,220,200,0.08)'; c.fillRect(x + 2, bleed.y0, 1.5, bleed.y1 - bleed.y0);
          }
          c.fillStyle = '#7a3426'; c.fillRect(130, bleed.y0, 100, 112 - bleed.y0);
          c.strokeStyle = '#f4ecdc'; c.lineWidth = 6; c.strokeRect(133, 6, 94, 102);
          c.beginPath(); c.moveTo(133, 6); c.lineTo(227, 108); c.moveTo(227, 6); c.lineTo(133, 108); c.stroke();
          c.strokeStyle = '#e8c35a'; c.lineWidth = 1.6; c.lineCap = 'round';
          for (let i = 0; i < 26; i++) { const x = 136 + r() * 88; c.beginPath(); c.moveTo(x, 110); c.lineTo(x + (r() - 0.5) * 14, 118 + r() * 12); c.stroke(); }
          c.fillStyle = '#f4ecdc';
          for (const x of [24, 324]) c.fillRect(x, 420, 12, bleed.y1 - 420);
          for (const y of [436, 470, 504, 538]) c.fillRect(24, y, 312, 9);
          c.save(); c.beginPath(); c.rect(36, 436, 288, 111); c.clip();
          c.lineWidth = 9; c.strokeStyle = '#f4ecdc'; c.beginPath(); c.moveTo(36, 547); c.lineTo(324, 436); c.stroke();
          c.restore();
          c.fillStyle = 'rgba(0,0,0,0.15)'; for (const y of [445, 479, 513, 547]) c.fillRect(24, y, 312, 2);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        bricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // a first-floor window with a box of geraniums
        c.fillStyle = '#efe7d8'; c.fillRect(118, bleed.y0, 124, 100 - bleed.y0);
        const gl = c.createLinearGradient(0, bleed.y0, 0, 88); gl.addColorStop(0, '#9ec9de'); gl.addColorStop(1, '#d8ecf2');
        c.fillStyle = gl; c.fillRect(128, bleed.y0, 104, 88 - bleed.y0);
        c.fillStyle = '#efe7d8'; c.fillRect(177, bleed.y0, 6, 88 - bleed.y0);
        c.fillStyle = '#efb4ae'; c.beginPath(); c.moveTo(128, bleed.y0); c.lineTo(150, bleed.y0); c.quadraticCurveTo(138, 40, 146, 88); c.lineTo(128, 88); c.fill();
        c.fillStyle = '#8a5a3c'; c.fillRect(110, 92, 140, 18);
        for (let i = 0; i < 9; i++) {
          const x = 118 + i * 15.5;
          c.fillStyle = '#4f8a3a'; c.beginPath(); c.ellipse(x, 90, 8, 5, r(), 0, 7); c.fill();
          c.fillStyle = U.pick(r, ['#e0485a', '#f06a7e', '#d93b4f']); c.beginPath(); c.arc(x + (r() - 0.5) * 6, 84 - r() * 6, 4, 0, 7); c.fill();
        }
        // the top of the striped awning below the board
        const ay = 432;
        c.fillStyle = '#29332f'; c.beginPath(); c.roundRect(28, ay - 16, 304, 18, 5); c.fill();
        c.save(); c.beginPath(); c.moveTo(40, ay); c.lineTo(320, ay); c.lineTo(346, bleed.y1); c.lineTo(14, bleed.y1); c.closePath(); c.clip();
        c.fillStyle = STRIPE_A; c.fillRect(0, ay, W, bleed.y1 - ay);
        c.fillStyle = STRIPE_B;
        for (let k = 1; k < 9; k += 2) { const xa = 40 + (280 * k) / 9, xb = 40 + (280 * (k + 1)) / 9; c.beginPath(); c.moveTo(xa, ay); c.lineTo(xb, ay); c.lineTo(14 + (332 * (k + 1)) / 9, bleed.y1); c.lineTo(14 + (332 * k) / 9, bleed.y1); c.closePath(); c.fill(); }
        const g = c.createLinearGradient(0, ay, 0, ay + 90); g.addColorStop(0, 'rgba(30,20,10,0.35)'); g.addColorStop(1, 'rgba(30,20,10,0)');
        c.fillStyle = g; c.fillRect(0, ay, W, 90);
        c.restore();
        const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
        softShadow(c, board, 12, 0.45, 4, 7);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // grain and plank seams so the paint reads as wood
        for (let i = 0; i < 200; i++) {
          const x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0), l = 30 + r() * 90;
          c.strokeStyle = r() < 0.7 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)'; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (r() - 0.5) * 2); c.stroke();
        }
        for (const y of seams) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(ix0, y - 1, ix1 - ix0, 2); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(ix0, y + 1, ix1 - ix0, 1.5); }
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(ix0, iy0, ix1 - ix0, 5); c.fillRect(ix0, iy0, 5, iy1 - iy0);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(ix0, iy1 - 4, ix1 - ix0, 4); c.fillRect(ix1 - 4, iy0, 4, iy1 - iy0);
        // a gold line just inside the edge, with little diamonds in the corners
        c.strokeStyle = '#3a2814'; c.lineWidth = 4; c.strokeRect(ix0 + 13, iy0 + 13, ix1 - ix0 - 26, iy1 - iy0 - 26);
        c.strokeStyle = '#e2b850'; c.lineWidth = 2; c.strokeRect(ix0 + 13, iy0 + 13, ix1 - ix0 - 26, iy1 - iy0 - 26);
        for (const [x, y] of [[ix0 + 13, iy0 + 13], [ix1 - 13, iy0 + 13], [ix0 + 13, iy1 - 13], [ix1 - 13, iy1 - 13]]) {
          c.fillStyle = '#3a2814'; c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 8, y); c.lineTo(x, y + 8); c.lineTo(x - 8, y); c.closePath(); c.fill();
          c.fillStyle = '#e9bd55'; c.beginPath(); c.moveTo(x, y - 5.5); c.lineTo(x + 5.5, y); c.lineTo(x, y + 5.5); c.lineTo(x - 5.5, y); c.closePath(); c.fill();
        }
        if (opts.icon === 'paw') pawIcon(c, cx, iy0 + 46, 15);
        else if (opts.icon === 'fish') fishIcon(c, cx, iy0 + 46, 17);
        else if (opts.icon === 'book') bookIcon(c, cx, iy0 + 47, 16);
        else cup(c, cx, iy0 + 44, 14);
        letters(c, title, iy0 + 112, fit(c, title, 86));
        letters(c, sub, iy1 - 32, fit(c, sub, 17));
      },
      dirt(c) {
        oldWood(c);
        // the ghost of the old lettering
        letters(c, ghostTitle, iy0 + 112, fit(c, ghostTitle, 82), 'rgba(235,225,200,0.15)');
        peelingPaint(c, r, ix0, iy0, ix1, iy1, 44, '#a3b7b1');
        for (const y of seams) { c.fillStyle = 'rgba(40,34,28,0.5)'; c.fillRect(ix0, y - 1.5, ix1 - ix0, 3); }
        c.strokeStyle = 'rgba(50,42,34,0.55)'; c.lineWidth = 0.9;
        for (let i = 0; i < 10; i++) {
          let x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0);
          c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 6; k++) { x += 6 + r() * 12; y += (r() - 0.5) * 5; c.lineTo(x, y); }
          c.stroke();
        }
        grime(c, r, ix0, iy0, ix1, iy1, 18);
        const g = c.createLinearGradient(0, iy1 - 50, 0, iy1); g.addColorStop(0, 'rgba(60,50,35,0)'); g.addColorStop(1, 'rgba(60,50,35,0.45)');
        c.fillStyle = g; c.fillRect(ix0, iy1 - 50, ix1 - ix0, 50);
        dropping(c, r, 250, iy0 + 30, 6);
        dropping(c, r, 92, iy0 + 120, 5);
        cobweb(c, ix0, iy0, 0, 64);
      },
      top(c) {
        // the moulded frame
        c.fillStyle = '#4a3322';
        c.beginPath(); c.rect(ox0, oy0, ox1 - ox0, oy1 - oy0); c.rect(ix1, iy0, ix0 - ix1, iy1 - iy0); c.fill('evenodd');
        c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(ox0, oy0, ox1 - ox0, 4); c.fillRect(ox0, oy0, 4, oy1 - oy0);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(ox0, oy1 - 4, ox1 - ox0, 4); c.fillRect(ox1 - 4, oy0, 4, oy1 - oy0);
        c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(ix0 - 3, iy0 - 3, ix1 - ix0 + 6, 3); c.fillRect(ix0 - 3, iy0, 3, iy1 - iy0);
        for (const [x, y] of [[ox0 + 8, oy0 + 8], [ox1 - 8, oy0 + 8], [ox0 + 8, oy1 - 8], [ox1 - 8, oy1 - 8]]) {
          c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill();
          c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(x - 1, y - 1, 1.6, 0, 7); c.fill();
        }
        // two gooseneck lamps lighting the board
        for (const x of [96, 264]) {
          c.fillStyle = 'rgba(255,240,200,0.1)';
          c.beginPath(); c.moveTo(x - 10, 134); c.lineTo(x + 10, 134); c.lineTo(x + 58, 300); c.lineTo(x - 58, 300); c.closePath(); c.fill();
          c.fillStyle = '#2b2b30'; c.fillRect(x - 6, 104, 12, 8);
          c.strokeStyle = '#2b2b30'; c.lineWidth = 3; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x, 108); c.quadraticCurveTo(x, 84, x + 10, 96); c.quadraticCurveTo(x + 12, 112, x, 122); c.stroke();
          c.fillStyle = '#2f4f45'; c.beginPath(); c.moveTo(x - 13, 134); c.lineTo(x + 13, 134); c.lineTo(x + 5, 120); c.lineTo(x - 5, 120); c.closePath(); c.fill();
          c.fillStyle = '#fff1c4'; c.beginPath(); c.ellipse(x, 134, 11, 3, 0, 0, Math.PI); c.fill();
        }
      },
      stamp: paintStamp,
    };
  }

  // ----------------------------------------------------------------- TABLES
  // Bistro tables from above: marble tops on the tiled floor.
  function tables(S) {
    const { r, nz, bleed } = S;
    const T = [
      { x: 106, y: 152, R: 64, chairs: [-2.5, 0.5] }, { x: 260, y: 268, R: 60, chairs: [-0.9, 2.3] },
      { x: 108, y: 402, R: 62, chairs: [-2.0, 1.2] }, { x: 262, y: 516, R: 56, chairs: [-1.4, 0.2] },
    ];
    const things = [
      { t: 0, dx: 24, dy: -20, r: 10, kind: 'vase' }, { t: 1, dx: -22, dy: 16, r: 11, kind: 'sugar' },
      { t: 2, dx: 20, dy: 18, r: 9, kind: 'candle' }, { t: 3, dx: -16, dy: -12, r: 6, kind: 'salt' }, { t: 3, dx: -1, dy: -18, r: 6, kind: 'pepper' },
    ].map((o) => Object.assign(o, { x: T[o.t].x + o.dx, y: T[o.t].y + o.dy }));
    const region = new Path2D();
    for (const t of T) { region.moveTo(t.x + t.R - 6, t.y); region.arc(t.x, t.y, t.R - 6, 0, Math.PI * 2); }
    for (const o of things) { region.moveTo(o.x + o.r, o.y); region.arc(o.x, o.y, o.r, 0, Math.PI * 2); }
    function marble(c, t, dull) {
      const base = dull ? ramp(['#b3a690', '#c3b7a2', '#cfc4b0']) : ramp(['#e5e1da', '#f1eee8', '#fbfaf7']);
      field(c, t.x - t.R, t.y - t.R, t.x + t.R, t.y + t.R, 1.5, (x, y) => base(nz.fbm(x * 0.04 + t.x, y * 0.04, 4)));
      c.strokeStyle = dull ? 'rgba(110,95,75,0.3)' : 'rgba(118,118,130,0.35)'; c.lineWidth = 0.9;
      for (let k = 0; k < 7; k++) {
        let x = t.x + (r() - 0.5) * t.R * 1.6, y = t.y + (r() - 0.5) * t.R * 1.6;
        const a = r() * 6.28;
        c.beginPath(); c.moveTo(x, y);
        for (let s = 0; s < 12; s++) { x += Math.cos(a + (r() - 0.5) * 1.6) * 9; y += Math.sin(a + (r() - 0.5) * 1.6) * 9; c.lineTo(x, y); }
        c.stroke();
      }
    }
    function chair(c, x, y, a) {
      c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(x + 4, y + 5, 19, 0, 7); c.fill();
      c.fillStyle = '#7a4b2e'; c.beginPath(); c.arc(x, y, 19, 0, 7); c.fill();
      c.fillStyle = '#dcc28a'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill();
      c.strokeStyle = 'rgba(150,110,50,0.45)'; c.lineWidth = 0.8;
      c.save(); c.beginPath(); c.arc(x, y, 15, 0, 7); c.clip();
      for (let k = -20; k <= 20; k += 4) { c.beginPath(); c.moveTo(x + k - 20, y - 20); c.lineTo(x + k + 20, y + 20); c.moveTo(x + k + 20, y - 20); c.lineTo(x + k - 20, y + 20); c.stroke(); }
      c.restore();
      c.strokeStyle = '#5e3a24'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.arc(x, y, 21, a - 1.1, a + 1.1); c.stroke();
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => { for (const t of T) { const d = Math.hypot(x - t.x, y - t.y); if (d < t.R) return d > t.R - 16 ? 1.3 : 1; } return 1; },
      decor(c) {
        checker(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, TILE_A, TILE_B);
        for (const t of T) for (const a of t.chairs) chair(c, t.x + Math.cos(a) * (t.R + 12), t.y + Math.sin(a) * (t.R + 12), a);
        for (const t of T) {
          const p = new Path2D(); p.arc(t.x, t.y, t.R, 0, Math.PI * 2);
          softShadow(c, p, 10, 0.4, 5, 7);
          c.fillStyle = '#b8913d'; c.fill(p);
          c.strokeStyle = '#e3c26e'; c.lineWidth = 2; c.beginPath(); c.arc(t.x, t.y, t.R - 2, 3.4, 5.4); c.stroke();
          c.strokeStyle = '#8a6a26'; c.beginPath(); c.arc(t.x, t.y, t.R - 2, 0.3, 2.3); c.stroke();
        }
      },
      clean(c) {
        for (const t of T) {
          marble(c, t, false);
          const g = c.createRadialGradient(t.x - t.R * 0.35, t.y - t.R * 0.4, 2, t.x, t.y, t.R);
          g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(120,110,100,0.18)');
          c.fillStyle = g; c.beginPath(); c.arc(t.x, t.y, t.R, 0, 7); c.fill();
        }
      },
      cleanOver(c) {
        // the window reflected in each polished top
        for (const t of T) {
          c.save(); c.translate(t.x + t.R * 0.15, t.y - t.R * 0.2); c.rotate(-0.6);
          c.fillStyle = 'rgba(255,255,255,0.24)'; c.fillRect(-t.R * 0.6, -6, t.R * 1.2, 7);
          c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(-t.R * 0.5, 6, t.R, 3);
          c.restore();
        }
      },
      dirt(c) {
        for (const t of T) {
          marble(c, t, true);
          // an old greasy film, thicker in places
          field(c, t.x - t.R, t.y - t.R, t.x + t.R, t.y + t.R, 2, (x, y) => [120, 100, 75, 60 + nz.fbm(x * 0.05 + 9, y * 0.05, 4) * 120]);
          // coffee rings, some of them twice
          for (let k = 0; k < 5; k++) {
            const a = r() * 6.28, d = r() * t.R * 0.6, x = t.x + Math.cos(a) * d, y = t.y + Math.sin(a) * d, s = 9 + r() * 4;
            for (let n = 0; n < 2; n++) {
              c.strokeStyle = `rgba(105,62,30,${0.35 + r() * 0.3})`; c.lineWidth = 1.5 + r() * 1.5;
              c.beginPath(); c.arc(x + n * (r() - 0.5) * 6, y + n * (r() - 0.5) * 6, s, 0, 7); c.stroke();
            }
            c.fillStyle = 'rgba(105,62,30,0.12)'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
          }
          // jam and honey smears
          for (let k = 0; k < 3; k++) {
            const x = t.x + (r() - 0.5) * t.R, y = t.y + (r() - 0.5) * t.R, a = r() * 6.28;
            c.save(); c.translate(x, y); c.rotate(a);
            c.fillStyle = U.pick(r, ['rgba(168,40,58,0.6)', 'rgba(120,30,70,0.55)', 'rgba(214,150,40,0.55)']);
            c.beginPath(); c.moveTo(-12, -3); c.quadraticCurveTo(0, -9, 14, -2); c.quadraticCurveTo(16, 4, 4, 5); c.quadraticCurveTo(-10, 7, -12, -3); c.fill();
            c.restore();
          }
          // crumbs and spilled sugar
          for (let k = 0; k < 40; k++) {
            const a = r() * 6.28, d = Math.sqrt(r()) * (t.R - 8);
            c.fillStyle = U.pick(r, ['#c98e4a', '#a8702e', '#e2b46a', '#8c5a2b']);
            c.fillRect(t.x + Math.cos(a) * d, t.y + Math.sin(a) * d, 1.5 + r() * 2.5, 1.5 + r() * 2);
          }
          const sx = t.x + (r() - 0.5) * t.R * 0.8, sy = t.y + (r() - 0.5) * t.R * 0.8;
          c.fillStyle = 'rgba(255,255,255,0.9)';
          for (let k = 0; k < 70; k++) c.fillRect(sx + (r() - 0.5) * 22, sy + (r() - 0.5) * 14, 1.1, 1.1);
        }
        paperScrap(c, r, T[1].x + 22, T[1].y - 18, 11);
        paperScrap(c, r, T[2].x - 26, T[2].y + 8, 10);
        // an abandoned teaspoon
        c.save(); c.translate(T[0].x - 24, T[0].y + 22); c.rotate(0.6);
        c.fillStyle = '#9aa1a8'; c.fillRect(-18, -1.5, 22, 3); c.beginPath(); c.ellipse(9, 0, 7, 4.5, 0, 0, 7); c.fill();
        c.restore();
      },
      top(c) {
        for (const o of things) {
          c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(o.x + 3, o.y + 4, o.r, 0, 7); c.fill();
          if (o.kind === 'vase') {
            c.fillStyle = '#5f8fc7'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; c.fillStyle = '#f7a1b5'; c.beginPath(); c.arc(o.x + Math.cos(a) * 6, o.y + Math.sin(a) * 6, 4, 0, 7); c.fill(); }
            c.fillStyle = '#f7c548'; c.beginPath(); c.arc(o.x, o.y, 3, 0, 7); c.fill();
          } else if (o.kind === 'sugar') {
            c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            c.strokeStyle = '#d9d2c4'; c.lineWidth = 1.2; c.beginPath(); c.arc(o.x, o.y, o.r - 3, 0, 7); c.stroke();
            c.fillStyle = '#e9e2d3'; c.beginPath(); c.arc(o.x, o.y, 3, 0, 7); c.fill();
          } else if (o.kind === 'candle') {
            c.fillStyle = 'rgba(220,235,240,0.75)'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            c.fillStyle = '#f6eedc'; c.beginPath(); c.arc(o.x, o.y, o.r - 3, 0, 7); c.fill();
            glow(c, o.x, o.y, 16, 'rgba(255,214,140,0.5)');
            c.fillStyle = '#ffcf5a'; c.beginPath(); c.arc(o.x, o.y, 2, 0, 7); c.fill();
          } else {
            c.fillStyle = '#e4e8ec'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            c.fillStyle = '#aab1b8'; c.beginPath(); c.arc(o.x, o.y, o.r - 2, 0, 7); c.fill();
            c.fillStyle = o.kind === 'salt' ? '#ffffff' : '#3d3d42';
            for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283; c.beginPath(); c.arc(o.x + Math.cos(a) * 1.8, o.y + Math.sin(a) * 1.8, 0.8, 0, 7); c.fill(); }
          }
        }
      },
    };
  }

  // ---------------------------------------------------------------- COUNTER
  // The old espresso machine on the counter, front on: chrome body, copper
  // dome, and a counter front of green glazed tiles.
  function counter(S) {
    const { r, nz, bleed } = S;
    const bx0 = 92, bx1 = 268, by0 = 214, by1 = 376;
    const dcx = 180, drx = 74, dry = 66;
    const ctop = 376, cf = 396, cb = 560;
    const gauge = { x: 180, y: 258, r: 17 };
    const groups = [{ x: 134, y: 318 }, { x: 226, y: 318 }];
    const outline = (p) => {
      p.moveTo(bx0, by1); p.lineTo(bx0, by0); p.lineTo(dcx - drx, by0);
      p.ellipse(dcx, by0, drx, dry, 0, Math.PI, 0);
      p.lineTo(bx1, by0); p.lineTo(bx1, by1); p.closePath();
      return p;
    };
    const machine = outline(new Path2D());
    const region = outline(new Path2D());
    region.rect(0, cf, W, cb - cf);
    region.moveTo(gauge.x + gauge.r, gauge.y); region.arc(gauge.x, gauge.y, gauge.r, 0, Math.PI * 2);
    for (const g of groups) region.rect(g.x - 17, g.y - 12, 34, 24);
    function tiles(c, dull) {
      const s = 30;
      c.fillStyle = dull ? '#a69d88' : '#e8e1d0'; c.fillRect(0, cf, W, cb - cf);
      for (let y = cf; y < cb; y += s) for (let x = -6; x < W; x += s) {
        const v = nz.n2(x * 0.11, y * 0.11);
        c.fillStyle = dull ? U.shade('#4f6d5e', (v - 0.5) * 0.3) : U.shade('#2f7d65', (v - 0.5) * 0.35);
        c.fillRect(x + 1.5, y + 1.5, s - 3, s - 3);
        if (!dull) {
          const g = c.createLinearGradient(x, y, x + s, y + s);
          g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
          c.fillStyle = g; c.fillRect(x + 1.5, y + 1.5, s - 3, s - 3);
        }
      }
    }
    return {
      family: 'scrub', particle: 'dust', region,
      tough: (x, y) => (nz.fbm(x * 0.05 + 11, y * 0.05, 4) > 0.6 ? 1.5 : 1),
      decor(c) {
        // cream metro tiles on the back wall
        c.fillStyle = '#d8cfbf'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, ctop - bleed.y0);
        for (let row = 0, y = bleed.y0; y < ctop; y += 15, row++) {
          for (let x = bleed.x0 - (row % 2 ? 16 : 0); x < bleed.x1; x += 32) {
            c.fillStyle = U.shade('#f1eadc', (nz.n2(x * 0.07, y * 0.07) - 0.5) * 0.06); c.fillRect(x + 1, y + 1, 30, 13);
            c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x + 2, y + 2, 26, 2);
          }
        }
        // shelves with cups either side
        for (const [x0, x1] of [[bleed.x0, 78], [282, bleed.x1]]) {
          c.fillStyle = '#7a5236'; c.fillRect(x0, 136, x1 - x0, 7);
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x0, 143, x1 - x0, 6);
          for (let x = Math.max(x0, -10) + 10; x < x1 - 14; x += 22) {
            c.fillStyle = U.pick(r, ['#f7f3ea', '#efb4ae', '#a6d3d4', '#f2d88a']);
            c.beginPath(); c.moveTo(x - 8, 118); c.lineTo(x + 8, 118); c.lineTo(x + 6, 136); c.lineTo(x - 6, 136); c.closePath(); c.fill();
            c.strokeStyle = c.fillStyle; c.lineWidth = 2; c.beginPath(); c.arc(x + 9, 126, 3.5, -1.2, 1.4); c.stroke();
          }
        }
        softShadow(c, machine, 14, 0.4, 6, 6);
        // marble counter top
        c.fillStyle = '#e6e0d4'; c.fillRect(bleed.x0, ctop, bleed.x1 - bleed.x0, cf - ctop);
        c.fillStyle = '#f7f3ec'; c.fillRect(bleed.x0, ctop, bleed.x1 - bleed.x0, 4);
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(bleed.x0, cf - 4, bleed.x1 - bleed.x0, 4);
        // a stack of cups to the right, a cake under glass to the left
        for (let k = 0; k < 4; k++) {
          const y = ctop - 6 - k * 15, x = 316;
          c.fillStyle = '#e9e2d3'; c.beginPath(); c.ellipse(x, y + 4, 20, 4, 0, 0, 7); c.fill();
          c.fillStyle = '#f9f6ef'; c.beginPath(); c.moveTo(x - 13, y - 9); c.lineTo(x + 13, y - 9); c.quadraticCurveTo(x + 12, y + 3, x, y + 3); c.quadraticCurveTo(x - 12, y + 3, x - 13, y - 9); c.fill();
          c.strokeStyle = '#f9f6ef'; c.lineWidth = 2.4; c.beginPath(); c.arc(x + 14, y - 4, 4, -1.4, 1.4); c.stroke();
        }
        c.fillStyle = '#d9cbb0'; c.fillRect(22, ctop - 5, 50, 4); c.fillRect(45, ctop - 14, 4, 10);
        c.fillStyle = '#efb4ae'; c.fillRect(26, ctop - 44, 42, 30);
        c.fillStyle = '#fff3ea'; c.fillRect(26, ctop - 33, 42, 4); c.fillRect(26, ctop - 46, 42, 4);
        c.fillStyle = '#c9474f'; for (const x of [32, 44, 56, 64]) { c.beginPath(); c.arc(x, ctop - 48, 2.6, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(220,240,255,0.18)'; c.beginPath(); c.arc(47, ctop - 14, 34, Math.PI, 0); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 1.5; c.beginPath(); c.arc(47, ctop - 14, 34, Math.PI, 0); c.stroke();
        c.beginPath(); c.arc(47, ctop - 14, 28, Math.PI * 1.15, Math.PI * 1.4); c.stroke();
        // skirting and floor below the counter
        c.fillStyle = '#3e2a1c'; c.fillRect(bleed.x0, cb, bleed.x1 - bleed.x0, 16);
        checker(c, nz, bleed.x0, cb + 16, bleed.x1, bleed.y1, TILE_A, TILE_B);
      },
      clean(c) {
        // polished chrome: bright and dark bands like a drum
        let g = c.createLinearGradient(bx0, 0, bx1, 0);
        for (const [o, col] of [[0, '#5f6873'], [0.14, '#dfe5ea'], [0.3, '#8d97a1'], [0.5, '#f6f9fb'], [0.68, '#a7b0b9'], [0.84, '#e9eef2'], [1, '#6b7480']]) g.addColorStop(o, col);
        c.fillStyle = g; c.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
        // copper dome
        g = c.createLinearGradient(dcx - drx, 0, dcx + drx, 0);
        for (const [o, col] of [[0, '#7a3416'], [0.25, '#c9703f'], [0.45, '#f6bd8c'], [0.6, '#d98a55'], [1, '#8e4320']]) g.addColorStop(o, col);
        c.fillStyle = g; c.beginPath(); c.ellipse(dcx, by0, drx, dry, 0, Math.PI, 0); c.fill();
        c.fillStyle = 'rgba(255,240,220,0.4)'; c.beginPath(); c.ellipse(dcx - 22, by0 - 34, 8, 22, 0.35, 0, 7); c.fill();
        // brass bands and the drip tray grille
        g = c.createLinearGradient(0, by0, 0, by0 + 14);
        g.addColorStop(0, '#f2d88a'); g.addColorStop(0.5, '#c9952a'); g.addColorStop(1, '#8a6a26');
        c.fillStyle = g; c.fillRect(bx0, by0, bx1 - bx0, 14); c.fillRect(bx0, by1 - 30, bx1 - bx0, 6);
        c.fillStyle = '#3d4248'; c.fillRect(bx0 + 10, by1 - 22, bx1 - bx0 - 20, 18);
        c.fillStyle = '#9aa3ad'; for (let x = bx0 + 14; x < bx1 - 12; x += 6) c.fillRect(x, by1 - 20, 3, 14);
        tiles(c, false);
      },
      cleanOver(c) {
        // an enamel name plate on the front
        c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(dcx, 292, 40, 10, 0, 0, 7); c.fill();
        c.fillStyle = '#f7f1e3'; c.beginPath(); c.ellipse(dcx, 292, 37, 8, 0, 0, 7); c.fill();
        c.fillStyle = '#b8443b'; c.font = 'bold 9px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('ESPRESSO', dcx, 292.5);
        // glints on the chrome
        c.fillStyle = 'rgba(255,255,255,0.55)';
        for (const [x, y, h] of [[141, 240, 60], [222, 250, 40], [118, 330, 22]]) c.fillRect(x, y, 3, h);
      },
      dirt(c) {
        // tarnished metal with rust blooming through
        const g = ramp(['#4f4a43', '#615a50', '#746b5e', '#857b6b']);
        field(c, bx0 - 2, by0 - dry - 4, bx1 + 2, by1 + 2, 1.5, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 5)));
        field(c, bx0 - 2, by0 - dry - 4, bx1 + 2, by1 + 2, 2, (x, y) => [150, 78, 32, Math.max(0, nz.fbm(x * 0.05 + 11, y * 0.05, 4) - 0.5) * 620]);
        // white limescale crust round the group heads and on the tray
        for (let i = 0; i < 160; i++) {
          const gp = U.pick(r, groups), x = gp.x + (r() - 0.5) * 70, y = gp.y + 12 + Math.sqrt(r()) * 46;
          c.fillStyle = `rgba(228,224,212,${0.3 + r() * 0.35})`; c.beginPath(); c.arc(x, y, 1.5 + r() * 3.5, 0, 7); c.fill();
        }
        // grime running down from the dome
        for (let i = 0; i < 40; i++) {
          const x = bx0 + r() * (bx1 - bx0), y = by0 - r() * 40, l = 30 + r() * 120;
          c.strokeStyle = `rgba(40,32,24,${0.2 + r() * 0.25})`; c.lineWidth = 1 + r() * 2.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 4, y + l); c.stroke();
        }
        // dust settled on the dome
        c.fillStyle = 'rgba(190,182,168,0.6)'; c.beginPath(); c.ellipse(dcx, by0 - dry * 0.62, drx * 0.7, dry * 0.35, 0, Math.PI, 0); c.fill();
        // the tiled front: dull, grubby, splashed along the bottom
        tiles(c, true);
        field(c, 0, cf, W, cb, 2, (x, y) => [90, 75, 55, 70 + nz.fbm(x * 0.03, y * 0.03, 4) * 110 + (y > cb - 60 ? 60 : 0)]);
        grime(c, r, 0, cf, W, cb, 24);
        for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(95,72,45,${0.3 + r() * 0.4})`; c.beginPath(); c.arc(r() * W, cb - Math.pow(r(), 2) * 70, 1.5 + r() * 4, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(60,50,40,0.5)'; c.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) { const x = r() * W, y = cf + r() * (cb - cf); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20 + r() * 30, y + (r() - 0.5) * 6); c.stroke(); }
        cobweb(c, 0, cb, -Math.PI / 2, 60);
        cobweb(c, W, cb, Math.PI, 56);
        cobweb(c, bx1, by0, -Math.PI / 2 + 0.2, 40);
      },
      top(c) {
        // pressure gauge
        c.fillStyle = '#b8913d'; c.beginPath(); c.arc(gauge.x, gauge.y, gauge.r, 0, 7); c.fill();
        c.fillStyle = '#fbf8f0'; c.beginPath(); c.arc(gauge.x, gauge.y, gauge.r - 3.5, 0, 7); c.fill();
        c.strokeStyle = '#3d3d42'; c.lineWidth = 1;
        for (let k = 0; k <= 8; k++) { const a = Math.PI * 0.8 + (k / 8) * Math.PI * 1.4; c.beginPath(); c.moveTo(gauge.x + Math.cos(a) * 9, gauge.y + Math.sin(a) * 9); c.lineTo(gauge.x + Math.cos(a) * 12, gauge.y + Math.sin(a) * 12); c.stroke(); }
        c.strokeStyle = '#c9474f'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(gauge.x, gauge.y); c.lineTo(gauge.x + 8, gauge.y - 6); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(gauge.x - 5, gauge.y - 6, 4, 2.2, -0.6, 0, 7); c.fill();
        // group heads with their handles, cups waiting below
        for (const gp of groups) {
          const g = c.createLinearGradient(gp.x - 17, 0, gp.x + 17, 0);
          g.addColorStop(0, '#6b7480'); g.addColorStop(0.45, '#f4f7f9'); g.addColorStop(1, '#7d8792');
          c.fillStyle = g; c.beginPath(); c.roundRect(gp.x - 17, gp.y - 12, 34, 24, 6); c.fill();
          c.fillStyle = '#4b5158'; c.fillRect(gp.x - 12, gp.y + 10, 24, 5);
          c.save(); c.translate(gp.x + 6, gp.y + 13); c.rotate(0.45);
          c.fillStyle = '#26221f'; c.beginPath(); c.roundRect(0, -4, 34, 8, 4); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(4, -3, 26, 2);
          c.restore();
          c.fillStyle = '#f9f6ef'; c.beginPath(); c.moveTo(gp.x - 9, by1 - 36); c.lineTo(gp.x + 9, by1 - 36); c.quadraticCurveTo(gp.x + 8, by1 - 22, gp.x, by1 - 22); c.quadraticCurveTo(gp.x - 8, by1 - 22, gp.x - 9, by1 - 36); c.fill();
          c.fillStyle = '#e9e2d3'; c.beginPath(); c.ellipse(gp.x, by1 - 21, 13, 3, 0, 0, 7); c.fill();
        }
        // the steam wand
        c.strokeStyle = '#9aa3ad'; c.lineWidth = 5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(bx1 - 6, 300); c.quadraticCurveTo(bx1 + 20, 302, bx1 + 18, 356); c.stroke();
        c.strokeStyle = '#e4e8ec'; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(bx1 - 4, 299); c.quadraticCurveTo(bx1 + 18, 301, bx1 + 16, 352); c.stroke();
        c.fillStyle = '#26221f'; c.beginPath(); c.roundRect(bx1 - 2, 288, 14, 9, 3); c.fill();
        // a brass crown on the dome
        c.fillStyle = '#c9952a'; c.beginPath(); c.ellipse(dcx, by0 - dry, 12, 4, 0, 0, 7); c.fill();
        c.beginPath(); c.arc(dcx, by0 - dry - 10, 8, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(dcx - 2.5, by0 - dry - 12.5, 3, 0, 7); c.fill();
        c.fillStyle = '#c9952a'; c.beginPath(); c.moveTo(dcx - 3, by0 - dry - 17); c.lineTo(dcx, by0 - dry - 28); c.lineTo(dcx + 3, by0 - dry - 17); c.closePath(); c.fill();
      },
    };
  }

  Object.assign(SCENES.KINDS, { cafeFloor, awning, sign, tables, counter });
})();
