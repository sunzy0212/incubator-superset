import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Menu, Icon, Button, Input, Table, Dropdown, Popconfirm } from 'antd';
import TreeModal from './treeModal';
import TreeDirModal from './treeDirModal';
import EditableCell from './editableCell';
import styles from './aside.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

const Aside = ({ modalVisible, modalCreateVisible, dirs, reports, openModal, currentDir, addDirModal, onOk,
  onCreateOk, onCancel, onCancelCreate, onDelete,
}) => {
  const props = {
    visible: modalVisible,
    createVisible: modalCreateVisible,
    currentDir,
    dirs,
    onOk,
    onCreateOk,
    onCancel,
    onCancelCreate,
    onDelete,
  };

  function genDropMenu(text, record) {
    const menu = (
      <Menu>
        <Menu.Item >
          <a onClick={() => addDirModal(record)}> 添加目录</a>
        </Menu.Item >
        <Menu.Item >
          <Popconfirm title="确定删除该数据源吗？" onConfirm={() => onDelete(record.key)} >
            <a>删除目录</a>
          </Popconfirm >
        </Menu.Item>
      </Menu >);
    if (record.dirFlag === true) {
      return (
        <Dropdown overlay={menu} >
          <a className="ant-dropdown-link" >
            <Icon type="bars" />
          </a>
        </Dropdown >);
    }
  }

  const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '90%',
    render: (text, record) => (
      <EditableCell value={text} id={record.key} dirFlag={record.dirFlag} />),
  }, {
    title: 'Edit',
    key: 'edit',
    dataIndex: 'edit',
    width: '10%',
    render: (text, record, index) => genDropMenu(text, record, index),

  }];

  let data = [];
  const rootDir = [{ id: 'Root', name: '根目录', subDir: [], dirFlag: true }];
  rootDir[0].subDir = dirs;
  function handleInitData(currentDirs, transformArr) {
    currentDirs.forEach((dirEle, j) => {
      transformArr.push({
        key: dirEle.id,
        name: dirEle.name,
        children: [],
        dirFlag: true,
      });

      handleInitData(dirEle.subDir, transformArr[j].children);
    });
  }

  const transformArr = [];
  handleInitData(rootDir, transformArr);
  function handleInitReport(currentDirs) {
    currentDirs.forEach((dirEle) => {
      reports.forEach((e) => {
        if (dirEle.key === e.dirId) {
          dirEle.children.push({
            key: e.id,
            name: e.name,
            dirFlag: false,
          });
        }
      });
      if (dirEle.children !== undefined) {
        handleInitReport(dirEle.children);
      }
    });
  }
  handleInitReport(transformArr);
  data = transformArr;

  function genSubMenu(_dirs, _reports) {
    return _dirs.map((item) => {
      return (
        <SubMenu key={item.id} title={<span > <Icon type="folder" /> {item.name} </span>} >
          {genSubMenu(item.subDir, _reports)}
          {genMenuItem(_reports[item.id])}
        </SubMenu>
      );
    });
    function genMenuItem(__reports) {
      if (__reports !== undefined && __reports.length !== 0) {
        return __reports.map((report) => {
          return (<MenuItem key={report.id} >
            <Link to={`/dashboard/${report.id}`} > < Icon type="file" /> {report.name} </Link>
          </MenuItem>);
        });
      }
    }
  }

  return (
    <div className={styles.main} >
      <div className={styles.topTitle} >
        <span > 报表 </span>
        <TreeModal {...props} /> < TreeDirModal {...props} /> < Button icon="plus" shape="circle" size="large" type="ghost" onClick={openModal} style={{ float: 'right' }} />
        <div id="modalMount" />
        <Input.Search placeholder="关键字查找" onSearch={value => console.log(value)} />
      </div>
      <Table columns={columns} size={'small'} pagination={false} dataSource={data} showHeader={false} />
    </div>
  );
};

Aside.propTypes = {
  modalVisible: PropTypes.bool,
  modalCreateVisible: PropTypes.bool,
  dirs: PropTypes.array,
  reports: PropTypes.array,
  openModal: PropTypes.func,
  addDirModal: PropTypes.func,
  currentDir: PropTypes.object,
  onOk: PropTypes.func,
  onCreateOk: PropTypes.func,
  onCancel: PropTypes.func,
  onCancelCreate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default Aside;
