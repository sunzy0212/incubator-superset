import React, { PropTypes } from 'react';
import { Base64 } from 'js-base64';
import { Button, Row, Form, Input } from 'antd';
import { config } from '../utils';
import styles from './Login.less';

const FormItem = Form.Item;

const Login = ({ loginButtonLoading, onOk,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
  },
}) => {
  function handleOk() {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
      onOk({ username: values.username, password: Base64.encode(values.password) });
    });
  }

  // document.onkeyup = e => e.keyCode === 13 && handleOk();

  return (
    <div className={styles.form}>
      <div className={styles.logo}>
        <img src={config.logoSrc} />
        <span>{config.logoText}</span>
      </div>
      <form onSubmit={handleOk}>
        <FormItem hasFeedback>
          {getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: '请填写用户名',
              },
            ],
          })(<Input size="large" placeholder="用户名" />)}
        </FormItem>
        <FormItem hasFeedback>
          {getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: '请填写密码',
              },
            ],
          })(<Input size="large" type="password" placeholder="密码" />)}
        </FormItem>
        <Row>
          <Button type="primary" htmlType="submit" size="large" loading={loginButtonLoading}>
            登录
          </Button>
        </Row>
        <p>
          <span>忘记密码？请询问系统管理员！</span>
        </p>
      </form>
    </div>
  );
};

Login.propTypes = {
  form: PropTypes.object,
  loginButtonLoading: PropTypes.bool,
  onOk: PropTypes.func,
};

export default Form.create()(Login);
