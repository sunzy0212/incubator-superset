import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Table, Popconfirm } from 'antd';

const DatasetList = ({ loading, onDelete, datasources, datasets, onInitDataSet }) => {
  const genFilers = (function () {
    const ret = new Set();
    datasources.forEach((elem) => {
      ret.add(elem.nickName || elem.name);
    });
    return ret;
  }());

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    }, {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name > b.name,
      render: text => <a href="#l">{text}</a>,
    }, {
      title: '来源',
      dataIndex: 'sources',
      key: 'sources',
      filters: Array.from(genFilers).map((elem) => { return { text: elem, value: elem }; }),
      onFilter: (value, record) => record.sources.includes(value),
    },
    {
      title: '操作',
      key: 'action',
      className: '',
      render: record => (
        <span>
          <Link className="ant-dropdown-link" to={`/datasets/${record.key}`} onClick={() => onInitDataSet(record.key)}>预处理
          </Link>
          <span className="ant-divider" />
          <Popconfirm title="确定删除该数据集吗？" onConfirm={() => onDelete(record.key)}>
            <a icon="delete">删除</a>
          </Popconfirm>
          <span className="ant-divider" />
          <Link className="ant-dropdown-link" to={`/analysor/${record.key}`} >分析
          </Link>
        </span>
      ),
    }, {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      sorter: (a, b) => a.updateTime > b.updateTime,
      width: '15%',
    }];

  const data = [];

  const getDatasourceName = (sourceId, sources) => {
    const tmp = sourceId.split(':');
    if (tmp.length === 2) {
      for (let i = 0; i < datasources.length; i++) {
        if (sources[i].id === tmp[0]) {
          return sources[i].nickName || sources[i].name;
        }
      }
    }
    return '无';
  };

  datasets.forEach((e, i) => {
    data.push({
      index: i + 1,
      key: e.id,
      name: e.name,
      sources: Object.keys(e.datasources).map((elem) => { return getDatasourceName(elem, datasources); }).join('|'),
      updateTime: e.updateTime,
    });
  });

  function rowClick(record, index) {
    // console.log(record, index);
  }

  return (
    <Table
      loading={loading} columns={columns} dataSource={data} size="middle"
      onRowClick={rowClick}
    />
  );
};
DatasetList.propTypes = {
  loading: PropTypes.bool,
  onDelete: PropTypes.func,
  datasets: PropTypes.array,
  onInitDataSet: PropTypes.func,
};
export default DatasetList;
