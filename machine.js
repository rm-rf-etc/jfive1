
/* State machine */

;(function(){

  var _self = {
    // state process
    activeProc: idle,
    outputProc: naturalResults,

    // state tracking, 0 - 100
    old_state: 0,
    new_state: 0,

    // range for output values
    range: 100,
    hi: 100,
    lo: 0,

    // rate of change
    delta: 100 / 5,
  };


  function config(opts) {

    var changed = false;

    Object.keys(opts).map(function(key){

      if (["delta", "old_state", "new_state"].indexOf(key) > -1) {
        _self[key] = opts[key];
        changed = true;
      }

      if (["hi", "lo"].indexOf(key) > -1) {
        _self[key] = opts[key];
        _self.range = _self.hi - _self.lo;
        _self.outputProc = adjustedResults;
        changed = true;
      }

      if (key === "natural_results") {
        _self.outputProc = naturalResults;
        changed = true;
      }
    });

    return changed;
  }


  function climb(time) {

    if (_self.old_state === _self.new_state) {
      _self.activeProc = idle;
    }
    else {
      var x = _self.old_state + _self.delta * time;
      _self.old_state = fixFloat((x > _self.new_state) ? _self.new_state : x);
    }

    return _self.old_state;
  }


  function descend(time) {

    if (_self.old_state === _self.new_state) {
      _self.activeProc = idle;
    }
    else {
      var x = _self.old_state - _self.delta * time;
      _self.old_state = fixFloat((x < _self.new_state) ? _self.new_state : x);
    }

    return _self.old_state;
  }


  function idle() {

    return _self.old_state;
  }


  function goto(input) {

    input = fixFloat(input);
    input = Math.max(input, 0);
    input = Math.min(input, 100);
    _self.new_state = input;

    if (_self.new_state > _self.old_state) {
      _self.activeProc = climb;
    }
    else if (_self.new_state < _self.old_state) {
      _self.activeProc = descend;
    }
    else {
      _self.activeProc = idle;
    }

    return true;
  }


  function dump() {

    return _self;
  }


  function adjustedResults(val) {

    var scalar = fixFloat(val * 0.01);
    return fixFloat(_self.range * scalar + _self.lo);
  }


  function naturalResults(val) {

    return val;
  }


  function tick(time) {

    return _self.outputProc(_self.activeProc(time * 0.001));
  }


  module.exports = {
    config: config,
    goto: goto,
    dump: dump,
    tick: tick,
    get state(){
      return _self.activeProc.name;
    },
    _private: {
      adjustedResults: adjustedResults,
      naturalResults: naturalResults,
      fixFloat: fixFloat,
      descend: descend,
      climb: climb,
      idle: idle,
      _has: _has,
    }
  };


  function fixFloat(float) {

    return parseFloat(float.toPrecision(8));
  }

  function _has(thing, prop) {

    return thing.hasOwnProperty(prop);
  }

})();
