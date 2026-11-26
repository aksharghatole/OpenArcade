/* Modified by OpenArcade, 2026-11-26. GPL-3.0-or-later; see ../LICENSE.md and ../UPSTREAM.md. */
/* OpenArcade native keyboard, pointer and standard controller input (GPL-3.0-or-later). */
function rotateHex(n){if(MainHex&&gameState===1)MainHex.rotate(n);}
function startOrResume(){if(gameState===0)startBtnHandler();else if(gameState===-1)pause();else if(gameState===2){init(1);$("#gameoverscreen").hide();}}
function setRush(on){if(!settings)return;settings.speedUpKeyHeld=on;window.rush=on?4:1;}
function addKeyListeners(){
 document.addEventListener("keydown",function(e){
   if(e.altKey||e.ctrlKey||e.metaKey||e.target.matches("input,textarea,button,a"))return;
   var key=e.key.toLowerCase();
   if(["arrowleft","arrowright","arrowdown","a","d","s","p"," ","enter","escape"].includes(key))e.preventDefault();else return;
   if(key==="arrowleft"||key==="a")rotateHex(1);
   else if(key==="arrowright"||key==="d")rotateHex(-1);
   else if(key==="arrowdown"||key==="s")setRush(gameState===1);
   else if(!e.repeat&&(key==="p"||key===" "||key==="escape")){pause();checkpoint();}
   else if(!e.repeat&&key==="enter")startOrResume();
 });
 document.addEventListener("keyup",function(e){if(["arrowdown","s"].includes(e.key.toLowerCase()))setRush(false);});
 window.addEventListener("blur",function(){setRush(false);checkpoint();});
 $("#pauseBtn").on("click",function(){pause();checkpoint();});
 $("#restartBtn,#restart").on("click",function(){init(1);$("#gameoverscreen").hide();});
 $("#openSideBar").on("click",function(){showHelp();});
 $("#arcade-left").on("click",function(){rotateHex(1);});
 $("#arcade-right").on("click",function(){rotateHex(-1);});
 var fast=document.getElementById("arcade-fast");fast.addEventListener("pointerdown",function(e){fast.setPointerCapture(e.pointerId);setRush(gameState===1);});["pointerup","pointercancel","lostpointercapture"].forEach(function(k){fast.addEventListener(k,function(){setRush(false);});});
 var last=-1,lastTime=0,lastA=false,lastStart=false,fastHeld=false;
 function poll(t){
   var pad=navigator.getGamepads&&Array.from(navigator.getGamepads()).find(Boolean);
   if(pad&&!document.hidden){
     var b=function(i){return Boolean(pad.buttons[i]&&pad.buttons[i].pressed);};
     var d=b(14)||pad.axes[0]<-.65?1:b(15)||pad.axes[0]>.65?-1:0;
     if(d&&(d!==last||t-lastTime>=160)){rotateHex(d);lastTime=t;}
     last=d;var a=b(0),st=b(9),speed=b(13)||pad.axes[1]>.65;
     if(a&&!lastA)startOrResume();
     if(st&&!lastStart){pause();checkpoint();}
     if(speed!==fastHeld){setRush(speed&&gameState===1);fastHeld=speed;}
     lastA=a;lastStart=st;
   }else {last=0;lastA=false;lastStart=false;if(fastHeld)setRush(false);fastHeld=false;}
   requestAnimationFrame(poll);
 }
 requestAnimationFrame(poll);
}
function inside (point, vs) {
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	
	var x = point[0], y = point[1];
	
	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i][0], yi = vs[i][1];
		var xj = vs[j][0], yj = vs[j][1];
		
		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	
	return inside;
};

function handleClickTap(x,y) {
	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
	var radius = settings.hexWidth ;
	var halfRadius = radius/2;
	var triHeight = radius *(Math.sqrt(3)/2);
	var Vertexes =[
		[radius,0],
		[halfRadius,-triHeight],
		[-halfRadius,-triHeight],
		[-radius,0],
		[-halfRadius,triHeight],
		[halfRadius,triHeight]];
	Vertexes = Vertexes.map(function(coord){ 
		return [coord[0] + trueCanvas.width/2, coord[1] + trueCanvas.height/2]});

	if (!MainHex || gameState === 0 || gameState==-1) {
		return;
	}

	if (x < window.innerWidth/2) {
		MainHex.rotate(1);
	}
	if (x > window.innerWidth/2) {
		MainHex.rotate(-1);
	}
}

