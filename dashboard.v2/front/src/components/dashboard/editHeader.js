import React, { PropTypes } from 'react';
import { Button, Form, Input, Row, Col, Popconfirm, DatePicker } from 'antd';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const EditHeader = ({
  history,
  report,
  updateTitle,
  currentLayouts,
  saveChartToReport,
  refreshChart,
  currentTimeRange,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  function onSave(e) {
    e.preventDefault();
    const layouts = [];
    currentLayouts.lg.forEach((ele) => {
      layouts.push({
        chartId: ele.i,
        data: [ele],
      });
    });
    validateFields((err, values) => {
      if (!err) {
        updateTitle(values.name);
      }
    });
    saveChartToReport(report.id, layouts);
    history.push(`/dashboard/${report.id}`);
  }

  function onCancel() {
    history.push(`/dashboard/${report.id}`);
  }

  function onChangeDateRange(item) {
    refreshChart(item[0].valueOf(), item[1].valueOf());
  }

  return (
    <Row gutter={24}>
      <Col lg={8} md={8}>
        <Form>
          <FormItem >
            {getFieldDecorator('name', {
              initialValue: report.name,
              rules: [
                {
                  required: true,
                  message: '报表名不予许为空',
                },
              ],
            })(<Input size="default" />)}
          </FormItem>
        </Form>
      </Col>

      <Col lg={1} md={1} >
        <span className="ant-divider" />
      </Col>
      <Col lg={6} md={6} offset={2}>
        <Button type="ghost" icon="save" size="small" onClick={onSave}>保存</Button>
        <Popconfirm title="确定取消保存吗？" onConfirm={() => onCancel()}>
          <Button type="ghost" icon="close-square-o" size="small" >取消</Button>
        </Popconfirm>
      </Col>
      { currentTimeRange === '' ? <Col lg={4} md={4}>
        <RangePicker showTime onOk={onChangeDateRange} format="YYYY-MM-DD" />
      </Col> : '' }
    </Row>
  );
};

EditHeader.propTypes = {
  saveChartToReport: PropTypes.func,
  refreshChart: PropTypes.func,
};

export default Form.create()(EditHeader);
