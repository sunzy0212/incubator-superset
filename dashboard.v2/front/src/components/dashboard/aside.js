import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Menu, Icon, Button, Input } from 'antd';
import TreeModal from './treeModal';
import styles from './aside.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

const Aside = ({
  modalVisible,
  dirs,
  reports,
  openDir,
  openModal,
  onOk,
  onCancel,
}) => {
  const props = {
    visible: modalVisible,
    dirs,
    onOk,
    onCancel,
  };

  function handleClick(e) {
    console.log('handleClick ', e);
  }
  function handleOpenChange(keys) {
    console.log('handleOpenChange ', keys);
    openDir(keys[keys.length - 1]);
  }

  function handleTitleClick(e) {
    // openDir(e.key);
  }

  function genSubMenu(_dirs, _reports) {
    return _dirs.map((item) => {
      return (
        <SubMenu key={item.id} title={<span><Icon type="folder" />{item.name}</span>} onTitleClick={handleTitleClick} >
          {genSubMenu(item.subDir, _reports)}
          {genMenuItem(_reports[item.id])}
        </SubMenu>
      );
    });

    function genMenuItem(_reports) {
      if (_reports !== undefined && _reports.length !== 0) {
        return _reports.map((report) => {
          return <MenuItem key={report.id}><Link to={`/dashboard/${report.id}`} ><Icon type="file" />{report.name}</Link></MenuItem>;
        });
      }
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.topTitle}>
        <div>
          <span>报表</span>
          <TreeModal {...props} />
          <Button icon="plus" shape="circle" size="large" type="ghost" onClick={openModal} style={{ float: 'right' }} />
          <div id="modalMount" />
        </div>
        <Input.Search placeholder="关键字查找" onSearch={value => console.log(value)} />
      </div>
      <Menu
        mode="inline"
        inlineIndent="12"
        onClick={handleClick}
        onOpenChange={handleOpenChange}
      >
        {genSubMenu(dirs, reports)}
      </Menu>
    </div>
  );
};

Aside.propTypes = {
  modalVisible: PropTypes.bool,
  dirs: PropTypes.array,
  reports: PropTypes.object,
  openDir: PropTypes.func,
  openModal: PropTypes.func,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Aside;
