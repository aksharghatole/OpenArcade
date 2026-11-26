'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
 const url='http://127.0.0.1:8000/games/crimson-tide/';
 await page.goto(url);await page.locator('#btn-campaign').tap();assert.equal(await page.locator('.mission').count(),6);await page.locator('#screen-campaign .back-home').tap();
 await page.locator('#btn-skirmish').tap();await page.locator('#sk-start').tap();await page.waitForFunction(()=>G&&G.tick>2);
 await page.locator('#ct-army').tap();assert.ok(await page.evaluate(()=>G.selected.length>0));
 await page.locator('#ct-mode').tap();assert.equal(await page.locator('#ct-mode').getAttribute('aria-pressed'),'true');
 await page.locator('#game').tap({position:{x:180,y:140}});await page.waitForFunction(()=>G.units.some(u=>G.selected.includes(u.id)&&u.state!=='idle'));
 await page.locator('#btn-pause').tap();await page.locator('#btn-save').tap();const tick=await page.evaluate(()=>G.tick);
 assert.ok(await page.evaluate(()=>hasBattleSave()));
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>navigator.serviceWorker.controller&&navigator.serviceWorker.controller.scriptURL.endsWith('/games/crimson-tide/sw.js'));
 await context.setOffline(true);await page.reload();await page.locator('#btn-resume').tap();await page.waitForFunction(t=>G&&G.tick>=t,tick);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('Crimson Tide campaign, touch skirmish, checkpoint and offline resume verified');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
