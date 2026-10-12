import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';

// Serve only dist, without Vite's SPA fallback: this matches Pages asset behavior.
const base = '/AK-MASTER-app-/';
const root = resolve('dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
assert.ok(!html.includes('src/main.jsx'), 'Pages must receive built HTML, not source HTML');
const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
assert.ok(assets.some(path => path.endsWith('.js')) && assets.some(path => path.endsWith('.css')));
for (const asset of assets) {
  assert.ok(asset.startsWith(`${base}assets/`), `Wrong Pages asset path: ${asset}`);
  await readFile(resolve(root, asset.slice(base.length)));
}
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = resolve(root, pathname.slice(base.length) || 'index.html');
  if (!pathname.startsWith(base) || !file.startsWith(`${root}/`)) { res.writeHead(404).end(); return; }
  try {
    const content = await readFile(file);
    res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2' }[extname(file)] || 'application/octet-stream');
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const url = `http://127.0.0.1:${server.address().port}${base}`;
  await page.goto(url);
  await page.getByLabel('Hoe mogen we je noemen?').fill('Sam');
  await page.getByRole('button', { name: 'Start mijn avontuur' }).click();
  await page.getByRole('heading', { name: 'Hoi Sam, jouw wereld wordt groter.' }).waitFor();
  assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).margin), '0px', 'CSS must load');
  await page.getByRole('button', { name: 'Oefenen', exact: true }).click();
  await page.getByRole('button', { name: 'Start de korte quiz' }).click();
  for (const [index, answer] of [1, 2, 0, 3, 1].entries()) {
    await page.locator('.answer').nth(answer).click();
    await page.getByRole('button', { name: index === 4 ? 'Bekijk je resultaat' : 'Volgende vraag' }).click();
  }
  await page.getByText('5 / 5 goed').waitFor();
  await page.getByRole('button', { name: 'Opnieuw oefenen' }).click();
  await page.locator('.answer').nth(0).waitFor();
  await page.getByRole('button', { name: 'Leren', exact: true }).click();
  await page.getByRole('heading', { name: 'Waar blijft de regen?' }).waitFor();
  await page.getByRole('button', { name: 'Profiel', exact: true }).click();
  await page.getByRole('heading', { name: 'Jouw route, Sam.' }).waitFor();
  assert.equal(page.url(), url, 'Navigation must not create unsupported Pages routes');
  await page.reload();
  await page.getByRole('heading', { name: 'Hoi Sam, jouw wereld wordt groter.' }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ak-master-v1')).xp), 100);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, [], 'No browser errors or failed asset requests');
  // Exercise the new trainer on a phone, including actual source images and every answer format.
  await page.getByRole('button', { name: 'Oefenen', exact: true }).click();
  await page.getByRole('button', { name: 'Open de Water-examentrainer' }).click();
  await page.getByRole('heading', { name: /Niet alleen weten/ }).waitFor();
  assert.equal(await page.locator('.water-theme').count(), 3);
  await page.getByRole('button', { name: 'Begin met 5 vragen' }).click();
  await page.getByRole('heading', { name: 'Ook duinzand kan verzadigd raken' }).waitFor();
  await page.locator('.water-options input').nth(0).check();
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  await page.getByText('Hier kun je van leren', { exact: true }).waitFor();
  assert.ok((await page.locator('.explanation-block').textContent()).includes('vol water'));
  await page.getByRole('button', { name: 'Bronnen', exact: false }).click();
  await page.getByRole('button', { name: 'Vergroot bron', exact: false }).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Zoom 2×' }).click();
  assert.ok(await page.locator('.source-dialog img').evaluate(img => img.complete && img.naturalWidth > 1000));
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Bewaar vraag', exact: false }).click();
  await page.getByRole('button', { name: 'Uitleg', exact: true }).click();
  await page.getByRole('button', { name: 'Opnieuw proberen', exact: false }).click();
  await page.locator('.water-options input').nth(1).check();
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  await page.getByRole('button', { name: 'Volgende vraag', exact: false }).click();
  await page.locator('.water-options input').nth(2).check();
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  await page.getByRole('button', { name: 'Volgende vraag', exact: false }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByLabel('Jouw antwoord', { exact: false }).fill(i === 0 ? 'Dit weet ik nog niet.' : 'Een wadi slaat regenwater op en laat het infiltreren.');
    await page.getByRole('button', { name: 'Vergelijk mijn antwoord' }).click();
    assert.ok(await page.getByRole('button', { name: 'Volgende vraag', exact: false }).isDisabled());
    await page.getByRole('button', { name: i === 0 ? /0 \/ 1.*Nog niet/ : /1 \/ 1.*Alles klopt/ }).click();
    await page.getByRole('button', { name: 'Volgende vraag', exact: false }).click();
  }
  await page.getByRole('heading', { name: 'Dat was een duik in Water.' }).waitFor();
  const waterProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('ak-master-water-v1')));
  assert.equal(Object.keys(waterProgress.records).length, 5);
  assert.equal(waterProgress.records['2026-2-18'].attempts, 2);
  assert.equal(waterProgress.records['2025-2-28'].method, 'self');
  assert.ok(waterProgress.bookmarks.includes('2026-2-18'));
  await page.getByRole('button', { name: 'Terug naar de trainer' }).click();
  await page.getByLabel('Mijn route', { exact: true }).selectOption('saved');
  assert.equal(await page.locator('.question-list-item').count(), 1);
  await page.getByLabel('Mijn route', { exact: true }).selectOption('all');
  await page.getByLabel('Zoek een onderwerp').fill('ongeldigzoekwoordzz');
  await page.getByRole('heading', { name: 'Hier staan nog geen vragen.' }).waitFor();
  await page.getByRole('button', { name: 'Toon alle vragen' }).click();
  async function openWater(id, heading) {
    await page.goto(`${url}#water/${id}`);
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), id);
  }
  await openWater('2026-1-21', 'Wateroverlast in Twente');
  await page.locator('.binary-options input').nth(0).check();
  await page.locator('.binary-options input').nth(3).check();
  await page.locator('.binary-options input').nth(5).check();
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  assert.ok((await page.locator('.feedback-banner').textContent()).includes('1 / 2'));
  assert.ok((await page.locator('.answer-comparison').textContent()).includes('Verstening vermindert'));
  await openWater('2026-1-20', 'Voor- en nadelen indelen');
  for (const [key, value] of Object.entries({ a: '1', b: '4', c: '3', d: '2' })) await page.getByLabel(`Plek ${key}`, { exact: true }).fill(value);
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  assert.ok((await page.locator('.feedback-banner').textContent()).includes('1 / 2'));
  await openWater('2026-1-29', 'Irrigatie in zes stappen');
  for (const [i, value] of ['f','b','c','d','e','a'].entries()) await page.getByLabel(`Volgorde plek ${i+1}`).selectOption(value);
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  assert.ok((await page.locator('.feedback-banner').textContent()).includes('1 / 2'));
  await openWater('2018-2-21', 'Begrippen van polderbeheer');
  for (const value of ['1','2','4','7']) await page.locator('.multi-fields label').filter({ hasText: value }).locator('input').check();
  await page.getByRole('button', { name: /^Nakijken/ }).click();
  assert.ok((await page.locator('.feedback-banner').textContent()).includes('1 / 2'));
  await openWater('2021-2-15', 'Waar werkt uiterwaardverlaging door?');
  assert.equal(await page.locator('.water-options input').count(), 5);
  assert.ok(!(await page.locator('.water-options input').evaluateAll(inputs => inputs.map(i=>i.value))).includes('D'));
  await openWater('2019-1-18', 'Een fout in het originele examen');
  assert.equal(await page.getByRole('button', { name: /^Nakijken/ }).count(), 0);
  assert.ok(!(await page.evaluate(() => JSON.parse(localStorage.getItem('ak-master-water-v1')).records))['2019-1-18']);
  await openWater('2026-1-22', 'Eén maatregel voor nat én droog');
  await page.getByLabel('Jouw antwoord', { exact: false }).fill('Een wadi voor de regen.');
  await page.reload();
  await page.getByRole('heading', { name: 'Eén maatregel voor nat én droog' }).waitFor();
  assert.equal(await page.getByLabel('Jouw antwoord', { exact: false }).inputValue(), 'Een wadi voor de regen.');
  assert.deepEqual(errors, []);
  // Restricted storage must not cause a blank screen either.
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } }); });
  await page.reload();
  await page.getByLabel('Hoe mogen we je noemen?').waitFor();
  await page.getByRole('alert').waitFor();
  assert.deepEqual(errors, []);
  console.log('Pages smoke passed: dist assets, React, CSS, quiz, trainer formats, feedback, source zoom, corrections, storage, navigation, reload and mobile.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
