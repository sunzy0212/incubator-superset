import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const AddField = ({ modalVisible, onOk, onCancel, currRecord,
  form: {
    getFieldDecorator, validateFields, resetFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const record = Object.assign(currRecord);
        record.name = values.name;
        record.alias = values.alias;
        onOk(record);
        onCancel();
        resetFields();
      }
    });
  }
  return (
    <Modal
      visible={modalVisible}
      title={'添加字段'}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <Form onSubmit={handleOk} layout="inline">
        <FormItem label="字段" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: currRecord.name || '',
            rules: [
              {
                required: true,
                message: '未填写',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="别名" {...formItemLayout}>
          {getFieldDecorator('alias', {
            initialValue: currRecord.alias || '',
          })(<Input />)}
        </FormItem>
      </Form>
    </Modal>
  );
};

AddField.propTypes = {
  modalVisible: PropTypes.bool,
  currRecord: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(AddField);
