import dva from 'dva';
import { browserHistory } from 'dva/router';
import { message } from 'antd';
import createLoading from 'dva-loading';
import './index.html';
import './index.less';

// 1. Initialize
const app = dva({
  history: browserHistory,
  onError(e) {
    message.error(e.message, /* duration */3);
  },
});

// 2. Plugins
// app.use({});
app.use(createLoading());
// 3. Model
app.model(require('./models/app'));
app.model(require('./models/datasets'));
app.model(require('./models/dashboard/dashboard'));
app.model(require('./models/dashboard/reportboard'));
app.model(require('./models/dashboard/editor'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
