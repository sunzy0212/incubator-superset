import $ from 'jquery';
export function ajax(options) {
    return new Promise(function (resolve, reject) {
        $.ajax(options).done(resolve).fail(reject);
    });
}

export function decodeTime(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export function getTagsName(objects) {
    var name = "";
    for (var key in objects) {
        name += objects[key];
    }
    return name
}

export function decodeData(data) {
    let series = data.results[0].series;
    let results = {
        time: {
            values: _.map(_.unzip(series[0].values)[0], (date)=>decodeTime(new Date(date), "yyyy-MM-dd hh:mm:ss"))
        }
    };
    let columns = ['time'];

    series.forEach(
        data => {
            let _zip = _.unzip(data.values);
            for (var i = 1; i < _zip.length; i++) {
                let _name = (data.tags) ? getTagsName(data.tags) : data.columns[i];
                results[_name] = {
                    'values': _zip[i]
                };
                columns.push(_name)
            }


        }
    );
    return { results, columns };
}

export function getOption(chartType, props) {

    let _series = _.map(_.filter(props.columns, (item) => item != "time"), (key)=> {
        let _data = {
            name: key,
            sampling: 'average',
            symbol: 'none',
            smooth: true,
            boundaryGap: false,
            hoverAnimation: false,
            connectNulls: true,
            time: props.results.time.values,
            data: props.results[key].values
        };
        if (chartType == "pie") {

            let _t = _.zip(props.results.time.values, props.results[key].values);
            window.t = _t;
            return {
                type: 'pie',
                data: _.map(_t, (item) => _.zipObject(["name", "value"], item))
            };
        }
        if (chartType == "bar stack") {
            _data["type"] = "bar";
            _data["stack"] = "1"
        }
        if (chartType == "bar") {
            _data["type"] = "bar";
            _data["stack"] = key;
        }
        if (chartType == "line") {
            _data["type"] = "line";
        }
        if (chartType == "line stack") {
            _data["type"] = "line";
            _data["stack"] = "1";
            _data["areaStyle"] = { normal: {} }
        }
        return _data;

    });
    if (chartType == "pie") {
        return {
            tooltip: {
                trigger: 'item',
                formatter: ((params, ticket, callback) => {
                    let result = "<span style='color: " + params.color + "'>" + params.data.name + ": </span>" + params.data.value + "<br>"
                    return result;
                }),
            },
            series: _series[0],
        }
    }
    let _result = {
        grid: {
            top: '30',
            left: '1%',
            right: '30',
            containLabel: true,
            show: false
        },
        xAxis: [
            {
                type: 'category',
                data: _.map(props.results.time.values, (item) => decodeTime(new Date(item), "hh:mm:ss\nyyyy-MM-dd"))
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter: ((params, ticket, callback) => {
                let result = decodeTime(new Date(params[0].name), "yyyy-MM-dd hh:mm:ss") + "<br>";
                params.forEach(param => {
                    result += "<span style='color: " + param.color + "'>" + param.seriesName + ": </span>" + param.value + "<br>"
                });
                return result;
            }),
            axisPointer: {
                animation: false
            }
        },
        series: _series,
        dataZoom: [
            {
                show: true,
            },
            {
                type: 'select',
            }
        ],
        toolbox: {
            top: "-5",
            right: "30",
            feature: {
                dataZoom: {
                    show: true,
                    yAxisIndex: false
                }
            }
        }
    };
    if (chartType == "line stack" || chartType == "line") {
        _result.xAxis[0].boundaryGap = false
    }
    return _result;

}

export function getChartOption(chartType, props) {

    let _series = _.map(_.filter(props.tags, (item) => item != "time"), (key)=> {
        let _data = {
            name: key,
            sampling: 'average',
            symbol: 'none',
            smooth: true,
            boundaryGap: false,
            hoverAnimation: false,
            connectNulls: true,
            time: props.times,
            data: props.datas
        };
        if (chartType == "pie") {

            let _t = _.zip(props.datas, props.datas);
            window.t = _t;
            return {
                type: 'pie',
                data: _.map(_t, (item) => _.zipObject(["name", "value"], item))
            };
        }
        if (chartType == "bar stack") {
            _data["type"] = "bar";
            _data["stack"] = "1"
        }
        if (chartType == "bar") {
            _data["type"] = "bar";
            _data["stack"] = key;
        }
        if (chartType == "line") {
            _data["type"] = "line";
        }
        if (chartType == "line stack") {
            _data["type"] = "line";
            _data["stack"] = "1";
            _data["areaStyle"] = { normal: {} }
        }
        return _data;

    });
    if (chartType == "pie") {
        return {
            tooltip: {
                trigger: 'item',
                formatter: ((params, ticket, callback) => {
                    let result = "<span style='color: " + params.color + "'>" + params.data.name + ": </span>" + params.data.value + "<br>"
                    return result;
                }),
            },
            series: _series[0],
        }
    }
    let _result = {
        grid: {
            top: '30',
            left: '1%',
            right: '30',
            containLabel: true,
            show: false
        },
        xAxis: [
            {
                type: 'category',
                data: props.datas
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter: ((params, ticket, callback) => {
                let result = decodeTime(new Date(params[0].name), "yyyy-MM-dd hh:mm:ss") + "<br>";
                params.forEach(param => {
                    result += "<span style='color: " + param.color + "'>" + param.seriesName + ": </span>" + param.value + "<br>"
                });
                return result;
            }),
            axisPointer: {
                animation: false
            }
        },
        series: _series,
        dataZoom: [
            {
                show: true,
            },
            {
                type: 'select',
            }
        ],
        toolbox: {
            top: "-5",
            right: "30",
            feature: {
                dataZoom: {
                    show: true,
                    yAxisIndex: false
                }
            }
        }
    };
    if (chartType == "line stack" || chartType == "line") {
        _result.xAxis[0].boundaryGap = false
    }
    return _result;

}

//
//  [
//     '#2ec7c9','#b6a2de','#5ab1ef','#ffb980','#d87a80',
//     '#8d98b3','#e5cf0d','#97b552','#95706d','#dc69aa',
//     '#07a2a4','#9a7fd1','#588dd5','#f5994e','#c05050',
//     '#59678c','#c9ab00','#7eb00a','#6f5553','#c14089'
// ];

const colorPalette = [
    'rgba(35, 142, 250, 1)',
    'rgba(38, 173, 88, 1)',
    'rgba(77, 19, 191, 1)',
    'rgba(255, 51, 119, 1)',
    'rgba(255, 167, 51, 1)',
    'rgba(49, 192, 192, 1)',
    'rgba(170, 191, 88, 1)',
    'rgba(186, 109, 66, 1)',
    'rgba(89, 124, 131, 1)',
]


export const theme = {
    color: colorPalette,

    title: {
        textStyle: {
            fontWeight: 'normal',
            color: '#008acd'
        }
    },

    visualMap: {
        itemWidth: 15,
        color: ['#5ab1ef', '#e0ffff']
    },

    toolbox: {
        iconStyle: {
            normal: {
                borderColor: '#1989fa'
            }
        }
    },

    tooltip: {
        backgroundColor: 'rgba(50,50,50,0.5)',
        axisPointer: {
            type: 'line',
            lineStyle: {
                color: '#008acd'
            },
            crossStyle: {
                color: '#008acd'
            },
            shadowStyle: {
                color: 'rgba(200,200,200,0.2)'
            }
        }
    },

    dataZoom: {
        dataBackgroundColor: '#efefff',
        fillerColor: 'rgba(182,162,222,0.2)',
        handleColor: '#008acd'
    },

    grid: {
        borderColor: '#cccccc'
    },

    categoryAxis: {
        axisLine: {
            lineStyle: {
                color: '#008acd'
            }
        },
        splitLine: {
            lineStyle: {
                color: ['#eee']
            }
        }
    },

    valueAxis: {
        axisLine: {
            lineStyle: {
                color: '#008acd'
            }
        },
        splitArea: {
            show: true,
            areaStyle: {
                color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
            }
        },
        splitLine: {
            lineStyle: {
                color: ['#eee']
            }
        }
    },

    timeline: {
        lineStyle: {
            color: '#008acd'
        },
        controlStyle: {
            normal: { color: '#008acd' },
            emphasis: { color: '#008acd' }
        },
        symbol: 'emptyCircle',
        symbolSize: 3
    },

    line: {
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 3
    },

    candlestick: {
        itemStyle: {
            normal: {
                color: '#d87a80',
                color0: '#2ec7c9',
                lineStyle: {
                    color: '#d87a80',
                    color0: '#2ec7c9'
                }
            }
        }
    },

    scatter: {
        symbol: 'circle',
        symbolSize: 4
    },

    map: {
        label: {
            normal: {
                textStyle: {
                    color: '#d87a80'
                }
            }
        },
        itemStyle: {
            normal: {
                borderColor: '#eee',
                areaColor: '#ddd'
            },
            emphasis: {
                areaColor: '#fe994e'
            }
        }
    },

    graph: {
        color: colorPalette
    },

    gauge: {
        axisLine: {
            lineStyle: {
                color: [[0.2, '#2ec7c9'], [0.8, '#5ab1ef'], [1, '#d87a80']],
                width: 10
            }
        },
        axisTick: {
            splitNumber: 10,
            length: 15,
            lineStyle: {
                color: 'auto'
            }
        },
        splitLine: {
            length: 22,
            lineStyle: {
                color: 'auto'
            }
        },
        pointer: {
            width: 5
        }
    }
};
