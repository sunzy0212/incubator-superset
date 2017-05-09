import React, { Component } from 'react';
import { Table, Button, Icon, Popconfirm, Row, Col } from 'antd';
import request from './utils/request';
import common from './utils/common';
import UserModal from './utils/userModal';
import './App.css';

class Monitor extends Component {

  constructor(props) {
    super();
    this.state = {
      visible: false,
      currUser: {},
      tables: props.services,
      users: [],
      upgrading_report: false,
    };
    this.getUsers();
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
        this.setState({
          upgrading_report: false,
        });
      });
  }

  getUsers = () => {
    request(`${common.URL}/api/users`,
      {
        method: 'GET',
      }).then((data) => {
        this.setState({
          users: data.users || [],
        });
      });
  }


  deleteUser = (username) => {
    request(`${common.URL}/api/users/${username}`,
      {
        method: 'DELETE',
      }).then((data) => {
        this.getUsers();
      });
  }

  showModal = (user) => {
    this.setState({
      visible: true,
      currUser: user,
    });
  }

  hideModal = () => {
    this.setState({
      visible: false,
    });
    this.getUsers();
  }


  render() {
    const columns = [
      {
        title: '组件名',
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

    const userColumns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      }, {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '最近登录',
        dataIndex: 'loginTime',
        key: 'loginTime',
      }, {
        title: '操作',
        key: 'action',
        render: record => (
          <span>
            <a onClick={() => this.showModal(record.user)}>重置密码</a>
            <span className="ant-divider" />
            <Popconfirm title="确定删除该数据源吗？" onConfirm={() => this.deleteUser(record.username)}>
              <a icon="delete">删除</a>
            </Popconfirm>
          </span>),

      },
    ];
    const users = [];

    this.state.users.forEach((e, i) => {
      users.push({
        key: i,
        id: i + 1,
        username: e.username,
        loginTime: e.loginTime,
        user: e,
      });
    });

    return (
      <div>
        <Table
          title={() => <Row><Col><h3><Icon type="medicine-box" /><strong> 服务监控 </strong></h3></Col></Row>}
          columns={columns} dataSource={data} pagination={false} size="middle"
        />

        <UserModal
          user={this.state.currUser} visible={this.state.visible} onCancel={this.hideModal}
          reportHost={this.props.reportHost}
        />
        <Table
          title={() => <Row><Col><h3><Icon type="contacts" /><strong> 用户管理 </strong></h3></Col>
            <Col><Button type="primary" onClick={() => this.showModal({})}>新增用户</Button></Col></Row>}
          columns={userColumns} dataSource={users} size="middle"
        />
      </div>
    );
  }
}

export default Monitor;
