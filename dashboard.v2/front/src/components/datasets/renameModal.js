import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const RenameModal = ({ modalVisible, onOk, onCancel, currRecord, title,
  form: {
    getFieldDecorator, validateFields, resetFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const record = Object.assign(currRecord);
        record.alias = values.name;
        onOk({ record, title });
        onCancel();
        resetFields();
      }
    });
  }

  return (
    <Modal
      visible={modalVisible}
      title={`原名: ${currRecord.alias}`}
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

        <FormItem label="重命名：" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: currRecord.alias || '',
            rules: [
              {
                required: true,
                message: '名称未填写',
              },
            ],
          })(<Input />)}
        </FormItem>
      </Form>
    </Modal>
  );
};

RenameModal.propTypes = {
  modalVisible: PropTypes.bool,
  currRecord: PropTypes.object,
  title: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(RenameModal);
