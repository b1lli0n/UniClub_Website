// API calls cho chức năng quản lý giao dịch tài chính CLB
// Dành cho Treasurer (Thủ quỹ)

import api from './api';

const BASE = (clubId) => `/clubs/${clubId}/transactions`;

/**
 * Lấy danh sách giao dịch của CLB
 * GET /api/clubs/:clubId/transactions
 * @param {string} clubId
 * @param {object} params - { page, limit, status, type }
 */
export const getTransactions = (clubId, params = {}) =>
    api.get(BASE(clubId), { params });

export const getLeaderTransactions = (clubId, params = {}) =>
    api.get(`${BASE(clubId)}/leader`, { params });

export const reviewLeaderTransaction = (clubId, transactionId, payload) =>
    api.patch(`${BASE(clubId)}/leader/${transactionId}/review`, payload);

export const getTransactionDetail = (clubId, transactionId) =>
    api.get(`${BASE(clubId)}/leader/${transactionId}`);

/**
 * Tạo yêu cầu giao dịch mới (Treasurer)
 * POST /api/clubs/:clubId/transactions
 * @param {string} clubId
 * @param {object} data - { type, category, amount, description, transaction_date }
 */
export const createTransaction = (clubId, data) =>
    api.post(BASE(clubId), data);

/**
 * Cập nhật giao dịch (chỉ khi status = pending và người tạo)
 * PUT /api/clubs/:clubId/transactions/:transactionId
 * @param {string} clubId
 * @param {string} transactionId
 * @param {object} data - { type?, category?, amount?, description?, transaction_date? }
 */
export const updateTransaction = (clubId, transactionId, data) =>
    api.put(`${BASE(clubId)}/${transactionId}`, data);
