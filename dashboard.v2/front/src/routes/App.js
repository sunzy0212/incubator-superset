import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Login from './Login';
import Aside from '../components/layout/aside';
import Footer from '../components/layout/footer';
import styles from '../components/layout/main.less';
import { classnames } from '../utils';


function App({ children, location, dispatch, app }) {
  const { login, loginButtonLoading, siderFold, darkTheme } = app;
  const loginProps = {
    loginButtonLoading,
    onOk(data) {
      dispatch({ type: 'app/login', payload: data });
    },
  };

  // const headerProps = {
  //   user,
  //   siderFold,
  //   logout() {
  //     dispatch({ type: 'app/logout' });
  //   },
  //   switchSider() {
  //     dispatch({ type: 'app/switchSider' });
  //   },
  // };

  const siderProps = {
    siderFold,
    darkTheme,
    location,
    changeTheme() {
      dispatch({ type: 'app/changeTheme' });
    },
  };
  return (
    <div>{login
      ? <div className={classnames(styles.layout, { [styles.fold]: siderFold })}>
        <aside className={classnames(styles.sider, { [styles.light]: !darkTheme })}>
          <Aside {...siderProps} />
        </aside>
        <div className={styles.main}>
          <div className={styles.container}>
            <div className={styles.content}>
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
      :
      <Login {...loginProps} />
      }</div>
  );
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  app: PropTypes.object,
};

export default connect(({ app }) => ({ app }))(App);
