'use strict';
// The rescue overview, drawn as SVG the same way as the cottage (house.js),
// the café and the cove. An old farm that takes in dogs, cats, rabbits, a
// donkey and the odd seal pup; the animals are content whether anyone visits
// or not, the place just gets lovelier. Each restorable part has a tired look
// and a restored look; the paddock fence, the farmhouse door and the sign take
// the colours chosen while painting. Every id carries an 'r' prefix (plus
// opts.uid when given) so this picture can share a page with the others.

const RESCUE = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the rescue is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {};
  const id = (n) => `r${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const paw = (x, y, k, col) => `${oval(x, y + 1.2 * k, 2.2 * k, 1.8 * k, col)}${dot(x - 2.2 * k, y - 1.2 * k, 0.9 * k, col)}${dot(x - 0.8 * k, y - 2.5 * k, 0.9 * k, col)}${dot(x + 0.8 * k, y - 2.5 * k, 0.9 * k, col)}${dot(x + 2.2 * k, y - 1.2 * k, 0.9 * k, col)}`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#b6d2ad', '#9fc392'], summer: ['#a9cf98', '#8fc27b'], autumn: ['#d4c08e', '#c6aa6c'], winter: ['#e6edf2', '#dbe4ea'] };
  const GRASS = {
    spring: ['#8fbf6a', '#79ad57', '#a6cf7f'], summer: ['#86bb5e', '#70a64c', '#9fcb72'],
    autumn: ['#bdb06c', '#a59858', '#cfc282'], winter: ['#e9eff4', '#d9e3ea', '#f5f8fb'],
  };
  const CANOPY = { spring: ['#6f9d5c', '#7aa866'], summer: ['#5f9a4c', '#6aa858'], autumn: ['#d9822b', '#c9692f'], winter: null };
  const TALL = { spring: ['#6a9846', '#4f8034', '#88b35c'], summer: ['#5f9440', '#47782e', '#7fae52'], autumn: ['#a5975a', '#857842', '#c2b274'], winter: ['#b9bca6', '#9a9c86', '#d9dccb'] };

  // a point along a chain of cubic curves, u from 0 to the number of curves
  function bez(pts, i, t) {
    const p0 = pts[i * 3], p1 = pts[i * 3 + 1], p2 = pts[i * 3 + 2], p3 = pts[i * 3 + 3], m = 1 - t;
    return [0, 1].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]);
  }
  const along = (pts, u) => { const n = (pts.length - 1) / 3, i = Math.min(n - 1, Math.floor(u)); return bez(pts, i, Math.min(1, u - i)); };
  const seg = (pts, i) => `M${pts[i * 3].join(' ')} C${pts[i * 3 + 1].join(' ')} ${pts[i * 3 + 2].join(' ')} ${pts[i * 3 + 3].join(' ')}`;

  // ---------------------------------------------------------------- shapes
  const TRAIL = [[206, 254], [246, 242], [252, 228], [222, 216], [192, 204], [190, 192], [220, 182], [246, 173], [246, 162], [230, 148]];
  const BARN_D = 'M12 290 V208 L24 167 L79 135 L134 167 L146 208 V290Z';
  const ROOF_PTS = [[7, 212], [20, 165], [79, 130], [138, 165], [151, 212]];
  const ROOF_D = 'M' + ROOF_PTS.map((p) => p.join(' ')).join(' L');
  const YARD_D = 'M160 298 L282 298 L298 404 L144 404Z';
  const LANE_D = 'M176 404 L224 404 L234 540 L166 540Z';
  const MEADOW = ['M0 397 Q40 390 80 395 T145.5 393 L144 404 L176 404 L166 540 L0 540Z', 'M296.5 393 Q330 388 360 394 T400 393 V540 L234 540 L224 404 L298 404Z'];
  const KX = [168, 199, 230];
  const COATS = [['#e2b36a', '#f6dca6'], ['#3b3533', '#f4efe6'], ['#a8754a', '#d9b08a']];

  // little css of our own: wagging tails, bobbing ducks, a swimming seal
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .rs-wag{animation:rswag .45s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:0% 100%}
      @keyframes rswag{from{transform:rotate(-16deg)}to{transform:rotate(18deg)}}
      #scene .rs-bob{animation:rsbob 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center bottom}
      @keyframes rsbob{from{transform:translate(-1.5px,0) rotate(-2deg)}to{transform:translate(1.5px,-.5px) rotate(2deg)}}
      #scene .rs-swim{animation:rsswim 5s ease-in-out infinite alternate}
      @keyframes rsswim{to{transform:translateX(-12px)}}
      #scene .rs-ear{animation:rsear 4.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes rsear{0%,78%,100%{transform:rotate(0)}86%{transform:rotate(-14deg)}}
      #scene .rs-breathe{animation:rsbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes rsbreathe{50%{transform:scaleY(1.07)}}
      #scene .rs-glint{animation:rsglint 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes rsglint{0%,100%{opacity:.2;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}
      #scene .rs-bub{animation:rsbub 3.2s ease-in infinite;transform-box:fill-box}
      @keyframes rsbub{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-18px);opacity:0}}
      #scene .rs-flap{animation:rsflap 2.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes rsflap{to{transform:rotate(5deg) scaleY(.92)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      grass: GRASS[SEASON].map((c) => (winter() ? c : U.mix(c, '#a3a07c', k))),
      barn: U.mix('#b5533c', '#8e8178', k * 1.4),
      roof: U.mix('#5b3a32', '#5f5a54', k),
      house: U.mix('#f1e7d3', '#bfb5a4', k * 1.3),
      slate: U.mix('#6f7b86', '#7d776f', k),
      wood: U.mix('#c98a55', '#9a8f80', k * 1.3),
      kroof: U.mix('#7a4a35', '#6f6a60', k),
    };
  }

  function defs() {
    const g = K.grass, T = TALL[SEASON];
    const dand = winter() ? '<ellipse cx="12" cy="10" rx="6" ry="2" fill="#fff" opacity="0.85"/><ellipse cx="34" cy="28" rx="7" ry="2.2" fill="#fff" opacity="0.75"/>'
      : SEASON === 'autumn' ? '<circle cx="8" cy="9" r="1.8" fill="#ece6d4"/><circle cx="31" cy="27" r="1.6" fill="#ece6d4"/>'
        : '<circle cx="8" cy="9" r="1.8" fill="#f3cf3a"/><circle cx="31" cy="27" r="1.6" fill="#f3cf3a"/><circle cx="22" cy="6" r="1.4" fill="#fff"/>';
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <pattern id="${id('Tall')}" width="14" height="12" patternUnits="userSpaceOnUse">
        <rect width="14" height="12" fill="${T[0]}"/>
        <path d="M2 12 Q3 6 1 2 M5 12 Q6 7 7 3 M9 12 Q8 6 10 1 M12 12 Q13 8 12 4" stroke="${T[1]}" stroke-width="1.2" fill="none"/>
        <path d="M3.5 12 Q5 8 4 5 M10.5 12 Q11 9 13 6" stroke="${T[2]}" stroke-width="1" fill="none"/>
      </pattern>
      <pattern id="${id('Dand')}" width="46" height="38" patternUnits="userSpaceOnUse">${dand}</pattern>
      <pattern id="${id('Mow')}" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="${g[1]}"/><rect width="14" height="28" fill="${g[2]}"/>
      </pattern>
      <pattern id="${id('Flags')}" width="30" height="22" patternUnits="userSpaceOnUse">
        <rect width="30" height="22" fill="#b3a487"/>
        <rect x="1" y="1" width="16" height="9" rx="2" fill="#dccfb6"/><rect x="19" y="1" width="10" height="9" rx="2" fill="#d4c6aa"/>
        <rect x="1" y="12" width="9" height="9" rx="2" fill="#d9cbb0"/><rect x="12" y="12" width="17" height="9" rx="2" fill="#e4d8c1"/>
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
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Room')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe4a8"/><stop offset="1" stop-color="#f0a95f"/></linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7f7a69"/><stop offset="1" stop-color="#5f5a4e"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('PondG')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0e0"/><stop offset="1" stop-color="#4f9bb3"/></linearGradient>
      <radialGradient id="${id('Pool')}" cx="0.45" cy="0.4" r="0.6"><stop offset="0" stop-color="#b6e8ee"/><stop offset="1" stop-color="#5fb3c9"/></radialGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <pattern id="${id('Barn')}" width="8" height="40" patternUnits="userSpaceOnUse">
        <rect width="8" height="40" fill="${K.barn}"/><rect x="7.2" width="0.8" height="40" fill="${U.shade(K.barn, -0.3)}"/><rect width="1" height="40" fill="#fff" opacity="0.15"/>
      </pattern>
      <pattern id="${id('Stone')}" width="26" height="16" patternUnits="userSpaceOnUse">
        <path d="M0 8 H26 M8 0 V8 M20 8 V16" stroke="#000" stroke-width="0.5" opacity="0.08"/><circle cx="14" cy="4" r="1" fill="#fff" opacity="0.25"/>
      </pattern>
      <pattern id="${id('Stain')}" width="60" height="50" patternUnits="userSpaceOnUse">
        <ellipse cx="14" cy="18" rx="12" ry="8" fill="#000" opacity="0.07"/><ellipse cx="44" cy="38" rx="10" ry="12" fill="#000" opacity="0.06"/>
        <path d="M34 4 l3 6 l-2 5 l3 7" stroke="#6b5f4d" stroke-width="0.7" fill="none" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Slate')}" width="12" height="7" patternUnits="userSpaceOnUse">
        <rect width="12" height="7" fill="${K.slate}"/><path d="M0 6.6 H12 M6 0 V6.6" stroke="${U.shade(K.slate, -0.25)}" stroke-width="0.7"/><rect x="0.6" y="0.6" width="4" height="1.2" fill="#fff" opacity="0.12"/>
      </pattern>
      <pattern id="${id('Straw')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="#e8c766"/><path d="M0 2 l5 -1.4 M4 6 l7 -2 M1 7 l4 0.6 M7 2 l5 1" stroke="#c9a03f" stroke-width="0.8"/><path d="M2 4 l4 -1" stroke="#fff3c4" stroke-width="0.6"/>
      </pattern>
      <pattern id="${id('StrawOld')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="#9a907e"/><path d="M0 2 l5 -1.4 M4 6 l7 -2 M1 7 l4 0.6" stroke="#77705f" stroke-width="0.8"/><circle cx="9" cy="5" r="0.7" fill="#5f574a"/>
      </pattern>
    </defs>`;
  }

  // --------------------------------------------------------- sky and hills
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="300" fill="${url('Sky')}"/>
    <circle cx="336" cy="54" r="46" fill="${url('Sun')}"/><circle cx="336" cy="54" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="62" cy="54" rx="25" ry="10"/><ellipse cx="81" cy="47" rx="17" ry="12"/><ellipse cx="99" cy="55" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="208" cy="88" rx="19" ry="7"/><ellipse cx="223" cy="83" rx="13" ry="9"/><ellipse cx="237" cy="89" rx="14" ry="6"/></g>`;
  }
  function bgTree(x, y, r, which) {
    if (!CANOPY[SEASON]) {
      return `<g stroke="#7a6252" stroke-linecap="round" fill="none"><path d="M${x} ${f1(y + r * 0.9)} V${f1(y - r * 0.4)}" stroke-width="2.6"/>
        <path d="M${x} ${y} l${f1(-r * 0.4)} ${f1(-r * 0.4)} M${x} ${f1(y - r * 0.15)} l${f1(r * 0.45)} ${f1(-r * 0.35)}" stroke-width="1.4"/></g>${oval(x, y + r * 0.92, r * 0.5, 2, '#fff')}`;
    }
    const col = CANOPY[SEASON][which];
    let s = `<g><rect x="${x - 2}" y="${y}" width="4" height="${f1(r * 0.9)}" fill="#6b5240"/>${dot(x, y - r * 0.15, r * 0.62, col)}${dot(x - r * 0.35, y + r * 0.1, r * 0.45, col)}${dot(x + r * 0.35, y + r * 0.08, r * 0.48, U.shade(col, -0.1))}${dot(x - r * 0.15, y - r * 0.35, r * 0.3, U.shade(col, 0.15))}`;
    if (SEASON === 'spring') s += `${dot(x - r * 0.3, y - r * 0.3, 1.6, '#f7c3d6')}${dot(x + r * 0.2, y - r * 0.05, 1.4, '#fbe0ea')}${dot(x + r * 0.45, y + r * 0.25, 1.5, '#f7c3d6')}`;
    return s + '</g>';
  }
  function hills(st) {
    const H = HILLS[SEASON];
    let s = `<path d="M0 182 Q64 154 132 166 T262 152 T400 160 V300 H0Z" fill="${H[0]}"/>`;
    s += bgTree(20, 172, 20, 0) + bgTree(44, 168, 15, 1) + bgTree(372, 158, 22, 0) + bgTree(396, 166, 15, 1) + bgTree(158, 162, 12, 1);
    s += `<path d="M-10 244 C40 220 112 150 198 142 C272 136 332 182 410 200 V300 H-10Z" fill="${H[1]}"/>`;
    // a hedge along the top of the hill
    s += `<path d="M140 156 C166 146 186 142 204 141" stroke="${winter() ? '#c9d3da' : U.shade(H[1], -0.22)}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>`;
    return s + trail(st);
  }
  // the dog walk winding up the hill; a person and two dogs on it when it is clear
  function walker(x, y) {
    return `<g transform="translate(${f1(x)} ${f1(y)})"><path d="M-0.8 0 l-0.8 3.6 M0.8 0 l0.8 3.6" stroke="#3d3d42" stroke-width="0.9" stroke-linecap="round"/>
      <rect x="-2" y="-5.6" width="4" height="6" rx="1.6" fill="#c9474f"/>${dot(0, -7.6, 1.8, '#f2c9a0')}<path d="M-1.8 -8.4 q1.8 -2 3.6 0" fill="#6b4a32"/>
      <path d="M1.6 -2.4 Q5 -1 7.4 1.6 M-1.6 -2.4 Q-4.6 -0.4 -6.6 2" stroke="#3d3d42" stroke-width="0.35" fill="none"/>
      ${oval(9, 2.4, 2.6, 1.3, '#e2b36a')}${dot(11.2, 1.4, 1.2, '#e2b36a')}<path d="M6.6 2 l-1.2 -1.6" stroke="#e2b36a" stroke-width="0.8" stroke-linecap="round"/>
      ${oval(-8.4, 2.8, 2.4, 1.2, '#3b3533')}${dot(-10.4, 1.9, 1.1, '#3b3533')}<path d="M-6.2 2.4 l1.2 -1.6" stroke="#3b3533" stroke-width="0.8" stroke-linecap="round"/></g>`;
  }
  function trail(st) {
    const p = pend(st, 'trail'), ok = st.trail && p !== 'grow';
    const snowy = winter() || p === 'snow';
    const W = [7, 5, 3.4];
    // an invisible wide stroke makes the thin path easy to tap
    let s = `<g data-part="trail"><path d="${[0, 1, 2].map((i) => seg(TRAIL, i)).join(' ')}" stroke="#000" stroke-opacity="0" stroke-width="22" fill="none"/>`;
    if (ok) {
      const col = snowy ? '#dbe5ee' : '#e4d2a4', edge = snowy ? '#c6d3df' : '#c8b07c';
      for (let i = 0; i < 3; i++) s += `<path d="${seg(TRAIL, i)}" stroke="${edge}" stroke-width="${W[i] + 1.6}" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 3; i++) s += `<path d="${seg(TRAIL, i)}" stroke="${col}" stroke-width="${W[i]}" fill="none" stroke-linecap="round"/>`;
      if (p === 'leaves') { const r = U.rng(34); for (let i = 0; i < 16; i++) { const [x, y] = along(TRAIL, r() * 3); s += oval(x + (r() - 0.5) * 4, y, 1.8, 0.9, U.pick(r, ['#d9822b', '#c4462f', '#e9b23c'])); } }
      const [x, y] = along(TRAIL, 1.55);
      s += walker(x, y);
    } else {
      // overgrown: only a faint line left under the grass
      if (!snowy) for (let i = 0; i < 3; i++) s += `<path d="${seg(TRAIL, i)}" stroke="#c9b98c" stroke-width="${W[i]}" fill="none" stroke-linecap="round" opacity="0.35"/>`;
      const r = U.rng(33);
      let t = '';
      for (let i = 0; i < 34; i++) {
        const [x, y] = along(TRAIL, r() * 3), h = 2.4 + r() * 2.6, dx = (r() - 0.5) * 6;
        t += `M${f1(x - 1 + dx)} ${f1(y + 1.5)} l1.2 ${f1(-h)} M${f1(x + 0.6 + dx)} ${f1(y + 1.5)} l-0.8 ${f1(-h * 0.8)} `;
      }
      s += `<path d="${t}" stroke="${snowy ? '#9a8a74' : U.shade(HILLS[SEASON][1], -0.32)}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`;
    }
    return s + '</g>';
  }

  // the farmyard grass, with lighter and darker patches so it is not flat
  function ground() {
    const g = K.grass, r = U.rng(41);
    let s = `<path d="M0 266 Q120 250 210 256 T400 262 V540 H0Z" fill="${g[0]}"/>`;
    for (let i = 0; i < 20; i++) s += oval(r() * 400, 272 + r() * 120, 10 + r() * 22, 3 + r() * 4, r() < 0.5 ? g[1] : g[2], 0.55);
    return s;
  }

  // ---------------------------------------------------------- the paddock
  function meadow(st) {
    const p = pend(st, 'meadow'), ok = st.meadow && p !== 'grow';
    let s = '';
    for (const d of MEADOW) {
      s += '<g data-part="meadow">';
      if (!ok) {
        s += `<path d="${d}" fill="${url('Tall')}"/><path d="${d}" fill="${url('Dand')}"/>`;
        if (winter()) s += `<path d="${d}" fill="${url('Snow')}" opacity="0.55"/>`;
      } else if (winter() || p === 'snow') s += `<path d="${d}" fill="${url('Snow')}"/>`;
      else {
        s += `<path d="${d}" fill="${url('Mow')}"/>`;
        if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}"/>`;
        else if (SEASON === 'autumn') s += `<path d="${d}" fill="${url('Leaves')}" opacity="0.35"/>`;
      }
      s += '</g>';
    }
    return s;
  }

  // an old donkey, always there, quite content
  function donkey(x, y, k = 1, flip = false, fur = '#8f8478') {
    const belly = '#ded6ca', dark = U.shade(fur, -0.3);
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${flip ? -k : k} ${k})">${shadow(2, 21.4, 22, 2.6)}
      <path d="M-12 6 V20 M-6 7 V21 M8 7 V21 M13 6 V20" stroke="${fur}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M-12 19.6 v1.4 M-6 20.6 v1.4 M8 20.6 v1.4 M13 19.6 v1.4" stroke="#3d3833" stroke-width="3.6"/>
      <path d="M-17 -2 q-5 4 -4 12" stroke="${fur}" stroke-width="1.6" fill="none"/>${dot(-21, 11, 2, dark)}
      ${oval(0, 0, 18, 9.5, fur)}${oval(1, 4, 13, 4.6, belly, 0.8)}
      <path d="M10 -4 Q16 -14 20 -18 L27 -12 Q22 -6 16 4Z" fill="${fur}"/><path d="M11 -6 Q16 -15 21 -19" stroke="${dark}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="20" cy="-25" rx="2.2" ry="7" transform="rotate(-18 20 -25)" fill="${fur}"/><ellipse cx="24.5" cy="-25" rx="2.2" ry="7" transform="rotate(12 24.5 -25)" fill="${fur}"/>
      <ellipse cx="24.5" cy="-25" rx="0.9" ry="4.6" transform="rotate(12 24.5 -25)" fill="${dark}"/>
      <ellipse cx="27" cy="-14" rx="9" ry="5.6" transform="rotate(32 27 -14)" fill="${fur}"/>${oval(32, -9, 4.6, 3.8, belly)}
      ${dot(25.5, -17, 1.1, '#2b2422')}${dot(25.2, -17.3, 0.35, '#fff')}${dot(33.6, -9.2, 0.7, dark)}<path d="M30 -6.4 q2 1 4 0" stroke="${dark}" stroke-width="0.6" fill="none"/></g>`;
  }
  function pony(x, y, k) {
    const fur = '#9c5a35', mane = '#f2d58a';
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${k} ${k})">${shadow(2, 21.4, 20, 2.6)}
      <path d="M-11 6 V20 M-5 7 V21 M7 7 V21 M12 6 V20" stroke="${fur}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-11 19.6 v1.4 M-5 20.6 v1.4 M7 20.6 v1.4 M12 19.6 v1.4" stroke="#f4efe6" stroke-width="4.2"/>
      <path d="M-16 -3 q-7 6 -4 16" stroke="${mane}" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${oval(0, 0, 17, 10, fur)}<path d="M9 -5 Q14 -14 18 -17 L25 -11 Q20 -5 15 4Z" fill="${fur}"/>
      <path d="M8 -6 Q13 -16 19 -20 Q22 -12 14 -2Z" fill="${mane}"/>
      <path d="M17 -20 l1 -5 l3 4Z M21 -19 l2.6 -4 l1.4 4.6Z" fill="${fur}"/>
      <ellipse cx="24" cy="-12" rx="7.6" ry="5.2" transform="rotate(30 24 -12)" fill="${fur}"/>${oval(28.4, -8.4, 3.6, 3, '#c98a62')}
      <path d="M18 -21 q4 1 6 5" stroke="${mane}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${dot(23, -14.4, 1, '#2b2422')}${dot(29.4, -8.6, 0.6, '#5a2f1a')}</g>`;
  }
  // long grass hides the hooves until the paddock is mowed
  function hooves(st, x, y, k) {
    if (st.meadow && !PEND.meadow) return '';
    const col = TALL[SEASON][1];
    let s = '';
    for (const dx of [-14, -6, 6, 14]) s += `<path d="M${f1(x + dx * k - 3)} ${f1(y + 22 * k)} l1.4 -5 M${f1(x + dx * k)} ${f1(y + 22 * k)} l0.4 -6 M${f1(x + dx * k + 3)} ${f1(y + 22 * k)} l-1.2 -5" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/>`;
    return s;
  }

  function duck(x, y, mallard, flip) {
    return `<g transform="translate(${f1(x)} ${f1(y)})${flip ? ' scale(-1 1)' : ''}"><g class="rs-bob">${oval(0, 0, 5.6, 2.8, mallard ? '#8a7a64' : '#fbfbf8')}
      <path d="M-5 -1 q-3 -1 -3.6 1.4 q2 0.6 3.6 0Z" fill="${mallard ? '#6d5f4e' : '#e3dfd6'}"/>${dot(4, -3, 2.4, mallard ? '#2f7a4f' : '#fbfbf8')}
      <path d="M6 -3.2 l3 0.6 l-3 0.9Z" fill="#f2a33a"/>${dot(4.7, -3.7, 0.5, '#222')}${mallard ? '<path d="M2.4 -1.2 h3" stroke="#fff" stroke-width="0.7"/>' : ''}</g></g>`;
  }
  function pond(st) {
    const p = pend(st, 'pond'), ok = st.pond && p !== 'grow';
    const ice = st.pond && (p === 'frost' || p === 'snow' || winter());
    let s = `<g data-part="pond">${oval(322, 451, 52, 18.6, winter() ? '#d4dce2' : '#9e9584')}${oval(322, 450, 48, 15.6, ice ? '#dfeef5' : ok ? url('PondG') : '#5f7a3a')}`;
    if (ice) s += '<path d="M292 446 l18 -4 M326 456 l22 -5 M300 457 l10 -2" stroke="#fff" stroke-width="1.8"/>';
    else if (ok) {
      s += `<path d="M286 444 q8 -2 14 0 M340 459 q7 -2 13 0" stroke="#fff" stroke-width="1" fill="none" opacity="0.6"/>
        ${oval(352, 444, 6, 2.4, '#5fae5a')}${dot(353, 443, 1.4, '#f7b6c8')}${oval(296, 456, 5, 2, '#6bb865')}
        ${duck(306, 446, false, false)}${duck(334, 453, true, true)}`;
    } else {
      s += `${dot(300, 446, 2.4, '#7f9a4a')}${dot(318, 455, 2.8, '#86a04e')}${dot(340, 444, 2, '#93a85a')}${dot(352, 456, 2.2, '#7f9a4a')}${dot(288, 452, 1.6, '#93a85a')}
        <rect x="326" y="447" width="9" height="4" rx="1.6" fill="#b0b5b9" transform="rotate(-14 330 449)"/>`;
    }
    if (p === 'leaves') s += `<ellipse cx="322" cy="450" rx="46" ry="14.4" fill="${url('Leaves')}"/>`;
    // reeds and bulrushes at the far end
    const reed = winter() ? '#b8a27a' : SEASON === 'autumn' ? '#a8984e' : '#5f8a3a';
    s += `<path d="M364 452 q-2 -12 -1 -20 M368 452 q1 -10 3 -18 M372 453 q-1 -9 -4 -14 M360 452 q-3 -8 -7 -12" stroke="${reed}" stroke-width="1.6" fill="none" stroke-linecap="round"/>${oval(363, 433, 1.6, 4, '#7a5234')}${oval(371, 435, 1.6, 4, '#7a5234')}`;
    return s + '</g>';
  }

  // --------------------------------------------------------------- the barn
  function floor(st) {
    const p = pend(st, 'floor'), ok = st.floor;
    const xb = (t) => 46 + 66 * t, xt = (t) => 54 + 50 * t;
    const fl = 'M46 290 L112 290 L104 262 L54 262Z';
    let s = `<g data-part="floor"><rect x="46" y="214" width="66" height="76" fill="#3a2b22"/>
      <rect x="69" y="222" width="20" height="13" fill="${ok ? '#f3dfa0' : '#5f4c3c'}" opacity="0.85"/><path d="M79 222 V235 M69 228.5 H89" stroke="#3a2b22" stroke-width="1.4"/>
      <path d="M46 241 H112" stroke="#2a1f19" stroke-width="3"/>`;
    if (ok) {
      s += `<path d="${fl}" fill="#d9ab72"/>`;
      for (let i = 1; i < 8; i++) s += `<path d="M${f1(xb(i / 8))} 290 L${f1(xt(i / 8))} 262" stroke="#a8784a" stroke-width="0.8"/>`;
      // a bale of hay, and a lantern on the beam
      s += `${shadow(94, 283, 14, 1.8)}<rect x="81" y="266" width="26" height="16" rx="3" fill="#e5c25e"/><path d="M83 270 h22 M83 275 h22 M84 279 h20" stroke="#c49a3a" stroke-width="0.8"/>
        <path d="M88 266 v16 M100 266 v16" stroke="#9a6a2a" stroke-width="1"/>
        <path d="M60 242 V247" stroke="#2a1f19" stroke-width="0.8"/><rect x="57" y="247" width="6" height="8" rx="1.4" fill="#3d3d42"/><rect x="58.4" y="248.6" width="3.2" height="5" fill="#ffd98a"/>`;
    } else {
      // gaps where boards are missing, one plank sticking up and cobwebs
      s += `<path d="${fl}" fill="#5e4a3a"/>
        <path d="M${f1(xb(2 / 8))} 290 L${f1(xb(3 / 8))} 290 L${f1(xt(3 / 8))} 262 L${f1(xt(2 / 8))} 262Z" fill="#1e1612"/>
        <path d="M${f1(xb(5 / 8))} 290 L${f1(xb(5.6 / 8))} 290 L${f1(xt(5.6 / 8))} 262 L${f1(xt(5 / 8))} 262Z" fill="#1e1612"/>`;
      for (let i = 1; i < 8; i++) s += `<path d="M${f1(xb(i / 8))} 290 L${f1(xt(i / 8))} 262" stroke="#3f3127" stroke-width="0.8"/>`;
      s += `<g transform="rotate(-24 70 280)"><rect x="56" y="277" width="30" height="5" rx="1" fill="#7d6450"/></g>
        <path d="M46 214 l10 0 M46 214 l7 7 M46 214 l0 10 M48 214 q2 4 -2 6 M52 214 q-1 5 -6 6" stroke="#bdb6aa" stroke-width="0.5" fill="none"/>
        <path d="M112 214 l-10 0 M112 214 l-7 7 M112 214 l0 10 M108 214 q-1 4 4 5" stroke="#bdb6aa" stroke-width="0.5" fill="none"/>`;
    }
    if (p === 'snow') s += `<path d="M46 290 L112 290 L106 274 Q79 266 52 274Z" fill="${url('Snow')}"/>`;
    else if (p === 'leaves') s += `<path d="${fl}" fill="${url('Leaves')}"/>`;
    else if (p === 'grow') s += `<path d="${fl}" fill="${FADE}" opacity="0.5"/>`;
    return s + '</g>';
  }
  function barn(st) {
    const leaf = U.shade(K.barn, -0.08), trim = PCT > 0.4 ? '#f4ecdc' : '#cfc6b6';
    let s = `${shadow(79, 291, 78, 5)}<path d="${BARN_D}" fill="${url('Barn')}"/>`;
    // the big doors slid open, with their white cross braces
    for (const x of [14, 112]) {
      s += `<rect x="${x}" y="214" width="32" height="76" fill="${leaf}"/><path d="M${x + 2} 216 L${x + 30} 288 M${x + 30} 216 L${x + 2} 288" stroke="${trim}" stroke-width="2.4"/>
        <rect x="${x + 1}" y="215" width="30" height="74" fill="none" stroke="${trim}" stroke-width="2.4"/>`;
    }
    s += '<rect x="12" y="209" width="134" height="3" fill="#4a3a30"/>';
    s += floor(st);
    // the hayloft door and the beam for hoisting bales
    s += `<rect x="66" y="152" width="26" height="24" fill="${U.shade(K.barn, -0.3)}"/><path d="M67 153 L91 175 M91 153 L67 175" stroke="${trim}" stroke-width="2"/>
      <rect x="66" y="152" width="26" height="24" fill="none" stroke="${trim}" stroke-width="2"/><rect x="76.5" y="141" width="5" height="9" fill="#6b4a32"/>`;
    s += `<path d="${ROOF_D}" stroke="${K.roof}" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M16 210 L28 170 L79 140 L130 170 L142 210" stroke="${trim}" stroke-width="1.8" fill="none" stroke-linejoin="round" opacity="0.9"/>`;
    // a neglected barn has boards missing and one hanging loose
    if (PCT < 0.4) s += `<rect x="34" y="182" width="5" height="18" fill="#3a2b22"/><rect x="110" y="186" width="4" height="14" fill="#3a2b22"/><g transform="rotate(14 120 196)"><rect x="118" y="182" width="5" height="22" fill="${U.shade(K.barn, 0.12)}"/></g>`;
    if (winter()) s += `<path d="M7 208 L20 161 L79 126 L138 161 L151 208" stroke="${SNOW}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    return `<g>${s}</g>`;
  }

  function rabbit(x, y, fur, lt, flip) {
    return `<g transform="translate(${f1(x)} ${f1(y)})${flip ? ' scale(-1 1)' : ''}">${oval(0, 2.4, 5.2, 3.4, fur)}${dot(3.6, -0.6, 2.8, fur)}
      <g class="rs-ear"><path d="M2.4 -2.6 q-1.4 -6 0.6 -7 q1.4 1.2 0.8 7Z M4.4 -2.6 q0.6 -6 2.6 -6.4 q0.8 1.6 -1.2 6.6Z" fill="${fur}"/><path d="M2.9 -3.4 q-0.5 -3.6 0.4 -4.6 q0.6 1 0.2 4.6Z" fill="#f4a9b8"/></g>
      ${dot(4.7, -1, 0.65, '#2b2422')}${dot(6.3, 0, 0.5, '#e2768b')}${dot(-4.8, 2, 1.4, lt)}</g>`;
  }
  function hutch(st) {
    const p = pend(st, 'hutch'), ok = st.hutch && p !== 'grow';
    const wood = ok ? '#c98a55' : '#9a8f80', dk = U.shade(wood, -0.25);
    let s = `<g data-part="hutch">${shadow(47, 343, 32, 2.6)}<rect x="21" y="326" width="4" height="16" fill="${dk}"/><rect x="69" y="326" width="4" height="16" fill="${dk}"/>
      <rect x="17" y="299" width="60" height="30" rx="1.5" fill="${wood}"/><rect x="21" y="303" width="34" height="23" fill="#4a3a30"/>
      <rect x="21" y="317" width="34" height="9" fill="${ok ? url('Straw') : url('StrawOld')}"/>`;
    if (ok) s += `${rabbit(30, 314, '#f4efe6', '#ffffff', false)}${rabbit(46, 315, '#a8754a', '#e6c9a8', true)}<path d="M38 324 l5 -1.4" stroke="#f08a3a" stroke-width="2" stroke-linecap="round"/><path d="M43 322.6 l2 -1.6 M43 322.6 l2.2 0.2" stroke="#5f8a3a" stroke-width="0.8"/>`;
    else if (st.hutch) s += rabbit(38, 315, '#f4efe6', '#ffffff', false);
    // the wire front, sagging and torn while the hutch is neglected
    let mesh = '';
    for (let x = 21; x <= 55.1; x += 3.4) mesh += `M${f1(x)} 303 V${f1(st.hutch ? 326 : 326 - Math.sin(((x - 21) / 34) * Math.PI) * 2.6)} `;
    for (let y = 303; y <= 326.1; y += 3.4) mesh += st.hutch ? `M21 ${f1(y)} H55 ` : `M21 ${f1(y)} Q38 ${f1(y + 2.2)} 55 ${f1(y)} `;
    s += `<path d="${mesh}" stroke="#d8dde2" stroke-width="0.45" opacity="${ok ? 0.85 : 0.6}" fill="none"/><rect x="21" y="303" width="34" height="23" fill="none" stroke="${dk}" stroke-width="1.6"/>`;
    if (!st.hutch) s += '<path d="M46 326 L55 316 L55 326Z" fill="#4a3a30"/><path d="M46 326 q3 -6 9 -9 M49 326 q2 -3 6 -5" stroke="#d8dde2" stroke-width="0.45" fill="none"/>';
    // the sleeping box, and the roof
    s += `<rect x="57" y="303" width="17" height="23" fill="${U.shade(wood, -0.1)}"/><path d="M61.5 326 V318 a4 4 0 0 1 8 0 V326Z" fill="#3a2b22"/>
      <path d="M12 301 L22 291 H73 L82 301Z" fill="${ok ? '#6f7b86' : '#7d776f'}"/><path d="M12 301.5 H82" stroke="${ok ? '#4d5560' : '#5f5a54'}" stroke-width="1.6"/>`;
    if (!st.hutch) s += '<path d="M40 291 l6 0 l3 10 l-6 0Z" fill="#3a2b22"/>';
    if (winter()) s += `<path d="M13.5 299 L22.6 289.6 H72.4 L80.5 299" stroke="${SNOW}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    return s + '</g>';
  }

  function veg(st) {
    const p = pend(st, 'veg'), ok = st.veg && p !== 'grow';
    const r = U.rng(71);
    let s = `<g data-part="veg">${shadow(123, 338, 40, 2.4)}<rect x="86" y="306" width="74" height="30" rx="2" fill="#8a6142"/><rect x="89" y="309" width="68" height="24" rx="1.5" fill="${ok ? '#5d4030' : '#7a6448'}"/>`;
    if (ok && winter()) {
      s += `<path d="M89 317 Q104 311 123 314 Q142 311 157 316 V333 H89Z" fill="${SNOW}"/>`;
      for (let x = 96; x < 154; x += 12) s += `${dot(x, 316, 2.4, '#3f6b4a')}${dot(x + 1.4, 314.6, 1.4, '#5a8a62')}`;
    } else if (ok) {
      for (const y of [315, 322]) for (let x = 94 + (y === 322 ? 3.5 : 0); x < 155; x += 7) {
        s += `<path d="M${x} ${y} l-1.6 -4 M${x} ${y} l0 -4.6 M${x} ${y} l1.6 -4" stroke="#4f8a3a" stroke-width="0.9" stroke-linecap="round"/>${oval(x, y + 0.8, 1.2, 0.8, '#f08a3a')}`;
      }
      for (let x = 95; x < 155; x += 10) s += `${dot(x, 329, 2.8, '#8cc063')}${dot(x - 0.6, 328.4, 1.6, '#c5e1a5')}`;
    } else {
      for (let i = 0; i < 22; i++) {
        const x = 92 + r() * 62, y = 314 + r() * 17;
        s += `<path d="M${f1(x)} ${f1(y)} l-3 -6 M${f1(x)} ${f1(y)} l1 -8 M${f1(x)} ${f1(y)} l4 -5" stroke="${U.pick(r, winter() ? ['#8a7a5a', '#9a8a64', '#75684c'] : ['#5f8a3a', '#7a9a44', '#4d7a32'])}" stroke-width="1.4"/>`;
      }
      if (!winter()) s += `${dot(104, 318, 1.8, '#f3cf3a')}${dot(141, 326, 1.6, '#f3cf3a')}`;
    }
    if (p === 'leaves') s += `<rect x="89" y="309" width="68" height="24" fill="${url('Leaves')}"/>`;
    return s + '</g>';
  }

  // pet beds on the barn floor: flat old cushions, or plump beds with a dog
  // and a cat fast asleep
  function beds(st) {
    const p = pend(st, 'beds'), ok = st.beds && p !== 'grow';
    let s = '<g data-part="beds">';
    if (!st.beds) {
      s += `${oval(62, 286.4, 10.4, 2.6, '#8f877c')}<path d="M57 285.4 q3 -1.6 6 0.4" stroke="#6e675e" stroke-width="0.6" fill="none"/>${dot(66, 285.6, 1, '#efe9dd')}${dot(67.6, 286.6, 0.8, '#efe9dd')}
        ${oval(79.4, 289, 6.4, 1.9, '#7d776f')}<path d="M75 288.4 l3 0.8 l3 -0.6" stroke="#5f5a54" stroke-width="0.6" fill="none"/>`;
      return s + '</g>';
    }
    // the dog's basket and the cat's cushion
    s += `${shadow(62, 290, 12.6, 1.8)}${oval(62, 286, 11.6, 4.6, '#c9586e')}${oval(62, 285.4, 8.8, 3, '#f6dcc2')}
      ${shadow(79.4, 292, 8.6, 1.4)}${oval(79.4, 289, 7.6, 3, '#5d7fd8')}${oval(79.4, 288.6, 5.6, 2, '#cfe0f6')}`;
    if (ok) {
      // a ginger dog curled nose to tail, a grey tabby rolled up next door
      s += `<g class="rs-breathe">${oval(61, 283.4, 7, 3.2, '#e2b36a')}${oval(60, 282.6, 4.6, 1.6, '#f6dca6', 0.8)}</g>
        <path d="M54.6 284.6 q-1.6 -3 1.6 -4.4" stroke="#e2b36a" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${dot(67, 282.4, 2.8, '#e2b36a')}${oval(68.6, 281, 1.3, 2.2, '#c48c48')}<path d="M65.4 282.6 q0.9 0.8 1.8 0" stroke="#5a3a22" stroke-width="0.6" fill="none"/>${oval(69.4, 283.4, 0.8, 0.6, '#2b2422')}
        <g class="rs-breathe">${oval(79, 286.8, 4.8, 2.4, '#9a9a9e')}<path d="M76.6 285.2 q0.8 1.2 0 2.6 M79 284.8 q0.8 1.4 0 3 M81.4 285.2 q0.8 1.2 0 2.6" stroke="#6e6e74" stroke-width="0.6" fill="none"/></g>
        ${dot(83.6, 286.2, 2, '#9a9a9e')}<path d="M82.2 284.6 l0.3 -2 l1.3 1.2Z M84.4 284.2 l1.4 -1.4 l0.4 1.8Z" fill="#9a9a9e"/><path d="M82.8 286.4 q0.6 0.6 1.2 0" stroke="#3d3d42" stroke-width="0.5" fill="none"/>
        <path d="M74.6 288 q-2 -0.6 -1.6 -2.6" stroke="#9a9a9e" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    } else {
      // made, but nobody settled in: a blanket dragged half out
      s += `<path d="M66 287 q6 2 10 6 q-5 1 -9 -1Z" fill="#e9c35a"/><path d="M68 288.6 l4 2.4" stroke="#c9a03a" stroke-width="0.5"/>`;
    }
    return s + '</g>';
  }

  // the feed corner by the farmhouse door: sacks of food and the feeding chart
  function feed(st) {
    const p = pend(st, 'feed'), ok = st.feed && p !== 'grow';
    let s = '<g data-part="feed">';
    // the chart, clipped to a board on the wall
    s += `<rect x="263" y="239" width="20" height="25" rx="1.2" fill="#a77b56"/><rect x="264.6" y="241.6" width="16.8" height="20.8" fill="${st.feed ? '#fbf7ee' : '#e3d9c6'}"/>
      <rect x="270.6" y="237.6" width="4.8" height="2.8" rx="0.8" fill="#5b636d"/>`;
    if (st.feed) {
      const icon = [(x, y) => paw(x, y, 0.42, '#8a5a3c'), (x, y) => `<path d="M${x - 1.8} ${y} q1.6 -1.4 3.2 0 q-1.6 1.4 -3.2 0 l-1 -0.8 v1.6Z" fill="#6f8fb0"/>`, (x, y) => `<path d="M${x - 0.6} ${y - 1.6} l1.2 0 l-0.6 3.2Z" fill="#f08a3a"/>`];
      for (let r = 0; r < 4; r++) {
        const y = 245 + r * 4.6;
        s += icon[r % 3](267.6, y) + `<path d="M270.4 ${y} H276" stroke="#c9c0b0" stroke-width="0.6"/>`;
        if (ok || r < 2) s += `<path d="M277 ${y - 0.2} l1 1 l1.8 -2" stroke="#4f9d7a" stroke-width="0.8" fill="none" stroke-linecap="round"/>`;
      }
    } else {
      // blank, faded and curling at the corner
      s += '<path d="M281.4 241.6 L281.4 247 L276 241.6Z" fill="#cfc4ae"/><path d="M276 241.6 L281.4 247" stroke="#b8ad96" stroke-width="0.5"/>';
    }
    if (ok) {
      // two sacks standing neatly, a scoop in the first
      s += `${shadow(271, 294.6, 14, 1.8)}<path d="M258.6 294 V279 q0 -3 2 -4 l1.6 -1.4 h5.6 l1.6 1.4 q2 1 2 4 V294Z" fill="#dcc196"/><path d="M260 278.4 h10" stroke="#b89a6a" stroke-width="0.8"/>
        ${paw(265, 286, 0.8, '#8a5a3c')}<path d="M266 276 l5 -6" stroke="#9aa3ad" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M272 294 V283 q0 -2.4 1.6 -3 h7.4 q1.6 0.6 1.6 3 V294Z" fill="#c9d6e2"/><path d="M273 284 h9" stroke="#9fb2c4" stroke-width="0.8"/>
        <path d="M275.4 289 q2.4 -2 4.8 0 q-2.4 2 -4.8 0 l-1.4 -1.2 v2.4Z" fill="#6f8fb0"/>`;
    } else if (st.feed) {
      s += `${shadow(271, 294.6, 14, 1.8)}<path d="M258.6 294 V279 q0 -3 2 -4 l1.6 -1.4 h5.6 l1.6 1.4 q2 1 2 4 V294Z" fill="#dcc196"/>${paw(265, 286, 0.8, '#8a5a3c')}
        <g transform="rotate(-70 278 293)"><path d="M272 294 V283 q0 -2.4 1.6 -3 h7.4 q1.6 0.6 1.6 3 V294Z" fill="#c9d6e2"/></g>${dot(284, 293.6, 0.8, '#9c6a3a')}${dot(286.4, 294.6, 0.7, '#9c6a3a')}`;
    } else {
      // toppled over, with kibble all over the ground
      s += `${shadow(270, 295, 16, 1.8)}<g transform="rotate(-82 266 293)"><path d="M258.6 294 V279 q0 -3 2 -4 l1.6 -1.4 h5.6 l1.6 1.4 q2 1 2 4 V294Z" fill="#b8a688"/></g>
        <path d="M271 294 q4 -6 9 -4 q3 2 2 4Z" fill="#a8b2bb"/>`;
      const r = U.rng(17);
      for (let i = 0; i < 12; i++) s += dot(276 + r() * 12, 293 + r() * 3.6, 0.8, U.pick(r, ['#9c6a3a', '#7d4f2a', '#b07a44']));
    }
    return s + '</g>';
  }

  // ---------------------------------------------------------- the farmhouse
  function upperWin(x, y) {
    const clean = PCT > 0.5, frame = clean ? '#fbf7ee' : '#b8b1a2';
    return `<rect x="${x - 2.5}" y="${y - 2.5}" width="29" height="27" rx="2" fill="${frame}"/><rect x="${x}" y="${y}" width="24" height="22" fill="${clean ? url('Room') : url('Grime')}"/>
      ${clean ? `<path d="M${x + 1} ${y + 1} h6 q-2 10 1 20 h-7Z M${x + 23} ${y + 1} h-6 q2 10 -1 20 h7Z" fill="#c9a3d9"/>` : ''}
      <path d="M${x + 12} ${y} V${y + 22} M${x} ${y + 11} H${x + 24}" stroke="${frame}" stroke-width="2"/>${winter() ? `<rect x="${x - 4}" y="${y + 23}" width="32" height="3" rx="1" fill="${SNOW}"/>` : ''}`;
  }
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const c = ok ? C.rescueDoor : U.mix(C.rescueDoor, '#a59e90', 0.62), dk = U.shade(c, -0.25);
    const D = 'M289 292 V252 Q289 241 301 241 Q313 241 313 252 V292Z';
    let s = `<g data-part="door"><path d="M286 292 V251 Q286 238 301 238 Q316 238 316 251 V292Z" fill="${U.shade(K.house, -0.28)}"/><path d="${D}" fill="${c}"/>`;
    for (const [x, y, h] of [[292.5, 256, 14], [302.5, 256, 14], [292.5, 274, 15], [302.5, 274, 15]]) s += `<rect x="${x}" y="${y}" width="7" height="${h}" rx="1.4" fill="none" stroke="${dk}" stroke-width="1.1"/>`;
    s += `<path d="M292 251 Q301 243.5 310 251Z" fill="${ok ? url('Room') : '#6d675a'}"/>${dot(309.5, 273, 1.5, ok ? '#e9c35a' : '#77705f')}`;
    if (!ok) s += '<path d="M294 262 l4 3 l-2 5 M305 280 l4 -2 l1 6" stroke="#cfc6b6" stroke-width="1.1" fill="none"/>';
    if (p === 'grow') s += `<path d="${D}" fill="${FADE}" opacity="0.5"/>`;
    // the porch canopy, the step and a paw-print plaque
    s += `<path d="M281 236 H321 L317 228 H285Z" fill="${url('Slate')}"/><path d="M280 236.5 H322" stroke="${U.shade(K.slate, -0.3)}" stroke-width="1.6"/>
      ${winter() ? `<path d="M285 228.6 H317 L318.6 231.4 H283.4Z" fill="${SNOW}"/>` : ''}
      <rect x="283" y="292" width="36" height="5" rx="1.5" fill="#b7ada0"/>
      <rect x="319" y="252" width="9" height="9" rx="1.6" fill="#f6efe0" stroke="#8a7a64" stroke-width="0.6"/>${paw(323.5, 257, 0.75, '#8a5a3c')}`;
    return s + '</g>';
  }
  function officeWindow(st) {
    const p = pend(st, 'window'), ok = st.window;
    const x = 334, y = 238, w = 44, h = 30;
    const frame = ok ? '#fbf7ee' : '#b8b1a2';
    const glass = !ok ? url('Grime') : p === 'frost' ? url('Frost') : p === 'grow' ? url('Dusty') : url('Room');
    let s = `<g data-part="window"><rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="2" fill="${frame}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glass}"/>`;
    if (ok && !p) {
      // inside: curtains, a desk lamp and a board of happy adoptions
      s += `<path d="M${x + 1} ${y + 1} h8 q-3 14 1 28 h-9Z M${x + w - 1} ${y + 1} h-8 q3 14 -1 28 h9Z" fill="#8fbfe6"/>
        <rect x="${x + 12}" y="${y + 3.6}" width="20" height="10" fill="#c9a06a"/>${['#f6efe0', '#ef8aa6', '#9cc5a1', '#f2d88a'].map((col, i) => `<rect x="${x + 13.4 + i * 4.7}" y="${y + 5.2}" width="3.4" height="3.6" fill="${col}"/>`).join('')}
        <rect x="${x + 10}" y="${y + 24}" width="26" height="3" fill="#8a5a3c"/><path d="M${x + 30} ${y + 24} v-5" stroke="#3d3d42" stroke-width="0.8"/><path d="M${x + 27} ${y + 19} h6 l-1.6 -3.4 h-2.8Z" fill="#e9c35a"/>`;
    } else if (!ok) {
      s += `<path d="M${x + 4} ${y + 7} q${f1(w * 0.3)} 6 ${f1(w * 0.6)} -2" stroke="#4e4a40" stroke-width="3" opacity="0.4" fill="none"/>
        <path d="M${x + w - 3} ${y + 3} l-8 0 l8 8Z" fill="#fff" opacity="0.35"/><path d="M${x} ${y} l7 0 M${x} ${y} l5 5 M${x} ${y} l0 7 M${x + 3} ${y} q0 3 -3 4" stroke="#e1ddd5" stroke-width="0.5" fill="none"/>`;
    } else if (p === 'frost') s += `<path d="M${x} ${y + 9} q8 -3 12 -9 M${x + w} ${y + 21} q-8 3 -13 9 M${x + 4} ${y + h} q3 -6 9 -8" stroke="#fff" stroke-width="1.4" fill="none"/>`;
    s += `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${frame}" stroke-width="2.2"/>
      <rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="4.4" rx="1.6" fill="${winter() ? SNOW : ok ? '#efe6d4' : '#a59e90'}"/>`;
    return s + '</g>';
  }
  function farmhouse(st, C) {
    let s = '';
    // smoke from the chimney once someone works here again
    if (st.door && st.window) s += '<g class="smoke" fill="#ffffff"><circle cx="363" cy="104" r="5" opacity="0.7"/><circle cx="367" cy="92" r="7" opacity="0.5"/><circle cx="363" cy="76" r="9" opacity="0.3"/></g>';
    s += '<rect x="356" y="114" width="15" height="40" fill="#9a8a7a"/><rect x="353" y="110" width="21" height="7" rx="2" fill="#7d6f62"/><path d="M356 124 H371 M356 134 H371" stroke="#857565" stroke-width="0.8"/>';
    s += `${shadow(327, 293, 74, 5)}<rect x="258" y="178" width="138" height="114" fill="${K.house}"/><rect x="258" y="178" width="138" height="114" fill="${url('Stone')}"/>`;
    if (PCT < 0.5) s += `<rect x="258" y="178" width="138" height="114" fill="${url('Stain')}"/>`;
    // a climbing rose once the place is loved
    if (PCT > 0.6 && !winter()) {
      const r = U.rng(61);
      s += '<path d="M262 292 Q268 250 266 214 Q264 200 272 192" stroke="#6b5a3a" stroke-width="1.2" fill="none"/>';
      for (let i = 0; i < 26; i++) { const y = 196 + r() * 94, x = 262 + Math.sin(y * 0.08) * 3 + r() * 10; s += oval(x, y, 2.6, 1.6, U.pick(r, ['#4f8a3c', '#5d9644', '#6aa04c'])); }
      for (let i = 0; i < 9; i++) s += dot(263 + r() * 10, 200 + r() * 86, 1.8, SEASON === 'autumn' ? '#d9534f' : U.pick(r, ['#ef8aa6', '#f5b3c4', '#e0607e']));
    }
    s += `<path d="M248 184 L272 138 H384 L406 184Z" fill="${url('Slate')}"/><path d="M246 185 H408" stroke="${U.shade(K.slate, -0.3)}" stroke-width="3" stroke-linecap="round"/>`;
    if (winter()) s += `<path d="M250 181 L273 136 H383 L404 181 Q394 175 382 179 Q366 169 350 177 Q332 169 316 177 Q298 169 284 177 Q268 171 250 181Z" fill="${SNOW}"/>`;
    s += upperWin(276, 196) + upperWin(354, 196);
    return `<g>${s}${door(st, C)}${officeWindow(st)}</g>`;
  }

  // the cat on the office windowsill: matted and cross, or sleek and asleep
  function cat(st) {
    const p = pend(st, 'cat'), ok = st.cat && p !== 'grow';
    let s = '<g data-part="cat">';
    if (ok) {
      const fur = '#e39a52', dk = '#b8692e', lt = '#f6c48a';
      s += `<path d="M375 268.4 q7 1 6 9 q-1 5 -5 6" stroke="${fur}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <g class="rs-breathe">${oval(366, 265.4, 11, 5.4, fur)}${oval(364, 264, 7, 2.6, lt, 0.7)}<path d="M360 261.4 q2 3 0 6.4 M365 260.6 q2 3 0 7.4 M370 261.4 q2 3 0 6.4" stroke="${dk}" stroke-width="1.1" fill="none" opacity="0.8"/></g>
        ${dot(354.6, 264, 4.8, fur)}<path d="M351 261 l0.6 -4.6 l3 2.8Z M355.6 259.4 l3 -3.2 l0.8 4.4Z" fill="${fur}"/><path d="M351.8 260.4 l0.4 -2.2 l1.4 1.4Z" fill="#f4a9b8"/>
        <path d="M352 264.4 q1.2 1 2.4 0 M356 264.4 q1.2 1 2.4 0" stroke="#5a3a22" stroke-width="0.7" fill="none"/>${dot(355.2, 266.2, 0.7, '#e2768b')}
        <path d="M352.4 266.6 l-4 0.2 M352.4 267.2 l-3.8 1.6 M358 266.6 l4 0.2" stroke="#fff" stroke-width="0.35" opacity="0.85"/>${oval(359.4, 269.4, 2.2, 1.2, lt)}`;
    } else {
      // scruffy: tufts sticking out all over, a burr, ears back, tail limp
      const fur = '#8f877c', dk = '#6e675e';
      let d = '';
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2, k = i % 2 ? 1 : 1.22;
        d += `${i ? 'L' : 'M'}${f1(366 + Math.cos(a) * 11 * k)} ${f1(265.6 + Math.sin(a) * 5.6 * k)} `;
      }
      s += `<path d="M376 268 q3 4 2 13" stroke="${fur}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="${d}Z" fill="${fur}"/>
        <path d="M358 262 l3 2 M364 260 l1 3 M370 261 l-1 3" stroke="${dk}" stroke-width="1" opacity="0.8"/>
        ${dot(354.6, 266, 4.8, fur)}<path d="M350.4 262.6 l-2 -2.6 l3.6 0.4Z M357.6 262 l2.6 -2.2 l-0.4 3.4Z" fill="${fur}"/>
        <path d="M350.6 265.6 l-2 -1 M351 268 l-2.4 0.4 M358.4 265.6 l2 -1.2" stroke="${dk}" stroke-width="0.8"/>
        ${dot(352.8, 265.6, 0.7, '#3d3a2a')}${dot(356.4, 265.6, 0.7, '#3d3a2a')}<path d="M351.8 264.2 l1.8 0.6 M357.4 264.2 l-1.8 0.6" stroke="#3d3a2a" stroke-width="0.5"/>${dot(354.6, 267.6, 0.6, '#b07a7a')}
        ${dot(370, 263, 1.6, '#7a8a3a')}<path d="M368.4 261.4 l3.2 3.2 M371.6 261.4 l-3.2 3.2" stroke="#5f6a2a" stroke-width="0.6"/>`;
    }
    return s + '</g>';
  }

  // ---------------------------------------------------- kennels and bowls
  function dogFace(x, y, c) {
    const ear = U.shade(c[0], -0.18);
    return `${oval(x - 4.6, y - 0.4, 1.9, 3.4, ear)}${oval(x + 4.6, y - 0.4, 1.9, 3.4, ear)}${oval(x, y - 0.6, 4.6, 4.2, c[0])}${oval(x, y + 1.4, 2.6, 1.9, c[1])}
      ${dot(x - 1.7, y - 1.6, 0.7, '#2b2422')}${dot(x + 1.7, y - 1.6, 0.7, '#2b2422')}${dot(x - 1.5, y - 1.9, 0.25, '#fff')}${dot(x + 1.9, y - 1.9, 0.25, '#fff')}${oval(x, y + 0.5, 1, 0.75, '#2b2422')}
      ${oval(x - 2.4, y + 4.6, 1.8, 1.1, c[1])}${oval(x + 2.4, y + 4.6, 1.8, 1.1, c[1])}`;
  }
  function kennels(st) {
    const out = st.bowls && !PEND.bowls;
    let s = '';
    KX.forEach((x, i) => {
      const cx = x + 13.5;
      s += `${shadow(cx, 293, 16, 2.4)}<path d="M${x} 292 V259 L${cx} 247 L${x + 27} 259 V292Z" fill="${K.wood}"/>
        <path d="M${x} 268 H${x + 27} M${x} 276 H${x + 27} M${x} 284 H${x + 27}" stroke="${U.shade(K.wood, -0.18)}" stroke-width="0.7"/>
        <path d="M${x - 3} 260.5 L${cx} 245 L${x + 30} 260.5" stroke="${K.kroof}" stroke-width="4.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M${x + 6} 292 V279 a7.5 7.5 0 0 1 15 0 V292Z" fill="#2f241e"/><rect x="${cx - 6}" y="261" width="12" height="4.4" rx="1" fill="#f6efe0"/>`;
      if (winter()) s += `<path d="M${x - 3} 258.5 L${cx} 243 L${x + 30} 258.5" stroke="${SNOW}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      // the dogs look out, unless breakfast has drawn two of them out
      if (!(out && i !== 1)) s += dogFace(cx, 284, COATS[i]);
    });
    return s;
  }
  // a dog at its bowl, side on: head down in the bowl, tail up and wagging
  function dogEating(x, y, c, flip) {
    const leg = U.shade(c[0], -0.15);
    return `<g transform="translate(${f1(x)} ${f1(y)})${flip ? ' scale(-1 1)' : ''}">${shadow(-2, 5.4, 10, 1.6)}
      <path d="M-8.6 1 V5.2 M-6.4 1.4 V5.4 M0.4 1.4 V5.4 M2.4 1 V5.2" stroke="${leg}" stroke-width="1.7" stroke-linecap="round"/>
      <path class="rs-wag" d="M-9.6 -1.6 q-2.6 -2.6 -1.4 -6.4" stroke="${c[0]}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${oval(-3, -0.4, 7, 3.4, c[0])}${oval(-3.4, 1, 4.6, 1.6, c[1], 0.7)}
      <path d="M2.6 -1.4 Q5.4 -0.6 6.6 2.4" stroke="${c[0]}" stroke-width="3.4" fill="none" stroke-linecap="round"/>${oval(7.4, 3.2, 2.8, 2.2, c[0])}${oval(6, 1.6, 1.3, 2.2, U.shade(c[0], -0.2))}</g>`;
  }
  function bowl(x, y, band, full, tipped) {
    if (tipped) {
      return `<g transform="rotate(-70 ${x} ${y})">${oval(x, y, 3.4, 6.8, '#a9b2bb')}${oval(x - 1, y, 2.2, 5.2, '#7d8792')}</g>${dot(x + 6, y + 1.6, 0.8, '#9c6a3a')}${dot(x + 8.4, y + 0.6, 0.7, '#9c6a3a')}${dot(x + 7, y + 3, 0.7, '#9c6a3a')}`;
    }
    let s = `${shadow(x, y + 3, 9, 1.8)}<path d="M${f1(x - 7.6)} ${y} Q${f1(x - 7)} ${f1(y + 4.4)} ${x} ${f1(y + 4.4)} Q${f1(x + 7)} ${f1(y + 4.4)} ${f1(x + 7.6)} ${y}Z" fill="${band}"/>
      ${oval(x, y, 7.6, 2.6, '#c3cbd3')}${oval(x, y, 6, 1.9, full ? '#9c6a3a' : '#6d7680')}`;
    if (full) s += `<path d="M${f1(x - 5.6)} ${f1(y - 0.2)} Q${x} ${f1(y - 4.6)} ${f1(x + 5.6)} ${f1(y - 0.2)}Z" fill="#a8723f"/>${dot(x - 2, y - 1.6, 0.6, '#c99a5a')}${dot(x + 1.4, y - 2.4, 0.6, '#c99a5a')}${dot(x + 2.8, y - 1, 0.6, '#7d4f2a')}`;
    return s;
  }
  function bowls(st) {
    const p = pend(st, 'bowls'), ok = st.bowls && !p;
    const bands = ['#3d86c6', '#d9534f', '#4f9d7a'];
    let s = '<g data-part="bowls">';
    KX.forEach((x, i) => {
      const bx = x + 13.5, by = 302;
      if (ok && i !== 1) s += dogEating(i === 0 ? bx - 10 : bx + 10, by - 1, COATS[i], i === 2);
      s += bowl(bx, by, bands[i], ok, !st.bowls && i === 2);
    });
    return s + '</g>';
  }

  // a stone trough with an old hand pump
  function trough(st) {
    const p = pend(st, 'trough'), ok = st.trough && p !== 'grow';
    const frozen = st.trough && (p === 'frost' || p === 'snow' || winter());
    let s = `<g data-part="trough">${shadow(358, 317, 30, 2.6)}
      <rect x="328" y="284" width="4" height="24" rx="1" fill="#5b636d"/><path d="M330 287 h-6 l-2 -3" stroke="#5b636d" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M332 288 q5 -1 6 4" stroke="#5b636d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="336" y="303" width="50" height="12" rx="2" fill="#a39c90"/><rect x="335" y="299.6" width="52" height="6" rx="3" fill="#bdb6a9"/>`;
    const inner = '<rect x="338.5" y="300.8" width="45" height="3.4" rx="1.7"';
    if (frozen) s += `${inner} fill="#e3f0f6"/><path d="M344 302 l8 0 M362 302.6 l9 0" stroke="#fff" stroke-width="0.7"/><rect x="335" y="299" width="52" height="1.8" rx="0.9" fill="${SNOW}"/>`;
    else if (ok) s += `${inner} fill="#6fb6d0"/><path d="M342 301.8 h10" stroke="#fff" stroke-width="0.8" opacity="0.8"/><path class="rs-glint" d="M372 300 l0.8 -2 l0.8 2 l2 0.8 l-2 0.8 l-0.8 2 l-0.8 -2 l-2 -0.8Z" fill="#fff"/>${dot(338, 295.6, 0.9, '#9fd3e6')}`;
    else if (st.trough) s += `${inner} fill="#88a688"/><path d="M342 302 h6" stroke="#fff" stroke-width="0.6" opacity="0.5"/>`;
    else s += `${inner} fill="#8e8677"/><path d="M344 302 l4 0.6 l3 -0.8 M362 301.8 l5 0.8" stroke="#6f685c" stroke-width="0.6"/>${oval(356, 302, 2.2, 1, '#b8742f')}${oval(366, 302.4, 1.8, 0.9, '#9c5a2a')}
      <path d="M350 305 l3 4 l-1 5 M372 306 l-2 5" stroke="#7d766a" stroke-width="0.7" fill="none"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- the yard
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard && p !== 'grow';
    const d = `${YARD_D} ${LANE_D}`;
    let s = `<g data-part="yard"><path d="${d}" fill="${ok ? url('Flags') : url('Moss')}"/>
      <path d="M160 298 L144 404 M282 298 L298 404 M176 404 L166 540 M224 404 L234 540" stroke="${ok ? '#9a8a6c' : '#6d7448'}" stroke-width="1.6"/>`;
    if (!st.yard) {
      // cracks, weeds and a puddle
      s += `${oval(234, 362, 16, 4, '#7d8560', 0.8)}<path d="M190 330 l6 8 l-2 9 M250 384 l-5 7 l3 6 M206 452 l4 6 l-2 8" stroke="#4f553a" stroke-width="1" fill="none"/>`;
      const r = U.rng(91);
      for (let i = 0; i < 12; i++) {
        const y = 304 + r() * 230, x = y < 404 ? 150 + (y - 298) * -0.1 + r() * 136 : 172 + r() * 54;
        s += `<path d="M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l3 -4" stroke="#5f7a34" stroke-width="1.2"/>`;
      }
    }
    if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${d}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (winter() && st.yard) s += `<path d="M160 298 L171 298 L157 404 L144 404Z M282 298 L271 298 L285 404 L298 404Z M176 404 L184 404 L176 540 L166 540Z M224 404 L216 404 L224 540 L234 540Z" fill="${SNOW}" opacity="0.85"/>`;
    return s + '</g>';
  }

  // mess left lying about while the place is neglected
  function nettles(x, y) {
    let s = '';
    for (let k = 0; k < 4; k++) s += `<path d="M${x + k * 4} ${y} q-1 -6 ${k % 2 ? 2 : -2} -10" stroke="#4f7a32" stroke-width="1.2" fill="none"/>${oval(x + k * 4 + (k % 2 ? 1.6 : -1.6), y - 6, 1.8, 1, '#5f8a3a')}`;
    return s;
  }
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}">${nettles(14, 294)}${nettles(30, 293)}${nettles(262, 296)}${nettles(388, 297)}
      ${oval(306, 390, 8, 3.6, '#3a3633')}${oval(306, 389.4, 4, 1.6, '#6b665f')}
      <g transform="rotate(-18 262 322)"><path d="M248 318 h24 l-4 8 h-16Z" fill="#8a9098"/>${dot(250, 328, 3, '#3a3633')}<path d="M270 320 l10 -4" stroke="#6b4a32" stroke-width="1.6"/></g></g>`;
  }

  // --------------------------------------------------------------- the pool
  function sealPup(x, y, hopeful) {
    return `<g transform="translate(${f1(x)} ${f1(y)})">${shadow(4, 5.6, 14, 1.6)}
      <path d="M-6 3 Q-8 -4 0 -5 Q10 -6 15 0 Q17 3 15 4.6 Q4 6.4 -6 3Z" fill="#a9b1b9"/>${oval(3, -2.4, 6, 1.6, '#c9d0d6', 0.8)}
      <path d="M14.6 2.4 q5 -2.4 7.4 0.6 q-4 2.6 -7.4 0.6Z" fill="#8e979f"/><path d="M2 3.4 q2.6 3.4 -0.6 5" stroke="#8e979f" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${dot(-6.4, -2.6, 4.6, '#a9b1b9')}
      ${hopeful ? `${dot(-8, -3.6, 1, '#222')}${dot(-4.8, -3.6, 1, '#222')}${dot(-7.7, -3.9, 0.35, '#fff')}${dot(-4.5, -3.9, 0.35, '#fff')}`
        : '<path d="M-9 -3.2 h2 M-5.8 -3.2 h2" stroke="#3d3d42" stroke-width="0.7"/><path d="M-9.4 -4.8 l1.8 0.7 M-3.6 -4.8 l-1.8 0.7" stroke="#3d3d42" stroke-width="0.5"/>'}
      ${oval(-6.4, -1.2, 1.2, 0.8, '#3d3d42')}<path d="M-7.6 -0.6 l-4 0.4 M-7.6 -0.2 l-3.6 1.6 M-5.2 -0.6 l4 0.4" stroke="#e9eef1" stroke-width="0.35"/></g>`;
  }
  function swimmingSeal(x, y) {
    return `<g transform="translate(${x} ${y})">${oval(8, 2.6, 8, 2.2, '#848d97')}${dot(0, -1.6, 4.8, '#9aa3ad')}${oval(-0.6, -3.8, 2.6, 1.2, '#c3cbd3', 0.7)}
      ${dot(-1.9, -2.4, 1, '#222')}${dot(1.5, -2.4, 1, '#222')}${dot(-1.6, -2.7, 0.35, '#fff')}${dot(1.8, -2.7, 0.35, '#fff')}${oval(0, -0.6, 1.2, 0.8, '#3d3d42')}
      <path d="M-1.4 0.4 l-4 0.6 M-1.4 0.8 l-3.6 1.8 M1.4 0.4 l4 0.6 M1.4 0.8 l3.6 1.8" stroke="#e9eef1" stroke-width="0.35"/>
      <path d="M-7 3.4 q8 2.4 19 0" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.8"/></g>`;
  }
  const fish = (x, y) => `<path d="M${x} ${y} q4 -3 8 0 q-4 3 -8 0 l-3 -2 v4Z" fill="#b8c4cf"/>${dot(x + 6, y - 0.5, 0.5, '#3d3d42')}`;
  function seal(st) {
    const p = pend(st, 'seal'), ok = st.seal && p !== 'grow';
    let s = `<g data-part="seal">${shadow(348, 369, 46, 3.4)}${oval(348, 352, 45, 17, '#e9eef1')}
      <ellipse cx="348" cy="352" rx="42" ry="15.2" fill="none" stroke="#86bcd3" stroke-width="2.4" stroke-dasharray="3.4 3"/>
      ${oval(348, 353, 38, 12.2, ok ? url('Pool') : st.seal ? '#86a89b' : '#6f774a')}`;
    if (ok) {
      s += `<path d="M322 350 q7 -2 13 0 M366 359 q6 -2 12 0" stroke="#fff" stroke-width="1" fill="none" opacity="0.7"/><g class="rs-swim">${swimmingSeal(356, 350)}</g>${fish(319, 340)}`;
    } else {
      if (!st.seal) s += `${dot(332, 352, 2.4, '#8f9460', 0.9)}${dot(352, 358, 1.8, '#8f9460', 0.9)}${dot(370, 350, 2.6, '#9a9b66', 0.9)}<rect x="358" y="352" width="8" height="4" rx="1" fill="#b0b5b9" transform="rotate(-18 362 354)"/>`;
      s += sealPup(318, 344, !!st.seal);
    }
    // a bucket for the fish
    s += `<path d="M380 358 h10 l-1.4 9 h-7.2Z" fill="#3d86c6"/><path d="M380 358 q5 -6 10 0" stroke="#5b636d" stroke-width="0.7" fill="none"/>${st.seal ? '<path d="M383 358 l-1 -4 l2.4 1.6 M387 358 l1.4 -3.6 l1 3" fill="#b8c4cf"/>' : ''}`;
    if (winter()) s += `<path d="M307 347 Q348 331 389 347" stroke="${SNOW}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- the toys
  const TOY = {
    ball: (x, y) => `${dot(x, y, 3, '#d4e157')}<path d="M${f1(x - 2.6)} ${f1(y - 0.8)} q2.6 1.8 5.2 0" stroke="#fff" stroke-width="0.7" fill="none"/>`,
    bone: (x, y, a) => `<g transform="rotate(${a} ${x} ${y})">${dot(x - 4.4, y - 1, 1.6, '#f6efe0')}${dot(x - 4.4, y + 1, 1.6, '#f6efe0')}${dot(x + 4.4, y - 1, 1.6, '#f6efe0')}${dot(x + 4.4, y + 1, 1.6, '#f6efe0')}<rect x="${f1(x - 4.4)}" y="${f1(y - 1)}" width="8.8" height="2" fill="#f6efe0"/></g>`,
    rope: (x, y, a) => `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 6} ${y} H${x + 6}" stroke="#e8644a" stroke-width="2.6" stroke-linecap="round"/><path d="M${x - 4} ${f1(y - 1.3)} l1.6 2.6 M${x - 1} ${f1(y - 1.3)} l1.6 2.6 M${x + 2} ${f1(y - 1.3)} l1.6 2.6" stroke="#fff" stroke-width="0.9"/>${dot(x - 6.6, y, 2, '#3d86c6')}${dot(x + 6.6, y, 2, '#3d86c6')}</g>`,
    frisbee: (x, y) => `${oval(x, y, 5.4, 2.2, '#e2574c')}${oval(x, y - 0.3, 3.4, 1.2, '#f08a7c')}`,
    duck: (x, y) => `${oval(x, y, 3.6, 2.6, '#f7d148')}${dot(x + 2.6, y - 2.4, 1.8, '#f7d148')}<path d="M${f1(x + 4.2)} ${f1(y - 2.6)} l1.8 0.4 l-1.8 0.6Z" fill="#f08a3a"/>${dot(x + 3, y - 2.8, 0.35, '#222')}`,
    teddy: (x, y) => `${dot(x - 2.6, y - 6.4, 1.4, '#a8754a')}${dot(x + 2.6, y - 6.4, 1.4, '#a8754a')}${dot(x, y - 4.4, 3, '#b8854f')}${oval(x, y + 0.6, 3.6, 3.2, '#b8854f')}${dot(x - 1, y - 4.8, 0.4, '#222')}${dot(x + 1, y - 4.8, 0.4, '#222')}${oval(x, y - 3.4, 1.1, 0.8, '#e6c9a8')}`,
  };
  function toys(st) {
    const p = pend(st, 'toys'), ok = st.toys && p !== 'grow';
    let s = '<g data-part="toys">';
    if (st.toys) {
      // a wooden toy box with the toys peeking out
      s += `${shadow(48, 385, 20, 2.2)}${TOY.ball(39, 362)}${TOY.duck(50, 362)}${TOY.bone(58, 359, -70)}
        <rect x="31" y="363" width="34" height="21" rx="1.5" fill="#b5783f"/><path d="M31 370 H65 M31 377 H65" stroke="#8a5a32" stroke-width="0.8"/>
        <g transform="rotate(-28 31 363)"><rect x="31" y="358" width="34" height="5" rx="1" fill="#c98a55"/></g>
        <text x="48" y="376.6" text-anchor="middle" font-family="${FONT}" font-size="6.4" font-weight="900" fill="#f6efe0">TOYS</text>`;
      s += ok ? TOY.ball(74, 386) : TOY.rope(82, 360, -20) + TOY.frisbee(18, 388) + TOY.teddy(88, 384);
    } else {
      // scattered everywhere
      s += TOY.ball(20, 352) + TOY.bone(36, 384, 30) + TOY.rope(62, 358, -20) + TOY.frisbee(80, 388) + TOY.duck(14, 372) + TOY.teddy(88, 362) + TOY.ball(160, 376) + TOY.bone(56, 374, -15);
    }
    return s + '</g>';
  }

  // a tin bath with a dog in it: muddy and sheepish, or fluffy in the bubbles
  function tub(st) {
    const p = pend(st, 'tub'), ok = st.tub && p !== 'grow';
    const fur = ok ? '#f4efe6' : '#8a6a48', ear = ok ? '#e2b36a' : '#6a4f34';
    let s = `<g data-part="tub">${shadow(124, 390, 28, 2.6)}`;
    if (!ok) s += `${oval(98, 386, 6, 2, '#6a4f34', 0.5)}${paw(92, 392, 0.8, '#6a4f34')}${paw(84, 389, 0.8, '#6a4f34')}${dot(152, 384, 1.4, '#6a4f34', 0.7)}${dot(150, 377, 1, '#6a4f34', 0.7)}`;
    s += `${oval(124, 370, 24, 5.6, '#8f99a3')}${oval(124, 370.6, 21.6, 4.4, ok ? '#e8f4f8' : '#7d6a52')}`;
    s += `${oval(115.6, 359, 2.8, 5.4, ear)}${oval(132.4, 359, 2.8, 5.4, ear)}${dot(124, 358, 7.4, fur)}${oval(124, 361.4, 4, 2.8, ok ? '#fff' : '#a7896a')}${oval(124, 359.6, 1.5, 1.1, '#2b2422')}`;
    if (ok) {
      s += `<path d="M118.6 355.6 q1.6 -1.4 3.2 0 M126.2 355.6 q1.6 -1.4 3.2 0" stroke="#2b2422" stroke-width="0.9" fill="none"/><path d="M122.6 362.6 q1.4 3 2.8 0Z" fill="#ef8aa6"/>
        ${[[118, 351, 3.2], [123, 349.6, 3.6], [128.6, 351, 3]].map(([x, y, r]) => dot(x, y, r, '#fff', 0.95)).join('')}`;
    } else {
      s += `${dot(121, 355.8, 0.9, '#2b2422')}${dot(127, 355.8, 0.9, '#2b2422')}<path d="M119.4 354 l2.6 0.8 M128.6 354 l-2.6 0.8" stroke="#2b2422" stroke-width="0.6"/>
        ${dot(119, 361, 1.6, '#5a3f26')}${dot(129.4, 353, 1.4, '#5a3f26')}${dot(126, 364, 1.2, '#5a3f26')}`;
    }
    // the front of the bath, with foam or mud at the rim
    s += `<path d="M100 370 L104.6 387 Q124 393 143.4 387 L148 370 A24 5.6 0 0 1 100 370Z" fill="#9aa3ad"/><path d="M103 374 l3.4 11 l4 1 l-3.4 -11Z" fill="#b8c0c8"/>
      <path d="M100 370 A24 5.6 0 0 0 148 370" stroke="#6d7680" stroke-width="2" fill="none"/>`;
    if (ok) {
      for (let i = 0; i < 13; i++) { const a = (i / 12) * Math.PI; s += dot(124 + Math.cos(a) * 22, 370 + Math.sin(a) * 5 - 1.4, 2.6 + (i % 3) * 0.8, '#fff', 0.95); }
      s += `<path d="M144 366 l6 1 l-1 13 l-6 -1Z" fill="#8fbfe6"/><path d="M144.4 370 l5.4 0.8 M144 374 l5.4 0.8" stroke="#fff" stroke-width="1"/>
        <circle class="rs-bub" cx="110" cy="356" r="2.6" fill="#dff1fb" fill-opacity="0.4" stroke="#fff" stroke-width="0.7"/><circle class="rs-bub" style="animation-delay:-1.4s" cx="139" cy="352" r="2" fill="#dff1fb" fill-opacity="0.4" stroke="#fff" stroke-width="0.7"/>`;
    }
    s += `${oval(117, 371.4, 2.6, 1.6, fur)}${oval(131, 371.4, 2.6, 1.6, fur)}`;
    return s + '</g>';
  }

  // -------------------------------------------------------- sign and fence
  function bluebells(x, y, flip) {
    const k = flip ? -1 : 1;
    let s = `<path d="M${x} ${y + 6} q${-2 * k} -6 ${3 * k} -11" stroke="#7fae52" stroke-width="0.8" fill="none"/>`;
    for (const [dx, dy] of [[2.4, -4.4], [1, -1], [-0.2, 2.4]]) s += `<path d="M${f1(x + dx * k)} ${f1(y + dy)} q${f1(-1.6 * k)} 0.4 ${f1(-1.6 * k)} 2.6 l${f1(3.2 * k)} 0 q0 -2.2 ${f1(-1.6 * k)} -2.6Z" fill="#8aa0ea"/>`;
    return s;
  }
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = ok ? C.rescueSign : U.mix(C.rescueSign, '#a59e90', 0.65), post = ok ? '#7a5a3c' : '#6f6a60';
    let s = `<g data-part="sign">${shadow(200, 535, 50, 2.4)}`;
    for (const x of [156, 237]) s += `<rect x="${x}" y="434" width="7" height="100" fill="${post}"/><rect x="${x + 5.4}" y="434" width="1.6" height="100" fill="${U.shade(post, -0.25)}"/><rect x="${x - 1.5}" y="431" width="10" height="5" rx="1.5" fill="${U.shade(post, -0.2)}"/>`;
    const board = `<rect x="150" y="440" width="100" height="28" rx="4" fill="${col}"/><rect x="152.5" y="442.5" width="95" height="23" rx="3" fill="none" stroke="${ok ? '#f6efe0' : '#c9c1b2'}" stroke-width="1"/>`;
    if (ok) {
      s += `${board}<text x="200" y="451.8" text-anchor="middle" font-family="${FONT}" font-size="7.4" font-weight="900" letter-spacing="1.4" fill="#f6efe0">BLUEBELL</text>
        <text x="200" y="463" text-anchor="middle" font-family="${FONT}" font-size="10.4" font-weight="900" letter-spacing="1.2" fill="#fbf3dc">RESCUE</text>${bluebells(161, 454, false)}${bluebells(239, 454, true)}`;
      if (winter()) s += `<path d="M152 441 Q200 437 248 441" stroke="${SNOW}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    } else {
      // faded, peeling and hanging askew, with letters missing
      s += `<g transform="rotate(-5 200 454)">${board}
        <text x="200" y="451.8" text-anchor="middle" font-family="${FONT}" font-size="7.4" font-weight="900" letter-spacing="1.4" fill="#ece4d2" opacity="0.6">BL EBE L</text>
        <text x="200" y="463" text-anchor="middle" font-family="${FONT}" font-size="10.4" font-weight="900" letter-spacing="1.2" fill="#ece4d2" opacity="0.6">R SC E</text>
        ${oval(166, 447, 6, 2.6, '#d8cfbf', 0.8)}${oval(232, 461, 7, 3, '#d8cfbf', 0.75)}${oval(214, 446, 3.4, 1.8, '#d8cfbf', 0.7)}</g>`;
    }
    if (p === 'grow') s += `<rect x="150" y="440" width="100" height="28" rx="4" fill="${FADE}" opacity="0.45"/>`;
    if (winter()) s += `<rect x="154.5" y="429.4" width="10" height="2.4" rx="1.2" fill="${SNOW}"/><rect x="235.5" y="429.4" width="10" height="2.4" rx="1.2" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  const POSTS = [[4, 30, 56, 82, 108, 134], [266, 292, 318, 344, 370, 396]];
  function fence(st, C) {
    const p = pend(st, 'fence'), ok = st.fence;
    const c = ok ? C.paddock : '#a39d92', dk = U.shade(c, -0.28);
    let s = '<g data-part="fence">';
    POSTS.forEach((xs, side) => {
      const ends = side === 0 ? [...xs, 157] : [241, ...xs];
      for (let i = 0; i < ends.length - 1; i++) {
        const x0 = ends[i], x1 = ends[i + 1] + 3;
        [496, 508, 520].forEach((y, k) => {
          // a neglected fence has a rail missing and another hanging down
          if (!ok && side === 0 && i === 2 && k === 1) return;
          if (!ok && side === 1 && i === 3 && k === 0) {
            s += `<g transform="rotate(22 ${x0} ${y})"><rect x="${x0}" y="${y}" width="${x1 - x0}" height="4" rx="1" fill="${c}"/></g>`;
            return;
          }
          s += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="4" rx="1" fill="${c}"/><rect x="${x0}" y="${y + 3}" width="${x1 - x0}" height="1" fill="${dk}"/>`;
        });
      }
      for (const x of xs) {
        const tilt = !ok && x === 82 ? -7 : !ok && x === 344 ? 6 : 0;
        s += `<g transform="rotate(${tilt} ${x + 2.5} 532)"><rect x="${x}" y="490" width="5" height="43" rx="1" fill="${c}"/><rect x="${x + 3.6}" y="490" width="1.4" height="43" fill="${dk}"/>${winter() ? `<rect x="${x - 0.5}" y="488.6" width="6" height="2.4" rx="1.2" fill="${SNOW}"/>` : ''}</g>`;
      }
    });
    if (!ok) s += '<path d="M14 499 l5 0 M120 511 l4 1 M300 499 l6 0 M380 523 l4 0" stroke="#d3cbbd" stroke-width="1.2"/>';
    if (ok && winter()) s += `<rect x="0" y="494.8" width="160" height="1.8" fill="${SNOW}"/><rect x="240" y="494.8" width="160" height="1.8" fill="${SNOW}"/>`;
    if (p === 'grow') s += `<rect x="0" y="488" width="158" height="46" fill="${FADE}" opacity="0.45"/><rect x="242" y="488" width="158" height="46" fill="${FADE}" opacity="0.45"/>`;
    return s + '</g>';
  }

  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="262.5" y="414" width="3" height="24" fill="#8a6142"/><g transform="rotate(4 264 411)">
      <rect x="240" y="400" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="264" y="413.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 264 418)"><rect x="237" y="414" width="54" height="10" fill="#d9534f"/><text x="264" y="422" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function hen(x, y, col, flip) {
    return `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}">${shadow(0, 3.8, 5, 1.2)}<path d="M-1 2 v2.4 M1.4 2 v2.4" stroke="#e8964a" stroke-width="0.8"/>
      ${oval(0, 0, 5, 3.6, col)}<path d="M-4 -1 q-3 -4 -1 -6 q2 2 2.6 5Z" fill="${U.shade(col, -0.15)}"/>${dot(3.6, -3, 2.2, col)}
      <path d="M3 -5 q0.6 -1.6 1.6 -0.6 q0.8 -1 1.2 0.4 l-1.6 1Z" fill="#d9534f"/><path d="M5.6 -3 l1.8 0.5 l-1.8 0.6Z" fill="#f2c230"/>${dot(4, -3.4, 0.45, '#222')}</g>`;
  }
  // sunflowers turn to seed heads in the cold half of the year
  function sunflower(x, y, h) {
    let s = `<path d="M${x} ${y} V${y - h}" stroke="${winter() ? '#8a7a5a' : '#5f8a3a'}" stroke-width="1.6"/>${oval(x - 3, y - h * 0.45, 3.4, 1.4, winter() ? '#9a8a64' : '#6f9a44')}${oval(x + 3, y - h * 0.65, 3.4, 1.4, winter() ? '#9a8a64' : '#6f9a44')}`;
    if (!winter()) for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; s += dot(x + Math.cos(a) * 4.2, y - h + Math.sin(a) * 4.2, 1.9, SEASON === 'autumn' ? '#e9a23c' : '#f2c230'); }
    return s + dot(x, y - h, winter() ? 3.4 : 2.8, winter() ? '#5a3f26' : '#7a4a22') + (winter() ? oval(x, y - h - 2.6, 3.4, 1.2, SNOW) : '');
  }
  function goat(x, y) {
    return `<g transform="translate(${x} ${y})"><path d="M-5 2 V7 M-2.6 2.6 V7.4 M3 2.6 V7.4 M5.2 2 V7" stroke="#d8cfc2" stroke-width="1.6" stroke-linecap="round"/>
      ${oval(0, 0, 7, 4.2, '#f4efe6')}<path d="M-6.6 -1.6 l-2 -3" stroke="#f4efe6" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M5 -2 L8 -7 L11 -5 L9 0Z" fill="#f4efe6"/>${oval(10.4, -5.4, 3.2, 2.2, '#f4efe6')}<path d="M8.6 -7.4 q-1 -3 1.6 -4.6 M10 -7.4 q0.6 -2.6 3 -3.4" stroke="#8a7a64" stroke-width="0.9" fill="none" stroke-linecap="round"/>
      ${oval(8, -6.2, 1.8, 0.8, '#e6dccd')}${dot(10.8, -6, 0.5, '#222')}<path d="M12.4 -3.6 l0.6 2.6" stroke="#d8cfc2" stroke-width="1" stroke-linecap="round"/></g>`;
  }
  const BULBS = (() => {
    const out = [];
    for (let i = 0; i < ROOF_PTS.length - 1; i++) {
      const a = ROOF_PTS[i], b = ROOF_PTS[i + 1], n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 9);
      for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n + 5]);
    }
    return out;
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const FAR = {
    'r-rainbow': () => `<g opacity="0.42" fill="none">${['#e2574c', '#f08a3a', '#f2c230', '#7bb553', '#3d86c6', '#8a6fc4'].map((c, i) => `<path d="M${30 + i * 4} 232 A${170 - i * 4} ${150 - i * 4} 0 0 1 ${370 - i * 4} 232" stroke="${c}" stroke-width="4"/>`).join('')}</g>`,
  };
  const DECOR = {
    'r-bunting': () => {
      let s = '<path d="M16 192 Q79 206 142 192" stroke="#6b5a4a" stroke-width="0.7" fill="none"/>';
      const cols = ['#e2574c', '#f2c230', '#3d86c6', '#4f9d7a', '#ef8aa6'];
      for (let i = 0; i < 11; i++) {
        const t = (i + 0.5) / 11, m = 1 - t, x = m * m * 16 + 2 * m * t * 79 + t * t * 142, y = m * m * 192 + 2 * m * t * 206 + t * t * 192;
        s += `<path d="M${f1(x - 4)} ${f1(y)} L${f1(x + 4)} ${f1(y)} L${f1(x)} ${f1(y + 7)}Z" fill="${cols[i % cols.length]}"/>`;
      }
      return `<g>${s}</g>`;
    },
    'r-bench': () => `<g>${shadow(264, 419, 20, 2.4)}<rect x="246" y="397" width="36" height="4" rx="1.4" fill="#a77b56"/><rect x="246" y="404" width="36" height="4.4" rx="1.4" fill="#a77b56"/>
      <rect x="246" y="409" width="36" height="3.6" rx="1.4" fill="#8a6142"/><rect x="248" y="412" width="3" height="7" fill="#3d3d42"/><rect x="277" y="412" width="3" height="7" fill="#3d3d42"/></g>`,
    'r-hens': () => hen(238, 372, '#c96a3a', false) + hen(258, 384, '#f6efe0', true) + hen(218, 392, '#8a5a3c', false),
    'r-sunflowers': () => `<g>${sunflower(146, 500, 52)}${sunflower(139, 502, 40)}${sunflower(254, 500, 50)}${sunflower(261, 502, 38)}</g>`,
    'r-goat': () => `<g>${shadow(135, 305, 20, 2)}<rect x="118" y="294" width="34" height="11" rx="2.4" fill="#e5c25e"/><rect x="124" y="284" width="24" height="11" rx="2.4" fill="#ecca68"/>
      <path d="M120 298 h30 M126 288 h20" stroke="#c49a3a" stroke-width="0.7"/>${goat(134, 277)}</g>`,
    'r-lights': () => `<g><path d="${ROOF_D}" transform="translate(0 5)" stroke="#3d3d42" stroke-width="0.6" fill="none"/>${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    'r-tractor': () => `<g transform="translate(372 410)">${shadow(-2, 10, 22, 2)}<rect x="-15" y="-6" width="21" height="9" rx="2" fill="#d9483b"/><rect x="-2" y="-17" width="11" height="12" rx="1.4" fill="#d9483b"/>
      <rect x="0" y="-15" width="7" height="6" fill="#bfe3f2"/><rect x="-13" y="-12" width="2" height="7" fill="#3d3d42"/>${dot(6, 3, 7, '#2f2b28')}${dot(6, 3, 3.6, '#e9c35a')}${dot(-11, 5, 4, '#2f2b28')}${dot(-11, 5, 2, '#e9c35a')}</g>`,
    'r-donkey': () => donkey(122, 452, 0.82, true, '#7a6a5a'),
    'r-pony': () => pony(24, 472, 0.72),
    'r-ducklings': () => [[344, 456], [350.5, 458], [356.5, 459.6]].map(([x, y]) => `<g transform="translate(${x} ${y})"><g class="rs-bob">${oval(0, 0, 2.6, 1.6, '#f7d65a')}${dot(1.8, -1.6, 1.3, '#f7d65a')}<path d="M3 -1.7 l1.2 0.3 l-1.2 0.4Z" fill="#f2a33a"/></g></g>`).join(''),
    'r-owl': () => `<g><path d="M70 176 Q70 158 79 156 Q88 158 88 176Z" fill="#a8835a"/>${oval(79, 166, 7, 6, '#e8d5b0')}${dot(76, 165, 2.6, '#f2c230')}${dot(82, 165, 2.6, '#f2c230')}
      ${dot(76, 165, 1.2, '#222')}${dot(82, 165, 1.2, '#222')}<path d="M79 167 l-1 1.6 h2Z" fill="#c98a3a"/><path d="M72 158 l2 -3 l1.6 3.4Z M86 158 l-2 -3 l-1.6 3.4Z" fill="#a8835a"/></g>`,
    'r-rainbow': FAR['r-rainbow'],
  };
  function farDecor(owned) {
    let s = '';
    for (const k of Object.keys(FAR)) if (owned[k]) s += FAR[k]();
    return s;
  }
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && !FAR[k]) s += DECOR[k]();
    return s;
  }

  // a dog chasing a ball across the yard once everything is lovely again
  function playingDog(x, y) {
    return `<g transform="translate(${x} ${y})">${shadow(0, 9, 8, 1.4)}<path d="M-6 2 l-3 4 M-4 2 l-1 5 M4 1 l4 3 M6 0 l5 1" stroke="#e2b36a" stroke-width="1.6" stroke-linecap="round"/>
      ${oval(0, 0, 7, 3.4, '#e2b36a')}<path class="rs-wag" d="M-6.4 -1.4 q-3 -1.6 -3.4 -5" stroke="#e2b36a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${dot(7.4, -3, 3, '#e2b36a')}${oval(6, -4.6, 1.3, 2.4, '#c48c48')}${dot(8.4, -3.6, 0.6, '#2b2422')}${dot(10.2, -2.2, 0.7, '#2b2422')}${TOY.ball(15, -9)}</g>`;
  }
  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M150 100 q4 -4 8 0 q4 -4 8 0 M174 112 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    if (PCT > 0.6 && !winter()) s += '<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>';
    if (PCT > 0.8 && SEASON === 'summer') s += '<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>';
    if (PCT > 0.85 && st.toys && !winter()) s += playingDog(262, 346);
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

  // evening: darken everything except the lit windows, then let lights glow
  function night(st, decor) {
    const lit = (part) => st[part] && !PEND[part];
    const up = PCT > 0.5;
    let holes = '';
    if (lit('window')) holes += '<rect x="334" y="238" width="44" height="30"/>';
    if (up) holes += '<rect x="276" y="196" width="24" height="22"/><rect x="354" y="196" width="24" height="22"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 140)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="343" cy="48" r="14" fill="#000"/></mask><circle cx="336" cy="54" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="336" cy="54" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (lit('window')) s += `<rect x="334" y="238" width="44" height="30" fill="#ffd98a" opacity="0.35"/>${glow(356, 253, 40, 30)}${glow(356, 290, 34, 8)}`;
    if (up) s += `${glow(288, 207, 22)}${glow(366, 207, 22)}`;
    if (st.floor) s += `<rect x="46" y="214" width="66" height="76" fill="#ffd98a" opacity="0.12"/>${glow(60, 251, 26)}${glow(79, 292, 40, 7)}`;
    if (st.door) s += `<rect x="321" y="232" width="4" height="6" rx="1" fill="#fff0b8"/>${glow(323, 235, 18)}`;
    if (decor['r-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="6.4" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    trail: [222, 200], floor: [79, 266], hutch: [47, 314], veg: [123, 322], door: [301, 266], window: [356, 253], cat: [362, 264],
    bowls: [212, 300], trough: [361, 307], yard: [222, 352], seal: [348, 352], toys: [50, 372], tub: [124, 372],
    sign: [200, 454], fence: [80, 510], meadow: [80, 470], pond: [322, 450], feed: [273, 268], beds: [70, 284],
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

  // st: map of restored part -> true; cols: chosen paint colours (paddock,
  // rescueDoor, rescueSign); opts as for COVE.render
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    palette({ paddock: cols.paddock || '#f4ecdc', rescueDoor: cols.rescueDoor || '#3d5a86', rescueSign: cols.rescueSign || '#4e7b5b' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house rescue">
      ${style()}${defs()}${sky()}${opts.night ? '' : farDecor(decor)}${hills(st)}${ground()}${meadow(st)}${yard(st)}
      ${barn(st)}${beds(st)}${farmhouse(st, C)}${feed(st)}${kennels(st)}${bowls(st)}${trough(st)}${cat(st)}${hutch(st)}${veg(st)}${clutter()}
      ${seal(st)}${toys(st)}${tub(st)}${donkey(62, 432, 0.95)}${hooves(st, 62, 432, 0.95)}${pond(st)}${saleSign()}
      ${fence(st, C)}${sign(st, C)}${decorations(decor)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS: Object.keys(SPOTS) };
})();
