
/* State machine tests */

var expect = require("expect.js");
var StateMachine = require("./statemachine.js");
var machine = new StateMachine();

function fixFloat(float) {

  return parseFloat(float.toPrecision(8));
}

function time(t) {

	return t * 1000;
}


describe("Basic aspects of operation", function(){
	it("has expected methods and properties", function(){
		expect(machine.config).to.be.ok();
		expect(machine.reset).to.be.ok();
		expect(machine.goto).to.be.ok();
		expect(machine.dump).to.be.ok();
		expect(machine.tick).to.be.ok();
		expect(machine.state).to.be('idle');
	});

	it("passes basic sanity checks", function(){
		// Test config, reset, and dump methods.
		expect(
			machine.config({ cats: 0, dogs: 1 })
		).to.be(false);

		expect(
			machine.config({
				hi: 90,
				lo: 10,
				oldState: 80,
				newState: 70,
				delta: 100 / 8,
			})
		).to.be(true);

		expect(
			machine.dump()
		).to.eql({
			activeProc: machine._private.idle,
			outputProc: machine._private.adjustedResults,
			oldState: 80,
			newState: 70,
			range: 80,
			hi: 90,
			lo: 10,
			delta: 12.5,
		});

		expect(machine.reset()).to.be(true);
		expect(
			machine.dump()
		).to.eql({
			activeProc: machine._private.idle,
			outputProc: machine._private.naturalResults,
			oldState: 0,
			newState: 0,
			range: 100,
			hi: 100,
			lo: 0,
			delta: 100 / 5,
		});
	});

	it("gives sane results for floating point calculations", function(){

		// Test floating point math.
		expect(machine._private.fixFloat(0.1 * 0.2)).to.be(0.02);
		/*

			Exhaustive testing of all calculations should go here.

		*/
	});
});

describe("Config method", function(){
	it("changes from natural to adjusted results", function(){

		expect(
			machine.dump().outputProc === machine._private.naturalResults
		).to.be(true);

		expect(
			machine.config({ hi:75, lo:25 })
		).to.be(true);

		expect(
			machine.dump().outputProc === machine._private.adjustedResults
		).to.be(true);

		expect(
			machine.config({ naturalResults:true })
		).to.be(true);

		expect(
			machine.dump().outputProc === machine._private.naturalResults
		).to.be(true);

	});
});

