import React from 'react';
import { Link } from 'dva/router';
import { Card, Icon } from 'antd';
import MySQL from './modals/mysql';
import InfluxDB from './modals/influxdb';
import MongoDB from './modals/mongodb';

class DataSourceEditor extends React.Component {

  constructor(props) {
    super();
    this.state = {
      saveLoading: false,
      sourceProps: props.location.state,
    };
  }

  genDatasourceEditView = () => {
    const { type, item, onOk } = this.state.sourceProps;

    const props = {
      saveLoading: this.state.saveLoading,
      type,
      item,
      onOk,
      callBack: (saveLoading) => {
        const that = this;
        this.setState({ saveLoading });
        setTimeout(() => {
          that.setState({ saveLoading: false });
        }, 5000);
      },
    };

    switch (type.toUpperCase()) {
      case 'MYSQL':
        return (<MySQL {...props} />);
      case 'MONGODB':
        return <MongoDB {...props} />;
      case 'INFLUXDB':
        return <InfluxDB {...props} />;
      default:
        return <div>暂不支持： {type} 哟！</div>;
    }
  }
  render() {
    const { type, action } = this.state.sourceProps;
    return (
      <div style={{ background: '#ECECEC', padding: '10px' }}>

        <Card
          title={`${action === 'ADD' ? '增加' : '修改'}${type}数据源`}
          extra={<Link to={'/datasource'} ><Icon type="close" /></Link>} style={{ width: '100%' }}
        >
          {this.genDatasourceEditView()}
        </Card>
      </div>
    );
  }
  }

export default DataSourceEditor;
