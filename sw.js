'use strict';
const CACHE='openarcade-shell-v1';
const base=new URL('./',self.registration.scope);
const shell=['','index.html','games/starfall/','games/starfall/index.html','games/starfall/style.css','games/starfall/game.js'].map(path=>new URL(path,base).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(shell)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('openarcade-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response}).catch(async()=>{
      const cache=await caches.open(CACHE);const exact=await cache.match(request);if(exact)return exact;
      return cache.match(new URL('games/starfall/',base).href)||cache.match(new URL('index.html',base).href)
    }));return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response})));
});
