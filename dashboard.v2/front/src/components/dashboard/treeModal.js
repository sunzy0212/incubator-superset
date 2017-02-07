import React, { PropTypes } from 'react';
import { Modal, Menu, Icon, Button, Input, Form } from 'antd';
import styles from './aside.less';

const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const TreeModal = ({ visible, dirs, onOk, onCancel,
  form: {
    getFieldDecorator,
  } }) => {
  function handleAddAction() {

  }

  function handleOk() {
    onOk();
  }

  function handleClick() {
  }

  return (
    <Modal
      visible={visible}
      title="新增报表"
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="add" type="primary" size="large" onClick={handleAddAction}>新建目录</Button>,
        <Button key="back" type="ghost" size="large" onClick={onCancel}>取消</Button>,
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
          <Menu
            onClick={handleClick}
            defaultOpenKeys={['sub1']}
            mode="inline"
          >
            <SubMenu key="root#" title={<span><Icon type="folder" />根目录</span>}>
              {genSubMenu(dirs)}
            </SubMenu>
          </Menu>
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
TreeModal.propTypes = {
  visible: PropTypes.bool,
  dirs: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(TreeModal);
