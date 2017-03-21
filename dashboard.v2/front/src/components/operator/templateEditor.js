import React, { PropTypes } from 'react';
import { Modal, Form, Input, Button } from 'antd';


const FormItem = Form.Item;

const TemplateEditor = ({
  visible,
  item,
  onOk,
  onCancel,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const data = {
          id: item.id,
          name: values.name,
          username: values.username,
          password: values.password,
        };
        onOk(data);
      }
    });
  }


  return (
    <Modal
      visible={visible}
      title="编辑模板引擎"
      width={500}
      onCancel={onCancel}
      style={{ top: 20 }}
      footer={[<Button key="submit" type="primary" size="large" onClick={handleSubmit}>
        保存
      </Button>]}
    >
      <Form onSubmit={handleSubmit}>
        <h4>通用</h4>
        <FormItem label="名称：" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [],
          })(<Input />)}
        </FormItem>
        <h4>日报规则</h4>
        <FormItem label="别名：" {...formItemLayout}>
          {getFieldDecorator('nickName', {
            initialValue: item.nickName,
          })(<Input />)}
        </FormItem>

        <h4>邮件规则</h4>
        <FormItem label="用户名：" {...formItemLayout}>
          {getFieldDecorator('username', {
            initialValue: item.username,
            rules: [],
          })(<Input />)}
        </FormItem>

        <FormItem label="密码：" {...formItemLayout}>
          {getFieldDecorator('password', {
            initialValue: item.password,
            rules: [],
          })(<Input />)}
        </FormItem>
      </Form>
    </Modal>
  );
};
TemplateEditor.propTypes = {
  visible: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(TemplateEditor);
