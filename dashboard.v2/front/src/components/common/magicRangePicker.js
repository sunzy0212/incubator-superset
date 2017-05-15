import React, { PropTypes } from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

const MagicRangePicker = ({ defaultValue, onOk }) => {
  return (
    <RangePicker
      defaultValue={defaultValue}
      ranges={{ 今天: [moment().startOf('day'), moment().endOf('day')],
        昨天: [moment().add(-1, 'day').startOf('day'), moment().add(-1, 'day').endOf('day')],
        本周: [moment().startOf('week'), moment().endOf('week')],
        上周: [moment().add(-1, 'week').startOf('week'), moment().add(-1, 'week').endOf('week')],
        本月: [moment().startOf('month'), moment().endOf('month')],
        上月: [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')],
        前三月: [moment().add(-3, 'month'), moment()],
      }}
      showTime onOk={onOk} format="YYYY-MM-DD HH:mm:ss"
    />

  );
};

MagicRangePicker.propTypes = {
  defaultValue: PropTypes.array,
  onOk: PropTypes.func,
};

export default MagicRangePicker;
