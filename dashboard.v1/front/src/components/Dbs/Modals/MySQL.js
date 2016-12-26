import React, {Component, PropTypes} from "react"
import {observer} from "mobx-react";

@observer
export default class MySQL extends Component {

    constructor(props) {
        super(props)
        this.state = {
            type: "MySQL",
            Dataset: props.data == undefined ? {} : props.data,
            onOk : props.onOk,
            onCancel : props.onCancel,
            onTest : props.onTest
        }
    }

    getData = () => {
        let ob = {}
        let id = this.refs.form_id.value.trim()
        console.log("id=",id)
        ob.name = this.refs.form_name.value.trim()
        ob.host = this.refs.form_host.value.trim()
        ob.port = parseInt(this.refs.form_port.value.trim())
        ob.username = this.refs.form_username.value.trim()
        ob.password = this.refs.form_password.value.trim()
        ob.dbName = this.refs.form_dbName.value.trim()
        ob.type = this.state.type
        return {"data":ob,"id":id}
    }

    saveDataset=()=>{
        let res = this.state.onOk(this.getData())
    }
    testDataset=()=>{
        let res = this.state.onTest(this.getData()["data"])
    }
    render() {
        return (
            <div className="box">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={this.props.onCancel()}>
                        <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
                    </button>
                    <h4 className="modal-title">创建[{this.state.type}]数据源</h4>
                </div>
                <form role="form" onSubmit={this.saveDataset}>
                    <div className="modal-body">
                        <div className="form-group row row-sm">
                            <label htmlFor="from_name" className="col-xs-1 form-control-label">名称：</label>
                            <div className="col-sm-4">
                                <input type="text" className="form-control" ref="form_name" id="form_name"
                                       defaultValue={this.state.Dataset.name == undefined ? "" : this.state.Dataset.name}
                                       placeholder="you should have a name for this dataset"/>
                            </div>
                        </div>

                        <div className="form-group row row-sm">
                            <label htmlFor="form_host" className="col-xs-1 form-control-label">地址: </label>
                            <div className="col-xs-4">
                                <input type="text" className="form-control" id="form_host" ref="form_host"
                                       defaultValue={this.state.Dataset.host == undefined ? "" : this.state.Dataset.host}
                                       placeholder="host"/>
                            </div>
                            <label htmlFor="form_port" className="col-xs-1 form-control-label">端口: </label>
                            <div className="col-xs-4">
                                <input type="text" className="form-control" id="form_port" ref="form_port"
                                       defaultValue={this.state.Dataset.port == undefined ? "" : this.state.Dataset.port}
                                       placeholder="port"/>
                            </div>
                        </div>

                        <div className="form-group row row-sm">
                            <label htmlFor="form_username" className="col-xs-1 form-control-label">用户名: </label>
                            <div className="col-xs-4">
                                <input type="text" className="form-control" id="form_username"
                                       ref="form_username"
                                       defaultValue={this.state.Dataset.username == undefined ? "" : this.state.Dataset.username}
                                       placeholder="username"/>
                            </div>
                            <label htmlFor="form_password" className="col-xs-1 form-control-label">密码: </label>
                            <div className="col-xs-4">
                                <input type="password" className="form-control" id="form_password"
                                       ref="form_password"
                                       defaultValue={this.state.Dataset.password == undefined ? "" : this.state.Dataset.password}
                                       placeholder="password"/>
                            </div>
                        </div>

                        <div className="form-group row row-sm">
                            <label htmlFor="from_dbName" className="col-md-1 form-control-label">数据库名：</label>
                            <div className="col-xs-4">
                                <input type="text" className="form-control" id="form_dbName" ref="form_dbName"
                                       defaultValue={this.state.Dataset.dbName == undefined ? "" : this.state.Dataset.dbName}
                                       placeholder="your database name"/>
                            </div>
                            <a className="col-md-1 btn btn-success" onClick={this.testDataset}>测试</a>
                            <input type="hidden" ref="form_id"
                                   defaultValue={this.state.Dataset.id == undefined ? "" : this.state.Dataset.id}/>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn info" type="submit">保存</button>
                    </div>
                </form>
            </div>
        );
    }
}
