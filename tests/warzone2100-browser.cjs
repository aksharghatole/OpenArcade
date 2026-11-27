'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
(async () => {
  const base = 'http://127.0.0.1:8765/OpenArcade/';
  const browser = await chromium.launch({args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:900}});
    const errors = [], failures = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(base+'games/warzone2100/') && response.status() >= 400)
        failures.push(response.status()+' '+response.url());
    });
    await page.route('**/*', route => {
      if (route.request().url().startsWith(base)) return route.continue();
      external.push(route.request().url());
      return route.abort();
    });
    await page.goto(base, {waitUntil:'domcontentloaded'});
    const card = page.locator('article').filter({has:page.getByRole('heading',{name:'Warzone 2100',exact:true})});
    assert.equal(await card.count(),1);
    await card.getByRole('link',{name:'Play now'}).click();
    await page.waitForURL(base+'games/warzone2100/');
    await page.waitForLoadState('domcontentloaded');
    assert.match(await page.title(), /Warzone/i);
    assert.equal(await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2')),true);
    const canvas = page.locator('#canvas');
    await page.locator('#start-button').click({timeout:60000});
    try {
      await page.waitForFunction(() => typeof LaunchedModule !== 'undefined' &&
        LaunchedModule && LaunchedModule.calledRun && LaunchedModule.wzEncounteredPostRun,
        {}, {timeout:180000});
      await canvas.waitFor({state:'visible',timeout:30000});
      // A visible empty canvas is not proof of a rendered game. Sample the
      // composited output until the engine draws a non-uniform frame.
      let rendered = false;
      for (let attempt=0; attempt<20 && !rendered; attempt++) {
        const png = PNG.sync.read(await canvas.screenshot({timeout:10000}));
        const colors = new Set();
        for (let y=0; y<png.height; y+=8) for (let x=0; x<png.width; x+=8) {
          const i=(y*png.width+x)*4;
          colors.add((png.data[i]>>4)*256+(png.data[i+1]>>4)*16+(png.data[i+2]>>4));
        }
        rendered = colors.size > 20;
        if (!rendered) await page.waitForTimeout(500);
      }
      assert.equal(rendered,true,'No non-uniform game frame rendered');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lastRun_Details')||'{}').success),1);
    } catch (error) {
      console.error('Startup diagnostics:', {status:await page.locator('#status').textContent(),errors,failures,external});
      throw error;
    }
    assert.equal(external.some(url => url.includes('cloudflareinsights.com')),false,'Unexpected analytics request');
    assert.deepEqual(errors,[]);
    assert.deepEqual(failures,[]);
    console.log('Warzone candidate: nested navigation, WASM runtime initialized, rendered frame and launch persistence passed; blocked external requests:',external);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
