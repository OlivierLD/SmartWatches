/*
 * C'est MOI qui l'ai fait.
 *
 */
"use strict";

const STATUS = {
    OK: 200,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408
};

const DEBUG = false;
const DEFAULT_TIMEOUT = 60000; // 1 minute

const SERVER_URL = "http://192.168.42.15:9876"; // http://192.168.42.6:8080";

/* Uses ES6 Promises */
function getPromise(
    url, // full api path
    timeout, // After that, fail.
    verb, // GET, PUT, DELETE, POST, etc
    happyCode, // if met, resolve, otherwise fail.
    data = null, // payload, when needed (PUT, POST...)
    show = false) { // Show the traffic [true]|false

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

function getRelayStatus(relayNum) {
    return getPromise(SERVER_URL + '/relay/status/' + relayNum, DEFAULT_TIMEOUT, 'GET', STATUS.OK);
}

function getStatus(relay, callback) {
    let getData = getRelayStatus(relay);
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

function setRelayStatus(relay, payload) {
    let url = SERVER_URL + "/relay/status/" + relay;
    let obj = payload; // JSON.stringify(payload);
    return getPromise(url, DEFAULT_TIMEOUT, 'POST', STATUS.OK, obj);
}

function setRelay(relay, checkbox, callback) {
    let setData = setRelayStatus(relay, {
        status: checkbox.checked
    });
    setData.then(function(value) { // resolve
        if (value !== undefined && value !== null && value.length > 0) {
            let json = JSON.parse(value);
            if (callback !== undefined) {
                callback(json);
            } else {
                console.log('Relay status set', JSON.stringify(json, null, 2));
            }
        }
    }, function(error) { // reject
        console.log("Failed to set the Relay status.." + (error !== undefined && error.code !== undefined ? error.code : ' - ') + ', ' + (error !== undefined && error.message !== undefined ? error.message : ' - '));
    });
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

        if (event.keyName === "back") {
            try {
                console.debug('Exiting app');
                // If the back key is pressed, exit the application.
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    /**
     * Initializes the application.
     * @private
     */
    function init() {
        // Add hardware event listener
        document.addEventListener("tizenhwkey", keyEventHandler);

        // Event Listeners would go here
    }

    // The function "init" will be executed after the application successfully loaded.
    window.onload = init;
}());

function flipSwitch(pos) {
    console.log("Switching to ", pos);
    setRelayStatus(1, {
        "status": pos
    });
}
