import React, { PropTypes } from 'react';
import { Modal, Menu, Icon, Button, Input, Form, Tag } from 'antd';
import styles from './aside.less';

const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};


const TreeDirModal = ({ createVisible, onCreateOk, onCancelCreate, currentDir,
  form: {
    getFieldDecorator, validateFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const data = {
          name: values.name,
          dirId: currentDir.key,
          type: 'report',
        };
        onCreateOk(data);
      }
    });
  }

  return (
    <Modal
      visible={createVisible}
      title="新增目录"
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

        <div className={styles.scroll}>
          <FormItem label="添加至：" {...formItemLayout}>
            {getFieldDecorator('name', {
            })(<Tag color="blue-inverse">{currentDir.name}</Tag>)}
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
};

function genSubMenu(dirs) {
  return dirs.map((item) => {
    return (<SubMenu key={item.id} title={<span><Icon type="folder" />{item.name}</span>}>
      {genSubMenu(item.subDir)}</SubMenu>);
  });
}
TreeDirModal.propTypes = {
  currentDir: PropTypes.object,
  onCreateOk: PropTypes.func,
  onCancelCreate: PropTypes.func,
};

export default Form.create()(TreeDirModal);
