import React from 'react'
import { Table, Column, Cell } from 'fixed-data-table';

let QueryEditor = React.createClass({
    propTypes: {
        columns: React.PropTypes.array.isRequired,
        results: React.PropTypes.object.isRequired,
    },
    _head() {
        var columns = _.map(this.props.columns, function (colName) {
            return (
                <th key={colName}>{colName}</th>
            );
        });
        return (
            <tr>{columns}</tr>
        );
    },

    _rows() {
        let columns = this.props.columns;
        let results = this.props.results;
        return _.map(results.time.values, function (row, i) {
            var values = _.map(columns, function (colKey) {
                return (
                    <td key={colKey + i}>{results[colKey].values[i]}</td>
                );
            });
            return (
                <tr key={i}>{values}</tr>
            );
        })
    },

    render() {
        return (
            <div>
                {
                    this.props.columns.length == 0
                        ?
                        (<div className="p-a b-w">
                            请先在上方输入查询语句, 并点击运行按钮。
                        </div>)
                        : (
                        <table className="table table-striped">
                            <thead>
                            {this._head()}
                            </thead>
                            <tbody>
                            {this._rows()}
                            </tbody>
                        </table>
                    )
                }

            </div>
        )
    }


});

export default QueryEditor
//