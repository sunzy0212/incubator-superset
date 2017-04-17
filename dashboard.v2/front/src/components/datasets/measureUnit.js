import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const MeasureUnit = ({ modalVisible, onOk, onCancel, currRecord, title,
  form: {
    getFieldDecorator, validateFields, resetFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const record = Object.assign(currRecord);
        record.unit = values.unit;
        onOk({ record, title });
        onCancel();
        resetFields();
      }
    });
  }
  return (
    <Modal
      visible={modalVisible}
      title={`自定义单位 (${currRecord.unit || ''})`}
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
          {getFieldDecorator('unit', {
            initialValue: currRecord.unit || '',
            rules: [
              {
                required: true,
                message: '未填写',
              },
            ],
          })(<Input placeholder="例: (TB,GB,MB)(月,周,天,小时)" />)}
        </FormItem>
      </Form>
    </Modal>
  );
};

MeasureUnit.propTypes = {
  modalVisible: PropTypes.bool,
  title: PropTypes.string,
  currRecord: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(MeasureUnit);
