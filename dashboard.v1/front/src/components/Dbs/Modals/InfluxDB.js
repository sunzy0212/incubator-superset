import React, {Component, PropTypes} from "react"
import {observer} from "mobx-react";

@observer
export default class InfluxDB extends Component {

    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            type: "InfluxDB",
            Dataset: props.data == undefined ? {} : props.data,
            onOk : props.onOk,
            onCancel : props.onCancel,
            onTest : props.onTest
        }
    }

    getData(){
        let ob = {}
        let id = this.refs.form_id.value.trim()
        ob.name = this.refs.form_name.value.trim()
        ob.host = this.refs.form_host.value.trim()
        ob.dbName = this.refs.form_dbName.value.trim()
        ob.type = this.state.type
        return {"data":ob,"id":id}
    }

    saveDataset = () => {
        let res = this.state.onOk(this.getData())
    }
    testDataset(){
        let res = this.state.onTest(this.getData()["data"])
    }

    render() {
        return (
            <div>
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
                                       placeholder="http://localhost:8086/query"/>
                            </div>
                            <label htmlFor="form_port" className="col-xs-1 form-control-label">数据库名: </label>
                            <div className="col-xs-4">
                                <input type="text" className="form-control" id="form_dbName" ref="form_dbName"
                                       defaultValue={this.state.Dataset.dbName == undefined ? "" : this.state.Dataset.dbName}
                                       placeholder="db Name"/>
                            </div>
                        </div>

                        <div className="form-group row row-sm">
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