import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const TransformDate = ({ transformDateVisible, onCreateOk, onCancelCreate, currentRecord,
  form: {
    getFieldDecorator, validateFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const data = {
          name: values.name,
          currentRecord,
        };
        onCreateOk(data);
      }
    });
  }
  console.log(currentRecord.item);
  return (
    <Modal
      visible={transformDateVisible}
      title={`自定义日期格式 (${(currentRecord.item === undefined) ? '' : currentRecord.item.name})`}
      onOk={handleOk}
      onCancel={onCancelCreate}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancelCreate}>取消</Button>,
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
  onCreateOk: PropTypes.func,
  onCancelCreate: PropTypes.func,
};

export default Form.create()(TransformDate);
