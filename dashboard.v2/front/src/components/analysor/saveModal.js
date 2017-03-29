import React, { PropTypes } from 'react';
import { Modal, Form, Button, Input, Tree, Icon, message } from 'antd';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

class SaveModal extends React.Component {

  constructor(props) {
    super();
    let expandedKeys = ['ROOT'];
    let selectedKeys = ['ROOT'];

    if (props.chart.id !== undefined && props.chart.id !== '') {
      expandedKeys = [props.chart.dirId].concat(expandedKeys);
      selectedKeys = [props.chart.dirId];
    }
    this.state = {
      add: { flag: true, count: 0 },
      visible: true,
      dirs: JSON.parse(JSON.stringify(props.dirs)),
      currDir: this.matchDir(props.dirs, props.chart.dirId),
      expandedKeys,
      selectedKeys,
    };
  }

  componentWillReceiveProps(nextprops) {
    if (!this.state.visible) {  // visible 为fasle才初始化该component的state。目的是为了再次modal时，清空上一次脏数据。
      const dirs = JSON.parse(JSON.stringify(nextprops.dirs));
      let expandedKeys = ['ROOT'];
      let selectedKeys = ['ROOT'];

      if (nextprops.chart.id !== undefined && nextprops.chart.id !== '') {
        expandedKeys = [nextprops.chart.dirId].concat(expandedKeys);
        selectedKeys = [nextprops.chart.dirId];
      }

      this.setState({
        add: { flag: true, count: 0 },
        visible: true,
        dirs,
        currDir: this.matchDir(dirs, nextprops.chart.dirId),
        expandedKeys,
        selectedKeys,
      });
    }
  }

  componentDidUpdate() {
    if (this.folderName !== undefined && this.folderName !== null) {
      this.folderName.focus();
    }
  }

  onCancel =() => {
    this.clear();
  }

  onSelect = (info) => {
    this.setState({
      currDir: this.matchDir(this.state.dirs, info[0]),
      expandedKeys: this.state.expandedKeys.concat(info[0]),
      selectedKeys: info,
    });
  }

  onExpand =(expandedKeys) => {
    this.setState({
      expandedKeys,
    });
  }

  clear = () => {
    this.setState({
      add: { flag: true, count: 0 },
      visible: false,
      dirs: [],
      currDir: {},
      expandedKeys: [],
      selectedKeys: [],
    });
  }

  matchDir = (_dirs, dirId) => {
    let currDir = {};
    const loop = arrays => arrays.forEach((item) => {
      if (dirId === undefined) {
        return;
      }
      if (item.id === dirId) {
        currDir = item;
      } else if (item.subDir !== undefined && item.subDir.length !== 0) {
        loop(item.subDir);
      }
    });
    loop(_dirs);
    return currDir;
  }

  handleOk = () => {
    const dir = this.state.currDir;
    if (dir.id === undefined) {
      message.error('请选择目录');
      return;
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = this.props.data;
        data.title = values.title;
        data.dir = dir;
        this.props.onSaveOrUpdate(data);
        this.clear();
      }
    });
  }


  addFolder =() => {
    const addObj = {
      id: 'toAddId',
      name: '新建文件夹',
      type: 'chart',
      pre: this.state.currDir.id };
    const loop = arrays => arrays.map((item) => {
      const tmp = item;
      if (item.id === this.state.currDir.id) {
        tmp.subDir.unshift(addObj);
        return tmp;
      }
      if (item.subDir !== undefined && item.subDir.length !== 0) {
        tmp.subDir = loop(item.subDir);
      }
      return tmp;
    });
    this.setState({
      add: { flag: false, count: 1 },
      currDir: { ...addObj },
      dirs: this.state.selectedKeys[0] === 'ROOT' ? [addObj].concat(this.state.dirs) : loop(this.state.dirs),
    });
  }

  saveFolder =(item) => {
    const currDir = Object.assign({}, item);
    const name = this.folderName.refs.input.value;
    currDir.name = name;
    item.name = name; // 副作用
    this.setState({
      add: { flag: true, count: 1 },
      currDir,
      selectedKeys: [currDir.id],
    });
  }

  isDirSelected = (rule, value, callback) => {
    console.log(this.state.selectedKeys[0] !== undefined && this.state.selectedKeys[0] !== 'ROOT', this.state.selectedKeys);
    if (this.state.selectedKeys[0] !== undefined && this.state.selectedKeys[0] !== 'ROOT') {
      callback();
      return;
    }
    callback('请选择保存图表的目录');
  }

  render() {
    const { data, form } = this.props;
    const { getFieldDecorator } = form;
    const loop = treeData => treeData.map((item) => {
      if (item.subDir) {
        return <TreeNode title={item.name} key={item.id}>{loop(item.subDir)}</TreeNode>;
      }
      if (item.id === 'toAddId' && !this.state.add.flag) {
        const suffix = item.name ? <Icon type="check" onClick={() => this.saveFolder(item)} /> : null;
        return (<TreeNode
          title={<Input
            ref={(input) => { this.folderName = input; }}
            defaultValue={item.name} size="default" suffix={suffix}
          />} key={item.id}
        />);
      } else {
        return <TreeNode title={item.name} key={item.id} isLeaf />;
      }
    });
    const treeNodes = loop(this.state.dirs);

    return (<Modal
      visible={this.state.visible}
      title="保存图表"
      width={500}
      onCancel={this.onCancel}
      style={{ top: 30 }}
      footer={[
        <Button
          key="add" type="primary" size="large" disabled={!this.state.add.flag || this.state.add.count !== 0}
          onClick={this.addFolder}
        >新建目录</Button>,
        <Button key="cancel" type="ghost" size="large" onClick={this.onCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
          保存
        </Button>,
      ]}
    >

      <Form onSubmit={this.handleOk}>
        <FormItem label="名称：" {...formItemLayout}>
          {getFieldDecorator('title', {
            initialValue: data.title,
            rules: [
              {
                required: true,
                message: '名称未填写',
              },
            ],
          })(<Input />)}
        </FormItem>
        {/* <FormItem label="选择目录：" {...formItemLayout}>*/}
        {/* {getFieldDecorator('dirId', {*/}
        {/* initialValue: this.state.currDir.name || '',*/}
        {/* rules: [*/}
        {/* {*/}
        {/* required: true,*/}
        {/* message: '请选择下面的目录放置图表',*/}
        {/* },*/}
        {/* ],*/}
        {/* })(<Input disabled />)}*/}
        {/* </FormItem>*/}

        <Tree
          onSelect={this.onSelect} onExpand={this.onExpand}
          expandedKeys={this.state.expandedKeys}
          selectedKeys={this.state.selectedKeys}
        >
          <TreeNode title="根目录" key="ROOT" >
            {treeNodes}
          </TreeNode>
        </Tree>
      </Form>
    </Modal>);
  }
}

SaveModal.propTypes = {
  chart: PropTypes.object,
  dirs: PropTypes.array,
  data: PropTypes.object,
  onSaveOrUpdate: PropTypes.func,
};

export default Form.create()(SaveModal);
