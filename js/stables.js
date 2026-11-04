'use strict';
// Foxglove Stables, drawn as SVG the same way as the cottage (house.js), the
// rescue and the curiosity shop. A little pony yard: a whitewashed stable block
// with three half-doors and a tack room at the end, an oak-boarded hay barn, a
// cobbled yard with a stone trough, and a paddock with two jumps and an old
// apple tree. One pony looks out over the middle door, another grazes in the
// paddock and a collie lies in the yard; all of them are perfectly content,
// whatever state the place is in. Each restorable part has a tired look and a
// restored look; the fence, the doors, the jumps and the sign take the colours
// chosen while painting. Every id carries an 'f' prefix (plus opts.uid when
// given) so this picture can share a page with the others.

const STABLES = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a seasonal
  // job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the id suffix,
  // whether the yard is still for sale, how far along it is, the colours worked
  // out from all that, evening, and a season with nothing to do here
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false, RESTING = false;
  const id = (n) => `f${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1, rot = 0) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}${rot ? ` transform="rotate(${rot} ${f1(x)} ${f1(y)})"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const text = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${col}"${more}>${s}</text>`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILL = { spring: ['#bcdca2', '#a3cd88'], summer: ['#a8d18d', '#8ebf73'], autumn: ['#dec281', '#caa866'], winter: ['#eef3f7', '#e1e9f0'] };
  const GRASS = {
    spring: ['#a3cf85', '#93c274', '#6f9a4f'], summer: ['#97c474', '#86b562', '#5f8a45'],
    autumn: ['#bcba70', '#abaa60', '#7d7f45'], winter: ['#eef3f7', '#e2eaf1', '#c9d6e0'],
  };
  // the big oak behind the roof
  const OAK = {
    spring: ['#a8d08e', '#bfe0a4', '#8fc06d'], summer: ['#5f9a4c', '#6aa858', '#4f8a3c'],
    autumn: ['#d9822b', '#e2a33c', '#c9692f'], winter: null,
  };
  const COBBLE = { spring: ['#c2b8a8', '#b3a998'], summer: ['#c9bea9', '#b9ad98'], autumn: ['#b3a898', '#a39886'], winter: ['#d4d9de', '#c4cbd2'] };

  // ---------------------------------------------------------------- shapes
  // the three half-doors: the left stands open, the middle has a pony looking
  // out over it, the right is shut
  const STALLS = [{ x0: 140, x1: 176 }, { x0: 190, x1: 226 }, { x0: 240, x1: 276 }];
  const TOP = 254, MID = 286, FOOT = 318;
  // the tack room at the end of the block
  const WIN = { x0: 298, x1: 346, y0: 254, y1: 292 };
  const TACKDOOR = { x0: 358, x1: 388, y0: 254 };
  // lanterns under the eaves, one over each stable door
  const LANTS = [158, 208, 258];
  const BARN_D = 'M4 206 L66 146 L128 206 V320 H4Z';
  const BARNDOOR = { x0: 38, x1: 94, y0: 246 };
  const YARD_D = 'M0 318 H400 V402 H0Z';
  const PADDOCK_D = 'M0 400 H400 V540 H0Z';
  const POSTS = [8, 46, 84, 122, 160, 240, 278, 316, 354, 392];

  // little css of our own: a wagging tail, a pony's ears and tail, a nod over
  // the door, swallows, hens pecking, foxgloves in the breeze
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .fs-wag{animation:fswag .8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:100% 100%}
      @keyframes fswag{from{transform:rotate(-11deg)}to{transform:rotate(13deg)}}
      #scene .fs-tail{animation:fstail 5.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes fstail{0%,68%,100%{transform:rotate(0)}76%{transform:rotate(10deg)}84%{transform:rotate(-8deg)}92%{transform:rotate(4deg)}}
      #scene .fs-ear{animation:fsear 5.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes fsear{0%,80%,100%{transform:rotate(0)}87%{transform:rotate(-15deg)}}
      #scene .fs-nod{animation:fsnod 8s ease-in-out infinite;transform-box:fill-box;transform-origin:72% 100%}
      @keyframes fsnod{0%,50%,100%{transform:rotate(0)}62%,74%{transform:rotate(-7deg)}}
      #scene .fs-flick{animation:fsflick 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes fsflick{0%,62%,100%{transform:rotate(0)}70%{transform:rotate(-20deg)}78%{transform:rotate(6deg)}}
      #scene .fs-breathe{animation:fsbreathe 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes fsbreathe{50%{transform:scaleY(1.05)}}
      #scene .fs-sway{animation:fssway 4.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes fssway{from{transform:rotate(-1.6deg)}to{transform:rotate(2deg)}}
      #scene .fs-peck{animation:fspeck 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:60% 80%}
      @keyframes fspeck{0%,70%,100%{transform:rotate(0)}76%,84%{transform:rotate(-34deg)}80%{transform:rotate(-20deg)}}
      #scene .fs-flit{animation:fsflit 6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes fsflit{0%{transform:translate(0,0)}40%{transform:translate(9px,-6px)}70%{transform:translate(-5px,-9px)}100%{transform:translate(4px,3px)}}
      #scene .fs-wing{animation:fswing .34s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes fswing{to{transform:scaleX(.35)}}
      #scene .fs-flame{animation:fsflame .9s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes fsflame{to{transform:scaleY(1.16) scaleX(.88)}}
      #scene .fs-glint{animation:fsglint 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes fsglint{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      wall: U.mix('#f6f0e3', '#c9c1b0', k * 1.6),
      oak: U.mix('#8a6240', '#857a6a', k * 1.2),
      oakDk: U.mix('#5f4029', '#5f574c', k),
      oakLt: U.mix('#b48a5e', '#a39a88', k),
      stone: U.mix('#d9cdb8', '#a8a090', k),
      plinth: U.mix('#a65a46', '#8f857a', k * 1.2),
      trim: U.mix('#3f6b4e', '#7d8079', k * 1.3),
    };
  }

  function defs() {
    const cb = COBBLE[SEASON], k = (1 - PCT) * 0.35, g = GRASS[SEASON];
    const slate = U.mix('#55606a', '#7d7f80', k);
    const boards = (base, old) => {
      const a = U.shade(base, 0.07), b = U.shade(base, -0.06), e = U.shade(base, -0.34);
      return `<rect width="30" height="60" fill="${base}"/><rect width="10" height="60" fill="${a}"/><rect x="20" width="10" height="60" fill="${b}"/>
        <path d="M0 0 V60 M10 0 V60 M20 0 V60" stroke="${e}" stroke-width="0.9" opacity="0.8"/>
        <path d="M4 14 q1.4 5 0 9 M15 36 q-1.2 5 0 10 M25 8 q1.2 4 0 8" stroke="${e}" stroke-width="0.5" opacity="0.5" fill="none"/>
        ${old ? `<circle cx="6" cy="44" r="1.6" fill="#6f8a3e" opacity="0.5"/><circle cx="24" cy="52" r="2" fill="#748f42" opacity="0.45"/><path d="M12 22 h6" stroke="#3b2a1a" stroke-width="0.7" opacity="0.4"/>` : ''}`;
    };
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
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('Water')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6dcef"/><stop offset="1" stop-color="#5f9fc4"/></linearGradient>
      <linearGradient id="${id('Ice')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef6fa"/><stop offset="1" stop-color="#b9d3df"/></linearGradient>
      <linearGradient id="${id('DarkStall')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1f15"/><stop offset="1" stop-color="#4a3724"/></linearGradient>
      <pattern id="${id('Slate')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="${slate}"/><path d="M0 7.6 H12 M6 0 V7.6" stroke="${U.shade(slate, -0.25)}" stroke-width="0.7"/><rect x="0.6" y="0.6" width="4.4" height="1.2" fill="#fff" opacity="0.1"/>
      </pattern>
      <pattern id="${id('SlateOld')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="${U.mix(slate, '#7d7f78', 0.4)}"/><path d="M0 7.6 H12 M6 0 V7.6" stroke="${U.shade(slate, -0.2)}" stroke-width="0.7"/><circle cx="3" cy="6" r="1.3" fill="#7d8a4a" opacity="0.7"/>
      </pattern>
      <pattern id="${id('Boards')}" width="30" height="60" patternUnits="userSpaceOnUse">${boards('#a87b4e', false)}</pattern>
      <pattern id="${id('BoardsOld')}" width="30" height="60" patternUnits="userSpaceOnUse">${boards('#8f8270', true)}</pattern>
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
      <pattern id="${id('Mud')}" width="52" height="34" patternUnits="userSpaceOnUse">
        <rect width="52" height="34" fill="#8d6e4c"/><ellipse cx="14" cy="10" rx="13" ry="5" fill="#7d5f40"/><ellipse cx="38" cy="24" rx="15" ry="6" fill="#9a7a56"/><ellipse cx="44" cy="6" rx="8" ry="3" fill="#7a5c3e"/>
        <ellipse cx="10" cy="27" rx="9" ry="3.4" fill="#846546"/><path d="M26 8 q2 -2 4 0 M6 18 q2 -2 4 0 M32 15 q2 -2 4 0" stroke="#6b4e34" stroke-width="1" fill="none"/>
      </pattern>
      <pattern id="${id('Mow')}" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
        <rect width="56" height="56" fill="${g[0]}"/><rect width="28" height="56" fill="${g[1]}"/>
      </pattern>
      <clipPath id="${id('BarnIn')}"><rect x="${BARNDOOR.x0}" y="${BARNDOOR.y0}" width="${BARNDOOR.x1 - BARNDOOR.x0}" height="${320 - BARNDOOR.y0}"/></clipPath>
      <clipPath id="${id('Stall1')}"><rect x="${STALLS[0].x0}" y="${TOP}" width="36" height="${FOOT - TOP}"/></clipPath>
    </defs>`;
  }

  // -------------------------------------------------------- sky and country
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect y="-4" width="400" height="330" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="350" cy="58" r="46" fill="${url('Sun')}"/><circle cx="350" cy="58" r="17" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="62" cy="74" rx="25" ry="10"/><ellipse cx="81" cy="67" rx="17" ry="12"/><ellipse cx="99" cy="75" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="208" cy="104" rx="19" ry="7"/><ellipse cx="223" cy="99" rx="13" ry="9"/><ellipse cx="237" cy="105" rx="14" ry="6"/></g>`;
  }
  // rolling fields behind the yard, a hedge and a far-off farm
  function far() {
    const h = HILL[SEASON], g = GRASS[SEASON];
    let s = `<path d="M-4 192 Q60 150 150 164 T300 150 T404 164 V330 H-4Z" fill="${h[0]}"/>`;
    s += `<path d="M-4 214 Q110 176 240 184 T404 176 V330 H-4Z" fill="${h[1]}"/>`;
    if (!winter()) s += line('M130 176 Q190 168 248 172 M286 166 Q330 160 396 168', g[2], 2.2, 0.5);
    else s += line('M130 176 Q190 168 248 172 M286 166 Q330 160 396 168', '#bfcbd6', 1.2, 0.7);
    // a little farm far off on the ridge
    s += `${box(162, 150, 16, 10, winter() ? '#dbd4c8' : '#e6dccb')}<path d="M159 151 L170 142 L181 151Z" fill="${winter() ? SNOW : '#a8705a'}"/>${box(171, 153, 3, 7, '#9fb8c4')}`;
    return s;
  }
  // the big oak behind the stable roof
  function oak() {
    let s = line('M352 204 V150 M352 170 l-22 -20 M352 160 l18 -22 M352 150 l-4 -18', '#6b5240', 4);
    const T = OAK[SEASON];
    if (!T) return s + line('M330 150 l-9 -8 M370 138 l7 -6 M348 132 l-3 -8 M338 158 l-8 2', '#6b5240', 1.5) + line('M330 149 l-9 -8 M352 169 l-21 -19 M353 159 l17 -21', SNOW, 1.2);
    const r = U.rng(71);
    for (const [x, y, rr] of [[352, 130, 30], [322, 146, 22], [382, 142, 24], [338, 118, 20], [368, 114, 20]]) s += dot(x, y, rr, T[0]);
    for (let i = 0; i < 36; i++) s += dot(304 + r() * 96, 96 + r() * 72, 2 + r() * 3, U.pick(r, T));
    return s;
  }

  // ------------------------------------------------------------ the ground
  function tuft(x, y, col, k = 1) {
    return line(`M${f1(x)} ${f1(y)} l${f1(-2.4 * k)} ${f1(-5 * k)} M${f1(x)} ${f1(y)} l${f1(0.6 * k)} ${f1(-6.4 * k)} M${f1(x)} ${f1(y)} l${f1(2.8 * k)} ${f1(-4.4 * k)}`, col, 1.1);
  }
  function foxglove(x, y, h, col = '#c770a6') {
    let s = line(`M${f1(x)} ${f1(y)} V${f1(y - h)}`, '#5f8a4a', 1.2);
    s += oval(x - 4.4, y - 2, 5, 1.8, '#6f9a56', 1, -18) + oval(x + 4.4, y - 2.6, 5, 1.8, '#5f8a4a', 1, 16);
    const n = Math.round(h / 4.4);
    for (let i = 0; i < n; i++) {
      const t = i / n, yy = y - h * 0.32 - t * h * 0.62, w = 3.4 * (1 - t * 0.62), side = i % 2 ? 1 : -1, c = i % 3 === 2 ? U.shade(col, 0.22) : col;
      s += `<path d="M${f1(x)} ${f1(yy)} q${f1(side * w * 1.1)} 0.2 ${f1(side * w * 1.3)} ${f1(w * 1.7)} q${f1(-side * w * 0.8)} 0.9 ${f1(-side * w * 1.3)} ${f1(-w * 0.2)}Z" fill="${c}"/>`;
    }
    return s + dot(x, y - h, 0.9, '#8cae68');
  }
  function paddock(st) {
    const p = pend(st, 'paddock'), ok = st.paddock, g = GRASS[SEASON], r = U.rng(113);
    const flowers = SEASON === 'spring' || SEASON === 'summer';
    let s = `<g data-part="paddock"><path d="${PADDOCK_D}" fill="${ok ? url('Mow') : g[1]}"/>`;
    if (!ok) {
      // grown long, with docks and thistles and a few flowers among them
      if (!winter()) {
        for (let i = 0; i < 110; i++) s += tuft(r() * 400, 410 + r() * 130, i % 3 ? g[2] : U.shade(g[2], 0.14), 1.2 + r() * 0.9);
        for (const [x, y] of [[36, 438], [104, 512], [188, 470], [262, 526], [340, 512], [150, 420]]) s += `${line(`M${x} ${y} V${y - 16}`, '#6b7f45', 1.3)}${oval(x - 4, y - 7, 5, 2, '#6f8a3e', 1, -26)}${oval(x + 4, y - 11, 5, 2, '#5f7f3a', 1, 22)}${dot(x, y - 17, 2, '#a8784a')}`;
        if (flowers) for (let i = 0; i < 22; i++) s += dot(r() * 400, 414 + r() * 124, 1.3, i % 2 ? '#fff7d6' : '#f6d24a');
      } else for (let i = 0; i < 34; i++) s += tuft(r() * 400, 412 + r() * 126, '#a7b0a0', 1 + r() * 0.5);
    } else if (p === 'grow') {
      for (let i = 0; i < 46; i++) s += tuft(r() * 400, 410 + r() * 128, g[2], 1 + r() * 0.5);
    } else if (flowers) {
      for (let i = 0; i < 26; i++) s += dot(r() * 400, 414 + r() * 124, 1.1, i % 2 ? '#fffdf0' : '#f6d24a', 0.9);
    }
    if (p === 'leaves') s += `<path d="${PADDOCK_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${PADDOCK_D}" fill="${url('Snow')}" opacity="0.92"/>`;
    return s + '</g>';
  }
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard;
    let s = `<g data-part="yard"><path d="${YARD_D}" fill="${url(ok ? 'Cobble' : 'Mud')}"/>${box(0, 318, 400, 3, '#000', ' opacity="0.12"')}`;
    if (!ok) {
      // churned up by hooves: puddles that hold the sky, and hoof prints everywhere
      for (const [x, y, rx] of [[92, 366, 22], [232, 346, 16], [290, 384, 26], [150, 390, 14], [352, 392, 14]]) s += oval(x, y, rx, rx * 0.26, '#6b4e34', 0.8) + oval(x - 1, y - 0.6, rx * 0.86, rx * 0.19, winter() ? '#dfeaf1' : '#a7c4cf', 0.85);
      const r = U.rng(89);
      for (let i = 0; i < 26; i++) { const x = 8 + r() * 386, y = 326 + r() * 70; s += `<path d="M${f1(x - 2.6)} ${f1(y)} a2.8 2.4 0 1 1 5.2 0" stroke="#5f4530" stroke-width="1.1" fill="none" opacity="0.8"/>`; }
      if (!winter()) for (let i = 0; i < 8; i++) s += tuft(6 + r() * 390, 330 + r() * 60, '#5f8a3a');
      s += line('M124 322 q-6 20 -12 42 M300 324 q14 12 22 34', '#6b4e34', 2.2, 0.35);
    } else {
      // a gutter down the middle of the cobbles, swept clean, and a wisp or two of straw
      s += `${line('M0 360 H176 M224 360 H400', U.shade(COBBLE[SEASON][1], -0.2), 2, 0.5)}`;
      s += line('M64 372 l9 -2 M72 375 l8 1 M260 340 l8 2 M334 386 l9 -1', '#d9b866', 1, 0.8);
      if (p === 'grow') {
        for (const [x, y, rx] of [[82, 372, 11], [268, 382, 14], [338, 340, 9], [188, 342, 8]]) s += oval(x, y, rx, rx * 0.34, '#7d5f40', 0.75);
        const r = U.rng(93);
        for (let i = 0; i < 7; i++) s += tuft(12 + r() * 380, 330 + r() * 60, '#6f8a3e');
      }
    }
    if (p === 'leaves') s += `<path d="${YARD_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${YARD_D}" fill="${url('Snow')}" opacity="0.92"/>`;
    else if (p === 'frost') s += `<path d="${YARD_D}" fill="${url('Frost')}" opacity="0.55"/>`;
    else if (winter()) s += `<path d="M0 318 H400 V330 Q200 338 0 330Z M0 402 V388 Q200 380 400 388 V402Z" fill="${SNOW}" opacity="0.85"/>`;
    return s + '</g>';
  }

  // ---------------------------------------------------------------- the barn
  function bale(x, y, w, h, c = '#e2c26e') {
    const dk = U.shade(c, -0.22);
    return `${box(x, y, w, h, c, ' rx="1.6"')}${box(x, y + h - 2.4, w, 2.4, dk, ' rx="1"')}${line(`M${x + w * 0.3} ${y} v${h} M${x + w * 0.7} ${y} v${h}`, '#a8783e', 0.8)}${line(`M${x + 3} ${y + h * 0.4} h${w * 0.2} M${x + w * 0.55} ${y + h * 0.65} h${w * 0.3}`, '#f4e0a0', 0.8, 0.8)}`;
  }
  function barn(st) {
    const p = pend(st, 'barn'), ok = st.barn, D = BARNDOOR;
    const frame = ok ? '#5f4029' : '#6b6154';
    let s = `<g data-part="barn"><path d="${BARN_D}" fill="${url(ok ? 'Boards' : 'BoardsOld')}"/>`;
    if (ok) {
      // the new boards still paler than the old, low on the left and up by the loft door
      s += `<path d="M6 262 h18 v58 h-18Z M106 214 h20 v40 h-20Z" fill="#d3ad7c" opacity="0.5"/>${line('M15 262 v58 M116 214 v40', '#8a6240', 0.7, 0.7)}`;
    } else {
      // gaps where boards have gone, and one hanging by a nail
      s += `<path d="M12 262 h9 v58 h-9Z M100 268 h9 v52 h-9Z M112 220 h8 v34 h-8Z M30 208 h7 v22 h-7Z" fill="#2f2418"/>`;
      s += `<g transform="rotate(16 108 262)">${box(103, 262, 9, 54, '#857a6a')}${line('M107.4 262 v54', '#5f574c', 0.7)}</g>`;
      s += `${oval(30, 316, 18, 5, '#5f7f3a', 0.7)}${oval(112, 318, 14, 4, '#6f8a3e', 0.7)}`;
    }
    if (p === 'grow') s += `<g transform="rotate(9 116 216)">${box(111, 216, 9, 36, '#b48a5e')}${line('M115.4 216 v36', '#7d5a38', 0.7)}</g>${dot(115, 217, 0.9, '#3d3d42')}`;
    // the great doorway, hay stacked to the roof inside
    s += `<g clip-path="${url('BarnIn')}">${box(D.x0, D.y0, D.x1 - D.x0, 320 - D.y0, url('DarkStall'))}`;
    s += bale(40, 300, 24, 18, '#d9b866') + bale(66, 300, 26, 18) + bale(46, 282, 24, 18) + bale(72, 282, 22, 18, '#d9b866') + bale(40, 264, 22, 18) + bale(64, 264, 26, 18, '#d9b866');
    s += '</g>';
    s += `<path d="M${D.x0 - 2} 320 V${D.y0 - 2} H${D.x1 + 2} V320" stroke="${frame}" stroke-width="3.4" fill="none"/>`;
    // the two big doors, folded back against the wall
    const dr = ok ? K.trim : '#7d8079';
    for (const [x, w] of [[D.x0 - 18, 15], [D.x1 + 3, 15]]) {
      s += `${box(x, D.y0 + 1, w, 73, dr)}${line(`M${x + 5} ${D.y0 + 1} v73 M${x + 10} ${D.y0 + 1} v73`, U.shade(dr, -0.2), 0.7)}${line(`M${x} ${D.y0 + 74} L${x + w} ${D.y0 + 1}`, '#f6f0e3', 1.6, ok ? 0.85 : 0.4)}`;
    }
    // the loft door with a hoist beam, hay spilling out
    s += `${box(52, 178, 28, 26, '#2f2418')}${box(52, 196, 28, 8, '#e2c26e')}${line('M54 196 l-3 -3 M60 196 l1 -4 M68 196 l-2 -4 M76 196 l3 -3', '#f0d890', 1.2)}`;
    s += `<path d="M50 206 V176 H82 V206" stroke="${frame}" stroke-width="3" fill="none"/>`;
    s += `${box(62, 164, 8, 6, frame)}${line('M66 170 V177', '#6b6154', 0.9)}${dot(66, 172, 1.8, '#4b4a52')}`;
    // the barge boards
    s += `<path d="M-2 212 L66 142 L134 212" stroke="${K.oakDk}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 209 L66 141 L132 209" stroke="${K.oakLt}" stroke-width="1.4" fill="none" opacity="0.8"/>`;
    if (winter() || p === 'snow') s += line('M2 206 L66 141 L130 206', SNOW, 4.4);
    return s + '</g>';
  }

  // ------------------------------------------------------------- the block
  function roof() {
    const ok = PCT >= 0.5, d = 'M112 236 L138 186 H382 L408 236Z';
    let s = `<path d="${d}" fill="${url(ok ? 'Slate' : 'SlateOld')}"/>`;
    s += `${line('M138 186 H382', K.oakDk, 3)}${box(112, 234, 296, 4, K.oakDk)}${box(112, 238, 296, 2.4, '#000', ' opacity="0.16"')}`;
    if (!ok) for (const [x, y, rx] of [[176, 214, 18], [322, 206, 15], [252, 226, 12], [362, 226, 12]]) s += oval(x, y, rx, rx * 0.34, '#6f8a3e', 0.7);
    // a small ridge vent
    s += `<path d="M204 186 v-8 h24 v8Z" fill="${K.oakDk}"/>${line('M207 183 h18 M207 180.6 h18', K.oakLt, 0.8)}<path d="M200 179 L216 171 L232 179Z" fill="${U.shade(K.oakDk, -0.1)}"/>`;
    if (winter()) s += `<path d="M138 186 H382 L393 208 Q356 216 318 208 Q280 216 240 208 Q200 216 164 208 Q144 214 127 208Z" fill="${SNOW}"/>${line('M200 179 L216 171 L232 179', SNOW, 2.6)}`;
    return s;
  }
  function walls() {
    let s = box(118, 238, 284, 80, K.wall);
    // the oak frame of the block and a brick plinth along its foot
    s += `${box(118, 308, 284, 10, K.plinth)}${line('M118 311 H402 M118 315 H402', U.shade(K.plinth, -0.18), 0.6, 0.6)}`;
    s += `${box(118, 238, 8, 80, K.oak)}${box(282, 238, 6, 80, K.oak)}${box(394, 238, 8, 80, K.oak)}${box(118, 240, 284, 5, K.oak)}`;
    if (PCT < 0.5) s += `<path d="M130 250 q10 6 6 18 M288 258 q8 10 4 26 M350 246 q6 8 2 22" stroke="#a79e8c" stroke-width="1" fill="none"/>${oval(300, 306, 12, 4, '#8a9456', 0.5)}${oval(200, 306, 18, 3.4, '#8a9456', 0.4)}`;
    return s;
  }
  // a lantern under the eaves, over each door
  function lanterns() {
    let s = '';
    for (const x of LANTS) {
      s += `${line(`M${x} 243 v3`, '#3d3d42', 1)}<path d="M${x - 3.4} 246 L${x - 4.2} 251 H${x + 4.2} L${x + 3.4} 246Z" fill="#3d3d42"/><path d="M${x - 2.6} 251 h5.2 l0.8 6 h-6.8Z" fill="${NIGHT ? '#fff3c4' : '#efe6c8'}" stroke="#3d3d42" stroke-width="0.8"/>`;
    }
    return s;
  }
  // one door leaf: planks, a white brace and iron hinges; tired, it is peeling and scraped
  function leaf(x, y, w, h, st, C) {
    const p = pend(st, 'doors'), ok = st.doors;
    const col = !ok ? '#8e9488' : p ? U.mix(C.stableDoor, '#b3aa9a', 0.4) : C.stableDoor, dk = U.shade(col, -0.24);
    let s = box(x, y, w, h, col);
    for (const k of [0.25, 0.5, 0.75]) s += line(`M${f1(x + w * k)} ${y} v${h}`, dk, 0.7, 0.8);
    s += `<path d="M${x + 2} ${y + h - 2} L${x + w - 2} ${y + 2} M${x + 2} ${y + 2} L${x + w - 2} ${y + h - 2}" stroke="#f6f0e3" stroke-width="2.2" opacity="${ok ? (p ? 0.55 : 0.9) : 0.3}"/>`;
    s += `${box(x, y, w, 2.6, U.shade(col, 0.14))}${box(x - 1, y + 5, 11, 2, '#3d3d42', ' rx="0.8"')}${box(x - 1, y + h - 7, 11, 2, '#3d3d42', ' rx="0.8"')}`;
    if (!ok) {
      const r = U.rng(Math.round(x * 7 + y));
      for (let i = 0; i < 5; i++) s += oval(x + 4 + r() * (w - 8), y + 4 + r() * (h - 8), 2.2 + r() * 2.6, 1.3 + r(), '#b3a68f', 0.85);
      s += line(`M${x + 8} ${y + h - 5} l5 -7 M${x + w - 9} ${y + 6} l-4 8`, '#5f574c', 0.9, 0.6);
    }
    return s;
  }
  // a door leaf folded right back against the wall, seen edge-on
  function foldedLeaf(x, y, w, h, st, C) {
    const p = pend(st, 'doors'), ok = st.doors;
    const col = !ok ? '#8e9488' : p ? U.mix(C.stableDoor, '#b3aa9a', 0.4) : C.stableDoor, dk = U.shade(col, -0.24);
    return `${box(x, y, w, h, U.shade(col, -0.08))}${line(`M${f1(x + w / 2)} ${y} v${h}`, dk, 0.7)}${box(x, y, 1.2, h, '#000', ' opacity="0.25"')}${line(`M${x + 1} ${y + h - 2} L${x + w - 1} ${y + 2}`, '#f6f0e3', 1.2, ok ? 0.7 : 0.25)}`;
  }
  function frameOf(x0, x1) {
    return `<path d="M${x0 - 2} ${FOOT} V${TOP - 2} H${x1 + 2} V${FOOT}" stroke="${K.oakDk}" stroke-width="3.2" fill="none"/>${box(x0 - 5, TOP - 7, x1 - x0 + 10, 5, K.oak)}`;
  }
  // the left stall stands open: its bed of straw, a hay net, a fork
  function stall(st) {
    const p = pend(st, 'stable'), ok = st.stable && !p, { x0, x1 } = STALLS[0];
    let s = `<g data-part="stable"><g clip-path="${url('Stall1')}">${box(x0, TOP, 36, FOOT - TOP, url('DarkStall'))}`;
    s += line(`M${x0 + 12} ${TOP} V${FOOT} M${x0 + 24} ${TOP} V${FOOT}`, '#5a4530', 0.7, 0.7);
    // the hay net
    s += `${line(`M${x1 - 10} ${TOP + 1} v6`, '#c9b78e', 0.8)}${oval(x1 - 10, TOP + 15, 7, 8.4, ok ? '#e2c26e' : '#b3a472')}`;
    s += line(`M${x1 - 16} ${TOP + 11} l12 9 M${x1 - 16} ${TOP + 18} l11 -10 M${x1 - 12} ${TOP + 8} l7 15`, '#8a6f3e', 0.6);
    if (ok) {
      // deep golden straw, banked up the walls
      s += `<path d="M${x0} ${FOOT} V${FOOT - 22} Q${x0 + 8} ${FOOT - 16} ${x0 + 14} ${FOOT - 14} Q${x0 + 24} ${FOOT - 13} ${x1} ${FOOT - 20} V${FOOT}Z" fill="#e2c26e"/>`;
      const r = U.rng(37);
      for (let i = 0; i < 26; i++) { const x = x0 + r() * 36, y = FOOT - 18 + r() * 17; s += line(`M${f1(x)} ${f1(y)} l${f1((r() - 0.5) * 9)} ${f1((r() - 0.5) * 3)}`, U.pick(r, ['#f4e0a0', '#c9a54e', '#d9b866']), 0.8); }
    } else {
      // old straw, flat and dull, gone dark in the middle
      s += `<path d="M${x0} ${FOOT} V${FOOT - 12} Q${x0 + 12} ${FOOT - 15} ${x1} ${FOOT - 11} V${FOOT}Z" fill="#8e7a52"/>${oval(x0 + 18, FOOT - 5, 13, 3.4, '#5f4e34')}`;
      const r = U.rng(39);
      for (let i = 0; i < 16; i++) { const x = x0 + r() * 36, y = FOOT - 12 + r() * 11; s += line(`M${f1(x)} ${f1(y)} l${f1((r() - 0.5) * 8)} ${f1((r() - 0.5) * 2)}`, '#a8946a', 0.7); }
    }
    s += '</g>';
    // the wheelbarrow outside: heaped with old straw and a fork in it, or clean and tipped up to dry
    const bx = 170, by = 340;
    if (ok) {
      s += `${shadow(bx, by + 2, 24, 2.6)}${line(`M${bx + 30} ${by - 14} L${bx - 4} ${by - 10}`, '#8a6240', 2)}${line(`M${bx + 14} ${by - 12} v13 M${bx - 8} ${by - 8} l-8 9`, '#6b4a32', 1.6)}<path d="M${bx - 22} ${by - 18} H${bx + 16} L${bx + 8} ${by - 3} H${bx - 15}Z" fill="#5f9a7a" stroke="#3f6b4e" stroke-width="0.8"/>${box(bx - 21, by - 18, 36, 2.4, '#78b394', ' rx="1"')}${dot(bx - 11, by - 1, 5.4, '#3d3d42')}${dot(bx - 11, by - 1, 1.6, '#c9c4b8')}`;
    } else {
      s += `${shadow(bx, by + 2, 24, 2.6)}${line(`M${bx + 30} ${by - 14} L${bx - 4} ${by - 10}`, '#7d6a52', 2)}${line(`M${bx + 14} ${by - 12} v13 M${bx - 8} ${by - 8} l-8 9`, '#5f4e3a', 1.6)}<path d="M${bx - 22} ${by - 18} H${bx + 16} L${bx + 8} ${by - 3} H${bx - 15}Z" fill="#7f8a84" stroke="#5a6058" stroke-width="0.8"/>${dot(bx - 11, by - 1, 5.4, '#3d3d42')}${dot(bx - 11, by - 1, 1.6, '#9a958a')}`;
      s += `<path d="M${bx - 24} ${by - 17} Q${bx - 16} ${by - 30} ${bx - 2} ${by - 28} Q${bx + 12} ${by - 30} ${bx + 18} ${by - 17}Z" fill="#8e7a52"/>${line(`M${bx - 8} ${by - 26} l5 2 M${bx + 2} ${by - 28} l4 3 M${bx - 18} ${by - 20} l6 -1`, '#6b5a3a', 0.8)}`;
      s += `${line(`M${bx + 2} ${by - 26} L${bx + 12} ${by - 56}`, '#8a6a4a', 1.5)}${line(`M${bx - 1} ${by - 24} l1 -9 M${bx + 2} ${by - 25} l2 -8 M${bx + 5} ${by - 24} l3 -8`, '#8d8f8e', 1)}`;
    }
    return s + '</g>';
  }
  function bow(x, y, col, rot = 0) {
    const dk = U.shade(col, -0.2);
    return `<g transform="rotate(${rot} ${f1(x)} ${f1(y)})"><path d="M${f1(x)} ${f1(y)} l-4.4 -2.6 v5.2Z M${f1(x)} ${f1(y)} l4.4 -2.6 v5.2Z" fill="${col}"/><path d="M${f1(x)} ${f1(y)} l-2 5 M${f1(x)} ${f1(y)} l2.2 4.6" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/>${dot(x, y, 1.2, dk)}</g>`;
  }
  // the chestnut pony looking out over the middle door, quite content
  function doorPony(st) {
    const p = pend(st, 'mane'), bows = st.mane && !p;
    const fur = '#a8623a', dk = '#7d4526', hair = '#4f2c1c', lt = '#d6a57c';
    let head = `<path d="M196 279 Q199 273 205 263 Q214 257 222 266 Q227 272 227 279Z" fill="${fur}"/>`;
    head += `<path d="M206 262 Q214 266 216 279 H209 Q208 272 202 268Z" fill="${dk}" opacity="0.22"/>`;
    // the mane down the far side of the neck
    head += `<path d="M207 255 Q217 258 223 266 Q228.6 272 228.6 279 L222 279 Q221 273 215 268 Q210 262 204 259Z" fill="${hair}"/>`;
    if (!bows) head += line('M212 258 q6 2 8 8 M218 266 q4 6 5 12', '#6b4230', 0.9, 0.8);
    head += `<path d="M211 258 Q206 252 200 254 Q190 258 182 271 Q178 279 183 283 Q189 287 195 281 Q203 273 213 269Z" fill="${fur}"/>`;
    // a white blaze and a soft muzzle
    head += `<path d="M201 256 Q193 262 186 274 L191 276 Q197 266 205 259Z" fill="#f6f0e3"/>`;
    head += `<ellipse cx="186" cy="279" rx="6.4" ry="5" fill="${lt}" transform="rotate(-38 186 279)"/>`;
    head += `${dot(183.4, 278.6, 0.9, '#5a3a2a')}${dot(187.4, 281.4, 0.8, '#5a3a2a')}${line('M184.4 283.6 q3 1.4 6 -0.6', '#7d4526', 0.9)}`;
    head += `${dot(200, 262.4, 2, '#2b2422')}${dot(199.4, 261.8, 0.6, '#fff')}${line('M198 260 q2.2 -1.8 4.4 -0.2', '#5a3220', 0.8)}`;
    // ears, the near one flicks now and then
    head += `<path d="M205 255 l0.6 -10 l6 8Z" fill="${fur}"/><path d="M206.4 252 l0.4 -5 l2.8 3.8Z" fill="#6b3a26"/>`;
    head += `<path class="${RESTING ? 'fs-flick' : 'fs-ear'}" d="M211 257 l4 -10 l3.6 10Z" fill="${fur}"/>`;
    // the forelock over the blaze
    head += `<path d="M207 252 Q200 254 200 262 Q204 261 206 257 Q207 260 210 258Z" fill="${hair}"/>`;
    // a green head collar
    head += line('M191 271 L201 274 M201 274 L210 262 M201 274 Q204 276 208 273', '#3f6b4e', 1.2);
    head += `${dot(201, 274, 1.1, '#d9b45a')}`;
    if (bows) {
      // the mane plaited up, with a ribbon on every plait
      const cols = ['#e2768b', '#f6f0e3', '#5d7fd8', '#f2c84b'], pts = [[210, 257.4], [216.4, 261], [221.4, 266.4], [225, 273]];
      head += line('M208 256 Q218 260 223 268 Q226 272 226.6 278', '#6b4230', 1.4, 0.7);
      pts.forEach(([x, y], i) => { head += bow(x, y, cols[i % cols.length], 24 + i * 14); });
    }
    const body = RESTING ? `<g class="rest"><g class="fs-nod">${head}</g></g>` : `<g>${head}</g>`;
    return `<g data-part="mane" transform="translate(0 7)">${body}</g>`;
  }
  function doors(st, C) {
    const [A, B, C2] = STALLS;
    let s = '<g data-part="doors">';
    // the open stall's two leaves folded back; the pony's lower door shut, its
    // top leaf folded back; the third door shut, top and bottom
    s += foldedLeaf(A.x1 + 2, TOP, 10, MID - TOP, st, C) + foldedLeaf(A.x1 + 2, MID, 10, FOOT - MID, st, C);
    s += foldedLeaf(B.x1 + 2, TOP, 10, MID - TOP, st, C);
    s += leaf(B.x0, MID, 36, FOOT - MID, st, C);
    s += leaf(C2.x0, TOP, 36, MID - TOP, st, C) + leaf(C2.x0, MID, 36, FOOT - MID, st, C) + line(`M${C2.x0} ${MID} h36`, '#000', 0.9, 0.4);
    s += `${dot(C2.x1 - 4, MID + 8, 1.4, '#3d3d42')}${dot(B.x1 - 4, MID + 8, 1.4, '#3d3d42')}`;
    return s + '</g>';
  }
  function stable(st, C) {
    const [A, B, C2] = STALLS;
    let s = `${frameOf(A.x0, A.x1)}${frameOf(B.x0, B.x1)}${frameOf(C2.x0, C2.x1)}`;
    s += box(B.x0, TOP, 36, MID - TOP, url('DarkStall'));
    s += lanterns();
    return `${s}${stall(st)}${doors(st, C)}`;
  }
  // the tack room seen through its window: bridles on hooks, a saddle on a
  // bracket, tins on a shelf; tired, a dusty grey jumble with cobwebs
  function tackRoom(st) {
    const p = pend(st, 'tack'), ok = st.tack && !p, { x0, y0, y1 } = WIN;
    const w = ok ? '#e9d7ad' : '#a39a86', leather = ok ? '#7d4a2a' : '#6f6658', tin = ok ? '#5f9a7a' : '#8a8f88';
    let s = `<g data-part="tack">${box(x0, y0, 48, y1 - y0, w)}`;
    s += `${box(x0, y0 + 25, 48, 2, ok ? '#a87b4e' : '#7d7264')}`;
    // bridles on three hooks
    for (const [x, c] of [[x0 + 8, leather], [x0 + 16, ok ? '#3f6b4e' : leather], [x0 + 24, leather]]) {
      s += `${dot(x, y0 + 4, 0.9, '#3d3d42')}${line(`M${x} ${y0 + 4} v6 M${x - 3} ${y0 + 10} q3 -4 6 0 M${x - 3} ${y0 + 10} v7 M${x + 3} ${y0 + 10} v7 M${x - 3} ${y0 + 14} h6`, c, 0.9)}`;
    }
    // a saddle on its bracket and tins of polish on the shelf
    s += `<path d="M${x0 + 30} ${y0 + 14} q2 -7 8 -6 q6 0 9 -3 q2 6 -2 10 Q${x0 + 38} ${y0 + 18} ${x0 + 30} ${y0 + 14}Z" fill="${leather}"/>${line(`M${x0 + 38} ${y0 + 16} v5`, '#3d3d42', 0.8)}${box(x0 + 34, y0 + 15, 10, 1.4, ok ? '#a87b4e' : '#7d7264')}`;
    for (const [dx, h] of [[6, 5], [13, 7], [20, 4], [34, 6]]) s += box(x0 + dx, y0 + 25 - h, 5, h, tin, ' rx="0.8"');
    s += `${box(x0 + 5, y0 + 33, 16, 5, leather, ' rx="1"')}${box(x0 + 28, y0 + 31, 13, 7, ok ? '#c9a06a' : '#7d7264', ' rx="1"')}`;
    if (!ok) {
      // dust over everything and a cobweb in the corner
      s += box(x0, y0, 48, y1 - y0, url('Dusty'), ' opacity="0.55"');
      s += line(`M${x0} ${y0 + 12} Q${x0 + 8} ${y0 + 9} ${x0 + 12} ${y0} M${x0} ${y0 + 7} Q${x0 + 4} ${y0 + 5} ${x0 + 7} ${y0} M${x0} ${y0} L${x0 + 12} ${y0 + 12}`, '#f4f0e8', 0.6, 0.8);
    }
    return s + '</g>';
  }
  function tackWindow(st) {
    const p = pend(st, 'window'), { x0, x1, y0, y1 } = WIN, w = x1 - x0, h = y1 - y0, sash = st.window ? '#fbf7ee' : '#b8b1a2';
    let s = `<g data-part="window"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#000" fill-opacity="0"/>`;
    if (!st.window) s += box(x0, y0, w, h, url('Grime'), ' opacity="0.82"') + line(`M${x0 + 8} ${y0 + 8} l10 20 M${x0 + 26} ${y0 + 4} l6 14`, '#a7ab98', 2, 0.7);
    else if (p === 'grow') s += box(x0, y0, w, h, url('Dusty'), ' opacity="0.4"');
    else if (p === 'frost') s += box(x0, y0, w, h, url('Frost'), ' opacity="0.86"') + line(`M${x0 + 8} ${y1 - 6} q6 -9 13 -12 M${x0 + 26} ${y1 - 8} q6 -6 12 -8`, '#fff', 0.9, 0.8);
    else s += `<path d="M${x0 + 4} ${y1 - 2} L${x0 + 22} ${y0 + 2} L${x0 + 30} ${y0 + 2} L${x0 + 12} ${y1 - 2}Z" fill="#fff" opacity="${NIGHT ? 0.05 : 0.2}"/>`;
    s += `${line(`M${x0 + w / 2} ${y0} v${h} M${x0} ${y0 + h / 2} h${w}`, sash, 1.8)}<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${sash}" stroke-width="2.4"/>`;
    s += `${box(x0 - 3, y1 + 1, w + 6, 3.4, K.oak, ' rx="0.8"')}`;
    return s + '</g>';
  }
  function tackDoor() {
    const { x0, x1, y0 } = TACKDOOR, c = K.trim;
    let s = `<path d="M${x0 - 2} ${FOOT} V${y0 - 2} H${x1 + 2} V${FOOT}" stroke="${K.oakDk}" stroke-width="3" fill="none"/>${box(x0, y0, x1 - x0, FOOT - y0, c)}`;
    for (const k of [0.25, 0.5, 0.75]) s += line(`M${f1(x0 + (x1 - x0) * k)} ${y0} V${FOOT}`, U.shade(c, -0.24), 0.7);
    s += `${box(x0 + 5, y0 + 6, 20, 13, '#3a4a4a')}${line(`M${x0 + 15} ${y0 + 6} v13`, '#f6f0e3', 1)}<rect x="${x0 + 5}" y="${y0 + 6}" width="20" height="13" fill="none" stroke="#f6f0e3" stroke-width="1.2"/>`;
    s += `${box(x0 + 3, y0 - 13, 24, 7, '#f6f0e3', ' rx="1"')}${text(x0 + 15, y0 - 7.6, 'TACK', 5, K.oakDk, ' letter-spacing="0.5"')}`;
    return `<g data-part="tack">${s}${dot(x1 - 4, 290, 1.5, '#d9b45a')}</g>`;
  }
  // a saddle over a rail, its cloth hanging down and a stirrup run up
  function saddle(x, y, col, cloth) {
    const dk = U.shade(col, -0.28);
    return `<path d="M${x - 15} ${y} H${x + 15} L${x + 13} ${y + 17} Q${x} ${y + 21} ${x - 13} ${y + 17}Z" fill="${cloth}"/>${line(`M${x - 13} ${y + 15} Q${x} ${y + 19} ${x + 13} ${y + 15}`, '#f6f0e3', 0.8, 0.8)}
      <path d="M${x - 14} ${y + 1} Q${x - 13} ${y - 7} ${x - 3} ${y - 6.4} Q${x + 7} ${y - 6} ${x + 11} ${y - 11} Q${x + 16} ${y - 3} ${x + 13} ${y + 2} Q${x} ${y + 7} ${x - 14} ${y + 1}Z" fill="${col}"/>
      <path d="M${x - 5} ${y + 2} q-1 7 2 10 q5 1 7 -1 l-1 -10Z" fill="${dk}"/>${line(`M${x - 12} ${y - 2} Q${x - 2} ${y - 3} ${x + 9} ${y - 7}`, U.shade(col, 0.28), 0.9)}${line(`M${x + 8} ${y + 3} v7`, '#3d3d42', 0.8)}<path d="M${x + 5.6} ${y + 10} h4.8 v3 h-4.8Z" fill="none" stroke="#c9ced4" stroke-width="0.9"/>`;
  }
  function saddles(st) {
    const p = pend(st, 'saddles'), ok = st.saddles && !p;
    let s = '<g data-part="saddles">';
    // the rack: a long rail on three trestles, out in the air by the tack-room wall
    const rail = K.oak;
    s += `${shadow(326, 338, 44, 2.6)}${line('M292 338 L298 312 L304 338 M321 338 L327 312 L333 338 M350 338 L356 312 L362 338', K.oakDk, 2)}${box(292, 309, 70, 4.4, rail, ' rx="1.6"')}${box(292, 309, 70, 1.2, K.oakLt)}`;
    if (ok) s += saddle(308, 308, '#7d4a2a', '#3f6b4e') + saddle(346, 308, '#5a3220', '#c9474f');
    else if (st.saddles) s += saddle(308, 308, '#7d4a2a', '#3f6b4e') + `<g transform="rotate(-8 352 334)">${saddle(352, 330, '#5a3220', '#c9474f')}</g>`;
    else {
      // all in a heap, each with its own tag; nobody knows yet whose is whose
      s += `<g transform="rotate(-10 306 332)">${saddle(306, 328, '#6b5a48', '#6f8a7c')}</g><g transform="rotate(8 338 334)">${saddle(338, 330, '#5f4e3e', '#a27a78')}</g>`;
      s += `<path d="M324 322 l8 -3 l3 6 l-8 3Z" fill="#f6efe0" stroke="#a8a090" stroke-width="0.6"/>${line('M326 323 l5 -2', '#a8a090', 0.6)}`;
    }
    return s + '</g>';
  }
  // the stone trough and its pump
  function trough(st) {
    const p = pend(st, 'trough'), ok = st.trough && !p;
    const stone = st.trough ? '#d4c9b4' : '#a8a090', dk = U.shade(stone, -0.22), lt = U.shade(stone, 0.14);
    const icy = st.trough && (winter() || p === 'snow');
    let s = `<g data-part="trough">${shadow(246, 382, 40, 3)}`;
    // the pump at the left end
    s += `${box(202, 342, 8, 36, '#4b5a5a', ' rx="1.6"')}${box(200, 342, 12, 4, '#3d4a4a', ' rx="1.4"')}${line('M206 346 h10', '#4b5a5a', 3)}${line('M216 346 v4', '#4b5a5a', 2.4)}${line('M206 343 Q196 334 188 338', '#4b5a5a', 2.2)}${dot(188, 338, 1.8, '#3d4a4a')}`;
    s += `<path d="M212 358 H280 V378 Q246 384 212 378Z" fill="${dk}"/><path d="M212 356 H280 V360 H212Z" fill="${lt}"/>`;
    s += line('M224 362 v14 M240 362 v15 M258 362 v15 M270 362 v14', U.shade(dk, -0.12), 0.6, 0.5);
    s += `<rect x="214" y="352" width="64" height="8" rx="3" fill="${lt}"/>`;
    const water = icy ? url('Ice') : !st.trough ? '#7f8a58' : p === 'grow' ? '#8aa068' : url('Water');
    s += `<rect x="217" y="353.4" width="58" height="5.2" rx="2.4" fill="${water}"/>`;
    if (!st.trough) {
      // low and green, with old leaves in it and moss up the side
      s += `${oval(232, 355.6, 8, 1.6, '#5f7f3a', 0.8)}${oval(258, 356, 6, 1.4, '#a8874a')}${oval(262, 355, 3, 1, '#9c5a2a')}${oval(222, 374, 12, 3, '#6f8a3e', 0.6)}${oval(270, 368, 7, 3, '#748f42', 0.55)}`;
      s += line('M250 358 l4 10 l-3 6', U.shade(dk, -0.3), 0.8);
    } else if (ok && !icy) {
      s += `${oval(236, 354.8, 9, 0.8, '#fff', 0.5)}${line('M216 351 v3', '#dff2fa', 0.9)}<circle class="fs-glint" cx="264" cy="355" r="1.2" fill="#fff"/>`;
      s += `<g class="fs-glint" style="animation-delay:-1.2s">${line('M216 350 V354', '#cfeaf5', 1)}</g>`;
    } else if (p === 'grow') s += oval(244, 355.4, 12, 1.4, '#6f8a3e', 0.7);
    if (icy) s += line('M226 356 l10 -1 M250 355 l12 1', '#fff', 0.8, 0.8);
    if (winter() || p === 'snow') s += `<path d="M212 353 Q214 349 226 350 H266 Q278 349 280 353 Q246 356 212 353Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  // the yard sign on its two oak posts
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = !ok ? '#9c978a' : p ? U.mix(C.stableSign, '#b3aa9a', 0.35) : C.stableSign;
    const ink = !ok ? '#d9d3c4' : U.lum(col) > 0.62 ? '#3b352e' : '#f6efe0';
    // well in from the left edge: a phone crops the sides of the picture
    const x = 28, y = 346, w = 92, h = 36, cx = x + w / 2;
    let s = `<g data-part="sign">${line(`M${x + 12} ${y - 6} V402 M${x + w - 12} ${y - 6} V402`, ok ? K.oakDk : '#6b6154', 4)}`;
    s += `<g${ok ? '' : ` transform="rotate(-4 ${cx} ${y + h / 2})"`}>${box(x, y, w, h, col, ' rx="3"')}${box(x + 2, y + 2, w - 4, h - 4, 'none', ` rx="2" stroke="${ink}" stroke-width="0.7" opacity="0.7"`)}`;
    s += `<text x="${cx}" y="${y + 17.4}" text-anchor="middle" font-family="${SERIF}" font-size="13" font-weight="700" letter-spacing="0.3" fill="${ink}"${ok ? '' : ' opacity="0.7"'}>${ok ? 'FOXGLOVE' : 'FOX  LOVE'}</text>`;
    s += `<text x="${cx}" y="${y + 29}" text-anchor="middle" font-family="${FONT}" font-size="6.8" font-weight="800" letter-spacing="1.2" fill="${ink}"${ok ? '' : ' opacity="0.6"'}>${ok ? 'STABLES' : 'ST  LES'}</text>`;
    // a little horseshoe on each side of the second line, points up for luck
    if (ok) for (const hx of [cx - 27, cx + 27]) s += `<path d="M${hx - 2.8} ${y + 23.4} v1.6 a2.8 3 0 0 0 5.6 0 v-1.6" stroke="${ink}" stroke-width="1.3" fill="none" opacity="0.85"/>`;
    s += '</g>';
    if (winter() && ok) s += box(x + 1, y - 2, w - 2, 3, SNOW, ' rx="1.4"');
    return s + '</g>';
  }
  // post-and-rail round the paddock, with a five-bar gate
  function fence(st, C) {
    const p = pend(st, 'fence'), ok = st.fence;
    const col = !ok ? '#a39a88' : p ? U.mix(C.stableFence, '#a39a88', 0.45) : C.stableFence, dk = U.shade(col, -0.2), r = U.rng(53);
    let s = '<g data-part="fence">';
    const rail = (x0, x1, y, broken) => {
      if (broken) return `${line(`M${x0} ${y} L${f1((x0 + x1) / 2 - 3)} ${y + 2}`, col, 3.4)}${line(`M${f1((x0 + x1) / 2 + 3)} ${y + 7} L${x1} ${y}`, dk, 3.4)}`;
      return `${line(`M${x0} ${y} H${x1}`, dk, 3.6)}${line(`M${x0} ${y - 0.7} H${x1}`, col, 2.4)}`;
    };
    for (let i = 0; i < POSTS.length - 1; i++) {
      const a = POSTS[i], b = POSTS[i + 1];
      if (a === 160) continue;
      s += rail(a, b, 386, !ok && (i === 1 || i === 6)) + rail(a, b, 398, !ok && i === 7);
    }
    for (const x of POSTS) {
      const lean = ok ? 0 : (r() - 0.5) * 4;
      s += `<path d="M${f1(x - 3 + lean)} 376 L${f1(x + 3 + lean)} 376 L${x + 3} 410 H${x - 3}Z" fill="${col}"/>${line(`M${f1(x + 2.4 + lean)} 377 L${x + 2.4} 410`, dk, 1)}`;
      if (winter() || p === 'snow') s += box(x - 4 + lean, 373.6, 8, 3, SNOW, ' rx="1.4"');
    }
    // the gate between the two middle posts, shut
    for (const y of [381, 387, 393, 399, 405]) s += `${line(`M164 ${y} H236`, dk, 2.2)}${line(`M164 ${y - 0.5} H236`, col, 1.4)}`;
    s += `${line('M164 405 L200 381 M200 405 L236 381', col, 1.8)}${line('M164 378 V408 M236 378 V408', col, 3)}${box(232, 390, 6, 3, '#3d3d42', ' rx="1"')}`;
    if (!ok) s += line('M178 389 l14 -3 M210 397 l12 -2', '#6f8a3e', 1.6, 0.6);
    if (winter() || p === 'snow') for (const x0 of [8, 240]) s += line(`M${x0} 384 H${x0 + 152}`, SNOW, 1.4, 0.9);
    return s + '</g>';
  }
  // a jump: two white wings and striped poles
  function wing(x, y, h, ok) {
    const c = ok ? '#f6f0e3' : '#b3aa9a', dk = U.shade(c, -0.2);
    return `${line(`M${x - 8} ${y} H${x + 8}`, dk, 2.6)}${line(`M${x - 7} ${y} L${x} ${y - h * 0.62} M${x + 7} ${y} L${x} ${y - h * 0.62}`, dk, 1.5)}${box(x - 2.2, y - h, 4.4, h, c, ' rx="1.2"')}${box(x + 0.8, y - h, 1.4, h, dk)}${dot(x, y - h, 2.8, c)}`;
  }
  function pole(x0, y0, x1, y1, col, alt) {
    const n = 8, seg = (t, u, c) => line(`M${f1(x0 + (x1 - x0) * t)} ${f1(y0 + (y1 - y0) * t)} L${f1(x0 + (x1 - x0) * u)} ${f1(y0 + (y1 - y0) * u)}`, c, 4.4);
    let s = line(`M${x0} ${f1(y0 + 1.4)} L${x1} ${f1(y1 + 1.4)}`, '#000', 4.4, 0.12);
    for (let i = 0; i < n; i++) s += seg(i / n, (i + 1) / n, i % 2 ? alt : col);
    return s;
  }
  function jump(x0, x1, y, h, st, C, flowers) {
    const p = pend(st, 'jumps'), ok = st.jumps;
    const col = !ok ? '#a8a092' : p ? U.mix(C.jumps, '#b3aa9a', 0.45) : C.jumps, alt = ok ? '#fffaf1' : '#c9c1b0';
    let s = `${shadow((x0 + x1) / 2, y + 2, (x1 - x0) / 2 + 12, 3)}`;
    if (ok) {
      s += pole(x0, y - h * 0.62, x1, y - h * 0.62, col, alt) + pole(x0, y - h * 0.3, x1, y - h * 0.3, col, alt);
      if (flowers) {
        for (let x = x0 + 12; x < x1 - 8; x += 13) {
          s += dot(x, y - 3, 4.6, '#6f9a56');
          if (!winter()) s += `${dot(x - 2, y - 5, 1.5, '#f2c84b')}${dot(x + 2, y - 3, 1.5, '#efb4ae')}`;
        }
        s += box(x0 + 6, y - 2, x1 - x0 - 12, 5, K.oak, ' rx="1"');
      }
    } else {
      // the poles down in the grass, the paint long gone
      s += pole(x0 + 2, y - 2, x1 - 6, y + 2, col, alt) + pole(x0 + 10, y + 6, x1 + 2, y - 4, col, alt);
    }
    s += wing(x0, y, h, ok) + `<g${ok ? '' : ` transform="rotate(7 ${x1} ${y})"`}>${wing(x1, y, h, ok)}</g>`;
    return s;
  }
  function jumps(st, C) {
    return `<g data-part="jumps">${jump(40, 126, 476, 34, st, C, false)}${jump(214, 306, 522, 38, st, C, true)}</g>`;
  }
  // the grey pony in the paddock; a bit dusty before the brush, gleaming after
  function paddockPony(st) {
    const p = pend(st, 'pony'), ok = st.pony && !p, x = 204, y = 442, k = 1.36;
    const fur = ok ? '#d6d2cb' : '#b5ad9f', dk = U.shade(fur, -0.2), mane = ok ? '#fbf8f1' : '#a79e90', hoof = '#4b4540';
    let s = `<g data-part="pony"><g transform="translate(${x} ${y}) scale(${k})">${shadow(2, 22, 21, 2.6)}`;
    s += `<g class="fs-tail"><path d="M-16.6 -5 q-7.4 6 -5 19 q2 3 3.4 0 q-2 -10 3.8 -15Z" fill="${mane}"/></g>`;
    s += `<path d="M-11 6 V20 M-5 7 V21 M7 7 V21 M12 6 V20" stroke="${fur}" stroke-width="4.2" stroke-linecap="round"/><path d="M-5 7 V21 M12 6 V20" stroke="${dk}" stroke-width="1" opacity="0.4" transform="translate(1.4 0)"/>`;
    s += `<path d="M-11 19.6 v1.4 M-5 20.6 v1.4 M7 20.6 v1.4 M12 19.6 v1.4" stroke="${hoof}" stroke-width="4.4"/>`;
    s += `${oval(0, 0, 18, 10.4, fur)}${oval(1, 5, 13, 4.6, U.shade(fur, 0.16), 0.8)}`;
    s += `<path d="M9 -5 Q14 -14 18 -17 L25 -11 Q20 -5 15 4Z" fill="${fur}"/>`;
    s += `<path d="M8 -6 Q13 -16 19 -20 Q22 -12 14 -2Z" fill="${mane}"/>`;
    s += `<path class="fs-ear" d="M17 -20 l1 -5.4 l3.2 4.2Z" fill="${fur}"/><path d="M21 -19 l2.8 -4.4 l1.4 5Z" fill="${fur}"/>`;
    s += `<ellipse cx="24" cy="-12" rx="7.8" ry="5.2" transform="rotate(30 24 -12)" fill="${fur}"/>${oval(28.6, -8.4, 3.8, 3, U.shade(fur, -0.1))}`;
    s += `${dot(22.6, -14.4, 1.2, '#2b2422')}${dot(22.3, -14.8, 0.36, '#fff')}${dot(30.4, -8.2, 0.6, '#5a524a')}${line('M28 -5.8 q1.6 0.8 3 -0.2', '#5a524a', 0.5)}`;
    // dapples, always; shine after the brush, dust and a burr or two before it
    for (const [dx, dy] of [[-10, -3], [-4, 2], [3, -4], [9, 1], [-7, 5], [5, 5], [13, -3]]) s += dot(dx, dy, 1.7, U.shade(fur, -0.1), 0.7);
    if (ok) s += `${line('M-11 -7 Q0 -11 10 -7', '#fff', 1.3, 0.75)}<path class="fs-glint" d="M-3 -9 l0.8 2 l2 0.8 l-2 0.8 l-0.8 2 l-0.8 -2 l-2 -0.8 l2 -0.8Z" fill="#fff"/>`;
    else {
      s += `${oval(-8, 3, 7, 3, '#9a8a70', 0.5)}${oval(6, -4, 5, 2.4, '#9a8a70', 0.4)}${oval(-11, 15, 3, 3.6, '#7d6a52', 0.55)}${oval(12, 15, 3, 3.6, '#7d6a52', 0.55)}`;
      for (const [bx, by] of [[-20, 7], [-19, 1], [13, -11], [16, -14]]) s += dot(bx, by, 1, '#6b5a3a');
    }
    return s + '</g></g>';
  }
  // the collie lying in the yard, head up and tail going
  function dog() {
    const x = 142, y = 364, b = '#35312e', w = '#f4efe6';
    let s = `${shadow(x, y + 7, 22, 2.4)}<g class="fs-wag">${line(`M${x - 15} ${y + 2} q-9 -1 -12 -7`, b, 3.6)}${line(`M${x - 25} ${y - 2} l-2.4 -3.4`, w, 3)}</g>`;
    s += `${oval(x - 1, y + 1, 16, 7, b)}${oval(x + 4, y + 4, 10, 3.6, w)}${oval(x - 8, y + 5, 7, 2.4, b)}`;
    s += `<path d="M${x + 6} ${y + 6} h15 q2 0 2 -1.6 q0 -1.4 -2 -1.4 h-14Z" fill="${w}"/>`;
    s += `${oval(x + 10, y - 7, 7.4, 6.4, b)}<path d="M${x + 11} ${y - 12} q2 6 0 11 q4 2 9 -2 q2 -3 -1 -5 q-4 -1 -8 -4Z" fill="${w}"/>`;
    s += `<path d="M${x + 5} ${y - 12} q-3 -3 -1 -7 q4 1 6 5Z M${x + 14} ${y - 12} q0 -5 3 -7 q3 3 1 8Z" fill="${b}"/>`;
    s += `${dot(x + 8.6, y - 7.6, 0.9, '#e8d8c0')}${dot(x + 14.6, y - 8, 1, '#2b2422')}${dot(x + 14.3, y - 8.3, 0.3, '#fff')}${dot(x + 20.4, y - 5.6, 1.1, '#2b2422')}${line(`M${x + 15} ${y - 3.2} q2.4 1.6 4.4 0`, '#5a4a42', 0.7)}`;
    return s;
  }
  // the old apple tree at the corner of the paddock, windfalls and the basket
  function appleTree() {
    const x = 366, r = U.rng(131);
    let s = `${shadow(x + 2, 472, 34, 4)}<path d="M${x - 7} 474 Q${x - 3} 450 ${x - 4} 436 L${x + 5} 436 Q${x + 5} 452 ${x + 9} 474Z" fill="#7a5a42"/>${line(`M${x - 2} 440 Q${x - 18} 428 ${x - 26} 412 M${x + 3} 438 Q${x + 18} 426 ${x + 24} 408`, '#7a5a42', 3.6)}`;
    if (winter()) return s + line(`M${x - 26} 412 l-7 -8 M${x + 24} 408 l6 -9 M${x - 12} 428 l-4 -12 M${x + 12} 428 l2 -13`, '#7a5a42', 1.5) + line(`M${x - 25} 411 l-7 -8 M${x + 23} 408 l6 -9 M${x - 17} 426 Q${x - 2} 438 ${x + 15} 426`, SNOW, 1.2);
    const leaf = { spring: ['#b5d595', '#fbf6f0', '#f6dfe6'], summer: ['#6aa858', '#5f9a4c', '#7bb863'], autumn: ['#c9a24a', '#a8a84e', '#d9822b'] }[SEASON];
    for (const [cx, cy, rr] of [[x, 404, 36], [x - 26, 414, 22], [x + 24, 412, 22], [x - 12, 388, 20], [x + 14, 386, 20]]) s += dot(cx, cy, rr, leaf[0]);
    for (let i = 0; i < 46; i++) s += dot(x - 42 + r() * 84, 372 + r() * 62, 2 + r() * 2.6, U.pick(r, leaf));
    if (SEASON !== 'spring') for (let i = 0; i < 14; i++) s += dot(x - 34 + r() * 68, 382 + r() * 48, 2.3, SEASON === 'autumn' ? '#d9473c' : '#c9b84a');
    return s;
  }
  function apple(x, y, c = '#d9473c', r = 3) {
    return `${dot(x, y, r, c)}${dot(x - r * 0.3, y - r * 0.35, r * 0.28, '#fff', 0.5)}${line(`M${x} ${y - r} l${f1(r * 0.3)} -1.4`, '#6b4a32', 0.7)}`;
  }
  function apples(st) {
    const p = pend(st, 'apples'), ok = st.apples && !p, x = 322, y = 474;
    const basket = (full) => {
      let s = `${shadow(x, y + 13, 19, 2.6)}`;
      if (full) for (const [dx, dy, c] of [[-10, -3, '#d9473c'], [-3, -6, '#e2574c'], [4, -4, '#c9b84a'], [10, -3, '#d9473c'], [-7, -8, '#c9b84a'], [1, -9.6, '#d9473c'], [7, -8.4, '#e2574c']]) s += apple(x + dx, y + dy, c);
      s += `<path d="M${x - 16} ${y - 3} H${x + 16} L${x + 12} ${y + 13} H${x - 12}Z" fill="#c9a06a"/>${line(`M${x - 15} ${y + 2} H${x + 15} M${x - 13.6} ${y + 7} H${x + 13.6}`, '#a47a49', 1)}`;
      for (let dx = -12; dx <= 12; dx += 6) s += line(`M${x + dx} ${y - 3} L${x + dx * 0.8} ${y + 13}`, '#a47a49', 0.8);
      s += `${box(x - 17, y - 5, 34, 3, '#b98f5a', ' rx="1.4"')}${line(`M${x - 14} ${y - 4} Q${x} ${y - 24} ${x + 14} ${y - 4}`, '#a47a49', 1.8)}`;
      return s;
    };
    let s = '<g data-part="apples">';
    if (!st.apples) {
      // the basket on its side, windfalls in the long grass all round the tree
      s += `<g transform="rotate(-72 ${x} ${y + 6})">${basket(false)}</g>`;
      const r = U.rng(141);
      for (let i = 0; i < 15; i++) s += apple(274 + r() * 118, 448 + r() * 44, i % 3 ? '#d9473c' : '#c9b84a', 2.8);
    } else if (p) {
      s += basket(false);
      for (const [ax, ay, c] of [[350, 462, '#d9473c'], [372, 486, '#c9b84a'], [296, 482, '#d9473c'], [342, 490, '#d9473c'], [388, 470, '#c9b84a']]) s += apple(ax, ay, c, 2.8);
    } else {
      s += basket(true) + apple(344, 488, '#d9473c', 2.8);
      if (winter()) s += `<path d="M${x - 16} ${y - 5} Q${x} ${y - 13} ${x + 16} ${y - 5}Z" fill="${SNOW}"/>`;
    }
    return s + '</g>';
  }
  // foxgloves growing wild by the fence: the place's name, in spring and summer
  function wild() {
    if (SEASON !== 'spring' && SEASON !== 'summer') return '';
    const h = SEASON === 'summer' ? 44 : 34;
    return `<g class="fs-sway">${foxglove(18, 432, h)}${foxglove(30, 438, h - 8, '#e3a0c8')}${foxglove(8, 442, h - 10, '#b75f98')}</g>`;
  }
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}">${oval(276, 372, 9, 6, '#7d8079')}${oval(276, 368, 7, 2.6, '#5f625c')}${line('M269 368 q7 -8 14 0', '#5f625c', 0.9)}
      <g transform="rotate(-10 158 382)">${box(144, 374, 28, 12, '#a8875a')}${line('M144 380 H172 M152 374 V386 M164 374 V386', '#8a6a42', 1)}</g>
      <g transform="rotate(14 306 396)">${box(296, 392, 22, 5, '#8a6a4a')}</g>${line('M56 412 l3 -6 M62 416 l4 -7', '#8a6a4a', 2)}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="359.5" y="504" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 361 500)">
      <rect x="337" y="490" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="361" y="503.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 361 508)"><rect x="334" y="504" width="54" height="10" fill="#d9534f"/><text x="361" y="512" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot. The ones
  // standing in the yard are drawn with the yard, behind the fence and the tree.
  const IN_YARD = new Set(['fs-block', 'fs-trough', 'fs-kennel']);
  const BARN_BULBS = [];
  for (let i = 0; i <= 8; i++) BARN_BULBS.push([6 + i * 7.5, 202 - i * 6.9 + (i % 2 ? 2 : 0)]);
  for (let i = 1; i <= 8; i++) BARN_BULBS.push([66 + i * 7.5, 146 + i * 6.9 + (i % 2 ? 2 : 0)]);
  const EAVE_BULBS = [];
  for (let i = 0; i < 16; i++) EAVE_BULBS.push([128 + i * 18, 245 + (i % 2 ? 2.4 : 0)]);
  const BULBS = BARN_BULBS.concat(EAVE_BULBS);
  const BULB_COLS = ['#ffd98a', '#efb4ae', '#a6d3d4', '#fff3c4'];
  function lightsOn() {
    const path = `M${BARN_BULBS.slice(0, 9).map(([x, y]) => `${f1(x)} ${f1(y - 1)}`).join(' L')} L${BARN_BULBS.slice(9).map(([x, y]) => `${f1(x)} ${f1(y - 1)}`).join(' L')}`;
    const eave = `M${EAVE_BULBS.map(([x, y]) => `${f1(x)} ${f1(y - 1)}`).join(' L')}`;
    return `<g>${line(path, '#3d3d42', 0.6, 0.7)}${line(eave, '#3d3d42', 0.6, 0.7)}${BULBS.map(([x, y], i) => dot(x, y, 1.7, BULB_COLS[i % 4])).join('')}</g>`;
  }
  const DECOR = {
    // a horseshoe, points up for luck, over the tack-room door
    'fs-shoe': () => `<g><path d="M368 276 v3 a5 5.4 0 0 0 10 0 v-3" stroke="#c9ced4" stroke-width="2.4" fill="none" stroke-linecap="round"/>${dot(368, 279, 0.5, '#2a2a30')}${dot(378, 279, 0.5, '#2a2a30')}${dot(373, 284, 0.5, '#2a2a30')}</g>`,
    // a swallows' mud nest under the eaves, and the swallows
    'fs-swallows': () => {
      let s = `<path d="M306 245 q7 9 15 0Z" fill="#a8906e"/>${dot(310, 247, 0.9, '#8a7458')}${dot(315, 248, 1, '#8a7458')}${dot(318, 246.4, 0.7, '#8a7458')}`;
      if (winter()) return `<g>${s}</g>`;
      s += `${dot(311, 244.6, 1.4, '#2f3a5a')}${dot(315, 244.2, 1.4, '#2f3a5a')}`;
      s += `<g transform="translate(348 214)"><g class="fs-flit"><path d="M0 0 q-7 -5 -13 -3 q6 1 8 4 l-6 7 q7 -3 10 -7 q5 -1 9 1 q-3 -3 -8 -2Z" fill="#2f3a5a"/><path d="M-3 1 q3 2 6 0" stroke="#e2683a" stroke-width="1"/></g></g>`;
      return `<g>${s}</g>`;
    },
    // a mounting block of three stone steps, in the yard by the third door
    'fs-block': () => {
      const c = winter() ? '#dfe4e8' : '#cfc4b0', dk = U.shade(c, -0.2);
      return `<g>${shadow(314, 374, 23, 2.2)}${box(292, 362, 42, 12, c, ' rx="1"')}${box(292, 370, 42, 4, dk, ' rx="1"')}${box(292, 351, 28, 11, c, ' rx="1"')}${box(292, 359, 28, 3, dk)}${box(292, 340, 14, 11, c, ' rx="1"')}${box(292, 348, 14, 3, dk)}${line('M300 366 h10 M316 368 h8', dk, 0.6)}${winter() ? box(292, 339, 14, 2, SNOW, ' rx="1"') + box(306, 350, 14, 2, SNOW, ' rx="1"') + box(320, 361, 14, 2, SNOW, ' rx="1"') : ''}</g>`;
    },
    // a border of foxgloves along the fence
    'fs-foxgloves': () => {
      const on = !winter();
      let s = '';
      for (const [x, y, h, c] of [[250, 420, 34, '#c770a6'], [263, 418, 28, '#e3a0c8'], [276, 421, 36, '#b75f98'], [289, 418, 30, '#c770a6'], [302, 420, 34, '#e3a0c8'], [315, 419, 28, '#b75f98'], [328, 421, 32, '#c770a6']]) {
        s += on && SEASON !== 'autumn' ? foxglove(x, y, h, c) : line(`M${x} ${y} V${y - h * 0.7}`, winter() ? '#b5a890' : '#8a7a4a', 1.1) + oval(x - 3, y - 2, 4, 1.6, winter() ? SNOW : '#8a8a4a');
      }
      return `<g class="fs-sway">${s}</g>`;
    },
    // a board of rosettes between the third door and the tack-room window
    'fs-rosettes': () => {
      const rosette = (x, y, c) => `<path d="M${x - 1.6} ${y + 2} l-1.6 6 l2 -1 l1 1.6Z M${x + 1.6} ${y + 2} l1.6 6 l-2 -1 l-1 1.6Z" fill="${c}"/>${dot(x, y, 3.4, c)}${dot(x, y, 2, '#f6efe0')}${dot(x, y, 0.9, '#d9b45a')}`;
      return `<g>${box(284.5, 252, 9.5, 40, '#5f4029', ' rx="1"')}${rosette(289.2, 258, '#c9474f')}${rosette(289.2, 271, '#5d7fd8')}${rosette(289.2, 284, '#f2c84b')}</g>`;
    },
    // an old stone trough full of flowers at the corner of the barn
    'fs-trough': () => {
      const c = winter() ? '#dfe4e8' : '#c6bba6', on = !winter();
      const r = U.rng(171);
      let s = `${shadow(116, 342, 18, 2.2)}`;
      if (on) for (let i = 0; i < 14; i++) s += dot(102 + r() * 28, 325 + r() * 7, 2 + r() * 1.4, U.pick(r, ['#6f9a56', '#5f8a4a', '#efb4ae', '#f2d88a', '#bba9df', '#e2768b']));
      return `<g>${s}${box(100, 330, 32, 11, c, ' rx="1.6"')}${box(100, 330, 32, 2, U.shade(c, 0.12), ' rx="1"')}${line('M100 338 H132', U.shade(c, -0.18), 0.7)}</g>`;
    },
    // a little hen run in the corner of the paddock
    'fs-hens': () => {
      const hen = (x, y, c, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">${oval(0, 0, 5.4, 4, c)}<path d="M-5 -1 l-3.4 -3 l1 4Z" fill="${U.shade(c, -0.2)}"/><g class="fs-peck">${dot(5, -3.4, 2.4, c)}<path d="M7 -3.8 l2 0.6 l-2 0.6Z" fill="#e9a23c"/><path d="M4 -6 q1 -1.6 2 0 q1 -1.2 1.6 0.4Z" fill="#c9474f"/></g>${line('M-1 4 v2.4 M2 4 v2.4', '#e9a23c', 0.8)}</g>`;
      let s = `${shadow(34, 532, 30, 2.4)}`;
      s += `<path d="M10 528 V510 L26 498 L42 510 V528Z" fill="${K.oak}"/><path d="M6 512 L26 496 L46 512" stroke="${K.oakDk}" stroke-width="3" fill="none" stroke-linecap="round"/>${line('M16 510 V528 M36 510 V528', K.oakDk, 0.7)}${box(22, 516, 8, 12, '#2f2418', ' rx="3"')}`;
      if (winter()) s += line('M7 511 L26 496 L45 511', SNOW, 2.6);
      return `<g>${s}${hen(58, 526, '#c97a3a')}${hen(74, 530, '#f4efe6', true)}${hen(46, 533, '#7d5a3a')}</g>`;
    },
    // a kennel for the collie by the barn wall
    'fs-kennel': () => {
      const c = K.trim;
      let s = `${shadow(20, 346, 18, 2)}<path d="M4 344 V330 L20 319 L36 330 V344Z" fill="${c}"/><path d="M1 332 L20 317 L39 332" stroke="${K.oakDk}" stroke-width="3" fill="none" stroke-linecap="round"/>${line('M10 329 V344 M30 329 V344', U.shade(c, -0.2), 0.7)}<path d="M14 344 V336 a6 6 0 0 1 12 0 V344Z" fill="#2f2418"/>`;
      if (winter()) s += line('M2 331 L20 317 L38 331', SNOW, 2.6);
      return `<g>${s}</g>`;
    },
    'fs-lights': () => lightsOn(),
    // a white dovecote on the ridge of the block, doves on its sill
    'fs-dovecote': () => {
      const c = '#f6f0e3', dk = '#c9c1b0', dove = (x, y) => `${oval(x, y, 3.4, 2.2, '#fbf8f2')}${dot(x + 2.8, y - 1.6, 1.5, '#fbf8f2')}<path d="M${x + 4} ${y - 1.8} l1.4 0.4 l-1.4 0.4Z" fill="#e9a23c"/>`;
      let s = `<path d="M286 186 V164 H318 V186Z" fill="${c}"/>${line('M297 164 V186 M307 164 V186', dk, 0.6)}<path d="M280 166 L302 148 L324 166Z" fill="${K.oakDk}"/>`;
      for (const x of [291, 302, 313]) s += `<path d="M${x - 3} 178 v-5 a3 3 0 0 1 6 0 v5Z" fill="#3a3028"/>${box(x - 4.4, 178, 8.8, 1.4, dk)}`;
      s += dove(294, 176.6) + dove(312, 176.6) + dove(318, 160);
      if (winter()) s += line('M281 166 L302 149 L323 166', SNOW, 2.4);
      return `<g>${s}</g>`;
    },
    // a little pony cart, waiting by the barn
    'fs-cart': () => {
      const c = '#3f6b4e', w = '#c9474f';
      const wheel = (x, y, r) => { let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${w}" stroke-width="1.8"/>`; for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; s += line(`M${x} ${y} L${f1(x + Math.cos(a) * r)} ${f1(y + Math.sin(a) * r)}`, w, 0.8); } return s + dot(x, y, 1.7, '#3d3d42'); };
      return `<g>${shadow(362, 531, 30, 2.6)}${line('M344 512 L398 531', K.oakDk, 1.9)}<path d="M332 494 H376 L372 512 H336Z" fill="${c}"/>${box(330, 491, 48, 3.4, '#f6f0e3', ' rx="1"')}${box(336, 482, 28, 3.2, K.oak, ' rx="1"')}${line('M340 485 v6 M360 485 v6', K.oakDk, 1.2)}${wheel(354, 515, 14)}${winter() ? box(336, 481, 28, 2, SNOW, ' rx="1"') : ''}</g>`;
    },
    // a running-horse weathervane on the peak of the barn
    'fs-vane': () => `<g>${line('M66 142 V114', '#3d3d42', 1.3)}${line('M58 126 H74', '#3d3d42', 0.8)}${text(56, 128.6, 'W', 5, '#3d3d42')}${text(76, 128.6, 'E', 5, '#3d3d42')}<path d="M54 112 q3 -4 7 -3 l5 -3 q4 -3 8 -2 l3 -3 l0.6 3.6 q2 1 1 3 l-3 -0.4 q-3 3 -8 3 l-1 5 l3 3 h-2.4 l-4 -4 l-4 1 l-3 5 h-2.4 l2.4 -6 q-2 -1 -2.4 -3 q-2 1 -3 1Z" fill="#3d3d42"/></g>`,
  };
  function decorations(owned, yardOnes) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && IN_YARD.has(k) === yardOnes) s += DECOR[k]();
    return s;
  }

  function butterfly(x, y, col) {
    return `<g transform="translate(${f1(x)} ${f1(y)})"><g class="fs-flit"><g class="fs-wing"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="${col}"/></g>${line('M0 -2 V2', '#3d3d42', 0.8)}</g></g>`;
  }
  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M172 112 q4 -4 8 0 q4 -4 8 0 M196 124 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    if (PCT > 0.5 && st.paddock && (SEASON === 'summer' || SEASON === 'spring')) s += `<g pointer-events="none">${butterfly(150, 432, '#f2a7b8')}${butterfly(262, 462, '#fbd85c')}</g>`;
    // a robin on the gate in winter
    if (winter() && PCT > 0.5) s += `<g>${oval(204, 376, 3.6, 2.8, '#8a6a52')}${oval(205.4, 377, 2.2, 1.9, '#e2683a')}${dot(206.6, 373.6, 1.8, '#8a6a52')}${dot(207.2, 373.2, 0.5, '#222')}<path d="M208.2 373.8 l1.6 0.4 l-1.6 0.4Z" fill="#5a4a3a"/></g>`;
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
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#fbf2f4" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the lit stable doors, the tack-room
  // window and the lanterns. Every light here is drawn with a warm fill or a
  // Glow gradient, so the goodnight ending can switch them off.
  function night(st, decor) {
    const [A, B] = STALLS, win = st.window && !PEND.window, doors = st.doors && !PEND.doors, open = st.stable && !PEND.stable, barn = st.barn && !PEND.barn;
    let holes = '';
    if (win) holes += `<rect x="${WIN.x0}" y="${WIN.y0}" width="48" height="38"/>`;
    if (doors) holes += `<rect x="${B.x0}" y="${TOP}" width="36" height="${MID - TOP}"/><path d="M211 265 Q206 259 200 261 Q190 265 182 278 Q178 286 183 290 Q189 294 195 288 Q203 280 213 276Z"/>${LANTS.map((x) => `<rect x="${x - 3.4}" y="251" width="6.8" height="6"/>`).join('')}`;
    if (open) holes += `<rect x="${A.x0}" y="${TOP}" width="36" height="${FOOT - TOP}"/>`;
    if (barn) holes += `<rect x="${BARNDOOR.x0}" y="${BARNDOOR.y0}" width="${BARNDOOR.x1 - BARNDOOR.x0}" height="${320 - BARNDOOR.y0}"/>`;
    let s = `<mask id="${id('Night')}"><rect y="-4" width="400" height="548" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect y="-4" width="400" height="548" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Night')})"/>
      <rect y="-4" width="400" height="548" fill="#24306a" opacity="0.18" mask="url(#${id('Night')})"/>`;
    for (let i = 0; i < 32; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 150)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="57" cy="52" r="14" fill="#000"/></mask><circle cx="50" cy="58" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="50" cy="58" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (win) s += `${box(WIN.x0, WIN.y0, 48, 38, '#ffd98a', ' opacity="0.22"')}${glow(322, 274, 56, 40)}${glow(322, 336, 40, 8)}`;
    if (doors) {
      s += `${box(B.x0, TOP, 36, MID - TOP, '#ffd98a', ' opacity="0.06"')}${glow(208, 272, 42, 30)}`;
      for (const x of LANTS) s += `${box(x - 3, 251, 6, 6, '#ffe9b0', ' opacity="0.8"')}${glow(x, 254, 15, 13)}${glow(x, 336, 18, 4)}`;
    }
    if (open) s += `${box(A.x0, TOP, 36, FOOT - TOP, '#ffd98a', ' opacity="0.14"')}${glow(158, 296, 34, 30)}`;
    if (barn) s += `${box(BARNDOOR.x0, BARNDOOR.y0, 56, 74, '#ffd98a', ' opacity="0.1"')}${glow(66, 286, 40, 34)}`;
    if (decor['fs-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    yard: [262, 372], paddock: [150, 500], fence: [120, 392], doors: [258, 286], jumps: [84, 456], sign: [60, 364], window: [322, 272], tack: [322, 272],
    stable: [158, 296], pony: [212, 440], trough: [246, 362], barn: [66, 240], apples: [322, 470], mane: [208, 276], saddles: [326, 322],
  };
  const PARTS = ['yard', 'paddock', 'fence', 'doors', 'jumps', 'sign', 'window', 'tack', 'stable', 'pony', 'trough', 'barn', 'apples', 'mane', 'saddles'];
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

  // st: map of restored part -> true; cols: chosen paint colours (stableFence,
  // stableDoor, jumps, stableSign); opts as for CURIO.render plus resting: true
  // when there is nothing to do here this season
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night; RESTING = !!opts.resting;
    const decor = opts.decor || {};
    palette({ stableFence: cols.stableFence || '#f4ecdc', stableDoor: cols.stableDoor || '#4e7b5b', jumps: cols.jumps || '#c9474f', stableSign: cols.stableSign || '#4e7b5b' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house stables">
      ${style()}${defs()}${sky()}${far()}${oak()}${paddock(st)}${yard(st)}${barn(st)}
      ${roof()}${walls()}${stable(st, C)}${doorPony(st)}${tackRoom(st)}${tackWindow(st)}${tackDoor()}${saddles(st)}
      ${decorations(decor, true)}${trough(st)}${dog()}${sign(st, C)}${clutter()}${fence(st, C)}${wild()}${paddockPony(st)}${appleTree()}${jumps(st, C)}${apples(st)}${saleSign()}
      ${decorations(decor, false)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
