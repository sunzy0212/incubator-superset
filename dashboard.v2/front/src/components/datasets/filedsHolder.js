import React, { PropTypes } from 'react';
import { Table, Menu, Dropdown, Icon } from 'antd';


const FieldHolder = ({ title, onEditor, records }) => {
  function genDropMenu(text, record) {
    const menu = (
      <Menu>
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 重命名</a>
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

  records.forEach((e, i) => {
    data.push({
      key: i,
      name: e.alias || e.name,
      item: e,
    });
  });

  function rowClick(record, index) {
    console.log(record, index);
  }
  return (
    <div>
      <Table
        columns={columns} dataSource={data} size="small" pagination={false} scroll={{ y: 350 }}
        onRowClick={rowClick}
      />
    </div>
  );
};
FieldHolder.propTypes = {
  title: PropTypes.string,
  onEditor: PropTypes.func,
  records: PropTypes.array,
};
export default FieldHolder;
