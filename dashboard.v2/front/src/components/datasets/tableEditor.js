import React, { PropTypes } from 'react';
import { Form, Button, Input, Table } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

class TableEditor extends React.Component {
  constructor() {
    super();
    this.state = {};
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

  render() {
    const { loading, datasetName, tableData, loadTableData,
      form: { getFieldDecorator } } = this.props;

    const columns = [];
    if (tableData.length > 0) {
      Object.keys(tableData[0]).forEach((name) => {
        columns.push({ title: name, dataIndex: name, key: name, sorter: (a, b) => a > b });
      });
    }

    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <FormItem label="名称：" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: datasetName || '',
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
            <Button type="primary" size="large" onClick={loadTableData}>加载表数据</Button>
          </FormItem>
        </Form>
        <Table
          loading={loading} columns={columns} dataSource={tableData} size="middle"
        />
      </div>
    );
  }
}

TableEditor.propTypes = {
  loading: PropTypes.bool,
  datasetName: PropTypes.string,
  loadTableData: PropTypes.func,
};

export default Form.create()(TableEditor);
