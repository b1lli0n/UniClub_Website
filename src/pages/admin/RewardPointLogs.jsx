import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getClubs } from '../../api/adminapi'
import { getAdminRewardPointLogs } from '../../api/rewardApi'
import '../../styles/rewards.css'

const extractClubs = (res) => {
    if (Array.isArray(res)) return res
    if (res?.clubs && Array.isArray(res.clubs)) return res.clubs
    if (res?.data?.clubs && Array.isArray(res.data.clubs)) return res.data.clubs
    if (res?.data && Array.isArray(res.data)) return res.data
    return []
}

const extractErrorText = (err) => {
    const message = err?.message || err?.error || 'Không thể tải reward point logs'
    if (String(message).includes('Admin permission required')) {
        return 'Bạn không có quyền admin để truy cập dữ liệu này'
    }
    return message
}

const fmtDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    })}`
}

const fmtSignedNumber = (value) => {
    const normalized = Number(value) || 0
    return `${normalized > 0 ? '+' : ''}${normalized.toLocaleString('vi-VN')}`
}

const extractLogs = (res) => {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.items)) return res.items
    if (Array.isArray(res?.logs)) return res.logs
    return []
}

const extractPagination = (res) => {
    if (res?.pagination) return res.pagination
    if (res?.meta) return res.meta

    const total = Number(res?.total) || 0
    const limit = Number(res?.limit) || 20
    const page = Number(res?.page) || 1
    const pages = Number(res?.pages) || Number(res?.totalPages) || Math.max(1, Math.ceil(total / limit))

    return { page, limit, total, pages }
}

const getPointsChange = (log) => {
    if (log?.points_change !== undefined) return Number(log.points_change) || 0
    if (log?.pointsChange !== undefined) return Number(log.pointsChange) || 0
    if (log?.points_spent !== undefined) return -(Number(log.points_spent) || 0)
    return 0
}

const RewardPointLogs = () => {
    const [clubs, setClubs] = useState([])
    const [clubsLoading, setClubsLoading] = useState(true)

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })

    const [filters, setFilters] = useState({
        clubId: '',
        action: '',
        from: '',
        to: '',
    })

    useEffect(() => {
        const fetchClubs = async () => {
            setClubsLoading(true)
            try {
                const [activeRes, pausedRes] = await Promise.all([
                    getClubs({ page: 1, limit: 100, status: 1, sortBy: 'createdAt', sortOrder: 'asc' }),
                    getClubs({ page: 1, limit: 100, status: 2, sortBy: 'createdAt', sortOrder: 'asc' }),
                ])
                const all = [...extractClubs(activeRes), ...extractClubs(pausedRes)]
                setClubs(all)
            } catch {
                setClubs([])
            } finally {
                setClubsLoading(false)
            }
        }

        fetchClubs()
    }, [])

    const fetchLogs = async (nextPage = page) => {
        setLoading(true)
        setError('')

        try {
            const response = await getAdminRewardPointLogs({
                page: nextPage,
                limit: 20,
                clubId: filters.clubId || undefined,
                action: filters.action || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
            })

            setLogs(extractLogs(response))
            setPagination(extractPagination(response))
            setPage(nextPage)
        } catch (err) {
            const message = extractErrorText(err)
            setError(message)
            setLogs([])
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleApplyFilters = () => {
        fetchLogs(1)
    }

    const handleResetFilters = () => {
        setFilters({
            clubId: '',
            action: '',
            from: '',
            to: '',
        })
        setTimeout(() => fetchLogs(1), 0)
    }

    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">Reward Transaction Log</h2>
                    <p className="admin-subtitle">Theo dõi biến động điểm reward của toàn hệ thống</p>
                </div>
            </div>

            <div className="reward-pointlog-filter-grid">
                <div className="reward-form-group">
                    <label>Club</label>
                    {clubsLoading ? (
                        <input value="Đang tải CLB..." disabled />
                    ) : (
                        <select
                            value={filters.clubId}
                            onChange={(e) => setFilters((prev) => ({ ...prev, clubId: e.target.value }))}
                        >
                            <option value="">Tất cả CLB</option>
                            {clubs.map((club) => (
                                <option key={club._id || club.id} value={club._id || club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="reward-form-group">
                    <label>Action</label>
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
                    >
                        <option value="">Tất cả action</option>
                        <option value="redeem">redeem</option>
                    </select>
                </div>

                <div className="reward-form-group">
                    <label>Từ ngày</label>
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                    />
                </div>

                <div className="reward-form-group">
                    <label>Đến ngày</label>
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                    />
                </div>
            </div>

            <div className="reward-pointlog-actions">
                <button className="reward-btn-submit" type="button" onClick={handleApplyFilters}>
                    <i className="fa-solid fa-filter" />
                    Áp dụng bộ lọc
                </button>
                <button className="reward-btn-cancel" type="button" onClick={handleResetFilters}>
                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />
                    Xóa bộ lọc
                </button>
                <span className="reward-pointlog-total">Tổng: {pagination.total || 0} log</span>
            </div>

            <div className="admin-table">
                <div className="admin-table-head">
                    <div className="admin-col reward-log-col--time">Thời gian</div>
                    <div className="admin-col reward-log-col--user">Người dùng</div>
                    <div className="admin-col reward-log-col--reward">Phần thưởng</div>
                    <div className="admin-col reward-log-col--action">Action</div>
                    <div className="admin-col reward-log-col--points">Điểm</div>
                    <div className="admin-col reward-log-col--balance">Số dư</div>
                    <div className="admin-col reward-log-col--desc">Mô tả</div>
                </div>

                <div className="admin-table-body">
                    {loading ? (
                        <div className="reward-empty">
                            <i className="fa-solid fa-spinner fa-spin" />
                            <p>Đang tải reward point logs...</p>
                        </div>
                    ) : error ? (
                        <div className="reward-empty" style={{ color: '#ef4444' }}>
                            <i className="fa-solid fa-circle-exclamation" />
                            <p>{error}</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="reward-empty">
                            <i className="fa-solid fa-inbox" />
                            <p>Không có dữ liệu log phù hợp</p>
                        </div>
                    ) : (
                        logs.map((log) => {
                            const user = log?.user || {}
                            const reward = log?.reward || {}
                            const createdAt = log?.created_at || log?.createdAt || log?.updated_at || null
                            const pointsChange = getPointsChange(log)
                            const balanceBefore = Number(log?.balance_before ?? log?.balanceBefore ?? log?.balance_prev) || 0
                            const balanceAfter = Number(log?.balance_after ?? log?.balanceAfter ?? log?.balance_current) || 0
                            const actionLabel = log?.action || (log?.status !== undefined ? `status_${log.status}` : '—')
                            return (
                                <div key={log._id} className="admin-row-wrap">
                                    <div className="admin-row reward-log-row">
                                        <div className="admin-col reward-log-col--time">{fmtDateTime(createdAt)}</div>

                                        <div className="admin-col reward-log-col--user">
                                            <div className="txn-user-cell">
                                                <span className="txn-user-name">{user.fullName || user.name || log?.membership_id || 'Không xác định'}</span>
                                                <span className="txn-user-email">{user.email || ''}</span>
                                            </div>
                                        </div>

                                        <div className="admin-col reward-log-col--reward">
                                            <div className="txn-user-cell">
                                                <span className="txn-user-name">{reward.name || log?.reward_name || 'Không xác định'}</span>
                                                <span className="txn-user-email">ID: {reward._id || log?.reward_id || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="admin-col reward-log-col--action">
                                            <span className="txn-status txn-status--completed">{actionLabel}</span>
                                        </div>

                                        <div className="admin-col reward-log-col--points">
                                            <span className={`reward-point-change ${pointsChange < 0 ? 'is-minus' : 'is-plus'}`}>
                                                {fmtSignedNumber(pointsChange)}
                                            </span>
                                        </div>

                                        <div className="admin-col reward-log-col--balance">
                                            <div className="txn-user-cell">
                                                <span className="txn-user-name">Trước: {balanceBefore.toLocaleString('vi-VN')}</span>
                                                <span className="txn-user-email">Sau: {balanceAfter.toLocaleString('vi-VN')}</span>
                                            </div>
                                        </div>

                                        <div className="admin-col reward-log-col--desc">{log.description || '—'}</div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="admin-pagination">
                        <button
                            className="admin-page-nav"
                            type="button"
                            onClick={() => fetchLogs(Math.max(1, page - 1))}
                            disabled={page === 1 || loading}
                        >
                            <i className="fa-solid fa-chevron-left" />
                        </button>

                        <span className="reward-pointlog-page-text">Trang {page} / {pagination.pages}</span>

                        <button
                            className="admin-page-nav"
                            type="button"
                            onClick={() => fetchLogs(Math.min(pagination.pages, page + 1))}
                            disabled={page === pagination.pages || loading}
                        >
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RewardPointLogs