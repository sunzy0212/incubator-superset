import React from 'react';
import { connect } from 'dva';
import { Row, Col} from 'antd';
import styles from './Dashboard.less';


function Dashboard(props) {
  return (
    <Row gutter={36} className={styles.normal}>
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

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(Dashboard);
