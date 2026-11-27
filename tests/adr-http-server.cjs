'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=fs.realpathSync(process.cwd());
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
const server=http.createServer((req,res)=>{
 try{
  let p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  p=fs.realpathSync(p);
  if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');
  fs.createReadStream(p).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404).end();}
});
server.listen(8000,'127.0.0.1',()=>console.log('Test server ready'));
