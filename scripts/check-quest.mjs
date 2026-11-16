import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';

const root=resolve('dist');
const base='/AK-MASTER-app-/';
const files=['quest/index.html','quest/globe.js','quest/globe.css','quest/levelmap.css'];
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
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 const page=await browser.newPage({viewport:{width:1365,height:900}});
 const problems=[];page.on('pageerror',e=>problems.push(e.message));page.on('dialog',d=>d.accept());
 const token='a'.repeat(48);let attempts=[],xp=0,coins=100,avatar='explorer',cosmetics=null;const purchases=[];
 const quiz=[
 {id:'n1',chapter:'H7',skill:'begrip',type:'choice',text:'Wat is een delta?',options:['Een vertakte monding','Een droogmakerij','Een gletsjer','Een krib']},
 {id:'h7_open_01',chapter:'H7',skill:'verklaren',type:'open',text:'Leg uit hoe een rivierdelta ontstaat.',options:null},
 ...['H8','H9'].map((chapter,i)=>({id:chapter+'_test',chapter,skill:'verklaren',type:'open',text:'Leg uit wat debiet is. '+i,options:null}))
 ];
 await page.route('**/functions/v1/exam-quest', async route=>{
  const body=JSON.parse(route.request().postData()||'{}');let response;
  switch(body.action){
   case 'join':response={token,student:{id:'test',first_name:'Sam',xp:0,coins:0,avatar:'explorer',active_seconds:0}};break;
   case 'me':response={student:{id:'test',first_name:'Sam',xp,coins,avatar,active_seconds:60,cosmetics},attempts:[...attempts].reverse(),purchases};break;
   case 'questions':response={questions:quiz};break;
   case 'answer':{const ok=body.questionId==='n1'&&body.response==='0';
     attempts.push({question_id:body.questionId,is_correct:body.questionId==='n1'?ok:null,awarded_xp:ok?60:0,created_at:new Date().toISOString()});
     if(ok){xp+=60;coins+=12}
     response={correct:body.questionId==='n1'?ok:null,awarded:ok?60:0,explanation:'De monding is vertakt.',correctOption:0,selfCheck:body.questionId!=='n1'};break;
   }
   case 'buy':purchases.push(body.item);coins-=24;response={ok:true};break;
   case 'avatar':avatar=body.avatar;response={ok:true};break;
   case 'cosmetics':cosmetics={...cosmetics,...body.patch};response={cosmetics};break;
   case 'heartbeat':response={ok:true};break;
   default:response={error:'Test stub has no action '+body.action};break;
  }
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
 });
 await page.goto('http://127.0.0.1:'+server.address().port+base+'quest/',{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:'Welkom, ontdekkingsreiziger!'}).waitFor();
 await page.locator('input[name="name"]').fill('Sam');await page.locator('input[name="code"]').fill('12345678');
 await page.getByRole('button',{name:/Start mijn avontuur/}).click();
 await page.locator('#quest-globe').waitFor();
 await page.getByRole('heading',{name:/THE WORLD IS YOURS/}).waitFor();
 assert.ok(await page.locator('#quest-globe').evaluate(el=>el.width>200),'Interactive canvas failed');
 await page.locator('button[data-action="chapter"][data-ch="H7"]').first().click();
 await page.locator('.quest-map-shell').waitFor();
 assert.equal(await page.locator('.zone-switcher button').count(),3);
 await page.locator('button[data-action="question"][data-id="n1"]').click();
 await page.getByText('Wat is een delta?').waitFor();
 await page.locator('button[data-action="choose"][data-val="0"]').click();
 await page.getByRole('button',{name:/Controleer antwoord/}).click();
 await page.getByText(/Goed! \+60 XP/).waitFor();
 await page.getByRole('button',{name:/Terug naar kaart/}).click();
 await page.locator('button[data-action="zone"][data-zone="1"]').first().click();
 assert.ok(await page.locator('.quest-map-shell').isVisible(),'Stage switching broke');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.getByText('THE WORLD').waitFor();
 assert.equal(await page.locator('canvas#quest-globe').count(),1);
 await page.locator('#theme-toggle').click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('#quest-globe').waitFor();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.setViewportSize({width:390,height:844});
 await page.locator('.v3-nav [data-action="store"]').click();
 await page.getByRole('heading',{name:'Catalogus · 45 items'}).waitFor();
 assert.equal(await page.locator('.catalog-group [data-action="buy"]').count(),45);
 await page.locator('.catalog-group summary').filter({hasText:'Achtergrond'}).click();
 await page.locator('.catalog-group [data-id="bg_1"]').click();
 await page.locator('.v3-nav [data-action="studio-v3"]').click();
 await page.locator('[data-action="bg-v3"][data-id="bg_1"]').click();
 await page.waitForFunction(()=>document.documentElement.dataset.questBackdrop==='bg_1');
 await page.locator('[data-action="avatar"][data-avatar="diver"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-avatar="diver"]').getAttribute('aria-pressed')==='true');
 await page.locator('.v3-nav [data-action="pass-v3"]').click();
 await page.getByRole('heading',{name:'Battle Pass'}).waitFor();
 assert.equal(await page.locator('.storeitem').count(),10);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 await page.locator('.v3-nav [data-action="store"]').click();
 await page.getByText('Pirate Token',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Speel Waterroute/}).click();
 await page.getByRole('dialog',{name:'Waterroute'}).waitFor();
 await page.locator('[data-action="route-pick"][data-id="H7"]').click();
 await page.getByText('Goed gevonden!',{exact:true}).waitFor();
 await page.locator('[data-action="route-close"]').click();
 await page.locator('.v3-nav [data-action="home"]').click();
 await page.locator('#quest-globe').waitFor();
 assert.ok(await page.locator('#quest-globe').evaluate(el=>el.clientWidth>200),'Mobile globe missing');
 assert.deepEqual(problems,[],'JavaScript errors in quest');
 console.log('Water Wars: student join, rotating globe, checkpoint, answer, saved session, map acts and mobile smoke tests OK');
}catch(e){console.error(e);process.exitCode=1}
finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
