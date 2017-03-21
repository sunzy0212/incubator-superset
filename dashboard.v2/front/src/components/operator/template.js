import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Table, Popconfirm, Button } from 'antd';
import TemplateEditor from './templateEditor';
import Switcher from './switcher';

class Template extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      currItem: {},
      templates: [],
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: false,
      templates: this.getData(nextProps.templates) || [],
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
        cronId: e.cronId,
        crontab: Object.assign({}, e.crontab),
      });
    });
    return data;
  }
  showEditor=(record) => {
    this.setState({
      visible: true,
      currItem: record,
    });
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
          const switcherProps = {
            record: record.crontab.type === 'REPORT' ? record : { ...record, crontab: { jobId: 0 } },
            onSwitch: this.onReportSwitch,
          };
          return <Switcher {...switcherProps} />;
        },
      }, {
        title: '邮件',
        key: 'email',
        render: (record) => {
          const switcherProps = {
            record: record.crontab.type === 'EMAIL' ? record : { ...record, crontab: { jobId: 0 } },
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
            <a onClick={() => this.showEditor(record)}>编辑</a>
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
