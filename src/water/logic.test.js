import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { grade, canSubmit, readWaterProgress, recordResult, getStats, selectSession, matches, WATER_STORAGE_KEY, themes } from './logic.js';
const questions = JSON.parse(readFileSync(new URL('./questions.json', import.meta.url)));
const pageReferences = JSON.parse(readFileSync(new URL('../../research/water/question-pages.json', import.meta.url)));
const find = id => questions.find(q => q.id === id);
test('alle 245 vragen hebben een unieke bron, sleutel en eigen toelichting', () => {
  assert.equal(questions.length, 245); assert.equal(new Set(questions.map(q => q.id)).size, 245);
  assert.equal(questions.reduce((n,q) => n + q.maxPoints, 0), 316);
  for (const q of questions) {
    assert.ok(themes.some(t => t.id === q.theme)); assert.ok(q.explanation.length > 70); assert.ok(q.pitfall.length > 40);
    assert.equal(q.questionPage,pageReferences[q.id],q.id); assert.ok(q.sourcePages.some(page => page.page===q.questionPage),q.id);
    assert.ok(q.prompt.length > 20); assert.ok(q.sourceUrl.startsWith('https://www.examenblad.nl/'));
    for (const source of q.sourcePages) assert.ok(existsSync(fileURLToPath(new URL(`../../public/${source.src}`,import.meta.url))), source.src);
    if (q.kind === 'choice') { assert.ok(q.options.length >= 2); assert.ok(q.options.some(o => o.value === q.correct)); }
    if (q.kind === 'statements') assert.equal(q.statementExplanations.length, Object.keys(q.expected).length);
  }
});
test('alle gesloten sleutels geven volle punten, verkeerde antwoorden niet', () => {
  for (const q of questions) {
    let correct, wrong;
    if (q.kind === 'choice') { correct=q.correct; wrong=q.options.find(o=>o.value!==q.correct).value; }
    else if (['statements','shorts'].includes(q.kind)) { correct=q.expected; wrong=Object.fromEntries(Object.keys(q.expected).map(k=>[k,'fout'])); }
    else if (q.kind === 'sequence') { correct=q.sequence; wrong=Array(q.sequence.length).fill('x'); }
    else if (q.kind === 'multi') { correct=q.correctValues; wrong=['4','6','7','2']; }
    else continue;
    assert.ok(canSubmit(q,correct),q.id); assert.equal(grade(q,correct).points,q.maxPoints,q.id);
    if (q.kind!=='multi') assert.equal(grade(q,wrong).points,0,q.id);
  }
});
test('gedeeltelijke punten volgen de juiste drempels', () => {
  assert.equal(grade(find('2026-1-21'),{'1':'juist','2':'onjuist','3':'onjuist'}).points,1);
  assert.equal(grade(find('2018-2-20'),{'1':'onjuist','2':'onjuist'}).points,0);
  assert.equal(grade(find('2026-1-20'),{'a':'1','b':'4','c':'3','d':'2'}).points,1);
  assert.equal(grade(find('2019-2-24'),{'1':'politiek','2':'milieu','3':'cultureel','4':'fout','5':'fout'}).points,1);
  assert.equal(grade(find('2018-2-21'),['1','2','4','7']).points,1);
});
test('open tekst wordt niet blind automatisch goed of fout gerekend', () => {
  assert.equal(grade(find('2026-1-22'),'wadi'),null);
  assert.equal(grade(find('2026-1-22'),'geen wadi'),null);
  assert.ok(!canSubmit(find('2026-1-22'),'  '));
});
test('officiële correcties gelden ook bij herhaling', () => {
  const cancelled=find('2019-1-18'); assert.equal(cancelled.kind,'excluded'); assert.equal(grade(cancelled,{}),null);
  assert.ok(!find('2021-2-15').options.some(o=>o.value==='D'));
  assert.equal(grade(find('2026-1-29'),['f','b','c','d','e','a']).points,1);
  assert.equal(grade(find('2026-1-29'),['a','e','c','b','d','f']).points,0);
  assert.ok(find('2026-1-29').officialAnswer.includes('letter'));
});
test('herhaling telt niet dubbel en zelfbeoordeling blijft apart', () => {
  let p=readWaterProgress({getItem:()=>null},questions);
  const q=find('2026-2-18'); p=recordResult(p,q,'A',grade(q,'A')); p=recordResult(p,q,'B',grade(q,'B'));
  p=recordResult(p,find('2026-1-22'),'Een wadi',{points:1,method:'self'});
  const stats=getStats(questions,p.records); assert.deepEqual(stats,{total:244,reviewed:2,retry:0,automatic:1,self:1});
  assert.equal(p.records[q.id].attempts,2);
  assert.deepEqual(readWaterProgress({getItem:()=>JSON.stringify(p)},questions),p);
  assert.ok(!selectSession(questions,p.records,245).includes('2019-1-18'));
});
test('beschadigde, ontbrekende en kwaadaardig gevormde opslag crasht niet', () => {
  assert.equal(readWaterProgress({getItem:()=>'{oops'},questions).lastQuestion,null);
  assert.equal(readWaterProgress({getItem:()=>{throw Error('blocked')}},questions).lastQuestion,null);
  const p=readWaterProgress({getItem:()=>JSON.stringify({records:{'bad':{points:5},'2026-2-18':{points:99}},bookmarks:['bad','2026-2-18','2026-2-18'],draft:{id:'2026-1-22',response:{bad:1}}})},questions);
  assert.deepEqual(p.records,{}); assert.deepEqual(p.bookmarks,['2026-2-18']); assert.equal(p.draft.response,'');
  assert.ok(matches('  NIET DUURZAAM ','niet-duurzaam')); assert.ok(!matches('niet juist','juist'));
});

 test('geografische routes volgen de vraag én bron en behouden opgeslagen antwoorden', () => {
  assert.deepEqual(themes.map(t => t.id), ['nederland', 'china', 'midden-oosten']);
  assert.deepEqual(Object.fromEntries(themes.map(t => [t.id, questions.filter(q => q.theme === t.id).length])), { nederland: 109, china: 46, 'midden-oosten': 90 });
  for (const [id, region] of Object.entries({ '2018-1-24': 'china', '2021-1-27': 'midden-oosten', '2023-2-22': 'nederland', '2024-1-24': 'china', '2025-2-25': 'midden-oosten', '2026-2-24': 'nederland', '2026-2-32': 'midden-oosten' })) assert.equal(find(id).theme, region, id);
  const oldProgress = { records: { '2018-1-24': { points: 1, method: 'self', attempts: 2, response: 'Duurzame energie' } }, bookmarks: ['2018-1-24'] };
  const restored = readWaterProgress({ getItem: () => JSON.stringify(oldProgress) }, questions);
  assert.equal(restored.records['2018-1-24'].attempts, 2);
  assert.deepEqual(restored.bookmarks, ['2018-1-24']);
});
