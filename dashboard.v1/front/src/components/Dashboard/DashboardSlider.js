import React, { Component, PropTypes }from 'react';
import _ from 'lodash';

import { SimpleSelect,MultiSelect }  from 'react-selectize'
import { filterOptions } from '../../utils/Select'
import { ajax } from '../../utils/DecodeData'
import SplitPane from 'react-split-pane'
import Modal from 'react-modal'
import shortid from 'shortid';

const Layout = {
    i:'0', x: 0, y: 0, w: 6, h: 4, isDraggable: true, isResizable: true, _i: 1
};

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '53%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '500px',
    height                : '400px',
  }
};

const cols = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}

const typeOption = [{ label: "折线图", value: "line" },
    { label: "面积图", value: "area" },
    { label: "曲线面积图", value: "areaspline" },
    { label: "柱状图", value: "bar" },
    { label: "基础柱状图", value: "column" },
    { label: "散点图", value: "scatter" },
    { label: "饼图", value: "pie" }
];

export default class DashboardSlideBar extends Component {
    static contextTypes = {
        store: PropTypes.object
    };
    constructor(props) {

        super(props);
        this.state = {
            DataSetOption: [],
            SqlList: [],
            reportName: "",
            reportId: "",
            modalSQLName: "",
            typeOption: typeOption,
            sqlTitle: "",
            sqlSubTitle: "",
            sqlType: "",
            sqlCode: "",
            sqlId: "",
            dataSetId: "",
            modalIsOpen: false,
            modalSQLOpen: false,
            chartId: ""
        }

    }

    componentWillMount(){
        this.getReportList();
        this.getDataSetList();
    }

