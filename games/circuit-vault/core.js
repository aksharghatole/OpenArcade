'use strict';
const LEVELS=[
  [
    "Receiving",
    "########|#     .#|# # $  #|#      #|#   #$.#|#   #@ #|########"
  ],
  [
    "Crossfeed",
    "########|#    + #|#. #$$ #|#  #   #|#     ##|#      #|########"
  ],
  [
    "Side channel",
    "########|#      #|####$  #|#.   # #|#    $@#|#    . #|########"
  ],
  [
    "Transfer",
    "########|#  # . #|#@$    #|# #  . #|# $ #  #|#      #|########"
  ],
  [
    "Junction",
    "#########|#    ## #|#.   #  #|#.      #|# # $$  #|#    @  #|#########"
  ],
  [
    "Switchyard",
    "########|##   ..#|# @  # #|# $    #|#  # $ #|#      #|########"
  ],
  [
    "Dead angle",
    "########|#   #  #|#   $@ #|#  # $ #|#.     #|#  . ###|########"
  ],
  [
    "Power bus",
    "#########|#   .   #|#  $@   #|#   ##  #|# $    .#|#    ## #|#########"
  ],
  [
    "Triple lock",
    "#########|#    .@##|# $#$#$##|##      #|#       #|#   .  .#|#########"
  ],
  [
    "Fault line",
    "#########|#.+    ##|# $$ #  #|#       #|##$##   #|#    .  #|#########"
  ],
  [
    "Core vault",
    "#########|#   #   #|# $  .  #|#  .#  .#|#  $$ ###|#  @    #|#########"
  ]
];
function makeEngine(levels){
 const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 function load(index){const rows=levels[index][1].split('|'),w=rows[0].length,h=rows.length,walls=[],goals=[],boxes=[];let player=-1;rows.forEach((row,y)=>{if(row.length!==w)throw Error('Invalid width');[...row].forEach((c,x)=>{const i=y*w+x;if(c==='#')walls.push(i);if('.+*'.includes(c))goals.push(i);if('$*'.includes(c))boxes.push(i);if('@+'.includes(c))player=i;});});if(player<0||boxes.length!==goals.length)throw Error('Invalid level '+index);return {w,h,walls,goals,boxes,player,moves:0,pushes:0};}
 function next(s,p,dir){const d=Object.hasOwn(directions,dir)?directions[dir]:null;if(!d)return -1;const x=p%s.w+d[0],y=Math.floor(p/s.w)+d[1];return x<0||y<0||x>=s.w||y>=s.h?-1:y*s.w+x;}
 function step(s,dir){const p=next(s,s.player,dir);if(p<0||s.walls.includes(p))return s;let boxes=s.boxes,pushes=s.pushes;if(boxes.includes(p)){const q=next(s,p,dir);if(q<0||s.walls.includes(q)||boxes.includes(q))return s;boxes=boxes.map(b=>b===p?q:b);pushes++;}return {...s,player:p,boxes,moves:s.moves+1,pushes};}
 function won(s){return s.boxes.every(b=>s.goals.includes(b));}
 function stuck(s){return s.boxes.some(b=>!s.goals.includes(b)&&['up','down'].some(d=>s.walls.includes(next(s,b,d)))&&['left','right'].some(d=>s.walls.includes(next(s,b,d))));}
 function restore(index,moves){let s=load(index);const history=[s],valid=[];for(const d of moves){if(won(s))break;const n=step(s,d);if(n===s)continue;s=n;history.push(s);valid.push(d);}return {s,history,valid};}
 function solve(index){const start=load(index),q=[start],seen=new Set();for(let head=0;head<q.length&&head<120000;head++){const s=q[head];if(won(s))return s.pushes;const reachable=new Set([s.player]),walk=[s.player];for(const p of walk)for(const d of Object.keys(directions)){const n=next(s,p,d);if(n>=0&&!s.walls.includes(n)&&!s.boxes.includes(n)&&!reachable.has(n)){reachable.add(n);walk.push(n);}}const key=[Math.min(...reachable),...s.boxes.slice().sort((a,b)=>a-b)].join(',');if(seen.has(key))continue;seen.add(key);for(const p of reachable)for(const d of Object.keys(directions)){if(!s.boxes.includes(next(s,p,d)))continue;const n=step({...s,player:p},d);if(n.pushes!==s.pushes&&!stuck(n))q.push(n);}}return null;}
 return {levels,load,step,won,stuck,restore,solve};
}
const CircuitVault=makeEngine(LEVELS);
if(typeof module!=='undefined')module.exports=CircuitVault;
