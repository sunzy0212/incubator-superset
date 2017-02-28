/**
 * Created by qiniu on 2017/1/12.
 */
import { request } from '../utils';

// POST
export async function postQuerys(params) {
  return request(`/v1/datas?type=${params.formatType}`, {
    method: 'post',
    body: JSON.stringify(params),
  });
}

// POST /v1/datasets/<DatasetId>/codes
export async function saveCode(params) {
  return request(`/v1/datasets/${params.datasetId}/codes`, {
    method: 'post',
    body: JSON.stringify(params.data),
  });
}

// POST /v1/charts
export async function saveChart(params) {
  return request('/v1/charts', {
    method: 'post',
    body: JSON.stringify(params),
  });
}

// PUT /v1/datasets/<DatasetId>/codes
export async function updateCode(params) {
  return request(`/v1/datasets/${params.datasetId}/codes/${params.codeId}`, {
    method: 'put',
    body: JSON.stringify(params.data),
  });
}

// PUT /v1/charts/<ChartId>
export async function updateChart(params) {
  return request(`/v1/charts/${params.id}`, {
    method: 'put',
    body: JSON.stringify(params),
  });
}

// GET /v1/datas?codeId=<CodeId>&type=<DataType>
export async function queryCode(params) {
  return request('/v1/datas', {
    method: 'get',
    params,
  });
}
