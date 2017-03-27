import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const MeasureUnit = ({ MeasureUnitVisible, addMeasureUnit, onCancelUnit, currentRecord,
  form: {
    getFieldDecorator, validateFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const data = {
          unit: values.name,
          currentRecord,
        };
        addMeasureUnit(data);
      }
    });
  }

  return (
    <Modal
      visible={MeasureUnitVisible}
      title={`自定义单位 (${(currentRecord.item === undefined) ? '' : currentRecord.item.name})`}
      onOk={handleOk}
      onCancel={onCancelUnit}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancelUnit}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <Form onSubmit={handleOk}>
        <FormItem label="格式" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: '',
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
  addMeasureUnit: PropTypes.func,
  onCancelUnit: PropTypes.func,
};

export default Form.create()(MeasureUnit);
