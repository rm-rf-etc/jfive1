
/* Interface for blinking LED's */

var five = require("johnny-five");
var board = new five.Board();
var machine = require("./machine.js");
var led;


var fixFloat = machine._private.fixFloat;


machine.config({
  delta: fixFloat(100 / 5),
});


board.on("ready", function() {

  led = new five.Led(13);
  var changed = false;

  this.repl.inject({
    goto: function(input){
      changed = true;
      machine.goto(input)
    },
    dump: machine.dump,
    config: machine.config,
  });

  var prev = Date.now();
  setInterval(function(){

    var step = machine.tick(Date.now() - prev);

    if (changed) {
      console.log(step);
      led.blink(step);
      if (machine.state === "idle") changed = false;
    }
    prev = Date.now();
  }, 300);
});


board.on("exit", function() {

  led.off();
});
