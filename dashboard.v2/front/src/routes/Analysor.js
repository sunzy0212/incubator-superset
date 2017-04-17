import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Row, Col } from 'antd';
import Slices from '../components/analysor/slices';
import Header from '../components/analysor/header';
import Dataview from '../components/analysor/dataview';

import styles from './Analysor.less';

function Analysor({ dispatch, loading, analysor }) {
  const { dataset, wheres, havings, operatorOptions, dayOptions, datas,
    selectFields, metricFields, groupFields, timeField, chart, dirs } = analysor;

  const { id, name, dimensions, measures, times } = dataset;

  const allFields = [].concat(times).concat(dimensions).concat(measures);

  const headerProps = {
    id,
    name,
    onEditor(datasetId) {
      dispatch(routerRedux.push(`/datasets/${datasetId}`));
    },
  };
  const slicesProps = {
    datasetId: id,
    wheres,
    havings,
    dayOptions,
    operatorOptions,
    dimensions,
    measures,
    times,
    timeField,
    selectFields,
    metricFields,
    groupFields,
    allFields,
    onExecute(querys) {
      dispatch({
        type: 'analysor/execute',
        payload: { datasetId: id, ...querys },
      });
    },
  };

  const dataViewProps = {
    loading,
    chart,
    dirs,
    datas,
    timeField,
    selectFields,
    metricFields,
    allFields,
    onSaveOrUpdate(args) {
      dispatch({
        type: 'analysor/saveOrUpdate',
        payload: args,
      });
    },
  };

  return (
    <div className={styles.sideBar}>
      <div className={styles.header}>
        <Header {...headerProps} />
      </div>
      <Row gutter={24}>
        <Col lg={8} md={8}>
          <Slices {...slicesProps} />
        </Col>
        <Col lg={16} md={16}>
          <Dataview {...dataViewProps} />
        </Col>
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return { analysor: state.analysor, loading: state.loading.models.analysor };
}

export default connect(mapStateToProps)(Analysor);
