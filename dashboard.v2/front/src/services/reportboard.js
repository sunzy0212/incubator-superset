/**
 * Created by qiniu on 2017/1/12.
 */
import { request } from '../utils';

export async function getDirs(params) {
  return request('/v1/dirs', {
    method: 'get',
    data: params,
  });
}

export async function openDir(params) {
  return request(`/v1/reports?dirId=${params.dirId}`, {
    method: 'get',
  });
}
