import React from 'react';
import { Select, Row, Col, Button } from 'antd';
import styles from './header.less';

const ButtonGroup = Button.Group;
const Option = Select.Option;
const Header = ({ id, name, onEditor }) => {
  function handleChange(value) {
    console.log(`selected ${value}`);
  }
  return (
    <Row gutter={24} className={styles.row}>
      <Col span={2}>
        <Button size="large" type="ghost" onClick={() => onEditor(id)} icon="edit">{name || ''}</Button>
      </Col>
      <Col span={10} offset={12}>
        <ButtonGroup>
          <Button size="large" type="ghost"> CSV</Button>
          <Button size="large" type="ghost">EXCEL</Button>
          <Button size="large" type="ghost">JSON</Button>
          <Select
            size="large"
            showSearch
            style={{ width: '200px' }}
            placeholder="搜索"
            optionFilterProp="children"
            onChange={handleChange}
            filterOption={(input, option) =>
            option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="tom">Tom</Option>
          </Select>
          <Button size="large" type="primary">添加到报表</Button>
        </ButtonGroup>
      </Col>
    </Row>
  );
};
export default Header;
