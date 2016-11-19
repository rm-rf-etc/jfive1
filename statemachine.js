
/* State machine */

var module = module || {}
module.exports = function StateMachine () {

  // private
  var scope = {
    // state process
    activeProc: idle,
    outputProc: naturalResults,

    // state tracking, 0 - 100
    oldState: 0,
    newState: 0,

    // range for output values
    range: 100,
    hi: 100,
    lo: 0,

    // rate of change
    delta: 100 / 5,
  };

  var self = this;
  self.state = 'idle';

  self._private = {
    adjustedResults: adjustedResults,
    naturalResults: naturalResults,
    fixFloat: fixFloat,
    descend: descend,
    climb: climb,
    idle: idle,
  };


  /*
  Call this to set a new target.
  */
  self.goto = function (input) {

    scope.newState = Math.min(
      Math.max(fixFloat(input), 0),
      100
    );

    if (scope.newState === scope.oldState) {
      scope.activeProc = idle;
      self.state = 'idle';

      return true;
    }

    if (scope.newState > scope.oldState) {
      scope.activeProc = climb;
      self.state = 'climb';
    }

    else {
      scope.activeProc = descend;
      self.state = 'descend';
    }

    return true;
  }


  /*
  Our main process. Your code should trigger this in every loop.
  */
  self.tick = function (time) {

    return scope.outputProc(scope.activeProc(time * 0.001));
  }


  /*
  Show private data.
  */
  self.dump = function () {

    return scope;
  }


  /*
  Restore defaults.
  */
  self.reset = function () {

    scope = {
      activeProc: idle,
      outputProc: naturalResults,
      oldState: 0,
      newState: 0,
      range: 100,
      hi: 100,
      lo: 0,
      delta: 100 / 5,
    };
    self.state = 'idle';

    return true;
  }


  /*
  Can change defaults or modify internal state.
  */
  self.config = function (opts) {

    var changed = false;

    Object.keys(opts).forEach(function(key){

      if (['delta', 'oldState', 'newState'].indexOf(key) > -1) {
        scope[key] = fixFloat(opts[key]);
        changed = true;
      }

      if (['hi', 'lo'].indexOf(key) > -1) {
        scope[key] = fixFloat(opts[key]);
        scope.range = fixFloat(scope.hi - scope.lo);
        scope.outputProc = adjustedResults;
        changed = true;
      }

      if (key === 'naturalResults' && opts[key]) {
        scope.outputProc = naturalResults;
        changed = true;
      }
    });

    return changed;
  }


  function climb (time) {

    scope.oldState = Math.min(
      fixFloat(scope.oldState + scope.delta * time),
      scope.newState
    );

    if (scope.oldState === scope.newState) {
      scope.activeProc = idle;
      self.state = 'idle';
    }

    return scope.oldState;
  }


  function descend (time) {

    scope.oldState = Math.max(
      fixFloat(scope.oldState - scope.delta * time),
      scope.newState
    );

    if (scope.oldState === scope.newState) {
      scope.activeProc = idle;
      self.state = 'idle';
    }

    return scope.oldState;
  }


  function idle () {

    return scope.oldState;
  }


  /*
  Produce value between hi and lo. Takes percent value (0 - 100).
  */
  function adjustedResults (val) {

    return fixFloat(scope.range * (val * 0.01) + scope.lo);
  }


  /*
  Alternative to adjustedResults. Is ran when hi = 100 and lo = 0.
  */
  function naturalResults (val) {

    return val;
  }


  function fixFloat (float) {

    return parseFloat(float.toPrecision(8));
  }
}
