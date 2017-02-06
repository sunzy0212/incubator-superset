import React from 'react';
import { Form, Collapse, Select, Row, Col, Icon, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from './dataview.less';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];
const Dataview = ({
  form: {
    getFieldDecorator,
  },
}) => {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };
  function handleChange(value) {
    console.log(`selected ${value}`);
  }
  return (
    <div>
      <Collapse >
        <Panel header={<Icon type="area-chart" />} key="1">
          <Row gutter={6}>
            <Col lg={6} md={6}>
              <p icon="info">X轴&nbsp;
                  <Tooltip title="请选择你的线条对应的字段，如果多个则按照顺序拼接"><Icon type="info-circle" />
                  </Tooltip>
              </p>

              <Select defaultValue="jack" style={{ width: '100%' }}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </Col>
            <Col lg={6} md={6}>
              <p icon="info">Y轴&nbsp;
                  <Tooltip title="请选择你的线条对应的字段，如果多个则按照顺序拼接"><Icon type="info-circle" />
                  </Tooltip>
              </p>

              <Select defaultValue="lucy" style={{ width: '100%' }}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </Col>
            <Col lg={6} md={6}>
              <p icon="info">Series&nbsp;
                  <Tooltip title="请选择你的线条对应的字段，如果多个则按照顺序拼接"><Icon type="info-circle" />
                  </Tooltip>
              </p>

              <Select multiple defaultValue="jack" style={{ width: '100%' }}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </Col>
            <Col lg={6} md={6}>
              <p icon="info">Series Limit&nbsp;
                  <Tooltip title="请选择你的线条对应的字段，如果多个则按照顺序拼接"><Icon type="info-circle" />
                  </Tooltip>
              </p>

              <Select defaultValue="unlimit" style={{ width: '100%' }}>
                <Option value="jack">10</Option>
                <Option value="lucy">50</Option>
                <Option value="Yiminghe">100</Option>
              </Select>
            </Col>
          </Row>

          <Row gutter={6} className={styles.row}>
            <Col lg={12} md={12}>
              <FormItem
                {...formItemLayout}
                label="图表类型"
              >
                {getFieldDecorator('chart-type',
                  { initialValue: 'Line' })(
                    <Select defaultValue="Line" style={{ width: '100%' }}>
                      <Option value="Line">Line</Option>
                      <Option value="Bar">Bar</Option>
                      <Option value="Pie">Pie</Option>
                    </Select>,
                )}
              </FormItem>
            </Col>
            <Col lg={6} md={6}>
              <Button style={{ width: '100%' }} size="large" icon="reload" type="ghost">刷新</Button>
            </Col>
            <Col lg={6} md={6}>
              <Button style={{ width: '100%' }} size="large" icon="save" type="ghost">保存</Button>
            </Col>
          </Row>
        </Panel>
      </Collapse>
      <div className={styles.chart}>
        <LineChart
          width={750} height={500} data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <Legend />
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" dot={{ stroke: 'red', strokeWidth: 10 }} />
        </LineChart>


      </div>
    </div>
  );
};


export default Form.create()(Dataview);
