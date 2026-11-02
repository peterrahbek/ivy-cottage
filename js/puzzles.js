'use strict';
// Thinking jobs ("puzzles"): no dirt and no tools, only your own two hands.
// A puzzle is a scene kind like any other, registered in SCENES.KINDS and
// built with SCENES.build(kind, opts, seed, bleed) -> KINDS[kind](S), where
// S = { W: 360, H: 600, r: seeded random, nz: noise, opts, bleed }. Instead
// of layers for the engine to wipe, it draws itself every frame and takes
// the finger directly. The engine pays coins as moves come right, waits a
// moment once the scene says it is solved and then shows the finish card.
//
// A puzzle scene returns an object with:
//   puzzle: true
//   indoor: true                 no season weather drawn over it
//   steps: n                     how many right moves solve it; each fx.good() pays 1/n of the job
//   crop: { x, y, w, h }         optional, board units: the square used for the before and
//                                after pictures and the next-job thumbnail (default 0, 120, 360, 360)
//   decor(c)                     the static background, painted once per layout; it may paint
//                                outside the board, into S.bleed { x0, y0, x1, y1 }
//   draw(c, t, still)            everything else, every frame, board units; t = seconds since
//                                the start. still = true when drawn for a picture: skip hint
//                                glows and whatever is held in the hand
//   step(dt)                     optional, animations
//   down(x, y) move(x, y) up(x, y)   the finger in board units, exactly where it touches
//   cancel()                     the touch was interrupted: put back whatever is held
//   progress()                   0..1
//   solved()                     true once everything is right (and stays true)
//   hint()                       show one right move for a few seconds, never a penalty
//   save() / load(state)         a small JSON-able object, for leaving halfway and coming back;
//                                load() is called right after building, before the first frame
//   solveAll()                   test hook: put everything right at once (no fx calls needed)
//   debugPlan()                  test hook: gestures that solve it from the current state,
//                                [{ drag: [x0, y0, x1, y1] } | { tap: [x, y] }, ...]
//   fx                           set by the engine right after building:
//     fx.good(x, y)              a right move at x, y: pays 1/steps, coins fly, sparkles
//     fx.sound(kind)             'pick' | 'drop' | 'nope' | 'clink' | 'pour' | 'turn' | 'happy' | 'chime'
//     fx.sparkle(x, y)
//
// House rules, so they stay calm: no timers, scores, lives or "wrong!". A
// move that is not right simply does not happen: the piece glides back
// (about a quarter of a second) with fx.sound('nope'). Anything you drag is
// at least 44 board units across and is drawn PZ.LIFT units above the
// finger, so the finger never hides it; drops are judged where it is drawn.
// Colour is never the only clue (shapes, patterns or pictures go with it).
// Layouts come from S.r only (never Math.random), are always solvable and
// never start solved. fx.good is never called twice for the same thing.
// Input is never blocked by an animation. debugPlan() gives finger
// positions, so a drop on a target at x, y lets go at x, y + PZ.LIFT.
// The test bench in test/ plays a puzzle in headless Chrome:
//   node test/run.mjs puzzle js/pz-cups.js cups --seeds 20

const PZ = (() => {
  const LIFT = 22;
  const INK = '#3b352e', INK2 = '#6b6157', PAPER = '#fffaf1', CREAM = '#f6efe3';
  const font = (size, weight = 800) => `${weight} ${size}px ui-rounded, "SF Pro Rounded", system-ui, sans-serif`;
  const EMOJI = (size) => `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;

  function text(c, s, x, y, o = {}) {
    c.font = font(o.size || 14, o.weight || 800);
    c.fillStyle = o.color || INK;
    c.textAlign = o.align || 'center';
    c.textBaseline = o.baseline || 'middle';
    if (o.maxW) c.fillText(s, x, y, o.maxW); else c.fillText(s, x, y);
  }
  // colour emoji take the alpha of the fill style, so it is set opaque here
  function emoji(c, e, x, y, size) {
    c.font = EMOJI(size); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000';
    c.fillText(e, x, y + size * 0.06);
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  // a soft contact shadow under something resting or held
  function shadow(c, x, y, rx, ry, a = 0.18) {
    c.fillStyle = `rgba(40,30,20,${a})`; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
  }
  // a slow pulsing ring for hints
  function glow(c, x, y, r, t) {
    const k = 0.5 + 0.5 * Math.sin(t * 5);
    c.save();
    c.strokeStyle = `rgba(255,214,90,${0.55 + 0.4 * k})`; c.lineWidth = 3 + 2 * k;
    c.beginPath(); c.arc(x, y, r + 3 * k, 0, 7); c.stroke();
    c.restore();
  }
  // move a value towards a target, frame-rate independent
  const approach = (v, to, dt, speed = 14) => v + (to - v) * Math.min(1, dt * speed);
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  function shuffle(r, a) {
    for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  return { LIFT, INK, INK2, PAPER, CREAM, font, EMOJI, text, emoji, rr, shadow, glow, approach, dist, shuffle };
})();
