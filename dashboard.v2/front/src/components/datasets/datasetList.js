import React from 'react'
import {Table,Icon,Button} from 'antd'

const DatasetList = ({loading,onEditor,onDelete,onOk,onCancel,records}) => {
  const columns = [
    {
      title : "序号",
      dataIndex:'index',
      key: 'index'
    },{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: text => <a href="#">{text}</a>,
  }, {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  }, {
    title: '地址',
    dataIndex: 'host',
    key: 'host',
  },{
    title: '端口',
    dataIndex :'port',
    key : 'port',
      render: record => <div>{record==0?'NULL':record}</div>,
    },{
      title: '数据库',
      dataIndex : 'dbName',
      key: 'dbName',
    },{
      title:'修改时间',
      dataIndex:'createTime',
      key:'createTime',
    }, {
    title: '操作',
    key: 'action',
    render: record => (
      <span>
      <Button icon="edit" onClick={()=>onEditor(record.key)}></Button>
      <span className="ant-divider" />
      <Button icon="delete" onClick={()=>onDelete(record.key)} ></Button>
      <span className="ant-divider" />
      <a href="#" className="ant-dropdown-link">
        更多 <Icon type="down" />
      </a>
    </span>
    ),
  }];

  const data = [];

  records.forEach(function(e,i){
    data.push({
      index:i+1,
      key:e.id,
      name:e.name,
      type:e.type,
      host:e.host,
      port:e.port,
      dbName:e.dbName,
      createTime:e.createTime
    })
  })
  return (
    <Table loading={loading} columns={columns} dataSource={data}/>
  );
};

export default  DatasetList
