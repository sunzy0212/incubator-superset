import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Modal, Row, Col, Icon, Button } from 'antd';
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
      width={500}
      onCancel={onCancel}
      style={{ top: 20 }}
      footer={[]}
    >
      <Row gutter={24}>
        <Col span={6} >
          <Seat >
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MYSQL', action: 'ADD', onOk, item }}><Button style={{ width: '100px' }} type="primary" >MySQL</Button></Link>
          </Seat>
          <Seat >
            <Link onClick={onCancel} to={'/datasource/config'} state={{ type: 'MONGODB', action: 'ADD', onOk, item }}><Button style={{ width: '100px' }} type="primary" >MongoDB</Button></Link>
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
