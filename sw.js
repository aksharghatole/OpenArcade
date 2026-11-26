'use strict';
const CACHE='openarcade-shell-obsidian-falling-v3';
const base=new URL('./',self.registration.scope);
const shell=["","index.html","games/starfall/","games/starfall/index.html","games/starfall/style.css","games/starfall/game.js","games/obsidian/","games/obsidian/index.html","games/obsidian/engine.js","games/obsidian/game.js","games/falling-blocks/","games/falling-blocks/index.html","games/falling-blocks/game.js","games/falling-blocks/LICENSE"].map(path=>new URL(path,base).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(shell)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('openarcade-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response}).catch(async()=>{
      const cache=await caches.open(CACHE);const exact=await cache.match(request);if(exact)return exact;
      return (await cache.match(new URL('index.html',base).href))||Response.error()
    }));return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response})));
});
