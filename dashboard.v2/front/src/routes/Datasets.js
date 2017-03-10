import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Tabs, Table } from 'antd';
import FieldHolder from '../components/datasets/filedsHolder';
import TableEditor from '../components/datasets/tableEditor';
import RenameModal from '../components/datasets/renameModal';

const { Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

function Datasets({ dispatch, datasets }) {
  const { loading, dimensions, measures, renameModalVisibles, currentRecord, modalSpace } = datasets;

  const dimensionsProps = {
    title: '维度',
    records: dimensions,
    renameModalVisibles,
    currentRecord,
    onEditor(data, title) {
      dispatch({
        type: 'datasets/showRenameModal',
        payload: { data, title },
      });
    },
  };

  const data = [{
    key: '0',
    name: '陈老板',
    age: 30,
    address: '杭州',
  },{
    key: '1',
    name: '孟总',
    age: 28,
    address: '上海',
  }, {
    key: '2',
    name: '孙总',
    age: 26,
    address: '上海',
  }, {
    key: '3',
    name: '赵总',
    age: 29,
    address: '上海',
  }, {
    key: '4',
    name: '崔总',
    age: 30,
    address: '上海',
  }, {
    key: '5',
    name: '张总',
    age: 25,
    address: '上海',
  }, {
    key: '6',
    name: '桂总',
    age: 27,
    address: '上海',
  }, {
    key: '7',
    name: '天总',
    age: 28,
    address: '上海',
  }, {
    key: '8',
    name: '盛总',
    age: 29,
    address: '上海',
  }, {
    key: '9',
    name: '拓总',
    age: 29,
    address: '上海',
  }, {
    key: '10',
    name: '党总',
    age: 29,
    address: '杭州',
  }, {
    key: '11',
    name: '邢总',
    age: 27,
    address: '杭州',
  }, {
    key: '12',
    name: '温总',
    age: 29,
    address: '杭州',
  }, {
    key: '14',
    name: '钟总',
    age: 24,
    address: '杭州',
  }, {
    key: '13',
    name: '王总',
    age: 22,
    address: '杭州',
  }];

  const columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    filters: [
      { text: '张总', value: '张总' },
      { text: '陈老板', value: '陈老板' },
    ],
    onFilter: (value, record) => record.name.includes(value),
    sorter: (a, b) => a.name.length - b.name.length,
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
  }, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    filters: [
      { text: '上海', value: '上海' },
      { text: '杭州', value: '杭州' },
    ],
    onFilter: (value, record) => record.address.includes(value),
    sorter: (a, b) => a.address.length - b.address.length,
  }];

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
    save(data) {
      dispatch({
        type: 'datasets/saveOrUpdate',
        payload: { ...data },
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
            <TabPane tab="开始" key="1"><TableEditor {...tableEditorProps} /><Table columns={columns} dataSource={data} onChange={handleChange} /></TabPane>
            <TabPane tab="连接" key="2">多数据源(多表)，关联关系的工作区</TabPane>
            <TabPane tab="图表" key="3">图形的区域，暂时略</TabPane>
          </Tabs>
        </Content>

      </Layout>

    </Layout>
  );
}

function mapStateToProps(state) {
  return { datasets: state.datasets };
}
Datasets.propTypes = {
  dispatch: PropTypes.func,
  datasets: PropTypes.object,
};

export default connect(mapStateToProps)(Datasets);
