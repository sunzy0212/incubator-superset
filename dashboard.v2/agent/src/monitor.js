import React, { Component } from 'react';
import { Table, Button } from 'antd';
import request from './utils/request';
import common from './utils/common';
import './App.css';

class Monitor extends Component {

  constructor(props) {
    super();
    this.state = {
      tables: props.services,
      upgrading_report: false,
    };
  }

  componentWillReceiveProps(nextprops) {
    this.setState({
      tables: nextprops.services,
    });
  }


  onUpgrade = () => {
    this.setState({
      upgrading_report: true,
    });
    request(`${common.URL}/api/update`,
      {
        method: 'POST',
      }).then((data) => {
        console.log(data);
        this.setState({
          upgrading_report: false,
        });
      });
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
      }, {
        title: '操作',
        key: 'action',
        render: record => (
          <div>
            <Button type="primary" loading={this.state.upgrading_report && record.name === 'report'} disabled={record.name === 'mongo'} onClick={() => this.onUpgrade(record.name)}>升级</Button>
          </div>),

      },
    ];
    const data = [];

    Object.keys(this.state.tables).forEach((e) => {
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
