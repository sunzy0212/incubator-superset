import {listDatasets,saveDataSet,deleteDataSet} from '../services/datasets'
import {parse} from 'qs'

export default {
  namespace : 'datasets',
  state : {
    loading: false,
    saveLoading: false,
    modalVisible: false,
    item:{},
    dataSetType:'MYSQL',
    records:[]
  },
  subscriptions : {
    setup({dispatch}) {
      dispatch({type: 'queryDatasets'})
    }
  },
  effects : {
    *queryDatasets({
      payload
    }, {call, put}) {
      yield put({type: 'showLoading'})
      const data = yield call(listDatasets, parse(payload))
      if (data.success) {
        yield put({
          type: 'listDatasets',
          payload: {
            records: data.datasets
          }
        })
      }
      yield put({type: 'hideLoading'})
    },
    *save({
      payload
    },{call,put}){
      console.log("Save",payload)
      //yield put({type: 'showSaveLoading'})
      const data = yield call(saveDataSet,parse(payload))
      if (data.success) {
        yield put({type:'queryDatasets'})
      }
      yield put({type: 'hideSaveLoading'})
    },
    *'delete'({payload},{call,put}){
      const data = yield call(deleteDataSet, parse(payload))
      if (data.success) {
        yield put({type:'deleteDataSets',
          ...payload})
      }
    },
  },
  reducers : {
    showLoading(state) {
      return {
        ...state,
        loading: true
      }
    },
    hideLoading(state) {
      return {
        ...state,
        item:{},
        loading: false
      }
    },

    showSaveLoading(state) {
      return {
        ...state,
        saveLoading: true
      }
    },
    hideSaveLoading(state) {
      return {
        ...state,
        saveLoading: false,
        modalVisible: false
      }
    },

    showModal(state,action) {
      let data = action.payload
      if (data.id == undefined||data.id==''){
        return {
          ...state,
          modalVisible: true,
          dataSetType: data.dataSetType,
        }
      }else {
        const item = state.records.filter((element)=>{
          return element.id == data.id
        })
        return {
          ...state,
          item: item[0],
          modalVisible: true,
          dataSetType: item[0].type,
        }
      }
    },

    hideModal(state) {
      return {
        ...state,
        modalVisible: false
      }
    },
    listDatasets(state,action){
      return {
        ...state,
        ...action.payload
      }
    },
    deleteDataSets(state,action){
      console.log(state.records)
      const newRecords = state.records.filter((element)=>{
        return element.id != action.id
      })
      return{
        ...state,
        records:newRecords
      }
    },
  }
}
