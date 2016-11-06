
/* State machine */

;(function(){

  var __ = {
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


  function reset() {

    __ = {
      activeProc: idle,
      outputProc: naturalResults,
      old_state: 0,
      new_state: 0,
      range: 100,
      hi: 100,
      lo: 0,
      delta: 100 / 5,
    };

    return true;
  }


  function dump() {

    return __;
  }


  function config(opts) {

    var changed = false;

    Object.keys(opts).map(function(key){

      if (["delta", "old_state", "new_state"].indexOf(key) > -1) {
        __[key] = fixFloat(opts[key]);
        changed = true;
      }

      if (["hi", "lo"].indexOf(key) > -1) {
        __[key] = fixFloat(opts[key]);
        __.range = __.hi - __.lo;
        __.outputProc = adjustedResults;
        changed = true;
      }

      if (key === "natural_results") {
        __.outputProc = naturalResults;
        changed = true;
      }
    });

    return changed;
  }


  function climb(time) {

    __.old_state = Math.min(
      fixFloat(__.old_state + __.delta * time),
      __.new_state
    );

    if (__.old_state === __.new_state) {
      __.activeProc = idle;
    }

    return __.old_state;
  }


  function descend(time) {

    __.old_state = Math.max(
      fixFloat(__.old_state - __.delta * time),
      __.new_state
    );

    if (__.old_state === __.new_state) {
      __.activeProc = idle;
    }

    return __.old_state;
  }


  function idle() {

    return __.old_state;
  }


  function goto(input) {

    __.new_state = Math.min(
      Math.max(fixFloat(input), 0),
      100
    );

    if (__.new_state === __.old_state) {
      __.activeProc = idle;
    }

    else {
      __.activeProc = (__.new_state > __.old_state) ? climb : descend;
    }

    return true;
  }


  function adjustedResults(val) {

    var scalar = fixFloat(val * 0.01);
    return fixFloat(__.range * scalar + __.lo);
  }


  function naturalResults(val) {

    return val;
  }


  function tick(time) {

    return __.outputProc(__.activeProc(time * 0.001));
  }


  module.exports = {
    config: config,
    reset: reset,
    goto: goto,
    dump: dump,
    tick: tick,
    get state(){
      return __.activeProc.name;
    },
    _private: {
      adjustedResults: adjustedResults,
      naturalResults: naturalResults,
      fixFloat: fixFloat,
      descend: descend,
      climb: climb,
      idle: idle,
    }
  };


  function fixFloat(float) {

    return parseFloat(float.toPrecision(8));
  }

})();
