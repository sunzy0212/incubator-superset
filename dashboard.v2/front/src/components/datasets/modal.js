import React, { PropTypes } from 'react';
import { Modal } from 'antd';
import MySQL from './modals/mysql';
import InfluxDB from './modals/influxdb';


const DataSetModal = ({
  saveLoading,
  dataSetType,
  visible,
  item,
  onOk,
  onCancel,
}) => {
  const ModalContextGen = () => {
    const modalProps = {
      saveLoading,
      dataSetType,
      visible,
      item,
      onOk,
      onCancel,
    };

    switch (dataSetType.toUpperCase()) {
      case 'MYSQL':
        return (<MySQL {...modalProps} />);
      case 'INFLUXDB':
        return <InfluxDB {...modalProps} />;
      default:
        return <div>暂不支持： {dataSetType} 哟！</div>;
    }
  };
  return (
    <Modal
      visible={visible}
      title={`添加${dataSetType}`}
      width={700}
      onCancel={onCancel}
      style={{ top: 20 }}
      footer={[]}
    >
      <ModalContextGen />
    </Modal>
  );
};
DataSetModal.propTypes = {
  dataSetType: PropTypes.string,
  visible: PropTypes.bool,
  item: PropTypes.object,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

export default DataSetModal;
