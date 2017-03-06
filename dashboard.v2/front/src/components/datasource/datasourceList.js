import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Table, Popconfirm } from 'antd';

const DataSourceList = ({ loading, onOk, onDelete, onLoadTables, datasources }) => {
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    }, {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <a href="#l">{text}</a>,
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    // {
    //   title: '地址',
    //   dataIndex: 'host',
    //   key: 'host',
    // }, {
    //   title: '端口',
    //   dataIndex: 'port',
    //   key: 'port',
    //   render: record => <div>{record === 0 ? 'NULL' : record}</div>,
    // }, {
    //   title: '数据库',
    //   dataIndex: 'dbName',
    //   key: 'dbName',
    // }, {
    //   title: '修改时间',
    //   dataIndex: 'createTime',
    //   key: 'createTime',
    // },
    {
      title: '操作',
      key: 'action',
      className: '',
      render: record => (
        <span>
          <Link
            to={'/datasource/config'}
            state={{ item: record.item, type: record.type, action: 'EDIT', onOk }}
          >编辑
          </Link>
          <span className="ant-divider" />
          <Popconfirm title="确定删除该数据源吗？" onConfirm={() => onDelete(record.key)}>
            <a icon="delete">删除</a>
          </Popconfirm>
          <span className="ant-divider" />
          <a className="ant-dropdown-link" onClick={() => onLoadTables(record.key)}>加载
          </a>
        </span>
      ),
    }];

  const data = [];

  datasources.forEach((e, i) => {
    data.push({
      index: i + 1,
      key: e.id,
      name: e.name,
      type: e.type,
      createTime: e.createTime,
      item: e,
    });
  });

  function rowClick(record, index) {
    console.log(record, index);
  }

  return (
    <Table
      loading={loading} columns={columns} dataSource={data} size="middle"
      onRowClick={rowClick}
    />
  );
};
DataSourceList.propTypes = {
  loading: PropTypes.bool,
  onDelete: PropTypes.func,
  onLoadTables: PropTypes.func,
  datasources: PropTypes.array,
};
export default DataSourceList;
