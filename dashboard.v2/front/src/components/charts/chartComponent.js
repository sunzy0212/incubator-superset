import React, { PropTypes } from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

const ChartComponent = ({ data, lines, xaxis, yaxis, title }) => {
  let chartData = {}
  transformToChartData(data, lines, xaxis, yaxis, title);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: chartData.legend,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: chartData.name,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: chartData.data,
  };

  function transformToChartData(cData, cLines, cXaxis, cYaxis, cChartTitle) {
    const lineTag = [];
    const lineType = [];
    const nameTag = [];
    const currentName = [];
    const currentData = [];
    const series = [];
    cLines.forEach((typeEle) => {
      lineTag.push(typeEle.name);
      lineType.push(typeEle.type);
    });
    cYaxis.forEach((nameEle) => {
      nameTag.push(nameEle.name);
    });

    cXaxis.forEach((nameEle) => {
      nameTag.push(nameEle.name);
    });

    lineTag.forEach((lineEle, i) => {
      const cTemp = [];
      cData.forEach((ele) => {
        if (i === 0) {
          currentName.push(ele[nameTag[0]]);
        }
        cTemp.push(ele[lineEle]);
      });
      currentData.push(cTemp);
      series.push({
        name: lineEle,
        data: currentData[i],
        type: lineType[i],
        areaStyle: { normal: {} },
      });
    });
    const temp = {
      name: currentName,
      data: series,
      legend: lineTag,
      title: cChartTitle,
    };
    chartData = temp;
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
          theme="macarons"
          style={{ height: '100%', minHeight: '370px', width: '100%' }}
          className="react_for_echarts"
        />
      </div>
    </div>
  );
};

ChartComponent.propTypes = {
  data: PropTypes.array,
  lines: PropTypes.array,
  xaxis: PropTypes.array,
  yaxis: PropTypes.array,
  title: PropTypes.string,
};

export default ChartComponent;
