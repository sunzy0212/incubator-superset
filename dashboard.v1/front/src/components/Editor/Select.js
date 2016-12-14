import React, {Component, PropTypes}from 'react';
import _ from 'lodash';
import {MultiSelect, SimpleSelect}  from 'react-selectize'
import {ajax} from '../../utils/DecodeData'

export default class QuerySelect extends Component {
    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {

        super(props);
        this.state = {
            DataSetOptions: [],
            CurrentDataSetOption: {},
            Columns: [],
        }

    }

    componentWillMount() {
        this.getDataSets()
    }

    componentWillReceiveProps(nextProps){
        let id = this.context.store.currentCode.datasetId
        if (id != undefined) {
            for (let i = 0; i < this.state.DataSetOptions.length; i++) {
                if (this.state.DataSetOptions[i].value == id) {
                    this.context.store.currentDB = this.state.DataSetOptions[i];
                    this.setState({
                        CurrentDataSetOption: {label:this.state.DataSetOptions[i].label, value:this.state.DataSetOptions[i].value}
                    })
                }
            }
        }
    }

    getSqlList() {
        let that = this;
        ajax({
            url: this.context.store.hosts + "/codes?datasetId=" + this.context.store.currentDB.value,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                console.log(data.codes)
                that.context.store.sqlList = data.codes;
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
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
                    DataSetOptions: _.map(data.datasets, (item) => {
                        return {label: item.name, value: item.id}
                    })
                })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    changeTable(value) {
        this.context.store.currentDB = value;
        this.context.store.currentCode.datasetId = value.value
        this.getSqlList()
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
                    <SimpleSelect
                        placeholder="选择数据源"
                        options={this.state.DataSetOptions}
                        defaultValue={this.state.CurrentDataSetOption}
                        onValueChange={(value) => this.changeTable(value)}
                    >
                    </SimpleSelect>
                </div>
            </div>
        )
    }
}