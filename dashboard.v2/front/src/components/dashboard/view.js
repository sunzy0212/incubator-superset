/**
 * Created by chenxinwen on 2017/1/12.
 */
import React from 'react';
import { Link } from 'dva/router';
import { Row, Col, Icon } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './view.less';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const View = ({ title }) => {
  function deleteItem() {

  }
  return (
    <div className={styles.box}>
      <Row gutter={24}>
        <Col lg={16} md={8}>
          <div className={styles.boxHeader}>
            <h3>{title}</h3>
          </div>
        </Col>
        <Col lg={8} md={16}>
          <div className={styles.boxTool}>
            <Link to="" ><Icon type="edit" /></Link>
            <span className="ant-divider" />
            <a><Icon type="download" /></a>
            <span className="ant-divider" />
            <a><Icon type="reload" /></a>
            <span className="ant-divider" />
            <a onClick={deleteItem}><Icon type="delete" /></a>
          </div>
        </Col>
      </Row>
      <ResponsiveContainer >
        <LineChart
          key="bn"
          data={data}
          margin={{ top: 25, right: 2, left: -10, bottom: 2 }}
        >
          <Legend />
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Line type="monotone" dataKey="pv" name="请求数" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" name="下载量" stroke="#82ca9d" dot={{ stroke: 'red', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};


export default View;
