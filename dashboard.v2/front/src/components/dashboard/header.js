import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Button, Form, Input, Row, Col, Icon, DatePicker } from 'antd';
import ReportDeleteModal from './deleteReport';

const { RangePicker } = DatePicker;
const Header = ({
  report,
  deleteModalVisible,
  openModal,
  onCancel,
  deleteReport,
  refreshChart,
  changeRangeTime,
  currentTimeRange,
}) => {
  const props = {
    deleteModalVisible,
    onCancel,
    deleteReport,
    currentId: report.id,
  };

  function onChangeDateRange(item) {
    changeRangeTime(item[0].valueOf(), item[1].valueOf());
  }

  return (
    <Row gutter={24}>
      <Col lg={8} md={8}>
        <Input.Group compact>
          <Col lg={22} md={22}>
            <div>
              <Icon type="lock" />
              <span style={{ width: '250px' }}>{report.name} </span>
            </div>
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
        <Button type="ghost" icon="reload" size="small" onClick={() => refreshChart()}>刷新</Button>
        <Button type="danger" onClick={openModal} icon="delete" size="small">删除</Button>
        <Button type="ghost" icon="rocket" size="small">导出</Button>
        <a href="javascript:location.href='mailto:?SUBJECT='+document.title+'&BODY='+escape(location.href);"><Icon type="mail" /></a>

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
