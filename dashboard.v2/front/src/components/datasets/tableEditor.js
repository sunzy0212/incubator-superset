import React, { PropTypes } from 'react';
import { Form, Button, Input, Table, Icon, message } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

class TableEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      tableData: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      tableData: nextProps.tableData,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          name: values.name,
        };
        this.props.save(data);
      }
    });
  }

  handleAddField = (name) => {
    const record = { name, type: 'string' };
    this.props.addField(record);
  }

  beforeLoadTableData = () => {
    if (this.props.dataset.id === undefined || this.props.dataset.id === '') {
      message.warning('请先保存该数据集');
      return;
    }
    this.props.loadTableData();
  }

  render() {
    const { loading, dataset, form: { getFieldDecorator } } = this.props;
    const { tableData } = this.state;
    const columns = [];
    if (tableData.length > 0 && loading === false) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        columns.push({
          title: <span><a onClick={() => this.handleAddField(name)} title="添加该字段到左侧的维度"><Icon type="select" /></a>{name}</span>,
          dataIndex: name,
          key: i,
          sorter: (a, b) => a > b,
        });
      }
    }

    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <FormItem label="名称：" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: dataset.name || '',
              rules: [
                {
                  required: true,
                  message: '名称未填写',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem wrapperCol={{ span: 12, offset: 6 }}>
            <Button type="primary" htmlType="submit" size="large">保存</Button>
          </FormItem>
          <FormItem wrapperCol={{ span: 12, offset: 6 }}>
            <Button type="primary" size="large" onClick={this.beforeLoadTableData}>加载表数据</Button>
          </FormItem>
        </Form>
        <Table
          loading={loading} columns={columns} dataSource={tableData} size="middle" bordered
        />
      </div>
    );
  }
}

TableEditor.propTypes = {
  loading: PropTypes.bool,
  dataset: PropTypes.object,
  loadTableData: PropTypes.func,
  addField: PropTypes.func,
};

export default Form.create()(TableEditor);
