#!/usr/bin/env node
/**
 * Render App Store screenshots from the REAL shipping UI (www/index.html).
 *
 * WHY THIS EXISTS
 * The previous screenshot set was rendered while Moodie still pulled poster art from
 * Wikipedia, so every shot showed a studio theatrical one-sheet. That set is wrong twice
 * over: the art is third-party content sitting in App Store *metadata* (Guideline 5.2 —
 * and screenshots count as metadata, which is how Slow Burn took its 1.1), and it no
 * longer depicts the app, which now ships its own gradient key art (Guideline 2.3.3,
 * "screenshots must show the app in use").
 *
 * Rather than hand-draw a mock — a mock drifts from the app the moment the app changes —
 * this drives the actual www/index.html and photographs it. What Apple sees is exactly
 * what the build renders.
 *
 * WHY CDP AND NOT `chrome --screenshot`
 * Headless Chrome clamps `--window-size` to roughly 500x845; asking for a 430pt-wide
 * iPhone viewport silently gave a 500px layout upscaled to 1290px, which clipped the
 * right-hand side of every shot. Emulation.setDeviceMetricsOverride is the only way to
 * get a true device viewport. Node 22 ships a global WebSocket, so driving CDP directly
 * needs no puppeteer and no install step.
 *
 * DETERMINISM
 * The app shuffles at random, so each scene calls the render function directly with a
 * fixed title instead of tapping Shuffle. No randomness and no network (the app makes no
 * requests at all now), so reruns are stable.
 *
 * Usage: node store-assets/render_screenshots.mjs [outdir]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INDEX = path.join(REPO, 'www', 'index.html');
const OUT = process.argv[2] || path.join(REPO, 'fastlane', 'screenshots', 'en-US');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

// name, CSS points, device scale -> final pixels must match Apple's required sizes
const DEVICES = [
  { name: 'iphone-6-9', w: 430, h: 932, scale: 3 },  // 1290 x 2796
  { name: 'iphone-6-5', w: 414, h: 896, scale: 3 },  // 1242 x 2688
  { name: 'ipad-13', w: 1024, h: 1366, scale: 2 },   // 2048 x 2732
];

// Each scene is JS run against the live app. Keep these in step with www/index.html.
const SCENES = [
  ['01-pick-your-mood', `
      setTab('home');
      ['laugh','chill'].forEach(function(id){ state.moods.add(id); });
      buildMoods();
  `],
  ['02-your-pick', `
      state.moods.add('smart'); state.moods.add('laugh'); buildMoods();
      showScreen('result');
      settleResult(TITLES.find(function(t){ return t.id===15; }));   /* Knives Out */
  `],
  ['03-watch-together', `
      setTab('groups');
  `],
  ['04-pass-the-phone', `
      setTab('groups');
      pair.count = 3;
      pair.names = ['Jonathan','Sam','Alex'];
      pairBegin();
      [].forEach.call(document.querySelectorAll('#groupsBody button.mood'), function(b, i){
        if (i === 0 || i === 5) { b.click(); }
      });
  `],
  ['05-everyone-happy', `
      setTab('groups');
      pair.count = 3;
      pair.names = ['Jonathan','Sam','Alex'];
      pair.people = [
        { name:'Jonathan', moods:new Set(['laugh','chill']) },
        { name:'Sam',      moods:new Set(['laugh','family']) },
        { name:'Alex',     moods:new Set(['chill']) }
      ];
      var t = TITLES.find(function(x){ return x.id===5; });          /* Paddington 2 */
      pair.result = { pick: pairScore([t])[0], best: 3, widened:false };
      pairReveal();
  `],
];

const bootstrap = (js) => `
<script>
/* screenshot harness — injected by store-assets/render_screenshots.mjs, never shipped */
(function(){
  function go(){
    try { ${js} document.documentElement.setAttribute('data-scene','ready'); }
    catch (e) { document.documentElement.setAttribute('data-scene','ERROR: '+e.message); }
  }
  if (document.readyState === 'complete') { setTimeout(go, 50); }
  else { window.addEventListener('load', function(){ setTimeout(go, 50); }); }
})();
</script>`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(wsUrl, onReady) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  try { return await onReady(send); } finally { ws.close(); }
}

async function main() {
  const staging = mkdtempSync(path.join(tmpdir(), 'moodie-shots-'));
  mkdirSync(OUT, { recursive: true });
  const html = readFileSync(INDEX, 'utf8');
  if (!html.includes('</body>')) throw new Error('index.html shape changed');

  // NOT --disable-gpu. The tab bar uses backdrop-filter: blur(20px), and Chrome's software
  // rasteriser mis-composites it — two of the four tab emoji were being painted at the TOP
  // of the image, in shots that were otherwise perfect. The DOM is fine (the icons measure
  // at y=1299); it is purely a rasteriser bug, and GPU rasterisation renders it correctly.
  const chrome = spawn(CHROME, [
    '--headless', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--allow-file-access-from-files',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(staging, 'profile')}`,
    'about:blank',
  ], { stdio: 'ignore' });

  // wait for the debugging endpoint
  let version = null;
  for (let i = 0; i < 60 && !version; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); }
    catch { await sleep(250); }
  }
  if (!version) { chrome.kill(); throw new Error('Chrome debugging endpoint never came up'); }

  const made = [];
  try {
    for (const dev of DEVICES) {
      for (const [slug, js] of SCENES) {
        const page = path.join(staging, `${dev.name}-${slug}.html`);
        writeFileSync(page, html.replace('</body>', bootstrap(js) + '</body>'), 'utf8');

        const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
        const dest = path.join(OUT, `${dev.name}-${slug}.png`);
        await cdp(target.webSocketDebuggerUrl, async (send) => {
          await send('Page.enable');
          await send('Emulation.setDeviceMetricsOverride', {
            width: dev.w, height: dev.h, deviceScaleFactor: dev.scale,
            mobile: dev.name.startsWith('iphone'), screenWidth: dev.w, screenHeight: dev.h,
          });
          await send('Page.navigate', { url: 'file://' + page });
          await sleep(900);
          const check = await send('Runtime.evaluate', {
            expression: `JSON.stringify({scene:document.documentElement.dataset.scene,w:innerWidth,h:innerHeight,dpr:devicePixelRatio,over:document.documentElement.scrollWidth>innerWidth})`,
            returnByValue: true,
          });
          const info = JSON.parse(check.result.value);
          if (!info.scene || info.scene.startsWith('ERROR')) throw new Error(`${dev.name}/${slug}: scene ${info.scene}`);
          if (info.w !== dev.w || info.h !== dev.h) throw new Error(`${dev.name}/${slug}: viewport ${info.w}x${info.h}, wanted ${dev.w}x${dev.h}`);
          if (info.over) throw new Error(`${dev.name}/${slug}: horizontal overflow at ${dev.w}pt`);
          const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
          writeFileSync(dest, Buffer.from(shot.data, 'base64'));
        });
        await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
        made.push(dest);
        console.log(`${path.basename(dest).padEnd(38)} ${dev.w * dev.scale}x${dev.h * dev.scale}`);
      }
    }
  } finally {
    chrome.kill();
    // Chrome keeps flushing its profile for a moment after SIGTERM; removing the staging
    // dir immediately races that and throws ENOTEMPTY over an otherwise successful run.
    await sleep(800);
    try { rmSync(staging, { recursive: true, force: true }); } catch { /* temp dir, fine */ }
  }
  console.log(`\n${made.length} screenshots written to ${OUT}`);
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
