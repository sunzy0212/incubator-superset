import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Button, Form, Input, Row, Col, Icon } from 'antd';
import ReportDeleteModal from './deleteReport';

const FormItem = Form.Item;
const MODE_READ = 'read';
const MODE_ALTER = 'alter';
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

  return (
    <Row gutter={24}>
      <Col lg={12} md={12}>
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
      <Col lg={8} md={8} offset={2}>
        {status === MODE_READ ? <Button type="ghost" icon="reload">刷新</Button>
          : <Button type="ghost" icon="save" onClick={onSave}>保存</Button>}
        <Button type="ghost" onClick={openModal} icon="delete">删除</Button>
        <Button type="ghost" icon="rocket">导出</Button>
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
};

export default Form.create()(Header);
