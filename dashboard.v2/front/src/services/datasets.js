import { request } from '../utils'

export async function listDatasets(params){
  return request('/v1/datasets', {
    method: 'get',
    data:params,
  })
}

export async function saveDataSet(params){
  let id = params.id || ''
  return request(`/v1/datasets${id==''? '':'/'+id}`, {
    method: id=='' ? 'post' : 'put',
    body:JSON.stringify(params),
  })
}


export async function deleteDataSet(params){
  return request(`/v1/datasets/${params.id}`, {
    method: 'delete',
    data:params,
  })
}
