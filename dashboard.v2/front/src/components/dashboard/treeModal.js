import React, { PropTypes } from 'react';
import { Modal, Button, Input, Form, Table } from 'antd';
import styles from './aside.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  width: '90%',
}];

let data = [];

let onSelectDir = '';

const rowSelection = {
  type: 'radio',
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
    onSelectDir = record;
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};

const TreeModal = ({ visible, onOk, onCancel, dirs,
  form: {
    getFieldDecorator, validateFields,
  } }) => {
  function handleInitData(currentDirs, transformArr) {
    currentDirs.forEach((dirELe, i) => {
      transformArr.push({ key: dirELe.id, name: dirELe.name, children: [] });
      handleInitData(dirELe.subDir, transformArr[i].children);
    });
  }
  const transformArr = [];
  handleInitData(dirs, transformArr);
  data = transformArr;

  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const currentData = {
          name: values.name,
          dirId: onSelectDir.key,
        };
        onOk(currentData);
      }
    });
  }

  return (
    <Modal
      visible={visible}
      title="新增报表"
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <Form onSubmit={handleOk}>
        <FormItem label="名称：" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '名称未填写',
              },
            ],
          })(<Input />)}
        </FormItem>

        <div className={styles.scroll}>
          <Table columns={columns} rowSelection={rowSelection} size={'default'} pagination={false} dataSource={data} showHeader={false} />
        </div>
      </Form>
    </Modal>
  );
};

TreeModal.propTypes = {
  visible: PropTypes.bool,
  dirs: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(TreeModal);
