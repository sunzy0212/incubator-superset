import { parse } from 'qs';
import { saveDataSet, updateDataSet, getDataSet, deleteDataSet, getTableData } from '../services/datasets';
import { getSchema, listDatasources, showTables } from '../services/datasource';


export default {
  namespace: 'datasets',
  state: {
    inited: false,
    modalSpace: { dimensions: false, measures: false },
    modalVisibles: { toSave: false },
    renameModalVisibles: false,
    tableTreeVisibles: false,
    transformDateVisible: false,
    loading: false,
    datasources: {},
    dataset: {},
    relationships: [],
    currentRecord: {},
    dimensions: [],
    measures: [],
    times: [],
    datasourceList: [],
    tables: [],
    tableData: [],
    currentDatasetId: '',
    currentDatasetName: '',
  },
  subscriptions: {

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
            datasourceList: data.result.datasources,
          },
        });
      }
    },
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
        if (payload.datasetName !== undefined) {
          yield put({
            type: 'saveOrUpdate',
            payload: {
              name: payload.datasetName,
            },
          });
        }
      }
      yield put({ type: 'hideTableTree' });
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
          yield put({ type: 'updateState', payload: { dataset: data.result, currentDatasetId: datasets.dataset.id, currentDatasetName: payload.name } });
        }
      }
      const cTimes = [];
      datasets.dimensions.forEach((ele) => {
        if (ele.type === 'timestamp') {
          cTimes.push(ele);
        }
      });
      const data = yield call(updateDataSet, parse({
        id: datasets.dataset.id,
        dataset: {
          name: datasets.dataset.name,
          datasources: datasets.datasources,
          relationships: datasets.relationships,
          dimensions: datasets.dimensions,
          measures: datasets.measures,
          times: cTimes,
          createTime: datasets.createTime,
        },
      }));
      if (data.success) {
        console.log(data.result);
        yield put({ type: 'updateState', payload: { dataset: data.result, currentDatasetId: datasets.dataset.id } });
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

    *getTableData({ payload }, { call, put }) {
      const data = yield call(getTableData, parse(payload));
      if (data.success) {
        yield put({
          type: 'listTableData',
          payload: {
            tableData: data.result,
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
        loading: false,
      };
    },

    showRenameModal(state, action) {
      let currentSpace = { dimensions: true, measures: false };
      if (action.payload.title === '度量') {
        currentSpace = { dimensions: false, measures: true };
      }
      return {
        ...state,
        renameModalVisibles: true,
        currentRecord: action.payload.data,
        modalSpace: currentSpace,
      };
    },

    updateName(state, action) {
      if (action.payload.isDimensions === false) {
        state.measures = action.payload.data;
      } else {
        state.dimensions = action.payload.data;
      }
      return {
        ...state,
        renameModalVisibles: false,
      };
    },

    hideRenameModal(state) {
      return {
        ...state,
        renameModalVisibles: false,
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
    listDatasources(state, action) {
      return {
        ...state,
        ...action.payload,
        tableTreeVisibles: true,
      };
    },
    listTables(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    listTableData(state, action) {
      return {
        ...state,
        tableData: action.payload.tableData,
      };
    },
    hideTableTree(state) {
      return {
        ...state,
        tableTreeVisibles: false,
      };
    },
    showTransformDate(state, action) {
      return {
        ...state,
        transformDateVisible: true,
        currentRecord: action.payload.record,
      };
    },
    hideTransformDate(state) {
      return {
        ...state,
        transformDateVisible: false,
      };
    },
    saveTransformDate(state) {
      return {
        ...state,
        transformDateVisible: false,
      };
    },
    generateFileds(state, action) {
      const res = action.payload.schema;
      const datasources = state.datasources;
      const dimensions = state.dimensions;
      datasources[res.datasourceId] = { datasourceId: res.datasourceId, table: res.table };
      res.fields.forEach((e) => {
        dimensions.push({
          datasource: { datasourceId: res.datasourceId, table: res.table },
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
