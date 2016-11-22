import React, { Component, PropTypes }from 'react';
import _ from 'lodash';

import { MultiSelect }  from 'react-selectize'
import { filterOptions } from '../../utils/Select'
import { ajax } from '../../utils/DecodeData'

const DBOption = [{ label: "test", value: "http://b0ah76fu.nq.cloudappl.com" }];


export default class QuerySelect extends Component {
    static contextTypes = {
        store: PropTypes.object
    };
    constructor(props) {

        super(props);
        this.state = {
            DBOption: DBOption,
            TableOption: [],
            Columns: [],
        }
        let that = this;
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url: "http://b0ah76fu.nq.cloudappl.com/query",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: {
                q: "SHOW DATABASES",
            }
        }).then(
            function fulfillHandler(data) {
                that.setState({
                    TableOption: _.map(data.results[0].series[0].values, (item)=> {
                        return { label: item[0], value: item[0] }
                    })
                })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    changeTable(value) {
        if (value.length == 1) {
            let that = this;
            ajax({
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
                },
                url: "http://b0ah76fu.nq.cloudappl.com/query",
                type: 'get',
                dataType: 'JSON',
                contentType: 'application/json; charset=utf-8',
                data: {
                    q: "SHOW FIELD KEYS",
                    db: value[0].value
                }
            }).then(
                function fulfillHandler(data) {
                    that.context.store.setDB(value[0].value);
                    that.setState({
                        Columns: _.map(data.results[0].series[0].values, (item)=> item[0])
                    })

                },
                function rejectHandler(jqXHR, textStatus, errorThrown) {
                    console.log("reject", textStatus, jqXHR, errorThrown);
                })
        }
    }

    getColumns() {
        if (this.state.Columns.length == 0) {
            return (
                <p>请先选择 DB 和 Table</p>
            )
        }
        return this.state.Columns.map((item) => {
            return (
                <div className="columns" key={item}>
                    <span className="columns_name">{item}</span>
                    {/*<span className="columns_type">float</span>*/}
                </div>

            )
        });
    }

    render() {


        return (
            <div className="querySelect padding p-a">
                <div className="hide">
                    <label className="tables-input _800 m-b">DB</label>

                    <MultiSelect
                        placeholder="Select DB"
                        defaultValues={[DBOption[0]]}
                        options={this.state.DBOption}
                        maxValues={1}
                        filterOptions={filterOptions}
                    />
                </div>

                <div className="m-t">
                    <label className="tables-input _800 m-b">DB</label>

                    <MultiSelect
                        placeholder="Select DB"
                        options={this.state.TableOption}
                        maxValues={1}
                        onValuesChange={(values) => this.changeTable(values)}
                        filterOptions={filterOptions}
                    />
                </div>
                <div className="m-t hide" >
                    <label className="tables-input _800">Columns</label>
                    <div className="m-t-sm columns"/>
                    {this.getColumns()}
                </div>

            </div>
        )
    }
}
