import { parse } from 'qs';
import _ from 'lodash';
import { getReport, getLayouts } from '../../services/dashboard';

const DASHBOARD_PATH = '/dashboard/';
const DASHBOARD_EDIT_PATH = '/dashboard/edit/';
const REPORTBOARD_PATH = '/reportboard/';
const REPORTID_LENGTH = 23;
const MODE_READ = 'read';
const MODE_ALTER = 'alter';
export default {
  namespace: 'reportboard',
  state: {
    status: MODE_READ,
    report: {},
    layouts: {},
    chartList: [],
    currentLayouts: { lg: [] },
    currentTimeRange: '',
    timeRange: { start: '', end: '' },
    ponitsContainer: { breakpoints: { lg: 996, md: 768, sm: 500, xs: 200, xxs: 0 },
      cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 } },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        let reportId = '';
        let status = MODE_READ;
        const date = query[date];
        let currentTimeRange = '';
        if (date !== undefined && date !== '') {
          currentTimeRange = date;
        }
        if (_.startsWith(pathname, DASHBOARD_EDIT_PATH)) {
          reportId = pathname.substr(DASHBOARD_EDIT_PATH.length, REPORTID_LENGTH);
          status = MODE_ALTER;
        } else if (_.startsWith(pathname, DASHBOARD_PATH)) {
          reportId = pathname.substr(DASHBOARD_PATH.length, REPORTID_LENGTH);
        } else if (_.startsWith(pathname, REPORTBOARD_PATH)) {
          reportId = pathname.substr(REPORTBOARD_PATH.length, REPORTID_LENGTH);
        }
        if (reportId !== '') {
          dispatch({ type: 'queryReport', payload: { reportId } });
          dispatch({ type: 'updateState', payload: { currentTimeRange, status } });
        }
      });
    },
  },
  effects: {
    *queryReport({
      payload,
    }, { call, put }) {
      const report = yield call(getReport, parse(payload));
      const layouts = yield call(getLayouts, parse(payload));
      yield put({
        type: 'updateState',
        payload: {
          report: report.result,
          layouts: layouts.result.layouts,
        },
      });
    },
  },

  reducers: {

    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    addChartToReport(state, action) {
      return {
        ...state,
        ...action.payload,
        addChartId: action.payload.chartId,
      };
    },

    layoutChange(state, action) {
      return {
        ...state,
        ...action.payload,
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
  },
};
