import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {examTrainer} from '../public/quest/exam-trainer.js';
import {items,dailyItems} from '../public/quest/catalog.js';

const source=JSON.parse(await readFile('src/water/questions.json','utf8'));
const imported=JSON.parse(await readFile('supabase/functions/exam-quest/ce.json','utf8'));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('Quest serves the complete existing water exam bank with answer keys and source links',async()=>{
  assert.equal(imported.length,source.length);
  assert.deepEqual(imported.map(row=>row[0]).sort(),source.map(row=>row.id).sort());
  for(const q of source){
    const row=imported.find(candidate=>candidate[0]===q.id);
    assert.ok(row, q.id+' imported');
    assert.equal(row[7].year,q.year);
    assert.equal(row[7].period,q.period);
    assert.equal(row[7].number,q.number);
    assert.equal(row[7].url,q.sourceUrl);
    assert.equal(row[7].correction,q.correctionUrl);
    assert.ok(row[7].pages.length>0,q.id+' has a source page');
    for(const page of row[7].pages){
      assert.ok(!page.src.startsWith('water/'),q.id+' uses the player image path');
      assert.ok(page.src.endsWith('.webp'),q.id+' source image');
    }
    if(q.kind==='choice'){
      assert.ok(Array.isArray(row[4])&&row[4].length>1,q.id+' choices');
      assert.equal(row[4][row[5]],q.options.find(option=>option.value===q.correct).label,q.id+' answer key');
    }else{
      assert.equal(row[4],null,q.id+' is answered as self-check, not auto-scored');
      assert.equal(row[5],null);
    }
  }
  assert.deepEqual([...new Set(imported.map(row=>row[7].year))],[2018,2019,2021,2022,2023,2024,2025,2026]);
  for(const src of new Set(imported.flatMap(row=>row[7].pages.map(page=>page.src))))await readFile('public/water/'+src);
});
test('exam trainer groups every imported question by year and timevak',()=>{
  const playerQuestions=imported.map(row=>({id:row[0],chapter:row[1],skill:row[2],text:row[3],options:row[4],type:row[4]?'choice':'open',source:row[7]}));
  const html=examTrainer(playerQuestions,[],esc);
  assert.match(html,/2018 · tijdvak 1/);
  assert.match(html,/2026 · tijdvak 2/);
  assert.equal((html.match(/data-action="exam-question"/g)||[]).length,source.length);
  assert.match(html,/Archiefexamens 2017/);
  assert.match(html,/2017%20I_opgaven\.pdf/);
  assert.match(html,/2017%20II_correctievoorschrift\.pdf/);
  assert.match(html,/nog niet per vraag in de interactieve oefenbank opgenomen/);
  assert.match(html,/Vraag 32 · 1 pt/);
});
test('long CE checkpoint lists have page controls and are limited to eight map nodes',async()=>{
  const html=await readFile('public/quest/index.html','utf8');
  assert.match(html,/ceQuestions\.slice\(state\.examPage\*8,\(state\.examPage\+1\)\*8\)/);
  assert.match(html,/data-action="ce-page"/);
  assert.match(html,/examPageCount/);
});

test('Daily shop stays fresh, offers eight distinct deals and contains at least forty items',()=>{
  assert.ok(Object.keys(items).length>=40);
  const today=dailyItems(new Date('2026-11-22T12:00:00+01:00'));
  assert.equal(today.length,8);
  assert.equal(new Set(today).size,8);
  assert.equal(Object.keys(items).filter(id=>items[id].slot==='pet').length,3);
  assert.equal(items.compass_hint.slot,'powerup');
});
