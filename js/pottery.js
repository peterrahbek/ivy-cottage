'use strict';
// Kiln Lane Pottery, drawn as SVG the same way as the cottage (house.js) and
// the other places. An old brick barn on a field lane, turned into a pottery:
// through the big workshop window the potter's wheel, the glaze shelves, a
// tea set and the floor; a sliding barn door with the sign above the window;
// a bottle kiln of brick beside the barn with its tall chimney and lavender
// along its foot; a drying rack and clay bins on the cobbled yard. Each
// restorable part has a tired look and a restored look; the barn door and
// the sign take the colours chosen while painting. Every id carries a 'q'
// prefix (plus opts.uid when given) so this picture can share a page with
// the others.

const POTTERY = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the pottery is still for sale, how far along it is
  // and the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {};
  const id = (n) => `q${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  // dark or light writing, whichever reads on a painted colour
  const ink = (c) => (U.lum(c) > 0.62 ? '#3b352e' : '#fbf6ea');

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#c3d9a9', '#a9cb8f', '#93bb7a'], summer: ['#c9d98f', '#a7c97d', '#8fbb6c'], autumn: ['#e0c78e', '#cfae6c', '#b99a5c'], winter: ['#eef2f6', '#e2e9ef', '#d6dfe7'] };
  const GRASS = {
    spring: ['#8fbf6a', '#79ad57', '#a6cf7f'], summer: ['#86bb5e', '#70a64c', '#9fcb72'],
    autumn: ['#bdb06c', '#a59858', '#cfc282'], winter: ['#e9eff4', '#d9e3ea', '#f5f8fb'],
  };
  const CANOPY = { spring: ['#86b56a', '#9cc77e', '#f4c6d4'], summer: ['#5f9a4c', '#6aa858', null], autumn: ['#d9822b', '#c9692f', '#e9b23c'], winter: null };
  // the lavender through the year: leaves, flower spikes
  const LAV = { spring: ['#8fae86', '#b7a3dd'], summer: ['#7f9f7a', '#8a6cc4'], autumn: ['#93a088', '#a89a86'], winter: ['#a9b5a6', null] };

  // ---------------------------------------------------------------- shapes
  const GROUND = 384;
  const BARN = { x0: 10, x1: 246, y0: 214 };
  const ROOF_D = 'M0 216 L36 156 H220 L256 216Z';
  const WIN = { x: 26, y: 262, w: 128, h: 108 };
  const DOOR = { x: 182, y: 288, w: 48, h: 96 };
  // the bottle kiln: its body, its neck (the chimney) and the iron door
  const KILN_D = 'M262 384 C258 350 266 318 292 292 Q305 279 307 262 H341 Q343 279 356 292 C382 318 390 350 386 384Z';
  const NECK_D = 'M307 263 L311 152 H337 L341 263Z';
  const KDOOR_D = 'M308 384 V352 Q324 334 340 352 V384Z';
  const YARD_D = 'M0 384 H400 V468 Q300 463 200 467 T0 465Z';
  // the kiln's body is round: where its sides are at a height
  const KX = { 304: 281, 330: 267, 358: 261.5 };
  const kx = (y) => KX[y];

  // little css of our own: swaying lavender, bobbing chimes, a twitching tail
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .qc-sway{animation:qcsway 4.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes qcsway{from{transform:skewX(-3deg)}to{transform:skewX(3deg)}}
      #scene .qc-chime{animation:qcchime 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes qcchime{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
      #scene .qc-flag{animation:qcflag 3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes qcflag{from{transform:skewX(-5deg)}to{transform:skewX(6deg)}}
      #scene .qc-tail{animation:qctail 5s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 100%}
      @keyframes qctail{0%,80%,100%{transform:rotate(0)}88%{transform:rotate(14deg)}94%{transform:rotate(-6deg)}}
      #scene .qc-heat{animation:qcheat 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes qcheat{0%{opacity:0;transform:translateY(4px) scaleX(.8)}40%{opacity:.55}100%{opacity:0;transform:translateY(-10px) scaleX(1.2)}}
      #scene .qc-glow{animation:qcglow 2.2s ease-in-out infinite alternate}
      @keyframes qcglow{from{opacity:.75}to{opacity:1}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      grass: GRASS[SEASON].map((c) => (winter() ? c : U.mix(c, '#a3a07c', k))),
      brick: U.mix('#c0704f', '#9a8a7c', k * 1.2),
      kiln: U.mix('#b8664a', '#8f8378', k * 1.3),
      stone: U.mix('#e6dac4', '#b3aa9a', k),
      wood: U.mix('#a77b56', '#8a8172', k * 1.4),
      cream: U.mix('#f4ead6', '#c9c0b0', k),
    };
  }

  function defs() {
    const b = K.brick, ob = U.mix(b, '#8a8476', 0.45), kb = K.kiln, okb = U.mix(kb, '#6f6a62', 0.4);
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#ecdcc4'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const cobble = (cols, gap, moss) => `<rect width="22" height="16" fill="${gap}"/>
        <ellipse cx="5.6" cy="4.2" rx="4.6" ry="3.2" fill="${cols[0]}"/><ellipse cx="16" cy="4" rx="5" ry="3.3" fill="${cols[1]}"/>
        <ellipse cx="0.4" cy="12" rx="4.6" ry="3.2" fill="${cols[1]}"/><ellipse cx="22" cy="12" rx="4.6" ry="3.2" fill="${cols[1]}"/><ellipse cx="11" cy="12" rx="5" ry="3.2" fill="${cols[2]}"/>
        <path d="M3 2.6 q2 -1 4 0 M14 2.4 q2 -1 4 0 M9 10.4 q2 -1 4 0" stroke="#fff" stroke-width="0.6" opacity="0.3" fill="none"/>
        ${moss ? '<circle cx="11" cy="7.6" r="1.5" fill="#6f8a3e"/><circle cx="2" cy="7.8" r="1.2" fill="#7a9444"/><circle cx="20" cy="15.6" r="1.3" fill="#6f8a3e"/>' : ''}`;
    const cb = winter() ? ['#d7dce1', '#cdd3d9', '#e1e5e9'] : ['#c9bba4', '#b9ab94', '#d3c6b0'];
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
      <pattern id="${id('Kiln')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(kb, false)}</pattern>
      <pattern id="${id('KilnOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(okb, false)}</pattern>
      <pattern id="${id('Neck')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(kb, false)}</pattern>
      <pattern id="${id('NeckOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(okb, true)}</pattern>
      <pattern id="${id('Tiles')}" width="12" height="9" patternUnits="userSpaceOnUse">
        <rect width="12" height="9" fill="${PCT > 0.35 ? '#b45e40' : '#8f6a58'}"/><path d="M0 8.4 H12 M6 0 V8.4" stroke="${PCT > 0.35 ? '#94482f' : '#735446'}" stroke-width="0.8"/>
        <path d="M0.6 1 h4.6 M6.6 1 h4.6" stroke="#fff" stroke-width="0.7" opacity="0.15"/>${PCT > 0.35 ? '' : '<circle cx="3" cy="4" r="1.5" fill="#7a8a4a" opacity="0.6"/>'}
      </pattern>
      <pattern id="${id('Cobble')}" width="22" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.8)">${cobble(cb, winter() ? '#bfc6cd' : '#9c8e78', false)}</pattern>
      <pattern id="${id('CobbleOld')}" width="22" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.8)">${cobble(['#a9a58c', '#9c9a80', '#b1ab92'], '#6f7a4a', true)}</pattern>
      <pattern id="${id('Boards')}" width="40" height="7" patternUnits="userSpaceOnUse">
        <rect width="40" height="7" fill="#c39566"/><path d="M0 6.6 H40 M26 0 V6.6" stroke="#9c6f45" stroke-width="0.7"/><path d="M3 3 h14" stroke="#d6aa7c" stroke-width="0.6"/>
      </pattern>
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
      <pattern id="${id('ClayDust')}" width="18" height="14" patternUnits="userSpaceOnUse">
        <ellipse cx="5" cy="4" rx="4" ry="1.6" fill="#d9d0c2" opacity="0.8"/><ellipse cx="13" cy="10" rx="5" ry="1.8" fill="#cfc4b4" opacity="0.75"/><circle cx="15" cy="3" r="0.9" fill="#b7a998"/><circle cx="3" cy="11" r="1" fill="#b7a998"/>
      </pattern>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a9a84"/><stop offset="0.7" stop-color="#7f8462"/><stop offset="1" stop-color="#5f6644"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1a" stop-opacity="0.32"/><stop offset="1" stop-color="#3b2a1a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('Lane')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${winter() ? '#dfe3e6' : '#c9b18c'}"/><stop offset="1" stop-color="${winter() ? '#d2d8dc' : '#b89c76'}"/></linearGradient>
      <radialGradient id="${id('Soot')}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#1f1a17" stop-opacity="0.85"/><stop offset="0.6" stop-color="#2b2420" stop-opacity="0.5"/><stop offset="1" stop-color="#2b2420" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('GlowKiln')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffb35c" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ff9a3c" stop-opacity="0.32"/><stop offset="1" stop-color="#ff8a2c" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('GlowPane')}" cx="0.5" cy="0.6" r="0.75">
        <stop offset="0" stop-color="#ffe6a8" stop-opacity="0.5"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0.24"/>
      </radialGradient>
      ${['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'].map((c, i) => `<radialGradient id="${id('GlowB' + i)}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe8"/><stop offset="0.35" stop-color="${c}"/><stop offset="0.5" stop-color="${c}" stop-opacity="0.35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
      <clipPath id="${id('Win')}"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/></clipPath>
      <clipPath id="${id('KilnClip')}"><path d="${KILN_D}"/></clipPath>
    </defs>`;
  }

  // --------------------------------------------------------- sky and fields
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="280" fill="${url('Sky')}"/>
    <circle cx="62" cy="62" r="46" fill="${url('Sun')}"/><circle cx="62" cy="62" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="226" cy="60" rx="25" ry="10"/><ellipse cx="245" cy="53" rx="17" ry="12"/><ellipse cx="263" cy="61" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="120" cy="104" rx="19" ry="7"/><ellipse cx="135" cy="99" rx="13" ry="9"/><ellipse cx="149" cy="105" rx="14" ry="6"/></g>`;
  }
  function bgTree(x, y, r, which) {
    if (!CANOPY[SEASON]) {
      return `<g stroke="#7a6252" stroke-linecap="round" fill="none"><path d="M${x} ${f1(y + r * 0.9)} V${f1(y - r * 0.4)}" stroke-width="2.6"/>
        <path d="M${x} ${y} l${f1(-r * 0.4)} ${f1(-r * 0.4)} M${x} ${f1(y - r * 0.15)} l${f1(r * 0.45)} ${f1(-r * 0.35)}" stroke-width="1.4"/></g>`;
    }
    const col = CANOPY[SEASON][which];
    let s = `<g><rect x="${x - 2}" y="${y}" width="4" height="${f1(r * 0.9)}" fill="#6b5240"/>${dot(x, y - r * 0.15, r * 0.62, col)}${dot(x - r * 0.35, y + r * 0.1, r * 0.45, col)}${dot(x + r * 0.35, y + r * 0.08, r * 0.48, U.shade(col, -0.1))}${dot(x - r * 0.15, y - r * 0.35, r * 0.3, U.shade(col, 0.15))}`;
    if (SEASON === 'spring' && CANOPY.spring[2]) s += [[-0.3, -0.2], [0.2, -0.3], [0.35, 0.1], [-0.1, 0.15], [0, -0.45]].map(([a, c]) => dot(x + a * r, y + c * r, r * 0.12, '#f7d3de')).join('');
    return s + '</g>';
  }
  // rolling fields with hedgerows, a field of stripes and trees in the hedges
  function far() {
    const H = HILLS[SEASON];
    let s = `<path d="M0 182 Q80 160 170 172 T330 160 T400 168 V230 H0Z" fill="${H[0]}"/>`;
    // a striped field on the far slope: ploughed, sown, stubble or snow
    const stripe = { spring: '#a8c78a', summer: '#e3d27e', autumn: '#c99a62', winter: '#e8eef3' }[SEASON];
    for (let i = 0; i < 6; i++) s += `<path d="M${150 + i * 26} 176 Q${200 + i * 26} 172 ${250 + i * 26} 178" stroke="${stripe}" stroke-width="3" fill="none" opacity="0.7"/>`;
    s += line('M0 196 Q100 186 200 192 T400 186', winter() ? '#c9d2da' : '#6f8a4f', 3.4, 0.8);
    s += bgTree(150, 182, 13, 0) + bgTree(196, 178, 10, 1) + bgTree(372, 176, 15, 0) + bgTree(352, 184, 10, 1);
    s += `<path d="M-10 206 C70 194 150 192 230 200 C300 206 350 196 410 202 V230 H-10Z" fill="${H[1]}"/>`;
    s += `<path d="M-10 222 C80 212 200 214 280 220 C340 224 370 216 410 220 V240 H-10Z" fill="${H[2]}"/>`;
    return s;
  }
  function ground() {
    const g = K.grass, r = U.rng(41);
    let s = `<rect x="0" y="226" width="400" height="314" fill="${g[0]}"/>`;
    for (let i = 0; i < 16; i++) s += oval(r() * 400, 236 + r() * 140, 10 + r() * 22, 3 + r() * 4, r() < 0.5 ? g[1] : g[2], 0.5);
    return s;
  }
  // an old oak behind the barn
  function oak() {
    const C = CANOPY[SEASON];
    let s = `<path d="M262 236 Q266 200 260 170 M262 200 Q276 186 286 176 M261 186 Q248 176 242 166" stroke="#6b5240" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (!C) return s + line('M240 166 l-6 -6 M286 176 l6 -6 M260 170 l2 -8', '#6b5240', 2) + line('M244 165 q14 -6 26 2', SNOW, 1.6);
    s += `${dot(262, 166, 26, C[0])}${dot(240, 178, 18, C[1])}${dot(286, 176, 20, C[0])}${dot(270, 150, 16, U.shade(C[1], 0.1))}${dot(250, 156, 14, U.shade(C[0], 0.12))}`;
    if (SEASON === 'spring') s += [[248, 160], [272, 150], [286, 170], [258, 176], [238, 176], [266, 166]].map(([x, y]) => dot(x, y, 2.4, '#f7d3de')).join('');
    return s;
  }

  // --------------------------------------------------------------- the barn
  function barn() {
    const { x0, x1, y0 } = BARN;
    const wall = PCT > 0.3 ? url('Brick') : url('BrickOld');
    let s = shadow(128, GROUND + 1, 126, 3);
    s += `${box(x0, y0, x1 - x0, GROUND - y0, wall)}${box(x0, y0, x1 - x0, 4, '#000', ' opacity="0.14"')}${box(x0, GROUND - 8, x1 - x0, 8, U.shade(K.brick, -0.2))}`;
    // brick quoins at the corners
    for (let y = y0 + 4; y < GROUND - 8; y += 12) s += box(x0, y, 8, 6, U.shade(K.brick, 0.12)) + box(x1 - 8, y + 6, 8, 6, U.shade(K.brick, 0.12));
    // the roof, a little cupola for air on top, and the gutter
    s += `<path d="${ROOF_D}" fill="${url('Tiles')}"/><path d="M36 156 H220" stroke="#7d3f2a" stroke-width="3" stroke-linecap="round"/><path d="M0 216 H256" stroke="#6b5240" stroke-width="2"/>`;
    s += `${box(118, 136, 20, 20, K.cream)}${box(121, 140, 4, 13, '#6b5a48')}${box(131, 140, 4, 13, '#6b5a48')}<path d="M114 137 L128 124 L142 137Z" fill="#94482f"/>`;
    // a little thrown pot as the finial
    s += `${line('M128 124 V120', '#3d3d42', 1)}<path d="M124.6 120 Q123 115 125.4 112 H130.6 Q133 115 131.4 120Z" fill="#c4704b"/>${box(124.6, 110.6, 6.8, 1.8, '#b4603e', ' rx="0.8"')}`;
    if (winter()) s += `<path d="M2 213 L37 158 H219 L254 213 Q200 205 128 210 Q60 205 2 213Z" fill="${SNOW}" opacity="0.92"/><path d="M114 136 L128 123 L142 136Z" fill="${SNOW}"/>`;
    if (PCT < 0.4) s += line('M60 170 l10 4 l-4 6 M180 180 l-8 6', '#6b5a48', 0.8) + `<g transform="rotate(26 92 196)">${box(86, 192, 10, 6, '#94482f')}</g>`;
    // a downpipe between the window and the door
    s += `${box(166, 216, 4, GROUND - 216, '#5f6870')}${box(164, GROUND - 6, 10, 4, '#4a5259', ' rx="1"')}`;
    // a lamp over the barn door
    s += `${line('M206 270 V264 h8', '#3d3d42', 1.2)}${box(211, 264, 6, 9, '#2f2f33', ' rx="1"')}${box(212.2, 266, 3.6, 5, PCT > 0.5 ? '#fde7a3' : '#a39c88')}`;
    return s;
  }
  // the long border of the field and the yard wall at the left
  function hedge() {
    const C = { spring: '#6f9d5c', summer: '#5f9a4c', autumn: '#a58a3a', winter: '#c9d2d8' }[SEASON];
    let s = '';
    for (let x = 248; x < 400; x += 14) s += dot(x, 236 + ((x * 7) % 5), 10, x % 28 ? C : U.shade(C, 0.08));
    return s;
  }

  // -------------------------------------------------------- the workshop
  // the back wall and the floor, seen through the window
  function inside() {
    const { x, y, w, h } = WIN;
    let s = `${box(x, y, w, h, '#efe2c8')}${box(x, y + 66, w, h - 66, '#d8c6a6')}`;
    // the back wall's plaster and a beam
    s += box(x, y, w, 7, '#8a6142') + line(`M${x + 20} ${y + 16} q4 8 0 14 M${x + 96} ${y + 22} q3 6 0 12`, '#e3d3b6', 0.8);
    return s;
  }
  function floor(st) {
    const p = pend(st, 'floor'), ok = st.floor;
    const { x, w } = WIN, y = WIN.y + 76, h = WIN.h - 76;
    let s = `<g data-part="floor">${box(x, y, w, h, url('Boards'))}${box(x, y, w, 2, '#000', ' opacity="0.12"')}`;
    if (!ok) {
      s += `${box(x, y, w, h, url('ClayDust'))}${box(x, y, w, h, '#d9d0c2', ' opacity="0.35"')}`;
      // clay footprints across the boards
      for (const [fx, fy, a] of [[50, 360, -10], [60, 352, -14], [96, 362, 8], [108, 356, 4], [136, 364, -6]]) s += `<ellipse cx="${fx}" cy="${fy}" rx="3.4" ry="1.6" fill="#a39482" opacity="0.7" transform="rotate(${a} ${fx} ${fy})"/>`;
    } else {
      // a striped rag rug by the wheel
      s += `${oval(104, 361, 26, 5, '#a6d3d4')}${oval(104, 361, 19, 3.4, '#f6efe3')}${oval(104, 361, 12, 2, '#efb4ae')}`;
    }
    if (p === 'grow') s += box(x, y, w, h, url('ClayDust'), ' opacity="0.7"');
    else if (p === 'leaves') s += oval(40, 366, 3, 1.4, '#d9822b') + oval(52, 368, 2.8, 1.3, '#c4462f') + oval(146, 366, 3, 1.4, '#e9b23c');
    else if (p === 'snow' || p === 'frost') s += box(x, WIN.y + WIN.h - 6, w, 6, '#e8eef3', ' opacity="0.8"');
    return s + '</g>';
  }
  // the glaze shelves on the back wall, with their jars
  const JARS = ['#3f7ac9', '#e2574c', '#f2c230', '#6f9a6a', '#bba9df', '#e9962c', '#4e9a9a', '#efb4ae'];
  function shelves(st) {
    const p = pend(st, 'shelves'), ok = st.shelves, { x } = WIN;
    let s = '<g data-part="shelves">';
    const rows = [281, 301, 321];
    rows.forEach((sy, ri) => {
      s += `${box(x + 6, sy, 116, 3.4, ok ? '#a77b56' : '#8a7e70')}${box(x + 6, sy + 3.4, 116, 1.2, '#000', ' opacity="0.15"')}`;
      for (let i = 0; i < 9; i++) {
        if (!ok && (ri * 9 + i) % 7 === 3) continue;
        const jx = x + 12 + i * 12.6, col = JARS[(i + ri * 3) % JARS.length], tall = (i + ri) % 3 === 0;
        const jh = tall ? 13 : 10, jc = ok ? col : U.mix(col, '#b8b0a2', 0.75);
        s += `<path d="M${f1(jx - 4)} ${sy} v${-jh + 3} q0 -2 2 -2.6 h4 q2 0.6 2 2.6 v${jh - 3}Z" fill="${jc}"/>${box(jx - 3, sy - jh - 1.4, 6, 2, ok ? '#6b5a48' : '#8a8172')}`;
        if (ok) s += box(jx - 2.6, sy - jh + 5, 5.2, 3.4, '#fbf6ea', ' rx="0.5"') + `<path d="M${f1(jx - 3)} ${f1(sy - jh + 2)} v${f1(jh - 4)}" stroke="#fff" stroke-width="0.8" opacity="0.4"/>`;
      }
    });
    if (!ok) {
      // dust, cobwebs, and a jar that fell and spilt
      s += box(x + 6, 270, 116, 54, url('Dusty'), ' opacity="0.35"');
      s += line(`M${x + 2} ${WIN.y + 8} l12 10 M${x + 2} ${WIN.y + 8} l4 14 M${x + 2} ${WIN.y + 8} l14 4 M${x + 6} ${WIN.y + 16} q4 -3 8 -1`, '#f4f1ea', 0.5, 0.9);
      s += line(`M${x + 126} ${WIN.y + 8} l-12 10 M${x + 126} ${WIN.y + 8} l-3 13 M${x + 118} ${WIN.y + 18} q4 -3 7 0`, '#f4f1ea', 0.5, 0.9);
      s += `<g transform="rotate(84 ${x + 70} 330)">${box(x + 66, 322, 8, 10, '#9fb0c6')}</g>${oval(x + 76, 333, 7, 1.6, '#7b8ba3', 0.7)}`;
    }
    if (p === 'grow') s += box(x + 6, 270, 116, 54, url('Dusty'), ' opacity="0.3"');
    return s + '</g>';
  }
  // the potter's wheel: a splash tray, the wheel head and a stool
  function wheel(st) {
    const p = pend(st, 'wheel'), ok = st.wheel;
    const metal = ok ? '#5f7f8a' : '#7d7a72', tray = ok ? '#8fa9b2' : '#9a9384';
    let s = `<g data-part="wheel">${shadow(64, 362, 30, 3)}`;
    // the stool behind, the legs and the pedal
    s += `${box(78, 340, 4, 20, ok ? '#8a6142' : '#7d6e5e')}${box(92, 340, 4, 20, ok ? '#8a6142' : '#7d6e5e')}${oval(87, 339, 12, 3.4, ok ? '#a77b56' : '#8f877a')}`;
    s += `${box(46, 345, 4, 16, metal)}${box(78, 345, 4, 16, metal)}${box(40, 356, 10, 4, '#3d3d42', ' rx="1"')}`;
    // the tray and the wheel head
    s += `<path d="M36 338 Q36 350 64 351 Q92 350 92 338Z" fill="${tray}"/>${oval(64, 338, 28, 6.6, U.shade(tray, 0.12))}${oval(64, 338, 23, 5, '#3d3d42', 0.2)}`;
    s += `${oval(64, 336.6, 15, 3.6, ok ? '#c8ccce' : '#9c9a92')}${oval(64, 335.4, 15, 3.6, ok ? '#e2e6e8' : '#b1aca0')}`;
    if (!ok) {
      // dried clay caked all over
      s += `${oval(48, 340, 7, 2.6, '#a8978a')}${oval(80, 341, 6, 2.2, '#a8978a')}${oval(60, 335, 6, 1.6, '#b9a898')}${oval(71, 336, 4, 1.4, '#9c8b7c')}`;
      s += line('M38 342 q2 6 0 12 M90 342 q-1 5 1 10 M54 349 q1 4 0 8', '#a8978a', 2.2) + `${oval(46, 359, 6, 1.6, '#b9a898')}${oval(84, 360, 5, 1.4, '#b9a898')}`;
    } else {
      // a sponge and a little bowl of water on the edge of the tray
      s += `${box(84, 333, 7, 4, '#f2d88a', ' rx="1.6"')}${oval(41, 334, 5, 1.8, '#d98b63')}${oval(41, 333.6, 3.6, 1.1, '#8fc6dd')}`;
    }
    if (p === 'grow') s += `${oval(52, 339, 6, 2, '#a8978a')}${oval(78, 340, 5, 1.8, '#a8978a')}`;
    return s + '</g>';
  }
  // on the wheel head: a lump of clay, or a bowl thrown at last
  function throwBowl(st) {
    const p = pend(st, 'throw'), ok = st.throw && p !== 'grow';
    let s = '<g data-part="throw">';
    if (!st.throw) {
      s += `<path d="M55 336 Q52 326 58 322 Q64 318 70 323 Q75 328 72 336Z" fill="#a8937e"/><path d="M58 324 q4 -2 8 1" stroke="#c4b09a" stroke-width="1" fill="none"/>${oval(66, 330, 2, 1, '#8f7c68')}`;
    } else if (!ok) {
      // a fresh lump, waiting to be thrown again
      s += `<path d="M56 336 Q55 328 64 326 Q73 328 72 336Z" fill="#b9a288"/>`;
    } else {
      // a bowl with a cream glaze and a blue band, on the wheel
      s += `<path d="M50 323 Q51 336 64 337 Q77 336 78 323Z" fill="#f2ead6"/>${oval(64, 323, 14, 3.2, '#e6dcc4')}${oval(64, 323.4, 11, 2.2, '#cbbd9f')}
        <path d="M51.4 328 Q64 331 76.6 328" stroke="#3d6fae" stroke-width="2" fill="none"/>${line('M54 325 q1 6 4 9', '#fff', 0.9, 0.6)}`;
    }
    if (p === 'leaves') s += oval(60, 336, 2.6, 1.2, '#d9822b');
    return s + '</g>';
  }
  // the tea set on the work table: plain biscuit, or glazed with a pattern
  function glaze(st) {
    const p = pend(st, 'glaze'), ok = st.glaze && p !== 'grow';
    let s = `<g data-part="glaze">${box(110, 340, 42, 4, '#a77b56')}${box(113, 344, 3, 18, '#8a6142')}${box(146, 344, 3, 18, '#8a6142')}${shadow(131, 340, 20, 1.2)}`;
    const body = ok ? '#4e86b8' : '#e9dcc8', rim = ok ? '#3d6fae' : '#d8c8b0', spot = ok ? '#fbf6ea' : null;
    // the teapot
    s += `<path d="M118 340 Q114 332 120 326 Q127 322 134 326 Q140 332 136 340Z" fill="${body}"/>${oval(127, 325, 6, 1.6, rim)}${dot(127, 322.6, 1.6, rim)}
      <path d="M136 330 q6 -2 6 -7" stroke="${body}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M118 329 q-5 1 -3 7" stroke="${rim}" stroke-width="1.6" fill="none"/>`;
    // the cups
    for (const cx of [143, 149]) s += `<path d="M${cx - 3} 334 h6 l-0.8 6 h-4.4Z" fill="${body}"/>${oval(cx, 334, 3, 0.9, rim)}`;
    if (spot) s += [[122, 332], [127, 336], [132, 331], [125, 328], [130, 337], [143, 337], [149, 337]].map(([a, b]) => dot(a, b, 0.9, spot)).join('') + line('M117 336 Q127 339 137 336', '#fbf6ea', 0.8, 0.8);
    else s += line('M120 332 q3 2 6 0', '#c9b79c', 0.7) + oval(146, 341, 3, 0.8, '#000', 0.08);
    return s + '</g>';
  }
  function workshopWindow(st) {
    const p = pend(st, 'window'), ok = st.window, { x, y, w, h } = WIN;
    const frame = ok ? '#f6efe0' : '#a89f8e';
    let s = '<g pointer-events="none">';
    if (!ok) {
      s += `${box(x, y, w, h, url('Grime'), ' opacity="0.6"')}<path d="M${x + 10} ${y + h} q24 -36 52 -10 M${x + 70} ${y + h - 4} q24 -30 50 -8" stroke="#dfe3d4" stroke-width="7" fill="none" opacity="0.22" stroke-linecap="round"/>`;
      s += line(`M${x + 100} ${y + 4} l-8 14 l6 6 l-9 16`, '#eef0e8', 0.8, 0.9) + line(`M${x + 2} ${y + 2} q10 6 20 0 M${x + 2} ${y + 2} l14 16`, '#eef0e8', 0.5, 0.85);
    } else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.84"') + line(`M${x + 4} ${y + h - 4} q8 -14 4 -26 M${x + w - 4} ${y + h - 4} q-10 -12 -6 -26`, '#fff', 1.3);
    else if (p === 'grow') s += box(x, y, w, h, url('Dusty'), ' opacity="0.42"');
    else s += `<path d="M${x + 8} ${y + h} L${x + 44} ${y} H${x + 58} L${x + 22} ${y + h}Z M${x + 84} ${y + h} L${x + 110} ${y} H${x + 117} L${x + 91} ${y + h}Z" fill="#fff" opacity="0.13"/>`;
    s += '</g>';
    s += `<g data-part="window"><path d="M${x} ${y} H${x + w} V${y + h} H${x}Z" stroke="${frame}" stroke-width="4" fill="none"/>
      <path d="M${f1(x + w / 3)} ${y} V${y + h} M${f1(x + (2 * w) / 3)} ${y} V${y + h} M${x} ${y + 40} H${x + w}" stroke="${frame}" stroke-width="2.2"/>`;
    // a brick arch over the window and a stone sill
    s += `<path d="M${x - 4} ${y - 2} Q${x + w / 2} ${y - 14} ${x + w + 4} ${y - 2}" stroke="${U.shade(K.brick, -0.15)}" stroke-width="5" fill="none" stroke-dasharray="4 1"/>`;
    s += box(x - 5, y + h + 1, w + 10, 5, K.stone, ' rx="1"') + box(x - 5, y + h + 5, w + 10, 1.4, '#000', ' opacity="0.12"');
    if (!ok) s += `<path d="M${x + w / 3} ${y + 52} l-3 10" stroke="${frame}" stroke-width="1"/>`;
    if (p === 'leaves') s += oval(x + 6, y + h - 2, 3.4, 1.6, '#d9822b') + oval(x + 16, y + h + 1, 3, 1.4, '#c4462f') + oval(x + w - 8, y + h, 3.2, 1.5, '#e9b23c');
    if (winter() || p === 'snow') s += box(x - 5, y + h - 0.4, w + 10, 2.4, SNOW, ' rx="1"') + `<path d="M${x - 4} ${y - 4} Q${x + w / 2} ${y - 16} ${x + w + 4} ${y - 4}" stroke="${SNOW}" stroke-width="2" fill="none"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------- the door and the sign
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const c = ok ? C.potteryDoor : U.mix(C.potteryDoor, '#a59e90', 0.62), dk = U.shade(c, -0.28), { x, y, w, h } = DOOR;
    let s = `<g data-part="door">${box(x - 3, y - 3, w + 6, h + 3, U.shade(K.brick, -0.25))}${box(x, y, w, h, '#2b2420')}`;
    // the rail it slides on
    s += `${box(x - 8, y - 9, w + 22, 3, '#3d3d42')}${dot(x + 8, y - 7.6, 2.4, '#2f2f33')}${dot(x + w - 8, y - 7.6, 2.4, '#2f2f33')}`;
    const lean = ok ? '' : ` transform="rotate(2.4 ${x + 8} ${y - 6})"`;
    let planks = '';
    for (let k = 1; k < 6; k++) planks += `M${f1(x + (k * w) / 6)} ${y} V${y + h} `;
    s += `<g${lean}>${box(x, y, w, h, c)}<path d="${planks}" stroke="${dk}" stroke-width="0.8"/>
      <path d="M${x + 3} ${y + 6} H${x + w - 3} M${x + 3} ${y + h - 8} H${x + w - 3} M${x + 4} ${y + h - 8} L${x + w - 4} ${y + 6}" stroke="${ok ? U.shade(c, 0.14) : dk}" stroke-width="4"/>
      <path d="M${x + 3} ${y + 6} H${x + w - 3} M${x + 3} ${y + h - 8} H${x + w - 3}" stroke="${dk}" stroke-width="0.6"/>`;
    s += `${box(x + w - 9, y + 44, 5, 12, ok ? '#2f2f33' : '#5f574c', ' rx="2"')}`;
    if (ok) s += `${box(x + 2, y + 4, 10, 4, '#2f2f33', ' rx="1"')}${box(x + 2, y + h - 10, 10, 4, '#2f2f33', ' rx="1"')}${dot(x + w / 2, y + 26, 4.4, '#fbf6ea')}${dot(x + w / 2, y + 26, 3.2, '#d98b63')}`;
    else {
      const r = U.rng(27);
      for (let i = 0; i < 10; i++) s += oval(x + 4 + r() * (w - 8), y + 6 + r() * (h - 14), 2 + r() * 3, 1 + r() * 2, '#d8cfbf', 0.75);
      s += `${box(x + 24, y + 58, 8, 22, '#2b2420')}${line(`M${x + 14} ${y} l-2 9 l3 6`, '#3a302a', 0.8)}`;
    }
    s += '</g>';
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5"');
    else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.45"');
    else if (p === 'leaves') s += oval(x + 8, y + h - 2, 3.4, 1.6, '#d9822b') + oval(x + 30, y + h - 1, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += box(x - 9, y - 11, w + 24, 2.2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // a little thrown pot, for the sign
  function potIcon(cx, cy, k, col) {
    return `<path d="M${f1(cx - 4.4 * k)} ${f1(cy - 5 * k)} Q${f1(cx - 7 * k)} ${f1(cy + 1 * k)} ${f1(cx - 3.6 * k)} ${f1(cy + 5 * k)} H${f1(cx + 3.6 * k)} Q${f1(cx + 7 * k)} ${f1(cy + 1 * k)} ${f1(cx + 4.4 * k)} ${f1(cy - 5 * k)}Z" fill="${col}"/>
      <rect x="${f1(cx - 5 * k)}" y="${f1(cy - 6.4 * k)}" width="${f1(10 * k)}" height="${f1(1.8 * k)}" rx="${f1(0.8 * k)}" fill="${col}"/>`;
  }
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const c = ok ? C.potterySign : U.mix(C.potterySign, '#a59e90', 0.6), tx = ok ? ink(c) : '#efe9dc';
    const x = 38, y = 224, w = 104, h = 26;
    let s = `<g data-part="sign"><g${ok ? '' : ' transform="rotate(-3 90 237)"'}>${box(x + 1.6, y + 2, w, h, '#000', ' rx="3" opacity="0.15"')}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}" stroke="${ok ? U.shade(c, -0.3) : '#8a8070'}" stroke-width="1.2"/>`;
    if (ok) s += `<rect x="${x + 2.6}" y="${y + 2.6}" width="${w - 5.2}" height="${h - 5.2}" rx="2" fill="none" stroke="${tx}" stroke-width="0.7" opacity="0.8"/>`;
    s += `<g${ok ? '' : ' opacity="0.42"'}>${potIcon(x + 13, y + 13, 1, tx)}${potIcon(x + w - 13, y + 13, 1, tx)}
      <text x="${x + w / 2}" y="${y + 13.6}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="900" letter-spacing="1.4" fill="${tx}">POTTERY</text>
      <text x="${x + w / 2}" y="${y + 21.6}" text-anchor="middle" font-family="${FONT}" font-size="5.6" font-weight="800" letter-spacing="0.8" fill="${tx}">· KILN LANE ·</text></g>`;
    if (!ok) s += `${oval(x + 20, y + 6, 4, 2.6, '#9aa36a', 0.8)}${oval(x + 84, y + 20, 5, 2.2, '#9aa36a', 0.7)}${oval(x + 64, y + 7, 3, 2, U.mix(C.potterySign, '#a59e90', 0.75), 0.9)}${line(`M${x + 70} ${y} l-3 8 l2 6`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'frost') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (p === 'leaves') s += oval(x + 8, y + 22, 3.4, 1.6, '#d9822b') + oval(x + 92, y + 6, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += `<rect x="${x - 1}" y="${y - 1.6}" width="${w + 2}" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    return s + '</g></g>';
  }

  // --------------------------------------------------------------- the kiln
  function kiln(st) {
    const p = pend(st, 'kiln'), ok = st.kiln;
    let s = `<g data-part="kiln">${shadow(324, GROUND + 1, 66, 3.4)}<path d="${KILN_D}" fill="${ok ? url('Kiln') : url('KilnOld')}"/>`;
    // the curve of the bottle: light on the left, shade on the right
    s += `<g clip-path="${url('KilnClip')}"><path d="M262 384 C258 350 266 318 292 292 L304 300 C286 322 278 352 280 384Z" fill="#fff" opacity="0.12"/><path d="M386 384 C390 350 382 318 356 292 L346 300 C364 322 372 352 368 384Z" fill="#000" opacity="0.14"/></g>`;
    // the iron bands round its belly
    for (const y of [304, 330, 358]) { const a = kx(y), b = 648 - a; s += `<path d="M${f1(a)} ${y} Q324 ${y + 5} ${f1(b)} ${y}" stroke="${ok ? '#3d3d42' : '#6d5a4a'}" stroke-width="2.4" fill="none"/>`; }
    // the arch round the door
    s += `<path d="M304 384 V351 Q324 330 344 351 V384" stroke="${ok ? U.shade(K.kiln, -0.2) : '#5f5048'}" stroke-width="4" fill="none"/>`;
    if (!ok) {
      // soot from years of firing, up the front and over the arch
      s += `<g clip-path="${url('KilnClip')}">${oval(324, 328, 30, 22, url('Soot'))}${oval(300, 352, 12, 18, url('Soot'))}${oval(348, 354, 12, 16, url('Soot'))}${oval(324, 296, 18, 12, url('Soot'))}</g>`;
      s += line('M314 334 q-2 -14 2 -26 M332 332 q3 -12 -1 -24', '#2b2420', 2.4, 0.4) + line('M280 320 l6 6 l-2 6 M366 332 l-4 7', '#4a3a32', 0.8, 0.8);
    } else {
      s += line('M296 300 q8 -4 14 0', '#fff', 1, 0.3);
    }
    if (p === 'grow') s += `<g clip-path="${url('KilnClip')}">${oval(324, 330, 24, 16, url('Soot'))}</g>`;
    else if (p === 'frost') s += `<path d="${KILN_D}" fill="${url('Frost')}" opacity="0.35"/>`;
    else if (p === 'leaves') s += oval(276, 382, 3.4, 1.6, '#d9822b') + oval(360, 380, 3, 1.4, '#c4462f') + oval(370, 383, 3, 1.4, '#e9b23c');
    if (winter() || p === 'snow') s += `<path d="M292 293 Q305 280 307 266 H341 Q343 280 356 293 Q340 284 324 288 Q308 284 292 293Z" fill="${SNOW}" opacity="0.92"/>`;
    return s + '</g>';
  }
  // the kiln's neck, the tall chimney
  function chimney(st) {
    const p = pend(st, 'chimney'), ok = st.chimney && p !== 'grow';
    let s = `<g data-part="chimney"><path d="${NECK_D}" fill="${st.chimney ? url('Neck') : url('NeckOld')}"/><path d="M307 263 L311 152 H316 L313 263Z" fill="#fff" opacity="0.12"/><path d="M334 152 H337 L341 263 H335Z" fill="#000" opacity="0.14"/>`;
    s += `${box(307, 146, 34, 7, st.chimney ? U.shade(K.kiln, -0.15) : '#7d6a5e', ' rx="1"')}${box(305, 142, 38, 5, st.chimney ? U.shade(K.kiln, -0.25) : '#6d5a4e', ' rx="1"')}`;
    if (!st.chimney) {
      // moss and a little tree growing out of the top
      const r = U.rng(31);
      for (let i = 0; i < 18; i++) s += oval(310 + r() * 28, 156 + r() * 100, 2.6, 1.8, U.pick(r, ['#5d7a3a', '#6f8a3e', '#7a9444']));
      s += `<path d="M330 142 q2 -8 -2 -14 M330 138 q5 -4 8 -2" stroke="#6b5240" stroke-width="1.2" fill="none"/>${dot(327, 127, 4, winter() ? '#9a8a6a' : '#6f9d5c')}${dot(338, 135, 3, winter() ? '#9a8a6a' : '#7aa866')}`;
      s += `<g transform="rotate(-24 312 142)">${box(305, 139, 10, 5, '#6d5a4e')}</g>`;
    } else if (!ok) {
      for (const [x, y] of [[314, 230], [332, 210], [320, 180], [330, 250], [316, 200]]) s += oval(x, y, 3, 2, '#6f8a3e', 0.85);
    }
    if (p === 'frost') s += `<path d="${NECK_D}" fill="${url('Frost')}" opacity="0.4"/>`;
    else if (p === 'leaves') s += oval(312, 142, 3, 1.4, '#d9822b') + oval(336, 141, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += box(304, 140, 40, 3, SNOW, ' rx="1.5"');
    return s + '</g>';
  }
  // smoke from the chimney on cold days and while the kiln is firing
  function smoke(st) {
    if (!st.chimney || !(winter() || st.firing)) return '';
    return '<g class="smoke" fill="#ffffff"><circle cx="324" cy="126" r="5" opacity="0.7"/><circle cx="330" cy="112" r="6.4" opacity="0.5"/><circle cx="326" cy="96" r="8" opacity="0.3"/></g>';
  }
  // the iron door: hanging open on cold empty shelves, or shut and firing
  function firing(st) {
    const p = pend(st, 'firing'), ok = st.firing && p !== 'grow';
    let s = '<g data-part="firing">';
    if (!ok) {
      // inside: dark, with empty kiln shelves and a cracked one
      s += `<path d="${KDOOR_D}" fill="#2b2420"/><path d="M311 364 H337 M311 374 H337" stroke="#7d6a5e" stroke-width="2"/>${box(318, 358, 3, 26, '#5f5048')}${box(328, 358, 3, 26, '#5f5048')}`;
      if (st.firing) s += `<path d="M314 362 h6 l-1 2 h-4Z M326 372 h5 l-1 2 h-3Z" fill="#cbbd9f"/>`;
      // the door swung open on its hinge
      s += `<path d="M308 352 L298 348 V386 L308 384Z" fill="#4a4a50"/><path d="M299 356 L307 357 M299 372 L307 373" stroke="#2f2f33" stroke-width="1"/>`;
      if (!st.firing) s += `<g transform="rotate(16 352 388)">${box(342, 385, 16, 3, '#9a8a7a')}</g>${oval(296, 390, 4, 1.4, '#c49a7a')}<path d="M290 388 l4 -3 l3 3Z M300 391 l3 -2 l2 3Z" fill="#c4704b"/>`;
    } else {
      // shut and latched, a red glow in the spyhole and warmth under the door
      s += `<path d="${KDOOR_D}" fill="#3d3d42"/><path d="M310 384 V353 Q324 339 338 353 V384" stroke="#55555c" stroke-width="1.2" fill="none"/>
        ${line('M312 364 H336 M312 376 H336', '#2b2b30', 1.4)}${box(334, 360, 8, 3, '#2b2b30', ' rx="1"')}${dot(304, 360, 1.6, '#2b2b30')}${dot(304, 376, 1.6, '#2b2b30')}
        <circle cx="324" cy="355" r="3.6" fill="#2b2b30"/><circle class="qc-glow" cx="324" cy="355" r="2.4" fill="#ff9a3c"/>${box(311, 382.4, 26, 1.6, '#ffb35c', ' opacity="0.8"')}`;
      // a stack of firewood beside it, with a few fired pots on top
      s += `${[[348, 380], [356, 380], [364, 380], [352, 374], [360, 374]].map(([x, y]) => `${dot(x, y, 3.6, '#8a5a3a')}${dot(x, y, 2.2, '#c49a6a')}`).join('')}`;
      s += `<path d="M350 370 q-2 -5 1 -8 h4 q3 3 1 8Z" fill="#c4704b"/><path d="M358 370 q-3 -4 0 -7 h5 q3 3 0 7Z" fill="#4e86b8"/>${dot(360.5, 366.6, 0.8, '#fbf6ea')}`;
      if (SEASON !== 'winter') s += `<g pointer-events="none">${[316, 324, 332].map((x, i) => `<path class="qc-heat" style="animation-delay:-${(i * 0.8).toFixed(1)}s" d="M${x} 336 q-2 -4 0 -8 q2 -4 0 -8" stroke="#fff" stroke-width="1" fill="none" opacity="0.4"/>`).join('')}</g>`;
    }
    if (p === 'frost') s += `<path d="${KDOOR_D}" fill="${url('Frost')}" opacity="0.35"/>`;
    else if (p === 'leaves') s += oval(316, 383, 3, 1.4, '#d9822b') + oval(330, 383.4, 2.8, 1.3, '#e9b23c');
    if (winter() || p === 'snow') s += `<path d="M310 352 Q324 338 338 352" stroke="${SNOW}" stroke-width="2" fill="none"/>`;
    return s + '</g>';
  }
  // lavender along the foot of the kiln
  function lavender(st) {
    const p = pend(st, 'lavender'), ok = st.lavender;
    const L = LAV[SEASON], r = U.rng(59);
    let s = `<g data-part="lavender"><path d="M260 382 H304 V398 Q282 401 258 397Z M344 382 H392 V397 Q368 401 344 398Z" fill="${ok ? '#6b4a34' : '#9a8466'}"/>`;
    if (!ok) {
      for (const [x0, x1] of [[262, 302], [346, 390]]) for (let i = 0; i < 5; i++) s += weed(x0 + r() * (x1 - x0), 396, 8 + r() * 6, r);
      s += oval(280, 394, 6, 1.6, '#8a7a5a', 0.6);
    } else {
      let bushes = '';
      for (const x of [268, 284, 298, 350, 366, 382]) {
        bushes += oval(x, 390, 8, 6, L[0]) + oval(x - 2, 388, 5, 3.6, U.shade(L[0], 0.1));
        if (L[1]) for (let k = -3; k <= 3; k++) bushes += line(`M${f1(x + k * 1.8)} 388 L${f1(x + k * 2.6)} ${f1(378 - Math.abs(k) * 0.6 - (k % 2) * 2)}`, U.shade(L[0], -0.15), 0.7) + oval(x + k * 2.6, 377 - Math.abs(k) * 0.6 - (k % 2) * 2, 1.1, 2.6, L[1]);
      }
      s += `<g class="qc-sway">${bushes}</g>`;
      if (p === 'grow') for (const [x0, x1] of [[262, 302], [346, 390]]) for (let i = 0; i < 3; i++) s += weed(x0 + r() * (x1 - x0), 397, 8, r);
    }
    if (p === 'leaves') s += oval(276, 394, 3.4, 1.6, '#d9822b') + oval(360, 395, 3, 1.4, '#c4462f') + oval(372, 393, 3, 1.4, '#e9b23c');
    if (winter() || p === 'snow' || p === 'frost') s += `<path d="M262 386 q10 -6 20 0 q10 -6 20 0 M346 386 q10 -6 22 0 q10 -6 20 0" stroke="${SNOW}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    return s + '</g>';
  }
  function weed(x, base, h, r) {
    const dead = winter() || SEASON === 'autumn';
    const c = dead ? U.pick(r, ['#8a7a5a', '#9a8a64', '#75684c']) : U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']);
    const k = r();
    if (k < 0.45) return line(`M${f1(x)} ${f1(base)} l-3 ${f1(-h * 0.7)} M${f1(x)} ${f1(base)} l1 ${f1(-h)} M${f1(x)} ${f1(base)} l3.4 ${f1(-h * 0.6)}`, c, 1.2);
    if (k < 0.75) return oval(x - 2.4, base - h * 0.3, 1.8, h * 0.35, c) + oval(x + 2.2, base - h * 0.25, 1.6, h * 0.3, U.shade(c, -0.1)) + line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, c, 0.9);
    return line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, c, 1) + oval(x - 2, base - h * 0.5, 2.4, 1, c) + dot(x, base - h - 1.6, 2, dead ? '#a89a7a' : '#9b6fc4');
  }

  // ------------------------------------------------------------- the yard
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard && p !== 'grow';
    let s = `<g data-part="yard"><path d="${YARD_D}" fill="${st.yard ? url('Cobble') : url('CobbleOld')}"/><path d="M0 384 H400 V388 H0Z" fill="#000" opacity="0.1"/>`;
    const tufts = (n, seed) => {
      const r = U.rng(seed);
      let t = '';
      for (let i = 0; i < n; i++) { const x = r() * 400, y = 394 + r() * 66; t += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l3 -4`, '#5f7a34', 1.2); }
      return t;
    };
    if (!st.yard) s += `<path d="${YARD_D}" fill="${url('Moss')}" opacity="0.4"/>${tufts(24, 83)}${oval(200, 440, 16, 3.4, '#7d8a8a', 0.6)}${oval(330, 454, 12, 2.6, '#7d8a8a', 0.6)}`;
    else if (!ok) s += `<path d="${YARD_D}" fill="${url('Moss')}" opacity="0.25"/>${tufts(10, 89)}`;
    if (p === 'leaves') s += `<path d="${YARD_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${YARD_D}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (p === 'frost') s += `<path d="${YARD_D}" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (winter() && st.yard) s += `<path d="M0 452 Q100 446 200 452 T400 450 V468 Q300 463 200 467 T0 465Z" fill="${SNOW}" opacity="0.9"/>`;
    return s + '</g>';
  }
  // greenware drying on the rack: a pale pot of one of a few shapes
  function greenware(x, base, k, i, col = '#efe4d0') {
    const P = (v) => f1(v);
    const shapes = [
      `M${P(x - 4 * k)} ${P(base)} Q${P(x - 5.4 * k)} ${P(base - 6 * k)} ${P(x - 3 * k)} ${P(base - 9.4 * k)} H${P(x + 3 * k)} Q${P(x + 5.4 * k)} ${P(base - 6 * k)} ${P(x + 4 * k)} ${P(base)}Z`,
      `M${P(x - 5.4 * k)} ${P(base - 6 * k)} Q${P(x - 4.4 * k)} ${P(base)} ${P(x)} ${P(base)} Q${P(x + 4.4 * k)} ${P(base)} ${P(x + 5.4 * k)} ${P(base - 6 * k)}Z`,
      `M${P(x - 3.4 * k)} ${P(base)} V${P(base - 8.6 * k)} H${P(x + 3.4 * k)} V${P(base)}Z`,
    ];
    return `<path d="${shapes[i % 3]}" fill="${col}" stroke="${U.shade(col, -0.28)}" stroke-width="0.6"/>${line(`M${P(x + 1.8 * k)} ${P(base - 6.6 * k)} v${P(4.6 * k)}`, U.shade(col, -0.12), 1.2, 0.7)}`;
  }
  const RACK = { x0: 16, x1: 118, base: 452, boards: [408, 424, 440] };
  function rack(st) {
    const p = pend(st, 'rack'), ok = st.rack;
    const { x0, x1, base, boards } = RACK, wood = ok ? '#8a6142' : '#8f877a';
    let s = `<g data-part="rack">${shadow((x0 + x1) / 2, base + 1, (x1 - x0) / 2 + 6, 2.6)}`;
    if (!ok) {
      // one leg left standing, the boards fallen in a heap
      s += `${box(x0 + 4, 404, 5, base - 404, '#8f877a')}<g transform="rotate(-22 ${x1 - 6} ${base})">${box(x1 - 9, 410, 5, base - 410, '#8a8172')}</g>`;
      s += `<g transform="rotate(8 60 448)">${box(20, 444, 84, 5, '#9a9284')}</g><g transform="rotate(-6 70 440)">${box(30, 437, 70, 5, '#8f877a')}</g>${box(40, 448, 64, 4, '#a39a8a')}`;
      s += `${oval(84, 436, 5, 2, '#c49a7a')}<path d="M78 438 l4 -4 l3 4Z M90 440 l3 -3 l2 3Z" fill="#c4704b"/>`;
    } else {
      s += `${box(x0 + 2, 394, 5, base - 394, wood)}${box(x1 - 7, 394, 5, base - 394, wood)}${box(x0 - 2, 391, x1 - x0 + 4, 4, U.shade(wood, -0.12), ' rx="1"')}`;
      boards.forEach((by, bi) => {
        s += `${box(x0, by, x1 - x0, 4.4, '#c39566', ' rx="0.8"')}${box(x0, by + 3.4, x1 - x0, 1.4, '#8a6142')}${box(x0, by + 4.8, x1 - x0, 1.2, '#000', ' opacity="0.18"')}`;
        for (let i = 0; i < 7; i++) {
          const fired = (i * 5 + bi * 3) % 7 === 2;
          s += greenware(x0 + 9 + i * 14, by, 1 + ((i + bi) % 3) * 0.14, i + bi, fired ? '#d98b63' : '#efe4d0');
        }
      });
      if (p === 'grow') s += box(x0, 394, x1 - x0, base - 394, FADE, ' opacity="0.35"');
    }
    if (p === 'leaves') s += oval(x0 + 20, RACK.boards[0] - 1, 3.4, 1.6, '#d9822b') + oval(x0 + 60, RACK.boards[1] - 1, 3, 1.4, '#c4462f') + oval(x0 + 86, RACK.boards[2] - 1, 3, 1.4, '#e9b23c');
    if (ok && (winter() || p === 'snow' || p === 'frost')) s += box(x0 + 1, 391.6, x1 - x0 - 2, 2.6, SNOW, ' rx="1.3"') + boards.map((by) => box(x0, by - 2, x1 - x0, 2, SNOW, ' rx="1"')).join('');
    if (!ok && winter()) s += box(20, 442, 84, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // clay scraps by the barn: strewn about, or swept into the bins
  function scraps(st) {
    const p = pend(st, 'scraps'), ok = st.scraps && p !== 'grow';
    let s = '<g data-part="scraps">';
    const bin = (x, base, lid, label) => `${shadow(x, base, 11, 1.6)}<path d="M${x - 9} ${base - 22} H${x + 9} L${x + 8} ${base} H${x - 8}Z" fill="#a6aeb4"/>${line(`M${x - 8.6} ${base - 15} H${x + 8.6} M${x - 8.3} ${base - 7} H${x + 8.3}`, '#8a9298', 1)}
      ${lid ? `${box(x - 10, base - 25, 20, 3.4, '#8f979d', ' rx="1.5"')}${box(x - 2.4, base - 27, 4.8, 2.4, '#6f777d', ' rx="1"')}` : ''}${label ? `${box(x - 6, base - 13.6, 12, 5.6, '#fbf6ea', ' rx="0.6"')}<text x="${x}" y="${base - 9.4}" text-anchor="middle" font-family="${FONT}" font-size="4.2" font-weight="900" fill="#6b5a48">CLAY</text>` : ''}`;
    if (!st.scraps) {
      s += `<g transform="rotate(-78 150 404)">${bin(150, 404, false, false)}</g>`;
      const r = U.rng(67);
      for (let i = 0; i < 16; i++) { const x = 30 + r() * 150, y = 390 + r() * 26; s += `<path d="M${f1(x - 3)} ${f1(y)} q0 -4 3 -4.4 q4 0.4 3.6 4.4Z" fill="${U.pick(r, ['#b39a82', '#a68a72', '#c2ab92'])}"/>`; }
    } else {
      s += bin(128, 404, true, ok) + bin(150, 405, true, false) + `${shadow(108, 404, 7, 1.4)}<path d="M102 396 h12 l-1.4 8 h-9.2Z" fill="#6f8f9a"/>${oval(108, 396, 6, 1.6, '#8fb0bb')}${oval(108, 396, 4.6, 1, '#b39a82')}`;
      if (!ok) for (const [x, y] of [[60, 400], [110, 410], [140, 396]]) s += `<path d="M${x - 3} ${y} q0 -4 3 -4.4 q4 0.4 3.6 4.4Z" fill="#b39a82"/>`;
    }
    if (winter() && st.scraps) s += box(119, 377.4, 18, 2, SNOW, ' rx="1"') + box(141, 378.4, 18, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }

  // --------------------------------------------------------------- the lane
  function lane() {
    const g = K.grass, r = U.rng(91);
    let s = `<path d="M0 465 Q100 467 200 467 T400 468 V540 H0Z" fill="${g[0]}"/>`;
    s += `<path d="M0 484 Q200 478 400 486 V540 H0Z" fill="${url('Lane')}"/><path d="M0 504 Q200 498 400 506 V516 Q200 508 0 514Z" fill="${winter() ? '#eef2f5' : g[1]}"/>`;
    s += line('M0 494 Q200 488 400 496 M0 526 Q200 520 400 528', winter() ? '#c9d0d6' : '#a88c66', 1, 0.6);
    const cols = { spring: ['#f2d84a', '#ffffff', '#f7c3d6'], summer: ['#ffffff', '#9b7fd1', '#f2c230', '#e2574c'], autumn: ['#e9962c', '#d8c27a'], winter: null }[SEASON];
    for (let i = 0; i < 30; i++) {
      const x = r() * 400, y = 470 + r() * 12;
      s += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l2.6 -4`, i % 2 ? g[1] : U.shade(g[1], -0.1), 1);
      if (cols && PCT > 0.3 && i % 3 === 0) s += dot(x + 0.6, y - 6.6, 1.6, U.pick(r, cols)) + dot(x + 0.6, y - 6.6, 0.6, '#f2c230');
    }
    return s;
  }
  // nettles, an old tyre and broken pots while the place is neglected
  function clutter() {
    if (PCT >= 0.5) return '';
    let s = '';
    const r = U.rng(97);
    for (const [x, y] of [[230, 410], [140, 460], [380, 440], [250, 456], [12, 466]]) for (let k = 0; k < 3; k++) s += weed(x + k * 4, y, 10, r);
    s += `<ellipse cx="248" cy="430" rx="11" ry="4.4" fill="none" stroke="#2b2a2e" stroke-width="3.6"/><ellipse cx="248" cy="429" rx="5" ry="1.6" fill="#3d3a36"/>`;
    s += `<path d="M300 440 l6 -8 l5 4 l-4 7Z M310 446 l8 -3 l1 5Z M292 448 l5 -2 l2 4Z" fill="#c4704b"/>`;
    return `<g opacity="${f1(1 - PCT * 1.6)}">${s}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="350.5" y="508" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 352 504)">
      <rect x="328" y="494" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="352" y="507.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 352 512)"><rect x="325" y="508" width="54" height="10" fill="#d9534f"/><text x="352" y="516" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function bunting(a, b, sag, n) {
    const cols = ['#d98b63', '#9cc5a1', '#f2d88a', '#ffffff', '#bba9df', '#efb4ae'];
    const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)];
    let s = `<path d="M${a[0]} ${a[1]} Q${f1((a[0] + b[0]) / 2)} ${f1((a[1] + b[1]) / 2 + sag * 2)} ${b[0]} ${b[1]}" stroke="#6b6157" stroke-width="0.6" fill="none"/>`;
    for (let i = 1; i < n; i++) {
      const [x, y] = at(i / n);
      s += `<path class="qc-flag" d="M${f1(x - 2.6)} ${f1(y)} h5.2 l-2.6 5.4Z" fill="${cols[i % cols.length]}"/>`;
    }
    return s;
  }
  // fairy lights along the top of the drying rack and down its legs
  const BULBS = (() => {
    const out = [];
    for (let x = 20; x <= 114; x += 8) out.push([x, 393 + Math.sin(((x - 20) / 94) * Math.PI) * 3]);
    for (let y = 404; y <= 444; y += 10) { out.push([17, y]); out.push([117, y]); }
    return out;
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const DECOR = {
    'p-chimes': () => `<g>${line('M156 217 V224', '#6b6157', 0.6)}${box(146, 224, 20, 2, '#8a6142', ' rx="1"')}<g class="qc-chime">${[148, 153, 158, 163].map((x, i) => `${line(`M${x} 226 V${232 + i * 2}`, '#6b6157', 0.5)}<path d="M${x - 2} ${236 + i * 2} q0 -4 2 -4 q2 0 2 4Z" fill="${['#d98b63', '#9cc5a1', '#f2d88a', '#4e86b8'][i]}"/>`).join('')}</g></g>`,
    'p-urn': () => `<g>${shadow(238, 398, 12, 2)}<path d="M230 398 h16 l-2 -4 Q252 384 246 372 h-16 Q224 384 232 394Z" fill="#c4704b"/>${box(229, 369, 18, 4, '#b4603e', ' rx="1.5"')}
      <path d="M232 384 q6 3 12 0" stroke="#f2d88a" stroke-width="1.4" fill="none"/>${winter() ? oval(238, 368.6, 9, 1.6, SNOW) : `${dot(234, 366, 4.4, '#5d9644')}${dot(242, 365, 4.6, '#4f8a3c')}${dot(238, 361, 3.6, '#5d9644')}${SEASON === 'autumn' ? '' : dot(236, 362, 1.6, '#efb4ae') + dot(242, 362, 1.4, '#f2d84a')}`}</g>`,
    'p-step': () => `<g><rect x="178" y="384" width="56" height="7" rx="1.5" fill="#e9dcc4"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => box(180 + i * 4, 385.4 + (i % 2) * 2.2, 3.4, 2, ['#4e86b8', '#d98b63', '#9cc5a1', '#f2d88a'][i % 4], ' rx="0.4"')).join('')}${winter() ? box(178, 383, 56, 2, SNOW, ' rx="1"') : ''}</g>`,
    'p-hedge': () => {
      const L = LAV[SEASON];
      let s = '';
      for (let x = 136; x < 398; x += 11) {
        s += oval(x, 470, 7, 5, L[0]) + oval(x - 2, 468, 4.6, 3, U.shade(L[0], 0.1));
        if (L[1]) for (let k = -2; k <= 2; k++) s += oval(x + k * 2.4, 462 - Math.abs(k) * 0.8, 1, 2.4, L[1]);
      }
      return `<g>${winter() ? s + line('M132 466 H398', SNOW, 2.4) : `<g class="qc-sway">${s}</g>`}</g>`;
    },
    'p-cat': () => `<g>${oval(140, 371.6, 9, 1.4, '#000', 0.12)}${oval(140, 366, 7, 5, '#5a5048')}${dot(146, 360, 4, '#5a5048')}<path d="M143 357 l1 -4 l2.6 3Z M147 356.6 l2.6 -3 l0.6 4Z" fill="#5a5048"/>
      ${dot(145, 359.6, 0.7, '#f2d84a')}${dot(147.6, 359.6, 0.7, '#f2d84a')}<g class="qc-tail"><path d="M133 369 q-6 2 -4 -6" stroke="#5a5048" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>${oval(145.6, 368.6, 2.4, 1.4, '#f4ead6')}</g>`,
    'p-bench': () => `<g>${shadow(318, 444, 26, 2.2)}${box(294, 426, 48, 3.6, '#a77b56', ' rx="1.4"')}${box(294, 432, 48, 3.6, '#a77b56', ' rx="1.4"')}${box(294, 437, 48, 3.6, '#8a6142', ' rx="1.4"')}
      ${box(297, 440, 2.6, 6, '#3d3d42')}${box(336.4, 440, 2.6, 6, '#3d3d42')}${winter() ? box(294, 435.4, 48, 2, SNOW, ' rx="1"') : `<path d="M332 436 q-2 -5 1 -7 h4 q3 2 1 7Z" fill="#4e86b8"/>`}</g>`,
    'p-bunting': () => `<g>${bunting([4, 217], [124, 217], 2.4, 12)}${bunting([128, 217], [252, 217], 2.4, 12)}</g>`,
    'p-birdbath': () => `<g>${shadow(150, 456, 12, 2)}<path d="M146 456 h8 l-1 -16 h-6Z" fill="#e6dac4"/>${oval(150, 439, 13, 3.6, '#4e86b8')}${oval(150, 438.4, 10, 2.4, winter() ? '#e8f2f8' : '#9fd0e6')}
      <path d="M139 440 q11 4 22 0" stroke="#fbf6ea" stroke-width="0.8" fill="none" opacity="0.7"/>${winter() ? '' : `${oval(156, 434, 3.4, 2.4, '#a8846a')}${dot(158.6, 432, 1.8, '#a8846a')}<path d="M160 431.6 l2 0.6 l-2 0.6Z" fill="#e9962c"/>${dot(156, 433.6, 1.2, '#e2574c')}`}</g>`,
    'p-barrow': () => `<g>${shadow(220, 458, 18, 2)}<circle cx="232" cy="452" r="5.4" fill="#3d3d42"/>${dot(232, 452, 1.4, '#9aa3ad')}
      <path d="M204 438 H234 L230 450 H208Z" fill="#6f9a6a"/>${line('M206 444 L196 454 M208 450 V458 M226 450 V456', '#5a4434', 1.6)}${line('M204 438 L192 434', '#8a6142', 2)}
      ${greenware(212, 438, 1, 0, '#c4704b')}${greenware(222, 438, 0.9, 1, '#4e86b8')}${greenware(229, 438, 0.8, 2, '#d6cbb8')}${winter() ? box(204, 436, 30, 2, SNOW, ' rx="1"') : ''}</g>`,
    'p-sundial': () => `<g>${shadow(374, 460, 9, 1.8)}${box(370, 444, 8, 16, '#e6dac4')}${box(366, 441, 16, 4, '#d9cdb4', ' rx="1"')}<path d="M374 441 l5 -5 v5Z" fill="#8a7a5a"/>${winter() ? box(366, 439.6, 16, 2, SNOW, ' rx="1"') : ''}</g>`,
    'p-lights': () => `<g>${line(`M17 392 ${BULBS.slice(0, 12).map(([x, y]) => `L${f1(x)} ${f1(y - 0.6)}`).join(' ')}`, '#3d3d42', 0.5)}${line('M17 396 V446 M117 396 V446', '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    'p-bike': () => `<g>${[[96, 504], [122, 504]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#3d3d42" stroke-width="1.3"/>${dot(x, y, 1, '#9aa3ad')}`).join('')}
      <path d="M96 504 L104 494 L118 494 L122 504 M104 494 L109 504 L118 494 M117 490 L118 494 M102 492 h6" stroke="#9cc5a1" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M119 489 h9 l-1.4 6 h-6.2Z" fill="#c9924f"/>${greenware(121, 489, 0.6, 0, '#c4704b')}${greenware(126, 489, 0.55, 2, '#4e86b8')}${winter() ? oval(123, 488, 5, 1.2, SNOW) : ''}</g>`,
  };
  // the cat sits on the sill in front of the glass; the rest outside as listed
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M190 106 q4 -4 8 0 q4 -4 8 0 M214 118 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a robin on the rack in winter, a hen pecking in the yard otherwise
    if (winter() && st.rack) s += `${oval(108, 389, 3.4, 2.6, '#8a6a4a')}${dot(110.6, 387, 2, '#8a6a4a')}${oval(110, 390, 2, 1.6, '#e2574c')}<path d="M112.4 386.6 l1.6 0.4 l-1.6 0.5Z" fill="#3d3d42"/>`;
    else if (!winter() && PCT > 0.4) s += `${shadow(274, 434, 7, 1.4)}${oval(272, 428, 7, 5, '#c98a4a')}<path d="M266 426 q-5 -6 -2 -10 q3 3 4 6Z" fill="#a8693a"/>${dot(279, 423, 3, '#c98a4a')}<path d="M279 419.6 q1 -2.4 2.4 -0.6Z" fill="#e2574c"/><path d="M282 423 l2.6 0.8 l-2.6 0.6Z" fill="#e9b23c"/>${dot(280, 422.4, 0.6, '#222')}${line('M270 433 v3 M274 433 v3', '#e9b23c', 0.9)}`;
    if (PCT > 0.6 && !winter()) s += '<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#bba9df"/></g>';
    if (PCT > 0.8 && SEASON === 'summer') s += '<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>';
    return s;
  }

  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#f7c3d6" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the workshop window, the lamp over
  // the door and the kiln's spyhole. Every light here is drawn with a fill
  // from a Glow gradient, so the goodnight ending can switch them off.
  function night(st, decor) {
    const winLit = st.window && !PEND.window, kilnLit = st.firing && !PEND.firing, lamp = st.door || PCT > 0.5;
    let holes = '';
    if (winLit) holes += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/>`;
    if (kilnLit) holes += '<circle cx="324" cy="355" r="3.6"/><rect x="311" y="382" width="26" height="2"/>';
    if (lamp) holes += '<rect x="211" y="264" width="6" height="9"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 140)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="69" cy="54" r="14" fill="#000"/></mask><circle cx="62" cy="60" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="62" cy="60" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx, g = 'Glow') => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url(g)}"/>`;
    if (winLit) s += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="${url('GlowPane')}"/>${glow(90, 316, 92, 62)}${glow(90, 396, 80, 9)}`;
    if (kilnLit) s += `${glow(324, 355, 16, 14, 'GlowKiln')}${glow(324, 386, 30, 6, 'GlowKiln')}${glow(324, 360, 46, 34, 'Glow')}`;
    if (lamp) s += `${glow(214, 269, 18, 16)}${glow(206, 386, 30, 5)}`;
    if (decor['p-lights']) s += BULBS.map(([x, y], i) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5.6" ry="5.6" fill="${url('GlowB' + (i % 4))}"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    yard: [200, 430], window: [90, 316], floor: [90, 360], kiln: [324, 320], wheel: [64, 345], shelves: [90, 296], chimney: [324, 196],
    door: [206, 336], sign: [90, 237], rack: [67, 422], scraps: [128, 394], lavender: [324, 390], throw: [64, 328], glaze: [131, 332], firing: [324, 364],
  };
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

  // st: map of restored part -> true; cols: chosen paint colours
  // (potteryDoor, potterySign); opts as for CANAL.render
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    palette({ potteryDoor: cols.potteryDoor || '#9cc5a1', potterySign: cols.potterySign || '#d98b63' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house pottery">
      ${style()}${defs()}${sky()}${far()}${ground()}${oak()}${hedge()}${barn()}
      <g clip-path="${url('Win')}">${inside()}${shelves(st)}${floor(st)}${glaze(st)}${wheel(st)}${throwBowl(st)}</g>${workshopWindow(st)}
      ${sign(st, C)}${door(st, C)}${smoke(st)}${chimney(st)}${kiln(st)}${firing(st)}
      ${yard(st)}${lavender(st)}${scraps(st)}${rack(st)}${lane()}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS: Object.keys(SPOTS) };
})();
