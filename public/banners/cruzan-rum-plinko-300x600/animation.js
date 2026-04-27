function getPageXY(e) {
	if (e.pageX != null && e.pageY != null) {
		return { x: e.pageX, y: e.pageY };
	}
	var t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
	if (t) {
		return { x: t.pageX, y: t.pageY };
	}
	return { x: 0, y: 0 };
}

function followPointer(e) {
	hasInteracted = true;
	var p = getPageXY(e);
	xPos = p.x;
	yPos = p.y;
	mouseoffsetY = 222;
	mouseoffsetX = 89;
	TweenLite.set(token, { x: xPos - mouseoffsetX + "px", y: yPos - mouseoffsetY + "px" });
}

function onPointerDownWithCapture(e) {
	followPointer(e);
	if (e.pointerId != null) {
		try {
			gameHit.setPointerCapture(e.pointerId);
		} catch (err) {}
	}
}

function onPointerUpCommitDrop(e) {
	if (e.pointerType === "mouse" && e.button !== 0) {
		return;
	}
	// One gesture ends here: drop the chip (replaces click, which is unreliable after touch+preventDefault on move).
	dropToken();
}

function onTouchForDrag(e) {
	followPointer(e);
	if (e.type === "touchmove") {
		e.preventDefault();
	}
}

function onTouchEndCommitDrop(e) {
	// Same role as pointerup: syntactic click is often not fired after touchmove + preventDefault.
	dropToken();
	try {
		e.preventDefault();
	} catch (err) {}
}

function unbindInputHandlers() {
	if (window.PointerEvent) {
		gameHit.removeEventListener("pointerdown", onPointerDownWithCapture);
		gameHit.removeEventListener("pointermove", followPointer);
		gameHit.removeEventListener("pointerup", onPointerUpCommitDrop);
	} else {
		gameHit.removeEventListener("mousemove", followPointer);
		gameHit.removeEventListener("touchstart", onTouchForDrag);
		gameHit.removeEventListener("touchmove", onTouchForDrag);
		gameHit.removeEventListener("touchend", onTouchEndCommitDrop);
	}
}

function onClickCommitDrop() {
	dropToken();
}

function gameInit() {
	if (window.PointerEvent) {
		gameHit.addEventListener("pointerdown", onPointerDownWithCapture);
		gameHit.addEventListener("pointermove", followPointer);
		gameHit.addEventListener("pointerup", onPointerUpCommitDrop);
	} else {
		gameHit.addEventListener("mousemove", followPointer);
		gameHit.addEventListener("touchstart", onTouchForDrag, { passive: true });
		gameHit.addEventListener("touchmove", onTouchForDrag, { passive: false });
		gameHit.addEventListener("touchend", onTouchEndCommitDrop, { passive: false });
		// click still works for mouse on platforms without full pointer/touch end handling
		gameHit.addEventListener("click", onClickCommitDrop);
	}
}

function IEcontrols() {
	gameHit.attachEvent("onmouseover", function() {
		alert("works");
	});
}

function dropToken() {
	// Prevents double entry from pointerup + click (or double touchend).
	if (gameHit.style.visibility === "hidden") {
		return;
	}
	updatetokenX();
	unbindInputHandlers();
	if (!window.PointerEvent) {
		gameHit.removeEventListener("click", onClickCommitDrop);
	}
	gameHit.style.visibility = "hidden";
	if (xPos <= 63) TweenLite.to(token, 0.2, { x: 7 - offsetX, ease: Bounce.easeOut });
	if (xPos > 63 && xPos <= 122) TweenLite.to(token, 0.2, { x: 67 - offsetX, ease: Bounce.easeOut });
	if (xPos > 122 && xPos <= 180) TweenLite.to(token, 0.2, { x: 123 - offsetX, ease: Bounce.easeOut });
	if (xPos > 180 && xPos <= 238) TweenLite.to(token, 0.2, { x: 181 - offsetX, ease: Bounce.easeOut });
	if (xPos > 238) TweenLite.to(token, 0.2, { x: 239 - offsetX, ease: Bounce.easeOut });
	TweenLite.to(token, 0.5, { y: 209 - offsetY, ease: Bounce.easeOut, onComplete: MoveX });
}

