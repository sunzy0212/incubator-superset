import React from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import Slices from '../components/editor/slices';
import Header from '../components/editor/header';
import Dataview from '../components/editor/dataview';

import styles from './Editor.less';

function Editor(props) {
  return (
    <div className={styles.sideBar}>
      <div className={styles.header}>
        <Header />
      </div>
      <Row gutter={24}>
        <Col lg={8} md={8}>
          <Slices />
        </Col>
        <Col lg={16} md={16}>
          <Dataview />
        </Col>
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(Editor);
