
/* State machine */

// state process
var activeProc = idle;

// machine status
var running = false;

// state tracking, 0 - 100
var old_state = 0;
var new_state = 0;

// range for output values
var _lo = 0;
var _hi = 2;

// rate of change
var _d = 100 / 5;

// time
var _t = 0;


function config(opts) {

  var test = function(prop){
    return opts.hasOwnProperty(prop)
  };

  if (test("delta")) {
    _d = opts.delta;
  }
  if (test("old_state")) {
    old_state = opts.old_state;
  }
  if (test("new_state")) {
    new_state = opts.new_state;
  }
  if (test("_t")) {
    _t = opts._t;
  }
  if (test("enabled")) {
    enabled = opts.enabled;
  }
  if (test("activeProc")) {
    activeProc = opts.activeProc;
  }
  if (test("hi")) {
    _hi = opts.hi;
  }
  if (test("lo")) {
    _lo = opts.lo;
  }
}


function climb(time) {

  var x = old_state + _d * time;
  old_state = fixFloat((x > new_state) ? new_state : x);

  return old_state;
}


function descend(time) {

  var x = old_state - _d * time;
  old_state = fixFloat((x < new_state) ? new_state : x);

  return old_state;
}


function idle() {

  return old_state;
}


function goto(input) {

  new_state = Math.min(parseInt(input, 10), 100);

  if (new_state > old_state) {
    activeProc = climb;
  }
  else if (new_state < old_state) {
    activeProc = descend;
  }
  else if (new_state === old_state) {
    activeProc = idle;
  }

  return true;
}


function dump() {

  return {
    old_state: old_state,
    new_state: new_state,
    running: running,
  };
}


function tick(time) {

  return activeProc(time);
}


function getState() {

  return activeProc.name;
}


module.exports = {
  config: config,
  goto: goto,
  dump: dump,
  tick: tick,
  get state(){
    return activeProc.name;
  },
};


function fixFloat(float) {

  return parseFloat(float.toPrecision(8));
}
