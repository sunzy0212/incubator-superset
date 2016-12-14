import React from 'react'
import {render} from 'react-dom'
import  Dashboard  from './containers/Dashboard'
import  Editor from './containers/Editor'
import  Dbs from "./containers/Dbs"
import  Search from './containers/Search'
import  UserLogin from './containers/UserLogin'
import  Base from './containers/Base'

import {Router, Route, IndexRoute, browserHistory, hashHistory} from 'react-router'
const requireLogin = (nextState, replace, callback) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("replace to login");
        replace('/login');
    }
    callback();
};

render(
    <Router history={hashHistory}>
        <Route path="/" component={Base}>
            <Route path="dbset" component={Dbs}/>
            <IndexRoute component={Dashboard}/>
            <Route path="dashboard" component={Dashboard}/>
            <Route path="editor" component={Editor}>
                <Route path="/:codeId"component={Editor}/>
            </Route>
            {/*<Route path="Search" component={Search}/>*/}
        </Route>
        {/*<Route path="/login" component={UserLogin}/>*/}
    </Router>
    ,
    document.getElementById('app')
);
