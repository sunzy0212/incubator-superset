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
          {key:'state', label: t("state")}, {key:'started', label: t("started")}, {key:'duration', label: t("duration")},
          {key:'progress', label: t("progress")}, {key:'rows', label: t("rows")}, {key:'sql', label: t("sql")},
          {key:'output', label: t("output")}, {key:'actions', label: t("actions")}
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
