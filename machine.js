
/* State machine */

;(function(){
  // state process
  var _activeProc = idle;
  var _output = naturalResults;

  // state tracking, 0 - 100
  var old_state = 0;
  var new_state = 0;

  // range for output values
  var _lo = 0;
  var _hi = 100;
  var _range = _hi - _lo;

  // rate of change
  var _d = 100 / 5;


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
    if (test("hi")) {
      _hi = opts.hi;
      _range = _hi - _lo;
      _output = adjustedResults;
    }
    if (test("lo")) {
      _lo = opts.lo;
      _range = _hi - _lo;
      _output = adjustedResults;
    }
    if (test("natural_results")) {
      _output = naturalResults;
    }
  }


  function climb(time) {

    if (old_state === new_state) {
      _activeProc = idle;
    }
    else {
      var x = old_state + _d * time;
      old_state = fixFloat((x > new_state) ? new_state : x);
    }

    return old_state;
  }


  function descend(time) {

    if (old_state === new_state) {
      _activeProc = idle;
    }
    else {
      var x = old_state - _d * time;
      old_state = fixFloat((x < new_state) ? new_state : x);
    }

    return old_state;
  }


  function idle() {

    return old_state;
  }


  function goto(input) {

    input = fixFloat(input);
    input = Math.max(input, 0);
    input = Math.min(input, 100);
    new_state = input;

    if (new_state > old_state) {
      _activeProc = climb;
    }
    else if (new_state < old_state) {
      _activeProc = descend;
    }
    else {
      _activeProc = idle;
    }

    return true;
  }


  function dump() {

    return {
      old_state: old_state,
      new_state: new_state,
      _activeProc: _activeProc.name,
      _output: _output.name,
      _range: _range,
      _hi: _hi,
      _lo: _lo,
      _d: _d,
    };
  }


  function adjustedResults(val) {

    var scalar = fixFloat(val * 0.01);
    return fixFloat(_range * scalar + _lo);
  }


  function naturalResults(val) {

    return val;
  }


  function tick(time) {

    return _output(_activeProc(time * 0.001));
  }


  module.exports = {
    config: config,
    goto: goto,
    dump: dump,
    tick: tick,
    get state(){
      return _activeProc.name;
    },
  };


  function fixFloat(float) {

    return parseFloat(float.toPrecision(8));
  }
})();
