'use strict';
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const page = await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const base=process.env.TEST_URL||'http://127.0.0.1:8000';
    await page.goto(base+'/games/2048/');
    await page.waitForFunction(()=>window.openArcade2048 && document.querySelectorAll('.tile').length===2);
    // Deterministic board verifies the real upstream move and merge logic.
    await page.evaluate(()=>{const g=window.openArcade2048;g.grid=new Grid(4);g.grid.insertTile(new Tile({x:1,y:0},2));g.grid.insertTile(new Tile({x:2,y:0},2));g.score=0;g.over=false;g.won=false;g.keepPlaying=false;g.actuate();});
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(()=>window.openArcade2048.score===4);
    assert.equal(await page.evaluate(()=>window.openArcade2048.grid.cellContent({x:0,y:0}).value),4);
    await page.evaluate(()=>{const g=window.openArcade2048;g.grid=new Grid(4);g.grid.insertTile(new Tile({x:0,y:0},2));g.grid.insertTile(new Tile({x:0,y:1},2));g.score=0;g.actuate();});
    await page.getByRole('button',{name:'Move up'}).tap();
    await page.waitForFunction(()=>window.openArcade2048.score===4);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    const state=await page.evaluate(()=>window.openArcade2048.serialize());
    await page.reload();
    await page.waitForFunction(()=>!!window.openArcade2048);
    assert.deepEqual(await page.evaluate(()=>window.openArcade2048.serialize()),state);
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(()=>!!window.openArcade2048);
    assert.deepEqual(await page.evaluate(()=>window.openArcade2048.serialize()),state);
    await page.goto(base+'/');
    assert.ok(await page.getByRole('heading',{name:'2048',exact:true}).isVisible());
    assert.deepEqual(errors,[]);
    console.log('2048: real merge, touch control, checkpoint reload, offline reload, offline catalogue passed');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
