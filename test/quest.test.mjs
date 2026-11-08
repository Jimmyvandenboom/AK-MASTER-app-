import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const file = await readFile('public/quest/index.html', 'utf8');
const inline = file.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
test('Water Wars is a stand-alone, valid browser entrypoint', () => {
  assert.ok(file.includes('<html lang="nl">'));
  assert.ok(file.includes('GFR EXAM QUEST'));
  assert.ok(file.includes('Mission Control'));
  assert.ok(file.includes('23 november 2026'));
  assert.ok(file.includes('H7') && file.includes('H8') && file.includes('H9'));
  assert.ok(inline);
  const code = inline.replace(/import\s*\{createClient\}\s*from\s*['"][^'"]+['"];?/, '');
  new Script(code, { filename: 'quest-inline.js' });
});
test('No secret Supabase key is included in the client', () => {
  assert.ok(!file.includes('service_role'));
  assert.ok(!file.includes('sb_secret_'));
  assert.ok(file.includes('sb_publishable_'));
});
test('Client does not contain answer bank or score authority', () => {
  assert.ok(file.includes("functions/v1/exam-quest"));
  assert.ok(file.includes("call('answer'"));
  assert.ok(file.includes("call('buy'"));
  assert.ok(!file.includes('correctValues'));
});
