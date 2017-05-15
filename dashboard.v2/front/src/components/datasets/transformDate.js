import React, { PropTypes } from 'react';
import { Modal, Button, Form , Select} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const TransformDate = ({ modalVisible, onOk, onCancel, currRecord,
  form: {
    getFieldDecorator, validateFields, resetFields,
  } }) => {
  function handleOk() {
    validateFields((err, values) => {
      if (!err) {
        const record = Object.assign(currRecord);
        record.transform = values.transform;
        onOk({ record });
        onCancel();
        resetFields();
      }
    });
  }
  return (
    <Modal
      visible={modalVisible}
      title={`自定义日期格式 (${currRecord.transform || 'yyyy-MM-dd'})`}
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
        <FormItem label="格式" {...formItemLayout}>
          {getFieldDecorator('transform', {
            initialValue: currRecord.transform || 'yyyy-MM-dd',
            rules: [
              {
                required: true,
                message: '未填写',
              },
            ],
          })(<Select>
            <Option key="yyyy-MM-dd" value="yyyy-MM-dd">yyyy-MM-dd</Option>
            <Option key="yyyy-MM-dd HH:mm:ss" value="yyyy-MM-dd HH:mm:ss">yyyy-MM-dd HH:mm:ss</Option>
            <Option key="yyyy-M-d" value="yyyy-M-d">yyyy-M-d</Option>
            <Option key="yy-MM-dd" value="yy-MM-dd">yy-MM-dd</Option>
            <Option key="yyyy-MM" value="yyyy-MM">yyyy-MM</Option>
            <Option key="yy-MM" value="yy-MM">yy-MM</Option>

            <Option key="yyyyMMdd" value="yyyyMMdd">yyyyMMdd</Option>
            <Option key="yyyyMMdd HHmmss" value="yyyyMMdd HHmmss">yyyyMMdd HHmmss</Option>

            <Option key="yyyy/MM/dd" value="yyyy/MM/dd">yyyy/MM/dd</Option>
            <Option key="yyyy/MM/dd HH:mm:ss" value="yyyy/MM/dd HH:mm:ss">yyyy/MM/dd HH:mm:ss</Option>

          </Select>)}
        </FormItem>
      </Form>
    </Modal>
  );
};

TransformDate.propTypes = {
  modalVisible: PropTypes.bool,
  currRecord: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(TransformDate);
