import React, { PropTypes } from 'react';
import { Form, Button, Input } from 'antd';
import TableTreeModal from './tableTreeModal';

const FormItem = Form.Item;

const TableEditor = ({ save, loadTableTree, datasourceList, tableTreeVisibles, currentDatasetName,
  getTableData, tables, onCancelLoad, onLoadOk, loadTableData, form: {
  getFieldDecorator,
  validateFields,
},
}) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const data = {
          name: values.name,
        };
        save(data);
      }
    });
  }
  const props = {
    datasourceList,
    tableTreeVisibles,
    getTableData,
    tables,
    onCancelLoad,
    onLoadOk,
  }

  return (
    <div>
      <Form inline onSubmit={handleSubmit}>
        <FormItem label="名称：" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: currentDatasetName,
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
          <Button type="primary" size="large" onClick={loadTableTree}>加载表结构</Button>
        </FormItem>
        <FormItem wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" size="large" onClick={loadTableData}>加载表数据</Button>
        </FormItem>
      </Form>
      <TableTreeModal {...props} />
    </div>
  );
};

TableEditor.propTypes = {
  loadTableTree: PropTypes.func,
  loadTableData: PropTypes.func,
  datasourceList: PropTypes.array,
  getTableData: PropTypes.func,
  onCancelLoad: PropTypes.func,
  onLoadOk: PropTypes.func,
  currentDatasetName: PropTypes.string,
};

export default Form.create()(TableEditor);
