/* GFR EXAM QUEST — interactive hand-drawn orthographic globe, no external 3D dependency */
(function(){
// One-degree land mask derived from Natural Earth 1:110m land (public domain).
// Each row lists the start and end of land intervals from west to east.
const landRows = [
 [],
 [],
 [],
 [],
 [],
 [],
 [141,153],
 [94,96,97,118,133,158],
 [89,114,118,157,159,168],
 [84,91,97,110,113,164,199,201,202,205,227,231,272,278],
 [85,106,114,161,191,199,201,205,273,280],
 [67,70,75,80,81,84,87,91,92,105,107,160,192,199,280,285],
 [61,64,68,69,85,86,92,102,111,161,194,198,202,203,283,285],
 [58,62,70,72,79,82,84,89,91,101,110,159,245,249,281,292],
 [63,70,71,74,79,82,84,86,87,93,94,99,121,160,237,243,270,294,317,325],
 [66,68,90,96,97,98,123,160,236,239,266,290],
 [56,64,73,75,79,83,84,89,91,94,96,98,99,102,124,159,234,237,261,293,294,299,303,307,320,323],
 [55,61,62,71,72,75,78,83,84,86,90,99,102,103,125,158,232,236,249,253,261,309,319,325],
 [0,1,56,60,61,75,80,83,84,87,90,106,107,108,125,158,232,236,248,252,253,255,256,309,312,313,315,317,318,331],
 [19,29,66,77,84,88,91,111,125,154,156,157,204,211,247,253,254,340],
 [17,41,45,60,63,77,80,84,85,89,94,98,103,113,126,128,129,156,198,213,240,244,247,253,254,348,350,358],
 [0,1,13,66,72,75,82,83,86,92,94,99,105,112,128,152,196,218,232,234,237,247,249,254,255,360],
 [0,4,16,92,93,99,103,105,107,116,126,147,194,221,224,226,228,253,255,360],
 [0,5,6,9,15,16,18,97,106,118,127,145,193,213,215,221,224,252,253,360],
 [1,8,12,93,94,95,106,112,115,117,127,140,157,166,192,202,205,215,220,360],
 [6,7,15,16,19,92,94,98,102,105,106,114,128,139,158,165,191,201,204,215,217,358],
 [8,10,19,89,94,96,98,99,108,115,129,139,189,200,202,359],
 [15,88,96,98,102,103,110,113,130,137,186,198,201,357,358,359],
 [14,86,102,108,131,137,185,197,201,337,339,342,344,353],
 [15,32,34,86,102,110,134,137,185,198,202,335,342,351],
 [18,26,28,30,40,85,102,111,114,116,185,198,205,207,208,329,331,335,340,343],
 [23,26,42,87,102,112,113,117,175,177,186,189,191,197,204,321,339,342],
 [22,24,25,28,46,87,103,118,174,178,190,191,192,197,202,203,204,320,337,343],
 [20,22,48,92,103,118,174,177,188,191,192,196,201,318,336,343],
 [17,19,48,94,102,120,174,178,188,190,191,194,201,316,335,342],
 [15,16,49,98,100,123,171,174,176,179,189,190,196,199,200,317,336,341],
 [47,48,51,98,101,124,171,174,177,180,187,321,322,323,336,340],
 [52,98,101,124,171,173,176,182,184,321,322,323,336,338],
 [52,100,101,123,124,125,176,181,184,321,322,323,337,338],
 [52,53,54,120,122,124,175,177,181,321,322,324],
 [53,55,56,113,116,118,122,124,125,126,178,320,322,324],
 [57,111,112,115,121,127,175,320,322,323],
 [56,57,58,115,124,125,126,127,177,319,322,323],
 [56,115,116,117,119,120,178,211,212,215,218,230,233,318,322,324],
 [56,119,179,193,194,210,213,215,217,228,233,317],
 [56,112,114,116,179,192,195,209,218,227,230,316,322,323],
 [56,110,172,175,178,187,190,194,196,208,220,228,231,315,321,325],
 [56,109,171,183,191,194,198,208,222,228,233,311,320,324],
 [56,109,171,182,192,196,199,208,212,217,221,229,234,310],
 [56,106,171,181,188,190,195,198,199,204,206,207,209,230,233,301,302,309,320,322],
 [56,106,171,180,188,190,196,197,200,203,206,229,233,299,302,303,305,308,320,322],
 [57,105,171,180,201,204,207,229,234,298,305,308,320,321],
 [57,104,171,179,193,195,201,203,207,230,234,299,300,302,306,309,318,321],
 [58,104,174,175,181,191,202,203,209,211,212,214,216,301,306,309,316,321],
 [59,104,174,175,178,191,216,300,307,309,313,321],
 [60,103,173,190,216,300,306,307,311,314,315,317],
 [62,101,172,191,215,301,310,314],
 [63,100,171,195,201,203,215,301,310,312],
 [63,65,66,99,170,196,200,207,210,211,215,302,310,311],
 [64,65,67,99,170,199,200,301],
 [65,66,68,85,89,91,97,99,170,212,213,228,230,302],
 [66,67,68,84,97,99,169,214,215,228,231,302],
 [65,68,69,83,97,100,167,213,216,229,233,301],
 [67,68,71,83,98,100,101,102,166,214,216,230,237,300],
 [68,69,71,83,99,100,165,215,217,230,231,232,239,299],
 [68,69,72,82,165,215,217,231,234,237,247,299,301,302],
 [73,82,164,216,219,239,248,297,300,301],
 [74,82,96,97,98,101,164,216,219,240,250,271,272,295,300,301],
 [75,83,101,103,163,217,219,239,250,267,272,288,289,291],
 [74,83,90,93,103,105,164,217,220,239,253,267,273,287],
 [24,25,75,84,89,93,107,110,164,217,221,238,253,265,274,286,289,291],
 [76,85,87,92,106,112,113,114,164,218,221,237,253,264,274,286,289,290],
 [79,92,164,219,222,235,253,263,274,287,300,302],
 [81,92,163,219,223,233,253,262,274,288,300,302],
 [87,96,163,220,223,232,254,260,278,289,300,302],
 [88,97,163,221,223,229,254,260,278,289,300,302],
 [90,96,163,222,223,227,255,260,278,289,302,304],
 [93,97,163,223,255,260,278,280,282,289,304,305],
 [94,96,107,108,164,223,229,231,256,260,279,280,283,289,302,303,305,306],
 [94,97,104,108,109,114,116,117,118,119,165,224,225,231,256,260,278,279,284,287,299,300],
 [96,98,100,101,104,108,109,119,166,231,256,259,260,261,278,279,285,286,298,299,305,306],
 [96,100,102,120,167,230,257,258,260,261,278,280,303,304,305,306],
 [99,100,102,121,167,230,260,262,279,280,302,303,304,307],
 [103,122,169,229,260,262,280,282,296,298,304,305],
 [102,127,170,180,185,229,280,283,296,299],
 [103,128,172,173,186,228,276,278,281,283,294,299],
 [103,129,190,227,277,279,281,283,293,297],
 [101,129,190,226,278,280,282,284,291,298],
 [101,130,189,225,279,282,283,284,289,298,308,309],
 [100,130,189,223,279,283,289,298,300,304,308,309],
 [100,131,189,222,280,284,289,298,312,313],
 [99,135,189,222,281,284,290,297,299,302,311,314],
 [99,135,136,137,190,221,281,286,290,297,299,302,313,314,316,320],
 [100,141,191,220,282,286,294,296,299,300,301,302,306,307,310,311,313,323],
 [99,142,191,219,283,286,302,303,316,325],
 [99,145,192,219,284,286,302,303,314,315,318,326,328,329,330,332],
 [99,145,192,219,286,289,314,315,318,328,335,336],
 [100,145,193,219,287,293,318,327,338,339],
 [101,145,193,219,294,295,297,299,300,301,302,303,306,307,320,323,326,328],
 [101,144,193,220,299,300,304,305,327,329,340,342],
 [102,144,193,220,330,331],
 [103,143,194,220,312,313,322,323],
 [103,142,193,221,229,230,311,317,322,323],
 [104,141,193,221,229,230,310,316,322,324],
 [104,141,192,221,228,230,306,308,309,316,322,325],
 [105,141,192,220,227,230,304,316,322,325],
 [107,141,192,220,224,230,304,318,321,326,347,348,359,360],
 [109,141,192,218,224,229,302,320,321,326,358,359],
 [110,140,192,216,224,229,302,326],
 [110,140,193,215,224,229,301,327],
 [110,140,193,215,224,229,298,329,344,345],
 [110,139,194,215,223,228,295,329,345,346],
 [110,138,194,216,223,228,294,330],
 [110,135,194,215,224,228,294,331],
 [109,133,195,215,224,227,293,332],
 [109,132,195,213,225,226,294,333],
 [109,131,195,213,293,333],
 [109,131,195,213,294,333],
 [109,131,196,212,295,334],
 [109,130,197,211,295,333],
 [108,130,197,211,295,333],
 [108,129,198,210,296,333],
 [109,128,198,209,296,306,314,332],
 [108,127,198,207,295,304,315,317,318,331],
 [108,122,123,126,199,201,296,299,315,316,317,331],
 [107,123,318,330,353,354],
 [107,123,320,330,354,355],
 [106,123,320,330,355,356],
 [107,121,323,324,325,327,355,358],
 [107,118,354,357],
 [106,118,355,357],
 [106,115,325,328,352,354,355,356],
 [106,117,325,328,351,354],
 [107,115,326,327,350,353],
 [106,115,348,351],
 [105,113,347,351],
 [105,113,348,350],
 [105,114],
 [104,113],
 [104,112,249,250],
 [105,111],
 [105,111,119,122],
 [106,110],
 [106,112],
 [108,114],
 [111,112],
 [],
 [],
 [],
 [],
 [],
 [],
 [],
 [121,123],
 [118,119],
 [116,117,315,316],
 [113,116,231,237,281,285,291,295,310,316],
 [112,115,228,240,262,326],
 [112,115,223,249,259,330],
 [108,110,112,117,212,218,220,250,257,338],
 [108,111,112,118,186,190,192,202,204,248,253,341],
 [105,112,113,119,169,171,173,248,252,351],
 [113,119,167,351],
 [53,55,57,59,77,82,85,95,99,102,107,119,164,349],
 [44,54,55,58,60,67,68,69,79,117,164,346],
 [34,115,161,344],
 [34,110,152,344],
 [22,105,148,344],
 [16,19,23,102,131,136,144,347],
 [18,21,31,103,129,137,150,341],
 [33,107,114,120,126,134,150,340],
 [25,115,139,341],
 [27,121,125,344],
 [26,349],
 [0,5,6,13,33,358],
 [0,31,32,360],
 [0,360],
 [0,360],
 [0,360],
 [0,360]
];
function makeLandLayer(tilt) {
 const size = 320;
 const layer = document.createElement('canvas');
 layer.width = layer.height = size;
 const context = layer.getContext('2d');
 const pixels = context.createImageData(size, size);
 const longitude = new Int16Array(size * size);
 const latitude = new Int16Array(size * size).fill(-1);
 const land = new Uint8Array(180 * 360);
 landRows.forEach((row, y) => {
  for (let i = 0; i < row.length; i += 2) land.fill(1, y * 360 + row[i], y * 360 + row[i + 1]);
 });
 const sinTilt = Math.sin(rad(tilt)), cosTilt = Math.cos(rad(tilt));
 for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
  const east = (2 * x + 1) / size - 1, north = 1 - (2 * y + 1) / size;
  const depthSquared = 1 - east * east - north * north;
  if (depthSquared < 0) continue;
  const depth = Math.sqrt(depthSquared), index = y * size + x;
  const lat = Math.asin(north * cosTilt + depth * sinTilt) / DEG;
  latitude[index] = Math.min(179, Math.floor(90 - lat));
  longitude[index] = Math.floor(Math.atan2(east, depth * cosTilt - north * sinTilt) / DEG + 180);
  const shade = .72 + .28 * depth;
  const dryBelt = Math.abs(Math.abs(lat) - 25) < 9;
  pixels.data[index * 4] = (dryBelt ? 210 : 120) * shade;
  pixels.data[index * 4 + 1] = (dryBelt ? 189 : 204) * shade;
  pixels.data[index * 4 + 2] = (dryBelt ? 126 : 153) * shade;
 }
 let lastMeridian;
 return (ctx, center, x, y, radius) => {
  const meridian = ((Math.round(center) % 360) + 360) % 360;
  if (meridian !== lastMeridian) {
   for (let i = 0; i < latitude.length; i++) {
    if (latitude[i] >= 0) pixels.data[4 * i + 3] = 255 * land[latitude[i] * 360 + (longitude[i] + meridian) % 360];
   }
   context.putImageData(pixels, 0, 0);
   lastMeridian = meridian;
  }
  ctx.drawImage(layer, x - radius, y - radius, 2 * radius, 2 * radius);
 };
}

const cities=[{id:'H7',name:'NEDERLAND',lon:5.3,lat:52.1,emoji:'🌊',color:'#6cffb4'},{id:'H8',name:'CHINA',lon:104,lat:35,emoji:'🐉',color:'#ffce84'},{id:'H9',name:'MIDDEN-OOSTEN',lon:45,lat:28.5,emoji:'🏜️',color:'#f5ac79'}];
const DEG=Math.PI/180;const rad=d=>d*DEG;
function mountQuestGlobe(onTravel,avatar='🧑‍🚀'){
 const canvas=document.getElementById('quest-globe');if(!canvas)return()=>{};
 const cx=canvas.getContext('2d'),parent=canvas.parentElement;let w=0,h=0,center=40,target=40,tilt=24,angle=0,last=performance.now(),drag=false,dragging=false,startX=0,dragCenter=0,hover=null,travel=null,disposed=false,frameId=null,pointers=[];
 let inViewport = true;
 function queueDraw() {
  if (!disposed && !document.hidden && (inViewport || travel) && frameId === null) frameId = requestAnimationFrame(draw);
 }
 function resize(){const rect=canvas.getBoundingClientRect();w=Math.max(200,rect.width);h=Math.max(250,rect.height);const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);cx.setTransform(dpr,0,0,dpr,0,0);queueDraw()}
 function project(lon,lat){
 const dx=rad(((lon-center+540)%360)-180),la=rad(lat),ph=rad(tilt),co=Math.cos(la),depth=Math.sin(ph)*Math.sin(la)+Math.cos(ph)*co*Math.cos(dx);
 const radius=Math.min(w*.38,h*.43,254);
 return {x:w*.50+radius*co*Math.sin(dx),y:h*.53-radius*(Math.cos(ph)*Math.sin(la)-Math.sin(ph)*co*Math.cos(dx)),z:depth,r:radius};
 }
 const drawLand = makeLandLayer(tilt);
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
 frameId=null;
 if(disposed || document.hidden || (!inViewport && !travel))return;
 const dt=Math.min(36,t-last);last=t;if(!motion.matches)angle+=dt*.00024;center=motion.matches ? target : center+(target-center)*Math.min(.10,dt*.012);
 if(Math.abs(target-center)<.02)target=center;
 cx.clearRect(0,0,w,h);
 const p0=project(center,tilt),r=p0.r,x=w*.5,y=h*.53;
 const specs=[[w*.1,h*.18,2.5],[w*.84,h*.10,1.6],[w*.14,h*.76,1.8],[w*.78,h*.79,1.2],[w*.92,h*.42,2.7],[w*.43,h*.08,1.5]];
 specs.forEach(([sx,sy,s])=>{cx.globalAlpha=.5+.45*Math.sin(angle*2+sx);cx.fillStyle='#fff';cx.beginPath();cx.arc(sx,sy,s,0,Math.PI*2);cx.fill()});cx.globalAlpha=1;
 atmosphere(x,y,r);
 cx.save();cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.clip();
 drawLand(cx, center, x, y, r);
 grid(r);
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
   pointers.push({city,p,above,labelWidth});
 }
 if(travel){
   const p=project(travel.city.lon,travel.city.lat);
   if(p.z>0){cx.font='38px serif';cx.fillText(avatar,p.x+11,p.y-10)}
   if(t-travel.started>1150){let chosen=travel.id;travel=null;onTravel(chosen);return}
 }
 if (!motion.matches || travel) queueDraw();
 }
 function clickTravel(id){if(travel)return;if(motion.matches){onTravel(id);return;}const city=cities.find(x=>x.id===id);if(!city)return;
  const diff=((city.lon-center+540)%360)-180;target=center+diff*.84;travel={id,city,started:performance.now()};
  parent.querySelectorAll('[data-globe-ch]').forEach(x=>x.classList.toggle('selected',x.dataset.globeCh===id));
 }
 function cancelDrag(){drag=false;dragging=false}
 function onMouseDown(e){drag=true;dragging=false;startX=e.clientX;dragCenter=center;canvas.setPointerCapture?.(e.pointerId)}
 function onMouseMove(e){if(!drag)return;const delta=e.clientX-startX;if(Math.abs(delta)>5)dragging=true;target=dragCenter-delta*.45;queueDraw()}
 function onMouseUp(e){if(drag&&!dragging){const rect=canvas.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;let clicked=pointers.find(o=>Math.hypot(px-o.p.x,py-o.p.y)<20 || (Math.abs(px-o.p.x)<o.labelWidth/2 && py>=o.above-8 && py<=o.above+17));if(clicked)clickTravel(clicked.city.id)}drag=false}
 canvas.addEventListener('pointerdown',onMouseDown);canvas.addEventListener('pointermove',onMouseMove);canvas.addEventListener('pointerup',onMouseUp);
 canvas.addEventListener('pointercancel',cancelDrag);
 const controls=parent.querySelectorAll('[data-globe-ch]');const events=[];
 controls.forEach(el=>{let fn=()=>clickTravel(el.dataset.globeCh);el.addEventListener('click',fn);events.push([el,fn])});
 const visibility = new IntersectionObserver(([entry]) => {
  inViewport = entry.isIntersecting;
  if (inViewport) queueDraw();
 });
 visibility.observe(canvas);
 document.addEventListener('visibilitychange',queueDraw);
 motion.addEventListener('change',queueDraw);
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 return ()=>{disposed=true;visibility.disconnect();document.removeEventListener('visibilitychange',queueDraw);motion.removeEventListener('change',queueDraw);canvas.removeEventListener('pointercancel',cancelDrag);cancelAnimationFrame(frameId);observer.disconnect();canvas.removeEventListener('pointerdown',onMouseDown);canvas.removeEventListener('pointermove',onMouseMove);canvas.removeEventListener('pointerup',onMouseUp);events.forEach(([el,fn])=>el.removeEventListener('click',fn))};
}
window.mountQuestGlobe=mountQuestGlobe;
})();