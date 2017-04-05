import React, { Component } from 'react';
import { Table } from 'antd';
import request from './utils/request';
import common from './utils/common';
import './App.css';

class Monitor extends Component {

  constructor() {
    super();
    this.state = {
      tables: {},
    };
    this.getStatus();
  }

  getStatus = () => {
    request(`${common.URL}/api/inspects`,
      {
        method: 'GET',
      }).then((data) => {
        console.log(data);
        this.setState({
          tables: data,
        });
      });
  }

  render() {
    const columns = [
      {
        title: '服务名',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '型号',
        dataIndex: 'cpu',
        key: 'cpu',
      }, {
        title: '磁盘',
        dataIndex: 'disk',
        key: 'disk',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
      },
    ];
    const data = [];

    Object.keys(this.state.tables).forEach((e) => {
      console.log('==============================', e, this.state.tables[e]);
      data.push({
        key: e,
        name: e,
        cpu: this.state.tables[e].spec.unitType,
        disk: JSON.stringify(this.state.tables[e].volumes),
        status: this.state.tables[e].status,
      });
    });

    return (
      <Table
        columns={columns} dataSource={data} pagination={false}
      />
    );
  }
}

export default Monitor;
