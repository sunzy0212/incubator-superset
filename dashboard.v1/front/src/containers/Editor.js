import React, { PropTypes, createClass, Component} from 'react';
import SplitPane from 'react-split-pane'
import $ from 'jquery'
import { ajax } from '../utils/DecodeData'
import Editor from '../components/Editor/Editor'
import EditorBase from '../components/Editor/EditorBase'
import Select from '../components/Editor/Select'
export default class EditorContainer extends Component {
    static contextTypes = {
        store: PropTypes.object
    };

    constructor(){
        super()
        this.state= {
            refresh:false
        }
    }

    componentWillMount() {
        let that = this
        //const id =this.props.params.codeId
        const id = this.props.location.query.codeId
        console.log(id)

        if (id !=undefined && id !="") {
            fetch(this.context.store.hosts + "/codes/" + id, {
                method: "GET"
            }).then(response => {
                if (response.status != 404) {
                }
                return response.json();
            }).then(data => {
                that.context.store.currentCode = data
                that.context.store.code = data.code
                this.setState({
                    refresh: "true"
                })
            }).catch(e => {
                console.log("event", e);
            });
        }

    }

    render() {
        return (
            <div id="content" className="app-content box-shadow-z0" role="main">
                <div className="Search">
                    <SplitPane split="vertical" minSize={10} defaultSize={200}>
                        <Select {...this.props}/>
                        <SplitPane split="horizontal" minSize={80} defaultSize={80}
                            onChange={ size => {
                                $(".CodeMirror").attr("style", "height: " + size + "px !important");
                            } }>
                            <Editor />
                            <EditorBase />
                        </SplitPane>
                    </SplitPane>
                </div>
            </div>
        )
    }
}