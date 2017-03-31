import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import Aside from '../components/dashboard/editor/aside';
import styles from './Dashboard.less';
import EditHeader from '../components/dashboard/editHeader';

function DashboardEditor({ history, children, dispatch, loading, dashboardEditor, reportboard }) {
  const { dirs, charts } = dashboardEditor;
  const { report, currentLayouts, currentTimeRange } = reportboard;
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
    history,
    report,
    currentLayouts,
    currentTimeRange,
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
        <Col lg={5} md={3} >
          <Aside {...asideProps} />
        </Col>
        <Col lg={19} md={21}>
          <Row gutter={12}>
            <Col lg={24} md={24}>
              <EditHeader {...headerProps} />
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
  dashboardEditor: PropTypes.object,
  reportboard: PropTypes.object,
  loading: PropTypes.bool,
};


function mapStateToProps(state) {
  return {
    dashboardEditor: state.dashboardEditor,
    reportboard: state.reportboard,
    loading: state.loading.models.dashboardEditor,
  };
}
export default connect(mapStateToProps)(DashboardEditor);

