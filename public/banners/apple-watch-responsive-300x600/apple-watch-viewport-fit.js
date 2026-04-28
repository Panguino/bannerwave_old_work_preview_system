/**
 * Below viewport height 750px: uniform scale + center the 300×675 stage (same math as _bw-viewport-fit.js).
 * At or above 750px: leave layout to CSS (stretching mode).
 * Requires TweenLite/TweenMax (loads after tweenmax). Pairs with html.bw-apple-watch-fit styles.
 */
(function () {
	var DESIGN_W = 300;
	var DESIGN_H = 675;
	var HEIGHT_THRESHOLD = 750;
	var selector = ".banner .stage";

	function getTL() {
		return window.TweenLite || window.TweenMax;
	}

	function getViewport() {
		var vv = window.visualViewport;
		if (vv && vv.width > 0 && vv.height > 0) {
			return { vw: vv.width, vh: vv.height };
		}
		return {
			vw: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			vh: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		};
	}

	function fit() {
		var TL = getTL();
		if (!TL) return;
		var root = document.querySelector(selector);
		if (!root) return;

		var docEl = document.documentElement;
		var vp = getViewport();
		var vw = vp.vw;
		var vh = vp.vh;

		if (vh >= HEIGHT_THRESHOLD) {
			docEl.classList.remove("bw-apple-watch-fit");
			TL.set(root, { clearProps: "transform" });
			if (typeof documentHeight === "function") {
				documentHeight();
			}
			return;
		}

		docEl.classList.add("bw-apple-watch-fit");
		document.documentElement.style.setProperty("--doc-height", DESIGN_H + "px");

		var s = Math.min(vw / DESIGN_W, vh / DESIGN_H);
		var x = Math.floor((vw - DESIGN_W * s) / 2);
		var y = Math.floor((vh - DESIGN_H * s) / 2);
		TL.set(root, {
			scale: s,
			transformOrigin: "0 0",
			x: x,
			y: y,
			force3D: true
		});
	}

	function ready() {
		if (!getTL()) {
			window.requestAnimationFrame(ready);
			return;
		}
		window.addEventListener("resize", fit);
		window.addEventListener("orientationchange", fit);
		if (window.visualViewport) {
			window.visualViewport.addEventListener("resize", fit);
		}
		window.requestAnimationFrame(fit);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", ready);
	} else {
		ready();
	}
})();
