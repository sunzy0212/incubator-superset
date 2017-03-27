import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Button, Cascader } from 'antd';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

class TemplateEditor extends React.Component {

  constructor() {
    super();
    this.state = {
      item: { email: {}, reporter: {} },
      currDir: { name: '' },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      item: nextProps.item,
      currDir: nextProps.currDir,
    });
  }

  handleSubmit=(e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          id: this.props.item.id,
          name: values.name,
          email: {
            username: values.username,
            password: values.password,
            receiver: _.split(values.receiver, ';'),
          },

          reporter: {
            name: values.dirName || values.name,
            reportId: this.props.item.reportId,
            preDirId: this.props.item.reporter.preDirId || '',
            dirName: values.dirName,
            rules: values.rules,
          },
        };

        this.props.onOk(data);
      }
    });
  }

  render() {
    const { visible, onCancel,
      form: {
        getFieldDecorator,
      } } = this.props;
    const { item, currDir } = this.state;

    const options = [{
      value: 'TEMP_NAME',
      label: '模板名',
      children: [{
        value: 'yyyy-MM-dd',
        label: 'yyyy-MM-dd',
      }] },
    {
      value: 'yyyy-MM-dd',
      label: 'yyyy-MM-dd',
    },
    ];

    return (
      <Modal
        visible={visible}
        title="编辑模板引擎"
        width={500}
        onCancel={onCancel}
        style={{ top: 20 }}
        footer={[<Button key="submit" type="primary" size="large" onClick={this.handleSubmit}>
          保存
        </Button>]}
      >
        <Form onSubmit={this.handleSubmit}>
          <h4>通用</h4>
          <FormItem label="名称：" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name,
              rules: [],
            })(<Input />)}
          </FormItem>
          <h4>日报规则</h4>
          <FormItem label="目录：" {...formItemLayout}>
            {getFieldDecorator('dirName', {
              initialValue: currDir.name || '',
            })(<Input placeholder="默认模板名" />)}
          </FormItem>

          <FormItem label="生成规则：" {...formItemLayout}>
            {getFieldDecorator('rules', {
              initialValue: item.reporter.rules || [],
            })(<Cascader options={options} size="large" expandTrigger="hover" />)}
          </FormItem>

          <h4>邮件规则</h4>
          <FormItem label="邮箱名：" {...formItemLayout}>
            {getFieldDecorator('username', {
              initialValue: item.email.username || '',
              rules: [{ type: 'email' }],
            })(<Input type="email" />)}
          </FormItem>

          <FormItem label="密码：" {...formItemLayout}>
            {getFieldDecorator('password', {
              initialValue: item.email.password || '',
              rules: [],
            })(<Input type="password" />)}
          </FormItem>

          <FormItem label="收件人：" {...formItemLayout}>
            {getFieldDecorator('receiver', {
              initialValue: item.email.receiver || '',
              rules: [],
            })(<Input type="email" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
TemplateEditor.propTypes = {
  visible: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(TemplateEditor);
