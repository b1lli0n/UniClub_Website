import React, { useState, useEffect } from 'react'
import ClubBadgeModal from '../../components/ClubBadgeModal';
import { updateClubBadge } from '../../api/clubBadgeApi';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClubBadgeDetail } from '../../api/clubBadgeApi';
import '../../styles/rewards.css';

const BadgeDetail = () => {
    const [showEditModal, setShowEditModal] = useState(false);
    const { badgeId } = useParams();
    const navigate = useNavigate();

    const [badge, setBadge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!badgeId) return;
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [badgeId]);

    const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getClubBadgeDetail(badgeId);
            setBadge(res?.badge || res?.data || res);
        } catch (err) {
            console.error('getClubBadgeDetail error:', err);
            setError(err?.message || 'Không thể tải chi tiết huy hiệu');
        } finally {
            setLoading(false);
        }
    };

    // ─── Loading ───────────────────────────────────────────────────────────────
    useEffect(() => {
        // Debug: kiểm tra object badge trả về từ backend
        if (!loading) {
            console.log('badgeData:', badge);
            if (badge && typeof badge === 'object') {
                console.log('badge keys:', Object.keys(badge));
                if (badge.badge_template_id) {
                    console.warn('badge_template_id:', badge.badge_template_id, 'Không dùng làm _id cho API update/detail!');
                }
                if (!badge._id) {
                    console.error('Không tìm thấy _id club badge! FE/BE phải dùng _id của club badge.');
                }
            }
        }
    }, [loading, badge]);

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
                    <p>{error || 'Badge not found'}</p>
                    <button className="reward-detail-back" onClick={() => navigate('/admin/badges')} style={{ marginTop: 12 }}>
                        <i className="fa-solid fa-arrow-left" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel admin-panel--animate">
            {/* Back button + Edit + Hide/Unhide button */}
            <div className="badge-detail-actions">
                <button className="reward-detail-back" onClick={() => navigate('/admin/badges')}>
                    <i className="fa-solid fa-arrow-left" />
                    Quay lại danh sách
                </button>
                <button
                    className="badge-action-btn badge-action-btn--edit"
                    onClick={() => setShowEditModal(true)}
                >
                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: 6 }} />
                    Chỉnh sửa
                </button>
                <button
                    className={badge.is_active ? 'badge-action-btn badge-action-btn--hide' : 'badge-action-btn badge-action-btn--show'}
                    onClick={async () => {
                        if (!badge._id) {
                            toast.error('Không tìm thấy _id club badge.');
                            return;
                        }
                        try {
                            await updateClubBadge(badge._id, { is_active: !badge.is_active });
                            toast.success(badge.is_active ? 'Đã ẩn huy hiệu!' : 'Đã kích hoạt huy hiệu!');
                            fetchDetail();
                        } catch (err) {
                            toast.error(err?.message || 'Lỗi cập nhật trạng thái!');
                        }
                    }}
                >
                    <i className={badge.is_active ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} style={{ marginRight: 6 }} />
                    {badge.is_active ? 'Ẩn huy hiệu' : 'Hiện huy hiệu'}
                </button>
            </div>
            <div className="admin-panel-header" style={{ marginBottom: 20 }}>
                <div>
                    <h2 className="admin-title">Chi tiết huy hiệu</h2>
                    <p className="admin-subtitle">Thông tin huy hiệu và CLB</p>
                </div>
            </div>
            {/* Modal update badge */}
            {showEditModal && badge && (
                <ClubBadgeModal
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => { setShowEditModal(false); fetchDetail(); toast.success('Cập nhật thành công!'); }}
                    mode="edit"
                    badgeData={badge}
                />
            )}

            {/* Hero Section */}
            <div className="badge-detail-hero">
                {badge.icon_url ? (
                    <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className="badge-detail-img"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="badge-detail-img-placeholder">
                        <i className="fa-solid fa-medal" />
                    </div>
                )}

                <div className="badge-detail-hero-info">
                    <h2>{badge.name}</h2>
                    <p>{badge.description}</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                        <span
                            className={`admin-status ${badge.is_active ? 'admin-status--active' : 'admin-status--inactive'}`}
                            style={{ color: badge.is_active ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                            {badge.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                        <span style={{ fontSize: 13, color: '#6366f1' }}>
                            <i className="fa-solid fa-users" style={{ marginRight: 4 }} />
                            {badge.club_name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="badge-detail-grid">
                <div className="badge-info-card">
                    <div className="info-label">🏆 Điểm yêu cầu</div>
                    <div className="info-value">{badge.points_required}</div>
                </div>
                <div className="badge-info-card">
                    <div className="info-label">📅 Ngày tạo badge</div>
                    <div className="info-value">{badge.badge_created_at ? new Date(badge.badge_created_at).toLocaleDateString('vi-VN') : '-'}</div>
                </div>
                <div className="badge-info-card">
                    <div className="info-label">📅 Ngày tạo record</div>
                    <div className="info-value">{badge.created_at ? new Date(badge.created_at).toLocaleDateString('vi-VN') : '-'}</div>
                </div>
                <div className="badge-info-card">
                    <div className="info-label">🏛️ Ngày tạo CLB</div>
                    <div className="info-value">{badge.club_created_at ? new Date(badge.club_created_at).toLocaleDateString('vi-VN') : '-'}</div>
                </div>
            </div>

            {/* Icon URL */}
            {badge.icon_url && (
                <div className="reward-detail-card" style={{ marginTop: 16 }}>
                    <div className="reward-desc-section">
                        <h4>
                            <i className="fa-solid fa-image" style={{ marginRight: 6, color: '#6366f1' }} />
                            Icon URL
                        </h4>
                        <p style={{ wordBreak: 'break-all', fontSize: 13, color: '#6b7280' }}>
                            {badge.icon_url}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BadgeDetail
