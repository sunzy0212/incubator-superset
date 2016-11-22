import React, { PropTypes, createClass, Component } from 'react';
import { observer } from "mobx-react";
import  C3Chart from '../components/Dashboard/C3';
import  Footer from '../components/Base/Footer';
import { WidthProvider } from 'react-grid-layout';
var ReactGridLayout = require('react-grid-layout');
ReactGridLayout = WidthProvider(ReactGridLayout);
const props = {
    className: "layout",
    items: 50,
    cols: 12,
    rowHeight: 100
};
@observer
export  default  class DashboardContainer extends Component {

    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    getComponents(layout) {
        let that = this;
        return layout.map((item) => (
            <div key={item.i}>
                <C3Chart
                    id={item.i}
                    option={that.context.store.dataSet.get(item.i)}
                />
            </div>

        ))
    }

    render() {
        console.log("hello", this.context.store.layout);
        return (
            <div id="content" className="app-content box-shadow-z0" role="main">
                <Footer />
                <div className="app-body">
                    <ReactGridLayout
                        {...props}
                        className="layout"
                        layout={this.context.store.layout}
                        draggableHandle=".drag"
                    >
                        {this.getComponents(this.context.store.layout)}
                    </ReactGridLayout>
                </div>

            </div>

        )
    }
}