import React, { PropTypes } from 'react';
import { Cascader, Form, Button } from 'antd';


const FormItem = Form.Item;

const Switcher = ({
  record,
  onSwitch,
  form: {
  getFieldDecorator,
  validateFields,
} }) => {
  const rangeArray = (start, end) => Array(end - start + 1).fill(0).map((v, i) => i + start);

  const options = [{
    value: 'day',
    label: '每天',
    children: [{
      value: 'hour',
      label: '每时',
      children: [{
        value: 'minute',
        label: '每分',
        children: rangeArray(0, 59).map((i) => { return { value: `s${i}`, label: `${i}秒` }; }),
      }].concat(rangeArray(0, 59).map((i) => { return { value: `m${i}`, label: `${i}分` }; })),
    }].concat(rangeArray(0, 23).map((i) => { return { value: `h${i}`, label: `${i}点` }; })),
  }, {
    value: 'week',
    label: '每周',
    disabled: true,
    children: rangeArray(1, 7).map((i) => {
      return { value: `w${i}`,
        label: `星期${i}`,
        children: rangeArray(0, 23).map((j) => { return { value: `h${j}`, label: `${j}点` }; }) };
    }),
  },
  ];


  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const data = {
          tempId: record.id,
          cronId: record.cronId,
          switch: record.crontab.jobId === 0,
          rules: values.ruleData,
        };
        onSwitch(data);
      }
    });
  }

  let initSpec = [];
  if (record.crontab !== undefined && record.crontab.rules !== undefined) {
    initSpec = record.crontab.rules;
  }

  return (
    <Form onSubmit={handleSubmit} layout="inline">
      <div>
        <FormItem>
          {getFieldDecorator('ruleData', {
            initialValue: initSpec,
            rules: [
              {
                required: true,
                message: '请选择',
              },
            ],
          })(<Cascader options={options} size="large" expandTrigger="hover" />)}
        </FormItem>

        <span className="ant-divider" />

        <Button
          type="primary" shape="circle" htmlType="submit" size="small"
          disabled={record.crontab.jobId !== 0}
        >
          开
        </Button>

        <Button
          type="primary" shape="circle" htmlType="submit" size="small"
          disabled={record.crontab.jobId === 0}
        >
         关
       </Button>
      </div>
    </Form>
  );
};


Switcher.propTypes = {
  record: PropTypes.object,
  onSwitch: PropTypes.func,
};

export default Form.create()(Switcher);
