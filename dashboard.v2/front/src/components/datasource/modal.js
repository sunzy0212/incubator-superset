import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Modal, Row, Col } from 'antd';
import styles from './modal.less';

const DataSetModal = ({
  visible,
  item,
  onOk,
  onCancel,
}) => {
  const Seat = ({ children }) => {
    return (<div className={styles.seat}>
      {children}
    </div>);
  };
  return (
    <Modal
      visible={visible}
      title="支持如下数据源"
      width={700}
      onCancel={onCancel}
      style={{ top: 20 }}
      footer={[]}
    >
      <Row gutter={24}>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'INFLUXDB', action: 'ADD', onOk, item }} >INFLUXDB</Link>
          </Seat>
        </Col>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
        <Col span={6} >
          <Seat>
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }} >MYSQL</Link>
          </Seat>
        </Col>
      </Row>
    </Modal>
  );
};
DataSetModal.propTypes = {
  visible: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default DataSetModal;
