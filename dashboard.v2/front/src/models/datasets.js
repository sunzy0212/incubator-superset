import { parse } from 'qs';
import { saveDataSet, updateDataSet, getDataSet, deleteDataSet } from '../services/datasets';
import { getSchema } from '../services/datasource';


export default {
  namespace: 'datasets',
  state: {
    inited: false,
    modalVisibles: { toSave: false },
    loading: false,
    datasources: {},
    dataset: {},
    relationships: [],
    dimensions: [],
    measures: [{ name: 'total', alias: '总数' }, { name: 'avg', alias: '平均' },
      { name: 'min', alias: '最小' }, { name: 'max', alias: '最大' }],
    times: [],
  },
  subscriptions: {

  },
  effects: {
    *newDataSet({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(getSchema, parse({ id: payload.datasourceId,
        tableName: payload.name }));
      if (data.success) {
        yield put({
          type: 'generateFileds',
          payload: {
            schema: data.result,
            inited: true,
            datasource: { ...payload },
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },

    *initDataSet({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      const data = yield call(getDataSet, parse({ id: payload.id }));
      if (data.success) {
        yield put({
          type: 'initState',
          payload: {
            dataset: data.result,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },

    *saveOrUpdate({
      payload,
    }, { call, put, select }) {
      yield put({ type: 'showLoading' });
      const datasets = yield select(state => state.datasets);
      if (datasets.dataset.id === undefined || datasets.dataset.name === '') {
        const data = yield call(saveDataSet, parse({ name: payload.name }));
        if (data.success) {
          datasets.dataset = data.result;
          yield put({ type: 'updateState', payload: { dataset: data.result } });
        }
      }
      const data = yield call(updateDataSet, parse({
        id: datasets.dataset.id,
        dataset: {
          name: datasets.dataset.name,
          datasources: datasets.datasources,
          relationships: datasets.relationships,
          dimensions: datasets.dimensions,
          measures: datasets.measures,
          times: datasets.times,
          createTime: datasets.createTime,
        },
      }));
      if (data.success) {
        yield put({ type: 'updateState', payload: { dataset: data.result } });
      }

      yield put({ type: 'hideLoading' });
    },

    *delete({ payload }, { call, put }) {
      const data = yield call(deleteDataSet, parse(payload));
      if (data.success) {
        yield put({
          type: 'deleteDataSource',
          ...payload,
        });
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
        loading: false,
      };
    },

    toggleModal(state, action) {
      const modalVisibles = {
        ...state.modalVisibles,
        ...action.payload,
      };
      return {
        ...state,
        modalVisibles,
      };
    },

    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    initState(state, action) {
      const tmp = action.payload;
      return {
        ...state,
        dataset: tmp.dataset.dataset,
        relationships: tmp.dataset.relationships,
        datasources: tmp.dataset.datasources,
        dimensions: tmp.dataset.dimensions,
        measures: tmp.dataset.measures,
        times: tmp.dataset.times,
      };
    },

    generateFileds(state, action) {
      const res = action.payload.schema;
      const datasources = state.datasources;
      const dimensions = state.dimensions;
      datasources[res.datasourceId] = { datasourceId: res.datasourceId, table: res.table };
      res.fields.forEach((e) => {
        dimensions.push({
          datasetId: res.datasourceId,
          table: res.table,
          name: e.field,
          type: e.type });
      });

      return {
        ...state,
        datasources,
        dimensions,
      };
    },

  },
};
