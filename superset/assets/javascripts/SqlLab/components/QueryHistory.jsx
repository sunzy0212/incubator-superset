import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

import QueryTable from './QueryTable';
import { t } from '../../locales';

const propTypes = {
  queries: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
};

const QueryHistory = (props) => {
  if (props.queries.length > 0) {
    return (
      <QueryTable
        columns={[
        {key:'state', label:"状态"}, {key:'started', label:"开始时间"}, {key:'duration', label:"执行时长"},
        {key:'progress', label:"进度"}, {key:'rows', label:"返回结果条数"}, {key:'sql', label:"查询语句"},
        {key:'output', label:"输出"}, {key:'actions', label:"操作"}
       ]}
        queries={props.queries}
        actions={props.actions}
      />
    );
  }
  return (
    <Alert bsStyle="info">
      {t('No query history yet...')}
    </Alert>
  );
};
QueryHistory.propTypes = propTypes;

export default QueryHistory;
