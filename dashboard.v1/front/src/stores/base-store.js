import { observable, computed, reaction, transaction, asMap } from 'mobx';
import { autorun } from "mobx";
import shortid from 'shortid';
const Layout = {
    x: 0, y: 0, w: 6, h: 4, isDraggable: true, isResizable: true, _i: 1
};
const DefineCode = "SELECT sum(NumGC) from runtime where time > now() - 1h group by time(1m)"

export default class BaseStore {
    @observable theme = true;
    @observable dataSet = asMap(localStorage.getItem("dataSet") ? JSON.parse(localStorage.getItem("dataSet")) : {
        testLine: {
            title: "折线图示例",
            subTitle: "聚合最近半小时的数据",
            sql: "Select mean(\"Frees\"), mean(\"Alloc\"), mean(\"HeapAlloc\") from runtime where time > now() - 15m  AND time < now() - 5m GROUP BY time(1m)",
            type: "area-spline",
            stack: true,
            dbHost: "http://b0ah76fu.nq.cloudappl.com",
            db: "_internal"

        },
        testBar: {
            title: "柱状图示例",
            subTitle: "聚合最近半小时的数据",
            sql: "Select mean(\"Frees\"), mean(\"Alloc\"), mean(\"HeapAlloc\") from runtime where time > now() - 15m  AND time < now() - 5m GROUP BY time(1m)",
            type: "bar",
            stack: true,
            dbHost: "http://b0ah76fu.nq.cloudappl.com",
            db: "_internal"

        },
        testBarStack: {
            title: "柱状堆叠图示例",
            subTitle: "聚合最近半小时的数据",
            sql: "Select mean(\"Frees\"), mean(\"Alloc\"), mean(\"HeapAlloc\") from runtime where time > now() - 15m  AND time < now() - 5m GROUP BY time(1m)",
            type: "step",
            dbHost: "http://b0ah76fu.nq.cloudappl.com",
            db: "_internal"

        },
        testPie: {
            title: "饼图示例",
            subTitle: "聚合最近半小时的数据",
            sql: "Select mean(\"Frees\"), mean(\"Alloc\"), mean(\"HeapAlloc\") from runtime where time > now() - 30m  AND time < now() - 5m GROUP BY time(1m)",
            type: "pie",
            stack: true,
            dbHost: "http://b0ah76fu.nq.cloudappl.com",
            db: "_internal"

        }
    });
    @observable dbHost = "http://b0ah76fu.nq.cloudappl.com";
    @observable db = "demo";
    @observable layout = localStorage.getItem("layout") ? JSON.parse(localStorage.getItem("layout")) : [{
        i: 'testLine',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        isDraggable: true,
        isResizable: true,
        _i: 1, minH: 4, maxH: 4
    },
        { i: 'testBar', x: 6, y: 0, w: 6, h: 4, isDraggable: true, isResizable: true, _i: 1},
        { i: 'testBarStack', x: 0, y: 4, w: 6, h: 4, isDraggable: true, isResizable: true, _i: 1, minH: 4, maxH: 4 },
        { i: 'testPie', x: 6, y: 4, w: 6, h: 4, isDraggable: true, isResizable: true, _i: 1, minH: 4, maxH: 4 }];
    layout_save = [];
    @observable code = DefineCode;
    @observable layoutEditing = false;
    @observable history = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")) : [];
    @observable favorites = localStorage.getItem("favorites") ? JSON.parse(localStorage.getItem("favorites")) : [];


    addHistory(data) {
        this.history.push(data);
        localStorage.setItem('history', JSON.stringify(this.history.toJS()));
    }

    addFavorites() {
        this.favorites.push({
            query: this.code,
            id: shortid.generate()
        });
        localStorage.setItem('favorites', JSON.stringify(this.favorites.toJS()));
    }

    removeFavorite(key) {
        this.favorites = this.favorites.filter((item) => item.id != key);
        localStorage.setItem('favorites', JSON.stringify(this.favorites.toJS()));
    }

    setTheme() {
        this.theme = !this.theme;
    }

    updateCode(newValue) {
        this.code = newValue;
    }

    setDB(name) {
        this.db = name;
    }

    addData(key, data) {
        console.log("addData", data);
        this.dataSet.set(key, {
            ...data,
            title: "",
            subTitle: "",
            dbHost: "http://b0ah76fu.nq.cloudappl.com"
        });
        this.layout.push({
            ...Layout,
            i: key,
        })
    }

    removeData(key) {
        transaction(() => {
            this.layout = this.layout.filter((item) => item.i != key);
            delete this.dataSet.delete(key)
        });
        localStorage.setItem('dataSet', JSON.stringify(this.getDataSet()));
        localStorage.setItem('layout', JSON.stringify(this.layout.toJS()));
    }

    changeTitle(key, title, subTitle) {
        this.dataSet.set(key, {
            ...this.dataSet.get(key),
            title: title,
            subTitle: subTitle

        });
        localStorage.setItem('dataSet', JSON.stringify(this.getDataSet()));
    }

    editorLayout() {
        this.layout_save = this.layout.toJS();
        this.layout = this.layout.map((item) => {
            return { ...item, isDraggable: true, isResizable: true }
        });
        this.layoutEditing = true;
    }


    cancelLayout() {
        this.layout = this.layout_save;
        this.layoutEditing = false;
    }

    submitLayout(newLayout) {
        this.layout = newLayout.map((item) => {
            return { ...item, isDraggable: false, isResizable: false }
        });
        localStorage.setItem('layout', JSON.stringify(this.layout.toJS()));
        this.layoutEditing = false;
    }

    getDataSet() {
        let result = {};
        let dataSet = this.dataSet;
        this.dataSet.keys().forEach((key) => result[key] = dataSet.get(key));

        return result

    }

    updateData(data) {

        transaction(() => {
            this.layout = JSON.parse(data.layout);
            this.dataSet = asMap(JSON.parse(data.dataSet));
        })
        console.log(this.dataSet);
        localStorage.setItem('dataSet', JSON.stringify(this.getDataSet()));
        localStorage.setItem('layout', JSON.stringify(this.layout.toJS()));

    }
}
