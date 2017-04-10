import React, { PropTypes } from 'react';
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
  constructor(props) {
    super();
    const allFields = props.allFields;
    const timeKey = props.timeField.name || '';
    const selectKeys = props.selectFields.map((item) => { return item.name; });
    const metricKeys = props.metricFields.map((item) => { return item.name; });
    const groupKeys = props.groupFields.map((item) => { return item.name; });

    this.state = {
      allFields,
      timeKey,
      selectKeys,
      metricKeys,
      groupKeys,
      addOns_where: [],
      addOns_having: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      allFields: nextProps.allFields,
      addOns_where: nextProps.wheres,
      addOns_having: nextProps.havings,
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
          selectFields.forEach((item) => {
            for (const r in groupFields) {
              if (item === r) {
                break;
              }
            }
            groupFields.push(item);
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
        const getWhereDatas = ( tField, rangeDate) => {
          const res = [];
          if (tField !== undefined && rangeDate !== undefined) {
            res.push({ field: this.matchFields(this.state.allFields, [tField])[0], operator: 'GE', data: new Date(rangeDate[0]).valueOf().toString() });
            res.push({ field: this.matchFields(this.state.allFields, [tField])[0], operator: 'LT', data: new Date(rangeDate[1]).valueOf().toString() });
          }
          return res;
        };

        const querys = {
          selectFields: this.matchFields(this.state.allFields, selectFields),
          metricFields: this.matchFields(this.state.allFields, metricFields),
          groupFields: this.matchFields(this.state.allFields, groupFields),
          timeField: this.matchFields(this.state.allFields, [timeField])[0],
          wheres: getAddOnDatas(ADDONS_WHERE).concat(getWhereDatas(timeField, rangeDatatime)),
          havings: getAddOnDatas(ADDONS_HAVING),
        };

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
            <Button style={{ width: '100%' }} size="large" icon="close-square-o" onClick={() => this.handleReset}>
              清空</Button>
          </Col>
          <Col lg={8} md={8}>
            <Button style={{ width: '100%' }} icon="play-circle-o" size="large" type="primary" htmlType="submit">
              查询</Button>
          </Col>
        </Row>
        <br />
        <Collapse defaultActiveKey={['1', '2', '3', '4', '5']}>
          <Panel header="时间(Time)" key="1" style={customPanelStyle}>

            <p icon="info">时间列&nbsp;
              <Tooltip title="请选择你所要使用的字段作为时间轴"><Icon type="info-circle" />
              </Tooltip>
            </p>

            <FormItem >
              {getFieldDecorator('timeField', {
                initialValue: this.state.timeKey,
              })(
                <Select placeholder="Please select a time field if need">
                  {genOptionsOfSelect(times)}
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...{ labelCol: { span: 4 }, wrapperCol: { span: 19 } }}
              label="选择"
            >
              {getFieldDecorator('rangeDatatime')(
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />,
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
                  {genOptionsOfSelect(dimensions)}
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
            {this.genFilter('where', addOns_where, dimensions, operatorOptions)}

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
                  {genOptionsOfSelect(dimensions)}
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

Slices.propTypes = {
  dimensions: PropTypes.array,
  measures: PropTypes.array,
  times: PropTypes.array,
  operatorOptions: PropTypes.array,
};

export default Form.create()(Slices);
