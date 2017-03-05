import React, { PropTypes } from 'react';
import { Modal, Button, Form } from 'antd';

const ReportDeleteModal = ({ deleteModalVisible, onCancel, currentId, deleteReport,
   }) => {
  function handleOk() {
    deleteReport(currentId);
  }

  return (
    <Modal
      visible={deleteModalVisible}
      title="删除报表"
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          确定
        </Button>,
      ]}
    >
      <h5>是否删除该报表?</h5>
    </Modal>
  );
};

ReportDeleteModal.propTypes = {
  deleteReport: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ReportDeleteModal;
