import React from 'react';
import { Select, Button, Input } from 'antd';

const Option = Select.Option;

class AddOn extends React.Component {
  constructor(props) {
    super();
    const value = props.value || {};
    this.state = {
      field: value.field || '',
      operator: value.operator || '=',
      data: value.data || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({ ...value });
    }
  }
  handleFieldChange = (field) => {
    if (!('value' in this.props)) {
      this.setState({ field });
    }
    this.triggerChange({ field });
  }
  handleOperatorChange=(operator) => {
    if (!('value' in this.props)) {
      this.setState({ operator });
    }
    this.triggerChange({ operator });
  }
  handleDataChange=(e) => {
    const data = e.target.value;
    if (!('value' in this.props)) {
      this.setState({ data });
    }
    this.triggerChange({ data });
  }
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }

  render() {
    const { size } = this.props;
    const { type, index, fieldOptions, operatorOptions, deleteAddOns } = this.props.value;
    const state = this.state;
    return (
      <span>
        <Select
          size={size}
          value={state.field}
          style={{ width: '25%', marginRight: '1%' }}
          onChange={this.handleFieldChange}
        >
          {genOptionsOfSelect(fieldOptions)}
        </Select>
        <Select
          size={size}
          value={state.operator}
          style={{ width: '20%', marginRight: '1%' }}
          onChange={this.handleOperatorChange}
        >
          {genOptionsOfSelect(operatorOptions)}
        </Select>
        <Input
          type="text"
          size={size}
          value={state.data}
          onChange={this.handleDataChange}
          style={{ width: '40%', marginRight: '3%' }}
        />
        <Button shape="circle" icon="minus" type="ghost" onClick={() => deleteAddOns(type, index)} />
      </span>);
  }
}

function genOptionsOfSelect(fields) {
  if (fields === undefined || fields === null) {
    return;
  }
  return fields.map((item) => {
    return (<Option
      key={item.name}
      value={item.name}
    >
      {item.alias || item.name}</Option>);
  });
}

export default AddOn;
