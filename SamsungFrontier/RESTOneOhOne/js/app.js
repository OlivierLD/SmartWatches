/*
 * C'est MOI qui l'ai fait.
 */
"use strict";

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
    		wdir: 0
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
            		html += "<br/>Date:" + (new Date()) + "<br/>Speed:" + windData.ws.toFixed(2) + " kts<br/>Dir:" + windData.wdir.toFixed(0) + "&deg;";
                box.innerHTML = html;
            } else {
                // If the text in box is not "Hello Tizen", change it to "Hello Tizen"
            		box.innerHTML = START_WITH;

                // Do some REST Request here
                let url = "http://donpedro.lediouris.net/php/weather/reports.v2/json.data.php?type=ALL&period=LAST";
                let 	xhr = new XMLHttpRequest();

                	xhr.onreadystatechange = function() {
                		if (xhr.readyState === 4 && xhr.status === 200) {
//                		console.log("XHR returns", xhr.responseText);
            				let resp = JSON.parse(xhr.responseText);
            				if (resp !== undefined && resp.data !== undefined && resp.data.length > 0) {
            					console.log(JSON.stringify(resp, null, 2));
            					try {
            						windData.ws = resp.data[0].ws;
            						windData.wdir = resp.data[0].wdir;
            						console.log("Vars:", windData);
            					} catch (err) {
            						console.log("Error:", err);
            					}
            				} else {
            					console.log(JSON.stringify(resp, null, 2));
            				}
                		} else {
                			let errMess = "XHR: State:" + xhr.status + "\nRS:" + xhr.readyState;
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
