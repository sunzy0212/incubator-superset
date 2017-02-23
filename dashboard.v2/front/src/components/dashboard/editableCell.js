import React from 'react';
import { Link } from 'dva/router';
import { Icon, Input } from 'antd';
import styles from './aside.less';

class EditableCell extends React.Component {
  state = {
    key: this.props.id,
    dirFlag: this.props.dirFlag,
    value: this.props.value,
    editable: false,
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = () => {
    this.setState({ editable: true });
  }
  render() {
    const { key, value, editable, dirFlag } = this.state;
    if (dirFlag === true) {
      return (<div className={styles.editable_cell}>
        {
        editable ?
          <div className={styles.editable_cell_input_wrapper}>
            <Input
              value={value}
              onChange={this.handleChange}
              onPressEnter={this.check}
            />
            <Icon
              type="check"
              className={styles.editable_cell_icon_check}
              onClick={this.check}
            />
          </div>
        :
          <div className={styles.editable_cell_text_wrapper}>
            <Link className={styles.editable_link} to={`/dashboard/${key}`} ><Icon type="folder" />{value || ' '}</Link>
            <Icon
              type="edit"
              className={styles.editable_cell_icon}
              onClick={this.edit}
            />
          </div>
      }
      </div>);
    } else {
      return (
        <Link className={styles.editable_link} to={`/dashboard/${key}`} ><Icon type="file" />{value || ' '}</Link>
      );
    }
  }
}

export default EditableCell;
