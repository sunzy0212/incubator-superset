import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Form, Collapse, Select, Row, Col, Icon, Button, Spin, Tooltip, message } from 'antd';
import SaveModal from './saveModal';
import ChartComponect from '../../components/charts/chartComponent';
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
      visible: false,
      chartType: 'line',
      xaxis: [],
      yaxis: [],
      xx: [],
      yy: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    ReactDOM.unmountComponentAtNode(document.getElementById('saveModal'));

    const { selectFields, metricFields, allFields } = nextProps;
    const fields = [].concat(selectFields).concat(metricFields);
    const xx = this.matchFields(allFields, fields);

    this.setState({
      xx,
      yy: xx, //TODO
    });
  }

  matchFields = (allFields, fields) => {
    const res = [];
    fields.forEach((x) => {
      allFields.forEach((item) => {
        if (x === item.name) {
          res.push(Object.assign(item));
        }
      });
    });
    return res;
  }

  handleXaxisChange = (fields) => {
    console.log(`selected ${fields}`);
    const xaxis = this.matchFields(this.props.allFields, fields);
    this.setState({ xaxis });
  }

  handleYaxisChange = (fields) => {
    console.log(`selected ${fields}`);
    const tmp = this.matchFields(this.props.allFields, fields);
    const yaxis = [];
    tmp.forEach((item) => {
      yaxis.push({ ...item, type: this.state.chartType });
    });
    this.setState({ yaxis });
  }

  handleChartTypeChange = (e) => {
    console.log(`selected ${e}`);
    this.setState({ chartType: e });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.checkExist()) { // 行/列都不存在就不提交
      message.error('X轴/Y轴至少需要填写一个！！！');
      return;
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const onSaveOrUpdate = this.props.onSaveOrUpdate;
        const saveModalProps = {
          chart: this.props.chart,
          dirs: [].concat(this.props.dirs),
          data: {
            title: this.props.chart.title || `图表${new Date().toJSON()}`,
            xaxis: this.state.xaxis,
            yaxis: this.state.yaxis,
            chartType: 'Chart',
          },
          onSaveOrUpdate,
        };

        ReactDOM.render(
          <SaveModal {...saveModalProps} />,
          document.getElementById('saveModal'),
        );
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

  checkExist = () => {
    return this.state.xaxis.length !== 0 || this.state.yaxis.length !== 0;
  }


  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    const { datas, form } = this.props;
    const { getFieldDecorator } = form;
    const { xaxis, yaxis, xx, yy } = this.state;

    return (
      <div>
        <div id="saveModal" />
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
                      initialValue: xaxis.map((item) => { return item.name; }),
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
                      initialValue: yaxis.map((item) => { return item.name; }),
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
          {this.props.loading ? <Spin /> : <div />}
           <ChartComponect data={datas} xaxis={this.state.xaxis} yaxis={this.state.yaxis} title="" type />

        </div>
      </div>
    );
  }
}

Dataview.propTypes = {
  loading: PropTypes.bool,
  datas: PropTypes.array,
  selectFields: PropTypes.array,
  metricFields: PropTypes.array,
  allFields: PropTypes.array,
  onSaveOrUpdate: PropTypes.func,
};

export default Form.create()(Dataview);
