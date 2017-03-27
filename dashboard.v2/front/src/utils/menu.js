module.exports = [
  {
    key: 'datasource',
    name: '数据源',
    icon: 'appstore-o',
  },
  {
    key: 'dashboard',
    name: '仪表盘',
    icon: 'desktop',
  },
  {
    key: 'operator',
    name: '总控中心',
    icon: 'setting',
    child: [
      {
        key: 'template',
        name: '模板引擎',
        icon: 'solution',
      },
    ],
  },
];
