import React, { Component, PropTypes }from 'react';
import _ from 'lodash';
import { MultiSelect }  from 'react-selectize'
import { filterOptions } from '../../utils/Select'
import { ajax } from '../../utils/DecodeData'

export default class QuerySelect extends Component {
    static contextTypes = {
        store: PropTypes.object
    };
    constructor(props) {

        super(props);
        this.state = {
            TableOption: [],
            Columns: [],
        }
        let that = this;

    }
    componentWillMount() {
        this.getDataSets()
    }
    getDataSets() {
        let that = this;
        ajax({
            url: that.context.store.hosts + "/datasets",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.setState({
                    TableOption: _.map(data.datasets, (item) => {
                        return { id: item.id, label: item.name, value: item.name, type: item.type }
                    })
                })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    changeTable(value) {
        this.context.store.currentDB = value[0];
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
                <div className="m-t">
                    <label className="tables-input _800 m-b">数据源</label>
                    <MultiSelect
                        placeholder="选择数据源"
                        options={this.state.TableOption}
                        maxValues={1}
                        onValuesChange={(values) => this.changeTable(values) }
                        filterOptions={filterOptions}
                        />
                </div>
            </div>
        )
    }
}