function MoveX() {
	var e = 0.7;
	theCount++;
	var t = Math.floor(2 * Math.random() + 1);
	if (theCount < 5) {
		updatetokenX();
		if (tokenX <= 9) {
			TweenLite.to(token, 0.8 * e, { rotation: "+=40", x: "+=28", ease: Bounce.easeOut });
			TweenLite.to(token, 0.6 * e, { y: "+=45", onComplete: MoveX, ease: Bounce.easeOut, delay: 0.3 * e });
		} else if (tokenX >= 209) {
			TweenLite.to(token, 0.8 * e, { rotation: "-=40", x: "-=28", ease: Bounce.easeOut });
			TweenLite.to(token, 0.6 * e, { y: "+=45", onComplete: MoveX, ease: Bounce.easeOut, delay: 0.3 * e });
		} else if (t === 1) {
			TweenLite.to(token, 0.8 * e, { rotation: "+=40", x: "+=28", ease: Bounce.easeOut });
			TweenLite.to(token, 0.6 * e, { y: "+=45", onComplete: MoveX, ease: Bounce.easeOut, delay: 0.3 * e });
		} else {
			TweenLite.to(token, 0.8 * e, { rotation: "-=40", x: "-=28", ease: Bounce.easeOut });
			TweenLite.to(token, 0.6 * e, { y: "+=45", onComplete: MoveX, ease: Bounce.easeOut, delay: 0.3 * e });
		}
	} else {
		updatetokenX();
		if (tokenX < 9) {
			TweenLite.to(token, 0.8 * e, { rotation: "+=40", x: "+=28", ease: Bounce.easeOut });
			endX = token._gsTransform.x + 28;
			dropToDrink();
		} else if (tokenX >= 185) {
			TweenLite.to(token, 0.8 * e, { rotation: "-=40", x: "-=28", ease: Bounce.easeOut });
			endX = token._gsTransform.x - 28;
			dropToDrink();
		} else if (t === 1) {
			TweenLite.to(token, 0.8 * e, { rotation: "+=40", x: "+=28", ease: Bounce.easeOut });
			endX = token._gsTransform.x + 28;
			dropToDrink();
		} else {
			TweenLite.to(token, 0.8 * e, { rotation: "-=40", x: "-=28", ease: Bounce.easeOut });
			endX = token._gsTransform.x - 28;
			dropToDrink();
		}
	}
}

function dropToDrink() {
	var e = 0.7;
	console.log(endX);
	if (endX >= -35 && endX <= -24) TweenLite.to(token, 0.3 * e, { y: 539 - offsetY, x: -37, onComplete: getRecipe, ease: Bounce.easeOut, delay: 0.3 * e });
	if (endX >= 23 && endX <= 35) TweenLite.to(token, 0.3 * e, { y: 539 - offsetY, x: 31, onComplete: getRecipe, ease: Bounce.easeOut, delay: 0.3 * e });
	if (endX >= 80 && endX <= 95) TweenLite.to(token, 0.3 * e, { y: 539 - offsetY, x: 90, onComplete: getRecipe, ease: Bounce.easeOut, delay: 0.3 * e });
	if (endX >= 135 && endX <= 149) TweenLite.to(token, 0.3 * e, { y: 539 - offsetY, x: 155, onComplete: getRecipe, ease: Bounce.easeOut, delay: 0.3 * e });
}

function updatetokenX() {
	tokenX = token._gsTransform.x + 40;
}

