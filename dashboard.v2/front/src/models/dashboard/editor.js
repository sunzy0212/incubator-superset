import { parse } from 'qs';
import { message } from 'antd';
import { getDirs, setLayouts, getChartsByDirId, saveReport } from '../../services/dashboard';

export default {
  namespace: 'dashboardEditor',
  state: {
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

    *getChartsByDirId({
      payload,
    }, { call, put }) {
      const data = yield call(getChartsByDirId, parse(payload));
      if (data.success) {
        yield put({
          type: 'listAllCharts',
          payload: {
            charts: data.result.charts,
          },
        });
      }
    },
    *updateTitle({
      payload,
    }, { call }) {
      const data = yield call(saveReport, parse(payload));
      if (data.success) {
        // message.success('保存成功！');
      } else {
        message.success('保存失败！！！');
      }
    },
  },
  reducers: {
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
  },
};
