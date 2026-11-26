/* OpenArcade touch and controller integration, MIT. */
'use strict';
(function(){
 const $=id=>document.getElementById(id);
 $('btn-resume').onclick=resumeBattle;
 $('btn-save').onclick=()=>flash(saveBattle()?'Battle checkpoint saved':'Could not save checkpoint');
 const mode=$('ct-mode');function setMode(m){touchMode=m;mode.textContent=m==='select'?'Select mode':'Command mode';mode.setAttribute('aria-pressed',String(m==='command'));}
 mode.onclick=()=>setMode(touchMode==='select'?'command':'select');
 $('ct-army').onclick=()=>{if(!G||G.over)return;G.selected=G.units.filter(u=>u.owner===0&&u.def.wpn&&!u.def.harvester).map(u=>u.id);refreshSelInfo();};
 $('ct-stop').onclick=()=>{if(G&&!G.over)commandStop(selectedObjs().filter(s=>s.kind==='unit'));};
 $('ct-attack').onclick=()=>{if(G&&!G.over){G.attackMove=true;setMode('command');flash('Tap destination for attack-move');}};
 document.querySelectorAll('[data-pan]').forEach(b=>{const k=b.dataset.pan;const release=()=>keys[k]=false;b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);keys[k]=true;});['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,release));b.addEventListener('click',e=>{if(e.detail===0&&G){const d={arrowleft:[-80,0],arrowright:[80,0],arrowup:[0,-80],arrowdown:[0,80]}[k];scrollByScreen(...d);}});});
 let prev=[];function poll(){
   const pad=navigator.getGamepads&&Array.from(navigator.getGamepads()).find(Boolean);
   if(pad&&G&&!G.over&&!menuMode&&!document.hidden){
     const b=i=>Boolean(pad.buttons[i]&&pad.buttons[i].pressed),x=pad.axes[0]||0,y=pad.axes[1]||0;
     if(Math.abs(x)>.2||Math.abs(y)>.2||b(12)||b(13)||b(14)||b(15))scrollByScreen((b(14)?-1:b(15)?1:x)*12,(b(12)?-1:b(13)?1:y)*12);
     if(b(0)&&!prev[0]){const pos={x:canvas.width/2,y:canvas.height/2};dragStart=dragNow=pos;finishDrag(false);}
     if(b(1)&&!prev[1]){const x=canvas.width/2,y=canvas.height/2,w=screenToWorld(x,y);mouseTile={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};if(G.placing)doPlace(x,y);else rightClick(x,y);}
     if(b(2)&&!prev[2])$('ct-army').click();
     if(b(3)&&!prev[3])$('ct-stop').click();
     if(b(9)&&!prev[9])$('btn-pause').click();
     prev=Array.from({length:16},(_,i)=>b(i));$('ct-reticle').classList.remove('hidden');
   }else{prev=[];$('ct-reticle').classList.add('hidden');}
   requestAnimationFrame(poll);
 }
 requestAnimationFrame(poll);
 setInterval(()=>{if(!document.hidden)saveBattle();},30000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){Object.keys(keys).forEach(k=>keys[k]=false);saveBattle();}});
 window.addEventListener('pagehide',saveBattle);
 window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
 if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
})();
