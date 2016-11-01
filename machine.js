
/* State machine */

var old_state = 0;
var new_state = 300;
var delta_rate = 2 / 10 * 1000;
var t = Date.now();
// var max;


function setup(opts) {

  if (opts.delta) {
    delta_rate = opts.delta * 1000;
  }
}

function getDelta(time) {
    return delta_rate * time;
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
        old_state = (old_state + p_delta > new_state) ? new_state : old_state + p_delta;
    }
    else {
        old_state = (old_state - p_delta < new_state) ? new_state : old_state - p_delta;
    }
    
    t = now;
}


function step() {

  if (targetHasChanged()) {
    applyStateChanges();
    return state;
  }
}


module.exports = {
  setRate: setRate,
  setup: setup,
  step: step,
}
