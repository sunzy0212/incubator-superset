import React, { PropTypes } from 'react';
import { Table, Menu, Dropdown, Icon } from 'antd';
import RenameModal from './renameModal';
import TransformDate from './transformDate';
import MeasureUnit from './measureUnit';

const SubMenu = Menu.SubMenu;

class FieldHolder extends React.Component {
  constructor() {
    super();
    this.state = {
      renameModalVisible: false,
      measureUnitVisible: false,
      transformDateVisible: false,
      currRecord: {},
    };
  }

  showRenameModal = (record) => {
    this.setState({
      renameModalVisible: true,
      currRecord: record,
    });
  }

  showTransformModal = (record) => {
    this.setState({
      transformDateVisible: true,
      currRecord: record,
    });
  }

  showMeasureUnitModal = (record) => {
    this.setState({
      measureUnitVisible: true,
      currRecord: record,
    });
  }

  genDropMenu = (record) => {
    const dimensionMenu = (
      <Menu style={{ width: 130 }} mode="vertical">
        <Menu.Item >
          <a onClick={() => this.showRenameModal(record)}> 重命名</a>
        </Menu.Item >
        <Menu.Item >
          <a onClick={() => this.showMeasureUnitModal(record)}> 添加计量单位</a>
        </Menu.Item >
        <SubMenu key="sub1" title={<span>转换数据类型</span>}>
          <Menu.Item >
            <a onClick={() => this.showTransformModal(record)}> 转换为日期</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => this.props.transformToString(record)}> 转换为字符</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => this.props.transformToNumber(record)}> 转换为数字</a>
          </Menu.Item >
        </SubMenu>
        <Menu.Item >
          <a onClick={() => this.props.transToMeasure(record)}> 转换为度量</a>
        </Menu.Item >
      </Menu >);

    const measureMenu = (
      <Menu style={{ width: 130 }} mode="vertical">
        <Menu.Item >
          <a onClick={() => this.showRenameModal(record)}> 重命名</a>
        </Menu.Item >
        <SubMenu key="sub1" title={<span>聚合方法</span>}>
          <Menu.Item >
            <a onClick={() => this.props.checkAggregation(record, 'sum')}>
              {(record.action === 'sum') ? (<Icon type="check-circle" />) : null}求和</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => this.props.checkAggregation(record, 'avg')}>
              {(record.action === 'avg') ? (<Icon type="check-circle" />) : null}平均值</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => this.props.checkAggregation(record, 'max')}>
              {(record.action === 'max') ? (<Icon type="check-circle" />) : null}最大</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => this.props.checkAggregation(record, 'min')}>
              {(record.action === 'min') ? (<Icon type="check-circle" />) : null}最小</a>
          </Menu.Item >
          <Menu.Item >
            <a onClick={() => this.props.checkAggregation(record, 'count')}>
              {(record.action === 'count') ? (<Icon type="check-circle" />) : null}计数</a>
          </Menu.Item >
        </SubMenu>
        <Menu.Item >
          <a onClick={() => this.props.transToDimension(record)}> 转换为维度</a>
        </Menu.Item >
      </Menu >);
    return (
      <Dropdown overlay={this.props.title === '度量' ? measureMenu : dimensionMenu} >
        <a className="ant-dropdown-link" >
          <Icon type="bars" />
        </a>
      </Dropdown >);
  }

  genItem = (text, record) => {
    const time = (
      <span>
        <Icon type="calendar" /> {text}
      </span>
    );
    const str = (
      <span>
        <Icon type="file-text" /> {text}
      </span>
    );
    const number = (
      <span>
        <Icon type="calculator" /> {text}
      </span>
    );
    if (record.type === 'timestamp') {
      return time;
    } else if (record.type === 'string') {
      return str;
    } else {
      return number;
    }
  }


  render() {
    const that = this;
    const { title, onRenameOk, transformToDate, addMeasureUnit, records } = this.props;

    const renameModalprops = {
      modalVisible: this.state.renameModalVisible,
      currRecord: this.state.currRecord,
      title,
      onOk: onRenameOk,
      onCancel() {
        that.setState({
          renameModalVisible: false,
        });
      },
    };

    const transformDateProps = {
      modalVisible: this.state.transformDateVisible,
      currRecord: this.state.currRecord,
      onOk: transformToDate,
      onCancel() {
        that.setState({
          transformDateVisible: false,
        });
      },
    };

    const measureUnitProps = {
      title,
      modalVisible: this.state.measureUnitVisible,
      currRecord: this.state.currRecord,
      onOk: addMeasureUnit,
      onCancel() {
        that.setState({
          measureUnitVisible: false,
        });
      },
    };

    const columns = [
      {
        title,
        dataIndex: 'name',
        key: 'name',
        width: 120,
        render: (text, record) => this.genItem(text, record.item),
      },
      {
        title: '',
        key: 'action',
        className: '',
        width: 78,
        render: record => this.genDropMenu(record.item),
      }];

    const data = [];

    records.forEach((e) => {
      data.push({
        key: e.id,
        name: e.alias,
        item: e,
      });
    });

    return (
      <div>
        <div>
          <RenameModal {...renameModalprops} />
          <TransformDate {...transformDateProps} />
          <MeasureUnit {...measureUnitProps} />
        </div>
        <Table
          columns={columns} dataSource={data} size="small" pagination={false} scroll={{ y: 350 }}
        />
      </div>
    );
  }
}
FieldHolder.propTypes = {
  title: PropTypes.string,
  onRenameOk: PropTypes.func,
  transToDimension: PropTypes.func,
  transToMeasure: PropTypes.func,
  transformToString: PropTypes.func,
  addMeasureUnit: PropTypes.func,
  checkAggregation: PropTypes.func,
  records: PropTypes.array,
};
export default FieldHolder;
