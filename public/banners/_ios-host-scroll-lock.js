/**
 * Used when a banner is opened as the top document (/banners/.../index.html) or
 * inside our preview iframe — reduces iOS rubber-banding and page scroll so
 * touch/drag on the ad is not fighting vertical scroll. Idempotent.
 *
 * Add to each creative's index.html before </body>:
 *   <script src="/banners/_ios-host-scroll-lock.js" defer></script>
 */
(function () {
	var STYLE_ID = "bw-ios-host-scroll-lock";

	function apply() {
		if (document.getElementById(STYLE_ID)) {
			return;
		}
		var s = document.createElement("style");
		s.id = STYLE_ID;
		s.textContent =
			"html,body{overflow:hidden!important;overscroll-behavior:none!important;height:100%!important;width:100%!important;margin:0!important;}" +
			"html{-webkit-text-size-adjust:100%;touch-action:manipulation;}" +
			"body{position:fixed!important;inset:0!important;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}";
		document.documentElement.appendChild(s);

		var m = document.querySelector('meta[name="viewport"]');
		if (m) {
			var c = m.getAttribute("content") || "";
			if (c && !/maximum-scale\s*=/i.test(c)) {
				m.setAttribute("content", c + ", maximum-scale=1, user-scalable=no, viewport-fit=cover");
			}
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", apply, { once: true });
	} else {
		apply();
	}
})();
