
/* Interface for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();
var machine = require("./machine.js");
var led;

machine.setup({
  delta: 2 / 10,
  max: 2,
});


board.on("ready", function() {

	led = new five.Led(13);

	this.repl.inject({
		rate: machine.setRate
	});

	setInterval(function(){
    led.blink(machine.step())
  }, 0);
});


board.on("exit", function() {

	led.off();
});
