
/* Interface for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();
var machine = require("./machine.js");
var led;

machine.setup({
  delta: 100 / 5,
  max: 100,
});


board.on("ready", function() {

  led = new five.Led(13);

  this.repl.inject({
    goto: machine.setTarget,
    dump: machine.showData,
  });

  var last;
  setInterval(function(){
    var step = machine.step();

    if (step !== last) {
      console.log(step);
      led.blink(step);
      last = step;
    }
  }, 600);
});


board.on("exit", function() {

  led.off();
});
