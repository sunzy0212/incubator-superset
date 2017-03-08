import { parse } from 'qs';
import { getDirs, openDir, addReport, getAllReports, addDir, deleteDir, deleteReport } from '../../services/dashboard';

export default {
  namespace: 'dashboard',
  state: {
    loading: false,
    isShow: true,
    modalVisible: false,
    deleteModalVisible: false,
    modalCreateVisible: false,
    dirs: [],
    reports: [],
    currentDir: {},
    addChartId: '',
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'queryDirs',
        payload: {
          type: 'report',
        } });
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
            type: 'report',
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },
    *deleteReport({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(deleteReport, parse(payload));
      if (data.success) {
        yield put({
          type: 'getAllReports',
        });
        yield put({
          type: 'hideDeleteModal',
          ...payload,
        });
      }
      yield put({ type: 'hideLoading' });
    },
    *deleteDir({ payload }, { call, put }) {
      const data = yield call(deleteDir, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryDirs',
          payload: {
            type: 'report',
          },
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
    showDeleteModal(state) {
      return {
        ...state,
        deleteModalVisible: true,
      };
    },
    hideDeleteModal(state) {
      return {
        ...state,
        deleteModalVisible: false,
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

