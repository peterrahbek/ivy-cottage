'use strict';
// Marchbank's Curiosities, drawn as SVG the same way as the cottage
// (house.js), the bookshop and the station. An old curiosity shop on a
// cobbled street: a deep green shop front under a long sign, and a bow
// window full of things: the cabinet of twenty little drawers with a brass
// lamp on top, a globe, a grandfather clock and, at the front of the display,
// the locked box. A narrow window of new shelves stands by the green door;
// upstairs are the room with the jigsaw table and a room crammed with
// curiosities; at the side a walled yard has a stone fountain, cobbles and
// ferns in pots. Each restorable part has a tired look and a restored look;
// the sign and the door take the colours chosen while painting. Every id
// carries an 'm' prefix (plus opts.uid when given) so this picture can share
// a page with the others.

const CURIO = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the shop is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false;
  const id = (n) => `m${n}${UID}`;
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
  // a little four-pointed glint
  const glint = (x, y, k = 1, cls = 'mc-glint') => `<path class="${cls}" d="M${f1(x)} ${f1(y - 2.6 * k)} l${f1(0.8 * k)} ${f1(1.8 * k)} l${f1(1.8 * k)} ${f1(0.8 * k)} l${f1(-1.8 * k)} ${f1(0.8 * k)} l${f1(-0.8 * k)} ${f1(1.8 * k)} l${f1(-0.8 * k)} ${f1(-1.8 * k)} l${f1(-1.8 * k)} ${f1(-0.8 * k)} l${f1(1.8 * k)} ${f1(-0.8 * k)}Z" fill="#fff8d0"/>`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  // the old pear tree over the yard wall
  const TREE = {
    spring: ['#b5d595', '#fbf6f0', '#f6dfe6'], summer: ['#5f9a4c', '#6aa858', '#4f8a3c'],
    autumn: ['#d9822b', '#e2a33c', '#c9692f'], winter: null,
  };
  const COBBLE = { spring: ['#c2b8a8', '#b3a998'], summer: ['#c9bea9', '#b9ad98'], autumn: ['#b3a898', '#a39886'], winter: ['#d4d9de', '#c4cbd2'] };

  // ---------------------------------------------------------------- shapes
  const ROOF_D = 'M6 198 L50 150 H240 L284 198Z';
  // the two windows upstairs: the jigsaw room and the room of curiosities
  const UPL = { x0: 40, x1: 116, y0: 210, y1: 264 };
  const UPR = { x0: 174, x1: 250, y0: 210, y1: 264 };
  // the long sign over the shop front
  const SIGNB = { x: 22, y: 291, w: 246, h: 19 };
  // the bow window, the green door and the narrow window of shelves
  const WIN = { x0: 30, x1: 156, y0: 318, y1: 402 };
  const DOOR = { x0: 172, x1: 202, y0: 324, y1: 414 };
  const SIDE = { x0: 216, x1: 258, y0: 318, y1: 402 };
  // the fountain in the yard: the middle of its basin's rim
  const FOUNT = { x: 340, y: 392 };
  // the brass carriage lamps either side of the door
  const LANTS = [164, 209];
  // everything is drawn this much lower than its coordinates, so the street
  // in front stays a narrow strip and the sky fills in above
  const DY = 22;

  // little css of our own: a sleeping cat, the clock's pendulum, water
  // spilling into the fountain, ferns in the breeze, a rocking horse, a candle
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .mc-breathe{animation:mcbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes mcbreathe{50%{transform:scaleY(1.06)}}
      #scene .mc-pend{animation:mcpend 1.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes mcpend{from{transform:rotate(-9deg)}to{transform:rotate(9deg)}}
      #scene .mc-drip{animation:mcdrip 1.4s ease-in-out infinite alternate}
      @keyframes mcdrip{from{opacity:.5}to{opacity:.95}}
      #scene .mc-ripple{animation:mcripple 2.6s ease-out infinite;transform-box:fill-box;transform-origin:center}
      #scene .mc-ripple:nth-of-type(2n){animation-delay:1.3s}
      @keyframes mcripple{0%{transform:scale(.3);opacity:.9}100%{transform:scale(1.3);opacity:0}}
      #scene .mc-glint{animation:mcglint 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes mcglint{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}
      #scene .mc-sway{animation:mcsway 4.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes mcsway{from{transform:rotate(-1.4deg)}to{transform:rotate(1.8deg)}}
      #scene .mc-rock{animation:mcrock 3.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes mcrock{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
      #scene .mc-flame{animation:mcflame .8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes mcflame{to{transform:scaleY(1.18) scaleX(.86)}}
      #scene .mc-hop{animation:mchop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes mchop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .mc-flit{animation:mcflit 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes mcflit{0%{transform:translate(0,0)}35%{transform:translate(6px,-5px)}70%{transform:translate(-4px,-8px)}100%{transform:translate(3px,2px)}}
      #scene .mc-wing{animation:mcwing .32s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes mcwing{to{transform:scaleX(.3)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      front: U.mix('#2f5244', '#7d8079', k * 1.3),
      gold: U.mix('#e2c27a', '#a59e90', k * 1.4),
      stone: U.mix('#e2d6bf', '#b3aa9a', k),
      sash: U.mix('#fbf7ee', '#b8b1a2', k * 1.4),
      brick: U.mix('#a65a46', '#8f857a', k * 1.2),
    };
  }

  function defs() {
    const cb = COBBLE[SEASON], k = (1 - PCT) * 0.35;
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#e2cdb2'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const b = K.brick, ob = U.mix(b, '#8a8476', 0.45);
    const slate = U.mix('#5a616b', '#7d7f80', k);
    // wallpaper: a gold sprig on deep green (the shop), on oxblood (upstairs) and roses on ochre
    const paper = (ground, sprig, op) => `<rect width="10" height="12" fill="${ground}"/><path d="M5 2 l1.3 2.3 l-1.3 2.3 l-1.3 -2.3Z" fill="${sprig}" opacity="${op}"/>
        <circle cx="0" cy="9" r="0.7" fill="${sprig}" opacity="${op}"/><circle cx="10" cy="9" r="0.7" fill="${sprig}" opacity="${op}"/>`;
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
      <linearGradient id="${id('Water')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6dcef"/><stop offset="1" stop-color="#5f9fc4"/></linearGradient>
      <linearGradient id="${id('Ice')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef6fa"/><stop offset="1" stop-color="#b9d3df"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <pattern id="${id('Slate')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="${slate}"/><path d="M0 7.6 H12 M6 0 V7.6" stroke="${U.shade(slate, -0.25)}" stroke-width="0.7"/><rect x="0.6" y="0.6" width="4.4" height="1.2" fill="#fff" opacity="0.1"/>
      </pattern>
      <pattern id="${id('SlateOld')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="${U.mix(slate, '#7d7f78', 0.4)}"/><path d="M0 7.6 H12 M6 0 V7.6" stroke="${U.shade(slate, -0.2)}" stroke-width="0.7"/><circle cx="3" cy="6" r="1.3" fill="#7d8a4a" opacity="0.7"/>
      </pattern>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
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
      <pattern id="${id('Paving')}" width="28" height="12" patternUnits="userSpaceOnUse">
        <rect width="28" height="12" fill="${winter() ? '#dfe5ea' : U.mix('#d6cdbb', '#b8b0a2', k)}"/><path d="M0 0.4 H28 M14 0 V12" stroke="#000" stroke-width="0.7" opacity="0.12"/>
      </pattern>
      <pattern id="${id('Paper')}" width="10" height="12" patternUnits="userSpaceOnUse">${paper('#35574a', '#d4b46a', 0.55)}</pattern>
      <pattern id="${id('PaperOld')}" width="10" height="12" patternUnits="userSpaceOnUse">${paper('#7b8576', '#a9a68e', 0.4)}</pattern>
      <pattern id="${id('Blood')}" width="10" height="12" patternUnits="userSpaceOnUse">${paper('#6e3434', '#d4b46a', 0.5)}</pattern>
      <pattern id="${id('Ochre')}" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#e9cf98"/><circle cx="6" cy="4" r="1.4" fill="#d98b7a" opacity="0.7"/><circle cx="0" cy="10" r="1.2" fill="#8dae74" opacity="0.6"/><circle cx="12" cy="10" r="1.2" fill="#8dae74" opacity="0.6"/>
      </pattern>
      <clipPath id="${id('Win')}"><rect x="${WIN.x0}" y="${WIN.y0}" width="${WIN.x1 - WIN.x0}" height="${WIN.y1 - WIN.y0}"/></clipPath>
      <clipPath id="${id('Side')}"><rect x="${SIDE.x0}" y="${SIDE.y0}" width="${SIDE.x1 - SIDE.x0}" height="${SIDE.y1 - SIDE.y0}"/></clipPath>
      <clipPath id="${id('UpL')}"><rect x="${UPL.x0}" y="${UPL.y0}" width="${UPL.x1 - UPL.x0}" height="${UPL.y1 - UPL.y0}"/></clipPath>
      <clipPath id="${id('UpR')}"><rect x="${UPR.x0}" y="${UPR.y0}" width="${UPR.x1 - UPR.x0}" height="${UPR.y1 - UPR.y0}"/></clipPath>
      <clipPath id="${id('Globe')}"><circle cx="98" cy="352" r="10.5"/></clipPath>
    </defs>`;
  }

  // ------------------------------------------------------- sky and town
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect y="${-DY - 4}" width="400" height="${304 + DY}" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="350" cy="58" r="46" fill="${url('Sun')}"/><circle cx="350" cy="58" r="17" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="64" cy="70" rx="25" ry="10"/><ellipse cx="83" cy="63" rx="17" ry="12"/><ellipse cx="101" cy="71" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="226" cy="100" rx="19" ry="7"/><ellipse cx="241" cy="95" rx="13" ry="9"/><ellipse cx="255" cy="101" rx="14" ry="6"/></g>`;
  }
  // the town beyond the yard wall: a clock tower with a little green dome, roofs and chimneys
  function far() {
    const hz = winter() ? '#dfe6ec' : SEASON === 'autumn' ? '#e6d2bc' : '#d6dfe2';
    const c = (col, t) => U.mix(col, hz, t);
    let s = `${box(319, 198, 18, 100, c('#d9c3ae', 0.32))}<path d="M316 200 Q328 176 340 200Z" fill="${c('#5f8a7a', 0.35)}"/>`;
    s += `${line('M328 178 V168', c('#5a5a5e', 0.3), 1)}${dot(328, 167, 1.6, c('#d9b45a', 0.3))}${dot(328, 214, 5.4, c('#f6efe0', 0.25))}${line('M328 214 V210.6 M328 214 h2.6', c('#5a5a5e', 0.3), 0.8)}`;
    s += box(324, 232, 8, 14, c('#9fb8c4', 0.3), ' rx="4"');
    s += `<path d="M280 252 L306 228 L332 252Z" fill="${c('#9a7f72', 0.35)}"/>${box(282, 252, 48, 46, c('#d9c3ae', 0.3))}${box(290, 260, 9, 11, c('#9fb8c4', 0.2))}${box(312, 260, 9, 11, c('#9fb8c4', 0.2))}${box(300, 214, 6, 16, c('#a8705a', 0.2))}`;
    s += `<path d="M346 246 L376 218 L408 246Z" fill="${c('#7f6a64', 0.3)}"/>${box(348, 246, 60, 52, c('#cdb7a0', 0.3))}${box(382, 204, 6, 16, c('#9a6a52', 0.2))}`;
    if (winter()) s += line('M281 251 L306 229 L331 251 M347 245 L376 219 L407 245', SNOW, 3) + `<path d="M317 199 Q328 177 339 199" stroke="${SNOW}" stroke-width="2.2" fill="none"/>`;
    return s;
  }
  // an old pear tree in the garden behind, over the yard wall
  function tree() {
    let s = line('M372 298 V246 M372 264 l-16 -16 M372 256 l15 -18 M372 248 l-3 -16', '#6b5240', 3.2);
    const T = TREE[SEASON];
    if (!T) return s + line('M356 248 l-7 -7 M387 238 l6 -5 M369 232 l-2 -7', '#6b5240', 1.4) + line('M356 247 l-7 -7 M372 263 l-15 -15 M373 255 l14 -17', SNOW, 1.2);
    const r = U.rng(59);
    for (const [x, y, rr] of [[372, 232, 22], [352, 242, 16], [392, 240, 17], [362, 220, 14], [384, 222, 14]]) s += dot(x, y, rr, T[0]);
    for (let i = 0; i < 28; i++) s += dot(350 + r() * 46, 210 + r() * 42, 1.8 + r() * 2.4, U.pick(r, T));
    if (SEASON === 'summer' || SEASON === 'autumn') {
      for (const [x, y] of [[356, 246], [378, 240], [390, 250], [366, 232]]) s += `${line(`M${x} ${y - 3} l1 -2`, '#6b5240', 0.7)}<path d="M${x} ${y - 3} q-1.6 0 -1.6 2.4 q-1.4 1.4 -1 3 q0.6 2 2.6 2 q2 0 2.6 -2 q0.4 -1.6 -1 -3 q0 -2.4 -1.6 -2.4Z" fill="${SEASON === 'summer' ? '#c9cf5a' : '#e2b84a'}"/>`;
    }
    return s;
  }
  // the house next door, just showing at the left
  function neighbour() {
    const wall = winter() ? '#dccdb6' : '#d9c3a2';
    let s = `<path d="M-6 190 L2 180 H14 V198 H-6Z" fill="#7d6a62"/>${box(-6, 188, 20, 232, wall)}${box(-6, 188, 20, 3, '#000', ' opacity="0.1"')}`;
    s += `${box(-6, 222, 13, 30, '#9fc2d0')}${box(-6, 251, 15, 3, '#e2d6bf')}${box(-6, 330, 13, 34, '#9fc2d0')}${box(-6, 363, 15, 3, '#e2d6bf')}${box(8.6, 188, 3, 232, '#6b6b70')}`;
    if (winter()) s += line('M-6 189 L2 179 H14', SNOW, 3);
    return s;
  }

  // ---------------------------------------------------------------- the yard
  function yardWall() {
    const ok = PCT >= 0.5;
    let s = box(276, 296, 128, 72, url(ok ? 'Brick' : 'BrickOld'));
    // an arched niche in the wall behind the fountain
    s += `<path d="M326 368 V328 A14 14 0 0 1 354 328 V368Z" fill="${U.shade(K.brick, -0.3)}" opacity="0.55"/><path d="M323 368 V328 A17 17 0 0 1 357 328 V368" stroke="${K.stone}" stroke-width="2.6" fill="none"/>${box(336.6, 309, 6.8, 7, K.stone, ' rx="1"')}`;
    for (let x = 274; x < 404; x += 22) s += box(x, 290, 21.4, 7, K.stone, ' rx="1.4"');
    s += box(276, 297, 128, 2.4, '#000', ' opacity="0.1"');
    if (!ok) {
      // ivy and weeds have the wall
      const r = U.rng(61);
      for (let i = 0; i < 9; i++) {
        const x = 282 + r() * 116, len = 14 + r() * 26;
        s += line(`M${f1(x)} 296 q${f1((r() - 0.5) * 8)} ${f1(len * 0.5)} ${f1((r() - 0.5) * 6)} ${f1(len)}`, '#4f6b34', 1);
        for (let k = 0; k < 4; k++) s += oval(x + (r() - 0.5) * 8, 298 + r() * len, 2.4, 1.6, U.pick(r, ['#3f6b34', '#4f7f3c', '#5d8a44']));
      }
    }
    if (winter()) s += `<path d="M274 291 Q296 285 318 290 Q340 285 362 290 Q384 286 404 289 V293 H274Z" fill="${SNOW}"/>`;
    return s;
  }
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard;
    const d = 'M276 366 H404 V420 H276Z';
    let s = `<g data-part="yard"><path d="${d}" fill="${url('Cobble')}"/>${box(276, 366, 128, 3, '#000', ' opacity="0.12"')}`;
    const tuft = (x, y) => line(`M${f1(x)} ${f1(y)} l-2 -4 M${f1(x)} ${f1(y)} l0.6 -5 M${f1(x)} ${f1(y)} l2.4 -3.4`, '#5f8a3a', 1);
    if (!ok) {
      s += `<path d="${d}" fill="${url('Moss')}" opacity="0.6"/>`;
      const r = U.rng(83);
      for (let i = 0; i < 14; i++) s += tuft(280 + r() * 120, 372 + r() * 46);
      s += `<path d="M284 414 l6 -7 l5 3 l-2 5Z M296 416 l4 -5 l6 2 l-1 4Z" fill="#b5694a"/>${oval(372, 414, 12, 2.6, '#8fa0a6', 0.55)}`;
    } else if (p === 'grow') {
      for (const [x, y, rx] of [[288, 392, 8], [392, 410, 9], [306, 416, 6], [384, 384, 6]]) s += oval(x, y, rx, rx * 0.4, '#6f8a3e', 0.55);
      for (const [x, y] of [[298, 404], [378, 418], [390, 392]]) s += tuft(x, y);
    }
    if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${d}" fill="${url('Snow')}" opacity="0.92"/>`;
    else if (p === 'frost') s += `<path d="${d}" fill="${url('Frost')}" opacity="0.55"/>`;
    else if (winter()) s += `<path d="M276 366 H404 V378 Q340 384 276 378Z" fill="${SNOW}" opacity="0.85"/>`;
    return s + '</g>';
  }
  // the stone fountain: a round basin, a column and a bowl that spills into it
  function fountain(st) {
    const p = pend(st, 'fountain'), ok = st.fountain && !p, { x: cx, y: rim } = FOUNT;
    const stone = st.fountain ? '#ddd2bd' : '#b3ab98', dk = U.shade(stone, -0.2), lt = U.shade(stone, 0.12);
    const icy = st.fountain && (winter() || p === 'snow' || p === 'frost');
    let s = `<g data-part="fountain">${shadow(cx, 410, 44, 3.4)}`;
    s += `<path d="M${cx - 38} ${rim} V${rim + 10} Q${cx} ${rim + 21} ${cx + 38} ${rim + 10} V${rim}Z" fill="${dk}"/>`;
    s += line(`M${cx - 38} ${rim + 5} Q${cx} ${rim + 16} ${cx + 38} ${rim + 5}`, U.shade(dk, -0.12), 0.8, 0.6);
    for (const x of [cx - 26, cx - 8, cx + 10, cx + 28]) s += line(`M${x} ${rim + 6 + (Math.abs(x - cx) < 15 ? 4 : 2)} v5`, U.shade(dk, -0.12), 0.7, 0.5);
    s += oval(cx, rim, 38, 8, lt);
    const water = !st.fountain ? '#8a8a62' : icy ? url('Ice') : p === 'grow' ? '#7f9a4c' : url('Water');
    s += oval(cx, rim + 0.8, 33, 5.6, water);
    if (!st.fountain) {
      // dry and green, full of old leaves, the cone fallen into the basin
      for (const [x, y, c] of [[cx - 20, rim + 1, '#9c5a2a'], [cx + 12, rim + 2.4, '#8a6a3a'], [cx - 4, rim - 1, '#a8874a'], [cx + 24, rim, '#9c5a2a']]) s += oval(x, y, 3.2, 1.4, c);
      s += `${oval(cx - 26, rim - 3, 7, 2, '#6f8a3e', 0.7)}${oval(cx + 30, rim + 1, 5, 1.6, '#6f8a3e', 0.7)}<path d="M${cx + 14} ${rim + 2} q2 -5 5 -1 q-1 3 -5 1Z" fill="${stone}"/>`;
      s += line(`M${cx - 30} ${rim + 7} l4 6 l-2 5`, U.shade(dk, -0.3), 0.8);
    } else if (p === 'grow') {
      const r = U.rng(141);
      for (let i = 0; i < 18; i++) s += dot(cx - 28 + r() * 56, rim - 2.6 + r() * 6, 1, '#a6c45a');
    } else if (!icy) {
      s += oval(cx - 12, rim - 1.2, 9, 1.2, '#fff', 0.35);
      // a goldfish under the spill
      s += `<path d="M${cx + 20} ${rim + 2} q3 -2 6 0 q-3 2 -6 0Z M${cx + 26} ${rim + 2} l2 -1.4 v2.8Z" fill="#e9862c"/>`;
    }
    if (p === 'leaves') for (const [x, y, c] of [[cx - 18, rim + 1, '#d9822b'], [cx + 8, rim + 2.6, '#c4462f'], [cx + 22, rim, '#e9b23c'], [cx - 6, rim - 1, '#9c5a2a']]) s += oval(x, y, 3, 1.4, c);
    // the column and the bowl
    s += `<path d="M${cx - 4.4} ${rim} L${cx - 2.6} ${rim - 20} H${cx + 2.6} L${cx + 4.4} ${rim}Z" fill="${stone}"/>${box(cx - 5, rim - 3, 10, 3, dk, ' rx="1"')}`;
    s += `<path d="M${cx - 14} ${rim - 22} Q${cx} ${rim - 12} ${cx + 14} ${rim - 22}Z" fill="${dk}"/>${oval(cx, rim - 22, 14, 3.2, lt)}`;
    s += oval(cx, rim - 21.6, 11.4, 2.2, !st.fountain ? '#8a8a62' : icy ? '#e6f1f6' : '#8fcbe4');
    if (st.fountain) s += `<path d="M${cx - 2.6} ${rim - 23} Q${cx} ${rim - 34} ${cx + 2.6} ${rim - 23}Z" fill="${stone}"/>${line(`M${cx - 1.6} ${rim - 27} h3.2 M${cx - 1.2} ${rim - 30} h2.4`, dk, 0.6)}`;
    else s += `<path d="M${cx + 9} ${rim - 22} l4 1 l-2 3Z" fill="${dk}"/>${oval(cx - 6, rim - 21, 4, 1, '#6f8a3e', 0.8)}`;
    if (ok && !icy) {
      // water spilling from the bowl into the basin, and rings where it lands
      s += `<g class="mc-drip" fill="none" stroke="#eef9fc" stroke-width="1.2" stroke-linecap="round">
        <path d="M${cx - 13} ${rim - 21} Q${cx - 17} ${rim - 14} ${cx - 18} ${rim - 1}"/><path d="M${cx + 13} ${rim - 21} Q${cx + 17} ${rim - 14} ${cx + 18} ${rim - 1}"/>
        <path d="M${cx - 6} ${rim - 19} Q${cx - 8.6} ${rim - 10} ${cx - 9} ${rim + 1}"/><path d="M${cx + 6} ${rim - 19} Q${cx + 8.6} ${rim - 10} ${cx + 9} ${rim + 1}"/>
        <path d="M${cx} ${rim - 34} V${rim - 39}"/></g>`;
      s += `<g fill="none" stroke="#fff" stroke-width="0.6"><ellipse class="mc-ripple" cx="${cx - 18}" cy="${rim + 0.6}" rx="5" ry="1.4"/><ellipse class="mc-ripple" cx="${cx + 18}" cy="${rim + 0.6}" rx="5" ry="1.4"/></g>`;
    }
    if (icy) {
      // frozen still: a skin of ice and icicles under the bowl
      s += line(`M${cx - 20} ${rim} l6 1.6 M${cx + 6} ${rim + 2} l9 -1.4`, '#fff', 0.8, 0.8);
      for (const x of [cx - 11, cx - 6, cx + 4, cx + 10]) s += `<path d="M${x - 1.2} ${rim - 20} L${x} ${rim - 14 - (x % 3)} L${x + 1.2} ${rim - 20}Z" fill="#e6f4fa"/>`;
    }
    if (winter() || p === 'snow') s += `<path d="M${cx - 38} ${rim - 1} Q${cx - 30} ${rim - 9} ${cx} ${rim - 9} Q${cx + 30} ${rim - 9} ${cx + 38} ${rim - 1} Q${cx} ${rim - 5} ${cx - 38} ${rim - 1}Z" fill="${SNOW}"/>${oval(cx, rim - 23.6, 13.4, 2.2, SNOW)}`;
    if (p === 'frost') s += oval(cx, rim + 0.8, 33, 5.6, url('Frost'), 0.6);
    return s + '</g>';
  }
  // a fern frond arching out of its pot: a curved stem with leaflets either side
  function frond(x, y, dx, h, col) {
    const c1x = x + dx * 0.3, c1y = y - h, ex = x + dx, ey = y - h * 0.45;
    let s = `<path d="M${f1(x)} ${f1(y)} Q${f1(c1x)} ${f1(c1y)} ${f1(ex)} ${f1(ey)}" stroke="${col}" stroke-width="0.9" fill="none"/>`;
    for (let t = 0.2; t < 0.97; t += 0.13) {
      const u = 1 - t, px = u * u * x + 2 * u * t * c1x + t * t * ex, py = u * u * y + 2 * u * t * c1y + t * t * ey;
      const tx = 2 * u * (c1x - x) + 2 * t * (ex - c1x), ty = 2 * u * (c1y - y) + 2 * t * (ey - c1y);
      const a = (Math.atan2(ty, tx) * 180) / Math.PI, sz = 3.1 * (1 - t * 0.65);
      for (const side of [-1, 1]) {
        const lx = px + Math.cos(((a + side * 70) * Math.PI) / 180) * sz * 0.8, ly = py + Math.sin(((a + side * 70) * Math.PI) / 180) * sz * 0.8;
        s += `<ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="${f1(sz)}" ry="${f1(sz * 0.36)}" fill="${col}" transform="rotate(${f1(a + side * 70)} ${f1(lx)} ${f1(ly)})"/>`;
      }
    }
    return s;
  }
  // ferns in terracotta pots, two by the wall and a small one at the front
  function ferns(st) {
    const p = pend(st, 'ferns'), ok = st.ferns;
    const green = winter() ? ['#3f6b4a', '#4f7a54'] : SEASON === 'autumn' ? ['#6f8a3a', '#8a9a46'] : ['#4f8a3c', '#6fae52'];
    let s = '<g data-part="ferns">';
    for (const [x, base, k] of [[290, 376, 1], [384, 376, 1], [297, 419, 0.72]]) {
      const pot = ok ? '#c9764a' : '#a8806a', rim = base - 13 * k;
      s += shadow(x, base, 11 * k, 1.6);
      if (ok) {
        const n = k < 1 ? 4 : 6;
        let g = '';
        for (let i = 0; i < n; i++) {
          const off = i - (n - 1) / 2, dx = off * 9 * k + (off < 0 ? -3 : 3) * k, h = (27 - Math.abs(off) * 4.4) * k;
          const tired = p === 'grow' && i % 2 === 0;
          g += frond(x + off * 1.6 * k, rim, dx, h, tired ? '#a8874a' : green[i % 2]);
        }
        s += `<g class="mc-sway">${g}</g>`;
        if (winter() || p === 'snow') s += oval(x - 4 * k, rim - 18 * k, 5 * k, 1.4 * k, SNOW) + oval(x + 6 * k, rim - 16 * k, 4 * k, 1.2 * k, SNOW);
      } else {
        s += line(`M${f1(x - 1)} ${f1(rim)} l-2 -9 M${f1(x + 2)} ${f1(rim)} l3 -7 M${f1(x + 2)} ${f1(rim - 4)} l-2 -3`, '#8a7a5a', 1);
      }
      s += `<path d="M${f1(x - 8 * k)} ${f1(rim)} h${f1(16 * k)} l${f1(-2 * k)} ${f1(13 * k)} h${f1(-12 * k)}Z" fill="${pot}"/>${box(x - 9 * k, rim - 1.6 * k, 18 * k, 3.2 * k, U.shade(pot, 0.1), ' rx="1"')}`;
      s += line(`M${f1(x - 5 * k)} ${f1(rim + 4 * k)} V${f1(rim + 11 * k)}`, '#fff', 0.8, 0.18);
      if (!ok) s += line(`M${f1(x + 3 * k)} ${f1(rim + 1)} l-2 4 l2 3`, '#6b4a3a', 0.7);
      if (winter() || p === 'snow') s += oval(x, rim - 1.2 * k, 9 * k, 1.6 * k, SNOW);
    }
    return s + '</g>';
  }

  // ------------------------------------------------------------ the building
  // two chimneys, the slate roof and a little dormer in the middle
  function roof() {
    let s = '';
    for (const x of [62, 214]) {
      s += `${box(x, 116, 16, 46, url('Brick'))}${box(x - 2.4, 112, 20.8, 5, K.stone, ' rx="1"')}${box(x + 2, 102, 5, 11, '#b5694a')}${box(x + 9, 104, 5, 9, '#a8604a')}`;
      if (winter()) s += box(x - 2.4, 110.4, 20.8, 2.6, SNOW, ' rx="1.3"');
    }
    if (PCT > 0.5) s += '<g class="smoke" fill="#ffffff"><circle cx="219" cy="96" r="4" opacity="0.7"/><circle cx="223" cy="86" r="5.6" opacity="0.5"/><circle cx="220" cy="72" r="7" opacity="0.3"/></g>';
    s += `<path d="${ROOF_D}" fill="${url(PCT > 0.35 ? 'Slate' : 'SlateOld')}"/><path d="M50 150 H240" stroke="#5a5f66" stroke-width="3" stroke-linecap="round"/>`;
    if (winter()) s += `<path d="${ROOF_D}" fill="${url('Snow')}" opacity="0.88"/><path d="M48 149 H242" stroke="${SNOW}" stroke-width="3.4" stroke-linecap="round"/>`;
    s += `${box(131, 170, 28, 28, U.mix('#e2d6bf', '#b3aa9a', (1 - PCT) * 0.35))}<path d="M126 172 L145 154 L164 172Z" fill="${url(PCT > 0.35 ? 'Slate' : 'SlateOld')}"/>${line('M126 172 L145 154 L164 172', K.front, 1.8)}`;
    s += `${box(137, 176, 16, 18, '#2f3a3a')}${line('M145 176 V194 M137 185 H153', K.sash, 1.1)}<rect x="137" y="176" width="16" height="18" fill="none" stroke="${K.sash}" stroke-width="1.6"/>${box(135, 193.6, 20, 2.4, K.stone)}`;
    if (winter()) s += line('M127 171 L145 155 L163 171', SNOW, 2.4);
    s += box(4, 196, 282, 4, U.shade(K.front, -0.15), ' rx="1.4"');
    return s;
  }
  // the brick front upstairs, its stone quoins and the cornice over the shop
  function walls() {
    let s = `${box(14, 199, 262, 90, url(PCT > 0.4 ? 'Brick' : 'BrickOld'))}${box(14, 199, 262, 4, '#000', ' opacity="0.12"')}`;
    for (let y = 202, i = 0; y < 284; y += 11, i++) s += box(14, y, i % 2 ? 10 : 7, 10, K.stone) + box(i % 2 ? 266 : 269, y, i % 2 ? 10 : 7, 10, K.stone);
    // an oval plaque between the windows
    s += `${oval(145, 236, 15, 10, K.front)}<ellipse cx="145" cy="236" rx="12.6" ry="7.8" fill="none" stroke="${K.gold}" stroke-width="0.8"/>${text(145, 234.6, 'EST.', 3.4, K.gold)}${text(145, 240.4, '1871', 5.4, K.gold, ' letter-spacing="0.4"')}`;
    if (PCT < 0.5) s += line('M28 216 l6 -8 l-2 -6 M260 272 l-5 8 l3 6 M150 280 l3 -6', '#7d6a5e', 0.8, 0.8) + oval(254, 228, 8, 14, '#8a7a6a', 0.3);
    s += `${box(8, 285, 274, 6, K.stone, ' rx="1"')}${box(8, 290, 274, 1.6, '#000', ' opacity="0.14"')}`;
    if (winter()) s += box(8, 283.6, 274, 2.4, SNOW, ' rx="1.2"');
    return s;
  }
  // the deep green shop front: pilasters with gilded capitals and console brackets
  function front() {
    let s = `${box(14, 310, 262, 110, K.front)}${box(14, 309.6, 262, 2.4, K.gold, ' opacity="0.85"')}`;
    for (const x of [14, 266]) {
      s += `${box(x, 312, 10, 108, U.shade(K.front, -0.12))}${box(x + 1.6, 312, 1.4, 108, '#fff', ' opacity="0.1"')}${box(x - 1, 312, 12, 4, K.gold, ' rx="1"')}${box(x - 1, 414, 12, 6, U.shade(K.front, -0.25))}`;
    }
    for (const x of [10, 272]) s += `<path d="M${x} 290 h8 v16 q-4 4 -8 0Z" fill="${U.shade(K.front, -0.2)}"/>${dot(x + 4, 301, 1.8, K.gold)}`;
    // a panel under the side window and a stone step at the foot of it all
    s += `${box(14, 418, 262, 2.4, U.shade(K.front, -0.3))}`;
    return s;
  }
  // a little gold key, for the ends of the sign
  const keyIcon = (x, y, col, flip) => `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}"><circle cx="-5" cy="0" r="2.4" fill="none" stroke="${col}" stroke-width="1.1"/><path d="M-2.6 0 H6 M3.6 0 V2.6 M5.6 0 V2.2" stroke="${col}" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`;
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = ok ? C.curioSign : U.mix(C.curioSign, '#a59e90', 0.62), tx = ok ? K.gold : '#d9d2c4';
    const { x, y, w, h } = SIGNB;
    let s = `<g data-part="sign">${box(x, y, w, h, col)}${box(x, y, w, 1.4, '#fff', ' opacity="0.18"')}<rect x="${x + 3}" y="${y + 2.6}" width="${w - 6}" height="${h - 5.2}" rx="1" fill="none" stroke="${tx}" stroke-width="0.7" opacity="0.8"/>`;
    s += `<text x="145" y="${y + 11.4}" text-anchor="middle" font-family="${SERIF}" font-size="10" font-weight="700" letter-spacing="2" fill="${tx}"${ok ? '' : ' opacity="0.6"'}>${ok ? 'CURIOSITIES' : 'CUR OSIT ES'}</text>`;
    s += `<text x="145" y="${y + 16.6}" text-anchor="middle" font-family="${FONT}" font-size="3.8" font-weight="900" letter-spacing="0.8" fill="${tx}"${ok ? '' : ' opacity="0.45"'}>· MARCHBANK &amp; DAUGHTER ·</text>`;
    s += keyIcon(42, y + 9.5, tx, false) + keyIcon(248, y + 9.5, tx, true);
    if (!ok) s += `${oval(x + 30, y + 6, 6, 2.6, '#b5a68a', 0.85)}${oval(x + 196, y + 13, 7, 2.2, '#b5a68a', 0.8)}${oval(x + 120, y + 4, 4, 1.8, '#b5a68a', 0.7)}${line(`M${x + 86} ${y} l-3 8 l2 7`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5"');
    else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.5"');
    else if (p === 'leaves') s += oval(x + 20, y + 1, 3.4, 1.5, '#d9822b') + oval(x + 160, y + 0.6, 3, 1.4, '#c4462f') + oval(x + 222, y + 1, 2.8, 1.3, '#e9b23c');
    if (winter() || p === 'snow') s += box(x - 1, y - 1.6, w + 2, 2.4, SNOW, ' rx="1.2"');
    return s + '</g>';
  }

  // -------------------------------------------------------------- upstairs
  // the room at the back with the jigsaw table, a candle and the box lid
  function jigsawRoom(st, decor) {
    const p = pend(st, 'jigsaw'), done = st.jigsaw && p !== 'grow', dusty = PCT < 0.4;
    let s = box(UPL.x0, UPL.y0, 76, 40, url('Ochre'));
    if (dusty) s += box(UPL.x0, UPL.y0, 76, 40, '#8a7c66', ' opacity="0.38"') + oval(108, 224, 8, 11, '#a3946e', 0.4);
    s += `${box(UPL.x0, 248, 76, 3, dusty ? '#5f5046' : '#6b4430')}${box(UPL.x0, 251, 76, 13, dusty ? '#6f5e52' : '#8a5a3c')}${box(UPL.x0, 251, 76, 1.2, '#000', ' opacity="0.15"')}`;
    if (decor['mc-cuckoo']) s += DECOR['mc-cuckoo']();
    if (decor['mc-gramophone']) s += DECOR['mc-gramophone']();
    const top = st.jigsaw ? '#a8743c' : '#857464', dk = U.shade(top, -0.25);
    s += `<g data-part="jigsaw">${shadow(80, 263, 25, 1.4)}<path d="M61 247 V263 M99 247 V263" stroke="${dk}" stroke-width="2"/>`;
    s += `<path d="M64 240 H96 L101 246 H59Z" fill="${top}"/>${box(59, 246, 42, 3, dk)}`;
    const piece = (x, y, c, a = 0) => `<g transform="rotate(${a} ${f1(x)} ${f1(y)})">${box(x - 1.6, y - 1.2, 3.2, 2.4, c, ' rx="0.4"')}${dot(x + 1.8, y, 0.6, c)}</g>`;
    const PC = ['#9fd0f0', '#7fae52', '#c9474f', '#f2c230', '#f6efe0'];
    if (done) {
      // the finished jigsaw: sky, hills and a little red-roofed house
      s += `<path d="M67.4 240.8 H92.6 L96 245.4 H64Z" fill="#9fd0f0"/><path d="M65.6 243.2 Q72 240.8 78 242.6 T94.4 242.8 L96 245.4 H64Z" fill="#7fae52"/>`;
      s += `${box(80, 242, 4, 2, '#f6efe0')}<path d="M79.4 242.2 L82 240.6 L84.6 242.2Z" fill="#c9474f"/>${line('M72 240.8 L71 245.4 M80 240.8 V245.4 M88 240.8 L89 245.4 M66 243 H94.6', '#fff', 0.35, 0.45)}`;
      // the lid stands against the wall behind, with the same picture
      s += `<path d="M71 239.6 L72.6 227 H87.4 L89 239.6Z" fill="#c9a06a"/>${box(74, 228.6, 12, 8, '#9fd0f0')}<path d="M74 233 Q78 231 82 232.6 T86 232.4 V236.6 H74Z" fill="#7fae52"/>${box(78.4, 232, 2.4, 1.4, '#c9474f')}`;
    } else if (st.jigsaw) {
      // half done again: the left of the picture and pieces waiting
      s += `<path d="M67.4 240.8 H80 V245.4 H64Z" fill="#9fd0f0"/><path d="M65.6 243.2 Q72 240.8 80 242.6 V245.4 H64Z" fill="#7fae52"/>`;
      s += piece(86, 243, PC[0], 20) + piece(91, 242, PC[1], -30) + piece(93, 244.6, PC[2], 10) + piece(84, 245, PC[3], -12);
    } else {
      // pieces everywhere: on the table, on the floor, and the box knocked over
      const r = U.rng(131);
      for (let i = 0; i < 16; i++) s += piece(64 + r() * 33, 241 + r() * 4, U.pick(r, PC), r() * 90);
      for (let i = 0; i < 6; i++) s += piece(48 + r() * 60, 255 + r() * 7, U.pick(r, PC), r() * 90);
      s += `<g transform="rotate(-24 102 258)">${box(96, 254, 13, 7, '#b8956a')}</g>`;
    }
    // a candle in a brass stick, lit after dark
    s += `${oval(63.6, 240.6, 2.6, 0.9, st.jigsaw ? '#d9b45a' : '#8f8a6a')}${box(62.6, 233.4, 2, 7, st.jigsaw ? '#f6efe0' : '#cfc6b6')}${line('M63.6 233.4 v-1.4', '#3d3d42', 0.5)}`;
    return s + '</g>';
  }
  // the little curiosities on the shelves upstairs (and some by the door)
  const THING = {
    vase: (x, y) => `<path d="M${x - 2.6} ${y} q-2.2 -4 0.6 -7.6 q-0.8 -1.4 0 -2.6 h4 q0.8 1.2 0 2.6 q2.8 3.6 0.6 7.6Z" fill="#e8eef4"/>${line(`M${x - 2.4} ${y - 4} h4.8 M${x - 1.6} ${y - 6.4} h3.2`, '#3f6fb5', 0.9)}`,
    cage: (x, y) => `${line(`M${x - 4} ${y} Q${x - 4} ${y - 10} ${x} ${y - 10} Q${x + 4} ${y - 10} ${x + 4} ${y} M${x - 2} ${y} Q${x - 2} ${y - 9.6} ${x} ${y - 10} Q${x + 2} ${y - 9.6} ${x + 2} ${y} M${x} ${y} V${y - 10}`, '#d9a93a', 0.6)}${box(x - 4.6, y - 1.2, 9.2, 1.2, '#c9963a')}${dot(x, y - 11, 0.9, '#d9a93a')}${oval(x + 0.6, y - 4, 1.8, 1.4, '#e2574c')}`,
    bust: (x, y) => `${box(x - 3, y - 2.4, 6, 2.4, '#d8d2c4')}<path d="M${x - 4.4} ${y - 2.4} q0 -4 4.4 -4 q4.4 0 4.4 4Z" fill="#efeae0"/>${oval(x, y - 9, 2.8, 3.4, '#f4f0e8')}${oval(x - 0.4, y - 11.4, 2.8, 1.4, '#e2dccf')}`,
    glass: (x, y) => `${box(x - 3, y - 1, 6, 1, '#8a5a3c')}${box(x - 3, y - 11, 6, 1, '#8a5a3c')}<path d="M${x - 2.4} ${y - 10} L${x} ${y - 5.6} L${x + 2.4} ${y - 10}Z M${x - 2.4} ${y - 1} L${x} ${y - 5.4} L${x + 2.4} ${y - 1}Z" fill="#e6f1f4" opacity="0.9"/><path d="M${x - 1.6} ${y - 1} L${x} ${y - 3.2} L${x + 1.6} ${y - 1}Z" fill="#e2c27a"/>`,
    teapot: (x, y) => `${oval(x, y - 3.4, 4, 3.4, '#5f86b8')}${line(`M${x + 3.6} ${y - 4} q2.4 -1 2.6 -3.6`, '#5f86b8', 1.1)}${line(`M${x - 3.6} ${y - 5} q-2.2 0 -2.2 2 q0 2 2.2 1.6`, '#5f86b8', 0.9)}${dot(x, y - 7.2, 0.9, '#f6efe0')}`,
    books: (x, y) => `${box(x - 4, y - 8, 2.4, 8, '#c9474f')}${box(x - 1.4, y - 9, 2.4, 9, '#3d5a86')}${box(x + 1.2, y - 7.4, 2.4, 7.4, '#4e7b5b')}${box(x - 4, y - 6, 2.4, 0.7, '#e2c27a')}${box(x - 1.4, y - 7, 2.4, 0.7, '#e2c27a')}`,
    shell: (x, y) => `<path d="M${x - 4} ${y} q0 -6 4 -7 q4 1 4 7Z" fill="#f2b8a8"/>${line(`M${x} ${y} V${y - 6.6} M${x - 2} ${y} l0.6 -5 M${x + 2} ${y} l-0.6 -5`, '#d9877a', 0.5)}`,
    jar: (x, y, c = '#a6d3d4') => `${box(x - 2.2, y - 6, 4.4, 6, c, ' rx="1"')}${box(x - 2.4, y - 7, 4.8, 1.4, '#c99a5a')}${box(x - 1.4, y - 4, 2.8, 1.6, '#fffaf0', ' opacity="0.8"')}`,
    drum: (x, y) => `${box(x - 4, y - 6, 8, 6, '#c9474f')}${oval(x, y - 6, 4, 1.2, '#f6efe0')}${line(`M${x - 4} ${y - 5} l2 4 l2 -4 l2 4 l2 -4`, '#e2c27a', 0.6)}`,
    lantern: (x, y) => `${box(x - 2.6, y - 7, 5.2, 7, '#e9dfc4')}<rect x="${x - 2.6}" y="${y - 7}" width="5.2" height="7" fill="none" stroke="#3d3d42" stroke-width="0.6"/><path d="M${x - 3.4} ${y - 7} L${x} ${y - 9.6} L${x + 3.4} ${y - 7}Z" fill="#3d3d42"/>${dot(x, y - 10.4, 0.8, '#3d3d42')}`,
    mask: (x, y) => `${oval(x, y - 4.6, 3.6, 4.4, '#e2c27a')}${oval(x - 1.4, y - 5.6, 0.9, 0.6, '#5a3a24')}${oval(x + 1.4, y - 5.6, 0.9, 0.6, '#5a3a24')}${line(`M${x - 1.4} ${y - 2.6} q1.4 1 2.8 0`, '#5a3a24', 0.5)}`,
    candle: (x, y) => `${oval(x, y - 0.6, 2.4, 0.8, '#d9a93a')}${box(x - 0.6, y - 5, 1.2, 4.6, '#d9a93a')}${box(x - 0.9, y - 10, 1.8, 5, '#f6efe0')}`,
    jug: (x, y) => `<path d="M${x - 3} ${y} q-0.6 -6 1 -8 h4 q1.6 2 1 8Z" fill="#5f86b8"/>${line(`M${x + 2.4} ${y - 6.4} q2.4 0.6 1 3.6`, '#5f86b8', 0.9)}${box(x - 2.6, y - 4.4, 5.2, 0.8, '#f6efe0')}`,
    cup: (x, y) => `<path d="M${x - 2} ${y - 3.6} h4 l-0.6 3.6 h-2.8Z" fill="#f6efe0"/>${oval(x, y, 2.8, 0.7, '#e8e2d4')}${line(`M${x + 2} ${y - 2.8} q1.2 0.4 0.4 1.6`, '#d8d2c4', 0.6)}`,
    bell: (x, y) => `<path d="M${x - 3.4} ${y} q0 -6 3.4 -6.6 q3.4 0.6 3.4 6.6Z" fill="#e0b54a"/>${box(x - 3.8, y - 0.8, 7.6, 1, '#c9963a')}${dot(x, y - 7.4, 0.9, '#c9963a')}`,
    camera: (x, y) => `${box(x - 4, y - 5.4, 8, 5.4, '#3d3d42', ' rx="0.8"')}${dot(x, y - 2.8, 1.8, '#8fa0a6')}${dot(x, y - 2.8, 1, '#2a2a30')}${box(x - 3, y - 6.4, 2.4, 1, '#3d3d42')}`,
    top: (x, y) => `<path d="M${x} ${y} L${x - 3.4} ${y - 4} Q${x} ${y - 7} ${x + 3.4} ${y - 4}Z" fill="#e2574c"/>${line(`M${x - 3} ${y - 4.4} H${x + 3}`, '#f2c230', 0.8)}${line(`M${x} ${y - 6} V${y - 8}`, '#6b4a32', 0.8)}`,
    musicbox: (x, y) => `${box(x - 4, y - 4.4, 8, 4.4, '#8a5230')}<path d="M${x - 4} ${y - 4.4} L${x - 3} ${y - 7} H${x + 5} L${x + 4} ${y - 4.4}Z" fill="#6b3a26"/>${dot(x + 4.6, y - 2.4, 0.7, '#e0b54a')}${line(`M${x - 2.6} ${y - 2.2} h4`, '#e0b54a', 0.5)}`,
  };
  // the room crammed with curiosities (where things get lost)
  function seekRoom(st) {
    const p = pend(st, 'seek'), ok = st.seek && !p, some = st.seek && !!p;
    let s = box(UPR.x0, UPR.y0, 76, 54, url(PCT < 0.4 ? 'PaperOld' : 'Blood'));
    const wood = st.seek ? '#7a4a2e' : '#6b5a48';
    s += `<g data-part="seek">${box(177, 212, 70, 52, U.shade(wood, -0.35))}`;
    const rows = [229, 246, 263];
    // what stands where, row by row: [thing, x]
    const SET = [
      [['vase', 183], ['cage', 196], ['bust', 222], ['glass', 238]],
      [['teapot', 185], ['books', 199], ['shell', 223], ['jar', 233], ['jar', 240]],
      [['drum', 186], ['lantern', 199], ['mask', 223], ['candle', 239]],
    ];
    if (st.seek) {
      SET.forEach((row, i) => row.forEach(([k, x], j) => {
        const askew = some && (i * 4 + j) % 5 === 1;
        const draw = THING[k](x, rows[i], k === 'jar' ? (j % 2 ? '#efb4ae' : '#a6d3d4') : undefined);
        s += askew ? `<g transform="rotate(${j % 2 ? 60 : -70} ${x} ${rows[i]})">${draw}</g>` : draw;
      }));
      if (ok) s += `${line('M244 214 l-6 10', '#6b4a32', 1.4)}<circle cx="246" cy="212" r="3.2" fill="#e6f1f4" stroke="#d9a93a" stroke-width="1"/>`;
    } else {
      // a jumble: things fallen over, piled up and left to the cobwebs
      const r = U.rng(171);
      SET.forEach((row, i) => row.forEach(([k, x], j) => {
        if ((i + j) % 3 === 2) return;
        const a = r() < 0.5 ? (r() < 0.5 ? -80 : 70) : 0;
        s += `<g transform="rotate(${a} ${x} ${rows[i]})" opacity="0.85">${THING[k](x + (r() - 0.5) * 4, rows[i])}</g>`;
      }));
      s += THING.vase(204, 263) + `<g transform="rotate(90 216 262)">${THING.books(216, 262)}</g>`;
    }
    rows.forEach((y, i) => {
      const sag = !st.seek && i === 1;
      s += sag ? `<path d="M177 ${y} L247 ${y + 4} V${y + 6.4} L177 ${y + 2.4}Z" fill="${wood}"/>` : box(177, y, 70, 2.4, wood);
    });
    for (const x of [176, 210.8, 245.6]) s += box(x, 212, 2.4, 52, U.shade(wood, 0.06));
    if (!st.seek) s += box(177, 212, 70, 52, url('Dusty'), ' opacity="0.42"') + line('M178 214 q6 4 12 0 M178 214 l7 9 M246 214 l-8 6 M246 214 l-3 9', '#e8e4da', 0.5, 0.85);
    else if (some) s += box(177, 212, 70, 52, url('Dusty'), ' opacity="0.28"');
    return s + '</g>';
  }
  function sash(w) {
    const mx = (w.x0 + w.x1) / 2, my = (w.y0 + w.y1) / 2, t = (w.x1 - w.x0) / 3;
    let s = `${box(w.x0 - 5, w.y0 - 8, w.x1 - w.x0 + 10, 7, K.stone)}${box(mx - 4, w.y0 - 9, 8, 9, U.shade(K.stone, 0.06))}`;
    s += `<path d="M${w.x0 + 6} ${w.y1 - 4} L${w.x0 + 30} ${w.y0 + 6} M${w.x0 + 40} ${w.y1 - 4} L${w.x0 + 56} ${w.y0 + 22}" stroke="#fff" stroke-width="5" opacity="0.08"/>`;
    s += `<rect x="${w.x0}" y="${w.y0}" width="${w.x1 - w.x0}" height="${w.y1 - w.y0}" fill="none" stroke="${K.sash}" stroke-width="3"/>`;
    s += `<path d="M${w.x0} ${my} H${w.x1}" stroke="${K.sash}" stroke-width="2.6"/><path d="M${f1(w.x0 + t)} ${w.y0} V${w.y1} M${f1(w.x0 + 2 * t)} ${w.y0} V${w.y1}" stroke="${K.sash}" stroke-width="1"/>`;
    s += box(w.x0 - 5, w.y1, w.x1 - w.x0 + 10, 4, K.stone, ' rx="1"');
    if (winter()) s += box(w.x0 - 5, w.y1 - 1.6, w.x1 - w.x0 + 10, 2.2, SNOW, ' rx="1.1"');
    return s;
  }
  function upstairs(st, decor) {
    let s = `<g clip-path="${url('UpL')}">${jigsawRoom(st, decor)}</g><g clip-path="${url('UpR')}">${seekRoom(st)}</g>`;
    // dusty glass until the room behind it is put right
    if (!st.jigsaw) s += box(UPL.x0, UPL.y0, 76, 54, url('Grime'), ' opacity="0.4" pointer-events="none"');
    if (!st.seek) s += box(UPR.x0, UPR.y0, 76, 54, url('Grime'), ' opacity="0.4" pointer-events="none"');
    return s + sash(UPL) + sash(UPR);
  }

  // ---------------------------------------------------------- the shop window
  // the cabinet of twenty little drawers, five rows of four
  function cabinet(st) {
    const p = pend(st, 'cabinet');
    const wood = st.cabinet ? '#6e3826' : '#6e6052', dk = U.shade(wood, -0.3), lt = U.shade(wood, 0.14);
    const x0 = 36, x1 = 78, y0 = 339, y1 = 380, cw = (x1 - x0 - 4) / 4, ch = (y1 - y0 - 6) / 5;
    let s = `<g data-part="cabinet">${shadow(57, 380.6, 24, 1.6)}${box(x0, y0, x1 - x0, y1 - y0, wood)}${box(x0 - 2, y0 - 3, x1 - x0 + 4, 3.6, dk, ' rx="0.8"')}${box(x0 - 2, y0 - 3, x1 - x0 + 4, 1, '#fff', ' opacity="0.18"')}`;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        const dx = x0 + 2 + j * cw, dy = y0 + 2 + i * ch;
        const open = !st.cabinet && ((i === 1 && j === 2) || (i === 3 && j === 0));
        if (open) s += box(dx + 0.4, dy + 0.4, cw - 0.8, ch - 0.8, '#2a1c14') + box(dx - 1.2, dy + 1.8, cw + 2.4, ch - 0.6, lt) + box(dx - 1.2, dy + 1.8, cw + 2.4, 1, '#000', ' opacity="0.2"') + dot(dx + cw / 2, dy + ch / 2 + 2, 0.8, '#8a8060');
        else s += box(dx + 0.5, dy + 0.5, cw - 1, ch - 1, lt, ' rx="0.4"') + box(dx + cw / 2 - 2.2, dy + 1.4, 4.4, 2, st.cabinet ? '#f6efe0' : '#c9c1b0', ' rx="0.3"') + dot(dx + cw / 2, dy + ch - 2.2, 0.8, st.cabinet ? '#e0b54a' : '#8a8060');
      }
    }
    s += box(x0 - 1, y1 - 2.4, x1 - x0 + 2, 2.4, dk);
    if (!st.cabinet) s += box(x0 - 2, y0 - 3, x1 - x0 + 4, y1 - y0 + 3, url('Dusty'), ' opacity="0.5"') + line(`M${x0} ${y0} l7 7 M${x0} ${y0 + 6} l7 -6 M${x1} ${y0} l-6 5`, '#e8e4da', 0.5, 0.85);
    else if (p) s += box(x0 - 2, y0 - 3, x1 - x0 + 4, y1 - y0 + 3, url('Dusty'), ' opacity="0.32"');
    else s += glint(71, 346, 0.9);
    return s + '</g>';
  }
  // the brass oil lamp on top of the cabinet, with a round glass shade
  function lamp(st) {
    const p = pend(st, 'lamp'), ok = st.lamp && !p;
    const brass = st.lamp ? '#e0b54a' : '#8f8a6a', dk = U.shade(brass, -0.3), x = 47, b = 336;
    let s = `<g data-part="lamp"><path d="M${x - 5} ${b} h10 l-2 -2.6 h-6Z" fill="${brass}"/>${box(x - 1, b - 7.6, 2, 5.4, dk)}`;
    s += `${oval(x, b - 9.4, 4, 2.6, st.lamp ? '#e9c27a' : '#a8a08a')}${box(x - 3.4, b - 12.2, 6.8, 1.6, brass, ' rx="0.6"')}${dot(x, b - 15, 3.4, st.lamp ? '#fff3dc' : '#c9c1b0')}`;
    if (ok) s += `${dot(x - 1.2, b - 16.2, 1.1, '#fff', 0.8)}${oval(x, b - 15, 7, 6, '#ffe9b0', 0.3)}${glint(x + 4, b - 8, 0.8)}`;
    else if (!st.lamp) s += `${dot(x + 1, b - 14.2, 2.4, '#6b6455', 0.45)}${line(`M${x - 2} ${b - 17.4} l2 3 l-1 2`, '#8a8478', 0.5)}`;
    if (p) s += `${dot(x, b - 15, 3.4, FADE, 0.55)}${oval(x, b - 9.4, 4, 2.6, FADE, 0.5)}`;
    return s + '</g>';
  }
  // the globe on its wooden stand, crooked and grey until it is dusted
  function globe(st) {
    const p = pend(st, 'globe'), cx = 98, cy = 352, r = 10.5;
    const wood = st.globe ? '#7a4a2e' : '#6e6052', brass = st.globe ? '#d9a93a' : '#8f8a6a';
    let s = `<g data-part="globe">${shadow(cx, 383.4, 11, 1.4)}${line(`M${cx} ${cy + r + 2} V376 M${cx} 376 L${cx - 7} 383 M${cx} 376 L${cx + 7} 383 M${cx} 376 V383`, wood, 1.8)}${oval(cx, 376, 3, 1.2, wood)}`;
    s += `<g transform="rotate(${st.globe ? 0 : 18} ${cx} ${cy})">${dot(cx, cy, r, st.globe ? '#5f9fd0' : '#8b9aa0')}<g clip-path="${url('Globe')}">`;
    const land = st.globe ? ['#7fae52', '#d9b45a', '#a9c46a'] : ['#8f9a7a', '#a39a7a', '#98a080'];
    s += `<path d="M89 344 q5 -3 8 -1 q1 4 -2 6 q-3 3 -7 1Z" fill="${land[0]}"/><path d="M${cx + 2} ${cy - 9} q6 1 8 6 q-2 3 -5 2 q-3 -3 -3 -8Z" fill="${land[2]}"/>`;
    s += `<path d="M${cx - 2} ${cy + 3} q3 -1 5 2 q0 4 -3 7 q-3 -2 -2 -9Z" fill="${land[1]}"/><path d="M${cx + 6} ${cy + 4} q3 0 3 3 q-2 1 -3 -3Z" fill="${land[0]}"/>`;
    s += `<circle cx="${cx + 4.6}" cy="${cy + 2.6}" r="${r}" fill="#000" opacity="0.16"/></g>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r + 1.8}" fill="none" stroke="${brass}" stroke-width="1.3"/>${line(`M${cx} ${cy - r - 3.4} V${cy - r - 1}`, brass, 1.2)}`;
    if (st.globe && !p) s += `${dot(cx - 4, cy - 4.4, 2.2, '#fff', 0.5)}${glint(cx + 9, cy - 9, 0.8)}`;
    s += '</g>';
    s += `<path d="M${cx - r - 3.6} ${cy + 2} Q${cx} ${cy + 9.4} ${cx + r + 3.6} ${cy + 2}" stroke="${brass}" stroke-width="1.4" fill="none"/>`;
    if (!st.globe) s += `${dot(cx, cy, r + 2, url('Dusty'), 0.55)}${line(`M${cx + r + 2} ${cy - 2} l6 14 M${cx + r + 2} ${cy + 4} l5 2`, '#e8e4da', 0.5, 0.85)}`;
    else if (p) s += dot(cx, cy, r + 2, url('Dusty'), 0.42);
    return s + '</g>';
  }
  // the grandfather clock: an arched hood, the dial and the pendulum behind glass
  function clock(st) {
    const p = pend(st, 'clock'), ok = st.clock && !p, cx = 144;
    const wood = st.clock ? '#7a4528' : '#76665a', dk = U.shade(wood, -0.28), lt = U.shade(wood, 0.12), brass = st.clock ? '#e0b54a' : '#8f8a6a';
    let s = `<g data-part="clock">${shadow(cx, 380.6, 11, 1.4)}<path d="M135 342 V328 Q${cx} 318 153 328 V342Z" fill="${wood}"/>`;
    s += `${dot(135.8, 327.6, 1.1, brass)}${dot(152.2, 327.6, 1.1, brass)}${dot(cx, 322, 1.3, brass)}${dot(cx, 333, 6.2, brass)}${dot(cx, 333, 5.2, st.clock ? '#f6efe0' : '#c9c1b0')}`;
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ticks += `M${f1(cx + Math.sin(a) * 4.2)} ${f1(333 - Math.cos(a) * 4.2)} L${f1(cx + Math.sin(a) * 4.9)} ${f1(333 - Math.cos(a) * 4.9)} `; }
    s += `<path d="${ticks}" stroke="#3b352e" stroke-width="0.5" opacity="${st.clock ? 0.9 : 0.5}"/>`;
    // ten past ten once it goes again; stopped at twenty past four before
    s += st.clock ? line(`M${cx} 333 L${f1(cx - 2.9)} ${f1(331.4)} M${cx} 333 L${f1(cx + 3.4)} ${f1(330.6)}`, '#3b352e', 0.8) : line(`M${cx} 333 L${f1(cx + 2.4)} ${f1(334.4)} M${cx} 333 L${f1(cx + 1.6)} ${f1(336.8)}`, '#3b352e', 0.8);
    s += `${box(137, 342, 14, 28, lt)}${box(137, 342, 14, 1.2, dk)}${box(140, 345, 8, 21, st.clock ? '#3a2416' : '#4a4038', ' rx="3.4"')}`;
    s += `<g${ok ? ' class="mc-pend"' : ` transform="rotate(${st.clock ? 0 : 6} ${cx} 346)"`}>${line(`M${cx} 346 V361`, brass, 0.8)}${dot(cx, 362, 2.6, brass)}</g>`;
    s += `${box(135.5, 370, 17, 10, wood)}${box(134.5, 378, 19, 2.4, dk)}${box(138, 372.4, 12, 5, dk, ' opacity="0.4"')}`;
    if (ok) s += glint(cx - 3.6, 330, 0.7);
    if (!st.clock) {
      // the glass door hangs open and the dial is cracked and grey with dust
      s += `<path d="M148 345 L153.4 346.6 V364.6 L148 366Z" fill="${U.shade(lt, 0.1)}" opacity="0.9"/>${line(`M${cx - 4} 330 l3 2 l2 -1 l3 3`, '#8a8478', 0.5)}`;
      s += `<path d="M135 342 V328 Q${cx} 318 153 328 V380 H135Z" fill="${url('Dusty')}" opacity="0.4"/>`;
    } else if (p) s += `<path d="M135 342 V328 Q${cx} 318 153 328 V380 H135Z" fill="${url('Dusty')}" opacity="0.32"/>`;
    return s + '</g>';
  }
  // the creaky floorboards behind the display, with a rug once they are swept
  function floorIn(st) {
    const p = pend(st, 'floor');
    let s = `<g data-part="floor">${box(30, 380, 126, 16, st.floor ? '#b07d4a' : '#8f8272')}`;
    for (let i = -8; i <= 8; i++) s += line(`M${f1(93 + i * 8)} 380 L${f1(93 + i * 13)} 396`, st.floor ? '#8a5a30' : '#766a5e', 0.7, 0.8);
    s += line('M30 386 H156 M30 391.4 H156', st.floor ? '#9a6a3c' : '#7d7266', 0.4, 0.5);
    if (st.floor) {
      s += `<path d="M62 383 H124 L130 393.6 H56Z" fill="#8e2f3a"/><path d="M64.6 384.6 H121.4 L126 392 H60Z" fill="none" stroke="#e2c27a" stroke-width="0.8"/>`;
      for (let x = 70; x < 118; x += 8) s += `<path d="M${x} 388.4 l2.6 -2 l2.6 2 l-2.6 2Z" fill="#e2c27a" opacity="0.75"/>`;
      if (!p) s += line('M36 382 L43 395 M146 382 L151 395', '#fff', 1.4, 0.2);
    } else {
      s += box(30, 380, 126, 16, url('Dusty'), ' opacity="0.55"');
      s += `${box(110, 384, 18, 2.4, '#3a2c22')}<g transform="rotate(-12 50 389)">${box(45, 386, 9, 6, '#f2ede2')}</g><g transform="rotate(16 140 390)">${box(135, 387, 8, 5, '#e8e2d4')}</g>${oval(74, 390, 5, 2, '#c9c3b6')}`;
    }
    if (p === 'grow') s += `${box(30, 380, 126, 16, url('Dusty'), ' opacity="0.3"')}${oval(80, 392, 2.4, 1.1, '#7a6a58', 0.45)}${oval(86, 388, 2.4, 1.1, '#7a6a58', 0.45)}`;
    else if (p === 'leaves') s += oval(146, 392, 3, 1.4, '#d9822b') + oval(138, 394, 2.6, 1.3, '#c4462f') + oval(150, 386, 2.8, 1.3, '#e9b23c');
    else if (p === 'snow' || p === 'frost') for (const [x, y] of [[150, 393], [142, 389], [132, 393], [122, 389]]) s += oval(x, y, 2.6, 1.3, '#5a4a3a', 0.45);
    return s + '</g>';
  }
  // the locked box at the front of the display: three little dials on its
  // front; once opened its lid stands back and something glints inside
  function lockedBox(st) {
    const p = pend(st, 'box'), open = st.box && p !== 'grow';
    const x0 = 82, x1 = 108, yb = 396, h = 11, cx = (x0 + x1) / 2;
    const wood = st.box ? '#8a5230' : '#7a6a5a', dk = U.shade(wood, -0.3), brass = st.box ? '#e0b54a' : '#9a9070';
    let s = `<g data-part="box">${shadow(cx, yb, 16, 1.4)}`;
    if (open) {
      s += `<path d="M${x0} ${yb - h} L${x0 + 3} ${yb - h - 10} H${x1 + 3} L${x1} ${yb - h}Z" fill="${dk}"/><path d="M${x0 + 1.6} ${yb - h} L${x0 + 4} ${yb - h - 8} H${x1 + 1.4} L${x1 - 1.4} ${yb - h}Z" fill="#a8343c"/>`;
      s += box(x0 + 1, yb - h - 1.6, x1 - x0 - 2, 2.6, '#4a1a1e');
    }
    s += `${box(x0, yb - h, x1 - x0, h, wood, ' rx="0.8"')}${box(x0, yb - h, x1 - x0, 1.2, '#fff', ' opacity="0.15"')}`;
    for (const x of [x0, x1 - 3]) s += box(x, yb - h, 3, 3, brass) + box(x, yb - 3, 3, 3, brass);
    for (let i = 0; i < 3; i++) {
      const dx = cx - 6 + i * 6;
      s += `${dot(dx, yb - 5.2, 2, brass)}${dot(dx, yb - 5.2, 1.3, U.shade(brass, -0.2))}${line(`M${dx} ${yb - 5.2} V${yb - 6.8}`, '#3b2a1a', 0.5)}`;
    }
    if (open) {
      // a golden key on the velvet, and its glint
      s += `<circle cx="${cx - 4}" cy="${yb - h - 0.4}" r="1.6" fill="none" stroke="#f2c84a" stroke-width="0.9"/>${line(`M${cx - 2.4} ${yb - h - 0.4} H${cx + 5} M${cx + 3.6} ${yb - h - 0.4} v1.4`, '#f2c84a', 0.9)}${glint(cx + 6, yb - h - 4, 1)}`;
    } else {
      s += `<path d="M${x0 - 0.6} ${yb - h} Q${cx} ${yb - h - 5} ${x1 + 0.6} ${yb - h}Z" fill="${dk}"/>${line(`M${x0 + 1} ${yb - h - 1} Q${cx} ${yb - h - 5} ${x1 - 1} ${yb - h - 1}`, brass, 0.6)}`;
      s += `${dot(cx, yb - h - 1.4, 1.2, brass)}${box(cx - 0.3, yb - h - 1.4, 0.6, 1.4, '#3b2a1a')}`;
      if (!st.box) s += `${box(x0 - 1, yb - h - 4, x1 - x0 + 2, h + 4, url('Dusty'), ' opacity="0.45"')}${line(`M${x1} ${yb - h - 2} l5 -8`, '#e8e4da', 0.5, 0.8)}`;
    }
    return s + '</g>';
  }
  // the shop seen through the bow window, back to front
  function shopInside(st, decor) {
    let s = `${box(30, 318, 126, 62, url(PCT < 0.4 ? 'PaperOld' : 'Paper'))}${line('M30 325 H156', st.window ? '#c9a964' : '#8a8670', 0.8, 0.7)}${box(30, 377.6, 126, 2.6, st.floor ? '#5a3424' : '#5a5046')}`;
    if (PCT < 0.4) s += oval(120, 344, 10, 14, '#8a8670', 0.35);
    s += floorIn(st);
    if (decor['mc-map']) s += DECOR['mc-map']();
    s += cabinet(st) + lamp(st);
    if (decor['mc-cat']) s += DECOR['mc-cat']();
    if (decor['mc-chandelier']) s += DECOR['mc-chandelier']();
    s += globe(st) + clock(st);
    // the display board along the front of the window
    s += `<g data-part="window">${box(30, 396, 126, 6, st.window ? '#7a4a2e' : '#6e6052')}${box(30, 396, 126, 1.2, '#fff', ' opacity="0.18"')}</g>`;
    s += lockedBox(st);
    for (const k of ['mc-fern', 'mc-ship', 'mc-globelamp']) if (decor[k]) s += DECOR[k]();
    s += box(30, 318, 126, 30, url('Shade'), ' pointer-events="none"');
    if (decor['mc-lights']) s += lightsInside();
    return s;
  }
  // fairy lights across the top of the bow window
  const BULBS = (() => { const out = []; for (let x = 34; x <= 152; x += 7.4) out.push([x, 323 + Math.sin(((x - 34) / 29.5) * Math.PI) * 2.8]); return out; })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  function lightsInside() {
    return `<g pointer-events="none">${line(`M30 322 ${BULBS.map(([x, y]) => `L${f1(x)} ${f1(y - 1.6)}`).join(' ')} L156 322`, '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`;
  }
  // the bow window's glass, its curved bars, its little lead roof and its riser
  function bowGlass(st) {
    const p = pend(st, 'window'), ok = st.window, { x0, x1, y0, y1 } = WIN, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
    let s = '<g pointer-events="none">';
    if (!ok) {
      s += box(x0, y0, w, h, url('Grime'), ' opacity="0.58"');
      s += `<path d="M38 396 q20 -26 44 -6 M92 392 q24 -30 52 -8" stroke="#dfe3d4" stroke-width="7" fill="none" opacity="0.22" stroke-linecap="round"/>`;
      s += line('M128 322 l-8 14 l6 6 l-10 16', '#eef0e8', 0.8, 0.9) + line('M32 320 q10 6 20 0 M32 320 l14 16 M32 330 l16 -8', '#eef0e8', 0.5, 0.85);
      for (const [x, y] of [[60, 350], [112, 366], [148, 344], [44, 372], [90, 330]]) s += dot(x, y, 1.6, '#6b6a5a', 0.5);
    } else if (p === 'frost') {
      s += box(x0, y0, w, h, url('Frost'), ' opacity="0.84"') + line('M34 400 q8 -14 4 -26 M38 392 l6 -4 M152 400 q-10 -12 -6 -26 M148 388 l-6 -3 M84 402 q4 -10 14 -12', '#fff', 1.3);
    } else if (p === 'grow') s += box(x0, y0, w, h, url('Dusty'), ' opacity="0.42"');
    else s += `<path d="M38 402 L72 318 H86 L52 402Z M116 402 L142 318 H149 L123 402Z" fill="#fff" opacity="0.12"/>`;
    if (p === 'leaves') s += oval(36, 399, 3.4, 1.6, '#d9822b') + oval(44, 401, 3, 1.4, '#c4462f') + oval(150, 399.4, 3.2, 1.5, '#e9b23c');
    s += '</g>';
    const fr = ok ? K.front : U.mix(K.front, '#8a877c', 0.4);
    s += `<g data-part="window"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${fr}" stroke-width="3.4"/>`;
    let bars = `M${x0} ${y0 + 15} H${x1} `;
    for (let k = 1; k < 6; k++) { const x = cx - (w / 2) * Math.cos((Math.PI * k) / 6); bars += `M${f1(x)} ${y0} V${y1} `; }
    s += `<path d="${bars}" stroke="${fr}" stroke-width="1.5"/>`;
    if (!ok) s += line(`M${f1(cx - (w / 2) * Math.cos(Math.PI / 3))} 352 l-3 9`, fr, 1);
    // the lead roof over the bow and the green fascia under it
    s += `<path d="M${x0 - 7} ${y0 + 1} Q${cx} ${y0 - 11} ${x1 + 7} ${y0 + 1}Z" fill="#6f777c"/>${line(`M${x0 - 7} ${y0 + 1} Q${cx} ${y0 - 11} ${x1 + 7} ${y0 + 1}`, '#8d969a', 0.9)}`;
    for (const t of [0.2, 0.4, 0.6, 0.8]) { const bx = x0 - 7 + (w + 14) * t, by = y0 + 1 - 24 * t * (1 - t); s += line(`M${f1(bx)} ${f1(by)} L${f1(cx + (bx - cx) * 1.04)} ${y0 + 1}`, '#5d656a', 0.6, 0.7); }
    s += `${box(x0 - 7, y0 - 1, w + 14, 3.4, fr)}${box(x0 - 7, y0 + 1.4, w + 14, 0.8, K.gold, ' opacity="0.7"')}`;
    // the stone sill and the curved stall riser under it
    s += `<path d="M${x0 - 4} ${y1 + 2} H${x1 + 4} V${y1 + 9} Q${cx} ${y1 + 17} ${x0 - 4} ${y1 + 9}Z" fill="${U.shade(fr, 0.06)}"/>`;
    s += `<path d="M${x0 + 2} ${y1 + 4.6} H${x1 - 2} V${y1 + 8} Q${cx} ${y1 + 14} ${x0 + 2} ${y1 + 8}Z" fill="none" stroke="${K.gold}" stroke-width="0.7" opacity="0.6"/>${box(x0 - 5, y1 - 0.6, w + 10, 3, K.stone, ' rx="1"')}`;
    if (winter() || p === 'snow') s += `<path d="M${x0 - 8} ${y0 + 1} Q${cx} ${y0 - 12.4} ${x1 + 8} ${y0 + 1} Q${cx} ${y0 - 6} ${x0 - 8} ${y0 + 1}Z" fill="${SNOW}"/>${box(x0 - 5, y1 - 2, w + 10, 2, SNOW, ' rx="1"')}`;
    return s + '</g>';
  }
  // brass carriage lamps either side of the door, lit once the shop is open
  function lanterns(st) {
    const ok = st.door, iron = '#2f3434';
    let s = '';
    for (const x of LANTS) {
      s += `${line(`M${x} 344 V340 M${x - 3} 342 H${x + 3}`, iron, 1.2)}<path d="M${x - 4} 340 L${x - 5} 329 H${x + 5} L${x + 4} 340Z" fill="${ok ? '#fff1c9' : url('Grime')}" stroke="${iron}" stroke-width="1"/>`;
      s += `${line(`M${x} 329 V340`, iron, 0.5)}<path d="M${x - 6.4} 329 L${x} 323 L${x + 6.4} 329Z" fill="${iron}"/>${dot(x, 321.6, 1.2, ok ? '#e0b54a' : iron)}`;
      if (winter()) s += line(`M${x - 6} 328.4 L${x} 322.6 L${x + 6} 328.4`, SNOW, 1.4);
    }
    return s;
  }
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const col = ok ? C.curioDoor : U.mix(C.curioDoor, '#a59e90', 0.62), dk = U.shade(col, -0.28);
    const brass = ok ? '#d9a93a' : '#8a8576', { x0, x1, y0, y1 } = DOOR, w = x1 - x0, cx = (x0 + x1) / 2;
    let s = `<g data-part="door">${box(x0 - 3, 311, w + 6, y1 - 311, U.shade(K.front, -0.3))}${box(x0, 313.4, w, 9, ok ? '#2f3a3a' : '#4a463e')}`;
    // the fanlight over the door
    for (let i = 0; i < 6; i++) { const a = Math.PI + ((i + 0.5) / 6) * Math.PI; s += line(`M${cx} 322.4 L${f1(cx + Math.cos(a) * 16)} ${f1(Math.max(313.4, 322.4 + Math.sin(a) * 9))}`, K.sash, 0.7); }
    s += `${box(x0, 322, w, 2, K.sash)}${box(x0, y0, w, y1 - y0, col)}${box(x0, y0, w, 1.4, '#fff', ' opacity="0.2"')}`;
    // the glass in the door: a glimpse of the shop
    s += box(x0 + 4, y0 + 4, w - 8, 20, ok ? '#c99a62' : '#5a5046');
    if (ok) s += `${box(x0 + 4, y0 + 9, w - 8, 1.6, '#7a4a2e')}${box(x0 + 4, y0 + 17, w - 8, 1.6, '#7a4a2e')}${dot(x0 + 9, y0 + 7.4, 1.4, '#e0b54a')}${box(x0 + 15, y0 + 13.4, 4, 3.6, '#8e2f3a')}${dot(x0 + 22, y0 + 14.6, 1.6, '#5f9fd0')}`;
    else s += box(x0 + 4, y0 + 4, w - 8, 20, url('Grime'), ' opacity="0.65"');
    if (p === 'frost') s += box(x0 + 4, y0 + 4, w - 8, 20, url('Frost'), ' opacity="0.85"');
    s += `<rect x="${x0 + 4}" y="${y0 + 4}" width="${w - 8}" height="20" fill="none" stroke="${dk}" stroke-width="1.2"/>${line(`M${cx} ${y0 + 4} V${y0 + 24}`, dk, 0.8)}`;
    // the card on its string: OPEN or CLOSED
    s += line(`M${cx - 6} ${y0 + 5} L${cx} ${y0 + 10} L${cx + 6} ${y0 + 5}`, '#5a4a3a', 0.5);
    s += ok ? `${box(cx - 8, y0 + 10, 16, 6.4, '#f6efe0')}<text x="${cx}" y="${y0 + 14.8}" text-anchor="middle" font-family="${FONT}" font-size="4.6" font-weight="900" fill="#2f7a4a">OPEN</text>`
      : `<g transform="rotate(-10 ${cx} ${y0 + 13})">${box(cx - 9, y0 + 10, 18, 6.4, '#d9cfb4')}<text x="${cx}" y="${y0 + 14.6}" text-anchor="middle" font-family="${FONT}" font-size="4" font-weight="900" fill="#a8443f">CLOSED</text></g>`;
    for (const [px, py, ph] of [[x0 + 4, y0 + 30, 24], [x0 + 16, y0 + 30, 24], [x0 + 4, y0 + 58, 26], [x0 + 16, y0 + 58, 26]]) s += `<rect x="${px}" y="${py}" width="10" height="${ph}" rx="0.8" fill="none" stroke="${dk}" stroke-width="1.1"/>`;
    s += `${box(cx - 6, y0 + 55, 12, 2.8, brass, ' rx="0.6"')}${dot(x1 - 4, y0 + 46, 1.9, brass)}${dot(x1 - 4.6, y0 + 45.4, 0.6, '#fff', ok ? 0.8 : 0.2)}`;
    // a brass knocker in the shape of a ring
    s += `<circle cx="${cx}" cy="${y0 + 28.6}" r="2.6" fill="none" stroke="${brass}" stroke-width="1"/>${dot(cx, y0 + 26, 0.9, brass)}`;
    if (!ok) s += `${oval(x0 + 7, y0 + 40, 3, 4.6, '#d8cfbf', 0.75)}${oval(x0 + 22, y0 + 76, 3.4, 2.4, '#d8cfbf', 0.7)}${oval(x0 + 12, y0 + 86, 4, 1.6, '#d8cfbf', 0.6)}${line(`M${x1} ${y0} l-8 7 M${x1} ${y0} l-3 10`, '#e8e4da', 0.5, 0.8)}`;
    if (p === 'grow') s += box(x0, y0, w, y1 - y0, FADE, ' opacity="0.5"');
    s += `${box(x0 - 5, y1, w + 10, 6, K.stone, ' rx="1.4"')}${box(x0 - 5, y1 + 4, w + 10, 2, '#000', ' opacity="0.08"')}`;
    if (winter() || p === 'snow') s += box(x0 - 5, y1 - 1.4, w + 10, 2.6, SNOW, ' rx="1.3"');
    if (p === 'leaves') s += oval(x0 + 2, y1 + 1, 3, 1.4, '#d9822b') + oval(x1 - 3, y1 + 2, 3.4, 1.5, '#c4462f') + oval(cx, y1 + 0.6, 2.6, 1.2, '#e9b23c');
    return s + '</g>';
  }
  // the narrow window by the door: new shelves of pale wood, full of odds and ends
  function side(st) {
    const p = pend(st, 'shelves'), some = st.shelves && !!p, { x0, x1, y0, y1 } = SIDE, w = x1 - x0, h = y1 - y0;
    let s = `<g data-part="shelves"><g clip-path="${url('Side')}">${box(x0, y0, w, h, url(PCT < 0.4 ? 'PaperOld' : 'Paper'))}${box(x0, y1 - 8, w, 8, st.shelves ? '#a8743c' : '#8f8272')}`;
    const rows = [342, 364, 386];
    if (st.shelves) {
      for (const y of rows) s += `${box(x0 + 2, y, w - 4, 2.6, '#e0c08e')}${box(x0 + 2, y + 2.6, w - 4, 0.8, '#000', ' opacity="0.15"')}${line(`M${x0 + 6} ${y + 2.6} l3 4 M${x1 - 6} ${y + 2.6} l-3 4`, '#b08a5a', 1)}`;
      const SET = [[['jug', x0 + 8], ['cup', x0 + 17], ['cup', x0 + 24], ['bell', x0 + 34]], [['camera', x0 + 9], ['top', x0 + 20], ['candle', x0 + 29], ['jar', x0 + 36]], [['books', x0 + 9], ['musicbox', x0 + 22], ['vase', x0 + 34]]];
      SET.forEach((row, i) => row.forEach(([k, x], j) => {
        const draw = THING[k](x, rows[i], '#bba9df');
        s += some && (i + j) % 3 === 1 ? `<g transform="rotate(${j % 2 ? 70 : -76} ${x} ${rows[i]})">${draw}</g>` : draw;
      }));
      if (some) s += box(x0, y0, w, h, url('Dusty'), ' opacity="0.3"');
    } else {
      // only the old brackets are left; everything is piled on the floor
      for (const y of rows) s += line(`M${x0 + 6} ${y + 2} l3 4 M${x1 - 6} ${y + 2} l-3 4`, '#6b5a48', 1);
      s += `<g transform="rotate(-62 ${x0 + 10} ${y1 - 4})">${box(x0 + 8, y1 - 6, 40, 3, '#8a7a62')}</g>${box(x0 + 18, y1 - 16, 16, 10, '#8a7458')}${box(x0 + 21, y1 - 22, 11, 6, '#7a6650')}`;
      s += THING.vase(x0 + 10, y1 - 6) + `<g transform="rotate(80 ${x0 + 36} ${y1 - 6})">${THING.drum(x0 + 36, y1 - 6)}</g>` + box(x0, y0, w, h, url('Dusty'), ' opacity="0.4"');
    }
    s += box(x0, y0, w, 24, url('Shade'), ' pointer-events="none"') + '</g>';
    if (!st.shelves) s += box(x0, y0, w, h, url('Grime'), ' opacity="0.5" pointer-events="none"') + line(`M${x0 + 4} ${y0 + 2} l12 14 M${x1 - 2} ${y0 + 30} l-8 12 l4 6`, '#eef0e8', 0.6, 0.85);
    else if (!p) s += `<path d="M${x0 + 4} ${y1} L${x0 + 26} ${y0} H${x0 + 33} L${x0 + 11} ${y1}Z" fill="#fff" opacity="0.1" pointer-events="none"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${K.front}" stroke-width="3"/>${line(`M${x0 + w / 2} ${y0} V${y1} M${x0} ${y0 + 15} H${x1}`, K.front, 1.4)}`;
    s += `${box(x0 - 4, y1 - 0.6, w + 8, 3, K.stone, ' rx="1"')}${box(x0 - 2, y1 + 2.4, w + 4, 11, U.shade(K.front, 0.06))}<rect x="${x0 + 1}" y="${y1 + 4.4}" width="${w - 2}" height="7" fill="none" stroke="${K.gold}" stroke-width="0.6" opacity="0.6"/>`;
    if (winter()) s += box(x0 - 4, y1 - 2, w + 8, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }

  // ------------------------------------------------------------- the street
  function street() {
    let s = `<rect x="0" y="420" width="400" height="120" fill="${url('Cobble')}"/>
      <rect x="0" y="420" width="400" height="24" fill="${url('Paving')}"/>${box(0, 443, 400, 4.6, K.stone)}${box(0, 447.6, 400, 3, '#000', ' opacity="0.14"')}`;
    s += box(0, 450, 400, 9, '#a39a8a', ' opacity="0.55"');
    for (let x = 0; x < 400; x += 12) s += box(x + 0.6, 451, 10.8, 7, '#d6cdbb', ' rx="1.4" opacity="0.45"');
    s += `<path d="M0 500 Q100 490 200 496 T400 494 V516 Q300 520 200 514 T0 520Z" fill="#fff" opacity="${winter() ? 0 : 0.07}"/>`;
    // a drain at the kerb and a round iron cover in the street
    s += `${box(150, 451.4, 16, 6.4, '#5a5a5e', ' rx="1"')}${line('M153 452.4 V456.8 M156.4 452.4 V456.8 M159.8 452.4 V456.8 M163.2 452.4 V456.8', '#2f2f34', 1)}`;
    s += `${oval(214, 488, 13, 4.2, '#6b6b70')}${oval(214, 488, 10.4, 3.2, '#5a5a5e')}${line('M205 488 H223 M209 485.8 H219 M209 490.2 H219', '#4a4a4e', 0.7)}`;
    for (const [x, y, rx] of [[64, 480, 26], [180, 520, 34], [300, 470, 22], [360, 528, 26]]) s += oval(x, y, rx, rx * 0.3, '#000', 0.05);
    if (winter()) {
      s += `<rect x="0" y="420" width="400" height="24" fill="${url('Snow')}" opacity="0.8"/><rect x="0" y="449" width="400" height="91" fill="${url('Snow')}" opacity="0.62"/>`;
      s += `<path d="M0 450 Q60 446 120 452 T240 450 T400 452 V460 Q300 457 200 461 T0 459Z" fill="${SNOW}"/>`;
      s += line('M0 492 Q120 486 220 494 T400 490 M0 506 Q120 500 220 508 T400 504', '#a7b0b9', 3.4, 0.45);
    } else if (SEASON === 'autumn') {
      for (const [x, y, rx] of [[110, 492, 22], [286, 516, 26], [210, 470, 14]]) s += oval(x, y, rx, rx * 0.22, '#b9d2dc', 0.7) + oval(x - rx * 0.3, y - 0.6, rx * 0.4, rx * 0.06, '#fff', 0.5);
      const r = U.rng(113);
      for (let i = 0; i < 16; i++) {
        const x = r() * 400, y = 424 + r() * 112;
        s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="1.5" fill="${U.pick(r, ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a'])}" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})" opacity="0.9"/>`;
      }
    } else if (SEASON === 'spring') {
      const r = U.rng(117);
      for (let i = 0; i < 14; i++) s += oval(260 + r() * 140, 426 + r() * 100, 1.8, 1.1, '#fbf6f0', 0.9);
    }
    return s;
  }
  // an old gas lamp at the kerb, lit after dark
  function lamppost() {
    let s = `${shadow(270, 446, 8, 1.6)}${box(265, 434, 10, 11, '#3d3d42', ' rx="1.4"')}${line('M270 434 V346', '#3d3d42', 3)}`;
    s += `${line('M263 352 H277', '#3d3d42', 1.6)}<path d="M263 345 L265 329 H275 L277 345Z" fill="#f3ead2" stroke="#3d3d42" stroke-width="1.4"/>`;
    s += `${line('M270 329 V345 M264 337 H276', '#3d3d42', 0.8)}<path d="M261 330 L270 321 L279 330Z" fill="#3d3d42"/>${dot(270, 319.6, 1.6, '#3d3d42')}`;
    if (winter()) s += `<path d="M261 329 L270 320 L279 329" stroke="${SNOW}" stroke-width="2" fill="none"/>`;
    return s;
  }
  // a chalk board out on the pavement once the shop opens its door again
  function aboard() {
    if (PCT < 0.5) return '';
    let s = `${shadow(100, 445, 13, 1.6)}${line('M90 444 L95 420 M110 444 L105 420', '#6b4a32', 1.6)}`;
    s += `${box(90, 418, 20, 22, '#6b4a32', ' rx="1.4"')}${box(92, 420, 16, 18, '#2f3534', ' rx="0.8"')}`;
    s += `${text(100, 426.6, 'COME IN', 3.2, '#f6efe0', ' letter-spacing="0.3"')}${line('M95 429.4 h10', '#e2c27a', 0.5)}${text(100, 433.2, 'CURIOUS', 2.8, '#efb4ae')}${text(100, 436.6, 'THINGS', 2.8, '#a6d3d4')}`;
    if (winter()) s += box(90, 416.6, 20, 2, SNOW, ' rx="1"');
    return s;
  }
  // mess left lying about while the shop is closed up
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}"><g transform="rotate(-6 70 430)">${box(54, 418, 30, 16, '#a8875a')}${line('M54 424 H84 M62 418 V434 M76 418 V434', '#8a6a42', 1)}</g>
      <g transform="rotate(16 112 434)">${box(104, 429, 14, 9, '#8a6a4a')}${line('M104 433 h14', '#6b4a32', 0.8)}</g><g transform="rotate(-20 150 432)">${box(146, 428, 8, 6, '#e2dccf')}</g>
      ${[[200, 470], [116, 500], [300, 486], [60, 512], [250, 524], [30, 424], [262, 423]].map(([x, y]) => line(`M${x} ${y} l-2 -5 M${x} ${y} l0.6 -6 M${x} ${y} l2.6 -4`, '#5f8a3a', 1)).join('')}
      ${oval(366, 444, 9, 6, '#3d3d42')}${oval(366, 440, 6, 2.4, '#5a5a5e')}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="338.5" y="484" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 340 480)">
      <rect x="316" y="470" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="340" y="483.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 340 488)"><rect x="313" y="484" width="54" height="10" fill="#d9534f"/><text x="340" y="492" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot. The ones
  // inside are drawn with the room they stand in, behind the glass.
  const INSIDE = new Set(['mc-fern', 'mc-map', 'mc-ship', 'mc-cuckoo', 'mc-cat', 'mc-globelamp', 'mc-gramophone', 'mc-lights', 'mc-chandelier']);
  const DECOR = {
    // a fern under a glass dome, at the left of the display
    'mc-fern': () => {
      let s = `${box(34, 394, 16, 2.4, '#8a5a3c', ' rx="0.8"')}`;
      for (const [dx, h] of [[-3, 9], [0, 12], [3, 10]]) s += frond(42 + dx * 0.3, 394, dx * 1.6 + (dx === 0 ? 2 : 0), h, '#4f8a3c');
      return `<g>${s}<path d="M35 394 V384 Q35 376 42 376 Q49 376 49 384 V394Z" fill="#e6f4f4" opacity="0.32" stroke="#d6e6e8" stroke-width="0.6"/>${line('M38 382 q1 -3 3 -4', '#fff', 0.8, 0.7)}${dot(42, 375.4, 1, '#c9a964')}</g>`;
    },
    // an old map in a frame on the back wall
    'mc-map': () => `<g>${box(111, 328, 21, 15, '#8a5a3c')}${box(112.6, 329.6, 17.8, 11.8, '#efe3c4')}${line('M114 336 q3 -4 6 -1 q3 2 5 -2 q2 -1 4 1', '#7fae8a', 1.2)}${line('M116 339 q4 1 7 -1', '#7f9fc4', 0.8)}${dot(127, 331.6, 1.2, '#c9474f')}${line('M127 330 v3.2 M125.4 331.6 h3.2', '#8a5a3c', 0.4)}</g>`,
    // a ship in a bottle, lying on a little stand
    'mc-ship': () => `<g>${box(60, 393, 3, 3, '#6b4430')}${box(73, 393, 3, 3, '#6b4430')}<path d="M57 388 H74 q5 0 7 2 q-2 2 -7 2 H57 q-2 -2 0 -4Z" fill="#cfe8e0" opacity="0.6" stroke="#9fc4b8" stroke-width="0.6"/>${box(80.4, 389, 2.6, 2, '#b98a5a')}<path d="M60 390.6 h11 l-1.6 1.4 h-7.8Z" fill="#8a5230"/><path d="M64 390.4 V384.6 l3.4 5.8Z M65 390.4 V386 l-3 4.4Z" fill="#f6efe0"/>${line('M60 388.6 q6 -1 12 0', '#fff', 0.5, 0.7)}</g>`,
    // a cuckoo clock on the wall of the jigsaw room
    'mc-cuckoo': () => `<g>${line('M107 232 V243 M111 232 V240', '#5a4a3a', 0.4)}<path d="M106 241 l1 3 l1 -3Z M110 238 l1 3 l1 -3Z" fill="#6b4430"/><path d="M101 220 L109 213 L117 220Z" fill="#5a3a24"/>${box(102, 220, 14, 12, '#8a5a3c')}${dot(109, 226, 3.4, '#f6efe0')}${line('M109 226 V224 M109 226 h1.6', '#3d3d42', 0.5)}${box(107.4, 216.6, 3.2, 2.6, '#2a1c14')}${dot(109, 217.6, 0.9, '#e2a33c')}</g>`,
    // a brass telescope on a tripod, peering out of the window upstairs
    'mc-telescope': () => `<g>${line('M232 264 L226 276 M232 264 L238 276 M232 264 V276', '#6b4430', 1.2)}<g transform="rotate(-34 232 262)">${box(214, 259.4, 34, 5, '#d9a93a', ' rx="1.6"')}${box(244, 258.6, 7, 6.6, '#c9963a', ' rx="1"')}${box(214, 259.4, 34, 1.4, '#fff', ' opacity="0.3"')}${box(222, 258.8, 2.4, 6.2, '#9a7a2a')}</g></g>`,
    // a cat asleep on top of the cabinet
    'mc-cat': () => {
      const fur = '#8a7a6a', dk = '#5f5246';
      return `<g>${oval(68, 336, 9.6, 1.2, '#000', 0.12)}<g class="mc-breathe">${oval(69, 332.4, 8.6, 4, fur)}${line('M66 329.6 q1.4 3 0 5.6 M71 329.2 q1.4 3 0 6 M75 330 q1.2 2.6 0 5', dk, 0.9)}</g>${dot(61.4, 332.8, 3.4, fur)}<path d="M58.8 330.6 l-0.4 -3 l2.4 1.6Z M62.4 329.8 l1.2 -2.8 l1 2.6Z" fill="${fur}"/>${line('M59.8 333 q0.8 0.6 1.6 0 M62.2 333 q0.8 0.6 1.6 0', '#3b2a1a', 0.5)}<path d="M77 333 q3 1.6 0 3 q-6 1.4 -12 0.4" stroke="${fur}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;
    },
    // a lamp shaped like a globe, at the right of the display
    'mc-globelamp': () => `<g>${oval(126, 395.4, 5, 1.2, '#8a5a3c')}${line('M126 395 V390', '#d9a93a', 1.2)}${dot(126, 385, 5.2, '#bfe0f2')}<path d="M122.6 383 q2 -2 4 -1 q0.6 2 -1 3 q-2 1 -3 -2Z M127 386 q2 -1 3 1 q-1 2 -3 2Z" fill="#a9c46a"/><circle cx="126" cy="385" r="6.2" fill="none" stroke="#d9a93a" stroke-width="0.8"/>${dot(124.4, 383.4, 1.2, '#fff', 0.7)}</g>`,
    // a gramophone with a big brass horn, in the jigsaw room
    'mc-gramophone': () => `<g>${box(42, 248, 15, 14, '#6b3a26')}${box(42, 248, 15, 1.4, '#8a5230')}${oval(49.5, 247.4, 6, 1.4, '#2a2a30')}${line('M53 247 L55 240 Q56 236 52 234', '#d9a93a', 1)}<path d="M52 234 Q48 228 44 224 Q50 222 56 221 Q54 228 52 234Z" fill="#e0b54a"/><path d="M44 224 Q50 222 56 221" stroke="#c9963a" stroke-width="0.8" fill="none"/></g>`,
    'mc-lights': () => lightsInside(),
    // a rocking horse out on the pavement, gently rocking
    'mc-horse': () => {
      const c = '#efe9e0', dk = '#b8ab98';
      let s = `${shadow(236, 437, 18, 1.6)}<g class="mc-rock">${line('M220 434 Q236 441 252 434', '#8e2f3a', 2.4)}${line('M225 435.6 L228 424 M247 435.6 L244 424 M231 437 L232 425 M241 437 L240 425', '#8a5a3c', 1.4)}`;
      s += `${oval(236, 421, 12, 5.4, c)}${dot(230, 420, 1, dk)}${dot(239, 422, 1.1, dk)}${dot(243, 419.6, 0.9, dk)}<path d="M246 418 q4 -8 2 -12 q4 0 6 3 q1 3 -2 3 l-2 6Z" fill="${c}"/>${dot(251.4, 409.4, 0.7, '#3b2a1a')}`;
      s += `<path d="M246 410 q-3 3 -2 8" stroke="#8a5a3c" stroke-width="2" fill="none" stroke-linecap="round"/>${line('M223 420 q-5 2 -6 8', '#8a5a3c', 2)}${box(232, 415, 8, 3.4, '#c9474f', ' rx="1"')}${line('M236 418.4 v4', '#e2c27a', 0.7)}</g>`;
      return `<g>${s}${winter() ? oval(236, 415.6, 9, 1.4, SNOW) : ''}</g>`;
    },
    // a little brass chandelier over the globe
    'mc-chandelier': () => `<g>${line('M98 318 V323', '#8a7a52', 0.6)}${oval(98, 325, 7.6, 1.6, '#d9a93a')}${line('M90.4 325 q0 3 7.6 3.4 q7.6 -0.4 7.6 -3.4', '#d9a93a', 0.8)}${[91, 98, 105].map((x) => `${box(x - 0.7, 321.4, 1.4, 3.4, '#f6efe0')}${oval(x, 324.8, 1.6, 0.6, '#c9963a')}`).join('')}${dot(98, 329.4, 1.2, '#d9a93a')}</g>`,
    // a little suit of armour by the door, a red plume on its helmet
    'mc-armour': () => {
      const m = '#c9ced4', dk = '#8f979e';
      return `<g>${shadow(163, 426, 8, 1.4)}${box(158, 424, 4, 2.4, dk, ' rx="0.6"')}${box(164, 424, 4, 2.4, dk, ' rx="0.6"')}${box(158.6, 410, 3.4, 14, m)}${box(164, 410, 3.4, 14, m)}${line('M158.6 416 h3.4 M164 416 h3.4', dk, 0.6)}
        <path d="M156 398 h14 l-1 12 h-12Z" fill="${m}"/>${line('M163 399 V409', dk, 0.6)}${box(156.4, 409, 13.2, 2, dk)}${dot(155, 399.6, 2.4, m)}${dot(171, 399.6, 2.4, m)}${line('M154.4 401 l-2 8 M171.6 401 l2 8', m, 2.2)}${line('M174 404 V412', '#6b4a32', 0.9)}<path d="M172.6 401 l1.4 -5 l1.4 5Z" fill="${dk}"/>
        ${oval(163, 393, 4.6, 5, m)}${box(159.4, 392, 7.2, 1.4, '#3b3f44')}${line('M160 395 h6', dk, 0.6)}<path d="M163 388.2 q2 -6 6 -5 q-2 2 -3 5Z" fill="#c9474f"/>${dot(161.6, 390, 0.8, '#fff', 0.6)}${winter() ? oval(163, 388.6, 4, 1, SNOW) : ''}</g>`;
    },
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && !INSIDE.has(k)) s += DECOR[k]();
    return s;
  }

  function butterfly(x, y, col) {
    return `<g transform="translate(${f1(x)} ${f1(y)})"><g class="mc-flit"><g class="mc-wing"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="${col}"/></g>${line('M0 -2 V2', '#3d3d42', 0.8)}</g></g>`;
  }
  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M150 108 q4 -4 8 0 q4 -4 8 0 M174 120 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a robin on the rim of the fountain, butterflies over the ferns
    if (PCT > 0.5 && st.fountain) s += `<g class="mc-hop">${oval(370, 387, 3.6, 2.8, '#8a6a52')}${oval(371.4, 388, 2.2, 1.9, '#e2683a')}${dot(372.6, 384.6, 1.8, '#8a6a52')}${dot(373.2, 384.2, 0.5, '#222')}<path d="M374.2 384.8 l1.6 0.4 l-1.6 0.4Z" fill="#5a4a3a"/></g>`;
    if (PCT > 0.6 && st.ferns && (SEASON === 'summer' || SEASON === 'spring')) s += `<g pointer-events="none">${butterfly(300, 330, '#f2a7b8')}${butterfly(384, 338, '#fbd85c')}</g>`;
    // a pigeon on the pavement, and a blackbird on the yard wall in winter
    if (PCT > 0.6 && !winter()) s += `<g class="mc-hop">${oval(196, 436, 4.4, 3, '#8a8f99')}${dot(199.4, 433, 2, '#7a7f8a')}${dot(200, 432.6, 0.5, '#222')}<path d="M201.2 433.2 l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${oval(197, 435, 2, 1, '#6fa08a', 0.7)}${line('M195 439 v2.4 M197 439 v2.4', '#c9586e', 0.6)}</g>`;
    if (winter() && PCT > 0.5) s += `<g class="mc-hop">${oval(300, 287, 4, 2.8, '#2f2f34')}${dot(303, 284.6, 1.9, '#2f2f34')}<path d="M304.6 284.6 l2 0.5 l-2 0.5Z" fill="#e9a23c"/>${line('M296.6 287 l-3 1.4', '#2f2f34', 1.4)}</g>`;
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

  // evening: darken everything except the lit windows, the lamps and a candle
  function night(st, decor) {
    const shop = st.window && !PEND.window, up1 = st.jigsaw && !PEND.jigsaw, up2 = st.seek && !PEND.seek, side2 = st.shelves && !PEND.shelves, door2 = st.door;
    const rect = (w) => `<rect x="${w.x0}" y="${w.y0}" width="${w.x1 - w.x0}" height="${w.y1 - w.y0}"/>`;
    let holes = '<path d="M263 345 L265 329 H275 L277 345Z"/>';
    if (shop) holes += rect(WIN);
    if (up1) holes += rect(UPL);
    if (up2) holes += rect(UPR);
    if (side2) holes += rect(SIDE);
    if (door2) holes += `<rect x="${DOOR.x0}" y="313.4" width="${DOOR.x1 - DOOR.x0}" height="9"/><rect x="${DOOR.x0 + 4}" y="${DOOR.y0 + 4}" width="${DOOR.x1 - DOOR.x0 - 8}" height="20"/>` + LANTS.map((x) => `<path d="M${x - 4} 340 L${x - 5} 329 H${x + 5} L${x + 4} 340Z"/>`).join('');
    if (PCT >= 0.9) holes += '<rect x="137" y="176" width="16" height="18"/>';
    const all = `y="${-DY - 4}" width="400" height="${548 + DY}"`;
    let s = `<mask id="${id('Dark')}"><rect ${all} fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect ${all} fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect ${all} fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 32; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 - DY + ((i * 53) % 150)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="357" cy="52" r="14" fill="#000"/></mask><circle cx="350" cy="58" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="350" cy="58" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    s += `<path d="M263 345 L265 329 H275 L277 345Z" fill="#ffe9a8" opacity="0.7"/>${glow(270, 338, 30, 26)}${glow(270, 448, 40, 9)}`;
    if (shop) s += `${box(WIN.x0, WIN.y0, 126, 84, '#ffd98a', ' opacity="0.2"')}${glow(93, 360, 90, 56)}${glow(93, 436, 80, 10)}`;
    if (st.lamp && !PEND.lamp) s += `${dot(47, 321, 3.4, '#fff3c4')}${glow(47, 321, 26, 22)}`;
    if (decor['mc-chandelier']) s += `${[91, 98, 105].map((x) => `<path class="mc-flame" d="M${x} 321.6 q-1 -1.4 0 -3 q1 1.6 0 3Z" fill="#ffe9b0"/>`).join('')}${glow(98, 324, 20, 12)}`;
    if (decor['mc-globelamp']) s += `${dot(126, 385, 5.2, '#ffefb0', 0.8)}${glow(126, 385, 16)}`;
    if (st.jigsaw) s += `<path class="mc-flame" d="M63.6 233 q-1.4 -2 0 -4.6 q1.4 2.6 0 4.6Z" fill="#ffe9b0"/>${glow(63.6, 232, 16, 14)}`;
    if (up1) s += `${box(UPL.x0, UPL.y0, 76, 54, '#ffd98a', ' opacity="0.16"')}${glow(78, 240, 48, 30)}`;
    if (up2) s += `${box(UPR.x0, UPR.y0, 76, 54, '#ffd98a', ' opacity="0.14"')}${glow(212, 240, 48, 30)}`;
    if (side2) s += `${box(SIDE.x0, SIDE.y0, 42, 84, '#ffd98a', ' opacity="0.18"')}${glow(237, 360, 32, 48)}`;
    if (door2) {
      s += `${box(DOOR.x0, 313.4, 30, 9, '#ffd98a', ' opacity="0.3"')}${box(DOOR.x0 + 4, DOOR.y0 + 4, 22, 20, '#ffd98a', ' opacity="0.22"')}${glow(187, 332, 24, 20)}`;
      for (const x of LANTS) s += `<path d="M${x - 4} 340 L${x - 5} 329 H${x + 5} L${x + 4} 340Z" fill="#ffe9b0" opacity="0.75"/>${glow(x, 334, 18, 16)}${glow(x, 424, 16, 4)}`;
    }
    if (PCT >= 0.9) s += `${box(137, 176, 16, 18, '#ffd98a', ' opacity="0.3"')}${glow(145, 185, 16, 14)}`;
    if (decor['mc-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    window: [93, 360], sign: [145, 300], door: [187, 368], floor: [93, 388], cabinet: [57, 359], clock: [144, 350], globe: [98, 352], lamp: [47, 324],
    fountain: [340, 388], yard: [340, 404], shelves: [237, 360], ferns: [300, 352], box: [95, 388], jigsaw: [80, 244], seek: [212, 238],
  };
  const PARTS = ['window', 'sign', 'door', 'floor', 'cabinet', 'clock', 'globe', 'lamp', 'fountain', 'yard', 'shelves', 'ferns', 'box', 'jigsaw', 'seek'];
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

  // st: map of restored part -> true; cols: chosen paint colours (curioSign,
  // curioDoor); opts as for HALT.render
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night;
    const decor = opts.decor || {};
    palette({ curioSign: cols.curioSign || '#c9474f', curioDoor: cols.curioDoor || '#4e7b5b' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house curio">
      ${style()}${defs()}<g transform="translate(0 ${DY})">${sky()}${far()}${tree()}${yardWall()}${neighbour()}${street()}
      ${roof()}${walls()}${upstairs(st, decor)}${front()}${sign(st, C)}
      <g clip-path="${url('Win')}">${shopInside(st, decor)}</g>${bowGlass(st)}${lanterns(st)}${door(st, C)}${side(st)}
      ${yard(st)}${fountain(st)}${ferns(st)}${lamppost()}${aboard()}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}</g>
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
