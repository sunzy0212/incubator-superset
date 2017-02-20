import { parse } from 'qs';
import { getReport, getCharts, getLayouts, setLayouts, queryCode, saveReport } from '../../services/dashboard';

const REPORT_PATH = '/dashboard/';
const EDIT_REPORT_PATH = '/dashboard/edit/';
const REPORTID_LENGTH = 23;
const MODE_READ = 'read';
const MODE_ALTER = 'alter';
export default {
  namespace: 'reportboard',
  state: {
    loading: false,
    status: MODE_READ,
    titleStatus: MODE_READ,
    report: {},
    layout: [],
    layouts: { lg: [
      { i: 'a', x: 0, y: 0, w: 2, h: 2 },
      { i: 'b', x: 5, y: 0, w: 2, h: 2, minW: 2, maxW: 2 },
      { i: 'c', x: 0, y: 2, w: 2, h: 2 },
    ] },
    charts: [{ type: 'bar', id: 'a' }, { type: 'line', id: 'b' }, { type: 'pie', id: 'c' }],
    ponitsContainer: { breakpoints: { lg: 996, md: 768, sm: 500, xs: 200, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        let index = pathname.indexOf(EDIT_REPORT_PATH);
        let reportId = '';
        let status = MODE_READ;
        if (index !== -1) {
          reportId = pathname.substr(index + EDIT_REPORT_PATH.length, REPORTID_LENGTH);
          status = MODE_ALTER;
        } else {
          index = pathname.indexOf(REPORT_PATH);
          if (index !== -1) {
            reportId = pathname.substr(index + REPORT_PATH.length, REPORTID_LENGTH);
            status = MODE_READ;
          }
        }

        if (reportId !== '') {
          dispatch({ type: 'setStatus', payload: { status } });
          dispatch({ type: 'queryReport', payload: { reportId } });
        }
      });
    },
  },
  effects: {
    *queryReport({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const report = yield call(getReport, parse(payload));
      const layouts = yield call(getLayouts, parse(payload));
      const charts = yield call(getCharts, parse(payload));
      if (charts.success) {
        yield put({
          type: 'renderReport',
          payload: {
            report: report.result,
            layout: layouts.result.layouts,
            charts: charts.result.charts,
          },
        });
        for (const chart in charts.result.charts) {
          yield put({
            type: 'query',
            payload: {
              ...chart,
            },
          });
        }
      }
      yield put({ type: 'hideLoading' });
    },

    *query({
      payload,
    }, { call, put }) {
      yield put({ type: 'showChartLoading' });
      const data = yield call(queryCode, parse({ q: payload.codeId,
        type: payload.type }));
      if (data.success) {
        yield put({
          type: 'renderChart',
          payload: {
            chartId: payload.id,
            data: data.result,
          },
        });
      }
    },

    *save({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const layouts = {
        reportId: payload.report.id,
        layouts: payload.layout,
      };
      const data = yield call(setLayouts, parse(layouts));
      if (data.success) {
          //
      }
      yield put({ type: 'hideLoading' });
    },

    *updateTitle({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(saveReport, parse(payload));
      if (data.success) {
        yield put({ type: 'saveTitle', payload });
      }
      yield put({ type: 'hideLoading' });
    },
  },
  reducers: {

    setStatus(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    showLoading(state) {
      return {
        ...state,
        loading: true,
      };
    },
    hideLoading(state) {
      return {
        ...state,
        loading: false,
      };
    },

    editTitle(state) {
      return {
        ...state,
        titleStatus: MODE_ALTER,
      };
    },

    saveTitle(state, action) {
      const report = state.report;
      report.name = action.payload.name;
      return {
        ...state,
        titleStatus: MODE_READ,
        report,
      };
    },
    breakpointChange(state, action) {
      return {
        ...state,
        //...action.payload,
        //ponitsContainer: { breakpoints: action.payload.breakpoints, cols: action.payload.cols },
      };
    },

    layoutChange(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    renderReport(state, action) {
      return {
        ...state,
        report: action.payload.report,
        layout: action.payload.layout,
        //...action.payload,   // 为了测试暂时伪造数据
      };
    },

    renderChart(state, action) {
      return {
        ...state,
        //...action.payload,  // 为了测试暂时伪造数据
      };
    },
  },
};
