import { request } from '../utils'
import qs from 'qs'

export async function login(params) {
  // return request('/api/login', {
  //   method: 'post',
  //   data:params,
  // })
  return {success:true}
}

export async function logout(params) {
  // return request('/api/logout', {
  //   method: 'post',
  //   data:params,
  // })
}

export async function userInfo(params) {
  return {success:true,username:"wcx"}
  // return request('/api/userInfo', {
  //   method: 'get',
  //   data:params,
  // })
}
