import React, { Component, PropTypes } from 'react';
import SweetAlert from 'sweetalert-react';
import fetch from 'isomorphic-fetch'
import { browserHistory } from 'react-router';
export default class Footer extends Component {
    static contextTypes = {
        store: PropTypes.object,
        config: PropTypes.object,
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
            if (parseInt(response.status) == 401) {
                throw new Error("401");
            }

            if (parseInt(response.status / 100) != 2) {
                throw new Error("Status != 200");
            }
            return response.json();
        }).then(()=> {
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
            if (parseInt(response.status) == 401) {
                throw new Error("401");
            }

            if (parseInt(response.status / 100) != 2) {
                throw new Error("Status != 200");
            }
            return response.json();
        }).then(data=> {
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
            console.log(e);
            that.context.notification.remove(_loading);
            if (e.message == "401") {

                localStorage.removeItem("token");
                browserHistory.push("/login?timeout");
                return
            }

            that.context.notification.add({
                message: "发生了错误，请稍后重试" + e,
                level: 'error',
                position: "tr",
                autoDismiss: 10,
            })
        });


    }

    render() {
        return (
            <div className="app-footer">
                <div className="p-a text-xs">
                    <div className="pull-right text-muted">
                        © Copyright <strong>Qiniu Pandora</strong> <span className="hidden-xs-down">- Built with Love v1.0.4</span>
                        <a><i className="fa fa-long-arrow-up p-x-sm"/></a>
                    </div>
                    <div className="nav">
                        <a className="nav-link">About</a>
                        <span className="text-muted"> - </span>
                        {/*<a className="nav-link label m-r-5" onClick={() => this.setState({ showUpload: true })}>*/}
                        {/*<i className="fa fa-cloud-upload fa-plus text-muted m-r-2"/>*/}
                        {/*上传布局*/}
                        {/*</a>*/}
                        {/*<a className="nav-link label download m-r-5"*/}
                        {/*onClick={() => this.setState({ showDownload: true })}>*/}
                        {/*<i className="fa fa-cloud-download fa-plus text-muted m-r-2"/>*/}
                        {/*下载布局*/}
                        {/*</a>*/}
                        <a className="nav-link label download m-r-5"
                           onClick={this.context.config.show}>
                            <i className="fa fa-cogs  text-muted m-r-2"/>
                            设置
                        </a>

                    </div>
                </div>


                <SweetAlert
                    show={this.state.showUpload}
                    title="云端数据上传"
                    onConfirm={this.handleUpload.bind(this)}
                    onCancel={this.handleUploadClose.bind(this)}
                    showCancelButton={true}
                    confirmButtonColor={"#DD6B55"}
                    confirmButtonText={"是的, 确认上传当前布局!"}
                    cancelButtonText="取消"
                    type={"warning"}

                />
                <SweetAlert
                    show={this.state.showDownload}
                    title="云端数据下载"
                    onConfirm={this.handleDownload.bind(this)}
                    onCancel={this.handleDownloadClose.bind(this)}
                    showCancelButton={true}
                    confirmButtonText={"下载云端布局"}
                    cancelButtonText="取消"
                    type={"info"}
                />
            </div>
        )
    }
}