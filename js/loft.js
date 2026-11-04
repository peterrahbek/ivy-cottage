'use strict';
// The Painter's Loft, drawn as SVG the same way as the cottage (house.js), the
// bead shop and the curiosity shop. An old hay barn with a studio up under its
// roof: white weatherboards, ochre tiles and cobalt trim, a big skylight in the
// roof and a wide studio window with the room behind it: the easel and its
// canvas, a rack of frames, a table of brushes and a shelf of mixed colours.
// Wooden stairs climb the outside to the loft door under its little gable. In
// the yard a long wall waits for a mural, poppies grow at its foot and a swing
// seat hangs in its frame. Each restorable part has a tired look and a restored
// look; the door, the sign and the swing seat take the colours chosen while
// painting; the canvas and the mural show what was painted (js/paintings.js).
// Every id carries an 'l' prefix (plus opts.uid when given) so this picture can
// share a page with the others.

const LOFT = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a seasonal
  // job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the id suffix,
  // whether the loft is still for sale, how far along it is, what was painted
  // and the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false, PAINTED = {};
  const id = (n) => `l${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const text = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${col}"${more}>${s}</text>`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILL = {
    spring: ['#bcd9a0', '#a6cc88', '#92bd75'], summer: ['#b0d28a', '#97c074', '#82ae60'],
    autumn: ['#e0c686', '#d2ae6c', '#bd9558'], winter: ['#e8eff4', '#dde6ee', '#d2dde7'],
  };
  // the old apple tree behind the stairs
  const TREE = {
    spring: ['#b5d595', '#fbf6f0', '#f6dfe6'], summer: ['#5f9a4c', '#6aa858', '#4f8a3c'],
    autumn: ['#d9822b', '#e2a33c', '#c9692f'], winter: null,
  };
  const COBBLE = { spring: ['#cdbfa6', '#bdb096'], summer: ['#d3c5a8', '#c3b598'], autumn: ['#bdb098', '#ad9f86'], winter: ['#d4d9de', '#c4cbd2'] };

  // ---------------------------------------------------------------- shapes
  const ROOF_D = 'M8 208 L66 128 H298 L356 208Z';
  const GABLE_D = 'M218 210 L272 134 L326 210Z';
  // the skylight, set into the slope of the roof
  const SKYL_D = 'M94 198 H170.5 L173 148 H113Z';
  // the big studio window, its bars and what stands behind them
  const WIN = { x0: 34, x1: 214, y0: 222, y1: 326 };
  const BARX = [88, 160], BARY = 280;
  // the canvas on the easel, in the top pane of the middle of the window
  const CANV = { x: 98, y: 225, w: 52, h: 52 };
  // the loft door at the top of the stairs, and the sign over it
  const DOOR = { x0: 254, x1: 288, y0: 250, y1: 338 };
  const SIGNB = { x: 232, y: 213, w: 80, h: 25 };
  // the long wall in the yard, and the part of it that takes the mural
  const WALL = { y0: 344, y1: 458, x1: 232 };
  const MURAL = { x: 33, y: 354, w: 180, h: 102 };
  // the treads of the outside stairs, from the landing down to the yard
  const STEPS = Array.from({ length: 9 }, (_, i) => ({ x: 304 + i * 8.2, y: 349 + i * 12.1 }));
  // the handrail runs this far above the treads
  const railAt = (i) => [STEPS[0].x + 6 + i * 8.2, STEPS[0].y - 25 + i * 12.1];
  // everything is drawn this much lower than its coordinates, so the yard in
  // front stays a narrow strip and the sky fills in above
  const DY = 22;

  // little css of our own: poppies in the breeze, the swing seat, a sleeping
  // cat, a hopping sparrow, butterflies, a wind sculpture, bunting, the vane
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .pl-sway{animation:plsway 4.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      #scene .pl-sway:nth-of-type(2n){animation-delay:-1.9s}
      @keyframes plsway{from{transform:rotate(-1.6deg)}to{transform:rotate(2deg)}}
      #scene .pl-swing{animation:plswing 5.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes plswing{from{transform:rotate(-0.8deg)}to{transform:rotate(0.8deg)}}
      #scene .pl-breathe{animation:plbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes plbreathe{50%{transform:scaleY(1.07)}}
      #scene .pl-hop{animation:plhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes plhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .pl-flit{animation:plflit 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes plflit{0%{transform:translate(0,0)}35%{transform:translate(6px,-5px)}70%{transform:translate(-4px,-8px)}100%{transform:translate(3px,2px)}}
      #scene .pl-wing{animation:plwing .32s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes plwing{to{transform:scaleX(.3)}}
      #scene .pl-spin{animation:plspin 9s linear infinite;transform-box:fill-box;transform-origin:center}
      @keyframes plspin{to{transform:rotate(360deg)}}
      #scene .pl-flag{animation:plflag 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      #scene .pl-flag:nth-of-type(2n){animation-delay:-1.5s}
      @keyframes plflag{from{transform:skewX(-5deg)}to{transform:skewX(6deg)}}
      #scene .pl-vane{animation:plvane 11s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}
      @keyframes plvane{from{transform:scaleX(1)}45%{transform:scaleX(1)}55%{transform:scaleX(-1)}to{transform:scaleX(-1)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      board: U.mix('#f6f2e8', '#b9b2a2', k * 1.4),
      trim: U.mix('#3a5fae', '#7f8795', k * 1.5),
      ochre: U.mix('#e8c67a', '#a89f8c', k * 1.2),
      stone: U.mix('#e6dcc6', '#b3aa9a', k),
      sash: U.mix('#fbf7ee', '#b8b1a2', k * 1.4),
      brick: U.mix('#b5674c', '#8f857a', k * 1.2),
      timber: U.mix('#8a6240', '#7a7266', k * 1.4),
    };
  }

  function defs() {
    const cb = COBBLE[SEASON], k = (1 - PCT) * 0.35;
    const board = (base, old) => `<rect width="44" height="11" fill="${base}"/><rect y="9.6" width="44" height="1.4" fill="${U.shade(base, -0.14)}"/><rect y="0" width="44" height="1" fill="#fff" opacity="0.45"/>
        <path d="M31 0 V9.6" stroke="${U.shade(base, -0.1)}" stroke-width="0.6"/><path d="M6 3.4 q5 -0.8 11 0 M24 6.6 q6 0.7 12 -0.3" stroke="${U.shade(base, -0.07)}" stroke-width="0.5" fill="none"/>
        ${old ? `<path d="M12 9 q2 -3 6 -2 q3 2 7 1 v2 h-13Z" fill="#8f8a78" opacity="0.5"/><circle cx="38" cy="4" r="1.4" fill="#8f8a78" opacity="0.5"/>` : ''}`;
    const tile = (base, moss) => `<rect width="18" height="12" fill="${U.shade(base, -0.2)}"/>
        <path d="M0 11 Q0 1.6 4.5 1.4 Q9 1.6 9 11Z" fill="${base}"/><path d="M9 11 Q9 1.6 13.5 1.4 Q18 1.6 18 11Z" fill="${U.shade(base, 0.05)}"/>
        <path d="M2.4 9.6 Q2.4 3.4 4.5 3" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.22"/><path d="M11.4 9.6 Q11.4 3.4 13.5 3" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.22"/>
        ${moss ? '<circle cx="4" cy="9" r="2.8" fill="#6f8a3e" opacity="0.75"/><circle cx="14" cy="5" r="2.2" fill="#748f42" opacity="0.6"/>' : ''}`;
    const tile0 = U.mix('#cf9a52', '#99917c', k * 1.2), tile1 = U.mix(tile0, '#8f8a78', 0.4);
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#e2cdb2'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const b = K.brick, ob = U.mix(b, '#8a8476', 0.45);
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7ab98"/><stop offset="0.7" stop-color="#8f9478"/><stop offset="1" stop-color="#7a7f60"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('SkyGlass')}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#cfe6f2"/><stop offset="0.5" stop-color="#9fcbe8"/><stop offset="1" stop-color="#e8f4fa"/></linearGradient>
      <pattern id="${id('Tile')}" width="18" height="12" patternUnits="userSpaceOnUse">${tile(tile0, false)}</pattern>
      <pattern id="${id('TileOld')}" width="18" height="12" patternUnits="userSpaceOnUse">${tile(tile1, true)}</pattern>
      <pattern id="${id('Board')}" width="44" height="11" patternUnits="userSpaceOnUse">${board(K.board, false)}</pattern>
      <pattern id="${id('BoardOld')}" width="44" height="11" patternUnits="userSpaceOnUse">${board(U.mix(K.board, '#a69f90', 0.3), true)}</pattern>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
      <pattern id="${id('Lines')}" width="24" height="12" patternUnits="userSpaceOnUse"><path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="#5a4a3a" stroke-width="0.7" opacity="0.5"/></pattern>
      <pattern id="${id('Moss')}" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8d9466"/>
        <circle cx="4" cy="5" r="3" fill="#6f8a3e"/><circle cx="12" cy="11" r="3.5" fill="#748f42"/><circle cx="11" cy="3" r="1.5" fill="#a5a86c"/>
      </pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <pattern id="${id('Cobble')}" width="24" height="16" patternUnits="userSpaceOnUse">
        <rect width="24" height="16" fill="${U.shade(cb[1], -0.08)}"/>
        <rect x="1" y="1" width="10" height="6.4" rx="3" fill="${cb[0]}"/><rect x="13" y="1" width="10" height="6.4" rx="3" fill="${cb[1]}"/>
        <rect x="-5" y="9" width="10" height="6.4" rx="3" fill="${cb[1]}"/><rect x="7" y="9" width="10" height="6.4" rx="3" fill="${U.shade(cb[0], 0.04)}"/><rect x="19" y="9" width="10" height="6.4" rx="3" fill="${cb[1]}"/>
        <rect x="2.6" y="1.8" width="4.6" height="1.2" rx="0.6" fill="#fff" opacity="0.16"/><rect x="8.6" y="9.8" width="4.6" height="1.2" rx="0.6" fill="#fff" opacity="0.16"/>
      </pattern>
      <clipPath id="${id('Win')}"><rect x="${WIN.x0}" y="${WIN.y0}" width="${WIN.x1 - WIN.x0}" height="${WIN.y1 - WIN.y0}"/></clipPath>
      <clipPath id="${id('Roof')}"><path d="${ROOF_D}"/></clipPath>
      <clipPath id="${id('SkyL')}"><path d="${SKYL_D}"/></clipPath>
      <clipPath id="${id('Mural')}"><rect x="${MURAL.x}" y="${MURAL.y}" width="${MURAL.w}" height="${MURAL.h}"/></clipPath>
    </defs>`;
  }

  // ------------------------------------------------------- sky and fields
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect y="${-DY - 4}" width="400" height="${364 + DY}" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="350" cy="62" r="46" fill="${url('Sun')}"/><circle cx="350" cy="62" r="17" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="64" cy="74" rx="25" ry="10"/><ellipse cx="83" cy="67" rx="17" ry="12"/><ellipse cx="101" cy="75" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="216" cy="98" rx="19" ry="7"/><ellipse cx="231" cy="93" rx="13" ry="9"/><ellipse cx="245" cy="99" rx="14" ry="6"/></g>`;
  }
  // rolling fields beyond the yard, a hedge and a far line of poplars
  function far() {
    const h = HILL[SEASON];
    let s = `<path d="M-6 236 Q50 214 120 228 T260 222 T410 232 V346 H-6Z" fill="${h[0]}"/>
      <path d="M-6 268 Q90 246 210 262 T410 256 V370 H-6Z" fill="${h[1]}"/><path d="M-6 306 Q120 284 240 300 T410 292 V440 H-6Z" fill="${h[2]}"/>`;
    // a hedge line across the middle field, and the stubble rows nearer
    const hedge = winter() ? '#c3ccd4' : SEASON === 'autumn' ? '#a8834e' : '#6f9a5a';
    for (let x = 340; x < 410; x += 9) s += oval(x, 268 - (x - 340) * 0.08, 6, 3.6, hedge);
    if (!winter()) for (let i = 0; i < 4; i++) s += line(`M${346 + i * 5} 298 Q${360 + i * 8} 322 ${372 + i * 13} 346`, U.shade(h[2], -0.1), 0.8, 0.6);
    // poplars on the skyline
    const pop = winter() ? '#c9d2da' : SEASON === 'autumn' ? '#d9a24a' : '#7fa86a';
    for (const [x, hh] of [[352, 30], [362, 24], [371, 34], [392, 26]]) s += `<path d="M${x} ${258 - hh} Q${x - 5} ${258 - hh * 0.4} ${x - 2} 258 H${x + 2} Q${x + 5} ${258 - hh * 0.4} ${x} ${258 - hh}Z" fill="${pop}" opacity="0.8"/>`;
    return s;
  }
  // an old apple tree behind the stairs
  function tree() {
    let s = line('M372 432 V312 M372 340 l-22 -22 M372 326 l20 -24 M372 312 l-4 -22', '#6b5240', 5) + line('M372 372 l14 -14', '#6b5240', 3);
    const T = TREE[SEASON];
    if (!T) return s + line('M350 318 l-9 -8 M392 302 l7 -7 M368 290 l-3 -9', '#6b5240', 1.8) + line('M350 317 l-9 -8 M372 339 l-21 -21 M373 325 l19 -23', SNOW, 1.4);
    const r = U.rng(171);
    for (const [x, y, rr] of [[372, 288, 28], [346, 302, 20], [398, 298, 22], [358, 272, 18], [388, 268, 18]]) s += dot(x, y, rr, T[0]);
    for (let i = 0; i < 34; i++) s += dot(338 + r() * 64, 256 + r() * 58, 2 + r() * 2.6, U.pick(r, T));
    if (SEASON === 'summer' || SEASON === 'autumn') for (const [x, y] of [[352, 306], [376, 298], [392, 310], [364, 282], [344, 288]]) s += dot(x, y, 2.6, SEASON === 'summer' ? '#c9cf5a' : '#d9503c');
    return s;
  }

  // ---------------------------------------------------------------- the barn
  function chimney() {
    let s = `${box(84, 96, 18, 44, url('Brick'))}${box(81.6, 92, 22.8, 5, K.stone, ' rx="1"')}${box(88, 82, 5, 11, '#b5694a')}${box(95, 84, 5, 9, '#a8604a')}`;
    if (winter()) s += box(81.6, 90.4, 22.8, 2.6, SNOW, ' rx="1.3"');
    if (PCT > 0.5) s += '<g class="smoke" fill="#ffffff"><circle cx="90" cy="76" r="4" opacity="0.7"/><circle cx="94" cy="66" r="5.6" opacity="0.5"/><circle cx="91" cy="52" r="7" opacity="0.3"/></g>';
    return s;
  }
  function roof() {
    const tile = url(PCT > 0.35 ? 'Tile' : 'TileOld');
    let s = `<path d="${ROOF_D}" fill="${tile}"/>${box(0, 124, 400, 20, url('Shade'), ` clip-path="${url('Roof')}" opacity="0.5"`)}`;
    s += `${line('M66 128 H298', U.mix('#a8743f', '#8a8476', (1 - PCT) * 0.4), 4.4)}${line('M66 126.6 H298', '#fff', 0.8, 0.2)}`;
    s += line('M8 208 L66 128 M298 128 L356 208', K.sash, 2.6);
    if (PCT < 0.4) {
      // slipped and missing tiles
      s += `<path d="M34 196 l14 -2 l4 10 l-16 2Z" fill="#5a5a50" opacity="0.7"/><path d="M196 164 l12 -1 l2 8 l-14 1Z" fill="#5a5a50" opacity="0.65"/><path d="M304 184 l10 0 l3 8 l-12 0Z" fill="#5a5a50" opacity="0.7"/>`;
    }
    if (winter()) s += `<path d="${ROOF_D}" fill="${url('Snow')}" opacity="0.88"/><path d="M64 127 H300" stroke="${SNOW}" stroke-width="3.6" stroke-linecap="round"/>`;
    return s + box(4, 206, 356, 4, U.shade(K.sash, -0.2), ' rx="1.4"');
  }
  // the skylight in the roof: sky in the glass once it is clean
  function skylight(st) {
    const p = pend(st, 'skylight'), ok = st.skylight, fr = ok ? K.trim : U.mix(K.trim, '#8a877c', 0.45);
    let s = `<g data-part="skylight"><path d="M90 201 H174.6 L177 145 H110Z" fill="${U.shade(fr, -0.18)}"/><path d="${SKYL_D}" fill="${url('SkyGlass')}"/>`;
    s += `<g clip-path="${url('SkyL')}">`;
    if (ok) s += `<path d="M104 198 L128 148 H142 L118 198Z M136 198 L156 148 H163 L143 198Z" fill="#fff" opacity="0.3"/>${oval(150, 164, 14, 4, '#fff', 0.55)}${oval(136, 168, 10, 3, '#fff', 0.45)}`;
    if (!ok) {
      s += `<path d="${SKYL_D}" fill="${url('Grime')}" opacity="0.8"/>`;
      s += `${oval(116, 192, 13, 5, '#6f8a3e', 0.75)}${oval(146, 195, 16, 4, '#748f42', 0.7)}${oval(162, 188, 8, 5, '#8d9466', 0.7)}`;
      s += line('M124 148 l6 14 l-7 10 l4 12', '#eef0e8', 0.8, 0.8);
    } else if (p === 'frost') {
      s += `<path d="${SKYL_D}" fill="${url('Frost')}" opacity="0.88"/>${line('M100 196 q8 -14 4 -24 M112 196 q4 -12 14 -16 M166 196 q-8 -12 -2 -26', '#fff', 1.2)}`;
    } else if (p === 'grow') {
      s += `<path d="${SKYL_D}" fill="${url('Dusty')}" opacity="0.6"/>`;
    }
    if (p === 'leaves') s += oval(120, 194, 3.4, 1.6, '#d9822b') + oval(150, 192, 3, 1.4, '#c4462f');
    s += '</g>';
    s += `<path d="${SKYL_D}" fill="none" stroke="${K.sash}" stroke-width="2"/>${line('M132.4 198 L143 148 M93.8 173 H172', K.sash, 1.5)}`;
    s += line('M90 201 H174.6', K.sash, 2.4, 0.9);
    if (winter() || p === 'snow') s += `<path d="M90 200 Q132 192 174 200 L174 203 H90Z" fill="${SNOW}"/>${oval(112, 147, 6, 1.6, SNOW)}${oval(166, 147, 7, 1.6, SNOW)}`;
    return s + '</g>';
  }
  // the little gable over the loft door, with the old hay hoist still in its peak
  function gable() {
    let s = `<path d="${GABLE_D}" fill="${url(PCT > 0.4 ? 'Board' : 'BoardOld')}"/>`;
    s += `${box(266, 150, 12, 8, K.timber, ' rx="1"')}${line('M272 158 V170', '#a89a80', 0.9)}${dot(272, 171.6, 2.2, '#5a5a5e')}${dot(272, 171.6, 0.9, '#c9c3b6')}${line('M272 174 V196', '#a89a80', 0.9)}${line('M268 196 h8', '#6b6b70', 1.4)}`;
    const barge = PCT > 0.4 ? K.trim : U.mix(K.trim, '#8a877c', 0.45);
    s += `${line('M212 214 L272 127 L332 214', barge, 5)}${line('M212 214 L272 127 L332 214', K.sash, 1.2, 0.85)}`;
    if (winter()) s += line('M214 208 L272 125 L330 208', SNOW, 3.4);
    return s;
  }
  // the white boards upstairs, a stout beam, and the ochre limewash below
  function walls() {
    let s = `${box(22, 208, 320, 128, url(PCT > 0.4 ? 'Board' : 'BoardOld'))}${box(22, 208, 320, 5, '#000', ' opacity="0.12"')}`;
    s += `${box(22, 208, 5, 128, K.sash)}${box(337, 208, 5, 128, K.sash)}`;
    const lime = PCT > 0.4 ? K.ochre : U.mix(K.ochre, '#a89f8c', 0.35);
    s += box(22, 336, 320, 96, lime);
    const r = U.rng(177);
    for (let i = 0; i < 14; i++) s += oval(250 + r() * 90, 348 + r() * 80, 5 + r() * 12, 2.4 + r() * 5, U.shade(lime, -0.05 - r() * 0.05), 0.5);
    if (PCT < 0.5) s += `${oval(320, 372, 14, 9, K.brick, 0.75)}${oval(268, 410, 10, 6, K.brick, 0.65)}${line('M300 346 l-5 12 l4 8', '#7d6a5e', 0.8, 0.8)}`;
    // the beam between the floors, and the old doors of the barn, shut now
    s += `${box(18, 334, 328, 6, K.timber)}${box(18, 334, 328, 1.2, '#fff', ' opacity="0.14"')}`;
    const oak = PCT > 0.4 ? '#a8824f' : '#8a7a62', dk = U.shade(oak, -0.24);
    s += `${box(254, 356, 74, 76, U.shade(lime, -0.28))}${box(257, 359, 33.4, 73, oak)}${box(291.6, 359, 33.4, 73, oak)}`;
    for (const x of [263, 269, 275, 281, 298, 304, 310, 316]) s += line(`M${x} 360 V431`, dk, 0.6, 0.7);
    s += line('M258 366 H290 M258 422 H290 M292 366 H324 M292 422 H324', dk, 1.5) + line('M258 422 L290 366 M292 366 L324 422', dk, 1.2, 0.8);
    s += `<rect x="288" y="392" width="6" height="2.4" rx="1" fill="#4a4a4e"/>${line('M290 396 a3 3 0 0 0 4 0', '#4a4a4e', 0.9)}`;
    return s;
  }
  // a little palette for the sign
  const paletteIcon = (x, y, col, dabs) => `<g transform="translate(${x} ${y})"><path d="M-7 0.4 Q-7 -6 0 -6 Q7.4 -6 7.4 -0.8 Q7.4 1.8 4.2 1.6 Q1.6 1.4 1.6 3.4 Q1.6 5.8 -1.2 5.8 Q-7 5.8 -7 0.4Z" fill="${col}"/>${dot(-3.8, -1.8, 1.2, dabs[0])}${dot(-0.4, -3.6, 1.2, dabs[1])}${dot(3.2, -2.8, 1.2, dabs[2])}${dot(-3.6, 2.4, 1.2, dabs[3])}</g>`;
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = ok ? C.loftSign : U.mix(C.loftSign, '#a59e90', 0.62), tx = ok ? '#fffaf0' : '#d9d2c4';
    const { x, y, w, h } = SIGNB;
    let s = `<g data-part="sign">${box(x + 1.4, y + 1.8, w, h, '#000', ' opacity="0.14" rx="1.6"')}${box(x, y, w, h, col, ' rx="1.6"')}${box(x, y, w, 1.4, '#fff', ' opacity="0.2" rx="0.7"')}<rect x="${x + 2.4}" y="${y + 2.4}" width="${w - 4.8}" height="${h - 4.8}" rx="1" fill="none" stroke="${tx}" stroke-width="0.6" opacity="0.75"/>`;
    s += paletteIcon(x + 11.6, y + 12.4, ok ? '#fffaf0' : '#d9d2c4', ok ? ['#3a5fae', '#e2574c', '#e9bf4f', '#5fae6e'] : ['#a59e90', '#a59e90', '#a59e90', '#a59e90']);
    s += `<text x="${x + 49}" y="${y + 13}" text-anchor="middle" font-family="${SERIF}" font-size="9" font-weight="700" letter-spacing="0.6" fill="${tx}"${ok ? '' : ' opacity="0.6"'}>${ok ? 'THE LOFT' : 'THE L FT'}</text>`;
    s += `<text x="${x + 49}" y="${y + 20}" text-anchor="middle" font-family="${FONT}" font-size="4.2" font-weight="900" letter-spacing="1" fill="${tx}"${ok ? '' : ' opacity="0.45"'}>· STUDIO ·</text>`;
    if (!ok) s += `${oval(x + 22, y + 7, 6, 2.4, '#b5a68a', 0.85)}${oval(x + 62, y + 18, 7, 2.2, '#b5a68a', 0.8)}${line(`M${x + 50} ${y} l-3 9 l2 8`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5" rx="1.6"');
    else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.5" rx="1.6"');
    else if (p === 'leaves') s += oval(x + 14, y + 1, 3.4, 1.5, '#d9822b') + oval(x + 60, y + 0.6, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += box(x - 1, y - 1.6, w + 2, 2.4, SNOW, ' rx="1.2"');
    return s + '</g>';
  }

  // ------------------------------------------------------------- the studio
  // paint-spotted boards; clean but for a few splashes once it is restored
  function floorIn(st) {
    const p = pend(st, 'floor');
    const y = 308, h = WIN.y1 - y, wood = st.floor ? '#d0aa78' : '#a0917a';
    let s = `<g data-part="floor">${box(WIN.x0, y, 180, h, wood)}`;
    for (let i = -9; i <= 9; i++) s += line(`M${f1(124 + i * 9)} ${y} L${f1(124 + i * 14)} ${WIN.y1}`, st.floor ? '#a9825a' : '#83765f', 0.7, 0.8);
    s += line(`M34 ${y + 6} H214 M34 ${y + 12} H214`, st.floor ? '#b8946a' : '#8a7d66', 0.4, 0.5);
    const blot = (x, yy, rx, c, op = 0.85) => oval(x, yy, rx, rx * 0.42, c, op);
    if (st.floor) s += blot(70, 322, 4, '#3a5fae', 0.55) + blot(176, 316, 3.4, '#e9bf4f', 0.6) + blot(124, 320, 3, '#e2574c', 0.5);
    else {
      s += box(WIN.x0, y, 180, h, url('Dusty'), ' opacity="0.5"');
      for (const [x, yy, rx, c] of [[60, 318, 7, '#3a5fae'], [96, 314, 5, '#e2574c'], [132, 322, 8, '#e9bf4f'], [170, 316, 6, '#5fae6e'], [196, 322, 7, '#3a5fae'], [46, 322, 4, '#e2574c'], [150, 312, 4, '#f6efe0']]) s += blot(x, yy, rx, c, 0.75);
      s += `<g transform="rotate(-14 120 318)">${box(112, 316, 16, 2.4, '#8a7a62')}</g>`;
    }
    if (p === 'grow') for (const [x, yy, rx, c] of [[64, 316, 5, '#e2574c'], [112, 322, 6, '#3a5fae'], [184, 320, 5, '#e9bf4f'], [146, 314, 3.4, '#5fae6e']]) s += blot(x, yy, rx, c, 0.8);
    else if (p === 'leaves') s += oval(46, 320, 3, 1.4, '#d9822b') + oval(58, 324, 2.6, 1.3, '#c4462f');
    else if (p === 'snow' || p === 'frost') for (const [x, yy] of [[60, 322], [74, 318], [88, 322], [102, 318]]) s += oval(x, yy, 2.6, 1.3, '#5a4a3a', 0.4);
    return s + '</g>';
  }
  // a rack of frames at the left of the room, and two small ones on the wall
  function frames(st) {
    const p = pend(st, 'frames'), ok = st.frames, dull = !ok;
    const wood = ok ? '#a8743f' : '#7d7264', gilt = ok ? '#d9a93a' : '#8f8a78', pale = ok ? '#f6f1e6' : '#c3bba9';
    let s = `<g data-part="frames">`;
    // on the wall, top left
    const hung = (x, y, w, h, c, art) => `${box(x + 1, y + 1.4, w, h, '#000', ' opacity="0.14"')}${box(x, y, w, h, c)}${box(x + 2.4, y + 2.4, w - 4.8, h - 4.8, dull ? '#a8a292' : pale)}${dull ? '' : art}`;
    s += hung(40, 232, 22, 17, gilt, `${box(42.4, 240, 17.2, 7, '#a6c88a')}${dot(55, 238, 2, '#e9bf4f')}`);
    s += hung(66, 228, 16, 21, wood, `${oval(74, 238, 4, 5, '#3a5fae')}${box(73, 240, 2, 6, '#3a5fae')}`);
    s += hung(46, 254, 30, 19, wood, `${box(48.4, 256.4, 25.2, 7, '#bfe0ef')}${box(48.4, 263, 25.2, 7.6, '#e8c67a')}`);
    // the rack: a low stand of slats with frames stood up in it, leaning a little
    s += `${box(38, 318, 48, 4, wood)}${box(38, 296, 3, 26, U.shade(wood, -0.15))}${box(83, 296, 3, 26, U.shade(wood, -0.15))}${box(38, 298, 48, 2, U.shade(wood, -0.1))}`;
    const leaning = [[44, 24, 30, gilt, -5], [52, 26, 34, wood, -3], [60, 24, 28, '#3a5fae', -2], [68, 20, 32, gilt, 3], [76, 16, 24, wood, 4]];
    for (const [x, w, h, c, a] of leaning) {
      const col = ok ? c : U.mix(c, '#a59e90', 0.55);
      s += `<g transform="rotate(${a} ${x} 320)">${box(x - w / 2, 320 - h, w, h, col, ' rx="0.8"')}${box(x - w / 2 + 2.2, 322.2 - h, w - 4.4, h - 4.4, ok ? pale : '#b3ab9a')}</g>`;
    }
    if (!ok) {
      // an old dust sheet thrown over the rack, and cobwebs in the corner
      s += `<path d="M36 300 Q60 288 90 298 L92 322 Q78 316 66 324 Q50 316 36 322Z" fill="#c9c2b2" opacity="0.9"/>${line('M46 300 q2 10 -2 20 M62 296 q4 12 0 26 M78 298 q-2 12 2 22', '#a9a292', 0.8, 0.8)}`;
      s += line('M34 222 q10 8 22 0 M34 222 l18 16 M34 232 l18 -10', '#eef0e8', 0.5, 0.8);
    } else if (p === 'grow') s += `${box(38, 296, 48, 26, url('Dusty'), ' opacity="0.42"')}${box(40, 228, 42, 46, url('Dusty'), ' opacity="0.3"')}`;
    return s + '</g>';
  }
  // the easel in the middle of the room, and on it the canvas she painted
  function canvas(st) {
    const p = pend(st, 'canvas'), { x, y, w, h } = CANV, cx = x + w / 2;
    const wood = st.canvas ? '#b98a54' : '#8a7d6a', dk = U.shade(wood, -0.25);
    let s = '<g data-part="canvas">';
    s += box(x - 6, WIN.y0, w + 12, 100, '#000', ' fill-opacity="0"');
    s += `${line(`M${cx} ${y - 3} V${y + h + 34}`, dk, 2.2)}${line(`M${cx - 3} ${y + 26} L${cx - 22} ${y + h + 44} M${cx + 3} ${y + 26} L${cx + 22} ${y + h + 44}`, wood, 2.6)}`;
    s += `${box(x - 4, y + h - 0.4, w + 8, 3.4, wood, ' rx="0.8"')}${box(cx - 3.4, y - 2.6, 6.8, 3, wood)}`;
    s += `${box(x + 1.2, y + 1.6, w, h, '#000', ' opacity="0.16"')}`;
    if (st.canvas) {
      if (typeof PAINTINGS !== 'undefined') s += PAINTINGS.svg(PAINTED.canvas || PAINTINGS.DEFAULT.canvas, x, y, w, h);
      else s += box(x, y, w, h, '#fbf7ee');
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#efe6d4" stroke-width="1.4"/>`;
      // a new blank one leaning at the foot of the easel, when the season wants one
      if (p) s += `<g transform="rotate(-8 ${x + 6} 316)">${box(x - 8, 290, 26, 26, '#fbf7ee')}<rect x="${x - 8}" y="290" width="26" height="26" fill="none" stroke="#c9c2b2" stroke-width="1"/></g>`;
    } else {
      const blank = PCT < 0.4 ? '#d2ccbc' : '#fbf7ee';
      s += `${box(x, y, w, h, blank)}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#c9c2b2" stroke-width="1"/>`;
      s += line(`M${x + 8} ${y + 40} q10 -16 22 -8 q8 6 14 -6`, '#b5ab9c', 0.7, 0.8);
      if (PCT < 0.4) s += `${oval(x + 16, y + 14, 12, 5, '#b5ab9c', 0.5)}${oval(x + 38, y + 40, 10, 4, '#b5ab9c', 0.45)}`;
    }
    return s + '</g>';
  }
  // a shelf of mixed colours, top right: jars in a row and colour cards above them
  function mixShelf(st) {
    const p = pend(st, 'mix'), ok = st.mix;
    const y = 262, x0 = 164, wood = ok ? '#b98a54' : '#8a7d6a';
    let s = `<g data-part="mix">${box(162, 232, 50, 44, '#000', ' fill-opacity="0"')}${box(x0 - 2, y, 50, 3, wood)}${line(`M${x0 + 4} ${y + 3} v5 M${x0 + 40} ${y + 3} v5`, U.shade(wood, -0.25), 1.2)}`;
    const JARS = ['#e2574c', '#ef9a4c', '#e9bf4f', '#5fae6e', '#3a5fae', '#a98bd9'];
    if (ok && !p) {
      JARS.forEach((c, i) => {
        const x = x0 + 3.4 + i * 7.6, h = 10 + (i % 2) * 2;
        s += `${box(x - 2.9, y - h, 5.8, h, c, ' rx="1"')}${box(x - 3.2, y - h - 1.4, 6.4, 1.8, '#c9a06a', ' rx="0.5"')}${box(x - 2, y - h * 0.62, 4, h * 0.34, '#fffaf0', ' opacity="0.85"')}`;
      });
      // the colour cards they made
      ['#ef9a4c', '#5fae6e', '#a98bd9', '#efb4ae'].forEach((c, i) => {
        s += `<g transform="rotate(${[-3, 2, -2, 3][i]} ${170 + i * 11.4} 240)">${box(165.4 + i * 11.4, 232, 9.4, 13, '#fffaf0')}${box(166.4 + i * 11.4, 233, 7.4, 7.4, c)}${dot(170 + i * 11.4, 232.6, 0.8, '#c9474f')}</g>`;
      });
    } else if (ok) {
      // lids off: the cards are empty again and the season's colours still to mix
      JARS.forEach((c, i) => {
        const x = x0 + 3.4 + i * 7.6;
        s += `${box(x - 2.9, y - 10, 5.8, 10, '#e9e2d2', ' rx="1"')}${box(x - 2.4, y - 4, 4.8, 3.6, c, ' rx="0.6"')}`;
      });
      for (let i = 0; i < 4; i++) s += `<g transform="rotate(${[-3, 2, -2, 3][i]} ${170 + i * 11.4} 240)">${box(165.4 + i * 11.4, 232, 9.4, 13, '#fffaf0')}<rect x="${166.4 + i * 11.4}" y="233" width="7.4" height="7.4" fill="none" stroke="#c9c2b2" stroke-width="0.6"/></g>`;
    } else {
      // dried-up tins with the lids stuck on
      for (const [i, c] of [[0, '#8f8a78'], [1, '#a59e90'], [3, '#857a68'], [4, '#9a9282']]) {
        const x = x0 + 4 + i * 8.6;
        s += `${box(x - 3.2, y - 9, 6.4, 9, c, ' rx="0.8"')}${oval(x, y - 9, 3.2, 1, U.shade(c, 0.12))}${line(`M${x - 2} ${y - 9} q-0.6 3 0 5`, '#6a5f50', 0.6, 0.7)}`;
      }
      s += line(`M${x0 + 12} ${y - 2} l9 -2`, '#7d7264', 1);
    }
    return s + '</g>';
  }
  // the table of brushes, bottom right: jars of them, a rag and a palette
  function brushes(st) {
    const p = pend(st, 'brushes'), ok = st.brushes, clean = ok && !p;
    const top = ok ? '#b98a54' : '#8a7d6a', dk = U.shade(top, -0.25);
    let s = `<g data-part="brushes">${shadow(188, 324, 26, 1.6)}${box(164, 298, 3, 26, dk)}${box(206, 298, 3, 26, dk)}`;
    s += `${box(160, 293, 52, 5, top, ' rx="0.8"')}${box(160, 293, 52, 1, '#fff', ' opacity="0.2"')}`;
    const jar = (x, cols, cloudy) => {
      let g = '';
      cols.forEach((c, i) => {
        const dx = (i - (cols.length - 1) / 2) * 2.6, h = 13 + ((i * 7) % 5);
        g += `${line(`M${f1(x + dx * 0.5)} 291 L${f1(x + dx)} ${293 - h}`, '#c9a06a', 1)}<path d="M${f1(x + dx - 1.2)} ${293 - h} q${1.2} -5 ${2.4} 0Z" fill="${c}"/>`;
      });
      return `${g}${box(x - 4.4, 283, 8.8, 10, cloudy ? '#b9b49f' : '#dceff2', ' rx="1" opacity="0.9"')}${box(x - 4, 288, 8, 4.6, cloudy ? '#8a8a6a' : '#bfe0ef', ' opacity="0.8"')}`;
    };
    if (clean) s += jar(172, ['#e2574c', '#3a5fae', '#e9bf4f'], false) + jar(190, ['#5fae6e', '#a98bd9'], false) + box(199, 287, 9, 6, '#f2c9a0', ' rx="1"') + box(199, 287, 9, 1.4, '#e2574c');
    else if (ok) {
      s += jar(172, ['#6a5f50', '#3a5fae', '#6a5f50'], true) + jar(190, ['#6a5f50', '#e2574c'], true);
      s += `<path d="M196 293 q3 -6 8 -3 q5 -1 6 3Z" fill="#c9c2b2"/>${dot(201, 291, 1.2, '#3a5fae')}${dot(205, 291.6, 1, '#e2574c')}`;
    } else {
      s += jar(172, ['#6a5f50', '#6a5f50', '#857a68'], true) + `<g transform="rotate(62 192 291)">${line('M180 291 H200', '#857a68', 1.4)}</g>`;
      s += `<path d="M184 293 q6 -7 13 -4 q9 -2 12 4Z" fill="#a8a292"/>${oval(176, 295, 8, 1.4, '#6f6a58', 0.6)}`;
      s += line('M212 222 q-12 8 -22 0 M212 222 l-18 18 M212 234 l-18 -12', '#eef0e8', 0.5, 0.75);
    }
    return s + '</g>';
  }
  function studioInside(st) {
    const dusty = PCT < 0.4;
    let s = box(WIN.x0, WIN.y0, 180, 88, dusty ? '#c6bfae' : '#f6f1e6');
    // the slope of the roof inside, with its rafters
    s += `<path d="M34 222 H214 V232 H34Z" fill="${dusty ? '#a79d8a' : '#e6dcc6'}"/>`;
    for (const x of [58, 104, 150, 196]) s += `<path d="M${x - 4} 222 h8 l1.4 11 h-10.8Z" fill="${dusty ? '#6e6052' : '#9a7450'}"/>`;
    s += box(WIN.x0, 306, 180, 2.4, dusty ? '#6e6052' : '#9a7450');
    if (dusty) s += oval(130, 290, 14, 10, '#a79d8a', 0.5);
    else {
      // cheerful splashes on the wall behind everything
      for (const [x, y, r, c] of [[100, 298, 2.2, '#e9bf4f'], [146, 300, 1.8, '#e2574c'], [154, 248, 1.8, '#3a5fae'], [92, 240, 1.6, '#5fae6e']]) s += dot(x, y, r, c, 0.55);
    }
    s += floorIn(st) + frames(st) + mixShelf(st) + canvas(st) + brushes(st);
    if (PCT > 0.6) {
      // the studio cat asleep on a stool
      s += `${box(114, 310, 2.4, 13, '#8a6240')}${box(132, 310, 2.4, 13, '#8a6240')}${box(110, 307, 28, 3.4, '#b98a54', ' rx="1.4"')}`;
      s += `<g class="pl-breathe">${oval(124, 302, 11, 5.4, '#efe3d0')}${dot(114.4, 303.4, 3.8, '#efe3d0')}<path d="M111.4 301 l-0.6 -3.2 l2.8 1.8Z M116 300.2 l1.8 -2.4 l0.8 2.8Z" fill="#efe3d0"/></g>${line('M134 305 q4 3 -2 4', '#efe3d0', 2)}`;
    }
    s += box(WIN.x0, WIN.y0, 180, 24, url('Shade'), ' pointer-events="none"');
    return s;
  }
  // the glass, its bars and the deep sill under them
  function windowGlass(st) {
    const p = pend(st, 'window'), ok = st.window, { x0, x1, y0, y1 } = WIN, w = x1 - x0, h = y1 - y0;
    let s = '<g pointer-events="none">';
    if (!ok) {
      s += box(x0, y0, w, h, url('Grime'), ' opacity="0.56"');
      s += `<path d="M42 318 q24 -26 50 -6 M104 316 q30 -30 62 -8 M170 300 q18 -16 36 -2" stroke="#dfe3d4" stroke-width="7" fill="none" opacity="0.2" stroke-linecap="round"/>`;
      s += line('M196 224 l-8 14 l6 6 l-10 16', '#eef0e8', 0.8, 0.9);
      for (const [x, y] of [[70, 254], [120, 290], [182, 262], [52, 300], [140, 240]]) s += dot(x, y, 1.6, '#6b6a5a', 0.5);
    } else if (p === 'frost') {
      s += box(x0, y0, w, h, url('Frost'), ' opacity="0.84"') + line('M38 324 q8 -14 4 -26 M42 316 l6 -4 M210 324 q-10 -12 -6 -26 M206 312 l-6 -3 M124 326 q4 -10 14 -12', '#fff', 1.3);
    } else if (p === 'grow') s += box(x0, y0, w, h, url('Dusty'), ' opacity="0.42"');
    else s += `<path d="M40 326 L86 222 H100 L54 326Z M168 326 L204 222 H211 L175 326Z" fill="#fff" opacity="0.12"/>`;
    if (p === 'leaves') s += oval(40, 323, 3.4, 1.6, '#d9822b') + oval(50, 325, 3, 1.4, '#c4462f') + oval(206, 323.4, 3.2, 1.5, '#e9b23c');
    s += '</g>';
    const fr = ok ? K.trim : U.mix(K.trim, '#8a877c', 0.45);
    s += `<g data-part="window"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${fr}" stroke-width="3.6"/>`;
    s += `<path d="M${BARX[0]} ${y0} V${y1} M${BARX[1]} ${y0} V${y1} M${x0} ${BARY} H${x1}" stroke="${fr}" stroke-width="2"/>`;
    s += `<path d="M${(x0 + BARX[0]) / 2} ${BARY} V${y1} M${(x1 + BARX[1]) / 2} ${BARY} V${y1}" stroke="${fr}" stroke-width="1"/>`;
    if (!ok) s += `${line(`M${BARX[1]} 300 l-3 9`, fr, 1)}<path d="M204 226 l8 -2 l1 10 l-6 2Z" fill="#6a6a5e" opacity="0.8"/>`;
    s += `${box(x0 - 5, y0 - 6, w + 10, 5, K.sash, ' rx="1"')}${box(x0 - 6, y1 + 1, w + 12, 4.4, K.stone, ' rx="1"')}${box(x0 - 6, y1 + 5, w + 12, 1.4, '#000', ' opacity="0.14"')}`;
    if (winter() || p === 'snow') s += `${box(x0 - 6, y1 - 0.6, w + 12, 2.2, SNOW, ' rx="1.1"')}${box(x0 - 5, y0 - 7.4, w + 10, 2, SNOW, ' rx="1"')}`;
    return s + '</g>';
  }
  // two cobalt window boxes under the big window
  function boxes(st) {
    const p = pend(st, 'boxes'), ok = st.boxes, col = ok ? K.trim : U.mix(K.trim, '#8a877c', 0.5);
    const r = U.rng(191);
    let s = '<g data-part="boxes">';
    for (const [x, w] of [[42, 72], [134, 72]]) {
      s += `${box(x + 2, 332.6, w, 9, '#000', ' opacity="0.14"')}${box(x, 331.4, w, 9, col, ' rx="1"')}${box(x, 331.4, w, 1.4, '#fff', ' opacity="0.18"')}${line(`M${x + 4} 336 h${w - 8}`, U.shade(col, -0.2), 0.7)}`;
      if (ok && p !== 'grow' && !winter()) {
        const fl = SEASON === 'autumn' ? ['#d9822b', '#c4462f', '#e9b23c'] : SEASON === 'spring' ? ['#f2d88a', '#efb4ae', '#fffaf0'] : ['#e2574c', '#fffaf0', '#e9bf4f'];
        for (let i = 0; i < 12; i++) {
          const fx = x + 4 + (i / 11) * (w - 8), fy = 327 + r() * 4;
          s += line(`M${f1(fx)} 332 L${f1(fx + (r() - 0.5) * 3)} ${f1(fy)}`, '#5f8a3a', 1) + dot(fx, fy, 2.2, U.pick(r, fl));
        }
        for (let i = 0; i < 7; i++) s += oval(x + 8 + r() * (w - 16), 330 + r() * 2, 3.4, 1.6, '#6fa055');
        for (const hx of [x + 14, x + w - 16]) s += line(`M${hx} 332 q-1 6 2 10`, '#5f8a3a', 1);
      } else if (ok && p === 'grow') {
        for (let i = 0; i < 8; i++) s += line(`M${f1(x + 6 + i * (w - 12) / 7)} 332 l${f1((r() - 0.5) * 3)} -5`, '#8a9a56', 1);
      } else if (ok) {
        // evergreens and berries for the winter
        for (let i = 0; i < 9; i++) s += oval(x + 6 + i * (w - 12) / 8, 329.6, 3.4, 2.2, '#4f7a54');
        s += dot(x + 20, 328.6, 1.3, '#c9474f') + dot(x + 46, 329, 1.3, '#c9474f') + box(x, 330.6, w, 2.2, SNOW, ' rx="1.1"');
      } else {
        for (let i = 0; i < 6; i++) s += line(`M${f1(x + 6 + i * 12)} 332 l${f1((r() - 0.5) * 8)} -7`, '#8a7a5a', 1);
      }
    }
    return s + '</g>';
  }
  // the lantern by the door, lit once the door is painted
  function lantern(st) {
    const ok = st.door, iron = '#2f3434', x = 301;
    let s = `${line(`M${x} 262 h-6 M${x} 262 v3`, iron, 1.2)}<path d="M${x - 3.6} 276 L${x - 4.6} 265 H${x + 4.6} L${x + 3.6} 276Z" fill="${ok ? '#fff1c9' : url('Grime')}" stroke="${iron}" stroke-width="1"/>`;
    s += `<path d="M${x - 5.6} 265 L${x} 260 L${x + 5.6} 265Z" fill="${iron}"/>${line(`M${x} 265 V276`, iron, 0.5)}`;
    if (winter()) s += line(`M${x - 5.4} 264.4 L${x} 259.6 L${x + 5.4} 264.4`, SNOW, 1.3);
    return s;
  }
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const col = ok ? C.loftDoor : U.mix(C.loftDoor, '#a59e90', 0.62), dk = U.shade(col, -0.28);
    const brass = ok ? '#d9a93a' : '#8a8576', { x0, x1, y0, y1 } = DOOR, w = x1 - x0, cx = (x0 + x1) / 2;
    let s = `<g data-part="door">${box(x0 - 4, y0 - 4, w + 8, y1 - y0 + 4, K.sash)}${box(x0, y0, w, y1 - y0, col)}${box(x0, y0, w, 1.4, '#fff', ' opacity="0.2"')}`;
    for (const x of [x0 + 7, x0 + 14, x0 + 21, x0 + 28]) s += line(`M${x} ${y0 + 30} V${y1}`, dk, 0.7, 0.75);
    // the glass in the top of the door: a glimpse of the studio
    s += box(x0 + 5, y0 + 5, w - 10, 22, ok ? '#f6efe0' : '#5a5046');
    if (ok) s += `${box(x0 + 5, y0 + 20, w - 10, 7, '#d0aa78')}${box(x0 + 13, y0 + 8, 9, 11, '#3a5fae')}${box(x0 + 14, y0 + 9, 7, 9, '#fbf7ee')}${dot(x0 + 17.5, y0 + 12, 2, '#e9bf4f')}`;
    else s += box(x0 + 5, y0 + 5, w - 10, 22, url('Grime'), ' opacity="0.65"');
    if (p === 'frost') s += box(x0 + 5, y0 + 5, w - 10, 22, url('Frost'), ' opacity="0.85"');
    s += `<rect x="${x0 + 5}" y="${y0 + 5}" width="${w - 10}" height="22" fill="none" stroke="${dk}" stroke-width="1.2"/>${line(`M${cx} ${y0 + 5} V${y0 + 27} M${x0 + 5} ${y0 + 16} H${x1 - 5}`, dk, 0.8)}`;
    s += `${box(x0, y0 + 40, 12, 1.8, '#3d3d42')}${box(x0, y0 + 70, 12, 1.8, '#3d3d42')}`;
    s += `${dot(x1 - 4.6, y0 + 52, 2, brass)}${dot(x1 - 5.2, y0 + 51.4, 0.6, '#fff', ok ? 0.8 : 0.2)}${box(x1 - 6, y0 + 56, 3, 5, brass, ' rx="0.8"')}`;
    if (!ok) s += `${oval(x0 + 8, y0 + 44, 3, 4.6, '#d8cfbf', 0.75)}${oval(x0 + 25, y0 + 76, 3.4, 2.4, '#d8cfbf', 0.7)}${line(`M${x1} ${y0} l-8 7 M${x1} ${y0} l-3 10`, '#e8e4da', 0.5, 0.8)}`;
    if (p === 'grow') s += box(x0, y0, w, y1 - y0, FADE, ' opacity="0.5"');
    return s + '</g>';
  }

  // ---------------------------------------------------------------- the yard
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard;
    const d = 'M-6 450 H250 V430 H410 V545 H-6Z';
    let s = `<g data-part="yard"><path d="${d}" fill="${url('Cobble')}"/>${box(342, 430, 68, 3, '#000', ' opacity="0.12"')}`;
    const tuft = (x, y) => line(`M${f1(x)} ${f1(y)} l-2 -4 M${f1(x)} ${f1(y)} l0.6 -5 M${f1(x)} ${f1(y)} l2.4 -3.4`, '#5f8a3a', 1);
    if (!ok) {
      s += `<path d="${d}" fill="${url('Moss')}" opacity="0.6"/>`;
      const r = U.rng(183);
      for (let i = 0; i < 22; i++) s += tuft(10 + r() * 380, 484 + r() * 34);
      for (let i = 0; i < 7; i++) s += tuft(352 + r() * 44, 438 + r() * 40);
    } else if (p === 'grow') {
      for (const [x, y, rx] of [[60, 500, 9], [392, 458, 8], [228, 512, 7], [360, 512, 8]]) s += oval(x, y, rx, rx * 0.4, '#6f8a3e', 0.55);
      for (const [x, y] of [[110, 490], [196, 506], [376, 480], [30, 514]]) s += tuft(x, y);
    }
    if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${d}" fill="${url('Snow')}" opacity="0.92"/>`;
    else if (p === 'frost') s += `<path d="${d}" fill="${url('Frost')}" opacity="0.55"/>`;
    else if (winter()) s += `<path d="${d}" fill="${url('Snow')}" opacity="0.6"/>${line('M240 545 Q300 500 372 454', '#a7b0b9', 3, 0.35)}`;
    else if (SEASON === 'autumn') {
      const r = U.rng(187);
      for (let i = 0; i < 14; i++) {
        const x = r() * 400, y = 482 + r() * 54;
        s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="1.5" fill="${U.pick(r, ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a'])}" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})" opacity="0.9"/>`;
      }
    }
    return s + '</g>';
  }
  // the low wall that closes the yard behind the stairs
  function backWall() {
    let s = `${box(342, 412, 68, 20, url(PCT > 0.5 ? 'Brick' : 'BrickOld'))}`;
    for (let x = 340; x < 410; x += 18) s += box(x, 408, 17.4, 5, K.stone, ' rx="1.2"');
    if (winter()) s += `<path d="M340 409 Q370 404 410 408 V411 H340Z" fill="${SNOW}"/>`;
    return s;
  }
  // the long wall: brick, whitewashed, and on it the mural once it is painted
  function wall(st) {
    const p = pend(st, 'mural'), ok = st.mural, { x, y, w, h } = MURAL;
    const lime = PCT < 0.4 ? '#d9d2c2' : '#f6f1e6';
    let s = `${box(-6, WALL.y0 + 6, WALL.x1 + 6, WALL.y1 - WALL.y0 - 6, url(PCT > 0.5 ? 'Brick' : 'BrickOld'))}`;
    s += '<g data-part="mural">';
    s += box(x - 8, y - 4, w + 16, h + 6, lime);
    s += box(x - 8, y - 4, w + 16, h + 6, url('Lines'), ' opacity="0.28"');
    if (ok) {
      s += `<g clip-path="${url('Mural')}">`;
      if (typeof PAINTINGS !== 'undefined') s += PAINTINGS.svg(PAINTED.mural || PAINTINGS.DEFAULT.mural, x, y, w, h);
      s += box(x, y, w, h, url('Lines'), ' opacity="0.2"');
      if (p) s += box(x, y, w, h, FADE, ' opacity="0.28"');
      s += '</g>';
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#efe6d4" stroke-width="1.2"/>`;
      // a season's new picture is coming: the ladder and a pail stand ready
      if (p) s += `${line(`M${x + w - 18} ${y + h + 2} L${x + w - 6} ${y + 4} M${x + w - 6} ${y + h + 2} L${x + w + 6} ${y + 4}`, '#a8824f', 2)}${[20, 38, 56, 74].map((d) => line(`M${x + w - 16 + d * 0.13} ${y + h - d} h12`, '#a8824f', 1.4)).join('')}${box(x + 4, y + h - 9, 11, 10, '#a6b4bd', ' rx="1"')}`;
    } else {
      if (PCT < 0.5) {
        // the old limewash flaking off the bricks
        const r = U.rng(179);
        for (let i = 0; i < 9; i++) s += oval(x + r() * w, y + r() * h, 6 + r() * 14, 3 + r() * 6, K.brick, 0.8);
      } else {
        // fresh limewash, ruled in pencil, waiting
        s += line(`M${x + 8} ${y + 34} H${x + w - 8} M${x + 8} ${y + 68} H${x + w - 8} M${x + 60} ${y + 8} V${y + h - 8} M${x + 120} ${y + 8} V${y + h - 8}`, '#b5ab9c', 0.5, 0.6);
      }
    }
    s += '</g>';
    // the coping along the top and the pier at the end of the wall
    for (let cx = -8; cx < WALL.x1; cx += 22) s += box(cx, WALL.y0, 21.4, 7, K.stone, ' rx="1.4"');
    s += `${box(WALL.x1, WALL.y0 - 8, 18, WALL.y1 - WALL.y0 + 8, url(PCT > 0.5 ? 'Brick' : 'BrickOld'))}${box(WALL.x1 - 2, WALL.y0 - 12, 22, 6, K.stone, ' rx="1.4"')}`;
    s += box(-6, WALL.y0 + 7, WALL.x1 + 24, 2.4, '#000', ' opacity="0.1"');
    if (winter()) s += `<path d="M-6 ${WALL.y0 + 1} Q40 ${WALL.y0 - 5} 96 ${WALL.y0} Q150 ${WALL.y0 - 5} ${WALL.x1} ${WALL.y0} V${WALL.y0 + 3} H-6Z" fill="${SNOW}"/><path d="M${WALL.x1 - 3} ${WALL.y0 - 11} Q${WALL.x1 + 9} ${WALL.y0 - 16} ${WALL.x1 + 21} ${WALL.y0 - 11} V${WALL.y0 - 8} H${WALL.x1 - 3}Z" fill="${SNOW}"/>`;
    return s;
  }
  // one poppy on its stem
  function poppy(x, y, h, r, col, sway) {
    const top = y - h;
    const head = `<g class="${sway ? 'pl-sway' : ''}">${line(`M${f1(x)} ${f1(y)} Q${f1(x + 1.6)} ${f1(y - h * 0.5)} ${f1(x)} ${f1(top)}`, '#5f8a3a', 1)}
      ${oval(x - r * 0.6, top - 0.6, r * 0.8, r * 0.7, col)}${oval(x + r * 0.6, top - 0.6, r * 0.8, r * 0.7, col)}${oval(x, top - r * 0.6, r * 0.8, r * 0.66, U.shade(col, 0.1))}${dot(x, top, r * 0.34, '#2f2a2a')}</g>`;
    return head;
  }
  function poppies(st) {
    const p = pend(st, 'poppies'), ok = st.poppies;
    const r = U.rng(193), soil = ok ? '#7a5a3e' : '#8a7a62';
    let s = `<g data-part="poppies"><path d="M-6 456 H250 V468 Q120 484 -6 474Z" fill="${soil}"/>`;
    if (!ok) {
      for (let i = 0; i < 24; i++) {
        const x = 4 + r() * 236, y = 462 + r() * 10;
        s += line(`M${f1(x)} ${f1(y)} l-3 -8 M${f1(x)} ${f1(y)} l0.6 -10 M${f1(x)} ${f1(y)} l3.4 -7`, U.pick(r, ['#6f8a3e', '#8a9a56', '#5f8a3a']), 1);
      }
      s += `${line('M64 468 l-2 -16 M60 456 l-5 -4 M63 460 l5 -5', '#6a6a4a', 1.2)}${dot(62, 451, 3, '#8a6a9a')}${line('M180 466 l2 -14 M181 458 l5 -3', '#6a6a4a', 1.2)}${dot(182, 451, 2.6, '#8a6a9a')}`;
    } else if (winter() || p === 'snow') {
      for (let i = 0; i < 16; i++) {
        const x = 6 + i * 15 + r() * 6, y = 466 + r() * 5;
        s += line(`M${f1(x)} ${f1(y)} q1 -6 0 -${f1(12 + r() * 8)}`, '#8a7a5a', 0.9) + dot(x, y - 16, 1.8, '#7a6a4a');
      }
      s += `<path d="M-6 462 Q60 456 120 462 T250 460 V467 Q120 477 -6 472Z" fill="${SNOW}"/>`;
    } else {
      const seedy = SEASON === 'autumn';
      for (let i = 0; i < 8; i++) s += oval(8 + i * 32 + r() * 12, 466 + r() * 4, 13, 5, '#6fa055', seedy ? 0.5 : 0.9);
      for (let i = 0; i < 20; i++) {
        const x = 6 + (i / 19) * 228 + (r() - 0.5) * 6, y = 464 + r() * 8, h = 14 + r() * 14;
        if (seedy) {
          s += line(`M${f1(x)} ${f1(y)} q1 ${f1(-h / 2)} 0 ${f1(-h)}`, '#8a8a4a', 1) + oval(x, y - h - 1.4, 2, 2.6, '#a8894a') + box(x - 2.2, y - h - 4.4, 4.4, 1.2, '#8a6a3a');
        } else if (SEASON === 'spring' && i % 3) {
          // buds nodding on their stems
          s += line(`M${f1(x)} ${f1(y)} q2 ${f1(-h / 2)} 1 ${f1(-h)} q-3 -1 -3 2`, '#6f9a4a', 1) + oval(x - 2, y - h + 2.4, 1.8, 2.6, '#7fa85a');
        } else s += poppy(x, y, h, 3.6 + r() * 1.4, U.pick(r, ['#e2453c', '#e2453c', '#ef6a4c', '#d9363a']), i % 2 === 0);
      }
      if (p === 'grow') for (let i = 0; i < 10; i++) { const x = 6 + r() * 228, y = 464 + r() * 8; s += line(`M${f1(x)} ${f1(y)} l-3 -7 M${f1(x)} ${f1(y)} l0.6 -9 M${f1(x)} ${f1(y)} l3 -6`, '#6f8a3e', 1.1); }
    }
    return s + '</g>';
  }
  // the outside stairs and the landing at the loft door
  function stairs(st) {
    const p = pend(st, 'stairs'), ok = st.stairs;
    const wood = ok ? '#c99e62' : '#8f8170', dk = U.shade(wood, -0.3), rail = ok ? K.trim : '#7d7a72';
    let s = '<g data-part="stairs">';
    // posts and braces under the landing
    for (const x of [244, 298]) s += `${box(x, 342, 5, 90, dk)}${box(x + 0.8, 342, 1.2, 90, '#fff', ' opacity="0.1"')}`;
    s += line('M249 344 L298 382', dk, 2.2) + line('M298 344 L249 382', dk, 2.2, ok ? 1 : 0.4);
    // the landing boards
    s += `${box(240, 337.6, 68, 5.4, wood)}${box(240, 337.6, 68, 1.2, '#fff', ' opacity="0.22"')}${box(240, 342.4, 68, 1.6, dk)}`;
    for (let x = 248; x < 308; x += 9) s += line(`M${x} 338 v4.6`, dk, 0.5, 0.7);
    if (!ok) s += `<path d="M268 337 h16 v6 l-5 -2 l-5 3 l-6 -2Z" fill="#3a342c" opacity="0.8"/>`;
    // the two long stringers and the treads between them
    const a = STEPS[0], z = STEPS[8];
    s += line(`M${a.x + 1} ${a.y - 7} L${z.x + 12} ${z.y + 5}`, dk, 4.4);
    STEPS.forEach((q, i) => {
      if (!ok && i % 3 === 1) return; // gaps where the rotten treads have gone
      const tilt = !ok && i % 3 === 2 ? ` transform="rotate(7 ${q.x + 6} ${q.y})"` : '';
      s += `<g${tilt}>${box(q.x, q.y - 1, 13.4, 3.6, i % 2 ? wood : U.shade(wood, 0.06), ' rx="0.6"')}${box(q.x, q.y + 2, 13.4, 1, dk)}</g>`;
    });
    // the foot of the stairs on a stone
    s += `${box(z.x + 2, z.y + 4, 20, 4, K.stone, ' rx="1"')}${shadow(z.x + 12, z.y + 9, 14, 1.6)}`;
    // the handrail, up the stairs and along the landing
    const [rx0, ry0] = railAt(0), [rx1, ry1] = railAt(8);
    if (ok) {
      for (const i of [0, 3, 6, 8]) { const [x, y] = railAt(i); s += line(`M${x} ${y} V${f1(y + 25)}`, rail, 1.8); }
      for (const x of [242, 262, 283]) s += line(`M${x} 313 V338`, rail, 1.6);
      s += `${line(`M242 313 H${rx0} L${rx1} ${ry1}`, rail, 2.6)}${line(`M242 312.2 H${rx0} L${rx1} ${f1(ry1 - 0.8)}`, '#fff', 0.5, 0.3)}`;
    } else {
      for (const i of [0, 6]) { const [x, y] = railAt(i); s += line(`M${x} ${y} V${f1(y + 25)}`, rail, 1.8); }
      s += `${line(`M${rx0} ${ry0} L${railAt(3)[0]} ${railAt(3)[1]}`, rail, 2.2)}${line(`M${railAt(6)[0]} ${railAt(6)[1]} L${railAt(5)[0] + 12} ${railAt(5)[1] + 22}`, rail, 2.2)}`;
      s += line('M242 338 V320 M283 338 V326', rail, 1.6) + line('M242 320 L270 316', rail, 2);
    }
    if (p === 'leaves') {
      for (const [i, c] of [[0, '#d9822b'], [2, '#c4462f'], [3, '#e9b23c'], [5, '#d9822b'], [7, '#c4462f']]) s += oval(STEPS[i].x + 6, STEPS[i].y - 1.6, 4, 1.6, c);
      s += oval(258, 337, 4, 1.6, '#e9b23c') + oval(292, 337, 4, 1.6, '#c4462f');
    } else if (p === 'grow') {
      for (const i of [1, 4, 6]) s += box(STEPS[i].x, STEPS[i].y - 1, 13.4, 3.6, FADE, ' opacity="0.6"');
    }
    if (winter() || p === 'snow') {
      s += box(240, 336, 68, 2.6, SNOW, ' rx="1.3"');
      for (const q of STEPS) s += box(q.x, q.y - 2.2, 13.4, 2, SNOW, ' rx="1"');
    }
    return s + '</g>';
  }
  // a garden swing seat hanging in its frame
  function swing(st, C) {
    const p = pend(st, 'swing'), ok = st.swing;
    const col = ok ? C.swingSeat : U.mix(C.swingSeat, '#a59e90', 0.62), dk = U.shade(col, -0.25);
    const fr = ok ? '#8a6240' : '#7a7266', y = 482;
    let s = `<g data-part="swing">${shadow(300, 508, 56, 3)}`;
    s += `${line('M262 508 L274 440 L286 508', fr, 3.2)}${line('M314 508 L326 440 L338 508', fr, 3.2)}${line('M268 441 H332', fr, 4.4)}`;
    const seat = `${line(`M280 442 V${y} M320 442 V${y}`, '#c9b78e', 1)}
      ${box(278, y - 16, 44, 3, col, ' rx="1"')}${box(278, y - 10.4, 44, 3, col, ' rx="1"')}${line(`M281 ${y - 16} V${y} M300 ${y - 16} V${y} M319 ${y - 16} V${y}`, dk, 1.1)}
      ${box(276, y - 1, 48, 4.4, col, ' rx="1.2"')}${box(276, y - 1, 48, 1, '#fff', ' opacity="0.25"')}${box(276, y + 3, 48, 1.6, dk)}`;
    if (ok) s += `<g class="pl-swing">${seat}<path d="M296 ${y - 1} q10 -8 22 0 Z" fill="#efb4ae"/>${line(`M298 ${y - 2} q8 -5 18 -0.4`, '#e39a92', 0.7)}</g>`;
    else {
      // one rope gone, the seat hanging down at one end
      s += `<g transform="rotate(9 320 442)">${seat}</g>`;
      s += `${line('M280 442 v10 q2 3 -1 5', '#c9b78e', 1)}${oval(286, 479, 2.4, 3.6, '#d8cfbf', 0.7)}${oval(308, 488, 3.4, 2, '#d8cfbf', 0.7)}`;
    }
    if (p === 'grow') s += box(276, y - 16, 48, 21, FADE, ' opacity="0.5"');
    else if (p === 'leaves') s += oval(292, y - 1.4, 3, 1.4, '#d9822b') + oval(310, y - 1.4, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += `${box(266, 437.6, 68, 2.4, SNOW, ' rx="1.2"')}${box(276, y - 3, 48, 2.2, SNOW, ' rx="1.1"')}`;
    return s + '</g>';
  }
  // mess left lying about while the barn is shut up
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}">
      <g transform="rotate(-5 66 500)">${box(40, 490, 52, 22, '#c9b06a')}${line('M40 497 H92 M40 505 H92 M56 490 V512 M76 490 V512', '#a8894a', 1)}${line('M42 490 l3 -3 M60 490 l4 -4 M84 490 l3 -3', '#c9b06a', 1.2)}</g>
      <g transform="rotate(14 200 506)">${box(186, 498, 26, 14, '#8a7a5a')}${line('M186 503 H212 M196 498 V512', '#6b5c44', 1)}</g>
      ${line('M120 516 L168 496 M126 522 L174 502', '#8a7a5a', 2.4)}${[0, 1, 2, 3, 4].map((i) => line(`M${124 + i * 9.6} ${f1(514.4 - i * 4)} l6 6`, '#8a7a5a', 1.8)).join('')}
      ${oval(366, 494, 10, 6.6, '#3d3d42')}${oval(366, 490, 6.6, 2.6, '#5a5a5e')}
      ${box(346, 468, 8, 10, '#8a8f90', ' rx="1"')}${oval(350, 468, 4, 1.2, '#a6aaab')}${line('M348 470 q-1 4 0 7', '#3a5fae', 1.2, 0.7)}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g transform="translate(-150 6)"><rect x="338.5" y="484" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 340 480)">
      <rect x="316" y="470" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="340" y="483.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 340 488)"><rect x="313" y="484" width="54" height="10" fill="#d9534f"/><text x="340" y="492" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  const BULBS = (() => { const out = []; for (let i = 0; i <= 8; i += 0.5) { const [x, y] = railAt(i); out.push([x, y + 3 + (i % 1 ? 2.4 : 0)]); } for (let x = 246; x < 304; x += 9) out.push([x, 316 + (x % 2) * 1.2]); return out; })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const DECOR = {
    // a paint pail of daisies at the end of the wall
    'pl-pail': () => {
      let s = shadow(244, 496, 11, 1.8);
      for (const [dx, h] of [[-6, 16], [-2, 22], [3, 19], [7, 14]]) s += line(`M${244 + dx * 0.6} 484 L${244 + dx} ${484 - h}`, '#5f8a3a', 1) + [0, 1, 2, 3, 4, 5].map((k) => dot(244 + dx + Math.cos(k * 1.05) * 2.2, 484 - h + Math.sin(k * 1.05) * 2.2, 1.3, '#fffaf0')).join('') + dot(244 + dx, 484 - h, 1.2, '#e9bf4f');
      return `<g>${s}<path d="M235 482 H253 L251 496 H237Z" fill="#a6b4bd"/><path d="M237 488 q3 5 6 0 q2 4 5 0" stroke="#3a5fae" stroke-width="1.6" fill="none"/>${oval(244, 482, 9, 2.2, '#8a979f')}${line('M235 482 Q244 470 253 482', '#6b6b70', 0.8)}</g>`;
    },
    // bunting from the end of the wall across the yard to a slim post
    'pl-bunting': () => {
      const P = (t) => { const x = 250 + t * 148, y = 368 + 58 * 4 * t * (1 - t) * 0.72; return [x, y]; };
      let s = `${box(396, 362, 2.6, 70, '#8a6240')}${line(`M250 368 Q324 452 398 368`, '#7a6a52', 0.8)}`;
      const cols = ['#e2574c', '#f2d88a', '#3a5fae', '#efb4ae', '#5fae6e', '#fffaf0'];
      for (let i = 1; i < 12; i++) { const [x, y] = P(i / 12); s += `<path class="pl-flag" d="M${f1(x - 4.4)} ${f1(y)} H${f1(x + 4.4)} L${f1(x)} ${f1(y + 10)}Z" fill="${cols[i % 6]}"/>`; }
      return `<g>${s}</g>`;
    },
    // a tabby on the stairs, third step down
    'pl-cat': () => {
      const q = STEPS[3], x = q.x + 7, y = q.y - 2;
      return `<g>${oval(x - 1, y - 6, 6, 5.4, '#9a8468')}${line(`M${x + 4} ${y - 2} q6 1 5 -6`, '#9a8468', 2)}${dot(x - 3, y - 13, 3.8, '#9a8468')}<path d="M${x - 6} ${y - 15} l-0.6 -3.8 l3 2.2Z M${x - 1.4} ${y - 16} l2 -3 l0.8 3.6Z" fill="#9a8468"/>${line(`M${x - 4.6} ${y - 7} v6 M${x + 0.6} ${y - 8} v7`, '#7a6a52', 1)}${line(`M${x - 4.6} ${y - 13} h0.1 M${x - 1.6} ${y - 13} h0.1`, '#2f2a2a', 1)}</g>`;
    },
    // a bicycle against the old barn doors, under the stairs
    'pl-bike': () => {
      const wheel = (x, y) => `<circle cx="${x}" cy="${y}" r="9.4" fill="none" stroke="#3d3d42" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="1.2" fill="#3d3d42"/>${line(`M${x - 9} ${y} H${x + 9} M${x} ${y - 9} V${y + 9}`, '#8a8f90', 0.4)}`;
      return `<g>${shadow(304, 433, 24, 1.6)}${wheel(290, 423)}${wheel(320, 423)}${line('M290 423 L300 407 L314 407 L320 423 M300 407 L306 423 L314 407 M306 423 L290 423', '#3a5fae', 1.8)}${line('M300 407 v-3 M296 403.6 h7 M314 407 l-1.4 -6 h4', '#3d3d42', 1.4)}<path d="M308 412 h12 l-2 7 h-8Z" fill="#c9a06a"/>${line('M311 412 V419 M315 412 V419', '#a8824f', 0.6)}</g>`;
    },
    // a bronze hare on a stone, up on its haunches
    'pl-hare': () => `<g>${shadow(38, 512, 16, 2)}${box(26, 502, 24, 9, K.stone, ' rx="1.4"')}<path d="M32 502 Q28 484 36 476 Q38 470 40 462 l2 0 Q43 470 42 476 Q46 482 46 492 Q47 498 44 502Z" fill="#7a5a3a"/><path d="M38 464 l-1 -11 l2.6 10 M41 464 l1.4 -12 l1.4 11" stroke="#7a5a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>${line('M33 490 q2 -8 6 -12', '#a8824f', 0.8, 0.8)}${dot(42, 469, 0.8, '#2f2a2a')}</g>`,
    // a giant pot of sunflowers
    'pl-sunflowers': () => {
      let s = shadow(370, 516, 17, 2);
      const head = (x, y, r) => { let g = ''; for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g += `<ellipse cx="${f1(x + Math.cos(a) * r * 0.9)}" cy="${f1(y + Math.sin(a) * r * 0.9)}" rx="${f1(r * 0.5)}" ry="${f1(r * 0.22)}" fill="#f2c230" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(x + Math.cos(a) * r * 0.9)} ${f1(y + Math.sin(a) * r * 0.9)})"/>`; } return g + dot(x, y, r * 0.6, '#6b4a2a'); };
      s += `${line('M364 492 Q358 466 356 442', '#5f8a3a', 2)}${line('M372 492 Q376 456 372 424', '#5f8a3a', 2.2)}${line('M380 492 Q388 472 390 452', '#5f8a3a', 2)}`;
      s += `${oval(362, 468, 7, 3, '#6fa055')}${oval(382, 474, 7, 3, '#6fa055')}${oval(376, 452, 7, 3, '#6fa055')}`;
      s += head(356, 440, 7) + head(372, 422, 8.4) + head(390, 450, 6.4);
      return `<g>${s}<path d="M352 492 H392 L386 516 H358Z" fill="#c9764a"/>${box(350, 489, 44, 5, '#d98b63', ' rx="1"')}</g>`;
    },
    // a sculpture of a few bright loops on a plinth
    'pl-sculpture': () => `<g>${shadow(206, 514, 15, 2)}${box(198, 500, 16, 13, K.stone, ' rx="1"')}<g fill="none" stroke-linecap="round"><path d="M206 500 Q190 482 206 472 Q222 462 212 450" stroke="#3a5fae" stroke-width="4"/><circle cx="208" cy="474" r="9" stroke="#e9bf4f" stroke-width="3.4"/></g>${dot(212, 448, 3.4, '#e2574c')}</g>`,
    // a wind sculpture on the pier: three cups going slowly round
    'pl-chimes': () => {
      const x = 241, y = 306;
      return `<g>${line(`M${x} 332 V${y}`, '#6b6b70', 1.4)}<g class="pl-spin">${box(x - 14, y - 14, 28, 28, '#000', ' fill-opacity="0"')}${[0, 120, 240].map((a, i) => `<g transform="rotate(${a} ${x} ${y})">${line(`M${x} ${y} V${y - 12}`, '#8a8f90', 1)}<path d="M${x - 5} ${y - 12} a5 5 0 0 0 10 0Z" fill="${['#e2574c', '#e9bf4f', '#3a5fae'][i]}"/></g>`).join('')}</g>${dot(x, y, 1.6, '#3d3d42')}</g>`;
    },
    // fairy lights along the handrail
    'pl-lights': () => `<g>${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.4" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    // a big sun painted on the gable
    'pl-sun': () => {
      let s = '';
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; s += `<path d="M${f1(272 + Math.cos(a - 0.16) * 11)} ${f1(182 + Math.sin(a - 0.16) * 11)} L${f1(272 + Math.cos(a) * (k % 2 ? 15 : 18))} ${f1(182 + Math.sin(a) * (k % 2 ? 15 : 18))} L${f1(272 + Math.cos(a + 0.16) * 11)} ${f1(182 + Math.sin(a + 0.16) * 11)}Z" fill="#e9bf4f"/>`; }
      return `<g>${s}${dot(272, 182, 10.6, '#f2c230')}${dot(272, 182, 7.6, '#f6d77a')}${line('M268 184 q4 3.4 8 0', '#c9862f', 1)}${dot(268.6, 180, 0.9, '#c9862f')}${dot(275.4, 180, 0.9, '#c9862f')}</g>`;
    },
    // a striped hammock between two posts, down in the yard
    'pl-hammock': () => {
      const col = ['#3a5fae', '#fffaf0', '#e9bf4f'];
      let s = `${shadow(118, 516, 54, 2.4)}${line('M64 516 V476 M172 516 V476', '#8a6240', 3)}`;
      s += `<path d="M66 480 Q118 526 170 480 L168 486 Q118 500 68 486Z" fill="#fffaf0"/>`;
      for (let i = 0; i < 9; i++) { const t0 = i / 9, t1 = (i + 1) / 9; const y = (t) => 2 * t * (1 - t) * 23; s += `<path d="M${f1(66 + t0 * 104)} ${f1(480 + y(t0) * 1.6)} L${f1(66 + t1 * 104)} ${f1(480 + y(t1) * 1.6)} L${f1(68 + t1 * 100)} ${f1(486 + y(t1) * 0.8)} L${f1(68 + t0 * 100)} ${f1(486 + y(t0) * 0.8)}Z" fill="${col[i % 3]}"/>`; }
      return `<g>${s}${dot(64, 476, 2, '#6b4a32')}${dot(172, 476, 2, '#6b4a32')}</g>`;
    },
    // a paintbrush for a weathervane, on the peak of the gable
    'pl-vane': () => `<g>${line('M272 128 V96', '#3d3d42', 1.4)}${line('M265 112 h14 M272 106 v12', '#3d3d42', 0.8)}${text(262.6, 114, 'W', 4, '#3d3d42')}${text(281.4, 114, 'E', 4, '#3d3d42')}<g class="pl-vane">${box(254, 100, 30, 8, '#000', ' fill-opacity="0"')}${box(256, 102.6, 20, 2.8, '#a8743f', ' rx="1.2"')}${box(276, 102, 3.4, 4, '#c9c3b6')}<path d="M279.4 101.4 q8 2.6 7 2.6 q1 0 -7 2.6Z" fill="#e2574c"/></g>${dot(272, 95, 1.6, '#d9a93a')}</g>`,
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function butterfly(x, y, col) {
    return `<g transform="translate(${f1(x)} ${f1(y)})"><g class="pl-flit"><g class="pl-wing"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="${col}"/></g>${line('M0 -2 V2', '#3d3d42', 0.8)}</g></g>`;
  }
  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M150 96 q4 -4 8 0 q4 -4 8 0 M174 108 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // butterflies over the poppies; a sparrow on the wall; a blackbird in winter
    if (PCT > 0.6 && st.poppies && (SEASON === 'summer' || SEASON === 'spring')) s += `<g pointer-events="none">${butterfly(70, 436, '#f2a7b8')}${butterfly(190, 440, '#fbd85c')}</g>`;
    if (PCT > 0.6 && !winter()) s += `<g class="pl-hop">${oval(150, 341, 4.2, 2.8, '#8a6a52')}${dot(153.2, 338.6, 2, '#7a5a42')}${dot(153.8, 338.2, 0.5, '#222')}<path d="M155 338.8 l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${line('M149 344 v1.6 M151 344 v1.6', '#6b4a32', 0.5)}</g>`;
    if (winter() && PCT > 0.5) s += `<g class="pl-hop">${oval(84, 341, 4, 2.8, '#2f2f34')}${dot(87, 338.6, 1.9, '#2f2f34')}<path d="M88.6 338.6 l2 0.5 l-2 0.5Z" fill="#e9a23c"/>${line('M80.6 341 l-3 1.4', '#2f2f34', 1.4)}</g>`;
    return s;
  }
  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="${-10 - DY}" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="${-10 - DY}" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="${-10 - DY}" rx="2.6" ry="1.6" fill="#fbf2f4" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the studio, the skylight and the lantern
  function night(st, decor) {
    const room = st.window && !PEND.window, roofLit = st.skylight && !PEND.skylight, door2 = st.door;
    const { x0, x1, y0, y1 } = WIN;
    let holes = '';
    if (room) holes += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/>`;
    if (roofLit) holes += `<path d="${SKYL_D}"/>`;
    if (door2) holes += `<rect x="${DOOR.x0 + 5}" y="${DOOR.y0 + 5}" width="${DOOR.x1 - DOOR.x0 - 10}" height="22"/><path d="M297.4 276 L296.4 265 H305.6 L304.6 276Z"/>`;
    const all = `y="${-DY - 4}" width="400" height="${548 + DY}"`;
    let s = `<mask id="${id('Dark')}"><rect ${all} fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect ${all} fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect ${all} fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 32; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 - DY + ((i * 53) % 110)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="357" cy="56" r="14" fill="#000"/></mask><circle cx="350" cy="62" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="350" cy="62" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (room) s += `${box(x0, y0, x1 - x0, y1 - y0, '#ffd98a', ' opacity="0.2"')}${glow(124, 274, 120, 66)}${glow(124, 348, 110, 12)}`;
    if (roofLit) s += `<path d="${SKYL_D}" fill="#ffd98a" opacity="0.5"/>${glow(134, 172, 56, 38)}`;
    if (door2) {
      s += `${box(DOOR.x0 + 5, DOOR.y0 + 5, DOOR.x1 - DOOR.x0 - 10, 22, '#ffd98a', ' opacity="0.3"')}${glow(271, 266, 22, 20)}`;
      s += `<path d="M297.4 276 L296.4 265 H305.6 L304.6 276Z" fill="#ffe9b0" opacity="0.8"/>${glow(301, 270, 22, 20)}${glow(290, 338, 34, 6)}`;
    }
    if (decor['pl-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    skylight: [132, 172], window: [124, 274], floor: [124, 316], brushes: [186, 288], frames: [62, 306], door: [271, 294], sign: [272, 226], swing: [300, 472], stairs: [336, 392],
    yard: [200, 504], poppies: [120, 464], boxes: [124, 336], canvas: [124, 250], mural: [123, 404], mix: [186, 256],
  };
  const PARTS = ['skylight', 'window', 'floor', 'brushes', 'frames', 'door', 'sign', 'swing', 'stairs', 'yard', 'poppies', 'boxes', 'canvas', 'mural', 'mix'];
  function sparkles(part) {
    if (!part) return '';
    const spot = SPOTS[part] || [200, 330];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = spot[0] + Math.cos(a) * d, y = spot[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${f1(x)} ${f1(y - 6)} L${f1(x + 1.5)} ${f1(y - 1.5)} L${f1(x + 6)} ${f1(y)} L${f1(x + 1.5)} ${f1(y + 1.5)} L${f1(x)} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours (loftDoor,
  // loftSign, swingSeat); opts as for CURIO.render, plus resting and painted
  // (S.painted: { canvas: { m, p }, mural: { m, p } }, either may be missing)
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night; PAINTED = opts.painted || {};
    const decor = opts.decor || {};
    palette({ loftDoor: cols.loftDoor || '#3d5a86', loftSign: cols.loftSign || '#d98b63', swingSeat: cols.swingSeat || '#f2d88a' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house loft">
      ${style()}${defs()}<g transform="translate(0 ${DY})">${sky()}${far()}${tree()}${chimney()}${roof()}${skylight(st)}${walls()}${gable()}${sign(st, C)}
      <g clip-path="${url('Win')}">${studioInside(st)}</g>${windowGlass(st)}${boxes(st)}${door(st, C)}${lantern(st)}
      ${yard(st)}${backWall()}${stairs(st)}${wall(st)}${poppies(st)}${swing(st, C)}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${opts.resting ? U.restCat(236, 510, '#efe3d0', true) : ''}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}</g>
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
