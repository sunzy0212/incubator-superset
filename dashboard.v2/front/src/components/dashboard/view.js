import { ResponsiveContainer } from 'recharts';
import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Row, Col, Icon, Spin } from 'antd';
import SelectComponent from '../charts/selectComponent';
import ChartComponent from '../charts/chartComponent';
import { getChart } from '../../services/chartApi';
import { queryByCodeId } from '../../services/queryApi';
import styles from './view.less';

const MODE_READ = 'read';
class View extends React.Component {

  constructor(props) {
    super();
    let rangeTimes = [];
    if (props.timeRange.start !== '' && props.timeRange.end !== '') {
      rangeTimes = [{
        operator: 'LE',
        data: props.timeRange.end.toString(),
      }, {
        operator: 'GE',
        data: props.timeRange.start.toString(),
      }];
    }
    this.state = {
      chartData: {},
      data: [],
      wheres: [],
      rangeTimes,
      initFlag: false,
      loading: false,
    };
  }

  componentWillMount() {
    this.setState({
      initFlag: true,
      loading: true,
    });
    this.fetchChart();
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.reflush === true) {
      nextProps.cancelFlushFlag();
      let rangeTimes = [];
      if (this.props.timeRange.start !== '') {
        rangeTimes = [{
          operator: 'LT',
          data: nextProps.timeRange.end.toString(),
        }, {
          operator: 'GE',
          data: nextProps.timeRange.start.toString(),
        }];
      }
      this.setState({
        data: [],
        loading: true,
      });
      this.fetchData(this.state.chartData.codeId,
        this.state.chartData.type, this.state.wheres, rangeTimes);
    }
  }

  getNewData = (selects) => {
    this.setState({ data: [], loading: true });
    let currentWheres = this.state.wheres;
    selects.forEach((elem) => {
      if (elem.value === '全部') {
        currentWheres = currentWheres.filter(x => x.field.id !== elem.item.id);
      } else {
        currentWheres = currentWheres.filter(x => x.field.id !== elem.item.id);
        const item = {
          field: elem.item,
          operator: 'EQ',
          data: elem.value,
        };
        currentWheres.push(item);
      }
    });

    this.fetchData(this.state.chartData.codeId,
      this.state.chartData.type, currentWheres, this.state.rangeTimes);
    this.setState({
      wheres: currentWheres,
    });
  }

  fetchChart() {
    getChart({ id: this.props.chartId }).then((data) => {
      if (data.success) {
        const chartData = data.result;
        this.setState({
          chartData,
        });
        this.fetchData(chartData.codeId, chartData.type, [], this.state.rangeTimes);
      }
    });
  }

  fetchData(codeId, formatType, wheres, rangeTimes) {
    queryByCodeId({ codeId, formatType, querys: { wheres, rangeTimes } }).then((data) => {
      if (data.success) {
        this.setState(
          { loading: false, data: data.result },
        );
      }
    });
  }

  removeChart = () => {
    this.props.removeChart(this.props.chartId);
  }

  genFilters = () => {
    const filters = this.state.chartData.filters;
    const cFilters = [];
    if (filters === undefined || filters.length === 0) {
      return cFilters;
    }

    filters.forEach((item) => {
      cFilters.push({ ...item, optionDatas: new Set() });
    });

    this.state.data.forEach((item) => {
      cFilters.forEach((r) => {
        r.optionDatas.add(item[r.name]);
      });
    });
    return cFilters;
  }

  isFlip = (type) => {
    if (type === 'FLIPCHART') {
      return true;
    }
    return false;
  }

  render() {
    const { chartData } = this.state;
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
              <Link to={`/analysor/${this.props.chartId}`}><Icon type="edit" /></Link>
              <span className="ant-divider" />
              <a><Icon type="download" /></a>
              <span className="ant-divider" />
              <a><Icon type="reload" /></a>
              {this.props.status === MODE_READ ? ''
                : <span><span className="ant-divider" /><a onClick={() => this.removeChart()}><Icon type="delete" /></a></span>}
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <SelectComponent getNewChartData={this.getNewData} filters={this.genFilters()} />
        </Row>
        {
          this.state.loading ?
            <Spin size="large" />
            :
            <ResponsiveContainer>
              <ChartComponent
                data={this.state.data}
                xaxis={chartData.xaxis}
                yaxis={chartData.yaxis}
                lineTypes={chartData.lineTypes}
                title={chartData.title}
                isFlip={this.isFlip(chartData.type)}
                unit={chartData.yaxis[0].unit}
              />
            </ResponsiveContainer>
        }
      </div>
    );
  }
}

View.propTypes = {
  chartId: PropTypes.string,
  removeChart: PropTypes.func,
  status: PropTypes.string,
};

export default View;
