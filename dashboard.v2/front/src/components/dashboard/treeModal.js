import React, { PropTypes } from 'react';
import { Modal, Menu, Icon, Button } from 'antd';
import styles from './aside.less';

const SubMenu = Menu.SubMenu;

const TreeModal = ({ visible, dirs, onOk, onCancel }) => {
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
      title="报表"
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
      <div className={styles.scroll}>
        <Menu
          onClick={handleClick}
          defaultOpenKeys={['sub1']}
          mode="inline"
        >
          {genSubMenu(dirs)}
        </Menu>
      </div>
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


export default TreeModal;
