import React, { PropTypes } from 'react';
import { Table, Menu, Dropdown, Icon } from 'antd';

const SubMenu = Menu.SubMenu;
const FieldHolder = ({ title, onEditor, records }) => {
  function genDropMenu(text, record) {
    const menu1 = (
      <Menu style={{ width: 130 }} mode="vertical">
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 重命名</a>
        </Menu.Item >
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 复制字段</a>
        </Menu.Item >
        <SubMenu key="sub1" title={<span>转换数据类型</span>}>
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 转换为日期</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 还原为数字</a>
          </Menu.Item >
        </SubMenu>
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 转换为度量</a>
        </Menu.Item >
      </Menu >);

    const menu2 = (
      <Menu style={{ width: 130 }} mode="vertical">
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 重命名</a>
        </Menu.Item >
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 复制字段</a>
        </Menu.Item >
        <SubMenu key="sub1" title={<span>聚合方法</span>}>
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 求和</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 平均值</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 最大</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 最小</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => onEditor(record, title)}> 计数</a>
          </Menu.Item >
        </SubMenu>
        <Menu.Item >
          <a onClick={() => onEditor(record, title)}> 转换为维度</a>
        </Menu.Item >
      </Menu >);
    let currentMenu = menu1;
    if (title === '度量') {
      currentMenu = menu2;
    }
    return (
      <Dropdown overlay={currentMenu} >
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
