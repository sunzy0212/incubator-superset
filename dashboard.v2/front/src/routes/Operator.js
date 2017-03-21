import React from 'react';
import { connect } from 'dva';
import styles from './Operator.css';

function Operator({ children }) {
  return (
    <div className={styles.normal}>
      {children}
    </div>
  );
}

function mapStateToProps(state) {
  return { operator: state.operator };
}

export default connect(mapStateToProps)(Operator);
