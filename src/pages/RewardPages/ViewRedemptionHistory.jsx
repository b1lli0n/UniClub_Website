import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getUserRedemptionHistory } from '../../api/rewardApi'
import '../../styles/Rewards.css'
import ClubDetailNav from '../../components/ClubDetailNav'

const normalizeHistoryResponse = (payload) => {
    const dataNode = payload?.data || payload || {}

    const items =
        (Array.isArray(dataNode) ? dataNode : null) ||
        dataNode?.data ||
        dataNode?.transactions ||
        dataNode?.history ||
        payload?.data ||
        payload?.transactions ||
        payload?.history ||
        (Array.isArray(payload) ? payload : [])

    const rawPagination = dataNode?.pagination || payload?.pagination || {}
    const fallbackTotal = Array.isArray(items) ? items.length : 0
    const page = Number(rawPagination?.page) || 1
    const limit = Number(rawPagination?.limit) || 10
    const total = Number(rawPagination?.total) || fallbackTotal
    const totalPages =
        Number(rawPagination?.totalPages) ||
        Number(rawPagination?.total_pages) ||
        Number(rawPagination?.totalPage) ||
        Math.max(1, Math.ceil(total / limit))

    const pagination = {
        ...rawPagination,
        page,
        limit,
        total,
        totalPages,
    }

    return {
        items: Array.isArray(items) ? items : [],
        pagination,
    }
}

const statusText = (status) => {
    if (status === 0 || status === 'pending') return 'Pending'
    if (status === 1 || status === 'approved' || status === 'completed') return 'Approved'
    if (status === 2 || status === 'rejected' || status === 'cancelled') return 'Rejected'
    return String(status || 'Unknown')
}

const ViewRedemptionHistory = () => {
    const { clubId } = useParams()
    const location = useLocation()
    const [history, setHistory] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
    const [statusFilter, setStatusFilter] = useState('1')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true)
                setError('')
                const params = {
                    page: pagination.page,
                    limit: pagination.limit,
                }

                if (statusFilter !== 'all') {
                    params.status = Number(statusFilter)
                }

                const payload = await getUserRedemptionHistory(clubId, params)
                const normalized = normalizeHistoryResponse(payload)
                setHistory(normalized.items)
                setPagination(normalized.pagination)
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Không thể tải lịch sử đổi quà')
            } finally {
                setLoading(false)
            }
        }

        if (clubId) fetchHistory()
    }, [clubId, pagination.page, pagination.limit, statusFilter])

    useEffect(() => {
        if (location.state?.historyData || location.state?.historyPagination) {
            if (Array.isArray(location.state.historyData)) {
                setHistory(location.state.historyData)
            }

            if (location.state.historyPagination) {
                const page = Number(location.state.historyPagination.page) || 1
                const limit = Number(location.state.historyPagination.limit) || 10
                const total = Number(location.state.historyPagination.total) || 0
                const totalPages =
                    Number(location.state.historyPagination.totalPages) ||
                    Number(location.state.historyPagination.total_pages) ||
                    Math.max(1, Math.ceil(total / limit))

                setPagination({ page, limit, total, totalPages })
            }
        }
    }, [location.state])

    const changePage = (nextPage) => {
        const maxPages = Number(pagination.totalPages) || 1
        if (nextPage < 1 || nextPage > maxPages || nextPage === pagination.page) return
        setPagination((prev) => ({ ...prev, page: nextPage }))
    }

    return (
        <div className="rewards-page">
            <ClubDetailNav />
            <div className="rewards-shell">
                <div className="rewards-header">
                    <div>
                        <h1 className="rewards-title">View redemption history</h1>
                        <p className="rewards-subtitle">Lịch sử đổi quà theo CLB</p>
                    </div>
                    <div className="rewards-actions">
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards`}>Back to rewards</Link>
                    </div>
                </div>

                <div className="rewards-actions" style={{ marginBottom: 12 }}>
                    <label>
                        Trạng thái
                        <select
                            className="reward-input"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPagination((prev) => ({ ...prev, page: 1 }))
                            }}
                            style={{ marginLeft: 8 }}
                        >
                            <option value="all">Tất cả</option>
                            <option value="0">Pending</option>
                            <option value="1">Approved</option>
                            <option value="2">Rejected</option>
                        </select>
                    </label>
                </div>

                {loading && <div className="reward-loading">Đang tải lịch sử đổi quà...</div>}
                {!!error && !loading && <div className="reward-error">{error}</div>}

                {!loading && !error && history.length === 0 && (
                    <div className="reward-empty">Chưa có giao dịch đổi quà.</div>
                )}

                {!loading && !error && history.length > 0 && (
                    <>
                        <table className="reward-history-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Reward</th>
                                    <th>Số lượng</th>
                                    <th>Điểm</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => {
                                    const id = item._id || item.id
                                    const reward = item.reward_id || item.reward || {}
                                    return (
                                        <tr key={id}>
                                            <td>{new Date(item.createdAt || item.created_at || Date.now()).toLocaleString('vi-VN')}</td>
                                            <td>{reward.name || item.reward_name || 'Unknown reward'}</td>
                                            <td>{item.quantity || 1}</td>
                                            <td>{item.points_used || item.points || '-'}</td>
                                            <td>{statusText(item.status)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        <div className="rewards-actions" style={{ marginTop: 12, justifyContent: 'space-between' }}>
                            <span>
                                Trang {pagination.page} / {pagination.totalPages || 1}
                            </span>
                            <div className="rewards-actions">
                                <button className="rewards-btn" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page <= 1}>
                                    Trang trước
                                </button>
                                <button
                                    className="rewards-btn"
                                    onClick={() => changePage(pagination.page + 1)}
                                    disabled={pagination.page >= (Number(pagination.totalPages) || 1)}
                                >
                                    Trang sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ViewRedemptionHistory
