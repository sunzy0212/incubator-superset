import { parse } from 'qs';
import { message } from 'antd';
import { getDirs, openDir, addReport, getAllReports, addDir, deleteDir, deleteReport } from '../../services/dashboard';

export default {
  namespace: 'dashboard',
  state: {
    modalVisible: false,
    deleteModalVisible: false,
    modalCreateVisible: false,
    dirs: [],
    reports: [],
    currentDir: {},
    addChartId: '',
    isShowHeader: false,
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
      const data = yield call(getDirs, parse(payload));
      if (data.success) {
        yield put({
          type: 'listDirs',
          payload: {
            dirs: data.result.dirs,
          },
        });
      }
    },
    *openDir({
      payload,
    }, { call, put }) {
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
    },
    *getAllReports({
      payload,
    }, { call, put }) {
      const data = yield call(getAllReports, parse(payload));
      if (data.success) {
        yield put({
          type: 'listAllReports',
          payload: {
            reports: data.result.reports,
          },
        });
      }
    },
    *addReport({
      payload,
    }, { call, put }) {
      const data = yield call(addReport, parse(payload));
      if (data.success) {
        yield put({
          type: 'getAllReports',
        });
      }
    },
    *addDir({
      payload,
    }, { call, put }) {
      const data = yield call(addDir, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryDirs',
          payload: {
            type: 'report',
          },
        });
      } else {
        message.error('目录已经存在');
      }
    },
    *deleteReport({
      payload,
    }, { call, put }) {
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

