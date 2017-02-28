import React, { PropTypes } from 'react';
import { Form, Collapse, Select, Row, Col, Icon, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from './dataview.less';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;

const ChartTypes = [
  { name: 'line', alias: '线图' },
  { name: 'bar', alias: '条形图' },
  { name: 'pie', alias: '饼图' },
];


class Dataview extends React.Component {

  constructor() {
    super();
    this.state = {
      chartType: 'line',
      x_axis: [],
      y_axis: [],
      xx: [],
      yy: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selectFields, metricFields, allFields } = nextProps;

    const fields = [].concat(selectFields).concat(metricFields);

    const xx = [];
    fields.forEach((key) => {
      allFields.forEach((r) => {
        if (key === r.name) {
          xx.push(r);
        }
      });
    });

    this.setState({
      x_axis: [],
      y_axis: [],
      xx,
      yy: xx, //TODO
    });
  }

  handleXaxisChange = (e) => {
    console.log(`selected ${e}`);
  }

  handleYaxisChange = (e) => {
    console.log(`selected ${e}`);
  }

  handleChartTypeChange = (e) => {
    console.log(`selected ${e}`);
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const { x_axis, y_axis, chartType } = values;
        this.props.onSaveOrUpdate({ name: new Date().toJSON(), x_axis, y_axis, chartType });
      }
    });
  }

  genOptionsOfSelect=(fields) => {
    if (fields === undefined || fields === null) {
      return;
    }
    return fields.map((item) => {
      return (<Option
        key={item.name}
        value={item.name}
      >
        {item.alias || item.name}</Option>);
    });
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    const { datas, form } = this.props;
    const { getFieldDecorator } = form;
    const { x_axis, y_axis, xx, yy } = this.state;

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Collapse >
            <Panel header={<Icon type="area-chart" />} key="1">
              <Row gutter={6}>
                <Col lg={6} md={6}>
                  <p icon="info">X轴&nbsp;
                  <Tooltip title="请选择你的线条对应的字段，如果多个则按照顺序拼接"><Icon type="info-circle" />
                  </Tooltip>
                  </p>

                  <FormItem >
                    {getFieldDecorator('x_axis', {
                      initialValue: x_axis,
                    })(
                      <Select
                        multiple
                        showSearch
                        placeholder="x 轴"
                        style={{ width: '100%' }}
                        onChange={this.handleXaxisChange}
                      >
                        {this.genOptionsOfSelect(xx)}
                      </Select>,
                  )}
                  </FormItem>
                </Col>
                <Col lg={6} md={6}>
                  <p icon="info">Y轴&nbsp;
                  <Tooltip title="请选择你的线条对应的字段，如果多个则按照顺序拼接"><Icon type="info-circle" />
                  </Tooltip>
                  </p>
                  <FormItem >
                    {getFieldDecorator('y_axis', {
                      initialValue: y_axis,
                    })(
                      <Select
                        multiple
                        showSearch
                        placeholder="y 轴"
                        style={{ width: '100%' }}
                        onChange={this.handleYaxisChange}
                      >
                        {this.genOptionsOfSelect(yy)}
                      </Select>,
                  )}
                  </FormItem>
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
                    {getFieldDecorator('chartType',
                    { initialValue: 'line' })(
                      <Select style={{ width: '100%' }} onChange={this.handleChartTypeChange}>
                        {this.genOptionsOfSelect(ChartTypes)}
                      </Select>,
                  )}
                  </FormItem>
                </Col>
                <Col lg={6} md={6}>
                  <Button style={{ width: '100%' }} size="large" icon="reload" type="ghost">刷新</Button>
                </Col>
                <Col lg={6} md={6}>
                  <Button style={{ width: '100%' }} size="large" icon="save" htmlType="submit" type="ghost">保存</Button>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </Form>
        <div className={styles.chart}>
          <LineChart
            width={750} height={500} data={datas}
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
  }
}

Dataview.propTypes = {
  datas: PropTypes.array,
  selectFields: PropTypes.array,
  metricFields: PropTypes.array,
  allFields: PropTypes.array,
  onSaveOrUpdate: PropTypes.func,
};

export default Form.create()(Dataview);
