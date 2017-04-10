import { request } from '../utils';


export async function getChart(params) {
  return request(`/v1/charts/${params.id}`, {
    method: 'get',
  });
}


// POST /v1/charts
export async function saveChart(params) {
  return request('/v1/charts', {
    method: 'post',
    body: JSON.stringify(params),
  });
}


// PUT /v1/charts/<ChartId>
export async function updateChart(params) {
  return request(`/v1/charts/${params.id}`, {
    method: 'put',
    body: JSON.stringify(params),
  });
}

