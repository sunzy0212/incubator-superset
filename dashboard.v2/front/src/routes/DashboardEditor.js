import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { classnames } from '../utils';
import Aside from '../components/dashboard/editor/aside';
import styles from './Dashboard.less';
import EditHeader from '../components/dashboard/editHeader';

function DashboardEditor({ children, dispatch, dashboardEditor, reportboard }) {
  const { isShow, dirs, charts } = dashboardEditor;
  const { report, currentLayouts, isHeaderShow, currentTimeRange } = reportboard;
  const asideProps = {
    dirs,
    charts,
    getChartData(key) {
      dispatch({
        type: 'dashboardEditor/getChartsByDirId',
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

  const headerProps = {
    report,
    currentLayouts,
    currentTimeRange,
    editTitle() {
      dispatch({ type: 'dashboardEditor/editTitle' });
    },
    updateTitle(name) {
      dispatch({
        type: 'dashboardEditor/updateTitle',
        payload: { name, dirId: report.dirId, reportId: report.id },
      });
    },
    saveChartToReport(rId, cLayouts) {
      dispatch({
        type: 'dashboardEditor/updateLayout',
        payload: {
          reportId: rId,
          layouts: cLayouts,
        },
      });
    },
    refreshChart(start, end) {
      dispatch({
        type: 'reportboard/refreshChart',
        payload: {
          timeRange: { start, end },
        },
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
          <Row gutter={12}>
            <Col lg={24} md={24}>
              {isHeaderShow === false ? ''
                : <EditHeader {...headerProps} />}
            </Col>
          </Row>
          <Row gutter={12}>
            <Col lg={24} md={24}>
              {children}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

DashboardEditor.propsType = {
  dispatch: PropTypes.func,
  isShow: PropTypes.bool,
  reportboard: PropTypes.object,
};


function mapStateToProps(state) {
  return { dashboardEditor: state.dashboardEditor, reportboard: state.reportboard };
}
export default connect(mapStateToProps)(DashboardEditor);

