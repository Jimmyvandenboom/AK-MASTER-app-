const regions = {
  H7: {name:'De Nederlandse delta', land:['#a6c76f','#83b26a','#cad488'], water:'#579ab2', stops:[
    ['Gemaal van de Haarlemmermeer','Je staat bij een gemaal. Het water in de polder staat lager dan het water achter de ringdijk. Voorspel waar het water heen moet.',2,6,'n4'],
    ['Waal bij Nijmegen','Na hoogwater vind je zand vlak bij de Waal en klei verderop. Verklaar het verschil.',6,4,'n2'],
    ['Rijn-Maasdelta','Volg het water richting Noordzee. Hoe herken je op de kaart dat je door een delta reist?',9,7,'n1']]},
  H8: {name:'Door het Chinese rivierdal', land:['#748e66','#a5b484','#567e70'],water:'#53aead',stops:[
    ['Bovenloop van de Jangtse','Volg de Jangtse vanaf het Tibetaans Hoogland. Vergelijk het hoogteverschil hier met dat in de benedenloop.',2,2,'c6'],
    ['Drieklovendam','Boven de dam ligt een lang stuwmeer. Bedenk hoe de dambeheerder dit water kan gebruiken.',6,5,'c7'],
    ['Akkers langs de Jangtse','Vergelijk het water en slib boven en beneden de dam. Wat merkt een boer stroomafwaarts?',9,7,'c8']]},
  H9: {name:'De route door de woestijn',land:['#dfb875','#d19b61','#ebc88b'],water:'#3eaaaf',stops:[
    ['Grondwaterput in Saudi-Arabië','De pomp haalt grondwater omhoog dat duizenden jaren geleden in de bodem is gezakt. Onderzoek deze voorraad.',3,5,'m1'],
    ['Dadelpalmen bij Al-Ahsa','Je helpt een dadelteler. Kies een manier om water bij de wortels te krijgen op een hete dag.',6,6,'m3'],
    ['Kust van de Perzische Golf','Er is volop zeewater bij het kuststation. Wat moet er gebeuren voordat de stad het kan drinken?',9,3,'m4']]}
};
const landmarks = {H7:['🏠','🌉','⚓'], H8:['🏔️','⚙️','🌾'], H9:['💧','🌴','⚓']};

function partnerChallenge(members,total){
  const contributors=members.filter(member=>Number(member.xp)>0).length;
  const achieved=contributors>=2 && total>=100;
  return '<h3>Duomissie · open het veldkamp</h3><p>Twee teamleden met elk minstens 1 XP en samen minstens 100 XP openen het veldkamp. Jullie eerder verdiende XP tellen mee.</p><p><strong>'+
    (achieved?'⛺ Veldkamp geopend!':'Veldkamp in opbouw')+'</strong> · '+Math.min(contributors,2)+'/2 bijdragers · '+Math.min(total,100)+'/100 XP</p>';
}

