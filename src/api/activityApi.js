// API calls cho chức năng quản lý lịch sinh hoạt CLB
// Dành cho Secretary

import api from './api';

const BASE = (clubId) => `/clubs/${clubId}/activities`;

/**
 * Lấy danh sách hoạt động của CLB (Secretary)
 * GET /api/clubs/:clubId/activities
 * @param {string} clubId
 * @param {object} params - { start_date, end_date, search, page, limit }
 */
export const getActivities = (clubId, params = {}) =>
    api.get(BASE(clubId), { params });

/**
 * Lấy chi tiết hoạt động của CLB
 * GET /api/clubs/:clubId/activities/:activityId
 * @param {string} clubId
 * @param {string} activityId
 */
export const getActivityDetail = (clubId, activityId) =>
    api.get(`${BASE(clubId)}/${activityId}`);

/**
 * Tạo hoạt động mới (Secretary)
 * POST /api/clubs/:clubId/activities
 * @param {string} clubId
 * @param {object} data
 */
export const createActivity = (clubId, data) =>
    api.post(BASE(clubId), data);

/**
 * Cập nhật hoạt động
 * PUT /api/clubs/:clubId/activities/:activityId
 * @param {string} clubId
 * @param {string} activityId
 * @param {object} data
 */
export const updateActivity = (clubId, activityId, data) =>
    api.put(`${BASE(clubId)}/${activityId}`, data);

/**
 * Xóa/Hủy hoạt động
 * PATCH /api/clubs/:clubId/activities/:activityId/cancel
 * @param {string} clubId
 * @param {string} activityId
 */
export const deleteActivity = (clubId, activityId) =>
    api.patch(`${BASE(clubId)}/${activityId}/cancel`);

/**
 * Lấy danh sách hoạt động dành cho thành viên CLB
 * GET /api/clubs/:clubId/activities/member
 * @param {string} clubId
 * @param {object} params - { start_date, end_date, page, limit }
 */
export const getMemberActivities = (clubId, params = {}) =>
    api.get(`${BASE(clubId)}/member`, { params });

/**
 * Lấy chi tiết hoạt động dành cho thành viên CLB
 * GET /api/clubs/:clubId/activities/member/:id
 * @param {string} clubId
 * @param {string} activityId
 */
export const getMemberActivityDetail = (clubId, activityId) =>
    api.get(`${BASE(clubId)}/member/${activityId}`);
