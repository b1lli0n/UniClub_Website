import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getClubs } from '../../api/adminapi'
import { getRedemptionHistory } from '../../api/rewardApi'
import '../../styles/rewards.css'

const extractClubs = (res) => {
    if (Array.isArray(res)) return res
    if (res?.clubs && Array.isArray(res.clubs)) return res.clubs
    if (res?.data?.clubs && Array.isArray(res.data.clubs)) return res.data.clubs
    if (res?.data && Array.isArray(res.data)) return res.data
    return []
}

const RedemptionHistory = () => {
    const navigate = useNavigate()

    // ── Club selector
    const [clubs, setClubs] = useState([])
    const [clubsLoading, setClubsLoading] = useState(true)
    const [selectedClubId, setSelectedClubId] = useState('')

    // ── Transactions
    const [transactions, setTransactions] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // ─── Fetch clubs ───────────────────────────────────────────────────────────
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
                if (all.length > 0) {
                    setSelectedClubId(all[0]._id || all[0].id)
                }
            } catch (err) {
                console.error('fetchClubs error:', err)
                toast.error('Không thể tải danh sách câu lạc bộ')
            } finally {
                setClubsLoading(false)
            }
        }
        fetchClubs()
    }, [])

    // ─── Fetch transactions ────────────────────────────────────────────────────
    useEffect(() => {
        if (!selectedClubId) return
        fetchHistory()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClubId, page])

    const fetchHistory = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getRedemptionHistory(selectedClubId, {
                page,
                limit: 10,
            })
            setTransactions(res?.transactions || [])
            setPagination(res?.pagination || { total: 0, page: 1, totalPages: 1 })
        } catch (err) {
            console.error('fetchHistory error:', err)
            setError(err?.message || 'Không thể tải lịch sử đổi thưởng')
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="admin-panel admin-panel--animate">
            {/* Header */}
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">Lịch sử đổi thưởng</h2>
                    <p className="admin-subtitle">Theo dõi lịch sử giao dịch đổi điểm lấy phần thưởng</p>
                </div>
                <button
                    className="reward-history-btn"
                    type="button"
                    onClick={() => navigate('/admin/rewards')}
                >
                    <i className="fa-solid fa-gift" />
                    <span>Quản lý phần thưởng</span>
                </button>
            </div>

            {/* Club Selector */}
            <div className="reward-club-selector">
                <label className="reward-club-label">
                    <i className="fa-solid fa-sitemap" />
                    Câu lạc bộ:
                </label>
                {clubsLoading ? (
                    <span className="reward-club-loading">
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />
                        Đang tải...
                    </span>
                ) : (
                    <select
                        className="reward-club-select"
                        value={selectedClubId}
                        onChange={(e) => {
                            setSelectedClubId(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">-- Chọn câu lạc bộ --</option>
                        {clubs.map((c) => (
                            <option key={c._id || c.id} value={c._id || c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                )}
                {!clubsLoading && selectedClubId && pagination.total > 0 && (
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>
                        {pagination.total} giao dịch
                    </span>
                )}
            </div>

            {/* Content */}
            {!selectedClubId ? (
                <div className="reward-empty">
                    <i className="fa-solid fa-sitemap" />
                    <p>Vui lòng chọn câu lạc bộ để xem lịch sử</p>
                </div>
            ) : (
                <div className="admin-table">
                    {/* Table Head */}
                    <div className="admin-table-head">
                        <div className="admin-col txn-col--user">Thành viên</div>
                        <div className="admin-col txn-col--reward">Phần thưởng</div>
                        <div className="admin-col txn-col--points">Điểm tiêu</div>
                        <div className="admin-col txn-col--date">Ngày giao dịch</div>
                    </div>

                    {/* Table Body */}
                    <div className="admin-table-body">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 12 }} />
                                <p>Đang tải lịch sử đổi thưởng...</p>
                            </div>
                        ) : error ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 24, marginBottom: 12 }} />
                                <p>{error}</p>
                                <button
                                    className="admin-status-btn admin-status-btn--approve"
                                    onClick={fetchHistory}
                                    style={{ marginTop: 12, padding: '8px 16px' }}
                                >
                                    <i className="fa-solid fa-rotate-right" style={{ marginRight: 8 }} />
                                    Thử lại
                                </button>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 28, marginBottom: 12, display: 'block' }} />
                                <p>Chưa có giao dịch đổi thưởng nào</p>
                            </div>
                        ) : (
                            transactions.map((txn) => {
                                const user = txn.membership_id?.user_id || {}
                                const reward = txn.reward_id || {}
                                return (
                                    <div className="admin-row-wrap" key={txn._id}>
                                        <div className="admin-row">
                                            {/* User */}
                                            <div className="admin-col txn-col--user">
                                                <div className="txn-user-cell">
                                                    <span className="txn-user-name">
                                                        {user.full_name || 'Không xác định'}
                                                    </span>
                                                    <span className="txn-user-email">{user.email || ''}</span>
                                                </div>
                                            </div>
                                            {/* Reward */}
                                            <div className="admin-col txn-col--reward" style={{ fontWeight: 600 }}>
                                                {reward.name || 'Không xác định'}
                                            </div>
                                            {/* Points */}
                                            <div className="admin-col txn-col--points">
                                                <span className="reward-points-badge">
                                                    <i className="fa-solid fa-star" />
                                                    {(txn.points_spent || 0).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            {/* Date */}
                                            <div className="admin-col txn-col--date" style={{ color: '#6b7280', fontSize: 13 }}>
                                                {new Date(txn.created_at).toLocaleDateString('vi-VN')}
                                                <br />
                                                <span style={{ fontSize: 12 }}>
                                                    {new Date(txn.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                className="admin-page-nav"
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <i className="fa-solid fa-chevron-left" />
                            </button>
                            <div className="admin-pages">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        className={`admin-page-num ${n === page ? 'is-active' : ''}`}
                                        type="button"
                                        onClick={() => setPage(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="admin-page-nav"
                                type="button"
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                <i className="fa-solid fa-chevron-right" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default RedemptionHistory
