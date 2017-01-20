import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Spin, Button } from 'antd';
import Header from '../components/dashboard/header';
import View from '../components/dashboard/view';
import styles from './ReportBoard.less';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const props = {
  className: 'layout',
  items: 50,
  rowHeight: 400,
};

function ReportBoard({ dispatch, reportboard }) {
  const { status, titleStatus, loading, report, layout, layouts, charts,
    ponitsContainer } = reportboard;
  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  function onLayoutChange(layout) {
    dispatch({
      type: 'reportboard/layoutChange',
      payload: { layout },
    });
  }
  function onBreakpointChange(breakpoint, cols) {
    dispatch({
      type: 'reportboard/breakpointChange',
      payload: { breakpoint, cols },
    });
  }

  const headerProps = {
    status,
    titleStatus,
    report,
    editTitle() {
      dispatch({ type: 'reportboard/editTitle' });
    },
    updateTitle(name) {
      dispatch({
        type: 'reportboard/updateTitle',
        payload: { name, dirId: report.dirId, reportId: report.id },
      });
    },
    onSave() {
      dispatch({
        type: 'reportboard/save',
        payload: {
          report,
          layout,
        },
      });
    },
  };

  function genReport() {
    if (charts.length === 0) {
      return (
        <div>
          <Button type="dashed" size="large" onClick={handleChange} icon="plus" style={{ width: '100px' }} />
        </div>
      );
    } else {
      return (
        <ResponsiveReactGridLayout
          {...props}
          onLayoutChange={onLayoutChange} onBreakpointChange={onBreakpointChange}
          breakpoints={ponitsContainer.breakpoints}
          cols={ponitsContainer.cols}
          layouts={{ md: layout }}
        >
          {
            genViews(charts)
          }
        </ResponsiveReactGridLayout>
      );
    }
  }


  function genViews(_charts) {
    return _charts.map((item) => {
      // return <div key={item.id} style={{'background-color': '#f72f41'}}>
      // <div className={styles.box} style={{'background-color': '#f8f8f8'}}>{item.type}</div></div>
      return (<div key={item.id}>
        <View title={item.type} />
      </div>);
    });
  }

  return (
    <div className={styles.main}>
      <Header {...headerProps} />
      <div>
        <Spin tip="Loading..." spinning={loading}>
          {
          genReport(layouts, charts)
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
  return { reportboard: state.reportboard };
}
export default connect(mapStateToProps)(ReportBoard);
