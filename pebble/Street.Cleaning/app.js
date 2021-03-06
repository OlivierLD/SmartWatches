/*
 * Pebble equivalent of http://lediouris.net/utils/StreetCleaning.html
 */
var UI = require('ui');
var Vector2 = require('vector2');
var utils = require('./utils.js'); // Date prototyping

var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var now = new Date();

var day   = now.getDay();
var month = now.getMonth();
var year  = now.getFullYear();

var MONDAY = 1;
var THURSDAY = 4;

// Zones:
var ZONE_NW = { id: 1, label: "NW Block" }; // green
var ZONE_NE = { id: 2, label: "NE Block" }; // red
var ZONE_SW = { id: 3, label: "SW Block" }; // blue
var ZONE_SE = { id: 4, label: "SE Block" }; // yellow

// Times
var _12_TO_14 = "12 to 14";
var _13_TO_15 = "13 to 15";

var sameDay = function(dayOne, dayTwo) {
    return (dayOne.getFullYear() === dayTwo.getFullYear() &&
    dayOne.getMonth() === dayTwo.getMonth() &&
    dayOne.getDate() === dayTwo.getDate());
};

var calculate = function(month, year) {
    var scDays = [];

    var today = new Date();
    // First day of the week: Sunday
    var firstDay = new Date(year, month, 1, 0, 0, 0, 0); // 1st day of month, at 00:00:00.0

    var mondayCount   = 0;
    var thursdayCount = 0;
    for (var d=1; d<=firstDay.getMonthDayCount(); d++) {
        var monthday = new Date(year, month, d, 0, 0, 0, 0);
        var weekday  = monthday.getDay();
        // Specific to the neighborhood
        if (weekday === MONDAY) {
            mondayCount++;
            if (mondayCount === 1 || mondayCount === 3) {
                scDays.push({ day: monthday.format("D M dS"), when: _12_TO_14, where: ZONE_NE, today: sameDay(today, monthday) });
            } else if (mondayCount === 2 || mondayCount === 4) {
                scDays.push({ day: monthday.format("D M dS"), when: _13_TO_15, where: ZONE_SW, today: sameDay(today, monthday) });
            }
        }
        if (weekday === THURSDAY) {
            thursdayCount++;
            if (thursdayCount === 1 || thursdayCount === 3) {
                scDays.push({ day: monthday.format("D M dS"), when: _13_TO_15, where: ZONE_NW, today: sameDay(today, monthday) });
            } else if (thursdayCount === 2 || thursdayCount === 4) {
                scDays.push({ day: monthday.format("D M dS"), when: _12_TO_14, where: ZONE_SE, today: sameDay(today, monthday) });
            }
        }
    }
    return scDays;
};

var plus = function(m, y) {
    var month = m+1;
    if (month > 11) {
        month = 0;
        y += 1;
    }
    return { year: y, month: month };
};

var minus = function(m, y) {
    var month = m-1;
    if (month < 0) {
        month = 11;
        y -= 1;
    }
    return { year: y, month: month };
};

/**
 * UI Definition begins here
 */
var main = new UI.Card({
    title: (MONTHS[month] + " " + year),
    subtitle: 'SF Street Cleaning',
    body: 'Up:Prev month Down:Next month Select:This month',
    action: {
        up: 'images/action_bar_icon_up.png',
        select: 'images/music_icon_play.png',
        down: 'images/action_bar_icon_down.png'
    }
});

main.show();

var ne_image = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    image: 'images/NE.png',
});
var nw_image = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    image: 'images/NW.png',
});
var se_image = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    image: 'images/SE.png',
});
var sw_image = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    image: 'images/SW.png',
});

var imgWind = new UI.Window({
    backgroundColor: 'gray'
});

var updateCurrentDate = function() {
//console.log("Now " + MONTHS[month] + " " + year);
    main.title(MONTHS[month] + " " + year);
};

main.on('click', 'down', function(e) {
    // Next month
//console.log('Next month');
    var n = plus(month, year);
    month = n.month;
    year = n.year;
    updateCurrentDate();
    main.show();
});

main.on('click', 'select', function(e) {
//  console.log('On Select');
    var scData = calculate(month, year);
//  console.log("=>" + JSON.stringify(scData, null, 2));

    var menuItems = [{
        title: MONTHS[month] + " " + year // 1st line. Month & Year.
    }];
    for (var i=0; i<scData.length; i++) {
        var item = {
            title: scData[i].day,
            subtitle: scData[i].where.label + " " + scData[i].when
        };
        if (scData[i].today === true ) {
            item.icon = 'images/warning.png';
        }
        menuItems.push(item);
    }

    var menu = new UI.Menu({
        sections: [{
            items: menuItems
        }]
    });
    menu.on('select', function(e) {
        console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
        console.log('The item is titled "' + e.item.title + ' ' + e.item.subtitle + '"');
        if (e.itemIndex > 0) {
            var quadrant = e.item.subtitle.substring(0, 2);
            console.log("Quadrant:" + quadrant);
            switch (quadrant) {
                case "NW":
                    imgWind.add(nw_image);
                    break;
                case "NE":
                    imgWind.add(ne_image);
                    break;
                case "SW":
                    imgWind.add(sw_image);
                    break;
                case "SE":
                    imgWind.add(se_image);
                    break;
                default:
                    console.log("Image not found");
                    break;
            }
            imgWind.show();
        }
    });
    menu.show();
});

main.on('click', 'up', function(e) {
    // Previous month
//console.log('Previous month');
    var p = minus(month, year);
    month = p.month;
    year = p.year;
    updateCurrentDate();
    main.show();
});
