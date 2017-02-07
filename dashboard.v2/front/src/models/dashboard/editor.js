import { parse } from 'qs';

export default {
  namespace: 'dashboardEditor',
  state: {
    loading: false,
    isShow: true,
    charts: [{ type: 'bar', id: 'a' }, { type: 'line', id: 'b' }, { type: 'line', id: 'c' }],

  },
  subscriptions: {
    setup({ dispatch }) {
      // dispatch({ type: 'queryUser' });
    },
  },
  effects: {

  },
  reduces: {
    triggle(state) {
      return {
        ...state,
        isShow: !state.isShow,
      };
    },

  },
};
