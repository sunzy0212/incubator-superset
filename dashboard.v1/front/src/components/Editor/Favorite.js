import React, { Component, PropTypes }from 'react';
import { observer } from "mobx-react";
import { ajax } from '../../utils/DecodeData'
@observer
export default class QueryFavorite extends Component {

    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    @observer sqlList = []

    removeSql(sqlId) {
        let that  = this;
        fetch(`${that.context.store.hosts}/v1/codes/${sqlId}`, {
            method: "delete",
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            })
        }).then(response =>
            response.json()
            ).then(data =>
                this.getSqlList()

            ).catch(e => {
                console.log("event", e);
            });
    }

    setData(data) {
        this.props.favorites.codes = data.codes
        this._favorites()
    }

    getSqlList() {
        let that = this;
        let type = "MYSQL";
        if (this.context != undefined) {
            type = this.context.store.currentDB.type;
        }
        ajax({
            url: that.context.store.hosts + "/v1/codes?type=" + type,
            type: 'get',
            dataType: 'JSON',
            contentType: 'application/json; charset=utf-8'
        }).then(
            function fulfillHandler(data) {
                that.context.store.sqlList = data;
            },
            function rejectHandler(jqXHR, textStatus, errorThrown) {
                console.log("reject", textStatus, jqXHR, errorThrown);
            })
    }

    handleRemove(item) {
        this.removeSql(item.id)
    }

    _favorites() {
        let that = this;
        console.log(this);
        return _.map(this.props.favorites.codes, function (item, i) {
            return (
                <div key={i} className="favorite saved-queries">
                    <pre><code>{item.code}</code></pre>
                    <div>
                        <div className="pull-right">
                            <button onClick={that.handleRemove.bind(that, item) }
                                className="btn btn-xs white m-r-5 ">删除
                            </button>
                            <button onClick={() => that.context.store.updateCode(item.code) }
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
                    this.props.favorites.codes.length == 0
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
