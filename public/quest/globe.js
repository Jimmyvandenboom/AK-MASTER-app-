/* GFR EXAM QUEST — interactive hand-drawn orthographic globe, no external 3D dependency */
(function(){
const continents=[
[[-11,36],[-10,44],[-5,49],[0,50],[5,53],[11,55],[17,56],[21,61],[27,70],[39,71],[45,64],[52,60],[58,67],[75,72],[93,74],[116,73],[133,69],[153,65],[174,62],[178,49],[165,44],[152,43],[142,45],[134,39],[128,35],[119,31],[114,22],[110,12],[105,10],[101,4],[97,9],[95,17],[89,22],[82,25],[77,14],[72,9],[70,19],[66,25],[61,24],[58,27],[52,28],[48,29],[44,35],[41,42],[35,42],[29,41],[27,37],[23,36],[18,41],[13,44],[9,41],[3,43],[-4,39],[-11,36]],
[[-17,36],[-9,36],[0,37],[10,36],[17,33],[25,32],[33,30],[34,27],[39,22],[43,12],[51,11],[49,2],[43,-10],[40,-16],[35,-23],[29,-30],[20,-35],[15,-33],[11,-28],[8,-24],[3,-16],[-2,-5],[-9,4],[-16,18],[-17,28],[-17,36]],
[[34,30],[40,31],[48,28],[54,25],[57,19],[53,16],[46,12],[43,14],[42,18],[37,21],[34,26],[34,30]],
[[-168,66],[-152,70],[-139,69],[-130,57],[-124,51],[-121,43],[-117,36],[-113,31],[-109,31],[-106,25],[-99,18],[-91,16],[-87,20],[-82,25],[-80,32],[-73,41],[-66,45],[-60,51],[-61,57],[-75,60],[-80,66],[-97,72],[-113,71],[-133,72],[-150,70],[-168,66]],
[[-81,11],[-75,10],[-71,11],[-66,10],[-61,11],[-53,4],[-49,-1],[-46,-6],[-39,-12],[-36,-15],[-38,-21],[-43,-23],[-46,-28],[-50,-30],[-52,-33],[-58,-39],[-65,-45],[-68,-53],[-72,-53],[-74,-42],[-76,-33],[-79,-21],[-81,-7],[-80,2],[-81,11]],
[[113,-12],[118,-15],[123,-16],[129,-13],[137,-14],[143,-12],[152,-23],[154,-29],[150,-34],[143,-39],[136,-35],[129,-32],[122,-29],[115,-24],[113,-12]],
[[-53,59],[-49,60],[-41,64],[-40,70],[-44,77],[-51,83],[-58,82],[-61,74],[-57,66],[-53,59]],
[[43,-12],[50,-13],[50,-18],[47,-24],[44,-26],[43,-18],[43,-12]],
[[130,30],[136,35],[140,41],[144,43],[146,39],[141,33],[136,31],[130,30]],
[[6,50],[8,54],[10,55],[13,53],[13,50],[9,48],[6,50]]
];
const cities=[{id:'H7',name:'NEDERLAND',lon:5.3,lat:52.1,emoji:'🌊',color:'#6cffb4'},{id:'H8',name:'CHINA',lon:104,lat:35,emoji:'🐉',color:'#ffce84'},{id:'H9',name:'MIDDEN-OOSTEN',lon:45,lat:28.5,emoji:'🏜️',color:'#f5ac79'}];
const DEG=Math.PI/180;const rad=d=>d*DEG;
function mountQuestGlobe(onTravel,avatar='🧑‍🚀'){
 const canvas=document.getElementById('quest-globe');if(!canvas)return()=>{};
 const cx=canvas.getContext('2d'),parent=canvas.parentElement;let w=0,h=0,center=40,target=40,tilt=24,angle=0,last=performance.now(),drag=false,dragging=false,startX=0,dragCenter=0,hover=null,travel=null,disposed=false,frameId=null,pointers=[];
 function resize(){const rect=canvas.getBoundingClientRect();w=Math.max(200,rect.width);h=Math.max(250,rect.height);const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);cx.setTransform(dpr,0,0,dpr,0,0)}
 function project(lon,lat){
 const dx=rad(((lon-center+540)%360)-180),la=rad(lat),ph=rad(tilt),co=Math.cos(la),depth=Math.sin(ph)*Math.sin(la)+Math.cos(ph)*co*Math.cos(dx);
 const radius=Math.min(w*.38,h*.43,254);
 return {x:w*.50+radius*co*Math.sin(dx),y:h*.53-radius*(Math.cos(ph)*Math.sin(la)-Math.sin(ph)*co*Math.cos(dx)),z:depth,r:radius};
 }
 function fillPoly(poly,light,dark){
 let visible=0;cx.beginPath();let active=false;
 for(let k=0;k<poly.length;k++){
   let a=poly[k],b=poly[(k+1)%poly.length];
   let dl=b[0]-a[0];if(dl>180)dl-=360;if(dl< -180)dl+=360;
   const steps=Math.max(1,Math.ceil(Math.abs(dl)/3+Math.abs(b[1]-a[1])/3));
   for(let n=0;n<=steps;n++){
    let p=project(a[0]+dl*n/steps,a[1]+(b[1]-a[1])*n/steps);
    if(p.z>=0){if(!active){cx.moveTo(p.x,p.y);active=true}else cx.lineTo(p.x,p.y);visible++;} else if(active){active=false}
   }
 }
 if(visible>2){cx.closePath();cx.fillStyle=light;cx.fill();cx.lineWidth=1.1;cx.strokeStyle=dark;cx.stroke()}
 }
 function grid(radius){
 cx.strokeStyle='rgba(120,231,245,.12)';cx.lineWidth=.8;
 for(let lat=-60;lat<=60;lat+=30){cx.beginPath();let active=false;for(let lon=-180;lon<=180;lon+=3){const p=project(lon,lat);if(p.z>=0){if(active)cx.lineTo(p.x,p.y);else cx.moveTo(p.x,p.y);active=true}else active=false;}cx.stroke()}
 for(let lon=-180;lon<180;lon+=30){cx.beginPath();let active=false;for(let lat=-89;lat<=89;lat+=3){const p=project(lon,lat);if(p.z>=0){if(active)cx.lineTo(p.x,p.y);else cx.moveTo(p.x,p.y);active=true}else active=false;}cx.stroke()}
 }
 function atmosphere(x,y,r){
 let aura=cx.createRadialGradient(x,y,r*.77,x,y,r*1.48);aura.addColorStop(0,'rgba(54,219,242,0)');aura.addColorStop(.55,'rgba(60,194,241,.19)');aura.addColorStop(1,'rgba(49,191,240,0)');
 cx.fillStyle=aura;cx.beginPath();cx.arc(x,y,r*1.48,0,Math.PI*2);cx.fill();
 const sea=cx.createRadialGradient(x-r*.35,y-r*.5,r*.12,x+r*.18,y+r*.15,r*1.25);sea.addColorStop(0,'#45d7d2');sea.addColorStop(.28,'#137caa');sea.addColorStop(.75,'#09335c');sea.addColorStop(1,'#06182e');
 cx.fillStyle=sea;cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.fill();
 }
 function feature(lon,lat,text,scale=1){let p=project(lon,lat);if(p.z<.05)return;cx.save();cx.globalAlpha=Math.min(.9,p.z+.1);cx.font=(Math.max(15,23*p.z)*scale)+'px serif';cx.fillText(text,p.x-12,p.y+10);cx.restore()}
 function draw(t){
 const dt=Math.min(36,t-last);last=t;angle+=dt*.00024;center+=(target-center)*Math.min(.10,dt*.012);
 if(Math.abs(target-center)<.02)target=center;
 cx.clearRect(0,0,w,h);
 const p0=project(center,tilt),r=p0.r,x=w*.5,y=h*.53;
 const specs=[[w*.1,h*.18,2.5],[w*.84,h*.10,1.6],[w*.14,h*.76,1.8],[w*.78,h*.79,1.2],[w*.92,h*.42,2.7],[w*.43,h*.08,1.5]];
 specs.forEach(([sx,sy,s])=>{cx.globalAlpha=.5+.45*Math.sin(angle*2+sx);cx.fillStyle='#fff';cx.beginPath();cx.arc(sx,sy,s,0,Math.PI*2);cx.fill()});cx.globalAlpha=1;
 atmosphere(x,y,r);
 cx.save();cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.clip();
 grid(r);
 for(let i=0;i<continents.length;i++){fillPoly(continents[i],i===0?'#72d69e':i===1?'#c0c87d':i===2?'#d2bd74':i===3?'#7cc69b':'#79bf95','#215b57')}
 // Isometric luminous atmosphere details
 cx.fillStyle='rgba(229,255,249,.11)';for(let j=0;j<8;j++){const lon=-145+j*49+Math.sin(angle+j)*5,lat=-40+(j%5)*22,p=project(lon,lat);if(p.z>.1){cx.beginPath();cx.ellipse(p.x,p.y,12+18*p.z,3+3*p.z,rad(25),0,Math.PI*2);cx.fill()}}
 const shade=cx.createLinearGradient(x-r,y-r,x+r,y+r);shade.addColorStop(0,'rgba(255,255,255,.16)');shade.addColorStop(.55,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,10,24,.55)');cx.fillStyle=shade;cx.fillRect(x-r,y-r,2*r,2*r);
 cx.restore();
 cx.strokeStyle='rgba(147,239,250,.65)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.stroke();
 feature(7,57,'🌊',.95);feature(108,30,'🏔️',1.2);feature(40,22,'☀️',1.3);
 pointers=[];
 for(const city of cities){
   const p=project(city.lon,city.lat);if(p.z<.07)continue;
   const active=travel?.id===city.id;
   const pulse=1+.13*Math.sin(angle*8+cities.indexOf(city)*2);
   cx.fillStyle=city.color+'24';cx.beginPath();cx.arc(p.x,p.y,25*pulse,0,Math.PI*2);cx.fill();
   cx.strokeStyle=city.color;cx.lineWidth=2;cx.beginPath();cx.arc(p.x,p.y,12*pulse,0,Math.PI*2);cx.stroke();
   cx.fillStyle='#fff';cx.beginPath();cx.arc(p.x,p.y,5.5,0,Math.PI*2);cx.fill();
   const labelWidth=city.name.length*8+26,above=p.y-39;
   cx.fillStyle='rgba(5,20,34,.86)';cx.strokeStyle=city.color+'8c';cx.lineWidth=1;
   cx.beginPath();cx.roundRect(p.x-labelWidth/2,above-8,labelWidth,25,9);cx.fill();cx.stroke();
   cx.font='800 12px sans-serif';cx.textAlign='center';cx.fillStyle='#f9feff';cx.fillText(city.name,p.x,above+9);cx.textAlign='left';
   pointers.push({city,p});
 }
 if(travel){
   const p=project(travel.city.lon,travel.city.lat);
   if(p.z>0){cx.font='38px serif';cx.fillText(avatar,p.x+11,p.y-10)}
   if(t-travel.started>1150){let chosen=travel.id;travel=null;onTravel(chosen);return}
 }
 frameId=requestAnimationFrame(draw);
 }
 function clickTravel(id){if(travel)return;const city=cities.find(x=>x.id===id);if(!city)return;
  const diff=((city.lon-center+540)%360)-180;target=center+diff*.84;travel={id,city,started:performance.now()};
  parent.querySelectorAll('[data-globe-ch]').forEach(x=>x.classList.toggle('selected',x.dataset.globeCh===id));
 }
 function onMouseDown(e){drag=true;dragging=false;startX=e.clientX;dragCenter=center;canvas.setPointerCapture?.(e.pointerId)}
 function onMouseMove(e){if(!drag)return;const delta=e.clientX-startX;if(Math.abs(delta)>5)dragging=true;target=dragCenter-delta*.45}
 function onMouseUp(e){if(drag&&!dragging){const rect=canvas.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;let clicked=pointers.find(o=>Math.hypot(px-o.p.x,py-o.p.y)<32);if(clicked)clickTravel(clicked.city.id)}drag=false}
 canvas.addEventListener('pointerdown',onMouseDown);canvas.addEventListener('pointermove',onMouseMove);canvas.addEventListener('pointerup',onMouseUp);
 const controls=parent.querySelectorAll('[data-globe-ch]');const events=[];
 controls.forEach(el=>{let fn=()=>clickTravel(el.dataset.globeCh);el.addEventListener('click',fn);events.push([el,fn])});
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();frameId=requestAnimationFrame(draw);
 return ()=>{disposed=true;cancelAnimationFrame(frameId);observer.disconnect();canvas.removeEventListener('pointerdown',onMouseDown);canvas.removeEventListener('pointermove',onMouseMove);canvas.removeEventListener('pointerup',onMouseUp);events.forEach(([el,fn])=>el.removeEventListener('click',fn))};
}
window.mountQuestGlobe=mountQuestGlobe;
})();