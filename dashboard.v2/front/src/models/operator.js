import { parse } from 'qs';
import _ from 'lodash';
import { getTemplates, postTemplate, deleteTemplate, updateTemplate, postCrontab, deleteCrontab } from '../services/operator';
import { addReport } from '../services/dashboard';


const OPERATOR_TEMPLATE_PATH = '/operator/template';

export default {
  namespace: 'operator',
  state: {
    templates: [],
  },
  subscriptions: {

    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (_.startsWith(pathname, OPERATOR_TEMPLATE_PATH)) {
          dispatch({ type: 'queryTemplates' });
        }
      });
    },

  },
  effects: {
    *queryTemplates({ payload }, { call, put }) {
      const data = yield call(getTemplates, parse(payload));
      if (data.success) {
        yield put({
          type: 'initState',
          payload: {
            templates: data.result.templates,
          },
        });
      }
    },

    *addTemplate({ payload }, { call, put }) {
      const report = yield call(addReport, parse(payload));
      if (report.success) {
        const reportId = report.result.id;
        const data = yield call(postTemplate, parse({ reportId, name: payload.name }));
        if (data.success) {
          yield put({
            type: 'queryTemplates',
          });
        }
      }
    },

    *updateTemplate({ payload }, { call, put }) {
      const data = yield call(updateTemplate, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryTemplates',
        });
      }
    },

    *removeTemplate({ payload }, { call, put }) {
      const data = yield call(deleteTemplate, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryTemplates',
        });
      }
    },

    *setCrontab({ payload }, { put }) {
      let cron = '';
      // mock
      cron = '* * * * * ?';
      payload.spec.rules.forEach((item) => {
        // 判断生成cron

      });

      if (payload.switch) {
        yield put({
          type: 'addCrontab',
          payload: { ...payload, cron },
        });
      } else {
        yield put({
          type: 'removeCrontab',
          payload,
        });
      }
    },

    *addCrontab({ payload }, { call, put }) {
      const data = yield call(postCrontab, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryTemplates',
        });
      }
    },

    *removeCrontab({ payload }, { call, put }) {
      const data = yield call(deleteCrontab, parse(payload));
      if (data.success) {
        yield put({
          type: 'queryTemplates',
        });
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

