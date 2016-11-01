
/* State machine for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();

var led;
var rate = 500;
var state = 0;
var new_state = 0;


board.on("ready", function() {
	led = new five.Led(13);

	this.repl.inject({
		rate: function(input){ rate = input }
	});

	setInterval(loop, 0);
});

board.on("exit", function() {
	led.off();
});


function loop() {

	new_state = rate;

	if (state !== new_state) {
		led.blink(rate);
	}

	state = rate;

}
