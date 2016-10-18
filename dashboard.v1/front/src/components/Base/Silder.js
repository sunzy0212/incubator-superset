class Dashboard extends Component {
    render ( ){
        return (
            <div id="switcher" className={this.context.store.layoutEditing ? "hide" : null}>
                <div className="switcher box-color dark-white text-color">
                    <a className="box-color dark-white text-color sw-btn"
                       onClick={this.handleSubmitLayout().bind(this)}>
                        <i className="fa fa-save"/>
                    </a>
                </div>

                <div className="switcher box-color black lt" id="sw-demo">
                    <a className="box-color black lt text-color sw-btn"
                       onClick={this.handleCancelLayout().bind(this)}>
                        <i className="fa fa-remove text-white"/>
                    </a>
                </div>
            </div>
        )
    }
}