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
      let cron = '* * * * * ?';

      // 根据前端的级联选项去生成调度规则生成适用后端的crontab表达式
      const tempCron = ['*', '*', '*', '*', '*', '?'];
      const rules = payload.rules;
      if (rules.length > 0 && rules[0] === 'day') {
        if (rules.length === 2) {
          tempCron[0] = '0';
          tempCron[1] = '0';
          tempCron[2] = _.trimStart(rules[1], 'h');
        }
        if (rules.length === 3) {
          tempCron[0] = '0';
          tempCron[1] = _.trimStart(rules[2], 'm');
        }
        if (rules.length === 4) {
          tempCron[0] = _.trimStart(rules[3], 's');
        }
      } else {
        console.log('not suppor yet');
      }

      cron = _.join(tempCron, ' ');


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

