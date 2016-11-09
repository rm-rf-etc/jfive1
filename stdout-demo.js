
/* State machine tests */

var StateMachine = require("./statemachine.js");
var machine = new StateMachine();

machine.config({
  delta: 100 / 5,
});

var _t = Date.now();
var direction = "down";


function time() {

  var float = (Date.now() - _t);
  return parseFloat(float.toPrecision(4));
}


;(function() {
  setInterval(function(){
    var now = Date.now();
    var res = machine.tick(now - _t);
    console.log(direction, res);

    if (machine.state === "idle") {
      if (direction === "up  ") {
        direction = "down";
        machine.goto(0);
      }
      else {
        direction = "up  ";
        machine.goto(100);
      }
    }
    _t = now;
  }, 100);
})();
