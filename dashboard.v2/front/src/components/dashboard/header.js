import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Button, Form, Input, Row, Col, Icon, DatePicker } from 'antd';
import ReportDeleteModal from './deleteReport';

const FormItem = Form.Item;
const MODE_READ = 'read';
const MODE_ALTER = 'alter';
const { RangePicker } = DatePicker;
const Header = ({
  status,
  titleStatus,
  report,
  editTitle,
  deleteModalVisible,
  updateTitle,
  openModal,
  onCancel,
  deleteReport,
  currentLayouts,
  saveChartToReport,
  refreshChart,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  const props = {
    deleteModalVisible,
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
  function onSave() {
    const layouts = []
    currentLayouts.lg.forEach((ele) => {
      layouts.push({
        chartId: ele.i,
        data: [ele],
      });
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
            {status === MODE_READ ? <Icon type="lock" />
              : <Icon type="unlock" />}
          </Col>
          <Col lg={20} md={20} >
            <Form inline onSubmit={handleSubmit}>
              {
                titleStatus === MODE_READ ?
                  <FormItem wrapperCol={{ span: 16 }}><div style={{ width: '250px' }}>{report.name} </div></FormItem>
                :
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
              }
              {
                status === MODE_ALTER ?
                  <FormItem wrapperCol={{ span: 8 }}>
                    {
                      titleStatus === MODE_READ ? <Link href="#" onClick={editTitle}><Icon type="edit" /></Link>
                      : <Button type="ghost" htmlType="submit" icon="save" />
                    }
                  </FormItem>
                  : ''
              }
            </Form>

          </Col>
          <Col lg={2} md={2}>
            {status === MODE_READ ? <Link to={`/dashboard/edit/${report.id}`}><Icon type="edit" /></Link>
              : <span />}
          </Col>
        </Input.Group>
      </Col>

      <Col lg={1} md={1} >
        <span className="ant-divider" />
      </Col>
      <Col lg={6} md={6} offset={2}>
        {status === MODE_READ ? <Button type="ghost" icon="reload">刷新</Button>
          : <Button type="ghost" icon="save" onClick={onSave}>保存</Button>}
        {status !== MODE_READ ? ''
          : <Button type="ghost" onClick={openModal} icon="delete">删除</Button>}
        <Button type="ghost" icon="rocket">导出</Button>
      </Col>
      <Col lg={4} md={4}>
        <RangePicker showTime onOk={onChangeDateRange} format="YYYY-MM-DD" />
      </Col>
      < ReportDeleteModal {...props} />
    </Row>
  );
};

Header.propTypes = {
  status: PropTypes.string,
  deleteReport: PropTypes.func,
  openModal: PropTypes.func,
  saveChartToReport: PropTypes.func,
  refreshChart: PropTypes.func,
};

export default Form.create()(Header);
