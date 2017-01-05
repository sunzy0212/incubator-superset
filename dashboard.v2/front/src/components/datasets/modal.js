import React, {PropTypes} from 'react'
import MySQL from './modals/mysql'
import InfluxDB from './modals/influxdb'
import {Button,Modal,Form,Input} from 'antd'

const DataSetModal = ({
  saveLoading,
  dataSetType,
  visible,
  item,
  onOk,
  onCancel,
})=> {
  const ModalContextGen = ()=> {
    const modalProps = {
      saveLoading,
      dataSetType,
      visible,
      item,
      onOk,
      onCancel,
    }

    switch (dataSetType.toUpperCase()) {
      case "MYSQL":
        return (<MySQL {...modalProps}/>);
        break;
      case "INFLUXDB":
        return <InfluxDB {...modalProps}/>
        break;
      default:
        return <div>暂不支持： {dataSetType} 哟！</div>
    }
  }
  return (
    <Modal
      visible={visible}
      title={"添加"+dataSetType}
      width={700}
      onCancel={onCancel}
      style={{ top: 20 }}
      footer={[
      ]}
    >
      <ModalContextGen/>
    </Modal>
  );
}
DataSetModal.propTypes = {
  visible: PropTypes.any,
  form: PropTypes.object,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default DataSetModal

/**
 footer={[
        <Button key="back" type="ghost" size="large" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" size="large" loading={loading} onClick={onCl}>确认</Button>,
      ]}
 */
