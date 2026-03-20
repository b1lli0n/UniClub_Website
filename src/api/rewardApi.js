import api from './api'
import axiosInstance from './adminapi'

// ==================== PUBLIC REWARD APIS (User) ====================

export const getRewards = async (clubId, params = {}) => {
    const response = await api.get(`/rewards/${clubId}`, { params })
    return response.data
}

export const getRewardDetail = async (clubId, rewardId) => {
    const response = await api.get(`/rewards/${clubId}/${rewardId}`)
    return response.data
}

export const getRedemptionHistory = async (clubId, params = {}) => {
    const response = await api.get(`/rewards/${clubId}/history`, { params })
    return response.data
}

export const getContributionScore = async (clubId) => {
    const response = await api.get(`/users/contributions/${clubId}`)
    return response.data
}

export const redeemReward = async (clubId, rewardId) => {
    const response = await api.post(`/rewards/${clubId}/redeem/${rewardId}`)
    return response.data
}

export const updateRedemptionStatus = async (clubId, transactionId, payload) => {
    const response = await api.put(`/rewards/${clubId}/${transactionId}/status`, payload)
    return response.data
}

// ==================== ADMIN REWARD APIS ====================

/**
 * Lấy danh sách phần thưởng của một CLB (Admin)
 * GET /api/admin/clubs/:clubId/rewards?page&limit&search&is_active
 */
export const getClubRewards = async (clubId, params = {}) => {
    const { page = 1, limit = 10, search = '', is_active } = params
    const query = { page, limit, search }
    if (is_active !== undefined && is_active !== 'all') {
        query.is_active = is_active
    }
    const response = await axiosInstance.get(`/clubs/${clubId}/rewards`, { params: query })
    return response.data
}

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

/**
 * Lấy lịch sử đổi thưởng của CLB (Admin)
 * GET /api/admin/clubs/:clubId/reward-transactions?page&limit&status
 */
export const getRedemptionHistoryAdmin = async (clubId, params = {}) => {
    const { page = 1, limit = 10, status } = params
    const query = { page, limit }
    if (status !== undefined && status !== '' && status !== 'all') {
        query.status = status
    }
    const response = await axiosInstance.get(`/clubs/${clubId}/reward-transactions`, { params: query })
    return response.data
}

/**
 * Lấy reward point transaction logs (Admin only)
 * GET /api/admin/rewards/transactions?page&limit&clubId&membershipId&rewardId&rewardTransactionId&action&from&to
 */
export const getAdminRewardPointLogs = async (params = {}) => {
    const {
        page = 1,
        limit = 20,
        clubId,
        membershipId,
        rewardId,
        rewardTransactionId,
        action,
        from,
        to,
    } = params

    const query = { page, limit }
    if (clubId) query.clubId = clubId
    if (membershipId) query.membershipId = membershipId
    if (rewardId) query.rewardId = rewardId
    if (rewardTransactionId) query.rewardTransactionId = rewardTransactionId
    if (action) query.action = action
    if (from) query.from = from
    if (to) query.to = to

    // admin axiosInstance already returns response payload via interceptor,
    // but this normalization also supports raw axios responses if config changes.
    const raw = await axiosInstance.get('/rewards/transactions', { params: query })
    const payload = raw?.data ?? raw

    const logs = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.logs)
                    ? payload.logs
                    : []

    const pagination = payload?.pagination || payload?.meta || {
        page: Number(payload?.page) || page,
        limit: Number(payload?.limit) || limit,
        total: Number(payload?.total) || logs.length,
        pages: Number(payload?.pages) || Number(payload?.totalPages) || 1,
    }

    return { data: logs, pagination }
}

// ==================== ADMIN BADGE APIS ====================

/**
 * Lấy danh sách tất cả badge templates (Admin)
 * GET /api/admin/badges?page&limit&search&is_active
 */
export const getBadgeTemplates = async (params = {}) => {
    const { page = 1, limit = 12, search = '', is_active } = params
    const query = { page, limit, search }
    if (is_active !== undefined && is_active !== 'all') {
        query.is_active = is_active
    }
    const response = await axiosInstance.get('/badges', { params: query })
    return response.data
}

/**
 * Lấy chi tiết badge template (bao gồm earned_count) (Admin)
 * GET /api/admin/badges/:id
 */
export const getBadgeTemplateDetail = async (id) => {
    const response = await axiosInstance.get(`/badges/${id}`)
    return response.data
}

const rewardApi = {
    // Public APIs
    getRewards,
    getRewardDetail,
    getRedemptionHistory,
    getContributionScore,
    redeemReward,
    updateRedemptionStatus,
    // Admin APIs
    getClubRewards,
    createReward,
    updateReward,
    getRedemptionHistoryAdmin,
    getAdminRewardPointLogs,
    getBadgeTemplates,
    getBadgeTemplateDetail,
}

export default rewardApi
