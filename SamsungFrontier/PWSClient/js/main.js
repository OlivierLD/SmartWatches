/*
 * C'est MOI qui l'ai fait.
 *
 */
"use strict";

const STATUS = {
    OK: 200,
    OK_TOO: 201,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408
};

const DEBUG = false;
const DEFAULT_TIMEOUT = 60000; // 1 minute

// let serverURL = "http://192.168.42.27:8088"; // Watering System server
let defaultServerIp = "192.168.42.27"; // Use "localhost" for Preview and Tests. Works fine.
let defaultServerPort = "8088";

// See https://developer.tizen.org/community/code-snippet/web-code-snippet/storing-data-html5-local-storage

let serverIp = localStorage.getItem("pwsServerIp");
let serverPortStr = localStorage.getItem("pwsServerPort");

if (serverIp === null || serverIp === undefined) {
	serverIp = defaultServerIp;
}
if (serverPortStr === null || serverPortStr === undefined) {
	serverPortStr = defaultServerPort;
}
let serverPort = Number(serverPortStr);
let serverUrl = 'http://' + serverIp + ':' + serverPort;

/* Uses ES6 Promises */
function getPromise(
    url, // full api path
    timeout, // After that, fail.
    verb, // GET, PUT, DELETE, POST, etc
    happyCode, // if met, resolve, otherwise fail.
    data, // payload, when needed (PUT, POST...)
    show) { // Show the traffic [true]|false

    if (show === true) {
        document.body.style.cursor = 'wait';
    }

    if (DEBUG) {
        console.log(">>> Promise", verb, url);
    }

    let promise = new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        let TIMEOUT = timeout;

        let req = verb + " " + url;
        if (data !== undefined && data !== null) {
            req += ("\n" + JSON.stringify(data, null, 2));
        }

        xhr.open(verb, url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Accept", "text/plain");
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        try {
            if (data === undefined || data === null) {
                xhr.send();
            } else {
                xhr.send(data);
            }
        } catch (err) {
            console.log("Send Error ", err);
        }

        let requestTimer = setTimeout(function() {
            xhr.abort();
            let mess = {
                code: STATUS.TIMEOUT,
                message: 'Timeout'
            };
            reject(mess);
        }, TIMEOUT);

        xhr.onload = function() {
            clearTimeout(requestTimer);
            if (xhr.status === happyCode) {
                resolve(xhr.response);
            } else {
                reject({
                    code: xhr.status,
                    message: xhr.response
                });
            }
        };
    });
    return promise;
}

function getRelayStatus() {
    return getPromise(serverUrl + '/pws/relay-state', DEFAULT_TIMEOUT, 'GET', STATUS.OK);
}

function getSensorData (){
	return getPromise(serverUrl + '/pws/sensor-data', DEFAULT_TIMEOUT, 'GET', STATUS.OK);
}

function getLastWateringTime() {
	return getPromise(serverUrl + '/pws/last-watering-time', DEFAULT_TIMEOUT, 'GET', STATUS.OK);
}

function setRelayStatus(status) {
	return getPromise(serverUrl + '/pws/relay-state', DEFAULT_TIMEOUT, 'PUT', STATUS.OK, status);
}

function setSensorData(data) {
	return getPromise(serverUrl + '/pws/sensor-data', DEFAULT_TIMEOUT, 'POST', STATUS.OK, data);
}

function getPWSStatus() {
	return getPromise(serverUrl + '/pws/pws-status', DEFAULT_TIMEOUT, 'GET', STATUS.OK);
}

