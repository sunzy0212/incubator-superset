import { parse } from 'qs';
import _ from 'lodash';
import { routerRedux } from 'dva/router';
import { message, notification } from 'antd';
import { saveDataSet, updateDataSet, getDataSet, getDatasetData, deleteDataSet } from '../services/datasetApi';
import { getSchema } from '../services/datasourceApi';

const DATASET_PATH = '/datasets';
const DATASET_INDEX = 10;
const DATASETID_LENGTH = 24;
export default {
  namespace: 'datasets',
  state: {
    dataset: {},
    datasources: {},
    relationships: [],
    dimensions: [],
    measures: [],
    times: [],
    tableData: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (_.startsWith(pathname, DATASET_PATH)) {
          if (_.startsWith(pathname, `${DATASET_PATH}/dataset_`)) {
            const id = pathname.substr(DATASET_INDEX, DATASETID_LENGTH);
            dispatch({ type: 'queryDataset', payload: { id } });
          }
        } else {
          dispatch({
            type: 'updateState',
            payload: {
              dataset: {},
              datasources: {},
              relationships: [],
              dimensions: [],
              measures: [],
              times: [],
              tableData: [],
            },
          });
        }
      });
    },
  },
  effects: {
    *queryDataset({
      payload,
    }, { call, put }) {
      const data = yield call(getDataSet, parse(payload));
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            dataset: data.result,
            datasources: data.result.datasources,
            relationships: data.result.relationships,
            dimensions: data.result.dimensions,
            measures: data.result.measures,
            times: data.result.times,
          },
        });
      } else {
        message.error('获取数据集失败');
      }
    },

    *newDataSet({
      payload,
    }, { call, put }) {
      const data = yield call(getSchema, parse({ id: payload.datasourceId,
        tableName: payload.name }));
      if (data.success) {
        yield put({
          type: 'generateFileds',
          payload: {
            schema: data.result,
            datasource: { ...payload },
          },
        });

        if (payload.datasourceType === 'MONGODB') {
          notification.info({
            message: '添加Schema-free数据源说明',
            duration: 20,
            description: '您添加的数据表是自描述或者Schema-free的，' +
            '默认不会在左侧生成字段列表。您可以保存数据集后再加载表数据，' +
            '在字段栏工具上添加字段到左侧字段列表中。',
          });
        }
      }
    },

    *initDataSet({
      payload,
    }, { call, put }) {
      const data = yield call(getDataSet, parse({ id: payload.id }));
      if (data.success) {
        yield put({
          type: 'initState',
          payload: {
            dataset: data.result,
          },
        });
      }
    },

    *saveOrUpdate({
      payload,
    }, { call, put, select }) {
      const datasets = yield select(state => state.datasets);
      if (datasets.dataset.id === undefined || datasets.dataset.name === '') {
        const data = yield call(saveDataSet, parse({
          name: payload.name,
          datasources: datasets.datasources,
          relationships: datasets.relationships,
          dimensions: datasets.dimensions,
          measures: datasets.measures,
          times: datasets.times,
        }));
        if (data.success) {
          yield put(routerRedux.push(`/datasets/${data.result.id}`));
        } else {
          message.error('保存失败');
        }
      } else {
        const data = yield call(updateDataSet, parse({
          id: datasets.dataset.id,
          dataset: {
            name: payload.name,
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
        } else {
          message.error('更新失败');
        }
      }
    },

    *queryDatasetData({ payload }, { call, put }) {
      const data = yield call(getDatasetData, parse(payload));
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            tableData: data.result,
          },
        });
      } else {
        message.error('加载数据失败');
      }
    },

    *delete({ payload }, { call, put }) {
      const data = yield call(deleteDataSet, parse(payload));
      if (data.success) {

      } else {
        message.error('删除失败');
      }
    },

  },
  reducers: {
    updateName(state, action) {
      const { record, title } = action.payload;
      const dimensions = state.dimensions;
      const measures = state.measures;
      const times = state.times;

      if (title === '维度') {
        dimensions.forEach((elem) => {
          if (record.id === elem.id) {
            elem.alias = record.alias;
          }
        });
        times.forEach((elem) => {
          if (record.id === elem.id) {
            elem.alias = record.alias;
          }
        });
      }
      if (title === '度量') {
        measures.forEach((elem) => {
          if (record.id === elem.id) {
            elem.alias = record.alias;
          }
        });
      }
      return {
        ...state,
        dimensions,
        measures,
        times,
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
        dataset: tmp.dataset,
        relationships: tmp.dataset.relationships,
        datasources: tmp.dataset.datasources,
        dimensions: tmp.dataset.dimensions,
        measures: tmp.dataset.measures,
        times: tmp.dataset.times,
      };
    },

    saveTransformDate(state, action) {
      const { record } = action.payload;
      const dimensions = state.dimensions.filter(x => x.id !== record.id);
      const times = state.times.filter(x => x.id !== record.id);
      times.push({ ...Object.assign(record), type: 'timestamp' });
      return {
        ...state,
        dimensions,
        times,
      };
    },

    saveTransformToNumber(state, action) {
      const { record } = action.payload;
      const dimensions = state.dimensions.map((elem) => {
        if (elem.id === record.id) {
          elem.type = 'number';
        }
        return elem;
      });
      return {
        ...state,
        dimensions,
      };
    },

    saveTransformToString(state, action) {
      const { record } = action.payload;
      const dimensions = state.dimensions.map((elem) => {
        if (elem.id === record.id) {
          elem.type = 'string';
        }
        return elem;
      });
      return {
        ...state,
        dimensions,
      };
    },

    deleteField(state, action) {
      const { record } = action.payload;
      const dimensions = state.dimensions.filter(elem => elem.id !== record.id);
      const times = state.times.filter(elem => elem.id !== record.id);
      return {
        ...state,
        dimensions,
        times,
      };
    },

    addField(state, action) {
      const { record } = action.payload;
      if (record.alias === undefined || record.alias === '') {
        record.alias = record.name;
      }
      const dimensions = state.dimensions;
      dimensions.push(record);
      return {
        ...state,
        dimensions,
      };
    },

    saveMeasureUnit(state, action) {
      const { record, title } = action.payload;
      const dimensions = state.dimensions;
      const measures = state.measures;
      const times = state.times;

      if (title === '维度') {
        dimensions.forEach((elem) => {
          if (record.id === elem.id) {
            elem.unit = record.unit;
          }
        });
        times.forEach((elem) => {
          if (record.id === elem.id) {
            elem.unit = record.unit;
          }
        });
      }
      if (title === '度量') {
        measures.forEach((elem) => {
          if (record.id === elem.id) {
            elem.unit = record.unit;
          }
        });
      }
      return {
        ...state,
        dimensions,
        measures,
        times,
      };
    },
    generateFileds(state, action) {
      const res = action.payload.schema;
      const times = state.times;
      const datasources = state.datasources;
      const dimensions = state.dimensions;
      const measures = state.measures;
      const dataset = state.dataset;

      dataset.name = action.payload.datasource.name;

      datasources[res.tableId] = {
        tableId: res.tableId,
        datasourceId: res.datasourceId,
        table: res.table,
      };

      res.fields.forEach((e) => {
        if (e.name !== '*') {
          if (e.isMeasure) {
            measures.push({ ...Object.assign(e), alias: e.name, tableId: res.tableId });
          } else if (e.type === 'timestamp') {
            times.push({ ...Object.assign(e), alias: e.name, tableId: res.tableId });
          } else {
            dimensions.push({ ...Object.assign(e), alias: e.name, tableId: res.tableId });
          }
        }
      });

      return {
        ...state,
        datasources,
        dimensions,
      };
    },
  },
};
