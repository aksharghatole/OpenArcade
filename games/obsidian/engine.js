/* SPDX-License-Identifier: MIT */
'use strict';
const Obsidian = (function createEngine(){
 const initial=()=>{const board=Array(64).fill(0);board[27]=board[36]=2;board[28]=board[35]=1;return {board,turn:1,passes:0,over:false}};
 const directions=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
 function flips(board,index,player){if(!Number.isInteger(index)||index<0||index>=64||board[index]!==0)return [];let out=[];for(const [dr,dc] of directions){let row=(index>>3)+dr,col=index%8+dc,line=[];while(row>=0&&row<8&&col>=0&&col<8&&board[row*8+col]===3-player){line.push(row*8+col);row+=dr;col+=dc}if(line.length&&row>=0&&row<8&&col>=0&&col<8&&board[row*8+col]===player)out.push(...line)}return out}
 const moves=(board,player)=>board.flatMap((v,i)=>v===0&&flips(board,i,player).length?[i]:[]);
 function play(state,index){if(state.over)return null;const captured=flips(state.board,index,state.turn);if(!captured.length)return null;const board=state.board.slice();board[index]=state.turn;for(const i of captured)board[i]=state.turn;let turn=3-state.turn,passes=0,over=false;if(!moves(board,turn).length){turn=state.turn;passes=1;if(!moves(board,turn).length){over=true;passes=2}}return {board,turn,passes,over}}
 const score=board=>[board.filter(x=>x===1).length,board.filter(x=>x===2).length];
 const weights=[120,-25,20,5,5,20,-25,120,-25,-45,-5,-5,-5,-5,-45,-25,20,-5,15,3,3,15,-5,20,5,-5,3,3,3,3,-5,5,5,-5,3,3,3,3,-5,5,20,-5,15,3,3,15,-5,20,-25,-45,-5,-5,-5,-5,-45,-25,120,-25,20,5,5,20,-25,120];
 function evaluate(s,p){const [a,b]=score(s.board),diff=p===1?a-b:b-a;if(s.over)return diff===0?0:Math.sign(diff)*10000+diff;let pos=0;for(let i=0;i<64;i++)pos+=weights[i]*(s.board[i]===p?1:s.board[i]===3-p?-1:0);return pos+7*(moves(s.board,p).length-moves(s.board,3-p).length)+(a+b>50?4:0.25)*diff}
 function choose(s,level=2){const p=s.turn,legal=moves(s.board,p);if(s.over||!legal.length)return null;if(level===1)return legal.reduce((best,i)=>flips(s.board,i,p).length>flips(s.board,best,p).length?i:best,legal[0]);const depth=level===3?4:2;function search(n,d,alpha,beta){if(n.over||d===0)return evaluate(n,p);const max=n.turn===p;let v=max?-Infinity:Infinity;const opts=moves(n.board,n.turn).sort((a,b)=>weights[b]-weights[a]);for(const i of opts){const t=search(play(n,i),d-1,alpha,beta);if(max){v=Math.max(v,t);alpha=Math.max(alpha,v)}else{v=Math.min(v,t);beta=Math.min(beta,v)}if(beta<=alpha)break}return v}let best=legal[0],value=-Infinity;for(const i of legal){const v=search(play(s,i),depth-1,value,Infinity);if(v>value){value=v;best=i}}return best}
 function valid(s){if(!s||!Array.isArray(s.board)||s.board.length!==64||!s.board.every(x=>[0,1,2].includes(x))||![1,2].includes(s.turn)||typeof s.over!=="boolean"||![0,1,2].includes(s.passes)||s.board.filter(Boolean).length<4)return false;const own=moves(s.board,s.turn).length,other=moves(s.board,3-s.turn).length;return s.over?s.passes===2&&!own&&!other:s.passes!==2&&own>0&&(s.passes!==1||!other)}
 return {initial,flips,moves,play,score,choose,valid};
})();
if(typeof module!=='undefined')module.exports=Obsidian;
