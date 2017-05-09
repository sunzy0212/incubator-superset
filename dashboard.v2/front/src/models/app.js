import { parse } from 'qs';
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { login, checkLogin, logout } from '../services/app';


export default {
  namespace: 'app',
  state: {
    login: false,
    loginButtonLoading: false,
    siderFold: localStorage.getItem('antdAdminSiderFold') === 'true',
    darkTheme: localStorage.getItem('antdAdminDarkTheme') === 'false',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname !== '/login') {
          const sessionId = localStorage.getItem('qiniu-report-sessionId') || '';
          dispatch({ type: 'check', payload: { sessionId } });
        }
      });
    },
  },
  effects: {

    *check({
      payload,
    }, { call, put }) {
      const data = yield call(checkLogin, parse(payload));
      if (data.success) {
        if (data.result.login) {
          yield put({ type: 'updateState', payload: { login: data.result.login } });
        } else {
          yield put(routerRedux.push('/login'));
        }
      }
    },

    *login({
      payload,
    }, { call, put }) {
      yield put({ type: 'showLoginButtonLoading' });
      const data = yield call(login, parse(payload));
      if (data.success) {
        const res = data.result;
        if (res.status === 'ok') {
          message.success('登陆成功');
          localStorage.setItem('qiniu-report-sessionId', res.sessionId);
          yield put({
            type: 'loginSuccess',
            payload: {
              sessionId: res.sessionId,
            },
          });
          yield put(routerRedux.push('/'));
        } else {
          message.error('登陆失败,账户密码不正确！');
          yield put({
            type: 'loginFail',
          });
        }
      }
    },

    *logout({
      payload,
    }, { call, put }) {
      const data = yield call(logout, parse(payload));
      if (data.success) {
        yield put({
          type: 'logoutSuccess',
        });
      }
    },
    *switchSider({
      payload,
    }, { put }) {
      console.log('switchSider');
      yield put({
        type: 'handleSwitchSider',
      });
    },
    *changeTheme({
      payload,
    }, { put }) {
      console.log('changeTheme');
      yield put({
        type: 'handleChangeTheme',
      });
    },
  },
  reducers: {

    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    loginSuccess(state, action) {
      return {
        ...state,
        ...action.payload,
        login: true,
        loginButtonLoading: false,
      };
    },
    logoutSuccess(state) {
      return {
        ...state,
        login: false,
      };
    },
    loginFail(state) {
      return {
        ...state,
        login: false,
        loginButtonLoading: false,
      };
    },
    showLoginButtonLoading(state) {
      return {
        ...state,
        loginButtonLoading: true,
      };
    },
    handleSwitchSider(state) {
      localStorage.setItem('antdAdminSiderFold', !state.darkTheme);
      return {
        ...state,
        siderFold: !state.siderFold,
      };
    },
    handleChangeTheme(state) {
      localStorage.setItem('antdAdminDarkTheme', !state.darkTheme);
      return {
        ...state,
        darkTheme: !state.darkTheme,
      };
    },
  },
};
