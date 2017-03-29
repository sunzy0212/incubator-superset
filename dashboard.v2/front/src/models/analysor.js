import { parse } from 'qs';
import _ from 'lodash';
import { getDataSet } from '../services/datasets';
import { postQuerys, saveCode, saveChart, updateCode, updateChart } from '../services/analysor';
import { getDirs, addDir } from '../services/dashboard';


const ANALYSOR_PATH = '/analysor';

export default {
  namespace: 'analysor',
  state: {
    loading: false,
    code: {},
    chart: {},
    dataset: {},
    wheres: [], // wheres: [{ field: 'wf1', operator: '=', data: '数据' }],
    havings: [], // filters: [{ field: 'ff1', operator: '=', data: '数据' }],
    selectFields: [],
    metricFields: [],
    groupFields: [],
    timeFields: [],
    rangeTimes: [],

    operatorOptions: [{ name: 'NIN', alias: 'NOT IN' }, { name: 'IN', alias: 'IN' }, { name: 'EQ', alias: '=' },
      { name: 'NQ', alias: '<>' }, { name: 'GT', alias: '>' }, { name: 'LT', alias: '<' },
      { name: 'GE', alias: '>=' }, { name: 'LE', alias: '<=' }, { name: 'LIKE', alias: 'LIKE' }],
    dayOptions: [{ name: 'day0', alias: '当前' }, { name: 'day1', alias: '1 天前' },
      { name: 'day7', alias: '7 天前' }, { name: 'day30', alias: '30 天前' }],
    datas: [],
    dirs: [],
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
        dispatch({ type: 'queryDirs', payload: { type: 'chart' } });
      });
    },
  },
  effects: {

    *queryDirs({ payload }, { call, put }) {
      const data = yield call(getDirs, parse(payload));
      if (data.success) {
        yield put({
          type: 'initState',
          payload: {
            dirs: data.result.dirs,
          },
        });
      }
    },


    *initAnalysor({
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

    *execute({
      payload,
    }, { call, put }) {
      yield put({ type: 'initState', payload: { ...payload } });
      const data = yield call(postQuerys, parse({ formatType: 'json', code: { ...payload } }));
      if (data.success) {
        yield put({
          type: 'initState',
          payload: {
            datas: data.result,
          },
        });
      }
    },

    *save({
      payload,
    }, { call, put, select }) {
      const analysorState = yield select(state => state.analysor);
      const { dataset, addOns, selectFields, metricFields, groupFields, timeFields,
        rangeTimes } = analysorState;
      const data = yield call(saveCode, parse({
        datasetId: dataset.id,
        data: {
          name: payload.name,
          addOns,
          selectFields,
          metricFields,
          groupFields,
          timeFields,
          rangeTimes,
        },
      }));
      if (data.success) {
        const data2 = yield call(saveChart, parse({
          title: payload.title,
          type: payload.type,
          codeId: data.result.id,
          dirId: payload.dirId,
          xaxis: payload.xaxis,
          yaxis: payload.yaxis,
          filters: payload.filters,
        }));

        if (data2.success) {
          yield put({
            type: 'initState',
            payload: { code: data.result, chart: data2.result },
          });
          yield put({ type: 'queryDirs', payload: { type: 'chart' } });
        }
      }
    },

    *update({
      payload,
    }, { put, call, select }) {
      const analysorState = yield select(state => state.analysor);
      const { code, chart, dataset, addOns, selectFields, metricFields, groupFields, timeFields,
        rangeTimes } = analysorState;
      const data = yield call(updateCode, parse({
        codeId: code.id,
        datasetId: dataset.id,
        data: {
          name: code.name,
          addOns,
          selectFields,
          metricFields,
          groupFields,
          timeFields,
          rangeTimes,
        } }));
      if (data.success) {
        const data2 = yield call(updateChart, parse({
          id: chart.id,
          title: payload.title,
          type: payload.type,
          codeId: code.id,
          dirId: payload.dirId,
          xaxis: payload.xaxis,
          yaxis: payload.yaxis,
          filters: payload.filters,
        }));
        if (data2.success) {
          yield put({
            type: 'initState',
            payload: { code: data.result, chart: data2.result },
          });
          yield put({ type: 'queryDirs', payload: { type: 'chart' } });
        }
      }
    },

    *saveOrUpdate({
      payload,
    }, { put, call }) {
      const saveChartProps = {
        dirId: payload.dir.id,
        title: payload.title,
        xaxis: payload.xaxis,
        yaxis: payload.yaxis,
        filters: payload.filters,
        type: payload.type,
      };

      if (payload.dir.id === 'toAddId') {
        const dirData = yield call(addDir,
          parse({ type: 'CHART', name: payload.dir.name, pre: payload.dir.pre }));
        if (dirData.success) {
          saveChartProps.dirId = dirData.result.id;
          yield put({ type: 'saveOrUpdateChart', payload: { ...saveChartProps } });
        }
      } else {
        yield put({ type: 'saveOrUpdateChart', payload: { ...saveChartProps } });
      }
    },

    *saveOrUpdateChart({
      payload,
    }, { put, select }) {
      const analysorState = yield select(state => state.analysor);
      const { code } = analysorState;
      if (code.id === undefined || code.id === '') {
        yield put({ type: 'save', payload });
      } else {
        yield put({ type: 'update', payload });
      }
    },
  },

  reducers: {
    initState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },

};
