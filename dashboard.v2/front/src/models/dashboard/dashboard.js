import { parse } from 'qs';
import { getDirs, openDir, addReport, getAllReports, addDir, deleteDir } from '../../services/dashboard';

export default {
  namespace: 'dashboard',
  state: {
    loading: false,
    isShow: true,
    modalVisible: false,
    modalCreateVisible: false,
    dirs: [],
    reports: [],
    currentDir: {},
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'queryDirs' });
      dispatch({ type: 'getAllReports' });
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
    *addReport({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(addReport, parse(payload));
      if (data.success) {
        yield put({
          type: 'getAllReports',
          payload: {
            dirId: payload.dirId,
            name: data.name,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
    *addDir({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(addDir, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryDirs',
          payload: {
            dirs: data.dirs,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
    *deleteDir({ payload }, { call, put }) {
      const data = yield call(deleteDir, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryDirs',
          ...payload,
        });
      }
    },
  },
  reducers: {
    addReport(state) {
      return {
        ...state,
        modalVisible: true,
      };
    },
    addDir(state) {
      return {
        ...state,
        modalCreateVisible: false,
      };
    },
    showDirModal(state, obj) {
      return {
        ...state,
        modalCreateVisible: true,
        currentDir: obj.payload.dir,
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
    hideCreateModal(state) {
      return {
        ...state,
        modalCreateVisible: false,
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
    listAllReports(state, action) {
      return {
        ...state,
        ...action.payload,
        modalVisible: false,
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

