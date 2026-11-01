// Ivy Cottage cloud: keeps a copy of a player's save so it can be picked up
// on another phone, and small friends lists with nicknames and a few numbers.
//
// There are no accounts. A random save code (XXXX-XXXX-XXXX) is the key to a
// save; it travels in the X-Ivy-Code header, never in the URL. A friends list
// has its own short code (XXX-XXX) that only shows nicknames and numbers.
//
// KV keys:  s:<code> the save   p:<code> nickname, list and numbers
//           g:<list> member codes

const ORIGINS = ['https://peterrahbek.github.io', 'http://localhost:8790'];
const MAX_BODY = 120000;
const MAX_MEMBERS = 30;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(groups) {
  const out = [];
  for (const n of groups) {
    const bytes = crypto.getRandomValues(new Uint8Array(n));
    out.push(Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join(''));
  }
  return out.join('-');
}
const SAVE_RE = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const LIST_RE = /^[A-Z2-9]{3}-[A-Z2-9]{3}$/;
const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const asSave = (s) => { const c = cleanCode(s); return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}` : ''; };
const asList = (s) => { const c = cleanCode(s); return c.length === 6 ? `${c.slice(0, 3)}-${c.slice(3)}` : ''; };

// nicknames: letters, digits, spaces and a little punctuation, 2-16 long
function cleanNick(s) {
  const n = String(s || '').replace(/[^\p{L}\p{N} ._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  return n.length >= 2 ? n : '';
}
const num = (v) => (Number.isFinite(+v) ? Math.max(0, Math.min(1e12, Math.round(+v))) : 0);

function cors(req) {
  const o = req.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Ivy-Code',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
const json = (req, body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors(req) } });

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new Error('too big');
  return text ? JSON.parse(text) : {};
}
const getJSON = async (env, key) => { const v = await env.DATA.get(key); return v ? JSON.parse(v) : null; };
const putJSON = (env, key, v) => env.DATA.put(key, JSON.stringify(v));

// the numbers shown on a friends list
function stats(b) {
  const s = b.stats || {};
  return { earned: num(b.earned), finds: num(s.finds), places: num(s.places), jobs: num(s.jobs) };
}
async function writeSave(env, code, b) {
  if (typeof b.data !== 'string' || !b.data.startsWith('{')) throw new Error('no save');
  const now = Date.now();
  await putJSON(env, `s:${code}`, { data: b.data, earned: num(b.earned), updated: now });
  const p = (await getJSON(env, `p:${code}`)) || {};
  await putJSON(env, `p:${code}`, Object.assign(p, stats(b), { updated: now }));
  return now;
}

async function members(env, list, me) {
  const g = await getJSON(env, `g:${list}`);
  if (!g) return null;
  const rows = await Promise.all(g.members.map(async (code) => {
    const p = await getJSON(env, `p:${code}`);
    return p && p.grp === list ? { nick: p.nick, earned: p.earned || 0, finds: p.finds || 0, places: p.places || 0, jobs: p.jobs || 0, me: code === me } : null;
  }));
  return rows.filter(Boolean).sort((a, b) => b.earned - a.earned);
}

async function handle(req, env) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  const code = asSave(req.headers.get('X-Ivy-Code'));
  const known = async () => code && SAVE_RE.test(code) && (await env.DATA.get(`s:${code}`)) !== null;

  if (req.method !== 'GET' && env.WRITE_LIMITER) {
    const ip = req.headers.get('CF-Connecting-IP') || 'x';
    const { success } = await env.WRITE_LIMITER.limit({ key: ip });
    if (!success) return json(req, { error: 'slow down' }, 429);
  }

  if (path === '/api/save' && req.method === 'POST') {
    // a new save code for this phone
    const b = await readBody(req);
    let c;
    do c = randomCode([4, 4, 4]); while (await env.DATA.get(`s:${c}`));
    await writeSave(env, c, b);
    return json(req, { code: c });
  }
  if (path === '/api/save' && req.method === 'PUT') {
    if (!(await known())) return json(req, { error: 'unknown code' }, 404);
    const updated = await writeSave(env, code, await readBody(req));
    return json(req, { ok: true, updated });
  }
  if (path === '/api/save' && req.method === 'GET') {
    const s = code && (await getJSON(env, `s:${code}`));
    if (!s) return json(req, { error: 'unknown code' }, 404);
    return json(req, s);
  }

  if (path === '/api/list' && req.method === 'GET') {
    const p = code && (await getJSON(env, `p:${code}`));
    if (!p || !p.grp) return json(req, { list: null, members: [] });
    return json(req, { list: p.grp, nick: p.nick, members: (await members(env, p.grp, code)) || [] });
  }
  if ((path === '/api/list' || path === '/api/list/join') && req.method === 'POST') {
    if (!(await known())) return json(req, { error: 'unknown code' }, 404);
    const b = await readBody(req);
    const nick = cleanNick(b.nick);
    if (!nick) return json(req, { error: 'nickname' }, 400);
    const p = (await getJSON(env, `p:${code}`)) || {};
    let list;
    if (path === '/api/list') {
      do list = randomCode([3, 3]); while (await env.DATA.get(`g:${list}`));
      await putJSON(env, `g:${list}`, { members: [code], created: Date.now() });
    } else {
      list = asList(b.list);
      const g = list && LIST_RE.test(list) && (await getJSON(env, `g:${list}`));
      if (!g) return json(req, { error: 'unknown list' }, 404);
      if (!g.members.includes(code)) {
        if (g.members.length >= MAX_MEMBERS) return json(req, { error: 'full' }, 409);
        g.members.push(code);
        await putJSON(env, `g:${list}`, g);
      }
    }
    await putJSON(env, `p:${code}`, Object.assign(p, { nick, grp: list }));
    return json(req, { list, nick, members: (await members(env, list, code)) || [] });
  }
  if (path === '/api/list/leave' && req.method === 'POST') {
    const p = code && (await getJSON(env, `p:${code}`));
    if (p && p.grp) {
      const g = await getJSON(env, `g:${p.grp}`);
      if (g) { g.members = g.members.filter((m) => m !== code); await putJSON(env, `g:${p.grp}`, g); }
      delete p.grp;
      await putJSON(env, `p:${code}`, p);
    }
    return json(req, { ok: true });
  }

  if (path === '' || path === '/api') return json(req, { ok: true, service: 'ivy-cottage cloud' });
  return json(req, { error: 'not found' }, 404);
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    try {
      return await handle(req, env);
    } catch (e) {
      return json(req, { error: e.message === 'too big' ? 'too big' : 'bad request' }, 400);
    }
  },
};
