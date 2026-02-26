import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getClubs } from '../../api/adminapi'
import {
    getClubRewards,
    createReward,
    updateReward,
} from '../../api/rewardApi'
import '../../styles/rewards.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const extractClubs = (res) => {
    if (Array.isArray(res)) return res
    if (res?.clubs && Array.isArray(res.clubs)) return res.clubs
    if (res?.data?.clubs && Array.isArray(res.data.clubs)) return res.data.clubs
    if (res?.data && Array.isArray(res.data)) return res.data
    return []
}

const EMPTY_FORM = { name: '', description: '', points_required: '', quantity: '' }

const Rewards = () => {
    const navigate = useNavigate()

    // ── Club list
    const [clubs, setClubs] = useState([])
    const [clubsLoading, setClubsLoading] = useState(true)
    const [selectedClubId, setSelectedClubId] = useState('')

    // ── Rewards
    const [rewards, setRewards] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [isActiveFilter, setIsActiveFilter] = useState('all')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // ── Create modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState(EMPTY_FORM)
    const [createLoading, setCreateLoading] = useState(false)

    // ─── 1. Lấy danh sách clubs khi mount ────────────────────────────────────
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

    // ─── 2. Debounce search ────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(search.trim())
            setPage(1)
        }, search ? 400 : 0)
        return () => clearTimeout(timer)
    }, [search])

    // ─── 3. Fetch rewards khi club / filter / page thay đổi ──────────────────
    useEffect(() => {
        if (!selectedClubId) return
        fetchRewards()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClubId, page, isActiveFilter, appliedSearch])

    const fetchRewards = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getClubRewards(selectedClubId, {
                page,
                limit: 10,
                search: appliedSearch || undefined,
                is_active: isActiveFilter !== 'all' ? isActiveFilter : undefined,
            })
            setRewards(res?.rewards || [])
            setPagination(res?.pagination || { total: 0, page: 1, totalPages: 1 })
        } catch (err) {
            console.error('fetchRewards error:', err)
            setError(err?.message || 'Không thể tải phần thưởng')
            setRewards([])
        } finally {
            setLoading(false)
        }
    }

    // ─── Toggle hide / show ────────────────────────────────────────────────────
    const handleToggleActive = async (reward) => {
        try {
            await updateReward(reward._id, { is_active: !reward.is_active })
            toast.success(reward.is_active ? 'Đã ẩn phần thưởng' : 'Đã hiện phần thưởng')
            fetchRewards()
        } catch (err) {
            console.error('toggleActive error:', err)
            toast.error('Không thể cập nhật trạng thái phần thưởng')
        }
    }

    // ─── Create reward ────────────────────────────────────────────────────────
    const handleCreateSubmit = async (e) => {
        e.preventDefault()
        const { name, description, points_required, quantity } = createForm
        if (!name.trim() || !description.trim() || !points_required || !quantity) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }
        if (Number(points_required) <= 0) {
            toast.error('Điểm cần đổi phải lớn hơn 0')
            return
        }
        if (Number(quantity) <= 0) {
            toast.error('Số lượng phải lớn hơn 0')
            return
        }
        setCreateLoading(true)
        try {
            await createReward(selectedClubId, {
                name: name.trim(),
                description: description.trim(),
                points_required: Number(points_required),
                quantity: Number(quantity),
            })
            toast.success('Tạo phần thưởng thành công!')
            setShowCreateModal(false)
            setCreateForm(EMPTY_FORM)
            setPage(1)
            fetchRewards()
        } catch (err) {
            console.error('createReward error:', err)
            toast.error(err?.message || 'Tạo phần thưởng thất bại')
        } finally {
            setCreateLoading(false)
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="admin-panel admin-panel--animate">
            {/* Header */}
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">Quản lý phần thưởng</h2>
                    <p className="admin-subtitle">Tạo và quản lý phần thưởng đổi điểm của các câu lạc bộ</p>
                </div>
                <div className="reward-header-actions">
                    <button
                        className="reward-history-btn"
                        type="button"
                        onClick={() => navigate('/admin/reward-history')}
                    >
                        <i className="fa-solid fa-clock-rotate-left" />
                        <span>Lịch sử đổi thưởng</span>
                    </button>
                    {selectedClubId && (
                        <button
                            className="reward-create-btn"
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fa-solid fa-plus" />
                            <span>Tạo phần thưởng</span>
                        </button>
                    )}
                </div>
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
                            setSearch('')
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
                {!clubsLoading && selectedClubId && (
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>
                        {rewards.length > 0 ? `${pagination.total} phần thưởng` : ''}
                    </span>
                )}
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fa-solid fa-magnifying-glass admin-search-icon" />
                    <input
                        className="admin-search-input"
                        placeholder="Tìm kiếm phần thưởng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={!selectedClubId}
                    />
                </div>
                <div className="reward-filter-group">
                    {[
                        { val: 'all', label: 'Tất cả' },
                        { val: 'true', label: 'Đang hiển thị' },
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

            {/* Nội dung */}
            {!selectedClubId ? (
                <div className="reward-empty">
                    <i className="fa-solid fa-sitemap" />
                    <p>Vui lòng chọn câu lạc bộ để xem phần thưởng</p>
                </div>
            ) : (
                <div className="admin-table">
                    {/* Table Head */}
                    <div className="admin-table-head">
                        <div className="admin-col reward-col--name">Tên phần thưởng</div>
                        <div className="admin-col reward-col--points">Điểm cần đổi</div>
                        <div className="admin-col reward-col--qty">Số lượng</div>
                        <div className="admin-col admin-col--status">Trạng thái</div>
                        <div className="admin-col admin-col--date">Ngày tạo</div>
                        <div className="admin-col admin-col--action" />
                    </div>

                    {/* Table Body */}
                    <div className="admin-table-body">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 12 }} />
                                <p>Đang tải phần thưởng...</p>
                            </div>
                        ) : error ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 24, marginBottom: 12 }} />
                                <p>{error}</p>
                                <button
                                    className="admin-status-btn admin-status-btn--approve"
                                    onClick={fetchRewards}
                                    style={{ marginTop: 12, padding: '8px 16px' }}
                                >
                                    <i className="fa-solid fa-rotate-right" style={{ marginRight: 8 }} />
                                    Thử lại
                                </button>
                            </div>
                        ) : rewards.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                <i className="fa-solid fa-gift" style={{ fontSize: 28, marginBottom: 12, display: 'block' }} />
                                <p>Câu lạc bộ này chưa có phần thưởng nào</p>
                                <button
                                    className="reward-create-btn"
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    style={{ marginTop: 12 }}
                                >
                                    <i className="fa-solid fa-plus" />
                                    <span>Tạo phần thưởng đầu tiên</span>
                                </button>
                            </div>
                        ) : (
                            rewards.map((r) => (
                                <div className="admin-row-wrap" key={r._id}>
                                    <div className="admin-row">
                                        <div className="admin-col reward-col--name" style={{ fontWeight: 600 }}>
                                            {r.name}
                                        </div>
                                        <div className="admin-col reward-col--points">
                                            <span className="reward-points-badge">
                                                <i className="fa-solid fa-star" />
                                                {r.points_required.toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="admin-col reward-col--qty" style={{ textAlign: 'center' }}>
                                            {r.quantity}
                                        </div>
                                        <div className="admin-col admin-col--status">
                                            <span className={`admin-status ${r.is_active ? 'admin-status--active' : 'admin-status--inactive'}`}>
                                                {r.is_active ? 'Hiển thị' : 'Đã ẩn'}
                                            </span>
                                        </div>
                                        <div className="admin-col admin-col--date">
                                            {new Date(r.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="admin-col admin-col--action">
                                            {/* Toggle hide/show */}
                                            <button
                                                type="button"
                                                className={`admin-status-btn ${r.is_active ? 'admin-status-btn--reject' : 'admin-status-btn--approve'}`}
                                                onClick={() => handleToggleActive(r)}
                                                title={r.is_active ? 'Ẩn phần thưởng' : 'Hiện phần thưởng'}
                                            >
                                                <i className={`fa-solid ${r.is_active ? 'fa-eye-slash' : 'fa-eye'}`} />
                                            </button>
                                            {/* View / Edit detail */}
                                            <button
                                                className="admin-eye-btn"
                                                type="button"
                                                onClick={() => navigate(`/admin/rewards/${r._id}`)}
                                                title="Xem & chỉnh sửa"
                                                style={{ marginLeft: 8 }}
                                            >
                                                <i className="fa-solid fa-pen-to-square" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
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

            {/* ── Create Reward Modal ─────────────────────────────────────────────── */}
            {showCreateModal && (
                <div className="reward-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="reward-modal-header">
                            <h3>
                                <i className="fa-solid fa-gift" style={{ marginRight: 8, color: '#6366f1' }} />
                                Tạo phần thưởng mới
                            </h3>
                            <button
                                type="button"
                                className="reward-modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="reward-form">
                            <div className="reward-form-group">
                                <label>
                                    Tên phần thưởng <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="VD: Áo CLB UniClub"
                                    maxLength={100}
                                />
                            </div>

                            <div className="reward-form-group">
                                <label>
                                    Mô tả <span className="required">*</span>
                                </label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Nhập mô tả phần thưởng..."
                                    rows={3}
                                />
                            </div>

                            <div className="reward-form-row">
                                <div className="reward-form-group">
                                    <label>
                                        Điểm cần đổi <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.points_required}
                                        onChange={(e) =>
                                            setCreateForm((prev) => ({ ...prev, points_required: e.target.value }))
                                        }
                                        placeholder="VD: 500"
                                        min={1}
                                    />
                                </div>
                                <div className="reward-form-group">
                                    <label>
                                        Số lượng <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.quantity}
                                        onChange={(e) =>
                                            setCreateForm((prev) => ({ ...prev, quantity: e.target.value }))
                                        }
                                        placeholder="VD: 20"
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div className="reward-form-actions">
                                <button
                                    type="button"
                                    className="reward-btn-cancel"
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setCreateForm(EMPTY_FORM)
                                    }}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="reward-btn-submit" disabled={createLoading}>
                                    {createLoading ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-plus" />
                                            Tạo phần thưởng
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Rewards
