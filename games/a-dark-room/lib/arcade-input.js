/* OpenArcade controls, MPL-2.0. */
(function(){
 function key(code,down){if(typeof Engine==='undefined'||!Engine.activeModule)return;var e={which:code,keycode:code,preventDefault:function(){}};if(down)Engine.keyDown(e);else Engine.keyUp(e);}
 function isSpace(){return typeof Space!=='undefined'&&Engine.activeModule===Space;}
 var held=new Set();
 function press(code){if(!held.has(code)){held.add(code);key(code,true);}}
 function release(code){if(held.delete(code))key(code,false);}
 function clear(){for(var code of [...held])release(code);}
 document.querySelectorAll('#adr-pad button').forEach(b=>{var code=Number(b.dataset.key);b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);press(code);});['pointerup','pointercancel','lostpointercapture'].forEach(k=>b.addEventListener(k,()=>release(code)));b.addEventListener('click',e=>{if(e.detail===0){press(code);release(code);}});});
 var last=0, lastTime=0, lastA=false;
 function poll(t){
  var pad=navigator.getGamepads&&Array.from(navigator.getGamepads()).find(Boolean);
  if(pad&&!document.hidden&&typeof Engine!=='undefined'&&Engine.activeModule){
   var b=i=>Boolean(pad.buttons[i]&&pad.buttons[i].pressed),x=pad.axes[0]||0,y=pad.axes[1]||0;
   var code=b(12)||y<-.65?38:b(13)||y>.65?40:b(14)||x<-.65?37:b(15)||x>.65?39:0;
   if(code!==last){if(last)release(last);if(code)press(code);last=code;lastTime=t;}
   else if(code&&!isSpace()&&t-lastTime>190){release(code);press(code);lastTime=t;}
   var a=b(0);if(a&&!lastA){var el=document.activeElement;if(el&&el.matches('div.button:not(.disabled),button,a'))el.click();}lastA=a;
  }else{if(last)release(last);last=0;lastA=false;}
  requestAnimationFrame(poll);
 }
 requestAnimationFrame(poll);
 window.addEventListener('blur',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();if(typeof Engine!=='undefined'&&Engine.activeModule)Engine.saveGame();}});
 window.addEventListener('pagehide',()=>{if(typeof Engine!=='undefined'&&Engine.activeModule)Engine.saveGame();});
 if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
})();
