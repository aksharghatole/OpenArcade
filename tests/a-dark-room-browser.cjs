'use strict';
const assert=require('node:assert/strict');const {chromium}=require('playwright');
async function waitFor(page,predicate,timeout=30000){const end=Date.now()+timeout;while(Date.now()<end){if(await page.evaluate(predicate))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out waiting for '+predicate.toString());}
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'});
 const page=await context.newPage(),errors=[],external=[],failed=[];
 page.on('requestfailed',r=>failed.push([r.url(),r.failure()?.errorText]));
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000')&&!r.url().startsWith('data:'))external.push(r.url());});
 const url='http://127.0.0.1:8000/games/a-dark-room/';
 await page.goto(url);await waitFor(page,()=>window.Engine&&Engine.activeModule===Room);
 await page.getByRole('button',{name:'light fire',exact:true}).tap();
 await waitFor(page,()=>Number($SM.get('game.fire.value',true))>0);
 await page.evaluate(()=>Engine.saveGame());
 const state=await page.evaluate(()=>JSON.parse(ADRStorage.gameState));
 assert.ok(state.game.fire.value>0);assert.ok(state.features);
 await page.evaluate(()=>{localStorage.setItem('openarcade-test-unrelated','keep');});
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await waitFor(page,()=>navigator.serviceWorker.controller&&navigator.serviceWorker.controller.scriptURL.endsWith('/games/a-dark-room/sw.js'));
 const cacheReady=await page.evaluate(async()=>{const c=await caches.open('adr-openarcade-v1');const urls=[location.href,...Array.from(document.scripts,s=>s.src).filter(Boolean)];return (await Promise.all(urls.map(u=>c.match(u)))).every(Boolean);});
 assert.ok(cacheReady,'All game scripts and navigation must be cached before going offline');
 await context.setOffline(true);const response=await page.reload({waitUntil:'load'});assert.equal(response?.status(),200);
 try{await waitFor(page,()=>window.Engine&&Engine.activeModule===Room);}catch(e){console.error('Offline boot diagnostics',JSON.stringify({errors,failed,url:page.url(),state:await page.evaluate(()=>({title:document.title,engine:typeof Engine,room:typeof Room,active:typeof Engine!=='undefined'&&!!Engine.activeModule,controller:navigator.serviceWorker.controller?.scriptURL}))}));throw e;}
 assert.equal(await page.evaluate(()=>JSON.parse(ADRStorage.gameState).game.fire.value),state.game.fire.value);
 assert.equal(await page.evaluate(()=>localStorage.getItem('openarcade-test-unrelated')),'keep');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('A Dark Room: real opening interaction, mobile viewport, local checkpoint, offline reload');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
