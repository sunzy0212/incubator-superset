import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import fetch from 'isomorphic-fetch'
import  NotificationSystem from 'react-notification-system'
export  default  class UserLogin extends Component {
    static contextTypes = {
        notification: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            username_error: "",
            password_error: "",
            non_field_errors: ""


        }
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value.substr(0, 32) });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value.substr(0, 32) });
    }

    addNotification(options) {
        return this.refs.notificationSystem.addNotification(options)
    }

    clearError() {
        this.setState({
            username_error: "",
            password_error: "",
            non_field_errors: "",
        })
    }

    handleSubmit() {
        console.log("hello")
        this.clearError()
        let that = this;
        fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: that.state.username,
                password: that.state.password
            }),
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            })

        }).then(response => {
            if (response.status / 100 != 2) {
                response.json().then(data =>
                    that.setState({
                        username_error: "username" in data ? data.username : "",
                        password_error: "password" in data ? data.password : "",
                        non_field_errors: "non_field_errors" in data ? data.non_field_errors : "",
                    })
                );
                throw new Error("Status != 200");
            }
            return response.json();
        })
            .then(data =>localStorage.setItem("token", data.jwt))
            .then(() => browserHistory.push("/dashboard"))
            .catch(e => console.log("Oops, error", e));
    }

    render() {
        if ("timeout" in this.props.location.query) {
            this.addNotification({
                message: "身份验证已过期，请重新登录",
                level: 'error',
                position: "tr",
                autoDismiss: 10,
            });
            console.log("heh")
        }
        return (
            <div className="app">
                <div className="dark bg-auto w-full ">
                    <div className="fade-in-right-big smooth pos-rlt ">
                        <div className="center-block w-xxl w-auto-xs p-y-md ">
                            <div className="navbar">
                                <div className="pull-center">
                                    <a className="navbar-brand ">
                                        <span className="hidden-folded inline ">Dashboard</span>
                                    </a>
                                </div>
                            </div>
                            <div className="p-a-md box-color r box-shadow-z1 text-color m-a">
                                <div name="form">
                                    <div className="md-form-group float-label">
                                        <input type="email"
                                               className={`md-input ${this.state.username.length > 0 ? "focus" : ""} ${this.state.username_error.length > 0 ? "error focus" : ""}`}
                                               required=""
                                               onChange={this.handleUsernameChange.bind(this)}
                                        />
                                        <label>账户名 {this.state.username_error}</label>
                                    </div>
                                    <div className="md-form-group float-label">
                                        <input type="password"
                                               className={`md-input ${this.state.password.length > 0 || this.state.non_field_errors.length > 0 ? "focus" : ""} ${this.state.password_error.length > 0 ? "error focus" : ""}`}
                                               onChange={this.handlePasswordChange.bind(this)}
                                               required=""/>
                                        <label>密码 {this.state.password_error} </label>
                                    </div>
                                    <div className="m-b-md">
                                        <label className="md-check">
                                            <input type="checkbox"/>
                                            <i className="primary"/> 3天内自动登录</label>
                                    </div>
                                    <p className="error help"> {this.state.non_field_errors} </p>
                                    <button className="btn primary btn-block p-x-md"
                                            onClick={this.handleSubmit.bind(this)}>登录
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationSystem ref="notificationSystem"/>
            </div>
        )
    }
}
