import React, {PropTypes, createClass, Component} from 'react';
import ReactDOM from 'react-dom';
import {observer, observable} from 'mobx-react';
import DatasetModal from "../components/Dbs/DatasetModal"
import SplitPane from 'react-split-pane'
import SelectDBs from '../components/Dbs/SelectDataset'


export  default  class DbsetContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            refresh: false,
            d_type : "MySQL"
        }
    }

    callBack() {
        this.setState({
            refresh: true
        })
    }

    createDatasets() {
        let _type = this.state.d_type
        ReactDOM.render(
            <DatasetModal show={true} type={_type} reset={() => this.callBack()}/>,
            document.getElementById("dataset-modal")
        );
    }

    handleChangeRadio =(type)=>{
        console.log(type)
        this.setState({
            d_type : type
        })
    }

    render() {
        return (
            <div id="content" className="app-content box-shadow-z0" role="main">
                <div className="Search">
                    <SplitPane split="horizontal" minSize={40} defaultSize={40}>
                        <div style={{width: "100%"}}>
                            <div id="dataset-modal"/>
                            <div className="queryTab nav-active-border b-info bottom box">
                                <div className="nav nav-md">
                                    <a className="nav-link active">
                                        数据源
                                    </a>

                                    <div className="pull-right">
                                        <label className="radio-inline">
                                            <input type="radio" name="inlineRadioOptions" onChange={()=>this.handleChangeRadio("MySQL")} value="MySQL" defaultChecked/> MySQL
                                        </label>
                                        <label className="radio-inline">
                                            <input type="radio" name="inlineRadioOptions" onChange={()=>this.handleChangeRadio("InfluxDB")} value="InfluxDB"/> InfluxDB
                                        </label>
                                        <button className="btn btn-xs info" onClick={this.createDatasets.bind(this)}>
                                            添加新的数据源
                                        </button>
                                        {/*<a onClick={this.createDatasets} className="btn btn-xs info">搜索</a>*/}
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div>
                            <SelectDBs reset={this.state.refresh}/>
                        </div>

                    </SplitPane>
                </div>
            </div>
        )
    }
}
