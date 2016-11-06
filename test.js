
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

console.log(
	'Tests enabled:',
	JSON.stringify(test, null, 2)
);


if (test.basics) {

	assert(machine.config);
	assert(machine.reset);
	assert(machine.state);
	assert(machine.goto);
	assert(machine.dump);
	assert(machine.tick);


	// Test config, reset, and dump methods.
	assert.strictEqual(
		machine.config({ cats: 0, dogs: 1 }),
		false,
		'It says `false` upon junk config() input.'
	);
	assert.strictEqual(
		machine.config({
			hi: 90,
			lo: 10,
			old_state: 80,
			new_state: 70,
			delta: 100 / 8,
		}),
		true,
		'It says `true` upon config().'
	);
	assert.deepStrictEqual(
		machine.dump(),
		{
			activeProc: machine._private.idle,
			outputProc: machine._private.adjustedResults,
			old_state: 80,
			new_state: 70,
			range: 80,
			hi: 90,
			lo: 10,
			delta: 12.5,
		},
		'It shows new values when calling dump() after using config().'
	);
	assert.strictEqual(machine.reset(), true, 'It says `true` upon reset.');
	assert.deepStrictEqual(
		machine.dump(),
		{
			activeProc: machine._private.idle,
			outputProc: machine._private.naturalResults,
			old_state: 0,
			new_state: 0,
			range: 100,
			hi: 100,
			lo: 0,
			delta: 100 / 5,
		},
		'It shows defaults when calling dump() after calling reset().'
	);

	// Test floating point math.
	assert.strictEqual(machine._private.fixFloat(0.1 * 0.2), 0.02);
	/*

		Exhaustive testing of all calculations should go here.

	*/

	// Run tests with adjusted outputs.
	machine.config({ hi: 100, lo: 0 });
	tests();

	// Run tests with natural outputs.
	machine.config({ natural_results: true });
	tests();

	function tests() {
		machine.config({ old_state: 50, new_state: 50 });
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );

		// It changes to climb.
		machine.config({ old_state: 0, new_state: 0 });
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'climb', 'It enters climb.' );

		// It changes to descend.
		machine.config({ old_state: 100, new_state: 100 });
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.strictEqual( machine.state, 'descend', 'It enters descend.' );

		// It descends and then idles at destination.
		machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 16.78 ), true, 'It responds `true` after goto(***).' );
		assert.strictEqual( machine.state, 'descend', 'It enters descend.' );
		assert.strictEqual( machine.tick( time(1) ), 75, 'It changes correctly to 75.' );
		assert.strictEqual( machine.tick( time(1) ), 50, 'It changes correctly to 50.' );
		assert.strictEqual( machine.tick( time(1) ), 25, 'It changes correctly to 25.' );
		assert.strictEqual( machine.tick( time(1) ), 16.78, 'It changes correctly to 16.78.' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.tick( time(1) ), 16.78, 'It idles correctly at 16.78.' );
		assert.strictEqual( machine.tick( time(1) ), 16.78, 'It idles correctly at 16.78.' );

		// It climbs and then idles at destination.
		machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 72.25 ), true, 'It responds `true` after goto(***).' );
		assert.strictEqual( machine.state, 'climb', 'It enters climb.' );
		assert.strictEqual( machine.tick( time(1) ), 25, 'It changes correctly to 25.' );
		assert.strictEqual( machine.tick( time(1) ), 50, 'It changes correctly to 50.' );
		assert.strictEqual( machine.tick( time(1) ), 72.25, 'It changes correctly to 72.25.' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.tick( time(1) ), 72.25, 'It idles correctly at 72.25.' );
		assert.strictEqual( machine.tick( time(1) ), 72.25, 'It idles correctly at 72.25.' );
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
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(***).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(***).' );
		assert.strictEqual( machine.state, 'climb', 'It enters climb.' );

		var step = 0.2;
		for (var i=0; i<4; i=fixFloat(i+step)) {
			var actual = machine.tick( time(step) );
			var expected = fixFloat(100 / 4 * (i+step));
			assert.strictEqual( actual, expected, 'It changes correctly to ' + expected + '.' );
		}
		assert.strictEqual( machine.tick( time(step) ), 100, 'It idles correctly at 100.' );
		assert.strictEqual( machine.tick( time(step) ), 100, 'It idles correctly at 100.' );
		assert.strictEqual( machine.tick( time(step) ), 100, 'It idles correctly at 100.' );

		// It has proper descending fractional steps.
		machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(***).');
		assert.strictEqual( machine.state, 'descend', 'It enters descend.' );

		var step = 0.2;
		for (var i=4; i>0; i=fixFloat(i-step)) {
			var actual = machine.tick( time(step) );
			var expected = fixFloat(100 / 4 * (i-step));
			assert.strictEqual( actual, expected, 'It changes correctly to ' + expected + '.' );
		}
		assert.strictEqual( machine.tick( time(step) ), 0, 'It idles correctly at 0.' );
		assert.strictEqual( machine.tick( time(step) ), 0, 'It idles correctly at 0.' );
		assert.strictEqual( machine.tick( time(step) ), 0, 'It idles correctly at 0.' );
	}
}

if (test.adjusted_output) {

	machine.config({ hi: 88, lo: 22 });
	var dump = machine.dump();
	var range = dump.range;
	var lo = dump.lo;

	// It has proper climbing fractional steps.
	machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
	assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
	assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
	assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
	assert.strictEqual( machine.state, 'climb', 'It enters climb.' );

	var step = 0.95;
	for (var i=0; i<4; i=fixFloat(i+step)) {
		var actual = machine.tick( time(step) );
		var expected = Math.min(88, fixFloat(100 / 4 * (i+step) * 0.01 * range + lo));
		assert.strictEqual( actual, expected, 'It changes correctly to ' + expected + '.' );
	}
	assert.strictEqual( machine.tick( time(step) ), 88, 'It idles correctly at 88.' );
	assert.strictEqual( machine.tick( time(step) ), 88, 'It idles correctly at 88.' );
	assert.strictEqual( machine.tick( time(step) ), 88, 'It idles correctly at 88.' );

	// It has proper descending fractional steps.
	machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
	assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
	assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
	assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` after goto(***).');
	assert.strictEqual( machine.state, 'descend', 'It enters descend.' );

	var step = 0.95;
	for (var i=4; i>0; i=fixFloat(i-step)) {
		var actual = machine.tick( time(step) );
		var expected = Math.max(22, fixFloat(100 / 4 * (i-step) * 0.01 * range + lo));
		assert.strictEqual( actual, expected, 'It changes correctly to ' + expected + '.' );
	}
	assert.strictEqual( machine.tick( time(step) ), 22, 'It idles correctly at 22.' );
	assert.strictEqual( machine.tick( time(step) ), 22, 'It idles correctly at 22.' );
	assert.strictEqual( machine.tick( time(step) ), 22, 'It idles correctly at 22.' );
}

console.log('Tests done passed. Yeehaw!');
