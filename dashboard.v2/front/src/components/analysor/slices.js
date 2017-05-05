import React, { PropTypes } from 'react';
import moment from 'moment';
import { Form, Collapse, Select, Tooltip, Row, Col, Icon, DatePicker, Button } from 'antd';
import AddOn from './addOn';
import styles from './slices.less';

const Panel = Collapse.Panel;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

const ADDONS_WHERE = 'where';
const ADDONS_HAVING = 'having';

const customPanelStyle = {
  borderRadius: 4,
};

class Slices extends React.Component {
  constructor() {
    super();
    this.state = {
      timePickerDisabled: true,
      addOns_where: [],
      addOns_having: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const allFields = nextProps.allFields;
    const timeKey = nextProps.timeField.id || '';
    const selectKeys = nextProps.selectFields.map((item) => { return item.id; });
    const metricKeys = nextProps.metricFields.map((item) => { return item.id; });
    const groupKeys = nextProps.groupFields.map((item) => { return item.id; });

    this.setState({
      allFields,
      timeKey,
      selectKeys,
      metricKeys,
      groupKeys,
      addOns_where: nextProps.wheres,
      addOns_having: nextProps.havings,
    });
  }

  matchFields = (allFields, fields) => {
    const res = [];
    fields.forEach((x) => {
      allFields.forEach((item) => {
        if (x === item.id) {
          res.push(Object.assign(item));
        }
      });
    });
    return res;
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const { selectFields, metricFields, groupFields, timeField, rangeDatatime } = values;

        // 当Select 为空，group不为空时，清空group
        if (selectFields.length === 0 && groupFields.length > 0) {
          while (groupFields.shift()); // 清空groupFields
        }

        // 当Select 和 metric 都选择后，group字段如果是空，在提交时补充
        if (metricFields.length > 0 && selectFields.length > 0) {
          const allReadyExist = (id) => {
            for (let i = 0; i < groupFields.length; i++) {
              if (id === groupFields[i]) return true;
            }

            return false;
          };
          selectFields.forEach((id) => {
            if (!allReadyExist(id)) {
              groupFields.push(id);
            }
          });
        }

        const getAddOnDatas = (type) => {
          const res = [];
          for (let i = 0; i < 22; i++) {  // 最大预留，22 暂定
            const field = `${type}-${i}`;
            const value = values[field];
            if (value === undefined) {
              break;
            }
            res.push({ field: this.matchFields(this.state.allFields, [value.field])[0],
              operator: value.operator,
              data: value.data });
          }
          return res;
        };

        let rangeTimes = [];
        if (rangeDatatime !== undefined) {
          rangeTimes = [{
            operator: 'GE',
            data: new Date(rangeDatatime[0]).valueOf().toString(),
          }, {
            operator: 'LT',
            data: new Date(rangeDatatime[1]).valueOf().toString(),
          }];
        }

        const querys = {
          selectFields: this.matchFields(this.state.allFields, selectFields),
          metricFields: this.matchFields(this.state.allFields, metricFields),
          groupFields: this.matchFields(this.state.allFields, groupFields),
          wheres: getAddOnDatas(ADDONS_WHERE),
          rangeTimes,
          havings: getAddOnDatas(ADDONS_HAVING),
        };

        const _timeField = this.matchFields(this.state.allFields, [timeField])[0];
        if (_timeField !== undefined) {
          querys.timeField = _timeField;
        }

        this.props.onExecute(querys);
      }
    });
  }

  addAddOns = (type) => {
    switch (type) {
      case ADDONS_WHERE: {
        const addOnsWhere = this.state.addOns_where;
        addOnsWhere.push({ field: '', operator: 'EQ', data: '' });
        this.setState({ addOns_where: addOnsWhere });
        break;
      }
      case ADDONS_HAVING: {
        const addOnsHaving = this.state.addOns_having;
        addOnsHaving.push({ field: '', operator: 'EQ', data: '' });
        this.setState({ addOns_having: addOnsHaving });
        break;
      }
      default:
    }
  }

  deleteAddOns = (type, index) => {
    const exclude = (elem, _index) => {
      return _index !== index;
    };
    switch (type) {
      case ADDONS_WHERE: {
        const addOnsWhere = this.state.addOns_where.filter(exclude);
        this.setState({ addOns_where: addOnsWhere });
        break;
      }
      case ADDONS_HAVING: {
        const addOnsHaving = this.state.addOns_having.filter(exclude);
        this.setState({ addOns_having: addOnsHaving });
        break;
      }
      default:
    }
  }

  genFilter = (name, addOns, fieldOptions, operatorOptions) => {
    if (addOns === undefined || addOns === null) {
      return;
    }
    const checkNullField = (rule, value, callback) => {
      if (value.field !== '') {
        callback();
        return;
      }
      callback('字段不能为空!');
    };
    return addOns.map((item, i) => {
      return (<FormItem key={`${name}-${i}`}>
        {this.props.form.getFieldDecorator(`${name}-${i}`, {
          initialValue: { ...item,
            type: name,
            index: i,
            fieldOptions,
            operatorOptions,
            deleteAddOns: this.deleteAddOns },
          rules: [{ validator: checkNullField }],
        })(
          <AddOn key={`${name}-${i}`} />,
       )}
      </FormItem>);
    });
  }

  handleGroupSelectChange = (keys) => {
    this.props.form.resetFields(['selectFields']);
    this.setState({ selectKeys: keys });
  }

  handleTimesFieldSelect = () => {
    this.setState({
      timePickerDisabled: false,
    });
  }

  render() {
    const { addOns_where, addOns_having } = this.state;
    const { dimensions, measures, times, operatorOptions, form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form onSubmit={this.handleSubmit} className={styles.form1}>
        <Row gutter={2}>
          {/* <Col lg={8} md={8}>*/}
          {/* <Button style={{ width: '100%' }} size="large" icon="save">*/}
          {/* 保存</Button>*/}
          {/* </Col >*/}
          <Col lg={8} md={8}>
            <Button style={{ width: '100%' }} size="large" icon="close-square-o" onClick={this.handleReset}>
              清空</Button>
          </Col>
          <Col lg={8} md={8}>
            <Button
              style={{ width: '100%' }}
              icon="play-circle-o" size="large" type="primary" htmlType="submit"
              loading={this.props.loading}
            >查询</Button>
          </Col>
        </Row>
        <br />
        <Collapse defaultActiveKey={['1', '2', '3', '4', '5']}>
          <Panel header="时间(Time)" key="1" style={customPanelStyle}>

            <p icon="info">日期列&nbsp;
              <Tooltip title="请选择你的日期字段"><Icon type="info-circle" />
              </Tooltip>
            </p>
            <FormItem wrapperCol={{ span: 20 }}>
              {getFieldDecorator('timeField', {
                initialValue: this.state.timeKey,
              })(
                <Select placeholder="如果制图需要，请选择日期字段" onSelect={this.handleTimesFieldSelect}>
                  {genOptionsOfSelect(times)}
                </Select>,
              )}
            </FormItem>

            <p icon="info">时间选择&nbsp;
              <Tooltip title="请选择你的时间范围，默认不选则不限时间"><Icon type="info-circle" />
              </Tooltip>
            </p>
            <FormItem>
              {getFieldDecorator('rangeDatatime')(
                <RangePicker
                  ranges={{ 今天: [moment().startOf('day'), moment().endOf('day')],
                    昨天: [moment().add(-1, 'day').startOf('day'), moment().add(-1, 'day').endOf('day')],
                    本周: [moment().startOf('week'), moment().endOf('week')],
                    上周: [moment().add(-1, 'week').startOf('week'), moment().add(-1, 'week').endOf('week')],
                    本月: [moment().startOf('month'), moment().endOf('month')],
                    上月: [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')],
                    前三月: [moment().add(-3, 'month'), moment()],
                  }}
                  showTime format="YYYY-MM-DD HH:mm:ss" disabled={this.state.timePickerDisabled}
                />,
                )}
            </FormItem>

          </Panel>
          <Panel header="查询(SQL)" key="2" style={customPanelStyle}>
            <p icon="info">Select&nbsp;
              <Tooltip title="SELECT语句，指定需要查询的字段。可搜索"><Icon type="info-circle" />
              </Tooltip>
            </p>
            <FormItem >
              {getFieldDecorator('selectFields', {
                initialValue: this.state.selectKeys,
              })(
                <Select
                  multiple
                  showSearch
                  placeholder="维度"
                >
                  {genOptionsOfSelect([].concat(times).concat(dimensions))}
                </Select>,
              )}
            </FormItem>

            <p icon="info">Metric&nbsp;
              <Tooltip title="度量，指定需要查询的字段，及算法。可手写"><Icon type="info-circle" />
              </Tooltip>
            </p>

            <FormItem >
              {getFieldDecorator('metricFields', {
                initialValue: this.state.metricKeys,
              })(
                <Select
                  multiple
                  showSearch
                  placeholder="度量"
                >
                  {genOptionsOfSelect(measures)}
                </Select>,
              )}
            </FormItem>

          </Panel>
          <Panel header="条件(Where)" key="3" style={customPanelStyle}>
            <p icon="info">Where&nbsp;
              <Tooltip title="WHERE 语句"><Icon type="info-circle" />
              </Tooltip>
            </p>
            {this.genFilter('where', addOns_where, [].concat(times).concat(dimensions), operatorOptions)}

            <Button
              type="dashed" size="large" icon="plus" style={{ width: '100%' }}
              onClick={() => this.addAddOns(ADDONS_WHERE)}
            />
          </Panel>

          <Panel header="分组筛选(GroupBy/Having)" key="4" style={customPanelStyle}>

            <p icon="info">GroupBy&nbsp;
              <Tooltip title="GROUP BY 语句"><Icon type="info-circle" />
              </Tooltip>
            </p>

            <FormItem >
              {getFieldDecorator('groupFields', {
                initialValue: this.state.groupKeys,
              })(
                <Select
                  multiple
                  showSearch
                  placeholder="分组"
                  onChange={this.handleGroupSelectChange}
                >
                  {genOptionsOfSelect([].concat(times).concat(dimensions))}
                </Select>,
              )}
            </FormItem>

            <p icon="info">Having&nbsp;
              <Tooltip title="Having 语句"><Icon type="info-circle" />
              </Tooltip>
            </p>
            {this.genFilter('having', addOns_having, measures, operatorOptions)}

            <Button
              type="dashed" size="large" icon="plus" style={{ width: '100%' }}
              onClick={() => this.addAddOns(ADDONS_HAVING)}
            />
          </Panel>
        </Collapse>
      </Form>
    );
  }
}

function genOptionsOfSelect(fields) {
  if (fields === undefined || fields === null || fields[0] === undefined) {
    return;
  }
  return fields.map((item) => {
    return (<Option
      key={item.id}
      value={item.id}
    >
      {item.alias || item.name}</Option>);
  });
}

Slices.propTypes = {
  loading: PropTypes.bool,
  dimensions: PropTypes.array,
  measures: PropTypes.array,
  times: PropTypes.array,
  operatorOptions: PropTypes.array,
  selectFields: PropTypes.array,
  metricFields: PropTypes.array,
  groupFields: PropTypes.array,
  timeField: PropTypes.object,
};

export default Form.create()(Slices);
