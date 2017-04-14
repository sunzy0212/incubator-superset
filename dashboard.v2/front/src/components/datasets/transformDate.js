import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const TransformDate = ({ modalVisible, onOk, onCancel, currRecord,
  form: {
    getFieldDecorator, validateFields, resetFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const record = Object.assign(currRecord);
        record.transform = values.transform;
        onOk({ record });
        onCancel();
        resetFields();
      }
    });
  }
  return (
    <Modal
      visible={modalVisible}
      title={`自定义日期格式 (${currRecord.transform || ''})`}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <Form onSubmit={handleOk}>
        <FormItem label="格式" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: 'YYYY-MM-DD',
            rules: [
              {
                required: true,
                message: '未填写',
              },
            ],
          })(<Input placeholder="例: YYYY-MM-DD" />)}
        </FormItem>
      </Form>
    </Modal>
  );
};

TransformDate.propTypes = {
  modalVisible: PropTypes.bool,
  currRecord: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(TransformDate);
