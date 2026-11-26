'use strict';
const CACHE='hextris-openarcade-v1';
const scope=self.registration.scope;
const files=["./","LICENSE.md","style/style.css","js/save-state.js","js/view.js","js/wavegen.js","js/math.js","js/Block.js","js/Hex.js","js/Text.js","js/comboTimer.js","js/checking.js","js/update.js","js/render.js","js/input.js","js/main.js","js/initialization.js","vendor/jquery.min.js","vendor/JQUERY-LICENSE.txt","style/arcade.css","images/btn_help.svg","images/btn_pause.svg","images/btn_resume.svg","images/btn_restart.svg","index.html","UPSTREAM.md"].map(x=>new URL(x,scope).href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(files)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hextris-openarcade-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(scope))return;e.respondWith(caches.open(CACHE).then(async c=>{const url=new URL(e.request.url);url.search='';url.hash='';const hit=await c.match(url.href);if(hit)return hit;return fetch(e.request); }));});
