import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Tabs } from 'antd';
import FieldHolder from '../components/datasets/fieldsHolder';
import TableEditor from '../components/datasets/tableEditor';

const { Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

function Datasets({ dispatch, loading, datasets }) {
  const { dimensions, measures, times, dataset, tableData } = datasets;

  const dimensionsProps = {
    title: '维度',
    records: [].concat(times).concat(dimensions),
    onRenameOk(data) {
      dispatch({
        type: 'datasets/updateName',
        payload: data,
      });
    },
    transToMeasure(record) {
      const cDimensions = dimensions.filter(x => x.id !== record.id);
      const cMeasures = measures;
      cMeasures.push(Object.assign(record));
      dispatch({
        type: 'datasets/updateState',
        payload: { dimensions: cDimensions, measures: cMeasures },
      });
    },

    transformToDate(data) {
      dispatch({
        type: 'datasets/saveTransformDate',
        payload: data,
      });
    },

    transformToNumber(record) {
      dispatch({
        type: 'datasets/saveTransformToNumber',
        payload: { record },
      });
    },
    transformToString(record) {
      dispatch({
        type: 'datasets/saveTransformToString',
        payload: { record },
      });
    },

    addMeasureUnit(data) {
      dispatch({
        type: 'datasets/saveMeasureUnit',
        payload: data,
      });
    },
  };

  const measuresProps = {
    title: '度量',
    records: measures,
    onRenameOk(data) {
      dispatch({
        type: 'datasets/updateName',
        payload: data,
      });
    },
    transToDimension(record) {
      const cMeasures = measures.filter(x => x.id !== record.id);
      const cDimensions = dimensions;
      cDimensions.push(Object.assign(record));
      dispatch({
        type: 'datasets/updateState',
        payload: { measures: cMeasures, dimensions: cDimensions },
      });
    },
    addMeasureUnit(data) {
      dispatch({
        type: 'datasets/saveMeasureUnit',
        payload: data,
      });
    },
    checkAggregation(record, type) {
      const cMeasures = measures.map((elem) => {
        const tmp = Object.assign(elem);
        if (elem.id === record.id) {
          tmp.action = type;
        }
        return tmp;
      });
      dispatch({
        type: 'datasets/updateState',
        payload: { measures: cMeasures },
      });
    },
  };

  const tableEditorProps = {
    loading,
    datasetName: dataset.name,
    tableData,
    save(data) {
      dispatch({
        type: 'datasets/saveOrUpdate',
        payload: { ...data },
      });
    },
    loadTableData() {
      dispatch({
        type: 'datasets/queryDatasetData',
        payload: { id: dataset.id, type: 'json', limit:'1000' },
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
        <Content style={{ margin: '1px 1px', padding: 0, background: '#fff' }}>
          <Tabs onChange={callback} type="card">
            <TabPane tab="开始" key="1">
              <TableEditor {...tableEditorProps} />
            </TabPane>
            <TabPane tab="连接" key="2">多数据源(多表)，关联关系的工作区</TabPane>
            <TabPane tab="图表" key="3">图形的区域，暂时略</TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
}

function mapStateToProps(state) {
  return { datasets: state.datasets, loading: state.loading.models.datasets };
}
Datasets.propTypes = {
  dispatch: PropTypes.func,
  datasets: PropTypes.object,
};

export default connect(mapStateToProps)(Datasets);