function getRecipe() {
	updatetokenX();
	if (tokenX < 50) {
		TweenLite.to(shadow2, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow3, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow4, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(recipe1, 0.5, { alpha: 1, delay: 0.8 });
		TweenLite.set(recipeBTN, { css: { top: "394px" } });
		TweenLite.set(replayBTN, { css: { top: "394px" } });
	}
	if (tokenX >= 50 && tokenX < 119) {
		TweenLite.to(shadow3, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow4, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow1, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(recipe2, 0.5, { alpha: 1, delay: 0.8 });
		TweenLite.set(recipeBTN, { css: { top: "404px" } });
		TweenLite.set(replayBTN, { css: { top: "404px" } });
	}
	if (tokenX >= 119 && tokenX < 179) {
		TweenLite.to(shadow4, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow1, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow2, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(recipe3, 0.5, { alpha: 1, delay: 0.8 });
		TweenLite.set(recipeBTN, { css: { top: "380px" } });
		TweenLite.set(replayBTN, { css: { top: "380px" } });
	}
	if (tokenX >= 179) {
		TweenLite.to(shadow1, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow2, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(shadow3, 0.5, { alpha: 0.45, delay: 0.2 });
		TweenLite.to(recipe4, 0.5, { alpha: 1, delay: 0.8 });
		TweenLite.set(recipeBTN, { css: { top: "394px" } });
		TweenLite.set(replayBTN, { css: { top: "394px" } });
	}
	TweenLite.to(token, 0.5, { alpha: 0, delay: 0.8 });
	TweenLite.to(recipeWood, 0.5, { alpha: 1, delay: 0.8 });
	TweenLite.to(instructions, 1, { alpha: 0, delay: 0.8 });
	TweenLite.to(playBTN, 1, { alpha: 1, delay: 0.8 });
	TweenLite.to(recipeBTN, 1, { alpha: 1, delay: 0.8 });
	cta.style.visibility = "visible";
	replayBTN.style.visibility = "visible";
}

function replay() {
	unbindInputHandlers();
	if (!window.PointerEvent) {
		gameHit.removeEventListener("click", onClickCommitDrop);
	}
	gameHit.style.visibility = "visible";
	TweenLite.to(recipeWood, 0.15, { alpha: 0 });
	TweenLite.to(recipe1, 0.15, { alpha: 0 });
	TweenLite.to(recipe2, 0.15, { alpha: 0 });
	TweenLite.to(recipe3, 0.15, { alpha: 0 });
	TweenLite.to(recipe4, 0.15, { alpha: 0 });
	TweenLite.to(shadow1, 0.15, { alpha: 0 });
	TweenLite.to(shadow2, 0.15, { alpha: 0 });
	TweenLite.to(shadow3, 0.15, { alpha: 0 });
	TweenLite.to(shadow4, 0.15, { alpha: 0 });
	TweenLite.to(shadow1, 0.15, { alpha: 0 });
	TweenLite.to(diamond, 0.15, { alpha: 0 });
	TweenLite.to(playBTN, 0.15, { alpha: 0 });
	TweenLite.to(recipeBTN, 0.15, { alpha: 0 });
	TweenLite.to(instructions, 0.15, { alpha: 1 });
	TweenLite.set(token, { alpha: 1 });
	TweenLite.set(token, { x: 0, y: -10, rotation: 0 });
	cta.style.visibility = "hidden";
	replayBTN.style.visibility = "hidden";
	theCount = 0;
	gameInit();
}

var maintl;
(function() {
	maintl = new TimelineMax();
	maintl
		.add("frame0")
		.set(".ribbonLeft", { rotation: -180, transformOrigin: "0% 0%" }, "frame0")
		.to(".stage", 0.2, { autoAlpha: 1 }, "frame0")
		.from(".meticulously", 0.5, { autoAlpha: 0, y: 10, ease: Power4.easeOut }, "frame0+=.4")
		.from(".crafted-on-the", 0.5, { autoAlpha: 0, y: 10, ease: Power4.easeOut }, "frame0+=.5")
		.from(".island", 0.5, { autoAlpha: 0, y: 10, ease: Power4.easeOut }, "frame0+=.6")
		.from(".ribbonLeft", 0.5, { width: 0, transformOrigin: "0% 0%", ease: Power4.easeOut }, "frame0+=.6")
		.from(".ribbonRight", 0.5, { width: 0, ease: Power4.easeOut }, "frame0+=.6")
		.from(".of-st-croix", 0.5, { autoAlpha: 0, y: 10, ease: Power4.easeOut }, "frame0+=.7")
		.from(".stamp", 0.5, { autoAlpha: 0, scale: 0.8, rotation: "+=25" }, "frame0+=1")
		.add("frame1", "+=1.2")
		.to(".frame2", 0.8, { alpha: 1 }, "frame1")
		.from(".logo", 0.5, { autoAlpha: 0 }, "frame1+=.5")
		.from(".instructions", 0.5, { autoAlpha: 0, onComplete: gameInit }, "frame1+=.8")
		.seek(0);
})();

var xPos,
	yPos,
	mouseoffsetY,
	mouseoffsetX,
	offsetY,
	offsetX,
	tokenX,
	endX;
offsetY = 200;
offsetX = 66;

var gameHit = document.getElementById("game-hit-area"),
	token = document.getElementById("token"),
	cta = document.getElementById("cta"),
	recipeBTN = document.getElementById("recipeBTN"),
	replayBTN = document.getElementById("replay");
replayBTN.addEventListener("click", replay);
var shadow1 = document.getElementsByClassName("shadow1"),
	shadow2 = document.getElementsByClassName("shadow2"),
	shadow3 = document.getElementsByClassName("shadow3"),
	shadow4 = document.getElementsByClassName("shadow4"),
	instructions = document.getElementsByClassName("instructions"),
	diamond = document.getElementsByClassName("diamond-in-the-rum"),
	playBTN = document.getElementsByClassName("play-again"),
	recipeWood = document.getElementsByClassName("recipe-wood"),
	recipe1 = document.getElementsByClassName("mojito-recipe"),
	recipe2 = document.getElementsByClassName("blue-fizz-recipe"),
	recipe3 = document.getElementsByClassName("confusion-recipe"),
	recipe4 = document.getElementsByClassName("old-fashioned-recipe"),
	hasInteracted = false,
	autoPlayStart = 8000;

setTimeout(function() {
	if (!hasInteracted) TweenLite.to(token, 0.5, { y: 50 - offsetY, onComplete: dropToken });
}, autoPlayStart);
var theCount = 0;
