import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import './index.html';
//import {Table} from 'react-bootstrap'; 

class MContactRightTriangle {

	constructor(range, bearing){
		this.r = range;
		this.trueBearing = bearing;
		this.setSides(bearing, range);
	}

	// Determine referance theta based on quadrant.
	// Set a and b sides of right triange. 
	setSides(bearing, range) {
		
		let t = 0;
		let x = 0;
		let y = 0;

		if (0 <= bearing && bearing <= 90){
			//Q1
			t = toRadians(bearing);
			x = range * Math.sin(t);
			y = range * Math.cos(t);
		} else if (90 < bearing && bearing <= 180) {
			//Q2
			let b = 180 - bearing;
			t = toRadians(b);
			x = range * Math.sin(t);
			y = range * Math.cos(t);
			y = y * -1;
		} else if (180 < bearing && bearing <= 270) {
			//Q3
			let b = 270 - bearing;
			t = toRadians(b);
			x = range * Math.cos(t);
			y = range * Math.sin(t);
			x = x * -1;
			y = y * -1;
		} else if (270 < bearing && bearing < 360) {
			//Q4
			let b = bearing - 270;
			t = toRadians(b);
			x = range * Math.cos(t);
			y = range * Math.sin(t);
			x = x * -1;
		} else {
			console.log("Bad bearing: " + bearing);
		}

		this.t = t;
		this.x = x;
		this.y = y;
		console.log(this);
	}

	// Return a Direction of Relative Motion, or the true bearing
	// from this M point to a provided MContactRightTriangle.

	getDRMto(m2){
		//let a = Math.abs(this.x - m2.x);
		let b = Math.abs(this.y - m2.y);
		//let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
		let c = this.getDistance(m2);
		let drm = 0;
		let t = Math.acos(b / c);

		if(m2.x >= this.x && m2.y >= this.y){
			//rel Q1
			drm = toDegrees(t);
		} else if (m2.x >= this.x && m2.y < this.y) {
			//rel Q2
			drm = 180 - toDegrees(t);
		} else if (m2.x < this.x && m2.y < this.y) {
			//rel Q3
			drm = 180 + toDegrees(t);
		} else {
			//rel Q4
			drm = 360 - toDegrees(t);
		}
		return drm;
	}

	getDistance(m2){
		let a = Math.abs(this.x - m2.x);
		let b = Math.abs(this.y - m2.y);
		let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
		return c;
	}


	getSRM(m2, interval){
		let d = this.getDistance(m2);
		let ypm = d / interval;
		return ypm2knots(ypm); 
	}

	// get CPA should take a 2nd MContactRightTriangle
	// and return a CPA object with True bearing, range
	// and time.
	getCPA(m2, srm){
		let drm = this.getDRMto(m2);
		let cpaRange;
		let cpaTime;
    let cpaBearing;
    let drmR = drm - 180;

    drmR = (drmR < 0) ? (drmR + 360) : drmR;

    if (drm < 180) {
      if((this.bearing < drm && m2.bearing < drm) || (this.bearing > drmR && m2.bearing > drmR)){
        cpaBearing = drm - 90;
      } else {
        cpaBearing = drm + 90;
      }
    } else {
      if((this.bearing < drm && m2.bearing < drm) || (this.bearing > drmR && m2.bearing > drmR)){
        cpaBearing = drm + 90;
      } else {
        cpaBearing = drm - 90;
      }
    }

		if (cpaBearing < 0) {
			cpaBearing = cpaBearing + 360;
		}

		let theta = toRadians(Math.abs(cpaBearing - m2.trueBearing));
		cpaRange = this.r * Math.cos(theta);
		let d = this.r * Math.sin(theta);
		cpaTime = d / knots2ypm(srm);

		let cpa = {};
		cpa.range = cpaRange;
		cpa.bearing = cpaBearing;
		cpa.time = cpaTime;
		return cpa;
	}

