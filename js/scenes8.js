'use strict';
// More jobs made of pieces: things to pick up on the beach (they fly off to
// a bucket), a sandcastle, Christmas lights that switch on bulb by bulb, and
// a drinks fridge where every bottle has its own labelled place.

(() => {
  const { W, H, field, ramp, softShadow } = SCENES;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const rect = (c, x, y, w, h, rad) => { c.beginPath(); c.roundRect(x, y, w, h, rad); };

  function sand(c, nz, x0, y0, x1, y1, tone = 0) {
    field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 4); return [228 + v * 18 - tone, 208 + v * 16 - tone, 160 + v * 14 - tone]; });
  }

  // ---------------------------------------------------------------- BEACH
  const ITEMS = {
    bottle(c, r, s) {
      const col = U.pick(r, ['#4f9a6a', '#7fb8c4', '#8a5a2b']);
      c.fillStyle = U.rgba(col, 0.88); rect(c, -s, -s * 0.28, s * 1.4, s * 0.56, s * 0.25); c.fill();
      rect(c, s * 0.35, -s * 0.12, s * 0.55, s * 0.24, 2); c.fill();
      c.fillStyle = '#e2574c'; rect(c, s * 0.85, -s * 0.14, s * 0.18, s * 0.28, 1.5); c.fill();
      c.fillStyle = '#f4ecdc'; rect(c, -s * 0.6, -s * 0.27, s * 0.5, s * 0.54, 1); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.55)'; rect(c, -s * 0.9, -s * 0.2, s * 1.1, s * 0.08, 1); c.fill();
    },
    can(c, r, s) {
      const col = U.pick(r, ['#d9534f', '#3d86c6', '#4f9d7a', '#f2b531']);
      c.fillStyle = col; rect(c, -s * 0.7, -s * 0.36, s * 1.4, s * 0.72, s * 0.2); c.fill();
      c.fillStyle = '#ffffff'; c.fillRect(-s * 0.2, -s * 0.36, s * 0.3, s * 0.72);
      c.fillStyle = '#c6ccd3'; rect(c, s * 0.58, -s * 0.36, s * 0.14, s * 0.72, 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-s * 0.65, -s * 0.24, s * 1.2, s * 0.09);
    },
    packet(c, r, s) {
      const col = U.pick(r, ['#f2c230', '#3d86c6', '#d9534f', '#8bc34a']);
      c.fillStyle = col; c.beginPath();
      for (let i = 0; i <= 6; i++) c.lineTo(-s * 0.55 + (i * s * 1.1) / 6, -s * 0.7 + (i % 2) * 2.5);
      for (let i = 0; i <= 6; i++) c.lineTo(s * 0.55 - (i * s * 1.1) / 6, s * 0.7 - (i % 2) * 2.5);
      c.closePath(); c.fill();
      dot(c, 0, 0, s * 0.3, '#ffffff'); dot(c, 0, 0, s * 0.18, U.shade(col, -0.3));
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-s * 0.4, -s * 0.55, s * 0.18, s * 1.1);
    },
    flipflop(c, r, s) {
      const col = U.pick(r, ['#ef8aa6', '#4fb3c9', '#f7c548']);
      c.fillStyle = U.shade(col, -0.25); c.beginPath(); c.ellipse(0, 1, s * 1.0, s * 0.42, 0, 0, 7); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s * 0.95, s * 0.38, 0, 0, 7); c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s * 0.45, 0); c.lineTo(-s * 0.1, -s * 0.32); c.moveTo(s * 0.45, 0); c.lineTo(-s * 0.1, s * 0.32); c.stroke();
    },
    bag(c, r, s) {
      c.fillStyle = 'rgba(245,248,250,0.75)'; c.beginPath(); c.ellipse(0, 0, s * 0.9, s * 0.7, r() * 0.5, 0, 7); c.fill();
      c.strokeStyle = 'rgba(200,210,220,0.9)'; c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(s * 0.85, -s * 0.3, s * 0.3, s * 0.18, 0, 0, 7); c.stroke();
      c.beginPath(); c.ellipse(s * 0.85, s * 0.3, s * 0.3, s * 0.18, 0, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(170,180,195,0.6)'; c.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-s * 0.6, (i - 1.5) * s * 0.3); c.lineTo(s * 0.5, (i - 1.5) * s * 0.25); c.stroke(); }
    },
    cup(c, r, s) {
      dot(c, 0, 0, s * 0.62, '#f4ecdc'); dot(c, 0, 0, s * 0.48, '#d8cbb4');
      c.strokeStyle = U.pick(r, ['#d9534f', '#3d86c6']); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s * 0.56, 0, 7); c.stroke();
      c.strokeStyle = '#ef8aa6'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-s * 0.1, 0); c.lineTo(s * 0.8, -s * 0.5); c.stroke();
    },
    rope(c, r, s) {
      c.strokeStyle = U.pick(r, ['#e56e2f', '#3d86c6', '#4f9d7a']); c.lineWidth = 2.2; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse((r() - 0.5) * s * 0.5, (r() - 0.5) * s * 0.5, s * (0.5 + r() * 0.4), s * (0.3 + r() * 0.3), r() * 3, 0, 7); c.stroke(); }
    },
    buoy(c, r, s) {
      dot(c, 0, 0, s * 0.7, '#e56e2f'); dot(c, -s * 0.15, -s * 0.15, s * 0.45, '#f08a4a');
      c.fillStyle = '#ffffff'; c.fillRect(-s * 0.7, -s * 0.12, s * 1.4, s * 0.24);
      dot(c, -s * 0.25, -s * 0.3, s * 0.12, 'rgba(255,255,255,0.7)');
    },
    boot(c, r, s) {
      c.fillStyle = '#3f7a4a'; c.beginPath(); c.moveTo(-s * 0.9, -s * 0.3); c.lineTo(s * 0.2, -s * 0.3); c.quadraticCurveTo(s * 0.9, -s * 0.3, s * 0.95, s * 0.15); c.lineTo(s * 0.95, s * 0.35); c.lineTo(-s * 0.9, s * 0.35); c.closePath(); c.fill();
      c.fillStyle = '#2f5f3a'; c.fillRect(-s * 0.9, s * 0.2, s * 1.85, s * 0.15);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-s * 0.8, -s * 0.22, s * 0.8, s * 0.08);
    },
    driftwood(c, r, s) {
      c.strokeStyle = '#a89a86'; c.lineCap = 'round';
      c.lineWidth = s * 0.32; c.beginPath(); c.moveTo(-s * 1.1, s * 0.1); c.quadraticCurveTo(0, -s * 0.15, s * 1.1, 0); c.stroke();
      c.lineWidth = s * 0.16; c.beginPath(); c.moveTo(s * 0.2, -s * 0.05); c.lineTo(s * 0.6, -s * 0.55); c.stroke();
      c.strokeStyle = '#c9bda9'; c.lineWidth = s * 0.1; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.22, s, -s * 0.07); c.stroke();
    },
    crate(c, r, s) {
      for (let i = 0; i < 2; i++) {
        c.save(); c.rotate((i - 0.5) * 0.5);
        c.fillStyle = '#b08a5a'; rect(c, -s, -s * 0.22 + i * s * 0.35, s * 2, s * 0.3, 2); c.fill();
        c.fillStyle = 'rgba(80,50,25,0.4)'; c.fillRect(-s * 0.8, -s * 0.14 + i * s * 0.35, s * 1.6, 1);
        c.restore();
      }
    },
    scallop(c, r, s) {
      const col = U.pick(r, ['#f3d9c4', '#f6c9b8', '#efe2c8']);
      c.fillStyle = col; c.beginPath(); c.moveTo(0, s * 0.55); c.arc(0, s * 0.1, s * 0.8, Math.PI * 1.15, Math.PI * 1.85); c.closePath(); c.fill();
      c.strokeStyle = U.shade(col, -0.2); c.lineWidth = 0.9;
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.2 + i * 0.1); c.beginPath(); c.moveTo(0, s * 0.55); c.lineTo(Math.cos(a) * s * 0.8, s * 0.1 + Math.sin(a) * s * 0.8); c.stroke(); }
      c.fillStyle = U.shade(col, -0.1); rect(c, -s * 0.25, s * 0.42, s * 0.5, s * 0.2, 2); c.fill();
    },
    whelk(c, r, s) {
      for (let i = 0; i < 4; i++) dot(c, -s * 0.35 + i * s * 0.28, 0, s * (0.5 - i * 0.1), i % 2 ? '#e8d6be' : '#d9c3a6');
      c.strokeStyle = '#b39878'; c.lineWidth = 0.9; c.beginPath(); c.arc(-s * 0.35, 0, s * 0.3, 0, 5); c.stroke();
      dot(c, -s * 0.5, -s * 0.1, s * 0.12, '#f7ecdc');
    },
    mussel(c, r, s) {
      c.fillStyle = '#2f3d5a'; c.beginPath(); c.ellipse(0, 0, s * 0.75, s * 0.38, 0, 0, 7); c.fill();
      c.fillStyle = '#4a5f86'; c.beginPath(); c.ellipse(-s * 0.1, -s * 0.08, s * 0.5, s * 0.2, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(200,220,255,0.6)'; c.beginPath(); c.ellipse(-s * 0.2, -s * 0.12, s * 0.2, s * 0.06, 0, 0, 7); c.fill();
    },
    starfish(c, r, s) {
      const col = U.pick(r, ['#f08a4a', '#e8644a', '#f2b531']);
      c.fillStyle = col; c.beginPath();
      for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283 - Math.PI / 2, q = i % 2 ? s * 0.32 : s * 0.85; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
      c.closePath(); c.fill();
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 - Math.PI / 2; for (let k = 1; k <= 2; k++) dot(c, Math.cos(a) * s * 0.25 * k, Math.sin(a) * s * 0.25 * k, 1, '#fff2d6'); }
    },
    seaglass(c, r, s) {
      const col = U.pick(r, ['#9fd8c4', '#8fbfe6', '#e6f2ee', '#b8d98a']);
      c.fillStyle = U.rgba(col, 0.85); c.beginPath();
      for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283, q = s * (0.45 + r() * 0.25); c.lineTo(Math.cos(a) * q, Math.sin(a) * q * 0.8); }
      c.closePath(); c.fill();
      dot(c, -s * 0.15, -s * 0.12, s * 0.12, 'rgba(255,255,255,0.75)');
    },
    sanddollar(c, r, s) {
      dot(c, 0, 0, s * 0.62, '#efe6d4'); dot(c, 0, 0, s * 0.5, '#f6efe1');
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 - Math.PI / 2; c.fillStyle = '#d8ccb4'; c.beginPath(); c.ellipse(Math.cos(a) * s * 0.24, Math.sin(a) * s * 0.24, s * 0.14, s * 0.05, a, 0, 7); c.fill(); }
    },
    cockle(c, r, s) {
      dot(c, 0, 0, s * 0.55, '#e9dcc3');
      c.strokeStyle = '#c9b597'; c.lineWidth = 0.9;
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.4; c.beginPath(); c.moveTo(0, s * 0.45); c.lineTo(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55); c.stroke(); }
    },
  };
  const ITEM_SETS = {
    litter: ['bottle', 'can', 'packet', 'flipflop', 'bag', 'cup', 'can', 'packet'],
    storm: ['rope', 'buoy', 'boot', 'driftwood', 'crate', 'bottle', 'rope', 'driftwood'],
    driftwood: ['driftwood', 'driftwood', 'crate'],
    shells: ['scallop', 'whelk', 'mussel', 'starfish', 'cockle', 'scallop', 'seaglass', 'sanddollar'],
    seaglass: ['seaglass', 'seaglass', 'mussel', 'cockle', 'whelk', 'seaglass'],
  };
  function drawItem(c, u) {
    c.save(); c.translate(u.x, u.y); c.rotate(u.rot);
    c.fillStyle = 'rgba(80,55,20,0.2)'; c.beginPath(); c.ellipse(1.5, 2.5, u.s * 0.95, u.s * 0.6, 0, 0, 7); c.fill();
    ITEMS[u.kind](c, U.rng(u.seed), u.s);
    c.restore();
  }

  function beach(S) {
    const { r, nz, opts, bleed } = S;
    const set = ITEM_SETS[opts.items || 'litter'], bin = /litter|storm/.test(opts.items || 'litter');
    const target = { x: 316, y: 548 };
    const region = new Path2D();
    region.moveTo(14, 96); for (let x = 14; x <= 346; x += 12) region.lineTo(x, 88 + Math.sin(x * 0.05) * 6);
    region.lineTo(346, 584); region.lineTo(14, 584); region.closePath();
    region.moveTo(target.x + 34, target.y); region.arc(target.x, target.y, 34, 0, Math.PI * 2, true);
    const units = [];
    for (let tries = 0; units.length < 22 && tries < 900; tries++) {
      const x = 38 + r() * 284, y = 124 + r() * 432;
      if (Math.hypot(x - target.x, y - target.y) < 64) continue;
      if (units.some((u) => Math.hypot(u.x - x, u.y - y) < 52)) continue;
      const kind = set[units.length % set.length], s = kind === 'driftwood' ? 21 + r() * 5 : 15 + r() * 5;
      units.push({ shape: 'circle', x, y, r: s * 0.95, s, kind, seed: (r() * 1e9) | 0, rot: r() * 6.28, spin: (r() - 0.5) * 6 });
    }
    return {
      family: 'collect', particle: 'sand', region, depth: false,
      unitMode: 'collect', unitKind: 'collect', unitParticle: 'sand', unitThreshold: 0.4, unitDur: 0.75, unitTarget: target,
      units, drawUnit: drawItem,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        sand(c, nz, x0, y0, x1, y1);
        // the sea at the top, with the line of foam
        const g = c.createLinearGradient(0, y0, 0, 96);
        g.addColorStop(0, '#2a7398'); g.addColorStop(1, '#6fb8cf');
        c.fillStyle = g; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1, 80);
        for (let x = x1; x >= x0; x -= 10) c.lineTo(x, 80 + Math.sin(x * 0.05) * 6); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3; c.beginPath();
        for (let x = x0; x <= x1; x += 10) c.lineTo(x, 82 + Math.sin(x * 0.05) * 6); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.2;
        for (let i = 0; i < 14; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (70 - y0); c.beginPath(); c.moveTo(x - 10, y); c.quadraticCurveTo(x, y - 3, x + 10, y); c.stroke(); }
      },
      clean(c) {
        sand(c, nz, 0, 0, W, H, -6);
        // the smooth ripples a tide leaves behind
        c.strokeStyle = 'rgba(180,150,100,0.3)'; c.lineWidth = 1.2;
        for (let y = 100; y < H; y += 9) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 14) c.lineTo(x, y + Math.sin(x * 0.04 + y * 0.2) * 2); c.stroke(); }
      },
      dirt(c) {
        sand(c, nz, 0, 0, W, H, 14);
        // footprints, wet patches, bits of weed: a messy, trampled beach
        for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(120,95,60,0.22)'; c.beginPath(); c.ellipse(r() * W, r() * H, 14 + r() * 26, 8 + r() * 14, r() * 3, 0, 7); c.fill(); }
        let x = 40 + r() * 80, y = 580;
        for (let i = 0; i < 22; i++) {
          x += (r() - 0.45) * 26; y -= 26;
          for (const side of [-1, 1]) { c.fillStyle = 'rgba(110,85,50,0.35)'; c.beginPath(); c.ellipse(x + side * 6, y + (side > 0 ? 12 : 0), 4, 7, 0.2 * side, 0, 7); c.fill(); }
        }
        c.lineCap = 'round';
        for (let i = 0; i < 140; i++) {
          c.strokeStyle = U.pick(r, ['#5d7a3a', '#6e6a2e', '#4f6b3a', '#8a7a3a']); c.lineWidth = 1.2 + r() * 1.5;
          const x0 = r() * W, y0 = r() * H, a = r() * 6.28, l = 4 + r() * 10;
          c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + Math.cos(a + 1) * l * 0.5, y0 + Math.sin(a + 1) * l * 0.5, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); c.stroke();
        }
        for (let i = 0; i < 220; i++) dot(c, r() * W, r() * H, 0.8 + r() * 1.6, U.pick(r, ['#9b8a74', '#cbb894', '#7d6e5a', '#e6dccb']));
      },
      top(c) {
        const { x, y } = target;
        softShadow(c, (() => { const p = new Path2D(); p.arc(x, y + 4, 26, 0, 7); return p; })(), 8, 0.4, 2, 4);
        if (bin) {
          // a green litter bin, seen from above, lid open
          dot(c, x, y, 27, '#2f6b4f'); dot(c, x, y, 23, '#3f8a64'); dot(c, x, y, 18, '#25352d');
          c.fillStyle = '#ffffff'; c.font = '700 9px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('♻', x, y + 3);
          c.fillStyle = '#3f8a64'; rect(c, x - 30, y - 34, 60, 12, 5); c.fill();
        } else {
          // a red bucket with a yellow spade
          dot(c, x, y, 26, '#b8382f'); dot(c, x, y, 22, '#e2574c'); dot(c, x, y, 17, '#e8d3a4');
          c.strokeStyle = '#f2c230'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, y, 28, -2.6, -0.6); c.stroke();
          c.fillStyle = '#f2c230'; rect(c, x - 34, y + 12, 26, 9, 3); c.fill(); rect(c, x - 44, y + 9, 12, 15, 4); c.fill();
        }
      },
    };
  }

  // ---------------------------------------------------------- SANDCASTLE
  function drawSandPiece(c, u, k) {
    const e = k >= 1 ? 1 : U.easeBack(k);
    const drop = (1 - e) * 18, sq = k >= 1 ? 1 : 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.12;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    c.translate(u.x + u.w / 2, u.y + u.h - drop); c.scale(1 / sq, sq); c.translate(-u.w / 2, -u.h);
    const r = U.rng(u.seed), w = u.w, h = u.h;
    if (u.kind === 'flag') {
      c.fillStyle = '#8a5a3c'; c.fillRect(w / 2 - 1, 0, 2, h);
      c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(w / 2 + 1, 1); c.lineTo(w / 2 + 16, 6); c.lineTo(w / 2 + 1, 11); c.closePath(); c.fill();
      c.restore(); return;
    }
    const body = c.createLinearGradient(0, 0, 0, h);
    body.addColorStop(0, '#ead39f'); body.addColorStop(1, '#c9ab70');
    c.fillStyle = body;
    if (u.kind === 'tower') {
      // a bucket-shaped turret: a bit wider at the bottom, ridged
      c.beginPath(); c.moveTo(4, 0); c.lineTo(w - 4, 0); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(140,110,60,0.45)'; c.lineWidth = 1.2;
      for (const t of [0.35, 0.7]) { c.beginPath(); c.moveTo(4 - 4 * t + 1, h * t); c.lineTo(w - 4 + 4 * t - 1, h * t); c.stroke(); }
      if (u.door) { c.fillStyle = '#7a5a3a'; c.beginPath(); c.moveTo(w / 2 - 8, h); c.lineTo(w / 2 - 8, h * 0.45); c.arc(w / 2, h * 0.45, 8, Math.PI, 0); c.lineTo(w / 2 + 8, h); c.closePath(); c.fill(); }
    } else {
      rect(c, 0, 0, w, h, 3); c.fill();
    }
    c.fillStyle = 'rgba(255,245,215,0.45)'; c.fillRect(2, 1, w - 4, 2);
    for (let i = 0; i < 10; i++) dot(c, 2 + r() * (w - 4), 3 + r() * (h - 5), 0.7, r() < 0.5 ? 'rgba(120,90,50,0.45)' : 'rgba(255,250,230,0.6)');
    if (u.shell) { c.save(); c.translate(w / 2, h / 2); ITEMS[u.shell](c, r, 4.5); c.restore(); }
    c.restore();
  }
  function castle(S) {
    const { r, nz, opts, bleed } = S;
    const units = [], region = new Path2D();
    const piece = (o) => { units.push(Object.assign({ shape: 'rect', seed: (r() * 1e9) | 0 }, o)); region.rect(o.x, o.y, o.w, o.h); };
    const base = 462;
    const towers = [[48, 62, 3], [150, 60, 4], [250, 62, 3]];
    for (const [x, w, n] of towers) {
      for (let i = 0; i < n; i++) piece({ kind: 'tower', x, y: base - (i + 1) * 40, w, h: 40, door: i === 0 && n === 4, shell: i === 1 && r() < 0.7 ? U.pick(r, ['scallop', 'cockle', 'whelk']) : null });
      for (let m = 0; m < 3; m++) piece({ kind: 'merlon', x: x + 4 + m * ((w - 22) / 2), y: base - n * 40 - 13, w: 14, h: 12 });
    }
    for (const [x0, x1] of [[110, 150], [212, 250]]) {
      for (let i = 0; i < 3; i++) piece({ kind: 'block', x: x0, y: base - (i + 1) * 22, w: x1 - x0, h: 22, shell: i === 1 ? 'mussel' : null });
      piece({ kind: 'merlon', x: x0 + 4, y: base - 66 - 12, w: 12, h: 11 });
      piece({ kind: 'merlon', x: x1 - 16, y: base - 66 - 12, w: 12, h: 11 });
    }
    piece({ kind: 'flag', x: 170, y: base - 4 * 40 - 13 - 36, w: 20, h: 36 });
    return {
      family: 'build', particle: 'sand', region, depth: false,
      unitKind: 'sand', unitParticle: 'sand', unitThreshold: 0.4, unitDur: 0.45,
      units: opts.dirt ? [] : units, drawUnit: drawSandPiece,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        const g = c.createLinearGradient(0, y0, 0, 150);
        g.addColorStop(0, '#9fd6f0'); g.addColorStop(1, '#e3f3ea');
        c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, 150 - y0);
        const sea = c.createLinearGradient(0, 150, 0, 220);
        sea.addColorStop(0, '#3a88ac'); sea.addColorStop(1, '#7cc3d4');
        c.fillStyle = sea; c.fillRect(x0, 150, x1 - x0, 70);
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
        for (let i = 0; i < 9; i++) { const x = x0 + r() * (x1 - x0), y = 158 + r() * 52; c.beginPath(); c.moveTo(x - 14, y); c.quadraticCurveTo(x, y - 4, x + 14, y); c.stroke(); }
        sand(c, nz, x0, 218, x1, y1);
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.moveTo(x0, 218); for (let x = x0; x <= x1; x += 10) c.lineTo(x, 216 + Math.sin(x * 0.07) * 4); c.lineTo(x1, 226); c.lineTo(x0, 226); c.fill();
        // the moat, and a bucket and spade left lying about
        c.fillStyle = '#c8a86c'; c.beginPath(); c.ellipse(180, 486, 168, 30, 0, 0, 7); c.fill();
        c.fillStyle = '#5aa7c4'; c.beginPath(); c.ellipse(180, 488, 158, 22, 0, 0, 7); c.fill();
        c.fillStyle = '#e2c991'; c.beginPath(); c.ellipse(180, 472, 146, 12, 0, 0, 7); c.fill();
        c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(40, 548); c.lineTo(72, 548); c.lineTo(68, 578); c.lineTo(44, 578); c.closePath(); c.fill();
        c.strokeStyle = '#f2c230'; c.lineWidth = 2; c.beginPath(); c.arc(56, 548, 16, Math.PI, 0); c.stroke();
        c.fillStyle = '#3d86c6'; c.save(); c.translate(292, 560); c.rotate(-0.5); c.fillRect(-2, -26, 4, 30); rect(c, -8, 2, 16, 14, 4); c.fill(); c.restore();
      },
      clean(c) {
        field(c, 0, 0, W, H, 3, (x, y) => { const v = nz.fbm(x * 0.05, y * 0.05, 3); return [204 + v * 20, 178 + v * 18, 124 + v * 14]; });
        if (opts.dirt) for (const u of units) drawSandPiece(c, u, 1);
      },
      dirt(c) {
        // a heap of dry sand, waiting to be patted into shape
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.fbm(x * 0.04, y * 0.04, 4); return [236 + v * 14, 218 + v * 14, 172 + v * 12]; });
        for (let i = 0; i < 60; i++) { const x = 40 + r() * 280, y = 260 + r() * 210; c.fillStyle = r() < 0.5 ? 'rgba(160,130,80,0.25)' : 'rgba(255,250,230,0.4)'; c.beginPath(); c.ellipse(x, y, 8 + r() * 16, 4 + r() * 8, 0, 0, 7); c.fill(); }
        for (let i = 0; i < 200; i++) dot(c, r() * W, r() * H, 0.8, U.pick(r, ['#b39a6e', '#f4ead2']));
      },
    };
  }

  // ------------------------------------------------- CHRISTMAS LIGHTS
  const BULBS = ['#ff5a5a', '#ffd24a', '#5ad17a', '#5ab4ff', '#ff8ad1'];
  function drawBulb(c, u, k) {
    const flash = k >= 1 ? 0 : Math.sin(Math.min(1, k) * Math.PI);
    const g = k >= 1 ? 1 : 0.6 + 0.4 * U.easeBack(Math.min(1, k));
    const col = u.warm ? '#ffd98a' : u.col;
    c.save(); c.translate(u.x, u.y);
    const halo = c.createRadialGradient(0, 2, 0, 0, 2, 16 + flash * 14);
    halo.addColorStop(0, U.rgba(col, 0.55 + flash * 0.3)); halo.addColorStop(1, U.rgba(col, 0));
    c.fillStyle = halo; c.beginPath(); c.arc(0, 2, 16 + flash * 14, 0, 7); c.fill();
    c.scale(g, g);
    c.fillStyle = '#2f4a2f'; rect(c, -2.2, -6, 4.4, 4, 1); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 2, 4.2, 6, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(-1.4, 0, 1.2, 2.2, 0, 0, 7); c.fill();
    c.restore();
  }
  function lights(S) {
    const { r, nz, opts, bleed } = S;
    const where = opts.where || 'cottage', warm = where === 'cafe';
    const wall = { cottage: '#f2d88a', cafe: '#f1e6cc', cove: '#8fbfe6' }[where];
    // three strings: under the eaves, across the window, along the fence
    const strings = [
      { x0: 6, y0: 150, x1: 354, y1: 150, sag: 26 },
      { x0: 50, y0: 250, x1: 310, y1: 250, sag: 44 },
      { x0: 6, y0: 470, x1: 178, y1: 470, sag: 22 }, { x0: 182, y0: 470, x1: 354, y1: 470, sag: 22 },
    ];
    const at = (s, t) => ({ x: U.lerp(s.x0, s.x1, t), y: U.lerp(s.y0, s.y1, t) + Math.sin(t * Math.PI) * s.sag });
    const units = [], region = new Path2D();
    let n = 0;
    for (const s of strings) {
      const count = Math.round(Math.hypot(s.x1 - s.x0, s.y1 - s.y0) / 24);
      for (let i = 0; i <= count; i++) {
        const p = at(s, i / count);
        units.push({ shape: 'circle', x: p.x, y: p.y + 7, r: 9, col: BULBS[n++ % BULBS.length], warm, seed: n });
        region.moveTo(p.x + 10, p.y + 7); region.arc(p.x, p.y + 7, 10, 0, Math.PI * 2);
      }
    }
    return {
      family: 'arrange', particle: 'shine', region, depth: false,
      unitKind: 'lights', unitParticle: 'shine', unitThreshold: 0.35, unitDur: 0.4,
      units, drawUnit: drawBulb,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // dusk: a deep blue sky, the house front and the first stars
        const sky = c.createLinearGradient(0, y0, 0, 140);
        sky.addColorStop(0, '#1d2a5c'); sky.addColorStop(1, '#4a5a8f');
        c.fillStyle = sky; c.fillRect(x0, y0, x1 - x0, 140 - y0);
        for (let i = 0; i < 30; i++) dot(c, x0 + r() * (x1 - x0), y0 + r() * (120 - y0), 0.6 + r() * 0.9, '#fff8dc');
        const dusk = U.hex(U.mix(wall, '#4a5a8f', 0.35));
        field(c, x0, 120, x1, 450, 3, (x, y) => { const v = 0.9 + nz.fbm(x * 0.02, y * 0.02, 3) * 0.15; return [dusk[0] * v, dusk[1] * v, dusk[2] * v]; });
        if (where === 'cove') { c.strokeStyle = 'rgba(30,40,70,0.35)'; c.lineWidth = 2; for (let x = 0; x < 360; x += 22) { c.beginPath(); c.moveTo(x, 130); c.lineTo(x, 450); c.stroke(); } }
        // snowy eaves
        c.fillStyle = where === 'cove' ? '#6b4a32' : '#5b3a2e'; c.fillRect(x0, 118, x1 - x0, 22);
        c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(x0, 116); for (let x = x0; x <= x1; x += 12) c.lineTo(x, 112 + Math.sin(x * 0.3) * 2); c.lineTo(x1, 124); for (let x = x1; x >= x0; x -= 18) c.lineTo(x, 124 + (Math.floor(x / 18) % 3 === 0 ? 7 : 2)); c.closePath(); c.fill();
        // the window with a warm glow
        c.fillStyle = '#ffd98a'; c.fillRect(110, 270, 140, 120);
        const glow = c.createRadialGradient(180, 330, 10, 180, 330, 150);
        glow.addColorStop(0, 'rgba(255,217,138,0.35)'); glow.addColorStop(1, 'rgba(255,217,138,0)');
        c.fillStyle = glow; c.fillRect(30, 200, 300, 260);
        c.fillStyle = '#f7f3ea'; c.fillRect(104, 264, 152, 7); c.fillRect(104, 390, 152, 8); c.fillRect(104, 264, 7, 132); c.fillRect(249, 264, 7, 132); c.fillRect(176, 270, 7, 120);
        if (where === 'cottage') { c.strokeStyle = '#4f8a3c'; c.lineWidth = 7; c.beginPath(); c.arc(180, 330, 26, 0, 7); c.stroke(); dot(c, 180, 304, 4, '#d9534f'); }
        if (where === 'cafe') { c.fillStyle = '#2f8068'; c.fillRect(96, 228, 168, 14); for (let x = 96; x < 264; x += 24) { c.fillStyle = x % 48 ? '#f4ecda' : '#2f8068'; c.fillRect(x, 242, 24, 10); } }
        // ground, fence or rail, and snow
        c.fillStyle = '#e9eff4'; c.fillRect(x0, 450, x1 - x0, y1 - 450);
        c.fillStyle = where === 'cove' ? '#a2734a' : '#f4ecdc';
        for (let x = 10; x < 360; x += 26) { c.fillRect(x, 470, 10, 90); c.beginPath(); c.moveTo(x, 470); c.lineTo(x + 5, 462); c.lineTo(x + 10, 470); c.fill(); }
        c.fillRect(0, 490, 360, 8); c.fillRect(0, 530, 360, 8);
        // the wires
        c.strokeStyle = '#1f3a24'; c.lineWidth = 1.3;
        for (const s of strings) { c.beginPath(); for (let i = 0; i <= 30; i++) { const p = at(s, i / 30); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); } c.stroke(); }
      },
      clean() {},
      dirt(c) {
        // the bulbs still dark
        for (const u of units) {
          c.fillStyle = '#2f4a2f'; rect(c, u.x - 2.2, u.y - 6, 4.4, 4, 1); c.fill();
          c.fillStyle = 'rgba(210,220,230,0.85)'; c.beginPath(); c.ellipse(u.x, u.y + 2, 4.2, 6, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(u.x - 1.4, u.y, 1.1, 2, 0, 0, 7); c.fill();
        }
      },
    };
  }

  // -------------------------------------------------------- DRINKS FRIDGE
  // Each shelf holds one kind of drink and every slot has a little coloured
  // tag on the shelf edge, so each bottle goes back exactly where it belongs.
  const DRINKS = [
    { name: 'water', body: '#bfe3f2', cap: '#3d86c6', label: '#3d86c6', shape: 'bottle' },
    { name: 'elderflower', body: '#d8ecb8', cap: '#4f9d7a', label: '#f4ecdc', shape: 'bottle' },
    { name: 'lemonade', body: '#f7e27a', cap: '#f2b531', label: '#ffffff', shape: 'can' },
    { name: 'orange', body: '#f59a2a', cap: '#ffffff', label: '#4f9d7a', shape: 'carton' },
    { name: 'cola', body: '#5a2e1e', cap: '#d9534f', label: '#d9534f', shape: 'bottle' },
  ];
  function drawDrink(c, u, k) {
    const e = k >= 1 ? 1 : U.easeBack(k);
    const lift = (1 - e) * 14, sc = 1 + (1 - Math.min(1, k)) * 0.08;
    const d = DRINKS[u.type], w = u.w, h = u.h;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    c.translate(u.x + w / 2, u.y + h - lift); c.scale(sc, sc); c.translate(-w / 2, -h);
    c.fillStyle = 'rgba(40,60,80,0.18)'; c.fillRect(2, h - 3, w - 2, 4);
    if (d.shape === 'bottle') {
      c.fillStyle = d.body; rect(c, 2, h * 0.38, w - 4, h * 0.62, 5); c.fill();
      c.beginPath(); c.moveTo(4, h * 0.42); c.quadraticCurveTo(w / 2, h * 0.12, w - 4, h * 0.42); c.fill();
      c.fillRect(w / 2 - 3, h * 0.08, 6, h * 0.25);
      c.fillStyle = d.cap; rect(c, w / 2 - 4, 0, 8, h * 0.1, 2); c.fill();
      c.fillStyle = d.label; c.fillRect(2, h * 0.58, w - 4, h * 0.2);
    } else if (d.shape === 'can') {
      c.fillStyle = d.body; rect(c, 2, h * 0.28, w - 4, h * 0.72, 3); c.fill();
      c.fillStyle = '#c6ccd3'; rect(c, 3, h * 0.24, w - 6, h * 0.07, 2); c.fill();
      c.fillStyle = d.label; c.fillRect(2, h * 0.5, w - 4, h * 0.14);
    } else {
      c.fillStyle = d.body; c.fillRect(2, h * 0.3, w - 4, h * 0.7);
      c.fillStyle = U.shade(d.body, 0.25); c.beginPath(); c.moveTo(2, h * 0.3); c.lineTo(w / 2, h * 0.14); c.lineTo(w - 2, h * 0.3); c.closePath(); c.fill();
      c.fillStyle = d.cap; dot(c, w * 0.66, h * 0.24, 2.4, d.cap);
      c.fillStyle = d.label; dot(c, w / 2, h * 0.62, w * 0.22, d.label);
    }
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(4, h * 0.45, 2, h * 0.45);
    c.restore();
  }
  function fridge(S) {
    const { r, nz, opts, bleed } = S;
    const fx = 34, fy = 36, fw = 292, fh = 532, rows = 5, shelfH = (fh - 40) / rows;
    const units = [], region = new Path2D(), tags = [];
    for (let j = 0; j < rows; j++) {
      const y0 = fy + 26 + j * shelfH, slot = 34, n = Math.floor((fw - 28) / slot), pad = (fw - n * slot) / 2;
      region.rect(fx + 12, y0 + 2, fw - 24, shelfH - 14);
      for (let i = 0; i < n; i++) {
        const x = fx + pad + i * slot + 3, h = shelfH - 22;
        units.push({ shape: 'rect', x, y: y0 + shelfH - 14 - h, w: slot - 6, h, type: j, seed: j * 31 + i });
        tags.push({ x: x + (slot - 6) / 2, y: y0 + shelfH - 10, col: DRINKS[j].label === '#ffffff' || DRINKS[j].label === '#f4ecdc' ? DRINKS[j].cap : DRINKS[j].label });
      }
    }
    return {
      family: 'arrange', particle: 'shine', region, depth: false,
      unitKind: 'clink', unitParticle: 'shine', unitThreshold: 0.4, unitDur: 0.4,
      units: opts.dirt ? [] : units, drawUnit: drawDrink,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.02, 3); return [238 + v * 10, 230 + v * 10, 214 + v * 10]; });
        c.fillStyle = 'rgba(46,106,90,0.9)'; c.fillRect(x0, 560, x1 - x0, y1 - 560);
        const p = new Path2D(); p.rect(fx - 10, fy - 10, fw + 20, fh + 20);
        softShadow(c, p, 14, 0.45, 3, 8);
        c.fillStyle = '#2f3a44'; rect(c, fx - 10, fy - 10, fw + 20, fh + 20, 14); c.fill();
        c.fillStyle = '#c62f3a'; rect(c, fx - 10, fy - 10, fw + 20, 34, 14); c.fill();
        c.fillStyle = '#ffffff'; c.font = '900 15px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('ICE COLD DRINKS', 180, fy + 12);
      },
      clean(c) {
        // a bright, cold, empty fridge
        const g = c.createLinearGradient(0, fy, 0, fy + fh);
        g.addColorStop(0, '#f4fbff'); g.addColorStop(1, '#d7ebf6');
        c.fillStyle = g; c.fillRect(fx, fy, fw, fh);
        if (opts.dirt) for (const u of units) drawDrink(c, u, 1);
      },
      dirt(c) {
        // dim and dusty, with an old sticky ring or two
        c.fillStyle = '#b9c4c9'; c.fillRect(fx, fy, fw, fh);
        field(c, fx, fy, fx + fw, fy + fh, 3, (x, y) => { const v = nz.fbm(x * 0.04, y * 0.04, 3); return [150 + v * 40, 158 + v * 40, 160 + v * 38, 200]; });
        for (let i = 0; i < 18; i++) { c.strokeStyle = 'rgba(120,80,40,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(fx + 20 + r() * (fw - 40), fy + 30 + r() * (fh - 60), 5 + r() * 4, 0, 7); c.stroke(); }
        for (let i = 0; i < 160; i++) dot(c, fx + r() * fw, fy + r() * fh, 0.8, 'rgba(90,80,70,0.4)');
      },
      top(c) {
        // glass shelves with a little coloured tag under every slot
        for (let j = 0; j < rows; j++) {
          const y = fy + 26 + (j + 1) * shelfH - 12;
          c.fillStyle = 'rgba(200,230,245,0.9)'; c.fillRect(fx + 6, y, fw - 12, 5);
          c.fillStyle = '#ffffff'; c.fillRect(fx + 6, y + 5, fw - 12, 9);
        }
        for (const t of tags) { c.fillStyle = t.col; rect(c, t.x - 7, t.y + 4, 14, 6, 2); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.moveTo(fx + 20, fy); c.lineTo(fx + 70, fy); c.lineTo(fx + 30, fy + fh); c.lineTo(fx - 20, fy + fh); c.fill();
      },
    };
  }

  // ------------------------------------------------------------ DOG BATH
  // A muddy dog sitting in a tin bath in the garden, very pleased with itself.
  // Washing reveals clean fluffy fur; soap bubbles drift up now and then.
  const COATS = [
    { fur: '#e2b36a', dark: '#c48c48', light: '#f6dca6', patch: null },
    { fur: '#f4efe6', dark: '#d8cfc2', light: '#ffffff', patch: '#3b3533' },
    { fur: '#a8754a', dark: '#875a35', light: '#c99a6c', patch: null },
  ];
  function dog(S) {
    const { r, nz, bleed } = S;
    const coat = COATS[(r() * COATS.length) | 0];
    const region = new Path2D();
    const head = { x: 180, y: 218, r: 80 };
    region.ellipse(180, 386, 112, 106, 0, 0, Math.PI * 2);                       // body
    region.moveTo(head.x + head.r, head.y); region.arc(head.x, head.y, head.r, 0, Math.PI * 2);
    region.moveTo(98 + 30, 236); region.ellipse(98, 236, 30, 70, 0.28, 0, Math.PI * 2);   // ears
    region.moveTo(262 + 30, 236); region.ellipse(262, 236, 30, 70, -0.28, 0, Math.PI * 2);
    region.moveTo(122 + 30, 452); region.ellipse(122, 452, 30, 22, 0, 0, Math.PI * 2);    // paws on the rim
    region.moveTo(238 + 30, 452); region.ellipse(238, 452, 30, 22, 0, 0, Math.PI * 2);
    region.moveTo(318, 330); region.quadraticCurveTo(352, 270, 330, 236); region.quadraticCurveTo(318, 262, 296, 330); region.closePath(); // tail
    const furStrokes = [], hit = U.canvas(1, 1).getContext('2d');
    for (let i = 0; i < 700; i++) {
      const x = 60 + r() * 300, y = 140 + r() * 360;
      if (!hit.isPointInPath(region, x, y, 'nonzero')) continue;
      const a = Math.atan2(y - 300, x - 180) + (r() - 0.5) * 0.8;
      furStrokes.push({ x, y, a, l: 4 + r() * 6, c: r() < 0.5 ? coat.dark : coat.light });
    }
    return {
      // the head, ears, paws and tail overlap, so they add up rather than cut holes
      family: 'wash', particle: 'suds', region, depth: true, fillRule: 'nonzero',
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        SCENES.mowedLawn(c, nz, x0, y0, x1, y1, true);
        SCENES.grassGrain(c, r, x0, y0, x1, y1, 6, 0.2);
        // a fence with a towel over it, a garden hose and a ball
        c.fillStyle = '#f4ecdc';
        for (let x = x0 + 6; x < x1; x += 26) { c.fillRect(x, 60, 12, 92); c.beginPath(); c.moveTo(x, 60); c.lineTo(x + 6, 50); c.lineTo(x + 12, 60); c.fill(); }
        c.fillRect(x0, 82, x1 - x0, 8); c.fillRect(x0, 126, x1 - x0, 8);
        c.fillStyle = '#8fbfe6'; c.fillRect(24, 78, 70, 58); c.fillStyle = '#ffffff'; for (let y = 86; y < 136; y += 12) c.fillRect(24, y, 70, 4);
        c.strokeStyle = '#3f9b5a'; c.lineWidth = 6;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(312, 560, 30 - i * 7, 16 - i * 4, 0, 0, Math.PI * 2); c.stroke(); }
        dot(c, 42, 560, 16, '#e2574c'); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(42, 560, 16, 0.6, 2.4); c.stroke();
        // the back of the tin bath, behind the dog
        c.fillStyle = '#8f99a3'; c.beginPath(); c.ellipse(180, 470, 156, 44, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#d9eef6'; c.beginPath(); c.ellipse(180, 474, 140, 34, 0, Math.PI, 0); c.fill();
      },
      clean(c) {
        const g = c.createRadialGradient(160, 260, 20, 180, 330, 230);
        g.addColorStop(0, coat.light); g.addColorStop(0.55, coat.fur); g.addColorStop(1, coat.dark);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        if (coat.patch) { dot(c, 222, 196, 34, coat.patch); dot(c, 266, 236, 44, coat.patch); c.beginPath(); c.ellipse(140, 380, 44, 36, 0.4, 0, 7); c.fillStyle = coat.patch; c.fill(); }
        c.lineCap = 'round'; c.lineWidth = 1.3;
        for (const f of furStrokes) { c.strokeStyle = f.c; c.beginPath(); c.moveTo(f.x, f.y); c.quadraticCurveTo(f.x + Math.cos(f.a + 0.6) * f.l * 0.5, f.y + Math.sin(f.a + 0.6) * f.l * 0.5, f.x + Math.cos(f.a) * f.l, f.y + Math.sin(f.a) * f.l); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(150, 170, 34, 18, -0.5, 0, 7); c.fill();
        // a little foam hat
        for (let i = 0; i < 7; i++) dot(c, 160 + i * 7 + (r() - 0.5) * 4, 146 - Math.sin(i / 6 * Math.PI) * 10, 9 + r() * 4, 'rgba(255,255,255,0.9)');
      },
      dirt(c) {
        const g = ramp(['#5b4128', '#6e5032', '#7f6040', '#8f7350']);
        field(c, 0, 0, W, H, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 210 + nz.n2(x * 0.08, y * 0.08) * 45]);
        for (let i = 0; i < 70; i++) { c.fillStyle = U.pick(r, ['rgba(70,48,28,0.75)', 'rgba(95,68,40,0.7)', 'rgba(120,90,55,0.6)']); c.beginPath(); c.ellipse(60 + r() * 260, 140 + r() * 360, 6 + r() * 18, 4 + r() * 12, r() * 3, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(45,30,18,0.5)'; c.lineWidth = 0.8;
        for (let i = 0; i < 60; i++) { let x = 60 + r() * 260, y = 140 + r() * 360; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (r() - 0.5) * 14; y += (r() - 0.5) * 14; c.lineTo(x, y); } c.stroke(); }
        for (let i = 0; i < 26; i++) { c.save(); c.translate(70 + r() * 240, 150 + r() * 330); c.rotate(r() * 6.28); c.fillStyle = U.pick(r, ['#c4762f', '#9c5a2a', '#7d8a3a', '#d9a23c']); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.restore(); }
        c.strokeStyle = '#6b5a3a'; c.lineWidth = 1.6;
        for (let i = 0; i < 10; i++) { const x = 80 + r() * 200, y = 160 + r() * 300; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 26, y + (r() - 0.5) * 18); c.stroke(); }
      },
      top(c) {
        // face: happy closed eyes, nose, smile and tongue, and a collar
        c.strokeStyle = '#2b2422'; c.lineWidth = 4; c.lineCap = 'round';
        for (const ex of [150, 210]) { c.beginPath(); c.arc(ex, 214, 11, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
        c.fillStyle = coat.light; c.beginPath(); c.ellipse(180, 262, 44, 32, 0, 0, 7); c.fill();
        c.fillStyle = '#2b2422'; c.beginPath(); c.moveTo(164, 244); c.quadraticCurveTo(180, 236, 196, 244); c.quadraticCurveTo(190, 260, 180, 262); c.quadraticCurveTo(170, 260, 164, 244); c.fill();
        dot(c, 175, 245, 3, 'rgba(255,255,255,0.6)');
        c.strokeStyle = '#2b2422'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(180, 262); c.lineTo(180, 270); c.moveTo(160, 268); c.quadraticCurveTo(180, 286, 200, 268); c.stroke();
        c.fillStyle = '#ef8aa6'; c.beginPath(); c.moveTo(172, 278); c.quadraticCurveTo(180, 304, 190, 278); c.closePath(); c.fill();
        dot(c, 132, 246, 9, 'rgba(239,138,166,0.35)'); dot(c, 228, 246, 9, 'rgba(239,138,166,0.35)');
        c.fillStyle = '#c9474f'; c.beginPath(); c.ellipse(180, 302, 64, 12, 0, 0, Math.PI); c.fill();
        dot(c, 180, 318, 8, '#f2c230'); dot(c, 178, 316, 3, '#fff3b8');
        // the front of the tin bath, with foam spilling over
        c.fillStyle = '#9aa3ad'; c.beginPath(); c.moveTo(24, 470); c.lineTo(44, 560); c.quadraticCurveTo(180, 590, 316, 560); c.lineTo(336, 470); c.ellipse(180, 470, 156, 44, 0, 0, Math.PI); c.closePath(); c.fill();
        c.fillStyle = '#b8c0c8'; c.beginPath(); c.moveTo(40, 480); c.lineTo(56, 552); c.lineTo(80, 556); c.lineTo(66, 486); c.closePath(); c.fill();
        c.strokeStyle = '#6d7680'; c.lineWidth = 6; c.beginPath(); c.ellipse(180, 470, 156, 44, 0, 0, Math.PI); c.stroke();
        for (let i = 0; i < 22; i++) { const a = (i / 21) * Math.PI; dot(c, 180 + Math.cos(a) * 150, 470 + Math.sin(a) * 40 - 6, 9 + r() * 7, 'rgba(255,255,255,0.92)'); }
        for (const x of [30, 330]) { c.strokeStyle = '#6d7680'; c.lineWidth = 5; c.beginPath(); c.arc(x, 486, 12, Math.PI * 0.5, Math.PI * 1.5, x > 180); c.stroke(); }
      },
      liveTop(c, t) {
        // soap bubbles drifting up out of the bath
        for (let i = 0; i < 6; i++) {
          const life = (t * 0.22 + i / 6) % 1, x = 70 + ((i * 97) % 220) + Math.sin(t * 1.3 + i) * 8, y = 470 - life * 380, s = 5 + (i % 3) * 3;
          c.globalAlpha = Math.sin(life * Math.PI) * 0.85;
          c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1; c.fillStyle = 'rgba(200,230,255,0.25)';
          c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.stroke();
          dot(c, x - s * 0.35, y - s * 0.35, s * 0.22, 'rgba(255,255,255,0.9)');
        }
        c.globalAlpha = 1;
      },
    };
  }

  Object.assign(SCENES.KINDS, { beach, castle, lights, fridge, dog });
})();
