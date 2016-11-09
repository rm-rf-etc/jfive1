
/* State machine tests */

var assert = require("assert");
var StateMachine = require("./statemachine.js");
var machine = new StateMachine();

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

	assert(machine.config, 'It has config() method');
	assert(machine.reset, 'It has reset() method');
	assert(machine.goto, 'It has goto() method');
	assert(machine.dump, 'It has dump() method');
	assert(machine.tick, 'It has tick() method');

	assert.strictEqual(machine.state, 'idle', 'It has state property');


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
			oldState: 80,
			newState: 70,
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
			oldState: 80,
			newState: 70,
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
			oldState: 0,
			newState: 0,
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
		machine.config({ oldState: 50, newState: 50 });
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );
		assert.strictEqual( machine.tick(time(1)), 50, 'It idles at 50.' );

		// It changes to climb.
		machine.config({ oldState: 0, newState: 0 });
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'climb', 'It enters climb.' );

		// It changes to descend.
		machine.config({ oldState: 100, newState: 100 });
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.strictEqual( machine.state, 'descend', 'It enters descend.' );

		// It descends and then idles at destination.
		machine.config({ oldState: 100, newState: 100, delta: 100 / 4 });
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
		machine.config({ oldState: 0, newState: 0, delta: 100 / 4 });
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
	tests(100, 0);

	// Run tests with natural outputs.
	machine.config({ natural_results: true });
	tests(100, 0);

	function tests(hi, lo) {
		// It has proper climbing fractional steps.
		machine.config({ oldState: 0, newState: 0, delta: 100 / 4 });
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
		assert.strictEqual( machine.tick( time(step) ), hi, 'It idles correctly at ' + hi + '.' );
		assert.strictEqual( machine.tick( time(step) ), hi, 'It idles correctly at ' + hi + '.' );
		assert.strictEqual( machine.tick( time(step) ), hi, 'It idles correctly at ' + hi + '.' );

		// It has proper descending fractional steps.
		machine.config({ oldState: 100, newState: 100, delta: 100 / 4 });
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
		assert.strictEqual( machine.tick( time(step) ), lo, 'It idles correctly at ' + lo + '.' );
		assert.strictEqual( machine.tick( time(step) ), lo, 'It idles correctly at ' + lo + '.' );
		assert.strictEqual( machine.tick( time(step) ), lo, 'It idles correctly at ' + lo + '.' );
	}
}

if (test.adjusted_output) {

	// Run tests with adjusted outputs.
	tests(88, 22);

	// Run tests with inverse adjusted outputs.
	tests(22, 88);


	function tests(hi, lo) {

		machine.config({ hi: hi, lo: lo });
		var dump = machine.dump();
		var range = dump.range;
		var lo = dump.lo;

		var mathFn;
		var step = 0.95;


		// It has proper climbing fractional steps.
		machine.config({ oldState: 0, newState: 0, delta: 100 / 4 });
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` on goto(0).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'climb', 'It enters climb.' );


		mathFn = (hi > lo) ? Math.min : Math.max;

		for (var i=0; i<4; i=fixFloat(i+step)) {
			var actual = machine.tick( time(step) );
			var expected = mathFn(hi, fixFloat(100 / 4 * (i+step) * 0.01 * range + lo));
			assert.strictEqual( actual, expected, 'It changes correctly to ' + expected + '.' );
		}
		assert.strictEqual( machine.tick( time(step) ), hi, 'It idles correctly at ' + hi + '.' );
		assert.strictEqual( machine.tick( time(step) ), hi, 'It idles correctly at ' + hi + '.' );
		assert.strictEqual( machine.tick( time(step) ), hi, 'It idles correctly at ' + hi + '.' );



		// It has proper descending fractional steps.
		machine.config({ oldState: 100, newState: 100, delta: 100 / 4 });
		assert.strictEqual( machine.goto( 100 ), true, 'It responds `true` on goto(100).' );
		assert.strictEqual( machine.state, 'idle', 'It enters idle.' );
		assert.strictEqual( machine.goto( 0 ), true, 'It responds `true` after goto(***).');
		assert.strictEqual( machine.state, 'descend', 'It enters descend.' );


		mathFn = (hi > lo) ? Math.max : Math.min;

		for (var i=4; i>0; i=fixFloat(i-step)) {
			var actual = machine.tick( time(step) );
			var expected = mathFn(lo, fixFloat(100 / 4 * (i-step) * 0.01 * range + lo));
			assert.strictEqual( actual, expected, 'It changes correctly to ' + expected + '.' );
		}
		assert.strictEqual( machine.tick( time(step) ), lo, 'It idles correctly at ' + lo + '.' );
		assert.strictEqual( machine.tick( time(step) ), lo, 'It idles correctly at ' + lo + '.' );
		assert.strictEqual( machine.tick( time(step) ), lo, 'It idles correctly at ' + lo + '.' );
	}
}

console.log('Tests done passed. Yeehaw!');
