import React, { PropTypes, createClass, Component } from 'react';
import { observer } from "mobx-react";
import C3Chart from '../components/Dashboard/C3';
import Hchart from '../components/Dashboard/Hchart';
import Footer from '../components/Base/Footer';
import { WidthProvider } from 'react-grid-layout';
import DevTools from 'mobx-react-devtools';
import SplitPane from 'react-split-pane'
import DashboardSlider from '../components/Dashboard/DashboardSlider'
import DashboardHeader from '../components/Dashboard/DashboardHeader'
import Dashboard from '../components/Base/Header'
import { ajax } from '../utils/DecodeData'
var ReactGridLayout = require('react-grid-layout');
ReactGridLayout = WidthProvider(ReactGridLayout);
const props = {
    className: "layout",
    items: 50,
    cols: 12,
    rowHeight: 100
};

@observer
export default class DashboardContainer extends Component {

    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            Layout: [],
            reportId: "",
            reportName: "",
            ReportList: true,
            ChartList: []
        }
        
    }
    componentWillMount(){
       this.getReportList();
    }
    getChart(key) {
        let chartList = this.state.ChartList;
        for (let i = 0; i < chartList.length; i++) {
            if (chartList[i].id == key) {
                let chartType = chartList[i].type.toLowerCase();
                if (chartType == 'scatter' || chartType == 'area' || chartType == 'areaspline' || chartType == 'column') {
                    chartType = 'bar';
                }
                return {
                    "codeId": chartList[i].codeId,
                    "type": chartList[i].type.toLowerCase(),
                    "chartType": chartType,
                    "title": chartList[i].title,
                    "subTitle": chartList[i].subTitle
                }
            }
        }
    }

    deleteChart(chartId){

    }

    getComponents(layout) {
        let that = this;

        return layout.map((item) => (
            <div key={item.i} >
                <Hchart
                    id={item.i}
                    option={that.getChart(item.i) }
                    delete={()=>this.deleteChart(item.i)}
                    />
            </div>

        ))
    }

    setLayout(layout) {
        this.getchartList();
        this.setState({ Layout: layout });
    }
    setReportId(reportId) {
        this.context.store.currentReportId = reportId
        this.getchartList();
        this.getlayoutList();
    }

    getReportList() {
        let that = this;
        ajax({
            url: that.context.store.hosts + "/reports",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                if (data.reports.length != 0) {
                    that.context.store.currentReportName = data.reports[0].name;
                    that.setState({ reportName: data.reports[0].name });
                    that.setState({ reportId: data.reports[0].id });
                    that.setState({
                        ReportList: false
                    })
                    that.context.store.reportList = _.map(data.reports, (item, i) => {
                        return { label: item.name, value: item.id }
                    })
                    that.context.store.currentReportId = data.reports[0].id;
                    that.getlayoutList();
                    that.getchartList();
                } else {
                    console.log("没有数据");
                }

            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    deleteReport() {
        let that = this;
        console.log("删除 report")
        ajax({
            url: that.context.store.hosts + "/reports/" + that.context.store.currentReportId,
            type: 'delete',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                console.log("删除成功");
                that.getReportList();
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    getlayoutList() {
        let that = this;
        ajax({
            url: that.context.store.hosts + "/layouts/" + that.context.store.currentReportId,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                let layout = [];
                for (let i = 0; i < data.layouts.length; i++) {
                    layout[i] = data.layouts[i].data;
                }
                that.setState({ Layout: layout })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    getchartList() {
        let that = this;
        ajax({
            url: that.context.store.hosts + "/reports/" + that.context.store.currentReportId + "/charts",
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.setState({ ChartList: data.charts })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }
    componentDidUpdate() {
        console.log(this.state.ReportList);
    }

    render() {
        return (
            <div id="content" className="app-content box-shadow-z0" role="main">
                <div className="app-body">
                    <SplitPane split="vertical" minSize={100} defaultSize={280}>
                        <DashboardSlider ReportList={this.state.ReportList} setlayout={this.setLayout.bind(this) } setReportId={this.setReportId.bind(this) } />
                        <SplitPane split="horizontal" minSize={50} defaultSize={50}>
                            <DashboardHeader reportName={this.state.reportName} deleteReport={this.deleteReport.bind(this) } />
                            <ReactGridLayout
                                {...props}
                                className="layout"
                                layout={this.state.Layout}
                                draggableHandle=".drag"
                                >
                                {this.getComponents(this.state.Layout) }
                            </ReactGridLayout>
                        </SplitPane>
                    </SplitPane>

                </div>

            </div>

        )
    }
}