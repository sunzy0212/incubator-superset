import React, { PropTypes } from 'react';
import { Table, Form, Button, Input } from 'antd';

const FormItem = Form.Item;

const TableEditor = ({ loading, save, form: {
  getFieldDecorator,
  validateFields,
  // getFieldsValue,
  // getFieldsValues,
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
          name: values.name,
        };
        save(data);
      }
    });
  }

  return (
    <div>
      <Form inline onSubmit={handleSubmit}>
        <FormItem label="名称：" {...formItemLayout}>
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

        <FormItem wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit" size="large">保存</Button>
        </FormItem>
        <FormItem wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit" size="large">加载数据源</Button>
        </FormItem>
      </Form>

    </div>
  );
};

TableEditor.propTypes = {
  loading: PropTypes.bool,
};

export default Form.create()(TableEditor);