  // get the contact's true course and speed provided
  // a valid MContactRightTriange (m2), the speed of 
  // relative motion (srm) between the contact and 
  // and e, and the true course and speed of e,
  // as defined by the e->r vector. 
	getContactTrueData(m2, srm, erCourse, erSpeed){
		
    erSpeed = +erSpeed;
    erCourse = +erCourse;
    let drm = this.getDRMto(m2);
		let contactData = {};
    contactData.speed = 0;
    contactData.course = 0;
    // If head on collision or overtaking from dead astern...
    console.log(drm === erCourse);
    console.log("DRM: " + drm + " tC: " + erCourse);
    if (drm === erCourse) {
      contactData.course = erCourse;
      contactData.speed = erCourse + srm;
      return contactData;
    }
    let headOnCollisionAngle = erCourse - 180;
    headOnCollisionAngle = (headOnCollisionAngle < 0) ? (360 + headOnCollisionAngle) : headOnCollisionAngle;
    // stfb you might get hit...
    if (drm === headOnCollisionAngle){
      contactData.speed = srm - erSpeed;
      contactData.course = ((erCourse - 180) < 0) ? ((erCourse - 180) + 360) : (erCourse - 180);
    }

    // For trig calculations, a variation of the law of cosines is used
    // in the computations. Traditionally, LOC states that:
    // c^2 = a^2 + b^2 - 2ab*cos(C);
    // These calculations change the variables to the following:
    // A --> e 
    // B --> m
    // C --> r
    // a --> E // also srm
    // b --> M // also erSpeed
    // c --> R // a target value, or contact's speed 
    
    let E = srm;
    let M = erSpeed;

    // convert True drm to Relative drm
    let rdrm = drm - erCourse; 
    console.log(rdrm);
    //rdrm = (drm > 180) ? (180 - rdrm) : rdrm;
    rdrm = (rdrm < 0) ? (rdrm + 360) : rdrm;
    console.log(rdrm);
    let r = Math.abs(180 - rdrm);
    let R = getR(E, M, r);
    let m = getm(E, R, M);
    let e = 180 - (r + toDegrees(m));
    let theirCouse = +erCourse + e
    theirCouse = (theirCouse > 360) ? (theirCouse - 360) : theirCouse;
    console.log(
      "r: " + r +
      "\nR: " + R +
      "\nm: " + toDegrees(m) +
      "\ne: " + e +
      "\ntheir: " + theirCouse
    );
    /*if (erCourse > 180) {
      theirCouse = (360 - e) + erCourse;
      theirCouse = (theirCouse > 360) ? (theirCouse - 360) : theirCouse;
    }*/

    contactData.course = theirCouse;
    contactData.speed = R;


    /*if(0 < erCourse && erCourse <= 90) {
      if(0 < drm && drm < erCourse) {
          console.log("Case 1");
          let r = 180 - (erCourse - drm);
          let R = getR(E, M, r);
          let m = getm(E, R, M);
          //console.log("m: " + m + " e: " + e + " r: " + r + " R: " + R);
          contactData.course = drm + toDegrees(m);
          contactData.speed = R;
      } else if (drm > erCourse && drm < 180) {
          console.log("Case 2");
          let r = 180 - (drm - erCourse);
          let R = getR(E, M, r);
          let m = getm(E, R, M);
          let e = 180 - (r + toDegrees(m));
          contactData.course = +erCourse + e;
          contactData.speed = R;
      } else if (180 <= drm && drm < (erCourse + 180)) {
          console.log("Case 3");
          let r = (erCourse + 180) - drm;
          let R = getR(E, M, r);
          let m = getm(E, R, M);
          let e = 180 - (r + toDegrees(m));
          contactData.course = +erCourse + e;
          contactData.speed = R;
      } else if (360 >= drm && drm > (erCourse + 180)) {
          console.log("Case 4");
          let r = drm - (erCourse + 180);
          let R = getR(E, M, r);
          let m = getm(E, R, M);
          let e = 180 - (r + toDegrees(m));
          let emCourse = ((+erCourse - e) < 0) ? ((+erCourse - e) + 360) : (+erCourse - e);
          contactData.course = emCourse;
          contactData.speed = R;
      } else {
          console.log("Unaccounted case type I: ");
          console.log("DRM: " + drm);
          console.log("erCourse: " + erCourse);
      }
    } else if (erCourse > 90 && erCourse <= 180) {
      if(0 < drm && drm < erCourse){
        console.log("Case 5");
        let r = (180 - erCourse) + drm;
        let R = getR(E, M, r);
        let m = getm(E, R, M);
        let e = 180 - (r + toDegrees(m));
        contactData.course = drm + toDegrees(m);
        contactData.speed = R;
      } else if (drm < (180 + erCourse)) {
        console.log("Case 6");
        let r = 180 - (drm - erCourse);
        let R = getR(E, M, r);
        let m = getm(E, R, M);
        let e = 180 - (r + toDegrees(m));
        contactData.speed = R;
        contactData.course = +erCourse + e;
      } else if(drm > (erCourse + 180) && drm <= 360) {
        let r = drm - (erCourse + 180);
        let R = getR(E, M, r);
        let m = getm(E, R, M);
        let e = 180 - (r + toDegrees(m));
        let emCourse = ((+erCourse - e) < 0) ? ((+erCourse - e) + 360) : (+erCourse - e);
        contactData.course = emCourse;
        contactData.speed = R;
      } else {
          console.log("Unaccounted case type II: ");
          console.log("DRM: " + drm);
          console.log("erCourse: " + erCourse);
      }
    } else if (erCourse > 180 && erCourse < 360) {
      if(drm > erCourse || drm < (erCourse - 180)){
        let r = ((erCourse - drm) < 0) ? ((erCourse - drm) + 360) : (erCourse - drm);
        let R = getR(E, M, r);
        let m = getm(E, R, M);
        let e = 180 - (r + toDegrees(m));
        let emCourse = ((erCourse + e) < 360) ? (erCourse + e) : ((erCourse + e) - 360);
        contactData.speed = R;
        contactData.course = emCourse;
      } else {
        let r = drm (erCourse - 180);
        let R = getR(E, M, r);
        let m = getm(E, R, M);
        let e = 180 - (r + toDegrees(m));
        let emCourse = erCourse - e;
        contactData.speed = R;
        contactData.course = emCourse;
      }
    }*/

    /*
    let C = toRadians(Math.abs(drm - erCourse));
		let a = srm;
		let c = erSpeed;
		let b = Math.sqrt(sq(a) - (2 * a * b * Math.cos(C)) - sq(c));
		
		contactData.speed = b;
		contactData.course = toDegrees(C);
    */

		return contactData;
	}

}

