'use strict';
const assert = require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    for(const phase of ['2','1']){
      const page=await browser.newPage();
      const errors=[], failures=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400&&/freedoom.*\.(wasm|data|js)(\?|$)/.test(r.url()))failures.push(r.url());});
      await page.goto('http://127.0.0.1:8765/OpenArcade/',{waitUntil:'domcontentloaded'});
      await page.locator('article').filter({has:page.getByRole('heading',{name:'Freedoom',exact:true})}).getByRole('link',{name:'Play now'}).click();
      await page.waitForURL('**/games/freedoom/');
      if(phase==='1')await page.getByRole('link',{name:'Phase 1',exact:true}).click();
      await page.locator('#canvas').waitFor({state:'visible',timeout:180000});
      await page.waitForFunction(()=>{const c=document.querySelector('#canvas');return c.width>0&&c.height>0;},{},{timeout:30000});
      assert.equal(await page.evaluate(()=>Module.arguments[1]),'freedoom'+phase+'.wad');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      assert.deepEqual(errors,[]);
      assert.deepEqual(failures,[]);
      await page.close();
      console.log('Freedoom phase '+phase+': startup and input dispatch passed');
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
