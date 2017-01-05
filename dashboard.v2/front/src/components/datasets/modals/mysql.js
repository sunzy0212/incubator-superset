import React from 'react'
import styles from '../modal.less'
import {Button,Modal,Form,Input,Tooltip,Icon,InputNumber,Col} from 'antd'
const FormItem = Form.Item;

const MySQL = ({saveLoading,item,onOk,onCancel,onTest,form: {
  getFieldDecorator,
  validateFields,
  getFieldsValue,
  getFieldsValues
},}) => {

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
          "id":item.id, //For editor
          "name" : values.name,
          "host" : values.host,
          "port" : values.port,
          "type" : "MYSQL",
          "dbName" : values.dbName,
          "username" : values.username,
          "password" :values.password
        }

        onOk(data)
      }
    });
  }

  return (
    <Form onSubmit={handleSubmit}>

      <FormItem label="名称："  {...formItemLayout}>
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

      <FormItem label="地址："  {...formItemLayout}>
        {getFieldDecorator('host', {
          initialValue: item.host,
          rules: [
            {
              required: true,
              message: '地址未填写',
            },
          ],
        })(<Input />)}
      </FormItem>

      <FormItem label="端口："  {...formItemLayout}>
        {getFieldDecorator('port', {
          initialValue: item.port||3306,
          rules: [
            {
              required: true,
              message: '未填写',
            },
          ],
        })(<InputNumber />)}
      </FormItem>


      <FormItem label="用户名："  {...formItemLayout}>
        {getFieldDecorator('username', {
          initialValue: item.username,
          rules: [
            {
              required: true,
              message: '用户名未填写',
            },
          ],
        })(<Input />)}
      </FormItem>

      <FormItem label="密码："  {...formItemLayout}>
        {getFieldDecorator('password', {
          initialValue: item.password,
          rules: [
            {
              required: false,
              message: '密码未填写',
            },
          ],
        })(<Input/>)}
      </FormItem>

      <FormItem label="数据库名："  {...formItemLayout}>
        {getFieldDecorator('dbName', {
          initialValue: item.dbName || 'test',
          rules: [
            {
              required: true,
              message: '数据库名未填写',
            },
          ],
        })(<Input />)}
      </FormItem>
      <br/>
      <FormItem  wrapperCol={{ span: 12 ,offset:6}}>
          <Button type="primary" htmlType="submit" size="large" loading={saveLoading} className={styles.submitButton}>确认</Button>
      </FormItem>
    </Form>
  );
}

export default Form.create()(MySQL)
