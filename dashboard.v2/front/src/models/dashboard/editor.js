import { parse } from 'qs';
import { getDirs, getAllReports, setLayouts, getChartsByDirId } from '../../services/dashboard';

export default {
  namespace: 'dashboardEditor',
  state: {
    loading: false,
    isShow: true,
    dirs: [],
    charts: [],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'queryDirs',
        payload: {
          type: 'chart',
        } });
    },
  },
  effects: {
    *queryDirs({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(getDirs, parse(payload));
      if (data.success) {
        yield put({
          type: 'listDirs',
          payload: {
            dirs: data.result.dirs,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
    *updateLayout({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const layouts = {
        reportId: payload.reportId,
        layouts: payload.layouts,
      };
      const data = yield call(setLayouts, parse(layouts));
      if (data.success) {
        // todo
      }
      yield put({ type: 'hideLoading' });
    },
    *getAllReports({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(getAllReports, parse(payload));
      if (data.success) {
        yield put({
          type: 'listAllReports',
          payload: {
            reports: data.result.reports,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
    *getChartsByDirId({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(getChartsByDirId, parse(payload));
      if (data.success) {
        yield put({
          type: 'listAllCharts',
          payload: {
            charts: data.result.charts,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
  },
  reducers: {
    triggle(state) {
      return {
        ...state,
        isShow: !state.isShow,
      };
    },
    listDirs(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    listAllCharts(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    hideLoading(state) {
      return {
        ...state,
        loading: false,
      };
    },

  },
};
