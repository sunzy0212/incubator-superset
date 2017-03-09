import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const RenameModal = ({ renameModalVisibles, onCreateOk, onCancelSave, currentRecord, records,
  form: {
    getFieldDecorator, validateFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        for (let i = 0; i < records.length; i++) {
          if (records[i].name === currentRecord.item.name) {
            records[i].alias = values.name;
          }
        }
        onCreateOk(records);
      }
    });
  }

  return (
    <Modal
      visible={renameModalVisibles}
      title={`原名: ${currentRecord.name}`}
      onOk={handleOk}
      onCancel={onCancelSave}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancelSave}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <Form onSubmit={handleOk}>

        <FormItem label="重命名：" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: '',
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
  onCreateOk: PropTypes.func,
  onCancelSave: PropTypes.func,
};

export default Form.create()(RenameModal);