function point(x,y,h){return [270+(x-y)*21,45+(x+y)*10-h]}
function face(points,color){return '<polygon points="'+points.map(p=>p.join(',')).join(' ')+'" fill="'+color+'" stroke="#263b401c" stroke-width=".6"/>'}
function landscape(id){
  const r=regions[id];let tiles='',markers='';
  for(let y=0;y<11;y++)for(let x=0;x<11;x++){
    const river=Math.abs(y-(5+Math.round(2*Math.sin(x*.65))))<1;
    const wet=id==='H9' ? (x-3)**2+(y-5)**2<4 || (y===6 && x>3) : river;
    const ridge=Math.max(0,Math.abs(y-5)-1);
    const h=wet?1:id==='H8'?5+ridge*(7+5*Math.sin(x*.9)):id==='H9'?5+8*(1+Math.sin(x*.9+y*.6)):4+(river?1:2);
    const a=point(x,y,h),b=point(x+1,y,h),c=point(x+1,y+1,h),d=point(x,y+1,h);
    tiles+=face([d,c,point(x+1,y+1,-7),point(x,y+1,-7)],id==='H9'?'#ad7950':'#526c50')+face([b,c,point(x+1,y+1,-7),point(x+1,y,-7)],id==='H9'?'#86644b':'#354e4a')+face([a,b,c,d],wet?r.water:r.land[(x*7+y*5)%3]);
    if(wet && (x+y)%2===0)tiles+='<path d="M'+a[0]+' '+(a[1]+8)+'l9 2 7-2" fill="none" stroke="#c6f4f0"/>';
    if(!wet && (x*5+y*3)%9===0){const [tx,ty]=point(x+.5,y+.5,h);tiles+='<g transform="translate('+tx+' '+ty+')">'+(id==='H9'?'🌴':id==='H8'?'🌲':'🌳')+'</g>'}
    const n=r.stops.findIndex(s=>s[2]===x && s[3]===y);
    if(n>=0){const [cx,cy]=point(x+.5,y+.5,h);markers+='<a href="#veldpost-'+id+'-'+(n+1)+'" aria-label="Veldpost '+(n+1)+': '+r.stops[n][0]+'"><g transform="translate('+cx+' '+cy+')"><text x="12" y="0" font-size="21">'+landmarks[id][n]+'</text><path d="M0 0v-19" stroke="#fff" stroke-width="3"/><circle cy="-23" r="13" fill="#192f41" stroke="#ffda86" stroke-width="2"/><text y="-18" text-anchor="middle" fill="white" font-size="15">'+(n+1)+'</text></g></a>'}
  }
  return '<svg viewBox="25 -14 490 310" role="group" aria-label="'+r.name+' met drie genummerde veldposten">'+tiles+markers+'</svg>';
}
export function expedition(state, esc){
  const r=regions[state.chapter]||regions.H7;
  const questions=state.questions.filter(q=>q.chapter===state.chapter && q.options);
  const completed=new Set(state.solved||[]);
  const board=state.expeditionBoard;
  const members=board?.members||[];
  const team=members.reduce((sum,m)=>sum+Number(m.xp||0),0);
  const target=(Math.floor(team/500)+1)*500;
  return '<section class="card pad"><div class="eyebrow">Social Adventure</div><h1>Waterexpeditie</h1><p>Kies een regio en onderzoek de drie veldposten.</p><div class="row">'+Object.entries(regions).map(([id,v])=>'<button class="btn secondary" aria-pressed="'+(id===state.chapter)+'" data-action="exp-region" data-ch="'+id+'">'+v.name+'</button>').join('')+'</div><h2 style="margin-top:24px">'+r.name+'</h2><p>'+r.stops.filter(stop=>completed.has(stop[4])).length+' van 3 veldposten afgerond · kies een nummer op de kaart.</p><div style="max-width:740px;margin:auto">'+landscape(state.chapter)+'</div><div class="row">'+r.stops.map(([name,detail,x,y,qid],i)=>{
    const question=questions.find(q=>q.id===qid);return '<article tabindex="-1" id="veldpost-'+state.chapter+'-'+(i+1)+'" class="card pad" style="flex:1 1 190px"><h3>'+(i+1)+'. '+name+'</h3><p>'+detail+'</p>'+(question?'<button class="btn secondary" data-action="question" data-id="'+esc(question.id)+'">'+(completed.has(question.id)?'✓ Nogmaals oefenen':'Start veldmissie')+'</button>':'')+'</article>';
  }).join('')+'</div><section style="margin:32px 0"><h2>Jouw expeditieteam</h2><p>Je kunt alle veldposten alleen spelen. Als je meedoet met je klas, krijg je een dierennaam. Deelnemers zien elkaars dierennaam en XP. Je kunt op elk moment uitstappen.</p>'+
    (board?.joined?partnerChallenge(members,team)+'<p><b>'+team+' van '+target+' team-XP</b> · nog '+(target-team)+' XP tot de volgende mijlpaal</p><progress value="'+(team%500)+'" max="500" aria-label="Voortgang naar de volgende mijlpaal"></progress><ol>'+members.map(m=>'<li>'+esc(m.alias)+(m.mine?' (jij)':'')+' · '+Number(m.xp)+' XP</li>').join('')+'</ol><div class="row"><button class="btn secondary" data-action="exp-refresh">Team verversen</button><button class="btn secondary" data-action="exp-leave">Team verlaten</button></div>':board?'<button class="btn" data-action="exp-join">Meedoen met mijn klas</button>':'<button class="btn secondary" data-action="exp-refresh">Mijn team ophalen</button>')+'</section><button class="btn secondary" data-action="home">Terug naar kamp</button></section>';
}