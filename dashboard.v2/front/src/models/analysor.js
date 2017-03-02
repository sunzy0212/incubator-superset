import { parse } from 'qs';
import _ from 'lodash';
import { getDataSet } from '../services/datasets';
import { postQuerys, saveCode, saveChart, updateCode, updateChart } from '../services/analysor';

const ANALYSOR_PATH = '/analysor';

export default {
  namespace: 'analysor',
  state: {
    loading: false,
    code: {},
    chart: {},
    dataset: {},
    addOns: {
      wheres: [{ field: 'wf1', operator: '=', data: '数据' }, { field: 'wf2', operator: 'NOT', data: '数据2' }],
      havings: [],
      filters: [{ field: 'ff1', operator: '=', data: '数据' }, { field: 'ff2', operator: 'NOT', data: '数据2' }],
    },
    selectFields: [],
    metricFields: [],
    groupFields: [],
    timeField: '',
    rangeDatatime: '',
    operatorOptions: [{ name: 'not_in', alias: 'NOT IN' }, { name: 'in', alias: 'NOT IN' }, { name: 'equal', alias: '==' }],
    dayOptions: [{ name: 'day0', alias: '当前' }, { name: 'day1', alias: '1 天前' },
      { name: 'day7', alias: '7 天前' }, { name: 'day30', alias: '30 天前' }],
    datas: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (_.startsWith(pathname, ANALYSOR_PATH)) {
          if (_.startsWith(pathname, `${ANALYSOR_PATH}/dataset_`)) {
            const id = _.trimStart(pathname, `${ANALYSOR_PATH}/`);
            dispatch({ type: 'initAnalysor', payload: { id } });
          }
        }
      });
    },
  },
  effects: {
    *initAnalysor({
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

    *execute({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoading' });
      yield put({ type: 'initState', payload });
      const data = yield call(postQuerys, parse({ formatType: 'json' }));
      if (data.success) {
        yield put({
          type: 'initState',
          payload: {
            datas: data.result,
          },
        });
      }
      yield put({ type: 'hideLoading' });
    },

    *save({
      payload,
    }, { call, put, select }) {
      const analysorState = yield select(state => state.analysor);
      const { dataset, addOns, selectFields, metricFields, groupFields, timeField,
        rangeDatatime } = analysorState;
      const data = yield call(saveCode, parse({
        datasetId: dataset.id,
        data: {
          name: `code-${payload.name}`,
          querys: { addOns, selectFields, metricFields, groupFields, timeField, rangeDatatime },
        } }));
      if (data.success) {
        const data2 = yield call(saveChart, parse({
          title: `图表-${payload.name}`,
          codeId: data.result.id,
          xaxis: payload.xaxis,
          yaxis: payload.yaxis,
          type: payload.chartType,
        }));

        if (data2.success) {
          yield put({
            type: 'initState',
            payload: { code: data.result, chart: data2.result },
          });
        }
      }
    },

    *update({
      payload,
    }, { call, select }) {
      const analysorState = yield select(state => state.analysor);
      const { code, chart, dataset, addOns, selectFields, metricFields, groupFields, timeField,
        rangeDatatime } = analysorState;
      const data = yield call(updateCode, parse({
        codeId: code.id,
        datasetId: dataset.id,
        data: {
          name: code.name,
          querys: { addOns, selectFields, metricFields, groupFields, timeField, rangeDatatime },
        } }));
      if (data.success) {
        const data2 = yield call(updateChart, parse({
          id: chart.id,
          title: chart.title,
          codeId: code.id,
          xaxis: payload.xaxis,
          yaxis: payload.yaxis,
          type: payload.chartType,
        }));
        if (data2.success) {
          //
        }
      }
    },

    *saveOrUpdate({
      payload,
    }, { put, select }) {
      yield put({ type: 'showLoading' });
      const analysorState = yield select(state => state.analysor);
      const { code, chart } = analysorState;
      if (code.id === undefined || code.id === '') {
        yield put({ type: 'save', payload });
      } else {
        yield put({ type: 'update', payload });
      }

      yield put({ type: 'hideLoading' });
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

    initState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },

};
