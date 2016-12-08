import React from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'

var appElement = document.getElementById('your-app-element');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};


var App = React.createClass({

    getInitialState: function () {
        return { modalIsOpen: false };
    },

    openModal: function () {
        this.setState({ modalIsOpen: true });
    },

    afterOpenModal: function () {
        // references are now sync'd and can be accessed. 
        this.refs.subtitle.style.color = '#f00';
    },

    closeModal: function () {
        this.setState({ modalIsOpen: false });
    },

    render: function () {
        return (
            <div>
                <button onClick={this.openModal}>Open Modal</button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles} >

                    <h2 ref="subtitle">Hello</h2>
                    <button onClick={this.closeModal}>close</button>
                    <div>I am a modal</div>
                    <form>
                        <input />
                        <button>tab navigation</button>
                        <button>stays</button>
                        <button>inside</button>
                        <button>the modal</button>
                    </form>
                </Modal>
            </div>
        );
    }
});

ReactDOM.render(<App/>, appElement);