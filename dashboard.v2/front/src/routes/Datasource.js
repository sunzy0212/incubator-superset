import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col, Tabs, Icon, Button } from 'antd';
import DataSourceList from '../components/datasource/datasourceList';
import DataSetList from '../components/datasource/datasetList';
import DatSetModal from '../components/datasource/modal';
import TablesList from '../components/datasource/tablesList';

import styles from './Datasource.less';

const TabPane = Tabs.TabPane;

function Datasource({ dispatch, datasource }) {
  const { loading, saveLoading, item, modalVisible, datasources, tables,
    datasets } = datasource;

  const datasourceListProps = {
    loading,
    datasources,
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

  const datasetListProps = {
    loading,
    datasets,
    onInitDataSet(id) {
      dispatch({
        type: 'datasets/initDataSet',
        payload: { id },
      });
    },
    onDelete(id) {
      dispatch({
        type: 'datasets/delete',
        payload: { id },
      });
      dispatch({
        type: 'datasource/queryDatasets',
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

  function showModal() {
    dispatch({
      type: 'datasource/showModal',
    });
  }

  function callBack(key) {
    if (key === '2') {
      dispatch({ type: 'datasource/queryDatasets' });
    }
  }

  return (

    <Tabs defaultActiveKey="1" onChange={callBack}>
      <TabPane tab={<span><Icon type="hdd" />数据源</span>} key="1">
        <div >
          <DatSetModal {...datasetModalProps} />
          <Row gutter={24} type="flex" className={styles.topRow}>
            <Col span={2}>
           数据源管理
          </Col>
            <Col span={18} className={styles.subRow2Col} />
            <Col span={2}>
              <Button size="large" icon="plus-circle-o" onClick={showModal}>新增数据源</Button>
            </Col>
          </Row>

          <Row gutter={5}>
            <Col lg={10} span={24}>
              <DataSourceList {...datasourceListProps} />
            </Col>
            <Col lg={14} span={24}>
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
  datasets: PropTypes.object,
};


function mapStateToProps(state) {
  return { datasource: state.datasource, datasets: state.datasets, loading: state.loading.models.datasource };
}

export default connect(mapStateToProps)(Datasource);
