import React, { Component, PropTypes }from 'react';
import Codemirror from 'react-codemirror'
import { observer } from "mobx-react";
import 'codemirror/mode/sql/sql'
@observer
export default class QueryEditor extends Component {
    static contextTypes = {
        store: PropTypes.object
    };

    updateCode(code) {
        this.context.store.updateCode(code);

    }


    render() {
        const options = {
            lineNumbers: true,
            mode: "text/x-sql",
            theme: "solarized light",
            lineWrapping: true,

        };
        return <Codemirror ref="codemirror" value={this.context.store.code} onChange={this.updateCode.bind(this)}
                           options={options}/>
    }
}