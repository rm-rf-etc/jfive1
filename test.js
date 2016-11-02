
/* State machine tests */

var assert = require("assert");
var machine = require("./machine.js");

function fixFloat(float) {

  return parseFloat(float.toPrecision(8));
}

function time(t) {

	return t * 1000;
}

var test = {
	basics: true,
	advanced: true,
	adjusted_output: true,
};

if (test.basics) {
	assert(machine.config);
	assert(machine.goto);
	assert(machine.dump);
	assert(machine.tick);

	// Run tests with adjusted outputs.
	machine.config({ hi: 100, lo: 0 });
	tests();

	// Run tests with natural outputs.
	machine.config({ natural_results: true });
	tests();

	function tests() {
		machine.config({ old_state: 50, new_state: 50 });
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.equal( machine.tick(time(2)), 50, 'It idles at 50.' );
		assert.equal( machine.tick(time(3)), 50, 'It idles at 50.' );
		assert.equal( machine.tick(time(4)), 50, 'It idles at 50.' );
		assert.equal( machine.tick(time(5)), 50, 'It idles at 50.' );

		// It changes to climb.
		machine.config({ old_state: 0, new_state: 0 });
		assert.equal( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.equal( machine.state, 'climb', 'It enters climb.' );

		// It changes to descend.
		machine.config({ old_state: 100, new_state: 100 });
		assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.equal( machine.state, 'descend', 'It enters descend.' );

		// It descends and then idles at destination.
		machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
		assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.goto( 16.78 ), true, 'It responds `true` after goto(***).' );
		assert.equal( machine.state, 'descend', 'It enters descend.' );
		assert.equal( machine.tick( time(1) ), 75, 'It changes correctly to 75.' );
		assert.equal( machine.tick( time(1) ), 50, 'It changes correctly to 50.' );
		assert.equal( machine.tick( time(1) ), 25, 'It changes correctly to 25.' );
		assert.equal( machine.tick( time(1) ), 16.78, 'It changes correctly to 16.78.' );
		assert.equal( machine.state, 'descend', 'It enters descend.' );
		assert.equal( machine.tick( time(1) ), 16.78, 'It idles correctly at 16.78.' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.tick( time(1) ), 16.78, 'It idles correctly at 16.78.' );

		// It climbs and then idles at destination.
		machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
		assert.equal( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.goto( 72.25 ), true, 'It responds `true` after goto(***).' );
		assert.equal( machine.state, 'climb', 'It enters climb.' );
		assert.equal( machine.tick( time(1) ), 25, 'It changes correctly to 25.' );
		assert.equal( machine.tick( time(1) ), 50, 'It changes correctly to 50.' );
		assert.equal( machine.tick( time(1) ), 72.25, 'It changes correctly to 72.25.' );
		assert.equal( machine.state, 'climb', 'It enters climb.' );
		assert.equal( machine.tick( time(1) ), 72.25, 'It idles correctly at 72.25.' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.tick( time(1) ), 72.25, 'It idles correctly at 72.25.' );
	}
}

if (test.advanced) {

	// Run tests with adjusted outputs.
	machine.config({ hi: 100, lo: 0 });
	tests();

	// Run tests with natural outputs.
	machine.config({ natural_results: true });
	tests();

	function tests() {
		// It has proper climbing fractional steps.
		machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
		assert.equal( machine.goto( 0 ), true, 'It responds `true` on goto(***).' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(***).' );
		assert.equal( machine.state, 'climb', 'It enters climb.' );

		var step = 0.2;
		for (var i=0; i<4; i=fixFloat(i+step)) {
			var actual = machine.tick( time(step) );
			var expected = fixFloat(100 / 4 * (i+step));
			assert.equal( actual, expected, 'It changes correctly to ' + expected + '.' );
		}
		assert.equal( machine.tick( time(step) ), 100, 'It idles correctly at 100.' );
		assert.equal( machine.tick( time(step) ), 100, 'It idles correctly at 100.' );
		assert.equal( machine.tick( time(step) ), 100, 'It idles correctly at 100.' );

		// It has proper descending fractional steps.
		machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
		assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.equal( machine.state, 'idle', 'It enters idle.' );
		assert.equal( machine.goto( 0 ), true, 'It responds `true` on goto(***).');
		assert.equal( machine.state, 'descend', 'It enters descend.' );

		var step = 0.2;
		for (var i=4; i>0; i=fixFloat(i-step)) {
			var actual = machine.tick( time(step) );
			var expected = fixFloat(100 / 4 * (i-step));
			assert.equal( actual, expected, 'It changes correctly to ' + expected + '.' );
		}
		assert.equal( machine.tick( time(step) ), 0, 'It idles correctly at 0.' );
		assert.equal( machine.tick( time(step) ), 0, 'It idles correctly at 0.' );
		assert.equal( machine.tick( time(step) ), 0, 'It idles correctly at 0.' );
	}
}

if (test.adjusted_output) {

	machine.config({ hi: 88, lo: 22 });
	var dump = machine.dump();
	var _range = dump._range;
	var _lo = dump._lo;

	// It has proper climbing fractional steps.
	machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
	assert.equal( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
	assert.equal( machine.state, 'idle', 'It enters idle.' );
	assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
	assert.equal( machine.state, 'climb', 'It enters climb.' );

	var step = 0.95;
	for (var i=0; i<4; i=fixFloat(i+step)) {
		var actual = machine.tick( time(step) );
		var expected = Math.min(88, fixFloat(100 / 4 * (i+step) * 0.01 * _range + _lo));
		assert.equal( actual, expected, 'It changes correctly to ' + expected + '.' );
	}
	assert.equal( machine.tick( time(step) ), 88, 'It idles correctly at 88.' );
	assert.equal( machine.tick( time(step) ), 88, 'It idles correctly at 88.' );
	assert.equal( machine.tick( time(step) ), 88, 'It idles correctly at 88.' );

	// It has proper descending fractional steps.
	machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
	assert.equal( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
	assert.equal( machine.state, 'idle', 'It enters idle.' );
	assert.equal( machine.goto( 0 ), true, 'It responds `true` after goto(***).');
	assert.equal( machine.state, 'descend', 'It enters descend.' );

	var step = 0.95;
	for (var i=4; i>0; i=fixFloat(i-step)) {
		var actual = machine.tick( time(step) );
		var expected = Math.max(22, fixFloat(100 / 4 * (i-step) * 0.01 * _range + _lo));
		assert.equal( actual, expected, 'It changes correctly to ' + expected + '.' );
	}
	assert.equal( machine.tick( time(step) ), 22, 'It idles correctly at 22.' );
	assert.equal( machine.tick( time(step) ), 22, 'It idles correctly at 22.' );
	assert.equal( machine.tick( time(step) ), 22, 'It idles correctly at 22.' );
}
