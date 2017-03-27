import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Table, Popconfirm, Button, message } from 'antd';
import TemplateEditor from './templateEditor';
import Switcher from './switcher';
import { getDir } from '../../services/dashboard';


class Template extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      currItem: { email: {}, reporter: {} },
      currDir: { name: '' },
      templates: [],
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: false,
      templates: nextProps.templates,
    });
  }

  onDelete = (id) => {
    this.props.dispatch({
      type: 'operator/removeTemplate',
      payload: { id },
    });
  }

  onOk =(data) => {
    this.props.dispatch({
      type: 'operator/updateTemplate',
      payload: data,
    });
    this.setState(
      { visible: false },
    );
  }

  onCancel =() => {
    this.setState({
      visible: false,
    });
  }

  onReportSwitch = (data) => {
    this.props.dispatch({
      type: 'operator/setCrontab',
      payload: { ...data, type: 'REPORT' },
    });
  }

  onEmailSwitch = (data) => {
    this.props.dispatch({
      type: 'operator/setCrontab',
      payload: { ...data, type: 'EMAIL' },
    });
  }

  getData = (datas) => {
    const temp = JSON.parse(JSON.stringify(datas));
    const data = [];
    temp.forEach((e, i) => {
      data.push({
        key: i,
        id: e.id,
        index: i + 1,
        name: e.name,
        desc: e.desc,
        reportId: e.reportId,
        item: e,
      });
    });
    return data;
  }
  showEditor=(record) => {
    let currDir = this.state.currDir;
    const dirId = record.reporter.preDirId;
    if (dirId !== undefined && dirId !== '') {
      getDir({ id: dirId })
       .then((data) => {
         currDir = data.result;
         this.setState({
           visible: true,
           currItem: record,
           currDir,
         });
       })
        .catch(() => {  // 日报目录被删除
          message.error('日报目录不存在');
          record.reporter.preDirId = '';
          this.setState({
            visible: true,
            currItem: record,
            currDir: { name: '' },
          });
        });
    } else {
      this.setState({
        visible: true,
        currItem: record,
        currDir,
      });
    }
  }

  addTemplate = () => {
    this.props.dispatch({
      type: 'operator/addTemplate',
      payload: { name: '新建模板', isTemplate: true },
    });
  }

  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
      }, {
        title: '模板名',
        key: 'name',
        render: record => <Link to={`/dashboard/edit/${record.reportId}`} query={{ isTemplate: true }}>{record.name}</Link>,
      }, {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
        render: text => <a href="#l">{text}</a>,
      }, {
        title: '日报',
        key: 'report',
        render: (record) => {
          const cronId = record.item.reporter.cronId;
          const switcherProps = {
            record: { ...record.item,
              cronId,
              crontab: record.item.crons[cronId] || { jobId: 0 } },
            onSwitch: this.onReportSwitch,
          };
          return <Switcher {...switcherProps} />;
        },
      }, {
        title: '邮件',
        key: 'email',
        render: (record) => {
          const cronId = record.item.email.cronId;
          const switcherProps = {
            record: { ...record.item,
              cronId,
              crontab: record.item.crons[cronId] || { jobId: 0 } },
            onSwitch: this.onEmailSwitch,
          };
          return <Switcher {...switcherProps} />;
        },
      }, {
        title: '操作',
        key: 'action',
        className: '',
        render: record => (
          <span>
            <a onClick={() => this.showEditor(record.item)}>编辑</a>
            <span className="ant-divider" />

            <Popconfirm title="确定删除该模板吗？" onConfirm={() => this.onDelete(record.id)}>
              <a icon="delete">删除</a>
            </Popconfirm>
          </span>
        ),
      }];

    const templateEditorProps = {
      visible: this.state.visible,
      item: this.state.currItem,
      currDir: this.state.currDir,
      onOk: this.onOk,
      onCancel: this.onCancel,
    };


    return (
      <div>
        <h3>模板引擎</h3>
        <TemplateEditor {...templateEditorProps} />
        <Table
          loading={this.props.loading}
          columns={columns} dataSource={this.getData(this.state.templates)} pagination size="middle"
        />
        <Button type="primary" onClick={() => this.addTemplate()}>新建模板</Button>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return { templates: state.operator.templates, loading: state.loading.models.operator };
}

export default connect(mapStateToProps)(Template);
