// src/api/financeApi.js
// Finance endpoints: /api/clubs/:clubId/transactions
// Auth: Bearer accessToken (Treasurer role)
import api from './api'

const base = (clubId) => `/clubs/${clubId}/transactions`

/**
 * GET /api/clubs/:clubId/transactions/dashboard
 * params: { from, to }
 */
export const getDashboard = (clubId, params = {}) =>
    api.get(`${base(clubId)}/dashboard`, { params })

/**
 * GET /api/clubs/:clubId/transactions
 * params: { page, limit, type, status, category, from, to }
 */
export const getTransactions = (clubId, params = {}) =>
    api.get(base(clubId), { params })

/**
 * POST /api/clubs/:clubId/transactions
 * body: { type, category, amount, description, transaction_date, status }
 */
export const createTransaction = (clubId, data) =>
    api.post(base(clubId), data)

/**
 * PATCH /api/clubs/:clubId/transactions/:txnId/approve
 * body: { note? }
 */
export const approveTransaction = (clubId, txnId, note) =>
    api.patch(`${base(clubId)}/${txnId}/approve`, note ? { note } : {})

/**
 * PATCH /api/clubs/:clubId/transactions/:txnId/reject
 * body: { note? }
 */
export const rejectTransaction = (clubId, txnId, note) =>
    api.patch(`${base(clubId)}/${txnId}/reject`, note ? { note } : {})

/**
 * POST /api/clubs/:clubId/memberships/payment-reminder
 * body: { title, body, memberIds? }
 */
export const sendPaymentReminder = async (clubId, data) => {
    const url = `/clubs/${clubId}/memberships/payment-reminder`

    try {
        return await api.post(url, data)
    } catch (error) {
        const status = error?.response?.status
        const selectedIds = Array.isArray(data?.memberIds) ? data.memberIds : []

        // Fallback for backend variants that use different payload keys.
        if ([400, 422, 500].includes(status)) {
            const fallbackPayload = {
                title: data?.title,
                body: data?.body,
                message: data?.body,
                content: data?.body,
                description: data?.body,
            }

            if (selectedIds.length > 0) {
                fallbackPayload.memberIds = selectedIds
                fallbackPayload.membershipIds = selectedIds
            }

            return api.post(url, fallbackPayload)
        }

        throw error
    }
}

/**
 * POST /api/clubs/:clubId/memberships/transaction-notification
 * body: { memberIds?, title, body, transactionId?, transactionType?, status?, amount?, transactionDate? }
 */
export const sendTransactionNotification = (clubId, data) =>
    api.post(`/clubs/${clubId}/memberships/transaction-notification`, data)

/**
 * GET /api/clubs/:clubId/transactions/report/export
 * format=csv|xlsx|excel  → returns binary blob
 * params: { format, from, to, type, status, category }
 */
export const exportTransactionsBlob = (clubId, params = {}) =>
    api.get(`${base(clubId)}/report/export`, {
        params,
        responseType: 'blob',
        headers: {
            Accept: 'text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json',
        },
    })

/**
 * GET /api/clubs/:clubId/transactions/report/export?format=json
 */
export const exportTransactionsJson = (clubId, params = {}) =>
    api.get(`${base(clubId)}/report/export`, {
        params: { ...params, format: 'json' },
        headers: {
            Accept: 'application/json',
        },
    })
