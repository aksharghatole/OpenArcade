'use strict';
const {chromium}=require('playwright');
const {PNG}=require('pngjs');
const assert=require('node:assert/strict');
const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve('preview');
const mime={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.data':'application/octet-stream'};
const server=http.createServer((req,res)=>{
  try{
    let p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
    if(p!==root&&!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
    res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');
    fs.createReadStream(p).on('error',()=>res.destroy()).pipe(res);
  }catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8765,'127.0.0.1',resolve)});
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768}});
  const errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.url().includes('/games/openttd/'))failed.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8765/')?r.continue():r.abort());
  await page.goto('http://127.0.0.1:8765/OpenArcade/');
  await page.locator('article').filter({has:page.getByRole('heading',{name:'OpenTTD',exact:true})}).getByRole('link',{name:'Play now'}).click();
  await page.getByRole('link',{name:'Start OpenTTD'}).click();
  await page.waitForURL('**/games/openttd/openttd.html');
  const canvas=page.locator('#canvas');
  await page.waitForFunction(()=>typeof Module!=='undefined'&&Module.calledRun&&document.querySelector('#canvas').width>0,{},{timeout:180000});
  // The canvas is present before initialization. Require rendered, varied pixels.
  let varied=false;
  for(let i=0;i<30;i++){
    assert.equal(await page.locator('#box.error').count(),0,'engine crash');
    assert.doesNotMatch(await page.locator('#title').innerText(),/Missing base graphics|Crash/);
    if(await canvas.isVisible()){
      const png=PNG.sync.read(await canvas.screenshot());
      const colors=new Set();
      for(let j=0;j<png.data.length;j+=64){colors.add(png.data.readUInt32BE(j));if(colors.size>100)break;}
      if(colors.size>100){varied=true;break;}
    }
    await page.waitForTimeout(1000);
  }
  assert.equal(varied,true,'expected a rendered game screen');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('OpenTTD: locally bundled graphics and rendered startup passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
