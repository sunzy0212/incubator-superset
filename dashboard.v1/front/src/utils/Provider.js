import React from "react";

export default class Provider extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.store = props.store;
    }

    getChildContext() {
        return { store: this.store };
    }

    render() {
        return React.Children.only(this.props.children);
    }
}

Provider.childContextTypes = {
    store: React.PropTypes.object
};

Provider.propTypes = {
    store: React.PropTypes.object.isRequired,
    children: React.PropTypes.any
};