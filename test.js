
/* State machine tests */

var assert = require("assert");
var machine = require("./machine_new.js");

function fixFloat(float) {

  return parseFloat(float.toPrecision(8));
}

var test = {
	basics: false,
	advanced: true,
}

if (test.basics) {
	assert(machine.config);
	assert(machine.goto);
	assert(machine.dump);
	assert(machine.tick);

	// It idles.
	machine.config({ old_state: 50, new_state: 50 });
	assert( machine.state === 'idle' );
	assert( machine.tick(1) === 50 );
	assert( machine.tick(2) === 50 );
	assert( machine.tick(3) === 50 );
	assert( machine.tick(4) === 50 );
	assert( machine.tick(5) === 50 );

	// It changes to climb.
	machine.config({ old_state: 0, new_state: 0 });
	assert( machine.goto( 0 ) === true );
	assert( machine.state === 'idle' );
	assert( machine.goto( 100 ) === true );
	assert( machine.state === 'climb' );

	// It changes to descend.
	machine.config({ old_state: 100, new_state: 100 });
	assert( machine.goto( 100 ) === true );
	assert( machine.state === 'idle' );
	assert( machine.goto( 0 ) === true );
	assert( machine.state === 'descend' );

	// It descends and then idles at destination.
	machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
	assert( machine.goto( 100 ) === true );
	assert( machine.state === 'idle' );
	assert( machine.goto( 0 ) === true);
	assert( machine.state === 'descend' );
	assert( machine.tick( 1 ) === 75 );
	assert( machine.tick( 1 ) === 50 );
	assert( machine.tick( 1 ) === 25 );
	assert( machine.tick( 1 ) === 0 );
	assert( machine.tick( 1 ) === 0 );
	assert( machine.tick( 1 ) === 0 );

	// It climbs and then idles at destination.
	machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
	assert( machine.goto( 0 ) === true );
	assert( machine.state === 'idle' );
	assert( machine.goto( 100 ) === true);
	assert( machine.state === 'climb' );
	assert( machine.tick( 1 ) === 25 );
	assert( machine.tick( 1 ) === 50 );
	assert( machine.tick( 1 ) === 75 );
	assert( machine.tick( 1 ) === 100 );
	assert( machine.tick( 1 ) === 100 );
	assert( machine.tick( 1 ) === 100 );
}

if (test.advanced) {
	// It has proper climbing fractional steps.
	machine.config({ old_state: 0, new_state: 0, delta: 100 / 4 });
	assert( machine.goto( 0 ) === true );
	assert( machine.state === 'idle' );
	assert( machine.goto( 100 ) === true);
	assert( machine.state === 'climb' );

	var step = 0.2;
	for (var i=0; i<4; i=fixFloat(i+step)) {
		var res = machine.tick( step );
		assert( res === fixFloat(100 / 4 * (i+step)) );
	}
	assert( machine.tick( step ) === 100 );
	assert( machine.tick( step ) === 100 );
	assert( machine.tick( step ) === 100 );

	// It has proper descending fractional steps.
	machine.config({ old_state: 100, new_state: 100, delta: 100 / 4 });
	assert( machine.goto( 100 ) === true );
	assert( machine.state === 'idle' );
	assert( machine.goto( 0 ) === true);
	assert( machine.state === 'descend' );

	var step = 0.2;
	for (var i=4; i>0; i=fixFloat(i-step)) {
		var res = machine.tick( step );
		assert( res === fixFloat(100 / 4 * (i-step)) );
	}
	assert( machine.tick( step ) === 0 );
	assert( machine.tick( step ) === 0 );
	assert( machine.tick( step ) === 0 );
}
