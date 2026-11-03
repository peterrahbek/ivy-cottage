// A headless Chrome driven over the DevTools protocol, with no packages:
// Node's own WebSocket and fetch. Used by run.mjs and game.mjs.

import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The Mac's Chrome, a cloud session's Chromium in /opt/pw-browsers, or a
// Linux runner's Chrome; $CHROME wins over all of them.
function findChrome() {
  const pw = existsSync('/opt/pw-browsers') ? readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).sort().reverse()
    .map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`) : [];
  const all = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ...pw,
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return all.find((p) => p && existsSync(p)) || all[1];
}
const CHROME = findChrome();
const LINUX = process.platform === 'linux' ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'ivy-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    '--allow-file-access-from-files', '--hide-scrollbars', '--mute-audio', ...LINUX, 'about:blank'], { stdio: 'ignore' });
  const close = () => { try { proc.kill('SIGKILL'); } catch (_) {} setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch (_) {} }, 400); };
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
    };
    const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; wait.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })); });
    return { send, close: () => { try { ws.close(); } catch (_) {} close(); } };
  } catch (e) { close(); throw e; }
}

export async function js(b, expression) {
  const r = await b.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
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
