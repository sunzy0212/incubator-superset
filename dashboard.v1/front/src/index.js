import React from 'react'
import { render } from 'react-dom'
import  Dashboard  from './containers/Dashboard'
import  Editor from './containers/Editor'
import  Search from './containers/Search'
import  UserLogin from './containers/UserLogin'
import  Base from './containers/Base'

import { Router, Route, IndexRoute, browserHistory, hashHistory } from 'react-router'
const requireLogin = (nextState, replace, callback) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("replace to login");
        replace('/login');
    }
    callback();
};

render(
    <Router history={browserHistory}>
        <Route path="/" component={Base}>
            <IndexRoute component={Dashboard}/>
            <Route path="dashboard" component={Dashboard}/>
            <Route path="editor" component={Editor}/>
            {/*<Route path="Search" component={Search}/>*/}
        </Route>
        {/*<Route path="/login" component={UserLogin}/>*/}
    </Router>
    ,
    document.getElementById('app')
);
