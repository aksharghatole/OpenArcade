'use strict';
const CACHE='openarcade-shell-2048-v2';
const base=new URL('./',self.registration.scope);
const shell=['','index.html','games/starfall/','games/starfall/index.html','games/starfall/style.css','games/starfall/game.js',"games/2048/","games/2048/index.html","games/2048/style/main.css","games/2048/js/bind_polyfill.js","games/2048/js/classlist_polyfill.js","games/2048/js/animframe_polyfill.js","games/2048/js/keyboard_input_manager.js","games/2048/js/html_actuator.js","games/2048/js/grid.js","games/2048/js/tile.js","games/2048/js/local_storage_manager.js","games/2048/js/game_manager.js","games/2048/js/application.js","games/2048/style/arcade.css","games/2048/js/arcade.js"].map(path=>new URL(path,base).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(shell)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('openarcade-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response}).catch(async()=>{
      const cache=await caches.open(CACHE);const exact=await cache.match(request);if(exact)return exact;
      const canonical=new URL(url.href);canonical.search='';canonical.hash='';if(canonical.pathname.endsWith('/index.html'))canonical.pathname=canonical.pathname.slice(0,-10);else if(!canonical.pathname.endsWith('/'))canonical.pathname+='/';return (await cache.match(canonical.href))||(await cache.match(new URL('index.html',base).href))||Response.error()
    }));return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response})));
});
