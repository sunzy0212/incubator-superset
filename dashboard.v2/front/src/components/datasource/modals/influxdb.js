import React, { PropTypes } from 'react';
import { Button, Form, Input } from 'antd';
import styles from '../modal.less';

const FormItem = Form.Item;

const InfluxDB = ({
  saveLoading, item, onOk, callBack, form: {
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
          id: item.id, // For editor
          name: values.name,
          host: values.host,
          port: values.port,
          type: 'InfluxDB',
          dbName: values.dbName,
          username: values.username || '',
          password: values.password || '',
        };
        callBack(true);
        onOk(data);
      }
    });
  }

  function checkName(rule, value, callback) {
    const reg = new RegExp('^[a-zA-Z][a-zA-Z0-9_]{0,31}$');
    if (reg.test(value)) {
      callback();
      return;
    }
    callback('数据源名称由1~32个字母或数字组成，必须字母开头!');
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormItem label="名称：" {...formItemLayout}>
        {getFieldDecorator('name', {
          initialValue: item.name,
          rules: [{
            required: true,
            message: '名字未填写' },
            { validator: checkName }],
        })(<Input />)}
      </FormItem>

      <FormItem label="别名：" {...formItemLayout}>
        {getFieldDecorator('nickName', {
          initialValue: item.nickName,
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
        >提交</Button>
      </FormItem>
    </Form>
  );
};

InfluxDB.propTypes = {
  saveLoading: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  callBack: PropTypes.func,
};
export default Form.create()(InfluxDB);
