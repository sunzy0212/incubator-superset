import React, { PropTypes } from 'react';
import { Modal, Menu, Icon, Button, Form, Input } from 'antd';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const tableTreeModal = ({ tableTreeVisibles, onLoadOk, onCancelLoad,
  datasourceList, getTableData, tables, form: {
  getFieldDecorator, validateFields,
} }) => {
  let currentItem = {};
  function genSubMenu(datasources, tableList) {
    return datasources.map((item) => {
      return (
        <SubMenu key={item.id} title={<span > <Icon type="folder" /> {item.name} </span>} >
          {genMenuItem(tableList)}
        </SubMenu>
      );
    });

    function genMenuItem(_tables) {
      if (_tables !== undefined && _tables.length !== 0) {
        return _tables.map((table) => {
          return (<MenuItem key={table.id} name={table.name}>
            < Icon type="file" /> {table.name}
          </MenuItem>);
        });
      }
    }
  }
  function handleOpen(item) {
    getTableData(item[0]);
  }

  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const data = {
          datasetName: values.name,
          name: currentItem.item.props.name,
          datasourceId: currentItem.keyPath[1],
        };
        onLoadOk(data);
      }
    });
  }

  function saveSelectItem(item) {
    currentItem = item;
  }

  return (
    <Modal
      visible={tableTreeVisibles}
      title="数据表列表"
      onCancel={onCancelLoad}
      footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancelLoad}>取消</Button>,
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
          确定
        </Button>,
      ]}
    >
      <Form onSubmit={handleOk}>
        <FormItem label="数据集名称：" {...formItemLayout}>
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
      </Form>
      <div>
        <Menu onClick={saveSelectItem} onOpenChange={handleOpen} mode="inline">{genSubMenu(datasourceList, tables)}</Menu>
      </div>
    </Modal>
  );
};

tableTreeModal.propTypes = {
  datasourceList: PropTypes.array,
  tables: PropTypes.array,
  onLoadOk: PropTypes.func,
  onCancelLoad: PropTypes.func,
  getTableData: PropTypes.func,
};

export default Form.create()(tableTreeModal);
