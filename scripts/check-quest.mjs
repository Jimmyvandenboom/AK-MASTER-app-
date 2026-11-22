import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium,webkit,devices} from 'playwright';

const captureDirectory = process.env.QUEST_SCREENSHOTS;
async function capture(view, selector, filename) {
 if (!captureDirectory) return;
 await mkdir(captureDirectory, {recursive:true});
 await view.locator(selector).screenshot({path:resolve(captureDirectory,filename), animations:'disabled'});
}

const root=resolve('dist');
const base='/AK-MASTER-app-/';
const files=['quest/index.html','quest/globe.js','quest/globe.css','quest/levelmap.css','quest/catalog.js','quest/game.css','quest/theory.js','quest/collection.js','quest/audio/yes.mp3','quest/audio/no.mp3','quest/v5-lobby.js','quest/v5-lobby.css','quest/v5-terrain.js'];
for(const file of files)assert.ok((await readFile(resolve(root,file))).length>300,'Missing asset '+file);
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(!url.pathname.startsWith(base)){res.writeHead(404).end();return}
  let rel=url.pathname.slice(base.length);if(!rel||rel.endsWith('/'))rel+='index.html';
  const file=resolve(root,rel);
  if(!file.startsWith(root+sep)){res.writeHead(404).end();return}
  try{const content=await readFile(file);res.setHeader('content-type',mime[extname(file)]||'application/octet-stream');res.end(content)}
  catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser, mobileBrowser;
