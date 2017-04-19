import React from 'react';
import { Select, Row, Col } from 'antd';

const Option = Select.Option;

class SelectComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      selects: [],
    };
  }

  handleSelect=(value, item) => {
    const selects = this.state.selects.filter((x) => { return x.item.id !== item.id; });
    selects.push({ item, value });
    this.props.getNewChartData(selects);
    this.setState({
      selects,
    });
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
      { this.props.filters.map((item) => {
        return (<Col style={{ marginLeft: '12px' }} key={item.id} span={5}>
          {item.alias}
          <Select
            defaultValue={'全部'} key={item.id} style={{ width: '70%' }}
            onSelect={value => this.handleSelect(value, item)}
          >
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