    getReportList(){
        let that = this;
        ajax({
            url: that.context.store.hosts + "/reports",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.context.store.currentReportName = data.reports[0].name;
                that.context.store.reportList = _.map(data.reports, (item, i)=> {           
                    return { label: item.name, value: item.id }
                })
                that.getlayoutList();
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    getDataSetList(){
        let that = this;
        ajax({
            url: that.context.store.hosts+"/datasets",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.setState({
                    DataSetOption: _.map(data.datasets, (item)=> {
                        return { label: item.name, value: item.id }
                    })
                })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    getlayoutList(){
        let that = this;
        ajax({
            url: that.context.store.hosts+"/layouts/" + that.context.store.currentReportId,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                let layout = [];
                for (let i = 0; i < data.layouts.length; i++) {
                    layout[i] = data.layouts[i].data;
                }
                that.props.setlayout(layout);
                
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    getCurrentLayoutList(){
        let that = this;
        ajax({
            url: that.context.store.hosts+"/layouts/" + that.context.store.currentReportId,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                let layout = [];
                for (let i = 0; i < data.layouts.length; i++) {
                    layout[i] = data.layouts[i].data;
                }
                that.createLayout(data.layouts);
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    changeTable(obj) {
        let that = this;
        ajax({
            url: that.context.store.hosts+"/codes?datasetId=" + obj.value,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.setState({
                    SqlList: _.map(data.codes, (item)=> {
                        return { label: item.name, value: item.id, code: item.code }
                    })
                })
                that.setState({dataSetId: obj.value})

            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    changeChartType(opt) {
        let that = this;
        that.setState({sqlType: opt.value});
    }

    changeReport(report,label) {
        console.log(report);
        this.props.setReportId(report);
        this.context.store.currentReportName = label;
    }

    changeSqlTitle(e){
        this.setState({sqlTitle: e.target.value});
    }

    changeSqlSubTitle(e){
        this.setState({sqlSubTitle: e.target.value});
    }

    _reortList() {
        let that = this;
        return _.map(this.context.store.reportList, function (item, i) {
            return (
                <div id={item.value} key={item.value} >
                    <a  onClick={that.changeReport.bind(that, item.value,item.label)}  className="list-group-item">
                        {item.label}
                    </a>
                </div>
            );
        })
    }

    _sqlList() {
        let that = this;
        //console.log(this);
        return _.map(this.state.SqlList, function (item, i) {
            return (
                <div key={item.value} >
                    <li className="list-item">
                        <a  className="list-right">
                        <span onClick={that.openSQLModal.bind(that,item.label,item.value,item.code)} className="w-25 circle green">
                            <i className="fa fa-plus plus-margin"></i>
                        </span>
                        </a>
                    <div className="list-body">
                        <div><a >{item.label}</a></div>
                        <small className="text-muted text-ellipsis">{item.label}</small>
                    </div>
                    </li>
                </div>
            );
        })
    }

    changeReportName(e) {
        this.setState({reportName: e.target.value});
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }
 
    closeModal() {
        this.setState({modalIsOpen: false});
    }

    openSQLModal(sqlName,id,code) {
        this.setState({modalSQLOpen: true});
        this.setState({modalSQLName: sqlName});
        this.setState({sqlId: id});
        this.setState({sqlCode: code});
    }
 
    closeSQLModal() {
        this.setState({modalSQLOpen: false});
    }

    createReport() {
        let that = this;
        let dataStr = {
            "name" : that.state.reportName
        }
        var jsonObj = JSON.stringify(dataStr)
        ajax({
            url: that.context.store.hosts+"/reports",
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: jsonObj
        }).then(
            function fulfillHandler(data) {
                that.setState({reportId:data.id});
                that.setState({reportName:""});
                that.context.store.currentReportId = data.id;
                that.setState({modalIsOpen: false});
                that.getReportList();
                that.props.setReportId(data.id);
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
        })
        
   }
   createLayout(layout) {
        let that = this;
        let dataStr = {
            "layouts" : []
        }
        dataStr.layouts = layout
        let uuid = that.state.currentUId
        Layout.i = uuid
        Layout.x = layout.length%2 != 0 ? 6:0
        dataStr.layouts = dataStr.layouts.concat({
            "chartId": uuid,
            "data": Layout
        })
        var jsonObj = JSON.stringify(dataStr)
        ajax({
            url: that.context.store.hosts+"/layouts/" + that.context.store.currentReportId,
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: jsonObj
        }).then(
            function fulfillHandler(data) {
                that.setState({modalSQLOpen: false});
                console.log("创建layout成功");
                that.getlayoutList();
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
        })
        
   }

   addChart(){
        let that = this;
        let uuid = shortid.generate();
        that.setState({currentUId:uuid});
        let dataStr = {    
            "title": that.state.sqlTitle,
            "subTitle" : that.state.sqlSubTitle,
            "type" : that.state.sqlType,
            "stack" : true,
            "codeId" : that.state.sqlId,
            "reportId" : that.context.store.currentReportId,
            "code" : that.state.sqlCode,
            "chartId": uuid
        }
        var jsonObj = JSON.stringify(dataStr)
       
        ajax({
            url: that.context.store.hosts+"/reports/" + that.context.store.currentReportId + "/charts/" + uuid,
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: jsonObj
        }).then(
            function fulfillHandler(data) {
                that.getCurrentLayoutList();
                console.log("创建chart成功");
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
        })
   }


    render() {
        let that = this;
        return (
            <div className="dashboard-slidebar padding p-a" >
            <SplitPane split="horizontal" minSize={400} defaultSize={400}>
                <div className="report">
                    <div className="create-report">
                        <button onClick={this.openModal.bind(this)} className="btn btn-fw info">新建</button>
                    </div>
                    <div>
                        <label className="tables-input _800 m-b">报表</label>
                        <div className="list-group list-group-md m-b">
                            {this._reortList()}
                        </div>
                    </div>
                </div>

                <div className="dataset-layout">
                <div className="m-t">
                    <label className="tables-input _800 m-b">数据源</label>
                    <SimpleSelect
                        placeholder="选择数据源"
                        options={this.state.DataSetOption}
                        onValueChange={(value) => this.changeTable(value)}
                    >
                    </SimpleSelect>
                </div>
                <div>
                    <label className="tables-input _800 m-b">常用SQL</label>
                    <div className="box">
                        <ul className="list inset m-a-0">
                            {this._sqlList()}
                        </ul>
                    </div>
                </div>
                <div className="modal-layout">
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal.bind(this)}
                    style={customStyles}
                    contentLabel="Modal">
                    <form>
                        <div className="box">
                        <div className="row m-b">
                            <div className="col-sm-6">
                                <div className="box-header">
                                <h2>创建报表</h2>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                    <button className="pull-right fa fa-close" onClick={this.closeModal.bind(this)}></button>
                            </div>
                        </div>
                        <div className="box-body">                     
                            <div className="form-group">
                                <label>报表名称</label>
                                <input required="" value={this.state.reportName} onChange={this.changeReportName.bind(this)} className="form-control" placeholder="请填写报表名称" ></input>
                            </div>
                        </div>
                        <div className="pull-right">
                            <button type="submit" onClick={this.createReport.bind(this)} className="btn info">确认</button>
                        </div>
                        </div>
                    </form>
                </Modal>
                </div>
                <div className="modal-layout">
                <Modal
                    isOpen={this.state.modalSQLOpen}
                    onRequestClose={this.closeSQLModal.bind(this)}
                    style={customStyles}
                    contentLabel="Modal">
                    <form>
                        <div className="box">
                        <div className="row m-b">
                            <div className="col-sm-6">
                                <div className="box-header">
                                <h2>添加图表</h2>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                    <button className="pull-right  fa fa-close" onClick={this.closeSQLModal.bind(this)}></button>
                            </div>
                        </div>
                        <div className="row m-b">
                            <div className="col-sm-6">                             
                                <label>标题</label>
                                <input required="" value={this.state.sqlTitle} onChange={this.changeSqlTitle.bind(this)} className="form-control" placeholder="请填图表标题" ></input>
                            </div> 
                        </div>
                        <div className="box-body">                     
                            <div className="form-group">
                                <label>当前SQL名称:{this.state.modalSQLName}</label>
                                <SimpleSelect
                                    placeholder="图表类型"  
                                    options={this.state.typeOption}                        
                                    onValueChange={(value) => that.changeChartType(value)}
                                >
                                </SimpleSelect>
                            </div>
                        </div>
                        <div className="pull-center">
                            <button type="submit" onClick={this.addChart.bind(this)} className="btn info">确定</button>
                        </div>
                        </div>
                    </form>
                </Modal>
                </div>
                </div>
                </SplitPane>
               
            </div>
        )
    }
}
