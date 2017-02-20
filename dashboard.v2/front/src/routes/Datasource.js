import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col, Tabs, Icon } from 'antd';
import DataSourceList from '../components/datasource/datasourceList';
import DataSetList from '../components/datasource/datasetList';
import DatSetModal from '../components/datasource/modal';
import DataSetSelect from '../components/datasource/dataSetSelect';
import TablesList from '../components/datasource/tablesList';

import styles from './Datasource.less';

const TabPane = Tabs.TabPane;

function Datasource({ dispatch, datasource }) {
  const { loading, saveLoading, item, modalVisible, dataSetType, datasources, tables,
    datasets } = datasource;


  const datasourceListProps = {
    loading,
    datasources,
    onEditor(id) {
      dispatch({
        type: 'datasource/showModal',
        payload: { id },
      });
    },
    onDelete(id) {
      dispatch({
        type: 'datasource/delete',
        payload: { id },
      });
    },
    onOk(data) {
      dispatch({
        type: 'datasource/save',
        payload: data,
      });
    },
    onCancel() {
      dispatch({
        type: 'datasource/hideModal',
      });
    },
    onLoadTables(id) {
      dispatch({
        type: 'datasource/loadTables',
        payload: { id },
      });
    },
  };

  const tablesListProps = {
    loading,
    tables,
    newDataSet(data) {
      dispatch({
        type: 'datasets/newDataSet',
        payload: { ...data },
      });
    },
  };


  const datasetModalProps = {
    saveLoading,
    visible: modalVisible,
    item,
    dataSetType,
    onOk(data) {
      dispatch({
        type: 'datasource/save',
        payload: data,
      });
    },
    onCancel() {
      dispatch({
        type: 'datasource/hideModal',
      });
    },
  };

  const datasetSelectProps = {
    dataSetType,
    onAddDataSet(_dataSetType) {
      dispatch({
        type: 'datasource/showModal',
        payload: { dataSetType: _dataSetType },
      });
    },
  };

  const datasetListProps = {
    loading,
    datasets,
    onInitDataSet(id) {
      dispatch({
        type: 'datasets/initDataset',
        payload: { id },
      });
    },
    onDelete(id) {
      dispatch({
        type: 'datasets/delete',
        payload: { id },
      });
    },
    onOk(data) {
      dispatch({
        type: 'datasets/save',
        payload: data,
      });
    },
    onCancel() {
      dispatch({
        type: 'datasets/hideModal',
      });
    },
  };

  function callBack(key) {
    if (key === '2') {
      dispatch({ type: 'datasource/queryDatasets' });
    }
  }

  const DataSetModalGen = () => <DatSetModal {...datasetModalProps} />;

  return (

    <Tabs defaultActiveKey="1" onChange={callBack}>
      <TabPane tab={<span><Icon type="hdd" />数据源</span>} key="1">
        <div >
          <DataSetModalGen />
          <Row gutter={24} type="flex" className={styles.topRow}>
            <Col span={2}>
           数据源管理
          </Col>
            <Col span={9} className={styles.subRow2Col} />
            <Col span={11}>
              <DataSetSelect {...datasetSelectProps} />
            </Col>
          </Row>

          <Row gutter={5}>
            <Col xs={4} sm={6} md={8} lg={12} span={24}>
              <DataSourceList {...datasourceListProps} />
            </Col>
            <Col xs={4} sm={6} md={8} lg={12} span={24}>
              <TablesList {...tablesListProps} />
            </Col>
          </Row>
        </div>
      </TabPane>
      <TabPane tab={<span><Icon type="inbox" />数据集</span>} key="2">
        <DataSetList {...datasetListProps} />
      </TabPane>
    </Tabs>
  );
}

Datasource.propTypes = {
  dispatch: PropTypes.func,
  datasource: PropTypes.object,
};


function mapStateToProps(state) {
  return { datasource: state.datasource };
}

export default connect(mapStateToProps)(Datasource);
