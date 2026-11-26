/* Adapted from Jake Gordon's javascript-tetris, MIT. Upstream e5c0c42f7dac0f3514a55eff656c6e22e95d68ed. See LICENSE. */
//-------------------------------------------------------------------------
    // base helper methods
    //-------------------------------------------------------------------------

    function get(id)        { return document.getElementById(id);  }
    function hide(id)       { get(id).style.visibility = 'hidden'; }
    function show(id)       { get(id).style.visibility = null;     }
    function html(id, html) { get(id).innerHTML = html;            }

    function timestamp()           { return new Date().getTime();                             }
    function random(min, max)      { return (min + (Math.random() * (max - min)));            }
    function randomChoice(choices) { return choices[Math.round(random(0, choices.length-1))]; }

    if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                     window.mozRequestAnimationFrame    ||
                                     window.oRequestAnimationFrame      ||
                                     window.msRequestAnimationFrame     ||
                                     function(callback, element) {
                                       window.setTimeout(callback, 1000 / 60);
                                     }
    }

    //-------------------------------------------------------------------------
    // game constants
    //-------------------------------------------------------------------------

    var KEY     = { ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 },
        DIR     = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3, MIN: 0, MAX: 3 },
        stats   = {update:function(){}},
        canvas  = get('canvas'),
        ctx     = canvas.getContext('2d'),
        ucanvas = get('upcoming'),
        uctx    = ucanvas.getContext('2d'),
        speed   = { start: 0.6, decrement: 0.005, min: 0.1 }, // how long before piece drops by 1 row (seconds)
        nx      = 12, // width of tetris court (in blocks)
        ny      = 22; // height of tetris court (in blocks)
        nu      = 5;  // width/height of upcoming preview (in blocks)

    //-------------------------------------------------------------------------
    // game variables (initialized during reset)
    //-------------------------------------------------------------------------

    var dx, dy,        // pixel size of a single tetris block
        blocks,        // 2 dimensional array (nx*ny) representing tetris court - either empty block or occupied by a 'piece'
        actions,       // queue of user actions (inputs)
        playing,       // true|false - game is in progress
        dt,            // time since starting this game
        current,       // the current piece
        next,          // the next piece
        score,         // the current score
        vscore,        // the currently displayed score (it catches up to score in small chunks - like a spinning slot machine)
        rows,          // number of completed rows in the current game
        step;          // how long before current piece drops by 1 row

    //-------------------------------------------------------------------------
    // tetris pieces
    //
    // blocks: each element represents a rotation of the piece (0, 90, 180, 270)
    //         each element is a 16 bit integer where the 16 bits represent
    //         a 4x4 set of blocks, e.g. j.blocks[0] = 0x44C0
    //
    //             0100 = 0x4 << 3 = 0x4000
    //             0100 = 0x4 << 2 = 0x0400
    //             1100 = 0xC << 1 = 0x00C0
    //             0000 = 0x0 << 0 = 0x0000
    //                               ------
    //                               0x44C0
    //
    //-------------------------------------------------------------------------

    var i = { size: 4, blocks: [0x0F00, 0x2222, 0x00F0, 0x4444], color: '#78bbb5'   };
    var j = { size: 3, blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: '#7886bf'   };
    var l = { size: 3, blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: '#cc9470' };
    var o = { size: 2, blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: '#e1c37c' };
    var s = { size: 3, blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], color: '#a4bb83'  };
    var t = { size: 3, blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: '#ab92bf' };
    var z = { size: 3, blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], color: '#cd8390'    };

    //------------------------------------------------
    // do the bit manipulation and iterate through each
    // occupied block (x,y) for a given piece
    //------------------------------------------------
    function eachblock(type, x, y, dir, fn) {
      var bit, result, row = 0, col = 0, blocks = type.blocks[dir];
      for(bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {
        if (blocks & bit) {
          fn(x + col, y + row);
        }
        if (++col === 4) {
          col = 0;
          ++row;
        }
      }
    }

    //-----------------------------------------------------
    // check if a piece can fit into a position in the grid
    //-----------------------------------------------------
    function occupied(type, x, y, dir) {
      var result = false
      eachblock(type, x, y, dir, function(x, y) {
        if ((x < 0) || (x >= nx) || (y < 0) || (y >= ny) || getBlock(x,y))
          result = true;
      });
      return result;
    }

    function unoccupied(type, x, y, dir) {
      return !occupied(type, x, y, dir);
    }

    //-----------------------------------------
    // start with 4 instances of each piece and
    // pick randomly until the 'bag is empty'
    //-----------------------------------------
    var pieces = [];
    function randomPiece() {
      if (pieces.length == 0)
        pieces = [i,i,i,i,j,j,j,j,l,l,l,l,o,o,o,o,s,s,s,s,t,t,t,t,z,z,z,z];
      var type = pieces.splice(random(0, pieces.length-1), 1)[0];
      return { type: type, dir: DIR.UP, x: Math.floor((nx - type.size)/2), y: 0 };
    }


    //-------------------------------------------------------------------------
    // GAME LOOP
    //-------------------------------------------------------------------------

    function run() {

      // Performance counter omitted: no external dependencies.
      addEvents(); // attach keydown and resize events

      var last = now = timestamp();
      function frame() {
        now = timestamp();
        pollPad();
        if(playing && !paused) update(Math.min(.1, (now - last) / 1000.0));
        if(playing && now-lastSaved>1000) save(); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
        draw();
        stats.update();
        last = now;
        requestAnimationFrame(frame, canvas);
      }

      resize(); // setup all our sizing information
      reset();  // reset the per-game variables
      restore();
      frame();  // start the first frame

    }

    function showStats() {
      stats.domElement.id = 'stats';
      get('menu').appendChild(stats.domElement);
    }

    function addEvents() {
      document.addEventListener('keydown', keydown, false);
      window.addEventListener('resize', resize, false);
    }

    function resize(event) {
      canvas.width   = canvas.clientWidth;  // set canvas logical size equal to its physical size
      canvas.height  = canvas.clientHeight; // (ditto)
      ucanvas.width  = ucanvas.clientWidth;
      ucanvas.height = ucanvas.clientHeight;
      dx = canvas.width  / nx; // pixel size of a single tetris block
      dy = canvas.height / ny; // (ditto)
      invalidate();
      invalidateNext();
    }

    function keydown(ev) {
      if(ev.target && /^(BUTTON|INPUT|A)$/.test(ev.target.tagName||'') && (ev.keyCode===32||ev.keyCode===13)) return;
      if(ev.keyCode===27||ev.keyCode===80){if(!ev.repeat)togglePause();ev.preventDefault();return;}
      if(paused)return;
      if(playing&&ev.keyCode===32){if(!ev.repeat)hardDrop();ev.preventDefault();return;}
      var handled = false;
      if (playing) {
        switch(ev.keyCode) {
          case KEY.LEFT:   actions.push(DIR.LEFT);  handled = true; break;
          case KEY.RIGHT:  actions.push(DIR.RIGHT); handled = true; break;
          case KEY.UP:     actions.push(DIR.UP);    handled = true; break;
          case KEY.DOWN:   actions.push(DIR.DOWN);  handled = true; break;
          case KEY.ESC:    lose();                  handled = true; break;
        }
      }
      else if (ev.keyCode == KEY.SPACE) {
        play();
        handled = true;
      }
      if (handled)
        ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
    }

    //-------------------------------------------------------------------------
    // GAME LOGIC
    //-------------------------------------------------------------------------

    function play() { pieces=[];next=null;reset();paused=false;playing=true;status('Playing');invalidate();save(); }
    function lose() { setVisualScore(); playing=false; paused=false; status('Game over'); invalidate(); clearSave(); }

    function setVisualScore(n)      { vscore = n || score; invalidateScore(); }
    function setScore(n)            { score = n; setVisualScore(n);  }
    function addScore(n)            { score = score + n;   }
    function clearScore()           { setScore(0); }
    function clearRows()            { setRows(0); }
    function setRows(n)             { rows = n; step = Math.max(speed.min, speed.start - (speed.decrement*rows)); invalidateRows(); }
    function addRows(n)             { setRows(rows + n); }
    function getBlock(x,y)          { return (blocks && blocks[x] ? blocks[x][y] : null); }
    function setBlock(x,y,type)     { blocks[x] = blocks[x] || []; blocks[x][y] = type; invalidate(); }
    function clearBlocks()          { blocks = []; invalidate(); }
    function clearActions()         { actions = []; }
    function setCurrentPiece(piece) { current = piece || randomPiece(); invalidate();     }
    function setNextPiece(piece)    { next    = piece || randomPiece(); invalidateNext(); }

    function reset() {
      dt = 0;
      clearActions();
      clearBlocks();
      clearRows();
      clearScore();
      setCurrentPiece(next);
      setNextPiece();
    }

    function update(idt) {
      if (playing) {
        if (vscore < score)
          setVisualScore(vscore + 1);
        handle(actions.shift());
        dt = dt + idt;
        if (dt > step) {
          dt = dt - step;
          drop();
        }
      }
    }

    function handle(action) {
      switch(action) {
        case DIR.LEFT:  move(DIR.LEFT);  break;
        case DIR.RIGHT: move(DIR.RIGHT); break;
        case DIR.UP:    rotate();        break;
        case DIR.DOWN:  drop();          break;
      }
    }

    function move(dir) {
      var x = current.x, y = current.y;
      switch(dir) {
        case DIR.RIGHT: x = x + 1; break;
        case DIR.LEFT:  x = x - 1; break;
        case DIR.DOWN:  y = y + 1; break;
      }
      if (unoccupied(current.type, x, y, current.dir)) {
        current.x = x;
        current.y = y;
        invalidate();
        return true;
      }
      else {
        return false;
      }
    }

    function rotate() {
      var newdir = (current.dir == DIR.MAX ? DIR.MIN : current.dir + 1);
      if (unoccupied(current.type, current.x, current.y, newdir)) {
        current.dir = newdir;
        invalidate();
      }
    }

    function drop() {
      if (!move(DIR.DOWN)) {
        addScore(10);
        dropPiece();
        removeLines();
        setCurrentPiece(next);
        setNextPiece(randomPiece());
        clearActions();
        if (occupied(current.type, current.x, current.y, current.dir)) {
          lose();
        }
      }
    }

    function dropPiece() {
      eachblock(current.type, current.x, current.y, current.dir, function(x, y) {
        setBlock(x, y, current.type);
      });
    }

    function removeLines() {
      var x, y, complete, n = 0;
      for(y = ny-1 ; y >= 0 ; --y) {
        complete = true;
        for(x = 0 ; x < nx ; ++x) {
          if (!getBlock(x, y))
            complete = false;
        }
        if (complete) {
          removeLine(y);
          y = y + 1; // recheck same line
          n++;
        }
      }
      if (n > 0) {
        addRows(n);
        addScore(100*Math.pow(2,n-1)); // 1: 100, 2: 200, 3: 400, 4: 800
      }
    }

    function removeLine(n) {
      var x, y;
      for(y = n ; y >= 0 ; --y) {
        for(x = 0 ; x < nx ; ++x)
          setBlock(x, y, (y == 0) ? null : getBlock(x, y-1));
      }
    }

    //-------------------------------------------------------------------------
    // RENDERING
    //-------------------------------------------------------------------------

    var invalid = {};

    function invalidate()         { invalid.court  = true; }
    function invalidateNext()     { invalid.next   = true; }
    function invalidateScore()    { invalid.score  = true; }
    function invalidateRows()     { invalid.rows   = true; }

    function draw() {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.translate(0.5, 0.5); // for crisp 1px black lines
      drawCourt();
      drawNext();
      drawScore();
      drawRows();
      ctx.restore();
    }

    function drawCourt() {
      if (invalid.court) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (playing)
          drawPiece(ctx, current.type, current.x, current.y, current.dir);
        var x, y, block;
        for(y = 0 ; y < ny ; y++) {
          for (x = 0 ; x < nx ; x++) {
            if (block = getBlock(x,y))
              drawBlock(ctx, x, y, block.color);
          }
        }
        ctx.strokeRect(0, 0, nx*dx - 1, ny*dy - 1); // court boundary
        invalid.court = false;
      }
    }

    function drawNext() {
      if (invalid.next) {
        var padding = (nu - next.type.size) / 2; // half-arsed attempt at centering next piece display
        uctx.save();
        uctx.translate(0.5, 0.5);
        uctx.clearRect(0, 0, ucanvas.width, ucanvas.height);
        drawPiece(uctx, next.type, padding, padding, next.dir);
        uctx.strokeStyle = 'black';
        uctx.strokeRect(0, 0, ucanvas.width - 1, ucanvas.height - 1);
        uctx.restore();
        invalid.next = false;
      }
    }

    function drawScore() {
      if (invalid.score) {
        html('score', String(Math.floor(vscore)).padStart(5,'0'));
        invalid.score = false;
      }
    }

    function drawRows() {
      if (invalid.rows) {
        html('rows', rows);
        invalid.rows = false;
      }
    }

    function drawPiece(ctx, type, x, y, dir) {
      eachblock(type, x, y, dir, function(x, y) {
        drawBlock(ctx, x, y, type.color);
      });
    }

    function drawBlock(ctx, x, y, color) {
      ctx.fillStyle = color;
      var w=ctx===uctx?ucanvas.width/nu:dx, h=ctx===uctx?ucanvas.height/nu:dy;
      ctx.fillRect(x*w+1, y*h+1, w-2, h-2);
      ctx.strokeStyle='#14252b';ctx.strokeRect(x*w+1,y*h+1,w-2,h-2);
    }

    //-------------------------------------------------------------------------
    // FINALLY, lets run the game
    //-------------------------------------------------------------------------


    // OpenArcade adaptation: pause, input, validated local save and isolated storage.
    var paused=false, lastSaved=0, padBefore=[], saveKey='openarcade-falling-blocks-v1';
    var types=[i,j,l,o,s,t,z];
    function status(message){get('status').textContent=message;get('pause').textContent=paused?'Resume':'Pause';get('start').textContent=playing?'New game':'Start game';}
    function hardDrop(){if(!playing||paused)return;while(move(DIR.DOWN)){}drop();if(playing)save();}
    function togglePause(){if(!playing)return;paused=!paused;clearActions();status(paused?'Paused':'Playing');save();}
    function encodePiece(p){return {type:types.indexOf(p.type),x:p.x,y:p.y,dir:p.dir};}
    function decodePiece(p){if(!p||!Number.isInteger(p.type)||p.type<0||p.type>=types.length||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!Number.isInteger(p.dir)||p.dir<0||p.dir>3||p.x<-3||p.x>=nx||p.y<0||p.y>=ny)throw Error('bad piece');return {type:types[p.type],x:p.x,y:p.y,dir:p.dir};}
    function snapshot(){return {v:1,grid:Array.from({length:nx},(_,x)=>Array.from({length:ny},(_,y)=>getBlock(x,y)?types.indexOf(getBlock(x,y)):-1)),current:encodePiece(current),next:encodePiece(next),bag:pieces.map(p=>types.indexOf(p)),score,rows,dt};}
    function save(){if(!playing)return;lastSaved=timestamp();try{localStorage.setItem(saveKey,JSON.stringify(snapshot()));get('save').textContent='Checkpoint saved on this device';}catch(e){get('save').textContent='Local storage unavailable';}}
    function clearSave(){try{localStorage.removeItem(saveKey);}catch(e){}get('save').textContent='No active checkpoint';}
    function restore(){try{var data=JSON.parse(localStorage.getItem(saveKey)||'null');if(!data)return;if(data.v!==1||!Array.isArray(data.grid)||data.grid.length!==nx||!data.grid.every(col=>Array.isArray(col)&&col.length===ny&&col.every(v=>Number.isInteger(v)&&v>=-1&&v<types.length))||!Array.isArray(data.bag)||data.bag.length>28||!data.bag.every(v=>Number.isInteger(v)&&v>=0&&v<types.length)||!Number.isSafeInteger(data.score)||data.score<0||!Number.isSafeInteger(data.rows)||data.rows<0||!Number.isFinite(data.dt)||data.dt<0||data.dt>1)throw Error('bad save');var cp=decodePiece(data.current),np=decodePiece(data.next);blocks=data.grid.map(col=>col.map(v=>v===-1?null:types[v]));if(occupied(cp.type,cp.x,cp.y,cp.dir))throw Error('blocked save');current=cp;next=np;pieces=data.bag.map(v=>types[v]);setScore(data.score);setRows(data.rows);dt=data.dt;playing=true;paused=true;clearActions();invalidate();invalidateNext();status('Saved game ready — resume');get('save').textContent='Restored local checkpoint';}catch(e){reset();playing=false;paused=false;clearSave();status('Ready');}}
    function command(action){if(action==='pause'){togglePause();return;}if(!playing||paused)return;if(action==='hard'){hardDrop();return;}handle(({left:DIR.LEFT,right:DIR.RIGHT,rotate:DIR.UP,down:DIR.DOWN})[action]);}
    function pollPad(){var g;try{g=Array.from(navigator.getGamepads?navigator.getGamepads():[]).find(Boolean);}catch(e){}if(!g){padBefore=[];return;}var p=n=>!!(g.buttons[n]&&g.buttons[n].pressed);var a=[p(14)||g.axes[0]<-.5,p(15)||g.axes[0]>.5,p(13)||g.axes[1]>.5,p(0)||p(12),p(1),p(9)];var map=['left','right','down','rotate','hard','pause'];a.forEach((down,k)=>{if(down&&!padBefore[k]){if(k===5&&!playing)play();else command(map[k]);}});padBefore=a;}
    function wire(){get('start').addEventListener('click',()=>{if(playing&&!confirm('Start over and replace the saved game?'))return;play();});get('pause').addEventListener('click',togglePause);document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>command(b.dataset.action)));window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)togglePause();});if('serviceWorker'in navigator)navigator.serviceWorker.register('../../sw.js').catch(()=>{});status('Ready');}
    wire();

    run();

  
