import React from 'react';
import { Router, Route ,IndexRedirect,browserHistory} from 'dva/router';
import Main from './routes/App';

import Datasets from "./routes/Datasets";

import Dashboard from "./routes/Dashboard";
import Login from "./routes/Login";
import Editor from "./routes/Editor";
function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Main}>
        <IndexRedirect to="/dashboard" />
        <Route path="/datasets" component={Datasets} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/editor" component={Editor} />
      </Route>
      <Route path="/login" component={Login} />
    </Router>
  );
}

export default RouterConfig;
