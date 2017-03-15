import React, { PropTypes } from 'react';
import { Table, Menu, Dropdown, Icon } from 'antd';

const SubMenu = Menu.SubMenu;
const FieldHolder = ({ title, onEditor, transToMeasure, transToDimension, transformToDate,
  transformToNumber, checkAggregation, records }) => {
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
  const columns = [
    {
      title,
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text, record) => (
        record.item.type === 'timestamp' ?
        (
          <span>
            <Icon type="calendar" /> {record.name}
          </span>
        ) : (
          <span>
            {record.name}
          </span>
        )
      ),
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
  transToDimension: PropTypes.func,
  transToMeasure: PropTypes.func,
  checkAggregation: PropTypes.func,
  records: PropTypes.array,
};
export default FieldHolder;