describe("Expected behavior", function(){
	it("gives correct step increments, state changes, and adjusted output", function(){

		// Run tests with adjusted outputs.
		machine.config({ hi: 100, lo: 0 });
		tests();

		// Run tests with natural outputs.
		machine.config({ naturalResults: true });
		tests();

		function tests() {
			machine.config({ oldState: 50, newState: 50 });
			expect( machine.state ).to.be('idle');
			expect( machine.tick(time(1)) ).to.be(50);
			expect( machine.tick(time(1)) ).to.be(50);
			expect( machine.tick(time(1)) ).to.be(50);
			expect( machine.tick(time(1)) ).to.be(50);
			expect( machine.tick(time(1)) ).to.be(50);

			// It changes to climb.
			machine.config({ oldState: 0, newState: 0 });
			expect( machine.goto( 0 ) ).to.be(true);
			expect( machine.state).to.be('idle');
			expect( machine.goto( 100 ) ).to.be(true);
			expect( machine.state ).to.be('climb');

			// It changes to descend.
			machine.config({ oldState: 100, newState: 100 });
			expect( machine.goto( 100 ) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto( 0 ) ).to.be(true);
			expect( machine.state ).to.be('descend');

			// It descends and then idles at destination.
			machine.config({ oldState: 100, newState: 100, delta: 100 / 4 });
			expect( machine.goto(100) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto(16.78) ).to.be(true);
			expect( machine.state ).to.be('descend');
			expect( machine.tick(time(1)) ).to.be(75);
			expect( machine.tick(time(1)) ).to.be(50);
			expect( machine.tick(time(1)) ).to.be(25);
			expect( machine.tick(time(1)) ).to.be(16.78);
			expect( machine.state ).to.be('idle');
			expect( machine.tick(time(1)) ).to.be(16.78);
			expect( machine.tick(time(1)) ).to.be(16.78);

			// It climbs and then idles at destination.
			machine.config({ oldState: 0, newState: 0, delta: 100 / 4 });
			expect( machine.goto(0) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto(72.25) ).to.be(true);
			expect( machine.state ).to.be('climb');
			expect( machine.tick(time(1)) ).to.be(25);
			expect( machine.tick(time(1)) ).to.be(50);
			expect( machine.tick(time(1)) ).to.be(72.25);
			expect( machine.state ).to.be('idle');
			expect( machine.tick(time(1)) ).to.be(72.25);
			expect( machine.tick(time(1)) ).to.be(72.25);
		}
	});

	it("it climbs and descends in correct incremental amounts", function(){

		// Run tests with adjusted outputs.
		machine.config({ hi: 100, lo: 0 });
		tests(100, 0);

		// Run tests with natural outputs.
		machine.config({ naturalResults: true });
		tests(100, 0);

		function tests(hi, lo) {
			machine.config({ oldState: 0, newState: 0, delta: 100 / 4 });
			expect( machine.goto(0) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto(100) ).to.be(true);
			expect( machine.state ).to.be('climb');

			// It has proper climbing fractional steps.
			var step = 0.2;
			for (var i=0; i<4; i=fixFloat(i+step)) {
				var actual = machine.tick(time(step));
				var expected = fixFloat(100 / 4 * (i+step));
				expect(actual).to.be(expected);
			}
			expect( machine.tick(time(step)) ).to.be(hi);
			expect( machine.tick(time(step)) ).to.be(hi);
			expect( machine.tick(time(step)) ).to.be(hi);

			machine.config({ oldState: 100, newState: 100, delta: 100 / 4 });
			expect( machine.goto(100) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto(0) ).to.be(true);
			expect( machine.state ).to.be('descend');

			// It has proper descending fractional steps.
			var step = 0.2;
			for (var i=4; i>0; i=fixFloat(i-step)) {
				var actual = machine.tick(time(step));
				var expected = fixFloat(100 / 4 * (i-step));
				expect(actual).to.be(expected);
			}
			expect( machine.tick(time(step)) ).to.be(lo);
			expect( machine.tick(time(step)) ).to.be(lo);
			expect( machine.tick(time(step)) ).to.be(lo);
		}
	});
});

describe("Advanced behavior", function(){
	it("gives correct adjusted output both inverted and not", function(){

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
			expect( machine.goto(0) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto(100) ).to.be(true);
			expect( machine.state ).to.be('climb');


			mathFn = (hi > lo) ? Math.min : Math.max;

			for (var i=0; i<4; i=fixFloat(i+step)) {
				var actual = machine.tick(time(step));
				var expected = mathFn(hi, fixFloat(100 / 4 * (i+step) * 0.01 * range + lo));
				expect(actual).to.be(expected);
			}
			expect( machine.tick(time(step)) ).to.be(hi);
			expect( machine.tick(time(step)) ).to.be(hi);
			expect( machine.tick(time(step)) ).to.be(hi);



			// It has proper descending fractional steps.
			machine.config({ oldState: 100, newState: 100, delta: 100 / 4 });
			expect( machine.goto(100) ).to.be(true);
			expect( machine.state ).to.be('idle');
			expect( machine.goto(0) ).to.be(true);
			expect( machine.state ).to.be('descend');


			mathFn = (hi > lo) ? Math.max : Math.min;

			for (var i=4; i>0; i=fixFloat(i-step)) {
				var actual = machine.tick(time(step));
				var expected = mathFn(lo, fixFloat(100 / 4 * (i-step) * 0.01 * range + lo));
				expect(actual).to.be(expected);
			}
			expect( machine.tick(time(step)) ).to.be(lo);
			expect( machine.tick(time(step)) ).to.be(lo);
			expect( machine.tick(time(step)) ).to.be(lo);
		}
	})
});

