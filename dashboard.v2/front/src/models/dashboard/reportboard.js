import { parse } from 'qs';
import { getReport, getLayouts, queryCode, saveReport } from '../../services/dashboard';
import { getChartData, getCodeData } from '../../services/reportboard';
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
    modalVisible: false,
    report: {},
    layouts: {},
    timeRange: { start: '', end: '' },
    ponitsContainer: { breakpoints: { lg: 996, md: 768, sm: 500, xs: 200, xxs: 0 },
      cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 } },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
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
      yield put({
        type: 'renderReport',
        payload: {
          report: report.result,
          layouts: layouts.result.layouts,
        },
      });
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

    *getChartData({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(getChartData, parse(payload));
      const chartToCode = {
        codeId: data.result.codeId,
        type: data.result.type,
      };
      const codeData = yield call(getCodeData, parse(chartToCode));
      if (data.success && codeData.success) {
        yield put({
          type: 'initChartData',
          payload: {
            chartData: data.result,
            codeData: codeData.result,
          },
        });
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

    showModal(state) {
      return {
        ...state,
        modalVisible: true,
      };
    },
    hideModal(state) {
      return {
        ...state,
        modalVisible: false,
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
    initChartData(state, action) {
      return {
        ...state,
        chartData: action.payload.chartData,
        codeData: action.payload.codeData,
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
    addChartToReport(state, action) {
      return {
        ...state,
        ...action.payload,
        addChartId: action.payload.chartId,
      };
    },
    breakpointChange(state) {
      return {
        ...state,
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
        layouts: action.payload.layouts,
      };
    },

    renderLayouts(state, action) {
      return {
        ...state,
        layouts: action.payload.layouts,
      };
    },
    refreshChart(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    renderChart(state) {
      return {
        ...state,
      };
    },
  },
};
