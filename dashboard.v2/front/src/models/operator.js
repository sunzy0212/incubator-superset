import { parse } from 'qs';
import _ from 'lodash';
import { getTemplates, postTemplate, deleteTemplate, updateTemplate, postCrontab, deleteCrontab } from '../services/operator';
import { addReport, addDir, updateDir } from '../services/dashboard';


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
      const { reporter } = payload;
      if (reporter.rules.length !== 0) {
        if (reporter.preDirId === '') {
          const dirData = yield call(addDir,
            parse({ type: 'REPORT', name: reporter.dirName || reporter.name, pre: 'ROOT' }));
          if (dirData.success) {
            reporter.preDirId = dirData.result.id;
            const data = yield call(updateTemplate, parse({ ...payload, reporter }));
            if (data.success) {
              yield put({
                type: 'queryTemplates',
              });
            }
          }
        } else {
          const dirData = yield call(updateDir,
            parse({ type: 'REPORT', name: reporter.dirName || reporter.name, pre: 'ROOT', id: reporter.preDirId }));
          if (dirData.success) {
            const data = yield call(updateTemplate, parse({ ...payload, reporter }));
            if (data.success) {
              yield put({
                type: 'queryTemplates',
              });
            }
          }
        }
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

