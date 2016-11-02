
/* State machine tests */

var assert = require("assert");

// Stub Date.now();
var time;
global._Date = global.Date;
global.Date = function() {};
global.Date.now = function(){
  return time * 1000;
};

time = 0;
var machine = require("./machine.js");

assert(machine.setRate);
assert(machine.setup);
assert(machine.step);

machine.setup({ delta: 2 / 2 });

time = 1;
var res = machine.step();
assert.equal(res, 1);
console.log(res);

time = 2;
var res = machine.step();
assert.equal(res, 2);
console.log(res);
