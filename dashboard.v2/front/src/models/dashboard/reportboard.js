import { parse } from 'qs';
import _ from 'lodash';
import { message } from 'antd';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { getReport, getLayouts, setLayouts } from '../../services/dashboard';

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
    reflush: false,
    report: {},
    layouts: {},
    showTimePick: true,
    currentTimeRange: [],
    timeRange: { start: '', end: '' },
    ponitsContainer: { breakpoints: { lg: 996, md: 768, sm: 500, xs: 200, xxs: 0 },
      cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 } },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        let reportId = '';
        let status = MODE_READ;
        const date = query.date;
        let showTimePick = true;
        let currentTimeRange = [];
        let timeRange = { start: '', end: '' };
        if (date !== undefined && date !== '') {
          showTimePick = false;
          currentTimeRange = date;
          const start = new Date(_.replace('DATE 00:00:00+0800', 'DATE', date)).getTime();
          const end = new Date(_.replace('DATE 23:59:59+0800', 'DATE', date)).getTime();
          timeRange = { start, end };
        } else {
          const start = moment().add(-1, 'day').startOf('day');
          const end = moment().add(-1, 'day').endOf('day');
          currentTimeRange = [start, end];
          timeRange = { start: start.valueOf(), end: end.valueOf() };
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
          dispatch({ type: 'updateState', payload: { currentTimeRange, status, timeRange, showTimePick } });
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

    *updateLayout({}, { call, put, select }) {
      const reportboard = yield select(state => state.reportboard);
      const layouts = {
        reportId: reportboard.report.id,
        layouts: reportboard.layouts,
      };
      const data = yield call(setLayouts, parse(layouts));
      if (data.success) {
        message.success('保存成功！');
        yield put(routerRedux.push(`/dashboard/${reportboard.report.id}`));
      } else {
        message.error('保存失败！');
      }
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
      const chartId = action.payload.chartId;
      const layouts = state.layouts;

      let allreadyExist = false;
      layouts.forEach((elem) => {
        if (elem.chartId === chartId) {
          allreadyExist = true;
        }
      });

      if (allreadyExist) {
        message.warn('图表已添加，不能重复添加');
        return { ...state };
      } else {
        const newChart = {
          chartId,
          data: {
            i: chartId,
            x: layouts.length % 2 === 0 ? 0 : 6,
            y: Infinity,
            w: 6,
            h: 1,
            isDraggable: true,
            isResizable: true,
            minW: 4,
            maxW: 12,
            maxH: 1,
          },
        };

        layouts.push(newChart);

        return {
          ...state,
          layouts,
        };
      }
    },

    layoutChange(state, action) {
      const layouts = [];
      action.payload.layouts.forEach((elem) => {
        layouts.push({ chartId: elem.i, data: elem });
      });
      return {
        ...state,
        layouts,
      };
    },

    removeChart(state, action) {
      const chartId = action.payload.chartId;
      const layouts = state.layouts.filter((elem) => {
        return (elem.chartId !== chartId);
      });
      return {
        ...state,
        layouts,
      };
    },
    refreshChart(state, action) {
      let timeRange = state.timeRange;
      if (action.payload !== undefined && action.payload.timeRange !== undefined) {
        timeRange = action.payload.timeRange;
      }
      return {
        ...state,
        reflush: true,
        timeRange,
      };
    },

    cancelFlushFlag(state) {
      return {
        ...state,
        reflush: false,
      };
    },
  },
};
