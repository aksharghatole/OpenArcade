'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('games/a-dark-room/script/state_manager.js','utf8');
const result=vm.runInNewContext(source+`
var State={},Engine={saveGame(){},log(){}}, $={Dispatch(){return{publish(){}}}};
$SM.set('stores["cured meat"]',5,true);$SM.add('stores["cured meat"]',2,true);
$SM.set('game.test[0]',3,true);$SM.remove('game.test[0]',true);
var safe=false;try{$SM.set('game["__proto__"].polluted',1,true);}catch(e){safe=true;}
({meat:$SM.get('stores["cured meat"]'),removed:$SM.get('game.test[0]')===undefined,safe,unpolluted:({}).polluted===undefined})
`);
assert.deepEqual({...result},{meat:7,removed:true,safe:true,unpolluted:true});
console.log('A Dark Room state paths, counters, deletion and prototype protection passed');
