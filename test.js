
/* State machine tests */

var assert = require("assert");
var machine = require("./machine_new.js");

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
