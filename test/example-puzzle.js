'use strict';
// A tiny example of the puzzle contract in js/puzzles.js, for the test bench
// and as a pattern to copy: three fruits go into the bowl with their own
// picture. Not part of the game.
//   node test/run.mjs puzzle test/example-puzzle.js example
(() => {
  const FRUIT = [
    { id: 'apple', col: '#d9534f', emoji: '🍎' },
    { id: 'pear', col: '#a7c957', emoji: '🍐' },
    { id: 'lemon', col: '#f2d24b', emoji: '🍋' },
  ];
  const R = 26; // a piece is 52 units across: easy to hold

  function example(S) {
    const r = S.r;
    const bowls = PZ.shuffle(r, FRUIT.slice()).map((f, i) => ({ f, x: 70 + i * 110, y: 230 }));
    const pieces = PZ.shuffle(r, FRUIT.slice()).map((f, i) => {
      const hx = 75 + i * 105 + (r() - 0.5) * 24, hy = 440 + (r() - 0.5) * 50;
      return { f, hx, hy, x: hx, y: hy, tx: hx, ty: hy, placed: false, held: false };
    });
    const bowlFor = (p) => bowls.find((b) => b.f === p.f);
    let held = null, gdx = 0, gdy = 0, hint = null, hintT = 0, fx = null;

    function settle(p) { const b = bowlFor(p); p.placed = true; p.held = false; p.tx = p.x = b.x; p.ty = p.y = b.y - 6; }

    const sc = {
      puzzle: true, indoor: true, steps: pieces.length,
      crop: { x: 0, y: 140, w: 360, h: 360 },
      decor(c) {
        const b = S.bleed;
        c.fillStyle = '#efe4d2'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
        c.fillStyle = '#d9c4a3'; c.fillRect(b.x0, 330, b.x1 - b.x0, b.y1 - 330); // the table
        PZ.text(c, 'Each fruit in its own bowl', 180, 120, { size: 16, color: PZ.INK2 });
        for (const w of bowls) {
          PZ.shadow(c, w.x, w.y + 26, 44, 9);
          c.fillStyle = '#fffaf1'; c.beginPath(); c.ellipse(w.x, w.y + 6, 44, 24, 0, 0, Math.PI); c.fill();
          c.strokeStyle = '#c9b89c'; c.lineWidth = 2; c.stroke();
          PZ.emoji(c, w.f.emoji, w.x, w.y + 52, 18); // the bowl's label: a little picture, not only a colour
        }
      },
      draw(c, t, still) {
        if (hint && hintT > 0 && !still) { PZ.glow(c, hint.x, hint.y, R + 4, t); const b = bowlFor(hint); PZ.glow(c, b.x, b.y, 40, t); }
        // resting pieces first, the one in the hand last (on top, a little bigger)
        for (const p of pieces) {
          if (p === held && !still) continue;
          PZ.shadow(c, p.x, p.y + R * 0.85, R * 0.8, R * 0.22);
          PZ.emoji(c, p.f.emoji, p.x, p.y, R * 1.6);
        }
        if (held && !still) {
          PZ.shadow(c, held.x + 4, held.y + R * 1.3, R * 0.75, R * 0.2, 0.14);
          PZ.emoji(c, held.f.emoji, held.x, held.y, R * 1.8);
        }
      },
      step(dt) {
        hintT -= dt;
        for (const p of pieces) { p.x = PZ.approach(p.x, p.tx, dt); p.y = PZ.approach(p.y, p.ty, dt); }
      },
      down(x, y) {
        if (held) return;
        const p = pieces.filter((q) => !q.placed && PZ.dist(q.x, q.y, x, y) < R + 10).sort((a, b) => PZ.dist(a.x, a.y, x, y) - PZ.dist(b.x, b.y, x, y))[0];
        if (!p) return;
        held = p; p.held = true; gdx = p.x - x; gdy = p.y - y;
        p.tx = x + gdx; p.ty = y + gdy - PZ.LIFT;
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x + gdx; held.ty = y + gdy - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const p = held; held = null; p.held = false;
        const dx = x + gdx, dy = y + gdy - PZ.LIFT; // judged where it is drawn
        const b = bowls.find((w) => PZ.dist(w.x, w.y, dx, dy) < 46);
        if (b && b.f === p.f) { settle(p); fx.sound('drop'); fx.good(b.x, b.y); return; }
        p.tx = p.hx; p.ty = p.hy; // not there: it glides back home
        fx.sound('nope');
      },
      cancel() { if (held) { held.held = false; held.tx = held.hx; held.ty = held.hy; held = null; } },
      progress: () => pieces.filter((p) => p.placed).length / pieces.length,
      solved: () => pieces.every((p) => p.placed),
      hint() { hint = pieces.find((p) => !p.placed) || null; hintT = 3; },
      save: () => ({ placed: pieces.map((p) => p.placed) }),
      load(s) { if (s && s.placed) s.placed.forEach((v, i) => { if (v && pieces[i]) settle(pieces[i]); }); },
      solveAll() { pieces.forEach(settle); },
      // finger positions: pick up at the piece, let go PZ.LIFT below the bowl
      debugPlan: () => pieces.filter((p) => !p.placed).map((p) => { const b = bowlFor(p); return { drag: [p.hx, p.hy, b.x, b.y + PZ.LIFT] }; }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }
  SCENES.KINDS.example = example;
})();
