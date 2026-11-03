'use strict';
// Screens, saving, the shed and the flow between the cottage and a chore.

(() => {
  const $ = (s) => document.querySelector(s);
  const SAVE_KEY = 'ivycottage.v1';

  // ------------------------------------------------------------------ save
  function fresh() {
    return { coins: 0, earned: 0, tiers: {}, done: {}, finds: {}, colours: Object.assign({}, DATA.DEFAULT_COLOURS), helpers: 0, sfx: true, music: true, touched: 0, seasonNo: 0, sdone: {}, decor: {}, name: '', evening: true, wips: {}, place: 'cottage', owned: { cottage: 1, beta: 1 }, use: {}, musicVol: 0.45, cloud: {}, jobsDone: 0, pauses: true, started: Date.now(), robots: true, round: 1, restoredAt: {}, goodnight: true };
  }
  // fill in anything an older save does not have yet
  function upgrade(s) {
    const f = fresh();
    const out = Object.assign(f, s, { colours: Object.assign(f.colours, s.colours) });
    if (s.wip && s.wip.id && !s.wips) out.wips = { [s.wip.id]: s.wip.grid };
    delete out.wip;
    out.wips = out.wips || {};
    // the puzzle room is open to everyone from the start
    out.owned = Object.assign({ cottage: 1, beta: 1 }, s.owned);
    out.use = out.use || {};
    // tools used to be shared by every place; each place now keeps its own,
    // so an older save gets the tools it had at every place it already owns
    const perPlace = (o) => {
      const n = {};
      for (const [k, v] of Object.entries(o)) {
        if (k.includes(':')) n[k] = v;
        else for (const pl of Object.keys(out.owned)) n[`${pl}:${k}`] = v;
      }
      return n;
    };
    out.tiers = perPlace(out.tiers || {}); out.use = perPlace(out.use);
    if (typeof out.musicVol !== 'number') out.musicVol = 0.45;
    out.cloud = out.cloud || {};
    if (typeof out.pauses !== 'boolean') out.pauses = true;
    if (typeof out.goodnight !== 'boolean') out.goodnight = true;
    if (typeof out.jobsDone !== 'number') out.jobsDone = Object.values(out.done).reduce((a, b) => a + b, 0) + Object.keys(out.sdone).length;
    if (!out.owned[out.place]) out.place = 'cottage';
    // seasons used to be one fixed list of eight; the varied ones start afresh
    if (Object.keys(out.sdone || {}).some((k) => /^s\d+-\d+$/.test(k))) out.sdone = {};
    out.coins = Math.max(0, Math.round(out.coins) || 0); out.earned = Math.round(out.earned || 0);
    // New places now open a few seasons after the one before is restored.
    // An older save keeps the places it could already reach without a wait,
    // and the waits for the newer places start from today's season.
    if (!s.restoredAt || typeof s.restoredAt !== 'object') {
      out.restoredAt = {}; out.oldWaits = true;
      for (const p of DATA.PLACES) {
        if (!p.beta && out.owned[p.id] && p.chores.every((c) => out.done[c.id])) out.restoredAt[p.id] = out.seasonNo || 0;
      }
    }
    return out;
  }
  function load() {
    try {
      // a save is never thrown away over a broken coin count (NaN is stored as null)
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && typeof s === 'object' && 'coins' in s && s.done) return upgrade(s);
    } catch (_) {}
    return fresh();
  }
  let S = load();
  let saveWarned = false;
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }
    catch (_) { if (!saveWarned) { saveWarned = true; toast('This phone would not let the game save'); } }
    if (S.cloud.code && cloudSig() !== pushedSig) cloudSoon();
  }

  // Every place has its own toolbox: tools bought at the cottage stay there,
  // and a new place starts with simple tools again (a little dearer).
  // tierIdx = the best tool owned there; useIdx = the one picked for work,
  // which can be any owned tool (some days the shears are nicer than the tractor)
  const toolKey = (fam, pl = S.place) => `${pl}:${fam}`;
  const tierIdx = (fam, pl) => S.tiers[toolKey(fam, pl)] || 0;
  const useIdx = (fam, pl) => { const u = S.use[toolKey(fam, pl)]; return Math.min(tierIdx(fam, pl), u != null ? u : tierIdx(fam, pl)); };
  const tierOf = (fam, pl) => TOOLS.FAM[fam].tiers[useIdx(fam, pl)];

  // ---------------------------------------------------------------- places
  // Each place has its own chores, picture and decorations; coins, tools,
  // helpers and the turning year are shared. The puzzle room (beta) stands
  // outside the order the places are restored in: it is never bought, has no
  // seasons and never calls you over.
  const here = () => DATA.placeOf(S.place);
  const owned = (id) => !!S.owned[id];
  const MAIN = DATA.PLACES.filter((p) => !p.beta);
  const doneCount = (pl = S.place) => DATA.placeOf(pl).chores.filter((c) => S.done[c.id]).length;
  const totalDone = () => DATA.PLACES.reduce((n, p) => n + doneCount(p.id), 0);
  const restored = (pl) => doneCount(pl) === DATA.placeOf(pl).chores.length;
  const restoredPlaces = () => MAIN.filter((p) => owned(p.id) && restored(p.id)).map((p) => p.id);
  // a puzzle comes out different every time it is played again
  const seedFor = (c) => (c.puzzle ? c.seed + (S.done[c.id] || 0) * 977 : c.seed);
  const placeName = (pl = S.place) => (pl === 'cottage' ? cottageName() : DATA.placeOf(pl).name);
  const seasonJobs = () => DATA.seasonJobs(S.seasonNo, restoredPlaces());
  const jobsAt = (pl) => seasonJobs().filter((j) => j.place === pl);
  // a restored place with no jobs this season is resting (the season budget, data.js)
  const resting = (pl) => !DATA.placeOf(pl).beta && S.seasonNo > 0 && owned(pl) && restored(pl) && !jobsAt(pl).length;
  // after nine in the evening the thinking jobs come last in the season (never skipped)
  const seasonOrder = (pl) => {
    const js = jobsAt(pl);
    return lateHour() ? js.filter((j) => j.family !== 'think').concat(js.filter((j) => j.family === 'think')) : js;
  };
  const nextRestore = (pl) => DATA.placeOf(pl).chores.find((c) => !S.done[c.id]);
  const nextChore = (pl = S.place) => nextRestore(pl) || (S.seasonNo > 0 ? seasonOrder(pl).find((j) => !S.sdone[j.id]) : undefined);
  // the next place round the village with something to do, after the one you
  // are at, so a season is a walk round the places rather than always the cottage first
  function nextPlaceWithJobs(from = S.place) {
    const i = MAIN.findIndex((p) => p.id === from), n = MAIN.length;
    for (let k = 1; k <= n; k++) {
      const p = MAIN[(i + k + n) % n];
      if (p.id !== from && owned(p.id) && nextChore(p.id)) return p;
    }
    return null;
  }
  const seasonName = () => (S.seasonNo ? DATA.seasonOf(S.seasonNo) : 'spring');
  // the tool families a place has had use for so far
  const famUnlocked = (fam, pl = S.place) => {
    if (!owned(pl)) return false;
    if (jobsAt(pl).some((j) => j.family === fam)) return true;
    if (DATA.FAMILY_SEASON[fam] && S.seasonNo >= DATA.FAMILY_SEASON[fam] && restored(pl)) return true;
    const p = DATA.placeOf(pl), n = nextRestore(pl), reach = n ? n.index : p.chores.length;
    return p.chores.some((c) => c.family === fam && c.index <= reach);
  };
  // ------------------------------------------------------------ opening
  // A new place goes up for sale step by step: the place before it restored,
  // then a few seasons of looking after it (a whole year for the later ones),
  // and the coins. Seasons only turn when their jobs are done, never on their
  // own, so the wait is always in your own hands and nothing is ever lost.
  const NEWER = new Set(['canal', 'books', 'pottery', 'halt']); // older saves wait for these only
  const yearOf = (n) => 1 + Math.floor(n / 4);
  const whenLabel = (n) => `${DATA.SEASON_NAMES[n > 0 ? DATA.seasonOf(n) : 'spring']}, year ${yearOf(n)}`;
  const waitOf = (p) => (S.oldWaits && !NEWER.has(p.id) ? 0 : p.wait || 0);
  const WAIT_WORDS = ['', 'One season after that', 'Two seasons after that', 'Three seasons after that', 'A year after that'];
  // remember the season each place was first restored in
  function noteRestored() {
    for (const p of MAIN) if (owned(p.id) && restored(p.id) && S.restoredAt[p.id] == null) S.restoredAt[p.id] = S.seasonNo;
  }
  // the season a place can be bought from, or null while the one before is not restored yet
  const opensAt = (p) => (!p.needs ? 0 : restored(p.needs) && S.restoredAt[p.needs] != null ? S.restoredAt[p.needs] + waitOf(p) : null);
  // everything that has to be true, ticked off one by one; the coins come last
  function criteria(p) {
    const out = [];
    if (p.needs) out.push({ ok: restored(p.needs), text: `${placeName(p.needs)} restored` });
    const w = waitOf(p), at = opensAt(p);
    if (w) {
      const left = at == null ? w : at - S.seasonNo;
      out.push(at == null ? { ok: false, text: WAIT_WORDS[w] || `${w} seasons after that` }
        : { ok: left <= 0, text: left <= 0 ? whenLabel(at) : `${whenLabel(at)} · ${left} season${left > 1 ? 's' : ''} to go` });
    }
    const rich = S.coins >= p.price;
    out.push({ ok: rich, coins: true, text: rich ? `${U.fmt(p.price)} coins` : `${U.fmt(p.price)} coins · you have ${U.fmt(S.coins)}` });
    return out;
  }
  const opened = (p) => criteria(p).every((c) => c.ok || c.coins);
  function placeOffer() {
    return MAIN.find((p) => !owned(p.id) && opened(p));
  }
  function renderPlace(id, st, opts) {
    if (id === 'beta' && typeof BETA !== 'undefined') return BETA.render(st, S.colours, opts);
    if (id === 'cafe' && typeof CAFE !== 'undefined') return CAFE.render(st, S.colours, opts);
    if (id === 'cove' && typeof COVE !== 'undefined') return COVE.render(st, S.colours, opts);
    if (id === 'rescue' && typeof RESCUE !== 'undefined') return RESCUE.render(st, S.colours, opts);
    if (id === 'glasshouse' && typeof GLASSHOUSE !== 'undefined') return GLASSHOUSE.render(st, S.colours, opts);
    if (id === 'canal' && typeof CANAL !== 'undefined') return CANAL.render(st, S.colours, opts);
    if (id === 'books' && typeof BOOKS !== 'undefined') return BOOKS.render(st, S.colours, opts);
    if (id === 'pottery' && typeof POTTERY !== 'undefined') return POTTERY.render(st, S.colours, opts);
    if (id === 'halt' && typeof HALT !== 'undefined') return HALT.render(st, S.colours, opts);
    return HOUSE.render(st, S.colours, opts);
  }
  // the cottage's painted wall shows around its doors and windows; the café
  // and the farmhouse at the rescue have walls of their own
  const wallOpts = (c) => (c.place === 'cottage' || c.place === 'cove') && S.done.wall ? { wallColor: S.colours.wall } : {};
  // decorations plus the Christmas lights once they are up this winter
  function decorAt(pl) {
    const lit = jobsAt(pl).some((j) => /lights$/.test(j.base) && S.sdone[j.id]);
    return lit ? Object.assign({}, S.decor, { [DATA.placeOf(pl).lights]: 1 }) : S.decor;
  }
  function partsDone(pl) {
    const st = {};
    for (const c of DATA.placeOf(pl).chores) if (S.done[c.id]) st[c.part] = true;
    return st;
  }
  function pendingAt(pl) {
    const pending = {};
    for (const j of jobsAt(pl)) if (!S.sdone[j.id] && j.part) pending[j.part] = j.pending;
    return pending;
  }
  function nextUpgrade(fam, pl = S.place) {
    const t = tierIdx(fam, pl), tiers = TOOLS.FAM[fam].tiers;
    if (t + 1 >= tiers.length) return null;
    return { tier: tiers[t + 1], cost: DATA.toolCost(fam, t + 1, pl) };
  }
  function buyTool(fam, pl, u) {
    const k = toolKey(fam, pl);
    S.coins -= u.cost; S.tiers[k] = tierIdx(fam, pl) + 1; S.use[k] = S.tiers[k]; save();
  }
  function affordableSomething() {
    if (here().beta) return false; // nothing to buy in the puzzle room
    for (const fam of Object.keys(TOOLS.FAM)) {
      if (!famUnlocked(fam)) continue;
      const u = nextUpgrade(fam);
      if (u && S.coins >= u.cost) return true;
    }
    const h = helperOffer();
    if (h && S.coins >= h.cost) return true;
    return doneCount() >= DATA.DECOR_UNLOCK && here().decor.some((d) => !S.decor[d.id] && S.coins >= d.cost);
  }
  function helperOffer() {
    if (totalDone() < DATA.HELPER_UNLOCK) return null;
    if (S.helpers >= DATA.HELPER_COSTS.length) return null;
    return { cost: DATA.HELPER_COSTS[S.helpers] };
  }

  // ------------------------------------------------------------- screens
  function show(id) {
    for (const el of document.querySelectorAll('.screen')) el.classList.toggle('on', el.id === id);
  }

  let fakeHour = null; // test hook: __ivy.setHour(h)
  const hourNow = () => (fakeHour != null ? fakeHour : new Date().getHours());
  const isEvening = () => { const h = hourNow(); return S.evening && (h >= 20 || h < 6); };
  // after nine in the evening, stopping is the main button
  const lateHour = () => { const h = hourNow(); return h >= 21 || h < 5; };
  const cottageName = () => S.name || 'Ivy Cottage';

  function coinHtml(n) { return `<i class="coin"></i><span>${U.fmt(n)}</span>`; }

  // ---------------------------------------------------------------- home
  let freshPart = null;
  function renderHome() {
    noteRestored();
    const pl = here();
    const st = partsDone(pl.id), pending = pendingAt(pl.id);
    const pct = doneCount() / pl.chores.length;
    $('#scene').innerHTML = renderPlace(pl.id, st, { pct, fresh: freshPart, season: seasonName(), pending, decor: decorAt(pl.id), night: isEvening() });
    $('#brandName').textContent = placeName();
    $('#brandChev').hidden = DATA.PLACES.filter((p) => owned(p.id)).length < 2;
    if (freshPart) {
      const g = $('#scene').querySelectorAll(`[data-part="${freshPart}"]`);
      g.forEach((el) => el.classList.add('fresh'));
    }
    freshPart = null;
    $('#homeCoins').innerHTML = coinHtml(S.coins);
    const jobs = jobsAt(pl.id), quiet = resting(pl.id);
    if (!restored(pl.id) || S.seasonNo === 0 || !jobs.length) {
      $('#restoredBar').style.width = (pct * 100).toFixed(1) + '%';
      if (pl.beta) $('#restoredTxt').textContent = pct >= 1 ? pl.done : `${doneCount()} of ${pl.chores.length} puzzles solved`;
      else if (quiet) $('#restoredTxt').textContent = `All quiet at ${pl.id === 'cottage' ? placeName() : pl.short} this ${seasonName()}`;
      else $('#restoredTxt').textContent = pct >= 1 ? `${placeName()} is restored` : `${doneCount()} of ${pl.chores.length} jobs done`;
    } else {
      const d = jobs.filter((j) => S.sdone[j.id]).length;
      $('#restoredBar').style.width = ((d / jobs.length) * 100).toFixed(1) + '%';
      $('#restoredTxt').textContent = `${DATA.SEASON_NAMES[seasonName()]}, year ${1 + Math.floor(S.seasonNo / 4)} · ${d} of ${jobs.length}`;
    }
    document.body.dataset.season = seasonName();
    AUDIO.theme({ place: S.place, season: seasonName(), night: isEvening() });
    AUDIO.birds((seasonName() === 'spring' || seasonName() === 'summer') && !isEvening());
    const n = nextChore();
    const card = $('#nextCard');
    // season jobs still waiting somewhere else: the next place round the village
    const elsewhere = S.seasonNo > 0 && nextPlaceWithJobs(pl.id);
    if (n) {
      const fam = TOOLS.FAM[n.family];
      const where = n.seasonNo ? DATA.SEASON_NAMES[n.season] : DATA.AREAS[n.area];
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">${where} · ${fam.job}</div><div class="nextName">${n.name}</div>
        <div class="nextMeta">${coinHtml(n.value)}<span class="dot">·</span><span>${S.wips[n.id] ? 'Half done' : tierOf(n.family, n.place).name}</span></div></div>
        <div class="nextPic"><img alt="" hidden><div class="nextIcon"></div></div><button class="go" id="goBtn">Start</button>`;
      card.querySelector('.nextIcon').appendChild(TOOLS.icon(tierOf(n.family, n.place), 46, S.colours[n.color]));
      card.dataset.job = n.id;
      const showThumb = (url) => {
        const img = card.querySelector('.nextPic img');
        if (!url || !img || card.dataset.job !== n.id) return;
        img.src = url; img.hidden = false; card.querySelector('.nextPic').classList.add('has');
      };
      if (thumbs.has(thumbKey(n))) showThumb(thumbs.get(thumbKey(n)));
      else setTimeout(() => showThumb(jobThumb(n)), 80);
      $('#goBtn').onclick = () => { AUDIO.pop(); startChore(n, false); };
    } else if (pl.beta) {
      card.dataset.job = '';
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">All solved</div><div class="nextName">Every puzzle comes out new each time</div>
        <div class="nextMeta">Play any of them again from the list.</div></div><button class="go" id="goBtn">Puzzles</button>`;
      $('#goBtn').onclick = () => { AUDIO.pop(); openJobs(); };
    } else if (elsewhere) {
      card.dataset.job = '';
      const what = nextRestore(elsewhere.id) ? 'Jobs are waiting' : `${DATA.SEASON_NAMES[seasonName()]} jobs are waiting`;
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">${quiet ? `Quiet this ${seasonName()}` : 'All tidy here'}</div><div class="nextName">${what} at ${placeName(elsewhere.id)}</div>
        <div class="nextMeta">${quiet ? 'Nothing needs doing here this season.' : 'Everything here is done for now.'}</div></div><button class="go" id="goBtn">Go there</button>`;
      $('#goBtn').onclick = () => { AUDIO.pop(); goPlace(elsewhere.id); };
    } else {
      card.dataset.job = '';
      const upcoming = DATA.SEASON_NAMES[DATA.seasonOf(S.seasonNo + 1)];
      const title = S.seasonNo === 0 ? pl.done : `${DATA.SEASON_NAMES[seasonName()]} is all tidy`;
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">${S.seasonNo === 0 ? 'All restored' : 'Season done'}</div><div class="nextName">${title}</div>
        <div class="nextMeta">${upcoming} is on its way, with new jobs.</div></div><button class="go" id="goBtn">${upcoming}</button>`;
      $('#goBtn').onclick = () => {
        const before = MAIN.filter((p) => !owned(p.id) && opened(p)).map((p) => p.id);
        S.seasonNo++; S.sdone = {}; save();
        AUDIO.chime();
        seasonCard(upcoming);
        renderHome();
        // a place that has waited for this season says so, once, quietly
        const now = MAIN.find((p) => !owned(p.id) && opened(p) && !before.includes(p.id));
        if (now) setTimeout(() => toast(`${now.name} is for sale now, in Places`, 4000), 2800);
      };
    }
    $('#btnShed').classList.toggle('alert', affordableSomething());
    const offer = placeOffer();
    $('#btnPlaces').classList.toggle('alert', !!offer && S.coins >= offer.price);
    $('#scene').querySelectorAll('[data-part]').forEach((el) => {
      el.addEventListener('click', () => {
        const part = el.dataset.part;
        const sj = jobsAt(pl.id).find((j) => j.part === part && !S.sdone[j.id]);
        const c = sj || pl.chores.find((x) => x.part === part);
        if (c && (sj || S.done[c.id] || pl.beta)) { AUDIO.soft(); openJobs(c.id); }
      });
    });
  }
  // a little picture of the mess for the next-job card, drawn once per job
  const thumbs = new Map();
  const thumbKey = (c) => `${c.id}|${seedFor(c)}`;
  function jobThumb(c) {
    const key = thumbKey(c);
    if (thumbs.has(key)) return thumbs.get(key);
    let url = null;
    try {
      const cv = U.canvas(128, 128), x = cv.getContext('2d'), k = cv.width / 360;
      const sc = SCENES.build(c.scene, Object.assign({}, c.opts, wallOpts(c)), seedFor(c), { x0: -4, y0: -4, x1: 364, y1: 604 });
      if (sc.puzzle) {
        // a puzzle shows the square it picks for pictures, as it starts
        const cr = sc.crop || { x: 0, y: 120, w: 360, h: 360 }, kk = cv.width / cr.w;
        x.setTransform(kk, 0, 0, kk, -cr.x * kk, -cr.y * kk);
        sc.decor(x); sc.draw(x, 0, true);
        url = cv.toDataURL('image/jpeg', 0.82);
        thumbs.set(key, url);
        return url;
      }
      x.setTransform(k, 0, 0, k, 0, -150 * k);
      sc.decor(x);
      if (c.color) { x.save(); x.clip(sc.region, sc.fillRule || 'evenodd'); sc.clean(x, S.colours[c.color]); x.restore(); }
      x.save(); x.clip(sc.region, sc.fillRule || 'evenodd'); sc.dirt(x); x.restore();
      if (sc.unitMode === 'collect') for (const u of sc.units || []) sc.drawUnit(x, u, 1);
      if (sc.top) sc.top(x);
      url = cv.toDataURL('image/jpeg', 0.82);
    } catch (_) {}
    thumbs.set(key, url);
    return url;
  }
  function goPlace(id, bought) {
    S.place = id; save();
    $('#sheet').classList.remove('on');
    renderHome();
    if (bought) { AUDIO.chime(); seasonCard(DATA.placeOf(id).name, 'It is yours!'); }
    else AUDIO.shimmer();
  }

  // ---------------------------------------------------------------- play
  let cur = null, curValue = 0, earnedThis = 0, shownCoins = 0, isReplay = false, justOne = false;
  let foundThis = null, beforePic = null, afterPic = null;
  function startChore(c, replay) {
    AUDIO.birds(false); foundThis = null;
    cur = c; isReplay = replay;
    curValue = Math.round((c.value || 0) * (replay ? 0.6 : 1));
    earnedThis = 0; shownCoins = S.coins;
    show('play');
    $('#doneOverlay').classList.remove('on'); $('#toolPick').classList.remove('on');
    $('#playTitle').textContent = c.name;
    updatePlayCoins();
    setupBottom();
    const insets = hudInsets();
    const fam = c.family;
    const resume = S.wips[c.id] || null;
    delete S.wips[c.id];
    const treasures = [];
    // coin stashes only on a fresh start, or leaving and coming back would refill them
    if (!resume) for (let k = 0; k < 3; k++) treasures.push({ kind: 'coin', value: Math.max(2, Math.round(curValue * 0.05)) });
    const f = c.find || DATA.FINDS[c.id], fid = c.findId || c.id;
    if (f && !S.finds[fid]) treasures.push({ kind: 'find', id: fid, emoji: f[0], name: f[1], value: Math.round(curValue * 0.15) });
    const def = Object.assign({}, c, { seed: seedFor(c), opts: Object.assign({}, c.opts, wallOpts(c)) });
    // no robots for a puzzle: it is done by hand
    ENGINE.start(def, { tier: tierOf(fam, c.place), paint: c.color ? S.colours[c.color] : null, value: curValue, helpers: S.robots && !c.puzzle ? S.helpers : 0, insets, treasures, resume, season: seasonName(), indoor: DATA.isIndoor(c) });
    setupBots();
    beforePic = ENGINE.picture(96);
    const cvs = $('#cv'); cvs.classList.remove('fadein'); void cvs.offsetWidth; cvs.classList.add('fadein');
    lastMilestone = 0;
    const hint = $('#hint');
    if (c.puzzle) { hint.querySelector('span').textContent = c.how; hint.classList.add('on'); }
    else if (S.touched < 3 || c.verb) { hint.querySelector('span').textContent = 'Drag to ' + (c.verb || DATA.VERBS[fam]); hint.classList.add('on'); } else hint.classList.remove('on');
    if (c.puzzle) AUDIO.stopWork(); else AUDIO.setWork(workSound(fam, tierOf(fam, c.place)));
    setProgress(0);
  }
  // the robots can be sent home in the middle of a job, and called back
  function setupBots() {
    const b = $('#btnBots');
    b.hidden = !S.helpers || !!cur.puzzle;
    b.classList.toggle('off', !S.robots);
    b.setAttribute('aria-label', S.robots ? 'Send the robots home' : 'Call the robots back');
  }
  $('#btnBots').onclick = () => {
    S.robots = !S.robots; save();
    ENGINE.setHelpers(S.robots ? S.helpers : 0);
    AUDIO.pop(); setupBots();
    toast(S.robots ? 'The robots are back' : 'The robots went home');
  };
  function hudInsets() {
    return { top: $('#hudTop').getBoundingClientRect().bottom + 6, bottom: window.innerHeight - $('#hudBottom').getBoundingClientRect().top + 6 };
  }
  function workSound(fam, t) {
    if (fam === 'mow') return t.id === 'shears' ? 'mow' : 'mower';
    if (fam === 'scrub') return t.id === 'washer' || t.id === 'turbo' ? 'washer' : 'scrub';
    if (fam === 'dust' && t.id === 'vacuum') return 'vacuum';
    if (fam === 'snow' && t.id === 'blower') return 'snowblower';
    if (fam === 'rake' && t.id === 'blower') return 'washer';
    if (fam === 'rake' && t.id === 'leafvac') return 'vacuum';
    if (fam === 'polish' && (t.id === 'buffer' || t.id === 'twin')) return 'buffer';
    if (fam === 'wipe') return t.id === 'steam' ? 'steam' : 'wipe';
    if (fam === 'groom') return t.id === 'shower' || t.id === 'bubbles' ? 'shower' : 'groom';
    return fam;
  }
  function setupBottom() {
    const fam = cur.family, pl = cur.place, t = tierOf(fam, pl);
    const chip = $('#toolChip');
    // a puzzle has no tools to pick: the chip asks for a hint instead
    if (cur.puzzle) {
      chip.innerHTML = '<span class="bulb" aria-hidden="true">💡</span><span>Hint</span>';
      chip.setAttribute('aria-label', 'Show a hint');
      $('#upPill').classList.remove('on');
      $('#palette').classList.remove('on'); $('#palette').innerHTML = '';
      return;
    }
    chip.setAttribute('aria-label', 'Choose a tool');
    chip.innerHTML = '';
    chip.appendChild(TOOLS.icon(t, 38, cur.color ? S.colours[cur.color] : null));
    const nm = document.createElement('span'); nm.textContent = t.name; chip.appendChild(nm);
    if (tierIdx(fam, pl) > 0) { const sw = document.createElement('b'); sw.className = 'swap'; sw.textContent = '⇄'; chip.appendChild(sw); }
    updateUpPill();
    const pal = $('#palette');
    if (cur.color) {
      pal.classList.add('on');
      pal.innerHTML = DATA.PAINTS.map((p) => `<button class="sw${p.c === S.colours[cur.color] ? ' sel' : ''}" data-c="${p.c}" style="--c:${p.c}" aria-label="${p.name}"></button>`).join('');
      pal.querySelectorAll('.sw').forEach((b) => b.onclick = () => {
        S.colours[cur.color] = b.dataset.c; save();
        pal.querySelectorAll('.sw').forEach((x) => x.classList.toggle('sel', x === b));
        ENGINE.setPaint(b.dataset.c); AUDIO.soft();
        const chipCv = TOOLS.icon(tierOf(fam, pl), 38, b.dataset.c); chip.replaceChild(chipCv, chip.firstChild);
      });
    } else { pal.classList.remove('on'); pal.innerHTML = ''; }
  }
  // pick any tool already owned, from the chip at the bottom
  function openToolPick() {
    if (cur && cur.puzzle) { AUDIO.soft(); ENGINE.hint(); return; }
    const fam = cur.family, pl = cur.place, pick = $('#toolPick');
    if (pick.classList.contains('on') || tierIdx(fam, pl) < 1) { pick.classList.remove('on'); if (tierIdx(fam, pl) < 1) toast('Buy a better tool to have a choice'); return; }
    pick.innerHTML = '';
    TOOLS.FAM[fam].tiers.slice(0, tierIdx(fam, pl) + 1).forEach((t, i) => {
      const b = document.createElement('button');
      if (i === useIdx(fam, pl)) b.className = 'sel';
      b.appendChild(TOOLS.icon(t, 34, cur.color ? S.colours[cur.color] : null));
      const nm = document.createElement('span'); nm.textContent = t.name; b.appendChild(nm);
      b.onclick = () => {
        S.use[toolKey(fam, pl)] = i; save(); pick.classList.remove('on');
        ENGINE.setTier(t); AUDIO.pop(); AUDIO.setWork(workSound(fam, t)); setupBottom();
      };
      pick.appendChild(b);
    });
    pick.classList.add('on'); AUDIO.soft();
  }
  $('#toolChip').onclick = openToolPick;
  function updateUpPill() {
    const pill = $('#upPill');
    const u = nextUpgrade(cur.family, cur.place);
    if (!u) { pill.classList.remove('on'); return; }
    pill.classList.add('on');
    const can = S.coins >= u.cost;
    pill.classList.toggle('can', can);
    pill.innerHTML = `<span class="up">${can ? 'Upgrade' : 'Next'}</span><b>${u.tier.name}</b><span class="cost">${coinHtml(u.cost)}</span>`;
    pill.style.setProperty('--p', Math.min(1, S.coins / u.cost));
  }
  $('#upPill').onclick = () => {
    const fam = cur.family, pl = cur.place, u = nextUpgrade(fam, pl);
    if (!u || S.coins < u.cost) { AUDIO.soft(); $('#upPill').classList.add('nope'); setTimeout(() => $('#upPill').classList.remove('nope'), 400); return; }
    buyTool(fam, pl, u);
    shownCoins = Math.min(shownCoins, S.coins);
    ENGINE.setTier(tierOf(fam, pl));
    AUDIO.buy(); AUDIO.setWork(workSound(fam, tierOf(fam, pl)));
    setupBottom(); updatePlayCoins();
    toast(`${u.tier.name}!`);
  };
  function updatePlayCoins() { $('#playCoins').innerHTML = coinHtml(shownCoins); }
  let lastPct = -1, lastMilestone = 0;
  function setProgress(p) {
    const v = Math.floor(p * 100);
    if (v === lastPct) return;
    lastPct = v;
    const m = Math.floor(v / 25);
    if (m > lastMilestone && m < 4) {
      lastMilestone = m; AUDIO.soft();
      const pr = $('.prog'); pr.classList.remove('pulse'); void pr.offsetWidth; pr.classList.add('pulse');
    }
    $('#progFill').style.width = (p * 100).toFixed(1) + '%';
    $('#progTxt').textContent = v + '%';
  }

  const DONE_WORDS = {
    tidy: ['Lovely!', 'So tidy!', 'Beautiful!', 'All clean!', 'Wonderful!'],
    plant: ['Lovely!', 'So green!', 'Blooming lovely!', 'Beautiful!'],
    build: ['Well built!', 'Solid work!', 'Lovely!', 'Wonderful!'],
    brew: ['Smells lovely!', 'Coffee is served!', 'Lovely!'],
    feed: ['Yum!', 'Happy tummies!', 'Lovely!'],
    walk: ['Good dogs!', 'What a lovely walk!', 'Happy dogs!'],
    brush: ['So fluffy!', 'Purr-fect!', 'So soft!'],
    groom: ['Squeaky clean!', 'So fluffy!', 'Good dog!'],
    muck: ['So cosy!', 'Fresh and snug!', 'Lovely!'],
    think: ['Clever!', 'Well worked out!', 'All in the right place!', 'Lovely thinking!'],
    craft: ['Beautiful!', 'Made by hand!', 'Lovely work!', 'So pretty!'],
  };
  function finishChore() {
    delete S.wips[cur.id];
    const bonus = Math.round(curValue * 0.25);
    S.coins += bonus; S.earned += bonus;
    let first;
    if (cur.seasonNo) { first = !S.sdone[cur.id]; S.sdone[cur.id] = (S.sdone[cur.id] || 0) + 1; }
    else { first = !S.done[cur.id]; S.done[cur.id] = (S.done[cur.id] || 0) + 1; }
    S.jobsDone++;
    save();
    if (first) freshPart = cur.part;
    sitting.jobs++; sitting.coins += earnedThis + bonus; if (foundThis) sitting.finds++;
    AUDIO.chime(); AUDIO.activity(0, false);
    const o = $('#doneOverlay');
    $('#doneTitle').textContent = U.pick(Math.random, DONE_WORDS[cur.family] || DONE_WORDS.tidy);
    $('#doneBtn').textContent = 'Back to ' + here().short;
    // after nine, or after "Just one job", stopping is the main button
    const stopFirst = lateHour() || justOne;
    $('#doneBtn').className = stopFirst ? 'go soft' : 'go'; $('#doneStop').className = stopFirst ? 'go' : 'go soft';
    $('#doneName').textContent = cur.name;
    const ba = $('#doneBA');
    afterPic = ENGINE.picture(96);
    if (afterPic) { const copy = U.canvas(afterPic.width, afterPic.height); copy.getContext('2d').drawImage(afterPic, 0, 0); sitting.pics.push(copy); if (sitting.pics.length > 4) sitting.pics.shift(); }
    ba.innerHTML = '';
    if (beforePic && afterPic) {
      const fig = (pic, label) => { const f = document.createElement('figure'); f.appendChild(pic); const cap = document.createElement('figcaption'); cap.textContent = label; f.appendChild(cap); return f; };
      ba.appendChild(fig(beforePic, 'Before'));
      const ar = document.createElement('span'); ar.className = 'arrow'; ar.textContent = '→'; ba.appendChild(ar);
      ba.appendChild(fig(afterPic, 'After'));
    }
    $('#doneEarn').innerHTML = coinHtml(earnedThis);
    $('#doneBonus').innerHTML = coinHtml(bonus);
    $('#doneFind').innerHTML = foundThis ? `<i>${foundThis.emoji}</i> ${foundThis.name} is on your shelf` : '';
    $('#doneFind').style.display = foundThis ? '' : 'none';
    o.classList.add('on');
    let k = 0; const target = earnedThis + bonus;
    const tick = () => { k = Math.min(target, k + Math.max(1, target / 30)); $('#doneTotal').innerHTML = coinHtml(k); if (k < target) requestAnimationFrame(tick); };
    tick();
    shownCoins = S.coins; updatePlayCoins(); updateUpPill();
  }
  $('#doneBtn').onclick = () => {
    AUDIO.pop();
    const due = pauseDue();
    if (due) document.body.classList.add('pausing'); // so the next job never peeks out first
    leavePlay();
    if (due) setTimeout(openPause, 700);
  };
  $('#doneStop').onclick = () => { AUDIO.soft(); leavePlay(); openPause(); stopNow(); };

  // --------------------------------------------------------------- pauses
  // After a few jobs a quiet card suggests a pause: what this sitting has
  // done, three slow breaths if you like, and an easy way to stop. It never
  // comes in the middle of a job, and it can be switched off in Settings.
  // While it is up, the next job, the progress bar and the shop dots are
  // hidden: the pull to go on is strongest right before a reward.
  const sitting = { jobs: 0, coins: 0, finds: 0, pics: [], since: Date.now(), atJobs: 0 };
  const pauseDue = () => S.pauses && sitting.jobs - sitting.atJobs >= 4 && Date.now() - sitting.since >= 12 * 60000;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  function openPause() {
    const mins = Math.max(1, Math.round((Date.now() - sitting.since) / 60000));
    const jobs = sitting.jobs - sitting.atJobs;
    sitting.atJobs = sitting.jobs; sitting.since = Date.now();
    const el = $('#pause');
    el.querySelector('.pauseSum').innerHTML = `${plural(jobs, 'job')} in ${plural(mins, 'minute')}<span class="dot">·</span>${coinHtml(sitting.coins)}${sitting.finds ? `<span class="dot">·</span>${plural(sitting.finds, 'keepsake')}` : ''}`;
    const pics = el.querySelector('.pausePics'); pics.innerHTML = '';
    for (const p of sitting.pics) pics.appendChild(p);
    sitting.coins = 0; sitting.finds = 0; sitting.pics = [];
    el.querySelector('.breathTxt').textContent = '';
    el.querySelector('.orb').className = 'orb';
    $('#pauseBreathe').textContent = 'Three slow breaths';
    el.querySelector('.pauseBtns').hidden = false; el.querySelector('.pauseEnd').hidden = false; $('#pauseGo').hidden = false;
    $('#pauseStop').className = lateHour() ? 'go' : 'go soft'; $('#pauseGo').className = lateHour() ? 'go soft' : 'go';
    el.querySelector('.pauseBye').hidden = true;
    document.body.classList.add('pausing');
    el.classList.add('on'); AUDIO.soft();
  }
  function closePause() { $('#pause').classList.remove('on'); document.body.classList.remove('pausing'); clearTimeout(breathT); }
  // slow breathing: in for four seconds, out for six, three times
  let breathT = 0;
  $('#pauseBreathe').onclick = () => {
    const el = $('#pause'), orb = el.querySelector('.orb'), txt = el.querySelector('.breathTxt');
    el.querySelector('.pauseBtns').hidden = true; $('#pauseGo').hidden = true;
    let n = 0;
    const step = () => {
      if (n === 6) { txt.textContent = 'Lovely.'; orb.className = 'orb'; AUDIO.chime(); el.querySelector('.pauseBtns').hidden = false; $('#pauseGo').hidden = false; $('#pauseBreathe').textContent = 'Again'; return; }
      const inhale = n % 2 === 0;
      orb.className = 'orb ' + (inhale ? 'in' : 'out');
      txt.textContent = inhale ? 'Breathe in…' : 'and slowly out…';
      n++;
      breathT = setTimeout(step, inhale ? 4000 : 6000);
    };
    step();
  };
  $('#pauseGo').onclick = () => { AUDIO.pop(); closePause(); };
  $('#pauseStop').onclick = () => { AUDIO.soft(); stopNow(); };
  // stopping: one line on what comes next time (a plan quiets the pull of an
  // unfinished job), then the sound fades and the title screen comes back
  let stoppedNow = false; // once stopped, the title does not offer "Just one job" again
  function stopNow() {
    stoppedNow = true;
    if (lateHour() && S.goodnight) { goodnight(); return; }
    const el = $('#pause');
    clearTimeout(breathT);
    el.querySelector('.breathTxt').textContent = ''; el.querySelector('.orb').className = 'orb';
    el.querySelector('.pauseBtns').hidden = true; el.querySelector('.pauseEnd').hidden = true;
    const bye = el.querySelector('.pauseBye');
    bye.innerHTML = byeHtml(); bye.hidden = false;
    AUDIO.volume(0); AUDIO.birds(false);
    setTimeout(() => { closePause(); show('title'); renderTitle(); }, 5000);
  }
  // what comes next time, in a few words
  function planHtml() {
    const n = here().beta ? null : nextChore(), other = nextPlaceWithJobs();
    if (n) return `<b>${n.name}</b>${S.wips[n.id] ? ', half done' : ''}`;
    if (other) return `a few jobs at <b>${placeName(other.id)}</b>`;
    return `<b>${DATA.SEASON_NAMES[DATA.seasonOf(S.seasonNo + 1)]}</b> arrives, with new jobs`;
  }
  function byeHtml() {
    const h = hourNow();
    const bye = lateHour() ? 'Sleep well.' : h >= 17 ? 'Have a lovely evening.' : 'Enjoy the rest of your day.';
    return `<div class="byeNext">Next time: ${planHtml()}</div>Everything will be right here when you come back. ${bye}`;
  }

  // Goodnight: after nine, stopping ends on the place in the evening. Its
  // lights go out one by one, each with a soft falling note, while the music
  // fades; then the plan for next time and "Sleep well." About six seconds,
  // no reward and nothing to count, and it can be switched off in Settings.
  let gnTimers = [];
  // the lights in a place picture at night: whatever glows in its night layer,
  // grouped into at most six lamps or windows, left to right
  function lightGroups(svg) {
    const night = svg.querySelector('g.night');
    if (!night) return [];
    const warm = /glow|#ffd98a|#ffe2a0|#ffe9b0|#fff3c4|#ffefb0/i;
    const els = [...night.querySelectorAll('*')].filter((e) => !e.closest('mask') && e.tagName !== 'mask' && warm.test(e.getAttribute('fill') || ''));
    const pts = [];
    for (const e of els) { try { const b = e.getBBox(); if (b.width * b.height < 400 * 540 * 0.5) pts.push({ e, x: b.x + b.width / 2, y: b.y + b.height / 2 }); } catch (_) {} }
    const groups = [];
    for (const p of pts.sort((a, b) => a.x - b.x)) {
      const g = groups.find((q) => Math.abs(q.x - p.x) < 46 && Math.abs(q.y - p.y) < 70);
      if (g) { g.els.push(p.e); g.x = (g.x * (g.els.length - 1) + p.x) / g.els.length; } else groups.push({ x: p.x, y: p.y, els: [p.e] });
    }
    groups.sort((a, b) => a.x - b.x);
    while (groups.length > 6) {
      let best = 0;
      for (let i = 1; i < groups.length - 1; i++) if (groups[i + 1].x - groups[i].x < groups[best + 1].x - groups[best].x) best = i;
      const [a, b] = groups.splice(best, 2);
      groups.splice(best, 0, { x: (a.x + b.x) / 2, y: a.y, els: a.els.concat(b.els) });
    }
    return groups.map((g) => g.els);
  }
  function goodnight() {
    gnTimers.forEach(clearTimeout); gnTimers = [];
    clearTimeout(breathT); closePause();
    const el = $('#goodnight'), pl = here();
    el.querySelector('.gnPic').innerHTML = renderPlace(pl.id, partsDone(pl.id), { season: seasonName(), pending: pendingAt(pl.id), decor: decorAt(pl.id), pct: doneCount() / pl.chores.length, night: true, uid: 'gn' });
    el.querySelector('.gnNext').innerHTML = `Next time: ${planHtml()}`;
    el.querySelector('.gnText').classList.remove('on');
    el.classList.add('on');
    AUDIO.birds(false); AUDIO.fade(5);
    const svg = el.querySelector('svg');
    const groups = svg ? lightGroups(svg) : [];
    let dim = null;
    if (svg) {
      dim = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      dim.setAttribute('width', '400'); dim.setAttribute('height', '540'); dim.setAttribute('fill', '#0c1230'); dim.setAttribute('class', 'gnDim');
      svg.appendChild(dim);
    }
    const steps = Math.max(1, groups.length);
    el.dataset.lights = groups.length;
    groups.forEach((g, i) => gnTimers.push(setTimeout(() => {
      g.forEach((e) => e.classList.add('gnOff'));
      if (dim) dim.style.opacity = (0.42 * (i + 1)) / steps;
      AUDIO.lightOff(i);
    }, 700 + i * 600)));
    if (!groups.length && dim) gnTimers.push(setTimeout(() => { dim.style.opacity = 0.42; }, 700));
    const outAt = 700 + steps * 600;
    gnTimers.push(setTimeout(() => el.querySelector('.gnText').classList.add('on'), Math.min(outAt, 3600)));
    gnTimers.push(setTimeout(() => { el.classList.remove('on'); show('title'); renderTitle(); }, Math.max(6000, outAt + 1800)));
  }
  $('#btnBack').onclick = () => { AUDIO.soft(); leavePlay(); };
  function keepWip() {
    if (!cur || $('#doneOverlay').classList.contains('on')) return;
    // a puzzle solved a moment ago is done, even if play stops before its
    // finish card comes up
    if (cur.puzzle && ENGINE.finishNow()) return;
    const g = ENGINE.snapshot();
    if (!g || ENGINE.progress() <= 0.02) return;
    delete S.wips[cur.id];
    S.wips[cur.id] = g;
    const ids = Object.keys(S.wips);
    while (ids.length > 5) delete S.wips[ids.shift()];
  }
  function leavePlay() {
    justOne = false;
    keepWip();
    ENGINE.stop(); AUDIO.stopWork(); save();
    show('home'); renderHome();
    if (freshPart === null && $('#scene .fresh')) AUDIO.shimmer();
  }

  ENGINE.init($('#cv'), {
    onEarn(v) { if (!(v > 0)) return; S.coins += v; S.earned += v; earnedThis += v; },
    onCoinArrive(v) {
      shownCoins = Math.min(S.coins, shownCoins + v);
      updatePlayCoins(); updateUpPill();
      const el = $('#playCoins'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      AUDIO.coin();
    },
    coinTarget() { const r = $('#playCoins .coin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
    insets: hudInsets,
    onProgress: setProgress,
    onActivity: (lvl, down) => AUDIO.activity(lvl, down),
    onAutoFinish() { AUDIO.shimmer(); },
    onUnit(kind) { AUDIO.unit(kind); },
    onTouch() {
      if ($('#hint').classList.contains('on')) { $('#hint').classList.remove('on'); S.touched++; save(); }
    },
    onFind(g) {
      if (g.kind === 'coin') { AUDIO.shimmer(); return; }
      S.finds[g.id] = Date.now(); save(); foundThis = g;
      AUDIO.chime();
      foundBanner(g);
    },
    onSound: puzzleSound,
    onDone: finishChore,
  });
  // what the thinking jobs sound like
  function puzzleSound(k) {
    if (k === 'pick') AUDIO.pop();
    else if (k === 'clink') AUDIO.unit('clink');
    else if (k === 'drop') AUDIO.unit('drop');
    else if (k === 'nope') AUDIO.nope();
    else if (k === 'pour') AUDIO.pour();
    else if (k === 'turn') AUDIO.turn();
    else if (k === 'happy') AUDIO.unit('collect');
    else if (k === 'chime') AUDIO.chime();
    else AUDIO.soft();
  }

  // ------------------------------------------------------------ photo
  // Draw the cottage picture into a PNG and hand it to the share sheet.
  async function photo() {
    const svg = $('#scene svg');
    if (!svg) return;
    try {
      const W = 1200, H = 1620, band = 150;
      const xml = new XMLSerializer().serializeToString(svg).replace('<svg ', `<svg width="${W}" height="${H}" `);
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      await img.decode();
      const cv = U.canvas(W, H + band), c = cv.getContext('2d');
      c.fillStyle = '#f6efe3'; c.fillRect(0, 0, W, H + band);
      c.drawImage(img, 0, 0, W, H);
      c.fillStyle = '#46623f'; c.font = '900 64px ui-rounded, "SF Pro Rounded", system-ui, sans-serif'; c.textAlign = 'center';
      c.fillText(placeName(), W / 2, H + 92);
      c.fillStyle = '#a89c8b'; c.font = '700 30px ui-rounded, system-ui, sans-serif';
      c.fillText(S.seasonNo && restored(S.place) ? `${DATA.SEASON_NAMES[seasonName()]}, year ${1 + Math.floor(S.seasonNo / 4)}` : `${doneCount()} of ${here().chores.length} jobs done`, W / 2, H + 132);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const fname = `my-${S.place}.png`;
      const file = new File([blob], fname, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: placeName() });
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    } catch (e) { if (e && e.name !== 'AbortError') toast('Could not make the picture'); }
  }
  const bind = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
  bind('#btnPhoto', () => { AUDIO.soft(); photo(); });

  function seasonCard(name, small) {
    const el = $('#seasonCard');
    el.dataset.season = small ? seasonName() : name.toLowerCase();
    el.querySelector('b').textContent = name;
    el.querySelector('small').textContent = small || `Year ${1 + Math.floor(S.seasonNo / 4)}`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 2600);
  }

  // ------------------------------------------------------------ finds
  let bannerT = 0;
  function foundBanner(g) {
    const b = $('#found');
    b.innerHTML = `<i>${g.emoji}</i><div><small>You found</small><b>${g.name}</b></div>`;
    b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('on'), 2600);
  }
  function openFinds() {
    let places = '';
    for (const p of DATA.PLACES) {
      if (!owned(p.id)) continue;
      const all = p.chores.filter((c) => DATA.FINDS[c.id]);
      const got = all.filter((c) => S.finds[c.id]).length;
      const cells = all.map((c) => {
        const f = DATA.FINDS[c.id], has = !!S.finds[c.id];
        const where = p.beta ? `A reward for “${c.name}”` : 'Hidden in ' + c.name.replace(/^The /, 'the ');
        return `<div class="find${has ? ' has' : ''}"><i>${has ? f[0] : '?'}</i><span>${has ? f[1] : where}</span></div>`;
      }).join('');
      places += `<div class="findsHead">${placeName(p.id)} · ${got} of ${all.length}</div><div class="findsGrid">${cells}</div>`;
    }
    let seasons = '';
    if (S.seasonNo > 0) {
      for (const sn of DATA.SEASON_ORDER) {
        const list = DATA.SEASON_FINDS[sn];
        const n = list.filter((_, i) => S.finds[`${sn}-${i}`]).length;
        seasons += `<div class="findsHead">${DATA.SEASON_NAMES[sn]} · ${n} of ${list.length}</div><div class="findsGrid">` +
          list.map(([e, nm], i) => { const has = !!S.finds[`${sn}-${i}`]; return `<div class="find${has ? ' has' : ''}"><i>${has ? e : '?'}</i><span>${has ? nm : 'A ' + sn + ' secret'}</span></div>`; }).join('') + '</div>';
      }
    }
    openSheet('Finds', `${places}${seasons}
      <div class="setNote">Every job hides one keepsake under the mess, plus a few little stashes of coins. Each season has its own secrets.</div>`);
  }

  // ---------------------------------------------------------------- toast
  let toastT = 0;
  function toast(msg, ms = 1600) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms);
  }

  // ---------------------------------------------------------------- sheets
  function openSheet(title, html, after) {
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = html;
    $('#sheet').classList.add('on');
    after && after($('#sheetBody'));
  }
  function closeSheet() { $('#sheet').classList.remove('on'); renderHome(); }
  $('#sheetClose').onclick = () => { AUDIO.soft(); closeSheet(); };
  $('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });

  function openShed() {
    if (here().beta) {
      openSheet('The shed', `<div class="shedCoins">${coinHtml(S.coins)}</div><div class="setNote">No tools and no robots in the puzzle room: every puzzle here is done by hand, with a little thinking. Stuck? Tap <b>Hint</b> at the bottom of a puzzle.</div>`);
      return;
    }
    const rows = [];
    for (const [fam, F] of Object.entries(TOOLS.FAM)) {
      if (F.hands || !famUnlocked(fam)) continue;
      const t = F.tiers[tierIdx(fam)], u = nextUpgrade(fam);
      const dots = F.tiers.map((_, i) => `<i class="${i <= tierIdx(fam) ? 'on' : ''}"></i>`).join('');
      const width = (x) => (x.shape === 'rect' ? x.w : x.r * 2);
      const stat = u ? `<div class="sub">Size ${width(t)} → <b>${width(u.tier)}</b> · Strength ${t.power.toFixed(1)} → <b>${u.tier.power.toFixed(1)}</b></div>` : `<div class="sub">Size ${width(t)} · Strength ${t.power.toFixed(1)}</div>`;
      rows.push(`<div class="shedRow" data-fam="${fam}"><div class="ic"></div><div class="sInfo"><div class="eyebrow">${F.name}</div><div class="sName">${t.name}</div><div class="tiers">${dots}</div>${stat}</div>
        ${u ? `<button class="buy${S.coins >= u.cost ? ' can' : ''}" data-fam="${fam}"><span>${u.tier.name}</span><span class="price">${coinHtml(u.cost)}</span></button>` : '<div class="maxed">Best tool</div>'}</div>`);
    }
    const h = helperOffer();
    if (totalDone() >= DATA.HELPER_UNLOCK) {
      rows.push(`<div class="shedRow helperRow"><div class="ic bot"></div><div class="sInfo"><div class="eyebrow">Helpers</div><div class="sName">${S.helpers ? S.helpers + ' tidy-bot' + (S.helpers > 1 ? 's' : '') : 'No helpers yet'}</div><div class="sub">They tidy alongside you. Tap the robot button on a job to send them home.</div></div>
        ${h ? `<button class="buy${S.coins >= h.cost ? ' can' : ''}" data-helper="1"><span>${S.helpers ? 'Another' : 'Hire one'}</span><span class="price">${coinHtml(h.cost)}</span></button>` : '<div class="maxed">Full team</div>'}</div>`);
    }
    const tabs = doneCount() >= DATA.DECOR_UNLOCK ? `<div class="tabs"><button class="tab on">Tools</button><button class="tab" id="tabDecor">Decorate</button></div>` : '';
    const note = `<div class="setNote">These tools are for ${here().short}. Every place has its own toolbox${S.place === 'cottage' ? '' : ', and they cost a little more out here'}.</div>`;
    openSheet('The shed', tabs + `<div class="shedCoins">${coinHtml(S.coins)}</div>` + note + rows.join(''), (body) => {
      const td = body.querySelector('#tabDecor'); if (td) td.onclick = () => { AUDIO.soft(); openDecor(); };
      body.querySelectorAll('.shedRow[data-fam]').forEach((row) => row.querySelector('.ic').appendChild(TOOLS.icon(TOOLS.FAM[row.dataset.fam].tiers[tierIdx(row.dataset.fam)], 52)));
      body.querySelectorAll('.buy').forEach((b) => b.onclick = () => {
        if (b.dataset.helper) {
          const o = helperOffer(); if (!o || S.coins < o.cost) return nope(b);
          S.coins -= o.cost; S.helpers++; save(); AUDIO.buy(); toast('A tidy-bot joins you!'); return openShed();
        }
        const fam = b.dataset.fam, u = nextUpgrade(fam);
        if (!u || S.coins < u.cost) return nope(b);
        buyTool(fam, S.place, u); AUDIO.buy(); toast(`${u.tier.name}!`); openShed();
      });
    });
  }
  function openDecor() {
    const at = here().short;
    const rows = here().decor.map((d) => {
      const has = !!S.decor[d.id];
      return `<div class="shedRow"><div class="ic emo">${d.icon}</div><div class="sInfo"><div class="sName">${d.name}</div><div class="sub">${has ? 'At ' + at : 'Appears at ' + at}</div></div>
        ${has ? '<div class="maxed">Yours ✓</div>' : `<button class="buy${S.coins >= d.cost ? ' can' : ''}" data-decor="${d.id}"><span>Buy</span><span class="price">${coinHtml(d.cost)}</span></button>`}</div>`;
    }).join('');
    openSheet('The shed', `<div class="tabs"><button class="tab" id="tabTools">Tools</button><button class="tab on">Decorate</button></div><div class="shedCoins">${coinHtml(S.coins)}</div>${rows}`, (body) => {
      body.querySelector('#tabTools').onclick = () => { AUDIO.soft(); openShed(); };
      body.querySelectorAll('[data-decor]').forEach((b) => b.onclick = () => {
        const d = here().decor.find((x) => x.id === b.dataset.decor);
        if (S.coins < d.cost) return nope(b);
        S.coins -= d.cost; S.decor[d.id] = Date.now(); save(); AUDIO.buy();
        closeSheet(); toast(`${d.name} added`);
        const sc = $('#scene'); sc.classList.remove('newdecor'); void sc.offsetWidth; sc.classList.add('newdecor');
      });
    });
  }
  function nope(b) { AUDIO.soft(); b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 400); }

  function openJobs(focus) {
    const n = nextChore(), free = here().beta; // puzzles can be taken in any order
    let html = '', lastArea = '';
    const row = (c, doneN) => {
      const done = !!doneN, isNext = n && n.id === c.id, locked = !done && !isNext && !free;
      const v = done ? Math.round(c.value * 0.6) : c.value;
      return `<div class="jobRow${locked ? ' locked' : ''}${focus === c.id ? ' focus' : ''}" id="job-${c.id}"><div class="jState">${done ? '✓' : isNext ? '•' : ''}</div>
        <div class="jName">${c.name}<div class="sub">${TOOLS.FAM[c.family].job}${done ? ' · done' + (doneN > 1 ? ' ×' + doneN : '') : ''}</div></div>
        ${locked ? '<div class="lock">Later</div>' : `<button class="jGo" data-id="${c.id}">${done ? 'Again' : 'Start'} ${coinHtml(v)}</button>`}</div>`;
    };
    const sj = seasonOrder(S.place), list = here().chores;
    if (sj.length) {
      html += `<div class="jobArea">${DATA.SEASON_NAMES[seasonName()]}</div>`;
      for (const j of sj) html += row(j, S.sdone[j.id]);
    }
    for (const c of list) {
      if (c.area !== lastArea) { html += `<div class="jobArea">${DATA.AREAS[c.area]}</div>`; lastArea = c.area; }
      html += row(c, S.done[c.id]);
    }
    openSheet(`Jobs · ${placeName()}`, html, (body) => {
      body.querySelectorAll('.jGo').forEach((b) => b.onclick = () => {
        const c = list.find((x) => x.id === b.dataset.id) || sj.find((x) => x.id === b.dataset.id);
        $('#sheet').classList.remove('on'); AUDIO.pop();
        startChore(c, !!(S.done[c.id] || S.sdone[c.id]));
      });
      if (focus) { const el = body.querySelector('#job-' + focus); el && el.scrollIntoView({ block: 'center' }); }
    });
  }

  function openSettings() {
    openSheet('Settings', `
      <label class="setRow"><span>Sound effects</span><input type="checkbox" id="setSfx" ${S.sfx ? 'checked' : ''}></label>
      <label class="setRow"><span>Music</span><input type="checkbox" id="setMusic" ${S.music ? 'checked' : ''}></label>
      <label class="setRow"><span>Music volume</span><input type="range" id="setMusicVol" min="0" max="100" step="5" value="${Math.round(S.musicVol * 100)}"></label>
      <label class="setRow nameRow"><span>Name of the cottage</span><input type="text" id="setName" maxlength="22" placeholder="Ivy Cottage" value="${(S.name || '').replace(/"/g, '&quot;')}"></label>
      <label class="setRow"><span>Evening light after 8 pm</span><input type="checkbox" id="setEvening" ${S.evening ? 'checked' : ''}></label>
      <label class="setRow"><span>Suggest a pause now and then</span><input type="checkbox" id="setPauses" ${S.pauses ? 'checked' : ''}></label>
      <label class="setRow"><span>Goodnight lights after 9 pm</span><input type="checkbox" id="setGoodnight" ${S.goodnight ? 'checked' : ''}></label>
      <div class="setNote">Tip: on iPhone, tap Share and then <b>Add to Home Screen</b> to play full screen and offline. Safari and the Home Screen app keep separate saves; move yours with a save code.</div>
      <div class="codeRow"><button class="closeBtn" id="setExport">Copy offline save code</button><button class="closeBtn" id="setImport">Paste save code</button></div>
      <textarea id="setCode" rows="3" placeholder="Paste a save code here" hidden></textarea>
      <button class="go" id="setLoad" hidden>Load this cottage</button>
      ${cloudHtml()}
      <div class="setStats">Coins earned in total: ${U.fmt(S.earned)}</div>
      <div class="setHead">Start again</div>
      <div class="setNote">A new game from 0 coins: the cottage overgrown again, simple tools and no robots. Your music, cloud code and friends list stay.</div>
      <button class="danger" id="setReset">Start a new game</button>`, (body) => {
      cloudBind(body);
      body.querySelector('#setSfx').onchange = (e) => { S.sfx = e.target.checked; AUDIO.set('sfx', S.sfx); save(); };
      body.querySelector('#setMusic').onchange = (e) => { S.music = e.target.checked; AUDIO.set('music', S.music); save(); };
      body.querySelector('#setMusicVol').oninput = (e) => { S.musicVol = e.target.value / 100; AUDIO.volume(S.musicVol); save(); };
      body.querySelector('#setName').oninput = (e) => { S.name = e.target.value.trim().slice(0, 22); save(); };
      body.querySelector('#setEvening').onchange = (e) => { S.evening = e.target.checked; save(); };
      body.querySelector('#setPauses').onchange = (e) => { S.pauses = e.target.checked; save(); };
      body.querySelector('#setGoodnight').onchange = (e) => { S.goodnight = e.target.checked; save(); };
      const codeBox = body.querySelector('#setCode'), loadBtn = body.querySelector('#setLoad');
      body.querySelector('#setExport').onclick = () => {
        const code = 'IVY1:' + btoa(unescape(encodeURIComponent(JSON.stringify(Object.assign({}, S, { wips: {} })))));
        const showBox = () => { codeBox.hidden = false; codeBox.value = code; codeBox.select(); toast('Copy the code from the box'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => toast('Save code copied'), showBox);
        else showBox();
      };
      body.querySelector('#setImport').onclick = () => { codeBox.hidden = false; codeBox.value = ''; loadBtn.hidden = false; codeBox.focus(); };
      loadBtn.onclick = () => {
        try {
          const raw = codeBox.value.trim().replace(/^IVY1:/, '');
          const s = JSON.parse(decodeURIComponent(escape(atob(raw))));
          if (!s || typeof s.coins !== 'number') throw new Error('not a save');
          S = upgrade(s); save(); closeSheet(); toast('Cottage loaded');
        } catch (_) { toast('That code did not work'); }
      };
      body.querySelector('#setReset').onclick = (e) => {
        if (e.target.dataset.sure) { newGame(); closeSheet(); toast('A fresh start'); return; }
        e.target.dataset.sure = '1'; e.target.textContent = 'Tap again to start from 0 coins';
      };
    });
  }

  // ----------------------------------------------------------------- cloud
  // An optional copy of the save on a small Cloudflare service (cloud/): a
  // cloud code carries the game over to another phone, and friends lists show
  // nicknames and what everyone has restored. Everything else works offline.
  const CLOUD = 'https://ivy-cottage.rahbek.workers.dev/api';
  let pushedSig = '', cloudTimer = 0, cloudBusy = false;
  const cloudSig = () => `${S.earned}:${S.coins}:${S.jobsDone}:${Object.keys(S.finds).length}`;
  const cloudStats = () => ({ finds: Object.keys(S.finds).length, places: restoredPlaces().length, jobs: S.jobsDone });
  const cloudData = () => JSON.stringify(Object.assign({}, S, { wips: {} }));
  async function cloudCall(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (S.cloud.code) headers['X-Ivy-Code'] = S.cloud.code;
    const text = body ? JSON.stringify(body) : undefined;
    const r = await fetch(CLOUD + path, { method, headers, body: text, keepalive: !!text && text.length < 60000 });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(d.error || 'cloud'), { status: r.status });
    return d;
  }
  // at most one upload every two minutes while playing, and one when leaving
  function cloudSoon() { if (!cloudTimer) cloudTimer = setTimeout(() => { cloudTimer = 0; cloudPush(); }, 120000); }
  async function cloudPush() {
    if (!S.cloud.code || cloudBusy) return;
    cloudBusy = true;
    const sig = cloudSig();
    try { await cloudCall('PUT', '/save', { data: cloudData(), earned: S.earned, stats: cloudStats() }); pushedSig = sig; S.cloud.at = Date.now(); }
    catch (_) {}
    cloudBusy = false;
  }
  // more progress in the cloud (played on another phone): carry on from there
  async function cloudPull() {
    if (!S.cloud.code || $('#play').classList.contains('on')) return;
    try {
      const d = await cloudCall('GET', '/save');
      if ($('#play').classList.contains('on')) return;
      // a game started afresh on another phone, or more progress in this one
      const data = JSON.parse(d.data), round = data.round || 1;
      if (round < S.round || (round === S.round && !(d.earned > S.earned))) return;
      const keep = { sfx: S.sfx, music: S.music, musicVol: S.musicVol, wips: round === S.round ? S.wips : {}, cloud: S.cloud };
      S = upgrade(Object.assign(data, keep)); pushedSig = cloudSig(); save();
      if ($('#home').classList.contains('on')) renderHome(); else renderTitle();
      toast('Picked up where you left off');
    } catch (_) {}
  }
  async function cloudStart() {
    const d = await cloudCall('POST', '/save', { data: cloudData(), earned: S.earned, stats: cloudStats() });
    S.cloud = { code: d.code, at: Date.now() }; pushedSig = cloudSig(); save();
    return d.code;
  }
  // A new game from 0 coins keeps the settings, the cloud code and the
  // friends list. The round number tells the cloud copy of the old game apart,
  // so it is never picked up again by mistake.
  function newGame() {
    const keep = { sfx: S.sfx, music: S.music, musicVol: S.musicVol, evening: S.evening, pauses: S.pauses, goodnight: S.goodnight, name: S.name, cloud: S.cloud, round: (S.round || 1) + 1 };
    S = Object.assign(fresh(), keep);
    save(); renderHome();
    cloudPush();
  }
  function cloudHtml() {
    if (!S.cloud.code) {
      return `<div class="setHead">Cloud save</div><div class="setNote">Keep a copy of your progress online, so you can carry on from another phone.</div>
        <div class="codeRow"><button class="closeBtn" id="cloudOn">Save in the cloud</button><button class="closeBtn" id="cloudHave">I have a code</button></div>
        <input class="cloudIn" id="cloudIn" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" hidden><button class="go" id="cloudLoad" hidden>Load my progress</button>`;
    }
    const at = S.cloud.at ? new Date(S.cloud.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'not yet';
    return `<div class="setHead">Cloud save</div><div class="cloudCode">${S.cloud.code}</div>
      <div class="setNote">Your cloud code. On another phone, open Settings, tap <b>I have a code</b> and type it in. Keep it to yourself: anyone with the code can play your game. Last saved: ${at}.</div>
      <div class="codeRow"><button class="closeBtn" id="cloudCopy">Copy the code</button><button class="closeBtn" id="cloudNow">Save now</button></div>`;
  }
  function cloudBind(body) {
    const on = body.querySelector('#cloudOn');
    if (on) on.onclick = async () => { on.disabled = true; try { await cloudStart(); toast('Saved in the cloud'); openSettings(); } catch (_) { on.disabled = false; toast('No connection right now'); } };
    const have = body.querySelector('#cloudHave'), inp = body.querySelector('#cloudIn'), load = body.querySelector('#cloudLoad');
    if (have) have.onclick = () => { inp.hidden = false; load.hidden = false; inp.focus(); };
    if (load) load.onclick = async () => {
      const code = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 12) return toast('A cloud code has 12 letters and digits');
      const was = S.cloud;
      S.cloud = { code: `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}` };
      try {
        const d = await cloudCall('GET', '/save');
        const keep = { sfx: S.sfx, music: S.music, musicVol: S.musicVol, cloud: S.cloud };
        S = upgrade(Object.assign(JSON.parse(d.data), keep)); S.wips = {}; pushedSig = cloudSig(); save();
        closeSheet(); toast('Welcome back!');
      } catch (e) { S.cloud = was; toast(e.status === 404 ? 'That code was not found' : 'No connection right now'); }
    };
    const copy = body.querySelector('#cloudCopy');
    if (copy) copy.onclick = () => { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(S.cloud.code).then(() => toast('Code copied'), () => toast(S.cloud.code)); else toast(S.cloud.code); };
    const now = body.querySelector('#cloudNow');
    if (now) now.onclick = async () => { await cloudPush(); toast(pushedSig === cloudSig() ? 'Saved' : 'No connection right now'); openSettings(); };
  }

  // friends lists: a nickname, a list code to share, and what everyone has
  // restored. No ranks or scores (being compared is what makes lists like
  // this stressful), so it is sorted by name and adds everyone up together.
  const FRIEND_COLS = ['#6f9a6a', '#c97a52', '#c4901c', '#5f8fbf', '#9a72b0', '#c46a7c'];
  function friendCol(nick) { let h = 7; for (const ch of nick) h = (h * 31 + ch.codePointAt(0)) % 9973; return FRIEND_COLS[h % FRIEND_COLS.length]; }
  // places open one after another, so a count says which ones
  function friendWhat(m) {
    const done = MAIN.slice(0, m.places).map((p) => p.short);
    if (!done.length) return `Restoring ${MAIN[0].short}`;
    if (done.length === MAIN.length) return `Restored all ${done.length} places`;
    return `Restored ${done.join(' and ')}`;
  }
  function togetherHtml(members) {
    if (members.length < 2) return '';
    const sum = (k) => members.reduce((n, m) => n + (m[k] || 0), 0);
    const bits = [];
    if (sum('places')) bits.push(`restored ${plural(sum('places'), 'place')}`);
    if (sum('finds')) bits.push(`found ${plural(sum('finds'), 'keepsake')}`);
    return `<div class="together"><b>Together</b> ${bits.length ? `you have ${bits.join(' and ')}.` : 'you are just getting started.'}</div>`;
  }
  async function openFriends() {
    const intro = '<div class="setNote">Make a friends list and share its code, or join a friend\'s list. Friends see only your nickname and which places you have restored, so use a nickname, not your real name.</div>';
    if (!S.cloud.code) {
      openSheet('Friends', `${intro}<div class="setNote">Friends lists use the cloud save.</div><button class="go wide" id="frCloud">Turn on cloud save</button>`, (body) => {
        body.querySelector('#frCloud').onclick = async (e) => { e.target.disabled = true; try { await cloudStart(); openFriends(); } catch (_) { e.target.disabled = false; toast('No connection right now'); } };
      });
      return;
    }
    openSheet('Friends', '<div class="setNote">Looking up your friends…</div>');
    let d;
    try { await cloudPush(); d = await cloudCall('GET', '/list'); }
    catch (_) { openSheet('Friends', '<div class="setNote">No connection right now. Try again in a moment.</div>'); return; }
    if (!d.list) {
      openSheet('Friends', `${intro}
        <label class="setRow nameRow"><span>Your nickname</span><input type="text" id="frNick" maxlength="16" placeholder="Nickname" value="${(S.cloud.nick || '').replace(/"/g, '&quot;')}"></label>
        <button class="go wide" id="frNew">Start a friends list</button>
        <div class="setHead">Or join a friend's list</div>
        <div class="codeRow"><input class="cloudIn" id="frCode" placeholder="XXX-XXX" autocomplete="off" autocapitalize="characters"><button class="closeBtn" id="frJoin">Join</button></div>`, (body) => {
        const nick = () => body.querySelector('#frNick').value.trim();
        const go = async (path, extra, btn) => {
          if (nick().length < 2) return toast('Pick a nickname first');
          btn.disabled = true;
          try { const r = await cloudCall('POST', path, Object.assign({ nick: nick() }, extra)); S.cloud.nick = r.nick; save(); AUDIO.chime(); openFriends(); }
          catch (e) { btn.disabled = false; toast(e.status === 404 ? 'That list was not found' : e.status === 409 ? 'That list is full' : e.message === 'nickname' ? 'Try another nickname' : 'No connection right now'); }
        };
        body.querySelector('#frNew').onclick = (e) => go('/list', {}, e.target);
        body.querySelector('#frJoin').onclick = (e) => go('/list/join', { list: body.querySelector('#frCode').value }, e.target);
      });
      return;
    }
    const members = d.members.slice().sort((a, b) => a.nick.localeCompare(b.nick, undefined, { sensitivity: 'base' }));
    const rows = members.map((m) => `<div class="friendRow${m.me ? ' me' : ''}"><div class="fav" style="--c:${friendCol(m.nick)}">${([...m.nick][0] || '?').toUpperCase().replace(/</g, '&lt;')}</div>
      <div class="fwho"><div class="fnick">${m.nick.replace(/</g, '&lt;')}${m.me ? ' <small>(you)</small>' : ''}</div><div class="fwhat">${friendWhat(m)}</div></div></div>`).join('');
    openSheet('Friends', `<div class="setNote">Your friends list: <b class="listCode">${d.list}</b>. Share the code so friends can join.</div>${togetherHtml(members)}${rows}
      <div class="codeRow"><button class="closeBtn" id="frRefresh">Refresh</button><button class="closeBtn" id="frLeave">Leave the list</button></div>`, (body) => {
      body.querySelector('#frRefresh').onclick = () => { AUDIO.soft(); openFriends(); };
      body.querySelector('#frLeave').onclick = async (e) => {
        if (!e.target.dataset.sure) { e.target.dataset.sure = '1'; e.target.textContent = 'Tap again to leave'; return; }
        try { await cloudCall('POST', '/list/leave', {}); toast('You left the list'); openFriends(); } catch (_) { toast('No connection right now'); }
      };
    });
  }

  // ---------------------------------------------------------------- places
  function placePic(id, st, opts) {
    const svg = renderPlace(id, st, opts).replace('<svg ', '<svg width="400" height="540" ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function openPlaces() {
    noteRestored();
    // the puzzle room first, so it is easy to find while it is new
    const cards = DATA.PLACES.filter((p) => p.beta).concat(MAIN).map((p) => {
      const own = owned(p.id), isHere = S.place === p.id;
      const pic = placePic(p.id, own ? partsDone(p.id) : {}, { season: seasonName(), pending: own ? pendingAt(p.id) : {}, decor: own ? S.decor : {}, pct: own ? doneCount(p.id) / p.chores.length : 0, forSale: !own, uid: 'p' });
      const n = p.chores.length, d = doneCount(p.id);
      let sub, action;
      if (p.beta) {
        sub = `${p.blurb} ${d} of ${n} solved.`;
        action = isHere ? '<div class="maxed">You are here</div>' : `<button class="buy can" data-go="${p.id}"><span>Go there</span></button>`;
      } else if (own) {
        const waiting = jobsAt(p.id).filter((j) => !S.sdone[j.id]).length;
        sub = d < n ? `${d} of ${n} jobs done` : waiting ? `Restored · ${waiting} ${DATA.SEASON_NAMES[seasonName()].toLowerCase()} job${waiting > 1 ? 's' : ''} waiting`
          : resting(p.id) ? `Restored · quiet this ${seasonName()}` : 'Restored and tidy';
        action = isHere ? '<div class="maxed">You are here</div>' : `<button class="buy can" data-go="${p.id}"><span>Go there</span></button>`;
      } else {
        const ready = opened(p);
        sub = `${p.blurb}<ul class="opens">${criteria(p).map((c) => `<li class="${c.ok ? 'ok' : ''}">${c.text}</li>`).join('')}</ul>`;
        action = ready ? `<button class="buy${S.coins >= p.price ? ' can' : ''}" data-buy="${p.id}"><span>Buy</span><span class="price">${coinHtml(p.price)}</span></button>` : '<div class="lock">Later</div>';
      }
      return `<div class="placeCard${isHere ? ' here' : ''}${own ? '' : ' forSale'}${p.beta ? ' beta' : ''}"><div class="pic"><img alt="" src="${pic}"></div>
        <div class="pInfo"><div class="sInfo"><div class="pName">${placeName(p.id)}${p.beta ? ' <span class="betaTag">Beta</span>' : ''}${own && !p.beta && nextChore(p.id) ? ' <i class="jobDot" title="Jobs waiting"></i>' : ''}</div><div class="pSub">${sub}</div></div>${action}</div></div>`;
    }).join('');
    openSheet('Places', `<div class="shedCoins">${coinHtml(S.coins)}</div>${cards}<div class="setNote">Every place has its own jobs, tools, keepsakes and decorations. Your coins and robots come along everywhere. New places open as the years go by: a season only turns when its jobs are done, never on its own.</div>`, (body) => {
      body.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => goPlace(b.dataset.go));
      body.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => {
        const p = DATA.placeOf(b.dataset.buy);
        if (owned(p.id) || !opened(p) || S.coins < p.price) return nope(b);
        S.coins -= p.price; S.owned[p.id] = Date.now(); save(); AUDIO.buy();
        goPlace(p.id, true);
      });
    });
  }

  $('#btnShed').onclick = () => { AUDIO.pop(); openShed(); };
  $('#btnJobs').onclick = () => { AUDIO.pop(); openJobs(); };
  $('#btnPlaces').onclick = () => { AUDIO.pop(); openPlaces(); };
  $('#home .brand').onclick = () => { AUDIO.pop(); openPlaces(); };
  $('#btnSettings').onclick = () => { AUDIO.pop(); openSettings(); };
  bind('#btnFriends', () => { AUDIO.pop(); openFriends(); });
  bind('#btnFinds', () => { AUDIO.pop(); openFinds(); });

  // ----------------------------------------------------------------- boot
  function renderTitle() {
    $('#titleScene').innerHTML = HOUSE.render(partsDone('cottage'), S.colours, { season: seasonName(), pending: pendingAt('cottage'), decor: S.decor, pct: doneCount('cottage') / DATA.CHORES.length, night: isEvening() });
    if (S.name) $('#title .logo span').textContent = S.name;
    if (S.earned > 0) $('#title .tap').textContent = 'Back to the cottage';
    const standalone = navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const tip = $('#homeTip');
    if (tip) tip.hidden = !(ios && !standalone);
    // in the evening: one job and then stop
    $('#justOne').hidden = stoppedNow || !(eveningHour() && oneJob());
  }
  const eveningHour = () => { const h = hourNow(); return h >= 20 || h < 6; };
  // the job "Just one job" starts: the next one here, or round the village
  function oneJob() {
    let pl = S.place, n = here().beta ? null : nextChore(pl);
    if (!n) { const p = nextPlaceWithJobs(pl); if (p) { pl = p.id; n = nextChore(pl); } }
    return n ? { pl, n } : null;
  }
  renderTitle();
  cloudPull();
  $('#title').addEventListener('click', () => {
    AUDIO.volume(S.musicVol); AUDIO.unlock(); AUDIO.set('sfx', S.sfx); AUDIO.set('music', S.music);
    AUDIO.pop();
    $('#titleScene').innerHTML = '';
    show('home'); renderHome();
  });
  $('#justOne').addEventListener('click', (e) => {
    e.stopPropagation();
    AUDIO.volume(S.musicVol); AUDIO.unlock(); AUDIO.set('sfx', S.sfx); AUDIO.set('music', S.music);
    AUDIO.pop();
    $('#titleScene').innerHTML = '';
    const o = oneJob();
    if (o && o.pl !== S.place) { S.place = o.pl; save(); }
    show('home'); renderHome();
    if (o) { startChore(o.n, false); justOne = true; }
  });
  // iOS only counts touchend and click as a gesture that may wake the sound up
  for (const ev of ['pointerdown', 'touchend', 'click']) document.addEventListener(ev, () => AUDIO.unlock(), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if ($('#play').classList.contains('on')) keepWip(); save(); AUDIO.suspend(); if (S.cloud.code && cloudSig() !== pushedSig) cloudPush(); }
    else { AUDIO.resume(); cloudPull(); }
  });
  setInterval(save, 5000);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  // A game on the home screen can stay open for days, so a new version is
  // looked for whenever it comes back to the front. Once one has arrived the
  // page reloads the next time it goes to the background (or straight away
  // on the title screen), never in the middle of a job.
  let updateReady = false;
  const reloadNow = () => { if ($('#play').classList.contains('on')) keepWip(); save(); location.reload(); };
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && location.hostname !== 'localhost') {
    const hadOne = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadOne || updateReady) return;
      updateReady = true;
      if ($('#title').classList.contains('on')) reloadNow();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && updateReady) reloadNow(); });
  }

  // test hooks
  window.__ivy = {
    get S() { return S; }, ENGINE, startChore: (i) => startChore(DATA.CHORES[i], false), startCafe: (i) => startChore(DATA.CAFE_CHORES[i], false), startCove: (i) => startChore(DATA.COVE_CHORES[i], false), startRescue: (i) => startChore(DATA.RESCUE_CHORES[i], false), startBeta: (i) => startChore(DATA.BETA_CHORES[i], false), startPottery: (i) => startChore(DATA.POTTERY_CHORES[i], false), startHalt: (i) => startChore(DATA.HALT_CHORES[i], false), startJob: (c) => startChore(c, false), openJobs,
    render: () => renderHome(), save, cloudPush, cloudPull, openFriends, openPause, sitting, reset() { S = fresh(); save(); renderHome(); }, keepWip, finish: () => ENGINE.debugFinish(), goPlace, openPlaces, seasonJobs,
    setHour(h) { fakeHour = h; }, renderTitle, nextChore, nextPlaceWithJobs, resting, stopNow, oneJob,
  };
})();
