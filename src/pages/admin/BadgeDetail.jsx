import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getBadgeTemplateDetail } from '../../api/rewardApi'
import '../../styles/rewards.css'

const BadgeDetail = () => {
    const { badgeId } = useParams()
    const navigate = useNavigate()

    const [badge, setBadge] = useState(null)
    const [earnedCount, setEarnedCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // ─── Fetch badge detail ────────────────────────────────────────────────────
    useEffect(() => {
        if (!badgeId) return
        fetchDetail()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [badgeId])

    const fetchDetail = async () => {
        setLoading(true)
        setError(null)
        try {
            // Response: { badge, earned_count }
            const res = await getBadgeTemplateDetail(badgeId)
            console.log('Fetched badge detail:', res.badge)
            setBadge(res.badge)
        } catch (err) {
            console.error('getBadgeTemplateDetail error:', err)
            setError(err?.message || 'Không thể tải chi tiết huy hiệu')
        } finally {
            setLoading(false)
        }
    }

    // ─── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                    <p>Đang tải thông tin huy hiệu...</p>
                </div>
            </div>
        )
    }

    // ─── Error ─────────────────────────────────────────────────────────────────
    if (error || !badge) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                    <p>{error || 'Không tìm thấy huy hiệu'}</p>
                    <button className="reward-detail-back" onClick={() => navigate('/admin/badges')} style={{ marginTop: 12 }}>
                        <i className="fa-solid fa-arrow-left" />
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-panel admin-panel--animate">
            {/* Back button */}
            <button className="reward-detail-back" onClick={() => navigate('/admin/badges')}>
                <i className="fa-solid fa-arrow-left" />
                Quay lại danh sách
            </button>

            <div className="admin-panel-header" style={{ marginBottom: 20 }}>
                <div>
                    <h2 className="admin-title">Chi tiết huy hiệu</h2>
                    <p className="admin-subtitle">Thông tin và điều kiện nhận huy hiệu</p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="badge-detail-hero">
                {badge.icon_url ? (
                    <img
                        src={badge?.icon_url}
                        alt={badge?.name}
                        className="badge-detail-img"
                        onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.style.display = 'none'
                        }}
                    />
                ) : (
                    <div className="badge-detail-img-placeholder">
                        <i className="fa-solid fa-medal" />
                    </div>
                )}

                <div className="badge-detail-hero-info">
                    <h2>{badge?.name}</h2>
                    <p>{badge?.description}</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                        <span
                            className={`admin-status ${badge.is_active ? 'admin-status--active' : 'admin-status--inactive'
                                }`}
                        >
                            {badge?.is_active ? 'Đang hoạt động' : 'Đã ẩn'}
                        </span>
                        <span style={{ fontSize: 13, color: '#6d28d9' }}>
                            Tạo: {new Date(badge.created_at).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>

                {/* Earned count
                <div className="badge-detail-earned">
                    <span className="earned-count">{earnedCount.toLocaleString('vi-VN')}</span>
                    <div className="earned-label">thành viên<br />đã nhận</div>
                </div> */}
            </div>

            {/* Info Grid */}
            <div className="badge-detail-grid">
                <div className="badge-info-card">
                    <div className="info-label">🎯 Loại điều kiện</div>
                    <div className="info-value">{badge.condition_type}</div>
                </div>
                {/* <div className="badge-info-card">
                    <div className="info-label">🔢 Giá trị mốc</div>
                    <div className="info-value">{badge.condition_value.toLocaleString('vi-VN')}</div>
                </div> */}
                <div className="badge-info-card">
                    <div className="info-label">📅 Ngày tạo</div>
                    <div className="info-value">{new Date(badge.created_at).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className="badge-info-card">
                    <div className="info-label">🔄 Cập nhật lần cuối</div>
                    <div className="info-value">
                        {badge.updated_at
                            ? new Date(badge.updated_at).toLocaleDateString('vi-VN')
                            : 'Chưa cập nhật'}
                    </div>
                </div>
            </div>

            {/* Condition explanation */}
            <div className="reward-detail-card" style={{ marginTop: 16 }}>
                <div className="reward-desc-section">
                    <h4>
                        <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: '#6366f1' }} />
                        Điều kiện nhận huy hiệu
                    </h4>
                    <p>
                        Thành viên cần đạt{' '}
                        <strong style={{ color: '#6366f1' }}>
                            {badge.condition_type} = {badge.condition_value}
                        </strong>{' '}
                        để nhận được huy hiệu <strong>"{badge.name}"</strong>.
                    </p>
                </div>

                {badge.icon_url && (
                    <div className="reward-desc-section">
                        <h4>
                            <i className="fa-solid fa-image" style={{ marginRight: 6, color: '#6366f1' }} />
                            Icon URL
                        </h4>
                        <p style={{ wordBreak: 'break-all', fontSize: 13, color: '#6b7280' }}>
                            {badge.icon_url}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BadgeDetail
