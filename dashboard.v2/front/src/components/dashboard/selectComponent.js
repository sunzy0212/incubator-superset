import React from 'react';
import { Select, Row, Col } from 'antd';

const Option = Select.Option;

class SelectComponent extends React.Component {
  constructor(props) {
    super();
    const { filters } = props;
    this.state = {
      filters,
      currentField: '',
    };
  }

  handleChange = (currentValue) => {
    this.props.getNewChartData(this.state.currentField, currentValue);
  }

  handleSelect = (currentField) => {
    this.state.currentField = currentField;
  }

  genFilterSelections = () => {
    const genOptions = (item) => {
      const res = [];
      res.push(<Option key={'全部'} value={'全部'}>{'全部'}</Option>);
      item.optionDatas.forEach((val) => {
        res.push(<Option
          key={val.toString()}
          value={val.toString()}
        >{val.toString()}</Option>);
      });
      return res;
    };

    return (<Row gutter={24}>
      { this.state.filters.map((item) => {
        return (<Col style={{ marginLeft: '12px' }} key={item.name} span={5}>
          {item.name}
          <Select defaultValue={'全部'} key={item.name} style={{ width: '70%' }} onChange={this.handleChange.bind(this)} onFocus={() => this.handleSelect(item)}>
            {
              genOptions(item)
            }
          </Select>
        </Col>);
      })
      }
    </Row>);
  }

  render() {
    return (<div>
      {this.genFilterSelections()}
    </div>);
  }
}

export default SelectComponent;
