import React from 'react';
import { Router, Route, IndexRedirect } from 'dva/router';
import Main from './routes/App';
import Datasets from './routes/Datasets';
import Dashboard from './routes/Dashboard';
import ReportBoard from './routes/ReportBoard';
import DashboardEditor from './routes/DashboardEditor';
import Login from './routes/Login';
import Editor from './routes/Editor';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Main}>
        <IndexRedirect to="/dashboard" />
        <Route path="datasets" component={Datasets} />
        <Route path="dashboard" component={Dashboard} >
          <Route path=":id" component={ReportBoard} />
        </Route>
        <Route path="dashboard/edit" component={DashboardEditor} >
          <Route path=":id" component={ReportBoard} />
        </Route>
        <Route path="editor" component={Editor} />
      </Route>
      <Route path="login" component={Login} />
      <Route path="report" component={ReportBoard} />
    </Router>
  );
}

export default RouterConfig;
