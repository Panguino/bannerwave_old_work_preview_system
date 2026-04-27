/**
 * Dual end frames: landscape panel vs portrait panel (matchMedia max-aspect-ratio 1/1).
 * animation.min.js calls this when the end card tween completes so only the visible video plays.
 */
(function () {
  function portraitLayout() {
    return window.matchMedia("(max-aspect-ratio: 1/1)").matches;
  }

  window.troybiltEndframePlayVideo = function () {
    var all = document.querySelectorAll(".endframe-video");
    for (var i = 0; i < all.length; i++) {
      all[i].pause();
      all[i].currentTime = 0;
    }
    var root = portraitLayout()
      ? document.querySelector(".endframe-panel--portrait")
      : document.querySelector(".endframe-panel--landscape");
    if (!root) {
      return;
    }
    var v = root.querySelector(".endframe-video");
    if (!v) {
      return;
    }
    v.muted = true;
    var p = v.play();
    if (p && p.catch) {
      p.catch(function () {});
    }
  };
})();
