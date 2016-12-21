import React, {Component, PropTypes}from 'react';
import ReactDOM from 'react-dom'
import Modal from "react-modal"
import { observer } from "mobx-react";
import DatasetModal from "./DatasetModal"

import {ajax} from '../../utils/DecodeData'

const DBOption = [{label: "test", value: "http://127.0.0.1:8000/datasets"}];
const customStyles = {
    content: {
        top: '50%',
        left: '53%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '240px',
    }
};

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
            Datasets: [],
            modalIsOpen: false,
            toDeleteId:""
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

    popDeleteAction=(id)=>{
        this.setState({
            modalIsOpen:true,
            toDeleteId:id
        })
    }

    deleteDataset() {
        console.log(this.state.toDeleteId)
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url: this.context.store.hosts + "/datasets/" + this.state.toDeleteId,
            type: 'delete',
            contentType: 'application/json; charset=utf-8'
        });
        this.closeModal()
        this.listDataset()
    };

    editDataset(item) {
        ReactDOM.render(
            <DatasetModal type={item.type} show={true} item={item} reset={() => this.callBack()}/>,
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
                    <th><a className="fa fa-edit" onClick={() => that.editDataset(item)}/>
                        <a className="fa fa-trash-o" onClick={() => that.popDeleteAction(item.id)}/>
                    </th>
                </tr>
            )
        });
    }

    closeModal = ()=>{
        this.setState({
            modalIsOpen:false
        })
    }

    render() {
        return (
            <div style={{height: "100%"}}>
                <div className="box">
                    <div className="box-header">
                        <h2>总共：{this.state.Datasets.length} 个数据源</h2>
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            onRequestClose={this.closeModal }
                            style={customStyles}
                            contentLabel="Modal">
                            <form>
                                <div className="box">
                                    <div className="row m-b">
                                        <div className="col-sm-6">
                                            <div className="box-header">
                                                <h2>删除数据源</h2>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <button className="pull-right fa fa-close" onClick={this.closeModal }></button>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>是否确认删除报表?</label>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button className="btn dark-white" onClick={()=>this.closeModal()}>取消</button>
                                        <button className="btn primary" onClick={()=>this.deleteDataset()}>确认</button>
                                    </div>
                                </div>
                            </form>
                        </Modal>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered m-a-0 table-hover">
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