const problems=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 const studentContext=await browser.newContext({viewport:{width:1365,height:900}});
 let page=await studentContext.newPage();
 page.on('pageerror',e=>problems.push(e.message));page.on('dialog',d=>{problems.push('dialog: '+d.message());d.accept()});
 const token='a'.repeat(48);let attempts=[],xp=0,coins=100,purchases=[],profile={};
 const quiz=[
 {id:'n1',chapter:'H7',skill:'begrip',type:'choice',text:'Wat is een delta?',options:['Een vertakte monding','Een droogmakerij','Een gletsjer','Een krib']},
 {id:'h7_open_01',chapter:'H7',skill:'verklaren',type:'open',text:'Leg uit hoe een rivierdelta ontstaat.',options:null},
 {id:'ce-demo',chapter:'H8',type:'open',skill:'bronvaardigheid',text:'Welke rivier zie je?',source:{year:2026,period:1,number:12,points:1,pages:[],url:'https://example.test/examen',correction:'https://example.test/model'}},
 ...['H8','H9'].map((chapter,i)=>({id:chapter+'_test',chapter,skill:'verklaren',type:'open',text:'Leg uit wat debiet is. '+i,options:null}))
 ];
 const handleApi = async route=>{
  const body=JSON.parse(route.request().postData()||'{}');let response;
  if (['me','questions','answer','open-review','buy','powerup','profile'].includes(body.action) && body.token!==token) return route.fulfill({status:401,json:{error:'Ongeldige herstelcode'}});
  switch(body.action){
   case 'join':response={token,student:{id:'test',first_name:'Sam',xp:0,coins:0,avatar:'explorer',active_seconds:0}};break;
   case 'me':response={student:{id:'test',first_name:'Sam',xp,coins,avatar:'explorer',active_seconds:60},attempts:[...attempts].reverse(),purchases:[...purchases],profile};break;
   case 'questions':response={questions:quiz};break;
   case 'buy':
    assert.ok(['compass_hint','pet_dikefox'].includes(body.item));
    purchases.push(body.item);coins-=body.item==='compass_hint'?80:25;response={ok:true};break;
   case 'profile':profile={...profile,...body.patch};response={profile};break;
   case 'powerup':
    assert.equal(body.questionId,'n1');
    assert.ok(purchases.includes('compass_hint'));
    profile={...profile,usedHints:['n1']};
    response={removedIndex:1,profile};break;
   case 'answer':{const ok=body.questionId==='n1'&&body.response==='0';
     attempts.push({student_id:'test',topic:'H7',skill:quiz.find(q=>q.id===body.questionId).skill,response:body.response,question_id:body.questionId,is_correct:body.questionId==='n1'?ok:null,awarded_xp:ok?60:0,created_at:new Date().toISOString()});
     if(ok){xp+=60;coins+=12}
     response={correct:body.questionId==='n1'?ok:null,awarded:ok?60:0,explanation:'De monding is vertakt.',correctOption:0,selfCheck:body.questionId!=='n1',aiReviewAvailable:body.questionId!=='n1'};break;
   }
   case 'open-review':
     assert.equal(body.questionId,'h7_open_01');
     assert.equal(body.response,'Zand en klei blijven achter.');
     response={review:{points:1,maxPoints:2,feedback:'Je noemt afzetting.',nextStep:'Leg uit waarom het water afremt.'}};
     break;
   case 'teacher':
    if (route.request().headers().authorization !== 'Bearer teacher-fixture') return route.fulfill({status:403,json:{error:'Geen docenttoegang'}});
    response={classes:[{id:'a',label:'Testklas A',join_code:'12345678'},{id:'b',label:'Testklas B',join_code:'87654321'}],
     students:[{id:'test',class_id:'a',first_name:'Sam',xp,active_seconds:60,last_seen:new Date().toISOString()}],attempts:[...attempts].reverse()};break;
   case 'heartbeat':response={ok:true};break;
   default:response={error:'Test stub has no action '+body.action};break;
  }
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
 };
 await studentContext.route('**/functions/v1/exam-quest',handleApi);
 await page.goto('http://127.0.0.1:'+server.address().port+base+'quest/',{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:'Welkom, ontdekkingsreiziger!'}).waitFor();
 await page.getByRole('button',{name:'Schakel lichte modus in'}).click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.locator('input[name="name"]').fill('Sam');await page.locator('input[name="code"]').fill('12345678');
 await page.getByRole('button',{name:/Start mijn avontuur/}).click();
 await page.getByRole('heading',{name:/Welkom terug, Sam/}).waitFor();
 await page.getByRole('region',{name:'Jouw groeiende expeditiekamp'}).waitFor();
 assert.equal(await page.locator('.q5-region').count(),3,'New atlas must show three regions');
 assert.equal(await page.locator('.q5-terrain-svg').count(),3,'Isometric terrain diagrams not rendered');
 assert.ok(await page.getByRole('button',{name:/OP AVONTUUR/}).isVisible(),'Primary adventure action missing');
 const globe = page.locator('#quest-globe');
 await globe.scrollIntoViewIfNeeded();
 await page.waitForFunction(() => document.querySelector('#quest-globe').width > 300);
 await capture(page,'.q5-globe-panel','desktop-earth.png');
 await capture(page,'.q5-layout','desktop-camp.png');
 const bounds = await globe.boundingBox();
 const radius = Math.min(bounds.width * .38, bounds.height * .43, 254);
 const rad = angle => angle * Math.PI / 180;
 const lon = rad(5.3 - 40), lat = rad(52.1), tilt = rad(24);
 const x = bounds.width / 2 + radius * Math.cos(lat) * Math.sin(lon);
 const y = bounds.height * .53 - radius * (Math.cos(tilt) * Math.sin(lat) - Math.sin(tilt) * Math.cos(lat) * Math.cos(lon));
 await globe.click({position:{x,y}});
 await page.locator('.quest-map-shell').waitFor();
 await page.locator('.quest-theory summary').click();
 await page.getByRole('heading',{name:'Water in Nederland',exact:true}).waitFor();
 await page.getByRole('heading',{name:'Uitgewerkt voorbeeld'}).waitFor();
 await page.locator('.quest-theory summary').click();
 assert.equal(await page.locator('.zone-switcher button').count(),3);
 await page.getByRole('navigation').getByRole('button',{name:/Shop/}).click();
 await page.locator('.shop-catalog summary').click();
 await page.locator('button[data-action="buy"][data-id="compass_hint"]').click();
 await page.waitForFunction(() => {
  const button=document.querySelector('button[data-action="buy"][data-id="compass_hint"]');
  return button?.textContent.trim()==='In je collectie';
 },{timeout:10000});
 assert.ok(purchases.includes('compass_hint'),'Test server did not persist the shop purchase. '+JSON.stringify(problems));
 await page.getByRole('navigation').getByRole('button',{name:/Wereld/}).click();
 await page.locator('button[data-action="chapter"][data-ch="H7"]').first().click();
 await page.locator('button[data-action="question"][data-id="n1"]').click();
 await page.getByText('Wat is een delta?').waitFor();
 await page.locator('button[data-action="choose"][data-val="1"]').click();
 await page.getByRole('button',{name:/Controleer antwoord/}).click();
 await page.getByText('Nog niet goed — dit leer je ervan').waitFor();
 await page.getByRole('navigation').getByRole('button',{name:/Wereld/}).click();
 await page.getByRole('button',{name:/Kennisboost/}).click();
 await page.getByText('Wat is een delta?').waitFor();
 await page.getByRole('button',{name:'🧭 Gebruik Kompas van inzicht'}).click();
 await page.getByText(/afgevallen met je hint/).waitFor();
 assert.equal(await page.locator('button[data-action="choose"][data-val="1"]').isDisabled(),true);
 await page.locator('button[data-action="choose"][data-val="0"]').click();
 await page.getByRole('button',{name:/Controleer antwoord/}).click();
 await page.getByText(/Goed! \+60 XP/).waitFor();
 const startUrl=page.url();
 await page.getByRole('navigation').getByRole('button',{name:/Shop/}).click();
 await page.locator('.shop-catalog summary').click();
 await page.locator('button[data-action="buy"][data-id="pet_dikefox"]').first().click();
 await page.waitForFunction(() => document.querySelector('button[data-action="buy"][data-id="pet_dikefox"]')?.textContent.trim()==='In je collectie');
 await page.getByRole('navigation').getByRole('button',{name:/Avatar/}).click();
 await page.getByRole('heading',{name:'Avatar Studio'}).waitFor();
 await page.getByRole('button',{name:'Kies als metgezel'}).click();
 await page.locator('.character .pet').waitFor();
 assert.deepEqual(profile.gear,['pet_dikefox'],'Equipped companion should be saved on the learner profile');
 const savedSession=await studentContext.storageState();
 await studentContext.close();
 const resumed=await browser.newContext({storageState:savedSession});
 await resumed.route('**/functions/v1/exam-quest',handleApi);
 page=await resumed.newPage();
 page.on('pageerror',e=>problems.push(e.message));
 await page.goto(startUrl);
 await page.getByRole('heading',{name:/Welkom terug, Sam/}).waitFor();
 assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'1');
 assert.equal(await page.locator('.character .pet').count(),1,'Equipped companion should persist after restart');
 await page.getByRole('button',{name:/Verder oefenen/}).click();
 await page.locator('#openResponse').fill('Zand en klei blijven achter.');
 await page.locator('.quest-theory summary').click();
 assert.equal(await page.locator('#openResponse').inputValue(),'Zand en klei blijven achter.');
 await page.locator('.quest-theory summary').click();
 await page.getByRole('button',{name:/Controleer antwoord/}).click();
 await page.getByRole('button',{name:'Laat AI nakijken'}).click();
 await page.getByText('AI-oefenscore · 1 / 2',{exact:true}).waitFor();
 await page.getByText('Leg uit waarom het water afremt.').waitFor();
 await page.getByRole('button',{name:/Terug naar kaart/}).click();
 await page.locator('button[data-action="zone"][data-zone="1"]').first().click();
 assert.ok(await page.locator('.quest-map-shell').isVisible(),'Stage switching broke');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:/Welkom terug, Sam/}).waitFor();
 assert.equal(await page.locator('.q5-camp').count(),1,'Personal camp missing after reload');
 const progress = page.getByRole('progressbar', {name:'Gesloten kennismissies goed beantwoord'});
 assert.equal(await progress.getAttribute('aria-valuemax'), '1', 'Only the closed question counts towards the mission total');
 assert.equal(await progress.getAttribute('aria-valuenow'), '1', 'Correct answer must survive reload');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light','Theme must survive reload');
 await page.getByRole('button',{name:'Schakel donkere modus in'}).click();
 for (const [button,heading] of [['Shop','Daily Shop'],['Avatar','Avatar Studio']]) {
  await page.getByRole('navigation').getByRole('button',{name:new RegExp(button)}).click();
  await page.getByRole('heading',{name:heading}).waitFor();
 }
 const recovered=await browser.newContext();
 await recovered.route('**/functions/v1/exam-quest',handleApi);
 const recoveryPage=await recovered.newPage();
 await recoveryPage.goto(startUrl);
 recoveryPage.once('dialog',d=>d.accept(token));
 await recoveryPage.getByRole('button',{name:'Gebruik mijn herstelcode'}).click();
 await recoveryPage.getByRole('heading',{name:/Welkom terug, Sam/}).waitFor();
 assert.equal(await recoveryPage.getByRole('progressbar').getAttribute('aria-valuenow'),'1');
 await recoveryPage.getByRole('button',{name:/Examentrainer/}).click();
 await recoveryPage.getByText('2026 · tijdvak 1 · 0/1 gemaakt').click();
 await recoveryPage.getByRole('button',{name:'Vraag 12 · 1 pt'}).click();
 await recoveryPage.getByRole('heading',{name:'Welke rivier zie je?'}).waitFor();
 await recoveryPage.getByRole('button',{name:/Terug naar examentrainer/}).click();
 await recoveryPage.getByRole('heading',{name:'Examentrainer Water'}).waitFor();
 await recovered.close();

 const teacher=await browser.newContext();
 await teacher.route('**/functions/v1/exam-quest',handleApi);
 await teacher.route('**/auth/v1/token?*',route=>route.fulfill({json:{access_token:'teacher-fixture'}}));
 const dashboard=await teacher.newPage();
 dashboard.on('pageerror',e=>problems.push(e.message));
 await dashboard.goto(startUrl);
 await dashboard.getByRole('button',{name:/Docent$/}).click();
 await dashboard.locator('#teacherForm input[name=email]').fill('docent@example.test');
 await dashboard.locator('#teacherForm input[name=password]').fill('fictieve-testwaarde');
 await dashboard.getByRole('button',{name:'Open docentendashboard'}).click();
 const sam=dashboard.getByRole('row').filter({hasText:'Sam'});
 await sam.waitFor();
 assert.deepEqual((await sam.getByRole('cell').allTextContents()).slice(0,6),['Sam','1','0','0','60','1 min']);
 await dashboard.getByText('50%',{exact:true}).waitFor();
 await sam.locator('details summary').click();
 await dashboard.getByText('1 fout · 1 open',{exact:true}).waitFor();
 await dashboard.getByText('H7 · begrip (1)',{exact:true}).waitFor();
 await dashboard.getByText('Sam · H7 · h7_open_01').click();
 await dashboard.getByText('Zand en klei blijven achter.',{exact:true}).waitFor();
 await dashboard.getByLabel('Klas',{exact:true}).selectOption('b');
 assert.equal(await sam.count(),0);
 await dashboard.getByRole('button',{name:/Ververs/}).click();
 await dashboard.getByText('Testklas B · tussentijdse klasresultaten').waitFor();
 await dashboard.getByLabel('Klas',{exact:true}).selectOption('a');
 await sam.waitFor();
 await dashboard.getByRole('button',{name:'Docent uitloggen'}).click();
 await dashboard.locator('#teacherForm').waitFor();
 assert.equal(await dashboard.locator('.teacher-table').count(),0);
 await teacher.close();
 mobileBrowser=process.env.QUEST_MOBILE_WEBKIT === '1' ? await webkit.launch() : browser;
 for (const width of [375, 390, 430]) {
  const phone = devices['iPhone 13'];
  const mobile=await mobileBrowser.newContext({...phone,viewport:{...phone.viewport,width},screen:{...phone.screen,width}});
  const mobilePage=await mobile.newPage();
  mobilePage.on('pageerror', error => problems.push(`${width}px: ${error.message}`));
  await mobilePage.route('**/functions/v1/exam-quest',route=>{
   const body=JSON.parse(route.request().postData());
   if (body.action === 'answer') {
    assert.equal(body.questionId, 'n1');
    assert.equal(body.response, '0');
    return route.fulfill({json:{correct:true,awarded:60,explanation:'De monding is vertakt.',correctOption:0}});
   }
   const result=body.action==='questions'?{questions:quiz}:{student:{id:'mobile',first_name:'Sam',xp:180,coins:0,avatar:'explorer'},attempts:[],purchases:[]};
   return route.fulfill({json:result});
  });
  await mobilePage.addInitScript(recoveryCode=>localStorage.setItem('gfrq_token',recoveryCode),token);
  await mobilePage.goto('http://127.0.0.1:'+server.address().port+base+'quest/');
  await mobilePage.locator('.q5-camp').waitFor();
  assert.equal(await mobilePage.locator('.q5-region').count(),3,'Mobile atlas incomplete');
  assert.equal(await mobilePage.locator('.q5-terrain-svg').count(),3,'Mobile terrain diagrams absent');
  await mobilePage.locator('#quest-globe').scrollIntoViewIfNeeded();
  await mobilePage.waitForFunction(() => {
   const globe = document.querySelector('#quest-globe');
   return globe.getContext('2d').getImageData(globe.width / 2, globe.height / 2, 1, 1).data[3] === 255;
  });
  if (width === 390) {
   await capture(mobilePage,'.q5-globe-panel','mobile-earth.png');
   await capture(mobilePage,'.q5-camp','mobile-camp.png');
  }
  const discovery = mobilePage.locator('.q5-discovery').nth(1);
  await discovery.locator('summary').first().tap();
  await discovery.getByText('Waarom kan ontbossing stroomopwaarts het overstromingsgevaar stroomafwaarts vergroten?').waitFor();
  await discovery.getByText('Bekijk de verklaring').tap();
  assert.ok(await discovery.getByText(/Met minder bos wordt/).isVisible());
  const fits=()=>mobilePage.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth);
  assert.ok(await fits(),`Mobile camp or atlas overflows at ${width}px`);
  await mobilePage.locator('.q5-region[data-ch="H7"]').tap();
  await mobilePage.locator('button[data-action="question"][data-id="n1"]').tap();
  await mobilePage.locator('button[data-action="choose"][data-val="0"]').tap();
  await mobilePage.getByRole('button',{name:/Controleer antwoord/}).tap();
  await mobilePage.getByText(/Goed! \+60 XP/).waitFor();
  assert.ok(await fits(),`Mobile question feedback overflows at ${width}px`);
  await mobilePage.reload({waitUntil:'domcontentloaded'});
  await mobilePage.locator('.q5-camp').waitFor();
  await mobilePage.locator('button[data-action="chapter"][data-ch="H8"]').first().tap();
  await mobilePage.locator('.quest-theory summary').tap();
  await mobilePage.getByRole('heading',{name:'Water in China',exact:true}).waitFor();
  assert.ok(await fits(),`Mobile theory overflows at ${width}px`);
  await mobilePage.getByRole('navigation').getByRole('button',{name:/Shop/}).tap();
  await mobilePage.getByRole('heading',{name:'Daily Shop'}).waitFor();
  assert.equal(await mobilePage.locator('.daily-selection [data-action="buy"]').count(),8);
  assert.ok(await fits(),`Mobile shop overflows at ${width}px`);
  assert.equal(await mobilePage.locator('.rare-badge').count(),3);
  await mobilePage.getByRole('heading',{name:'Pirate Token'}).waitFor();
  await mobilePage.getByRole('navigation').getByRole('button',{name:/Avatar/}).tap();
  assert.equal(await mobilePage.locator('[data-avatar]').count(),15);
  assert.equal(await mobilePage.getByRole('button',{name:'Aantrekken'}).count(),1,'First Pass reward should be equippable');
  assert.ok(await fits(),`Mobile Avatar Studio overflows at ${width}px`);
  assert.equal(await mobilePage.getByRole('navigation').getByRole('button',{name:/Pass/}).count(),0,'Pass postponed for Quest 5');
  await mobile.close();
 }
 assert.deepEqual(problems,[],'JavaScript errors in quest');
 console.log('Quest 5: student join, personal camp, three region atlas, checkpoint, answer, saved session, map acts and mobile smoke tests OK');
}catch(e){console.error(e,problems);process.exitCode=1}
finally{if(mobileBrowser && mobileBrowser!==browser)await mobileBrowser.close();if(browser)await browser.close();await new Promise(r=>server.close(r))}
