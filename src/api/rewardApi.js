import api from './api'

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

export const redeemReward = async (clubId, rewardId, payload = {}) => {
    const response = await api.post(`/rewards/${clubId}/redeem/${rewardId}`, payload)
    return response.data
}

export const updateRedemptionStatus = async (clubId, transactionId, payload) => {
    const response = await api.put(`/rewards/${clubId}/${transactionId}/status`, payload)
    return response.data
}

const rewardApi = {
    getRewards,
    getRewardDetail,
    getRedemptionHistory,
    redeemReward,
    updateRedemptionStatus,
}

export default rewardApi
