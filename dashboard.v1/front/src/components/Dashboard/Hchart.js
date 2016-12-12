import React, { Component, PropTypes } from 'react'
import ReactHighcharts from 'react-highcharts'
import { ajax, getOption, decodeTime } from '../../utils/DecodeData'

export const QueryChartPropTypes = {
    id: React.PropTypes.string.isRequired,
    option: React.PropTypes.object.isRequired,
};


export default class QueryChart extends Component {
    static propTypes = QueryChartPropTypes;
    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            mapType: [{ label: "折线图", value: "bar" }],
            data: [],
            config: {
                title: {
                    text: ""
                },
                chart: {
                    type: 'line'
                },
                xAxis: {
                    categories: []
                },
                series: [{
                    name: 'sum',
                    data: []
                }]
            }

        }

    }


    componentWillMount() {
        this.getChartData();
    }

    getChartData() {
        let that = this;
        ajax({
            url: that.context.store.hosts + "/datas?q=" + that.props.option.codeId + "&type=" + that.props.option.chartType,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                let seriesList = []
                for (let i = 0; i < data.tags.length; i++) {
                    seriesList[i] = {
                        name: data.tags[i],
                        data: data.datas[i]
                    }
                }
                console.log(data);
                that.setState({
                    config: {
                        title: {
                            text: ""
                        },
                        chart: {
                            type: that.props.option.type.toLowerCase()
                        },
                        xAxis: {
                            categories: data.times
                        },
                        series: seriesList
                    }
                });

            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }


    render() {
        return (
            <div>
                <div className="box" >
                    <div className="box-header">
                        <h3>{this.props.option.title}</h3>
                        <small>{this.props.option.subTitle ? this.props.option.subTitle : ""}</small>
                    </div>
                    <div className="box-tool">
                        <ul className="nav">
                            <li className="nav-item  m-l-2">
                                <a className="nav-link">
                                    <i className="material-icons md-18">edit</i>
                                </a>
                            </li>
                            <li className="nav-item  m-l-2">
                                <a className="nav-link">
                                    <i className="material-icons md-18 drag">photo_size_select_small</i>
                                </a>
                            </li>
                            <li className="nav-item  m-l-2">
                                <a className="nav-link">
                                    <i className="material-icons md-18"></i>
                                </a>
                            </li>
                            <li className="nav-item  m-l-2">
                                <a className="nav-link">
                                    <i className="material-icons md-18">delete </i>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="box-body p-0">
                        <ReactHighcharts config={this.state.config} />
                    </div>

                </div>
            </div>
        )
    }
}

