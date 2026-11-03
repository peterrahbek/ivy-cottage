'use strict';
// Planting and building: jobs made of pieces. A scene lists units (plants,
// planks, bricks, tiles, logs) and draws them with drawUnit(c, unit, k), k
// going 0..1 while the piece pops in. The engine completes a unit once
// enough of the ground under it has been worked. When seasonal mess is laid
// over a finished job (opts.dirt), every piece is simply part of the clean
// layer and there are no units.

(() => {
  const { W, H, field, ramp, rrPath, softShadow, grassGrain, mowedLawn } = SCENES;

  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  function leaf(c, x, y, a, l, w, col) {
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -w, l, 0); c.quadraticCurveTo(l * 0.5, w, 0, 0); c.fill();
    c.restore();
  }
  function rosette(c, r, s, n, cols, lw) {
    for (let i = 0; i < n; i++) leaf(c, 0, 0, (i / n) * 6.283 + r() * 0.4, s * (0.85 + r() * 0.25), s * lw, U.pick(r, cols));
  }
  const rect = (c, x, y, w, h, rad) => { c.beginPath(); c.roundRect(x, y, w, h, rad); };

  // ---------------------------------------------------------------- ground
  function drySoil(c, r, nz) {
    const g = ramp(['#94795d', '#a88d6e', '#bba383', '#cab593']);
    field(c, 0, 0, W, H, 2, (x, y) => g(nz.fbm(x * 0.03, y * 0.03, 4) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
    c.strokeStyle = 'rgba(85,65,45,0.5)'; c.lineWidth = 0.9; c.lineCap = 'round';
    for (let i = 0; i < 110; i++) {
      let x = r() * W, y = r() * H, a = r() * 6.28;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { a += (r() - 0.5) * 1.4; x += Math.cos(a) * (5 + r() * 8); y += Math.sin(a) * (5 + r() * 8); c.lineTo(x, y); }
      c.stroke();
    }
    for (let i = 0; i < 300; i++) {
      const x = r() * W, y = r() * H, s = 1 + r() * 2.4;
      c.fillStyle = U.pick(r, ['#d8cbb4', '#9b8a74', '#e6dccb', '#8a7a66']);
      c.beginPath(); c.ellipse(x, y, s, s * 0.8, r() * 3, 0, 7); c.fill();
    }
    // old dry stalks from last year
    c.strokeStyle = 'rgba(160,130,80,0.85)'; c.lineWidth = 1.2;
    for (let i = 0; i < 50; i++) { const x = r() * W, y = r() * H, a = r() * 6.28, l = 6 + r() * 12; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  }
  function richSoil(c, r, nz, furrows) {
    const g = ramp(['#352318', '#45301f', '#563a26', '#684830']);
    field(c, 0, 0, W, H, 2, (x, y) => g(nz.fbm(x * 0.05 + 7, y * 0.05, 4) * 0.75 + nz.n2(x * 0.5, y * 0.5) * 0.25));
    if (furrows) {
      c.lineWidth = 2.2;
      for (let y = 8; y < H; y += 12) {
        c.strokeStyle = 'rgba(20,12,6,0.35)'; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 20) c.lineTo(x, y + Math.sin(x * 0.05 + y) * 1.2); c.stroke();
        c.strokeStyle = 'rgba(150,110,80,0.18)'; c.beginPath(); c.moveTo(0, y - 2.5); for (let x = 0; x <= W; x += 20) c.lineTo(x, y - 2.5 + Math.sin(x * 0.05 + y) * 1.2); c.stroke();
      }
    }
    for (let i = 0; i < 900; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,220,180,0.1)'; c.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
  }
  // sawdust, broken bits and leaves left lying on a building site
  function rubble(c, r, nz, bits, base) {
    const g = ramp(base);
    field(c, 0, 0, W, H, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 215 + nz.n2(x * 0.1, y * 0.1) * 40]);
    for (let i = 0; i < 520; i++) {
      c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 6.28);
      c.fillStyle = U.pick(r, bits);
      const s = 1.5 + r() * 5;
      if (r() < 0.5) c.fillRect(-s, -s * 0.4, s * 2, s * 0.8); else { c.beginPath(); c.moveTo(-s, 0); c.lineTo(0, -s * 0.8); c.lineTo(s, s * 0.3); c.closePath(); c.fill(); }
      c.restore();
    }
    for (let i = 0; i < 40; i++) {
      c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 6.28);
      c.fillStyle = U.pick(r, ['#c4762f', '#9c5a2a', '#d9a23c', '#7d8a3a']);
      c.beginPath(); c.ellipse(0, 0, 5, 2.5, 0, 0, 7); c.fill(); c.restore();
    }
  }

  // ---------------------------------------------------------------- plants
  // Seen from above, centred on 0,0, s = radius.
  const PLANTS = {
    geranium(c, r, s) {
      rosette(c, r, s * 0.95, 6, ['#4f8a3a', '#5d9a44', '#467e33'], 0.55);
      const col = U.pick(r, [['#e0485a', '#f27a88'], ['#f08aa8', '#ffc0d0'], ['#ff7a4a', '#ffb08a']]);
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.28, d = s * (0.15 + r() * 0.35), x = Math.cos(a) * d, y = Math.sin(a) * d;
        for (let k = 0; k < 8; k++) { const b = r() * 6.28, e = r() * s * 0.22; dot(c, x + Math.cos(b) * e, y + Math.sin(b) * e, s * 0.13, col[k % 2]); }
        dot(c, x, y, s * 0.06, '#fff2b0');
      }
    },
    marigold(c, r, s) {
      for (let i = 0; i < 10; i++) leaf(c, 0, 0, (i / 10) * 6.283, s * 0.95, s * 0.22, i % 2 ? '#3f7a2f' : '#4d8a34');
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.28, d = i ? s * 0.38 : 0, x = Math.cos(a) * d, y = Math.sin(a) * d, f = s * (0.3 + r() * 0.08);
        dot(c, x, y, f, '#e0701a'); dot(c, x - f * 0.1, y - f * 0.1, f * 0.72, '#f59a2a'); dot(c, x - f * 0.15, y - f * 0.15, f * 0.4, '#ffc94a');
      }
    },
    daisy(c, r, s) {
      rosette(c, r, s * 0.85, 7, ['#5d9a44', '#4f8a3a'], 0.35);
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.28, d = s * (0.1 + r() * 0.4), x = Math.cos(a) * d, y = Math.sin(a) * d, f = s * 0.32;
        c.fillStyle = '#ffffff';
        for (let k = 0; k < 10; k++) { const b = (k / 10) * 6.283; c.beginPath(); c.ellipse(x + Math.cos(b) * f * 0.6, y + Math.sin(b) * f * 0.6, f * 0.5, f * 0.2, b, 0, 7); c.fill(); }
        dot(c, x, y, f * 0.32, '#f2c230');
      }
    },
    pansy(c, r, s) {
      rosette(c, r, s * 0.85, 6, ['#4d8a34', '#5d9a44'], 0.5);
      const pal = U.pick(r, [['#6a4fb3', '#f7d54a'], ['#b04fa0', '#ffffff'], ['#3d5a86', '#f2c230']]);
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.28, d = s * (0.15 + r() * 0.35), x = Math.cos(a) * d, y = Math.sin(a) * d, f = s * 0.32;
        for (let k = 0; k < 5; k++) { const b = (k / 5) * 6.283 + a; dot(c, x + Math.cos(b) * f * 0.5, y + Math.sin(b) * f * 0.5, f * 0.55, k < 2 ? pal[0] : pal[1]); }
        dot(c, x, y, f * 0.28, '#3a2a4a'); dot(c, x, y, f * 0.1, '#f2c230');
      }
    },
    lavender(c, r, s) {
      for (let i = 0; i < 12; i++) leaf(c, 0, 0, r() * 6.28, s * 0.7, s * 0.1, '#8aa38a');
      c.lineWidth = 0.8;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * 6.283 + r() * 0.3, l = s * (0.8 + r() * 0.35);
        c.strokeStyle = '#6f8a5a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke();
        for (let k = 0; k < 4; k++) dot(c, Math.cos(a) * l * (0.62 + k * 0.12), Math.sin(a) * l * (0.62 + k * 0.12), s * 0.1, k % 2 ? '#9a7fd1' : '#7d63b8');
      }
    },
    // a full, rounded lavender bush for a bed of its own
    lavbush(c, r, s) {
      for (let i = 0; i < 30; i++) leaf(c, 0, 0, r() * 6.283, s * (0.5 + r() * 0.32), s * 0.11, U.pick(r, ['#8aa38a', '#7d9a80', '#9db59a', '#6f8c72']));
      c.lineCap = 'round';
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * 6.283 + r() * 0.25, l = s * (0.72 + r() * 0.42), x = Math.cos(a), y = Math.sin(a);
        c.strokeStyle = '#7a9468'; c.lineWidth = 0.9;
        c.beginPath(); c.moveTo(x * l * 0.2, y * l * 0.2); c.lineTo(x * l * 0.6, y * l * 0.6); c.stroke();
        for (let k = 0; k < 5; k++) {
          const t = 0.58 + k * 0.1;
          dot(c, x * l * t, y * l * t, s * (0.085 - k * 0.008), U.pick(r, ['#8c6bc8', '#7357b0', '#a68ad8', '#9a7fd1']));
        }
      }
      for (let i = 0; i < 6; i++) { const a = r() * 6.283, d = s * (0.2 + r() * 0.2); dot(c, Math.cos(a) * d, Math.sin(a) * d, s * 0.07, '#b9a2e3'); }
    },
    basil(c, r, s) {
      for (let i = 0; i < 8; i++) leaf(c, 0, 0, (i / 8) * 6.283 + r() * 0.3, s * (0.75 + r() * 0.3), s * 0.4, i % 2 ? '#5cb04a' : '#4a9a3a');
      for (let i = 0; i < 5; i++) leaf(c, 0, 0, r() * 6.28, s * 0.48, s * 0.3, '#7bc25a');
      c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.6;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * s * 0.7, Math.sin(a) * s * 0.7); c.stroke(); }
    },
    rosemary(c, r, s) {
      c.lineCap = 'round'; c.lineWidth = 1.5;
      for (let i = 0; i < 28; i++) {
        const a = r() * 6.283, l = s * (0.5 + r() * 0.55);
        c.strokeStyle = U.pick(r, ['#3f6b4a', '#4f7d58', '#5d8c66', '#6f9c74']);
        c.beginPath(); c.moveTo(Math.cos(a) * 2, Math.sin(a) * 2); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke();
      }
      for (let i = 0; i < 5; i++) dot(c, (r() - 0.5) * s, (r() - 0.5) * s, 1.2, '#a9b8f0');
    },
    thyme(c, r, s) {
      for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * s * 0.9; dot(c, Math.cos(a) * d, Math.sin(a) * d, 1.2 + r() * 0.9, U.pick(r, ['#5d7d45', '#6f8f52', '#83a364'])); }
      for (let i = 0; i < 7; i++) { const a = r() * 6.283, d = r() * s * 0.75; dot(c, Math.cos(a) * d, Math.sin(a) * d, 1.3, '#e6b3d6'); }
    },
    parsley(c, r, s) {
      c.lineWidth = 0.9;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * 6.283 + r() * 0.4, d = s * (0.45 + r() * 0.35), x = Math.cos(a) * d, y = Math.sin(a) * d;
        c.strokeStyle = '#4a8a34'; c.beginPath(); c.moveTo(0, 0); c.lineTo(x, y); c.stroke();
        for (let k = 0; k < 6; k++) dot(c, x + (r() - 0.5) * s * 0.32, y + (r() - 0.5) * s * 0.32, s * 0.12, U.pick(r, ['#4f9a3a', '#62ad48', '#3f8a2c']));
      }
    },
    chives(c, r, s) {
      c.lineCap = 'round'; c.lineWidth = 1.6;
      for (let i = 0; i < 20; i++) {
        const a = r() * 6.283, l = s * (0.6 + r() * 0.5);
        c.strokeStyle = U.pick(r, ['#4f8a3a', '#5d9a44', '#3f7a2f']);
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.283, d = s * (0.4 + r() * 0.4), x = Math.cos(a) * d, y = Math.sin(a) * d;
        for (let k = 0; k < 7; k++) dot(c, x + (r() - 0.5) * 4.5, y + (r() - 0.5) * 4.5, 1.5, k % 2 ? '#b98fd8' : '#d6b3ef');
      }
    },
    sunflower(c, r, s) {
      for (let i = 0; i < 5; i++) leaf(c, 0, 0, (i / 5) * 6.283 + r() * 0.5, s * 1.15, s * 0.5, i % 2 ? '#4f8a3a' : '#5d9a44');
      const n = 18;
      c.fillStyle = '#eaa514';
      for (let k = 0; k < n; k++) { const b = (k / n) * 6.283; c.beginPath(); c.ellipse(Math.cos(b) * s * 0.55, Math.sin(b) * s * 0.55, s * 0.32, s * 0.11, b, 0, 7); c.fill(); }
      c.fillStyle = '#fcd34a';
      for (let k = 0; k < n; k++) { const b = ((k + 0.5) / n) * 6.283; c.beginPath(); c.ellipse(Math.cos(b) * s * 0.5, Math.sin(b) * s * 0.5, s * 0.27, s * 0.09, b, 0, 7); c.fill(); }
      dot(c, 0, 0, s * 0.37, '#4e3219'); dot(c, -s * 0.06, -s * 0.06, s * 0.27, '#6e4a26');
      c.fillStyle = '#2e1c0c';
      for (let k = 0; k < 30; k++) { const b = k * 2.4, d = Math.sqrt(k / 30) * s * 0.32; c.fillRect(Math.cos(b) * d - 0.6, Math.sin(b) * d - 0.6, 1.2, 1.2); }
    },
    // a tulip bulb tucked in for spring, with a little label
    bulb(c, r, s) {
      dot(c, 0, 0, s, '#2e1f14'); dot(c, -s * 0.08, -s * 0.08, s * 0.8, '#45301f');
      c.fillStyle = '#c8a070'; c.beginPath(); c.ellipse(0, 0, s * 0.45, s * 0.38, 0, 0, 7); c.fill();
      c.fillStyle = '#e6c99a'; c.beginPath(); c.ellipse(-s * 0.12, -s * 0.12, s * 0.22, s * 0.15, 0, 0, 7); c.fill();
      leaf(c, 0, 0, -1.3 + r() * 0.5, s * 0.7, s * 0.16, '#7bc25a');
      c.fillStyle = '#efe2c4'; c.fillRect(s * 0.55, -s * 1.15, s * 0.5, s * 0.75);
      dot(c, s * 0.8, -s * 0.86, s * 0.16, U.pick(r, ['#e0485a', '#f7c548', '#ef8aa6', '#b48fd8', '#ff8a3a']));
    },
    lettuce(c, r, s) {
      const cols = ['#5fa83f', '#7cbf52', '#9ed46a', '#c6e88a'];
      for (let ring = 0; ring < 4; ring++) {
        const rad = s * (1 - ring * 0.24), n = 9 - ring;
        c.fillStyle = cols[ring]; c.beginPath();
        for (let k = 0; k <= n * 2; k++) { const b = (k / (n * 2)) * 6.283 + ring, q = rad * (k % 2 ? 0.84 : 1); if (k) c.lineTo(Math.cos(b) * q, Math.sin(b) * q); else c.moveTo(Math.cos(b) * q, Math.sin(b) * q); }
        c.fill();
      }
    },
    cabbage(c, r, s) {
      for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + r() * 0.3; c.fillStyle = i % 2 ? '#6f9f8f' : '#7fae9d'; c.beginPath(); c.ellipse(Math.cos(a) * s * 0.45, Math.sin(a) * s * 0.45, s * 0.56, s * 0.42, a, 0, 7); c.fill(); }
      dot(c, 0, 0, s * 0.5, '#a3cdb9'); dot(c, -s * 0.08, -s * 0.08, s * 0.32, '#c3e2d2');
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.7;
      for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + 0.3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9); c.stroke(); }
    },
    carrot(c, r, s) {
      c.lineWidth = 0.9;
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 2.6, l = s * (0.8 + r() * 0.4), x = Math.cos(a) * l, y = Math.sin(a) * l;
        c.strokeStyle = '#4f9a3a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(x, y); c.stroke();
        for (let k = 1; k <= 4; k++) { leaf(c, x * k / 5, y * k / 5, a + 1.1, s * 0.24, s * 0.08, '#62ad48'); leaf(c, x * k / 5, y * k / 5, a - 1.1, s * 0.24, s * 0.08, '#62ad48'); }
      }
      dot(c, 0, 0, s * 0.3, '#e0702a'); dot(c, -s * 0.07, -s * 0.07, s * 0.17, '#f5a052');
    },
    strawberry(c, r, s) {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 6.283 + r() * 0.4, x = Math.cos(a) * s * 0.45, y = Math.sin(a) * s * 0.45;
        for (let k = -1; k <= 1; k++) { c.fillStyle = k ? '#4f8a3a' : '#5d9a44'; c.beginPath(); c.ellipse(x + Math.cos(a + k * 0.7) * s * 0.18, y + Math.sin(a + k * 0.7) * s * 0.18, s * 0.21, s * 0.15, a + k * 0.7, 0, 7); c.fill(); }
      }
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.283, d = s * (0.3 + r() * 0.45), x = Math.cos(a) * d, y = Math.sin(a) * d;
        c.fillStyle = '#d93a3a'; c.beginPath(); c.moveTo(x, y + s * 0.22); c.quadraticCurveTo(x - s * 0.2, y, x, y - s * 0.1); c.quadraticCurveTo(x + s * 0.2, y, x, y + s * 0.22); c.fill();
        dot(c, x - s * 0.04, y, s * 0.04, '#ffd9a0'); dot(c, x, y - s * 0.1, s * 0.06, '#3f7a2f');
      }
      const a = r() * 6.283, x = Math.cos(a) * s * 0.65, y = Math.sin(a) * s * 0.65;
      for (let k = 0; k < 5; k++) dot(c, x + Math.cos(k * 1.256) * 1.7, y + Math.sin(k * 1.256) * 1.7, 1.4, '#ffffff');
      dot(c, x, y, 0.9, '#f2c230');
    },
    // dune plants for the cove
    marram(c, r, s) {
      c.lineCap = 'round';
      for (let i = 0; i < 22; i++) {
        const a = r() * 6.283, l = s * (0.7 + r() * 0.6), bend = (r() - 0.5) * 0.6;
        c.strokeStyle = U.pick(r, ['#8aa35a', '#9bb36a', '#a9b878', '#7a9450']); c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a) * l * 0.5, Math.sin(a) * l * 0.5, Math.cos(a + bend) * l, Math.sin(a + bend) * l); c.stroke();
      }
      dot(c, 0, 0, s * 0.18, '#7a9450');
    },
    thrift(c, r, s) {
      for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * s * 0.75; dot(c, Math.cos(a) * d, Math.sin(a) * d, 1.4, U.pick(r, ['#5d7d45', '#6f8f52'])); }
      for (let i = 0; i < 6; i++) {
        const a = r() * 6.283, d = r() * s * 0.6, x = Math.cos(a) * d, y = Math.sin(a) * d;
        dot(c, x, y, s * 0.24, '#e58fb4'); dot(c, x - 1, y - 1, s * 0.14, '#f6c2da');
      }
    },
    seaholly(c, r, s) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * 6.283 + r() * 0.3, l = s * (0.7 + r() * 0.3);
        c.fillStyle = i % 2 ? '#8aa8b8' : '#9db8c6';
        c.beginPath(); c.moveTo(0, 0);
        for (let k = 1; k <= 4; k++) { const d = (l * k) / 4, w = s * 0.18 * (1 - k / 5); c.lineTo(Math.cos(a) * d + Math.cos(a + 1.57) * w * (k % 2 ? 1 : -0.4), Math.sin(a) * d + Math.sin(a + 1.57) * w * (k % 2 ? 1 : -0.4)); }
        c.closePath(); c.fill();
      }
      for (let i = 0; i < 3; i++) { const a = r() * 6.283, d = s * 0.3; dot(c, Math.cos(a) * d, Math.sin(a) * d, s * 0.16, '#6f7fc4'); }
    },
    // a lacy fern seen from above: fronds of paired leaflets round a curled fiddlehead
    fern(c, r, s) {
      const n = 7 + ((r() * 3) | 0);
      c.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.283 + r() * 0.4, l = s * (1.15 + r() * 0.3), bend = (r() - 0.5) * 0.5;
        const col = U.pick(r, ['#4f8a3a', '#5d9a44', '#467e33', '#6aa64c']);
        c.save(); c.rotate(a);
        c.strokeStyle = '#3f6f2c'; c.lineWidth = 1.1;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, bend * l * 0.4, l, bend * l * 0.5); c.stroke();
        for (let k = 1; k <= 7; k++) {
          const t = k / 8, x = l * t, y = bend * l * 0.5 * t * t * 1.6, len = s * 0.38 * (1 - t * 0.75);
          leaf(c, x, y, -1.1, len, len * 0.32, col);
          leaf(c, x, y, 1.1, len, len * 0.32, col);
        }
        c.restore();
      }
      c.strokeStyle = '#7a8a3a'; c.lineWidth = 1.6; c.beginPath();
      for (let k = 0; k < 16; k++) { const t = k / 15, rr = s * 0.16 * (1 - t), a = t * 9; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      c.stroke();
    },
    // a hart's-tongue fern: glossy strap leaves with wavy edges and a pale midrib
    hartstongue(c, r, s) {
      const n = 8 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.283 + r() * 0.3, l = s * (1.0 + r() * 0.3), w = s * 0.2;
        c.save(); c.rotate(a);
        c.fillStyle = U.pick(r, ['#3f7a2f', '#4d8a34', '#45822f']);
        c.beginPath(); c.moveTo(0, 0);
        for (let k = 0; k <= 8; k++) { const t = k / 8; c.lineTo(l * t, -w * Math.sin(Math.PI * Math.min(1, t * 1.1)) - Math.sin(k * 2.2) * 1.2); }
        for (let k = 8; k >= 0; k--) { const t = k / 8; c.lineTo(l * t, w * Math.sin(Math.PI * Math.min(1, t * 1.1)) + Math.sin(k * 2.2) * 1.2); }
        c.closePath(); c.fill();
        c.strokeStyle = 'rgba(220,240,180,0.55)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(2, 0); c.lineTo(l * 0.92, 0); c.stroke();
        c.restore();
      }
    },
    beachrose(c, r, s) {
      rosette(c, r, s * 0.95, 7, ['#4f8a3a', '#5d9a44', '#467e33'], 0.5);
      for (let i = 0; i < 3; i++) {
        const a = r() * 6.28, d = s * (0.15 + r() * 0.4), x = Math.cos(a) * d, y = Math.sin(a) * d, f = s * 0.3;
        for (let k = 0; k < 5; k++) { const b = (k / 5) * 6.283 + a; dot(c, x + Math.cos(b) * f * 0.5, y + Math.sin(b) * f * 0.5, f * 0.55, '#e0619a'); }
        dot(c, x, y, f * 0.3, '#f7d54a');
      }
    },
  };
  const SETS = {
    dunes: ['marram', 'thrift', 'marram', 'seaholly', 'marram', 'beachrose'],
    flowers: ['geranium', 'marigold', 'daisy', 'pansy', 'lavender'],
    herbs: ['basil', 'rosemary', 'thyme', 'parsley', 'chives'],
    sunflowers: ['sunflower'], bulbs: ['bulb'], veg: ['lettuce', 'cabbage', 'carrot', 'strawberry'],
    lavender: ['lavbush'],
    ferns: ['fern', 'hartstongue', 'fern', 'fern', 'hartstongue'],
  };
  // hanging baskets under a station canopy: [x, y, rx, ry] of the soil in each
  const BASKETS = [[100, 196, 62, 32], [260, 196, 62, 32], [180, 418, 72, 36]];
  const CANOPY = 96;

  function drawPlant(c, u, k) {
    const g = k >= 1 ? 1 : Math.max(0, U.easeBack(k));
    if (g <= 0.02) return;
    c.save(); c.translate(u.x, u.y);
    c.fillStyle = 'rgba(25,15,5,0.24)'; c.beginPath(); c.ellipse(1.6, 2.6, u.s * g * 0.95, u.s * g * 0.85, 0, 0, 7); c.fill();
    c.rotate(u.rot + (1 - Math.min(1, k)) * 0.6);
    c.scale(g, g);
    PLANTS[u.kind](c, U.rng(u.seed), u.s);
    c.restore();
  }

  // ------------------------------------------------------- HANGING BASKETS
  // A station platform under its canopy: a cream board wall with a window
  // and a poster, cast-iron columns, the canopy's pointed valance and three
  // wire baskets lined with moss, hanging on chains.
  function chain(c, x0, y0, x1, y1) {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 7));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      c.strokeStyle = '#4a4440'; c.lineWidth = 1.6;
      c.beginPath(); if (i % 2) c.ellipse(x, y, 1.6, 3.4, Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2, 0, 7); else c.ellipse(x, y, 2.6, 3.4, Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2, 0, 7); c.stroke();
    }
  }
  function basketsDecor(c, r, nz, bleed) {
    const { x0, y0, x1, y1 } = bleed;
    // the station wall: cream boards
    c.fillStyle = '#eadcbf'; c.fillRect(x0, y0, x1 - x0, 548 - y0);
    for (let y = CANOPY + 8; y < 548; y += 16) {
      c.fillStyle = 'rgba(140,115,80,0.22)'; c.fillRect(x0, y + 13, x1 - x0, 3);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x0, y, x1 - x0, 1.5);
    }
    c.fillStyle = '#8e2f3a'; c.fillRect(x0, 506, x1 - x0, 42); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x0, 506, x1 - x0, 3);
    // a sash window and an old poster, behind the lower basket
    c.fillStyle = '#8e2f3a'; rect(c, 128, 250, 104, 120, 3); c.fill();
    c.fillStyle = '#cfe2ea'; c.fillRect(136, 258, 88, 104);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.moveTo(146, 352); c.lineTo(176, 262); c.lineTo(190, 262); c.lineTo(160, 352); c.fill();
    c.fillStyle = '#efe4cc'; c.fillRect(178, 258, 4, 104); c.fillRect(136, 306, 88, 5);
    c.fillStyle = '#fbf6ea'; rect(c, 34, 300, 60, 84, 2); c.fill();
    c.fillStyle = '#8fbfe6'; c.fillRect(39, 305, 50, 46); c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(64, 320, 8, 0, 7); c.fill();
    c.fillStyle = '#3d86c6'; c.beginPath(); c.moveTo(39, 340); c.quadraticCurveTo(64, 330, 89, 340); c.lineTo(89, 351); c.lineTo(39, 351); c.fill();
    c.fillStyle = '#8e2f3a'; c.font = '800 9px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BY THE SEA', 64, 364);
    c.fillStyle = '#8a7a66'; c.fillRect(46, 372, 36, 3);
    // a bench on the platform, the cast-iron columns and their brackets
    c.fillStyle = 'rgba(60,40,25,0.25)'; c.fillRect(266, 530, 80, 6);
    c.fillStyle = '#7a5236'; for (const y of [470, 482, 500]) { rect(c, 262, y, 84, 8, 2); c.fill(); }
    c.fillStyle = '#3a3a3a'; c.fillRect(268, 470, 5, 64); c.fillRect(336, 470, 5, 64);
    for (const x of [16, 344]) {
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x - 5, CANOPY, 14, 450);
      c.fillStyle = '#2f4a3a'; c.fillRect(x - 7, CANOPY, 14, 452);
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x - 5, CANOPY, 2.4, 452);
      c.fillStyle = '#263c30'; rect(c, x - 11, 532, 22, 18, 3); c.fill(); rect(c, x - 10, CANOPY + 2, 20, 12, 3); c.fill();
      c.strokeStyle = '#2f4a3a'; c.lineWidth = 3; c.beginPath(); const d = x < 180 ? 1 : -1;
      c.moveTo(x, CANOPY + 70); c.quadraticCurveTo(x + d * 6, CANOPY + 14, x + d * 60, CANOPY + 6); c.stroke();
      c.beginPath(); c.arc(x + d * 18, CANOPY + 30, 9, 0, 7); c.stroke();
    }
    // the platform: flagstones and a white edge
    field(c, x0, 548, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.04, y * 0.04, 3); return [190 + v * 20, 184 + v * 18, 172 + v * 16]; });
    c.strokeStyle = 'rgba(90,80,70,0.35)'; c.lineWidth = 1.2;
    for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) { c.beginPath(); c.moveTo(x, 548); c.lineTo(x, y1); c.stroke(); }
    c.fillStyle = 'rgba(60,40,25,0.25)'; c.fillRect(x0, 548, x1 - x0, 4);
    c.fillStyle = '#f7f3ea'; c.fillRect(x0, 584, x1 - x0, 8);
    // the canopy: dark beams, then the valance with its pointed boards
    c.fillStyle = '#3d4b44'; c.fillRect(x0, y0, x1 - x0, CANOPY - 26 - y0);
    c.fillStyle = 'rgba(255,255,255,0.12)'; for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) c.fillRect(x, y0, 3, CANOPY - 26 - y0);
    c.fillStyle = 'rgba(60,45,30,0.22)'; c.beginPath(); c.moveTo(x0, CANOPY - 4);
    for (let x = Math.floor(x0 / 18) * 18; x <= x1 + 18; x += 18) { c.lineTo(x, CANOPY - 4); c.lineTo(x + 9, CANOPY + 9); c.lineTo(x + 18, CANOPY - 4); }
    c.lineTo(x1, CANOPY - 10); c.lineTo(x0, CANOPY - 10); c.closePath(); c.fill();
    c.fillStyle = '#fbf6e8'; c.fillRect(x0, CANOPY - 30, x1 - x0, 22);
    c.beginPath(); c.moveTo(x0, CANOPY - 8);
    for (let x = Math.floor(x0 / 18) * 18; x <= x1 + 18; x += 18) { c.lineTo(x, CANOPY - 8); c.lineTo(x + 9, CANOPY + 4); c.lineTo(x + 18, CANOPY - 8); }
    c.lineTo(x1, CANOPY - 30); c.lineTo(x0, CANOPY - 30); c.closePath(); c.fill();
    c.fillStyle = '#8e2f3a'; c.fillRect(x0, CANOPY - 30, x1 - x0, 5);
    c.strokeStyle = 'rgba(140,115,80,0.5)'; c.lineWidth = 1;
    for (let x = Math.floor(x0 / 18) * 18 + 9; x < x1; x += 18) { c.beginPath(); c.moveTo(x, CANOPY - 25); c.lineTo(x, CANOPY + 2); c.stroke(); }
    // the baskets: chains, a mossy wire bowl and an iron rim
    for (const [x, y, rx, ry] of BASKETS) {
      const hook = x === 180 ? CANOPY + 4 : CANOPY + 2, top = y - ry - 64;
      chain(c, x, hook, x, top);
      for (const [cx, cy] of [[x - rx, y], [x + rx, y], [x, y - ry]]) chain(c, x, top, cx, cy);
      c.fillStyle = '#3a3633'; c.beginPath(); c.arc(x, top, 3.6, 0, 7); c.fill();
      c.fillStyle = 'rgba(40,30,20,0.18)'; c.beginPath(); c.ellipse(x + 6, y + 62, rx * 0.8, 9, 0, 0, 7); c.fill();
      const bowl = new Path2D(); bowl.moveTo(x - rx - 3, y); bowl.bezierCurveTo(x - rx, y + ry + 34, x - rx * 0.4, y + ry + 46, x, y + ry + 46); bowl.bezierCurveTo(x + rx * 0.4, y + ry + 46, x + rx, y + ry + 34, x + rx + 3, y); bowl.closePath();
      c.save(); c.clip(bowl);
      field(c, x - rx - 4, y - 4, x + rx + 4, y + ry + 48, 2, (px, py) => { const v = nz.fbm(px * 0.12, py * 0.12, 3); return [86 + v * 40, 104 + v * 36, 52 + v * 22]; });
      c.strokeStyle = 'rgba(40,36,32,0.75)'; c.lineWidth = 1.4;
      for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + (k / 3.4) * rx, y); c.quadraticCurveTo(x + (k / 3.4) * rx * 0.9, y + ry + 30, x + (k / 3.4) * rx * 0.3, y + ry + 50); c.stroke(); }
      for (const t of [0.35, 0.7]) { c.beginPath(); c.ellipse(x, y + (ry + 44) * t, rx * (1 - t * 0.45), 6, 0, 0, Math.PI); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + rx * 0.3, y, rx, ry + 50);
      c.restore();
      c.strokeStyle = '#2e2b29'; c.lineWidth = 3.2; c.beginPath(); c.ellipse(x, y, rx + 2.5, ry + 2.5, 0, 0, 7); c.stroke();
    }
  }
  // ivy trailing over the front of each basket
  function basketsTop(c, r) {
    c.lineCap = 'round';
    for (const [x, y, rx, ry] of BASKETS) {
      c.strokeStyle = '#2e2b29'; c.lineWidth = 3.2; c.beginPath(); c.ellipse(x, y, rx + 2.5, ry + 2.5, 0, 0.15, Math.PI - 0.15); c.stroke();
      for (let k = 0; k < 5; k++) {
        const sx = x - rx * 0.8 + (k / 4) * rx * 1.6, sy = y + Math.sqrt(Math.max(0, 1 - ((sx - x) / (rx + 2)) ** 2)) * (ry + 2), l = 26 + r() * 30;
        c.strokeStyle = '#4d7a3a'; c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + (r() - 0.5) * 14, sy + l * 0.5, sx + (r() - 0.5) * 10, sy + l); c.stroke();
        for (let j = 1; j <= 4; j++) {
          const t = j / 4.4, lx = sx + (r() - 0.5) * 6, ly = sy + l * t;
          c.fillStyle = j % 2 ? '#5d9644' : '#4f8a3c'; c.beginPath(); c.ellipse(lx + (j % 2 ? 3 : -3), ly, 3.4, 2.4, j % 2 ? 0.6 : -0.6, 0, 7); c.fill();
        }
      }
    }
  }

  // ------------------------------------------------------------- PLANTING
  function plantScene(S) {
    const { r, nz, opts, bleed } = S;
    const box = opts.box || 'planters';
    const setName = opts.plants || (box === 'windowbox' ? 'herbs' : box === 'veg' ? 'veg' : box === 'dunes' ? 'dunes' : 'flowers');
    const set = SETS[setName];
    const region = new Path2D();
    const units = [], boxes = [], pots = [];
    const add = (x, y, s, kind) => units.push({ shape: 'circle', x, y, r: s * 0.95, s, kind, seed: (r() * 1e9) | 0, rot: r() * 6.28 });
    const jit = (v) => (r() - 0.5) * v;

    if (box === 'planters' || box === 'windowbox') {
      const rows = box === 'planters' ? [70, 244, 418] : [150, 410];
      const bh = box === 'planters' ? 112 : 92, rim = 12;
      rows.forEach((y, bi) => {
        const b = { x: 26, y, w: 308, h: bh, rim };
        boxes.push(b);
        region.rect(b.x + rim, b.y + rim, b.w - rim * 2, b.h - rim * 2);
        // each box gets two plants that alternate, so it looks planned
        const pair = [set[(bi * 2) % set.length], set[(bi * 2 + 1) % set.length]];
        const per = box === 'planters' ? 6 : 7, iw = b.w - rim * 2, ih = b.h - rim * 2;
        for (let row = 0; row < 2; row++) for (let i = 0; i < per; i++) {
          const x = b.x + rim + iw * ((i + 0.5 + (row ? 0.25 : -0.25)) / per), yy = b.y + rim + ih * (row ? 0.71 : 0.29);
          add(U.clamp(x + jit(4), b.x + rim + 12, b.x + b.w - rim - 12), yy + jit(4), box === 'planters' ? 15 : 13, pair[(i + row) % 2]);
        }
      });
    } else if (box === 'pots') {
      const spec = [[95, 150, 58], [250, 118, 40], [305, 205, 26], [78, 320, 42], [210, 332, 56], [322, 290, 24], [60, 452, 26], [150, 505, 40], [276, 490, 58]];
      spec.forEach(([x, y, R], i) => {
        const p = { x, y, R, rim: 7 };
        pots.push(p);
        region.moveTo(x + R - 7, y); region.arc(x, y, R - 7, 0, Math.PI * 2);
        const kind = set[i % set.length];
        if (R > 50) for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; add(x + Math.cos(a) * 22, y + Math.sin(a) * 22, 16, set[(i + k) % set.length]); }
        else add(x, y, R > 30 ? 22 : 14, kind);
      });
    } else if (box === 'dunes') {
      // bare patches of sand among the dunes, planted with grass and flowers
      const patches = [[110, 140, 92, 70], [262, 250, 86, 78], [104, 360, 84, 70], [250, 470, 96, 72], [120, 520, 70, 46]];
      for (const [x, y, rx, ry] of patches) {
        SCENES.blob(region, x, y, rx, ry, r, 0.1, 16);
        const n = Math.round((rx * ry) / 650);
        for (let i = 0, tries = 0; i < n && tries < 200; tries++) {
          const a = r() * 6.283, d = Math.sqrt(r()) * 0.78, px = x + Math.cos(a) * rx * d, py = y + Math.sin(a) * ry * d;
          if (units.some((u) => Math.hypot(u.x - px, u.y - py) < 26)) continue;
          add(px, py, 13 + r() * 3, set[(i + (r() * 2 | 0)) % set.length]); i++;
        }
      }
    } else if (box === 'veg') {
      const b = { x: 28, y: 36, w: 304, h: 528, rim: 14 };
      boxes.push(b);
      region.rect(b.x + b.rim, b.y + b.rim, b.w - b.rim * 2, b.h - b.rim * 2);
      const bands = [['lettuce', 5, 18], ['cabbage', 4, 21], ['carrot', 6, 14], ['strawberry', 5, 17]];
      const ih = b.h - b.rim * 2, bandH = ih / bands.length;
      bands.forEach(([kind, per, s], bi) => {
        for (let row = 0; row < 2; row++) for (let i = 0; i < per; i++) {
          const x = b.x + b.rim + 18 + ((b.w - b.rim * 2 - 36) * (i + (row ? 0.75 : 0.25))) / per;
          add(x + jit(3), b.y + b.rim + bandH * bi + bandH * (row ? 0.72 : 0.28) + jit(3), s, kind);
        }
      });
    } else if (box === 'baskets') {
      // hanging baskets: a ring of plants round one in the middle
      BASKETS.forEach(([x, y, rx, ry], bi) => {
        region.moveTo(x + rx, y); region.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        add(x + jit(4), y + jit(2), 16, set[bi % set.length]);
        const n = rx > 66 ? 8 : 7;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * 6.283 + bi;
          add(x + Math.cos(a) * rx * 0.66 + jit(3), y + Math.sin(a) * ry * 0.58 + jit(2), 14, set[(bi + k + 1) % set.length]);
        }
      });
    } else {
      // an open garden bed in the lawn: sunflowers or bulbs in rows
      // (lavender: a few big bushes in gravel)
      const b = { x: 34, y: 48, w: 292, h: 504 };
      boxes.push(Object.assign({ rim: 0, bed: true }, b));
      rrPath(region, b.x, b.y, b.w, b.h, 26);
      const big = setName === 'sunflowers', lav = setName === 'lavender';
      const cols = big ? 3 : lav ? 4 : 5, rows = big ? 6 : lav ? 7 : 10, s = big ? 21 : lav ? 23 : 8.5;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        add(b.x + (b.w * (i + 0.5 + (j % 2 ? 0.18 : -0.18))) / cols + jit(5), b.y + (b.h * (j + 0.5)) / rows + jit(5), s * (0.92 + r() * 0.16), set[0]);
      }
    }

    function woodBox(c, b) {
      softShadow(c, (() => { const p = new Path2D(); rrPath(p, b.x, b.y, b.w, b.h, 6); return p; })(), 10, 0.45, 2, 5);
      c.fillStyle = '#7d5434'; rect(c, b.x, b.y, b.w, b.h, 6); c.fill();
      c.fillStyle = '#a2734a'; rect(c, b.x + 2, b.y + 2, b.w - 4, b.h - 5, 5); c.fill();
      // plank lines along the rim
      c.strokeStyle = 'rgba(80,50,25,0.45)'; c.lineWidth = 1;
      for (const t of [0.35, 0.7]) {
        c.beginPath(); c.moveTo(b.x + 6, b.y + b.rim * t); c.lineTo(b.x + b.w - 6, b.y + b.rim * t); c.stroke();
        c.beginPath(); c.moveTo(b.x + 6, b.y + b.h - b.rim * t); c.lineTo(b.x + b.w - 6, b.y + b.h - b.rim * t); c.stroke();
      }
      c.fillStyle = 'rgba(255,240,210,0.25)'; c.fillRect(b.x + 4, b.y + 3, b.w - 8, 2);
      c.fillStyle = '#3a2618'; c.fillRect(b.x + b.rim - 2, b.y + b.rim - 2, b.w - b.rim * 2 + 4, b.h - b.rim * 2 + 4);
      for (const [x, y] of [[b.x + 5, b.y + 5], [b.x + b.w - 5, b.y + 5], [b.x + 5, b.y + b.h - 6], [b.x + b.w - 5, b.y + b.h - 6]]) dot(c, x, y, 1.6, '#5b4636');
    }

    return {
      family: 'plant', particle: 'soil', region, depth: false,
      unitKind: 'plant', unitParticle: 'soil', unitThreshold: 0.4, unitDur: 0.5,
      units: opts.dirt ? [] : units,
      drawUnit: drawPlant,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        if (box === 'planters') {
          // a deck of warm boards around the boxes
          field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.01, y * 0.2, 3); return [176 + v * 30, 132 + v * 24, 88 + v * 18]; });
          c.strokeStyle = 'rgba(70,45,25,0.5)'; c.lineWidth = 1.5;
          for (let y = Math.floor(y0 / 24) * 24; y < y1; y += 24) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        } else if (box === 'windowbox') {
          field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.02, 4); return [236 + v * 14, 226 + v * 14, 206 + v * 12]; });
          for (const b of boxes) {
            // the window above each box, with the sill
            const wy = b.y - 128;
            c.fillStyle = '#f7f3ea'; rect(c, 46, wy, 268, 122, 4); c.fill();
            const g = c.createLinearGradient(0, wy, 0, wy + 112);
            g.addColorStop(0, '#bfe0ee'); g.addColorStop(1, '#e8f3f2');
            c.fillStyle = g; c.fillRect(56, wy + 8, 248, 106);
            c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.moveTo(70, wy + 108); c.lineTo(120, wy + 12); c.lineTo(140, wy + 12); c.lineTo(90, wy + 108); c.fill();
            c.fillStyle = '#f7f3ea'; c.fillRect(176, wy + 8, 8, 106); c.fillRect(56, wy + 58, 248, 6);
            c.fillStyle = '#d9d0bf'; c.fillRect(36, b.y - 10, 288, 10);
          }
        } else if (box === 'pots') {
          // three wide stone steps
          for (let i = 0; i < 3; i++) {
            const y = y0 + ((y1 - y0) * i) / 3;
            field(c, x0, y, x1, y + (y1 - y0) / 3 + 1, 3, (x, yy) => { const v = nz.fbm(x * 0.03, yy * 0.03 + i * 9, 4); return [196 + v * 30 - i * 8, 190 + v * 28 - i * 8, 178 + v * 24 - i * 8]; });
            c.fillStyle = 'rgba(60,50,40,0.35)'; c.fillRect(x0, y + (y1 - y0) / 3 - 6, x1 - x0, 6);
            c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x0, y, x1 - x0, 2);
          }
          for (const p of pots) {
            const path = new Path2D(); path.arc(p.x, p.y, p.R, 0, Math.PI * 2);
            softShadow(c, path, 8, 0.45, 3, 6);
            dot(c, p.x, p.y, p.R, '#b45f35'); dot(c, p.x, p.y, p.R - 2, '#cf7a4a');
            c.strokeStyle = 'rgba(255,220,190,0.45)'; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, p.R - 3.5, 3.6, 5.4); c.stroke();
            dot(c, p.x, p.y, p.R - 6, '#3a2618');
          }
        } else if (box === 'dunes') {
          const g = ramp(['#d9c08c', '#e6d3a6', '#efe0bd', '#d2b583']);
          field(c, x0, y0, x1, y1, 3, (x, y) => g(0.5 + Math.sin(y * 0.03 + Math.sin(x * 0.02) * 1.5) * 0.3 + nz.fbm(x * 0.02, y * 0.02, 3) * 0.3));
          // tufts of old marram grass and a little sand fence
          for (let i = 0; i < 26; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (!SCENES.nearRegion(region, x, y, 24)) { c.save(); c.translate(x, y); PLANTS.marram(c, r, 11 + r() * 5); c.restore(); } }
          c.strokeStyle = '#8a6a4a'; c.lineWidth = 2;
          for (let x = 20; x < 360; x += 26) { c.beginPath(); c.moveTo(x, 584); c.lineTo(x + 2, 600); c.stroke(); }
        } else if (box === 'veg') {
          field(c, x0, y0, x1, y1, 2, (x, y) => { const v = nz.n2(x * 0.4, y * 0.4); return [190 + v * 40, 180 + v * 36, 160 + v * 30]; });
          for (const b of boxes) woodBox(c, b);
        } else if (box === 'baskets') {
          basketsDecor(c, r, nz, bleed);
        } else if (setName === 'lavender') {
          // warm gravel and an edging of old bricks, the kiln's brick wall above
          field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.04, y * 0.04, 3); return [214 + v * 20, 196 + v * 18, 164 + v * 16]; });
          for (let i = 0; i < 700; i++) dot(c, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.8 + r() * 1.6, U.pick(r, ['#b9a888', '#efe3cb', '#a8957a', '#cdb894']));
          const p = new Path2D(); rrPath(p, 34, 48, 292, 504, 26);
          softShadow(c, p, 8, 0.35);
          c.setLineDash([12, 3]); c.strokeStyle = '#a9553a'; c.lineWidth = 9; c.stroke(p);
          c.strokeStyle = '#c66a48'; c.lineWidth = 5; c.stroke(p); c.setLineDash([]);
        } else {
          mowedLawn(c, nz, x0, y0, x1, y1, true);
          grassGrain(c, r, x0, y0, x1, y1, 6, 0.2);
          const p = new Path2D(); rrPath(p, 34, 48, 292, 504, 26);
          softShadow(c, p, 8, 0.35);
          c.strokeStyle = '#b9ab92'; c.lineWidth = 8; c.stroke(p);
          c.strokeStyle = '#d9cdb6'; c.lineWidth = 3; c.stroke(p);
        }
        if (box === 'planters' || box === 'windowbox') for (const b of boxes) woodBox(c, b);
      },
      clean(c) {
        if (box === 'dunes') field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.fbm(x * 0.05, y * 0.05, 3); return [198 + v * 26, 172 + v * 22, 124 + v * 18]; });
        else richSoil(c, r, nz, box === 'veg' || box === 'bed');
        if (opts.dirt) for (const u of units) drawPlant(c, u, 1);
      },
      dirt(c) {
        if (box !== 'dunes') return drySoil(c, r, nz);
        // loose, wind-rippled sand
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 4); return [232 + v * 16, 214 + v * 16, 172 + v * 14]; });
        c.strokeStyle = 'rgba(160,130,80,0.35)'; c.lineWidth = 1.2;
        for (let y = 4; y < H; y += 7) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 12) c.lineTo(x, y + Math.sin(x * 0.06 + y * 0.4) * 2.2); c.stroke(); }
        for (let i = 0; i < 120; i++) dot(c, r() * W, r() * H, 0.8 + r() * 1.4, U.pick(r, ['#c9b38a', '#f4ead2', '#a89070']));
      },
      top(c) {
        if (box === 'baskets') return basketsTop(c, r);
        if (box !== 'veg') return;
        // seed packets on sticks at the start of each row
        const b = boxes[0], ih = b.h - b.rim * 2;
        ['#7cbf52', '#7fae9d', '#e0702a', '#d93a3a'].forEach((col, i) => {
          const y = b.y + b.rim + (ih / 4) * i + 8;
          c.fillStyle = '#c9a06a'; c.fillRect(b.x - 2, y + 14, 3, 12);
          c.fillStyle = '#f3ead6'; rect(c, b.x - 9, y, 17, 18, 2); c.fill();
          c.fillStyle = col; rect(c, b.x - 7, y + 2, 13, 10, 2); c.fill();
        });
      },
    };
  }

  // ------------------------------------------------------------- BUILDING
  function plankColour(r) { return U.pick(r, ['#c9925c', '#d29c64', '#be8752', '#d8a46c', '#c48d57']); }
  function drawPlank(c, u, k) {
    const e = k >= 1 ? 1 : U.easeBack(k);
    const lift = (1 - e) * 16, sc = 1 + (1 - Math.min(1, k)) * 0.06;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    c.fillStyle = 'rgba(30,20,10,0.3)'; c.fillRect(u.x + 1.5 + lift * 0.3, u.y + 2.5 + lift * 0.5, u.w, u.h);
    c.translate(u.x + u.w / 2, u.y + u.h / 2 - lift); c.scale(sc, sc);
    const w = u.w, h = u.h, r = U.rng(u.seed);
    c.fillStyle = U.shade(u.col, -0.22); rect(c, -w / 2, -h / 2, w, h, 3); c.fill();
    c.fillStyle = u.col; rect(c, -w / 2, -h / 2, w, h - 1.6, 3); c.fill();
    c.strokeStyle = U.rgba(U.shade(u.col, -0.35), 0.55); c.lineWidth = 0.7;
    for (let i = 0; i < 4; i++) {
      const y = -h / 2 + 3 + r() * (h - 7);
      c.beginPath(); c.moveTo(-w / 2 + 3, y); c.bezierCurveTo(-w / 6, y + (r() - 0.5) * 3, w / 6, y + (r() - 0.5) * 3, w / 2 - 3, y + (r() - 0.5) * 2); c.stroke();
    }
    if (r() < 0.6) {
      const kx = (r() - 0.5) * w * 0.6, ky = (r() - 0.5) * h * 0.2;
      c.strokeStyle = U.rgba(U.shade(u.col, -0.45), 0.6);
      for (let i = 1; i <= 2; i++) { c.beginPath(); c.ellipse(kx, ky, 2.2 * i, 1.3 * i, 0, 0, 7); c.stroke(); }
    }
    c.fillStyle = 'rgba(255,245,220,0.22)'; c.fillRect(-w / 2 + 2, -h / 2 + 1.5, w - 4, 2.2);
    for (const nx of u.nails || []) { dot(c, nx - u.x - w / 2, -h * 0.24, 1.15, '#6d6a66'); dot(c, nx - u.x - w / 2, h * 0.2, 1.15, '#6d6a66'); }
    c.restore();
  }
  function drawBrick(c, u, k) {
    const e = k >= 1 ? 1 : U.easeBack(k);
    const lift = (1 - e) * 14;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    c.translate(u.x, u.y - lift);
    const r = U.rng(u.seed), w = u.w, h = u.h;
    if (u.top) {
      // flat stone coping on the top course
      c.fillStyle = '#9d968a'; rect(c, 0, 0, w, h, 2); c.fill();
      c.fillStyle = '#c9c2b4'; rect(c, 0, 0, w, h - 2.5, 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(2, 1.5, w - 4, 2);
    } else {
      c.fillStyle = U.shade(u.col, -0.25); rect(c, 0, 0, w, h, 2); c.fill();
      c.fillStyle = u.col; rect(c, 0, 0, w, h - 2, 2); c.fill();
      for (let i = 0; i < 14; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,230,200,0.16)'; c.fillRect(r() * (w - 2), r() * (h - 3), 1.4, 1.4); }
      c.fillStyle = 'rgba(255,230,200,0.22)'; c.fillRect(1.5, 1, w - 3, 1.6);
    }
    c.restore();
  }
  function drawTile(c, u, k) {
    const e = k >= 1 ? 1 : U.easeBack(k);
    const sc = 0.82 + e * 0.18;
    c.save();
    c.globalAlpha = Math.min(1, k * 3);
    c.translate(u.x + u.w / 2, u.y + u.h / 2); c.scale(sc, sc);
    const w = u.w, h = u.h, blue = '#2f5fa8', light = '#86acdf', paper = '#f6f2e8';
    c.fillStyle = 'rgba(30,30,40,0.25)'; c.fillRect(-w / 2 + 1, -h / 2 + 1.5, w, h);
    c.fillStyle = u.border ? blue : paper; c.fillRect(-w / 2, -h / 2, w, h);
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
    if (u.border) {
      c.fillStyle = paper; c.beginPath(); c.moveTo(0, -h * 0.32); c.lineTo(w * 0.32, 0); c.lineTo(0, h * 0.32); c.lineTo(-w * 0.32, 0); c.closePath(); c.fill();
      dot(c, 0, 0, w * 0.1, blue);
    } else {
      // quarter circles in the corners meet the neighbours' to make rings
      c.strokeStyle = blue; c.lineWidth = 2.6;
      for (const [cx, cy] of [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]]) { c.beginPath(); c.arc(cx, cy, w * 0.36, 0, 7); c.stroke(); dot(c, cx, cy, w * 0.14, light); }
      c.fillStyle = blue;
      for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2 + Math.PI / 4); c.beginPath(); c.ellipse(0, -w * 0.15, w * 0.07, w * 0.15, 0, 0, 7); c.fill(); c.restore(); }
      dot(c, 0, 0, w * 0.06, '#f2c230');
    }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, 2);
    c.restore();
  }
  function drawLog(c, u, k) {
    const e = k >= 1 ? 1 : U.easeBack(k);
    const lift = (1 - e) * 22;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    c.translate(u.x, u.y - lift);
    const R = u.r, r = U.rng(u.seed);
    dot(c, 1.5, 2.5, R, 'rgba(20,12,6,0.35)');
    dot(c, 0, 0, R, '#4e3420'); dot(c, 0, 0, R - 1.2, '#6b4a30');
    const g = c.createRadialGradient(-R * 0.2, -R * 0.2, 1, 0, 0, R * 0.85);
    g.addColorStop(0, '#ecd2a2'); g.addColorStop(1, '#c99d66');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 0.82, 0, 7); c.fill();
    c.strokeStyle = 'rgba(140,95,50,0.55)'; c.lineWidth = 0.8;
    const ox = (r() - 0.5) * R * 0.2, oy = (r() - 0.5) * R * 0.2;
    for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(ox * (1 - i / 4), oy * (1 - i / 4), (R * 0.8 * i) / 4, 0, 7); c.stroke(); }
    c.strokeStyle = 'rgba(90,60,30,0.6)';
    for (let i = 0; i < 2; i++) { const a = r() * 6.28; c.beginPath(); c.moveTo(ox, oy); c.lineTo(Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75); c.stroke(); }
    c.restore();
  }

  function buildScene(S) {
    const { r, nz, opts, bleed } = S;
    const mat = opts.material || 'planks';
    const region = new Path2D();
    const units = [];
    let drawUnit = drawPlank, joists = [], posts = [], area = null;

    if (mat === 'planks') {
      const parts = opts.jetty ? [{ x: 72, y: 40, w: 216, h: 150 }, { x: 128, y: 190, w: 104, h: 420 }] : opts.boardwalk ? [{ x: 112, y: -10, w: 136, h: 620 }] : [{ x: 18, y: 36, w: 324, h: 528 }];
      for (const p of parts) region.rect(p.x, p.y, p.w, p.h);
      area = parts;
      joists = opts.jetty ? [136, 224, 80, 280] : opts.boardwalk ? [122, 238] : [24, 104, 184, 264, 336];
      for (const p of parts) {
        const js = joists.filter((x) => x > p.x && x < p.x + p.w);
        let row = 0;
        for (let y = p.y + 2; y + 20 <= p.y + p.h; y += 23, row++) {
          // planks join on a joist, staggered row by row
          const inner = js.filter((x) => x > p.x + 30 && x < p.x + p.w - 30);
          const cuts = inner.length < 2 ? [] : row % 2 ? [inner[(row >> 1) % inner.length]] : inner.filter((_, i) => i % 2 === (row >> 1) % 2);
          const edges = [p.x + 2].concat(cuts.sort((a, b) => a - b), [p.x + p.w - 2]);
          for (let i = 0; i < edges.length - 1; i++) {
            const x = edges[i] + 1, w = edges[i + 1] - edges[i] - 2;
            units.push({ shape: 'rect', x, y, w, h: 20, col: plankColour(r), seed: (r() * 1e9) | 0, nails: js.filter((jx) => jx > x + 3 && jx < x + w - 3) });
          }
        }
      }
      if (opts.jetty || opts.boardwalk) for (const p of parts) for (let y = p.y + 30; y < p.y + p.h; y += 90) posts.push([p.x + 6, y], [p.x + p.w - 6, y]);
    } else if (mat === 'bricks' && opts.path) {
      // a brick path across the lawn, seen from above
      area = [{ x: 104, y: -10, w: 152, h: 620 }];
      region.rect(104, -10, 152, 620);
      drawUnit = drawBrick;
      for (let row = 0, y = -8; y < 600; y += 25, row++) {
        for (let x = 104 - (row % 2 ? 24 : 0); x < 256; x += 48) {
          const x0 = Math.max(106, x + 1), x1 = Math.min(254, x + 47);
          if (x1 - x0 > 8) units.push({ shape: 'rect', x: x0, y: y + 1, w: x1 - x0, h: 22, col: U.pick(r, ['#b5553a', '#c4623f', '#a94c35', '#c96f4a', '#9e4a36']), seed: (r() * 1e9) | 0 });
        }
      }
    } else if (mat === 'bricks') {
      // a low garden wall, front on: running bond with a stone coping
      area = [{ x: 16, y: 118, w: 328, h: 364 }];
      region.rect(16, 118, 328, 364);
      drawUnit = drawBrick;
      for (let row = 0, y = 456; y >= 140; y -= 26, row++) {
        for (let x = 18 - (row % 2 ? 28 : 0); x < 342; x += 56) {
          const x0 = Math.max(18, x), x1 = Math.min(342, x + 52);
          if (x1 - x0 > 10) units.push({ shape: 'rect', x: x0, y, w: x1 - x0, h: 22, col: U.pick(r, ['#b5553a', '#c4623f', '#a94c35', '#c96f4a', '#9e4a36', '#b86a45']), seed: (r() * 1e9) | 0 });
        }
      }
      for (let x = 18; x < 342; x += 82) units.push({ shape: 'rect', x, y: 120, w: Math.min(80, 342 - x), h: 18, top: true, seed: (r() * 1e9) | 0 });
    } else if (mat === 'tiles') {
      // blue and white tiles on the wall behind the café counter
      const cols = 7, rows = 9, pitch = 41, tw = 38;
      const gx = 180 - (cols * pitch) / 2, gy = 50;
      area = [{ x: gx - 2, y: gy - 2, w: cols * pitch + 1, h: rows * pitch + 1 }];
      region.rect(gx - 2, gy - 2, cols * pitch + 1, rows * pitch + 1);
      drawUnit = drawTile;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) units.push({ shape: 'rect', x: gx + i * pitch, y: gy + j * pitch, w: tw, h: tw, border: j === 0, seed: (r() * 1e9) | 0 });
    } else {
      // a woodpile: log ends stacked in a little shelter
      area = [{ x: 34, y: 112, w: 292, h: 430 }];
      region.rect(34, 112, 292, 430);
      drawUnit = drawLog;
      let y = 524;
      while (y > 128) {
        let x = 40 + r() * 8;
        let rowR = 0;
        while (x < 318) {
          const R = 13 + r() * 5;
          if (x + R * 2 > 322) break;
          units.push({ shape: 'circle', x: x + R, y: y - (r() - 0.5) * 3, r: R, seed: (r() * 1e9) | 0 });
          x += R * 2 + 0.5; rowR = Math.max(rowR, R);
        }
        y -= rowR * 1.75;
      }
    }

    const sitePaint = (c) => {
      // what is under the pieces: joists, mortar, plaster or back boards
      if (mat === 'planks') {
        if (opts.jetty && opts.sea) {
          const g = ramp(['#1f5a74', '#2a6c86', '#3a7f96']);
          field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.02, y * 0.02, 3)));
        } else if (opts.boardwalk) {
          field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.n2(x * 0.3, y * 0.3); return [196 + v * 30, 172 + v * 26, 120 + v * 20]; });
        } else if (opts.jetty) {
          const g = ramp(['#2f5b5a', '#3a6b66', '#4a7a6e']);
          field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.02, y * 0.02, 3)));
        } else {
          field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.n2(x * 0.35, y * 0.35); return [120 + v * 40, 110 + v * 36, 96 + v * 30]; });
        }
        for (const jx of joists) {
          c.fillStyle = 'rgba(20,15,10,0.35)'; c.fillRect(jx - 4, 0, 12, H);
          c.fillStyle = '#6e4c30'; c.fillRect(jx - 5, 0, 10, H);
          c.fillStyle = '#8a6240'; c.fillRect(jx - 5, 0, 3, H);
        }
        for (const [x, y] of posts) { dot(c, x, y, 7, '#4e3420'); dot(c, x - 1, y - 1, 5, '#6e4c30'); }
      } else if (mat === 'bricks' && opts.path) {
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.fbm(x * 0.08, y * 0.08, 3); return [214 + v * 26, 190 + v * 24, 140 + v * 20]; });
        c.strokeStyle = 'rgba(150,120,80,0.35)'; c.lineWidth = 1;
        for (let y = 0; y < H; y += 25) { c.beginPath(); c.moveTo(104, y); c.lineTo(256, y); c.stroke(); }
      } else if (mat === 'bricks') {
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.n2(x * 0.4, y * 0.4); return [198 + v * 26, 192 + v * 24, 180 + v * 22]; });
        c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.8;
        for (let y = 456; y >= 140; y -= 26) { c.beginPath(); c.moveTo(10, y + 0.5); c.lineTo(350, y + 0.5); c.stroke(); }
      } else if (mat === 'tiles') {
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.n2(x * 0.3, y * 0.3); return [196 + v * 18, 194 + v * 18, 188 + v * 16]; });
        // combed tile adhesive
        c.strokeStyle = 'rgba(120,120,115,0.35)'; c.lineWidth = 1.4;
        for (let y = 50; y < 430; y += 5) { c.beginPath(); c.moveTo(20, y); for (let x = 20; x <= 340; x += 16) c.lineTo(x, y + Math.sin(x * 0.04 + y * 0.3) * 1.5); c.stroke(); }
      } else {
        field(c, 0, 0, W, H, 3, (x, y) => { const v = nz.fbm(x * 0.01, y * 0.05, 3); return [70 + v * 26, 52 + v * 20, 38 + v * 16]; });
        c.strokeStyle = 'rgba(20,12,6,0.6)'; c.lineWidth = 2;
        for (let x = 34; x < 330; x += 32) { c.beginPath(); c.moveTo(x, 100); c.lineTo(x, 545); c.stroke(); }
      }
    };

    return {
      family: 'build', particle: mat === 'planks' || mat === 'logs' ? 'chips' : 'dust', region, depth: false,
      unitKind: 'build', unitParticle: mat === 'planks' || mat === 'logs' ? 'chips' : 'dust', unitThreshold: 0.4, unitDur: 0.42,
      units: opts.dirt ? [] : units,
      drawUnit,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        if (mat === 'planks' && opts.jetty && opts.sea) {
          const g = ramp(['#2a7398', '#3a88ac', '#58a4c2', '#84c3d6']);
          field(c, x0, y0, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.012, y * 0.012, 4) * 0.7 + 0.15 - Math.max(0, (y - 470) / 260)));
          // waves and foam, and the beach at the bottom
          c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1.4;
          for (let i = 0; i < 46; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (480 - y0); c.beginPath(); c.moveTo(x - 12, y); c.quadraticCurveTo(x, y - 4, x + 12, y); c.stroke(); }
          field(c, x0, 520, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 3); return [226 + v * 18, 206 + v * 16, 160 + v * 14]; });
          c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(x0, 520); for (let x = x0; x <= x1; x += 10) c.lineTo(x, 516 + Math.sin(x * 0.08) * 4); c.lineTo(x1, 528); c.lineTo(x0, 528); c.fill();
        } else if (mat === 'planks' && opts.boardwalk) {
          const g = ramp(['#d9c08c', '#e6d3a6', '#efe0bd', '#d2b583']);
          field(c, x0, y0, x1, y1, 3, (x, y) => g(0.5 + Math.sin(y * 0.03 + Math.sin(x * 0.02) * 1.5) * 0.3 + nz.fbm(x * 0.02, y * 0.02, 3) * 0.3));
          for (let i = 0; i < 40; i++) { const x = r() < 0.5 ? x0 + r() * (112 - x0 - 10) : 258 + r() * (x1 - 258), y = y0 + r() * (y1 - y0); c.save(); c.translate(x, y); PLANTS.marram(c, r, 12 + r() * 6); c.restore(); }
        } else if (mat === 'planks' && opts.jetty) {
          const g = ramp(['#2f6b6a', '#3f7f78', '#5a958a', '#7eb3a2']);
          field(c, x0, y0, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.012, y * 0.012, 4) * 0.8 + 0.1));
          c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1;
          for (let i = 0; i < 40; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); c.beginPath(); c.ellipse(x, y, 8 + r() * 16, 3 + r() * 4, 0, 0, 7); c.stroke(); }
          for (let i = 0; i < 9; i++) {
            const x = r() < 0.5 ? 20 + r() * 40 : 300 + r() * 40, y = 220 + r() * 360, s = 12 + r() * 8;
            c.fillStyle = '#4f8a3c'; c.beginPath(); c.moveTo(x, y); c.arc(x, y, s, 0.4, 6.0); c.closePath(); c.fill();
            if (r() < 0.4) dot(c, x + 3, y - 2, 4, '#f6c8d8');
          }
        } else if (mat === 'planks' || (mat === 'bricks' && opts.path)) {
          mowedLawn(c, nz, x0, y0, x1, y1, false);
          grassGrain(c, r, x0, y0, x1, y1, 6, 0.22);
        } else if (mat === 'bricks') {
          const g = c.createLinearGradient(0, y0, 0, 120);
          g.addColorStop(0, '#bfe2ef'); g.addColorStop(1, '#eef4ea');
          c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, 120 - y0);
          // the café terrace beyond the wall
          c.fillStyle = '#d9c6a5'; c.fillRect(x0, 60, x1 - x0, 60);
          for (let x = 20; x < 360; x += 70) { c.fillStyle = '#b07d55'; c.fillRect(x, 70, 4, 34); dot(c, x + 2, 66, 14, '#6aa04c'); }
          field(c, x0, 482, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.04, y * 0.04, 3); return [190 + v * 24, 182 + v * 22, 168 + v * 20]; });
          c.strokeStyle = 'rgba(90,80,70,0.35)'; c.lineWidth = 1.5;
          for (let x = 0; x < 380; x += 60) { c.beginPath(); c.moveTo(x, 482); c.lineTo(x - 20, y1); c.stroke(); }
        } else if (mat === 'tiles') {
          field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.02, 3); return [238 + v * 10, 230 + v * 10, 214 + v * 10]; });
          // the counter in front
          c.fillStyle = '#7d5434'; c.fillRect(x0, 440, x1 - x0, 16);
          c.fillStyle = '#a2734a'; c.fillRect(x0, 440, x1 - x0, 10);
          c.fillStyle = '#5d8c66'; c.fillRect(x0, 456, x1 - x0, y1 - 456);
          c.strokeStyle = '#4a7553'; c.lineWidth = 3;
          for (let x = 10; x < 350; x += 86) c.strokeRect(x, 474, 72, 100);
          for (const [x, col] of [[60, '#f7f3ea'], [86, '#e98a7c'], [112, '#8fbfe6']]) { c.fillStyle = col; rect(c, x, 420, 18, 20, 3); c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(x + 19, 430, 5, -1.2, 1.2); c.stroke(); }
          c.fillStyle = '#c8763f'; c.fillRect(280, 412, 30, 28);
          for (let i = 0; i < 9; i++) leaf(c, 295, 412, -Math.PI / 2 + (i - 4) * 0.35, 22, 6, i % 2 ? '#4f8a3a' : '#62a042');
        } else {
          field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.02, 3); return [140 + v * 30, 170 + v * 30, 110 + v * 20]; });
          // the shelter: posts, a little roof and a floor
          c.fillStyle = '#5a3d28'; c.fillRect(20, 96, 16, 460); c.fillRect(324, 96, 16, 460);
          c.fillStyle = '#7a5236'; c.fillRect(22, 96, 5, 460); c.fillRect(326, 96, 5, 460);
          c.fillStyle = '#4b5560'; c.beginPath(); c.moveTo(4, 112); c.lineTo(180, 52); c.lineTo(356, 112); c.lineTo(356, 122); c.lineTo(4, 122); c.closePath(); c.fill();
          c.fillStyle = '#5f6b77'; c.beginPath(); c.moveTo(4, 112); c.lineTo(180, 52); c.lineTo(356, 112); c.lineTo(180, 64); c.closePath(); c.fill();
          c.fillStyle = '#6e4c30'; c.fillRect(20, 542, 320, 14);
        }
        if (area && mat !== 'tiles') {
          const p = new Path2D(); for (const a of area) p.rect(a.x, a.y, a.w, a.h);
          softShadow(c, p, 8, 0.35);
        }
      },
      clean(c) {
        sitePaint(c);
        if (opts.dirt) for (const u of units) drawUnit(c, u, 1);
      },
      dirt(c) {
        sitePaint(c);
        if (mat === 'tiles') {
          // old flaky plaster with stains
          const g = ramp(['#d8cdb3', '#e4dac3', '#cfc1a2']);
          field(c, 0, 0, W, H, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 240]);
          for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(140,110,60,0.18)'; c.beginPath(); c.ellipse(r() * W, r() * H, 10 + r() * 24, 8 + r() * 30, 0, 0, 7); c.fill(); }
          c.strokeStyle = 'rgba(110,95,70,0.6)'; c.lineWidth = 0.8;
          for (let i = 0; i < 30; i++) { let x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 22; y += r() * 14; c.lineTo(x, y); } c.stroke(); }
        } else if (mat === 'bricks' && opts.path) {
          SCENES.tallGrass(c, r, nz, region, 0, 0, W, H);
        } else if (mat === 'bricks') {
          rubble(c, r, nz, ['#a94c35', '#c4623f', '#8e3f2c', '#d0c6b8', '#bdb3a3'], ['#cfc4b2', '#bfb39f', '#ddd3c2']);
          for (let i = 0; i < 26; i++) { const x = r() * W, y = 130 + r() * 340; for (let k = 0; k < 6; k++) leaf(c, x, y, -Math.PI / 2 + (k - 2.5) * 0.4, 8 + r() * 6, 2.5, '#5d9644'); }
        } else if (mat === 'logs') {
          rubble(c, r, nz, ['#7a5a3a', '#5a3d28', '#9c7a52'], ['#4a3424', '#5a4130', '#3e2c1f']);
          c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.6;
          for (const [cx, cy, a0] of [[36, 124, 0], [324, 124, Math.PI / 2], [36, 536, -Math.PI / 2], [324, 536, Math.PI]]) {
            for (let i = 0; i < 7; i++) { const a = a0 + (i / 6) * Math.PI / 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60); c.stroke(); }
            for (let d = 12; d < 60; d += 10) { c.beginPath(); c.arc(cx, cy, d, a0, a0 + Math.PI / 2); c.stroke(); }
          }
        } else if (opts.jetty) {
          // the old jetty: grey, rotten boards with gaps where some are missing
          for (const u of units) {
            if (r() < 0.22) continue;
            c.save(); c.translate(u.x + u.w / 2, u.y + u.h / 2); c.rotate((r() - 0.5) * (r() < 0.3 ? 0.35 : 0.06));
            const w = u.w * (r() < 0.25 ? 0.5 + r() * 0.3 : 1);
            c.fillStyle = '#6f6a62'; rect(c, -w / 2, -u.h / 2, w, u.h, 2); c.fill();
            c.fillStyle = '#8f8a80'; rect(c, -w / 2, -u.h / 2, w, u.h - 2, 2); c.fill();
            c.strokeStyle = 'rgba(60,55,50,0.5)'; c.lineWidth = 0.7;
            for (let k = 0; k < 3; k++) { const y = -u.h / 2 + 4 + k * 5; c.beginPath(); c.moveTo(-w / 2 + 3, y); c.lineTo(w / 2 - 3, y + (r() - 0.5) * 2); c.stroke(); }
            if (r() < 0.5) { c.fillStyle = 'rgba(80,120,60,0.5)'; c.beginPath(); c.ellipse((r() - 0.5) * w * 0.6, 0, 8 + r() * 10, 4, 0, 0, 7); c.fill(); }
            c.restore();
          }
        } else {
          rubble(c, r, nz, ['#e3c99a', '#c9a56e', '#9c7a52', '#7d6a58'], ['#d9c49a', '#cdb68a', '#e6d4ae']);
          // a few old broken boards lying about
          for (let i = 0; i < 9; i++) {
            c.save(); c.translate(30 + r() * 300, 60 + r() * 480); c.rotate((r() - 0.5) * 1.2);
            c.fillStyle = '#8f8476'; rect(c, -30, -8, 60, 16, 2); c.fill();
            c.fillStyle = '#a89c8c'; c.fillRect(-28, -6, 56, 4);
            c.restore();
          }
        }
      },
    };
  }

  Object.assign(SCENES.KINDS, { plant: plantScene, build: buildScene });
})();
