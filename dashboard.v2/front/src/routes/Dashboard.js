import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { classnames } from '../utils';
import Aside from '../components/dashboard/aside';
import styles from './Dashboard.less';

function Dashboard({ children, dispatch, dashboard }) {
  const { isShow, modalVisible, modalCreateVisible, currentDir, dirs, reports } = dashboard;
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
    onDelete(id) {
      dispatch({
        type: 'dashboard/deleteDir',
        payload: { id },
      });
    },
    onCreateOk(data) {
      dispatch({
        type: 'dashboard/addDir',
        payload: { dirId: data.dirId, name: data.name, type: data.type },
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
          {children}
        </Col>
      </Row>
    </div>
  );
}

Dashboard.propsType = {
  dispatch: PropTypes.func,
  isShow: PropTypes.bool,
  reports: PropTypes.array,
};


function mapStateToProps(state) {
  return { dashboard: state.dashboard };
}
export default connect(mapStateToProps)(Dashboard);

