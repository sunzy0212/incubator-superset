import React, {Component, PropTypes}from 'react';
import ReactDOM from 'react-dom'
import { observer } from "mobx-react";
import DatasetModal from "./DatasetModal"

import {ajax} from '../../utils/DecodeData'

const DBOption = [{label: "test", value: "http://127.0.0.1:8000/datasets"}];


@observer
export default class DataSetsSelect extends Component {
    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            Reset: false,
            SortFlag: false,
            DBOption: DBOption,
            Datasets: []
        }
    }

    componentWillMount(){
        this.listDataset()
    }

    callBack() {
        this.listDataset()
    }

    componentWillUpdate(nextProps, onextState) {
        //this.listDataset()
        console.log("componentWillUpdate-DataSetsSelect")
    }

    componentWillReceiveProps(nextProps) {
        this.listDataset()
        console.log("componentWillReceiveProps- DataSetsSelect")
    }

    listDataset = () => {
        let that = this;
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url: this.context.store.hosts + "/datasets",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {

                let dbs = data.datasets.map(function (item) {
                    let ob = {};
                    ob.id = item.id;
                    ob.name = item.name;
                    ob.type = item.type;
                    ob.host = item.host;
                    ob.port = item.port;
                    ob.dbName = item.dbName;
                    ob.username = item.username;
                    ob.password = item.password;
                    ob.createTime = item.createTime;
                    return ob;
                });
                that.setState({
                    Datasets: dbs
                })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    deleteDataset(id) {
        console.log(id)
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url: this.context.store.hosts + "/datasets/" + id,
            type: 'delete',
            contentType: 'application/json; charset=utf-8'
        });
        this.listDataset()
    };

    editDataset(item) {
        let _type = "MYSQL"
        ReactDOM.render(
            <DatasetModal type={_type} show={true} item={item} reset={() => this.callBack()}/>,
            document.getElementById("dataset-modal")
        );
    };

    sortByCreateTime() {
        let flag = this.state.SortFlag
        console.log(this.state.Datasets instanceof Array)
        this.setState({
            SortFlag: !flag,
            Datasets: this.state.Datasets.sort(function (a, b) {
                if (flag) {
                    return a.createTime > b.createTime
                } else {
                    return a.createTime < b.createTime
                }
            })
        });
    }

    getDataSet() {
        let that = this
        if (this.state.Datasets.length === 0) {
            return <tr>
                <td>请创建数据源</td>
            </tr>
        }
        let i = 1
        return this.state.Datasets.map(function (item) {
            return (
                <tr key={item.id}>
                    <th>{i++}</th>
                    <th>{item.name == undefined ? item.id : item.name}</th>
                    <th>{item.type}</th>
                    <th>{item.host}</th>
                    <th>{item.port}</th>
                    <th>{item.dbName}</th>
                    <th>{item.createTime}</th>
                    <th><a className="fa fa-edit" onClick={() => that.editDataset(item)}/> <a className="fa fa-trash-o"
                                                                                              onClick={() => that.deleteDataset(item.id)}/>
                    </th>
                </tr>
            )
        });
    }

    render() {
        return (
            <div style={{height: "100%"}}>
                <div className="box">
                    <div className="box-header">
                        <h2>总共：{this.state.Datasets.length} 个数据源</h2>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered m-a-0">
                            <thead>
                            <tr>
                                <th>序号</th>
                                <th>名称</th>
                                <th>类型</th>
                                <th>地址</th>
                                <th>端口</th>
                                <th>数据库</th>
                                <th>修改时间 <a className="fa fa-sort" onClick={() => this.sortByCreateTime()}/></th>
                                <th>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.getDataSet()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}
