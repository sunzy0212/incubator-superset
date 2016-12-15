import React, { PropTypes, createClass, Component } from 'react';
import { decodeData } from '../../utils/DecodeData'
import fetch from 'isomorphic-fetch'
const br = '<br>';
import { observer } from "mobx-react";
import Modal from 'react-modal'
const customStyles = {
    content: {
        top: '50%',
        left: '53%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '400px',
    }
};
@observer
export default class DashboardHeaderCom extends Component {

    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            results: {},
            columns: [],
            tagStatus: "chart",
            sql: "",
            modalIsOpen: false
        }

    }
    deleteReport() {
        let that = this;
        that.props.deleteReport();
        this.setState({ modalIsOpen: false });
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }

    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <div className="queryTab nav-active-border b-info bottom box">
                    <div className="nav nav-md db-header">
                        <div className="pull-left ">
                             <h3>{this.context.store.currentReportName}</h3>
                        </div>
                        <div className="pull-right ">
                            <button onClick={ () => this.context.store.addFavorites() } className="btn btn-xs info">导出到PDF</button>
                            <button onClick={this.openModal.bind(this) } className="btn btn-xs danger">删除报告</button>
                        </div>

                    </div>
                    <div className="modal-layout">
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            onRequestClose={this.closeModal.bind(this) }
                            style={customStyles}
                            contentLabel="Modal">
                            <form>
                                <div className="box">
                                    <div className="row m-b">
                                        <div className="col-sm-6">
                                            <div className="box-header">
                                                <h2>删除报表</h2>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <button className="pull-right fa fa-close" onClick={this.closeModal.bind(this) }></button>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>是否确认删除报表?</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" onClick={this.deleteReport.bind(this) } className="btn info">确认</button>
                                    </div>
                                </div>
                            </form>
                        </Modal>
                    </div>
                </div>


            </div>
        )
    }
}