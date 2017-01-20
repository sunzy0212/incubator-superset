import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col, Breadcrumb } from 'antd';
import DataSetList from '../components/datasets/datasetList';
import DatSetModal from '../components/datasets/modal';
import DataSetSelect from '../components/datasets/dataSetSelect';
import styles from './Datasets.less';

function Datasets({ dispatch, datasets }) {
  const { loading, saveLoading, item, modalVisible, dataSetType, records } = datasets;

  const datasetListProps = {
    loading,
    records,
    onEditor(id) {
      dispatch({
        type: 'datasets/showModal',
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


  const datasetModalProps = {
    saveLoading,
    visible: modalVisible,
    item,
    dataSetType,
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

  const datasetSelectProps = {
    dataSetType,
    onAddDataSet(_dataSetType) {
      dispatch({
        type: 'datasets/showModal',
        payload: { dataSetType: _dataSetType },
      });
    },
  };

  const DataSetModalGen = () => <DatSetModal {...datasetModalProps} />;

  return (
    <div >
      <DataSetModalGen />
      <Row gutter={24} type="flex" className={styles.topRow}>
        <Col span={2}>
          <Breadcrumb>
            <Breadcrumb.Item>数据源</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={9} className={styles.subRow2Col} />
        <Col span={11}>
          <DataSetSelect {...datasetSelectProps} />
        </Col>
      </Row>

      <Row gutter={5}>
        <Col xs={8} sm={12} md={16} lg={24} span={24}>
          <DataSetList {...datasetListProps} />
        </Col>
      </Row>
    </div>
  );
}

Datasets.propTypes = {
  dispatch: PropTypes.func,
  datasets: PropTypes.object,
};


function mapStateToProps(state) {
  return { datasets: state.datasets };
}

export default connect(mapStateToProps)(Datasets);
