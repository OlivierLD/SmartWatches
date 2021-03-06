/**
 * A simple counter.
 * Up     +1
 * Down   -1
 * Select Reset
 */
var UI = require('ui');
var Vector2 = require('vector2');

var counterValue = 0;

var main = new UI.Card({
  title: ' Counter',
//icon: 'images/sheep.png',
  subtitle: 'Operation:',
  body: 'Up:+ Down:- Select:Reset',
  action: {
    up: 'images/action_bar_icon_up.png',
    select: 'images/music_icon_play.png',
    down: 'images/action_bar_icon_down.png'
  }
});

main.show();

// New data window for the counter value
var dataWind = new UI.Window({
  backgroundColor: 'white',
  action: {
    up: 'images/action_bar_icon_up.png',
    select: 'images/music_icon_play.png',
    down: 'images/action_bar_icon_down.png'
  }
});

var dataTextfield = new UI.Text({
  size: new Vector2(112, 60),
  font: 'bitham-42-bold',
  color: 'black',
  borderColor: 'black',
  textAlign: 'center'
});

var sheepImage = new UI.Image({
  position: new Vector2(56 - (28 / 2), 10),
  size: new Vector2(28, 30),
  image: "images/sheep.png"
});

var windSize = dataWind.size();
var textfieldPos = dataTextfield.position()
      .addSelf(windSize)
      .subSelf(dataTextfield.size())
      .multiplyScalar(0.5);
dataTextfield.position(textfieldPos);
dataWind.add(dataTextfield);
dataWind.add(sheepImage);

var setData = function(value) {
  dataTextfield.text(value);
};

var displayValue = function() {
  if (dataWind !== undefined) {
    var card = dataWind; // new UI.Card();
    setData(counterValue);
    card.show();
  }
};

var select = function(e) {
  counterValue = 0;
  displayValue();
};

main.on('click', 'select', select);
dataWind.on('click', 'select', select);

var up = function(e) {
  counterValue += 1;
  displayValue();
};
main.on('click', 'up', up);
dataWind.on('click', 'up', up);

var down = function(e) {
  counterValue -= 1;
  displayValue();
};

main.on('click', 'down', down);
dataWind.on('click', 'down', down);
