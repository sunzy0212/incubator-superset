import { parse } from 'qs';
import { routerRedux } from 'dva/router';
import { listDatasources, saveDataSource, deleteDataSource, showTables } from '../services/datasource';
import { listDataSets } from '../services/datasets';


export default {
  namespace: 'datasource',
  state: {
    modalVisible: false,
    item: {},
    dataSetType: 'MYSQL',
    datasources: [],
    tables: [],
    datasets: [],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'queryDatasources' });
    },
  },
  effects: {
    *queryDatasources({
      payload,
    }, { call, put }) {
      const data = yield call(listDatasources, parse(payload));
      if (data.success) {
        yield put({
          type: 'listDatasources',
          payload: {
            datasources: data.result.datasources,
          },
        });
      }
    },

    *queryDatasets({
      payload,
    }, { call, put }) {
      const data = yield call(listDataSets, parse(payload));
      if (data.success) {
        yield put({
          type: 'listDatasets',
          payload: {
            datasets: data.result.datasets,
          },
        });
      }
    },

    *save({
      payload,
    }, { call, put }) {
      const data = yield call(saveDataSource, parse(payload));
      if (data.success) {
        yield put({ type: 'queryDatasources' });
        yield put(routerRedux.push('/datasource'));
      }
    },

    *delete({ payload }, { call, put }) {
      const data = yield call(deleteDataSource, parse(payload));
      if (data.success) {
        yield put({
          type: 'deleteDataSource',
          ...payload,
        });
      }
    },

    *loadTables({ payload }, { call, put }) {
      const data = yield call(showTables, parse(payload));
      if (data.success) {
        yield put({
          type: 'listTables',
          payload: {
            tables: data.result.tables,
          },
        });
      } else {
        console.log('show error');
      }
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

    listDatasources(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    listDatasets(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    listTables(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    deleteDataSource(state, action) {
      const newRecords = state.datasources.filter((element) => {
        return element.id !== action.id;
      });
      return {
        ...state,
        datasources: newRecords,
      };
    },
  },
};
