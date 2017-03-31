import React from 'react';
import { Router } from 'dva/router';

import Operator from './routes/Operator.js';

const cached = {};
function registerModel(app, model) {
  if (!cached[model.namespace]) {
    app.model(model);
    cached[model.namespace] = 1;
  }
}

function RouterConfig({ history, app }) {
  const routes = {
    path: '/',
    indexRoute: { onEnter: (nextState, replace) => replace('dashboard') },
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        registerModel(app, require('./models/app'));
        cb(null, require('./routes/App'));
      });
    },
    childRoutes: [

      {
        path: '/login',
        name: 'login',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/Login'));
          });
        },
      },

      {
        path: '/datasource',
        name: 'datasource',
        onEnter() {
          registerModel(app, require('./models/datasource'));
          registerModel(app, require('./models/datasets'));
        },
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/Datasource'));
          });
        },
      },

      {
        path: '/datasource/config',
        name: 'datasourceConfig',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./components/datasource/datasourceEditor'));
          });
        },
      },

      {
        path: '/datasets',
        name: 'datasets',
        onEnter() {
          registerModel(app, require('./models/datasets'));
        },
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/Datasets'));
          });
        },
        childRoutes: [
          {
            path: ':id',
            name: 'dataset',
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                registerModel(app, require('./models/datasets'));
                cb(null, require('./routes/Datasets'));
              });
            },
          },
        ],
      },

      {
        path: '/dashboard',
        name: 'dashboard',
        onEnter() {
          registerModel(app, require('./models/dashboard/dashboard'));
          registerModel(app, require('./models/dashboard/reportboard'));
        },
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/Dashboard'));
          });
        },

        childRoutes: [
          {
            path: ':id',
            name: 'reportboard',
            onEnter() {
              registerModel(app, require('./models/dashboard/reportboard'));
            },
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                cb(null, require('./routes/ReportBoard'));
              });
            },
          },
        ],
      },

      {
        path: '/dashboard/edit',
        name: 'dashboardEditor',
        onEnter() {
          registerModel(app, require('./models/dashboard/editor'));
        },
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/DashboardEditor'));
          });
        },
        childRoutes: [
          {
            path: ':id',
            name: 'reportboard',
            onEnter() {
              registerModel(app, require('./models/dashboard/reportboard'));
            },
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                cb(null, require('./routes/ReportBoard'));
              });
            },
          },
        ],
      },

      {
        path: '/reportboard/:id',
        name: 'singleReportboard',
        onEnter() {
          registerModel(app, require('./models/dashboard/reportboard'));
        },
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/ReportBoard'));
          });
        },
      },

      {
        path: '/analysor',
        name: 'analysor',
        onEnter() {
          registerModel(app, require('./models/analysor'));
        },
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/Analysor'));
          });
        },
        childRoutes: [
          {
            path: ':id',
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                cb(null, require('./routes/Analysor'));
              });
            },
          },
        ],
      },


      {
        path: '/operator',
        name: 'operator',
        onEnter() {
          registerModel(app, require('./models/operator'));
        },

        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./routes/Operator'));
          });
        },
        childRoutes: [
          {
            path: 'template',
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                cb(null, require('./components/operator/template'));
              });
            },
          },
        ],
      },

    ],
  };

  return <Router history={history} routes={routes} />;
  // return (
  //   <Router history={history}>
  //     <Route path="/" component={Main}>
  //       <IndexRedirect to="/dashboard" />
  //       <Route path="datasource" component={Datasource} />
  //       <Route path="dashboard" component={Dashboard} >
  //         <Route path=":id" component={ReportBoard} />
  //       </Route>
  //       <Route path="dashboard/edit" component={DashboardEditor} >
  //         <Route path=":id" component={ReportBoard} />
  //       </Route>
  //       <Route path="editor" component={Editor} />
  //     </Route>
  //     <Route path="login" component={Login} />
  //     <Route path="report" component={ReportBoard} />
  //   </Router>
  // );
}

export default RouterConfig;
