import React, {Component, PropTypes} from "react"
import Modal from "react-modal"
import { observer } from "mobx-react";
import NotificationSystem from 'react-notification-system'
import {ajax} from '../../utils/DecodeData'

const defaultProps = {
    show: true,
    title: '添加数据源',
    onOk: () => {
    },
    onCancel: () => {
    },
}

const propTypes = {
    type: PropTypes.string.isRequired,
}


const customStyles = {
    content: {
        top: '50%',
        left: '53%',
        right: '10%', //auto
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};
@observer
export default class DatasetModal extends Component {
    static contextTypes = {
        store: PropTypes.object,
        notification: PropTypes.object,
    };

    constructor(props) {
        super(props)
        this.state = {
            modalIsOpen: props.show,
            type: props.type,
            Dataset: props.item == undefined ? {} : props.item
        }
    }

    componentWillMount(){
        //console.log(this.context.store.hosts)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({modalIsOpen: nextProps.show})
    }

    closeModal = () => {
        this.setState({modalIsOpen: false})
    }
    afterOpenModal = () => {
        //this.refs.subtitle.style.color = '#f00';
    }

    addNotification(options) {
        return this.refs.notificationSystem.addNotification(options)
    }

    saveDataset = () => {
        let that = this
        let ob = {}
        let id = this.refs.form_id.value.trim()
        ob.name = this.refs.form_name.value.trim()
        ob.host = this.refs.form_host.value.trim()
        ob.port = parseInt(this.refs.form_port.value.trim())
        ob.username = this.refs.form_username.value.trim()
        ob.password = this.refs.form_password.value.trim()
        ob.dbName = this.refs.form_dbName.value.trim()
        ob.type = this.refs.form_type.value.trim()
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url:  "/v1/datasets" + (id == "" ? "" : "/" + id),
            type: id == "" ? 'post' : 'put',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(ob)

        }).then(
            function fulfillHandler(data) {

            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
                console.log(jqXHR.responseText)
                that.addNotification({
                    message: "保存失败: "+jqXHR.responseText,
                    level: 'error',
                    position: "tr",
                    autoDismiss: 5,
                });
            })
        this.closeModal()
        this.props.reset()
    }

    testDataset = () => {
        let that = this
        let ob = {}
        ob.host = this.refs.form_host.value.trim()
        ob.port = parseInt(this.refs.form_port.value.trim())
        ob.username = this.refs.form_username.value.trim()
        ob.password = this.refs.form_password.value.trim()
        ob.dbName = this.refs.form_dbName.value.trim()
        ob.type = this.refs.form_type.value.trim()

        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url: "/v1/datasets/test",
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(ob)

        }).then(
            function fulfillHandler(data) {
                that.addNotification({
                    message: "连接测试成功!",
                    level: 'success',
                    position: "tr",
                    autoDismiss: 5,
                });
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
                console.log(jqXHR.responseText)
                that.addNotification({
                    message: "连接测试失败!",
                    level: 'error',
                    position: "tr",
                    autoDismiss: 5,
                });
            })
    }

    render() {
        return (
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <div className="modal-body">
                    <div className="box">

                        <div className="box-header">
                            <div className="form-group row row-sm">
                                <h2 className="col-xs-11">创建[{this.state.type}]数据源</h2>
                                <div className="col-xs-1">
                                    <a className="fa fa-close " onClick={this.closeModal}></a>
                                </div>
                            </div>
                        </div>
                        <div className="box-divider m-a-0"></div>
                        <form role="form" onSubmit={this.saveDataset}>
                            <div className="box-body">
                                <div className="form-group row row-sm">
                                    <label htmlFor="from_name" className="col-xs-1 form-control-label">名称：</label>
                                    <div className="col-sm-4">
                                        <input type="text" className="form-control" ref="form_name" id="form_name"
                                               defaultValue={this.state.Dataset.name == undefined ? "" : this.state.Dataset.name}
                                               placeholder="you should have a name for this dataset"/>
                                    </div>
                                </div>

                                <div className="form-group row row-sm">
                                    <label htmlFor="form_host" className="col-xs-1 form-control-label">地址: </label>
                                    <div className="col-xs-4">
                                        <input type="text" className="form-control" id="form_host" ref="form_host"
                                               defaultValue={this.state.Dataset.host == undefined ? "" : this.state.Dataset.host}
                                               placeholder="host"/>
                                    </div>
                                    <label htmlFor="form_port" className="col-xs-1 form-control-label">端口: </label>
                                    <div className="col-xs-4">
                                        <input type="text" className="form-control" id="form_port" ref="form_port"
                                               defaultValue={this.state.Dataset.port == undefined ? "" : this.state.Dataset.port}
                                               placeholder="port"/>
                                    </div>
                                </div>

                                <div className="form-group row row-sm">
                                    <label htmlFor="form_username" className="col-xs-1 form-control-label">用户名: </label>
                                    <div className="col-xs-4">
                                        <input type="text" className="form-control" id="form_username"
                                               ref="form_username"
                                               defaultValue={this.state.Dataset.username == undefined ? "" : this.state.Dataset.username}
                                               placeholder="username"/>
                                    </div>
                                    <label htmlFor="form_password" className="col-xs-1 form-control-label">密码: </label>
                                    <div className="col-xs-4">
                                        <input type="password" className="form-control" id="form_password"
                                               ref="form_password"
                                               defaultValue={this.state.Dataset.password == undefined ? "" : this.state.Dataset.password}
                                               placeholder="password"/>
                                    </div>
                                </div>

                                <div className="form-group row row-sm">
                                    <label htmlFor="from_dbName" className="col-md-1 form-control-label">数据库名：</label>
                                    <div className="col-xs-4">
                                        <input type="text" className="form-control" id="form_dbName" ref="form_dbName"
                                               defaultValue={this.state.Dataset.dbName == undefined ? "" : this.state.Dataset.dbName}
                                               placeholder="your database name"/>
                                    </div>
                                    <input type="hidden" ref="form_id"
                                           defaultValue={this.state.Dataset.id == undefined ? "" : this.state.Dataset.id}/>
                                    <input type="hidden" ref="form_type"
                                           defaultValue={this.state.Dataset.type == undefined ? this.state.type : this.state.Dataset.type}/>
                                </div>
                            </div>
                        </form>

                        <div className="modal-footer">
                            <button className="btn dark-white" onClick={this.testDataset}>测试</button>
                            <button className="btn info" onClick={this.saveDataset}>保存</button>
                        </div>
                    </div>
                    <NotificationSystem ref="notificationSystem"/>
                </div>
            </Modal>
        );
    }
}
//
// DatasetModal.defaultProps = defaultProps
DatasetModal.propTypes = propTypes

