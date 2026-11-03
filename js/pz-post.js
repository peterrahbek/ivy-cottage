'use strict';
// Stamps for the parcels, a thinking job for Halfpenny Halt. Three parcels
// wait on their postal scales, and each scale's dial shows what its parcel
// weighs (3 to 9). Drag stamps from the sheet (worth 1, 2, 3 and 5, as many
// as you like) onto a parcel until they add up to exactly its weight; a tag
// under each scale keeps the sum ("3 + 2 = 5 of 7"). A stamp that would go
// over simply glides back, so there is never a stamp to peel off again, and
// a parcel that adds up gets its PAID postmark. With opts.where = 'books' the
// parcels are books for the bookshop's customers, tied up with string.
//   node test/run.mjs puzzle js/pz-post.js post --seeds 30 [--opts '{"where":"books"}']
(() => {
  const INK = PZ.INK, INK2 = PZ.INK2, PAPER = PZ.PAPER;
  const LANES = [62, 180, 298];          // the three scales along the counter
  const PLATE_Y = 214;                   // the top of each scale's pan: a parcel stands here
  const DIAL_Y = 254, DIAL_R = 26;       // the scale's fan-shaped window, its pivot at the bottom
  const COUNTER_Y = 278;                 // the counter top the scales stand on
  const TAG_Y = 300;                     // the top of the tag hanging under each scale
  const PAD_Y = 440, PADS_X = [57, 139, 221, 303];
  const VALUES = [1, 2, 3, 5];
  const SW = 58, SH = 68;                // a stamp, full size
  const BIG = 1.15, SMALL = 0.44;        // on the sheet (and in the hand), and stuck on a parcel
  const SWEEP = Math.PI, A0 = Math.PI;  // the fan reads 0 on the left to 10 on the right

  const dot = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  const oval = (c, x, y, rx, ry, rot, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
  function line(c, pts, col, w) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  }

  // ---------------------------------------------------------------- stamps
  // every value has its own colour, its own little picture and its number,
  // big, so colour is never the only clue
  const TINT = {
    1: { col: '#a6d3d4', deep: '#2f6f72' }, 2: { col: '#efb4ae', deep: '#a8473f' },
    3: { col: '#f2d88a', deep: '#8f6a0c' }, 5: { col: '#bba9df', deep: '#5d4a9a' },
  };
  // the perforated edge: little half-circles bitten out all the way round
  function stampPath(w, h, r, step) {
    const p = new Path2D(), x0 = -w / 2, y0 = -h / 2, x1 = w / 2, y1 = h / 2;
    const nx = Math.max(2, Math.round(w / step)), ny = Math.max(2, Math.round(h / step));
    p.moveTo(x0, y0);
    for (let i = 1; i < nx; i++) { const x = x0 + (w * i) / nx; p.lineTo(x - r, y0); p.arc(x, y0, r, Math.PI, 0, true); }
    p.lineTo(x1, y0);
    for (let i = 1; i < ny; i++) { const y = y0 + (h * i) / ny; p.lineTo(x1, y - r); p.arc(x1, y, r, -Math.PI / 2, Math.PI / 2, true); }
    p.lineTo(x1, y1);
    for (let i = nx - 1; i >= 1; i--) { const x = x0 + (w * i) / nx; p.lineTo(x + r, y1); p.arc(x, y1, r, 0, Math.PI, true); }
    p.lineTo(x0, y1);
    for (let i = ny - 1; i >= 1; i--) { const y = y0 + (h * i) / ny; p.lineTo(x0, y + r); p.arc(x0, y, r, Math.PI / 2, -Math.PI / 2, true); }
    p.closePath();
    return p;
  }
  const EDGE = stampPath(SW, SH, 2.6, 7.3);

  // the little pictures, about 30 x 26 around 0, 0
  const MOTIFS = {
    bird(c, t) {
      c.fillStyle = t.deep; c.beginPath(); c.moveTo(-9, 1); c.lineTo(-16, -5); c.lineTo(-14, 4); c.closePath(); c.fill();
      oval(c, -1, 2, 10.5, 7.5, -0.1, t.deep);
      dot(c, 8, -4, 5.6, t.deep);
      c.fillStyle = '#e9962c'; c.beginPath(); c.moveTo(13, -5.5); c.lineTo(17.5, -3.5); c.lineTo(13, -2); c.closePath(); c.fill();
      oval(c, 2, 4, 5, 3.6, 0, '#e2574c');
      oval(c, -2, 0, 6, 3.4, -0.35, U.shade(t.deep, 0.3));
      dot(c, 9.4, -5.2, 1.3, '#fffaf1');
      line(c, [[-2, 9], [-3, 12.5]], t.deep, 1.3); line(c, [[2, 9], [2, 12.5]], t.deep, 1.3);
    },
    flower(c, t) {
      line(c, [[0, 4], [0, 13]], '#5c8458', 2);
      oval(c, 4, 10, 4, 2, -0.5, '#6f9a6a');
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; oval(c, Math.cos(a) * 6.4, -3 + Math.sin(a) * 6.4, 5, 3.6, a, t.deep); }
      dot(c, 0, -3, 3.6, '#f2d88a'); dot(c, -1, -4, 1.2, '#fffaf1');
    },
    boat(c, t) {
      line(c, [[-15, 11], [-9, 9], [-3, 11], [3, 9], [9, 11], [15, 9]], U.shade(t.deep, 0.25), 1.6);
      c.fillStyle = t.deep; c.beginPath(); c.moveTo(-13, 3); c.lineTo(13, 3); c.lineTo(9, 9); c.lineTo(-9, 9); c.closePath(); c.fill();
      line(c, [[0, 3], [0, -14]], INK2, 1.4);
      c.fillStyle = '#fffaf1'; c.beginPath(); c.moveTo(1.5, -13); c.lineTo(11, 1); c.lineTo(1.5, 1); c.closePath(); c.fill();
      c.fillStyle = U.shade(t.deep, 0.35); c.beginPath(); c.moveTo(-1.5, -10); c.lineTo(-1.5, 1); c.lineTo(-9, 1); c.closePath(); c.fill();
      c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(0, -14); c.lineTo(5, -12.5); c.lineTo(0, -11); c.closePath(); c.fill();
    },
    crown(c, t) {
      c.fillStyle = t.deep; c.beginPath();
      c.moveTo(-13, 8); c.lineTo(-14, -7); c.lineTo(-7, 0); c.lineTo(0, -11); c.lineTo(7, 0); c.lineTo(14, -7); c.lineTo(13, 8); c.closePath(); c.fill();
      c.fillStyle = U.shade(t.deep, 0.3); c.fillRect(-13, 5, 26, 4);
      dot(c, -14, -8, 2.2, '#f2d88a'); dot(c, 0, -12, 2.4, '#f2d88a'); dot(c, 14, -8, 2.2, '#f2d88a');
      dot(c, -6, 6.8, 1.6, '#e2574c'); dot(c, 0, 6.8, 1.6, '#8fbfe6'); dot(c, 6, 6.8, 1.6, '#e2574c');
    },
    fish(c, t) {
      c.fillStyle = t.deep; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-16, -7); c.lineTo(-15, 7); c.closePath(); c.fill();
      oval(c, 1, 0, 12, 7.5, 0, t.deep);
      c.strokeStyle = U.shade(t.deep, 0.35); c.lineWidth = 1.2;
      for (const x of [-2, 2.5]) { c.beginPath(); c.arc(x, 0, 5, -1.1, 1.1); c.stroke(); }
      dot(c, 8, -2, 1.8, '#fffaf1'); dot(c, 8.4, -2, 0.9, INK);
      c.strokeStyle = U.shade(t.deep, 0.2); c.lineWidth = 1; c.beginPath(); c.arc(13, -10, 2, 0, 7); c.stroke(); c.beginPath(); c.arc(10, -14, 1.3, 0, 7); c.stroke();
    },
    leaf(c, t) {
      c.save(); c.rotate(-0.5);
      c.fillStyle = t.deep; c.beginPath(); c.moveTo(0, -14); c.bezierCurveTo(11, -8, 11, 6, 0, 13); c.bezierCurveTo(-11, 6, -11, -8, 0, -14); c.fill();
      line(c, [[0, -11], [0, 14]], U.shade(t.deep, 0.4), 1.3);
      for (const y of [-5, 0, 5]) { line(c, [[0, y + 2], [5, y - 2]], U.shade(t.deep, 0.4), 1); line(c, [[0, y + 2], [-5, y - 2]], U.shade(t.deep, 0.4), 1); }
      c.restore();
    },
  };
  const MOTIF_IDS = Object.keys(MOTIFS);

  function drawStamp(c, v, motif, x, y, s, rot = 0, lifted = false) {
    const t = TINT[v];
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.save(); c.translate(lifted ? 3 : 1.2, lifted ? 5 : 1.8); c.fillStyle = `rgba(60,40,20,${lifted ? 0.16 : 0.2})`; c.fill(EDGE); c.restore();
    c.fillStyle = '#fffdf7'; c.fill(EDGE);
    c.strokeStyle = 'rgba(59,53,46,0.16)'; c.lineWidth = 0.8; c.stroke(EDGE);
    c.fillStyle = t.col; PZ.rr(c, -SW / 2 + 5.5, -SH / 2 + 5.5, SW - 11, SH - 11, 2); c.fill();
    c.strokeStyle = t.deep; c.lineWidth = 1.3; c.stroke();
    c.fillStyle = 'rgba(255,250,241,0.6)'; PZ.rr(c, -SW / 2 + 9, -SH / 2 + 9, SW - 18, 33, 2); c.fill();
    c.save(); c.translate(0, -SH / 2 + 25.5); MOTIFS[motif](c, t); c.restore();
    PZ.text(c, String(v), 0, SH / 2 - 15.5, { size: 22, weight: 900, color: t.deep });
    c.restore();
  }

  // the stamps underneath on a pad, only their paper edges showing
  function blank(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.save(); c.translate(1.2, 1.8); c.fillStyle = 'rgba(60,40,20,0.16)'; c.fill(EDGE); c.restore();
    c.fillStyle = '#fbf6ea'; c.fill(EDGE);
    c.strokeStyle = 'rgba(59,53,46,0.16)'; c.lineWidth = 0.8; c.stroke(EDGE);
    c.restore();
  }

  // ---------------------------------------------------------------- parcels
  // each parcel is drawn standing on PLATE_Y; zone is where its stamps go
  const STYLES = {
    // brown paper and string, with a bow on top
    paper: { w: 100, h: 78, cols: ['#c99e69', '#d4ad7a', '#bf9260'] },
    // a striped hat box with a lid
    hatbox: { w: 96, h: 86, cols: ['#a6d3d4', '#efb4ae', '#bba9df'] },
    // a round biscuit tin, seen from the front
    tin: { w: 86, h: 80, cols: ['#6f9a6a', '#3d5a86', '#c9474f'] },
    // the bookshop's: three books in a pile, tied with string
    stack: { w: 102, h: 80, cols: ['#c9474f', '#3d5a86', '#6f9a6a'] },
    // a book wrapped in brown paper with a ribbon
    wrapped: { w: 106, h: 64, cols: ['#c99e69', '#d4ad7a', '#bf9260'] },
    // two thick old books with a strap and buckle
    bundle: { w: 98, h: 78, cols: ['#8a5a3a', '#4e7b5b', '#6b4a7a'] },
  };
  function zoneOf(p) {
    const top = PLATE_Y - p.h, x = p.x;
    if (p.style === 'hatbox') return { x0: x - 40, y0: top + 24, w: 80, h: p.h - 32 };
    if (p.style === 'tin') return { x0: x - 36, y0: top + 18, w: 72, h: p.h - 28 };
    if (p.style === 'wrapped') return { x0: x - 46, y0: top + 6, w: 92, h: p.h - 12 };
    return { x0: x - 44, y0: top + 6, w: 88, h: p.h - 12 };
  }
  // the bow on top of a string parcel
  function bow(c, x, y, col) {
    c.save(); c.translate(x, y);
    c.strokeStyle = col; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.ellipse(-8, -5, 8, 4.6, -0.5, 0, 7); c.stroke();
    c.beginPath(); c.ellipse(8, -5, 8, 4.6, 0.5, 0, 7); c.stroke();
    line(c, [[-1, 0], [-7, 9]], col, 2.4); line(c, [[1, 0], [8, 8]], col, 2.4);
    dot(c, 0, -1, 3, col);
    c.restore();
  }
  function drawParcel(c, p) {
    const { x, w, h, col } = p, top = PLATE_Y - h, x0 = x - w / 2, x1 = x + w / 2;
    PZ.shadow(c, x, PLATE_Y + 1, w * 0.52, 4, 0.22);
    if (p.style === 'paper' || p.style === 'wrapped') {
      // the top face, a sliver of it, and the front
      c.fillStyle = U.shade(col, 0.18); c.beginPath(); c.moveTo(x0 + 6, top - 8); c.lineTo(x1 - 2, top - 8); c.lineTo(x1, top); c.lineTo(x0, top); c.closePath(); c.fill();
      c.fillStyle = col; PZ.rr(c, x0, top, w, h, 3); c.fill();
      c.fillStyle = 'rgba(80,50,20,0.1)'; c.fillRect(x1 - 10, top, 10, h);
      // creases in the paper
      line(c, [[x0 + 10, top + h * 0.3], [x0 + 26, top + h * 0.42]], 'rgba(255,240,210,0.35)', 1);
      line(c, [[x1 - 30, top + h * 0.75], [x1 - 14, top + h * 0.66]], 'rgba(80,50,20,0.16)', 1);
      if (p.style === 'wrapped') {
        // a book's shape pressing through the paper
        c.strokeStyle = 'rgba(80,50,20,0.22)'; c.lineWidth = 1.4; PZ.rr(c, x0 + 7, top + 7, w - 14, h - 14, 4); c.stroke();
        line(c, [[x0 + 14, top + 7], [x0 + 14, top + h - 7]], 'rgba(80,50,20,0.14)', 1.2);
        // a ribbon across, and a bow
        c.fillStyle = '#c9474f'; c.fillRect(x - 3.5, top - 8, 7, h + 8); c.fillRect(x0, top + h / 2 - 3.5, w, 7);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x - 3.5, top - 8, 2, h + 8);
        bow(c, x, top - 6, '#c9474f');
      } else {
        const str = '#f1e6cf';
        line(c, [[x, top - 8], [x, top + h]], str, 3); line(c, [[x0, top + h / 2], [x1, top + h / 2]], str, 3);
        line(c, [[x0 + 6, top - 4], [x1 - 1, top - 4]], str, 2.2);
        bow(c, x, top - 6, str);
      }
    } else if (p.style === 'hatbox') {
      const lid = 18, ry = 7;
      c.fillStyle = col; c.beginPath(); c.moveTo(x0 + 2, top + lid); c.lineTo(x1 - 2, top + lid); c.lineTo(x1 - 2, PLATE_Y - ry); c.ellipse(x, PLATE_Y - ry, w / 2 - 2, ry, 0, 0, Math.PI); c.closePath(); c.fill();
      // cream stripes round the box
      c.save(); c.clip();
      c.fillStyle = 'rgba(255,250,241,0.55)';
      for (let i = -3; i <= 3; i++) { const sx = x + i * 14 * Math.cos(Math.abs(i) * 0.12); c.fillRect(sx - 3, top + lid, 6 - Math.abs(i) * 0.5, h); }
      c.fillStyle = 'rgba(70,50,30,0.12)'; c.fillRect(x1 - 14, top, 14, h);
      c.restore();
      // the lid: a band and its top
      c.fillStyle = U.shade(col, -0.12); c.beginPath(); c.moveTo(x0, top + 6); c.lineTo(x1, top + 6); c.lineTo(x1, top + lid); c.ellipse(x, top + lid, w / 2, 5, 0, 0, Math.PI); c.closePath(); c.fill();
      oval(c, x, top + 6, w / 2, 6, 0, U.shade(col, 0.25));
      // a ribbon tied round the lid
      c.fillStyle = '#fffaf1'; c.fillRect(x0, top + 10, w, 4);
      bow(c, x + 22, top + 10, '#fffaf1');
    } else if (p.style === 'tin') {
      c.fillStyle = col; PZ.rr(c, x0, top + 8, w, h - 8, 9); c.fill();
      c.fillStyle = U.shade(col, 0.22); c.fillRect(x0 + 1, top + 14, w - 2, 4); c.fillRect(x0 + 1, PLATE_Y - 10, w - 2, 4);
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x0 + 8, top + 20, 6, h - 34);
      c.fillStyle = 'rgba(30,20,10,0.14)'; c.fillRect(x1 - 12, top + 18, 10, h - 30);
      // the lid
      c.fillStyle = U.shade(col, -0.15); PZ.rr(c, x0 - 3, top, w + 6, 14, 6); c.fill();
      c.fillStyle = U.shade(col, 0.3); c.fillRect(x0, top + 3, w, 2);
      // little gold dots round the lid
      for (let i = 0; i < 9; i++) dot(c, x0 + 6 + (i * (w - 12)) / 8, top + 9, 1.3, '#f2d88a');
    } else if (p.style === 'stack') {
      // three books lying one on another, each a little different in size
      const books = [[w, 28, col], [w - 8, 26, p.col2], [w - 2, 24, p.col3]];
      let y = PLATE_Y;
      books.forEach(([bw, bh, bc], i) => {
        const bx = x - bw / 2 + (i === 1 ? 3 : i === 2 ? -2 : 0);
        y -= bh;
        c.fillStyle = '#f4ecdc'; c.fillRect(bx + 3, y + 3, bw - 3, bh - 6);
        c.strokeStyle = 'rgba(150,130,100,0.5)'; c.lineWidth = 0.7;
        for (let k = 6; k < bh - 4; k += 3) { c.beginPath(); c.moveTo(bx + 4, y + k); c.lineTo(bx + bw - 1, y + k); c.stroke(); }
        c.fillStyle = bc; PZ.rr(c, bx, y, 10, bh, 2); c.fill();
        c.fillRect(bx, y, bw, 3.5); c.fillRect(bx, y + bh - 3.5, bw, 3.5);
        c.fillStyle = '#f2d88a'; c.fillRect(bx + 3, y + bh / 2 - 1, 4, 2);
      });
      const str = '#f1e6cf';
      line(c, [[x, top - 6], [x, PLATE_Y]], str, 3); bow(c, x, top - 4, str);
    } else if (p.style === 'bundle') {
      // two thick old books with a leather strap and a brass buckle
      const books = [[w, 40, col], [w - 10, 36, p.col2]];
      let y = PLATE_Y;
      books.forEach(([bw, bh, bc], i) => {
        const bx = x - bw / 2 + (i ? 4 : 0);
        y -= bh;
        c.fillStyle = '#f1e4c8'; c.fillRect(bx + 4, y + 4, bw - 4, bh - 8);
        c.strokeStyle = 'rgba(150,130,100,0.45)'; c.lineWidth = 0.7;
        for (let k = 8; k < bh - 5; k += 3) { c.beginPath(); c.moveTo(bx + 6, y + k); c.lineTo(bx + bw - 1, y + k); c.stroke(); }
        c.fillStyle = bc; PZ.rr(c, bx, y, 14, bh, 3); c.fill();
        c.fillRect(bx, y, bw, 4.5); c.fillRect(bx, y + bh - 4.5, bw, 4.5);
        c.fillStyle = 'rgba(242,216,138,0.85)'; c.fillRect(bx + 3, y + 10, 8, 2); c.fillRect(bx + 3, y + bh - 12, 8, 2);
      });
      c.fillStyle = '#7a4a2a'; c.fillRect(x - 30, top - 2, 10, h + 2);
      c.fillStyle = '#d9b44a'; c.fillRect(x - 32, top + h / 2 - 7, 14, 14); c.fillStyle = '#7a4a2a'; c.fillRect(x - 29, top + h / 2 - 4, 8, 8);
    }
  }

  // a postal scale: the pan the parcel stands on, a body and a round dial
  function scaleBody(c, x, weight, books) {
    const body = books ? '#4e7b5b' : '#9b3b44';
    PZ.shadow(c, x, COUNTER_Y + 1, 52, 4, 0.2);
    c.fillStyle = U.shade(body, -0.25); c.fillRect(x - 5, PLATE_Y + 5, 10, 10);
    c.fillStyle = body; c.beginPath(); c.moveTo(x - 42, COUNTER_Y); c.lineTo(x - 36, PLATE_Y + 12); c.lineTo(x + 36, PLATE_Y + 12); c.lineTo(x + 42, COUNTER_Y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - 34, PLATE_Y + 14, 6, COUNTER_Y - PLATE_Y - 16);
    c.fillStyle = U.shade(body, -0.3); c.fillRect(x - 44, COUNTER_Y - 4, 88, 4);
    // the pan
    c.fillStyle = '#c9b48a'; PZ.rr(c, x - 54, PLATE_Y, 108, 6, 3); c.fill();
    c.fillStyle = '#e8d8b2'; c.fillRect(x - 52, PLATE_Y, 104, 1.6);
    // the fan-shaped window, 0 to 10 along its arc, and a brass plate below with the weight
    c.fillStyle = '#d9b44a'; c.beginPath(); c.arc(x, DIAL_Y + 1, DIAL_R + 3, Math.PI, 0); c.closePath(); c.fill();
    c.fillStyle = '#fbf5e6'; c.beginPath(); c.arc(x, DIAL_Y, DIAL_R, Math.PI, 0); c.closePath(); c.fill();
    c.strokeStyle = INK2; c.lineCap = 'round';
    for (let i = 0; i <= 10; i++) {
      const a = A0 + (i / 10) * SWEEP, l = i % 5 ? 3.5 : 6;
      c.lineWidth = i % 5 ? 1 : 1.6;
      c.beginPath(); c.moveTo(x + Math.cos(a) * (DIAL_R - 2), DIAL_Y + Math.sin(a) * (DIAL_R - 2)); c.lineTo(x + Math.cos(a) * (DIAL_R - 2 - l), DIAL_Y + Math.sin(a) * (DIAL_R - 2 - l)); c.stroke();
    }
    // the weight's own mark on the arc, in red
    const aw = A0 + (weight / 10) * SWEEP;
    c.strokeStyle = '#c9474f'; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(x + Math.cos(aw) * (DIAL_R - 1.5), DIAL_Y + Math.sin(aw) * (DIAL_R - 1.5)); c.lineTo(x + Math.cos(aw) * (DIAL_R - 9), DIAL_Y + Math.sin(aw) * (DIAL_R - 9)); c.stroke();
    c.fillStyle = '#d9b44a'; PZ.rr(c, x - 17, DIAL_Y + 3, 34, 20, 5); c.fill();
    c.fillStyle = '#fbf5e6'; PZ.rr(c, x - 14, DIAL_Y + 5.5, 28, 15, 3.5); c.fill();
    PZ.text(c, String(weight), x, DIAL_Y + 13.5, { size: 16, weight: 900, color: INK });
  }

  // a stamp sheet's little desk things, for the corners
  function inkPad(c, x, y) {
    PZ.shadow(c, x, y + 10, 30, 5, 0.18);
    c.fillStyle = '#3d5a86'; PZ.rr(c, x - 28, y - 6, 56, 16, 4); c.fill();
    c.fillStyle = '#5b4a8a'; PZ.rr(c, x - 23, y - 4, 46, 9, 3); c.fill();
    // a rubber stamp beside it
    PZ.shadow(c, x + 46, y + 10, 12, 3.5, 0.18);
    c.fillStyle = '#8a5a3a'; c.fillRect(x + 40, y - 12, 12, 20);
    oval(c, x + 46, y - 14, 9, 7, 0, '#a77d4b'); oval(c, x + 44, y - 16, 3, 2, 0, 'rgba(255,240,210,0.5)');
    c.fillStyle = '#3b352e'; c.fillRect(x + 37, y + 7, 18, 4);
  }
  function stringBall(c, x, y) {
    PZ.shadow(c, x, y + 13, 18, 4, 0.18);
    dot(c, x, y, 14, '#e9dcc0');
    c.strokeStyle = '#cdbb98'; c.lineWidth = 1;
    for (const a of [-0.9, -0.3, 0.3, 0.9]) { c.beginPath(); c.ellipse(x, y, 13, 6, a, 0, 7); c.stroke(); }
    line(c, [[x + 12, y + 6], [x + 24, y + 12], [x + 34, y + 10]], '#e9dcc0', 1.4);
  }

  function post(S) {
    const r = S.r, books = S.opts && S.opts.where === 'books';
    // three weights from 3 to 9, never two that a single stamp pays
    let weights = PZ.shuffle(r, [3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
    if (weights.includes(3) && weights.includes(5)) weights = weights.map((w) => (w === 5 ? 8 + (weights.includes(8) ? 1 : 0) : w));
    if (new Set(weights).size < 3) weights = [4, 7, 9];
    const motifs = PZ.shuffle(r, MOTIF_IDS.slice()), motifOf = {};
    VALUES.forEach((v, i) => { motifOf[v] = motifs[i]; });
    const styles = PZ.shuffle(r, books ? ['stack', 'wrapped', 'bundle'] : ['paper', 'hatbox', 'tin']);
    const parcels = LANES.map((x, i) => {
      const st = STYLES[styles[i]], cols = PZ.shuffle(r, st.cols.slice());
      const p = { x, style: styles[i], w: st.w, h: st.h, col: cols[0], col2: cols[1], col3: cols[2], weight: weights[i], stamps: [], ages: [], paid: false, paidK: 0, shake: 0 };
      p.zone = zoneOf(p);
      p.rots = Array.from({ length: 9 }, () => (r() - 0.5) * 0.22);
      p.markRot = -0.3 + (r() - 0.5) * 0.2;
      return p;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    const padX = (v) => PADS_X[VALUES.indexOf(v)];
    const sum = (p) => p.stamps.reduce((a, b) => a + b, 0);
    // where the k-th stamp goes on a parcel: the top right first, as on a real parcel
    function slot(p, k) {
      const z = p.zone, cols = 3, rows = 3, kk = k % 9;
      const row = Math.floor(kk / cols), col = cols - 1 - (kk % cols);
      return [z.x0 + ((col + 0.5) * z.w) / cols, z.y0 + ((row + 0.5) * z.h) / rows, p.rots[kk]];
    }
    const zoneMid = (p) => [p.x, p.zone.y0 + p.zone.h / 2];
    function parcelAt(x, y) {
      return parcels.find((p) => Math.abs(x - p.x) < 58 && y > PLATE_Y - p.h - 30 && y < COUNTER_Y + 10) || null;
    }
    // the largest stamp that still fits
    const fits = (p) => { const rem = p.weight - sum(p); return VALUES.filter((v) => v <= rem).pop() || null; };

    let held = null, hint = null, hintT = 0, fx = null;
    const flights = [];

    function stick(p, v, snap) {
      p.stamps.push(v); p.ages.push(snap ? 1 : 0);
      if (sum(p) === p.weight) { p.paid = true; if (snap) p.paidK = 1; }
    }

    const sc = {
      puzzle: true, indoor: true, steps: parcels.length,
      crop: { x: 0, y: 86, w: 360, h: 360 }, // the parcels on their scales, the tags and the stamps
      decor(c) {
        const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(books ? 905 : 1114);
        // the wall
        c.fillStyle = books ? '#efe3cf' : '#f1e5cf'; c.fillRect(x0, y0, x1 - x0, COUNTER_Y - y0);
        if (books) {
          // a shelf of books along the wall, below the words at the top
          const sy = 104;
          c.fillStyle = '#8a6a4a'; c.fillRect(x0, sy - 58, x1 - x0, 60);
          c.fillStyle = '#6b4a32'; c.fillRect(x0, sy - 60, x1 - x0, 4);
          for (let bx = x0 + 2; bx < x1 - 4;) {
            const bw = 7 + rr() * 9, bh = 32 + rr() * 18;
            c.fillStyle = ['#c9474f', '#3d5a86', '#6f9a6a', '#d98b63', '#f2d88a', '#bba9df', '#a6d3d4'][Math.floor(rr() * 7)];
            c.fillRect(bx, sy - bh, bw - 1, bh);
            c.fillStyle = 'rgba(255,250,241,0.4)'; c.fillRect(bx + 1, sy - bh + 5, bw - 3, 2);
            bx += bw;
          }
          c.fillStyle = '#b98f5a'; c.fillRect(x0, sy, x1 - x0, 6); c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, sy + 6, x1 - x0, 3);
        } else {
          // tongue-and-groove boards below a wine-red rail, pigeonholes above
          c.fillStyle = '#e8d6b6'; c.fillRect(x0, 150, x1 - x0, COUNTER_Y - 150);
          c.fillStyle = 'rgba(150,110,65,0.2)'; for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) c.fillRect(x, 150, 1.4, COUNTER_Y - 150);
          c.fillStyle = '#9b3b44'; c.fillRect(x0, 144, x1 - x0, 7); c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x0, 144, x1 - x0, 1.5);
          for (const gx of [16, 270]) {
            c.fillStyle = 'rgba(60,40,20,0.15)'; c.fillRect(gx + 3, 49, 76, 64);
            c.fillStyle = '#b98f5a'; c.fillRect(gx, 46, 76, 64);
            for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
              const cx = gx + 4 + i * 24, cy = 50 + j * 30;
              c.fillStyle = '#6b4a32'; c.fillRect(cx, cy, 20, 26);
              if (rr() < 0.7) {
                const n = 1 + Math.floor(rr() * 2);
                for (let k = 0; k < n; k++) {
                  c.fillStyle = ['#fffaf1', '#f6e7c8', '#e7f0f4', '#f8e1de'][Math.floor(rr() * 4)];
                  c.save(); c.translate(cx + 10 + (k - 0.5) * 4, cy + 18); c.rotate((rr() - 0.5) * 0.3); c.fillRect(-8, -12, 16, 13); c.restore();
                }
              }
            }
          }
        }
        // the sign
        const sw = books ? 168 : 132;
        const gy = books ? 62 : 53; // a sign: hung in front of the books at the bookshop
        if (books) { line(c, [[124, 42], [116, gy + 2]], '#8a7a62', 1.4); line(c, [[236, 42], [244, gy + 2]], '#8a7a62', 1.4); dot(c, 124, 42, 2, '#6b6157'); dot(c, 236, 42, 2, '#6b6157'); }
        c.fillStyle = 'rgba(60,40,20,0.18)'; PZ.rr(c, 180 - sw / 2 + 2, gy + 3, sw, 32, 8); c.fill();
        c.fillStyle = books ? '#3d5a86' : '#9b3b44'; PZ.rr(c, 180 - sw / 2, gy, sw, 32, 8); c.fill();
        c.strokeStyle = '#f4ecdc'; c.lineWidth = 2; PZ.rr(c, 180 - sw / 2 + 4, gy + 4, sw - 8, 24, 6); c.stroke();
        PZ.text(c, books ? 'BOOKS BY POST' : 'PARCELS', 180, gy + 16.5, { size: 15, weight: 900, color: '#f4ecdc' });
        PZ.text(c, 'Stamps that add up to each weight', 180, 22, { size: 14, color: INK2, maxW: 340 });
        // the counter, and on it the scales with their parcels
        c.fillStyle = 'rgba(40,30,20,0.18)'; c.fillRect(x0, COUNTER_Y + 34, x1 - x0, 8);
        c.fillStyle = '#d4ae7b'; c.fillRect(x0, COUNTER_Y, x1 - x0, 10);
        c.fillStyle = 'rgba(255,240,210,0.4)'; c.fillRect(x0, COUNTER_Y, x1 - x0, 1.5);
        c.fillStyle = '#a77d4b'; c.fillRect(x0, COUNTER_Y + 10, x1 - x0, 26);
        c.strokeStyle = 'rgba(80,50,20,0.2)'; c.lineWidth = 0.8;
        for (let i = 0; i < 26; i++) { const gx = x0 + rr() * (x1 - x0), gy = COUNTER_Y + 13 + rr() * 20; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + 14 + rr() * 30, gy); c.stroke(); }
        for (const p of parcels) { scaleBody(c, p.x, p.weight, books); drawParcel(c, p); }
        // the floor of the office below: the stamp sheet lies on a desk
        c.fillStyle = '#c9a372'; c.fillRect(x0, COUNTER_Y + 36, x1 - x0, y1 - COUNTER_Y - 36);
        c.strokeStyle = 'rgba(110,70,35,0.16)'; c.lineWidth = 0.8;
        for (let i = 0; i < 60; i++) { const gx = x0 + rr() * (x1 - x0), gy = COUNTER_Y + 40 + rr() * (y1 - COUNTER_Y - 40); c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + 12 + rr() * 34, gy + (rr() - 0.5)); c.stroke(); }
        // the sheet of stamps
        const sy0 = 368, sy1 = 520;
        c.fillStyle = 'rgba(60,40,20,0.18)'; PZ.rr(c, 17, sy0 + 4, 330, sy1 - sy0, 6); c.fill();
        c.fillStyle = '#fbf5e8'; PZ.rr(c, 14, sy0, 332, sy1 - sy0, 6); c.fill();
        c.strokeStyle = 'rgba(160,140,110,0.5)'; c.lineWidth = 1.2; c.setLineDash([2, 4]); PZ.rr(c, 22, sy0 + 8, 316, sy1 - sy0 - 16, 4); c.stroke(); c.setLineDash([]);
        PZ.text(c, 'STAMPS', 180, sy0 + 18, { size: 11, weight: 900, color: INK2 });
        for (const v of VALUES) {
          const x = padX(v);
          // a little pad of them: never runs out
          blank(c, x - 3, PAD_Y + 5, BIG, -0.07);
          blank(c, x + 3, PAD_Y + 2, BIG, 0.05);
          drawStamp(c, v, motifOf[v], x, PAD_Y, BIG, 0);
        }
        PZ.text(c, 'As many of each as you like', 180, sy1 - 14, { size: 12, weight: 700, color: INK2 });
        inkPad(c, 54, 552); stringBall(c, 300, 548);
      },
      draw(c, t, still) {
        if (hint && hintT > 0 && !still && !hint.p.paid) {
          PZ.glow(c, padX(hint.v), PAD_Y, 44, t);
          const [hx, hy] = zoneMid(hint.p);
          PZ.glow(c, hx, hy, 50, t);
        }
        for (const p of parcels) {
          // the stamps stuck on, each pressed down as it lands
          p.stamps.forEach((v, k) => {
            const [sx, sy, rot] = slot(p, k), a = Math.min(1, p.ages[k] / 0.18);
            drawStamp(c, v, motifOf[v], sx, sy, SMALL * (1 + 0.45 * (1 - a)), rot);
          });
          // a wobble of the scale's needle when a stamp would have been too much
          const wob = Math.sin(t * 26) * p.shake * 0.16;
          const a = A0 + (p.weight / 10) * SWEEP + wob;
          line(c, [[p.x, DIAL_Y], [p.x + Math.cos(a) * (DIAL_R - 4), DIAL_Y + Math.sin(a) * (DIAL_R - 4)]], INK, 2);
          dot(c, p.x, DIAL_Y, 3, INK); dot(c, p.x, DIAL_Y, 1.2, '#d9b44a');
          // the PAID postmark
          if (p.paid) {
            const k = still ? 1 : Math.min(1, p.paidK), s = 1 + 0.5 * (1 - k);
            // low on the left, so the stamps' numbers still show; its waves run across them
            c.save(); c.translate(p.zone.x0 + 22, p.zone.y0 + p.zone.h * 0.64); c.rotate(p.markRot); c.scale(s, s); c.globalAlpha = 0.85 * k;
            const ink = '#7a2f4a';
            c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, 19, 0, 7); c.stroke();
            c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 15.5, 0, 7); c.stroke();
            PZ.text(c, 'PAID', 0, 0.5, { size: 11, weight: 900, color: ink });
            c.lineWidth = 2;
            for (const dy of [-7, 0, 7]) { c.beginPath(); c.moveTo(22, dy); for (let i = 1; i <= 4; i++) c.quadraticCurveTo(22 + i * 8 - 4, dy + (i % 2 ? -3 : 3), 22 + i * 8, dy); c.stroke(); }
            c.restore(); c.globalAlpha = 1;
          }
          // the tag under the scale: the sum so far and what it needs to be
          const tx = p.x, ty = TAG_Y, n = p.stamps.length, s0 = sum(p);
          line(c, [[tx, COUNTER_Y + 12], [tx, ty + 5]], '#8a7a62', 1.2);
          c.fillStyle = 'rgba(60,40,20,0.16)'; PZ.rr(c, tx - 48, ty + 3, 98, 40, 7); c.fill();
          c.fillStyle = p.paid ? '#eef5e6' : PAPER; PZ.rr(c, tx - 50, ty, 98, 40, 7); c.fill();
          c.strokeStyle = p.paid ? '#6f9a6a' : 'rgba(150,130,100,0.6)'; c.lineWidth = 1.4; c.stroke();
          dot(c, tx, ty + 5, 2.4, '#c9b48a');
          const expr = n === 0 ? 'no stamps yet' : n <= 4 ? p.stamps.join(' + ') : `${n} stamps`;
          PZ.text(c, expr, tx - 1, ty + 14, { size: 12, weight: 800, color: INK2, maxW: 88 });
          PZ.text(c, `= ${s0} of ${p.weight}`, tx - (p.paid ? 7 : 1), ty + 30, { size: 15, weight: 900, color: p.paid ? '#4c7a47' : INK });
          if (p.paid) line(c, [[tx + 28, ty + 30], [tx + 32, ty + 34], [tx + 40, ty + 25]], '#6f9a6a', 3);
        }
        if (still) return;
        for (const f of flights) drawStamp(c, f.v, motifOf[f.v], f.x, f.y, BIG, 0, true);
        if (held) drawStamp(c, held.v, motifOf[held.v], held.x, held.y, BIG * 1.06, -0.04, true);
      },
      step(dt) {
        hintT -= dt;
        if (held) { held.x = PZ.approach(held.x, held.tx, dt, 22); held.y = PZ.approach(held.y, held.ty, dt, 22); }
        for (let i = flights.length - 1; i >= 0; i--) {
          const f = flights[i]; f.x = PZ.approach(f.x, f.tx, dt, 12); f.y = PZ.approach(f.y, f.ty, dt, 12);
          if (PZ.dist(f.x, f.y, f.tx, f.ty) < 2) flights.splice(i, 1);
        }
        for (const p of parcels) {
          for (let k = 0; k < p.ages.length; k++) p.ages[k] += dt;
          if (p.paid) p.paidK = Math.min(1, p.paidK + dt * 4);
          p.shake = Math.max(0, p.shake - dt * 1.6);
        }
      },
      down(x, y) {
        if (held) return;
        const v = VALUES.find((u) => Math.abs(x - padX(u)) < 40 && Math.abs(y - PAD_Y) < 48);
        if (!v) return;
        held = { v, x: padX(v), y: PAD_Y, tx: x, ty: y - PZ.LIFT };
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x; held.ty = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const v = held.v, dx = x, dy = y - PZ.LIFT; // judged where it is drawn
        held = null;
        const p = parcelAt(dx, dy);
        if (p && !p.paid && sum(p) + v <= p.weight) {
          stick(p, v, false);
          fx.sound('drop');
          if (p.paid) { fx.sound('chime'); fx.good(...zoneMid(p)); if (hint && hint.p === p) hintT = 0; }
          return;
        }
        // too much for this parcel (or it is already paid): the stamp glides back to its pad
        if (p && !p.paid) p.shake = 1;
        flights.push({ v, x: dx, y: dy, tx: padX(v), ty: PAD_Y });
        fx.sound(p || dy < 360 ? 'nope' : 'drop'); // put back on the sheet is not a wrong move
      },
      cancel() { if (held) { flights.push({ v: held.v, x: held.x, y: held.y, tx: padX(held.v), ty: PAD_Y }); held = null; } },
      progress: () => parcels.reduce((n, p) => n + sum(p), 0) / total,
      solved: () => parcels.every((p) => p.paid),
      hint() {
        const p = parcels.find((q) => !q.paid);
        hint = p ? { p, v: fits(p) } : null; hintT = 3.5;
      },
      save: () => ({ stamps: parcels.map((p) => p.stamps.slice()) }),
      load(s) {
        if (!s || !Array.isArray(s.stamps)) return;
        s.stamps.forEach((list, i) => {
          const p = parcels[i];
          if (!p || !Array.isArray(list)) return;
          for (const v of list) if (VALUES.includes(v) && !p.paid && sum(p) + v <= p.weight) stick(p, v, true);
        });
      },
      solveAll() { for (const p of parcels) while (!p.paid) stick(p, fits(p), true); },
      // finger positions: pick up at a pad, let go PZ.LIFT below the parcel
      debugPlan() {
        const plan = [];
        for (const p of parcels) {
          let rem = p.weight - sum(p);
          const [px, py] = zoneMid(p);
          while (rem > 0) { const v = VALUES.filter((u) => u <= rem).pop(); plan.push({ drag: [padX(v), PAD_Y, px, py + PZ.LIFT] }); rem -= v; }
        }
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { post });
})();
