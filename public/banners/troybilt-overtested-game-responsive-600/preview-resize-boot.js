/* Ensure canvas / .game layout matches viewport after the WebGL path creates camera+renderer
   (same as a manual window resize). Safe no-ops when Three isn't ready yet. */
(function () {
	function runResize() {
		if (typeof onWindowResize === "function") {
			onWindowResize();
		} else {
			window.dispatchEvent(new Event("resize"));
		}
	}
	function nudge() {
		runResize();
		window.dispatchEvent(new Event("resize"));
	}
	window.addEventListener("load", function () {
		setTimeout(nudge, 0);
		setTimeout(nudge, 150);
		setTimeout(nudge, 500);
	});
	/* Mobile: URL bar show/hide updates visualViewport, not always window.innerHeight — keep WebGL sized */
	var vvScheduled = null;
	function scheduleFromVisualViewport() {
		if (vvScheduled != null) {
			return;
		}
		vvScheduled = window.requestAnimationFrame(function () {
			vvScheduled = null;
			runResize();
		});
	}
	if (window.visualViewport) {
		window.visualViewport.addEventListener("resize", scheduleFromVisualViewport);
		window.visualViewport.addEventListener("scroll", scheduleFromVisualViewport);
	}
	/* After Play inits o(), camera+renderer exist — poll a few seconds for manual timing skew */
	var poll = 0;
	var t = setInterval(function () {
		poll += 1;
		if (typeof window.camera !== "undefined" && window.camera && window.renderer) {
			nudge();
			setTimeout(nudge, 50);
			setTimeout(nudge, 200);
			clearInterval(t);
		} else if (poll > 100) {
			clearInterval(t);
		}
	}, 100);
})();
