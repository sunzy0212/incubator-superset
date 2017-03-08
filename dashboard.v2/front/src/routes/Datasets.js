import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Tabs } from 'antd';
import FieldHolder from '../components/datasets/filedsHolder';
import TableEditor from '../components/datasets/tableEditor';

const { Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

function Datasets({ dispatch, datasets }) {
  const { loading, dimensions, measures, updateNameModal, currentDimensions } = datasets;

  const dimensionsProps = {
    title: '维度',
    records: dimensions,
    updateNameModal,
    currentDimensions,
    onEditor(cdimensions) {
      console.log(cdimensions);
      dispatch({
        type: 'datasets/showUpdateModal',
        payload: { cDimensions: cdimensions },
      });
    },
    onCancelSave() {
      dispatch({
        type: 'datasets/hideUpdateModal',
      });
    },
    onCreateOk(data) {
      for (let i = 0; i < dimensions.length; i++) {
        if (dimensions[i].name === data.sourceName) {
          dimensions[i].alias = data.name;
        }
      }
      dispatch({
        type: 'datasets/updateDimensionsName',
        payload: { cDimensions: dimensions },
      });
    },
  };

  const measuresProps = {
    title: '度量',
    records: measures,
    updateNameModal,
  };

  const tableEditorProps = {
    loading,
    save(data) {
      dispatch({
        type: 'datasets/saveOrUpdate',
        payload: { ...data },
      });
    },
  };

  function callback(key) {
    console.log(key);
  }

  return (
    <Layout style={{ padding: 0, margin: '0px 0px' }} >
      <Sider
        style={{ background: '#fff', padding: 0, margin: '0px 0px' }}
        trigger={null}
        collapsible
        // collapsed={this.state.collapsed}
      >
        <div>
          <Row>
            <Col span={24} style={{ minHeight: 35 }} >
              <span style={{ height: '35px', lineHeight: '35px', margin: '0px 0px' }}><h3>数据集工作台</h3></span>

            </Col>
            <Col span={24} style={{ minHeight: 350 }} >
              <FieldHolder {...dimensionsProps} />
            </Col>

            <Col span={24} >
              <FieldHolder {...measuresProps} />
            </Col>
          </Row>
        </div>
      </Sider>
      <Layout>
        <Content style={{ margin: '1px 1px', padding: 0, background: '#fff', minHeight: 580 }}>
          <Tabs onChange={callback} type="card">
            <TabPane tab="开始" key="1"><TableEditor {...tableEditorProps} />主要的工作区域，表格展示数据</TabPane>
            <TabPane tab="连接" key="2">多数据源(多表)，关联关系的工作区</TabPane>
            <TabPane tab="图表" key="3">图形的区域，暂时略</TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
}

function mapStateToProps(state) {
  return { datasets: state.datasets };
}
Datasets.propTypes = {
  dispatch: PropTypes.func,
  datasets: PropTypes.object,
};

export default connect(mapStateToProps)(Datasets);
