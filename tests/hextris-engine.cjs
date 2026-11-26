'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=['save-state','Hex','Block','wavegen'].map(n=>fs.readFileSync('games/hextris/js/'+n+'.js','utf8')).join('\n');
const s=vm.runInNewContext(source+`
var settings={scale:1,blockHeight:20,creationDt:9,startDist:340,hexWidth:87,comboTime:310},trueCanvas={width:800,height:600},colors=["#e74c3c"],gameState=1,score=27,highscores=[],gdx=0,gdy=0,MainHex,blocks=[],waveone;var localStorage={setItem(){},getItem(){return null;}};
MainHex=new Hex(87);MainHex.position=3;MainHex.blocks[0].push(new Block(0,colors[0],2,100,true));blocks=[new Block(1,colors[0],3,180)];waveone=new waveGen(MainHex);waveone.currentFunction=waveone.doubleGeneration;
var saved=decodeSave(exportSaveState());settings.scale=0.5;settings.blockHeight=10;MainHex=reviveHex(saved);blocks=saved.blocks.map(reviveBlock);waveone=reviveWave(saved);
({position:MainHex.position,rotate:typeof MainHex.rotate,settledDistance:MainHex.blocks[0][0].distFromHex,fallingDistance:blocks[0].distFromHex,draw:typeof blocks[0].draw,pattern:waveone.currentFunction===waveone.doubleGeneration,score:saved.score,invalid:!decodeSave("invalid").hex})
`);
assert.deepEqual({...s},{position:3,rotate:'function',settledDistance:50,fallingDistance:90,draw:'function',pattern:true,score:27,invalid:true});
console.log('Hextris checkpoint roundtrip, responsive coordinates, and malformed JSON fallback passed');
