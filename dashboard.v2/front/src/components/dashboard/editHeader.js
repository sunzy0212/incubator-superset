import React, { PropTypes } from 'react';
import { Button, Form, Input, Row, Col, Icon, DatePicker } from 'antd';
import ReportDeleteModal from './deleteReport';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const EditHeader = ({
  report,
  updateTitle,
  onCancel,
  deleteReport,
  currentLayouts,
  saveChartToReport,
  refreshChart,
  currentTimeRange,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  const props = {
    onCancel,
    deleteReport,
    currentId: report.id,
  };

  function handleSubmit(e) {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        updateTitle(values.name);
      }
    });
  }
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
  }

  function onChangeDateRange(item) {
    refreshChart(item[0].valueOf(), item[1].valueOf());
  }

  return (
    <Row gutter={24}>
      <Col lg={8} md={8}>
        <Input.Group compact>
          <Col lg={2} md={2}>
            <Icon type="unlock" />
          </Col>
          <Col lg={20} md={20} >
            <Form inline onSubmit={handleSubmit}>
              <FormItem wrapperCol={{ span: 16 }}>
                {getFieldDecorator('name', {
                  initialValue: report.name,
                  rules: [
                    {
                      required: true,
                      message: '报表名不予许为空',
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Form>
          </Col>
          <Col lg={2} md={2}>
            <span />
          </Col>
        </Input.Group>
      </Col>

      <Col lg={1} md={1} >
        <span className="ant-divider" />
      </Col>
      <Col lg={6} md={6} offset={2}>
        <Button type="ghost" icon="save" onClick={onSave}>保存</Button>
        <Button type="ghost" icon="rocket">导出</Button>
      </Col>
      { currentTimeRange === '' ? <Col lg={4} md={4}>
        <RangePicker showTime onOk={onChangeDateRange} format="YYYY-MM-DD" />
      </Col> : '' }
      < ReportDeleteModal {...props} />
    </Row>
  );
};

EditHeader.propTypes = {
  deleteReport: PropTypes.func,
  saveChartToReport: PropTypes.func,
  refreshChart: PropTypes.func,
};

export default Form.create()(EditHeader);
