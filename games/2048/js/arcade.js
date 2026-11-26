/* OpenArcade: controller, touch buttons and offline registration. MIT. */
(function () {
  "use strict";
  function move(direction) {
    if (window.openArcade2048) window.openArcade2048.inputManager.emit("move", direction);
  }
  document.querySelectorAll("[data-move]").forEach(function (button) {
    button.addEventListener("click", function () { move(Number(button.dataset.move)); });
  });
  var lastDirection = -1, lastTime = 0;
  function poll(now) {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var pad = Array.from(pads).find(Boolean);
    var direction = -1;
    if (pad) {
      var pressed = function (i) { return Boolean(pad.buttons[i] && pad.buttons[i].pressed); };
      var x = pad.axes[0] || 0, y = pad.axes[1] || 0;
      if (pressed(12) || y < -0.65) direction = 0;
      else if (pressed(15) || x > 0.65) direction = 1;
      else if (pressed(13) || y > 0.65) direction = 2;
      else if (pressed(14) || x < -0.65) direction = 3;
      if (!document.hidden && direction !== -1 && (direction !== lastDirection || now - lastTime >= 180)) {
        move(direction); lastTime = now;
      }
    }
    lastDirection = direction;
    requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("../../sw.js").catch(function () {});
})();
