/**
 * Created by qiniu on 2017/1/12.
 */
import { request } from '../utils';

export async function getTemplates(params) {
  return request('/v1/templates', {
    method: 'get',
    data: params,
  });
}

export async function postTemplate(params) {
  return request('/v1/templates', {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function updateTemplate(params) {
  return request(`/v1/templates/${params.id}`, {
    method: 'put',
    body: JSON.stringify(params),
  });
}

export async function deleteTemplate(params) {
  return request(`/v1/templates/${params.id}`, {
    method: 'delete',
    data: params,
  });
}

export async function postCrontab(params) {
  return request(`/v1/templates/${params.tempId}/crons`, {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function deleteCrontab(params) {
  return request(`/v1/templates/${params.tempId}/crons/${params.cronId}`, {
    method: 'delete',
    data: params,
  });
}
