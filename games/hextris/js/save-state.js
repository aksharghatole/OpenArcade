/* Modified by OpenArcade, 2026-11-26. GPL-3.0-or-later; see ../LICENSE.md and ../UPSTREAM.md. */
/* Modified by OpenArcade, GPL-3.0-or-later. Data-only save format; never evaluates stored source. */
var arcadeStorage = {
  memory: Object.create(null),
  getItem: function(k) { try { return localStorage.getItem("openarcade-hextris-v1-"+k); } catch(e) { return this.memory[k] || null; } },
  setItem: function(k,v) { this.memory[k]=String(v); try { localStorage.setItem("openarcade-hextris-v1-"+k,String(v)); } catch(e) {} }
};
function fields(obj, omit) {
  var out={}; Object.keys(obj).forEach(function(k) {
    if (k!=="__proto__" && k!=="constructor" && k!=="prototype" && typeof obj[k]!=="function" && !omit.includes(k)) out[k]=obj[k];
  }); return out;
}
function copyFields(target, data, omit) {
  if (!data || typeof data!=="object") return target;
  Object.keys(target).forEach(function(k) {
    if (!omit.includes(k) && typeof target[k]!=="function" && Object.hasOwn(data,k)) target[k]=data[k];
  }); return target;
}
function packBlock(b) { var o=fields(b,[]); o.distFromHex=b.distFromHex/settings.scale; return o; }
function exportSaveState() {
  if (gameState===0) return arcadeStorage.getItem("saveState") || "{}";
  if (gameState!==1 && gameState!==-1) return "{}";
  var h=fields(MainHex,["blocks","texts"]); h.blocks=MainHex.blocks.map(function(lane){return lane.map(packBlock);});
  var w=fields(waveone,["hex","currentFunction"]);
  w.pattern=["randomGeneration","doubleGeneration","spiralGeneration","crosswiseGeneration","circleGeneration","halfCircleGeneration"].find(function(k){return waveone[k]===waveone.currentFunction;}) || "randomGeneration";
  writeHighScores();
  return JSON.stringify({version:1,hex:h,blocks:blocks.map(packBlock),score:score,wavegen:w,gdx:gdx,gdy:gdy,comboTime:settings.comboTime});
}
function decodeSave(raw) {
  try {
    var s=JSON.parse(raw || "{}");
    if(s.version!==1 || !s.hex || !Array.isArray(s.hex.blocks) || s.hex.blocks.length!==6 || !s.hex.blocks.every(Array.isArray) || !Array.isArray(s.blocks) || !s.wavegen || !Number.isFinite(s.score)) return {};
    return s;
  } catch(e) { return {}; }
}
function reviveBlock(b) {
  var x=new Block(b.fallingLane,b.color,b.iter,b.distFromHex*settings.scale,b.settled);
  copyFields(x,b,["distFromHex","height"]);
  x.distFromHex=b.distFromHex*settings.scale; x.height=settings.blockHeight; return x;
}
function reviveHex(s) {
  MainHex=new Hex(settings.hexWidth);
  if(s.hex) {
    copyFields(MainHex,s.hex,["blocks","texts","sideLength","x","y","lastRotate"]);
    MainHex.blocks=s.hex.blocks.map(function(lane){return lane.map(reviveBlock);});
  }
  return MainHex;
}
function reviveWave(s) {
  var w=new waveGen(MainHex);
  if(s.wavegen) {
    copyFields(w,s.wavegen,["hex","currentFunction"]);
    var p=s.wavegen.pattern;
    if(["randomGeneration","doubleGeneration","spiralGeneration","crosswiseGeneration","circleGeneration","halfCircleGeneration"].includes(p)) w.currentFunction=w[p];
  }
  return w;
}
function writeHighScores() {
  highscores=highscores.filter(Number.isFinite).sort(function(a,b){return b-a;}).slice(0,3);
  arcadeStorage.setItem("highscores",JSON.stringify(highscores));
}
function clearSaveState(){arcadeStorage.setItem("saveState","{}");}
function isStateSaved(){return Boolean(decodeSave(arcadeStorage.getItem("saveState")).hex);}
function checkpoint(){if(gameState===1||gameState===-1)arcadeStorage.setItem("saveState",exportSaveState());}
