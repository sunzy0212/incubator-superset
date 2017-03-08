import React, { PropTypes } from 'react';
import { Table, Menu, Dropdown, Icon } from 'antd';
import RenameModal from './renameModal'


const FieldHolder = ({ title, onEditor, records, updateNameModal, currentDimensions, onCancelSave, onCreateOk }) => {

  function genDropMenu(text, record) {
    const menu = (
      <Menu>
        <Menu.Item >
          <a onClick={() => onEditor(record)}> 修改名称</a>
        </Menu.Item >
      </Menu >);
    return (
      <Dropdown overlay={menu} >
        <a className="ant-dropdown-link" >
          <Icon type="bars" />
        </a>
      </Dropdown >);
  }
  const columns = [
    {
      title,
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '',
      key: 'action',
      className: '',
      width: 78,
      render: (text, record, index) => genDropMenu(text, record, index),
    }];

  const data = [];

  const dimensionsProps = {
    dimensionsModalVisible: updateNameModal,
    currentDimensions,
    onCancelSave,
    onCreateOk,
  };

  const measuresProps = {
    measuresModalVisible: updateNameModal,
  };

  records.forEach((e, i) => {
    let currentName = e.name;
    if (e.alias !== '' && e.alias !== undefined) {
      currentName = e.alias;
    }
    data.push({
      key: i,
      name: currentName,
    });
  });

  function rowClick(record, index) {
    console.log(record, index);
  }
  if (currentDimensions !== undefined) {
    return (
      <div>
        <Table
          columns={columns} dataSource={data} size="small" pagination={false} scroll={{y: 350}}
          onRowClick={rowClick} />
        <RenameModal {...dimensionsProps} />
      </div>
    );
  } else {
    return (
      <div>
        <Table
          columns={columns} dataSource={data} size="small" pagination={false} scroll={{y: 350}}
          onRowClick={rowClick} />
        <RenameModal {...measuresProps} />
      </div>
    );
  }
};
FieldHolder.propTypes = {
  title: PropTypes.string,
  onEditor: PropTypes.func,
  onCancelSave: PropTypes.func,
  onCreateOk: PropTypes.func,
  records: PropTypes.array,
  updateNameModal: PropTypes.bool,
  currentDimensions: PropTypes.object,
};
export default FieldHolder;
