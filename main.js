
/* State machine for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();

var led;
var last_state = 0;
var state = 300;


board.on("ready", function() {
	led = new five.Led(13);

	this.repl.inject({
		rate: setRate
	});

	setInterval(loop, 0);
});

board.on("exit", function() {
	led.off();
});


function setRate(input) {
	state = parseInt(input, 10);
}


function loop() {

	if (last_state !== state) {
		last_state = state;
		led.blink(state);
	}

}
