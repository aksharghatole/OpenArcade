/* OpenArcade standalone runtime adapters; MPL-2.0. */
var ADRStorage = {
  memory: undefined,
  get gameState() { try {return localStorage.getItem('openarcade-adr-v1-state') ?? this.memory;} catch(e){return this.memory;} },
  set gameState(v) {this.memory=v;try{localStorage.setItem('openarcade-adr-v1-state',v);}catch(e){}},
  clear: function(){this.memory=undefined;try{localStorage.removeItem('openarcade-adr-v1-state');}catch(e){}}
};
function containsUnsafeKeys(obj) {
  var stack=[obj], count=0;while(stack.length){var value=stack.pop();if(++count>200000)return true;if(value&&typeof value==='object')for(var key of Object.keys(value)){if(['__proto__','prototype','constructor'].includes(key))return true;stack.push(value[key]);}}return false;
}
var Base64={
 encode:function(text){var b=new TextEncoder().encode(text),s='';for(var i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(s);},
 decode:function(s){return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)));}
};
(function(){
 function format(text,args){return typeof text==='string'?text.replace(/\{(\d+)\}/g,(m,k)=>args[k]===undefined?m:args[k]):text;}
 function translate(text,...args){return format(text,args);}
 translate.format=translate;translate.translate=translate;window._=translate;
})();
var AudioEngine={init(){},tryResumingAudioContext(){},isAudioContextRunning(){return true;},setMasterVolume(){},setBackgroundMusicVolume(){},playSound(){},playEventMusic(){},stopEventMusic(){},playBackgroundMusic(){},loadAudioFile(){return Promise.resolve(null);}};
var oldIE=false;
