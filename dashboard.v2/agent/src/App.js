import React, { Component } from 'react';
import { Button, Layout, Row, Col } from 'antd';
import Config from './config';
import Monitor from './monitor';
import common from './utils/common';
import logo from './logo.svg';
import request from './utils/request';
import './App.css';


const { Header, Footer, Sider, Content } = Layout;

class App extends Component {

  constructor() {
    super();
    this.state = {
      isDeploy: false,
      isDeleted: false,
      report: {},
      services: {},
      webroot: 'https://',
    };
    this.isDeploy();
    this.isDeleted();
    this.getReport();
  }


  componentDidMount() {
    setInterval(() => {
      if (this.state.isDeploy) {
        this.isDeleted();
        this.getReport();
      }
    }, 20000);
  }

  getReport = () => {
    request(`${common.URL}/api/inspects`,
      {
        method: 'GET',
      }).then((data) => {
        this.setState({
          services: data,
          report: data.report,
        });
      });
  }


  isDeploy = () => {
    request(`${common.URL}/api/deployed`,
      {
        method: 'GET',
      }).then((data) => {
        this.setState({
          isDeploy: data.result,
        });
      });
  }


  isDeleted=() => {
    request(`${common.URL}/api/isDeleted`,
      {
        method: 'GET',
      }).then((data) => {
        this.setState({
          isDeleted: data.isDeleted,
        });
      });
  }

  openUrl =() => {
    request(`${common.URL}/api/inspects`,
      {
        method: 'GET',
      }).then((data) => {
        window.open(`https://${data.report.apPorts[0].ip}`, 'newwindow');
      });
  }

  render() {
    return (
      <Layout>
        <Sider>
          <div className="App">
            <div className="App-header">
              <img src="http://onb23dct0.bkt.clouddn.com/report.png" className="App-logo" alt="logo" />
              <h2>七牛报表系统</h2>
              <br />
              <br />
              <p className="indent">
                    Qiniu Report Studio 是七牛通用的自助报表分析平台。支持众多种类的数据源，
                  如：常见的RDBMS，Mongo，InfluxDB，Hive，HBase，位于Kodo上的JSON/CSV/Parquet/Avro等自描述文件。
                  除支持多数据源外，最让人兴奋的还有多数据源间跨库跨连接多表查询。平台本身不存储源数据，因此数据更安全。
                </p>
              <p className="indent">
                    作为七牛数据服务生态体系的一份子，自诞生以来不断在数据分析，数据挖掘，数据可视化等等领域深入探索分析理论，
                    丰富分析方法，挖掘数据价值。致力于让数据变得更加感性，生动！
                </p>
            </div>
          </div>
        </Sider>

        <Layout>
          <Header>
            <Row gutter={24}>
              <Col span={2}>
                <h3>配置管理</h3>
              </Col>
              <Col span={4} offset={16}>
                <Button
                  type="primary" size="large" disabled={this.state.report.apPorts === undefined || this.state.report.apPorts === null}
                  onClick={() => this.openUrl()}
                >打开报表Portal</Button>
              </Col>
            </Row>
          </Header>
          <Content>{this.state.isDeploy && !this.state.isDeleted ? <Monitor services={this.state.services} /> : <Config />}
          </Content>
          <Footer>@七牛云</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default App;
