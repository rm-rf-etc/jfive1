
/* State machine */

var old_state = 0;
var new_state = 2;
var delta_rate = 2 / 5;
var t = Date.now();
// var max;


function setup(opts) {

  if (opts.delta) {
    delta_rate = opts.delta;
  }
}


function numFix(float) {
  return parseFloat(float.toPrecision(8));
}


function getDelta(time) {
    return numFix(delta_rate * time * 0.001);
}


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
        old_state = numFix((old_state + p_delta > new_state) ? new_state : old_state + p_delta);
    }
    else if (new_state < old_state) {
        old_state = numFix((old_state - p_delta < new_state) ? new_state : old_state - p_delta);
    }
    
    t = now;
}


function step() {

  if (targetHasChanged()) {
    applyStateChanges();
  }
  return old_state;
}


module.exports = {
  setRate: setRate,
  setup: setup,
  step: step,
}
