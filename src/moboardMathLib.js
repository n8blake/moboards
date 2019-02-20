// Moboard Math Library
//
// In Mobard Math, bearings are taken and return in DEGREES
// TRUE, that is, 000°T is at the top (12 o'clock), and degrees
// are counted in a clockwise directions. Therefor, quadrant 
// references are such that, 000°T to 090°T is Quadrant I, 
// 091°T to 180°T is Quadrant II, and so forth.

// Functions

// Take a speed in Knots and return a speed in Yards Per Minute
function knots2ypm(knots) {
	return (knots * 33.7561971);
}

// Take a speed in Yards Per Minute and return a speed in Knots
function ypm2knots(ypm) {
	return (ypm * 0.0296242);
}

function toDegrees (angle) {
	return angle * (180 / Math.PI);
}

function toRadians (angle) {
	return angle * (Math.PI / 180);
}
