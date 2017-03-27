/**
 * Created by qiniu on 2017/1/12.
 */
import { request } from '../utils';

export async function getDirs(params) {
  return request(`/v1/dirs?type=${params.type}`, {
    method: 'get',
    data: params,
  });
}

export async function getDir(params) {
  return request(`/v1/dirs/${params.id}`, {
    method: 'get',
    data: params,
  });
}

export async function getChartsByDirId(params) {
  return request(`/v1/charts?dirId=${params.dirId}`, {
    method: 'get',
    data: params,
  });
}

export async function openDir(params) {
  return request(`/v1/reports?dirId=${params.dirId}`, {
    method: 'get',
  });
}

export async function getAllReports(params) {
  return request('/v1/reports', {
    method: 'get',
    data: params,
  });
}

// Get /v1/reports/<ReportId>
export async function getReport(params) {
  return request(`/v1/reports/${params.reportId}`, {
    method: 'get',
  });
}

// Delete /v1/reports/<ReportId>
export async function deleteReport(params) {
  return request(`/v1/reports/${params.rId}`, {
    method: 'delete',
    data: params,
  });
}

// Delete /v1/charts/<ChartId>
export async function deleteChart(params) {
  return request(`/v1/charts/${params.cId}`, {
    method: 'delete',
    data: params,
  });
}

// put /v1/reports/<ReportId>
export async function saveReport(params) {
  return request(`/v1/reports/${params.reportId}`, {
    method: 'put',
    body: JSON.stringify({
      dirId: params.dirId,
      name: params.name,
      isTemplate: params.isTemplate || false,
    }),
  });
}

// Get /v1/layouts/<ReportId>
export async function getLayouts(params) {
  return request(`/v1/layouts/${params.reportId}`, {
    method: 'get',
  });
}

// POST /v1/layouts/<ReportId>
export async function setLayouts(params) {
  return request(`/v1/layouts/${params.reportId}`, {
    method: 'post',
    body: JSON.stringify({ layouts: params.layouts }),
  });
}

// POST /v1/layouts/<ReportId>
export async function addReport(params) {
  return request('/v1/reports', {
    method: 'post',
    body: JSON.stringify({
      dirId: params.dirId,
      name: params.name,
      isTemplate: params.isTemplate || false,
    }),
  });
}

// POST /v1/dirs
export async function addDir(params) {
  return request('/v1/dirs', {
    method: 'post',
    body: JSON.stringify({
      pre: params.pre,
      name: params.name,
      post: '',
      type: params.type,
    }),
  });
}

// PUT /v1/dirs
export async function updateDir(params) {
  return request(`/v1/dirs/${params.id}`, {
    method: 'put',
    body: JSON.stringify({
      pre: params.pre,
      name: params.name,
      post: '',
      type: params.type,
    }),
  });
}

// DELETE /v1/dirs/<DirId>
export async function deleteDir(params) {
  return request(`/v1/dirs/${params.id}`, {
    method: 'delete',
    data: params,
  });
}

// Get /v1/reports/<ReportId>/charts
export async function getCharts(params) {
  return request(`/v1/reports/${params.reportId}/charts`, {
    method: 'get',
  });
}

// GET /v1/datas?q=<CodeId>&type=<ChartType>
export async function queryCode(params) {
  return request('/v1/datas', {
    method: 'get',
    params,
  });
}

