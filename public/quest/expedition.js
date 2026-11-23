const regions = {
  H7: {name:'De Nederlandse delta', land:['#a6c76f','#83b26a','#cad488'], water:'#579ab2', stops:[
    ['De polder','Een gemaal tilt polderwater naar de hoger gelegen boezem.',2,6,'n4'],
    ['De rivierdijk','Bij hoogwater vertraagt de stroming buiten de rivierbedding. Grof zand blijft dicht bij de rivier liggen.',6,4,'n2'],
    ['De riviermond','Waar de rivier de zee bereikt, kan sediment zich ophopen en de rivier zich vertakken.',9,7,'n1']]},
  H8: {name:'Door het Chinese rivierdal', land:['#748e66','#a5b484','#567e70'],water:'#53aead',stops:[
    ['Bovenloop','Het grote verval geeft de rivier kracht om het dal uit te slijten.',2,2,'c6'],
    ['Stuwmeer','Achter de dam wordt water gebufferd. Verderop verandert de afvoer.',6,5,'c7'],
    ['Rijstterrassen','Terrassen houden irrigatiewater vast op steile hellingen.',9,7,'c8']]},
  H9: {name:'De route door de woestijn',land:['#dfb875','#d19b61','#ebc88b'],water:'#3eaaaf',stops:[
    ['De oase','Grondwater komt hier dicht bij het oppervlak. Daardoor kunnen palmen groeien.',3,5,'m1'],
    ['Het irrigatiekanaal','Een kanaal brengt water naar de akkers. Onderweg kan water verdampen.',6,6,'m3'],
    ['Het kuststation','Aan zee kan ontzilting drinkwater opleveren. Dat kost energie.',9,3,'m4']]}
};
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
    if(n>=0){const [cx,cy]=point(x+.5,y+.5,h);markers+='<g transform="translate('+cx+' '+cy+')"><path d="M0 0v-19" stroke="#fff" stroke-width="3"/><circle cy="-23" r="13" fill="#192f41" stroke="#ffda86" stroke-width="2"/><text y="-18" text-anchor="middle" fill="white" font-size="15">'+(n+1)+'</text></g>'}
  }
  return '<svg viewBox="25 -14 490 310" role="img" aria-label="'+r.name+' met drie genummerde veldposten">'+tiles+markers+'</svg>';
}
export function expedition(state, esc){
  const r=regions[state.chapter]||regions.H7;
  const questions=state.questions.filter(q=>q.chapter===state.chapter && q.options);
  const completed=new Set(state.solved||[]);
  const board=state.expeditionBoard;
  const members=board?.members||[];
  const team=members.reduce((sum,m)=>sum+Number(m.xp||0),0);
  const target=(Math.floor(team/500)+1)*500;
  return '<section class="card pad"><div class="eyebrow">Social Adventure</div><h1>Waterexpeditie</h1><p>Kies een regio en onderzoek de drie veldposten.</p><div class="row">'+Object.entries(regions).map(([id,v])=>'<button class="btn secondary" aria-pressed="'+(id===state.chapter)+'" data-action="exp-region" data-ch="'+id+'">'+v.name+'</button>').join('')+'</div><h2 style="margin-top:24px">'+r.name+'</h2><div style="max-width:740px;margin:auto">'+landscape(state.chapter)+'</div><div class="row">'+r.stops.map(([name,detail,x,y,qid],i)=>{
    const question=questions.find(q=>q.id===qid)||questions[i];return '<article class="card pad" style="flex:1 1 190px"><h3>'+(i+1)+'. '+name+'</h3><p>'+detail+'</p>'+(question?'<button class="btn secondary" data-action="question" data-id="'+esc(question.id)+'">'+(completed.has(question.id)?'✓ Nogmaals oefenen':'Start veldmissie')+'</button>':'')+'</article>';
  }).join('')+'</div><section style="margin:32px 0"><h2>Jouw expeditieteam</h2><p>Doe mee met je klas onder een toegewezen dierennaam. Deelnemers zien elkaars dierennaam en XP. Je kunt op elk moment uitstappen.</p>'+
    (board?.joined?'<p><b>'+team+' van '+target+' team-XP</b> · nog '+(target-team)+' XP tot de volgende mijlpaal</p><progress value="'+(team%500)+'" max="500" aria-label="Voortgang naar de volgende mijlpaal"></progress><ol>'+members.map(m=>'<li>'+esc(m.alias)+(m.mine?' (jij)':'')+' · '+Number(m.xp)+' XP</li>').join('')+'</ol><div class="row"><button class="btn secondary" data-action="exp-refresh">Team verversen</button><button class="btn secondary" data-action="exp-leave">Team verlaten</button></div>':board?'<button class="btn" data-action="exp-join">Meedoen met mijn klas</button>':'<button class="btn secondary" data-action="exp-refresh">Mijn team ophalen</button>')+'</section><button class="btn secondary" data-action="home">Terug naar kamp</button></section>';
}