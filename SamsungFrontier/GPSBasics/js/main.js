"use strict";

let interval = undefined;
let refreshRate = 5;

let options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
};

window.onload = () => {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName == "back")
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
    });

    // Sample code
    let textbox = document.querySelector('.contents');
    textbox.addEventListener("click", function() {
        let box = document.querySelector('#textbox');
        box.innerHTML = box.innerHTML == "Basic" ? "Sample" : "Basic";
    });

    interval = setInterval(() => {
        let watchId = navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);
    }, refreshRate * 1000);
}

function onPosSuccess(pos) {
	// Doc at https://w3c.github.io/geolocation-api/
	// Positon object at https://w3c.github.io/geolocation-api/#position_interface
	//
	// Check privileges in config.xml
	//
    console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
    console.log('hdg= ' + pos.coords.heading + ' spd= ' + pos.coords.speed + ' m/s');
//  console.log("Pos data:" + pos.coords); 
    let hdg = 0;
    let speed = 0.0;
    try {
    	  hdg = pos.coords.heading.toFixed(0);
    	  speed = pos.coords.speed.toFixed(2);
    } catch (err) {}
    let newContent = 
    	decToSex(pos.coords.latitude, 'NS') + "<br/>" +
        decToSex(pos.coords.longitude, 'EW') + "<br/>" +
        'HDG= ' + hdg + '<br/>' +
        'SPD= ' + speed + ' m/s';
    let box = document.querySelector('#textbox');
    box.innerHTML = newContent;
}

// Called from navigator.geolocation.getCurrentPosition
function onPosError(err) {
    let errMess = '';
    if (err.code == err.PERMISSION_DENIED) {
        errMess = 'Location access was denied by the user.';
    } else {
        errMess = 'location error (' + err.code + '): ' + err.message;
    }
    let box = document.querySelector('#textbox');
    box.innerHTML = errMess;
}

function decToSex(val, ns_ew) {
    let absVal = Math.abs(val);
    let intValue = Math.floor(absVal);
    let dec = absVal - intValue;
    let i = intValue;
    dec *= 60;
    let s = i + "°" + dec.toFixed(2) + "'";

    if (val < 0) {
        s += (ns_ew === 'NS' ? 'S' : 'W');
    } else {
        s += (ns_ew === 'NS' ? 'N' : 'E');
    }
    return s;
}