/**
 * Uniform scale + center for BW previews (pairs with _bw-fill-viewport.css).
 * Expects data-bw-design-w / data-bw-design-h on <html>, optional data-bw-fit-selector (default .banner .stage).
 * Requires TweenLite or TweenMax on window (load after GSAP).
 */
(function () {
	var doc = document.documentElement;
	if (!doc.classList.contains("bw-fill-viewport")) return;

	var designW = parseFloat(doc.getAttribute("data-bw-design-w") || "300", 10);
	var designH = parseFloat(doc.getAttribute("data-bw-design-h") || "600", 10);
	var selector = doc.getAttribute("data-bw-fit-selector") || ".banner .stage";

	function getTL() {
		return window.TweenLite || window.TweenMax;
	}

	function fit() {
		var TL = getTL();
		if (!TL) return;
		var root = document.querySelector(selector);
		if (!root) return;
		var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var s = Math.min(vw / designW, vh / designH);
		var x = Math.floor((vw - designW * s) / 2);
		var y = Math.floor((vh - designH * s) / 2);
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
		window.requestAnimationFrame(fit);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", ready);
	} else {
		ready();
	}
})();
