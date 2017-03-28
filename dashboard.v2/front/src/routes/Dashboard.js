import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { classnames } from '../utils';
import Aside from '../components/dashboard/aside';
import styles from './Dashboard.less';
import Header from '../components/dashboard/header';

function Dashboard({ children, dispatch, dashboard, reportboard }) {
  const { isShow, modalVisible, modalCreateVisible,
    deleteModalVisible, currentDir, dirs, reports } = dashboard;
  const { report, currentLayouts, isHeaderShow, currentTimeRange } = reportboard;

  const adideProps = {
    modalVisible,
    modalCreateVisible,
    currentDir,
    dirs,
    reports,
    onOk(data) {
      dispatch({
        type: 'dashboard/addReport',
        payload: { dirId: data.dirId, name: data.name },
      });
    },
    queryDirs() {
      dispatch({ type: 'dashboard/queryDirs',
        payload: {
          type: 'report',
        },
      });
    },
    onDelete(id) {
      dispatch({
        type: 'dashboard/deleteDir',
        payload: { id },
      });
    },
    onDeleteReport(id) {
      dispatch({
        type: 'dashboard/deleteReport',
        payload: { rId: id },
      });
    },
    onCreateOk(data) {
      dispatch({
        type: 'dashboard/addDir',
        payload: { pre: data.dirId, name: data.name, type: data.type },
      });
    },
    onCancel() {
      dispatch({
        type: 'dashboard/hideModal',
      });
    },
    onCancelCreate() {
      dispatch({
        type: 'dashboard/hideCreateModal',
      });
    },
    openModal() {
      dispatch({
        type: 'dashboard/showModal',
      });
    },
    addDirModal(newDir) {
      dispatch({
        type: 'dashboard/showDirModal',
        payload: { dir: newDir },
      });
    },
    openDir(key) {
      dispatch({
        type: 'dashboard/openDir',
        payload: { dirId: key },
      });
    },
    addReport(location, name) {
      dispatch({
        type: 'dashboard/addReport',
        payload: { location, name },
      });
    },
  };

  const headerProps = {
    report,
    deleteModalVisible,
    currentLayouts,
    currentTimeRange,
    deleteReport(reportId) {
      dispatch({
        type: 'dashboard/deleteReport',
        payload: { rId: reportId },
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
    openModal() {
      dispatch({
        type: 'dashboard/showDeleteModal',
      });
    },
    onCancel() {
      dispatch({
        type: 'dashboard/hideModal',
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
    <div className={styles.sideBar} >
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
          <Row gutter={12}>
            <Col lg={24} md={24}>
              {isHeaderShow === false ? ''
                : <Header {...headerProps} />}
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

Dashboard.propsType = {
  dispatch: PropTypes.func,
  isShow: PropTypes.bool,
  reports: PropTypes.array,
  reportboard: PropTypes.object,
};


function mapStateToProps(state) {
  return { dashboard: state.dashboard, reportboard: state.reportboard };
}
export default connect(mapStateToProps)(Dashboard);

