import React, { PropTypes, createClass, Component} from 'react';
import SplitPane from 'react-split-pane'
import $ from 'jquery'
import Editor from '../components/Editor/Editor'
import EditorBase from '../components/Editor/EditorBase'
import Select from '../components/Editor/Select'

export  default  class EditorContainer extends Component {


    render() {
        return (
            <div id="content" className="app-content box-shadow-z0" role="main">
                <div className="Search">
                    <SplitPane split="vertical" minSize={10} defaultSize={200}>
                        <Select />
                        <SplitPane split="horizontal" minSize={80} defaultSize={80}
                                   onChange={ size => {
                                       $(".CodeMirror").attr("style", "height: " + size + "px !important");
                                   }}>
                            <Editor />
                            <EditorBase />
                        </SplitPane>
                    </SplitPane>
                </div>
            </div>
        )
    }
}