import { request } from '../utils';


// POST
export async function queryByCodeId(params) {
  return request(`/v1/datas?codeId=${params.codeId}&type=${params.formatType}`, {
    method: 'post',
    body: JSON.stringify(params.querys),
  });
}


// POST
export async function postQuerys(params) {
  return request(`/v1/datas?type=${params.formatType}`, {
    method: 'post',
    body: JSON.stringify(params.code),
  });
}
