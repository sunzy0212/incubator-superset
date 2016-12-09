import React, { Component, PropTypes }from 'react';
import Aside  from '../components/Base/Aside'
import Provider from "../utils/Provider";
import BaseStore from '../stores/base-store'
import NotificationSystem from 'react-notification-system'
// import DevTools from 'mobx-react-devtools';

export default class Base extends Component {
    static childContextTypes = {
        notification: PropTypes.object,
        config: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            showConfig: false,
        }
    }

    getChildContext() {
        return {
            notification: {
                add: this.addNotification.bind(this),
                remove: this.removeNotification.bind(this),
            },
            config: {
                show: this.showConfig.bind(this)
            }
        }
    }

    addNotification(options) {
        return this.refs.notificationSystem.addNotification(options)
    }

    removeNotification(options) {
        this.refs.notificationSystem.removeNotification(options)
    }

    showConfig() {
        this.setState({ showConfig: true })
    }

    hideConfig() {
        this.setState({ showConfig: false })
    }

    render() {
        const state = new BaseStore();
        return (
            <Provider store={state}>

                <div>
                    <div id="aside" className="app-aside modal fade folded md show-text nav-dropdown">
                        <Aside />
                    </div>
                    {this.props.children}
                    <div id="black" className="modal-backdrop fade in"
                        style={{ display: this.state.showConfig ? "block" : "none" }}></div>
                    <NotificationSystem ref="notificationSystem"/>
                    {/*<DevTools />*/}
                    <div className="modal fade in" style={{ display: this.state.showConfig ? "block" : "none" }}>
                        <div className="bottom white b-t" style={{ height: "240px" }}>
                            <div className="row-col">
                                <a className="pull-right text-muted text-lg p-a-sm m-r-sm"
                                    onClick={this.hideConfig.bind(this) }>×</a>
                                <div className="p-a b-b">
                                    <span className="h5">设置</span>
                                </div>
                                <div className="row-row">
                                    <div className="row-body p-a">
                                        <div className="form-group">
                                            <label>InfluxDB Host</label>
                                            <input type="password" className="form-control" required=""/>
                                        </div>
                                        <div className="row m-b">
                                            <div className="col-sm-6">
                                                <label>User Name</label>
                                                <input type="password" className="form-control" required="" />
                                            </div>
                                            <div className="col-sm-6">
                                                <label>Password</label>
                                                <input type="password" className="form-control" required="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Provider>
        )
    }
}