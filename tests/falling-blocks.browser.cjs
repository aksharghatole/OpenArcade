const { chromium } = require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:8000/';
 await page.goto(base);
 await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
 await page.locator('article').filter({has:page.getByRole('heading',{name:'Falling Blocks',exact:true})}).getByRole('link',{name:'Play now'}).click();
 await page.waitForURL('**/games/falling-blocks/');
 await page.getByRole('button',{name:'Start game'}).tap();
 assert.equal(await page.evaluate(()=>playing),true);
 const original=await page.evaluate(()=>current.x);
 await page.getByRole('button',{name:'Move left'}).tap();
 assert.equal(await page.evaluate(()=>current.x),original-1);
 await page.getByRole('button',{name:'Hard drop'}).tap();
 assert.equal(await page.evaluate(()=>blocks.some(c=>c&&c.some(Boolean))),true);
 await page.getByRole('button',{name:'Pause'}).tap();
 assert.equal(await page.evaluate(()=>paused),true);
 await context.setOffline(true);
 await page.reload({waitUntil:'load'});
 await page.getByRole('button',{name:'Resume'}).waitFor();
 assert.equal(await page.evaluate(()=>playing&&paused&&blocks.some(c=>c&&c.some(Boolean))),true);
 await page.getByRole('button',{name:'Resume'}).tap();
 assert.equal(await page.evaluate(()=>paused),false);
 assert.deepEqual(errors,[]);
 await context.close();
 console.log('Mobile Chromium: catalogue, touch, hard drop, local save, offline reload, resume passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
