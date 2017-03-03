import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { classnames } from '../utils';
import Aside from '../components/dashboard/editor/aside';
import styles from './Dashboard.less';

function DashboardEditor({ children, dispatch, dashboardEditor }) {
  const { isShow, dirs, charts } = dashboardEditor;
  const asideProps = {
    dirs,
    charts,
    getChartData(key) {
      dispatch({
        type: 'dashboardEditor/getChartData',
        payload: { dirId: key },
      });
    },
    addChartToReport(key) {
      dispatch({
        type: 'reportboard/addChartToReport',
        payload: { chartId: key },
      });
    },
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
          <Aside {...asideProps} />
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
};


function mapStateToProps(state) {
  return { dashboardEditor: state.dashboardEditor };
}
export default connect(mapStateToProps)(DashboardEditor);

