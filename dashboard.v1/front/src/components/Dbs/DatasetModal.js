import React, {Component, PropTypes} from "react"
import Modal from "react-modal"
import { observer } from "mobx-react";
import NotificationSystem from 'react-notification-system'
import {ajax} from '../../utils/DecodeData'
import MySQL from './Modals/MySQL'
import InfluxDB from './Modals/InfluxDB'

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
        this.setState ({
            modalIsOpen: nextProps.show,
            type: nextProps.type,
            Dataset: nextProps.item == undefined ? {} : nextProps.item
        });
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

    save = (datas) => {
        let id = datas["id"]
        let data = datas["data"]
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url:  "/v1/datasets" + (id == ""||id == undefined ? "" : "/" + id),
            type: id == ""||id == undefined ? 'post' : 'put',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)

        }).then(
            function fulfillHandler(ret) {

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
                return false;
            })
        this.closeModal()
        this.props.reset()
        return true
    }

    test = (data) => {
        let that = this
        ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + localStorage.getItem("token"));
            },
            url: "/v1/datasets/test",
            type: 'post',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)

        }).then(
            function fulfillHandler(_data) {
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

    genDataSetModalView(){
        let _type = this.state.type
        switch (_type.toUpperCase()){
            case "MYSQL":
                return (<MySQL data={this.state.Dataset} onOk={(datas)=>this.save(datas)}
                               onCancel={()=>this.closeModal} onTest={(data)=>this.test(data)}/>);
                break;
            case "INFLUXDB":
                return <InfluxDB data={this.state.Dataset} onOk={(datas)=>this.save(datas)}
                                 onCancel={()=>this.closeModal} onTest={(data)=>this.test(data)}/>
                break;
            default:
                console.log("还不支持：" + _type)
                return <div>"还不支持：" + {_type}</div>
    }
}

    render() {
        return (
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customStyles}
                contentLabel="Modal"
            >
                {
                    this.genDataSetModalView()
                }
                <NotificationSystem ref="notificationSystem"/>
            </Modal>
        );
    }
}
