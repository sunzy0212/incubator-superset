import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Table, Icon, Menu, Dropdown, Button, Popover } from 'antd';
import { getTableData } from '../../services/datasource';

const SubMenu = Menu.SubMenu;

const TablesList = ({ loading, tables, datasourceType, newDataSet }) => {
  const menu = (
    <Menu disabled>
      <Menu.Item disabled>1st</Menu.Item>
      <SubMenu title="子集">
        <Menu.Item disabled>3d</Menu.Item>
        <Menu.Item disabled>4th</Menu.Item>
      </SubMenu>
    </Menu>
  );

  const columns = [
    {
      title: '表名',
      key: 'name',
      sorter: (a, b) => a.name > b.name,
      render: record => <Popover
        title={`预览${record.name}`} trigger="click"
        content={<PreView
          key={record.name}
          datasourceId={record.datasourceId}
          table={record.name}
        />}
      >
        <h3><Button type="primary" ghost size="small" shape="circle" icon="eye-o" /> {record.name}</h3>
      </Popover>,
    }, {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    }, {
      title: '操作',
      key: 'action',
      render: record => (
        <div>
          <Link className="ant-dropdown-link" to={'/datasets'} onClick={() => newDataSet(record)}>
             创建数据集
           </Link>
          <span className="ant-divider" />
          <Dropdown overlay={menu} >
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
      datasourceType,
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
  datasourceType: PropTypes.string,
};

export default TablesList;

class PreView extends React.Component {
  constructor(props) {
    super();
    this.state = {
      loading: true,
      datas: { columns: [], rows: [] },
    };
    const id = props.datasourceId;
    const tableName = props.table;
    let datas = { columns: [], rows: [] };
    getTableData({ id, tableName }).then((res) => {
      datas = res.result;
      this.setState({ datas, loading: false });
    });
  }

  render() {
    const columns = [];
    this.state.datas.columns.forEach((name) => {
      columns.push({ title: name, dataIndex: name, key: name, sorter: (a, b) => a > b });
    });

    const data = [];
    this.state.datas.rows.forEach((item, i) => {
      const temp = { key: i };
      this.state.datas.columns.forEach((name) => {
        temp[name] = item[name];
      });
      data.push(temp);
    });
    return <Table loading={this.state.loading} key={this.props.table} columns={columns} dataSource={data} size="small" />;
  }
}
