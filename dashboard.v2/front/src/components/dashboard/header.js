import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Button, Form, Input, Row, Col, Icon, DatePicker } from 'antd';
import ReportDeleteModal from './deleteReport';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Header = ({
  report,
  deleteModalVisible,
  updateTitle,
  openModal,
  onCancel,
  deleteReport,
  refreshChart,
  currentTimeRange,
  form: {
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

  function onChangeDateRange(item) {
    refreshChart(item[0].valueOf(), item[1].valueOf());
  }

  return (
    <Row gutter={24}>
      <Col lg={8} md={8}>
        <Input.Group compact>
          <Col lg={2} md={2}>
            <Icon type="lock" />
          </Col>
          <Col lg={20} md={20} >
            <Form layout="inline" onSubmit={handleSubmit}>
              <FormItem wrapperCol={{ span: 16 }}><div style={{ width: '250px' }}>{report.name} </div></FormItem>
            </Form>
          </Col>
          <Col lg={2} md={2}>
            <Link to={`/dashboard/edit/${report.id}`}><Icon type="edit" /></Link>
          </Col>
        </Input.Group>
      </Col>

      <Col lg={1} md={1} >
        <span className="ant-divider" />
      </Col>
      <Col lg={6} md={6} offset={2}>
        <Button type="ghost" icon="reload">刷新</Button>
        <Button type="danger" onClick={openModal} icon="delete">删除</Button>
        <Button type="ghost" icon="rocket">导出</Button>
      </Col>
      { currentTimeRange === '' ? <Col lg={4} md={4}>
        <RangePicker showTime onOk={onChangeDateRange} format="YYYY-MM-DD" />
      </Col> : '' }
      < ReportDeleteModal {...props} />
    </Row>
  );
};

Header.propTypes = {
  deleteReport: PropTypes.func,
  openModal: PropTypes.func,
  refreshChart: PropTypes.func,
};

export default Form.create()(Header);
