"use strict";
/*
 * @author Olivier Le Diouris
 * Uses ES6 Promises for Ajax.
 */

const AJAX_DEBUG = false;

// let getBaseURL() = "http://" + serverIp + ":9999";

// serverIp, serverPort
function getBaseURL() {
	return "http://" + serverIp + ":" + serverPort;
}

function initAjax() {
	let interval = setInterval(() => {
		fetch();
		getSunPos(); // To display the position of the sun in the sky, at your position, at your time.
	}, 1000);
}

const DEFAULT_TIMEOUT = 60000; // 1 minute
/* global events */

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

	if (AJAX_DEBUG) {
		console.log(">>> Promise: " + verb + " " + url);
	}

	let promise = new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		let TIMEOUT = timeout;

		let req = verb + " " + url;
		if (data !== undefined && data !== null) {
			req += ("\n" + JSON.stringify(data, null, 2));
		}

		xhr.open(verb, url, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		try {
			if (data === undefined || data === null) {
				xhr.send();
			} else {
				xhr.send(JSON.stringify(data));
			}
		} catch (err) {
			console.log("Send Error ", err);
		}

		let requestTimer = setTimeout(function () {
			xhr.abort();
			let mess = {
				code: 408,
				message: 'Timeout'
			};
			reject(mess);
		}, TIMEOUT);

		xhr.onload = function () {
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

function getNMEAData() {
	return getPromise(getBaseURL() + '/mux/cache', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

function fetch() {
	if (AJAX_DEBUG) {
		console.log('Ajax: fetching');
	}
	let getData = getNMEAData();
	getData.then(function (value) { // Resolve
		//  console.log("Done:", value);
		try {
			let json = JSON.parse(value);
			if (AJAX_DEBUG) {
				console.log('Ajax. fetch OK');
			}
			onMessage(json);
		} catch (err) {
			console.log("Error:", err, ("\nfor value [" + value + "]"));
		}
	}, function (error) { // Reject
		console.log("Failed to get NMEA data..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
	});
}

let currentPos = undefined;
let currentUTC = undefined;

function getSunPos() {
	if (AJAX_DEBUG) {
		console.log('Ajax: getSunPos');
	}
	if (currentPos !== undefined && currentUTC !== undefined) {
		let year = currentUTC.getFullYear();
		let month = currentUTC.getMonth();
		let date = currentUTC.getDate();
		let hours = currentUTC.getHours();
		let minutes = currentUTC.getMinutes();
		let seconds = currentUTC.getSeconds();

		let duration = year + '-' + (month < 9 ? '0' + (month + 1) : month + 1) + '-' + (date < 10 ? '0' + date : date) + 'T' +
				(hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ":" + (seconds < 10 ? '0' + seconds : seconds);

		let getAstro = getSkyGP(duration, currentPos);
		getAstro.then(function (value) { // Resolve
			//  console.log("Done:", value);
			try {
				let json = JSON.parse(value);
				if (AJAX_DEBUG) {
					console.log('Ajax: getSunPos OK');
				}
				onMessage(json);
			} catch (err) {
				console.log("Error:", err, ("\nfor value [" + value + "]"));
			}
		}, function (error) { // Reject
			console.log("Failed to get astro data..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
		});
	}
}

function enableLogging(b) {
	return getPromise(getBaseURL() + '/mux/mux-process/' + (b === true ? 'on' : 'off'), DEFAULT_TIMEOUT, 'PUT', 200, null, false);
}

function setSpeedUnit(speedUnit) {
	return getPromise(getBaseURL() + '/mux/events/change-speed-unit', DEFAULT_TIMEOUT, 'POST', 200, {
		"speed-unit": speedUnit
	}, false);
}

function forwarderStatus(callback) {
	let getData = getForwarderStatus();
	getData.then(function (value) {
		let json = JSON.parse(value); // Like {"processing":false,"started":1501082121336}
		let status = json.processing;
		if (callback !== undefined) {
			callback(status);
		} else {
			console.info("Forwarder status", status);
		}
	}, function (error) {
		if (callback !== undefined) {
			callback(error);
		} else {
			console.log("Failed to get Forwarder status..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
		}
	});
}

function resetDataCache() {
	return getPromise(getBaseURL() + '/mux/cache', DEFAULT_TIMEOUT, 'DELETE', 204);
};

function getForwarders() {
	return getPromise(getBaseURL() + '/mux/forwarders', DEFAULT_TIMEOUT, 'GET', 200);
}

function getLogFiles() {
	return getPromise(getBaseURL() + '/mux/log-files', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

// Should be useless..., invoke it directly (no promise required) to download.
function getLogFile(fileName) {
	return getPromise(getBaseURL() + '/mux/log-files/' + fileName, DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

function deleteLogFile(logFile) {
	return getPromise(getBaseURL() + '/mux/log-files/' + logFile, DEFAULT_TIMEOUT, 'DELETE', 200, null, false);
}

function getSystemTime() {
	return getPromise(BASE_URL + '/mux/system-time?fmt=date', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

function getForwarderStatus() {
	return getPromise(getBaseURL() + '/mux/mux-process', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

function getSOGCOG() {
	return getPromise(getBaseURL() + '/mux/sog-cog', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

function getDistance() {
	return getPromise(getBaseURL() + '/mux/distance', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

function getDeltaAlt() {
	return getPromise(getBaseURL() + '/mux/delta-alt', DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

/**
 *
 * @param when UTC, Duration format: like "Y-m-dTH:i:s" -> 2018-09-10T10:09:00
 * @param position { lat: 37.7489, lng: -122.507 }
 * @param wandering true|false
 * @param stars true|false
 * @returns {Promise<any>}
 */
function getSkyGP(when, position, wandering, stars) {
	let url = getBaseURL() + "/astro/positions-in-the-sky";
	// Add date
	url += ("?at=" + when);
	url += ("&fromL=" + position.lat);
	url += ("&fromG=" + position.lng);
	// Wandering bodies
	if (wandering !== undefined && wandering === true) { // to minimize the size of the payload
		url += ("&wandering=true");
	}
	// Stars
	if (stars !== undefined && stars === true) { // to minimize the size of the payload
		url += ("&stars=true");
	}
	return getPromise(url, DEFAULT_TIMEOUT, 'GET', 200, null, false);
}

/**
 *
 * @param when UTC, Duration format: like "Y-m-dTH:i:s" -> 2018-09-10T10:09:00
 * @param position { lat: 37.7489, lng: -122.507 }
 * @param wandering true|false
 * @param stars true|false
 * @returns {Promise<any>}
 */
function getAstroData(when, position, wandering, stars, callback) {
	let getData = getSkyGP(when, position, wandering, stars);
	getData.then(function (value) { // resolve
		let json = JSON.parse(value);
		if (callback !== undefined) {
			callback(json);
		} else {
			console.log(JSON.stringify(json, null, 2));
		}
	}, function (error) { // reject
		console.log("Failed to get the Astro Data..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
	});
}

function setUTC(epoch) {
	let url = getBaseURL() + "/mux/utc";
	let obj = {
		epoch: epoch
	};
	return getPromise(url, DEFAULT_TIMEOUT, 'PUT', 200, obj, false);
}

function setPosition(lat, lng) {
	let url = getBaseURL() + "/mux/position";
	let obj = {
		lat: lat,
		lng: lng
	};
	return getPromise(url, DEFAULT_TIMEOUT, 'POST', 200, obj, false);
}

function setUTCTime(epoch, callback) {
	let setData = setUTC(epoch);
	setData.then(function (value) { // resolve
		if (value !== undefined && value !== null && value.length > 0) {
			let json = JSON.parse(value);
			if (callback !== undefined) {
				callback(json);
			} else {
				console.log(JSON.stringify(json, null, 2));
			}
		}
	}, function (error) { // reject
		console.log("Failed to set the UTC date and time..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
	});
}

function setUserPos(lat, lng, callback) {
	let setData = setPosition(lat, lng);
	setData.then(function (value) { // resolve
		if (value !== undefined && value !== null && value.length > 0) {
			let json = JSON.parse(value);
			if (callback !== undefined) {
				callback(json);
			} else {
				console.log(JSON.stringify(json, null, 2));
			}
		}
	}, function (error) { // reject
		console.log("Failed to set the UTC date and time..." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
	});
}

function getQueryParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
	if (!results) {
		return null;
	}
	if (!results[2]) {
		return '';
	}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Takes care of re-broadcasting the data to whoever subscribed to it.
function onMessage(json) {
	try {
		let errMess = "";

		try {
			currentPos = json.Position; // To re-use to get sun position

			let latitude = json.Position.lat;
			//    console.log("latitude:" + latitude)
			let longitude = json.Position.lng;
			//    console.log("Pt:" + latitude + ", " + longitude);
			events.publish('pos', {
				'lat': latitude,
				'lng': longitude
			});
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "position");
		}
		// Displays
		try {
			let bsp = json.BSP.speed;
			events.publish('bsp', bsp);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "boat speed");
		}
		try {
			let log = json.Log.distance;
			events.publish('log', log);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "log (" + err + ")");
		}
		try {
			let gdt = json["GPS Date & Time"];
			let gpsDate = new Date(gdt.fmtDate.year, gdt.fmtDate.month - 1, gdt.fmtDate.day, gdt.fmtDate.hour, gdt.fmtDate.min, gdt.fmtDate.sec, 0);
			currentUTC = gpsDate; // to re-use to get sun position
			// UTC dates
			events.publish('gps-time', gpsDate);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "GPS Date (" + err + ")");
		}
		try {
			let gpsSat = json["Satellites in view"];
			if (gpsSat !== undefined) {
				events.publish('gps-sat', gpsSat);
			}
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "GPS Satellites data (" + err + ")");
		}

		try {
			let hdg = json["HDG true"].angle;
			events.publish('hdg', hdg);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "heading");
		}
		try {
			let twd = json.TWD.angle;
			events.publish('twd', twd);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "TWD");
		}
		try {
			let twa = json.TWA.angle;
			events.publish('twa', twa);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "TWA");
		}
		try {
			let tws = json.TWS.speed;
			events.publish('tws', tws);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "TWS");
		}

		try {
			let waterTemp = json["Water Temperature"].temperature;
			events.publish('wt', waterTemp);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "water temperature");
		}

		try {
			let airTemp = json["Air Temperature"].temperature;
			events.publish('at', airTemp);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "air temperature");
		}
		// Battery_Voltage, Relative_Humidity, Barometric_Pressure
		try {
			let baro = json["Barometric Pressure"].pressure;
			if (baro != 0) {
				events.publish('prmsl', baro);
			}
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "PRMSL");
		}
		try {
			let hum = json["Relative Humidity"];
			if (hum > 0) {
				events.publish('hum', hum);
			}
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "Relative_Humidity");
		}
		try {
			let aws = json.AWS.speed;
			events.publish('aws', aws);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "AWS");
		}
		try {
			let awa = json.AWA.angle;
			events.publish('awa', awa);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "AWA");
		}
		try {
			let cdr = json.CDR.angle;
			events.publish('cdr', cdr);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "CDR");
		}

		try {
			let cog = json.COG.angle;
			events.publish('cog', cog);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "COG");
		}
		try {
			let cmg = json.CMG.angle;
			events.publish('cmg', cmg);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "CMG");
		}
		try {
			let leeway = json.Leeway.angle;
			events.publish('leeway', leeway);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "Leeway");
		}
		try {
			let csp = json.CSP.speed;
			events.publish('csp', csp);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "CSP");
		}

		try {
			let sunObs = json.sunObs;
			if (sunObs !== undefined) {
				events.publish('sun-pos', sunObs);
			}
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "Sun Pos");
		}

		// Buffered current
		try {
			let buffered = json['Current calculated with damping'];
			if (buffered !== undefined) {
				let keys = Object.keys(buffered);
				for (let i = 0; i < keys.length; i++) {
					let k = keys[i];
					//				console.log("K:" + k);
					let damp = buffered[k];
					//				console.log("Publishing csp-" + k);
					events.publish("csp-" + k, damp.speed.speed);
					events.publish("cdr-" + k, damp.direction.angle);
				}
			}
		} catch (err) {
			console.log(err);
		}

		try {
			let sog = json.SOG.speed;
			events.publish('sog', sog);
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "SOG");
		}
		// to-wp, vmg-wind, vmg-wp, b2wp
		try {
			let to_wp = json["To Waypoint"];
			let b2wp = json["Bearing to WP"].angle;
			events.publish('wp', {
				'to_wp': to_wp,
				'b2wp': b2wp
			});
		} catch (err) {
			//		console.log(err); // Absorb?
		}

		try {
			events.publish('vmg', {
				'onwind': json["VMG on Wind"],
				'onwp': json["VMG to Waypoint"]
			});
		} catch (err) {
			errMess += ((errMess.length > 0 ? ", " : "Cannot read ") + "VMG");
		}

		if (errMess !== undefined) {
			// console.log(errMess); // Absorb
		}
	} catch (err) {
		console.log(err);
	}
}
