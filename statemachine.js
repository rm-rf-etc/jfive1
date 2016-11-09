
/* State machine */


module.exports = function StateMachine() {

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


  Object.defineProperty(this, 'state', { get:function(){
      return scope.activeProc.name;
    }
  });


  Object.defineProperty(this, '_private', { get:function(){
      return {
        adjustedResults: adjustedResults,
        naturalResults: naturalResults,
        fixFloat: fixFloat,
        descend: descend,
        climb: climb,
        idle: idle,
      };
    }
  });


  /*
  Call this to set a new target.
  */
  this.goto = function goto(input) {

    scope.newState = Math.min(
      Math.max(fixFloat(input), 0),
      100
    );

    if (scope.newState === scope.oldState) {
      scope.activeProc = idle;
    }

    else {
      scope.activeProc = (scope.newState > scope.oldState) ? climb : descend;
    }

    return true;
  }


  /*
  Our main process. Your code should trigger this in every loop.
  */
  this.tick = function tick(time) {

    return scope.outputProc(scope.activeProc(time * 0.001));
  }


  /*
  Show private data.
  */
  this.dump = function dump() {

    return scope;
  }


  /*
  Restore defaults.
  */
  this.reset = function reset() {

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

    return true;
  }


  /*
  Change defaults, or even internal state.
  */
  this.config = function config(opts) {

    var changed = false;

    Object.keys(opts).forEach(function(key){

      if (["delta", "oldState", "newState"].indexOf(key) > -1) {
        scope[key] = fixFloat(opts[key]);
        changed = true;
      }

      if (["hi", "lo"].indexOf(key) > -1) {
        scope[key] = fixFloat(opts[key]);
        scope.range = scope.hi - scope.lo;
        scope.outputProc = adjustedResults;
        changed = true;
      }

      if (key === "naturalResults") {
        scope.outputProc = naturalResults;
        changed = true;
      }
    });

    return changed;
  }


  function climb(time) {

    scope.oldState = Math.min(
      fixFloat(scope.oldState + scope.delta * time),
      scope.newState
    );

    if (scope.oldState === scope.newState) {
      scope.activeProc = idle;
    }

    return scope.oldState;
  }


  function descend(time) {

    scope.oldState = Math.max(
      fixFloat(scope.oldState - scope.delta * time),
      scope.newState
    );

    if (scope.oldState === scope.newState) {
      scope.activeProc = idle;
    }

    return scope.oldState;
  }


  function idle() {

    return scope.oldState;
  }


  function adjustedResults(val) {

    var scalar = fixFloat(val * 0.01);
    return fixFloat(scope.range * scalar + scope.lo);
  }


  function naturalResults(val) {

    return val;
  }


  function fixFloat(float) {

    return parseFloat(float.toPrecision(8));
  }
}
