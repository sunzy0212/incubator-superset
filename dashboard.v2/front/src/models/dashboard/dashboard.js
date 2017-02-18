import { parse } from 'qs';
import { getDirs, openDir } from '../../services/dashboard';

export default {
  namespace: 'dashboard',
  state: {
    loading: false,
    isShow: true,
    modalVisible: false,
    dirs: [],
    reports: {},
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'queryDirs' });
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

    *openDir({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(openDir, parse(payload));
      if (data.success) {
        yield put({
          type: 'listReports',
          payload: {
            dirId: payload.dirId,
            reports: data.result.reports,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
  },
  reducers: {
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

    listReports(state, action) {
      const tmpReports = state.reports;
      tmpReports[action.payload.dirId] = action.payload.reports;
      return {
        ...state,
        reports: tmpReports,
      };
    },
  },
};

