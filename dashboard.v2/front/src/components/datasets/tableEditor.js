import React, { PropTypes } from 'react';
import { Form, Button, Input, Table, Icon, message } from 'antd';

const FormItem = Form.Item;
const ButtonGroup = Button.Group;

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

  redirectToAnalysor = () => {
    if (this.props.dataset.id === undefined || this.props.dataset.id === '') {
      message.warning('请先保存该数据集');
      return;
    }
    this.props.history.push(`/analysor/${this.props.dataset.id}`);
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

          <ButtonGroup>
            <Button icon="save" htmlType="submit" >保存</Button>
            <Button icon="scan" onClick={this.beforeLoadTableData}>加载数据</Button>
            <Button icon="area-chart" onClick={this.redirectToAnalysor}>分析</Button>
          </ButtonGroup>

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
