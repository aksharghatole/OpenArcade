/* OpenArcade battle checkpoint adapter, MIT. Serializes the object graph without executable code. */
'use strict';
const SAVE_KEY='battle';
function packGraph(value){
 const ids=new Map(),nodes=[];
 function enc(v){
   if(v===null||typeof v==='boolean'||typeof v==='string')return v;
   if(typeof v==='number')return Number.isFinite(v)?v:null;
   if(typeof v==='undefined')return null;
   if(typeof v!=='object')throw Error('Unsupported checkpoint value');
   if(ids.has(v))return {r:ids.get(v)};
   const id=nodes.length;ids.set(v,id);nodes.push(null);
   if(Array.isArray(v))nodes[id]={a:v.map(enc)};
   else {const o=Object.create(null);for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Unsafe checkpoint key');o[k]=enc(v[k]);}nodes[id]={o};}
   return {r:id};
 }
 return {root:enc(value),nodes};
}
function unpackGraph(g){
 if(!g||!Array.isArray(g.nodes)||g.nodes.length>50000)throw Error('Invalid checkpoint graph');
 const out=g.nodes.map(n=>{if(n&&Array.isArray(n.a))return [];if(n&&n.o&&typeof n.o==='object'&&!Array.isArray(n.o))return {};throw Error('Invalid node');});
 function dec(v){if(v===null||typeof v==='boolean'||typeof v==='string'||typeof v==='number')return v;if(v&&Object.keys(v).length===1&&Number.isInteger(v.r)&&v.r>=0&&v.r<out.length)return out[v.r];throw Error('Invalid reference');}
 g.nodes.forEach((n,i)=>{if(n.a){for(const v of n.a)out[i].push(dec(v));}else for(const k of Object.keys(n.o)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Unsafe checkpoint key');out[i][k]=dec(n.o[k]);}});
 return dec(g.root);
}
function captureBattle(){return JSON.stringify({version:1,graph:packGraph({G,MAP_ORE,FOG,ELEV,BRIDGE,cam,shake})});}
function decodeBattle(raw){
 if(!raw||raw.length>4500000)throw Error('Missing or oversized checkpoint');
 const data=JSON.parse(raw);if(data.version!==1)throw Error('Unsupported checkpoint version');
 const v=unpackGraph(data.graph),b=v.G;
 const grid=m=>Array.isArray(m)&&m.length===MAP_H&&m.every(r=>Array.isArray(r)&&r.length===MAP_W);
 if(!b||b.over||!Number.isFinite(b.tick)||!v.cam||!Number.isFinite(v.cam.fx)||!Number.isFinite(v.cam.fy)||!b.cfg||!Object.hasOwn(FACTIONS,b.cfg.playerFaction)||!Object.hasOwn(DIFFICULTY,b.cfg.difficulty)||!Array.isArray(b.units)||!Array.isArray(b.buildings)||!b.players||!b.players[0]||![b.map,v.MAP_ORE,v.FOG,v.ELEV,v.BRIDGE].every(grid))throw Error('Invalid battle');
 for(const u of b.units){if(!Object.hasOwn(UNITS,u.key))throw Error('Invalid unit');u.def=UNITS[u.key];}
 for(const e of b.buildings){if(!Object.hasOwn(BUILDINGS,e.key))throw Error('Invalid building');e.def=BUILDINGS[e.key];}
 b.diff=DIFFICULTY[b.cfg.difficulty];return v;
}
function applyBattle(v){G=v.G;MAP_ORE=v.MAP_ORE;FOG=v.FOG;ELEV=v.ELEV;BRIDGE=v.BRIDGE;cam=v.cam;shake=v.shake;G.running=true;G.over=false;G.paused=false;dragStart=dragNow=null;invalidateTerrain();}
function hasBattleSave(){return Boolean(CTStore.getItem(SAVE_KEY));}
function clearBattleSave(){CTStore.removeItem(SAVE_KEY);}
function saveBattle(){if(!G||G.over||!G.running||menuMode)return false;try{return CTStore.setItem(SAVE_KEY,captureBattle());}catch(e){return false;}}
function resumeBattle(){try{const v=decodeBattle(CTStore.getItem(SAVE_KEY));applyBattle(v);enterGame();resize();buildSidebar();refreshSelInfo();document.getElementById('btn-pause').textContent='⏸';return true;}catch(e){alert('Cannot restore this checkpoint. You can start a new battle.');return false;}}
