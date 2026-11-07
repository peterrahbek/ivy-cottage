'use strict';
// The Little Theatre, drawn as SVG the same way as the cottage (house.js), the
// observatory and the lido. A tin-roofed village hall that became a little
// theatre, seen from the lane, with its long wall taken away like the front of a
// doll's house. On the left stands the tall painted front: the sign, the marquee
// with its letters, a tiled foyer open to the lane with the ticket booth in the
// middle of it, and the front steps. On the right is the inside: the stalls seen
// from behind, the stage with its red curtains, its boards, its props and the
// painted backdrop, and upstairs under the tin roof the dressing room with the
// round mirror, the costume on its stand and the peg for the top hat. The stage
// door is in a lean-to at the far end. Each restorable part has a tired look and
// a restored look; the door and the sign take the colours chosen while painting,
// and the backdrop shows what was painted (js/paintings.js). In the evening the
// footlights come on. Every id carries a 'th' prefix (plus opts.uid when given)
// so this picture can share a page with the others.

const THEATRE = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a seasonal
  // job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the id suffix,
  // whether the theatre is still for sale, how far along it is, what was painted
  // and the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false, PAINTED = {}, STAMP = '', RESTING = false;
  // what the defs hold changes with the season and the progress, so their ids do too
  const id = (n) => `th${n}${UID}${STAMP}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => +(+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const FALL = ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a'];
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shape = (d, col, more = '') => `<path d="${d}" fill="${col}"${more}/>`;
  const text = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${col}"${more}>${s}</text>`;
  const serif = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="700" fill="${col}"${more}>${s}</text>`;
  const leaf = (x, y, rot, col, rx = 3.4) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${f1(rx * 0.48)}" fill="${col}" transform="rotate(${Math.round(rot)} ${f1(x)} ${f1(y)})"/>`;
  const poly = (list) => `M${list.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L')}Z`;
  const star5 = (x, y, r, col) => shape(poly(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r * 0.42 : r; return [x + Math.cos(a) * d, y + Math.sin(a) * d]; })), col);
  const ink = (c) => (U.lum(c) > 0.62 ? '#2a3360' : '#fff6e0');
  // many small marks of one colour as a single path, which keeps the picture small
  const specks = (list, col, size, op = 1) => (list.length ? `<path d="${list.map(([x, y]) => `M${f1(x)} ${f1(y)}h.01`).join('')}" stroke="${col}" stroke-width="${size}" stroke-linecap="round"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');
  const ovals = (list, col, op = 1) => (list.length ? `<path d="${list.map(([x, y, rx, ry = rx]) => `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rx * 2)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-rx * 2)} 0`).join('')}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');

  const SKY = {
    spring: ['#b4d2ea', '#e4ecec', '#f8ecd8'], summer: ['#9cc9ec', '#dcebf2', '#fbeed2'],
    autumn: ['#c2bcd8', '#efd8c6', '#f6dfbc'], winter: ['#b8c6de', '#dfe6ef', '#f3f2f3'],
  };
  const HILL = {
    spring: ['#bcd9a0', '#a6cc88', '#92bd75'], summer: ['#b0d28a', '#97c074', '#82ae60'],
    autumn: ['#e0c686', '#d2ae6c', '#bd9558'], winter: ['#e8eff4', '#dde6ee', '#d2dde7'],
  };
  // the pavement before the hall and the cobbles of the lane
  const PAVE = { spring: ['#ded6c4', '#c7bda8', '#a39a8e'], summer: ['#e6dcc6', '#cfc3aa', '#ab9f90'], autumn: ['#d6cab2', '#bdb098', '#958a7c'], winter: ['#e6ebef', '#cdd6de', '#b4bec9'] };
  // the old tree behind the lean-to: its leaves, or nothing in the winter
  const TREE = { spring: ['#a9d184', '#bfe09a', '#8fc06e'], summer: ['#5f9a4e', '#74ad5e', '#4c8742'], autumn: ['#d08a34', '#e2a53e', '#b5642c'], winter: null };
  // the word on the marquee, a season's show
  const BILL = { spring: ['A SPRING', 'SHOW'], summer: ['A SUMMER', 'PLAY'], autumn: ['AN AUTUMN', 'PLAY'], winter: ['THE', 'PANTOMIME'] };

  // ---------------------------------------------------------------- shapes
  // the tall front, its curly top and the sign on it
  const FRONT_D = 'M8 460 V152 Q8 142 18 142 H32 Q32 124 50 122 Q58 106 71 106 Q84 106 92 122 Q110 124 110 142 H124 Q134 142 134 152 V460Z';
  const SIGNB = { x: 20, y: 148, w: 102, h: 52 };
  // the windows above the marquee, and where a framed poster can hang between them
  const UPPER = [[24, 50], [92, 118]];
  // the marquee, sticking out over the foyer
  const MARQ = { x0: 2, x1: 140, y0: 258, y1: 306 };
  // the foyer: an open porch under the marquee, its front and back edges
  const FOY = { fx0: 12, fx1: 128, fy: 444, bx0: 30, bx1: 110, by: 404, top: 314, in: 324 };
  // the ticket booth stands in the middle of the foyer
  const BOOTH = { x: 70, w: 18, y0: 342, y1: 428 };
  // the three front steps: top of the tread, left and right ends
  const STEPS = [[444, 6, 134], [456, 2, 138], [468, -2, 142]];
  // the hall with its wall taken away, and the room under the roof
  const HALL = { x0: 142, x1: 330, cx: 236, floor: 446, foot: 458 };
  const ROOM = { x0: 142, x1: 330, y0: 192, y1: 250 };
  // the opening of the stage, the cloth at the back and the boards
  const OPEN_D = 'M150 358 V276 Q150 266 160 266 H312 Q322 266 322 276 V358Z';
  const OPEN = { x0: 150, x1: 322, y0: 266, y1: 356 };
  const BACK = { x0: 168, x1: 304, y0: 270, y1: 334 };
  const BOARD = { bx0: 168, bx1: 304, by: 334, fx0: 146, fx1: 326, fy: 356 };
  // the stalls: four rows from the back of the picture to the front
  const ROWS = [{ top: 376, h: 16, w: 15.2 }, { top: 391, h: 17, w: 16.2 }, { top: 407, h: 18, w: 17.2 }, { top: 424, h: 21, w: 18.4 }];
  // the long tin roof
  const ROOF_D = 'M136 118 H346 L358 196 H122Z';
  // the stage door in the lean-to
  const DOOR = { x0: 350, x1: 382, y0: 380, y1: 452 };
  const LAMP = { x: 366, y: 352 };
  // the round mirror, the costume on its stand and the hat stand, along the room
  const GLASS = { x: 178, y: 219, r: 15, b: 19.8 };
  const DUMMY = { x: 254, y: 250 };
  const HATX = 308;
  // the row of footlights along the front of the stage
  const FEET = Array.from({ length: 9 }, (_, i) => 160 + i * 19);

  // little css of our own: the curtains, the sequins, the bunting, the bulbs and the moth
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .th-sway{animation:thsway 5.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      #scene .th-sway.b{animation-duration:6.8s;animation-delay:-2.4s}
      @keyframes thsway{from{transform:rotate(-0.5deg)}to{transform:rotate(0.5deg)}}
      #scene .th-puppet{animation:thpuppet 4.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      #scene .th-puppet.b{animation-delay:-1.9s}
      @keyframes thpuppet{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
      #scene .th-flag{animation:thflag 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      #scene .th-flag:nth-of-type(2n){animation-delay:-1.5s}
      @keyframes thflag{from{transform:skewX(-6deg)}to{transform:skewX(7deg)}}
      #scene .th-seq{animation:thseq 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      #scene .th-seq.b{animation-delay:-0.9s}
      #scene .th-seq.c{animation-delay:-1.8s}
      @keyframes thseq{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
      #scene .th-glim{animation:thglim 2.6s ease-in-out infinite alternate}
      #scene .th-glim:nth-of-type(3n){animation-delay:-.9s}
      #scene .th-glim:nth-of-type(3n+1){animation-delay:-1.8s}
      @keyframes thglim{from{opacity:.72}to{opacity:1}}
      #scene .th-breathe{animation:thbreathe 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes thbreathe{50%{transform:scaleY(1.05)}}
      #scene .th-tail{animation:thtail 7s ease-in-out infinite;transform-box:fill-box;transform-origin:0% 100%}
      @keyframes thtail{0%,60%,100%{transform:rotate(0)}72%{transform:rotate(14deg)}84%{transform:rotate(-6deg)}}
      #scene .th-hop{animation:thhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes thhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .th-moth{animation:thmoth 9s ease-in-out infinite}
      @keyframes thmoth{0%,100%{transform:translate(-9px,3px)}25%{transform:translate(2px,-8px)}50%{transform:translate(11px,1px)}75%{transform:translate(1px,8px)}}
      #scene .th-wing{animation:thwing .22s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes thwing{to{transform:scaleX(.45)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      navy: U.mix('#2c3a6e', '#737a86', k * 1.5),
      navyD: U.mix('#212c56', '#5f6672', k * 1.5),
      gold: U.mix('#dcb04e', '#a59a7e', k * 1.5),
      goldD: U.mix('#a87f2c', '#837a62', k * 1.4),
      red: U.mix('#b32c3a', '#94766f', k * 1.4),
      cream: U.mix('#f5e9d0', '#c9c0ac', k * 1.4),
      stone: U.mix('#e6dbc2', '#b3aa9a', k),
      timber: U.mix('#a9794a', '#7a7266', k * 1.4),
      paper: U.mix('#ecd9ae', '#b5ab98', k * 1.5),
    };
  }

  function defs() {
    const velvet = (a, b, c) => `<rect width="11" height="40" fill="${b}"/><rect width="3.2" height="40" fill="${a}"/><rect x="7.4" width="3.6" height="40" fill="${c}"/>`;
    const tin = (a, b, c) => `<rect width="6.4" height="40" fill="${b}"/><rect width="2.2" height="40" fill="${a}"/><rect x="4.4" width="2" height="40" fill="${c}"/>`;
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.62"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('Foot')}" gradientUnits="userSpaceOnUse" x1="0" y1="358" x2="0" y2="262">
        <stop offset="0" stop-color="#ffe6a6" stop-opacity="0.62"/><stop offset="0.4" stop-color="#ffd98a" stop-opacity="0.2"/><stop offset="1" stop-color="#ffc878" stop-opacity="0.04"/>
      </linearGradient>
      <linearGradient id="${id('Beam')}" gradientUnits="userSpaceOnUse" x1="324" y1="396" x2="216" y2="312">
        <stop offset="0" stop-color="#fff6d8" stop-opacity="0.5"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7ab98"/><stop offset="0.7" stop-color="#8f9478"/><stop offset="1" stop-color="#7a7f60"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef7fa"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('Paper')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.14"/><stop offset="0.25" stop-color="#000" stop-opacity="0"/></linearGradient>
      <pattern id="${id('Tin')}" width="6.4" height="40" patternUnits="userSpaceOnUse">${tin('#56689f', '#37497f', '#27365f')}</pattern>
      <pattern id="${id('TinOld')}" width="6.4" height="40" patternUnits="userSpaceOnUse">${tin('#a89a8a', '#8d7f70', '#6f6254')}</pattern>
      <pattern id="${id('Velvet')}" width="11" height="40" patternUnits="userSpaceOnUse">${velvet('#d64a52', '#b32c3a', '#7e1a28')}</pattern>
      <pattern id="${id('VelvetOld')}" width="11" height="40" patternUnits="userSpaceOnUse">${velvet('#ac8a84', '#94766f', '#745a56')}</pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <clipPath id="${id('Open')}"><path d="${OPEN_D}"/></clipPath>
      <clipPath id="${id('Back')}"><rect x="${BACK.x0}" y="${BACK.y0}" width="${BACK.x1 - BACK.x0}" height="${BACK.y1 - BACK.y0}"/></clipPath>
      <clipPath id="${id('Mirror')}"><circle cx="${GLASS.x}" cy="${GLASS.y}" r="${GLASS.r}"/></clipPath>
      <clipPath id="${id('Front')}"><path d="${FRONT_D}"/></clipPath>
      <clipPath id="${id('Roof')}"><path d="${ROOF_D}"/></clipPath>
    </defs>`;
  }

  // ---------------------------------------------- sky, the hill and the lane
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect y="-4" width="400" height="320" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="346" cy="64" r="46" fill="${url('Sun')}"/><circle cx="346" cy="64" r="17" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="172" cy="62" rx="25" ry="10"/><ellipse cx="191" cy="55" rx="17" ry="12"/><ellipse cx="209" cy="63" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="42" cy="44" rx="19" ry="7"/><ellipse cx="57" cy="39" rx="13" ry="9"/><ellipse cx="71" cy="45" rx="14" ry="6"/></g>`;
  }
  // the hill behind the village and the old tree over the lean-to
  function far() {
    const h = HILL[SEASON];
    let s = `<path d="M-6 210 Q70 176 170 198 T410 182 V330 H-6Z" fill="${h[0]}"/><path d="M-6 262 Q120 232 250 250 T410 236 V340 H-6Z" fill="${h[1]}"/>`;
    // a few roofs of the village beyond the lane
    const wall = winter() ? '#dfe4ea' : '#e9dcc4', tile = winter() ? '#e9eef3' : SEASON === 'autumn' ? '#b5764e' : '#c58a62';
    for (const [x, y, w, hh] of [[346, 276, 26, 22], [374, 268, 30, 28]]) s += `${box(x, y, w, hh + 40, wall)}${shape(`M${x - 3} ${y} L${x + w / 2} ${y - 13} L${x + w + 3} ${y}Z`, tile)}${box(x + 7, y + 7, 5, 7, '#7f93a8')}`;
    const t = TREE[SEASON], X = 372, Y = 334;
    s += `${shape(`M${X - 6} ${Y} Q${X - 3} 276 ${X - 8} 236 H${X + 2} Q${X + 3} 276 ${X + 7} ${Y}Z`, '#6f5a48')}${line(`M${X - 2} 262 Q${X - 18} 244 ${X - 26} 214 M${X} 248 Q${X + 12} 226 ${X + 22} 206 M${X - 4} 238 Q${X - 8} 214 ${X - 4} 192`, '#6f5a48', 3)}`;
    if (t) {
      s += ovals([[X - 24, 218, 26, 24], [X + 18, 212, 26, 26], [X - 4, 196, 30, 26]], t[0]);
      s += ovals([[X - 30, 208, 13, 10], [X + 8, 188, 15, 11], [X + 28, 206, 11, 9], [X - 8, 216, 14, 10]], t[1], 0.9);
      s += ovals([[X - 14, 236, 16, 8], [X + 16, 232, 14, 8]], t[2], 0.9);
    } else {
      s += line(`M${X - 26} 214 q-10 -8 -12 -18 M${X - 18} 232 q-12 -2 -20 -6 M${X + 22} 206 q4 -10 12 -14 M${X + 12} 226 q12 -2 18 -8 M${X - 4} 192 q-6 -10 -2 -20 M${X - 4} 196 q8 -6 10 -14`, '#7a6654', 1.6);
      s += line(`M${X - 34} 200 q6 -2 10 2 M${X + 14} 206 q8 -4 14 -2 M${X - 8} 186 q5 -3 10 0`, SNOW, 2, 0.9);
    }
    return s;
  }
  function ground() {
    const c = PAVE[SEASON], r = U.rng(311);
    let s = `${box(-6, 330, 412, 128, HILL[SEASON][2])}${box(-6, 456, 412, 38, c[0])}`;
    s += line('M-6 474 H406 M26 456 l-6 18 M78 456 l-6 18 M150 456 l-2 18 M214 456 l0 18 M278 456 l2 18 M342 456 l5 18 M396 456 l6 18 M52 474 l-7 19 M120 474 l-3 19 M184 474 l-1 19 M248 474 l1 19 M312 474 l4 19 M376 474 l6 19', c[1], 0.8);
    s += `${box(-6, 490, 412, 5, U.shade(c[1], -0.04))}${box(-6, 494, 412, 1.4, '#000', ' opacity="0.14"')}${box(-6, 495, 412, 50, c[2])}`;
    // the cobbles of the lane, bigger towards the bottom of the picture
    const pale = [], dark = [];
    for (let y = 499, row = 0; y < 544; row++) {
      const h = 3.2 + row * 0.5;
      for (let x = -6 + (row % 2) * 7; x < 410; x += h * 3.2) (r() < 0.55 ? pale : dark).push([x, y, h * 1.45, h * 0.72]);
      y += h * 1.5;
    }
    s += ovals(pale, U.shade(c[2], 0.16)) + ovals(dark, U.shade(c[2], -0.1));
    if (PCT < 0.45) {
      for (let i = 0; i < 12; i++) s += line(`M${f1(r() * 400)} ${f1(459 + r() * 32)} l-2 -4 m2 4 l0.6 -5 m-0.6 5 l2.4 -3.4`, '#6f8a3e', 1);
      s += ovals([[176, 462, 12, 3], [262, 480, 14, 3], [330, 466, 10, 2.4], [40, 484, 12, 3]], '#8a8f6a', 0.5);
    }
    if (winter()) {
      s += box(-6, 456, 412, 38, SNOW, ' opacity="0.82"') + box(-6, 495, 412, 50, SNOW, ' opacity="0.55"');
      s += line('M-6 522 Q120 510 216 524 T410 516', '#a7b0b9', 7, 0.16);
      for (let i = 0; i < 9; i++) s += oval(r() * 400, 462 + r() * 28, 14 + r() * 18, 1.8 + r() * 2.2, '#fff', 0.8);
    } else if (SEASON === 'autumn') for (let i = 0; i < 16; i++) s += leaf(r() * 400, 460 + r() * 76, r() * 180, U.pick(r, FALL), 3);
    return s;
  }
  // ----------------------------------------------------- the dressing room
  // Up under the roof: striped paper, a floor of boards, a dressing table
  function room() {
    const { x0, x1, y0, y1 } = ROOM, old = PCT < 0.4;
    let s = box(x0 - 8, y0 - 6, x1 - x0 + 16, y1 - y0 + 8, K.paper);
    for (let x = x0 - 6; x < x1 + 6; x += 14) s += box(x, y0 - 6, 7, y1 - y0 + 8, U.shade(K.paper, 0.32), ' opacity="0.7"');
    s += box(x0 - 8, y0 - 6, x1 - x0 + 16, y1 - y0 + 8, url('Paper'));
    // a picture rail and the skirting
    s += `${box(x0 - 8, y1 - 5, x1 - x0 + 16, 5, U.shade(K.timber, -0.12))}${box(x0 - 8, y1 - 5.6, x1 - x0 + 16, 1, K.gold, ' opacity="0.7"')}`;
    if (old) {
      s += `${shape('M214 198 q6 12 2 22 q-6 -4 -10 -2 q0 -10 8 -20Z', '#c3b89e')}${shape('M286 200 q-2 10 4 18 q6 -6 8 -4 q-2 -8 -12 -14Z', '#c3b89e')}`;
      s += ovals([[236, 212, 12, 5], [152, 204, 9, 4], [322, 236, 8, 6]], '#a39a84', 0.5);
    }
    // the dressing table
    s += `${box(148, 238.5, 62, 3.2, K.timber, ' rx="0.8"')}${box(148, 241.6, 62, 1.2, '#000', ' opacity="0.16"')}${box(151, 242, 3, 8, U.shade(K.timber, -0.2))}${box(204, 242, 3, 8, U.shade(K.timber, -0.2))}${box(156, 242, 15, 5, U.shade(K.timber, -0.1), ' rx="0.6"')}${dot(163.5, 244.4, 0.8, K.gold)}${box(185, 242, 15, 5, U.shade(K.timber, -0.1), ' rx="0.6"')}${dot(192.5, 244.4, 0.8, K.gold)}`;
    return s;
  }
  function mirror(st) {
    const p = pend(st, 'mirror'), ok = st.mirror, { x, y, r } = GLASS;
    const frame = ok ? '#e2b84e' : '#7d7464', dk = ok ? '#a87f2c' : '#5e5648';
    let s = `<g data-part="mirror">${box(x - 25, y - 25, 50, 50, '#000', ' fill-opacity="0"')}`;
    // the round glass and what it shows: the room, a little shine
    s += `<g clip-path="${url('Mirror')}">${dot(x, y, r, ok ? url('Glass') : url('Grime'))}`;
    if (ok) s += `${box(x - r, y + 7, r * 2, 10, '#c8a97a', ' opacity="0.55"')}${shape(`M${x - r} ${y + 6} L${x - 6} ${y - r} H${x + 2} L${x - r + 6} ${y + r}Z`, '#fff', ' opacity="0.5"')}${shape(`M${x + 6} ${y + r} L${x + r} ${y - 4} V${y + 6} L${x + 11} ${y + r}Z`, '#fff', ' opacity="0.34"')}`;
    else s += `${ovals([[x - 6, y - 5, 7, 5], [x + 6, y + 6, 8, 5], [x + 8, y - 8, 4, 3]], '#6f7458', 0.6)}${line(`M${x - 13} ${y - 9} L${x - 2} ${y + 1} L${x - 7} ${y + 13} M${x - 2} ${y + 1} L${x + 11} ${y - 2}`, '#e8e8dc', 0.7, 0.9)}`;
    if (p === 'grow') s += `${dot(x, y, r, url('Dusty'), 0.5)}${ovals([[x - 5, y - 4, 5, 3], [x + 6, y + 5, 6, 3]], '#fff8e8', 0.5)}`;
    else if (p === 'frost') s += dot(x, y, r, url('Frost'), 0.8);
    s += '</g>';
    s += `<circle cx="${x}" cy="${y}" r="${r + 1.6}" fill="none" stroke="${dk}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${r + 1.6}" fill="none" stroke="${frame}" stroke-width="2.6"/>`;
    // the bulbs round the frame
    const on = ok && !p;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26, bx = x + Math.cos(a) * GLASS.b, by = y + Math.sin(a) * GLASS.b;
      if (!ok && i % 3 === 1) { s += dot(bx, by, 0.9, '#5e5648'); continue; }
      s += on ? `${dot(bx, by, 2.5, '#fff3c4', 0.34)}${dot(bx, by, 1.7, '#fff8de')}` : dot(bx, by, 1.6, ok ? '#e9dfc4' : '#8f8878');
    }
    // the things on the table
    const pots = ok ? ['#e7a4b0', '#7cc3cf', '#f2c14e'] : ['#a59e90', '#8f8a78', '#a59e90'];
    s += `${box(154, 233, 6, 5.6, pots[0], ' rx="1"')}${box(153.4, 232, 7.2, 1.8, U.shade(pots[0], -0.2), ' rx="0.6"')}${box(196, 232, 4, 6.6, pots[1], ' rx="1"')}${box(197.2, 230, 1.6, 2.4, pots[1])}${oval(205, 236.8, 3.6, 1.8, pots[2])}`;
    if (!ok) s += `${oval(176, 238, 15, 1.2, '#8f8878', 0.8)}${line('M162 238 l6 -2', '#6f6658', 1)}`;
    return s + '</g>';
  }
  // the costume on its stand: bare and drab at first, a shower of sequins at the end
  function costume(st) {
    const p = pend(st, 'costume'), ok = st.costume, { x, y } = DUMMY;
    const wood = ok ? '#7a5336' : '#7a6e60', cloth = ok ? '#2f49a8' : '#8f8a8a', dk = U.shade(cloth, -0.26), lt = U.shade(cloth, 0.2);
    const skirt = `M${x - 6.5} 220 Q${x - 11} 234 ${x - 19} ${y - 7} Q${x} ${y - 2} ${x + 19} ${y - 7} Q${x + 11} 234 ${x + 6.5} 220Z`;
    const top = `M${x - 7.5} 203 Q${x - 4} 206 ${x} 206 Q${x + 4} 206 ${x + 7.5} 203 L${x + 6} 212 L${x + 6.5} 221 H${x - 6.5} L${x - 6} 212Z`;
    let s = `<g data-part="costume">${box(x - 22, 196, 44, 54, '#000', ' fill-opacity="0"')}${shadow(x, y - 1.4, 16, 1.6)}`;
    s += `${line(`M${x} ${y - 6} V${y - 2}`, wood, 2.2)}${line(`M${x - 9} ${y - 0.6} H${x + 9}`, wood, 2.2)}${box(x - 1.3, 198, 2.6, 6, wood)}${dot(x, 198, 2.2, wood)}`;
    s += `${shape(skirt, cloth)}${shape(`M${x + 1} 220 H${x + 6.5} Q${x + 11} 234 ${x + 19} ${y - 7} Q${x + 12} ${y - 4.6} ${x + 8} ${y - 4} Q${x + 3} 232 ${x + 1} 220Z`, dk, ' opacity="0.7"')}${shape(top, cloth)}${shape(`M${x + 2} 205.6 L${x + 7.5} 203 L${x + 6} 212 L${x + 6.5} 221 H${x + 2}Z`, dk, ' opacity="0.6"')}`;
    s += `${line(`M${x - 6} 220.4 H${x + 6}`, ok ? '#e8bd52' : '#6f6a68', 1.4)}${line(`M${x - 7.5} 203 Q${x} 208.6 ${x + 7.5} 203`, lt, 0.8)}`;
    // the sequins, in rows round the skirt and the bodice
    const r = U.rng(907), all = [];
    for (let i = 0; i < 74; i++) {
      const t = r(), w = U.lerp(6, 17, t * t * 0.3 + t * 0.7), yy = U.lerp(222, y - 8, t);
      all.push([x + (r() * 2 - 1) * w, yy]);
    }
    for (let i = 0; i < 16; i++) all.push([x + (r() * 2 - 1) * 5.6, 205.6 + r() * 14]);
    if (ok) {
      const list = p ? all.filter((_, i) => i % 5 < 2) : all;
      s += specks(list, '#f5d373', 1.4) + specks(list.filter((_, i) => i % 3 === 0), '#fff6d0', 0.9);
      if (!p) for (const [a, b, c] of [[x - 8, 232, ''], [x + 9, 240, ' b'], [x - 2, 214, ' c'], [x + 3, 226, ' b'], [x - 13, 241, ' c']]) s += `<path class="th-seq${c}" d="M${a} ${b - 3.6}L${a + 0.7} ${b - 0.7}L${a + 3.6} ${b}L${a + 0.7} ${b + 0.7}L${a} ${b + 3.6}L${a - 0.7} ${b + 0.7}L${a - 3.6} ${b}L${a - 0.7} ${b - 0.7}Z" fill="#fff8e0"/>`;
      else s += `${dot(x + 22, y - 2.4, 2.6, '#c9474f')}${line(`M${x + 21} ${y - 5} l1 3 M${x + 24} ${y - 4.6} l-1 2.6`, '#d8d4c8', 0.5)}`;
    } else {
      s += specks(all.filter((_, i) => i % 9 === 0), '#b5ab8a', 1.2);
      s += `${line(`M${x - 18} ${y - 8} l4 3 l3 -3 l4 4 M${x + 10} ${y - 5} l5 -3`, '#a59e90', 0.8)}${shape(`M${x + 7} ${y - 5} q3 -7 8 -3 l1 5 q-5 0 -9 -2Z`, FADE, ' opacity="0.6"')}`;
    }
    return s + '</g>';
  }
  // a wooden hat stand: the top hat on it, or a note and an empty hat box
  function hat(st) {
    const p = pend(st, 'hat'), ok = st.hat && !p, x = HATX, wood = st.hat ? '#7a5336' : '#7a6e60', y = 218;
    let s = `<g data-part="hat">${box(x - 16, 196, 32, 54, '#000', ' fill-opacity="0"')}${shadow(x, 249, 11, 1.4)}`;
    s += `${line(`M${x} 249 V${y}`, wood, 2.4)}${line(`M${x - 8} 249.4 L${x} 244 L${x + 8} 249.4`, wood, 2)}${line(`M${x - 7} 226 Q${x - 4} 226 ${x} 230 Q${x + 4} 226 ${x + 7} 226`, wood, 1.6)}${dot(x - 7.4, 225.6, 1.3, wood)}${dot(x + 7.4, 225.6, 1.3, wood)}`;
    if (ok) {
      // a scarf left on the peg, and the hat itself on top
      s += `${shape(`M${x + 7} 226 q3 8 1 16 l-3 -1 q1 -8 -1 -14Z`, K.red)}${shape(`M${x - 7.2} ${y - 16} Q${x} ${y - 18} ${x + 7.2} ${y - 16} L${x + 6.2} ${y - 1} H${x - 6.2}Z`, '#23233a')}${shape(`M${x + 2} ${y - 17} Q${x + 5} ${y - 17} ${x + 7.2} ${y - 16} L${x + 6.2} ${y - 1} H${x + 2}Z`, '#000', ' opacity="0.3"')}${box(x - 6.4, y - 5.6, 12.8, 3.4, '#c9303f')}${oval(x, y - 0.6, 12.4, 2.3, '#191a2c')}${oval(x, y - 1.2, 10.4, 1.4, '#34344e')}${line(`M${x - 4.6} ${y - 14.6} Q${x - 4} ${y - 9} ${x - 4.6} ${y - 6}`, '#fff', 0.8, 0.3)}`;
    } else {
      // a note on the wall with a big question mark, and the hat box with its lid off
      s += `<g transform="rotate(-5 ${x - 18} 210)">${box(x - 25, 201, 15, 18, '#fbf3df', ' rx="0.6"')}${dot(x - 17.6, 202.6, 1, K.red)}${serif(x - 17.6, 216, '?', 13, st.hat ? K.navy : '#8f8878')}</g>`;
      s += `${box(x + 8, 238, 16, 11, st.hat ? '#b98a54' : '#8f8878', ' rx="1"')}${oval(x + 16, 238, 8, 1.8, '#4a4038')}${box(x + 8, 243, 16, 1.2, K.red, ' opacity="0.7"')}${oval(x - 15, 247.6, 7.6, 2, st.hat ? '#a87a48' : '#7d7464')}`;
    }
    return s + '</g>';
  }

  // ----------------------------------------------------------- the stage
  // the wall round the opening, with its gold frame and the crest over it
  function proscenium() {
    const g = K.gold, gd = K.goldD;
    let s = `${box(HALL.x0 - 8, 250, 204, 124, K.navyD)}`;
    // the deep beam between the dressing room and the stage
    s += `${box(HALL.x0 - 8, 250, 204, 7, K.timber)}${box(HALL.x0 - 8, 256.4, 204, 1.2, '#000', ' opacity="0.28"')}`;
    for (let x = 146; x < 330; x += 23) s += box(x, 251.6, 5, 3.6, U.shade(K.timber, -0.22), ' rx="0.8"');
    s += shape('M144 374 V274 Q144 259 160 259 H312 Q328 259 328 274 V374 H322 V276 Q322 266 312 266 H160 Q150 266 150 276 V374Z', g);
    s += line('M147 372 V275 Q147 262.5 160 262.5 H312 Q325 262.5 325 275 V372', gd, 0.8);
    s += `${shape('M236 255 q9 0 13 8 q-5 5 -13 5 q-8 0 -13 -5 q4 -8 13 -8Z', g)}${dot(236, 262, 3.4, K.red)}${line('M224 262 q5 -6 12 -6 q7 0 12 6', gd, 0.7)}`;
    return s + box(150, 266, 172, 94, '#191e3c', ` clip-path="${url('Open')}"`);
  }
  // the cloth at the back: what was painted, or an old sagging sheet with holes
  function painted(x, y, w, h) {
    if (typeof PAINTINGS === 'undefined') return `${box(x, y, w, h, '#8fc0dc')}${shape(`M${x} ${y + h} V${y + h * 0.55} Q${x + w * 0.3} ${y + h * 0.3} ${x + w * 0.55} ${y + h * 0.6} T${x + w} ${y + h * 0.5} V${y + h}Z`, '#6fa268')}`;
    const k = PAINTED.backdrop || PAINTINGS.DEFAULT.mural, M = PAINTINGS.MOTIFS[k.m] || PAINTINGS.MOTIFS[PAINTINGS.DEFAULT.mural.m];
    // a wide picture fills the cloth; a square one keeps its shape in the middle,
    // below the pelmet, with its own sky and ground carried out to both sides
    if (M.w / M.h > 1.3) { const hh = Math.max(h, (w * M.h) / M.w); return PAINTINGS.svg(k, x, y + (h - hh) / 2, w, hh); }
    const pal = M.pals[Math.abs(+k.p | 0) % M.pals.length], side = h - 12, px = x + (w - side) / 2, py = y + 12;
    const reach = (vx, a, b) => {
      const c = M.cells.find((q) => q.pts.some(([u, v]) => u === vx && v === M.h));
      if (!c) return '';
      const top = py + (side * Math.min(...c.pts.filter(([u]) => u === vx).map(([, v]) => v))) / M.h;
      return box(a, top, b - a, y + h - top, pal[c.k]);
    };
    return box(x, y, w, h, pal[0]) + reach(0, x, px) + reach(M.w, px + side, x + w) + PAINTINGS.svg(k, px, py, side, side);
  }
  function backdrop(st) {
    const p = pend(st, 'backdrop'), ok = st.backdrop, { x0, x1, y0, y1 } = BACK, w = x1 - x0, h = y1 - y0;
    let s = `<g data-part="backdrop"><g clip-path="${url('Back')}">`;
    if (ok) {
      s += painted(x0, y0, w, h);
      s += box(x0, y0, w, h, url('Paper'));
    } else {
      s += `${box(x0, y0, w, h, '#b3a78f')}${shape(`M${x0} ${y0 + 42} Q${x0 + 40} ${y0 + 28} ${x0 + 70} ${y0 + 42} T${x1} ${y0 + 36} V${y1} H${x0}Z`, '#a39a7e', ' opacity="0.7"')}`;
      s += ovals([[x0 + 40, y0 + 22, 22, 11], [x0 + 98, y0 + 30, 18, 14], [x0 + 70, y0 + 54, 26, 7]], '#8f8470', 0.5);
      s += `${shape(`M${x0 + 84} ${y0 + 12} l5 12 l-3 12 l8 -8 l2 -14Z`, '#3b3a4a')}${line(`M${x0 + 30} ${y0} q2 24 -3 46 M${x0 + 110} ${y0} q-3 20 2 44`, '#7f755f', 0.8, 0.8)}`;
    }
    s += `</g>${box(x0 - 2, y0 - 1.6, w + 4, 3, '#4a4038')}${box(x0 - 2, y1 - 1.2, w + 4, 2.6, ok ? '#7a5336' : '#5e5648')}`;
    // when the season wants a new cloth, a clean roll of it waits at the side
    if (ok && p) s += `<g transform="rotate(7 288 332)">${box(283, 288, 7, 46, '#fbf3df', ' rx="3"')}${oval(286.5, 288, 3.5, 1.6, '#c9bb98')}${line('M285 300 V330', '#d8ccb0', 0.8)}</g>${box(268, 325, 8, 8, '#8fa3b8', ' rx="1"')}${line('M268 326 q4 -6 8 0', '#6f7a88', 0.7)}`;
    return s + '</g>';
  }
  // the boards, running towards the front of the stage, with the riser below them
  function boards(st) {
    const p = pend(st, 'stage'), ok = st.stage, B = BOARD, r = U.rng(617);
    const at = (u, v) => [U.lerp(U.lerp(B.bx0, B.bx1, u), U.lerp(B.fx0, B.fx1, u), v), U.lerp(B.by, B.fy, v)];
    const seam = (u, a = 0, z = 1) => { const q = at(u, a), w = at(u, z); return `M${f1(q[0])} ${f1(q[1])}L${f1(w[0])} ${f1(w[1])}`; };
    const wood = ok ? '#c99a5c' : '#8a7a66', dark = U.shade(wood, -0.34);
    let s = `<g data-part="stage">${shape(poly([at(0, 0), at(1, 0), at(1, 1.02), at(0, 1.02)]), wood)}`;
    let d = '';
    for (let i = 1; i < 16; i++) d += seam(i / 16);
    s += line(d, dark, 0.7, 0.8) + box(B.bx0, B.by, B.bx1 - B.bx0, 3.4, '#000', ' opacity="0.26"');
    // where one board ends and the next begins
    let e = '';
    for (let i = 0; i < 16; i++) { const v = 0.15 + ((i * 7) % 11) * 0.07, q = at(i / 16, v), w = at((i + 1) / 16, v); e += `M${f1(q[0])} ${f1(q[1])}L${f1(w[0])} ${f1(w[1])}`; }
    s += line(e, dark, 0.5, 0.7);
    if (ok) {
      // a warm shine down the middle
      s += shape(poly([at(0.34, 0), at(0.66, 0), at(0.7, 1), at(0.3, 1)]), '#fff', ' opacity="0.1"');
      if (p) for (const [u, v, w] of [[0.1, 0.2, 0.08], [0.7, 0.5, 0.1], [0.44, 0.1, 0.07]]) s += shape(poly([at(u, v), at(u + w, v), at(u + w, v + 0.5), at(u, v + 0.5)]), '#9a8a70', ' opacity="0.8"');
    } else {
      // boards gone, showing the dark under the stage, and two lying loose
      for (const [u, v, w, l] of [[0.14, 0.1, 0.07, 0.9], [0.46, 0, 0.09, 0.62], [0.74, 0.3, 0.06, 0.7]]) s += shape(poly([at(u, v), at(u + w, v), at(u + w, v + l), at(u, v + l)]), '#2a2430');
      s += `<g transform="rotate(-9 214 344)">${box(186, 342, 56, 3.4, '#9a8a70')}${box(186, 345, 56, 1, '#000', ' opacity="0.3"')}</g><g transform="rotate(14 296 340)">${box(272, 339, 42, 3, '#a3937a')}</g>`;
      for (let i = 0; i < 9; i++) { const q = at(r(), r()); s += dot(q[0], q[1], 0.6, '#3b3a3a'); }
    }
    // the front of the stage: panels with a gold line, or split and bare
    s += box(144, 356, 184, 17, ok ? K.navy : '#6f6a6a');
    s += `${box(144, 356, 184, 2, ok ? K.gold : '#8f8878')}${box(144, 371.6, 184, 2, '#000', ' opacity="0.28"')}`;
    for (let x = 150; x < 322; x += 29) s += `<rect x="${x}" y="360.6" width="24" height="9" rx="1" fill="none" stroke="${ok ? K.gold : '#55525a'}" stroke-width="0.8" opacity="0.75"/>`;
    if (!ok) s += `${shape('M206 358 l14 0 l-3 14 l-13 0Z', '#2a2430')}${line('M286 358 l-5 14 M170 358 l4 8', '#2f2c34', 1)}`;
    return s + '</g>';
  }
  // a chalk cross on the boards, where a prop should stand
  const chalk = (x, y, op = 0.9) => line(`M${x - 4} ${y - 1.6} L${x + 4} ${y + 1.6} M${x + 4} ${y - 1.6} L${x - 4} ${y + 1.6}`, '#fff8e8', 1, op);
  const table = (x, y) => `${shadow(x, y + 0.4, 12, 1.8)}${line(`M${x - 8} ${y - 15} L${x - 9} ${y} M${x + 8} ${y - 15} L${x + 9} ${y} M${x - 3} ${y - 15} L${x - 3.4} ${y - 2} M${x + 3} ${y - 15} L${x + 3.4} ${y - 2}`, '#6b4a30', 1.5)}${oval(x, y - 15.6, 11.4, 2.6, '#6b4a30')}${oval(x, y - 16.6, 11.4, 2.6, '#8f6540')}${box(x - 2.4, y - 24.6, 4.8, 7.6, '#e0b24e', ' rx="1"')}${shape(`M${x - 5.6} ${y - 25} L${x - 3} ${y - 31.4} H${x + 3} L${x + 5.6} ${y - 25}Z`, '#f3e0b0')}`;
  const chair = (x, y) => `${shadow(x, y + 0.4, 10, 1.6)}${line(`M${x - 6.4} ${y} V${y - 26} M${x + 6.4} ${y} V${y - 26}`, '#6b4a30', 1.8)}${box(x - 7, y - 28, 14, 4, '#6b4a30', ' rx="1.6"')}${box(x - 5.4, y - 24.4, 10.8, 10, K.red, ' rx="1"')}${box(x - 7.6, y - 12, 15.2, 4, '#c9303f', ' rx="1.2"')}${box(x - 7.6, y - 9, 15.2, 1.4, '#6b4a30')}`;
  const trunk = (x, y) => `${shadow(x, y + 0.4, 16, 1.8)}${box(x - 14, y - 15, 28, 15, '#8f5f38', ' rx="1.4"')}${shape(`M${x - 14} ${y - 14} Q${x} ${y - 23} ${x + 14} ${y - 14}Z`, '#a5703f')}${line(`M${x - 8} ${y} V${y - 18.6} M${x + 8} ${y} V${y - 18.6}`, '#e0b24e', 1.3)}${line(`M${x - 14} ${y - 14} H${x + 14}`, '#5e3e24', 0.9)}${box(x - 2, y - 15.6, 4, 3.4, '#e0b24e', ' rx="0.6"')}`;
  function props(st) {
    const p = pend(st, 'props'), ok = st.props, clean = ok && !p;
    let s = `<g data-part="props">${box(176, 310, 124, 44, '#000', ' fill-opacity="0"')}`;
    const marks = [[200, 350], [238, 344], [278, 350]];
    if (clean) return `${s}${table(200, 350)}${chair(238, 344)}${trunk(278, 350)}${chalk(200, 351.6, 0.5)}${chalk(278, 351.6, 0.5)}</g>`;
    s += marks.map(([x, y]) => chalk(x, y, ok ? 1 : 0.55)).join('');
    // everything in a heap at the side of the stage
    s += `<g transform="translate(-8 0)"><g transform="rotate(-6 276 340)">${box(258, 328, 26, 18, '#8a6a4a', ' rx="0.8"')}${line('M258 334 H284 M258 340 H284 M266 328 V346 M276 328 V346', '#6a4e36', 0.8)}</g>${box(280, 319, 15, 15, '#7a5e42', ' rx="0.8"')}${line('M280 325 H295 M288 319 V334', '#5e4632', 0.7)}`;
    s += `<g transform="rotate(158 248 332)">${line('M242 320 V344 M254 320 V344', '#6b4a30', 1.6)}${box(241, 330, 14, 3, '#8a6a58', ' rx="1"')}${box(242, 318, 12, 4, '#6b4a30', ' rx="1.4"')}</g>`;
    // under a dust sheet until the job is first done
    if (!ok) s += shape('M236 350 Q240 316 262 318 Q270 306 290 314 Q304 320 302 350 Q270 354 236 350Z', '#c9c2b2', ' opacity="0.93"') + line('M252 322 q4 12 -2 28 M276 318 q6 14 2 32 M292 322 q2 12 -2 28', '#a59e8e', 0.8);
    return `${s}</g></g>`;
  }
  // the red curtains: tied back with gold, or faded, limp and half fallen
  function curtains(st) {
    const p = pend(st, 'curtains'), ok = st.curtains, fill = url(ok ? 'Velvet' : 'VelvetOld');
    const gold = ok ? '#e6bd55' : '#8f866c', gd = ok ? '#a87f2c' : '#6f6654';
    let s = `<g data-part="curtains"><g clip-path="${url('Open')}">`;
    if (ok) {
      const left = 'M148 262 H194 C192 294 180 312 170 322 C164 334 164 346 167 360 H148Z', right = 'M324 262 H278 C280 294 292 312 302 322 C308 334 308 346 305 360 H324Z';
      s += `<g class="th-sway">${shape(left, fill)}${line('M194 262 C192 294 180 312 170 322 C164 334 164 346 167 360', '#7e1a28', 1.2)}</g><g class="th-sway b">${shape(right, fill)}${line('M278 262 C280 294 292 312 302 322 C308 334 308 346 305 360', '#7e1a28', 1.2)}</g>`;
      for (const [x, k] of [[168, 1], [304, -1]]) s += `${shape(`M${x - 19 * k} 323 Q${x - 6 * k} 330 ${x + 2 * k} 319 L${x + 3.4 * k} 323 Q${x - 7 * k} 336 ${x - 20 * k} 327Z`, gold)}${line(`M${x} 322 q${2.6 * k} 6 ${1 * k} 12`, gold, 1.4)}${shape(`M${x - 0.6 * k} 333 h${3.4 * k} l${0.8 * k} 6.6 h${-5 * k}Z`, gold)}`;
      if (p === 'grow') s += `${shape(left, FADE, ' opacity="0.5"')}${shape(right, FADE, ' opacity="0.5"')}`;
    } else {
      // the left one hanging straight, the right one come off its hooks at one end
      s += `${shape('M148 262 H176 Q172 292 178 318 Q174 336 180 360 H148Z', fill)}${shape('M324 262 H312 Q300 280 292 306 Q284 332 288 360 H324Z', fill)}`;
      s += `${shape('M292 306 Q270 330 280 360 H304 Q300 330 292 306Z', '#745a56', ' opacity="0.9"')}`;
      s += ovals([[160, 300, 2.4, 3.4], [168, 336, 1.8, 2.8], [156, 346, 2.6, 2], [312, 322, 2.6, 3.6], [298, 344, 2, 2.6]], '#2a2430', 0.85);
      s += line('M178 354 l-4 6 l6 -2 l-3 5 M286 352 l5 7 l-1 -6 l5 5', '#745a56', 1);
    }
    // the pelmet with its scallops and fringe
    let edge = 'M322 280', fringe = 'M322 280';
    for (let i = 0; i < 8; i++) { edge += ' q-10.75 8 -21.5 0'; fringe += ' q-10.75 8 -21.5 0'; }
    const pel = `M148 262 H324 V280 ${edge.slice(9)} H148Z`;
    if (ok) s += `${shape(pel, fill)}${box(148, 262, 176, 5, '#000', ' opacity="0.2"')}${line(`M322 280 ${fringe.slice(9)}`, gold, 2)}${line(`M322 276 ${fringe.slice(9)}`, gd, 0.6)}`;
    else s += `<g transform="rotate(3 150 266)">${shape(pel, fill)}${line(`M322 280 ${fringe.slice(9)}`, gold, 1.2, 0.8)}</g>${shape('M232 267 l10 0 l-2 16 l-5 -6 l-4 8Z', '#191e3c')}`;
    return s + '</g></g>';
  }
  // the row of little brass hoods along the front of the stage
  function footlights(st) {
    const ok = st.stage, c = ok ? '#e0b24e' : '#7d7464';
    let s = '<g data-part="stage">';
    FEET.forEach((x, i) => {
      if (!ok && i % 3 === 2) return;
      const lit = ok && NIGHT;
      s += `${dot(x, 355.4, 1.9, lit ? '#fff6d8' : ok ? '#f6e4b0' : '#8f8878')}${shape(`M${x - 6} 358 q1 3 6 3 q5 0 6 -3Z`, c)}${shape(`M${x - 6} 358 q6 2 12 0 l-1 -1 q-5 1.6 -10 0Z`, U.shade(c, 0.3))}`;
    });
    return s + '</g>';
  }
  // ----------------------------------------------------------- the stalls
  function stallsFloor(st) {
    const y0 = 372, y1 = HALL.floor;
    let s = `${box(134, 368, 204, 80, K.navyD)}${shape(poly([[144, y0], [328, y0], [334, y1], [138, y1]]), '#5e4230')}`;
    let d = '';
    for (const y of [380, 390, 402, 416, 432]) d += `M134 ${y}H338`;
    s += line(d, '#46301f', 0.7, 0.8);
    // the carpet down the middle
    s += shape(poly([[226, y0], [246, y0], [253, y1], [219, y1]]), st.seats ? '#9c2433' : '#7a5a52');
    s += line(`M226 ${y0} L219 ${y1} M246 ${y0} L253 ${y1}`, st.seats ? K.gold : '#8f8470', 0.8, 0.8);
    return s;
  }
  // the seats from behind, row by row, either side of the carpet
  function seats(st) {
    const p = pend(st, 'seats'), ok = st.seats, r = U.rng(733), { cx } = HALL;
    const col = ok ? '#b32c3a' : '#8a6f6a', lt = ok ? '#d04a55' : '#a58a84', dk = ok ? '#7e1a28' : '#62504c', wood = ok ? '#4a2e22' : '#4e4640';
    let s = '<g data-part="seats">', spots = [];
    ROWS.forEach(({ top, h, w }, row) => {
      const gap = 11 + row * 2.2, n = 5;
      for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
        const x = side < 0 ? cx - gap - (i + 1) * w : cx + gap + i * w, b = w - 1.6;
        const gone = !ok && r() < 0.14, tipped = !ok && !gone && r() < 0.14;
        s += `${box(x - 0.6, top + 2, w - 0.4, h + 8, wood, ' rx="1"')}`;
        if (gone) { s += `${box(x + 1, top + 6, b - 2, h, '#5a463c', ' rx="1"')}${line(`M${f1(x + 2)} ${top + 7} l${f1(b - 4)} 5`, '#7a6a5a', 0.8)}`; continue; }
        const t = tipped ? top + 3 : top;
        s += `${box(x, t, b, h + 3, col, ' rx="3.4"')}${box(x + 0.8, t + 0.8, b - 1.6, 3.2, lt, ' rx="1.6" opacity="0.85"')}${box(x + b - 2.8, t + 1, 2.8, h + 2, dk, ' rx="1.4" opacity="0.7"')}`;
        if (ok) s += dot(x + b / 2, t + h - 3.4, 0.9, K.gold) + (p === 'grow' ? box(x, t, b, h + 3, FADE, ' rx="3.4" opacity="0.42"') : '');
        else if (r() < 0.4) s += oval(x + b / 2 + (r() - 0.5) * 6, t + h / 2 + (r() - 0.5) * 4, 2.6 + r() * 2.4, 1.8 + r() * 1.6, '#cfc6b6', 0.85);
        spots.push([x + b / 2, t + h / 2]);
      }
    });
    if (!ok) {
      // an old dust sheet over one end of the rows
      s += `${shape('M262 386 Q290 376 322 386 Q330 402 334 422 Q306 416 270 424 Q258 402 262 386Z', '#c9c2b2', ' opacity="0.9"')}${line('M280 382 q-4 18 2 40 M304 382 q2 18 8 36', '#a59e8e', 0.8)}`;
    } else if (p === 'grow') {
      // dusty rows with sweet papers left on them
      const c = ['#f2c14e', '#e7a4b0', '#7cc3cf'];
      spots.filter((_, i) => i % 5 === 1).forEach(([x, y], i) => { s += `<g transform="rotate(${(i * 47) % 90} ${f1(x)} ${f1(y)})">${box(x - 2.6, y - 1.5, 5.2, 3, c[i % 3], ' rx="0.5"')}</g>`; });
    }
    return s + '</g>';
  }
  // the cut through the floor and the far wall of the hall
  function section(st) {
    let s = `${box(130, HALL.floor, 212, 13, '#a5664a')}${box(130, HALL.floor, 212, 2.6, '#5e3e2c')}`;
    let d = '';
    for (let y = 452.4; y < 460; y += 3.4) d += `M130 ${f1(y)}H342`;
    for (let x = 134; x < 342; x += 13) d += `M${x} 449V452.4M${x + 6.5} 452.4V455.8M${x} 455.8V459`;
    s += line(d, '#cfb79c', 0.6, 0.7);
    // where the long wall has been taken away, its cut ends stand at both sides
    s += `${box(330, 192, 10, 266, K.stone)}${box(330, 192, 2, 266, '#000', ' opacity="0.16"')}${box(134, 192, 8, 266, K.stone)}${box(140, 192, 2, 266, '#000', ' opacity="0.16"')}`;
    let b = '';
    for (let y = 196; y < 456; y += 10) b += `M330 ${y}h10M134 ${y}h8`;
    s += line(b, U.shade(K.stone, -0.2), 0.6);
    // a bucket in the aisle while the roof lets the rain in
    if (!st.roof) s += `${shape('M231 436 h10 l-1.4 10 h-7.2Z', '#8f9aa4')}${oval(236, 436, 5, 1.5, '#5e6a78')}${line('M231 436 q5 -7 10 0', '#6f7a84', 0.7)}${line('M236 396 v5 M236 410 v4 M236 424 v5', '#a9cbd8', 1, 0.8)}`;
    return s;
  }

  // -------------------------------------------------------------- the roof
  function roof(st) {
    const p = pend(st, 'roof'), ok = st.roof, r = U.rng(809);
    const D = ROOF_D, LEAN = 'M340 302 H396 L404 334 H334Z';
    const tin = url(ok ? 'Tin' : 'TinOld');
    let s = '<g data-part="roof">';
    // the vent on the ridge and the stove pipe
    s += `${box(232, 104, 30, 15, ok ? K.navy : '#7f7263')}${shape('M226 105 L247 94 L268 105Z', ok ? '#56689f' : '#8d7f70')}${line('M236 108 H258 M236 111.6 H258 M236 115 H258', ok ? '#1f2a50' : '#55493e', 1)}`;
    s += `${box(303, 92, 6, 40, ok ? '#3a3f55' : '#6f6258')}${shape('M299 92 L306 84 L313 92Z', ok ? '#2a2e40' : '#5e5248')}`;
    if (PCT >= 0.8 && (SEASON === 'autumn' || winter())) s += `<g class="smoke" transform="translate(304 84)"><circle cx="0" cy="-20" r="4" fill="#e6e4e0"/><circle cx="3" cy="-24" r="3" fill="#e6e4e0"/><circle cx="-2" cy="-28" r="3.4" fill="#e6e4e0"/></g>`;
    if (PCT > 0.45) s += `${line('M247 94 V68', '#8a8f90', 1.2)}${dot(247, 67, 1.4, K.gold)}${shape('M247 69 q8 1.6 15 -0.6 l-3 3.2 l3 3.4 q-7 2 -15 0.4Z', K.red)}`;
    s += shape(D, tin);
    // the laps between the sheets, with a row of nails along each
    let lap = '', nail = [];
    for (const [y, a, b] of [[144, 131, 349], [170, 126, 354]]) { lap += `M${a} ${y}H${b}`; for (let x = a + 6; x < b; x += 12.8) nail.push([x, y + 1.6]); }
    s += `${line(lap, ok ? '#1f2a50' : '#55493e', 1)}${specks(nail, ok ? '#8fa0c8' : '#54483e', 1)}`;
    if (ok) s += shape('M136 118 H346 L348 130 H134Z', '#fff', ' opacity="0.1"');
    else {
      // rust, a hole or two, a sheet that has lifted and a plank laid over the worst
      const rust = [], deep = [];
      for (let i = 0; i < 26; i++) (r() < 0.5 ? rust : deep).push([136 + r() * 212, 124 + r() * 66, 6 + r() * 16, 3 + r() * 8]);
      s += `<g clip-path="${url('Roof')}">${ovals(rust, '#a8562a', 0.62)}${ovals(deep, '#8a4526', 0.55)}</g>`;
      s += shape('M186 140 l13 -3 l6 12 l-4 11 l-12 -2Z', '#23202a') + shape('M280 160 l11 -2 l4 10 l-12 3Z', '#23202a');
      s += `${shape('M314 150 L348 150 L358 196 L324 200Z', '#000', ' opacity="0.3"')}<g transform="rotate(-7 322 194)">${shape('M316 152 L350 152 L358 196 L324 196Z', tin)}${line('M316 152 L350 152', '#c9bcab', 1.2)}</g>`;
      s += `<g transform="rotate(5 232 150)">${box(206, 147, 62, 6, '#8f7a5e')}${box(206, 152, 62, 1.4, '#000', ' opacity="0.3"')}</g>`;
    }
    s += `${box(133, 113.6, 216, 5.4, ok ? '#47588f' : '#7f7263', ' rx="1.4"')}${box(133, 118, 216, 1, '#000', ' opacity="0.2"')}`;
    // the lean-to has a small roof of its own
    s += `${shape(LEAN, tin)}${box(339, 300, 58, 3.4, ok ? '#47588f' : '#7f7263', ' rx="1"')}`;
    if (!ok) s += ovals([[360, 316, 12, 6], [388, 322, 8, 5], [348, 326, 7, 3]], '#a8562a', 0.6);
    // the gutters
    const gut = ok ? K.navyD : '#5e5248';
    s += `${box(120, 195, 240, 4.6, gut, ' rx="1.4"')}${box(333, 333.4, 72, 3.6, gut, ' rx="1"')}`;
    if (!ok) s += `${shape('M326 195 l36 3 l-2 4 l-34 -3Z', gut)}${line('M300 199 q2 5 0 8 M152 199 q-2 4 0 6', '#6f8a3e', 1.6, 0.8)}`;
    if (p === 'snow') s += `${shape(D, url('Snow'))}${shape(LEAN, url('Snow'))}${shape('M130 112 H352 V120 H130Z', SNOW)}`;
    else if (winter()) s += `${shape('M133 113 H349 L352 136 Q320 142 296 134 T232 138 T168 132 T129 140Z', SNOW)}${shape('M120 196 Q240 186 360 196 V199 H120Z', SNOW)}${shape('M340 302 H396 L399 314 Q370 320 336 314Z', SNOW)}`;
    else if (p === 'leaves') s += `${shape('M126 168 H354 L358 196 H122Z', url('Leaves'))}${shape('M170 124 q30 8 40 22 q-30 -2 -40 -22Z M280 130 q24 6 30 18 q-24 0 -30 -18Z', url('Leaves'))}`;
    else if (p === 'grow') s += ovals([[166, 186, 16, 5], [226, 190, 22, 5], [310, 188, 20, 6], [266, 160, 12, 4], [192, 146, 10, 3.4], [352, 324, 10, 4]], '#6f8a3e', 0.72);
    return s + '</g>';
  }

  // --------------------------------------------------- the lean-to at the end
  function leanTo() {
    let s = `${box(340, 332, 54, 126, K.cream)}`;
    let d = '';
    for (let y = 340; y < 458; y += 9) d += `M340 ${y}H394`;
    s += line(d, U.shade(K.cream, -0.16), 0.8);
    s += `${box(340, 334, 54, 7, url('Shade'), ' opacity="0.6"')}${box(390.6, 332, 3.4, 126, U.shade(K.cream, -0.14))}`;
    if (PCT < 0.4) s += `${ovals([[356, 356, 8, 12], [384, 412, 6, 16]], '#a39a84', 0.5)}${line('M348 345 l5 13 l-4 9 M388 352 l-5 12', '#7d6a5e', 0.8, 0.8)}`;
    return s;
  }
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door, { x0, x1, y0, y1 } = DOOR, w = x1 - x0, h = y1 - y0;
    const col = ok ? C.theatreDoor : U.mix(C.theatreDoor, '#a59e90', 0.62), dk = U.shade(col, -0.28), lt = U.shade(col, 0.16);
    const brass = ok ? '#d9a93a' : '#8a8576';
    let s = `<g data-part="door">${box(x0 - 4, y0 - 4, w + 8, h + 4, K.stone)}${box(x0 - 2, y0 - 2, w + 4, h + 2, U.shade(K.stone, -0.22))}${box(x0, y0, w, h, col)}`;
    // two long panels and a short one with a square of glass
    for (const [a, b, c, e] of [[x0 + 5, y0 + 6, w - 10, 16], [x0 + 5, y0 + 27, w - 10, 18], [x0 + 5, y0 + 50, w - 10, 17]]) s += `${box(a, b, c, e, dk, ' rx="0.8"')}${box(a + 1.2, b + 1.2, c - 2.4, e - 2.4, lt, ' rx="0.6"')}`;
    s += `${box(x0 + 8, y0 + 8.6, w - 16, 11, ok ? '#fff0c8' : '#7f826c', ' rx="0.6"')}${line(`M${x0 + w / 2} ${y0 + 8.6} v11 M${x0 + 8} ${y0 + 14} h${w - 16}`, dk, 0.8)}`;
    s += `${dot(x1 - 5, y0 + 41, 2, brass)}${dot(x1 - 5.5, y0 + 40.4, 0.7, '#fff', 0.6)}${box(x0 + 11, y0 + 46, 10, 2, brass, ' rx="0.8"')}`;
    // the little brass plate and the step
    s += `${box(x0 - 7, y0 - 16, w + 14, 9.6, ok ? K.navy : '#8f8a80', ' rx="1"')}${text((x0 + x1) / 2, y0 - 9.2, ok ? 'STAGE DOOR' : 'ST GE DO R', 5.2, ok ? '#f2d98a' : '#c9c2b2', ' letter-spacing="0.3"')}`;
    s += `${box(x0 - 7, y1, w + 14, 6.4, K.stone, ' rx="0.8"')}${box(x0 - 7, y1 + 4, w + 14, 2.4, U.shade(K.stone, -0.2))}`;
    if (!ok) s += `${oval(x0 + 9, y0 + 26, 3.4, 5, '#d8cfbf', 0.75)}${oval(x1 - 7, y0 + 54, 3.4, 3, '#d8cfbf', 0.7)}${line(`M${x1 - 2} ${y0 + 2} l-7 8 M${x0 + 3} ${y1 - 2} l6 -9`, '#e8e4da', 0.5, 0.8)}`;
    if (p === 'grow') s += box(x0, y0, w, h, FADE, ' opacity="0.5"');
    else if (p === 'leaves') s += oval(x0 + 6, y1 + 1, 3.4, 1.5, FALL[0]) + oval(x1 - 8, y1 + 1, 3, 1.4, FALL[1]);
    if (winter() || p === 'snow') s += box(x0 - 7, y1 - 1, w + 14, 2.4, SNOW, ' rx="1.2"');
    return s + '</g>';
  }
  // the lamp over the stage door, on a curl of iron
  function lamp(st) {
    const { x, y } = LAMP, ok = st.door, iron = ok ? '#2a2e3c' : '#6a5242';
    return `${line(`M${x + 16} ${y - 13} H${x + 4} Q${x} ${y - 13} ${x} ${y - 9}`, iron, 1.3)}${shape(`M${x - 5.6} ${y - 4} L${x} ${y - 9.6} L${x + 5.6} ${y - 4}Z`, iron)}${box(x - 3.6, y - 4, 7.2, 8, ok ? '#ffefb8' : '#8f8a78')}${line(`M${x - 3.6} ${y - 4} V${y + 4} H${x + 3.6} V${y - 4}`, iron, 0.9)}`;
  }

  // ---------------------------------------------------------------- the front
  function front() {
    const old = PCT < 0.4, r = U.rng(953);
    let s = `<g clip-path="${url('Front')}">${box(0, 100, 140, 362, K.navy)}`;
    let d = '';
    for (let y = 112; y < 460; y += 8.6) d += `M0 ${f1(y)}H140`;
    s += line(d, K.navyD, 0.8, 0.9);
    // sunlight on the left of the boards, shadow at the corner
    s += `${box(8, 100, 7, 362, U.shade(K.navy, 0.14))}${box(127, 100, 7, 362, K.navyD)}`;
    if (old) {
      for (let i = 0; i < 16; i++) s += oval(12 + r() * 118, 150 + r() * 104, 4 + r() * 11, 1.6 + r() * 3.6, K.cream, 0.5);
      s += line('M20 210 l6 12 l-4 10 M118 232 l-6 10 l4 8', '#3a3f4e', 0.8, 0.8);
    }
    s += '</g>';
    // the gold line round the curly top
    s += `<path d="${FRONT_D}" fill="none" stroke="${K.gold}" stroke-width="2.4"/><path d="${FRONT_D}" fill="none" stroke="${K.goldD}" stroke-width="0.7" transform="translate(0.5 0.8)"/>`;
    if (winter()) s += shape('M6 151 Q8 139 18 140 H31 Q31 122 49 120 Q58 104 71 104 Q84 104 93 120 Q111 122 111 140 H124 Q134 139 136 151 Q126 146 118 146 H104 Q100 130 88 127 Q78 112 71 112 Q62 112 54 127 Q42 130 38 146 H24 Q12 146 6 151Z', SNOW);
    // a medallion with the two masks at the very top
    s += `${dot(71, 127, 12.4, K.gold)}${dot(71, 127, 10.4, K.navyD)}${mask(66.4, 126, 5.4, '#f7ecd2', '#2a2430', true)}${mask(76, 128, 5, K.red, '#fff0c8', false)}`;
    // the windows upstairs
    UPPER.forEach(([a, b]) => {
      const w = b - a, c = (a + b) / 2, y0 = 210, y1 = 250;
      s += `${shape(`M${a - 2} ${y1 + 1} V${y0 + w / 2} A${w / 2 + 2} ${w / 2 + 2} 0 0 1 ${b + 2} ${y0 + w / 2} V${y1 + 1}Z`, K.gold)}`;
      const glass = `M${a} ${y1} V${y0 + w / 2} A${w / 2} ${w / 2} 0 0 1 ${b} ${y0 + w / 2} V${y1}Z`;
      s += shape(glass, old ? url('Grime') : url('Glass'));
      if (!old) s += shape(`M${a + 4} ${y1} L${a + 15} ${y0 + 6} H${a + 21} L${a + 10} ${y1}Z`, '#fff', ' opacity="0.3"');
      s += line(`M${c} ${y0} V${y1} M${a} ${y0 + 22} H${b}`, K.navyD, 1.1);
      if (old) s += `<g transform="rotate(-11 ${c} 232)">${box(a - 3, 228, w + 6, 4, '#8f7a5e')}</g><g transform="rotate(9 ${c} 240)">${box(a - 3, 238, w + 6, 4, '#a08a6a')}</g>`;
    });
    return s;
  }
  // a little theatre mask, happy or sad
  function mask(x, y, r, col, line2, happy) {
    return `${shape(`M${x - r} ${y - r * 0.8} Q${x} ${y - r * 1.2} ${x + r} ${y - r * 0.8} Q${x + r * 1.1} ${y + r * 0.6} ${x} ${y + r * 1.2} Q${x - r * 1.1} ${y + r * 0.6} ${x - r} ${y - r * 0.8}Z`, col)}${oval(x - r * 0.42, y - r * 0.2, r * 0.22, r * 0.18, line2)}${oval(x + r * 0.42, y - r * 0.2, r * 0.22, r * 0.18, line2)}${line(happy ? `M${x - r * 0.46} ${y + r * 0.34} Q${x} ${y + r * 0.84} ${x + r * 0.46} ${y + r * 0.34}` : `M${x - r * 0.42} ${y + r * 0.66} Q${x} ${y + r * 0.26} ${x + r * 0.42} ${y + r * 0.66}`, line2, r * 0.17)}`;
  }
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign, { x, y, w, h } = SIGNB, cx = x + w / 2;
    const col = ok ? C.theatreSign : U.mix(C.theatreSign, '#a59e90', 0.66), tx = ok ? ink(col) : '#7a7468', edge = ok ? U.shade(col, -0.24) : '#7d7464';
    let s = `<g data-part="sign">${box(x + 1.6, y + 2, w, h, '#000', ' opacity="0.2" rx="3"')}${box(x, y, w, h, edge, ' rx="3"')}${box(x + 2, y + 2, w - 4, h - 4, col, ' rx="2"')}`;
    s += `<rect x="${x + 4.4}" y="${y + 4.4}" width="${w - 8.8}" height="${h - 8.8}" rx="1.4" fill="none" stroke="${tx}" stroke-width="0.7" opacity="0.65"/>`;
    s += serif(cx, y + 16.6, ok ? 'THE LITTLE' : 'T E LIT LE', 9.4, tx, ` letter-spacing="1.1"${ok ? '' : ' opacity="0.6"'}`);
    s += serif(cx, y + 33.6, ok ? 'THEATRE' : 'THE TRE', 17, tx, ` letter-spacing="1.3"${ok ? '' : ' opacity="0.6"'}`);
    s += text(cx, y + 44, '· TONIGHT ·', 6, tx, ` letter-spacing="1"${ok ? '' : ' opacity="0.42"'}`);
    s += `${mask(x + 15, y + 41.4, 3.6, tx, col, true)}${mask(x + w - 15, y + 41.4, 3.6, tx, col, false)}`;
    if (!ok) s += `${ovals([[x + 20, y + 12, 10, 3.4], [x + 74, y + 40, 12, 3.4], [x + 56, y + 8, 7, 2.4]], '#b5a68a', 0.85)}${line(`M${x + 42} ${y} l-3 16 l4 12 l-2 ${h - 28}`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5" rx="3"');
    else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.5" rx="3"');
    if (winter() || p === 'snow') s += box(x - 1, y - 2, w + 2, 3.4, SNOW, ' rx="1.6"');
    return s + '</g>';
  }
  // the marquee: a board of letters in a red frame with bulbs round it
  function marquee(st) {
    const p = pend(st, 'marquee'), ok = st.marquee, { x0, x1, y0, y1 } = MARQ, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
    const frame = ok ? K.red : '#8f7a74', board = ok ? '#fbf2dc' : '#b9b19f', letter = ok ? '#2a2430' : '#6a6458';
    let s = `<g data-part="marquee">${box(x0 + 6, y1, w - 12, 9, '#191e3c')}${box(x0 + 6, y1 + 8, w - 12, 1.4, '#000', ' opacity="0.3"')}`;
    s += `${box(x0, y0, w, h, U.shade(frame, -0.24), ' rx="3.4"')}${box(x0, y0, w, h - 2.4, frame, ' rx="3.4"')}${box(x0 + 9, y0 + 7, w - 18, h - 16, board, ' rx="1.4"')}`;
    // the three rails the letters hang on
    s += line(`M${x0 + 11} ${y0 + 20.6} H${x1 - 11} M${x0 + 11} ${y0 + 35.6} H${x1 - 11}`, ok ? '#c9b78e' : '#8f8878', 0.7);
    let [a, b] = BILL[SEASON];
    if (!ok) { a = 'TH  L TT E'; b = 'SH W'; } else if (p) { a = a.replace(/[A-Z]/g, (c, i) => (i % 2 ? ' ' : c)); b = b.replace(/[A-Z]/g, (c, i) => (i % 3 === 1 ? ' ' : c)); }
    s += `<text x="${cx}" y="${y0 + 19}" text-anchor="middle" font-family="${SERIF}" font-size="12.4" font-weight="700" letter-spacing="1.2" fill="${letter}" xml:space="preserve">${a}</text>`;
    s += `<text x="${cx}" y="${y0 + 34}" text-anchor="middle" font-family="${SERIF}" font-size="12.4" font-weight="700" letter-spacing="1.2" fill="${letter}" xml:space="preserve">${b}</text>`;
    if (!ok) s += `<g transform="rotate(24 104 ${y0 + 24})">${serif(104, y0 + 28, 'A', 12.4, letter)}</g>${ovals([[x0 + 30, y0 + 28, 14, 3], [x0 + 104, y0 + 12, 10, 2.4]], '#8f8878', 0.5)}`;
    // the bulbs round the frame
    const lit = ok && !p, n = 16;
    let glim = '', dead = [];
    for (let i = 0; i <= n; i++) for (const y of [y0 + 3.4, y1 - 5.4]) {
      const x = x0 + 5 + ((w - 10) * i) / n;
      if (lit) glim += `<circle class="th-glim" cx="${f1(x)}" cy="${y}" r="1.7" fill="#fff0b8"/>`;
      else if ((i + (y > y0 + 10 ? 1 : 0)) % 3) dead.push([x, y]);
    }
    for (let y = y0 + 11; y < y1 - 7; y += 8.4) for (const x of [x0 + 4.6, x1 - 4.6]) { if (lit) glim += `<circle class="th-glim" cx="${x}" cy="${f1(y)}" r="1.7" fill="#fff0b8"/>`; else dead.push([x, y]); }
    s += glim + specks(dead, '#6f6458', 2.6);
    if (p === 'grow') s += box(x0, y0, w, h, FADE, ' opacity="0.3" rx="3.4"');
    if (winter() || p === 'snow') s += box(x0 - 1, y0 - 2, w + 2, 3.6, SNOW, ' rx="1.8"');
    return s + '</g>';
  }
  // the open porch behind the marquee: its walls and the two doors
  function porch() {
    const F = FOY, c = '#232a52';
    let s = box(F.fx0 + 2, F.top, F.fx1 - F.fx0 - 4, F.fy - F.top + 1, c);
    s += `${shape(poly([[14, F.top], [F.bx0, F.in], [F.bx0, F.by], [F.fx0, F.fy]]), K.navyD)}${shape(poly([[126, F.top], [F.bx1, F.in], [F.bx1, F.by], [F.fx1, F.fy]]), K.navyD)}`;
    s += `${box(F.bx0, F.in, F.bx1 - F.bx0, F.by - F.in, K.navy)}${shape(poly([[14, F.top], [126, F.top], [F.bx1, F.in], [F.bx0, F.in]]), '#191e3c')}`;
    s += `${line(`M${F.bx0} ${F.in} V${F.by} M${F.bx1} ${F.in} V${F.by}`, K.gold, 0.8, 0.7)}`;
    // the doors in the back wall
    const boarded = PCT < 0.3;
    for (const x of [33, 91]) {
      s += `${box(x - 1, 342, 18, 62, K.gold)}${box(x, 343, 16, 61, K.red)}${dot(x + 8, 358, 4.6, K.gold)}${dot(x + 8, 358, 3.6, PCT < 0.4 ? '#6f7458' : '#ffe9b0')}${box(x + 3, 368, 10, 30, '#000', ' opacity="0.14" rx="1"')}${box(x + (x < 70 ? 12.4 : 1.4), 372, 2, 12, K.gold, ' rx="0.8"')}`;
      if (boarded) s += `<g transform="rotate(-8 ${x + 8} 380)">${box(x - 4, 376, 24, 4, '#8f7a5e')}</g><g transform="rotate(7 ${x + 8} 362)">${box(x - 4, 360, 24, 4, '#a08a6a')}</g>`;
    }
    // little pictures on the side walls
    s += `${shape(poly([[18, 346], [26, 350], [26, 376], [18, 376]]), K.gold)}${shape(poly([[19.4, 349], [24.6, 352], [24.6, 374.6], [19.4, 374.6]]), PCT < 0.4 ? '#a59e90' : '#e8a54a')}${shape(poly([[122, 346], [114, 350], [114, 376], [122, 376]]), K.gold)}${shape(poly([[120.6, 349], [115.4, 352], [115.4, 374.6], [120.6, 374.6]]), PCT < 0.4 ? '#a59e90' : '#7cc3cf')}`;
    return s;
  }
  // the tiled floor of the foyer, laid in a chequer
  function foyer(st) {
    const p = pend(st, 'foyer'), ok = st.foyer, F = FOY, r = U.rng(1021);
    const at = (u, v) => [U.lerp(U.lerp(F.bx0, F.bx1, u), U.lerp(F.fx0, F.fx1, u), v), U.lerp(F.by, F.fy, v)];
    const a = ok ? '#f5ead2' : '#a59e8c', b = ok ? '#a92a38' : '#6e625a', cols = 10, rows = 6;
    const vv = (j) => { const t = j / rows; return t * t * 0.42 + t * 0.58; };
    let d = '';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if ((i + j) % 2) d += poly([at(i / cols, vv(j)), at((i + 1) / cols, vv(j)), at((i + 1) / cols, vv(j + 1)), at(i / cols, vv(j + 1))]);
    let s = `<g data-part="foyer">${shape(poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)]), a)}${shape(d, b)}`;
    // a gold line round the edge of the floor
    s += `<path d="${poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)])}" fill="none" stroke="${ok ? K.gold : '#7d7464'}" stroke-width="1"/>`;
    if (!ok) {
      s += shape(poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)]), '#7f7560', ' opacity="0.42"');
      s += ovals([[32, 428, 16, 5], [106, 434, 16, 5], [70, 436, 22, 4]], '#8f8470', 0.62);
      s += line('M26 420 l10 8 l-3 12 M100 416 l8 10 l10 4 M66 438 l6 -8', '#3b3530', 0.8, 0.85);
    } else if (p === 'grow') {
      if (winter()) for (let i = 0; i < 7; i++) s += oval(26 + i * 15, 424 + (i % 3) * 5, 2.6, 1.3, '#8fa3b0', 0.6) + oval(32 + i * 15, 430 + (i % 2) * 5, 2.6, 1.3, '#8fa3b0', 0.5);
      else {
        const c = ['#f2c14e', '#7cc3cf', '#e7a4b0', '#c9e0a8'];
        for (let i = 0; i < 10; i++) { const q = at(r(), r() * 0.9 + 0.08); s += `<g transform="rotate(${(i * 53) % 90} ${f1(q[0])} ${f1(q[1])})">${box(q[0] - 2.6, q[1] - 1.5, 5.2, 3, c[i % 4], ' rx="0.6"')}</g>`; }
      }
    }
    return s + '</g>';
  }
  function booth(st) {
    const p = pend(st, 'booth'), ok = st.booth, { x, w, y0, y1 } = BOOTH;
    const panel = ok ? K.red : '#8a7570', gold = ok ? K.gold : '#8f866c', gd = ok ? K.goldD : '#6f6654', top = y0 + 16, sill = y0 + 54;
    let s = `<g data-part="booth">${shadow(x + 2, y1 + 0.8, w + 7, 2.8)}`;
    // the panels below the counter
    s += `${box(x - w, sill, w * 2, y1 - sill, panel, ' rx="1.4"')}${box(x - w, sill, 8, y1 - sill, U.shade(panel, 0.1))}${box(x + w - 6, sill, 6, y1 - sill, U.shade(panel, -0.2))}`;
    s += `<rect x="${x - w + 5}" y="${sill + 12}" width="${w * 2 - 10}" height="15" rx="1" fill="none" stroke="${gold}" stroke-width="0.9"/>`;
    s += `${box(x - 13, sill + 4.4, 26, 6.6, ok ? '#fbf2dc' : '#b9b19f', ' rx="0.8"')}${text(x, sill + 9.8, ok ? 'TICKETS' : 'TIC ETS', 5, ok ? K.red : '#7a7468', ' letter-spacing="0.4"')}`;
    // the glass, the room behind it, and the little brass grille
    s += `${box(x - w + 2, top, w * 2 - 4, sill - top, ok ? '#f6e4b4' : '#6a6458')}`;
    if (ok) s += `${box(x - w + 2, top + 22, w * 2 - 4, 1.6, '#a87f2c')}${dot(x - 7, top + 19, 3, '#f2c14e')}${dot(x - 7, top + 19, 1, '#a87f2c')}${dot(x + 1, top + 19, 3, '#e7a4b0')}${dot(x + 1, top + 19, 1, '#a87f2c')}${box(x + 7, top + 13, 5, 9, '#c9303f', ' rx="0.8"')}${shape(`M${x - 3} ${top + 8} q3 -5 6 0Z`, '#2a2430')}${line(`M${x} ${top} v4`, '#2a2430', 0.7)}${dot(x, top + 9, 1.6, '#fff8de')}`;
    else s += `${box(x - w + 2, top, w * 2 - 4, sill - top, url('Grime'), ' opacity="0.85"')}<g transform="rotate(-3 ${x} ${top + 20})">${box(x - 11, top + 12, 22, 12, '#d8cfbf', ' rx="1"')}${text(x, top + 20.4, 'SHUT', 7, '#8a4a44')}</g>`;
    if (p === 'frost') s += `${box(x - w + 2, top, w * 2 - 4, sill - top, url('Frost'), ' opacity="0.88"')}${line(`M${x - 13} ${sill - 1} q4 -8 2 -17 M${x - 11} ${sill - 8} l4 -3 M${x + 13} ${sill - 1} q-5 -7 -2 -16 M${x + 11} ${sill - 8} l-4 -2`, '#fff', 0.9)}`;
    else if (p === 'grow') {
      s += box(x - w + 2, top, w * 2 - 4, sill - top, url('Dusty'), ' opacity="0.42"');
      if (SEASON === 'autumn') for (let i = 0; i < 8; i++) s += line(`M${x - 13 + i * 3.8} ${top + 3 + ((i * 7) % 16)} v${2 + i % 3}`, '#eef6fa', 0.8, 0.85);
      else s += ovals([[x - 8, top + 12, 2.2, 3], [x - 3, top + 18, 2, 2.8], [x + 7, top + 14, 2.2, 3], [x + 3, top + 28, 2, 2.8]], '#fff8e8', 0.55);
    } else if (ok) s += shape(`M${x - 13} ${sill} L${x - 2} ${top} H${x + 4} L${x - 7} ${sill}Z`, '#fff', ' opacity="0.3"');
    if (!ok) s += line(`M${x + 6} ${top + 2} l-5 11 l5 6 l-4 8`, '#eef0e8', 0.7, 0.85);
    s += `${line(`M${x - w + 2} ${top} V${sill} M${x + w - 2} ${top} V${sill}`, gold, 2)}${box(x - w - 1.6, sill - 1, w * 2 + 3.2, 3.2, gold, ' rx="0.8"')}${box(x - w - 1.6, sill + 2, w * 2 + 3.2, 1, gd)}`;
    // a slot for the money, and the curved cap with a ball on top
    s += box(x - 7, sill - 4, 14, 3, ok ? '#7a5336' : '#4a4038', ' rx="0.8"');
    s += `${shape(`M${x - w - 2} ${top} Q${x - w - 2} ${y0 + 4} ${x} ${y0} Q${x + w + 2} ${y0 + 4} ${x + w + 2} ${top}Z`, panel)}${shape(`M${x + 2} ${y0 + 0.4} Q${x + w + 2} ${y0 + 4} ${x + w + 2} ${top} H${x + 6} Q${x + 8} ${y0 + 6} ${x + 2} ${y0 + 0.4}Z`, '#000', ' opacity="0.2"')}${box(x - w - 2, top - 1.6, w * 2 + 4, 2.6, gold, ' rx="0.8"')}${dot(x, y0 - 1.6, 2.4, gold)}`;
    return s + '</g>';
  }
  function steps(st) {
    const p = pend(st, 'steps'), ok = st.steps, r = U.rng(1109);
    const top = ok ? U.shade(K.stone, 0.24) : '#a39b8c', face = ok ? U.shade(K.stone, -0.12) : '#847c6e';
    let s = '<g data-part="steps">';
    STEPS.forEach(([y, a, b]) => {
      s += `${box(a, y, b - a, 7, top, ' rx="0.8"')}${box(a, y + 6, b - a, 7, face)}${box(a, y + 12, b - a, 1.2, '#000', ' opacity="0.14"')}`;
      if (ok) s += box(a, y + 5, b - a, 1.2, K.gold, ' opacity="0.8"');
    });
    if (ok) {
      // a red runner up the middle, held by brass rods
      for (const [y, a, b] of [[444, 46, 94], [456, 44, 96], [468, 42, 98]]) s += `${box(a, y, b - a, 13, '#a92a38')}${box(a, y + 6, b - a, 1.2, '#7e1a28')}${box(a - 1, y + 6.4, b - a + 2, 1, K.gold)}`;
    } else {
      s += `${shape('M100 444 l10 0 l-2 7 l-9 0Z M28 456 l9 0 l1 6 l-8 1Z', '#6f675a')}${line('M46 446 l5 9 l-3 9 l6 8 M116 458 l-6 9 l4 8 M18 448 l-3 12', '#4e483e', 0.9, 0.9)}`;
      s += ovals([[24, 450, 14, 3], [116, 462, 16, 3.4], [66, 474, 18, 3]], '#6f8a3e', 0.62);
      for (let i = 0; i < 8; i++) s += line(`M${f1(6 + r() * 130)} ${f1(445 + (i % 3) * 12)} l-1.4 -4 m1.4 4 l0.6 -5 m-0.6 5 l2 -3`, '#5f8a3a', 1);
    }
    if (p === 'leaves') for (let i = 0; i < 22; i++) s += leaf(4 + r() * 134, 445 + (i % 3) * 12 + r() * 5, r() * 180, U.pick(r, FALL), 3.2);
    else if (p === 'snow') STEPS.forEach(([y, a, b]) => { s += `${box(a - 1, y - 1.6, b - a + 2, 8.4, SNOW, ' rx="2"')}${box(a, y + 5, b - a, 3, '#e2ebf3', ' rx="1.4"')}`; });
    else if (winter()) STEPS.forEach(([y, a, b]) => { s += `${box(a, y - 0.6, 24, 3, SNOW, ' rx="1.4"')}${box(b - 24, y - 0.6, 24, 3, SNOW, ' rx="1.4"')}`; });
    else if (p === 'grow') s += ovals([[58, 450, 8, 1.6], [84, 462, 9, 1.8], [40, 474, 8, 1.6], [104, 450, 6, 1.4], [70, 474, 7, 1.5]], '#5e564c', 0.5);
    return s + '</g>';
  }
  // planks, a ladder and a skip of rubbish while the work is still at its start
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}">
      <g transform="rotate(-5 300 478)">${box(262, 470, 66, 16, '#8a7a5a')}${line('M262 476 H328 M262 481 H328 M284 470 V486 M306 470 V486', '#6a5c44', 0.9)}</g>
      <g transform="rotate(8 200 476)">${box(166, 472, 74, 3, '#a08a6a')}${box(170, 476, 66, 3, '#8f7a5e')}</g>
      ${oval(150, 478, 7, 3, '#7c6a5a')}${oval(150, 476, 5, 2, '#a39a84')}
      ${box(342, 470, 9, 12, '#8a8f90', ' rx="1"')}${oval(346.5, 470, 4.5, 1.3, '#a6aaab')}${line('M344.5 472 q-1 4 0 8', '#c9303f', 1.2, 0.7)}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g transform="translate(-40 28)"><rect x="338.5" y="484" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 340 480)">
      <rect x="316" y="470" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="340" y="483.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 340 488)"><rect x="313" y="484" width="54" height="10" fill="#d9534f"/><text x="340" y="492" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  // fairy lights looped along the top of the marquee and strung along its underside
  const LIGHTS = (() => {
    const { x0, x1, y0, y1 } = MARQ, bulbs = [], loops = 4, w = (x1 - x0) / loops, top = y0 - 11;
    let wire = '';
    for (let i = 0; i < loops; i++) {
      const a = x0 + i * w;
      wire += `M${f1(a)} ${top} Q${f1(a + w / 2)} ${top + 16} ${f1(a + w)} ${top}`;
      for (let k = 0; k < 6; k++) { const t = (k + 0.5) / 6; bulbs.push([a + w * t, top + 16 * t * (1 - t) * 2 + 1.6]); }
    }
    wire += `M${x0 + 8} ${y1 + 4} H${x1 - 8}`;
    for (let i = 0; i < 14; i++) bulbs.push([x0 + 12 + i * 8.9, y1 + 5.6]);
    return { wire, bulbs };
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const WARM = ['#ffe9b0', '#ffd98a', '#fff3c4', '#ffe2a0'];
  // the cat in its two poses: sitting on the steps, and stretched out on the pavement
  const FUR = '#3a3644';
  const DECOR = {
    // flags swung across the top of the porch, over the doors and the booth
    'lt-bunting': () => {
      const a = [16, 317], b = [124, 317], sag = 11, at = (t) => [U.lerp(a[0], b[0], t), a[1] + sag * 4 * t * (1 - t)];
      let s = line(`M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${a[1] + sag * 2} ${b[0]} ${b[1]}`, '#d8c9a8', 0.8);
      const cols = ['#c9303f', '#f4d27a', '#3f5aa8', '#fff6e6', '#e8a54a', '#7cc3cf'];
      for (let i = 1; i < 12; i++) { const [x, y] = at(i / 12); s += `<path class="th-flag" d="M${f1(x - 3.8)} ${f1(y)} H${f1(x + 3.8)} L${f1(x)} ${f1(y + 8.6)}Z" fill="${cols[i % 6]}"/>`; }
      return `<g>${s}</g>`;
    },
    // the theatre cat, sitting on the steps with its tail round its feet
    'lt-cat': () => {
      const x = 118, y = 457;
      if (RESTING && !NIGHT) return '';
      return `<g>${shadow(x + 1, y + 0.8, 10, 1.6)}<g class="th-breathe">${shape(`M${x - 7} ${y} Q${x - 9} ${y - 12} ${x - 3} ${y - 16} H${x + 3} Q${x + 9} ${y - 12} ${x + 7} ${y}Z`, FUR)}${oval(x, y - 8, 3, 5.4, '#f1ebdf')}${dot(x, y - 20, 5.6, FUR)}${shape(`M${x - 5.4} ${y - 22} l-0.6 -5 l4 2.6Z M${x + 5.4} ${y - 22} l0.6 -5 l-4 2.6Z`, FUR)}${dot(x - 2.2, y - 20.6, 1, '#f2c14e')}${dot(x + 2.2, y - 20.6, 1, '#f2c14e')}${dot(x, y - 18.4, 0.6, '#e7a4b0')}${winter() ? line(`M${x - 4.6} ${y - 15} q4.6 2.6 9.2 0`, '#c9303f', 2.2) : ''}</g><g class="th-tail">${line(`M${x + 6} ${y - 1} q8 1 6 -7 q-1 -4 2 -6`, FUR, 2.6)}</g></g>`;
    },
    // brass posts and a red rope along the pavement, for the queue
    'lt-rope': () => {
      const posts = [[160, 484], [204, 486], [248, 484]], red = '#b32c3a';
      let s = '';
      for (let i = 0; i < 2; i++) { const [a, b] = posts[i], [c, d] = posts[i + 1]; s += line(`M${a} ${b - 19} Q${(a + c) / 2} ${(b + d) / 2 - 3} ${c} ${d - 19}`, '#7e1a28', 3.2) + line(`M${a} ${b - 19.4} Q${(a + c) / 2} ${(b + d) / 2 - 3.4} ${c} ${d - 19.4}`, red, 2.2); }
      for (const [x, y] of posts) s += `${shadow(x + 1.6, y + 0.6, 6.4, 1.6)}${oval(x, y, 5, 1.8, '#a87f2c')}${box(x - 1.1, y - 21, 2.2, 21, '#e0b24e')}${box(x - 0.2, y - 21, 1.2, 21, '#fff', ' opacity="0.3"')}${dot(x, y - 22, 2.4, '#e0b24e')}${dot(x - 0.7, y - 22.8, 0.7, '#fff', 0.7)}`;
      return `<g>${s}</g>`;
    },
    // a fat roll of tickets on the counter, its end trailing down the booth
    'lt-ticket': () => {
      const x = BOOTH.x + 14, y = BOOTH.y0 + 50;
      let s = `${box(x, y + 1, 5, 26, '#f4b8c4', ' rx="0.4"')}`;
      for (let i = 1; i < 5; i++) s += line(`M${x} ${f1(y + 1 + i * 5.4)} h5`, '#c97a8a', 0.5);
      return `<g>${s}${dot(x + 1, y, 6, '#f4b8c4')}${dot(x + 1, y, 4.4, '#e792a4')}${dot(x + 1, y, 1.8, '#7a5336')}</g>`;
    },
    // a framed poster on the front between the upstairs windows
    'lt-poster': () => {
      const x = 58, y = 206, w = 26, h = 44, cx = x + w / 2;
      return `<g>${box(x + 1, y + 1.4, w, h, '#000', ' opacity="0.24"')}${box(x, y, w, h, '#e0b24e', ' rx="0.8"')}${box(x + 2, y + 2, w - 4, h - 4, '#fbf2dc')}${box(x + 2, y + 2, w - 4, 11, '#c9303f')}${text(cx, y + 10, 'TONIGHT', 4, '#fff6e0')}${mask(cx - 4.6, y + 22, 4.6, '#2a3360', '#fbf2dc', true)}${mask(cx + 4.6, y + 25, 4.2, '#c9303f', '#fbf2dc', false)}${line(`M${x + 6} ${y + 35} h${w - 12} M${x + 8} ${y + 38} h${w - 16}`, '#6b6157', 0.8)}</g>`;
    },
    // a gold star on the stage door
    'lt-star': () => {
      const x = (DOOR.x0 + DOOR.x1) / 2, y = DOOR.y0 + 36;
      return `<g>${star5(x + 0.6, y + 0.8, 9, '#00000033')}${star5(x, y, 9, '#e0b24e')}${star5(x, y, 5.4, '#f7dc8a')}</g>`;
    },
    // a gramophone by the doors of the foyer, on a little cabinet
    'lt-gramophone': () => {
      const x = 32, y = 430, b = '#7a5336';
      return `<g>${shadow(x + 1, y + 0.6, 12, 1.6)}${box(x - 9, y - 12, 18, 12, b, ' rx="0.8"')}${box(x - 9, y - 12, 18, 2, U.shade(b, 0.2))}<rect x="${x - 6}" y="${y - 8.6}" width="12" height="6.4" fill="none" stroke="#e0b24e" stroke-width="0.6"/>${oval(x - 1, y - 12.6, 6.4, 1.3, '#23233a')}${line(`M${x + 5} ${y - 13} V${y - 17} Q${x + 5} ${y - 20} ${x + 2} ${y - 20}`, '#e0b24e', 1)}<g transform="translate(${x + 3} ${y - 19}) rotate(-22) scale(0.86)">${shape('M-1.6 0 Q-2 -10 -9 -17 Q0 -21 9 -17 Q2 -10 1.6 0Z', '#e0b24e')}${oval(0, -17.2, 9, 3, '#8a6420')}${oval(0, -16.8, 6.6, 2, '#3a2a14')}</g></g>`;
    },
    // a spotlight on a tripod at the side of the stalls, turned towards the stage
    'lt-spotlight': () => {
      const x = 318, y = 442;
      return `<g>${line(`M${x} ${y - 36} L${x - 10} ${y} M${x} ${y - 36} L${x + 10} ${y} M${x} ${y - 36} V${y - 2}`, '#2a2e3c', 1.8)}<g transform="translate(${x} ${y - 40}) rotate(-142)">${box(-10, -6.4, 19, 12.8, '#2a2e3c', ' rx="1.6"')}${box(-13, -5, 3.4, 10, '#3f4560', ' rx="0.8"')}${box(9, -7.6, 3.4, 15.2, '#e0b24e', ' rx="0.8"')}</g>${dot(x, y - 40, 2.2, '#e0b24e')}</g>`;
    },
    // fairy lights round the marquee
    'lt-lights': () => `<g>${line(LIGHTS.wire, '#6b5c44', 0.7)}${LIGHTS.bulbs.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.5" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    // two string puppets hanging from a rail in the dressing room
    'lt-puppets': () => {
      const one = (x, coat, hair) => `<g class="th-puppet${x > 222 ? ' b' : ''}">${line(`M${x - 5} 201 L${x - 2} 215 M${x + 5} 201 L${x + 2} 215 M${x} 201 V212 M${x - 5} 201 L${x - 7} 221 M${x + 5} 201 L${x + 7} 221`, '#8f8878', 0.4)}${line(`M${x - 6} 201 H${x + 6}`, '#7a5336', 1.4)}${dot(x, 214, 3.2, '#f1cfa8')}${shape(`M${x - 3.4} 213 Q${x} 208.6 ${x + 3.4} 213Z`, hair)}${shape(`M${x - 3} 217 H${x + 3} L${x + 5} 230 H${x - 5}Z`, coat)}${line(`M${x - 3} 219 L${x - 7} 224 M${x + 3} 219 L${x + 7} 224`, coat, 1.6)}${line(`M${x - 2} 230 V237 M${x + 2} 230 V237`, '#2a2430', 1.4)}</g>`;
      return `<g>${line('M208 199 H234', '#7a5336', 1.2)}${line('M212 196 V199 M230 196 V199', '#7a5336', 0.8)}${one(214, '#c9303f', '#3a2a22')}${one(229, '#3f5aa8', '#d8ae4e')}</g>`;
    },
    // a little chandelier hanging in front of the stage
    'lt-chandelier': () => {
      const x = HALL.cx, y = 268, g = '#e8c05a';
      let s = `${line(`M${x} 257 V${y - 8}`, g, 1)}${dot(x, y - 7, 2.4, g)}${line(`M${x - 18} ${y - 2} Q${x - 10} ${y + 7} ${x} ${y + 2} Q${x + 10} ${y + 7} ${x + 18} ${y - 2} M${x - 9} ${y + 3} Q${x - 6} ${y - 3} ${x} ${y - 6} Q${x + 6} ${y - 3} ${x + 9} ${y + 3}`, g, 1.3)}`;
      for (const k of [-18, -9, 0, 9, 18]) s += `${box(x + k - 0.8, y - 7 + Math.abs(k) * 0.14, 1.6, 4.6, '#fff6e0')}${oval(x + k, y - 8 + Math.abs(k) * 0.14, 1, 1.6, '#ffdf8a')}`;
      for (const k of [-13, -5, 5, 13]) s += shape(`M${x + k} ${y + 5} l1.4 2.6 l-1.4 3 l-1.4 -3Z`, '#dff3f8');
      return `<g>${s}${shape(`M${x} ${y + 3} l1.8 3 l-1.8 4 l-1.8 -4Z`, '#dff3f8')}</g>`;
    },
    // an upright piano at the side of the stalls
    'lt-piano': () => {
      const x = 148, y = 396, w = 44, c = '#3a2420', lt = '#55362e';
      let s = `${shadow(x + w / 2 + 2, y + 1, w / 2 + 6, 2.4)}${box(x, y - 38, w, 38, c, ' rx="1.6"')}${box(x - 1, y - 40, w + 2, 3.4, lt, ' rx="1"')}${box(x + 3, y - 34, w - 6, 15, lt, ' rx="1"')}<rect x="${x + 6}" y="${y - 31.4}" width="${w - 12}" height="10" rx="1" fill="none" stroke="#e0b24e" stroke-width="0.6" opacity="0.8"/>`;
      s += `${box(x - 2, y - 18, w + 4, 7, '#2a1a16', ' rx="1"')}${box(x, y - 17, w, 4.6, '#fbf7ea')}`;
      let k = '';
      for (let i = 1; i < 22; i++) k += `M${f1(x + i * 2)} ${y - 17}v4.6`;
      s += line(k, '#b5ab98', 0.3);
      for (let i = 0; i < 21; i++) if (i % 7 !== 2 && i % 7 !== 6) s += box(x + 1.4 + i * 2, y - 17, 1.2, 2.8, '#2a1a16');
      s += `${box(x + 2, y - 11, 4, 11, lt)}${box(x + w - 6, y - 11, 4, 11, lt)}${dot(x + 8, y - 36, 1.4, '#e0b24e')}${dot(x + w - 8, y - 36, 1.4, '#e0b24e')}${box(x + 7.2, y - 43, 1.6, 4, '#fff6e0')}${box(x + w - 8.8, y - 43, 1.6, 4, '#fff6e0')}`;
      return `<g>${s}</g>`;
    },
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function life() {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M166 84 q4 -4 8 0 q4 -4 8 0 M198 96 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a sparrow on the marquee; a robin on the pavement in the cold
    if (PCT > 0.6 && !winter()) s += `<g class="th-hop">${oval(124, 254.2, 4.2, 2.8, '#8a6a52')}${dot(127.2, 251.8, 2, '#7a5a42')}${dot(127.8, 251.4, 0.5, '#222')}<path d="M129 252 l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${line('M123 257 v1.2 M125 257 v1.2', '#6b4a32', 0.5)}</g>`;
    if (winter() && PCT > 0.5) s += `<g class="th-hop">${oval(306, 476, 4.2, 3, '#8a6a52')}${oval(308.4, 476.8, 2.4, 2, '#d9603c')}${dot(309.4, 473.8, 2, '#8a6a52')}${dot(310, 473.4, 0.5, '#222')}<path d="M311.2 473.8 l1.8 0.5 l-1.8 0.4Z" fill="#3a3a3a"/>${line('M305 479 v1.6 M307 479 v1.6', '#6b4a32', 0.5)}</g>`;
    return s;
  }
  // a little life of its own when nothing is left to do this season: the theatre
  // cat stretching on the pavement; in the evening a moth round the lamp instead
  function rest() {
    if (NIGHT) return '';
    const x = 268, y = 480;
    const cat = `${shadow(x, y + 0.8, 19, 1.8)}${shape(`M${x - 16} ${y - 10} Q${x - 8} ${y - 15} ${x + 2} ${y - 12} Q${x + 12} ${y - 10} ${x + 13} ${y - 4} L${x + 13} ${y} H${x + 9} L${x + 7} ${y - 4} Q${x - 2} ${y - 3} ${x - 9} ${y - 4} L${x - 11} ${y} H${x - 15} L${x - 15} ${y - 5}Z`, FUR)}${oval(x - 15, y - 9, 2.6, 1.6, '#f1ebdf')}${dot(x + 14, y - 12, 5, FUR)}${shape(`M${x + 11} ${y - 15} l-0.4 -4.6 l3.8 2.6Z M${x + 16.6} ${y - 15.6} l1.8 -4 l1.6 3.8Z`, FUR)}${dot(x + 16, y - 12.6, 0.8, '#f2c14e')}${line(`M${x + 13} ${y - 10} q2 1.4 4 0`, '#f1ebdf', 0.7)}${line(`M${x - 15} ${y - 10} q-9 -5 -6 -15`, FUR, 2.6)}`;
    return `<g class="rest"><g class="rest-stretch"><g pointer-events="none">${cat}</g></g></g>`;
  }
  // the moth goes round the lamp, so it is drawn over the lamp's own light
  function moth() {
    const { x, y } = LAMP;
    return `<g class="rest"><g transform="translate(${x} ${y})"><g class="th-moth"><g class="th-wing">${shape('M0 0 Q-5 -4 -6 0 Q-5 3 0 1 Q5 3 6 0 Q5 -4 0 0Z', '#e8dcc2')}</g>${oval(0, 0.4, 0.8, 1.8, '#8a7a5e')}</g></g></g>`;
  }
  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#fbf2f4" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: the village goes dark and blue, and the footlights come on. The
  // stage, the dressing room, the booth and the marquee each keep their own light
  // once they are restored, and the lamp burns over the stage door.
  function night(st, decor) {
    const foot = st.stage, rm = st.mirror, bth = st.booth && !PEND.booth, board = st.marquee && !PEND.marquee, lampOn = st.door, win = PCT > 0.6;
    const { x0, x1, y0, y1 } = MARQ, R = ROOM, B = BOOTH, all = 'y="-4" width="400" height="548"';
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    let holes = '';
    if (foot) holes += `<path d="${OPEN_D}" fill="#1c1c1c"/>`;
    if (rm) holes += `<rect x="${R.x0}" y="${R.y0 + 6}" width="${R.x1 - R.x0}" height="${R.y1 - R.y0 - 6}" fill="#3a3a3a"/>`;
    if (board) holes += `<rect x="${x0 + 9}" y="${y0 + 7}" width="${x1 - x0 - 18}" height="${y1 - y0 - 16}" fill="#000"/>`;
    if (bth) holes += `<rect x="${B.x - B.w + 2}" y="${B.y0 + 16}" width="${B.w * 2 - 4}" height="38" fill="#000"/>`;
    let s = `<mask id="${id('Dark')}"><rect ${all} fill="#fff"/>${holes}</mask>
      <rect ${all} fill="#1b2350" opacity="0.58" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect ${all} fill="#24306a" opacity="0.2" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 34; i++) { const x = (i * 97) % 400, y = 6 + ((i * 53) % 96); s += `<circle class="star" cx="${x}" cy="${y}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`; }
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="353" cy="58" r="14" fill="#000"/></mask><circle cx="346" cy="64" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="346" cy="64" r="30" fill="#fff6d8" opacity="0.08"/>`;
    // the moon on the tin
    s += line('M136 118 H346', '#dfe6ff', 1.2, 0.3) + line('M122 196 H358', '#dfe6ff', 0.8, 0.14);
    if (win) for (const [a, b] of UPPER) { const w = b - a; s += `${shape(`M${a} 250 V${210 + w / 2} A${w / 2} ${w / 2} 0 0 1 ${b} ${210 + w / 2} V250Z`, '#ffd98a', ' opacity="0.7"')}${glow((a + b) / 2, 232, 30, 32)}`; }
    if (rm) {
      const { x, y } = GLASS;
      s += `${box(R.x0, R.y0 + 6, R.x1 - R.x0, R.y1 - R.y0 - 6, '#ffd98a', ' opacity="0.16"')}${glow(x, y, 70, 46)}${glow(254, 224, 54, 34)}`;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.26; s += dot(x + Math.cos(a) * GLASS.b, y + Math.sin(a) * GLASS.b, 1.7, '#fff8de'); }
    }
    if (foot) {
      // the footlights: a warm wash up the curtains and the cloth, and a spill over the first rows
      s += `<path d="${OPEN_D}" fill="${url('Foot')}"/>${glow(236, 350, 110, 26)}${glow(236, 384, 136, 52)}`;
      for (const x of FEET) s += `${dot(x, 355.4, 2.2, '#fff8de')}${glow(x, 354, 13, 10)}`;
    }
    if (decor['lt-chandelier']) s += `${specks([-18, -9, 0, 9, 18].map((k) => [HALL.cx + k, 260 + Math.abs(k) * 0.14]), '#fff3c4', 3)}${glow(HALL.cx, 266, 46, 34)}`;
    if (decor['lt-spotlight']) s += `${shape('M308 396 L196 342 L262 350Z', url('Beam'))}${oval(228, 346, 34, 5, '#fff6d8', 0.26)}`;
    if (bth) s += `${box(B.x - B.w + 2, B.y0 + 16, B.w * 2 - 4, 38, '#ffd98a', ' opacity="0.28"')}${glow(B.x, 380, 52, 56)}`;
    if (st.foyer) s += glow(70, 430, 66, 16);
    if (board) {
      let g = '';
      for (let i = 0; i <= 16; i++) for (const y of [y0 + 3.4, y1 - 5.4]) g += `<circle class="th-glim" cx="${f1(x0 + 5 + ((x1 - x0 - 10) * i) / 16)}" cy="${y}" r="1.9" fill="#fff6d0"/>`;
      s += `${g}${glow(71, 282, 104, 52)}${glow(71, 322, 74, 20)}${glow(71, 462, 96, 18)}`;
    }
    if (lampOn) s += `${box(LAMP.x - 3.6, LAMP.y - 4, 7.2, 8, '#ffe9b0', ' opacity="0.95"')}${glow(LAMP.x, LAMP.y, 34, 34)}${glow(LAMP.x, 456, 40, 8)}`;
    if (decor['lt-lights']) s += LIGHTS.bulbs.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${WARM[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${url('Glow')}"/>`).join('');
    if (RESTING) s += moth();
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    steps: [70, 462], foyer: [34, 428], seats: [236, 408], curtains: [172, 312], roof: [240, 152], booth: [70, 380], mirror: [178, 216], door: [366, 416], sign: [71, 174], stage: [236, 348],
    props: [238, 330], backdrop: [236, 304], costume: [254, 226], marquee: [71, 282], hat: [308, 208],
  };
  const PARTS = ['steps', 'foyer', 'seats', 'curtains', 'roof', 'booth', 'mirror', 'door', 'sign', 'stage', 'props', 'backdrop', 'costume', 'marquee', 'hat'];
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

  // st: map of restored part -> true; cols: chosen paint colours (theatreDoor,
  // theatreSign); opts as for LOFT.render: season, pending, uid, forSale, pct,
  // night, decor, resting, fresh, and painted (S.painted: { backdrop: { m, p } },
  // which may be missing; then the cloth shows a fixed picture)
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night; PAINTED = opts.painted || {}; RESTING = !!opts.resting; STAMP = `${SEASON.slice(0, 2)}${Math.round(PCT * 8)}`;
    const decor = opts.decor || {};
    palette({ theatreDoor: cols.theatreDoor || '#8c2f39', theatreSign: cols.theatreSign || '#d8ae4e' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house theatre">
      ${style()}${defs()}${sky()}${far()}${ground()}${room()}${mirror(st)}${costume(st)}${hat(st)}
      ${proscenium()}${backdrop(st)}${boards(st)}${props(st)}${curtains(st)}${footlights(st)}${stallsFloor(st)}${seats(st)}${section(st)}
      ${leanTo()}${door(st, C)}${lamp(st)}${roof(st)}${front()}${sign(st, C)}${porch()}${foyer(st)}${booth(st)}${marquee(st)}${steps(st)}${clutter()}${saleSign()}
      ${decorations(decor)}${life()}${opts.resting ? rest() : ''}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
