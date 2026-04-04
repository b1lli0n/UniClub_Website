import React, { useState, useEffect, useMemo } from 'react'
import ClubBadgeModal from '../../components/modals/ClubBadgeModal';
import { useNavigate } from 'react-router-dom'
import { getClubBadges } from '../../api/clubBadgeApi'
import { getAllClubs } from '../../api/clubApi'
import '../../styles/badges.css'

const PAGE_SIZE = 12

const normalizeActiveFlag = (value) => {
    if (value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true') {
        return 1
    }
    return 0
}

const sortBadgesList = (items, field, order) => {
    const list = Array.isArray(items) ? [...items] : []
    const direction = Number(order) === 1 ? 1 : -1

    const toBoolNumber = (value) => {
        if (value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true') return 1
        return 0
    }

    const pickValue = (badge) => {
        if (field === 'is_active') {
            const raw = badge?.is_active ?? badge?.isActive
            return toBoolNumber(raw)
        }
        if (field === 'points_required') return Number(badge?.points_required ?? 0)
        if (field === 'created_at') {
            const raw = badge?.created_at || badge?.createdAt
            const d = raw ? new Date(raw) : null
            return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0
        }
        return String(badge?.[field] ?? '').toLowerCase()
    }

    list.sort((a, b) => {
        const av = pickValue(a)
        const bv = pickValue(b)
        if (av < bv) return -1 * direction
        if (av > bv) return 1 * direction
        return 0
    })

    return list
}

const Badges = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate()

    const [badges, setBadges] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [isActiveFilter, setIsActiveFilter] = useState('all') // 'all', '1', '0'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // Sort state
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('-1')
    // Club filter state
    const [clubFilter, setClubFilter] = useState('all')
    const [clubs, setClubs] = useState([])
    const [useServerPagination, setUseServerPagination] = useState(false)
    // Fetch clubs on mount
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const res = await getAllClubs()
                // console.log('Fetched clubs for badge filter:', res)
                setClubs(res?.clubs || res?.data || [])
            } catch {
                setClubs([])
            }
        }
        fetchClubs()
    }, [])

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
    }, [page, isActiveFilter, appliedSearch, sortBy, sortOrder, clubFilter])

    const normalizeBadgeResponse = (res, fallbackPage) => {
        const payload = res?.data || res || {}
        const items = payload?.badges || payload?.data || []
        const pg = payload?.pagination || {}
        const hasServerPagination =
            pg?.total !== undefined ||
            pg?.totalPages !== undefined ||
            pg?.total_pages !== undefined ||
            pg?.page !== undefined ||
            payload?.total !== undefined ||
            payload?.totalPages !== undefined ||
            payload?.total_pages !== undefined

        const total = Number(pg.total ?? payload?.total ?? items.length ?? 0) || 0
        const currentPage = Number(pg.page ?? payload?.page ?? fallbackPage) || fallbackPage
        const limit = Number(pg.limit ?? payload?.limit ?? PAGE_SIZE) || PAGE_SIZE
        const totalPages = Number(pg.totalPages ?? pg.total_pages ?? payload?.totalPages ?? payload?.total_pages) || Math.max(1, Math.ceil(total / limit))

        return {
            badges: Array.isArray(items) ? items : [],
            hasServerPagination,
            pagination: {
                total,
                page: currentPage,
                totalPages: Math.max(1, totalPages),
            },
        }
    }

    const fetchBadges = async () => {
        setLoading(true)
        setError(null)
        // console.log('Fetching badges with params:',clubFilter )
        console.log('Fetching badges with params:', isActiveFilter)
        try {
            let isActive;
            if (isActiveFilter !== 'all') isActive = Number(isActiveFilter);
            const params = {
                page,
                limit: PAGE_SIZE,
                search: appliedSearch || undefined,
                sortBy,
                sortOrder: Number(sortOrder),
                is_active: isActive,
            };
            console.log('Final params for API call:', params)

            const selectedClubId = clubFilter !== 'all' ? clubFilter : null
            const res = await getClubBadges(selectedClubId, params);
            const normalized = normalizeBadgeResponse(res, page)
            const badgesWithNumericActive = normalized.badges.map((badge) => ({
                ...badge,
                is_active: normalizeActiveFlag(badge?.is_active ?? badge?.isActive),
            }))
            setBadges(badgesWithNumericActive)
            setUseServerPagination(normalized.hasServerPagination)
            if (normalized.hasServerPagination) {
                setPagination(normalized.pagination)
            } else {
                const total = badgesWithNumericActive.length
                setPagination({
                    total,
                    page,
                    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
                })
            }
        } catch (err) {
            console.error('fetchBadges error:', err)
            setError(err?.message || 'Không thể tải danh sách huy hiệu')
            setBadges([])
            setUseServerPagination(false)
            setPagination({ total: 0, page: 1, totalPages: 1 })
        } finally {
            setLoading(false)
        }
    }

    const visibleBadges = useMemo(() => {
        const sorted = sortBadgesList(badges, sortBy, sortOrder)
        if (useServerPagination) return sorted
        const start = (page - 1) * PAGE_SIZE
        return sorted.slice(start, start + PAGE_SIZE)
    }, [badges, page, sortBy, sortOrder, useServerPagination])

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="admin-panel admin-panel--animate">
            {/* Header */}
            <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="admin-title">Quản lý huy hiệu</h2>
                    <p className="admin-subtitle">
                        Xem danh sách các huy hiệu thành tích dành cho thành viên
                        {!loading && ` • ${pagination.total} huy hiệu`}
                    </p>
                </div>
                <button
                    className="badges-create-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-solid fa-plus" style={{ marginRight: 8 }} />
                    Tạo huy hiệu mới
                </button>
            </div>
            {/* Modal create badge */}
            {showCreateModal && (
                <ClubBadgeModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => fetchBadges()}
                    mode="create"
                />
            )}

            {/* Toolbar */}
            <div className="admin-toolbar" style={{ gap: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div className="admin-search">
                    <i className="fa-solid fa-magnifying-glass admin-search-icon" />
                    <input
                        className="admin-search-input"
                        placeholder="Tìm kiếm huy hiệu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* Filter by Club */}
                <div className="reward-filter-group">
                    <label htmlFor="clubFilter" style={{ fontWeight: 500, marginRight: 4 }}>Lọc theo CLB:</label>
                    <select
                        id="clubFilter"
                        value={clubFilter}
                        onChange={e => {
                            setClubFilter(e.target.value)
                            setPage(1)
                        }}
                        style={{ padding: '4px 8px', borderRadius: 4 }}
                    >
                        <option value="all">Tất cả</option>
                        {clubs && clubs.length > 0 && clubs.map(club => (
                            <option key={club._id || club.id} value={club._id || club.id}>{club.name}</option>
                        ))}
                    </select>
                </div>
                {/* Sort & Trạng thái */}
                <div className="reward-sort-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label htmlFor="isActiveFilter" style={{ fontWeight: 500, marginRight: 4 }}>Trạng thái:</label>
                    <select
                        id="isActiveFilter"
                        value={isActiveFilter}
                        onChange={e => {
                            setIsActiveFilter(e.target.value)
                            setPage(1)
                        }}
                        style={{ padding: '4px 8px', borderRadius: 4 }}
                    >
                        <option value="all">Tất cả</option>
                        <option value="1">Hoạt động</option>
                        <option value="0">Ngừng hoạt động</option>
                    </select>
                    <label htmlFor="sortBy" style={{ fontWeight: 500, margin: '0 4px 0 16px' }}>Sắp xếp:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={e => {
                            setSortBy(e.target.value)
                            setPage(1)
                        }}
                        style={{ padding: '4px 8px', borderRadius: 4 }}
                    >
                        <option value="created_at">Ngày tạo</option>
                        <option value="points_required">Điểm yêu cầu</option>
                        <option value="is_active">Trạng thái</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={e => {
                            setSortOrder(e.target.value)
                            setPage(1)
                        }}
                        style={{ padding: '4px 8px', borderRadius: 4 }}
                    >
                        <option value="-1">Giảm dần</option>
                        <option value="1">Tăng dần</option>
                    </select>
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
                    {visibleBadges.map((badge) => (
                        <div
                            key={badge._id}
                            className="badge-card"
                            onClick={() => navigate(`/admin/badges/${badge._id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/badges/${badge._id}`)}
                            style={{ boxShadow: '0 2px 8px #e0e7ef', borderRadius: 12, padding: 18, background: '#fff', margin: 8, minWidth: 220, opacity: badge.is_active ? 1 : 0.6 }}
                        >
                            {/* Icon */}
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                                {badge.icon_url ? (
                                    <img
                                        src={badge.icon_url}
                                        alt={badge.name}
                                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 8px #e0e7ef' }}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="badge-card-icon-placeholder">
                                        <i className="fa-solid fa-medal" style={{ fontSize: 48, color: '#d1d5db' }} />
                                    </div>
                                )}
                            </div>
                            {/* Name */}
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#374151', marginBottom: 4 }}>{badge.name}</div>
                            {/* Club name */}
                            {badge.club_name && (
                                <div style={{ fontSize: 13, color: '#6366f1', marginBottom: 8 }}>
                                    <i className="fa-solid fa-users" style={{ marginRight: 4 }} />
                                    {badge.club_name}
                                </div>
                            )}
                            {/* Points required */}
                            <div style={{ fontSize: 14, color: '#2563eb', marginBottom: 6 }}>
                                <i className="fa-solid fa-bullseye" style={{ marginRight: 4 }} />
                                Điểm yêu cầu: <b>{badge.points_required}</b>
                            </div>
                            {/* Trạng thái */}
                            <div style={{ fontSize: 13, marginBottom: 6 }}>
                                <span className={`admin-status ${badge.is_active ? 'admin-status--active' : 'admin-status--inactive'}`}
                                    style={{ color: badge.is_active ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                    {badge.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </div>
                            {/* Ngày tạo */}
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                                <i className="fa-solid fa-calendar" style={{ marginRight: 4 }} />
                                {badge.created_at ? `Tạo ngày: ${new Date(badge.created_at).toLocaleDateString('vi-VN')}` : ''}
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
