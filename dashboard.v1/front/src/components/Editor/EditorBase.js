import React, { PropTypes, createClass, Component } from 'react';
import { decodeData } from '../../utils/DecodeData'
import fetch from 'isomorphic-fetch'
const br = '<br>';
import Chart from './Chart'
import Favorites from './Favorite'
import History from './History'
import Table from './Table'
import { observer } from "mobx-react";

@observer
export default class QueryInformation extends Component {

    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            results: {},
            columns: [],
            tagStatus: "chart",
            sql: ""
        }

    }

    handleTagClick(newState) {
        this.setState({ tagStatus: newState });
    }

    handleClick() {
        let that = this;
        let toRunSQL = this.context.store.code;
        this.context.store.addHistory({
            query: toRunSQL,
            time: new Date().toISOString()
        });
        fetch(`http://b0ah76fu.nq.cloudappl.com/query?q=${that.context.store.code}&db=${that.context.store.db}`, {
            method: "GET",
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            })

        }).then(response => {
            if (response.status != 404) {


            }
            return response.json();
        })
            .then(data => {
                console.log(`Success Run ${toRunSQL}`);
                console.log(data);
                if (data.error) {
                    that.context.notification.add({
                        message: "运行 Query 时发生错误: ",
                        position: "br",
                        children: (
                            <blockquote>
                                {data.error}
                            </blockquote>
                        ),
                        level: 'error',
                        autoDismiss: 0
                    });
                    return
                }
                if (Object.keys(data.results[0]).length == 0) {
                    console.log("test");
                    that.context.notification.add({
                        message: "接收到的结果为空，请核对 Query。",
                        level: 'warning',
                        position: "br",
                        autoDismiss: 20,
                        children: (
                            <div>
                                当前 Database： {that.context.store.db}
                            </div>
                        )
                    });
                    return
                }
                let { results, columns }= decodeData(data);
                that.setState({
                    data: data.results[0].series[0],
                    results: results,
                    columns: columns,
                    sql: toRunSQL
                });
            })
            .catch(e => {
                console.log("event", e);
            });


    }

    render() {
        return (
            <div style={{ height: "100%" }}>
                <div className="queryTab nav-active-border b-info bottom box">
                    <div className="nav nav-md">
                        <a className={"nav-link " + (this.state.tagStatus == "display" ? 'active' : "")}
                           onClick={this.handleTagClick.bind(this, "display")}>
                            数据展示
                        </a>
                        <a className={"nav-link " + (this.state.tagStatus == "chart" ? 'active' : "")}
                           onClick={this.handleTagClick.bind(this, "chart")}>
                            可视化展示
                        </a>
                        <a className={"nav-link " + (this.state.tagStatus == "history" ? 'active' : "")}
                           onClick={this.handleTagClick.bind(this, "history")}>
                            历史记录
                        </a>
                        <a className={"nav-link " + (this.state.tagStatus == "favorites" ? 'active' : "")}
                           onClick={this.handleTagClick.bind(this, "favorites")}>
                            我的收藏
                        </a>
                        <div className="pull-right ">
                            <button onClick={ () => this.context.store.addFavorites()} className="btn btn-xs white">收藏</button>
                            <button onClick={this.handleClick.bind(this)} className="btn btn-xs info">运行</button>
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
                            <Chart
                                columns={this.state.columns}
                                results={this.state.results}
                                data={this.state.data}
                                sql={this.state.sql}

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
                                favorites={this.context.store.favorites}
                            />
                        )
                        : null
                }
            </div>
        )
    }
}