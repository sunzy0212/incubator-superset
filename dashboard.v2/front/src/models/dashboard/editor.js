import { parse } from 'qs';

export default {
  namespace: 'dashboardEditor',
  state: {
    loading: false,
    layouts: [
      { i: 'a', x: 0, y: 0, w: 4, h: 4 },
      { i: 'b', x: 18, y: 0, w: 4, h: 4, minW: 4, maxW: 4 },
      { i: 'c', x: 0, y: 14, w: 4, h: 4 },
    ],
    charts: [{ type: 'bar', id: 'a' }, { type: 'line', id: 'b' }, { type: 'line', id: 'c' }],
    ponitsContainer: { breakpoints: { lg: 996, md: 768, sm: 500, xs: 200, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } },

  },
  subscriptions: {
    setup({ dispatch }) {
      // dispatch({ type: 'queryUser' });
    },
  },
  effects: {},
  reduces: {

  },
};
