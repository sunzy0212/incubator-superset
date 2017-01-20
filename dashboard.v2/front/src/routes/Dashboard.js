import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { classnames } from '../utils';
import Aside from '../components/dashboard/aside';
import styles from './Dashboard.less';

function Dashboard({ children, dispatch, dashboard }) {
  const { isShow, modalVisible, dirs, reports } = dashboard;
  const adideProps = {
    modalVisible,
    dirs,
    reports,
    onOk() {
      dispatch({
        type: 'dashboard/add',
        payload: {},
      });
    },
    onCancel() {
      dispatch({
        type: 'dashboard/hideModal',
      });
    },
    openModal() {
      dispatch({
        type: 'dashboard/showModal',
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
        type: 'dashboard/add',
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

