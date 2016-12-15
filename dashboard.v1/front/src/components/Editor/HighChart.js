import React, { Component, PropTypes } from 'react'
import { MultiSelect,SimpleSelect }  from 'react-selectize'
import { filterOptions } from '../../utils/Select'
import { getOption, getChartOption, decodeTime } from '../../utils/DecodeData'
import ReactHighcharts from 'react-highcharts'
import shortid from 'shortid';
import { ajax } from '../../utils/DecodeData'

// echarts.registerTheme('macarons', theme);
const typeOption = [{ label: "折线图", value: "line" },
    { label: "面积图", value: "area" },
    { label: "曲线面积图", value: "areaspline" },
    { label: "基础柱状图", value: "column" },
    { label: "柱状图", value: "bar" },
    { label: "散点图", value: "scatter" },
    { label: "饼图", value: "pie" }
];

const Layout = {
    i: '0', x: 0, y: 0, w: 6, h: 4, isDraggable: true, isResizable: true, _i: 1
};

class QueryHighChart extends Component {

    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            ReportOption: [],
            reportId: "",
            currentUId: "",
            codeId: "",
            chartType: "line"
        }
        
    }

    componentWillMount(){
        this.getReportList()
    }

    getCurrentLayoutList() {
        let that = this;
        ajax({
            url: that.context.store.hosts + "/layouts/" + that.state.reportId,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                let layout = [];
                for (let i = 0; i < data.layouts.length; i++) {
                    layout[i] = data.layouts[i].data;
                }
                that.createLayout(data.layouts);
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    createLayout(layout) {
        let that = this;
        let dataStr = {
            "layouts": []
        }
        dataStr.layouts = layout
        let uuid = that.state.currentUId
        Layout.i = uuid
        Layout.x = layout.length % 2 != 0 ? 6 : 0
        dataStr.layouts = dataStr.layouts.concat({
            "chartId": uuid,
            "data": Layout
        })
        var jsonObj = JSON.stringify(dataStr)
        ajax({
            url: that.context.store.hosts + "/layouts/" + that.state.reportId,
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: jsonObj
        }).then(
            function fulfillHandler(data) {
                that.context.notification.add({
                    message: "添加图表成功!",
                    position: "br",
                    level: 'success',
                    autoDismiss: 5
                });
                console.log("保存到dashboard！！！")
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })

    }

    saveSqlClick() {
        let that = this;
        if (that.state.reportId == "") {
            that.context.notification.add({
                message: "添加图表时发生错误: ",
                position: "br",
                children: (
                    <blockquote>
                        请选择相应报表!
                    </blockquote>
                ),
                level: 'error',
                autoDismiss: 5
            });
            return
        }
        let jsonObj = JSON.stringify(that.context.store.currentCode)
        let codeId = that.context.store.currentCode.id
        ajax({
            url: that.context.store.hosts + "/codes" + (codeId !=undefined?"/"+codeId:"") ,
            type: codeId !=undefined?'put':'post',
            dataType: 'JSON',
            data: jsonObj,
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.setState({ codeId: data.id });
                that.addChart();
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    addChart() {
        let that = this;
        let uuid = shortid.generate();
        that.setState({ currentUId: uuid });
        let dataStr = {
            "title": "",
            "subTitle": "",
            "type": that.state.chartType,
            "stack": true,
            "codeId": that.state.codeId,
            "reportId": that.state.reportId,
            "code": that.context.store.code,
            "chartId": uuid
        }
        var jsonObj = JSON.stringify(dataStr)

        ajax({
            url: that.context.store.hosts + "/reports/" + that.state.reportId + "/charts/" + uuid,
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: jsonObj
        }).then(
            function fulfillHandler(data) {
                that.getCurrentLayoutList();
                console.log("创建chart成功");
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
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
                console.log(data);
                that.setState({
                    ReportOption: _.map(data.reports, (item) => {
                        return { label: item.name, value: item.id }
                    })
                })
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    componentWillReceiveProps(nextProps) {
        console.log("nextProps", nextProps)

    }

    changeTable(obj) {
        this.setState({ reportId: obj[0].value })
    }

    changeType(obj) {
        this.setState({ chartType: obj.value })
        this.props.setChartType(obj.value);
    }

    render() {
        let that = this;
        return (
            <div className="queryChart p-b-lg">
                <div className="m-t">
                    图表类型:
                    <SimpleSelect
                        placeholder="请点击选择图表类型"
                        options={typeOption}
                        defaultValues={[typeOption[0]]}
                        onValueChange={(value)=>this.changeType(value)}
                        />
                    <ReactHighcharts config={that.props.config} />
                    <div className="pull-right ">
                        <div className="edit-report-select">
                            <MultiSelect
                                placeholder="选择报表"
                                defaultValues={this.state.ReportOption[0]}
                                options={this.state.ReportOption}
                                maxValues={1}
                                onValuesChange={(values) => this.changeTable(values) }
                                filterOptions={filterOptions}
                                />
                        </div>
                        <button onClick={this.saveSqlClick.bind(this) } className="btn btn-outline b-info text-info">保存图表至
                            Dshaboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}


export default React.createClass({
    propTypes: {
        datas: React.PropTypes.array.isRequired,
        config: React.PropTypes.object.isRequired,
    },
    render() {
        return (
            <div className="p-a ">
                {
                    this.props.datas.length == 0
                        ?
                        (
                            "请先在上方输入查询语句, 并点击运行按钮。"
                        )
                        : (
                            <QueryHighChart
                                {...this.props}
                                />

                        )
                }
            </div>
        )
    }
})