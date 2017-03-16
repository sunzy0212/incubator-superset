import $ from 'jquery';
import { ResponsiveContainer } from 'recharts';
import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Row, Col, Icon, Spin, Select } from 'antd';
import styles from './view.less';
import ChartComponent from '../charts/chartComponent';
import SelectComponent from './selectComponent';

class View extends React.Component {

  constructor(props) {
    super();
    this.state = {
      chartData: [],
      codeData: {},
      where: [],
      initFlag: false,
    };
    const { chartId } = props;
    if (this.state.initFlag === false) {
      this.getChartData(chartId);
      this.state.initFlag = true;
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
        that.getCodeData(data.codeId, data.type, data.xaxis, data.yaxis, data.title, data.filters);
      },
      (jqXHR, textStatus, errorThrown) => {
        console.log('reject', textStatus, jqXHR, errorThrown);
      });
  }

  getCodeData(codeId, _type, _xaxis, _yaxis, _title, _filters) {
    const that = this;
    $.ajax({
      url: `/v1/datas?codeId=${codeId}&type=${_type}`,
      type: 'post',
      dataType: 'JSON',
      contentType: 'application/json; charset=utf-8',
    }).then(
      (_data) => {
        const temp = {
          data: _data,
          type: _type,
          xaxis: _xaxis,
          yaxis: _yaxis,
          title: _title,
          filters: _filters,
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

  getNewChartData = (key, value) => {
    const item = [{
      field: key,
      operator: 'EQ',
      data: value,
    }]
    this.state.where.push(item);
    console.log(key);
    console.log(value);
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
      console.log(codeData);
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
                <span className="ant-divider" />
                <a onClick={this.removeChart.bind(this)}><Icon type="delete" /></a>
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <SelectComponent getNewChartData={this.getNewChartData} filters={cfilter} />
          </Row>
          <ResponsiveContainer>
            <ChartComponent
              data={codeData.data} xaxis={codeData.xaxis} yaxis={codeData.yaxis}
              title={codeData.title} isFlip={this.isFlip(codeData.type)}
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
                <span className="ant-divider" />
                <a onClick={this.removeChart.bind(this)}><Icon type="delete" /></a>
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
};

export default View;
