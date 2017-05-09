import { parse } from 'qs';
import _ from 'lodash';
import { message } from 'antd';
import { getDataSet, getCode, saveCode, updateCode } from '../services/datasetApi';
import { getChart, saveChart, updateChart } from '../services/chartApi';
import { postQuerys, queryByCodeId } from '../services/queryApi';
import { getDirs, addDir } from '../services/dashboard';

const ANALYSOR_PATH = '/analysor';

export default {
  namespace: 'analysor',
  state: {
    code: {},
    chart: {},
    dataset: {},
    wheres: [], // wheres: [{ field: 'wf1', operator: '=', data: '数据' }],
    havings: [], // filters: [{ field: 'ff1', operator: '=', data: '数据' }],
    selectFields: [],
    metricFields: [],
    groupFields: [],
    timeField: {},
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
            dispatch({ type: 'initAnalysorByDatasetId', payload: { id } });
          }
          if (_.startsWith(pathname, `${ANALYSOR_PATH}/chart_`)) {
            const id = _.trimStart(pathname, `${ANALYSOR_PATH}/`);
            dispatch({ type: 'initAnalysorByChartId', payload: { id } });
          }
          dispatch({ type: 'queryDirs', payload: { type: 'chart' } });
        } else {
          dispatch({
            type: 'updateState',
            payload: {
              code: {},
              chart: {},
              dataset: {},
              wheres: [],
              havings: [],
              selectFields: [],
              metricFields: [],
              groupFields: [],
              timeField: {},
              rangeTimes: [],
              datas: [],
              dirs: [],
            },
          });
        }
      });
    },
  },
  effects: {

    *queryDirs({ payload }, { call, put }) {
      const data = yield call(getDirs, parse(payload));
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            dirs: data.result.dirs,
          },
        });
      }
    },

    *initAnalysorByDatasetId({
      payload,
    }, { call, put }) {
      const data = yield call(getDataSet, parse({ id: payload.id }));
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            dataset: data.result,
          },
        });
      } else {
        message.error('初始化分析器时错误');
      }
    },

    *initAnalysorByChartId({
      payload,
    }, { call, put }) {
      const data = yield call(getChart, parse({ id: payload.id }));
      if (data.success) {
        const chart = data.result;
        const data2 = yield call(getDataSet, parse({ id: chart.datasetId }));
        const data3 = yield call(getCode,
          parse({ datasetId: chart.datasetId, codeId: chart.codeId }));
        const data4 = yield call(queryByCodeId,
          parse({ codeId: chart.codeId, formatType: 'json' }));
        if (data2.success && data3.success) {
          const code = data3.result;
          yield put({
            type: 'updateState',
            payload: {
              chart,
              code,
              dataset: data2.result,
              wheres: code.wheres,
              havings: code.havings,
              selectFields: code.selectFields.filter((x) => { return x.id !== code.timeField.id; }),
              metricFields: code.metricFields,
              groupFields: code.groupFields.filter((x) => { return x.id !== code.timeField.id; }),
              timeField: code.timeField,
              rangeTimes: code.rangeTimes,
              datas: data4.result,
            },
          });
        }
      } else {
        message.error('初始化分析器时错误');
      }
    },

    *execute({
      payload,
    }, { call, put }) {
      yield put({ type: 'updateState', payload: { ...payload } });
      const data = yield call(postQuerys, parse({ formatType: 'json', code: { ...payload }, limit: 1000 }));
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            datas: data.result,
          },
        });
      } else {
        message.error('查询失败');
      }
    },

    *save({
      payload,
    }, { call, put, select }) {
      const analysorState = yield select(state => state.analysor);
      const { dataset, addOns, selectFields, metricFields, groupFields, timeField,
        rangeTimes } = analysorState;
      const data = yield call(saveCode, parse({
        datasetId: dataset.id,
        data: {
          name: payload.name,
          addOns,
          selectFields,
          metricFields,
          groupFields,
          timeField,
          rangeTimes,
        },
      }));
      if (data.success) {
        const data2 = yield call(saveChart, parse({
          title: payload.title,
          type: payload.type,
          codeId: data.result.id,
          dirId: payload.dirId,
          datasetId: dataset.id,
          xaxis: payload.xaxis,
          yaxis: payload.yaxis,
          lineTypes: payload.lineTypes,
          filters: payload.filters,
        }));

        if (data2.success) {
          yield put({
            type: 'updateState',
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
      const { code, chart, dataset, addOns, selectFields, metricFields, groupFields, timeField,
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
          timeField,
          rangeTimes,
        } }));
      if (data.success) {
        const data2 = yield call(updateChart, parse({
          id: chart.id,
          title: payload.title,
          type: payload.type,
          codeId: code.id,
          datasetId: dataset.id,
          dirId: payload.dirId,
          xaxis: payload.xaxis,
          yaxis: payload.yaxis,
          lineTypes: payload.lineTypes,
          filters: payload.filters,
        }));
        if (data2.success) {
          yield put({
            type: 'updateState',
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
        lineTypes: payload.lineTypes,
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
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },

};
