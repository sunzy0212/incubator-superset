import React, { PropTypes } from 'react';
import { Tree } from 'antd';
const TreeNode = Tree.TreeNode;

class DragTree extends React.Component {

  state = {
    gData: [],
    expandedKeys: ['0-0', '0-0-0', '0-0-0-0'],
  }
  onDragEnd = (info) => {
    if (info.event.clientX > 300) {
      // console.log(info.node.props.eventKey);
      // console.log(info.event.clientX);
      this.props.addChartToReport(info.node.props.eventKey);
    }
  }
  onSelect = (key) => {
    this.props.getChartData(key[key.length - 1]);
  }
  onDrop = (info) => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    // const dragNodesKeys = info.dragNodesKeys;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...this.state.gData];
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (info.dropToGap) {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      ar.splice(i, 0, dragObj);
    } else {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
    }
    this.setState({
      gData: data,
    });
  }
  render() {
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <TreeNode key={item.key} title={item.title}>{loop(item.children)}</TreeNode>;
      }
      return <TreeNode key={item.key} title={item.title} />;
    });
    return (
      <Tree
        defaultExpandedKeys={this.state.expandedKeys}
        draggable
        onDragEnd={this.onDragEnd}
        onDrop={this.onDrop}
        onExpand={this.onSelect}
      >
        {loop(this.props.data)}
      </Tree>
    );
  }
}

DragTree.propTypes = {
  data: PropTypes.array,
  getChartData: PropTypes.func,
  addChartToReport: PropTypes.func,
};

export default DragTree;
