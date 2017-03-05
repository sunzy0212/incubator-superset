import React, { PropTypes } from 'react';
import { Input } from 'antd';
import styles from '../aside.less';
import DragTree from './dropTree';

const Aside = ({ dirs, getChartData, charts, addChartToReport,

}) => {
  const rootDir = [{ key: 'Root', title: '根目录', children: [], idDir: true }];

  let data = [];
  function handleInitDataOne(currentDirs, treeDirs) {
    currentDirs.forEach((dirEle, j) => {
      treeDirs.push({
        key: dirEle.id,
        title: dirEle.name,
        children: [{ key: `key+${j}`, title: '' }],
        idDir: true,
      });

      handleInitDataOne(dirEle.subDir, treeDirs[j].children);
    });
  }
  function handleInitData(currentDirs, treeDirs) {
    currentDirs.forEach((dirEle, j) => {
      treeDirs.push({
        key: dirEle.id,
        title: dirEle.name,
        children: [],
        idDir: true,
      });

      handleInitData(dirEle.subDir, treeDirs[j].children);
    });
  }
  const treeDirs = [];
  if (charts.length === 0) {
    handleInitDataOne(dirs, treeDirs);
  } else {
    handleInitData(dirs, treeDirs);
  }
  rootDir[0].children = treeDirs;
  function handleInitCharts(currentDirs) {
    currentDirs.forEach((dirEle) => {
      charts.forEach((e) => {
        if (dirEle.key === e.dirId) {
          dirEle.children.push({
            key: e.id,
            title: e.title,
            idDir: false,
          });
        }
      });
      if (dirEle.children !== undefined) {
        handleInitCharts(dirEle.children);
      }
    });
  }

  handleInitCharts(rootDir);
  data = rootDir;
  const treeProps = {
    data,
    getChartData,
    addChartToReport,
  };
  return (
    <div className={styles.main}>
      <div className={styles.topTitle}>
        <div>
          <span>报表制作</span>
        </div>
        <Input.Search placeholder="关键字查找" onSearch={value => console.log(value)} />
      </div>
      <DragTree {...treeProps} />
    </div>
  );
};

Aside.propTypes = {
  getChartData: PropTypes.func,
  addChartToReport: PropTypes.func,
};

export default Aside;
