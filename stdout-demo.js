
/* State machine tests */

var machine = require("./machine.js");

machine.setup({
  delta: 100 / 5,
  max: 100,
});

var t = Date.now();
var direction = "up  ";


function time() {

  var float = (Date.now() - t) * 0.001;
  return parseFloat(float.toPrecision(4));
}


;(function() {
  setInterval(function(){
    var res = machine.step();
    console.log(direction, res, time());

    if (res === 2) {
      direction = "down";
      machine.setTarget(0);
    }
    else if (res === 0) {
      direction = "up  ";
      machine.setTarget(2);
    }
  }, 100);
})();
