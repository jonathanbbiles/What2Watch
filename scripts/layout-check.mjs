#!/usr/bin/env node
/**
 * layout-check.mjs — render the REAL www/ at every screen size Moodie now ships on and
 * prove nothing is cut off. iPhone, iPhone Duo (closed / open / open sideways) and iPad
 * (11" and 13", both orientations).
 *
 *   npm install --no-save playwright-core
 *   PW_EXEC=/path/to/chromium npm run layout [-- outdir]
 *
 * www/ is served over http from this process (not file://), TMDB is mocked with our own
 * gradient art, and for each size it walks every screen (welcome, services, seen, moods,
 * pick, Together setup / pass-the-phone / shared pick, Saved, You) and fails when:
 *   - anything scrolls sideways (document or any screen body), or
 *   - the last control of a screen cannot be reached: after scrolling the screen body to
 *     the bottom, it must sit fully above the tab bar (or the bottom of the window).
 * Screenshots of every screen land in outdir (default: a temp dir) — look at them.
 *
 * Needs a browser, so it is NOT part of `npm test` (Codemagic runs no browser for tests).
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'moodie-layout-'));
fs.mkdirSync(OUT, { recursive: true });

export const SIZES = [
  [390, 844, 'iphone'], [466, 678, 'duo-closed'], [669, 951, 'duo-open'], [951, 669, 'duo-open-sideways'],
  [820, 1180, 'ipad11-portrait'], [1180, 820, 'ipad11-landscape'], [1024, 1366, 'ipad13-portrait'], [1366, 1024, 'ipad13-landscape'],
];

// ---- tiny static server for www/ (the key placeholder swapped for a dummy so TMDB is "on")
const WWW = path.join(REPO, 'www');
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.join(WWW, rel);
  if (!file.startsWith(WWW) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  let body = fs.readFileSync(file);
  if (rel === 'index.html') body = Buffer.from(body.toString('utf8').replace('__TMDB_API_KEY__', 'abcdefabcdefabcdefabcdefabcdef12'));
  res.writeHead(200, { 'content-type': rel.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
  res.end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;

// ---- TMDB mock: our own titles + generated gradient posters (no third-party art)
const CAT = [
  ['Paddington 2', 'movie', 2017, 8.2, 'A very polite bear, a stolen pop-up book, and the kindest prison in cinema.', ['#FF8A3D', '#FF3D8A']],
  ['The Good Place', 'tv', 2016, 8.2, 'Four strangers wake up in paradise. Only one of them is sure she does not belong there.', ['#34E0C4', '#43B4FF']],
  ['Everything Everywhere All at Once', 'movie', 2022, 8.0, 'A laundromat, a tax audit, and every universe at once. Bring tissues and a bagel.', ['#8B5CFF', '#FF3D8A']],
  ['Planet Earth II', 'tv', 2016, 9.4, 'Breathe out. The planet is stunning and the iguana is running for its life.', ['#34E0C4', '#9BE04A']],
  ['Interstellar', 'movie', 2014, 8.4, 'Big feelings, bigger space, and a bookshelf that means everything.', ['#151B4A', '#43B4FF']],
  ['Bluey', 'tv', 2018, 9.3, 'Seven minutes of a cartoon dog family that somehow fixes everyone in the room.', ['#43B4FF', '#34E0C4']],
];
function png(w, h, c1, c2) {
  const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const a = hex(c1), b = hex(c2); const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) { const t = (x / w + y / h) / 2; const o = y * (w * 3 + 1) + 1 + x * 3; for (let k = 0; k < 3; k++) raw[o + k] = Math.round(a[k] + (b[k] - a[k]) * t); } }
  const crc = (buf) => { let c = ~0; for (const byte of buf) { c ^= byte; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const POSTERS = CAT.map((c) => png(171, 256, c[5][0], c[5][1]));
const PROV = [[8, 'Netflix'], [337, 'Disney Plus'], [15, 'Hulu'], [9, 'Amazon Prime Video'], [1899, 'Max'], [350, 'Apple TV+'], [386, 'Peacock Premium'], [531, 'Paramount Plus'], [73, 'Tubi TV'], [283, 'Crunchyroll'], [151, 'BritBox'], [257, 'fuboTV']];
const hit = (i, kind) => { const c = CAT[i % CAT.length]; const k = kind || c[1]; return { id: 100 + i, media_type: k, title: k === 'movie' ? c[0] : undefined, name: k === 'tv' ? c[0] : undefined, release_date: c[2] + '-06-01', first_air_date: c[2] + '-06-01', poster_path: '/p' + (i % CAT.length) + '.png', overview: c[4], vote_average: c[3], vote_count: 5000, genre_ids: [35, 18] }; };
async function mock(page) {
  await page.route('https://api.themoviedb.org/**', (route) => {
    const u = new URL(route.request().url()); const p = u.pathname; let body = {};
    if (p.includes('/watch/providers/')) body = { results: PROV.map(([id, name], i) => ({ provider_id: id, provider_name: name, display_priorities: { US: i } })) };
    else if (p.includes('/discover/')) { const kind = p.includes('/tv') ? 'tv' : 'movie'; body = { results: Array.from({ length: 20 }, (_, i) => hit(i, kind)) }; }
    else if (p.includes('/top_rated') || p.includes('/search/') || p.includes('/trending')) { const pg = +(u.searchParams.get('page') || 1); body = { results: Array.from({ length: 20 }, (_, i) => hit(pg * 20 + i)) }; }
    else if (/\/(movie|tv)\/\d+$/.test(p)) { const id = +p.split('/').pop(); const c = CAT[(id - 100) % CAT.length]; body = { tagline: 'Every mood, one pick.', runtime: 104, genres: [{ name: 'Comedy' }, { name: 'Drama' }], external_ids: { imdb_id: 'tt0000000' }, overview: c[4], release_dates: { results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'PG' }] }] }, content_ratings: { results: [{ iso_3166_1: 'US', rating: 'TV-PG' }] }, 'watch/providers': { results: { US: { link: 'https://www.justwatch.com/us/x', flatrate: [{ provider_id: 8, provider_name: 'Netflix' }] } } } }; }
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('https://image.tmdb.org/**', (route) => { const m = route.request().url().match(/\/p(\d+)\.png/); route.fulfill({ status: 200, contentType: 'image/png', body: POSTERS[m ? +m[1] : 0] }); });
}

// ---- the screens, in the order a user meets them
const SCREENS = [
  ['ob1', async (p) => {}],
  ['ob2', async (p) => { await p.evaluate(() => { showScreen('ob2'); renderServices('svcGrid', ''); }); }],
  ['ob3', async (p) => { await p.evaluate(() => { showScreen('ob3'); buildTaste(); }); await p.waitForTimeout(400); }],
  ['home', async (p) => { await p.evaluate(() => { finishOnboarding(); state.moods.add('laugh'); state.moods.add('chill'); buildMoods(); setTab('home'); }); }],
  ['pick', async (p) => { await p.click('text=Shuffle my pick'); await p.waitForSelector('#resultBody .pick .title'); await p.click('#saveBtn'); }],
  ['together-setup', async (p) => { await p.evaluate(() => { setTab('groups'); pair = null; pairSetup(); }); }],
  ['together-pal', async (p) => { await p.click('text=Start picking'); await p.click('#groupsBody button.mood:has-text("Laugh")'); }],
  ['together-pick', async (p) => { await p.click('text=Next Pal'); await p.click('#groupsBody button.mood:has-text("Laugh")'); await p.click('text=See our pick'); await p.waitForSelector('#groupsBody .pick .title'); }],
  ['saved', async (p) => { await p.evaluate(() => setTab('saved')); }],
  ['profile', async (p) => { await p.evaluate(() => setTab('profile')); }],
];

const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : { channel: 'chrome' });
const failures = [];
for (const [w, h, label] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => failures.push(`${label}: page error ${e.message}`));
  // Same pick every run, so two renders of the same size can be compared pixel for pixel.
  await page.addInitScript(() => { let s = 42; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647); });
  await mock(page);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  await page.evaluate(() => { [8, 15, 337].forEach((id) => state.services.add(id)); });
  for (const [name, go] of SCREENS) {
    await go(page);
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(OUT, `${w}x${h}-${name}.png`), animations: 'disabled' });
    const r = await page.evaluate(() => {
      const out = [];
      const de = document.documentElement;
      if (de.scrollWidth > window.innerWidth + 1) out.push(`document scrolls sideways (${de.scrollWidth} > ${window.innerWidth})`);
      const scr = document.querySelector('.screen.active');
      const body = scr.querySelector('.screen-body');
      if (body && body.scrollWidth > body.clientWidth + 1) out.push(`screen body scrolls sideways (${body.scrollWidth} > ${body.clientWidth})`);
      if (body) body.scrollTop = body.scrollHeight;
      const tb = document.getElementById('tabbar');
      const floor = tb && getComputedStyle(tb).display !== 'none' ? tb.getBoundingClientRect().top : window.innerHeight;
      const ctrls = Array.from(scr.querySelectorAll('button, input, select')).filter((el) => el.offsetParent !== null);
      const last = ctrls.reduce((a, el) => (!a || el.getBoundingClientRect().bottom > a.getBoundingClientRect().bottom ? el : a), null);
      if (last) {
        const b = last.getBoundingClientRect();
        if (b.bottom > floor + 0.5) out.push(`last control "${(last.textContent || last.placeholder || last.tagName).trim().slice(0, 30)}" ends at ${Math.round(b.bottom)}, below ${Math.round(floor)}`);
        if (b.right > window.innerWidth + 0.5 || b.left < -0.5) out.push(`last control off-screen sideways`);
      }
      Array.from(document.querySelectorAll('.tabbar .tab')).forEach((t) => { const rr = t.getBoundingClientRect(); if (rr.width && (rr.height < 44 || rr.width < 44)) out.push('tab under 44pt'); });
      if (body) body.scrollTop = 0;
      return out;
    });
    r.forEach((m) => failures.push(`${w}x${h} ${label} / ${name}: ${m}`));
    console.log(`${r.length ? 'FAIL' : 'ok  '} ${String(w + 'x' + h).padEnd(10)} ${label.padEnd(18)} ${name}`);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`\nscreenshots: ${OUT}`);
if (failures.length) { console.log('\n' + failures.join('\n')); process.exit(1); }
console.log('layout-check: every size, every screen — no sideways scroll, last control reachable.');
