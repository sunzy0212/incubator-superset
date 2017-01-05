import React from 'react';
import { connect } from 'dva';
import {Row , Col, Table,Button,Icon,Breadcrumb,Radio,AutoComplete} from 'antd'
import styles from './Editor.less';

function Editor(props) {

  return (
    <div className={styles.sideBar}>
      <Row  gutter={24} >
        <Col span={2}>
          <Row>
            <Col span={24}>图表编辑
              <AutoComplete
                style={{ width: 100 }}
                onChange={()=>{}}
                placeholder="关键字搜索"
              >
              </AutoComplete>
            </Col>

          </Row>
          <Row> <Col span={24}>维度</Col></Row>
          <Row><Col span={24}>度量</Col></Row>
        </Col>
        <Col span={2}>属性区</Col>
        <Col span={20}>
          <Row >
            <Col span={8}>
              <Row ><Col span={24}>Y轴</Col></Row>
              <Row ><Col span={24}>X轴</Col></Row>
            </Col>
            <Col span={16}>功能区<Button type="" icon="edit"></Button></Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(Editor);
