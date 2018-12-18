/*
 * C'est MOI qui l'ai fait.
 *
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

(function() {
    /**
     * Handles the hardware key event.
     * @private
     * @param {Object} event - The hardware key event object
     */
    function keyEventHandler(event) {
        if (event.keyName === "back") {
            try {
                // If the back key is pressed, exit the application.
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    let windData = {
    		ws: 0,
    		wdir: 0,
    		press: 0,
    		atemp: 0
    };

    const START_WITH = "Hi there! Tap to see the data.";
    /**
     * Initializes the application.
     * @private
     */
    function init() {
        var textbox = document.querySelector("#contents");

        // Add hardware event listener
        document.addEventListener("tizenhwkey", keyEventHandler);

        // Add click event listener
        textbox.addEventListener("click", function() {
            var box = document.querySelector("#content-text");

            	console.log('Current innerHTML is', box.innerHTML);

            if (box.innerHTML === START_WITH) {
                // If the text in box is "Hello Tizen", change it to "Hi WebApp"
            		let html = "<b>Weather Data</b>";
            		html += "<br/>Date:" + (new Date()) + 
            		"<br/>Speed:" + windData.ws.toFixed(2) + " kts<br/>Dir:" + windData.wdir.toFixed(0) + "&deg;" +
            		"<br/>PRMSL:" + windData.press.toFixed(1) + " hPa<br/>" +
            		"<br/>T:" + windData.atemp.toFixed(1) + " &deg;C<br/>";
                box.innerHTML = html;
            } else {
                // If the text in box is not "Hello Tizen", change it to "Hello Tizen"
            		box.innerHTML = START_WITH;

                // Do some REST Request here
                let url = "http://donpedro.lediouris.net/php/weather/reports.v2/json.data.php?type=ALL&period=LAST";
                let 	xhr = new XMLHttpRequest();

                	xhr.onreadystatechange = function() {
                		if (xhr.readyState === READY_STATE.REQUEST_FINISHED_RESPONSE_READY && xhr.status === STATUS.OK) {
//                		console.log("XHR returns", xhr.responseText);
	                    let resp = JSON.parse(xhr.responseText);
	                    if (resp !== undefined && resp.data !== undefined && resp.data.length > 0) {
	                      console.log(JSON.stringify(resp, null, 2));
	                      let data = resp.data[0];
	                      try {
	                        windData.ws = data.ws;
	                        windData.wdir = data.wdir; 
	                        windData.atemp = data.atemp;
	                        windData.press = data.press; // etc!
	                        console.log("Vars:", windData);
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
        });
    }

    // The function "init" will be executed after the application successfully loaded.
    window.onload = init;
}());
