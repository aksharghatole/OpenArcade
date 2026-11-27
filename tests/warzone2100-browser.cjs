'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
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
    await page.locator('canvas').first().waitFor({state:'attached',timeout:30000});
    assert.deepEqual(errors,[]);
    assert.deepEqual(failures,[]);
    console.log('Warzone candidate: nested catalogue navigation, local entry and WebGL2 canvas passed; blocked external requests:',external);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
