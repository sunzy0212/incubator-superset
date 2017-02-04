import React, { PropTypes } from 'react';
import { Menu, Icon, Button, Input } from 'antd';
import styles from '../aside.less';

const SubMenu = Menu.SubMenu;

const Aside = ({
  modalVisible,
  openModal,
  onOk,
  onCancel,
}) => {
  const props = {
    visible: modalVisible,
    onOk,
    onCancel,
  };

  function handleClick(value) {
    console.log(`selected ${value}`);
  }

  return (
    <div className={styles.main}>
      <div className={styles.topTitle}>
        <div>
          <span>报表制作</span>
          <Button icon="plus" shape="circle" size="large" type="ghost" onClick={openModal} style={{ float: 'right' }} />
          <div id="modalMount" />
        </div>
        <Input.Search placeholder="关键字查找" onSearch={value => console.log(value)} />
      </div>
      <Menu
        onClick={handleClick}
        defaultOpenKeys={['sub1']}
        mode="inline"
      >
        <SubMenu key="sub1" title={<span><Icon type="appstore" /><span>Pipeline报表</span></span>}>
          <SubMenu key="sub11" title="运营日报">
            <Menu.Item key="sub111">流量</Menu.Item>
            <Menu.Item key="sub112">请求量</Menu.Item>
          </SubMenu>
          <SubMenu key="sub3" title="营收日报">
            <Menu.Item key="sub31">付费率</Menu.Item>
            <Menu.Item key="sub32">成本</Menu.Item>
          </SubMenu>
        </SubMenu>
        <SubMenu key="sub2" title={<span><Icon type="appstore" /><span>LgoDB报表</span></span>}>
          <SubMenu key="sub21" title="运营日报">
            <Menu.Item key="sub211">流量</Menu.Item>
            <Menu.Item key="sub212">请求量</Menu.Item>
          </SubMenu>
          <SubMenu key="sub22" title="营收日报">
            <Menu.Item key="sub221">付费率</Menu.Item>
            <Menu.Item key="sub222">成本</Menu.Item>
          </SubMenu>
        </SubMenu>
      </Menu>
    </div>
  );
};

Aside.propTypes = {
  modalVisible: PropTypes.bool,
  openModal: PropTypes.func,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Aside;
