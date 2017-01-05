import React from 'react';
import {connect} from 'dva';
import DataSetList from '../components/datasets/datasetList'
import DatSetModal from '../components/datasets/modal'
import DataSetSelect from '../components/datasets/dataSetSelect'
import {Row, Col, Breadcrumb} from 'antd'
import styles from './Datasets.less';

function Datasets({children, dispatch, datasets}) {
  const {loading, saveLoading,item, modalVisible, dataSetType, records} = datasets

  const datasetListProps = {
    loading: loading,
    records: records,
    onEditor(id){
      dispatch({
        type: "datasets/showModal",
        payload: {id: id}
      })
    },
    onDelete(id){
      dispatch({
        type: "datasets/delete",
        payload: {id: id}
      })
    },
    onOk(data){
      dispatch({
        type: 'datasets/save',
        payload: data
      })
    },
    onCancel() {
      dispatch({
        type: 'datasets/hideModal',
      })
    },
  }


  const datasetModalProps = {
    saveLoading: saveLoading,
    visible: modalVisible,
    item:item,
    dataSetType: dataSetType,
    onOk(data){
      dispatch({
        type: 'datasets/save',
        payload: data
      })
    },
    onCancel() {
      dispatch({
        type: 'datasets/hideModal',
      })
    },
  }

  const datasetSelectProps = {
    dataSetType:dataSetType,
    onAddDataSet(dataSetType) {
      dispatch({type: "datasets/showModal",
        payload:{dataSetType:dataSetType}})
    }

  }

  const DataSetModalGen = () => {
    return ( <DatSetModal {...datasetModalProps}/>)
  }

  return (
    <div >
      <DataSetModalGen/>
      <Row gutter={36} type="flex" className={styles.topRow}>
        <Col span={2}>
          <Breadcrumb>
            <Breadcrumb.Item>数据源</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={9} className={styles.subRow2Col}/>
        <Col span={11}>
          <DataSetSelect {...datasetSelectProps}/>
        </Col>
      </Row>

      <Row gutter={5}>
        <Col xs={8} sm={12} md={16} lg={24} span={24}>
          <DataSetList {...datasetListProps}/>
        </Col>
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return {datasets: state.datasets};
}

export default connect(mapStateToProps)(Datasets);
