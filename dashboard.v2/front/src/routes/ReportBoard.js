import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Spin, Button } from 'antd';
import View from '../components/dashboard/view';
import styles from './ReportBoard.less';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function ReportBoard({ dispatch, loading, reportboard }) {
  const { status, report, layouts, addChartId, timeRange,
    ponitsContainer } = reportboard;
  const currentLayouts = { lg: [] };
  const chartList = [];
  if (addChartId !== undefined) {
    let count = 0;
    let currentX = 6;
    layouts.forEach((ele) => {
      if (layouts.length % 2 === 0) {
        currentX = 0;
      }
      if (ele.chartId !== addChartId) {
        count += 1;
      }
    });
    if (layouts.length === 0 || count === layouts.length) {
      layouts.push({
        chartId: addChartId,
        data: [{
          i: addChartId,
          x: currentX,
          y: Infinity,
          w: 6,
          h: 1,
          isDraggable: true,
          isResizable: true,
          minW: 4,
          maxW: 12,
          maxH: 1,
        }],
      });
    }
  }
  for (let i = 0; i < layouts.length; i++) {
    currentLayouts.lg.push(layouts[i].data[0]);
    chartList.push(layouts[i].chartId);
  }

  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  function onLayoutChange(layout) {
    currentLayouts.lg = layout;
    dispatch({
      type: 'reportboard/layoutChange',
      payload: { currentLayouts },
    });
  }

  const viewProps = {
    status,
    currentLayouts,
    report,
    timeRange,
    getChartData(chartId) {
      dispatch({
        type: 'reportboard/getChartData',
        payload: { cId: chartId },
      });
    },
    removeChart(clayouts) {
      dispatch({
        type: 'reportboard/renderLayouts',
        payload: { layouts: clayouts },
      });
    },
  };

  function genReport(cLayouts, cChartList) {
    if (cLayouts.length === 0) {
      return (
        <div>
          <Button type="dashed" size="large" onClick={handleChange} icon="plus" style={{ width: '100px' }} />
        </div>
      );
    } else {
      return (
        <ResponsiveReactGridLayout
          onLayoutChange={onLayoutChange}
          layouts={cLayouts} cols={ponitsContainer.cols} rowHeight={460}
        >
          {
            genViews(cChartList)
          }
        </ResponsiveReactGridLayout>
      );
    }
  }

  function genViews(_charts) {
    return _charts.map((chartId) => {
      return (<div style={{ width: '100%' }} key={chartId}>
        <View {...viewProps} title={chartId} chartId={chartId} />
      </div>);
    });
  }

  return (
    <div className={styles.main}>
      <div>
        <Spin tip="Loading..." spinning={loading}>
          {
          genReport(currentLayouts, chartList)
        }
        </Spin>
      </div>
    </div>
  );
}

ReportBoard.propTypes = {
  dispatch: PropTypes.func,
  reportboard: PropTypes.object,
};

function mapStateToProps(state) {
  return { reportboard: state.reportboard, loading: state.loading.models.reportboard };
}
export default connect(mapStateToProps)(ReportBoard);
