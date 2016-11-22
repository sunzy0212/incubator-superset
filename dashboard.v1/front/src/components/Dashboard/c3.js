import React, { Component, PropTypes } from 'react'
import C3Chart from 'react-c3js';
import { getOption, decodeTime } from '../../utils/DecodeData'


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
            data: {
                rows: []
            }
        };
        let that = this;
        fetch(`${that.props.option.dbHost}/query?q=${that.props.option.sql}&db=${that.props.option.db}`, {
            method: "GET",
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            })

        }).then(response => {
            return response.json();
        })
            .then(data => {
                let _data = data.results[0].series[0].values
                _data.unshift(data.results[0].series[0].columns)
                that.setState({
                    data: {
                        x: 'time',
                        xFormat: '%Y-%m-%dT%H:%M:%SZ',
                        rows: _data,
                        type: that.props.option.type
                    }
                });
            })
            .catch(e => {
                console.log("event", e);
            });

    }


    render() {
        return (
            <div>
                <div className="box">
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
                                    <i className="material-icons md-18">delete</i>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="box-body p-0">

                        <C3Chart
                            data={this.state.data}
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
                                        if (x  instanceof Date){
                                            return 'Data ' + decodeTime(x, "yyyy-MM-dd hh:mm:ss");
                                        }
                                    }
                                }
                            }}
                            padding={{
                                right: 20
                            }}
                            size={{
                                height: 360
                            }}

                        />

                    </div>

                </div>
            </div>



        )
    }
}

