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
    res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[extname(file)] || 'application/octet-stream');
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
  // Restricted storage must not cause a blank screen either.
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } }); });
  await page.reload();
  await page.getByLabel('Hoe mogen we je noemen?').waitFor();
  await page.getByRole('alert').waitFor();
  assert.deepEqual(errors, []);
  console.log('Pages smoke passed: dist assets, React, CSS, quiz, retry, storage, navigation, reload and mobile.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
