import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Tabs, Table } from 'antd';
import FieldHolder from '../components/datasets/fieldsHolder';
import TableEditor from '../components/datasets/tableEditor';
import RenameModal from '../components/datasets/renameModal';

const { Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

function Datasets({ dispatch, loading, datasets }) {
  const { dimensions, measures, times, renameModalVisibles, currentRecord, transformDateVisible,
    modalSpace, datasourceList, tableTreeVisibles, tables, tableData,
    currentDatasetId, currentDatasetName, MeasureUnitVisible } = datasets;

  const dimensionsProps = {
    title: '维度',
    records: [].concat(times).concat(dimensions),
    renameModalVisibles,
    transformDateVisible,
    currentRecord,
    MeasureUnitVisible,
    onEditor(data, title) {
      dispatch({
        type: 'datasets/showRenameModal',
        payload: { data, title },
      });
    },
    transToMeasure(record) {
      const cDimensions = dimensions.filter(x => x.name !== record.item.name);
      const cMeasures = measures;
      cMeasures.push(
        Object.assign(record.item),
      );
      dispatch({
        type: 'datasets/updateState',
        payload: { dimensions: cDimensions, measures: cMeasures },
      });
    },
    transformToDate(record) {
      dispatch({
        type: 'datasets/showTransformDate',
        payload: { record },
      });
    },
    transformToNumber(record) {
      const cDimensions = [];
      dimensions.forEach((ele, j) => {
        cDimensions.push(
          Object.assign(ele),
        );
        if (ele.name === record.item.name) {
          cDimensions[j].type = 'number';
        }
      });
      dispatch({
        type: 'datasets/updateState',
        payload: { dimensions: cDimensions },
      });
    },
    transformToString(record) {
      const cDimensions = [];
      dimensions.forEach((ele, j) => {
        cDimensions.push(
          Object.assign(ele),
        );
        if (ele.name === record.item.name) {
          cDimensions[j].type = 'string';
        }
      });
      dispatch({
        type: 'datasets/updateState',
        payload: { dimensions: cDimensions },
      });
    },
    showMeasureUnit(record) {
      dispatch({
        type: 'datasets/showMeasureUnit',
        payload: { record },
      });
    },
    onCancelUnit() {
      dispatch({
        type: 'datasets/hideMeasureUnit',
      });
    },
    addMeasureUnit(record) {
      const cDimensions = [];
      dimensions.forEach((ele, j) => {
        cDimensions.push(
          Object.assign(ele),
        );
        if (ele.name === record.currentRecord.name) {
          cDimensions[j].unit = record.unit;
        }
      });
      dispatch({
        type: 'datasets/saveMeasureUnit',
        payload: { dimensions: cDimensions },
      });
    },
    onCancelCreate() {
      dispatch({
        type: 'datasets/hideTransformDate',
      });
    },
    onCreateOk(data) {
      const cDimensions = dimensions.filter(x => x.name !== data.currentRecord.item.name);
      const cTimes = times.filter(x => x.name !== data.currentRecord.item.name);
      cTimes.push({ ...Object.assign(data.currentRecord.item), type: 'timestamp', transform: '2006-01-02' });
      dispatch({
        type: 'datasets/saveTransformDate',
        payload: { dimensions: cDimensions, times: cTimes },
      });
    },
  };
  const columns = [];
  for (const name in tableData[0]) {
    columns.push({
      title: name,
      dataIndex: name,
      key: name,
    });
  }

  function handleChange(pagination, filters, sorter) {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  const measuresProps = {
    title: '度量',
    records: measures,
    renameModalVisibles,
    currentRecord,
    onEditor(data, title) {
      dispatch({
        type: 'datasets/showRenameModal',
        payload: { data, title },
      });
    },
    onCancelSave() {
      dispatch({
        type: 'datasets/hideRenameModal',
      });
    },
    transToDimension(record) {
      const cMeasures = measures.filter(x => x.name !== record.item.name);
      const cDimensions = dimensions;
      cDimensions.push(
        Object.assign(record.item),
      );
      dispatch({
        type: 'datasets/updateState',
        payload: { measures: cMeasures, dimensions: cDimensions },
      });
    },
    checkAggregation(record, type) {
      const cMeasures = [];
      measures.forEach((ele, j) => {
        cMeasures.push(
          Object.assign(ele),
        );
        if (ele.name === record.item.name) {
          cMeasures[j].action = type;
        }
      });
      dispatch({
        type: 'datasets/updateState',
        payload: { measures: cMeasures },
      });
    },
  };
  let currentRecords = dimensions;
  let isDimensions = true;
  if (modalSpace.measures === true) {
    currentRecords = measures;
    isDimensions = false;
  }
  const props = {
    renameModalVisibles,
    currentRecord,
    records: currentRecords,
    onCancelSave() {
      dispatch({
        type: 'datasets/hideRenameModal',
      });
    },
    onCreateOk(data) {
      dispatch({
        type: 'datasets/updateName',
        payload: { data, isDimensions },
      });
    },
  };

  const tableEditorProps = {
    loading,
    datasourceList,
    tableTreeVisibles,
    tables,
    tableData,
    currentDatasetName,
    save(data) {
      dispatch({
        type: 'datasets/saveOrUpdate',
        payload: { ...data },
      });
    },
    loadTableTree() {
      dispatch({
        type: 'datasets/queryDatasources',
      });
    },
    getTableData(id) {
      dispatch({
        type: 'datasets/loadTables',
        payload: { id },
      });
    },
    onCancelLoad() {
      dispatch({
        type: 'datasets/hideTableTree',
      });
    },
    onLoadOk(data) {
      dispatch({
        type: 'datasets/newDataSet',
        payload: { name: data.name,
          datasourceId: data.datasourceId,
          datasetName: data.datasetName },
      });
    },
    loadTableData() {
      dispatch({
        type: 'datasets/getTableData',
        payload: { datasourceId: currentDatasetId, type: 'json' },
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
              <RenameModal {...props} />
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
              <Table
                loading={loading} columns={columns} dataSource={tableData} onChange={handleChange}
              />
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
