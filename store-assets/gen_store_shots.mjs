/**
 * Regenerate the four App Store screenshots that carried third-party IP.
 *
 * WHY THIS EXISTS
 * Moodie's 2026-07-30 rejection was Guideline 4.1(a) (Copycats): the screenshots showed
 * "The Good Place", "Spider-Verse", "Knives Out" and the eight streaming-service wordmarks.
 * The 2026-08-15 resubmission swapped the build but shipped the same four images, so the
 * submission could only be rejected again. These replacements carry no real titles, no
 * service names and no service colours — only invented placeholder labels.
 *
 * WHY HTML + CDP AND NOT THE ORIGINAL gen_moodie.py
 * That generator is PIL-based against Linux DejaVu fonts; neither is present on this Mac.
 * The frame here is reproduced from pixel measurements of the two screenshots being KEPT
 * (01_mood.png, moodie_ipad_3.png) so the six-image set still reads as one set:
 *   iPhone 1284x2778 — card [110,470]-[1180,2660] r90 #1F1838; headline glyph tops 165/275;
 *                      wordmark "moodie" #8A80AC glyph rows 2717-2743
 *   iPad   2048x2732 — card x [92,1956], 3px #332A55 border on #141021; headline tops 160/270;
 *                      wordmark row (pink dot + "moodie") y 2635-2684
 * Verdana Bold at 86px reproduces the original DejaVu Sans Bold headline width (879px for
 * the longest line) to within 0.2%; the two faces share the Bitstream Vera lineage.
 *
 * Chrome's --window-size is clamped near 500px, so a 1284px viewport is only reachable via
 * Emulation.setDeviceMetricsOverride over CDP — same reason store-assets/render_screenshots.mjs
 * drives CDP. deviceScaleFactor is 1 here so one CSS pixel is one output pixel and every
 * measured coordinate above can be used literally.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9350;
const OUT = process.argv[2] || path.join(process.cwd(), 'new-shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- palette (from the app's own www/index.html, not any third party) ---------- */
const C = {
  bg: '#100C1D', bg2: '#1b1436', surface: '#1F1838', surface2: '#2A2150', line: '#332A55',
  text: '#ffffff', muted: '#B8B0D0', dim: '#8A80AC', ink: '#151024',
  pink: '#FF3D8A', purple: '#8B5CFF', orange: '#FF8A3D', yellow: '#FFD23D',
  teal: '#34E0C4', blue: '#43B4FF', green: '#9BE04A', rose: '#FF7AB8', violet: '#A879FF',
  ipadCard: '#141021',
};

/* Invented placeholder content. No real titles, services, ratings bodies or logos. */
const PICK = {
  title: 'A Feel-Good Comedy',
  grad: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
  badges: ['On your services', 'TV-14', '22m'],
  whyLead: 'Because you want to laugh:',
  whyBody: 'Warm, clever and easy to love.',
};
const SHELF = [
  { title: 'A Twisty Mystery', grad: `linear-gradient(135deg, ${C.orange}, ${C.pink})` },
  { title: 'A Big Adventure', grad: `linear-gradient(135deg, ${C.violet}, ${C.blue})` },
];
const SERVICES = [
  { label: 'Service A', c: C.teal }, { label: 'Service B', c: C.blue },
  { label: 'Service C', c: C.violet }, { label: 'Service D', c: C.orange },
  { label: 'Service E', c: C.rose }, { label: 'Service F', c: C.green },
];

/* ---------- shared css ---------- */
const base = (w, h) => `
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${w}px; height:${h}px; overflow:hidden; }
  body { font-family: Verdana, "DejaVu Sans", sans-serif; -webkit-font-smoothing:antialiased; }
  .stage { position:absolute; inset:0; }
  .hl { position:absolute; left:0; width:${w}px; text-align:center; color:${C.text};
        font-weight:bold; font-size:86px; line-height:108px; letter-spacing:-0.5px; }
  .card { position:absolute; }
  .label { color:${C.dim}; font-weight:bold; letter-spacing:1.5px; }
  .poster { position:relative; overflow:hidden; }
  .poster .scrim { position:absolute; left:0; right:0; bottom:0; height:42%;
                   background:linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.80)); }
  .poster .pt { position:absolute; left:40px; color:#fff; font-weight:bold; }
  .pill { display:inline-block; background:#fff; color:${C.ink}; font-weight:bold;
          border-radius:14px; }
  .pill.ghost { background:rgba(255,255,255,.16); color:#fff; }
  .btn { display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;
         background:linear-gradient(180deg, ${C.orange}, ${C.purple}); }
`;

