/*
 * REST Data look like
{
  "type": "ALL",
  "period": "LAST",
  "query": "SELECT ... ",
  "data": [
    {
      "time": "2018-12-12 02:46:11",
      "wdir": 306,
      "gust": 10.32,
      "ws": 7.87,
      "rain": 0,
      "press": 1020.67,
      "atemp": 17.5,
      "hum": 64.213,
      "dew": 10.676
    }
  ]
}
 */
"use strict";

const READY_STATE = {
	NOT_INITIALIZED: 0,
	SERVER_CONNECTION_ESTABLISHED: 1,
	REQUEST_RECEIVED: 2,
	PROCESSING_REQUEST: 3,
	REQUEST_FINISHED_RESPONSE_READY: 4
};

const STATUS = {
	OK: 200,
	FORBIDDEN: 403,
	NOT_FOUND: 404
};

function populateUI(data) {
	document.getElementById('ws').innerText = data.ws.toFixed(2);
	document.getElementById('gust').innerText = data.gust.toFixed(2);
	document.getElementById('wdir').innerText = data.wdir.toFixed(0);
	document.getElementById('press').innerText = data.press.toFixed(1);
	document.getElementById('atemp').innerText = data.atemp.toFixed(2);
	document.getElementById('dew').innerText = data.dew.toFixed(2);
	document.getElementById('hum').innerText = data.hum.toFixed(2);
	document.getElementById('rain').innerText = data.rain.toFixed(1);
	document.getElementById('last-update').innerText = data.time;
}

function getWeatherData() {
	// Do some REST Request here
	let url = "http://donpedro.lediouris.net/php/weather/reports.v2/json.data.php?type=ALL&period=LAST";
	let xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {
		if (xhr.readyState === READY_STATE.REQUEST_FINISHED_RESPONSE_READY && xhr.status === STATUS.OK) {
//    		console.log("XHR returns", xhr.responseText);
			let resp = JSON.parse(xhr.responseText);
			if (resp !== undefined && resp.data !== undefined && resp.data.length > 0) {
				console.log(JSON.stringify(resp, null, 2));
				let data = resp.data[0];
				try {
					populateUI(data);
				} catch (err) {
					console.log("Error:", err);
				}
			} else {
				console.log(JSON.stringify(resp, null, 2));
			}
		} else {
			let errMess = "XHR: State:" + xhr.status + "\nRS:" + xhr.readyState + ", " + xhr.statusText;
			console.log(errMess);
		}
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send();
	console.log("Weather data was requested");
}

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
			plusSlides(1);
		} else {
			/* right swipe */
			plusSlides(-1);
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

window.onload = function () {
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

	// Swipe detection
	document.addEventListener('touchstart', handleTouchStart);
	document.addEventListener('touchmove', handleTouchMove);

};
