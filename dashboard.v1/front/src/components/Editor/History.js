import React, { Component, PropTypes }from 'react';
import { observer } from "mobx-react";
@observer
export default class QueryHistory extends Component {
    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    _head() {
        return (
            <tr>
                <th key={"Query"}>Query</th>
                <th key={"Started"}>Started</th>
            </tr>
        );
    }



    _rows() {
        return _.map(this.context.store.history, function (item, i) {
            return (
                <tr key={i}>
                    <td key={i + "query"}>{item.query}</td>
                    <td key={i + "time"}>{item.time}</td>
                </tr>
            );
        })
    }



    render() {
        return (
            <div>
                {
                    this.context.store.history.length == 0
                        ?
                        (<div className="p-a b-w">
                            历史记录为空
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


}
//