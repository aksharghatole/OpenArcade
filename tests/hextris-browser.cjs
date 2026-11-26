'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'});
 await context.addInitScript(()=>{window.testPad=null;Object.defineProperty(navigator,'getGamepads',{value:()=>[window.testPad]});});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000')&&!r.url().startsWith('data:'))external.push(r.url());});
 const url='http://127.0.0.1:8000/games/hextris/';
 await page.goto(url);await page.waitForFunction(()=>window.MainHex&&gameState===0);
 await page.getByRole('button',{name:'Play or resume Hextris'}).tap();
 await page.waitForFunction(()=>gameState===1);
 let position=await page.evaluate(()=>MainHex.position);
 await page.getByRole('button',{name:'Rotate left'}).tap();
 await page.waitForFunction(p=>MainHex.position===(p+1)%6,position);
 position=await page.evaluate(()=>MainHex.position);
 await page.evaluate(()=>{window.testPad={axes:[1,0],buttons:Array.from({length:16},()=>({pressed:false}))};});
 await page.waitForFunction(p=>MainHex.position!==p,position);
 await page.evaluate(()=>{window.testPad=null;checkpoint();});
 const saved=await page.evaluate(()=>JSON.parse(arcadeStorage.getItem('saveState')));
 assert.equal(saved.version,1);assert.ok(saved.hex.blocks.length===6);
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.waitForFunction(()=>navigator.serviceWorker.controller&&navigator.serviceWorker.controller.scriptURL.endsWith('/games/hextris/sw.js'));
 await context.setOffline(true);
 await page.reload();await page.waitForFunction(()=>window.MainHex&&gameState===0);
 assert.equal(await page.evaluate(()=>MainHex.position),saved.hex.position);
 await page.getByRole('button',{name:'Play or resume Hextris'}).tap();
 await page.waitForFunction(()=>gameState===1&&MainHex.ct>0);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('Hextris: start, touch, controller, data save, offline restoration verified');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