/* ---------- iPhone 1284x2778 ---------- */
const IP = { w: 1284, h: 2778, x0: 110, y0: 470, x1: 1180, y1: 2660 };

const iphoneShell = (headline, inner) => `
<!doctype html><meta charset="utf-8"><style>
${base(IP.w, IP.h)}
.stage { background:
    radial-gradient(58% 17% at 68% -2%, rgba(255,61,138,.42), rgba(255,61,138,0) 70%),
    radial-gradient(62% 20% at 46% -3%, rgba(139,92,255,.62), rgba(139,92,255,0) 72%),
    linear-gradient(180deg, ${C.bg2}, ${C.bg}); }
.hl.l1 { top:132px; } .hl.l2 { top:240px; }
.card { left:${IP.x0}px; top:${IP.y0}px; width:${IP.x1 - IP.x0}px; height:${IP.y1 - IP.y0}px;
        background:${C.surface}; border-radius:90px; padding:60px; }
.mark { position:absolute; left:0; top:2694px; width:${IP.w}px; text-align:center;
        color:${C.dim}; font-weight:bold; font-size:47px; }
${inner.css || ''}
</style>
<div class="stage">
  <div class="hl l1">${headline[0]}</div>
  <div class="hl l2">${headline[1]}</div>
  <div class="card">${inner.html}</div>
  <div class="mark">moodie</div>
</div>`;

const iphonePick = iphoneShell(['One perfect pick —', 'with a reason.'], {
  css: `
    .sec { font-size:34px; margin-bottom:26px; }
    .big { height:1480px; border-radius:48px; background:${PICK.grad}; }
    .big .pt { bottom:118px; font-size:56px; }
    .big .row { position:absolute; left:40px; bottom:44px; display:flex; gap:12px; }
    .big .pill, .big .pill.ghost { padding:12px 22px; font-size:30px; }
    .why { margin-top:64px; background:${C.surface2}; border-radius:30px; padding:40px; }
    .why b { display:block; color:${C.text}; font-size:41px; margin-bottom:16px; }
    .why span { color:${C.muted}; font-size:37px; font-weight:normal; line-height:52px; }
    .btn { margin-top:60px; height:170px; border-radius:40px; font-size:51px; }
    .hint { margin-top:26px; text-align:center; color:${C.dim}; font-size:34px; font-weight:normal; }`,
  html: `
    <div class="label sec">YOUR PICK</div>
    <div class="poster big">
      <div class="scrim"></div>
      <div class="pt">${PICK.title}</div>
      <div class="row">
        <span class="pill">${PICK.badges[0]}</span>
        <span class="pill ghost">${PICK.badges[1]}</span>
        <span class="pill ghost">${PICK.badges[2]}</span>
      </div>
    </div>
    <div class="why"><b>${PICK.whyLead}</b><span>${PICK.whyBody}</span></div>
    <div class="btn">🍿 Where to watch</div>
    <div class="hint">Opens a live availability search.</div>`,
});

