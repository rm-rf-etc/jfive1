
/* Interface for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();
var machine = require("./machine.js");
var led;

function fixFloat(float) {

  return parseFloat(float.toPrecision(8));
}

machine.config({
  delta: 100 / 5,
});


board.on("ready", function() {

  led = new five.Led(13);

  this.repl.inject({
    goto: machine.goto,
    dump: machine.dump,
    config: machine.config,
  });

  var prev = Date.now();
  setInterval(function(){

    var step = machine.tick(fixFloat(Date.now() - prev));

    if (machine.state !== "idle") {
      console.log(step);
      led.blink(step);
    }
    prev = Date.now();
  }, 300);
});


board.on("exit", function() {

  led.off();
});
