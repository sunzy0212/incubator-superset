import React, { Component, PropTypes } from 'react';
import SweetAlert from 'sweetalert-react';
import $ from 'jquery';
import fetch from 'isomorphic-fetch'
export default class Dashboard extends Component {
    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object
    };

    static propTypes = {
        type: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            showUpload: false,
            showDownload: false
        }

    }

    handleUpload() {
        console.log("handleUpload");
        let that = this;
        let _loading = this.context.notification.add({
            message: "正在向云端上传中。。。",
            level: 'warning',
            position: "tr",
            autoDismiss: 5,
        });

        this.setState({ showUpload: false });

        fetch("/api/layout", {
            method: "POST",
            body: JSON.stringify({
                layout: that.context.store.layout.toJS(),
                dataSet: that.context.store.getDataSet()
            }),
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'JWT ' + localStorage.getItem("token")
            })

        }).then(response => {
            if (parseInt(response.status == 401)) {
                throw new Error("401");
            }

            if (parseInt(response.status / 100) != 2) {
                throw new Error("Status != 200");
            }

            return response.json();
        }).then(() => {
            that.context.notification.remove(_loading);
            that.context.notification.add({
                message: "已经成功上传布局至云端",
                level: 'success',
                position: "tr",
                autoDismiss: 10,
            });
        }).catch(e => {
            console.log(e);
            that.context.notification.remove(_loading);
            that.context.notification.add({
                message: "发生了错误，请稍后重试" + e,
                level: 'error',
                position: "tr",
                autoDismiss: 10,
            })
        });


    }
    handleUploadClose() {
        this.setState({ showUpload: false })
    }
    handleDownloadClose() {
        this.setState({ showDownload: false })
    }
    handleDownload() {
        console.log("handleDownload");
        let that = this;
        let _loading = this.context.notification.add({
            message: "正在从云端下载中。。。",
            level: 'warning',
            position: "tr",
            autoDismiss: 5,
        });

        this.setState({ showDownload: false });

        fetch("/api/layout", {
            method: "GET",
            headers: new Headers({
                Accept: 'application/json',
                Authorization: 'JWT ' + localStorage.getItem("token")
            })

        }).then(response => {

            if (parseInt(response.status == 401)) {
                throw new Error("401");
            }



            if (parseInt(response.status / 100) != 2) {
                throw new Error("Status != 200");
            }
            return response.json();
        }).then(data => {
            that.context.store.updateData(data);
            that.context.notification.remove(_loading);
            that.context.notification.add({
                message: "已经从云端下载最新的布局",
                level: 'success',
                position: "tr",
                autoDismiss: 10,
            });
            window.location.reload()
        }).catch(e => {
            console.log("error...");
            that.context.notification.remove(_loading);
            that.context.notification.add({
                message: "发生了错误，请稍后重试" + e,
                level: 'error',
                position: "tr",
                autoDismiss: 10,
            })
        });


    }

    handleSetTheme() {
        if (this.context.store.theme) {
            $("body").addClass("dark");
            $(".switch").addClass("moon").removeClass("sunny")
        }
        else {
            $("body").removeClass("dark");
            $(".switch").removeClass("moon").addClass("sunny")
        }
        this.context.store.setTheme()

    }

    handleEditor() {
        this.context.store.editorLayout()
    }

    render() {
        return (
            <div className="app-header white box-shadow">
                <div className="navbar">
                    <a className="navbar-item pull-left hidden-lg-up">
                        <i className="material-icons"></i>
                    </a>


                    <ul className="nav navbar-nav pull-right">
                        {/*头像*/}
                        {/*<li className="nav-item dropdown">*/}
                        {/*<a className="nav-link clear">*/}
                        {/*<span className="avatar w-32">*/}
                        {/*<img src="/static/assets/images/a1.jpg"/>*/}

                        {/*<i className="on b-white bottom"/>*/}
                        {/*</span>*/}
                        {/*</a>*/}
                        {/*</li>*/}
                    </ul>

                    <div className="collapse navbar-toggleable-sm" id="collapse">
                        <div className="pull-right pull-none-sm navbar-item v-m">
                        </div>
                        {this.props.type == "dashboard"
                            ? (
                                <ul className="nav navbar-nav">
                                    <li className="nav-item dropdown">
                                        <a className="nav-link" onClick={() => this.setState({ showUpload: true }) }>
                                            <i className="fa fa-cloud-upload fa-plus text-muted m-r-2"/>
                                            上传布局
                                        </a>
                                    </li>
                                    <SweetAlert
                                        show={this.state.showUpload}
                                        title="云端数据上传"
                                        onConfirm={this.handleUpload.bind(this) }
                                        onCancel={this.handleUploadClose.bind(this) }
                                        showCancelButton={true}
                                        confirmButtonText={"确认上传当前布局"}
                                        cancelButtonText="取消"
                                        type={"info"}
                                        />
                                    <li className="nav-item dropdown">
                                        <a className="nav-link" onClick={() => this.setState({ showDownload: true }) }>
                                            <i className="fa fa-cloud-download fa-plus text-muted m-r-2"/>
                                            下载布局
                                        </a>
                                    </li>
                                    <SweetAlert
                                        show={this.state.showDownload}
                                        title="云端数据下载"
                                        onConfirm={this.handleDownload.bind(this) }
                                        onCancel={this.handleDownloadClose.bind(this) }
                                        showCancelButton={true}
                                        confirmButtonText={"下载云端布局"}
                                        cancelButtonText="取消"
                                        type={"info"}
                                        />
                                </ul>

                            ) :
                            null}
                    </div>
                </div>
            </div>
        )
    }
}