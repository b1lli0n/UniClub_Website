import React, { useState, useEffect } from 'react';
import { getAllClubs } from '../../api/clubApi';
import { createClubBadge, updateClubBadge } from '../../api/clubBadgeApi';
import '../../styles/ClubBadgeModal.css';

const ClubBadgeModal = ({ open, onClose, onSuccess, mode = 'create', badgeData }) => {
    const [clubs, setClubs] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        icon_url: '',
        club_id: '',
        points_required: '',
        is_active: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        getAllClubs().then(res => setClubs(res?.clubs || res?.data || []));
        if (mode === 'edit' && badgeData) {
            setForm({
                name: badgeData.name || '',
                description: badgeData.description || '',
                icon_url: badgeData.icon_url || '',
                club_id: badgeData.club_id || '',
                points_required: badgeData.points_required || '',
                is_active: badgeData.is_active,
            });
        } else {
            setForm({ name: '', description: '', icon_url: '', club_id: '', points_required: '', is_active: true });
        }
    }, [open, mode, badgeData]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!form.name || !form.description || !form.icon_url || !form.club_id || !form.points_required) {
                setError('Vui lòng nhập đầy đủ thông tin.');
                setLoading(false);
                return;
            }
            let res;
            if (mode === 'edit' && badgeData) {
                // Chỉ lấy _id club badge, không lấy id template
                const badgeId = badgeData._id;
                if (!badgeId) {
                    setError('Không tìm thấy _id club badge.');
                    setLoading(false);
                    return;
                }
                res = await updateClubBadge(badgeId, form);
            } else {
                res = await createClubBadge(form);
            }
            onSuccess && onSuccess(res?.badge || res?.data || res);
            onClose();
        } catch (err) {
            setError(err?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;
    return (
        <div className="club-badge-modal-overlay">
            <div className="club-badge-modal-content">
                <h2 className="club-badge-modal-title">{mode === 'edit' ? 'Cập nhật huy hiệu CLB' : 'Tạo mới huy hiệu CLB'}</h2>
                <form className="club-badge-modal-form" onSubmit={handleSubmit}>
                    <div className="club-badge-form-group">
                        <label className="club-badge-modal-label">Tên huy hiệu</label>
                        <input className="club-badge-modal-input" name="name" value={form.name} onChange={handleChange} required placeholder="Nhập tên huy hiệu" />
                    </div>
                    <div className="club-badge-form-group">
                        <label className="club-badge-modal-label">Mô tả huy hiệu</label>
                        <textarea className="club-badge-modal-input" name="description" value={form.description} onChange={handleChange} required placeholder="Nhập mô tả" rows={2} />
                    </div>
                    <div className="club-badge-form-group">
                        <label className="club-badge-modal-label">Ảnh huy hiệu (icon_url)</label>
                        <input className="club-badge-modal-input" name="icon_url" value={form.icon_url} onChange={handleChange} required placeholder="Nhập URL ảnh" />
                    </div>
                    <div className="club-badge-form-group">
                        <label className="club-badge-modal-label">Chọn CLB</label>
                        <select className="club-badge-modal-select" name="club_id" value={form.club_id} onChange={handleChange} required>
                            <option value="">-- Chọn CLB --</option>
                            {clubs.map(club => (
                                <option key={club._id || club.id} value={club._id || club.id}>{club.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="club-badge-form-group">
                        <label className="club-badge-modal-label">Điểm yêu cầu</label>
                        <input className="club-badge-modal-input" type="number" name="points_required" value={form.points_required} onChange={handleChange} required min={0} />
                    </div>
                    <div className="club-badge-form-group">
                        <label className="club-badge-modal-label">
                            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                            &nbsp;Hoạt động
                        </label>
                    </div>
                    {error && <div className="club-badge-modal-error">{error}</div>}
                    <div className="club-badge-modal-actions">
                        <button type="button" className="club-badge-modal-btn" onClick={onClose} disabled={loading}>Hủy</button>
                        <button type="submit" className="club-badge-modal-btn club-badge-modal-btn--primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : (mode === 'edit' ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClubBadgeModal;
