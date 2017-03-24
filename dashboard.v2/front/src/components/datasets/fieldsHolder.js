import React, { PropTypes } from 'react';
import { Table, Menu, Dropdown, Icon } from 'antd';
import TransformDate from './transformDate';

const SubMenu = Menu.SubMenu;
const FieldHolder = ({ title, onEditor, transToMeasure, transToDimension, transformToDate, transformDateVisible, onCancelCreate,
  transformToNumber, checkAggregation, records, currentRecord, onCreateOk }) => {
  function genDropMenu(record) {
    const dimensionMenu = (
      <Menu style={{ width: 130 }} mode="vertical">
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 重命名</a>
        </Menu.Item >
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 复制字段</a>
        </Menu.Item >
        <SubMenu key="sub1" title={<span>转换数据类型</span>}>
          <Menu.Item >
            <a onClick={() => transformToDate(record)}> 转换为日期</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => transformToNumber(record)}> 还原为数字</a>
          </Menu.Item >
        </SubMenu>
        <Menu.Item >
          <a onClick={() => transToMeasure(record)}> 转换为度量</a>
        </Menu.Item >
      </Menu >);

    const measureMenu = (
      <Menu style={{ width: 130 }} mode="vertical">
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 重命名</a>
        </Menu.Item >
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 复制字段</a>
        </Menu.Item >
        <SubMenu key="sub1" title={<span>聚合方法</span>}>
          <Menu.Item >
            <a onClick={() => checkAggregation(record, 'sum')}>
              {(record.item.action === 'sum') ? (<Icon type="check-circle" />) : null}求和</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => checkAggregation(record, 'averge')}>
              {(record.item.action === 'averge') ? (<Icon type="check-circle" />) : null}平均值</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => checkAggregation(record, 'max')}>
              {(record.item.action === 'max') ? (<Icon type="check-circle" />) : null}最大</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => checkAggregation(record, 'min')}>
              {(record.item.action === 'min') ? (<Icon type="check-circle" />) : null}最小</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => checkAggregation(record, 'count')}>
              {(record.item.action === 'count') ? (<Icon type="check-circle" />) : null}计数</a>
          </Menu.Item >
        </SubMenu>
        <Menu.Item >
          <a onClick={() => transToDimension(record)}> 转换为维度</a>
        </Menu.Item >
      </Menu >);
    return (
      <Dropdown overlay={title === '度量' ? measureMenu : dimensionMenu} >
        <a className="ant-dropdown-link" >
          <Icon type="bars" />
        </a>
      </Dropdown >);
  }

  function genItem(text, record) {
    const time = (
      <span>
        <Icon type="calendar" /> {record.name}
      </span>
        );
    const str = (
      <span>
        <Icon type="file-text" /> {record.name}
      </span>
    );
    const number = (
      <span>
        <Icon type="calculator" /> {record.name}
      </span>
    );
    if (record.item.type === 'timestamp') {
      return time;
    } else if (record.item.type === 'string') {
      return str;
    } else {
      return number;
    }
  }
  const columns = [
    {
      title,
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text, record) => genItem(text, record),
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

  const props = {
    transformDateVisible,
    onCancelCreate,
    currentRecord,
    onCreateOk,
  }

  function rowClick(record, index) {
    console.log(record, index);
  }
  return (
    <div>
      <div>
        <TransformDate {...props} />
      </div>
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
  transToDimension: PropTypes.func,
  transToMeasure: PropTypes.func,
  checkAggregation: PropTypes.func,
  records: PropTypes.array,
  transformDateVisible: PropTypes.bool,
  onCancelCreate: PropTypes.func,
  onCreateOk: PropTypes.func,
  currentRecord: PropTypes.object,
};
export default FieldHolder;
