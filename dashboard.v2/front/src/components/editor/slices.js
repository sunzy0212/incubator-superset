import React, { PropTypes } from 'react';
import { Form, Collapse, Select, Tooltip, Row, Col, Icon, DatePicker, Switch, Button, Input } from 'antd';
import styles from './slices.less';

const Panel = Collapse.Panel;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  // marginBottom: 24,
  border: 0,
};
const Slices = ({
  data,
  // form: {
  //   getFieldDecorator,
  //   validateFields,
  // },
}) => {
  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  return (
    <Form>
      <Row gutter={2}>
        <Col lg={8} md={8}><Button style={{ width: '100%' }} size="large" icon="save">保存</Button>
        </Col >
        <Col lg={8} md={8}> <Button style={{ width: '100%' }} size="large" icon="close-square-o">清空</Button>
        </Col>
        <Col lg={8} md={8} >
          <Button style={{ width: '100%' }} icon="play-circle-o" size="large" type="primary">执行</Button>
        </Col>
      </Row>
      <br />
      <Collapse defaultActiveKey={['1', '2', '3', '4']} >
        <Panel header="时间(Time)" key="1" style={customPanelStyle}>

          <p icon="info">时间列&nbsp;
              <Tooltip title="请选择你所要使用的字段作为时间轴"><Icon type="info-circle" />
              </Tooltip>
          </p>

          <Select defaultValue="day" >
            <Option value="time">time</Option>
            <Option value="lucy">_time</Option>
            <Option value="Yiminghe">shijian</Option>
          </Select>

          <Row gutter={24}>
            <Col lg={12} md={12} >
              <p icon="info">从&nbsp;
                <Tooltip title="包含该值，即左边闭区间"><Icon type="info-circle" />
                </Tooltip>
              </p>
              <Select defaultValue="day" >
                <Option value="one day ago">1 天前</Option>
                <Option value="10lucy">10 天前</Option>
                <Option value="30lucy">30 天前</Option>
                <Option value="60lucy">60 天前</Option>
                <Option value="360lucy">365 天前</Option>
              </Select>
            </Col>
            <Col lg={12} md={12} >
              <p icon="info">至&nbsp;
                <Tooltip title="不包含该值，即右边开区间"><Icon type="info-circle" />
                </Tooltip>
              </p>
              <Select defaultValue="day" >
                <Option value="one day ago">1 天前</Option>
                <Option value="10lucy">10 天前</Option>
                <Option value="30lucy">30 天前</Option>
                <Option value="60lucy">60 天前</Option>
                <Option value="360lucy">365 天前</Option>
              </Select>
            </Col>
          </Row>
          <br />
          <div>
            <RangePicker /> <Switch style={{ float: 'right' }} checkedChildren={'开'} unCheckedChildren={'关'} className={styles.datePicker} />
          </div>

        </Panel>
        <Panel header="查询(SQL)" key="2" style={customPanelStyle}>
          <p icon="info">Select&nbsp;
            <Tooltip title="SELECT语句，指定需要查询的字段。可搜索"><Icon type="info-circle" />
            </Tooltip>
          </p>
          <Select
            multiple
            showSearch
            style={{ width: '100%' }}
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

          <p icon="info">Metric&nbsp;
            <Tooltip title="度量，指定需要查询的字段，及算法。可手写"><Icon type="info-circle" />
            </Tooltip>
          </p>
          <Select
            combobox
            placeholder=""
            notFoundContent=""
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onChange={handleChange}
          >
            {/* {options}*/}
          </Select>

          <p icon="info">GroupBy&nbsp;
            <Tooltip title="GROUP BY 语句"><Icon type="info-circle" />
            </Tooltip>
          </p>
          <Select
            multiple
            showSearch
            style={{ width: '100%' }}
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
        </Panel>
        <Panel header="条件(Where)" key="3" style={customPanelStyle}>
          <p icon="info">Where&nbsp;
            <Tooltip title="WHERE 语句"><Icon type="info-circle" />
            </Tooltip>
          </p>
          <Select defaultValue="day" >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="Yiminghe">yiminghe</Option>
          </Select>

          <p icon="info">Having&nbsp;
            <Tooltip title="Having 语句"><Icon type="info-circle" />
            </Tooltip>
          </p>
          <Select defaultValue="day" >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="Yiminghe">yiminghe</Option>
          </Select>
        </Panel>

        <Panel header="过滤(Filter)" key="4" style={customPanelStyle}>
          <p icon="info">Filter&nbsp;
            <Tooltip title="Filter 规则"><Icon type="info-circle" />
            </Tooltip>
          </p>
          <Row gutter={4}>
            <Col lg={6} md={6}>
              <Select defaultValue="day" >
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </Col>
            <Col lg={6} md={6}>
              <Select defaultValue="in" >
                <Option value="in">IN</Option>
                <Option value="not-in">NOT IN</Option>
              </Select>
            </Col>
            <Col lg={8} md={8}>
              <Input />
            </Col>
            <Col lg={4} md={4}>
              <Button shape="circle" icon="minus" type="ghost" size="large" />
            </Col>
          </Row>
          <br />
          <Button type="dashed" size="large" onClick={handleChange} icon="plus" style={{ width: '100%' }} />

        </Panel>
      </Collapse>
    </Form>
  );
};

Slices.propTypes = {
  data: PropTypes.object,
};

export default Form.create()(Slices);
