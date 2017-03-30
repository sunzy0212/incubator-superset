import React from 'react';
import { Link } from 'dva/router';
import { Icon, Input, Tooltip } from 'antd';
import styles from './aside.less';

class EditableCell extends React.Component {

  state = {
    key: this.props.id,
    dirFlag: this.props.dirFlag,
    value: this.props.value,
    args: this.props.args,
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
    const { key, value, args, editable, dirFlag } = this.state;
    if (dirFlag === true) {
      return (<span className={styles.editable_cell}>
        {
        editable ?
          <span className={styles.editable_cell_input_wrapper}>
            <Input
              value={value}
              onChange={this.handleChange}
              onPressEnter={this.check}
              className={styles.editable_cell_input_width}
            />
            <Icon
              type="check"
              className={styles.editable_cell_icon_check}
              onClick={this.check}
            />
          </span>
        :
          <span className={styles.editable_cell_text_wrapper}>
            <Icon type="folder" />{value || ' '}
            <Icon
              type="edit"
              className={styles.editable_cell_icon}
              onClick={this.edit}
            />
          </span>
      }
      </span>);
    } else {
      return (
        <Tooltip title={value}>
          <Link className={styles.editable_link} to={`/dashboard/${key}`} query={args} >
            <Icon type="file" />{`${(value || ' ').substr(0, 12)}..`}
          </Link>
        </Tooltip>
      );
    }
  }
}

export default EditableCell;