const iphoneServices = iphoneShell(['Only what you', 'can actually stream.'], {
  css: `
    .h2 { color:${C.text}; font-weight:bold; font-size:53px; margin-bottom:40px; }
    .chips { display:flex; flex-wrap:wrap; gap:24px; }
    .chip { border-radius:26px; padding:20px 34px; font-size:40px; font-weight:bold; color:${C.ink}; }
    .shelf { display:flex; gap:40px; margin-top:64px; }
    .shelf .poster { flex:1; height:1180px; border-radius:48px; }
    .shelf .pt { bottom:100px; font-size:36px; white-space:nowrap; }
    .shelf .row { position:absolute; left:40px; bottom:40px; }
    .shelf .pill { padding:10px 20px; font-size:28px; }
    .foot { margin-top:48px; text-align:center; color:${C.dim}; font-size:34px; font-weight:normal; }`,
  html: `
    <div class="h2">Your services</div>
    <div class="chips">
      ${SERVICES.map((s) => `<span class="chip" style="background:${s.c}">${s.label}</span>`).join('')}
    </div>
    <div class="shelf">
      ${SHELF.map((t) => `
        <div class="poster" style="background:${t.grad}">
          <div class="scrim"></div><div class="pt">${t.title}</div>
          <div class="row"><span class="pill">On your services</span></div>
        </div>`).join('')}
    </div>
    <div class="foot">Pick the services you already pay for — results only come from those.</div>`,
});

/* ---------- iPad 2048x2732 ---------- */
const PD = { w: 2048, h: 2732, x0: 92, x1: 1956, y0: 600, y1: 2300 };

const ipadShell = (headline, inner) => `
<!doctype html><meta charset="utf-8"><style>
${base(PD.w, PD.h)}
.stage { background:
    radial-gradient(52% 14% at 50% -1%, rgba(139,92,255,.22), rgba(139,92,255,0) 70%),
    linear-gradient(180deg, #160e27, ${C.bg} 45%, #19102c); }
.hl.l1 { top:128px; } .hl.l2 { top:236px; }
.card { left:${PD.x0}px; top:${PD.y0}px; width:${PD.x1 - PD.x0}px; height:${PD.y1 - PD.y0}px;
        background:${C.ipadCard}; border:3px solid ${C.line}; border-radius:48px; padding:64px; }
.mark { position:absolute; left:0; top:2632px; width:${PD.w}px; display:flex; gap:22px;
        align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:46px; }
.mark i { width:49px; height:49px; border-radius:50%;
          background:linear-gradient(135deg, ${C.pink}, ${C.purple}); }
${inner.css || ''}
</style>
<div class="stage">
  <div class="hl l1">${headline[0]}</div>
  <div class="hl l2">${headline[1]}</div>
  <div class="card">${inner.html}</div>
  <div class="mark"><i></i>moodie</div>
</div>`;

const ipadPick = ipadShell(['One perfect pick', 'with a reason.'], {
  css: `
    .sec { font-size:32px; margin-bottom:30px; }
    .wrap { display:flex; justify-content:center; }
    .big { width:820px; height:1150px; border-radius:44px; background:${PICK.grad}; }
    .big .pt { bottom:106px; font-size:50px; }
    .big .row { position:absolute; left:40px; bottom:40px; display:flex; gap:12px; }
    .big .pill, .big .pill.ghost { padding:10px 20px; font-size:28px; }
    .why { margin-top:48px; background:${C.surface2}; border-radius:28px; padding:34px 40px;
           display:flex; gap:18px; align-items:baseline; }
    .why b { color:${C.text}; font-size:38px; white-space:nowrap; }
    .why span { color:${C.muted}; font-size:36px; font-weight:normal; }
    .btn { margin-top:44px; height:132px; border-radius:36px; font-size:46px; }`,
  html: `
    <div class="label sec">YOUR PICK</div>
    <div class="wrap">
      <div class="poster big">
        <div class="scrim"></div><div class="pt">${PICK.title}</div>
        <div class="row">
          <span class="pill">${PICK.badges[0]}</span>
          <span class="pill ghost">${PICK.badges[1]}</span>
          <span class="pill ghost">${PICK.badges[2]}</span>
        </div>
      </div>
    </div>
    <div class="why"><b>${PICK.whyLead}</b><span>${PICK.whyBody}</span></div>
    <div class="btn">🍿 Where to watch</div>`,
});

