'use strict';
// Letters on the marquee: a calm thinking job at The Little Theatre (and in the
// puzzle room). The board over the doors has lost its letters, but tonight's
// title still stands on it faintly. Lift a letter from the tray and put it on
// its own place in the title; dropped anywhere else it glides back. Two spare
// letters, one of them always a Q, stay in the tray at the end. Every letter
// lights more of the bulbs round the board, and the last one lights the doors.
// Nothing to get wrong and nothing to race: the letters are all there to read.
//   node test/run.mjs puzzle js/pz-letters.js letters --seeds 30

(() => {
  const W = 360;
  // the plays, each with the picture on its poster; no Q in any of them
  const PLAYS = [
    ['SWAN', '🦢'], ['LAKE', '🛶'], ['MOON', '🌙'], ['FOX', '🦊'], ['OWL', '🦉'], ['FERN', '🌿'], ['STAR', '⭐'], ['SNOW', '❄️'],
    ['HARE', '🐇'], ['ROBIN', '🐦'], ['OTTER', '🦦'], ['CLOUD', '☁️'], ['TIDE', '🌊'], ['ROSE', '🌹'], ['LAMB', '🐑'], ['MAPLE', '🍁'],
  ];
  const SPARE = 'BDGJKPVXYZ';
  const TW = 50, TH = 62;       // a letter is this big, easy to hold
  const PITCH = 62, SLOT_Y = 193;
  const BOARD = { x0: 10, y0: 104, x1: 350, y1: 254 }, RING = { x0: 19, y0: 113, x1: 341, y1: 245 };
  const WALL_Y = 382, TRAY = { x: 20, y: 396, w: 320, h: 150 }, ROWS = [434, 506];
  const DOORS = [{ x: 132, y: 288, w: 40, h: 40 }, { x: 188, y: 288, w: 40, h: 40 }];
  const REACH_X = 40, REACH_Y = 54;   // how near a slot a letter has to land
  const EDGE = 'rgba(52,36,28,0.5)';

  function letters(S) {
    const r = S.r, deco = (r() * 1e9) | 0;
    const [word, picture] = U.pick(r, PLAYS);
    const steps = word.length;
    const slots = word.split('').map((ch, i) => ({ ch, x: W / 2 + (i - (steps - 1) / 2) * PITCH, y: SLOT_Y, tile: null, pop: 1 }));
    const extra = U.pick(r, SPARE.split('').filter((ch) => !word.includes(ch)));
    const set = PZ.shuffle(r, word.split('').concat('Q', extra));
    const cols = set.length > 6 ? 4 : 3;
    const tiles = set.map((ch, i) => {
      const row = i < cols ? 0 : 1, n = row ? set.length - cols : cols, j = row ? i - cols : i;
      const hx = W / 2 + (j - (n - 1) / 2) * 78 + (r() - 0.5) * 8, hy = ROWS[row] + (r() - 0.5) * 7;
      return { ch, hx, hy, tilt: (r() - 0.5) * 0.14, x: hx, y: hy, tx: hx, ty: hy, slot: null };
    });
    // the bulbs, clockwise from the top left corner
    const ring = [];
    {
      const { x0, y0, x1, y1 } = RING, w = x1 - x0, h = y1 - y0, n = Math.round((2 * (w + h)) / 23), gap = (2 * (w + h)) / n;
      for (let i = 0; i < n; i++) {
        let d = i * gap;
        if (d < w) ring.push([x0 + d, y0]);
        else if ((d -= w) < h) ring.push([x1, y0 + d]);
        else if ((d -= h) < w) ring.push([x1 - d, y1]);
        else ring.push([x0, y1 - (d - w)]);
      }
    }
    let paid = 0, held = null, hintT = 0, lit = 0, shine = 0, fx = null;
    const solved = () => paid >= steps;
    // the next letter to go up, and where
    const next = () => {
      const s = slots.find((q) => !q.tile);
      return s ? { s, t: tiles.find((q) => !q.slot && q.ch === s.ch) } : null;
    };
    const place = (t, s) => { s.tile = t; t.slot = s; t.tx = s.x; t.ty = s.y; };

    // ------------------------------------------------------------ the hall
    const slope = (x) => 42 + Math.abs(x - W / 2) / 3;
    function sky(c) {
      const { x0, y0, x1 } = S.bleed, rr = U.rng(deco);
      const g = c.createLinearGradient(0, Math.min(y0, -20), 0, 110);
      g.addColorStop(0, '#2d3768'); g.addColorStop(0.55, '#6d6296'); g.addColorStop(1, '#e8ad91');
      c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, WALL_Y - y0);
      for (let i = 0; i < 26; i++) {
        c.fillStyle = `rgba(255,248,226,${(0.3 + rr() * 0.5).toFixed(2)})`;
        c.beginPath(); c.arc(x0 + rr() * (x1 - x0), y0 + rr() * (52 - y0), 0.5 + rr() * 0.9, 0, 7); c.fill();
      }
      PZ.text(c, 'Put up the title of tonight\'s play', W / 2, 18, { size: 13, color: '#f3ead8', maxW: 320 });
    }
    function wall(c) {
      const { x0, x1 } = S.bleed;
      c.save();
      c.beginPath(); c.moveTo(x0, slope(x0)); c.lineTo(W / 2, slope(W / 2)); c.lineTo(x1, slope(x1)); c.lineTo(x1, WALL_Y); c.lineTo(x0, WALL_Y); c.closePath();
      c.fillStyle = '#e9d9bd'; c.fill(); c.clip();
      // boards, and the shadow under the eaves
      c.fillStyle = 'rgba(120,90,60,0.17)';
      for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) c.fillRect(x, 0, 1.3, WALL_Y);
      c.fillStyle = 'rgba(60,40,30,0.12)'; c.beginPath(); c.moveTo(x0, slope(x0)); c.lineTo(W / 2, slope(W / 2)); c.lineTo(x1, slope(x1)); c.lineTo(x1, slope(x1) + 13); c.lineTo(W / 2, 55); c.lineTo(x0, slope(x0) + 13); c.closePath(); c.fill();
      c.restore();
      // the tin roof along the gable, with its ribs
      c.lineCap = 'butt'; c.lineJoin = 'miter';
      const edge = () => { c.beginPath(); c.moveTo(x0, slope(x0) - 3); c.lineTo(W / 2, 39); c.lineTo(x1, slope(x1) - 3); c.stroke(); };
      c.strokeStyle = '#5d6972'; c.lineWidth = 12; edge();
      c.strokeStyle = '#8c9aa3'; c.lineWidth = 7; edge();
      c.setLineDash([2, 6]); c.strokeStyle = '#6b7882'; c.lineWidth = 7; edge(); c.setLineDash([]);
      // a round vent in the gable
      c.fillStyle = '#7c2d35'; c.beginPath(); c.arc(W / 2, 79, 14, 0, 7); c.fill();
      c.fillStyle = '#fbe7b6'; c.beginPath(); c.arc(W / 2, 79, 10, 0, 7); c.fill();
      c.strokeStyle = '#7c2d35'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(W / 2 - 10, 79); c.lineTo(W / 2 + 10, 79); c.moveTo(W / 2, 69); c.lineTo(W / 2, 89); c.stroke();
    }
    function doors(c) {
      // the step and the frame
      c.fillStyle = '#b9ab97'; c.fillRect(104, WALL_Y - 8, 152, 8);
      c.fillStyle = 'rgba(60,40,30,0.18)'; c.fillRect(104, WALL_Y - 2, 152, 2);
      c.fillStyle = '#5b2228'; PZ.rr(c, 118, 268, 124, WALL_Y - 276, [6, 6, 0, 0]); c.fill();
      for (const d of DOORS) {
        c.fillStyle = '#9c3a43'; c.fillRect(d.x - 7, 278, d.w + 14, WALL_Y - 286);
        c.fillStyle = '#b34a52'; c.fillRect(d.x - 7, 278, d.w + 14, 3);
        c.fillStyle = '#3b3550'; c.fillRect(d.x, d.y, d.w, d.h);
        c.strokeStyle = '#6f2a31'; c.lineWidth = 2; c.strokeRect(d.x, d.y, d.w, d.h);
        c.fillRect(d.x + 6, 338, d.w - 12, 34);
        c.strokeRect(d.x + 6, 338, d.w - 12, 34);
      }
      c.fillStyle = '#f2d88a';
      c.beginPath(); c.arc(173, 344, 2.6, 0, 7); c.arc(187, 344, 2.6, 0, 7); c.fill();
    }
    // the poster for tonight's play and a little ticket window
    function poster(c) {
      const x = 58, y = 318;
      c.fillStyle = 'rgba(60,40,30,0.2)'; c.fillRect(x - 34, y - 42, 72, 92);
      c.fillStyle = '#6b4a32'; c.fillRect(x - 36, y - 45, 72, 92);
      c.fillStyle = PZ.PAPER; c.fillRect(x - 31, y - 40, 62, 82);
      PZ.text(c, 'TONIGHT', x, y - 29, { size: 10, weight: 900, color: '#7c2d35', maxW: 54 });
      PZ.emoji(c, picture, x, y + 6, 38);
      const bx = 302, by = 318;
      c.fillStyle = '#6b4a32'; PZ.rr(c, bx - 40, by - 50, 80, 112, [38, 38, 2, 2]); c.fill();
      c.fillStyle = '#3b3550'; PZ.rr(c, bx - 33, by - 43, 66, 58, [32, 32, 0, 0]); c.fill();
      c.strokeStyle = '#6b4a32'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by - 43); c.lineTo(bx, by + 15); c.stroke();
      c.fillStyle = '#c99a5a'; c.fillRect(bx - 38, by + 15, 76, 7);
      c.fillStyle = PZ.PAPER; PZ.rr(c, bx - 28, by + 28, 56, 22, 3); c.fill();
      PZ.text(c, 'TICKETS', bx, by + 39.5, { size: 10.5, weight: 900, color: '#7c2d35', maxW: 50 });
    }
    function marquee(c) {
      const { x0, y0, x1, y1 } = BOARD, w = x1 - x0, h = y1 - y0;
      c.fillStyle = 'rgba(50,30,24,0.28)'; PZ.rr(c, x0 + 3, y0 + 6, w, h, 9); c.fill();
      c.fillStyle = '#7c2d35'; PZ.rr(c, x0, y0, w, h, 9); c.fill();
      c.strokeStyle = '#c99a2e'; c.lineWidth = 1.6; PZ.rr(c, x0 + 3.5, y0 + 3.5, w - 7, h - 7, 7); c.stroke();
      // the lit panel, with the two rails the letters hook on
      const px = 24, py = 148, pw = 312, ph = 90;
      c.fillStyle = '#fbf1d6'; PZ.rr(c, px, py, pw, ph, 4); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1; c.stroke();
      c.fillStyle = 'rgba(120,80,40,0.45)'; c.fillRect(px + 2, SLOT_Y - 39, pw - 4, 2); c.fillRect(px + 2, SLOT_Y + 37, pw - 4, 2);
      PZ.text(c, 'T O N I G H T', W / 2, 131, { size: 13.5, weight: 900, color: '#f6dc96', maxW: 220 });
    }
    function pavement(c) {
      const { x0, x1, y1 } = S.bleed, rr = U.rng(deco + 3);
      c.fillStyle = '#b8ac9f'; c.fillRect(x0, WALL_Y, x1 - x0, y1 - WALL_Y);
      c.strokeStyle = 'rgba(80,66,58,0.3)'; c.lineWidth = 1.3;
      for (let j = 0; WALL_Y + j * 50 < y1; j++) {
        const y = WALL_Y + j * 50;
        c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
        for (let x = Math.floor(x0 / 92) * 92 + (j % 2 ? 46 : 0); x < x1; x += 92) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 50); c.stroke(); }
      }
      for (let i = 0; i < 200; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(90,76,66,0.13)' : 'rgba(255,250,240,0.13)'; c.fillRect(x0 + rr() * (x1 - x0), WALL_Y + rr() * (y1 - WALL_Y), 2, 2); }
      c.fillStyle = 'rgba(50,40,30,0.2)'; c.fillRect(x0, WALL_Y, x1 - x0, 5);
    }
    function tray(c) {
      const { x, y, w, h } = TRAY;
      c.fillStyle = 'rgba(50,36,28,0.3)'; PZ.rr(c, x + 3, y + 6, w, h, 8); c.fill();
      c.fillStyle = '#8a5a36'; PZ.rr(c, x, y, w, h, 8); c.fill();
      c.fillStyle = '#a8764a'; PZ.rr(c, x + 3, y + 3, w - 6, h - 6, 6); c.fill();
      // the green baize the letters lie on
      c.fillStyle = '#42675a'; PZ.rr(c, x + 10, y + 10, w - 20, h - 20, 3); c.fill();
      const rr = U.rng(deco + 5);
      for (let i = 0; i < 260; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; c.fillRect(x + 12 + rr() * (w - 24), y + 12 + rr() * (h - 24), 1.5, 1.5); }
    }

    // ---------------------------------------------------------- what moves
    function tileArt(c, t, x, y, a, k) {
      c.save(); c.translate(x, y); c.rotate(a); c.scale(k, k);
      c.fillStyle = 'rgba(30,24,20,0.3)'; PZ.rr(c, -TW / 2 + 1.5, -TH / 2 + 2.6, TW, TH, 6); c.fill();
      c.fillStyle = PZ.PAPER; PZ.rr(c, -TW / 2, -TH / 2, TW, TH, 6); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.1; c.stroke();
      c.strokeStyle = 'rgba(124,45,53,0.3)'; c.lineWidth = 1; PZ.rr(c, -TW / 2 + 3.5, -TH / 2 + 3.5, TW - 7, TH - 7, 3.5); c.stroke();
      PZ.text(c, t.ch, 0, 2, { size: 39, weight: 900 });
      c.restore();
    }
    function slotArt(c, s) {
      c.strokeStyle = 'rgba(140,105,70,0.62)'; c.lineWidth = 1.4; c.setLineDash([4, 3.4]);
      PZ.rr(c, s.x - TW / 2 - 2, s.y - TH / 2 - 2, TW + 4, TH + 4, 6); c.stroke(); c.setLineDash([]);
      PZ.text(c, s.ch, s.x, s.y + 2, { size: 39, weight: 900, color: 'rgba(120,90,60,0.36)' });
    }
    function bulbs(c, t, still) {
      const on = still ? (ring.length * paid) / steps : lit, whole = solved();
      ring.forEach(([x, y], i) => {
        let a = U.clamp(on - i, 0, 1);
        if (whole && !still) a *= 0.74 + 0.26 * Math.sin(t * 1.5 - i * 0.65);
        if (a > 0.02) { c.fillStyle = `rgba(255,216,130,${(0.34 * a).toFixed(3)})`; c.beginPath(); c.arc(x, y, 9.5, 0, 7); c.fill(); }
        c.fillStyle = U.mix('#a8977c', '#fff2bd', a);
        c.beginPath(); c.arc(x, y, 4.3, 0, 7); c.fill();
        c.strokeStyle = 'rgba(50,24,24,0.55)'; c.lineWidth = 0.8; c.stroke();
      });
    }
    // the warm light behind the door glass once the title is up
    function doorLight(c, k) {
      if (k <= 0.01) return;
      c.save(); c.globalAlpha = k;
      c.fillStyle = '#ffdf9a';
      for (const d of DOORS) { c.fillRect(d.x + 1, d.y + 1, d.w - 2, d.h - 2); c.fillRect(d.x + 7, 339, d.w - 14, 32); }
      c.fillStyle = 'rgba(255,214,130,0.22)';
      c.beginPath(); c.moveTo(126, WALL_Y); c.lineTo(234, WALL_Y); c.lineTo(262, TRAY.y); c.lineTo(98, TRAY.y); c.closePath(); c.fill();
      c.restore();
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: { x: 0, y: 104, w: 360, h: 360 },
      decor(c) { sky(c); wall(c); marquee(c); doors(c); poster(c); pavement(c); tray(c); },
      draw(c, t, still) {
        doorLight(c, still ? (solved() ? 1 : 0) : U.smooth(0.1, 1.1, shine));
        bulbs(c, t, still);
        for (const s of slots) if (!s.tile) slotArt(c, s);
        for (const q of tiles) if (q !== held || still) {
          if (q.slot) tileArt(c, q, still ? q.slot.x : q.x, still ? q.slot.y : q.y, 0, still ? 1 : 1 + 0.12 * Math.sin(q.slot.pop * Math.PI));
          else tileArt(c, q, still ? q.hx : q.x, still ? q.hy : q.y, q.tilt, 1);
        }
        if (still) return;
        if (hintT > 0) { const n = next(); if (n) { PZ.glow(c, n.t.x, n.t.y, 37, t); PZ.glow(c, n.s.x, n.s.y, 37, t); } }
        if (held) tileArt(c, held, held.x, held.y, 0, 1.08);
      },
      step(dt) {
        hintT -= dt;
        for (const q of tiles) { q.x = PZ.approach(q.x, q.tx, dt, q === held ? 24 : 14); q.y = PZ.approach(q.y, q.ty, dt, q === held ? 24 : 14); }
        for (const s of slots) if (s.pop < 1) s.pop = Math.min(1, s.pop + dt / 0.3);
        lit = PZ.approach(lit, (ring.length * paid) / steps, dt, 5);
        if (solved()) shine += dt;
      },
      down(x, y) {
        if (held || solved()) return;
        const near = tiles.filter((q) => !q.slot && Math.abs(q.x - x) <= TW / 2 + 8 && Math.abs(q.y - y) <= TH / 2 + 8);
        near.sort((a, b) => PZ.dist(a.x, a.y, x, y) - PZ.dist(b.x, b.y, x, y));
        if (!near.length) return;
        held = near[0]; held.sx = x; held.sy = y; held.moved = false;
        fx.sound('pick');
      },
      move(x, y) {
        if (!held) return;
        if (!held.moved && PZ.dist(x, y, held.sx, held.sy) < 8) return;
        held.moved = true; held.tx = x; held.ty = y - PZ.LIFT;
      },
      up(x, y) {
        if (!held) return;
        const q = held, dx = x, dy = y - PZ.LIFT;
        held = null;
        const near = slots.filter((s) => Math.abs(s.x - dx) <= REACH_X && Math.abs(s.y - dy) <= REACH_Y);
        const s = q.moved && near.filter((e) => !e.tile && e.ch === q.ch).sort((a, b) => Math.abs(a.x - dx) - Math.abs(b.x - dx))[0];
        if (s) {
          place(q, s); s.pop = 0; paid++; hintT = 0;
          fx.sound(solved() ? 'chime' : 'drop');
          fx.good(s.x, s.y);
          return;
        }
        q.tx = q.hx; q.ty = q.hy;
        if (q.moved) fx.sound(dy > TRAY.y - 10 ? 'drop' : 'nope');
      },
      cancel() { if (held) { held.tx = held.hx; held.ty = held.hy; held = null; } },
      progress: () => paid / steps,
      solved,
      hint() { if (!solved()) hintT = 3.5; },
      // for each slot, the letter on it (their places in the tray), -1 if empty
      save: () => ({ s: slots.map((s) => tiles.indexOf(s.tile)) }),
      load(st) {
        if (!st || !Array.isArray(st.s) || st.s.length !== steps) return;
        const used = st.s.filter((v) => v !== -1);
        if (new Set(used).size !== used.length || !st.s.every((v, i) => v === -1 || (tiles[v] && tiles[v].ch === slots[i].ch))) return;
        st.s.forEach((v, i) => { if (v >= 0) { place(tiles[v], slots[i]); tiles[v].x = slots[i].x; tiles[v].y = slots[i].y; paid++; } });
        lit = (ring.length * paid) / steps;
      },
      solveAll() {
        for (const s of slots) if (!s.tile) { const q = tiles.find((e) => !e.slot && e.ch === s.ch); place(q, s); q.x = s.x; q.y = s.y; }
        paid = steps; held = null; lit = ring.length;
      },
      // finger positions: each free letter to its slot, let go LIFT below it
      debugPlan() {
        const free = tiles.filter((q) => !q.slot), plan = [];
        for (const s of slots) {
          if (s.tile) continue;
          const q = free.splice(free.findIndex((e) => e.ch === s.ch), 1)[0];
          plan.push({ drag: [q.hx, q.hy, s.x, s.y + PZ.LIFT] });
        }
        return plan;
      },
      // for the tests: the word and the letters in the tray
      debugLayout: () => ({ word, tiles: tiles.map((q) => q.ch).join('') }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { letters });
})();
