
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

beforeEach(function(){
	machine.reset();
})

describe("Object structure", function(){
	it("has expected methods and properties", function(){
		expect(machine.config).to.be.ok();
		expect(machine.reset).to.be.ok();
		expect(machine.goto).to.be.ok();
		expect(machine.dump).to.be.ok();
		expect(machine.tick).to.be.ok();
		expect(machine.state).to.be('idle');
	});
});

describe("Calculations", function(){
	it("gives sane results for floating point calculations", function(){

		// Test floating point math.
		expect(machine._private.fixFloat(0.1 * 0.2)).to.be(0.02);
		/*

		More testing of all calculations should go here.

		*/
	});
});

describe("Config method", function(){
	it("changes between natural and adjusted results", function(){

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

	it("resets to default settings", function(){

		expect(
			machine.reset()
		).to.be(true);

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
			dest: 0,
			maxSpeed: 100 / 5,
			speed: 0,
		});
	});

	it("ignores junk input", function(){

		machine.reset();

		expect(
			machine.config({ cats:0, dogs:1 })
		).to.be(false);

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
			dest: 0,
			maxSpeed: 20,
			speed: 0,
		});

	});

	it("changes state and maxSpeed values", function(){

		machine.reset();

		expect(
			machine.config({
				oldState: 80,
				newState: 70,
				maxSpeed: 100 / 8,
			})
		).to.be(true);

		expect(
			machine.dump()
		).to.eql({
			activeProc: machine._private.idle,
			outputProc: machine._private.naturalResults,
			oldState: 80,
			newState: 70,
			range: 100,
			hi: 100,
			lo: 0,
			dest: 0,
			maxSpeed: 12.5,
			speed: 0,
		});

		expect(machine.reset()).to.be(true);
	});
});

describe("Expected behavior", function(){
	it("gives correct step increments, state changes, and adjusted output", function(){

		machine.config({ oldState: 0, newState: 0 });
		expect(
			machine.goto(0) && machine.state === 'idle'
		).to.be(true);

		// Run tests with natural outputs.
		machine.config({ naturalResults: true });
		tests();

		// Run same test but through adjustedResults.
		machine.config({ hi: 100, lo: 0 });
		tests();

		function tests() {
			machine.config({ oldState: 50, newState: 50 });
			expect( machine.state ).to.be('idle');
			[50,50,50,50,50].forEach(function(expected){
				expect( machine.tick(time(1)) ).to.be(50);
			});

			// It changes to ascend.
			machine.config({ oldState: 0, newState: 0 });
			expect(
				machine.goto(100) && machine.state === 'ascend'
			).to.be(true);

			// It changes to descend.
			machine.config({ oldState: 100, newState: 100 });
			expect(
				machine.goto(0) && machine.state === 'descend'
			).to.be(true);


			// It descends and then idles at destination.
			machine.config({ oldState: 100, newState: 100, maxSpeed: 100 / 4 });
			expect(
				machine.goto(16.78) && machine.state === 'descend'
			).to.be(true);

			[75, 50, 25, 16.78, 16.78, 16.78].forEach(function(expected){
				expect( machine.tick(time(1)) ).to.be(expected);
				if (expected === 16.78) {
					expect( machine.state ).to.be('idle');
				}
			});


			// It climbs and then idles at destination.
			machine.config({ oldState: 0, newState: 0, maxSpeed: 100 / 4 });
			expect(
				machine.goto(72.25) && machine.state === 'ascend'
			).to.be(true);

			[25, 50, 72.25, 72.25, 72.25].forEach(function(expected){
				expect( machine.tick(time(1)) ).to.be(expected);
				if (expected === 72.25) {
					expect( machine.state ).to.be('idle');
				}
			});
		}
	});

	it("it climbs and descends in correct incremental amounts", function(){

		// Run tests with adjusted outputs.
		machine.config({ hi: 100, lo: 0 });
		tests();

		// Run tests with natural outputs.
		machine.config({ naturalResults: true });
		tests();

		function tests() {
			machine.config({ oldState: 0, newState: 0, maxSpeed: 100 / 1 });
			expect(
				machine.goto(100) && machine.state === 'ascend'
			).to.be(true);

			// It has proper climbing fractional steps.
			[20,40,60,80,100,100,100].forEach(function(expected){
				expect( machine.tick(time(0.2)) ).to.be(expected);
			});

			machine.config({ oldState: 100, newState: 100, maxSpeed: 100 / 1 });
			expect(
				machine.goto(0) && machine.state === 'descend'
			).to.be(true);

			// It has proper descending fractional steps.
			[80,60,40,20,0,0,0].forEach(function(expected){
				expect( machine.tick(time(0.2)) ).to.be(expected);
			});
		}
	});
});

describe("Fractional steps over alternate numerical ranges", function(){
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
			var maxSpeed = (hi - lo) / 4;


			// It has proper climbing fractional steps.
			machine.config({ oldState: 0, newState: 0, maxSpeed: 100 / 4 });
			expect(
				machine.goto(100) && machine.state === 'ascend'
			).to.be(true);


			mathFn = (hi > lo) ? Math.min : Math.max;
			[
				fixFloat(lo + maxSpeed * step * 1),
				fixFloat(lo + maxSpeed * step * 2),
				fixFloat(lo + maxSpeed * step * 3),
				fixFloat(lo + maxSpeed * step * 4),
				fixFloat(lo + maxSpeed * step * 5)
			].forEach(function(expected){
				expect( machine.tick(time(step)) ).to.be( mathFn(hi,expected) );
			});


			// It has proper descending fractional steps.
			machine.config({ oldState: 100, newState: 100, maxSpeed: 100 / 4 });
			expect(
				machine.goto(0) && machine.state === 'descend'
			).to.be(true);


			mathFn = (hi > lo) ? Math.max : Math.min;
			[
				fixFloat(hi - maxSpeed * step * 1),
				fixFloat(hi - maxSpeed * step * 2),
				fixFloat(hi - maxSpeed * step * 3),
				fixFloat(hi - maxSpeed * step * 4),
				fixFloat(hi - maxSpeed * step * 5)
			].forEach(function(expected){
				expect( machine.tick(time(step)) ).to.be( mathFn(lo,expected) );
			});
		}
	})
});

describe("Acceleration and deceleration", function(){
	it("accelerates and decelerates", function(){

		machine.config({ oldState: 0, newState: 0, maxSpeed: 100 / 5, acceleration: 2 });

		machine.goto(20);
		[2.5, 7.5, 15, 20].forEach(function(expected){
			expect( machine.tick(0.25) ).to.be(expected);
		});

		machine.goto(0);
		[15, 7.5, 2.5, 0].forEach(function(expected){
			expect( machine.tick(0.25) ).to.be(expected);
		});
	});
});
