import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import './index.html';
//import {Table} from 'react-bootstrap'; 

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
      osCourse:'',
      osSpeed:'',
      solution:'',
      contacts:[{time:0, bearing: 1 ,range: 1000}]
    };
    
    this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
    
  }
 
  
  handleChange(event) {
   //console.log("event: " + event.target.name);
   //console.log("value: " + event.target.value);
   let {name, value} = event.target;
   value = +value;
   this.setState({[name]:value});
   this.setState({solution:''})
  }
  
  solve() {
    this.setState({solution:"Solved."});
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
      <button onClick={() => this.solve()}>Submit</button>
        <br /><br />
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
        <div>
        <br /><br /><br /><br />
        <div>
        	<div><strong>Solution</strong></div>
        	{this.state.solution}
        </div>

        </div>
      </div>
    );
  }
}



ReactDOM.render(<ContactTable />, document.getElementById('root'));

