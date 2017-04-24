import React, { PropTypes } from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

const ChartComponent = ({ loading, data, xaxis, yaxis, title, lineTypes, isFlip }) => {
  function transformToChartData() {
    const lineTags = [];
    const lineAlias = [];
    const nameTags = [];
    const series = [];

    xaxis.forEach((elem) => {
      nameTags.push(elem.name);
    });

    yaxis.forEach((elem) => {
      lineTags.push(elem.name);
    });

    yaxis.forEach((elem) => {
      lineAlias.push(elem.alias);
    });

    const xaxisData = [];
    lineTags.forEach((lineElem, i) => {
      const yaxisData = [];
      data.forEach((elem, j) => {
        if (i === 0) {
          const tmp = nameTags.map((x) => { return elem[x]; });
          xaxisData.push(tmp.join('-'));
        }
        if (lineTypes[i] === 'pie') {
          yaxisData.push({ value: elem[lineElem], name: xaxisData[j] });
        } else {
          yaxisData.push(elem[lineElem]);
        }
      });
      series.push({
        name: lineAlias[i],
        data: yaxisData,
        type: lineTypes[i],
        radius: '65%',
        areaStyle: { normal: {} },
      });
    });
    const unit = yaxis[0] !== unit ? yaxis[0].unit : '';
    let xType = [{
      type: 'category',
      data: xaxisData,
    }];
    let yType = [{
      type: 'value',
      axisLabel: {
        formatter: `{value} ${unit}`,
      },
    }];
    if (isFlip === true) {
      yType = [{
        type: 'category',
        data: xaxisData,
        axisLabel: {
          formatter: `{value} ${unit}`,
        },
      }];
      xType = [{
        type: 'value',
      }];
    }

    if (lineTypes[0] === 'pie') { // TODO lineTypes[0]
      return {
        name: xaxisData,
        data: series,
        legend: xaxisData,
        title,
        xType: {},
        yType: {},
      };
    } else {
      return {
        name: xaxisData,
        data: series,
        legend: lineAlias,
        title,
        xType,
        yType,
      };
    }
  }

  let option = {
    xAxis: { data: [] },
    yAxis: {},
    series: [{ name: '销量', type: 'bar', data: [] }],
    itemStyle: {
      normal: {
        shadowBlur: 60,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      emphasis: {
        shadowBlur: 200,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  };

  if (!loading) {
    const chartData = transformToChartData();
    option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b} <br/>{a} : {c}',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: chartData.legend,
      },
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: chartData.xType,
      yAxis: chartData.yType,
      series: chartData.data,
    };
  }
  function registerTheme() {
    const colorPalette = [
      '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
      '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
      '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
      '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089',
    ];

    const theme = {
      color: colorPalette,

      title: {
        textStyle: {
          fontWeight: 'normal',
          color: '#008acd',
        },
      },

      visualMap: {
        itemWidth: 15,
        color: ['#5ab1ef', '#e0ffff'],
      },

      toolbox: {
        iconStyle: {
          normal: {
            borderColor: colorPalette[0],
          },
        },
      },

      tooltip: {
        backgroundColor: 'rgba(50,50,50,0.5)',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#008acd',
          },
          crossStyle: {
            color: '#008acd',
          },
          shadowStyle: {
            color: 'rgba(200,200,200,0.2)',
          },
        },
      },

      dataZoom: {
        dataBackgroundColor: '#efefff',
        fillerColor: 'rgba(182,162,222,0.2)',
        handleColor: '#008acd',
      },

      grid: {
        borderColor: '#eee',
      },

      categoryAxis: {
        axisLine: {
          lineStyle: {
            color: '#008acd',
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
          },
        },
      },

      valueAxis: {
        axisLine: {
          lineStyle: {
            color: '#008acd',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)'],
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
          },
        },
      },

      timeline: {
        lineStyle: {
          color: '#008acd',
        },
        controlStyle: {
          normal: { color: '#008acd' },
          emphasis: { color: '#008acd' },
        },
        symbol: 'emptyCircle',
        symbolSize: 3,
      },

      line: {
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 3,
      },

      candlestick: {
        itemStyle: {
          normal: {
            color: '#d87a80',
            color0: '#2ec7c9',
            lineStyle: {
              color: '#d87a80',
              color0: '#2ec7c9',
            },
          },
        },
      },

      scatter: {
        symbol: 'circle',
        symbolSize: 4,
      },

      map: {
        label: {
          normal: {
            textStyle: {
              color: '#d87a80',
            },
          },
        },
        itemStyle: {
          normal: {
            borderColor: '#eee',
            areaColor: '#ddd',
          },
          emphasis: {
            areaColor: '#fe994e',
          },
        },
      },

      graph: {
        color: colorPalette,
      },

      gauge: {
        axisLine: {
          lineStyle: {
            color: [[0.2, '#2ec7c9'], [0.8, '#5ab1ef'], [1, '#d87a80']],
            width: 10,
          },
        },
        axisTick: {
          splitNumber: 10,
          length: 15,
          lineStyle: {
            color: 'auto',
          },
        },
        splitLine: {
          length: 22,
          lineStyle: {
            color: 'auto',
          },
        },
        pointer: {
          width: 5,
        },
      },
    };

    echarts.registerTheme('macarons', theme);
  }
  registerTheme();

  return (
    <div className="examples">
      <div className="parent">
        <ReactEcharts
          option={option}
          showLoading={loading}
          theme="macarons"
          style={{ height: '100%', minHeight: '400px', width: '100%' }}
          className="react_for_echarts"
        />
      </div>
    </div>
  );
};

ChartComponent.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.array,
  xaxis: PropTypes.array,
  yaxis: PropTypes.array,
  lineTypes: PropTypes.array,
  title: PropTypes.string,
  isFlip: PropTypes.bool,
};

export default ChartComponent;
