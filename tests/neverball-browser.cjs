'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage();
    const errors = [], failures = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400 && /neverball|packages\//.test(r.url())) failures.push(r.status()+' '+r.url()); });
    await page.goto('http://127.0.0.1:8765/OpenArcade/', {waitUntil:'domcontentloaded'});
    const card = page.locator('article').filter({has:page.getByRole('heading',{name:'Neverball',exact:true})});
    await card.getByRole('link',{name:'Play now'}).click();
    await page.waitForURL('**/games/neverball/');
    await page.waitForFunction(() => document.querySelector('#status')?.textContent.includes('Ready to play'), { }, {timeout:180000});
    await page.locator('#run-button').click();
    await page.waitForFunction(() => document.body.classList.contains('in-game'), {}, {timeout:30000});
    await page.locator('#canvas').waitFor({state:'visible'});
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('#canvas').evaluate(c => c.width > 0 && c.height > 0), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log('Neverball candidate: nested launch, runtime ready, start and visible canvas passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