const ipadServices = ipadShell(['Only what you can', 'actually stream.'], {
  css: `
    .sec { font-size:32px; margin-bottom:28px; }
    .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:28px; }
    .tile { height:320px; border-radius:32px; background:${C.surface}; border:3px solid ${C.line};
            display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; }
    .tile.on { border-color:transparent; }
    .tile .mono { width:118px; height:118px; border-radius:26px; display:flex; align-items:center;
                  justify-content:center; font-size:52px; font-weight:bold; color:${C.ink};
                  background:rgba(255,255,255,.92); }
    .tile .nm { color:#fff; font-size:38px; font-weight:bold; }
    .tile.off .mono { background:${C.surface2}; color:${C.dim}; }
    .tile.off .nm { color:${C.dim}; }
    .sec2 { font-size:32px; margin:44px 0 26px; }
    .shelf { display:flex; gap:32px; }
    .shelf .poster { flex:1; height:700px; border-radius:36px; }
    .shelf .pt { bottom:44px; font-size:44px; }`,
  html: `
    <div class="label sec">YOUR SERVICES</div>
    <div class="grid">
      ${SERVICES.map((s, i) => `
        <div class="tile ${i < 4 ? 'on' : 'off'}" ${i < 4 ? `style="background:${s.c}"` : ''}>
          <div class="mono">${String.fromCharCode(65 + i)}</div>
          <div class="nm">${s.label}</div>
        </div>`).join('')}
    </div>
    <div class="label sec2">READY TO STREAM TONIGHT</div>
    <div class="shelf">
      ${SHELF.map((t) => `
        <div class="poster" style="background:${t.grad}">
          <div class="scrim"></div><div class="pt">${t.title}</div>
        </div>`).join('')}
    </div>`,
});

const SCENES = [
  { file: '02_pick.png', w: IP.w, h: IP.h, html: iphonePick },
  { file: '05_services.png', w: IP.w, h: IP.h, html: iphoneServices },
  { file: 'moodie_ipad_1.png', w: PD.w, h: PD.h, html: ipadPick },
  { file: 'moodie_ipad_2.png', w: PD.w, h: PD.h, html: ipadServices },
];

/* ---------- CDP driver ---------- */
async function cdp(wsUrl, fn) {
  const ws = new WebSocket(wsUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id); pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id; pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  try { return await fn(send); } finally { ws.close(); }
}

const staging = mkdtempSync(path.join(tmpdir(), 'moodie-gen-'));
mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, ['--headless', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', '--allow-file-access-from-files',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(staging, 'profile')}`,
  'about:blank'], { stdio: 'ignore' });

let version = null;
for (let i = 0; i < 60 && !version; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(250); }
}
if (!version) { chrome.kill(); throw new Error('Chrome debugging endpoint never came up'); }

try {
  for (const s of SCENES) {
    const page = path.join(staging, s.file.replace('.png', '.html'));
    writeFileSync(page, s.html, 'utf8');
    const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
    await cdp(target.webSocketDebuggerUrl, async (send) => {
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', {
        width: s.w, height: s.h, deviceScaleFactor: 1, mobile: false,
        screenWidth: s.w, screenHeight: s.h,
      });
      await send('Page.navigate', { url: 'file://' + page });
      await sleep(700);
      const info = JSON.parse((await send('Runtime.evaluate', {
        expression: 'JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio,over:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight})',
        returnByValue: true,
      })).result.value);
      if (info.w !== s.w || info.h !== s.h || info.dpr !== 1) {
        throw new Error(`${s.file}: viewport ${info.w}x${info.h}@${info.dpr}, wanted ${s.w}x${s.h}@1`);
      }
      if (info.over) throw new Error(`${s.file}: content overflows the frame`);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      writeFileSync(path.join(OUT, s.file), Buffer.from(shot.data, 'base64'));
    });
    await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
    console.log(`${s.file.padEnd(22)} ${s.w}x${s.h}`);
  }
} finally {
  chrome.kill();
  await sleep(800);
  try { rmSync(staging, { recursive: true, force: true }); } catch { /* temp dir */ }
}
console.log(`\n${SCENES.length} screenshots written to ${OUT}`);
