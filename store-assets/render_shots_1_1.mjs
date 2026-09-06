#!/usr/bin/env node
/**
 * App Store screenshots for Moodie 1.1 — rendered from the REAL www/index.html with
 * Playwright, TMDB mocked. No third-party artwork: every "poster" is a gradient card
 * generated here, titles are plain text, synopses are our own words.
 *
 *   npm install --no-save playwright-core && node store-assets/render_shots_1_1.mjs [outdir]
 *   (uses the installed Google Chrome; set PW_EXEC=/path/to/chromium to use another binary)
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.argv[2] || path.join(REPO, 'fastlane', 'screenshots', 'en-US');
fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(REPO, 'www', 'index.html'), 'utf8').replace('__TMDB_API_KEY__', 'abcdefabcdefabcdefabcdefabcdef12');

// Our own catalog for the mock. Names are plain text; blurbs are ours.
const CAT = [
  ['Paddington 2', 'movie', 2017, 8.2, 'A very polite bear, a stolen pop-up book, and the kindest prison in cinema.', ['#FF8A3D', '#FF3D8A'], 103, 'PG'],
  ['Knives Out', 'movie', 2019, 7.9, 'A whodunit with a wicked grin, where every relative is a suspect and the sweaters are excellent.', ['#FF8A3D', '#6B4CFF'], 130, 'PG-13'],
  ['Spirited Away', 'movie', 2001, 8.5, 'A girl, a bathhouse for spirits, and the strangest, loveliest job in the world.', ['#43B4FF', '#8B5CFF'], 125, 'PG'],
  ['The Good Place', 'tv', 2016, 8.2, 'Four strangers wake up in paradise. Only one of them is sure she does not belong there.', ['#34E0C4', '#43B4FF'], 22, 'TV-14'],
  ['Coco', 'movie', 2017, 8.4, 'A boy with a guitar crosses into the land of the dead to find out where his music came from.', ['#FF8A3D', '#FFD23D'], 105, 'PG'],
  ['Ted Lasso', 'tv', 2020, 8.8, 'An American football coach takes over an English soccer club and wins with kindness.', ['#43B4FF', '#8B5CFF'], 30, 'TV-MA'],
  ['Inception', 'movie', 2010, 8.4, 'A heist that happens inside a dream inside a dream. Argue about the ending afterwards.', ['#6B4CFF', '#43B4FF'], 148, 'PG-13'],
  ['Everything Everywhere All at Once', 'movie', 2022, 8.0, 'A laundromat, a tax audit, and every universe at once. Bring tissues and a bagel.', ['#8B5CFF', '#FF3D8A'], 139, 'R'],
  ['Fleabag', 'tv', 2016, 8.7, 'Sharp, filthy and secretly devastating. She keeps looking at you.', ['#FF3D8A', '#6B4CFF'], 27, 'TV-MA'],
  ['Top Gun: Maverick', 'movie', 2022, 8.2, 'Pure adrenaline, a grin, and a lot of very fast aeroplanes.', ['#0064FF', '#FF8A3D'], 130, 'PG-13'],
  ['Planet Earth II', 'tv', 2016, 9.4, 'Breathe out. The planet is stunning and the iguana is running for its life.', ['#34E0C4', '#9BE04A'], 50, 'TV-G'],
  ['Bluey', 'tv', 2018, 9.3, 'Seven minutes of a cartoon dog family that somehow fixes everyone in the room.', ['#43B4FF', '#34E0C4'], 8, 'TV-Y'],
  ['A Quiet Place', 'movie', 2018, 7.5, 'Make a sound and they come. Ninety minutes of holding your breath.', ['#2A2150', '#FF5C7A'], 90, 'PG-13'],
  ['Stranger Things', 'tv', 2016, 8.6, 'Bikes, walkie-talkies, and something under the town that should have stayed there.', ['#E50914', '#151B4A'], 51, 'TV-14'],
  ['Pride & Prejudice', 'movie', 2005, 7.8, 'Longing glances, rolling hills, and a hand-flex that launched a thousand rewatches.', ['#9BE04A', '#34E0C4'], 129, 'PG'],
  ['The Office', 'tv', 2005, 9.0, 'A paper company in Scranton. The endless comfort rewatch.', ['#43B4FF', '#6B4CFF'], 22, 'TV-14'],
  ['Interstellar', 'movie', 2014, 8.4, 'Big feelings, bigger space, and a bookshelf that means everything.', ['#151B4A', '#43B4FF'], 169, 'PG-13'],
  ['Brooklyn Nine-Nine', 'tv', 2013, 8.4, 'Cops, but silly. A comfort-watch that never misses.', ['#FF8A3D', '#FFD23D'], 22, 'TV-14'],
  ['Spider-Man: Into the Spider-Verse', 'movie', 2018, 8.4, 'A jolt of colour and joy. Anyone can wear the mask.', ['#FF3D8A', '#8B5CFF'], 117, 'PG'],
  ['Schitt\'s Creek', 'tv', 2015, 8.5, 'A rich family loses everything except a small town. Warm, silly, impossible not to smile.', ['#FF7AB8', '#FF8A3D'], 22, 'TV-14'],
];
const PROV = [[8, 'Netflix', 0], [337, 'Disney Plus', 1], [15, 'Hulu', 2], [9, 'Amazon Prime Video', 3], [1899, 'Max', 4], [350, 'Apple TV+', 5], [386, 'Peacock Premium', 6], [531, 'Paramount Plus', 7], [73, 'Tubi TV', 9], [283, 'Crunchyroll', 12], [151, 'BritBox', 15], [257, 'fuboTV', 16]];
const hit = (i) => { const c = CAT[i % CAT.length]; return { id: 100 + i, media_type: c[1], title: c[1] === 'movie' ? c[0] : undefined, name: c[1] === 'tv' ? c[0] : undefined, release_date: c[2] + '-06-01', first_air_date: c[2] + '-06-01', poster_path: '/p' + (i % CAT.length) + '.png', overview: c[4], vote_average: c[3], vote_count: 5000, genre_ids: [35, 18] }; };

// 342x513 gradient PNG per title — original art.
function png(w, h, c1, c2) {
  const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const a = hex(c1), b = hex(c2);
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const t = (x / w + y / h) / 2; const o = y * (w * 3 + 1) + 1 + x * 3; for (let k = 0; k < 3; k++) raw[o + k] = Math.round(a[k] + (b[k] - a[k]) * t); } }
  const crc = (buf) => { let c = ~0; for (const byte of buf) { c ^= byte; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const POSTERS = CAT.map((c) => png(342, 513, c[5][0], c[5][1]));

const DEVICES = [
  { name: 'iphone-6-5', w: 414, h: 896, scale: 3 },   // 1242 x 2688
  { name: 'ipad-13', w: 1024, h: 1366, scale: 2 },    // 2048 x 2732
];
const SCENES = [
  ['01-pick-your-mood', async (p) => { await p.evaluate(() => { finishOnboarding(); ['laugh', 'chill'].forEach((id) => state.moods.add(id)); buildMoods(); }); }],
  ['02-your-pick', async (p) => { await p.evaluate(() => { state.moods.clear(); ['laugh', 'smart'].forEach((id) => state.moods.add(id)); buildMoods(); setTab('home'); }); await p.click('text=Shuffle my pick'); await p.waitForSelector('.pick .title'); await p.waitForTimeout(700); }],
  ['03-where-you-watch', async (p) => { await p.evaluate(() => { showScreen('ob2'); renderServices('svcGrid', ''); }); }],
  ['04-pass-the-phone', async (p) => { await p.evaluate(() => { setTab('groups'); pair.count = 3; pair.names = ['Jonathan', 'Sam', 'Alex']; pairSetup(); }); await p.click('text=Start picking'); await p.waitForTimeout(200); await p.click('#groupsBody button.mood:has-text("Laugh")'); await p.click('#groupsBody button.mood:has-text("Chill")'); await p.waitForTimeout(150); }],
  ['05-everyone-happy', async (p) => { await p.click('text=Next Pal'); await p.click('#groupsBody button.mood:has-text("Laugh")'); await p.click('text=Next Pal'); await p.click('#groupsBody button.mood:has-text("Laugh")'); await p.click('#groupsBody button.mood:has-text("Cry")'); await p.click('text=See our pick'); await p.waitForSelector('#groupsBody .pick .title'); await p.waitForTimeout(700); }],
];

const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : { channel: 'chrome' });
for (const dev of DEVICES) {
  const ctx = await browser.newContext({ viewport: { width: dev.w, height: dev.h }, deviceScaleFactor: dev.scale, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://api.themoviedb.org/**', (route) => {
    const u = new URL(route.request().url()); const p = u.pathname; let body = {};
    if (p.includes('/watch/providers/')) body = { results: PROV.map(([id, name, pri]) => ({ provider_id: id, provider_name: name, display_priorities: { US: pri } })) };
    else if (p.includes('/top_rated') || p.includes('/discover/') || p.includes('/search/multi')) { const pg = +(u.searchParams.get('page') || 1); const kind = p.includes('/tv') ? 'tv' : 'movie'; body = { results: Array.from({ length: 20 }, (_, i) => hit(pg * 20 + i)).filter((h) => p.includes('/search') || h.media_type === kind || p.includes('/discover')) }; if (p.includes('/discover/')) body.results = body.results.map((h) => ({ ...h, media_type: kind, title: kind === 'movie' ? (h.title || h.name) : undefined, name: kind === 'tv' ? (h.name || h.title) : undefined })); }
    else if (/\/(movie|tv)\/\d+$/.test(p)) { const id = +p.split('/').pop(); const c = CAT[(id - 100) % CAT.length]; body = { tagline: '', runtime: c[6], episode_run_time: [c[6]], number_of_seasons: c[1] === 'tv' ? 3 : undefined, genres: [{ name: 'Comedy' }, { name: 'Drama' }], external_ids: { imdb_id: 'tt0000000' }, overview: c[4], release_dates: { results: [{ iso_3166_1: 'US', release_dates: [{ certification: c[7] }] }] }, content_ratings: { results: [{ iso_3166_1: 'US', rating: c[7] }] }, 'watch/providers': { results: { US: { link: 'https://www.justwatch.com/us/x', flatrate: [{ provider_id: 8, provider_name: 'Netflix' }, { provider_id: 15, provider_name: 'Hulu' }] } } } }; }
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('https://image.tmdb.org/**', (route) => { const m = route.request().url().match(/\/p(\d+)\.png/); route.fulfill({ status: 200, contentType: 'image/png', body: POSTERS[m ? +m[1] : 0] }); });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.evaluate(() => { [8, 15, 337].forEach((id) => state.services.add(id)); persist('services'); });
  for (const [name, run] of SCENES) {
    await run(page); await page.waitForTimeout(350);
    const file = path.join(OUT, `${dev.name}-${name}.png`);
    await page.screenshot({ path: file, animations: 'disabled' });
    console.log('wrote', path.basename(file));
  }
  if (errors.length) console.log('page errors:', errors);
  await ctx.close();
}
await browser.close();
