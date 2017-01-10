import React, { PropTypes } from 'react';
import { Button, Form, Input } from 'antd';
import styles from '../modal.less';

const FormItem = Form.Item;

const InfluxDB = ({
  saveLoading, item, onOk, form: {
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
        console.log('Received values of form: ', values);
        const data = {
          name: values.name,
          host: values.host,
          port: values.port,
          type: 'InfluxDB',
          dbName: values.dbName,
          username: values.username || '',
          password: values.password || '',
        };
        onOk(data);
      }
    });
  }

  return (
    <Form onSubmit={handleSubmit}>

      <FormItem label="名称：" {...formItemLayout}>
        {getFieldDecorator('name', {
          initialValue: item.name,
          rules: [
            {
              required: true,
              message: '名称未填写',
            },
          ],
        })(<Input />)}
      </FormItem>

      <FormItem label="地址：" {...formItemLayout}>
        {getFieldDecorator('host', {
          initialValue: item.host,
          rules: [
            {
              required: true,
              message: '地址未填写',
            },
          ],
        })(<Input placeholder="http://localhost:8086/query" />)}
      </FormItem>

      <FormItem label="数据库名：" {...formItemLayout}>
        {getFieldDecorator('dbName', {
          initialValue: item.dbName,
          rules: [
            {
              required: true,
              message: '数据库名未填写',
            },
          ],
        })(<Input />)}
      </FormItem>
      <br />
      <FormItem wrapperCol={{ span: 12, offset: 6 }}>
        <Button
          type="primary" htmlType="submit" size="large" loading={saveLoading}
          className={styles.submitButton}
        >确认</Button>
      </FormItem>
    </Form>
  );
};

InfluxDB.propTypes = {
  saveLoading: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
};
export default Form.create()(InfluxDB);
