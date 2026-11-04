// A headless Chrome driven over the DevTools protocol, with no packages:
// Node's own WebSocket and fetch. Used by run.mjs and game.mjs.

import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, openSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

// Never the everyday Chrome on a Mac: macOS allows one "Google Chrome" per login,
// so a headless one takes the clicks, the quits and the new windows meant for
// the real one, which then seems broken. There the bench uses Playwright's Chrome
// for Testing, a full browser with an identity of its own (the whole game has
// been played in it), or its headless shell, which is lighter but once lost its
// connection partway through a whole game. A cloud session's Chromium in
// /opt/pw-browsers and a Linux runner's Chrome are fine; $CHROME wins over all.
const newest = (dir, prefix, tail) => (existsSync(dir) ? readdirSync(dir).filter((d) => d.startsWith(prefix)).sort().reverse().map((d) => join(dir, d, tail)) : []);
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const mac = join(homedir(), 'Library/Caches/ms-playwright');
  const all = [...newest(mac, 'chromium-', 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
    ...newest(mac, 'chromium_headless_shell-', 'chrome-headless-shell-mac-arm64/chrome-headless-shell'),
    ...newest('/opt/pw-browsers', 'chromium-', 'chrome-linux/chrome'), '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return all.find((p) => existsSync(p));
}
const CHROME = findChrome();
const LINUX = process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch() {
  if (!CHROME) throw new Error('no test browser found: run "npx playwright install chromium", or set $CHROME (not the everyday Chrome on a Mac)');
  const profile = mkdtempSync(join(tmpdir(), 'ivy-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    '--allow-file-access-from-files', '--hide-scrollbars', '--mute-audio', ...LINUX, 'about:blank'], { stdio: process.env.IVY_CHROME_LOG ? ['ignore', 'ignore', openSync(process.env.IVY_CHROME_LOG, 'a')] : 'ignore' });
  // the profile goes when the test ends, however it ends, and Chrome never outlives it
  const wipe = () => { try { rmSync(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 }); } catch (_) {} };
  const close = () => { try { proc.kill('SIGKILL'); } catch (_) {} setTimeout(wipe, 400); };
  process.once('exit', () => { try { proc.kill('SIGKILL'); } catch (_) {} wipe(); });
  for (const sig of ['SIGTERM', 'SIGINT', 'SIGHUP']) process.once(sig, () => process.exit(1));
  try {
    let port;
    for (let i = 0; i < 150 && !port; i++) { await sleep(100); try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch (_) {} }
    if (!port) throw new Error('Chrome did not start');
    let page;
    for (let i = 0; i < 50 && !page; i++) { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); if (!page) await sleep(100); }
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('no devtools socket')); });
    let id = 0;
    const wait = new Map();
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && wait.has(d.id)) { const { r, j } = wait.get(d.id); wait.delete(d.id); if (d.error) j(new Error(d.error.message)); else r(d.result); }
      if (d.method === 'Inspector.targetCrashed') fail('the page crashed');
    };
    // an answer that never comes fails the run with the call's name, it never hangs
    // it: each call has a time limit, and if Chrome goes away everything still
    // waiting fails at once. A page script may ask for longer, see js()
    let gone = null;
    const fail = (why) => { if (gone) return; gone = why; for (const { j } of [...wait.values()]) j(new Error(why)); wait.clear(); };
    // says how: the signal tells a crash (SIGSEGV, SIGTRAP) from something stopping it (SIGTERM, SIGKILL)
    proc.on('exit', (code, signal) => fail(`Chrome went away while the test was running (exit ${code}, signal ${signal})`));
    ws.onclose = (e) => setTimeout(() => fail(`the connection to Chrome closed while the test was running (${e.code} ${e.reason || 'no reason'}, Chrome ${proc.exitCode === null && !proc.signalCode ? 'still running' : 'gone'})`), 500);
    const send = (method, params = {}, ms = method === 'Runtime.evaluate' ? 5 * 60000 : 60000) => new Promise((r, j) => {
      if (gone) { j(new Error(gone)); return; }
      const i = ++id;
      const limit = setTimeout(() => { wait.delete(i); j(new Error(`no answer to ${method} ${JSON.stringify(params).slice(0, 120)} in ${ms / 1000}s`)); }, ms);
      wait.set(i, { r: (v) => { clearTimeout(limit); r(v); }, j: (e) => { clearTimeout(limit); j(e); } });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
    await send('Inspector.enable');
    return { send, close: () => { try { ws.close(); } catch (_) {} close(); } };
  } catch (e) { close(); throw e; }
}

export async function js(b, expression, ms) {
  const r = await b.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, ms);
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
  return r.result.value;
}

export async function shot(b, path) {
  const r = await b.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path, Buffer.from(r.data, 'base64'));
  return path;
}

// real touches through Chrome's input pipeline, so pointer events come out
// the way they do on a phone; points are in CSS pixels
export async function touch(b, type, x, y) {
  await b.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1, radiusX: 5, radiusY: 5, force: 1 }] });
}
export async function swipe(b, p, q, steps = 10) {
  await touch(b, 'touchStart', p.x, p.y); await sleep(40);
  if (q.x !== p.x || q.y !== p.y) for (let k = 1; k <= steps; k++) { await touch(b, 'touchMove', p.x + ((q.x - p.x) * k) / steps, p.y + ((q.y - p.y) * k) / steps); await sleep(16); }
  await touch(b, 'touchEnd'); await sleep(90);
}

export async function phone(b, width = 390, height = 844) {
  await b.send('Page.enable'); await b.send('Runtime.enable');
  await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: true });
  await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}
