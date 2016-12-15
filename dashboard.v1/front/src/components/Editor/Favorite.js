import React, {Component, PropTypes}from 'react';
import {observer} from "mobx-react";
import {ajax} from '../../utils/DecodeData'
@observer
export default class QueryFavorite extends Component {

    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            sqlList: props.favorites
        }
    }

    removeSql(codeId) {
        let that = this;
        fetch(`${that.context.store.hosts}/codes/${codeId}`, {
            method: "delete",
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            })
        }).then(response =>
            response.json()
        ).then(data => {
                let tmpList = this.state.sqlList.filter((item) => item.id != codeId)
                this.setState({
                    sqlList: tmpList
                })
            }
        ).catch(e => {
            console.log("event", e);
        });
    }

    handleRemove(item) {
        this.removeSql(item.id)
    }

    _favorites() {
        let that = this;
        return _.map(that.state.sqlList, function (item, i) {
            return (
                <div key={i} className="favorite saved-queries">
                    <pre><code>{item.code}</code></pre>
                    <div>
                        <div className="pull-right">
                            <button onClick={that.handleRemove.bind(that, item) }
                                    className="btn btn-xs white m-r-5 ">删除
                            </button>
                            <button onClick={() => that.context.store.updateCode(item.code) }
                                    className="btn btn-xs info m-r-5">复制至编辑器
                            </button>

                        </div>
                    </div>
                </div>
            );
        })
    }

    render() {
        return (
            <div>

                {
                    this.state.sqlList.length == 0
                        ?
                        (<div className="p-a b-w">
                            尚未有收藏的 Query
                        </div>)
                        :
                        this._favorites()
                }

            </div>
        )
    }


}
