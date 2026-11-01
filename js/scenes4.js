'use strict';
// Seasonal mess laid over an existing scene: autumn leaves, winter snow and
// frost on the glass. The scene keeps its shape and what lies underneath;
// only the dirt, the tool family and the surroundings change.

(() => {
  const { W, H, field, ramp, mowedLawn, grassGrain, inside } = SCENES;

  const LEAF_COLS = ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a', '#e06c3c', '#b8862f', '#cf5a2c'];

  function leaf(c, x, y, s, rot, col, maple) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = col;
    c.beginPath();
    if (maple) {
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? s * 0.45 : s;
        c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
    } else c.ellipse(0, 0, s, s * 0.5, 0, 0, 7);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(70,35,15,0.35)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-s, 0); c.lineTo(s * 0.9, 0); c.stroke();
    c.restore();
  }

  function leafLayer(c, r, nz, x0, y0, x1, y1, n, base = true) {
    if (base) {
      const g = ramp(['#7a4a22', '#9c5a2a', '#b8742f', '#c98c3a']);
      field(c, x0, y0, x1, y1, 3, (x, y) => [...g(nz.fbm(x * 0.04, y * 0.04, 4)), 245]);
    }
    for (let i = 0; i < n; i++) leaf(c, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 5 + r() * 6, r() * 6.28, U.pick(r, LEAF_COLS), r() < 0.45);
  }

  function snowLayer(c, r, nz, x0, y0, x1, y1, alpha = 252) {
    const g = ramp(['#cfdcea', '#e2ebf4', '#f1f6fb', '#ffffff']);
    field(c, x0, y0, x1, y1, 2, (x, y) => [...g(nz.fbm(x * 0.02, y * 0.02, 5) * 0.9 + nz.n2(x * 0.2, y * 0.2) * 0.1), alpha]);
    for (let i = 0; i < ((x1 - x0) * (y1 - y0)) / 160; i++) {
      c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.9)' : 'rgba(170,200,230,0.5)';
      c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 1.2, 1.2);
    }
  }

  function apply(scene, kind, S) {
    const { r, nz, bleed } = S;
    const region = scene.region;
    const wasMow = scene.family === 'mow';
    const baseDecor = scene.decor;

    if (kind === 'leaves') {
      scene.decor = (c) => {
        baseDecor(c);
        for (let i = 0; i < 160; i++) {
          const x = bleed.x0 + r() * (bleed.x1 - bleed.x0), y = bleed.y0 + r() * (bleed.y1 - bleed.y0);
          if (!inside(region, x, y)) leaf(c, x, y, 4 + r() * 5, r() * 6.28, U.pick(r, LEAF_COLS), r() < 0.4);
        }
      };
      if (wasMow) {
        scene.clean = (c) => { mowedLawn(c, nz, 0, 0, W, H, true); };
        scene.cleanOver = (c) => grassGrain(c, r, 0, 0, W, H, 4, 0.25);
      }
      scene.stamp = null;
      scene.tough = (x, y) => (nz.n2(x * 0.025 + 3, y * 0.025) > 0.72 ? 1.5 : 1);
      if (scene.family === 'skim') {
        scene.dirt = (c) => {
          const g = ramp(['#5d5a2c', '#6e6a34', '#7d7238']);
          field(c, 0, 0, W, H, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 225]);
          leafLayer(c, r, nz, 0, 0, W, H, 900, false);
        };
      } else {
        scene.family = 'rake'; scene.particle = 'leaf';
        scene.dirt = (c) => leafLayer(c, r, nz, 0, 0, W, H, 2600);
      }
    } else if (kind === 'snow') {
      scene.decor = (c) => {
        baseDecor(c);
        // everything outside the job is snowed over too
        c.save();
        c.beginPath(); c.rect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, bleed.y1 - bleed.y0); c.clip();
        snowLayer(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 235);
        c.restore();
        c.save(); c.lineWidth = 6; c.strokeStyle = 'rgba(120,150,180,0.25)'; c.stroke(region); c.restore();
      };
      if (wasMow) {
        scene.clean = (c) => { mowedLawn(c, nz, 0, 0, W, H, false); c.fillStyle = 'rgba(120,140,110,0.35)'; c.fillRect(0, 0, W, H); };
        scene.cleanOver = null;
      }
      scene.stamp = null;
      scene.family = 'snow'; scene.particle = 'snow';
      scene.tough = (x, y) => (nz.fbm(x * 0.02, y * 0.02, 3) > 0.62 ? 1.5 : 1);
      scene.dirt = (c) => {
        snowLayer(c, r, nz, 0, 0, W, H);
        // bird footprints
        c.strokeStyle = 'rgba(120,140,170,0.6)'; c.lineWidth = 1;
        let x = 60 + r() * 60, y = 520;
        for (let i = 0; i < 16; i++) {
          x += (r() - 0.4) * 22; y -= 24;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 6); c.moveTo(x, y); c.lineTo(x - 4, y - 4); c.moveTo(x, y); c.lineTo(x + 4, y - 4); c.stroke();
        }
      };
    } else if (kind === 'frost') {
      scene.family = 'wash'; scene.particle = 'snow';
      scene.tough = (x, y) => (nz.n2(x * 0.03, y * 0.03) > 0.7 ? 1.5 : 1);
      scene.dirt = (c) => {
        const g = ramp(['#c8dbe8', '#dbe8f1', '#eef5fa']);
        field(c, 0, 0, W, H, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 238]);
        // fern-like ice crystals growing in from the edges
        c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1;
        const fern = (x, y, a, len, depth) => {
          if (depth <= 0 || len < 4) return;
          const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
          const n = 3;
          for (let k = 1; k <= n; k++) {
            const px = x + Math.cos(a) * len * (k / (n + 1)), py = y + Math.sin(a) * len * (k / (n + 1));
            fern(px, py, a + 0.7, len * 0.42, depth - 1);
            fern(px, py, a - 0.7, len * 0.42, depth - 1);
          }
        };
        for (let i = 0; i < 26; i++) {
          const side = i % 4;
          const x = side === 0 ? 40 : side === 1 ? 320 : 40 + r() * 280;
          const y = side === 2 ? 90 : side === 3 ? 510 : 90 + r() * 420;
          const a = side === 0 ? 0 : side === 1 ? Math.PI : side === 2 ? Math.PI / 2 : -Math.PI / 2;
          fern(x, y, a + (r() - 0.5) * 1.2, 40 + r() * 50, 3);
        }
        for (let i = 0; i < 1200; i++) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(r() * W, r() * H, 1, 1); }
      };
    } else if (kind === 'grow') {
      // the regular scene, just a bit more overgrown: nothing to change
    }
    return scene;
  }

  SCENES.overlay = apply;
})();
