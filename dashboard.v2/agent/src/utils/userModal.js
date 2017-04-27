import React, { Component } from 'react';
import { Form, message, Input, Modal } from 'antd';
import request from './request';
import common from './common';

const FormItem = Form.Item;
class UserModal extends Component {

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
      if (this.props.user.username !== undefined) {
        request(`${common.URL}/api/users/${this.props.user.username}`,
          {
            method: 'PUT',
            body: JSON.stringify(values),
          }).then((data) => {
            if (data.err !== undefined) {
              message.error('更新失败，请检验用户名是否已存在');
            } else {
              message.success('成功');
              this.props.form.resetFields();
              this.props.onCancel();
            }
          });
      } else {
        request(`${common.URL}/api/users`,
          {
            method: 'POST',
            body: JSON.stringify(values),
          }).then((data) => {
            if (data.err !== undefined) {
              message.error('保存失败，请检验用户名是否已存在');
            } else {
              message.success('成功');
              this.props.form.resetFields();
              this.props.onCancel();
            }
          });
      }
    });
  }


  render() {
    const { user, onCancel, form: { getFieldDecorator } } = this.props;

    function checkPassword(rule, value, callback) {
      // const reg = new RegExp('^[a-zA-Z][a-zA-Z0-9_]{0,5}$');
      if (value.length > 5) {
        callback();
        return;
      }
      callback('密码不能少于6位!');
    }

    return (

      <Modal
        visible={this.props.visible}
        title="添加/修改用户"
        width={400}
        onOk={this.handleOk}
        onCancel={onCancel}
        style={{ top: 20 }}
      >
        <form>
          <FormItem hasFeedback>
            {getFieldDecorator('username', {
              initialValue: user.username || '',
              rules: [
                {
                  required: true,
                  message: '请填写用户名',
                },
              ],
            })(<Input size="large" placeholder="用户名" disabled={user.username !== undefined} />)}
          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('password', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请填写密码',
                },
                  { validator: checkPassword },
              ],
            })(<Input size="large" type="password" placeholder="密码" />)}
          </FormItem>
        </form>
      </Modal>

    );
  }
}


export default Form.create()(UserModal);
