import React, { PropTypes, createClass, Component } from 'react';
import { decodeData } from '../../utils/DecodeData'
import fetch from 'isomorphic-fetch'
import Chart from './Chart'
import HighChart from './HighChart'
import Favorites from './Favorite'
import History from './History'
import Table from './Table'
import { observer } from "mobx-react";
import { MultiSelect }  from 'react-selectize'
import { filterOptions } from '../../utils/Select'
import $ from 'jquery';
import { ajax } from '../../utils/DecodeData'
import Modal from 'react-modal'

const customStyles = {
    content: {
        top: '50%',
        left: '53%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '400px',
    }
};

@observer
export default class QueryInformation extends Component {

    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            results: [],
            columns: [],
            datas: [],
            tagStatus: "chart",
            config: {},
            seriesList: [],
            modalIsOpen: false,
        }
    }

    componentWillMount(){
    }

    errorPop(mgs){
        this.context.notification.add({
            message: "查询时错误: ",
            position: "br",
            children: (
                <blockquote>
                    {mgs}
                </blockquote>
            ),
            level: 'error',
            autoDismiss: 5
        });
    }

    handleTagClick(newState) {
        this.setState({ tagStatus: newState });
    }

    saveSqlClick() {
        let that = this;
        let name = this.refs.form_name.value.trim()
        this.context.store.currentCode.name = name
        let toRunSQL = this.context.store.currentCode.code
        if (toRunSQL == undefined || toRunSQL=="") {
            this.errorPop("不能保存空的SQL")
            return
        }
        var jsonObj = JSON.stringify(this.context.store.currentCode)
        ajax({
            url: that.context.store.hosts + "/codes",
            type: 'post',
            dataType: 'JSON',
            data: jsonObj,
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.setState({ modalIsOpen: false });
                that.context.notification.add({
                    message: "收藏SQL成功",
                    position: "br",
                    level: 'success',
                    autoDismiss: 5
                });
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    handleClick() {
        let toRunSQL = this.context.store.currentCode.code;
        if (toRunSQL == undefined || toRunSQL=="") {
            this.errorPop("请填写SQL语句！")
            return
        }
        if (this.context.store.currentDB.value == undefined) {
            this.errorPop("请选择数据源!")
            return
        }

        this.context.store.addHistory({
            query: toRunSQL,
            time: new Date().toISOString()
        });

        if (this.state.tagStatus == 'display') {
            this.setState({
                results: [],
                columns: []
            })
            this.getChartData("table")
        } else {
            this.setState({
                datas: []
            })
            this.getChartData("line");
            this.setState({
                tagStatus: "chart"
            });
        }
    }

    getChartData(type) {
        let that = this;
        let toRunSQL = this.context.store.currentCode.code;
        let url = this.context.store.hosts+"/datas?q=" + this.context.store.currentDB.value + "&code=" +toRunSQL;
        if (type !== "table"){
            url = url + "&type=" + type;
        }
        fetch(url, {
            method: "GET"
        }).then(response => {
            if (response.status != 404) {
            }
            return response.json();
        }).then(data => {
            console.log(`Success Run ${toRunSQL}`);
            if (data == null) {
                this.errorPop("请确认数据源是否有效。")
                return
            }
            if (data.error) {
                this.errorPop(data.error)
                return
            }

            if (data.datas.length != 0) {
                that.context.notification.add({
                    message: "成功返回数据",
                    position: "br",
                    level: 'success',
                    autoDismiss: 5
                });
            }

            if (type=="table"){
                that.setState({
                    data: data.datas,
                    results: data.tags,
                    columns: data.datas,
                    sql: toRunSQL
                });

            }else{
                let seriesList = []
                for (let i = 0; i < data.tags.length; i++) {
                    seriesList[i] = {
                        name: data.tags[i],
                        data: data.datas[i]
                    }
                }
                that.setState({
                    datas: data.datas,
                    times: data.times,
                    seriesList: seriesList
                });
                that.setState({
                    config: {
                        title: {
                            text: "图表数据展示"
                        },
                        chart: {
                            type: 'line'
                        },
                        xAxis: {
                            categories: data.times
                        },
                        series: seriesList
                    }
                });
            }
        }).catch(e => {
            console.log("event", e);
        });
    }
    clearCurrentSQL() {
        this.context.store.currentCode.code = "";
        this.context.store.code = "";
    }

    setChartType(type) {
        let that = this;
        that.setState({
            config: {
                title: {
                    text: "图表数据展示"
                },
                chart: {
                    type: type
                },
                xAxis: {
                    categories: this.state.times
                },
                series: this.state.seriesList
            }
        })
    }

    openModal() {
        if (this.context.store.currentDB.value == undefined) {
            this.errorPop("请选择数据源!");
            return
        }
        this.setState({ modalIsOpen: true });
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }

    render() {
        return (
            <div style={{ height: "100%" }}>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal.bind(this) }
                    style={customStyles}
                    contentLabel="Modal">
                    <form role="form">
                        <div className="box">
                            <div className="row m-b">
                                <div className="col-sm-6">
                                    <div className="box-header">
                                        <h2>收藏SQL</h2>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <button className="pull-right fa fa-close" onClick={this.closeModal.bind(this)}></button>
                                </div>
                            </div>
                            <div className="box-body">
                                <div className="form-group">
                                    <label>SQL名称</label>
                                    <input type="text" ref="form_name" defaultValue={this.context.store.currentCode.name} className="form-control" placeholder="请填写SQL名称" ></input>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn info" onClick={this.saveSqlClick.bind(this)}>确定</button>
                            </div>
                        </div>
                    </form>
                </Modal>
                <div className="queryTab nav-active-border b-info bottom box">
                    <div className="nav nav-md">
                        <a className={"nav-link " + (this.state.tagStatus == "display" ? 'active' : "") }
                            onClick={this.handleTagClick.bind(this, "display") }>
                            数据展示
                        </a>
                        <a className={"nav-link " + (this.state.tagStatus == "chart" ? 'active' : "") }
                            onClick={this.handleTagClick.bind(this, "chart") }>
                            可视化展示
                        </a>
                        <a className={"nav-link " + (this.state.tagStatus == "history" ? 'active' : "") }
                            onClick={this.handleTagClick.bind(this, "history") }>
                            历史记录
                        </a>
                        <a className={"nav-link " + (this.state.tagStatus == "favorites" ? 'active' : "") }
                            onClick={this.handleTagClick.bind(this, "favorites") }>
                            我的收藏
                        </a>
                        <div className="pull-right row-margin">
                            <button onClick={this.clearCurrentSQL.bind(this) } className="btn btn-xs info">清空输入</button>
                            <button onClick={this.openModal.bind(this) } className="btn btn-xs info">保存</button>
                            <button onClick={this.handleClick.bind(this) } className="btn btn-xs info">运行</button>
                        </div>

                    </div>

                </div>

                {
                    this.state.tagStatus == "display"
                        ?
                        (<div className="query-table">
                            <Table
                                columns={this.state.columns}
                                results={this.state.results}
                                >
                            </Table>
                        </div>)
                        : null
                }
                {
                    this.state.tagStatus == "chart"
                        ?
                        (<div className="query-chart">
                            <HighChart
                                datas={this.state.datas}
                                config={this.state.config}
                                setChartType={this.setChartType.bind(this) }
                                />
                        </div>)
                        : null
                }

                {
                    this.state.tagStatus == "history"
                        ?
                        (
                            <History
                                history={this.context.store.history}
                                />
                        )
                        : null
                }

                {
                    this.state.tagStatus == "favorites"
                        ?
                        (
                            <Favorites
                                favorites={this.context.store.sqlList}
                                />
                        )
                        : null
                }
            </div>
        )
    }
}