import { request } from '../utils';

export async function listDataSets(params) {
  return request('/v1/datasets', {
    method: 'get',
    data: params,
  });
}

export async function getDataSet(params) {
  return request(`/v1/datasets/${params.id}`, {
    method: 'get',
    data: params,
  });
}

export async function deleteDataSet(params) {
  return request(`/v1/datasets/${params.id}`, {
    method: 'delete',
    data: params,
  });
}

export async function saveDataSet(params) {
  return request('/v1/datasets', {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function updateDataSet(params) {
  return request(`/v1/datasets/${params.id}`, {
    method: 'put',
    body: JSON.stringify(params.dataset),
  });
}

export async function getDatasetData(params) {
  return request(`/v1/datas?type=${params.type}`, {
    method: 'post',
    body: JSON.stringify({ datasetId: params.id }),
  });
}

// GET /v1/datas?q=<CodeId>&type=<ChartType>
export async function getCode(params) {
  return request(`/v1/datasets/${params.datasetId}/codes/${params.codeId}`, {
    method: 'get',
    data: params,
  });
}


// POST /v1/datasets/<DatasetId>/codes
export async function saveCode(params) {
  return request(`/v1/datasets/${params.datasetId}/codes`, {
    method: 'post',
    body: JSON.stringify(params.data),
  });
}

// PUT /v1/datasets/<DatasetId>/codes
export async function updateCode(params) {
  return request(`/v1/datasets/${params.datasetId}/codes/${params.codeId}`, {
    method: 'put',
    body: JSON.stringify(params.data),
  });
}
