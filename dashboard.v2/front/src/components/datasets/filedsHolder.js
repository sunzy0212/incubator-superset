import React, { PropTypes } from 'react';
import { Table } from 'antd';


const FieldHolder = ({ title, onEditor, records }) => {
  const columns = [
    {
      title,
      dataIndex: 'name',
      key: 'name',
      width: 120,
      //render: text => <a href="#l">{text}</a>,
    },
    {
      title: '',
      key: 'action',
      className: '',
      width: 78,
      render: record => (
        <span>
          <a icon="edit" onClick={() => onEditor(record.key)} >...</a>
        </span>
      ),
    }];

  const data = [];

  records.forEach((e, i) => {
    data.push({
      key: i,
      name: e.name,
    });
  });

  function rowClick(record, index) {
    console.log(record, index);
  }

  return (
    <Table
      columns={columns} dataSource={data} size="small" pagination={false} scroll={{ y: 350 }}
      onRowClick={rowClick}
    />
  );
};
FieldHolder.propTypes = {
  title: PropTypes.string,
  onEditor: PropTypes.func,
  records: PropTypes.array,
};
export default FieldHolder;
