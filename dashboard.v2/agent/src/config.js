import React, { Component } from 'react';
import { Button, Progress } from 'antd';
import request from './utils/request';
import common from './utils/common';
import './App.css';

class Config extends Component {

  constructor() {
    super();
    this.state = {
      status: 'init',
      percent: 12,
    };
  }

  allocateService=() => {
    request(`${common.URL}/api/allocate`,
      {
        method: 'POST',
        body: JSON.stringify({ data: '' }),
      }).then((data) => {
        console.log(data);
        if (data.Status==="success"){
            this.props.callBack();
        }

        this.setState({
          status: 'finish',
          percent: 100,
          deployResult: data,
        });
      });
  }

  startInit=() => {
    this.allocateService();
    this.setState({
      status: 'proccess',
      percent: 25,
    });
  }

  render() {
    console.log('=======', this.props);
    return (<div className="steps-content">
      {this.state.status === 'proccess' ? <Progress type="circle" percent={this.state.percent} /> : ''
        }
      {this.state.status === 'init' ? <Button size="large" type="primary" ghost onClick={() => this.startInit()}><h1>初始化</h1></Button> : ''}
    </div>);
  }
}

export default Config;
