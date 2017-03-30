import { request } from '../utils';

export async function listDatasources(params) {
  return request('/v1/datasources', {
    method: 'get',
    data: params,
  });
}

export async function saveDataSource(params) {
  const id = params.id || '';
  return request(`/v1/datasources${id === '' ? '' : `/${id}`}`, {
    method: id === '' ? 'post' : 'put',
    body: JSON.stringify(params),
  });
}


export async function deleteDataSource(params) {
  return request(`/v1/datasources/${params.id}`, {
    method: 'delete',
    data: params,
  });
}

export async function showTables(params) {
  return request(`/v1/datasources/${params.id}/tables`, {
    method: 'get',
    data: params,
  });
}


export async function getSchema(params) {
  return request(`/v1/datasources/${params.id}/tables/${params.tableName}`, {
    method: 'get',
    data: params,
  });
}

export async function getTableData(params) {
  return request(`/v1/datasources/${params.id}/tables/${params.tableName}/data`, {
    method: 'get',
    data: params,
  });
}
