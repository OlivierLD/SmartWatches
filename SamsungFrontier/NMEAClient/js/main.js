window.onload = function () {
	// TODO: Do your initialization job

	// add eventListener for tizenhwkey
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
			// console.log("Detent, clockwise");
			plusSlides(1);
		} else if (event.detail.direction === "CCW") {
			// console.log("Detent, counter-clockwise");
			plusSlides(-1);
		}
	}

	document.addEventListener("rotarydetent", rotEventHandler);
};
