import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Table, Icon, Menu, Dropdown } from 'antd';

const SubMenu = Menu.SubMenu;

const TablesList = ({ loading, tables, newDataSet }) => {
  const menu = (
    <Menu>
      <Menu.Item>1st menu item</Menu.Item>
      <Menu.Item>2nd menu item</Menu.Item>
      <SubMenu title="sub menu">
        <Menu.Item>3d menu item</Menu.Item>
        <Menu.Item>4th menu item</Menu.Item>
      </SubMenu>
    </Menu>
  );

  const columns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      render: text => <a href="#l">{text}</a>,
    }, {
      title: '操作',
      key: 'action',
      render: record => (
        <div>
          <Link className="ant-dropdown-link" to={'/datasets'} onClick={() => newDataSet(record)}>
             创建数据集
           </Link>
          <span className="ant-divider" />
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link">
             添加到数据集 <Icon type="down" />
            </a>
          </Dropdown>
        </div>),
    }];

  const data = [];

  tables.forEach((e) => {
    data.push({
      datasourceId: e.datasourceId,
      key: e.name,
      name: e.name,
      desc: e.desc,
    });
  });

  return (
    <Table
      loading={loading} columns={columns} dataSource={data} pagination={false} size="middle"
    />
  );
};

TablesList.propTypes = {
  loading: PropTypes.bool,
  tables: PropTypes.array,
};

export default TablesList;
