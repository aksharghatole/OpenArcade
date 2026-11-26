'use strict';
// Original MIT-licensed Mosslight game engine.
function MossEngine(){
 const W=720,H=440,R=12;
 const stages=[
 {name:"The Rootgate",walls:[[225,70,36,230],[455,140,36,230]],lights:[[350,65],[350,365],[635,100]],enemies:[[340,180],[570,300]]},
 {name:"The Flooded Hall",walls:[[155,95,200,30],[365,310,200,30],[315,170,90,100]],lights:[[625,65],[80,360],[470,205]],enemies:[[600,200],[130,250],[500,80]]},
 {name:"The Thorn Court",walls:[[190,80,35,280],[350,0,30,130],[350,310,30,130],[510,80,35,280]],lights:[[285,55],[440,380],[635,100]],enemies:[[290,200],[450,220],[625,320],[90,80]]},
 {name:"The Broken Shrine",walls:[[150,105,150,35],[420,105,150,35],[150,300,150,35],[420,300,150,35],[325,180,70,80]],lights:[[360,55],[360,385],[650,220]],enemies:[[250,220],[470,220],[620,80],[100,350]]},
 {name:"The Last Lantern",walls:[[175,65,35,310],[510,65,35,310],[310,100,100,35],[310,305,100,35]],lights:[[85,70],[360,220],[635,370]],enemies:[[270,200],[450,240],[625,100],[90,350],[360,55]]}
 ];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function start(index=0){
  const s=stages[index];
  return {index,player:{x:55,y:220,hp:3,dirX:1,dirY:0,dash:0,cool:0,inv:0,attack:0,attackCool:0},walls:s.walls,lights:s.lights.map(([x,y])=>({x,y,taken:false})),enemies:s.enemies.map(([x,y],i)=>({x,y,hp:index===4?2:1,phase:i*1.8,hit:0})),gate:{x:675,y:220},time:0,status:"playing",collected:0};
 }
 function blocked(s,x,y,r=R){return x<r||x>W-r||y<r||y>H-r||s.walls.some(([a,b,w,h])=>Math.hypot(x-clamp(x,a,a+w),y-clamp(y,b,b+h))<r);}
 function move(s,obj,dx,dy,r=R){if(!blocked(s,obj.x+dx,obj.y,r))obj.x+=dx;if(!blocked(s,obj.x,obj.y+dy,r))obj.y+=dy;}
 function step(s,input,dt){
  if(s.status!=="playing")return s;
  dt=clamp(Number(dt)||0,0,0.033);s.time+=dt;
  const p=s.player;
  for(const k of ["dash","cool","inv","attack","attackCool"])p[k]=Math.max(0,p[k]-dt);
  let x=clamp(Number(input.x)||0,-1,1),y=clamp(Number(input.y)||0,-1,1);
  const len=Math.hypot(x,y);
  if(len>0.12&&p.dash===0){x/=Math.max(1,len);y/=Math.max(1,len);p.dirX=x/Math.hypot(x,y);p.dirY=y/Math.hypot(x,y);}
  if(input.dash&&p.cool===0){p.dash=.18;p.cool=1.1;p.inv=Math.max(p.inv,.25);}
  if(input.attack&&p.attackCool===0){
   p.attack=.22;p.attackCool=.42;
   for(const e of s.enemies)if(e.hp>0&&distance(p,e)<76){e.hp--;e.hit=.2;const d=distance(p,e)||1;move(s,e,(e.x-p.x)/d*20,(e.y-p.y)/d*20,11);}
  }
  const speed=p.dash>0?500:180;
  if(p.dash>0){x=p.dirX;y=p.dirY;}
  move(s,p,x*speed*dt,y*speed*dt);
  for(const l of s.lights)if(!l.taken&&distance(p,l)<25){l.taken=true;s.collected++;}
  for(const e of s.enemies){
   if(e.hp<=0)continue;
   e.hit=Math.max(0,e.hit-dt);
   const d=distance(e,p);
   let ex,ey;
   if(d<230){ex=(p.x-e.x)/(d||1);ey=(p.y-e.y)/(d||1);}else{ex=Math.cos(s.time*.75+e.phase);ey=Math.sin(s.time*.75+e.phase);}
   const v=39+s.index*8;
   const ox=e.x,oy=e.y;
   if(!e.hit)move(s,e,ex*v*dt,ey*v*dt,11);
   if(e.x===ox&&e.y===oy&&!e.hit)move(s,e,-ey*v*dt,ex*v*dt,11);
   if(distance(e,p)<24&&p.inv===0){p.hp--;p.inv=1.05;const sep=distance(e,p)||1;move(s,p,(p.x-e.x)/sep*25,(p.y-e.y)/sep*25);if(p.hp<=0){s.status="lost";return s;}}
  }
  if(s.collected===s.lights.length&&distance(p,s.gate)<25)s.status=s.index===stages.length-1?"won":"cleared";
  return s;
 }
 return {W,H,R,stages,start,blocked,move,step};
}
const Moss=MossEngine();
if(typeof module!=='undefined')module.exports=Moss;
