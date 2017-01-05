import React from 'react';
import { connect } from 'dva';
import styles from './Dashboard.less';

import {Row , Col, Table,Button,Icon,Breadcrumb,Radio} from 'antd'
function Dashboard(props) {
  return (
    <Row gutter={36}>
      <Col span={4}>
        <Row>
          <Col>仪表盘</Col>
        </Row>
        <Row>
          <Col>搜索</Col>
        </Row>
        <Row>
          <Col>报表目录1</Col>
        </Row>
        <Row>
          <Col>报表目录2</Col>
        </Row>
        <Row>
          <Col>报表目录3</Col>
        </Row>
      </Col>
      <Col span={20}>
        报表展示区
      </Col>
    </Row>
  );
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(Dashboard);
