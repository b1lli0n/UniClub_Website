import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getRewardDetail, updateReward } from '../../api/rewardApi'
import '../../styles/rewards.css'

const RewardDetail = () => {
    const { rewardId } = useParams()
    const navigate = useNavigate()

    const [reward, setReward] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Edit mode
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        points_required: '',
        quantity: '',
    })
    const [saveLoading, setSaveLoading] = useState(false)

    // ─── Fetch reward detail ───────────────────────────────────────────────────
    useEffect(() => {
        if (!rewardId) return
        fetchDetail()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rewardId])

    const fetchDetail = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getRewardDetail(rewardId)
            // Response là reward object trực tiếp (interceptor trả response.data)
            const data = res?._id ? res : res?.reward || res
            setReward(data)
            setEditForm({
                name: data.name,
                description: data.description,
                points_required: data.points_required,
                quantity: data.quantity,
            })
        } catch (err) {
            console.error('getRewardDetail error:', err)
            setError(err?.message || 'Không thể tải chi tiết phần thưởng')
        } finally {
            setLoading(false)
        }
    }

    // ─── Toggle is_active (nhanh, không cần mở form) ─────────────────────────
    const handleToggleActive = async () => {
        try {
            await updateReward(rewardId, { is_active: !reward.is_active })
            toast.success(reward.is_active ? 'Đã ẩn phần thưởng' : 'Đã hiện phần thưởng')
            setReward((prev) => ({ ...prev, is_active: !prev.is_active }))
        } catch (err) {
            console.error('toggleActive error:', err)
            toast.error('Không thể cập nhật trạng thái')
        }
    }

    // ─── Submit edit ───────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault()
        const { name, description, points_required, quantity } = editForm
        if (!name.trim() || !description.trim()) {
            toast.error('Tên và mô tả không được để trống')
            return
        }
        if (Number(points_required) <= 0) {
            toast.error('Điểm cần đổi phải lớn hơn 0')
            return
        }
        if (Number(quantity) < 0) {
            toast.error('Số lượng không được âm')
            return
        }
        setSaveLoading(true)
        try {
            const res = await updateReward(rewardId, {
                name: name.trim(),
                description: description.trim(),
                points_required: Number(points_required),
                quantity: Number(quantity),
            })
            const updated = res?.reward || res
            setReward((prev) => ({ ...prev, ...updated }))
            toast.success('Cập nhật phần thưởng thành công!')
            setIsEditing(false)
        } catch (err) {
            console.error('updateReward error:', err)
            toast.error(err?.message || 'Cập nhật thất bại')
        } finally {
            setSaveLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditForm({
            name: reward.name,
            description: reward.description,
            points_required: reward.points_required,
            quantity: reward.quantity,
        })
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                    <p>Đang tải chi tiết phần thưởng...</p>
                </div>
            </div>
        )
    }

    if (error || !reward) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                    <p>{error || 'Không tìm thấy phần thưởng'}</p>
                    <button className="reward-detail-back" onClick={() => navigate('/admin/rewards')} style={{ marginTop: 12 }}>
                        <i className="fa-solid fa-arrow-left" />
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    const clubName = reward.club_id?.name || 'Không xác định'

    return (
        <div className="admin-panel admin-panel--animate">
            {/* Back button */}
            <button className="reward-detail-back" onClick={() => navigate('/admin/rewards')}>
                <i className="fa-solid fa-arrow-left" />
                Quay lại danh sách
            </button>

            <div className="admin-panel-header" style={{ marginBottom: 20 }}>
                <div>
                    <h2 className="admin-title">Chi tiết phần thưởng</h2>
                    <p className="admin-subtitle">
                        CLB: <strong>{clubName}</strong>
                    </p>
                </div>
                {!isEditing && (
                    <div className="reward-header-actions">
                        {/* Toggle hide/show */}
                        <button
                            type="button"
                            className={`reward-toggle-btn ${reward.is_active ? 'show' : 'hide'}`}
                            onClick={handleToggleActive}
                        >
                            <i className={`fa-solid ${reward.is_active ? 'fa-eye' : 'fa-eye-slash'}`} />
                            {reward.is_active ? 'Ẩn phần thưởng' : 'Hiện phần thưởng'}
                        </button>
                        {/* Edit */}
                        <button
                            type="button"
                            className="reward-edit-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="fa-solid fa-pen-to-square" />
                            Chỉnh sửa
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                /* ─── Edit Form ─────────────────────────────────────────────────── */
                <div className="reward-detail-card">
                    <form onSubmit={handleSave} className="reward-form">
                        <div className="reward-form-group">
                            <label>
                                Tên phần thưởng <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                maxLength={100}
                            />
                        </div>

                        <div className="reward-form-group">
                            <label>
                                Mô tả <span className="required">*</span>
                            </label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div className="reward-form-row">
                            <div className="reward-form-group">
                                <label>
                                    Điểm cần đổi <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={editForm.points_required}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, points_required: e.target.value }))
                                    }
                                    min={1}
                                />
                            </div>
                            <div className="reward-form-group">
                                <label>
                                    Số lượng <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={editForm.quantity}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
                                    }
                                    min={0}
                                />
                            </div>
                        </div>

                        <div className="reward-form-actions">
                            <button type="button" className="reward-btn-cancel" onClick={handleCancelEdit}>
                                Hủy
                            </button>
                            <button type="submit" className="reward-btn-submit" disabled={saveLoading}>
                                {saveLoading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-floppy-disk" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* ─── View Mode ─────────────────────────────────────────────────── */
                <div className="reward-detail-card">
                    {/* Top info */}
                    <div className="reward-detail-top">
                        <div className="reward-detail-icon">
                            <i className="fa-solid fa-gift" />
                        </div>
                        <div className="reward-detail-info">
                            <h2>{reward.name}</h2>
                            <div className="reward-detail-meta">
                                <span className={`admin-status ${reward.is_active ? 'admin-status--active' : 'admin-status--inactive'}`}>
                                    {reward.is_active ? 'Đang hiển thị' : 'Đã ẩn'}
                                </span>
                                <span style={{ fontSize: 13, color: '#9ca3af' }}>
                                    Tạo lúc: {new Date(reward.created_at).toLocaleDateString('vi-VN')}
                                </span>
                                {reward.updated_at && reward.updated_at !== reward.created_at && (
                                    <span style={{ fontSize: 13, color: '#9ca3af' }}>
                                        • Cập nhật: {new Date(reward.updated_at).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="reward-detail-grid">
                        <div className="reward-stat-card highlight">
                            <span className="stat-label">⭐ Điểm cần đổi</span>
                            <span className="stat-value">{reward.points_required.toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="reward-stat-card">
                            <span className="stat-label">📦 Tổng số lượng</span>
                            <span className="stat-value">{reward.quantity}</span>
                        </div>
                        <div className="reward-stat-card">
                            <span className="stat-label">🏢 Câu lạc bộ</span>
                            <span className="stat-value" style={{ fontSize: 16 }}>{clubName}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="reward-desc-section">
                        <h4>Mô tả phần thưởng</h4>
                        <p>{reward.description}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RewardDetail
