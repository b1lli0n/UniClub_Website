import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getBadgeTemplates } from '../../api/rewardApi'
import '../../styles/rewards.css'

const Badges = () => {
    const navigate = useNavigate()

    const [badges, setBadges] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [isActiveFilter, setIsActiveFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // ─── Debounce search ───────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(search.trim())
            setPage(1)
        }, search ? 400 : 0)
        return () => clearTimeout(timer)
    }, [search])

    // ─── Fetch badges ──────────────────────────────────────────────────────────
    useEffect(() => {
        fetchBadges()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, isActiveFilter, appliedSearch])

    const fetchBadges = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getBadgeTemplates({
                page,
                limit: 12,
                search: appliedSearch || undefined,
                is_active: isActiveFilter !== 'all' ? isActiveFilter : undefined,
            })
            setBadges(res?.badges || [])
            setPagination(res?.pagination || { total: 0, page: 1, totalPages: 1 })
        } catch (err) {
            console.error('fetchBadges error:', err)
            setError(err?.message || 'Không thể tải danh sách huy hiệu')
            setBadges([])
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
                    <h2 className="admin-title">Quản lý huy hiệu</h2>
                    <p className="admin-subtitle">
                        Xem danh sách các huy hiệu thành tích dành cho thành viên
                        {!loading && ` • ${pagination.total} huy hiệu`}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fa-solid fa-magnifying-glass admin-search-icon" />
                    <input
                        className="admin-search-input"
                        placeholder="Tìm kiếm huy hiệu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="reward-filter-group">
                    {[
                        { val: 'all', label: 'Tất cả' },
                        { val: 'true', label: 'Đang hoạt động' },
                        { val: 'false', label: 'Đã ẩn' },
                    ].map(({ val, label }) => (
                        <button
                            key={val}
                            type="button"
                            className={`reward-filter-btn ${isActiveFilter === val ? 'is-active' : ''}`}
                            onClick={() => {
                                setIsActiveFilter(val)
                                setPage(1)
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                    <p>Đang tải huy hiệu...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                    <p>{error}</p>
                    <button
                        className="admin-status-btn admin-status-btn--approve"
                        onClick={fetchBadges}
                        style={{ marginTop: 12, padding: '8px 16px' }}
                    >
                        <i className="fa-solid fa-rotate-right" style={{ marginRight: 8 }} />
                        Thử lại
                    </button>
                </div>
            ) : badges.length === 0 ? (
                <div className="reward-empty">
                    <i className="fa-solid fa-medal" />
                    <p>Không tìm thấy huy hiệu nào</p>
                </div>
            ) : (
                /* Badge Grid */
                <div className="badge-grid">
                    {badges.map((badge) => (
                        <div
                            key={badge._id}
                            className={`badge-card ${!badge.is_active ? 'is-hidden' : ''}`}
                            onClick={() => navigate(`/admin/badges/${badge._id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/badges/${badge._id}`)}
                        >
                            {/* Icon */}
                            {badge.icon_url ? (
                                <img
                                    src={badge.icon_url}
                                    alt={badge.name}
                                    className="badge-card-icon"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                            ) : (
                                <div className="badge-card-icon-placeholder">
                                    <i className="fa-solid fa-medal" />
                                </div>
                            )}

                            {/* Name */}
                            <p className="badge-card-name">{badge.name}</p>

                            {/* Description */}
                            <p className="badge-card-desc">{badge.description}</p>

                            {/* Condition */}
                            <span className="badge-card-condition">
                                <i className="fa-solid fa-bullseye" />
                                {badge.condition_type}: {badge.condition_value}
                            </span>

                            {/* Footer */}
                            <div className="badge-card-footer">
                                <span
                                    className={`admin-status ${badge.is_active ? 'admin-status--active' : 'admin-status--inactive'
                                        }`}
                                >
                                    {badge.is_active ? 'Hoạt động' : 'Đã ẩn'}
                                </span>
                                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                                    {new Date(badge.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="admin-pagination" style={{ marginTop: 24 }}>
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
    )
}

export default Badges
