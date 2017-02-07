import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { classnames } from '../utils';
import Aside from '../components/dashboard/editor/aside';
import styles from './Dashboard.less';

function DashboardEditor({ children, dispatch, dashboardEditor }) {
  const { isShow } = dashboardEditor;
  const adideProps = {

  };
  return (
    <div className={styles.sideBar}>
      <Row gutter={24}>
        <Col
          lg={5} md={3}
          className={classnames({ [styles.animateWrap]: isShow },
            { [styles.active]: isShow }, { [styles.downIn]: isShow },
            { [styles.animateWrap]: !isShow })}
        >
          <Aside {...adideProps} />
        </Col>
        <Col lg={19} md={21}>
          {children}
        </Col>
      </Row>
    </div>
  );
}

DashboardEditor.propsType = {
  dispatch: PropTypes.func,
  isShow: PropTypes.bool,
  // reports: PropTypes.array,
  // currReport: PropTypes.object,
};


function mapStateToProps(state) {
  return { dashboardEditor: state.dashboardEditor };
}
export default connect(mapStateToProps)(DashboardEditor);

