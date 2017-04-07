import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Spin, Button } from 'antd';
import View from '../components/dashboard/view';
import styles from './ReportBoard.less';

const ResponsiveReactGridLayout = WidthProvider(Responsive);


function ReportBoard({ history, dispatch, loading, reportboard }) {
  const { status, report, layouts, timeRange,
    ponitsContainer } = reportboard;

  const tmpLayouts = layouts.map((item) => {
    return item.data;
  });


  function onLayoutChange(clayouts) {
    dispatch({
      type: 'reportboard/layoutChange',
      payload: { layouts: clayouts },
    });
  }

  const viewProps = {
    status,
    report,
    timeRange,
    getChartData(chartId) {
      dispatch({
        type: 'reportboard/getChartData',
        payload: { cId: chartId },
      });
    },
    removeChart(chartId) {
      dispatch({
        type: 'reportboard/removeChart',
        payload: { chartId },
      });
    },
  };

  function genReport() {
    if (layouts.length === 0) {
      return (
        <div className={styles.addView}>
          {status === 'read' ?
            <div>
              <Button ghost type="danger" size="large" icon="plus" onClick={() => history.push(`/dashboard/edit/${report.id}`)} />
              <br />
              <p>赶紧来制作报表吧 ！</p>
            </div>
            :
            <div>
              <h3>请展开左边👈的目录，拖拽图表到这里哦！</h3>
            </div>
          }
        </div>
      );
    } else {
      const currentLayouts = { lg: tmpLayouts, md: tmpLayouts, sm: tmpLayouts };
      return (
        <ResponsiveReactGridLayout
          onLayoutChange={onLayoutChange}
          layouts={currentLayouts} cols={ponitsContainer.cols} rowHeight={460}
        >
          {
            layouts.map((item) => {
              const chartId = item.chartId;
              return (<div style={{ width: '100%' }} key={chartId}>
                <View {...viewProps} title={chartId} chartId={chartId} />
              </div>);
            })
          }
        </ResponsiveReactGridLayout>
      );
    }
  }

  return (
    <div className={styles.main}>
      {
        loading ? <Spin tip="Loading..." size="large" /> : genReport()
      }
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
