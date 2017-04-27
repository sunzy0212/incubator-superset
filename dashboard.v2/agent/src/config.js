import React, { Component } from 'react';
import { Button, Progress, message } from 'antd';
import common from './utils/common';
import request from './utils/request';
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
        if (data.Status === 'success') {
          message.success('初始化成功!');
          this.setState({
            status: 'finish',
            percent: 100,
          });
        } else {
          message.error('初始化失败!');
          this.setState({
            status: 'init',
            percent: 100,
          });
        }

        setTimeout(() => {
          window.location.reload();
        }, 30000);
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
    return (<div className="steps-content">
      {this.state.status !== 'init' ? <Progress
        type="circle" percent={this.state.percent}
        format={() => this.state.status === 'finish' ? '稍后\n跳转\n...' : `${this.state.percent}%`}
      /> : ''
        }
      {this.state.status === 'init' ? <Button size="large" type="primary" ghost onClick={() => this.startInit()}><h1>初始化</h1></Button> : ''}
    </div>);
  }
}

export default Config;
