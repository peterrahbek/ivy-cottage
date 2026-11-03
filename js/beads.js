'use strict';
// Button & Bead, drawn as SVG the same way as the cottage (house.js) and the
// other places. A tiny haberdashery in a row of houses on a cobbled street: a
// bow window under a striped awning, and through it the ribbon shelves, a
// cabinet of button drawers, brass scales on the counter, a necklace on a
// velvet bust, jars of sorted buttons and a bracelet on a cushion; the shop
// door on its stone step, the sign over both, a workroom upstairs with the
// sewing machine in the window and window boxes under the sills, and round
// the side a back yard with fabric drying on the line. Each restorable part
// has a tired look and a restored look; the sign and the door take the
// colours chosen while painting. Every id carries an 'e' prefix (plus
// opts.uid when given) so this picture can share a page with the others.

const BEADS = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the shop is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false;
  const id = (n) => `e${n}${UID}`;
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
  // a frame round a window, leaving what is inside it showing
  const ring = (x, y, w, h, t, col) => `<path d="M${f1(x - t)} ${f1(y - t)} h${f1(w + 2 * t)} v${f1(h + 2 * t)} h${f1(-w - 2 * t)}Z M${x} ${y} v${h} h${w} v${-h}Z" fill="${col}" fill-rule="evenodd"/>`;
  // dark or light writing, whichever reads on a painted colour
  const ink = (c) => (U.lum(c) > 0.62 ? '#3b352e' : '#fbf6ea');
  const star = (cx, cy, r1, r2, rot = 0) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = ((i * 36 + rot - 90) * Math.PI) / 180, r = i % 2 ? r2 : r1;
      d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}`;
    }
    return d + 'Z';
  };

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#c3d9a9', '#a9cb8f'], summer: ['#bcd68f', '#9fc47b'], autumn: ['#e0c78e', '#cfae6c'], winter: ['#eef2f6', '#e2e9ef'] };
  const CANOPY = { spring: ['#86b56a', '#9cc77e', '#f4c6d4'], summer: ['#5f9a4c', '#6aa858', null], autumn: ['#d9822b', '#c9692f', '#e9b23c'], winter: null };
  // what flowers in the window boxes through the year (winter: holly berries)
  const FLOWERS = { spring: ['#f2d84a', '#ffffff', '#ef8aa6', '#a98bd6'], summer: ['#e2574c', '#ef8aa6', '#ffffff', '#9b7fd1'], autumn: ['#e9962c', '#c9586e', '#d8b844', '#9a2f4a'], winter: ['#d9483b', '#d9483b', '#f6f2ea', '#d9483b'] };
  // beads, buttons and ribbons: each kind has its own shape as well as its colour
  const BEAD = { red: '#d9483b', blue: '#3f7ac9', yellow: '#f2c230', green: '#4f9a5c', pink: '#ef8aa6', teal: '#3f9a94' };
  const RIBBONS = ['#d9483b', '#e9962c', '#f2c230', '#4f9a5c', '#3f9a94', '#3f7ac9', '#8a6cc4', '#ef8aa6'];
  const JARS = [['#d9483b', 2], ['#3f7ac9', 4], ['#f2c230', 2], ['#4f9a5c', 4]];

  // ---------------------------------------------------------------- shapes
  const PAVE = 410, KERB = 440, NEAR = 504;
  const BLD = { x0: 16, x1: 270 };
  const ROOF_D = 'M8 154 L42 110 H244 L278 154Z';
  // upstairs: the workroom on the left, the stockroom on the right
  const UWL = { x: 58, y: 172, w: 46, h: 44 };
  const UWR = { x: 182, y: 172, w: 46, h: 44 };
  const SIGN = { x: 40, y: 266, w: 210, h: 24 };
  // the bow window's glass, the shop door and the awning over the window
  const BOW = { x: 42, y: 300, w: 152, h: 92 };
  const DOOR = { x: 214, y: 304, w: 32, h: 100 };
  const AWN = { x0: 40, x1: 196, y0: 293, y1: 314 };
  const FLOOR_Y = 366;
  // the back yard round the side: its wall, its flags and the low front wall
  const YARD_D = 'M266 338 H400 V410 H266Z';

  // little css of our own: fabric flapping on the line, a cat breathing,
  // ribbons fluttering, a bell and the button tree swinging, a robin hopping
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .eb-flap{animation:ebflap 3.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes ebflap{from{transform:skewX(-5deg)}to{transform:skewX(6deg)}}
      #scene .eb-flap:nth-child(2n){animation-delay:-1.4s}
      #scene .eb-breathe{animation:ebbreathe 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes ebbreathe{50%{transform:scaleY(1.07)}}
      #scene .eb-ribbon{animation:ebribbon 2.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes ebribbon{from{transform:skewX(-9deg)}to{transform:skewX(9deg)}}
      #scene .eb-ribbon:nth-child(3n){animation-delay:-1.1s}
      #scene .eb-swing{animation:ebswing 4.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes ebswing{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
      #scene .eb-hop{animation:ebhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes ebhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      plaster: U.mix('#efd3c8', '#c9c0b4', k * 1.3),
      quoin: U.mix('#f6ecdf', '#cfc6b6', k),
      teal: U.mix('#2f6b66', '#6f7a76', k * 1.3),
      awn: U.mix('#3f8580', '#8a9894', k * 1.2),
      brass: U.mix('#c9a24a', '#8f8468', k * 1.2),
      stone: U.mix('#e6dccb', '#b3aa9a', k),
      brick: U.mix('#b8664a', '#9a8a7c', k * 1.2),
    };
  }

  function defs() {
    const b = K.brick, ob = U.mix(b, '#8a8476', 0.45);
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#ead9c0'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const flag = (cols, gap) => `<rect width="40" height="22" fill="${gap}"/>
        <rect x="0.8" y="0.8" width="18" height="9.6" rx="1.2" fill="${cols[0]}"/><rect x="19.6" y="0.8" width="19.6" height="9.6" rx="1.2" fill="${cols[1]}"/>
        <rect x="0.8" y="11.6" width="11" height="9.6" rx="1.2" fill="${cols[2]}"/><rect x="12.6" y="11.6" width="16" height="9.6" rx="1.2" fill="${cols[0]}"/><rect x="29.4" y="11.6" width="9.8" height="9.6" rx="1.2" fill="${cols[1]}"/>`;
    const cobble = (cols, gap) => `<rect width="22" height="16" fill="${gap}"/>
        <ellipse cx="5.6" cy="4.2" rx="4.6" ry="3.2" fill="${cols[0]}"/><ellipse cx="16" cy="4" rx="5" ry="3.3" fill="${cols[1]}"/>
        <ellipse cx="0.4" cy="12" rx="4.6" ry="3.2" fill="${cols[1]}"/><ellipse cx="22" cy="12" rx="4.6" ry="3.2" fill="${cols[1]}"/><ellipse cx="11" cy="12" rx="5" ry="3.2" fill="${cols[2]}"/>
        <path d="M3 2.6 q2 -1 4 0 M14 2.4 q2 -1 4 0 M9 10.4 q2 -1 4 0" stroke="#fff" stroke-width="0.6" opacity="0.3" fill="none"/>`;
    const cb = winter() ? ['#d7dce1', '#cdd3d9', '#e1e5e9'] : ['#c2b8a8', '#b3a998', '#cdc3b2'];
    const pv = winter() ? '#e6e9ec' : PCT > 0.4 ? '#ddd5c6' : '#c9c1b2';
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
      <radialGradient id="${id('GlowPane')}" cx="0.5" cy="0.4" r="0.75">
        <stop offset="0" stop-color="#ffe6a8" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0.22"/>
      </radialGradient>
      ${['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'].map((c, i) => `<radialGradient id="${id('GlowB' + i)}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe8"/><stop offset="0.35" stop-color="${c}"/><stop offset="0.5" stop-color="${c}" stop-opacity="0.35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a9a84"/><stop offset="0.7" stop-color="#7f8462"/><stop offset="1" stop-color="#5f6644"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1a" stop-opacity="0.32"/><stop offset="1" stop-color="#3b2a1a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('AwnShade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.2"/><stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#2b1d12" stop-opacity="0.16"/></linearGradient>
      <linearGradient id="${id('Velvet')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a3d5a"/><stop offset="1" stop-color="#5a2438"/></linearGradient>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
      <pattern id="${id('Slate')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#5f6870"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#4a5259" stroke-width="0.7"/><rect x="0.6" y="0.6" width="3.6" height="1.2" fill="#fff" opacity="0.1"/>
      </pattern>
      <pattern id="${id('SlateOld')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#6d7068"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#55584f" stroke-width="0.7"/><circle cx="3" cy="3" r="1.4" fill="#7a8a4a" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Paper')}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#f6e4dc"/><rect width="3" height="8" fill="#ecc9c0"/><circle cx="5.6" cy="2" r="0.6" fill="#c98f8a"/><circle cx="5.6" cy="6" r="0.6" fill="#7fb0a8"/>
      </pattern>
      <pattern id="${id('PaperOld')}" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#ddd2c6"/><rect width="3" height="8" fill="#cfc3b6"/><circle cx="5.6" cy="2" r="0.6" fill="#b5a89a"/>
      </pattern>
      <pattern id="${id('Boards')}" width="40" height="6" patternUnits="userSpaceOnUse">
        <rect width="40" height="6" fill="#b98a5c"/><path d="M0 5.6 H40 M24 0 V5.6" stroke="#94693f" stroke-width="0.6"/><path d="M3 2.6 h12" stroke="#cf9f6e" stroke-width="0.5"/>
      </pattern>
      <pattern id="${id('BoardsOld')}" width="40" height="6" patternUnits="userSpaceOnUse">
        <rect width="40" height="6" fill="#9e8e7a"/><path d="M0 5.6 H40 M24 0 V5.6" stroke="#7d6e5e" stroke-width="0.6"/><ellipse cx="10" cy="3" rx="5" ry="1.4" fill="#c9c0b2" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Pave')}" width="30" height="15" patternUnits="userSpaceOnUse">
        <rect width="30" height="15" fill="${pv}"/><path d="M0 14.4 H30 M14 0 V14.4" stroke="${U.shade(pv, -0.14)}" stroke-width="0.9"/><rect x="1" y="1" width="11" height="1" fill="#fff" opacity="0.3"/>
      </pattern>
      <pattern id="${id('Cobble')}" width="22" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.8)">${cobble(cb, winter() ? '#bfc6cd' : '#9c9282')}</pattern>
      <pattern id="${id('Flags')}" width="40" height="22" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.62)">${flag(winter() ? ['#e3e1dc', '#d9d6cf', '#e8e6e1'] : ['#cdbfa8', '#c0b29a', '#d3c6b0'], winter() ? '#c9c6bf' : '#a39680')}</pattern>
      <pattern id="${id('FlagsOld')}" width="40" height="22" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.62)">${flag(['#a9a58c', '#9c9a80', '#b1ab92'], '#6f7a4a')}</pattern>
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
      <clipPath id="${id('Bow')}"><rect x="${BOW.x}" y="${BOW.y}" width="${BOW.w}" height="${BOW.h}"/></clipPath>
      <clipPath id="${id('Uwl')}"><rect x="${UWL.x}" y="${UWL.y}" width="${UWL.w}" height="${UWL.h}"/></clipPath>
      <clipPath id="${id('Uwr')}"><rect x="${UWR.x}" y="${UWR.y}" width="${UWR.w}" height="${UWR.h}"/></clipPath>
      <clipPath id="${id('DoorGlass')}"><rect x="${DOOR.x + 5}" y="${DOOR.y + 6}" width="${DOOR.w - 10}" height="38"/></clipPath>
    </defs>`;
  }

  // ---------------------------------------------------- little things drawn often
  function bead(x, y, kind, col, k = 1) {
    if (kind === 'square') return `<rect x="${f1(x - 1.5 * k)}" y="${f1(y - 1.5 * k)}" width="${f1(3 * k)}" height="${f1(3 * k)}" fill="${col}" transform="rotate(45 ${f1(x)} ${f1(y)})"/>`;
    if (kind === 'star') return `<path d="${star(x, y, 2.4 * k, 1.1 * k)}" fill="${col}"/>`;
    if (kind === 'drop') return `<path d="M${f1(x)} ${f1(y - 2.4 * k)} Q${f1(x + 2.2 * k)} ${f1(y + 0.4 * k)} ${f1(x)} ${f1(y + 2 * k)} Q${f1(x - 2.2 * k)} ${f1(y + 0.4 * k)} ${f1(x)} ${f1(y - 2.4 * k)}Z" fill="${col}"/>`;
    return dot(x, y, 1.7 * k, col) + dot(x - 0.6 * k, y - 0.6 * k, 0.55 * k, '#ffffff', 0.7);
  }
  function button(x, y, r, col, holes) {
    let s = dot(x, y, r, col) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 0.7)}" fill="none" stroke="${U.shade(col, -0.2)}" stroke-width="${f1(Math.max(0.3, r * 0.14))}"/>`;
    const hk = r * 0.26, hr = Math.max(0.3, r * 0.13);
    const pts = holes === 4 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [[-1, 0], [1, 0]];
    for (const [a, c] of pts) s += dot(x + a * hk, y + c * hk, hr, U.shade(col, -0.5));
    return s;
  }
  // a roll of ribbon seen end on, with its paper core
  const roll = (x, y, col) => dot(x, y, 3.5, col) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.6" fill="none" stroke="${U.shade(col, -0.18)}" stroke-width="0.4"/>` + dot(x, y, 1.4, '#ead9b8') + dot(x, y, 0.55, '#6b5a48');
  // a length of cloth on the line: plain, striped, spotted, gingham or sprigged
  function cloth(x, y, w, h, col, kind) {
    let s = `<path d="M${f1(x)} ${f1(y)} H${f1(x + w)} V${f1(y + h)} Q${f1(x + w * 0.75)} ${f1(y + h + 2)} ${f1(x + w / 2)} ${f1(y + h)} Q${f1(x + w * 0.25)} ${f1(y + h - 2)} ${f1(x)} ${f1(y + h)}Z" fill="${col}"/>`;
    const lt = U.shade(col, 0.55), dk = U.shade(col, -0.2);
    if (kind === 'stripe') for (let i = 2; i < w; i += 4) s += box(x + i, y, 1.4, h - 1, lt, ' opacity="0.85"');
    else if (kind === 'spot') for (let j = 3; j < h - 1; j += 4.4) for (let i = 2 + ((j / 4.4) % 2) * 2; i < w - 1; i += 4) s += dot(x + i, y + j, 0.8, lt);
    else if (kind === 'gingham') {
      for (let i = 1.5; i < w; i += 3.6) s += box(x + i, y, 1.6, h - 1, dk, ' opacity="0.35"');
      for (let j = 1.5; j < h - 1; j += 3.6) s += box(x, y + j, w, 1.6, dk, ' opacity="0.35"');
    } else if (kind === 'sprig') for (let j = 3; j < h - 1; j += 5) for (let i = 2.5 + ((j / 5) % 2) * 2.4; i < w - 1; i += 5) s += dot(x + i, y + j, 0.9, ['#d9483b', '#f2c230', '#3f7ac9'][((i + j) | 0) % 3]) + dot(x + i + 0.9, y + j + 0.7, 0.5, '#4f8a3c');
    // two pegs
    s += box(x + 1.4, y - 2.4, 1.6, 4, '#c9a06a', ' rx="0.5"') + box(x + w - 3, y - 2.4, 1.6, 4, '#c9a06a', ' rx="0.5"');
    return s;
  }

  // ------------------------------------------------------ the sky and beyond
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="300" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="338" cy="60" r="44" fill="${url('Sun')}"/><circle cx="338" cy="60" r="16" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="96" cy="62" rx="25" ry="10"/><ellipse cx="115" cy="55" rx="17" ry="12"/><ellipse cx="133" cy="63" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="236" cy="96" rx="19" ry="7"/><ellipse cx="251" cy="91" rx="13" ry="9"/><ellipse cx="265" cy="97" rx="14" ry="6"/></g>`;
  }
  // the hills beyond the town, a church spire and the roofs of the next street
  function far() {
    const H = HILLS[SEASON];
    let s = `<path d="M0 196 Q90 170 190 182 T340 168 T400 178 V300 H0Z" fill="${H[0]}"/>`;
    s += `<path d="M-10 222 C70 206 150 210 220 216 C290 222 340 208 410 214 V300 H-10Z" fill="${H[1]}"/>`;
    // the church
    const cw = winter() ? '#dfe3e6' : '#d6ccba', cr = winter() ? '#c9d2da' : '#8a8a8e';
    s += `${box(326, 196, 20, 16, cw)}<path d="M325 196 L336 188 L347 196Z" fill="${cr}"/>${box(346, 182, 9, 30, cw)}<path d="M345 182 L350.5 160 L356 182Z" fill="${cr}"/>${box(349, 188, 3, 4, '#7a6a5a')}`;
    // roofs and chimney pots of the street behind the yard
    const houses = [[268, 230, 34, '#e9dcc4', '#8a6a5a'], [300, 222, 30, '#dcc9b0', '#6d7068'], [328, 234, 30, '#ecd9c9', '#9a5a44'], [356, 226, 30, '#e3d6bf', '#6d7068'], [384, 232, 30, '#d9c7ae', '#8a6a5a']];
    for (const [x, y, w, wall, roof] of houses) {
      s += box(x, y, w, 290 - y, winter() ? U.mix(wall, '#eef2f6', 0.3) : wall);
      s += `<path d="M${x - 3} ${y} L${x + 6} ${y - 12} H${x + w - 6} L${x + w + 3} ${y}Z" fill="${roof}"/>`;
      s += box(x + w - 10, y - 18, 5, 8, '#9a5a44') + box(x + w - 10.6, y - 19.4, 6.2, 1.8, '#7d4a3a');
      s += box(x + 6, y + 8, 6, 7, '#8fa9b2') + box(x + w - 13, y + 8, 6, 7, '#8fa9b2');
      if (winter()) s += `<path d="M${x - 2} ${y - 0.6} L${x + 6.4} ${y - 11.6} H${x + w - 6.4} L${x + w + 2} ${y - 0.6} Q${x + w / 2} ${y - 4} ${x - 2} ${y - 0.6}Z" fill="${SNOW}"/>`;
    }
    return s;
  }
  // a tree in the yard next door, over the wall
  function tree() {
    const C = CANOPY[SEASON], x = 334, y = 232;
    let s = `<path d="M${x} 300 Q${x + 2} 268 ${x - 2} 244 M${x} 262 Q${x + 12} 252 ${x + 22} 240 M${x - 1} 252 Q${x - 12} 244 ${x - 20} 234" stroke="#6b5240" stroke-width="4.4" fill="none" stroke-linecap="round"/>`;
    if (!C) return s + line(`M${x - 20} 234 l-6 -6 M${x + 22} 240 l6 -6 M${x - 2} 244 l2 -10 M${x - 2} 236 l-6 -6`, '#6b5240', 1.8) + line(`M${x - 24} 232 q12 -6 22 0 M${x + 10} 240 q8 -4 14 0`, SNOW, 1.6);
    s += `${dot(x, y, 24, C[0])}${dot(x - 20, y + 8, 16, C[1])}${dot(x + 21, y + 6, 18, C[0])}${dot(x + 6, y - 16, 15, U.shade(C[1], 0.1))}${dot(x - 12, y - 10, 13, U.shade(C[0], 0.12))}`;
    if (SEASON === 'spring') s += [[x - 14, y - 6], [x + 10, y - 14], [x + 22, y + 2], [x - 4, y + 10], [x - 24, y + 6], [x + 4, y - 2], [x + 16, y + 12]].map(([a, c]) => dot(a, c, 2.4, '#f7d3de')).join('');
    if (SEASON === 'autumn') s += [[x - 10, y - 4], [x + 14, y - 8], [x + 4, y + 8]].map(([a, c]) => dot(a, c, 4, C[2])).join('');
    return s;
  }
  // a sliver of the neighbour's brick house at the left
  function neighbour() {
    let s = `${box(0, 132, 18, PAVE - 132, U.mix('#c4876a', '#9a8a7c', (1 - PCT) * 0.3))}<path d="M-4 134 L20 120 V134Z" fill="#6d7068"/>`;
    for (let y = 140; y < PAVE; y += 9) s += line(`M0 ${y} H16`, '#a86f55', 0.6, 0.6);
    s += box(2, 180, 10, 26, '#8fa9b2') + box(2, 300, 10, 32, '#8fa9b2') + box(0, 206, 14, 3, '#e6dccb') + box(0, 332, 14, 3, '#e6dccb');
    if (winter()) s += `<path d="M-4 133 L20 119 V122 L-4 136Z" fill="${SNOW}"/>`;
    return s;
  }

  // ---------------------------------------------------------- the street
  // the pavement along the shop, the cobbled street, and this side's
  // pavement in front with two tubs of flowers and a pair of bollards
  function tub(x) {
    const r = U.rng(x), F = FLOWERS[SEASON];
    let s = `${shadow(x, 531, 16, 2)}<path d="M${x - 14} 513 H${x + 14} L${x + 12} 530 Q${x} 533 ${x - 12} 530Z" fill="#9a6a44"/>`;
    s += `${line(`M${x - 13.4} 518 H${x + 13.4} M${x - 12.6} 526 H${x + 12.6}`, '#3d3d42', 1.2)}${line(`M${x - 6} 514 v15 M${x + 6} 514 v15`, '#7d5236', 0.6)}`;
    for (let k = 0; k < 7; k++) s += dot(x - 12 + k * 4, 511 - (k % 2) * 2.4, 4, k % 2 ? '#5d9644' : '#4f8a3c');
    if (!winter()) for (let k = 0; k < 10; k++) s += dot(x - 12 + r() * 24, 505 + r() * 6, 1.8, F[k % F.length]);
    else s += `${[0, 1, 2, 3, 4].map((k) => dot(x - 10 + k * 5, 508 + (k % 2), 1.2, '#d9483b')).join('')}<path d="M${x - 14} 510 q14 -7 28 0Z" fill="${SNOW}"/>`;
    return s;
  }
  function bollard(x) {
    return `${shadow(x, 533, 5, 1.2)}${box(x - 2.6, 512, 5.2, 21, '#2f2f33', ' rx="1.4"')}${dot(x, 511, 3.4, '#2f2f33')}${box(x - 3.4, 517, 6.8, 1.8, '#3d3d42', ' rx="0.8"')}${box(x - 1.6, 514, 1, 17, '#fff', ' opacity="0.15"')}${winter() ? oval(x, 508.6, 3.2, 1.2, SNOW) : ''}`;
  }
  function street() {
    let s = `<path d="M0 ${PAVE} H400 V${KERB} H0Z" fill="${url('Pave')}"/>${box(0, PAVE, 400, 2.4, '#000', ' opacity="0.12"')}`;
    s += `${box(0, KERB, 400, 6, K.stone)}${box(0, KERB, 400, 1.2, '#fff', ' opacity="0.35"')}${box(0, KERB + 6, 400, 1.6, '#000', ' opacity="0.18"')}`;
    s += `<path d="M0 ${KERB + 7} H400 V${NEAR} H0Z" fill="${url('Cobble')}"/>${box(0, KERB + 7, 400, 5, '#000', ' opacity="0.08"')}`;
    // a drain grate in the gutter
    s += `${box(150, KERB + 9, 18, 7, '#4a4a4e', ' rx="1"')}${line(`M153 ${KERB + 10} v5 M157 ${KERB + 10} v5 M161 ${KERB + 10} v5 M165 ${KERB + 10} v5`, '#2f2f33', 0.8)}`;
    // this side of the street
    s += `${box(0, NEAR, 400, 4, K.stone)}${box(0, NEAR, 400, 1, '#fff', ' opacity="0.4"')}<path d="M0 ${NEAR + 4} H400 V540 H0Z" fill="${url('Pave')}"/>`;
    if (SEASON === 'autumn') s += [[60, 470, '#d9822b'], [228, 486, '#c4462f'], [318, 462, '#e9b23c'], [120, 492, '#9c5a2a']].map(([x, y, c], i) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="1.8" fill="${c}" transform="rotate(${i * 40} ${x} ${y})"/>`).join('');
    if (SEASON === 'spring') s += [[70, 474], [236, 488], [300, 466], [180, 494], [350, 480]].map(([x, y]) => oval(x, y, 2, 1.2, '#f7c3d6')).join('');
    if (winter()) {
      s += `<path d="M0 ${KERB + 7} Q100 ${KERB + 13} 200 ${KERB + 9} T400 ${KERB + 10} V${KERB + 7}Z" fill="${SNOW}" opacity="0.92"/>`;
      s += `<path d="M0 ${PAVE + 18} Q60 ${PAVE + 12} 120 ${PAVE + 20} T260 ${PAVE + 16} T400 ${PAVE + 20} V${KERB} H0Z" fill="${SNOW}" opacity="0.7"/>`;
      s += `<path d="M0 ${NEAR - 3} Q90 ${NEAR - 8} 200 ${NEAR - 4} T400 ${NEAR - 5} V${NEAR} H0Z" fill="${SNOW}" opacity="0.85"/><path d="M0 ${NEAR + 12} Q120 ${NEAR + 6} 230 ${NEAR + 14} T400 ${NEAR + 10} V540 H0Z" fill="${SNOW}" opacity="0.75"/>`;
    }
    s += tub(158) + tub(262) + bollard(34) + bollard(372);
    return s;
  }

  // ------------------------------------------------------------- the house
  function building() {
    const { x0, x1 } = BLD;
    let s = shadow(143, PAVE + 1, 130, 3);
    // the chimney behind the roof, with smoke once the place is lived in
    s += `${box(212, 82, 16, 40, url('Brick'))}${box(210.6, 79, 18.8, 4, K.stone, ' rx="1"')}${box(214, 72, 4.4, 7, '#b5694a')}${box(221, 73.6, 4, 5.4, '#a8604a')}`;
    if (PCT > 0.5) s += '<g class="smoke" fill="#ffffff"><circle cx="217" cy="62" r="3.4" opacity="0.7"/><circle cx="220" cy="51" r="4.6" opacity="0.5"/><circle cx="218" cy="37" r="6" opacity="0.3"/></g>';
    // the roof, a dormer with a little round-topped window, the gutter
    s += `<path d="${ROOF_D}" fill="${PCT > 0.35 ? url('Slate') : url('SlateOld')}"/><path d="M42 110 H244" stroke="#4a5259" stroke-width="2.4" stroke-linecap="round"/>`;
    if (winter()) s += `<path d="M10 152 L43 112 H243 L276 152 Q240 144 200 148 Q150 142 100 148 Q60 144 10 152Z" fill="${SNOW}" opacity="0.92"/>`;
    s += `${box(126, 104, 36, 38, K.plaster)}<path d="M120 106 L144 86 L168 106Z" fill="${PCT > 0.35 ? '#4f5960' : '#666a62'}"/>`;
    s += `<path d="M134 136 V120 Q134 112 144 112 Q154 112 154 120 V136Z" fill="${PCT > 0.4 ? url('Glass') : url('Grime')}"/><path d="M134 136 V120 Q134 112 144 112 Q154 112 154 120 V136Z" fill="none" stroke="${K.quoin}" stroke-width="2"/>${line('M144 112 V136 M134 124 H154', K.quoin, 1.2)}`;
    if (PCT > 0.6 && !winter()) s += `${box(136, 130, 16, 4, '#c96f7e', ' rx="1"')}${dot(140, 129, 1.6, '#f2d84a')}${dot(144, 128.6, 1.6, '#ef8aa6')}${dot(148, 129, 1.6, '#f2d84a')}`;
    if (winter()) s += `<path d="M121 105 L144 87 L167 105 Q144 100 121 105Z" fill="${SNOW}"/>${box(210.6, 77.4, 18.8, 2, SNOW, ' rx="1"')}${box(133, 135, 22, 1.8, SNOW, ' rx="0.9"')}`;
    s += `<path d="M8 154 H278" stroke="#3f464d" stroke-width="1.6"/>`;
    // the upper storey: dusty rose plaster with cream stones up the corners
    s += `${box(x0, 154, x1 - x0, 104, K.plaster)}${box(x0, 154, x1 - x0, 4, '#000', ' opacity="0.12"')}`;
    for (let y = 158; y < 256; y += 14) s += box(x0, y, 10, 7, K.quoin) + box(x0, y + 7, 7, 7, U.shade(K.quoin, -0.05)) + box(x1 - 10, y, 10, 7, K.quoin) + box(x1 - 7, y + 7, 7, 7, U.shade(K.quoin, -0.05));
    // a plaque between the windows with a carved button
    s += `${oval(143, 166, 11, 6, K.quoin)}<ellipse cx="143" cy="166" rx="11" ry="6" fill="none" stroke="${U.shade(K.quoin, -0.2)}" stroke-width="0.8"/>${button(143, 166, 3.4, U.shade(K.quoin, -0.12), 4)}`;
    // cracked plaster and a slipped slate while the shop is forgotten
    if (PCT < 0.4) s += line('M118 196 l6 8 l-3 8 l5 7 M246 230 l-5 6 l2 6 M36 238 l4 6', '#a8978c', 0.8) + oval(150, 244, 10, 3.4, U.shade(K.plaster, -0.08), 0.7) + `<g transform="rotate(24 92 134)">${box(87, 131, 9, 5, '#5f6870')}</g>`;
    // the cornice over the shop front
    s += `${box(x0 - 4, 256, x1 - x0 + 8, 5, K.quoin)}${box(x0 - 2, 261, x1 - x0 + 4, 3, U.shade(K.quoin, -0.12))}${box(x0 - 4, 256, x1 - x0 + 8, 1.2, '#fff', ' opacity="0.4"')}`;
    if (winter()) s += box(x0 - 4, 254.4, x1 - x0 + 8, 2.2, SNOW, ' rx="1"');
    return s;
  }
  // the shop front: pilasters with their brackets, the panelled stall riser
  // under the bow window and the dark recess round the door
  function shopFront() {
    const t = K.teal, dk = U.shade(t, -0.25), lt = U.shade(t, 0.18);
    let s = box(BLD.x0, 264, BLD.x1 - BLD.x0, PAVE - 264, dk);
    // the stall riser: panels under the window, curving out with the bow
    const y0 = BOW.y + BOW.h + 4;
    s += `<path d="M36 ${y0} Q118 ${y0 + 6} 200 ${y0} V${PAVE} H36Z" fill="${t}"/>`;
    for (const [a, b] of [[42, 78], [82, 116], [120, 154], [158, 194]]) s += `<rect x="${a}" y="${y0 + 5}" width="${b - a}" height="${PAVE - y0 - 9}" rx="1" fill="none" stroke="${lt}" stroke-width="1"/>`;
    // the pilasters at each end and between the window and the door
    for (const [a, w] of [[22, 14], [198, 12], [252, 14]]) {
      s += `${box(a, 264, w, PAVE - 264, t)}${box(a + 2, 300, w - 4, PAVE - 306, lt, ' opacity="0.35"')}${box(a - 1, PAVE - 6, w + 2, 6, dk)}`;
      s += `${box(a - 1.6, 292, w + 3.2, 5, K.brass, ' rx="1"')}${box(a - 1, 297, w + 2, 2, U.shade(K.brass, -0.2))}`;
    }
    // console brackets holding the fascia, with a scroll
    for (const x of [22, 252]) s += `<path d="M${x} 264 h14 v24 q-7 4 -14 -4Z" fill="${t}"/>${line(`M${x + 3} 268 q8 2 7 10 q-1 5 -6 3`, K.brass, 1.2)}`;
    // the doorway's case
    s += `${box(DOOR.x - 4, DOOR.y - 16, DOOR.w + 8, DOOR.h + 16, t)}${box(DOOR.x - 1, DOOR.y - 13, DOOR.w + 2, 10, PCT > 0.4 ? url('Glass') : url('Grime'))}`;
    // the fanlight over the door: a sunburst of glazing bars
    s += line(`M${DOOR.x + 16} ${DOOR.y - 3} L${DOOR.x + 2} ${DOOR.y - 12} M${DOOR.x + 16} ${DOOR.y - 3} L${DOOR.x + 9} ${DOOR.y - 13} M${DOOR.x + 16} ${DOOR.y - 3} V${DOOR.y - 13} M${DOOR.x + 16} ${DOOR.y - 3} L${DOOR.x + 23} ${DOOR.y - 13} M${DOOR.x + 16} ${DOOR.y - 3} L${DOOR.x + 30} ${DOOR.y - 12}`, lt, 0.8);
    return s;
  }

  // ----------------------------------------------------------- upstairs
  // the frame of an upstairs window: a sash in two halves and a stone sill
  function sash(w, clean) {
    const { x, y } = w;
    let s = '<g pointer-events="none">';
    if (!clean) s += `${box(x, y, w.w, w.h, url('Grime'), ' opacity="0.55"')}${line(`M${x + 4} ${y + 3} l10 10 M${x + 4} ${y + 3} l3 12`, '#eef0e8', 0.5, 0.8)}`;
    else s += `<path d="M${x + 6} ${y + w.h} L${x + 22} ${y} H${x + 28} L${x + 12} ${y + w.h}Z" fill="#fff" opacity="0.14"/>`;
    s += '</g>';
    s += `${ring(x, y, w.w, w.h, 3, K.quoin)}<path d="M${x} ${f1(y + w.h / 2)} H${x + w.w}" stroke="${K.quoin}" stroke-width="2.4"/><path d="M${f1(x + w.w / 2)} ${y} V${y + w.h}" stroke="${K.quoin}" stroke-width="1.4"/>`;
    s += `${box(x - 6, y + w.h + 2, w.w + 12, 4, K.stone, ' rx="1"')}${box(x - 6, y + w.h + 6, w.w + 12, 1.4, '#000', ' opacity="0.12"')}`;
    return s;
  }
  // tied-back lace curtains, once there are some
  function lace(w) {
    const { x, y } = w, h = w.h;
    const side = (sx, dir) => {
      let s = `<path d="M${sx} ${y} H${sx + dir * 13} Q${sx + dir * 6} ${y + h * 0.42} ${sx + dir * 3} ${y + h * 0.56} Q${sx + dir * 7} ${y + h * 0.8} ${sx + dir * 9} ${y + h} H${sx}Z" fill="#ffffff" opacity="0.88"/>`;
      for (let k = 0; k < 6; k++) s += dot(sx + dir * (3 + (k % 2) * 4), y + 4 + k * 6, 0.9, '#e8dfd2');
      return s + dot(sx + dir * 3.4, y + h * 0.56, 1.4, '#c96f7e');
    };
    return side(x, 1) + side(x + w.w, -1);
  }
  // the workroom: a long table under the window and the old sewing machine on it
  function machine(st) {
    const p = pend(st, 'machine'), ok = st.machine && !p;
    const body = st.machine ? '#2b2a2e' : '#66625c', wood = st.machine ? '#a77b56' : '#8a7e72';
    let s = `<g data-part="machine">${box(UWL.x, 204, UWL.w, 3, wood)}${box(UWL.x, 207, UWL.w, 10, U.shade(wood, -0.2))}`;
    // a length of cloth across the table
    if (st.machine) s += `<path d="M60 204 h18 l2 -3 h-18Z" fill="#c96f7e"/>${line('M62 202.6 h16', '#f6efe3', 0.5, 0.8)}`;
    // the base, the pillar and arm, the head with its needle
    s += `<path d="M64 204 H100 L97 200 H67Z" fill="${body}"/>`;
    s += `<path d="M93 200 V187 Q93 182 88 182 H74 Q69 182 69 187 V193 H75 V189 H87 V200Z" fill="${body}"/>`;
    s += `${box(69.4, 193, 4.4, 5, body)}${line('M71.6 198 V201.4', '#d6d9dc', 0.7)}`;
    // the hand wheel on the right and a reel of thread on top
    s += `${dot(96, 190, 4.4, st.machine ? '#9aa3ad' : '#7a7670')}${dot(96, 190, 3, U.shade(body, 0.1))}${dot(96, 190, 1.2, st.machine ? '#d6d9dc' : '#8a857c')}`;
    s += `${line('M82 182 V178', '#8a7a62', 0.8)}${box(80, 175.4, 4, 3.6, '#d9483b', ' rx="0.6"')}${box(79.6, 175, 4.8, 0.8, '#e9c891')}${box(79.6, 178.6, 4.8, 0.8, '#e9c891')}`;
    if (ok) {
      // gold scrolls on the black, a gleam along the arm
      s += line('M74 185 q3 -2 6 0 q3 2 6 0', '#e2c27a', 0.7) + line('M76 202 h14', '#e2c27a', 0.6) + dot(88.6, 194, 0.9, '#e2c27a') + dot(90.4, 196.6, 0.7, '#e2c27a');
      s += line('M72 183.6 h14', '#ffffff', 0.7, 0.45) + line('M70.6 194 v3', '#ffffff', 0.5, 0.4);
      s += line('M71.6 201.4 q4 1 8 0', '#3f7ac9', 0.5, 0.8);
    } else {
      // dust in the grooves, fluff and a tangle of thread
      s += `${box(64, 182, 36, 22, url('Dusty'), ' opacity="0.45"')}${oval(78, 182, 6, 1.6, '#d6cfc2', 0.9)}${oval(66, 203, 4, 1.4, '#d6cfc2', 0.9)}`;
      s += line('M73 199 q4 -6 8 -1 q3 4 -2 5 q-5 0 -2 -5 q3 -4 7 1 q3 3 6 1', '#d9483b', 0.6, 0.8);
      if (!st.machine) s += line('M60 206 q8 4 16 0 q6 -3 12 2', '#b8aa96', 0.6, 0.8);
    }
    return s + '</g>';
  }
  // rolls of cloth on the stockroom shelves
  function bolts() {
    const x = UWR.x;
    let s = `${box(x, UWR.y, UWR.w, UWR.h, '#ead6c8')}${box(x, 186, UWR.w, 2, '#a77b56')}${box(x, 202, UWR.w, 2, '#a77b56')}`;
    const cols = PCT > 0.4 ? ['#c96f7e', '#3f9a94', '#f2d88a', '#8a6cc4', '#efb4ae', '#4e86b8'] : ['#b5a49e', '#9eaaa6', '#cfc6b0', '#a69eb4', '#c9b8b4', '#9aa7b6'];
    for (let i = 0; i < 6; i++) s += `${box(x + 3 + i * 7, 178, 6, 8, cols[i], ' rx="1.4"')}${box(x + 3 + i * 7, 194, 6, 8, cols[(i + 3) % 6], ' rx="1.4"')}`;
    return s + box(x, 204, UWR.w, 12, '#d9c3b2');
  }
  function upstairs(st, decor) {
    let s = `<g clip-path="${url('Uwl')}">${box(UWL.x, UWL.y, UWL.w, UWL.h, '#f1e2d6')}${box(UWL.x + 4, 178, 16, 10, PCT > 0.4 ? '#f6efe3' : '#d9cfc2')}${line(`M${UWL.x + 6} 181 h12 M${UWL.x + 6} 184 h9`, '#b5a58e', 0.6)}`;
    s += `${machine(st)}${decor['bd-lace'] ? lace(UWL) : ''}</g>${sash(UWL, PCT > 0.4)}`;
    s += `<g clip-path="${url('Uwr')}">${bolts()}${decor['bd-form'] ? DECOR['bd-form']() : ''}${decor['bd-lace'] ? lace(UWR) : ''}</g>${sash(UWR, PCT > 0.55)}`;
    return s;
  }
  // window boxes under both upstairs sills
  function windowBox(x, w, st, i) {
    const p = pend(st, 'boxes'), y = 222;
    const wood = st.boxes ? K.teal : '#8f8576';
    let s = `${box(x, y, w, 10, wood, ' rx="1"')}${box(x, y, w, 1.6, '#fff', ' opacity="0.18"')}${box(x + 2, y + 10, 3, 2, U.shade(wood, -0.3))}${box(x + w - 5, y + 10, 3, 2, U.shade(wood, -0.3))}`;
    if (!st.boxes) {
      // bare soil, dead stalks and a crack in the old box
      s += `${box(x + 1, y - 1.6, w - 2, 2, '#6b5240')}${line(`M${x + 8} ${y} l-2 -6 M${x + 15} ${y} l1 -8 l3 -2 M${x + 30} ${y} l-1 -5 M${x + 42} ${y} l2 -7`, '#9a8a62', 0.9)}${line(`M${x + 24} ${y + 2} l2 6`, '#5a5048', 0.8)}`;
      return s;
    }
    const r = U.rng(220 + i * 13), F = FLOWERS[SEASON];
    if (p === 'grow') {
      s += `${box(x + 1, y - 1.6, w - 2, 2, '#6b5240')}`;
      for (let k = 0; k < 6; k++) s += line(`M${f1(x + 4 + k * 8)} ${y} q${k % 2 ? 3 : -3} -4 ${k % 2 ? 5 : -2} -3`, '#8a9a5a', 1);
    } else {
      for (let k = 0; k < 7; k++) s += dot(x + 4 + k * ((w - 8) / 6), y - 3 - (k % 2) * 2, 4.2, k % 2 ? '#5d9644' : '#4f8a3c');
      // trailing stems over the front
      s += line(`M${x + 6} ${y + 1} q-2 6 1 11 M${x + w - 8} ${y + 1} q3 7 0 12 M${x + w / 2} ${y + 2} q-1 5 1 9`, '#5d9644', 1);
      if (!winter()) for (let k = 0; k < 11; k++) s += dot(x + 3 + r() * (w - 6), y - 6 + r() * 6, 1.7, F[k % F.length]) + (k % 3 ? '' : dot(x + 3 + r() * (w - 6), y - 6 + r() * 6, 0.7, '#f2c230'));
      else for (let k = 0; k < 8; k++) s += dot(x + 4 + r() * (w - 8), y - 4 + r() * 4, 1.2, '#d9483b');
    }
    if (p === 'leaves') s += oval(x + 8, y - 2, 3, 1.4, '#d9822b') + oval(x + w - 10, y - 3, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += `<path d="M${x} ${y} q${w / 4} -5 ${w / 2} -2 q${w / 4} -4 ${w / 2} 2Z" fill="${SNOW}"/>`;
    return s;
  }
  function boxes(st) {
    return `<g data-part="boxes">${windowBox(UWL.x - 4, UWL.w + 8, st, 0)}${windowBox(UWR.x - 4, UWR.w + 8, st, 1)}</g>`;
  }

  // ---------------------------------------------------------------- the sign
  function signButton(x, y, ok) {
    const c = ok ? K.brass : '#9a917c';
    return dot(x, y, 7, U.shade(c, -0.25)) + button(x, y, 6.2, c, 4) + (ok ? `<path d="M${x - 4} ${y - 2.6} a5 5 0 0 1 4 -2.4" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.6"/>` : '');
  }
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const c = ok ? C.beadSign : U.mix(C.beadSign, '#a59e90', 0.6), tx = ok ? ink(c) : '#efe9dc';
    const { x, y, w, h } = SIGN;
    let s = `<g data-part="sign"><g${ok ? '' : ` transform="rotate(-1.4 ${x + w / 2} ${y + h / 2})"`}>${box(x + 1.4, y + 1.8, w, h, '#000', ' rx="2" opacity="0.15"')}`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}" stroke="${ok ? U.shade(c, -0.3) : '#8a8070'}" stroke-width="1.2"/>`;
    if (ok) s += `<rect x="${x + 2.6}" y="${y + 2.6}" width="${w - 5.2}" height="${h - 5.2}" rx="1.4" fill="none" stroke="${K.brass}" stroke-width="0.9"/>`;
    s += `<text x="${x + w / 2}" y="${y + 13.6}" text-anchor="middle" font-family="${SERIF}" font-size="12.4" font-weight="700" fill="${tx}" letter-spacing="1.4"${ok ? '' : ' opacity="0.45"'}>BUTTON &amp; BEAD</text>`;
    s += text(x + w / 2, y + 20.6, '· HABERDASHERY ·', 4.8, tx, ` letter-spacing="1"${ok ? '' : ' opacity="0.4"'}`);
    s += signButton(x + 14, y + h / 2, ok) + signButton(x + w - 14, y + h / 2, ok);
    if (!ok) s += `${oval(x + 34, y + 6, 6, 2.4, '#9aa36a', 0.8)}${oval(x + 170, y + 18, 7, 2.2, '#9aa36a', 0.7)}${oval(x + 120, y + 5, 4, 2.4, U.mix(C.beadSign, '#a59e90', 0.78), 0.9)}${line(`M${x + 84} ${y} l-3 8 l2 7`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'frost') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (p === 'leaves') s += oval(x + 10, y + 19, 3.4, 1.6, '#d9822b') + oval(x + 190, y + 4, 3, 1.4, '#c4462f') + oval(x + 100, y + 21, 2.8, 1.3, '#e9b23c');
    if (winter() || p === 'snow') s += `<rect x="${x - 1}" y="${y - 1.6}" width="${w + 2}" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    return s + '</g></g>';
  }

  // ------------------------------------------------------ inside the shop
  // the ribbon shelves on the back wall at the left
  function shelves(st) {
    const p = pend(st, 'shelves');
    const rows = [334, 348, 362], x0 = 48, x1 = 108;
    let s = '<g data-part="shelves">';
    if (st.shelves) {
      rows.forEach((sy, ri) => {
        s += `${box(x0, sy, x1 - x0, 2.6, '#c9924f')}${box(x0, sy + 2.6, x1 - x0, 1, '#000', ' opacity="0.15"')}${box(x0 + 4, sy + 2.6, 1.6, 2.4, '#94693f')}${box(x1 - 6, sy + 2.6, 1.6, 2.4, '#94693f')}`;
        for (let i = 0; i < 7; i++) {
          if (p && (ri * 7 + i) % 4 === 1) continue;
          const cx = x0 + 6 + i * 8, cy = sy - 3.6, col = RIBBONS[(i + ri * 3) % RIBBONS.length];
          s += roll(cx, cy, col);
          if ((i + ri) % 3 === 0) s += line(`M${f1(cx + 2.6)} ${f1(cy + 2)} q1.6 4 -0.6 ${ri === 2 ? 3 : 7}`, col, 1.1);
        }
      });
      // a ribbon tumbled loose while the season's job waits
      if (p) s += line(`M${x0 + 10} ${rows[0] - 2} q10 16 22 6 q10 -8 18 10`, '#c96f7e', 1.2) + box(x0, rows[0] - 10, x1 - x0, 32, url('Dusty'), ' opacity="0.25"');
    } else {
      // only the brackets left on the wall, the ribbons in a heap in a box
      for (const sy of rows) s += line(`M${x0 + 4} ${sy} v3 h3 M${x1 - 4} ${sy} v3 h-3`, '#7d6e5e', 0.9);
      s += `<g transform="rotate(-4 58 360)">${box(48, 352, 22, 14, '#b8986a')}${box(48, 352, 22, 2, '#a3845a')}</g>`;
      s += line('M52 352 q4 -8 9 -2 q4 5 -2 6 q-6 1 -1 -6 q4 -4 9 2 q3 4 6 -2', '#c96f7e', 1, 0.9) + line('M56 352 q6 -10 12 -1 q3 4 8 2', '#3f9a94', 1, 0.9);
      s += `<g transform="rotate(30 86 364)">${roll(86, 364, '#a8a08a')}</g>${roll(100, 365, '#b8a8a0')}`;
    }
    return s + '</g>';
  }
  // the cabinet of little button drawers on the back wall at the right
  function drawers(st) {
    const p = pend(st, 'drawers'), ok = st.drawers;
    const x0 = 152, x1 = 192, y0 = 314, y1 = 366;
    const wood = ok ? '#a0683a' : '#8a7e72';
    let s = `<g data-part="drawers">${box(x0 - 1.6, y0 - 3, x1 - x0 + 3.2, 3.4, U.shade(wood, -0.25), ' rx="0.8"')}${box(x0, y0, x1 - x0, y1 - y0, wood)}`;
    const cw = (x1 - x0 - 4) / 4, rh = (y1 - y0 - 4) / 5;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        const dx = x0 + 2 + c * cw, dy = y0 + 2 + r * rh, out = !ok && r === 3 && c === 1;
        const g = `${box(dx + 0.4, dy + 0.4, cw - 0.8, rh - 0.8, ok ? '#b8794a' : '#9a8e80', ' rx="0.6"')}${button(dx + cw / 2, dy + rh / 2 - 1, 1.9, ok ? RIBBONS[(r * 4 + c) % RIBBONS.length] : '#b0a698', (r + c) % 2 ? 4 : 2)}${box(dx + cw / 2 - 1.4, dy + rh - 2.6, 2.8, 1, ok ? '#e2c27a' : '#77705f')}`;
        s += out ? `<g transform="translate(-1 4) rotate(-6 ${f1(dx + cw / 2)} ${f1(dy + rh / 2)})">${box(dx - 1, dy + rh - 1, cw + 2, 3, '#7d7064')}${g}</g>` : g;
      }
    }
    if (ok) s += line(`M${x0 + 2} ${y0 + 1} H${x1 - 2}`, '#ffffff', 0.6, 0.35);
    else {
      // dust, cobwebs in the corners and buttons spilled on the floor
      s += `${box(x0, y0, x1 - x0, y1 - y0, url('Dusty'), ' opacity="0.45"')}${line(`M${x0} ${y0} l9 8 M${x0} ${y0} l3 11 M${x0} ${y0} l11 3 M${x0 + 3} ${y0 + 6} q3 -2 6 0`, '#f4f1ea', 0.5, 0.9)}`;
      s += line(`M${x1} ${y0} l-8 7 M${x1} ${y0} l-2 10 M${x1 - 6} ${y0 + 5} q3 -2 5 1`, '#f4f1ea', 0.5, 0.9);
    }
    if (p) s += box(x0, y0, x1 - x0, y1 - y0, url('Dusty'), ' opacity="0.32"');
    return s + '</g>';
  }
  // the floorboards inside the window
  function floor(st) {
    const p = pend(st, 'floor'), ok = st.floor, { x, w } = BOW, y = FLOOR_Y, h = BOW.y + BOW.h - FLOOR_Y;
    let s = `<g data-part="floor">${box(x, y, w, h, url(ok ? 'Boards' : 'BoardsOld'))}${box(x, y, w, 2, '#000', ' opacity="0.14"')}`;
    const threads = (n, seed) => {
      const r = U.rng(seed);
      let t = '';
      for (let i = 0; i < n; i++) {
        const tx = x + 4 + r() * (w - 8), ty = y + 4 + r() * (h - 6), col = U.pick(r, ['#d9483b', '#3f7ac9', '#f2c230', '#4f9a5c', '#ef8aa6', '#f6efe3']);
        t += line(`M${f1(tx)} ${f1(ty)} q${f1(3 + r() * 4)} ${f1(-2 - r() * 3)} ${f1(6 + r() * 6)} ${f1(r() * 2)} q2 2 4 0`, col, 0.7, 0.9);
      }
      return t;
    };
    if (!ok) {
      // threads, snippets of cloth, fluff and a pin or two
      s += threads(14, 61) + `<path d="M58 384 l8 -3 l2 5Z M122 388 l7 2 l-5 3Z M176 386 l6 -4 l1 5Z" fill="#c96f7e" opacity="0.8"/>`;
      s += oval(96, 386, 7, 2, '#d6cfc2', 0.9) + oval(150, 380, 5, 1.6, '#d6cfc2', 0.9) + oval(66, 378, 4, 1.4, '#d6cfc2', 0.8) + line('M110 384 l6 1 M140 389 l5 -1', '#b9c0c6', 0.6);
    } else {
      // a striped rag rug before the counter
      s += `${oval(128, 384, 24, 4.4, '#3f9a94')}${oval(128, 384, 18, 3, '#f6efe3')}${oval(128, 384, 11, 1.8, '#c96f7e')}`;
    }
    if (p === 'grow') s += threads(6, 67);
    else if (p === 'leaves') s += oval(x + 150, y + 20, 3, 1.4, '#d9822b') + oval(x + 140, y + 23, 2.8, 1.3, '#c4462f');
    else if (p === 'snow' || p === 'frost') s += [[150, 388], [160, 384], [170, 389], [182, 385]].map(([a, b]) => oval(a, b, 3, 1.4, '#8a9aa6', 0.55)).join('');
    else if (p) s += threads(4, 71);
    return s + '</g>';
  }
  // the counter at the back, scenery for the scales
  function counter() {
    const wood = PCT > 0.4 ? '#8a5a3a' : '#7d6e5e';
    return `${box(110, 346, 40, 3, U.shade(wood, 0.15))}${box(112, 349, 36, 19, wood)}${box(115, 352, 14, 12, 'none', ` stroke="${U.shade(wood, 0.2)}" stroke-width="0.8"`)}${box(131, 352, 14, 12, 'none', ` stroke="${U.shade(wood, 0.2)}" stroke-width="0.8"`)}`;
  }
  // the brass scales on the counter
  function scales(st) {
    const p = pend(st, 'scales'), ok = st.scales;
    const br = ok ? (p ? '#b8a05a' : '#d9b44a') : '#837c54', dk = U.shade(br, -0.28), hi = ok && !p ? '#f6e3a0' : '#9a9472';
    const cx = 130, tilt = ok ? 0 : 5;
    const L = [cx - 14, 327 + tilt], R = [cx + 14, 327 - tilt];
    let s = `<g data-part="scales">${shadow(cx, 346.4, 12, 1)}${box(cx - 7, 343, 14, 3, dk, ' rx="0.8"')}${box(cx - 1.3, 326, 2.6, 17, br)}${dot(cx, 326, 2, br)}`;
    s += line(`M${L[0]} ${L[1]} L${R[0]} ${R[1]}`, br, 2) + dot(L[0], L[1], 0.9, dk) + dot(R[0], R[1], 0.9, dk);
    const pan = (px, py) => line(`M${px} ${py} L${px - 5} ${py + 9} M${px} ${py} L${px + 5} ${py + 9}`, dk, 0.5) + `<path d="M${px - 6.4} ${py + 9} Q${px} ${py + 14} ${px + 6.4} ${py + 9}Z" fill="${br}"/>`;
    s += pan(L[0], L[1]) + pan(R[0], R[1]);
    if (ok && !p) {
      // a little heap of beads in one pan, a brass weight in the other, all gleaming
      s += bead(L[0] - 2, L[1] + 8, 'round', BEAD.red, 0.8) + bead(L[0] + 1, L[1] + 7.6, 'round', BEAD.teal, 0.8) + bead(L[0] - 0.4, L[1] + 6.4, 'round', BEAD.yellow, 0.8);
      s += `<path d="M${R[0] - 2.4} ${R[1] + 9} h4.8 l-1 -4 h-2.8Z" fill="${br}"/>${dot(R[0], R[1] + 4.6, 0.9, dk)}`;
      s += line(`M${cx - 0.4} 328 v12`, hi, 0.6, 0.8) + line(`M${L[0] + 2} ${L[1] - 0.8} H${R[0] - 4}`, hi, 0.5, 0.8);
    } else {
      // tarnished green and brown, the beam tipped
      s += [[cx + 3, 336], [cx - 3, 341], [L[0], L[1] + 11], [R[0] + 2, R[1] + 10]].map(([a, b]) => dot(a, b, 1.3, '#5f7a52', 0.8)).join('');
    }
    return s + '</g>';
  }
  // a little lamp hanging in the window
  function pendant() {
    return `${line('M90 300 V322', '#3d3d42', 0.6)}<path d="M84 329 L87 322 H93 L96 329Z" fill="${K.teal}"/>${box(83.6, 328.4, 12.8, 1.2, K.brass)}${oval(90, 330, 3, 1.2, NIGHT && PCT > 0.3 ? '#fff3c4' : '#f6e6b8')}`;
  }
  // a velvet bust in the window, wearing the necklace
  function necklace(st) {
    const p = pend(st, 'necklace'), ok = st.necklace && !p;
    const cx = 69;
    let s = `<g data-part="necklace">${shadow(cx, 389, 11, 1.4)}`;
    s += `<path d="M${cx - 7} 389 Q${cx - 7} 385 ${cx - 3} 384 H${cx + 3} Q${cx + 7} 385 ${cx + 7} 389Z" fill="#8a6142"/>${box(cx - 1.4, 372, 2.8, 12, '#a77b56')}`;
    s += `<path d="M${cx - 14} 373 Q${cx - 14} 361 ${cx - 5} 358 L${cx - 4} 346 Q${cx} 343 ${cx + 4} 346 L${cx + 5} 358 Q${cx + 14} 361 ${cx + 14} 373Z" fill="${st.necklace ? url('Velvet') : '#7d6a70'}"/>`;
    s += line(`M${cx - 2} 347 V357`, '#ffffff', 0.7, 0.18);
    const pat = [['round', BEAD.red], ['square', BEAD.blue], ['round', BEAD.red], ['star', BEAD.yellow]];
    const at = (t) => [cx - 9.4 + 18.8 * t, 358 + 9 * Math.sin(Math.PI * t)];
    if (st.necklace) {
      const n = ok ? 11 : 6;
      s += `<path d="M${cx - 9.4} 358 Q${cx} 376 ${cx + 9.4} 358" stroke="#e9dcc4" stroke-width="0.5" fill="none"/>`;
      for (let i = 0; i <= 10; i++) {
        if (i >= n) break;
        const [bx, by] = at(i / 10), [kind, col] = pat[i % 4];
        s += bead(bx, by, kind, col, 0.85);
      }
      if (!ok) s += bead(cx + 12, 386, 'round', BEAD.red, 0.8) + bead(cx + 16, 388, 'star', BEAD.yellow, 0.8);
    } else {
      // a broken string hanging from the neck, the beads rolled away
      s += line(`M${cx - 9} 358 Q${cx - 2} 368 ${cx + 2} 364`, '#d9cdb6', 0.6) + bead(cx - 6, 362, 'round', '#a8807a', 0.8);
      s += bead(cx - 12, 387, 'round', '#b07a72', 0.8) + bead(cx + 11, 388, 'square', '#7a8aa6', 0.8) + bead(cx + 18, 386, 'star', '#c9b070', 0.8) + bead(cx - 18, 389, 'round', '#b07a72', 0.8);
    }
    return s + '</g>';
  }
  // four glass jars of buttons in the front of the window
  function buttonJars(st) {
    const p = pend(st, 'buttons'), ok = st.buttons && !p, base = 386;
    let s = `<g data-part="buttons">${shadow(103, base + 1, 20, 1.2)}${box(84, base - 2, 38, 3, '#a77b56', ' rx="1"')}`;
    JARS.forEach(([col, holes], i) => {
      const jx = 89 + i * 9.4, top = base - 14;
      const tipped = !st.buttons && i === 2;
      let j = '';
      // the buttons inside: a full jar once sorted, a few while the job waits
      const n = !st.buttons ? 0 : ok ? 9 : 4;
      for (let k = 0; k < n; k++) j += dot(jx - 2 + (k % 3) * 2, base - 3.4 - Math.floor(k / 3) * 2.6, 1.15, col) + dot(jx - 2 + (k % 3) * 2, base - 3.4 - Math.floor(k / 3) * 2.6, 0.45, U.shade(col, -0.35));
      j += `<path d="M${jx - 3.6} ${top + 2} V${base - 3} Q${jx - 3.6} ${base - 2} ${jx - 2.6} ${base - 2} H${jx + 2.6} Q${jx + 3.6} ${base - 2} ${jx + 3.6} ${base - 3} V${top + 2}Z" fill="#dff0f2" opacity="0.4" stroke="#b9cfd2" stroke-width="0.5"/>`;
      j += `${box(jx - 3.2, top, 6.4, 2, ok ? K.brass : '#9a917c', ' rx="0.6"')}`;
      // the label: the colour and the number of holes, drawn
      j += `${box(jx - 2.6, top + 3.4, 5.2, 4, '#fffaf0', ' rx="0.4"')}${button(jx, top + 5.4, 1.5, col, holes)}`;
      s += tipped ? `<g transform="rotate(-80 ${jx} ${base - 2})">${j}</g>` : j;
    });
    if (!st.buttons) {
      // a heap of every kind of button, all mixed up
      const r = U.rng(83);
      for (let k = 0; k < 12; k++) { const [col] = JARS[k % 4], bx = 92 + r() * 30, by = base + 1.4 + r() * 3; s += dot(bx, by, 1.15, U.mix(col, '#a59e90', 0.35)) + dot(bx, by, 0.45, '#6b6157'); }
    }
    return s + '</g>';
  }
  // a bracelet on a little cushion
  function bracelet(st) {
    const p = pend(st, 'bracelet'), ok = st.bracelet && !p, cx = 177;
    let s = `<g data-part="bracelet">${shadow(cx, 390, 14, 1.3)}`;
    s += `<path d="M${cx - 13} 388 Q${cx - 15} 381 ${cx - 11} 378 H${cx + 11} Q${cx + 15} 381 ${cx + 13} 388 Q${cx} 391 ${cx - 13} 388Z" fill="${st.bracelet ? '#c96f7e' : '#9a8488'}"/>`;
    s += `${line(`M${cx - 10} 380 Q${cx} 382 ${cx + 10} 380`, '#ffffff', 0.5, 0.3)}${dot(cx - 13, 388, 1, K.brass)}${dot(cx + 13, 388, 1, K.brass)}${dot(cx - 11, 378, 0.9, K.brass)}${dot(cx + 11, 378, 0.9, K.brass)}`;
    const pat = [['round', BEAD.teal], ['drop', BEAD.pink], ['round', BEAD.teal], ['square', BEAD.yellow]];
    if (st.bracelet) {
      const n = ok ? 12 : 6;
      s += `<ellipse cx="${cx}" cy="381" rx="8" ry="3.4" fill="none" stroke="#e9dcc4" stroke-width="0.5"/>`;
      for (let i = 0; i < n; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 2, [kind, col] = pat[i % 4];
        s += bead(cx + Math.cos(a) * 8, 381 + Math.sin(a) * 3.4, kind, col, 0.75);
      }
    } else {
      s += line(`M${cx - 8} 381 q4 -3 8 0 q3 2 6 -1`, '#d9cdb6', 0.6) + bead(cx - 4, 380, 'round', '#8aa8a4', 0.75) + bead(cx + 6, 382, 'drop', '#c4a0a8', 0.75) + bead(cx + 9, 379.6, 'round', '#8aa8a4', 0.75);
    }
    return s + '</g>';
  }
  function shopInside(st, decor) {
    const { x, y, w } = BOW;
    let s = `${box(x, y, w, FLOOR_Y - y, url(PCT > 0.35 ? 'Paper' : 'PaperOld'))}${box(x, FLOOR_Y - 3, w, 3, '#8a6142')}`;
    // a mirror on the back wall between the shelves and the drawers
    s += `${oval(130, 318, 7, 9, '#c9a24a')}${oval(130, 318, 5.6, 7.6, PCT > 0.4 ? '#d6e7ea' : '#a8aaa0')}${line('M127 314 l3 -2', '#fff', 0.6, 0.6)}`;
    s += shelves(st) + drawers(st) + floor(st) + counter() + scales(st) + pendant() + necklace(st) + buttonJars(st);
    if (decor['bd-cat']) s += DECOR['bd-cat']();
    return s + bracelet(st);
  }
  // the glass of the bow window and its frame
  function glass(st) {
    const p = pend(st, 'window'), ok = st.window, { x, y, w, h } = BOW;
    const frame = ok ? '#f6efe0' : '#a89f8e';
    let s = '<g pointer-events="none">';
    if (!ok) {
      s += `${box(x, y, w, h, url('Grime'), ' opacity="0.62"')}<path d="M${x + 12} ${y + h} q24 -34 52 -10 M${x + 80} ${y + h - 4} q26 -30 52 -8" stroke="#dfe3d4" stroke-width="7" fill="none" opacity="0.22" stroke-linecap="round"/>`;
      s += line(`M${x + 118} ${y + 24} l-8 14 l6 6 l-9 16`, '#eef0e8', 0.8, 0.9) + line(`M${x + 2} ${y + 24} q10 6 20 0 M${x + 2} ${y + 24} l14 16`, '#eef0e8', 0.5, 0.85);
      // a card in the window
      s += `${line(`M${x + 66} ${y + 22} l6 -4 l6 4`, '#8a7a62', 0.5)}${box(x + 64, y + 22, 16, 9, '#e8dcc6', ' rx="0.6"')}${text(x + 72, y + 28.4, 'CLOSED', 3.6, '#8e2f3a')}`;
    } else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.84"') + line(`M${x + 4} ${y + h - 4} q8 -14 4 -26 M${x + w - 4} ${y + h - 4} q-10 -12 -6 -26`, '#fff', 1.3);
    else if (p === 'grow') s += box(x, y, w, h, url('Dusty'), ' opacity="0.42"');
    else s += `<path d="M${x + 8} ${y + h} L${x + 44} ${y + 20} H${x + 56} L${x + 20} ${y + h}Z M${x + 92} ${y + h} L${x + 120} ${y + 20} H${x + 127} L${x + 99} ${y + h}Z" fill="#fff" opacity="0.13"/>`;
    s += '</g>';
    // a teal frame and slender bars, closer together at the sides where the bow turns
    s += `<g data-part="window"><path d="M${x} ${y} H${x + w} V${y + h} H${x}Z" stroke="${K.teal}" stroke-width="5" fill="none"/>`;
    s += `<path d="M${x + 14} ${y} V${y + h} M${x + 44} ${y} V${y + h} M${x + w / 2} ${y} V${y + h} M${x + w - 44} ${y} V${y + h} M${x + w - 14} ${y} V${y + h}" stroke="${frame}" stroke-width="1.8"/>`;
    s += `<path d="M${x} ${y + 24} H${x + w}" stroke="${frame}" stroke-width="1.6"/>`;
    s += box(x, y, 14, h, '#000', ' opacity="0.06"') + box(x + w - 14, y, 14, h, '#000', ' opacity="0.06"');
    // the sill bowing out over the stall riser
    s += `<path d="M${x - 6} ${y + h} Q${x + w / 2} ${y + h + 8} ${x + w + 6} ${y + h} V${y + h + 3} Q${x + w / 2} ${y + h + 11} ${x - 6} ${y + h + 3}Z" fill="${K.stone}"/>`;
    s += `<path d="M${x - 6} ${y + h + 3} Q${x + w / 2} ${y + h + 11} ${x + w + 6} ${y + h + 3}" stroke="#000" stroke-width="1.2" opacity="0.14" fill="none"/>`;
    if (p === 'leaves') s += oval(x + 10, y + h + 2, 3.4, 1.6, '#d9822b') + oval(x + 24, y + h + 4, 3, 1.4, '#c4462f') + oval(x + w - 12, y + h + 3, 3.2, 1.5, '#e9b23c');
    if (winter() || p === 'snow') s += `<path d="M${x - 6} ${y + h - 0.4} Q${x + w / 2} ${y + h + 7.6} ${x + w + 6} ${y + h - 0.4} V${y + h + 1.6} Q${x + w / 2} ${y + h + 9.6} ${x - 6} ${y + h + 1.6}Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- the awning
  function awning(st) {
    const p = pend(st, 'awning'), ok = st.awning;
    const { x0, x1, y0, y1 } = AWN, fx0 = x0 - 5, fx1 = x1 + 5, n = 12;
    const a = ok ? K.awn : '#97aaa6', b = ok ? '#f6efe3' : '#d6cfc0';
    const at = (t, front) => (front ? fx0 + (fx1 - fx0) * t : x0 + (x1 - x0) * t);
    let s = `<g data-part="awning">${box(BOW.x, y1 + 6, BOW.w, 12, url('Shade'), ' pointer-events="none" opacity="0.6"')}`;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      s += `<path d="M${f1(at(t0))} ${y0} L${f1(at(t1))} ${y0} L${f1(at(t1, 1))} ${y1} L${f1(at(t0, 1))} ${y1}Z" fill="${i % 2 ? b : a}"/>`;
    }
    s += `<path d="M${x0} ${y0} H${x1} L${fx1} ${y1} H${fx0}Z" fill="${url('AwnShade')}"/>`;
    // the valance, scalloped, in the same stripes
    for (let i = 0; i < n; i++) {
      const bx0 = at(i / n, 1), bx1 = at((i + 1) / n, 1), drop = ok ? 0 : (i % 3) * 1.4;
      s += `<path d="M${f1(bx0)} ${y1} H${f1(bx1)} V${f1(y1 + 4 + drop)} Q${f1((bx0 + bx1) / 2)} ${f1(y1 + 10 + drop)} ${f1(bx0)} ${f1(y1 + 4 + drop)}Z" fill="${i % 2 ? b : a}"/>`;
    }
    s += line(`M${fx0} ${y1 + 0.6} H${fx1}`, '#000', 0.8, 0.15);
    // the iron arms at each end and the brass roller under the sign
    s += line(`M${x0 - 1} ${y0 + 1} L${fx0} ${y1 + 3}`, '#3d3d42', 1.3) + line(`M${x1 + 1} ${y0 + 1} L${fx1} ${y1 + 3}`, '#3d3d42', 1.3);
    s += box(x0 - 2, y0 - 2.6, x1 - x0 + 4, 3.6, K.brass, ' rx="1.6"');
    if (!ok) {
      // grimy streaks, a tear with the light through it, mould spots
      s += `<path d="M${x0 + 40} ${y0 + 3} l6 12 l5 -9Z" fill="#3b352e" opacity="0.55"/>${line(`M${x0 + 90} ${y0 + 2} l2 18 M${x0 + 110} ${y0 + 4} l-2 14 M${x0 + 20} ${y0 + 6} l1 12`, '#6f6a52', 2, 0.35)}`;
      s += [[x0 + 66, y0 + 12], [x0 + 130, y0 + 8], [x0 + 12, y0 + 14]].map(([u, v]) => oval(u, v, 4, 2, '#5f6a44', 0.45)).join('');
    }
    if (p === 'grow') s += `<path d="M${x0} ${y0} H${x1} L${fx1} ${y1} H${fx0}Z" fill="${FADE}" opacity="0.45"/>`;
    else if (p === 'frost') s += `<path d="M${x0} ${y0} H${x1} L${fx1} ${y1} H${fx0}Z" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (p === 'leaves') s += `<path d="M${x0} ${y0} H${x1} L${fx1} ${y1 - 8} H${fx0}Z" fill="${url('Leaves')}" opacity="0.95"/>`;
    if (winter() || p === 'snow') s += `<path d="M${x0 - 1} ${y0 - 2} H${x1 + 1} L${fx1 - 2} ${y0 + 9} Q${(x0 + x1) / 2 + 30} ${y0 + 13} ${(x0 + x1) / 2} ${y0 + 10} Q${(x0 + x1) / 2 - 40} ${y0 + 14} ${fx0 + 2} ${y0 + 9}Z" fill="${SNOW}" opacity="0.95"/>`;
    return s + '</g>';
  }

  // ---------------------------------------------------------- the door
  function door(st, C, decor) {
    const p = pend(st, 'door'), ok = st.door;
    const c = ok ? C.beadDoor : U.mix(C.beadDoor, '#a59e90', 0.62), dk = U.shade(c, -0.25);
    const { x, y, w, h } = DOOR;
    let s = `<g data-part="door">${box(x, y, w, h, c)}`;
    // glass in the top half, with a lace curtain once there is one
    s += `<g clip-path="${url('DoorGlass')}">${box(x + 5, y + 6, w - 10, 38, ok ? '#cfe3e6' : url('Grime'))}`;
    if (ok) s += `${box(x + 5, y + 6, w - 10, 38, '#f6e4dc', ' opacity="0.45"')}${roll(x + 10, y + 36, '#c96f7e')}${roll(x + 18, y + 37, '#3f9a94')}`;
    if (decor['bd-lace']) {
      s += `<path d="M${x + 5} ${y + 22} H${x + w - 5} V${y + 44} H${x + 5}Z" fill="#ffffff" opacity="0.85"/>`;
      for (let k = 0; k < 5; k++) s += `<path d="M${f1(x + 5 + k * 4.4)} ${y + 22} q2.2 3 4.4 0" fill="#ffffff"/>${dot(x + 7 + k * 4.4, y + 30, 0.8, '#e8dfd2')}${dot(x + 9 + k * 4.4, y + 37, 0.8, '#e8dfd2')}`;
    }
    s += `</g><rect x="${x + 5}" y="${y + 6}" width="${w - 10}" height="38" fill="none" stroke="${dk}" stroke-width="1.2"/>${line(`M${x + w / 2} ${y + 6} V${y + 44}`, dk, 0.8)}`;
    // two panels below, a brass knob and a letter box
    for (const py of [y + 50, y + 76]) s += `<rect x="${x + 5}" y="${py}" width="${w - 10}" height="20" rx="0.8" fill="none" stroke="${dk}" stroke-width="1.1"/>`;
    s += `${dot(x + w - 5, y + 60, 1.6, ok ? '#e9c35a' : '#77705f')}${box(x + 10, y + 71.4, 12, 2.6, ok ? '#d9b44a' : '#77705f', ' rx="0.8"')}`;
    if (ok) s += `${line(`M${x + 12} ${y + 10} l4 -4 l4 4`, '#8a7a62', 0.5)}${box(x + 10, y + 10, 12, 6, '#fffaf0', ' rx="0.6"')}${text(x + w / 2, y + 14.6, 'OPEN', 3.4, '#2f6b66')}`;
    else s += `${oval(x + 6, y + 56, 3, 2, '#d8cfbf', 0.75)}${oval(x + 22, y + 84, 2.6, 1.6, '#d8cfbf', 0.7)}${oval(x + 9, y + 92, 3, 1.2, '#d8cfbf', 0.6)}${line(`M${x + 20} ${y + 48} l-2 9 l2 5`, '#3a302a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5"');
    else if (p === 'frost') s += box(x + 5, y + 6, w - 10, 38, url('Frost'), ' opacity="0.8"');
    else if (p === 'leaves') s += oval(x + 4, y + h - 2, 3, 1.4, '#d9822b') + oval(x + w - 6, y + h - 3, 2.8, 1.3, '#c4462f');
    if (winter() || p === 'snow') s += box(x - 4, y - 18, w + 8, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // a little brass lamp on the pilaster between the window and the door
  function lantern() {
    const lit = PCT > 0.5;
    return `${line('M204 304 V298 h-8', '#3d3d42', 1.1)}${box(193, 298, 7, 10, '#2f2f33', ' rx="1"')}${box(194.2, 300, 4.6, 6, lit ? '#fde7a3' : '#a39c88')}<path d="M192 298 L196.5 294 L201 298Z" fill="${K.brass}"/>`;
  }
  // the stone doorstep: two half-moon treads
  function step(st) {
    const p = pend(st, 'step'), ok = st.step;
    const stone = ok ? '#e9e1d2' : '#b6ad9c', dk = U.shade(stone, -0.18);
    let s = `<g data-part="step">${shadow(230, 423, 34, 2)}`;
    s += `<path d="M198 422 V416 Q198 412 204 412 H256 Q262 412 262 416 V422Z" fill="${dk}"/><path d="M198 416 Q198 412 204 412 H256 Q262 412 262 416 Z" fill="${stone}"/>`;
    s += `<path d="M203 412 V407 Q203 404 208 404 H252 Q257 404 257 407 V412Z" fill="${dk}"/><path d="M203 407 Q203 404 208 404 H252 Q257 404 257 407 Z" fill="${stone}"/>`;
    s += box(198, 415.6, 64, 1.6, '#fff', ' opacity="0.25"') + box(203, 406.6, 54, 1.2, '#fff', ' opacity="0.25"');
    if (!ok) {
      s += `${oval(214, 414, 8, 1.6, '#7d8a5a', 0.75)}${oval(248, 406, 6, 1.2, '#7d8a5a', 0.7)}${line('M226 412 l3 4 l-2 4 M240 404 l-2 5', '#7d7466', 0.8)}`;
      s += `${oval(232, 418, 10, 2, '#8a7a62', 0.5)}${line('M205 420 l-2 -5 M205 420 l1 -6 M258 412 l2 -5', '#6f8a3e', 1)}`;
    } else s += `${box(214, 404.4, 32, 2.4, '#b98a52', ' rx="0.8"')}${line('M216 405.6 h28', '#8a6142', 0.5, 0.7)}`;
    if (p === 'leaves') s += oval(212, 413, 3.4, 1.5, '#d9822b') + oval(244, 414, 3, 1.4, '#c4462f') + oval(228, 405, 2.8, 1.3, '#e9b23c') + oval(254, 419, 3, 1.3, '#9c5a2a');
    else if (p === 'snow') s += `<path d="M198 416 Q198 411 204 411 H256 Q262 411 262 416 Z M203 407 Q203 403 208 403 H252 Q257 403 257 407 Z" fill="${url('Snow')}"/>`;
    else if (p === 'frost') s += `<path d="M198 416 Q198 412 204 412 H256 Q262 412 262 416 Z M203 407 Q203 404 208 404 H252 Q257 404 257 407 Z" fill="${url('Frost')}" opacity="0.7"/>`;
    else if (p) s += `${oval(214, 414, 7, 1.4, '#7d8a5a', 0.6)}${oval(246, 406, 5, 1, '#7d8a5a', 0.55)}`;
    if (winter() && p !== 'snow') s += `${box(199, 411.4, 62, 1.8, SNOW, ' rx="0.9"')}${box(204, 403.4, 52, 1.6, SNOW, ' rx="0.8"')}`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- the yard
  // the yard's back wall, with a climbing rose
  function yardWall() {
    let s = `${box(266, 272, 134, 70, url(PCT > 0.4 ? 'Brick' : 'BrickOld'))}${box(264, 267, 138, 6, K.stone, ' rx="1"')}${box(266, 273, 134, 3, '#000', ' opacity="0.12"')}`;
    const rose = { spring: '#f2a7b8', summer: '#e2574c', autumn: '#c9586e', winter: null }[SEASON];
    s += line('M392 340 q-6 -20 -2 -40 q4 -14 -6 -26 M392 312 q-12 -4 -18 -14', '#6b8a3e', 1.4);
    s += [[386, 300], [380, 290], [392, 280], [376, 300], [388, 318]].map(([a, b]) => dot(a, b, 3.4, '#5d9644') + (rose && PCT > 0.3 ? dot(a + 1.6, b - 1.2, 1.8, rose) : '')).join('');
    if (winter()) s += box(264, 265.4, 138, 2.4, SNOW, ' rx="1"');
    return s;
  }
  // the washing line, with cloth drying once the place is cared for
  function washing() {
    let s = `${box(276, 284, 3, 56, '#8a6142')}${box(370, 282, 3, 58, '#8a6142')}${box(274.6, 282, 5.8, 2.4, '#6b5240')}${box(368.6, 280, 5.8, 2.4, '#6b5240')}`;
    s += `<path d="M278 286 Q324 298 371 284" stroke="#d9d0c0" stroke-width="0.7" fill="none"/>`;
    const at = (t) => [278 + 93 * t, 286 + 22 * t * (1 - t) - 2 * t];
    if (PCT < 0.3) {
      const [x, y] = at(0.55);
      return s + `<g class="eb-flap">${cloth(x - 6, y, 12, 16, '#b8b1a2', 'plain')}</g>`;
    }
    const pieces = [[0.1, 13, 22, '#c96f7e', 'stripe'], [0.28, 14, 28, '#3f9a94', 'gingham'], [0.47, 13, 24, '#f6efe3', 'sprig'], [0.65, 14, 26, '#f2c230', 'spot'], [0.84, 12, 20, '#8a6cc4', 'stripe']];
    s += pieces.map(([t, w, h, col, kind]) => { const [x, y] = at(t); return `<g class="eb-flap">${cloth(x - w / 2, y, w, h, winter() ? U.mix(col, '#ffffff', 0.15) : col, kind)}</g>`; }).join('');
    return s;
  }
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard;
    let s = `<g data-part="yard"><path d="${YARD_D}" fill="${ok ? url('Flags') : url('FlagsOld')}"/>${box(266, 338, 134, 3, '#000', ' opacity="0.12"')}`;
    const tufts = (n, seed) => {
      const r = U.rng(seed);
      let t = '';
      for (let i = 0; i < n; i++) { const x = 270 + r() * 126, y = 344 + r() * 50; t += line(`M${f1(x)} ${f1(y)} l-2 -4 M${f1(x)} ${f1(y)} l0.6 -5 M${f1(x)} ${f1(y)} l3 -3.4`, '#5f7a34', 1.1); }
      return t;
    };
    if (!ok) {
      // moss, weeds, a puddle and an old crate
      s += `<path d="${YARD_D}" fill="${url('Moss')}" opacity="0.4"/>${tufts(16, 113)}${oval(340, 372, 14, 3.4, '#7d8a8a', 0.7)}`;
      s += `<g transform="rotate(-8 300 366)">${box(290, 356, 22, 14, '#8a7a62')}${line('M290 361 h22 M290 366 h22 M297 356 v14 M305 356 v14', '#6b5e4c', 0.8)}</g>`;
    } else {
      // pots of geraniums along the wall, and a chair in the sun
      for (const [x, k] of [[284, 1], [298, 0.85]]) s += `${shadow(x, 350, 6 * k, 1.2)}<path d="M${f1(x - 5 * k)} 342 h${f1(10 * k)} l${f1(-1.4 * k)} 8 h${f1(-7.2 * k)}Z" fill="#c4704b"/>${winter() ? '' : dot(x - 2, 339, 3.4 * k, '#4f8a3c') + dot(x + 2, 338, 3.4 * k, '#5d9644') + dot(x, 336, 1.6, '#e2574c') + dot(x - 3, 338, 1.4, '#e2574c')}`;
      s += `${shadow(328, 374, 10, 1.6)}${box(320, 362, 16, 2.6, '#c9924f')}${box(321, 352, 2, 22, '#a77b56')}${box(334, 352, 2, 22, '#a77b56')}${box(320, 352, 16, 2, '#c9924f')}${box(320, 356, 16, 1.6, '#c9924f')}${box(333, 364, 2, 10, '#a77b56')}`;
    }
    if (p === 'grow') s += `<path d="${YARD_D}" fill="${url('Moss')}" opacity="0.25"/>${tufts(7, 117)}`;
    if (p === 'leaves') s += `<path d="${YARD_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${YARD_D}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (p === 'frost') s += `<path d="${YARD_D}" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (winter() && ok) s += `<path d="M266 352 Q320 346 360 352 T400 350 V410 H266Z" fill="${SNOW}" opacity="0.8"/>`;
    return s + '</g>';
  }
  // the low wall along the street, with the yard gate standing open
  function frontWall() {
    const w = url(PCT > 0.4 ? 'Brick' : 'BrickOld');
    let s = `${box(270, 396, 32, 14, w)}${box(342, 396, 58, 14, w)}${box(268, 393, 34, 3.4, K.stone, ' rx="1"')}${box(342, 393, 60, 3.4, K.stone, ' rx="1"')}`;
    for (const x of [298, 338]) s += `${box(x, 380, 8, 30, w)}${box(x - 1.4, 377, 10.8, 3.6, K.stone, ' rx="1"')}${dot(x + 4, 375, 2.4, K.stone)}`;
    // the gate, swung open against the right pier
    const g = PCT > 0.4 ? '#2f6b66' : '#7d7a6e';
    s += `<path d="M336 384 L330 386 V407 L336 409Z" fill="${g}"/>${line('M331 390 L335 389 M331 397 L335 396 M331 404 L335 403', U.shade(g, 0.25), 0.8)}`;
    if (winter()) s += `${box(268, 391.6, 34, 2, SNOW, ' rx="1"')}${box(342, 391.6, 60, 2, SNOW, ' rx="1"')}${oval(302, 375, 3.4, 1.4, SNOW)}${oval(342, 375, 3.4, 1.4, SNOW)}`;
    return s;
  }

  // ---------------------------------------------------------------- clutter
  function clutter() {
    if (PCT >= 0.5) return '';
    let s = '';
    const r = U.rng(97);
    const weed = (x, y) => line(`M${x} ${y} l-3 -8 M${x} ${y} l1 -10 M${x} ${y} l4 -7`, U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']), 1.2);
    for (const [x, y] of [[30, 412], [190, 412], [306, 412], [372, 412], [120, 440]]) for (let k = 0; k < 3; k++) s += weed(x + k * 4, y);
    // an old box of unwanted remnants on the pavement
    s += `<g transform="rotate(-6 120 426)">${box(106, 418, 26, 12, '#b8986a')}${box(106, 418, 26, 2, '#a3845a')}</g>${line('M110 418 q4 -6 8 -1 q3 4 8 -2', '#a8a08a', 1)}`;
    return `<g opacity="${f1(1 - PCT * 1.6)}">${s}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="98.5" y="506" width="3" height="28" fill="#8a6142"/><g transform="rotate(-4 100 502)">
      <rect x="76" y="492" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="100" y="505.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 100 510)"><rect x="73" y="506" width="54" height="10" fill="#d9534f"/><text x="100" y="514" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot. The cat,
  // the dress form and the lace are drawn in their windows; the rest on top.
  function bunting(a, b, sag, n) {
    const cols = ['#c96f7e', '#3f9a94', '#f2d88a', '#ffffff', '#8a6cc4', '#efb4ae'];
    const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)];
    let s = `<path d="M${a[0]} ${a[1]} Q${f1((a[0] + b[0]) / 2)} ${f1((a[1] + b[1]) / 2 + sag * 2)} ${b[0]} ${b[1]}" stroke="#6b6157" stroke-width="0.6" fill="none"/>`;
    for (let i = 1; i < n; i++) {
      const [x, y] = at(i / n);
      s += `<path class="eb-ribbon" d="M${f1(x - 2.6)} ${f1(y)} h5.2 l-2.6 5.4Z" fill="${cols[i % cols.length]}"/>`;
    }
    return s;
  }
  // fairy lights along the awning's edge and down both sides of the window
  const BULBS = (() => {
    const out = [];
    for (let x = 36; x <= 200; x += 9.1) out.push([x, 326 + Math.sin(((x - 36) / 164) * Math.PI * 4) * 1.4]);
    for (let y = 336; y <= 388; y += 9) { out.push([37, y]); out.push([199, y]); }
    return out;
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const DECOR = {
    'bd-fern': () => `<g>${shadow(190, 419, 9, 1.6)}<path d="M183 408 h14 l-2 11 h-10Z" fill="#c4704b"/>${box(182, 406, 16, 3, '#b4603e', ' rx="1"')}
      ${[-60, -35, -12, 12, 35, 60].map((a, i) => `<path d="M190 406 q${f1(Math.sin((a * Math.PI) / 180) * 9)} ${f1(-12 - (i % 2) * 3)} ${f1(Math.sin((a * Math.PI) / 180) * 18)} ${f1(-8 - (i % 2) * 4)}" stroke="${winter() ? '#7a9a72' : '#4f8a3c'}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-dasharray="1.6 0.8"/>`).join('')}${winter() ? oval(190, 404, 7, 1.4, SNOW) : ''}</g>`,
    'bd-bunting': () => `<g>${bunting([18, 240], [143, 244], 4, 12)}${bunting([143, 244], [268, 240], 4, 12)}</g>`,
    'bd-bell': () => `<g>${line('M247 294 q8 0 8 6', '#3d3d42', 1.2)}<g class="eb-swing"><path d="M252 300 q0 -2 3 -2 h1 q3 0 3 2 l1.6 7 h-10Z" fill="#e2c27a"/>${box(250, 306.4, 11, 1.6, '#c99a2e', ' rx="0.8"')}${dot(255.5, 309, 1.2, '#b8902f')}</g></g>`,
    'bd-lace': () => '',
    'bd-poster': () => `<g>${box(124, 176, 38, 40, '#fffaf0')}${box(124, 176, 38, 40, 'none', ' stroke="#c9a24a" stroke-width="1.2"')}${box(127, 179, 32, 26, '#f6e4dc')}
      <path d="M143 182 q-5 0 -6 4 l-3 16 h18 l-3 -16 q-1 -4 -6 -4Z" fill="#c96f7e"/><path d="M138 187 h10" stroke="#f6efe3" stroke-width="1"/>${dot(143, 181, 2, '#e8c4a8')}
      ${line('M131 184 l3 3 M155 184 l-3 3 M131 200 h4 M151 200 h4', '#8a7a62', 0.5, 0.8)}${text(143, 211.4, 'PATTERNS', 4.2, '#2f6b66', ' letter-spacing="0.6"')}</g>`,
    'bd-cat': () => `<g>${shadow(146, 390, 11, 1.4)}<g class="eb-breathe">${oval(147, 386, 9.6, 5, '#e39a52')}${oval(145, 384, 6, 2, '#f6c48a', 0.6)}</g>
      <path d="M156 388 q5 2 1 4 q-8 1 -15 -1" stroke="#e39a52" stroke-width="2.4" fill="none" stroke-linecap="round"/>${dot(137.6, 385, 4, '#e39a52')}
      <path d="M134.6 382.4 l-0.4 -3.6 l2.8 2Z M139 381.4 l1.6 -3.4 l1.2 3.4Z" fill="#e39a52"/>${line('M135.6 385 q1 0.8 2 0 M138.4 385 q1 0.8 2 0', '#5a3a22', 0.5)}${oval(138, 387.6, 2.2, 1.2, '#f6c48a')}</g>`,
    'bd-scissors': () => `<g>${line('M266 234 H298', '#3d3d42', 1.8)}${line('M268 234 q8 -10 18 0', '#3d3d42', 1.1)}${dot(298, 234, 1.6, '#3d3d42')}<g class="eb-swing">${line('M290 235 V240 M282 235 V240', '#3d3d42', 0.7)}
      <g transform="translate(286 259)"><path d="M-3 -10 L-1.2 -10 L7 20 L4.4 21Z" fill="#d9b44a"/><path d="M3 -10 L1.2 -10 L-7 20 L-4.4 21Z" fill="#e6c876"/>
      <circle cx="-5" cy="-15" r="4.6" fill="none" stroke="#c99a2e" stroke-width="2.2"/><circle cx="5" cy="-15" r="4.6" fill="none" stroke="#c99a2e" stroke-width="2.2"/>${dot(0, 0, 1.4, '#8a6a2a')}${line('M-1 -6 L5 17', '#fff6cf', 0.6, 0.7)}</g></g>${winter() ? line('M266 232.4 H298', SNOW, 1.6) : ''}</g>`,
    'bd-pram': () => `<g transform="translate(-314 0)">${shadow(360, 438, 16, 2)}${[[350, 432], [368, 432]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="none" stroke="#3d3d42" stroke-width="1.3"/>${dot(x, y, 0.9, '#9aa3ad')}`).join('')}
      <path d="M344 414 H374 Q376 424 368 427 H350 Q344 426 344 414Z" fill="#2f6b66"/><path d="M344 414 Q346 404 356 404 L358 414Z" fill="#245652"/>${line('M374 414 l6 -6 h3', '#3d3d42', 1.2)}${line('M350 427 L352 432 M368 427 L366 432', '#3d3d42', 1)}
      ${winter() ? oval(360, 413, 14, 2.6, SNOW) : [[349, 411], [354, 408], [360, 410], [365, 407], [370, 411], [357, 412]].map(([a, b], i) => dot(a, b, 3.2, '#5d9644') + dot(a + 0.6, b - 1.4, 1.8, FLOWERS[SEASON][i % 4])).join('')}</g>`,
    'bd-lights': () => `<g>${line(`M${BULBS[0][0]} ${BULBS[0][1] - 1} ${BULBS.slice(0, 19).map(([x, y]) => `L${f1(x)} ${f1(y - 0.6)}`).join(' ')}`, '#3d3d42', 0.5)}${line('M37 330 V390 M199 330 V390', '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    'bd-ribbons': () => {
      let s = `<path d="M302 377 Q320 352 342 377" stroke="#d9b44a" stroke-width="1.6" fill="none"/>`;
      RIBBONS.forEach((c, i) => {
        const t = (i + 0.5) / RIBBONS.length, x = 302 + 40 * t, y = 377 - 25 * 4 * t * (1 - t) + 1;
        s += `<path class="eb-ribbon" d="M${f1(x)} ${f1(y)} q-2 6 0 12 q2 5 -1 9" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      });
      return `<g>${s}${winter() ? '<path d="M304 373 Q320 350 340 373" stroke="#f4f8fb" stroke-width="1" fill="none"/>' : ''}</g>`;
    },
    'bd-tree': () => {
      let s = `${shadow(384, 380, 8, 1.4)}<path d="M378 380 h12 l-2 -9 h-8Z" fill="#c4704b"/>${line('M384 371 V352 M384 360 l-6 -6 M384 356 l6 -7', '#6b5240', 1.6)}`;
      if (!winter()) s += dot(384, 346, 9, '#6aa858') + dot(378, 351, 6, '#5f9a4c') + dot(390, 350, 6, '#5f9a4c');
      [[378, 346, 0], [388, 343, 1], [382, 352, 2], [391, 352, 3], [384, 339, 4], [375, 354, 5]].forEach(([x, y, i]) => { s += line(`M${x} ${y - 4} V${y - 2}`, '#8a7a62', 0.4) + button(x, y, 2.2, RIBBONS[i], i % 2 ? 4 : 2); });
      return `<g transform="translate(-22 0)"><g class="eb-swing">${s}</g></g>`;
    },
    'bd-form': () => `<g>${box(204, 211, 2, 5, '#6b5240')}<path d="M199 216 h10 l-1 -2 h-8Z" fill="#6b5240"/>
      <path d="M197 178 Q197 175 200 175 H210 Q213 175 213 178 L211 186 L214 200 Q205 204 196 200 L199 186Z" fill="#efe4d0"/>
      <path d="M197 186 Q205 190 213 186 L216 204 Q205 210 194 204Z" fill="#c96f7e"/>${box(197, 185, 16, 2.4, '#3f9a94')}${line('M199 192 l2 10 M205 192 v12 M211 192 l-1 10', '#ffffff', 0.5, 0.4)}${box(203.4, 172, 3.2, 3, '#6b5240')}</g>`,
  };
  const INSIDE = new Set(['bd-cat', 'bd-form', 'bd-lace']);
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && !INSIDE.has(k)) s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M168 52 q4 -4 8 0 q4 -4 8 0 M190 64 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a robin on the yard wall in winter, pigeons on the pavement otherwise
    if (winter() && PCT > 0.4) s += `<g class="eb-hop">${oval(318, 264, 3.4, 2.8, '#8a6a4a')}${oval(319.8, 265, 2, 1.6, '#e2674c')}${dot(320.2, 261.6, 1.9, '#8a6a4a')}<path d="M321.8 261.6 l1.6 0.4 l-1.6 0.4Z" fill="#3d3d42"/>${dot(320.6, 261.2, 0.4, '#222')}</g>`;
    else if (!winter() && PCT > 0.4) {
      const pigeon = (x, y, f) => `<g transform="translate(${x} ${y}) scale(${f} 1)">${shadow(0, 4, 5, 1)}${oval(0, 0, 5, 3.4, '#8a8f9a')}${dot(4, -3, 2.2, '#7a7f8a')}<path d="M6 -3 l2 0.6 l-2 0.6Z" fill="#d9a05a"/>${oval(-1, 0, 3, 2, '#9aa0aa')}${oval(4.4, -1.4, 1.2, 1, '#6aa08a', 0.8)}${line('M-1 3.4 v1.4 M1 3.4 v1.4', '#d9805a', 0.7)}</g>`;
      s += `<g class="eb-hop">${pigeon(80, 430, 1)}</g>${pigeon(96, 432, -1)}`;
    }
    if (PCT > 0.6 && !winter()) s += '<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>';
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

  // evening: darken everything except the bow window with its little lamp,
  // the upstairs windows, the fanlight and the lamp by the door. Every light
  // here is drawn with a fill from a Glow gradient, so the goodnight ending
  // can switch them off.
  function night(st, decor) {
    const bow = st.window && !PEND.window, work = st.machine && !PEND.machine, stock = PCT > 0.6, fan = st.door && !PEND.door, lamp = PCT > 0.5;
    const rect = (w) => `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}"/>`;
    const FAN = { x: DOOR.x - 1, y: DOOR.y - 13, w: DOOR.w + 2, h: 10 };
    let holes = '';
    if (bow) holes += rect(BOW);
    if (work) holes += rect(UWL);
    if (stock) holes += rect(UWR);
    if (fan) holes += rect(FAN);
    if (lamp) holes += '<rect x="194" y="300" width="5" height="6"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 140)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="345" cy="54" r="14" fill="#000"/></mask><circle cx="338" cy="60" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="338" cy="60" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (bow) s += `<rect x="${BOW.x}" y="${BOW.y}" width="${BOW.w}" height="${BOW.h}" fill="${url('GlowPane')}"/>${glow(90, 334, 30, 26)}${glow(118, 350, 96, 56)}${glow(118, 418, 86, 9)}`;
    if (work) s += `<rect x="${UWL.x}" y="${UWL.y}" width="${UWL.w}" height="${UWL.h}" fill="${url('GlowPane')}"/>${glow(81, 194, 34, 28)}`;
    if (stock) s += `<rect x="${UWR.x}" y="${UWR.y}" width="${UWR.w}" height="${UWR.h}" fill="${url('GlowPane')}" opacity="0.8"/>${glow(205, 194, 30, 24)}`;
    if (fan) s += `${glow(230, 296, 22, 10)}`;
    if (lamp) s += `${glow(196.5, 303, 14, 13)}${glow(200, 420, 26, 5)}`;
    if (decor['bd-lights']) s += BULBS.map(([x, y], i) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5.6" ry="5.6" fill="${url('GlowB' + (i % 4))}"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    step: [230, 412], window: [118, 352], awning: [118, 304], sign: [145, 278], door: [230, 352], floor: [118, 384], scales: [130, 336],
    machine: [81, 196], drawers: [172, 340], shelves: [76, 342], boxes: [143, 226], yard: [330, 370], necklace: [69, 362], buttons: [103, 378], bracelet: [177, 382],
  };
  const PARTS = ['step', 'window', 'awning', 'sign', 'door', 'floor', 'scales', 'machine', 'drawers', 'shelves', 'boxes', 'yard', 'necklace', 'buttons', 'bracelet'];
  function sparkles(part) {
    if (!part) return '';
    const spot = SPOTS[part] || [143, 330];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = spot[0] + Math.cos(a) * d, y = spot[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${f1(x)} ${f1(y - 6)} L${f1(x + 1.5)} ${f1(y - 1.5)} L${f1(x + 6)} ${f1(y)} L${f1(x + 1.5)} ${f1(y + 1.5)} L${f1(x)} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours (beadSign,
  // beadDoor); opts as for HALT.render
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night;
    const decor = opts.decor || {};
    palette({ beadSign: cols.beadSign || '#efb4ae', beadDoor: cols.beadDoor || '#a6d3d4' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house beads">
      ${style()}${defs()}${sky()}${far()}${tree()}${yardWall()}${washing()}${neighbour()}${street()}
      ${building()}${upstairs(st, decor)}${boxes(st)}${shopFront()}
      <g clip-path="${url('Bow')}">${shopInside(st, decor)}</g>${glass(st)}${awning(st)}${sign(st, C)}${door(st, C, decor)}${lantern()}
      ${yard(st)}${frontWall()}${step(st)}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${weather()}${NIGHT ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
