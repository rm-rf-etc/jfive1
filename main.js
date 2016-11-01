
/* State machine for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();

var led;
var old_state = 0;
var new_state = 300;
var delta_rate = 2 / 10 * 1000;
var t = Date.now();


function getDelta(time) {
    return delta_rate * time;
}


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
	new_state = parseInt(input, 10);
}


function targetHasChanged() {
    return new_state !== old_state;
}


function applyStateChanges() {

    var now = Date.now();
    var p_delta = getDelta(now - t);

    if (new_state > old_state) {
        old_state = (old_state + p_delta > new_state) ? new_state : old_state + p_delta;
    }
    else {
        old_state = (old_state - p_delta < new_state) ? new_state : old_state - p_delta;
    }
    
    t = now;
}


function loop() {

	if (targetHasChanged()) {
		applyStateChanges();
		led.blink(state);
	}

}
