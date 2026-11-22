import test from 'node:test';
import assert from 'node:assert/strict';
import {quest5Home} from '../public/quest/v5-lobby.js';
import {renderQuestTerrain} from '../public/quest/v5-terrain.js';
const chapters={
 H7:{title:'Delta Defender',sub:'Water in Nederland',emoji:'🏡'},
 H8:{title:'Dragon River',sub:'Water in China',emoji:'🐉'},
 H9:{title:'Desert Survival',sub:'Water in het Midden-Oosten',emoji:'🏜️'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const player=x=>({student:{first_name:'Sam',xp:x,coins:50,active_seconds:120},attempts:[],profile:{},chapter:'H7'});
test('Quest 5 renders accessible clickable geographical regions without changing player state',()=>{
 const original=player(350);const before=JSON.stringify(original);
 const html=quest5Home(original,chapters,()=>'<span>🧑‍🚀</span>',()=>1,esc);
 assert.match(html,/aria-label="Kies je geografische wereld"/);
 for(const chapter of Object.keys(chapters))assert.ok(html.includes('data-ch="'+chapter+'"'));
 assert.ok(html.includes('data-action="store"'));
 assert.ok(html.includes('data-action="studio-v3"'));
 assert.equal(JSON.stringify(original),before);
});
test('Quest 5 camp scales with XP and keeps progress data read-only',()=>{
 assert.match(quest5Home(player(0),chapters,()=>'',()=>0,esc),/BASECAMP/);
 assert.match(quest5Home(player(700),chapters,()=>'',()=>0,esc),/RIVER STATION/);
 assert.match(quest5Home(player(2500),chapters,()=>'',()=>0,esc),/EXPEDITION HQ/);
});
test('Quest 5 escapes student supplied names',()=>{
 const state=player(1);state.student.first_name='<img src=x onerror=alert(1)>';
 const html=quest5Home(state,chapters,()=>'',()=>0,esc);
 assert.ok(!html.includes('<img src=x'));
 assert.match(html,/&lt;img src=x/);
});

test('geographic terrains render self-contained isometric SVGs',()=>{
  const map={
    H7:['Nederlands rivierenlandschap','#d2bd8a'],
    H8:['Chinees rivierenlandschap','#225c78'],
    H9:['Droog landschap met oase','#6ec6b5']
  };
  for(const [id,[label,color]] of Object.entries(map)){
    const svg=renderQuestTerrain(id);
    assert.match(svg,/<svg[^>]+role="img"/);
    assert.ok(svg.includes(label),id+' accessible label');
    assert.ok(svg.includes(color),id+' geographical visual');
    assert.ok(!svg.includes('<image'),id+' should not rely on network');
  }
});
test('terrain descriptions are escaped',()=>{
  const svg=renderQuestTerrain('H7','<img src=x onerror=alert(1)>');
  assert.ok(!svg.includes('<img'));
  assert.ok(svg.includes('&lt;img'));
});
test('personal atlas includes three vector geographical miniatures',()=>{
 const markup=quest5Home(player(0),chapters,()=>'',()=>0,esc);
 assert.equal((markup.match(/class="q5-terrain-svg"/g)||[]).length,3);
});
