import React from 'react';
import { Router } from 'dva/router';

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
            registerModel(app, require('./models/app'));
            cb(null, require('./routes/Login'));
          });
        },
      },

      {
        path: '/datasource',
        name: 'datasource',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            registerModel(app, require('./models/datasource'));
            cb(null, require('./routes/Datasource'));
          });
        },
      },

      {
        path: '/datasource/config',
        name: 'datasourceConfig',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            registerModel(app, require('./models/datasource'));
            cb(null, require('./components/datasource/datasourceEditor'));
          });
        },
      },

      {
        path: '/datasets',
        name: 'datasets',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            registerModel(app, require('./models/datasets'));
            cb(null, require('./routes/Datasets'));
          });
        },
      },

      {
        path: '/dashboard',
        name: 'dashboard',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            // app.model(require('./models/dashboard/dashboard'));
            registerModel(app, require('./models/dashboard/dashboard'));
            cb(null, require('./routes/Dashboard'));
          });
        },

        childRoutes: [
          {
            path: ':id',
            name: 'reportboard',
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                registerModel(app, require('./models/dashboard/reportboard'));
                cb(null, require('./routes/ReportBoard'));
              });
            },
          },
        ],
      },

      {
        path: '/dashboard/edit',
        name: 'dashboardEditor',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            registerModel(app, require('./models/dashboard/dashboard'));
            registerModel(app, require('./models/dashboard/editor'));
            cb(null, require('./routes/DashboardEditor'));
          });
        },
        childRoutes: [
          {
            path: ':id',
            name: 'reportboard',
            getComponent(nextState, cb) {
              require.ensure([], (require) => {
                registerModel(app, require('./models/dashboard/reportboard'));
                cb(null, require('./routes/ReportBoard'));
              });
            },
          },
        ],
      },

      {
        path: '/analysor',
        name: 'analysor',
        getComponent(nextState, cb) {
          require.ensure([], (require) => {
            // app.model(require('./models/dashboard/dashboard'));
            registerModel(app, require('./models/analysor'));
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
