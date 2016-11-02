
/* State machine */

var old_state = 0;
var new_state = 100;
var delta_rate = 100 / 5;
var _t = null;
var enabled = false;
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


function setTarget(input) {

  _t = Date.now();
  new_state = parseInt(input, 10);
}


function showData() {

  return {
    old_state: old_state,
    new_state: new_state,
    enabled: enabled,
  };
}


function targetHasChanged() {

  return new_state !== old_state;
}


function applyStateChanges() {

  var now = Date.now();
  var p_delta = getDelta(now - _t);

  if (new_state > old_state) {
    old_state = numFix((old_state + p_delta > new_state) ? new_state : old_state + p_delta);
  }
  else if (new_state < old_state) {
    old_state = numFix((old_state - p_delta < new_state) ? new_state : old_state - p_delta);
  }

  _t = now;
}


function step() {

  if (!enabled) {
    _t = Date.now();
    enabled = true;
  }

  if (targetHasChanged()) {
    applyStateChanges();
  }
  return old_state;
}


module.exports = {
  setTarget: setTarget,
  showData: showData,
  setup: setup,
  step: step,
};
