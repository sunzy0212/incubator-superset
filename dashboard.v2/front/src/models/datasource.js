import { parse } from 'qs';
import { listDatasources, saveDataSource, deleteDataSource, showTables } from '../services/datasource';
import { listDataSets } from '../services/datasets';


export default {
  namespace: 'datasource',
  state: {
    loading: false,
    saveLoading: false,
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
      yield put({ type: 'showLoading' });
      const data = yield call(listDatasources, parse(payload));
      if (data.success) {
        yield put({
          type: 'listDatasources',
          payload: {
            datasources: data.result.datasources,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },

    *queryDatasets({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(listDataSets, parse(payload));
      if (data.success) {
        yield put({
          type: 'listDatasets',
          payload: {
            datasets: data.result.datasets,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },

    *save({
      payload,
    }, { call, put }) {
      // yield put({type: 'showSaveLoading'})
      const data = yield call(saveDataSource, parse(payload));
      if (data.success) {
        yield put({ type: 'queryDatasources' });
      }
      yield put({ type: 'hideSaveLoading' });
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
    showLoading(state) {
      return {
        ...state,
        loading: true,
      };
    },
    hideLoading(state) {
      return {
        ...state,
        item: {},
        loading: false,
      };
    },

    showSaveLoading(state) {
      return {
        ...state,
        saveLoading: true,
      };
    },
    hideSaveLoading(state) {
      return {
        ...state,
        saveLoading: false,
        modalVisible: false,
      };
    },

    showModal(state, action) {
      const data = action.payload;
      if (data.id === undefined || data.id === '') {
        return {
          ...state,
          modalVisible: true,
          dataSetType: data.dataSetType,
        };
      } else {
        const item = state.datasources.filter((element) => {
          return element.id === data.id;
        });
        return {
          ...state,
          item: item[0],
          modalVisible: true,
          dataSetType: item[0].type,
        };
      }
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

    deleteDataSources(state, action) {
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
