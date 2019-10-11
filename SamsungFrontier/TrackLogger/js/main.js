"use strict";

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


window.onload = () => {
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
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

    initAjax(); // REST request loop

    // Init canvas... WIP.
    let cName = 'sun-canvas';
    let canvas = document.getElementById(cName);

    let cWidth = canvas.width;
    let cHeight = canvas.height;

    let context = canvas.getContext('2d');

    // context.fillStyle = "LightGray";
//    let grd = context.createLinearGradient(0, 5, 0, document.getElementById(cName).height);
//    grd.addColorStop(0, 'LightGray'); // 'gray');    // 0  Beginning
//    grd.addColorStop(1, 'black'); // 'LightGray');// 1  End
    context.fillStyle = 'transparent';

    context.fillRect(0, 0, cWidth, canvas.height);
    plotTheSun(0);
    
    document.getElementById('screen-ip').innerText = serverIp + ':' + serverPort;
};

/* Static Utils */
if (Math.toRadians === undefined) {
    Math.toRadians = function(deg) {
        return deg * (Math.PI / 180);
    }
}

if (Math.toDegrees === undefined) {
    Math.toDegrees = function(rad) {
        return rad * (180 / Math.PI);
    }
}

let withBorder = true;
let withGradient = true;
let withDisplayShadow = false;
let withHandShadow = true;
let majorTicks = 30;
let minorTicks = 5;
let withDigits = true;

function plotTheSun(sunZ) {
    let cName = 'sun-canvas';
    let canvas = document.getElementById(cName);

    let cWidth = canvas.height;
    let cHeight = canvas.height;
    
//  console.info("Width:", cWidth, "Height:", cHeight);

    let context = canvas.getContext('2d');

    let digitColor = 'white';

    let radius = (Math.min(cWidth, cHeight)) / 2;

    let totalAngle = 2 * Math.PI;

    context.beginPath();

    if (withBorder === true) {
        //  context.arc(x, y, radius, startAngle, endAngle, antiClockwise);
        context.arc(cWidth / 2, radius, radius * 0.95, 0, 2 * Math.PI, false);
        context.lineWidth = 5;
    }

    if (withGradient == true) {
        let grd = context.createLinearGradient(0, 5, 0, radius);
        grd.addColorStop(0, 'black'); // 0  Beginning
        grd.addColorStop(1, 'gray'); // 1  End
        context.fillStyle = grd;
    } else {
        context.fillStyle = 'gray';
    }
    if (withDisplayShadow) {
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 3;
        context.shadowColor = 'darkgray';
    } else {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.shadowColor = undefined;
    }
    context.lineJoin = "round";
    context.fill();
    context.strokeStyle = 'white';
    context.stroke();
    context.closePath();

    // Major Ticks
    context.beginPath();
    for (let i = 0; i < 360; i++) {
        if (i % majorTicks === 0) {
            let currentAngle = (totalAngle * (i / 360)) + Math.toRadians(90);
            let xFrom = (cWidth / 2) - ((radius * 0.95) * Math.cos(currentAngle));
            let yFrom = (radius) - ((radius * 0.95) * Math.sin(currentAngle));
            let xTo = (cWidth / 2) - ((radius * 0.85) * Math.cos(currentAngle));
            let yTo = (radius) - ((radius * 0.85) * Math.sin(currentAngle));
            context.moveTo(xFrom, yFrom);
            context.lineTo(xTo, yTo);
        }
    }
    context.lineWidth = 3;
    context.strokeStyle = 'white';
    context.stroke();
    context.closePath();

    // Minor Ticks
    if (minorTicks > 0) {
        context.beginPath();
        for (let i = 0; i < 360; i += minorTicks) {
            let _currentAngle = (totalAngle * (i / 360)) + Math.toRadians(90);

            let xFrom = (cWidth / 2) - ((radius * 0.95) * Math.cos(_currentAngle));
            let yFrom = (radius) - ((radius * 0.95) * Math.sin(_currentAngle));
            let xTo = (cWidth / 2) - ((radius * 0.90) * Math.cos(_currentAngle));
            let yTo = (radius) - ((radius * 0.90) * Math.sin(_currentAngle));
            context.moveTo(xFrom, yFrom);
            context.lineTo(xTo, yTo);
        }
        context.lineWidth = 1;
        context.strokeStyle = 'white';
        context.stroke();
        context.closePath();
    }

    let scale = radius / 100;
    // Numbers (indexes) on major ticks
    if (withDigits) {
        context.beginPath();
        for (let i = 0; i < 360; i++) {
            if (i % majorTicks === 0) {
                context.save();
                context.translate(cWidth / 2, (radius)); // canvas.height);
                let __currentAngle = (totalAngle * (i / 360)) + Math.toRadians(90);
                context.rotate(__currentAngle - (Math.PI / 2));
                context.font = "bold " + Math.round(scale * 15) + "px Arial"; // Like "bold 15px Arial"
                context.fillStyle = digitColor;
                let str = i.toString();
                let len = context.measureText(str).width;
                context.fillText(str, -len / 2, (-(radius * .8) + 10));
                context.lineWidth = 1;
                context.strokeStyle = 'white'; // silver or gray when there is a shadow
                context.strokeText(str, -len / 2, (-(radius * .8) + 10)); // Outlined
                context.restore();
            }
        }
        context.closePath();
    }
    // Now, the Sun azimuth
	context.beginPath();
	if (withHandShadow === true) {
		context.shadowColor = 'gray';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 3;
	}
	// Center
	context.moveTo(cWidth / 2, radius);
	// Left
	let x = (cWidth / 2) - ((radius * 0.05) * Math.cos((2 * Math.PI * (sunZ / 360)))); //  - (Math.PI / 2))));
	let y = (radius + 10) - ((radius * 0.05) * Math.sin((2 * Math.PI * (sunZ / 360)))); // - (Math.PI / 2))));
	context.lineTo(x, y);
	// Tip
	x = (cWidth / 2) - ((radius * 0.90) * Math.cos(2 * Math.PI * (sunZ / 360) + (Math.PI / 2)));
	y = (radius + 10) - ((radius * 0.90) * Math.sin(2 * Math.PI * (sunZ / 360) + (Math.PI / 2)));
	context.lineTo(x, y);
	// Right
	x = (cWidth / 2) - ((radius * 0.05) * Math.cos((2 * Math.PI * (sunZ / 360) + (2 * Math.PI / 2))));
	y = (radius + 10) - ((radius * 0.05) * Math.sin((2 * Math.PI * (sunZ / 360) + (2 * Math.PI / 2))));
	context.lineTo(x, y);

	context.closePath();
	context.fillStyle = 'yellow';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'red';
	context.stroke();
	// Knob
	context.beginPath();
	context.arc((cWidth / 2), (radius + 10), 7, 0, 2 * Math.PI, false);
	context.closePath();
	context.fillStyle = 'red';
	context.fill();
	context.strokeStyle = 'orange';
	context.stroke();
}