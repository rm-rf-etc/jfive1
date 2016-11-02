
/* State machine tests */

var machine = require("./machine.js");

machine.setup({
  delta: 2 / 5,
  max: 2,
});

var t = Date.now();

function time() {
  var float = (Date.now() - t) * 0.001;
  return parseFloat(float.toPrecision(4));
}

;(function() {
  setInterval(function(){
    console.log(time(), machine.step());
  }, 50);
})();
