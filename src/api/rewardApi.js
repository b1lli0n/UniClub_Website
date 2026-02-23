// src/api/rewardApi.js
// Dùng chung axiosInstance từ adminapi.js (đã có interceptor + baseURL /api/admin)
import axiosInstance from './adminapi';

// ==================== REWARD APIS ====================

/**
 * Lấy danh sách phần thưởng của một CLB
 * GET /api/admin/clubs/:clubId/rewards?page&limit&search&is_active
 */
export const getClubRewards = async (clubId, params = {}) => {
  const { page = 1, limit = 10, search = '', is_active } = params;
  const query = { page, limit, search };
  if (is_active !== undefined && is_active !== 'all') {
    query.is_active = is_active;
  }
  return axiosInstance.get(`/clubs/${clubId}/rewards`, { params: query });
};

/**
 * Lấy chi tiết một phần thưởng
 * GET /api/admin/rewards/:id
 */
export const getRewardDetail = async (id) => {
  return axiosInstance.get(`/rewards/${id}`);
};

/**
 * Tạo phần thưởng mới cho CLB
 * POST /api/admin/clubs/:clubId/rewards
 * body: { name, description, points_required, quantity }
 */
export const createReward = async (clubId, data) => {
  return axiosInstance.post(`/clubs/${clubId}/rewards`, data);
};

/**
 * Cập nhật hoặc ẩn/hiện phần thưởng
 * PUT /api/admin/rewards/:id
 * body: { name?, description?, points_required?, quantity?, is_active? }
 */
export const updateReward = async (id, data) => {
  return axiosInstance.put(`/rewards/${id}`, data);
};

// ==================== REDEMPTION HISTORY APIS ====================

/**
 * Lấy lịch sử đổi thưởng của CLB
 * GET /api/admin/clubs/:clubId/reward-transactions?page&limit&status
 */
export const getRedemptionHistory = async (clubId, params = {}) => {
  const { page = 1, limit = 10, status } = params;
  const query = { page, limit };
  if (status !== undefined && status !== '' && status !== 'all') {
    query.status = status;
  }
  return axiosInstance.get(`/clubs/${clubId}/reward-transactions`, { params: query });
};

// ==================== BADGE APIS ====================

/**
 * Lấy danh sách tất cả badge templates
 * GET /api/admin/badges?page&limit&search&is_active
 */
export const getBadgeTemplates = async (params = {}) => {
  const { page = 1, limit = 12, search = '', is_active } = params;
  const query = { page, limit, search };
  if (is_active !== undefined && is_active !== 'all') {
    query.is_active = is_active;
  }
  return axiosInstance.get('/badges', { params: query });
};

/**
 * Lấy chi tiết badge template (bao gồm earned_count)
 * GET /api/admin/badges/:id
 */
export const getBadgeTemplateDetail = async (id) => {
  return axiosInstance.get(`/badges/${id}`);
};
