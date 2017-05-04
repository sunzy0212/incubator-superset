import React, { PropTypes } from 'react';
import moment from 'moment';
import { Button, Form, Input, Row, Col, Popconfirm, DatePicker, Alert } from 'antd';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const EditHeader = ({
  history,
  report,
  updateTitle,
  saveChartsToReport,
  refreshChart,
  showTimePick,
  currentTimeRange,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  function onSave(e) {
    e.preventDefault();

    validateFields((err, values) => {
      if (!err) {
        updateTitle(values.name);
      }
    });
    saveChartsToReport();
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
      <Col lg={6} md={6} >
        <Button type="ghost" icon="save" size="small" onClick={onSave}>保存</Button>
        <Popconfirm title="确定取消保存吗？" onConfirm={() => onCancel()}>
          <Button type="ghost" icon="close-square-o" size="small" >取消</Button>
        </Popconfirm>
      </Col>
      { showTimePick ? <Col lg={8} md={8}>
        <Row>
          <Col lg={24} md={24}>
            <RangePicker
              defaultValue={currentTimeRange}
              ranges={{ 今天: [moment().startOf('day'), moment().endOf('day')],
                昨天: [moment().add(-1, 'day').startOf('day'), moment().add(-1, 'day').endOf('day')],
                上周: [moment().startOf('week'), moment().endOf('week')],
                本月: [moment().startOf('month'), moment().endOf('month')],
                上月: [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')] }}
              showTime onOk={onChangeDateRange} format="YYYY-MM-DD HH:mm:ss"
            />
          </Col>
        </Row>
        <Row>
          <Col lg={24} md={24}>
            <Alert type="info" message="默认查询您今天的数据" showIcon closable />
          </Col>
        </Row>
      </Col> : '' }
    </Row>
  );
};

EditHeader.propTypes = {
  saveChartsToReport: PropTypes.func,
  refreshChart: PropTypes.func,
  showTimePick: PropTypes.bool,
  currentTimeRange: PropTypes.array,
};

export default Form.create()(EditHeader);
