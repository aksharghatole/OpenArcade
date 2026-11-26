'use strict';
const CACHE='crimson-tide-openarcade-v1',scope=self.registration.scope;
const files=["./","index.html","style.css","arcade.css","LICENSE","UPSTREAM.md","assets/logo.svg","js/data.js","js/engine.js","js/render.js","js/input.js","js/checkpoint.js","js/menu.js","js/arcade.js"].map(x=>new URL(x,scope).href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(files)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('crimson-tide-openarcade-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(scope))return;e.respondWith(caches.open(CACHE).then(async c=>{const u=new URL(e.request.url);u.search='';u.hash='';return(await c.match(u.href))||fetch(e.request);}));});
