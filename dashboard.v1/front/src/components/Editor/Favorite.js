import React, { Component, PropTypes }from 'react';
import { observer } from "mobx-react";
@observer
export default class QueryFavorite extends Component {

    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    handleRemove(item) {
        this.context.store.removeFavorite(item.id)
    }

    _favorites() {
        let that = this;
        return _.map(this.context.store.favorites, function (item, i) {
            return (
                <div key={i} className="favorite saved-queries">
                    <pre><code>{item.query}</code></pre>
                    <div>
                        <div className="pull-right">
                            <button onClick={that.handleRemove.bind(that, item)}
                                    className="btn btn-xs white m-r-5 ">删除
                            </button>
                            <button onClick={() => that.context.store.updateCode(item.query)}
                                className="btn btn-xs info m-r-5">复制至编辑器</button>

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
                    this.context.store.favorites.length == 0
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