function getStatus(callback) {
    let getData = getRelayStatus();
    getData.then(function(value) { // Resolve
        //  console.log("Done:", value);
        try {
            let json = JSON.parse(value);
            if (callback !== undefined) {
                callback(json);
            } else {
                console.info('Status', relay, json);
            }
        } catch (err) {
            console.log("Error:", err, ("\nfor value [" + value + "]"));
        }
    }, function(error) { // Reject
        console.log("Failed to get Status..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
    });
}

// Canvases
let displayHUM;

let slideIndex = 1;
showSlides(slideIndex);

function flipSlides(n) {
	showSlides(slideIndex += n);
}

function currentSlide(n) {
	showSlides(slideIndex = n);
}

function showSlides(n) {
	let slides = document.getElementsByClassName("the-slides");
	if (n > slides.length) {
		slideIndex = 1;
	}
	if (n < 1) {
		slideIndex = slides.length;
	}
	for (let i = 0; i < slides.length; i++) {
		slides[i].classList.remove("visible-slide");
	}
	slides[slideIndex - 1].classList.add("visible-slide"); // Show active one
}

function keyPadKey(char) {
	console.info(">>", char);
	let currentData = document.getElementById('screen-ip').innerText;
	switch (char) {
		case "Del":
			currentData = currentData.substring(0, currentData.length - 1);
			break;
		case "Clr":
			currentData = "";
			break;
		case "OK":
			// TODO Validation
			serverIp = currentData.substring(0, currentData.indexOf(':'));
			serverPort = currentData.substring(currentData.indexOf(':') + 1);
			//  console.log("Server & port:", serverIp, serverPort);
			// Store last data
			localStorage.setItem("pwsServerIp", serverIp);
			localStorage.setItem("pwsServerPort", serverPort);
			serverUrl = 'http://' + serverIp + ':' + serverPort;
			flipSlides(+1);
			break;
		case "Cncl":
			currentData = serverIp + ':' + serverPort;
			break;
		default:
			currentData += char;
			break;
	}
	document.getElementById('screen-ip').innerText = currentData;
}

(function() {
    /**
     * Handles the hardware key event.
     * @private
     * @param {Object} event - The hardware key event object
     *
     * More event at https://developer.tizen.org/ko/development/guides/web-application/user-interface/tizen-advanced-ui/event-handling?langredirect=1
     *
     */
    function keyEventHandler(event) {
        // Display keynames here
        console.log("Tizen HW Event", event, event.keyName);

        if (event.keyName === "back") { // No "menu" on wearable
            try {
                console.debug('Exiting app');
                // If the back key is pressed, exit the application.
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    // Trap it, just to see how to do it.
    function rotEventHandler(event) {
        console.log("Rotary HW Event", event, event.detail.direction);

        if (event.detail.direction === "CW") {
        		console.log("Detent, clockwise");
        		flipSlides(1);
        } else if (event.detail.direction === "CCW") {
        		console.log("Detent, counter-clockwise");
        		flipSlides(-1);
        }
    }

    /**
     * Initializes the application.
     * @private
     */
    function init() {
        // Add hardware event listener
        document.addEventListener("tizenhwkey", keyEventHandler);

        document.addEventListener("rotarydetent", rotEventHandler);
        // Event Listeners would go here

		displayHUM = new AnalogDisplay('humCanvas', 173, 100, 10, 1, true, 40); // 173: ((350/2) - 2)
		displayHUM.setValue(0);
		displayHUM.setLabel('HUM');
		displayHUM.repaint();

		let interval = window.setInterval(function() {
			getPWSStatus()
			.then(function(value) {
//				console.log("PWSStatus:", value); // Like "Watching the probe";
				document.getElementById('pws-status').innerText = value;
			},
			function(error) {
				console.debug("PWSStatus error", error);
			});

			getLastWateringTime()
			.then(function(value) {
				// console.log("getLastWateringTime:", value);
				if (value !== null) {
					let lwt = new Date();
					lwt.setTime(value);
					document.getElementById('lwt').innerText = lwt;
				} else {
					document.getElementById('lwt').innerText = '[None]';
				}
			},
			function(error) {
				console.debug("getLastWateringTime error", error);
			});

			getSensorData()
			.then(function(value) {
				let json = JSON.parse(value);
//				console.log("getSensorData, hum:", json.humidity);
				displayHUM.setValue(json.humidity);
			},
			function(error) {
				console.debug("getSensorData error", error);
			});


			getRelayStatus()
			.then(function(value) {
//				console.log("getRelayStatus:", value);
			},
			function(error) {
				console.debug("getRelayStatus error", error);
			});


		}, 1000);

		document.getElementById('screen-ip').innerText = serverIp + ':' + serverPort;
		console.debug('Done with init');
    }

    // The function "init" will be executed after the application successfully loaded.
    window.onload = init;
}());

function flipSwitch(pos) {
    console.log("Switching to ", pos);
    setRelayStatus(pos ? "LOW" : "HIGH")
    .then(function(value) {
    		console.log('Set relay OK', value);
    },
    function(error) {
		console.log('Error setting relay', error);
	});
}
