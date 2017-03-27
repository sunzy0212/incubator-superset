import $ from 'jquery';
import { ResponsiveContainer } from 'recharts';
import React, { PropTypes } from 'react';
import SelectComponent from './selectComponent';
import { Link } from 'dva/router';
import { Row, Col, Icon, Spin } from 'antd';
import styles from './view.less';
import ChartComponent from '../charts/chartComponent';

const MODE_READ = 'read';
class View extends React.Component {

  constructor(props) {
    super();
    this.state = {
      chartData: [],
      codeData: {},
      wheres: [],
      initFlag: false,
    };
    const { chartId } = props;
    if (this.state.initFlag === false) {
      this.getChartData(chartId);
      this.state.initFlag = true;
    }
  }

  componentWillReceiveProps(nextProps) {
    let rangeTimes = [];
    if (this.state.initFlag === true && this.state.chartData.codeId !== undefined) {
      rangeTimes = [{
        operator: 'LT',
        data: nextProps.timeRange.end.toString(),
      }, {
        operator: 'GT',
        data: nextProps.timeRange.start.toString(),
      }];
      this.getCodeData(this.state.chartData.codeId,
        this.state.chartData.type, this.state.wheres, rangeTimes);
    }
  }

  getChartData(chartId) {
    const that = this;
    $.ajax({
      url: `/v1/charts/${chartId}`,
      type: 'get',
      dataType: 'JSON',
      contentType: 'application/json; charset=utf-8',
    }).then(
      (data) => {
        that.setState({
          chartData: data,
        });
        that.getCodeData(data.codeId, data.type, [], null);
      },
      (jqXHR, textStatus, errorThrown) => {
        console.log('reject', textStatus, jqXHR, errorThrown);
      });
  }

  getCodeData(codeId, _type, wheres, rangeTimes) {
    const that = this;
    $.ajax({
      url: `/v1/datas?codeId=${codeId}&type=${_type}`,
      type: 'post',
      dataType: 'JSON',
      data: JSON.stringify({ wheres, rangeTimes }),
      contentType: 'application/json; charset=utf-8',
    }).then(
      (_data) => {
        const temp = {
          data: _data,
          type: _type,
          xaxis: that.state.chartData.xaxis,
          yaxis: that.state.chartData.yaxis,
          title: that.state.chartData.title,
          filters: that.state.chartData.filters,
        };
        that.setState({ codeData: temp });
      },
      (jqXHR, textStatus, errorThrown) => {
        console.log('reject', textStatus, jqXHR, errorThrown);
      });
  }
  removeChart() {
    const layouts = [];
    this.props.currentLayouts.lg.forEach((ele) => {
      if (ele.i !== this.props.chartId) {
        layouts.push({
          chartId: ele.i,
          data: [ele],
        });
      }
    });
    this.props.removeChart(layouts);
  }

  handleFiltersChange = (filters, data) => {
    const cFilters = [];

    filters.forEach((item) => {
      cFilters.push({ ...item, optionDatas: new Set() });
    });

    data.forEach((item) => {
      cFilters.forEach((r) => {
        r.optionDatas.add(item[r.name]);
      });
    });
    return cFilters;
  }

  getNewChartData = (fieldObj, value) => {
    const item = {
      field: {
        action: fieldObj.action,
        alias: fieldObj.alias,
        name: fieldObj.name,
        type: fieldObj.type,
      },
      operator: 'EQ',
      data: value,
    };
    let currentWheres = Object.assign(this.state.wheres);
    if (value === '全部') {
      currentWheres = currentWheres.filter(x => x.field.name !== fieldObj.name);
    } else {
      let count = 0;
      let name = '';
      currentWheres.forEach((ele) => {
        if (ele.field.name !== fieldObj.name) {
          count += 1;
        } else {
          name = fieldObj.name;
        }
      });
      if (count === currentWheres.length) {
        currentWheres.push(item);
      } else {
        currentWheres = currentWheres.filter(x => x.field.name !== name);
        currentWheres.push(item);
      }
    }
    this.state.wheres = currentWheres;
    this.getCodeData(this.state.chartData.codeId,
      this.state.chartData.type, this.state.wheres, null);
  }

  isFlip(type) {
    if (type === 'FLIPCHART') {
      return true;
    }
    return false;
  }

  render() {
    const { codeData } = this.state;
    if (codeData.data !== undefined) {
      const cfilter = this.handleFiltersChange(codeData.filters, codeData.data);
      return (
        <div className={styles.box}>
          <Row gutter={24}>
            <Col lg={16} md={8}>
              <div className={styles.boxHeader}>
                <h3>{this.state.chartData.title}</h3>
              </div>
            </Col>
            <Col lg={8} md={16}>
              <div className={styles.boxTool}>
                <Link ><Icon type="edit" /></Link>
                <span className="ant-divider" />
                <a><Icon type="download" /></a>
                <span className="ant-divider" />
                <a><Icon type="reload" /></a>
                {this.props.status === MODE_READ ? ''
                  : <span><span className="ant-divider" /><a onClick={this.removeChart.bind(this)}><Icon type="delete" /></a></span>}
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <SelectComponent getNewChartData={this.getNewChartData} filters={cfilter} />
          </Row>
          <ResponsiveContainer>
            <ChartComponent
              data={codeData.data} xaxis={codeData.xaxis} yaxis={codeData.yaxis}
              title={codeData.title} isFlip={this.isFlip(codeData.type)} unit={codeData.yaxis[0].unit}
            />
          </ResponsiveContainer>
        </div>
      );
    } else {
      return (
        <div className={styles.box}>
          <Row gutter={24}>
            <Col lg={16} md={8}>
              <div className={styles.boxHeader}>
                <h3>{this.state.chartData.title}</h3>
              </div>
            </Col>
            <Col lg={8} md={16}>
              <div className={styles.boxTool}>
                <Link ><Icon type="edit" /></Link>
                <span className="ant-divider" />
                <a><Icon type="download" /></a>
                <span className="ant-divider" />
                <a><Icon type="reload" /></a>
                {this.props.status === MODE_READ ? ''
                  : <span><span className="ant-divider" /><a onClick={this.removeChart.bind(this)}><Icon type="delete" /></a></span>}
              </div>
            </Col>
          </Row>
          <Spin size="large" />
        </div>
      );
    }
  }
}

View.propTypes = {
  chartId: PropTypes.string,
  removeChart: PropTypes.func,
  currentLayouts: PropTypes.object,
  status: PropTypes.string,
};

export default View;
