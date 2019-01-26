"use strict";

const MAIN_DEBUG = false;

// Left-right swipe gesture management
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
	xDown = evt.touches[0].clientX;
	yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
	if (!xDown || !yDown) {
		return;
	}
	var xUp = evt.touches[0].clientX;
	var yUp = evt.touches[0].clientY;
	var xDiff = xDown - xUp;
	var yDiff = yDown - yUp;

	// most significant
	if (Math.abs(xDiff) > Math.abs(yDiff)) { // Left-right
		if (xDiff > 0) {
			/* left swipe */
			flipSlides(1);
		} else {
			/* right swipe */
			flipSlides(-1);
		}
	} else { // Up-Down, not needed here (yet...)
		if (yDiff > 0) {
			/* up swipe */
		} else {
			/* down swipe */
		}
	}
	/* reset values */
	xDown = null;
	yDown = null;
}


function initMain() {
	if (MAIN_DEBUG) {
		console.log("Main initMain");
	}
	document.addEventListener('tizenhwkey', function (e) {
		if (e.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		}
	});

	function rotEventHandler(event) {
		// console.log("Rotary HW Event", event, event.detail.direction);

		if (event.detail.direction === "CW") {
			if (MAIN_DEBUG) {
				console.log("Detent, clockwise");
			}
			flipSlides(1);
		} else if (event.detail.direction === "CCW") {
			if (MAIN_DEBUG) {
				console.log("Detent, counter-clockwise");
			}
			flipSlides(-1);
		}
	}

	document.addEventListener("rotarydetent", rotEventHandler);
	// Swipe detection
	document.addEventListener('touchstart', handleTouchStart);
	document.addEventListener('touchmove', handleTouchMove);

	initAjax(); // REST request loop

}
