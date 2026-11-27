'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage();
    const errors = [], failures = [], messages = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') messages.push(m.text()); });
    page.on('requestfailed', r => failures.push(r.failure()?.errorText + ' ' + r.url()));
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400 && /neverball|packages\//.test(r.url())) failures.push(r.status()+' '+r.url()); });
    await page.goto('http://127.0.0.1:8765/OpenArcade/', {waitUntil:'domcontentloaded'});
    const card = page.locator('article').filter({has:page.getByRole('heading',{name:'Neverball',exact:true})});
    await card.getByRole('link',{name:'Play now'}).click();
    await page.waitForURL('**/games/neverball/');
    // Upstream deliberately defers runtime preparation until the first user click.
    assert.equal(await page.evaluate(() => localStorage.getItem('isAppInstalled')), null);
    await page.locator('#run-button').click({timeout:30000});
    try {
      await page.waitForFunction(() => document.body.classList.contains('in-game'), {}, {timeout:180000});
    } catch (error) {
      console.error('Neverball startup diagnostics:', {status: await page.locator('#status').textContent(), errors, failures, messages});
      throw error;
    }
    await page.locator('#canvas').waitFor({state:'visible'});
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('#canvas').evaluate(c => c.width > 0 && c.height > 0), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log('Neverball candidate: nested launch, runtime ready, start and visible canvas passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
