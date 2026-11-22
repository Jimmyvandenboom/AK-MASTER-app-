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
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 const page=await browser.newPage({viewport:{width:1365,height:900}});
 const problems=[];page.on('pageerror',e=>problems.push(e.message));page.on('dialog',d=>d.accept());
 const token='a'.repeat(48);let attempts=[],xp=0,coins=0;
 const quiz=[
 {id:'n1',chapter:'H7',skill:'begrip',type:'choice',text:'Wat is een delta?',options:['Een vertakte monding','Een droogmakerij','Een gletsjer','Een krib']},
 {id:'h7_open_01',chapter:'H7',skill:'verklaren',type:'open',text:'Leg uit hoe een rivierdelta ontstaat.',options:null},
 ...['H8','H9'].map((chapter,i)=>({id:chapter+'_test',chapter,skill:'verklaren',type:'open',text:'Leg uit wat debiet is. '+i,options:null}))
 ];
 await page.route('**/functions/v1/exam-quest', async route=>{
  const body=JSON.parse(route.request().postData()||'{}');let response;
  switch(body.action){
   case 'join':response={token,student:{id:'test',first_name:'Sam',xp:0,coins:0,avatar:'explorer',active_seconds:0}};break;
   case 'me':response={student:{id:'test',first_name:'Sam',xp,coins,avatar:'explorer',active_seconds:60},attempts:[...attempts].reverse(),purchases:[]};break;
   case 'questions':response={questions:quiz};break;
   case 'answer':{const ok=body.questionId==='n1'&&body.response==='0';
     attempts.push({question_id:body.questionId,is_correct:body.questionId==='n1'?ok:null,awarded_xp:ok?60:0,created_at:new Date().toISOString()});
     if(ok){xp+=60;coins+=12}
     response={correct:body.questionId==='n1'?ok:null,awarded:ok?60:0,explanation:'De monding is vertakt.',correctOption:0,selfCheck:body.questionId!=='n1',aiReviewAvailable:body.questionId!=='n1'};break;
   }
   case 'open-review':
     assert.equal(body.questionId,'h7_open_01');
     assert.equal(body.response,'Zand en klei blijven achter.');
     response={review:{points:1,maxPoints:2,feedback:'Je noemt afzetting.',nextStep:'Leg uit waarom het water afremt.'}};
     break;
   case 'heartbeat':response={ok:true};break;
   default:response={error:'Test stub has no action '+body.action};break;
  }
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
 });
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
 await page.locator('button[data-action="question"][data-id="n1"]').click();
 await page.getByText('Wat is een delta?').waitFor();
 await page.locator('button[data-action="choose"][data-val="0"]').click();
 await page.getByRole('button',{name:/Controleer antwoord/}).click();
 await page.getByText(/Goed! \+60 XP/).waitFor();
 await page.getByRole('button',{name:/Volgende missie/}).click();
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
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light','Theme must survive reload');
 await page.getByRole('button',{name:'Schakel donkere modus in'}).click();
 for (const [button,heading] of [['Shop','Daily Shop'],['Avatar','Avatar Studio']]) {
  await page.getByRole('navigation').getByRole('button',{name:new RegExp(button)}).click();
  await page.getByRole('heading',{name:heading}).waitFor();
 }
 mobileBrowser=process.env.QUEST_MOBILE_WEBKIT === '1' ? await webkit.launch() : browser;
 const mobile=await mobileBrowser.newContext({...devices['iPhone 13']});
 const mobilePage=await mobile.newPage();
 await mobilePage.route('**/functions/v1/exam-quest',route=>{
  const body=JSON.parse(route.request().postData());
  const result=body.action==='questions'?{questions:quiz}:{student:{id:'mobile',first_name:'Sam',xp:180,coins:0,avatar:'explorer'},attempts:[],purchases:[]};
  return route.fulfill({json:result});
 });
 await mobilePage.addInitScript(recoveryCode=>localStorage.setItem('gfrq_token',recoveryCode),token);
 await mobilePage.goto('http://127.0.0.1:'+server.address().port+base+'quest/');
 await mobilePage.locator('.q5-camp').waitFor();
 assert.equal(await mobilePage.locator('.q5-region').count(),3,'Mobile atlas incomplete');
 assert.equal(await mobilePage.locator('.q5-terrain-svg').count(),3,'Mobile terrain diagrams absent');
 await capture(mobilePage,'.q5-globe-panel','mobile-earth.png');
 await capture(mobilePage,'.q5-camp','mobile-camp.png');
 const fits=()=>mobilePage.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth);
 assert.ok(await fits(),'Mobile camp or atlas overflows');
 await mobilePage.locator('button[data-action="chapter"][data-ch="H8"]').first().tap();
 await mobilePage.locator('.quest-theory summary').tap();
 await mobilePage.getByRole('heading',{name:'Water in China',exact:true}).waitFor();
 assert.ok(await fits(),'Mobile theory overflows');
 await mobilePage.getByRole('navigation').getByRole('button',{name:/Shop/}).tap();
 await mobilePage.getByRole('heading',{name:'Daily Shop'}).waitFor();
 assert.equal(await mobilePage.locator('.daily-selection [data-action="buy"]').count(),8);
 assert.ok(await fits(),'Mobile shop overflows');
 assert.equal(await mobilePage.locator('.rare-badge').count(),3);
 await mobilePage.getByRole('heading',{name:'Pirate Token'}).waitFor();
 await mobilePage.getByRole('navigation').getByRole('button',{name:/Avatar/}).tap();
 assert.equal(await mobilePage.locator('[data-avatar]').count(),15);
 assert.equal(await mobilePage.getByRole('button',{name:'Aantrekken'}).count(),1,'First Pass reward should be equippable');
 assert.ok(await fits(),'Mobile Avatar Studio overflows');
 assert.equal(await mobilePage.getByRole('navigation').getByRole('button',{name:/Pass/}).count(),0,'Pass postponed for Quest 5');
 await mobile.close();
 assert.deepEqual(problems,[],'JavaScript errors in quest');
 console.log('Quest 5: student join, personal camp, three region atlas, checkpoint, answer, saved session, map acts and mobile smoke tests OK');
}catch(e){console.error(e);process.exitCode=1}
finally{if(mobileBrowser && mobileBrowser!==browser)await mobileBrowser.close();if(browser)await browser.close();await new Promise(r=>server.close(r))}