function getR(E, M, r) {
  return Math.sqrt(sq(E) + sq(M) - (2 * E * M * Math.cos(toRadians(r))));
}

function getm(E, R, M) {
  return Math.acos((sq(E) + sq(R) - sq(M)) / (2 * E * R));
}

function sq(num) {
	return Math.pow(num, 2);
}

// Take an angle in degrees and return an anble in radians
function toRadians (angle) {
	return angle * (Math.PI / 180);
}
// Take an angle in radians and return an angle in degrees
function toDegrees (angle) {
	return angle * (180 / Math.PI);
}

// Take a speed in Knots and return a speed in Yards Per Minute
function knots2ypm(knots) {
	return (knots * 33.7561971);
}

// Take a speed in Yards Per Minute and return a speed in Knots
function ypm2knots(ypm) {
	return (ypm * 0.0296242);
}

class ContactTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      m1Time:'1731',
      m1Bearing:'210',
      m1Range:'7600', 
      m2Time:'1734',
      m2Bearing:'215',
      m2Range:'12500',
      ctinterval:'3',
      osCourse:'300',
      osSpeed:'12',
      solutionMsg:'',
      drm:'',
      srm:'',
      contactTrueData:{course:'',speed:''},
      cpa:{range:'',bearing:'',time:''},
      contacts:[{time:0, bearing: 1 ,range: 1000}]
    };
    
    this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
    
  }
 
  
  handleChange(event) {
   console.log("event: " + event.target.name);
   //console.log("value: " + event.target.value);
   let {name, value} = event.target;
   value = +value;
   if(name === 'm1Time' || name === 'm2Time'){
   	this.setState({[name]:value}, function(){this.calcTimeInterval()});
   } else {
   	this.setState({[name]:value});
   }  
   this.setState({solution:''});

  }
  
  calcTimeInterval(){
  	let m1t = parseInt(this.state.m1Time);
  	let m2t = parseInt(this.state.m2Time);
  	//console.log(this.state);
  	//console.log("m2t: " + m2t + " m1t: " + m1t);
  	if (m2t > m1t) {
  		let m1mins = m1t % 100;
  		let m2mins = m2t % 100;
  		let interval = m2mins - m1mins;
  		this.setState({ctinterval:interval});  
  	}


  } 

  solve() {
  	let m1b = this.state.m1Bearing;
  	let m1r = this.state.m1Range;
  	let m2b = this.state.m2Bearing;
  	let m2r = this.state.m2Range;
  	
  	let m1 = new MContactRightTriangle(m1r, m1b);
  	let m2 = new MContactRightTriangle(m2r, m2b);

  	let trueCourse = this.state.osCourse;
  	let trueSpeed = this.state.osSpeed;

  	let drm = m1.getDRMto(m2);
  	if(this.state.ctinterval > 0) {
  		let srm = m1.getSRM(m2, this.state.ctinterval);
  		// cpa should be an object that has bearing, range and time
  		let cpa = m1.getCPA(m2, srm);
  		console.log(cpa);
  		let contactTrueData = m1.getContactTrueData(m2, srm, trueCourse, trueSpeed);
  		this.setState({srm:srm, cpa:cpa, contactTrueData:contactTrueData});
  	}
    this.setState({drm:drm});
  }
  

  render() {

    return(
      <div>
      <form > 
        <strong className="mData">Own Ship: </strong>
        <label className="mData">
           Course: <input type="text" name="osCourse" size="6" onChange={this.handleChange} value={this.state.osCourse}></input> °T 
          </label>
        <label className="mData">
           <span> </span> Speed: <input type="text" name="osSpeed" size="6" onChange={this.handleChange} value={this.state.osSpeed}></input> KTS 
          </label>
        
        <br />
        <br/ >
        <strong className="mData">M1:</strong>
        <label className="mData">
          Time: <input type="text" name="m1Time" size="6" onChange={this.handleChange} value={this.state.m1Time}></input> 
        </label>
        <label className="mData">
           Bearing: <input type="text" name="m1Bearing" size="6" onChange={this.handleChange} value={this.state.m1Bearing}></input> °T <span> </span>
          </label>
        <label className="mData">
           Range: <input type="text" name="m1Range" size="6" onChange={this.handleChange} value={this.state.m1Range}></input> YDS
        </label>
        <br />
        <strong className="mData">M2:</strong>
        <label className="mData">
          Time: <input type="text" name="m2Time" size="6" onChange={this.handleChange} value={this.state.m2Time}></input> 
        </label>
        <label className="mData">
           Bearing: <input type="text" name="m2Bearing" size="6" onChange={this.handleChange} value={this.state.m2Bearing}></input> °T<span> </span> 
          </label>
        <label className="mData">
           Range: <input type="text" name="m2Range" size="6" onChange={this.handleChange} value={this.state.m2Range}></input> YDS
        </label>
        <br />
      </form >
      
        <br />
        <table>
          <thead>
          <tr >
            <th> point </th>
            <th>Time</th>
            <th>Bearing</th>
            <th>Range</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>M1</td>
            <td>{this.state.m1Time}</td>
            <td>{this.state.m1Bearing} °T</td>
            <td>{this.state.m1Range} YDS</td>
          </tr>
          <tr>
            <td>M2</td>
            <td>{this.state.m2Time}</td>
            <td>{this.state.m2Bearing} °T</td>
            <td>{this.state.m2Range} YDS</td>
          </tr>
          </tbody>
        </table>
        <br/>
        <div>Contact time interval: {this.state.ctinterval} mins</div>
        <button onClick={() => this.solve()}>Calculate</button>
        <div>
        <br /><br /><br /><br />
        <div>
        	<div><strong>Solution</strong></div><br/>
        	{this.state.solutionMsg}
        	DRM: {Number((this.state.drm)).toFixed(2)} °T<br/>
        	SRM: {Number((this.state.srm)).toFixed(2)} KTS<br/><br/>
        	CONTACT COURSE: {Number((this.state.contactTrueData.course)).toFixed(2)} °T<br/>
        	CONTACT SPEED: {Number((this.state.contactTrueData.speed)).toFixed(2)} KTS<br/><br/>
        	CPA Bearing: {Number((this.state.cpa.bearing)).toFixed(2)} °T<br/>
        	CPA Range: {Number((this.state.cpa.range)).toFixed(2)} YDS<br/>
        	CPA Time: +{Number((this.state.cpa.time)).toFixed(2)} Mins<br/>
        </div>

        </div>
      </div>
    );
  }
}



ReactDOM.render(<ContactTable />, document.getElementById('root'));

