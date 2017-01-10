import React, { PropTypes } from 'react';
import { Button, Form, Radio } from 'antd';
import { DataSetTypes } from './constants';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

const DataSetSelect = ({
  dataSetType,
  onAddDataSet,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  function onSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onAddDataSet(values.dataSetType);
      }
    });
  }

  return (
    <Form inline onSubmit={onSubmit}>
      <FormItem >
        {getFieldDecorator('dataSetType', {
          initialValue: dataSetType,
          rules: [
            {
              required: true,
              message: '请选择数据源类型',
            },
          ],
        })(
          <RadioGroup>
            {
              DataSetTypes.map(item =>
                <Radio
                  key={item.name} value={item.name} disabled={!item.available}
                >{item.name}</Radio>,
            )
            }
          </RadioGroup>,
        )}
      </FormItem>
      <FormItem>
        <Button size="large" htmlType="submit" icon="plus-circle-o">新增数据源</Button>
      </FormItem>
    </Form>
  );
};
DataSetSelect.propTypes = {
  dataSetType: PropTypes.string,
  onAddDataSet: PropTypes.func,
};

export default Form.create()(DataSetSelect);
