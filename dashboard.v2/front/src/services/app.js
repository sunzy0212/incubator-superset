import { request } from '../utils';

export async function addUser(params) {
  return request('/v1/users', {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function updateUser(params) {
  return request(`/v1/users/${params.username}`, {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function login(params) {
  return request('/v1/users/login', {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function logout(params) {
  return request('/v1/users/logout', {
    method: 'post',
    body: JSON.stringify(params),
  });
}

export async function checkLogin(params) {
  return request('/v1/users/check', {
    method: 'post',
    body: JSON.stringify(params),
  });
}
