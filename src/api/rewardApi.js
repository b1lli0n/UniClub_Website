import api from './api'
import axiosInstance from './adminapi'

// ==================== PUBLIC REWARD APIS (User) ====================

export const getRewards = async (clubId, params = {}) => {
    const response = await api.get(`/rewards/${clubId}`, { params })
    return response.data
}

export const getRewardDetail = async (clubId, rewardId) => {
    const response = await api.get(`/rewards/${clubId}/${rewardId}`)
    // console.log('getRewardDetail response:', response)
    // console.log('getRewardDetail response.data:', response.data)
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
    const response = await axiosInstance.get(`/rewards/clubs/${clubId}`, { params: query })
    // console.log('getClubRewards response:', response)
    return response
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
 * Lấy chi tiết phần thưởng (Admin) — không bị lọc is_active
 * GET /api/admin/rewards/:rewardId
 */
export const getAdminRewardDetail = async (rewardId) => {
    return axiosInstance.get(`/rewards/rewards/${rewardId}`)
}

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

/**
 * Duyệt hoặc từ chối yêu cầu đổi thưởng
 * PUT /api/admin/clubs/:clubId/reward-transactions/:transactionId/status
 * @param {string} clubId - ID của CLB
 * @param {string} transactionId - ID của giao dịch đổi thưởng
 * @param {number} status - 1 (approved) hoặc 2 (rejected)
 */
export const updateRedemptionStatus = async (clubId, transactionId, status) => {
  return axiosInstance.put(`/clubs/${clubId}/reward-transactions/${transactionId}/status`, { status });
};

// ==================== MANUAL ASSIGN BADGE APIS ====================

/**
 * Lấy danh sách huy hiệu của CLB để dùng trong modal "Thêm huy hiệu"
 * GET /api/admin/clubs/:clubId/badges-for-assign
 * @param {string} clubId - ID của CLB
 */
export const getClubBadgesForAssign = async (clubId) => {
  return axiosInstance.get(`/clubs/${clubId}/badges-for-assign`);
};

/**
 * Thêm huy hiệu cho thành viên (manual assign)
 * POST /api/admin/clubs/:clubId/members/:membershipId/assign-badge
 * @param {string} clubId - ID của CLB
 * @param {string} membershipId - ID của membership
 * @param {string} badgeId - ID của BadgeTemplate
 */
export const assignBadgeToMember = async (clubId, membershipId, badgeId) => {
  return axiosInstance.post(`/clubs/${clubId}/members/${membershipId}/assign-badge`, { badge_id: badgeId });
};

/**
 * Lấy danh sách huy hiệu đã có của một thành viên
 * GET /api/admin/clubs/:clubId/members/:membershipId/badges
 * @param {string} clubId       - ID của CLB
 * @param {string} membershipId - ID của membership
 */
export const getMemberBadges = async (clubId, membershipId) => {
  return axiosInstance.get(`/clubs/${clubId}/members/${membershipId}/badges`);
};

// ==================== BADGE APIS ====================


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
    const response = await axiosInstance.get(`/club-badges/${id}`)
    return response
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
    getAdminRewardDetail,
    getRedemptionHistoryAdmin,
    getAdminRewardPointLogs,
    getBadgeTemplates,
    getBadgeTemplateDetail,
}

export default rewardApi
