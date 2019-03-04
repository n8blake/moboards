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
		let cpaBearing = drm - 90;
		let cpaTime;

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
  // and e, and the true course and speed of e. 
	getContactTrueData(m2, srm, trueCourse, trueSpeed){
		let drm = this.getDRMto(m2);
		let C = toRadians(Math.abs(drm - trueCourse));
		let a = srm;
		let c = trueSpeed;
		let b = Math.sqrt(sq(a) - (2 * a * b * Math.cos(C)) - sq(c));
		let contactData = {};
		contactData.speed = b;
		contactData.course = toDegrees(C);
		return contactData;
	}

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
      m1Time:'',
      m1Bearing:'',
      m1Range:'', 
      m2Time:'',
      m2Bearing:'',
      m2Range:'',
      ctinterval:'',
      osCourse:'',
      osSpeed:'',
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

