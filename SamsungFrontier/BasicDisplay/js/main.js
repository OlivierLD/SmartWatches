var displayBSP;
var bspValue = 0;
const BSP_MIN = 0,
    BSP_MAX = 15;

window.onload = () => {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back")
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
    });

    function plusOne() {
        if (displayBSP !== undefined) {
            if (bspValue < BSP_MAX) {
                bspValue += 0.1;
                displayBSP.setValue(bspValue);
                console.log('Adding to value');
            }
        } else {
            console.log('Display not defined');
        }
    }

    function minusOne() {
        if (displayBSP !== undefined) {
            if (bspValue > BSP_MIN) {
                bspValue -= 0.1;
                displayBSP.setValue(bspValue);
                console.log('Substracting from value');
            }
        } else {
            console.log('Display not defined');
        }
    }

    function rotEventHandler(event) {
        // console.log("Rotary HW Event", event, event.detail.direction);
        if (event.detail.direction === "CW") {
            // console.log("Detent, clockwise");
            plusOne();
        } else if (event.detail.direction === "CCW") {
            // console.log("Detent, counter-clockwise");
            minusOne();
        }
    }

    document.addEventListener("rotarydetent", rotEventHandler);

    displayBSP = new AnalogDisplay('bspCanvas', 173, 15, 1, 0.1, true, 40);
    displayBSP.setValue(0);
};