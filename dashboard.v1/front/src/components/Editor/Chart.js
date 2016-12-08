import React, { Component, PropTypes } from 'react'
import { MultiSelect }  from 'react-selectize'
import { filterOptions } from '../../utils/Select'
import { getOption, decodeTime } from '../../utils/DecodeData'
import C3Chart from 'react-c3js';
import shortid from 'shortid';

// echarts.registerTheme('macarons', theme);
const typeOption = [{ label: "折线图", value: "line" },
    { label: "Spline 图", value: "spline" },
    { label: "Step 图", value: "step" },
    { label: "Area Spline 图", value: "area-spline" },
    { label: "Area Step 图", value: "area-step" },
    { label: "柱状图", value: "bar" },
    { label: "scatter", value: "scatter" },
    { label: "饼图", value: "pie" },
    { label: "donut", value: "donut" },
    { label: "gauge", value: "gauge" }
];


export const QueryChartPropTypes = {
    columns: React.PropTypes.array.isRequired,
    results: React.PropTypes.object.isRequired,
    sql: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired
};


class QueryChart extends Component {
    static propTypes = QueryChartPropTypes;
    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        let _data = this.props.data.values;
        _data.unshift(this.props.data.columns);
        this.state = {
            mapType: [{ label: "折线图", value: "line" }],
            chartOption: getOption("line", this.props),
            data: _data
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log("nextProps", nextProps)
        this.setState({
            chartOption: getOption(this.state.mapType[0].value, nextProps)
        })
    }

    saveToDashboard = () => {
        this.context.store.addData(shortid.generate(), {
            sql: this.props.sql,
            type: this.state.mapType[0].value,
            db: this.context.store.db
        });
        this.context.notification.add({
            message: "添加成功",
            level: 'success',
            autoDismiss: 10
        });
    };


    changeType(Type) {
        if (Type.length == 1) {
            this.setState({
                mapType: Type
            })
        }
    }

    render() {
        return (
            <div className="queryChart p-b-lg">
                <div className="m-t">
                    图表类型:
                    <MultiSelect
                        placeholder="请点击选择图表类型"
                        options={typeOption}
                        maxValues={1}
                        defaultValues={[typeOption[0]]}
                        onValuesChange={(values) => this.changeType(values) }
                        filterOptions={filterOptions}/>

                    <C3Chart
                        data={{
                            x: 'time',
                            xFormat: '%Y-%m-%dT%H:%M:%SZ',
                            rows: this.state.data,
                            type: this.state.mapType[0].value
                        }}
                        subchart={{
                            show: true,
                            size: {
                                height: 30
                            }
                        }}
                        axis={{
                            x: {
                                type: 'timeseries',

                            }
                        }}
                        zoom={{ enabled: true }}
                        color={{
                            pattern: ['#238EFA', '#26AD58', '#4D13BF', '#FF3377', '#FFA733', '#31C0C0',
                                '#AABF58', '#BA6D42', '#597C83']
                        }}
                        tooltip={{
                            format: {
                                title: function (x) {
                                    return 'Data ' + decodeTime(x, "yyyy-MM-dd hh:mm:ss");
                                }
                            }
                        }}

                        />

                    <div className="pull-right ">
                        <button onClick={this.saveToDashboard} className="btn btn-outline b-info text-info">保存图表至
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
        columns: React.PropTypes.array.isRequired,
        results: React.PropTypes.object.isRequired,
    },
    render() {
        return (
            <div className="p-a ">
                {
                    this.props.columns.length == 0
                        ?
                        (
                            "请先在上方输入查询语句, 并点击运行按钮。"
                        )
                        : (
                            <QueryChart
                                {...this.props}
                                />

                        )
                }
            </div>
        )
    }
})