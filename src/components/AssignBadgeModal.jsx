import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getClubBadgesForAssign, getMemberBadges, assignBadgeToMember } from '../api/rewardApi';

/**
 * Modal "Thêm huy hiệu" — Admin gán badge thủ công cho một thành viên
 * @param {boolean}  open          - Trạng thái mở/đóng modal
 * @param {Function} onClose       - Callback đóng modal
 * @param {string}   clubId        - ID của CLB
 * @param {object}   member        - Thành viên được chọn { _id (membershipId), user_id: { name, email } }
 * @param {Function} onSuccess     - Callback sau khi gán thành công
 */
const AssignBadgeModal = ({ open, onClose, clubId, member, onSuccess }) => {
    // Danh sách tất cả huy hiệu của CLB
    const [clubBadges, setClubBadges] = useState([]);
    // Danh sách huy hiệu member đã có (badge_template_id[])
    const [ownedBadgeIds, setOwnedBadgeIds] = useState(new Set());
    // Danh sách huy hiệu đã có (để hiển thị)
    const [ownedBadges, setOwnedBadges] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // Badge đang chọn để thêm
    const [selectedBadgeId, setSelectedBadgeId] = useState('');
    // Đang gán
    const [assigning, setAssigning] = useState(false);

    // ─── Fetch dữ liệu khi mở modal ────────────────────────────────────────
    useEffect(() => {
        if (!open || !clubId || !member?._id) return;

        const fetchData = async () => {
            setLoading(true);
            setFetchError('');
            setSelectedBadgeId('');
            setClubBadges([]);
            setOwnedBadgeIds(new Set());
            setOwnedBadges([]);

            try {
                // Gọi song song: lấy tất cả badges của CLB + badges đã có của member
                const [clubRes, memberRes] = await Promise.all([
                    getClubBadgesForAssign(clubId),
                    getMemberBadges(clubId, member._id),
                ]);

                const allClubBadges = clubRes?.badges || [];
                const memberBadgeList = memberRes?.badges || [];

                // Tập hợp badge_template_id member đã có (dùng để so sánh)
                const ownedSet = new Set(memberBadgeList.map(b => b.badge_id?.toString?.() || b.badge_id));

                setClubBadges(allClubBadges);
                setOwnedBadgeIds(ownedSet);
                setOwnedBadges(memberBadgeList);

                if (!allClubBadges.length) {
                    setFetchError('CLB này chưa có huy hiệu nào. Vui lòng tạo huy hiệu cho CLB trước.');
                }
            } catch (err) {
                console.error('AssignBadgeModal fetch error:', err);
                setFetchError(err?.message || 'Không thể tải danh sách huy hiệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, clubId, member?._id]);

    // ─── Xử lý thêm huy hiệu ───────────────────────────────────────────────
    const handleAssign = async () => {
        if (!selectedBadgeId) {
            toast.warn('Vui lòng chọn huy hiệu muốn thêm');
            return;
        }
        setAssigning(true);
        try {
            const res = await assignBadgeToMember(clubId, member._id, selectedBadgeId);
            toast.success(res?.message || 'Đã thêm huy hiệu thành công!');
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('assignBadge error:', err);
            toast.error(err?.message || 'Không thể thêm huy hiệu');
        } finally {
            setAssigning(false);
        }
    };

    if (!open) return null;

    const memberName = member?.user_id?.name || member?.user_id?.full_name || 'thành viên';

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 9000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, animation: 'fadeIn 0.18s ease'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                width: '100%', maxWidth: 540,
                animation: 'slideUp 0.22s ease',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 1
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
                            <i className="fa-solid fa-medal" style={{ color: '#7c3aed', marginRight: 8 }} />
                            Thêm huy hiệu
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                            Thành viên: <strong>{memberName}</strong>
                        </p>
                    </div>
                    <button className="reward-modal-close" onClick={onClose} title="Đóng">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px 24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 10, display: 'block' }} />
                            Đang tải...
                        </div>
                    ) : fetchError ? (
                        <div style={{
                            textAlign: 'center', padding: '28px 0', color: '#ef4444',
                            background: '#fff5f5', borderRadius: 10, border: '1px solid #fecaca'
                        }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
                            {fetchError}
                        </div>
                    ) : (
                        <>
                            {/* ── Huy hiệu đã có của thành viên ── */}
                            {ownedBadges.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <p style={{
                                        fontSize: 12.5, fontWeight: 700, color: '#6b7280',
                                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10
                                    }}>
                                        <i className="fa-solid fa-trophy" style={{ marginRight: 6, color: '#d97706' }} />
                                        Huy hiệu đã có ({ownedBadges.length})
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {ownedBadges.map(b => (
                                            <div key={b._id} style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '6px 12px',
                                                background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                                                border: '1.5px solid #c4b5fd',
                                                borderRadius: 20,
                                            }}>
                                                {b.icon_url ? (
                                                    <img src={b.icon_url} alt={b.name}
                                                        style={{ width: 20, height: 20, borderRadius: 6, objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="fa-solid fa-medal" style={{ color: '#7c3aed', fontSize: 14 }} />
                                                )}
                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6' }}>{b.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <hr style={{ margin: '16px 0', borderColor: '#f3f4f6' }} />
                                </div>
                            )}

                            {/* Không còn badge nào để thêm */}
                            {clubBadges.length > 0 && clubBadges.every(b => ownedBadgeIds.has(b.badge_template_id?.toString())) ? (
                                <div style={{
                                    textAlign: 'center', padding: '20px',
                                    background: '#f9fafb', borderRadius: 10,
                                    color: '#6b7280', fontSize: 14
                                }}>
                                    <i className="fa-solid fa-check-circle" style={{ color: '#10b981', fontSize: 24, marginBottom: 8, display: 'block' }} />
                                    Thành viên đã có tất cả huy hiệu của CLB này!
                                </div>
                            ) : (
                                <>
                                    {/* ── Chọn huy hiệu để thêm ── */}
                                    <p style={{
                                        fontSize: 12.5, fontWeight: 700, color: '#6b7280',
                                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10
                                    }}>
                                        <i className="fa-solid fa-plus-circle" style={{ marginRight: 6, color: '#6366f1' }} />
                                        Chọn huy hiệu để thêm
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                                        {clubBadges.map(badge => {
                                            const alreadyOwned = ownedBadgeIds.has(badge.badge_template_id?.toString());
                                            const isSelected = selectedBadgeId === badge.badge_template_id;
                                            return (
                                                <label
                                                    key={badge._id}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 14,
                                                        padding: '12px 16px',
                                                        border: `2px solid ${alreadyOwned ? '#e5e7eb' : isSelected ? '#7c3aed' : '#e5e7eb'}`,
                                                        borderRadius: 12,
                                                        cursor: alreadyOwned ? 'not-allowed' : 'pointer',
                                                        background: alreadyOwned ? '#f9fafb' : isSelected ? '#f5f3ff' : '#fff',
                                                        opacity: alreadyOwned ? 0.65 : 1,
                                                        transition: 'all 0.18s',
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="badge"
                                                        value={badge.badge_template_id}
                                                        checked={isSelected}
                                                        disabled={alreadyOwned}
                                                        onChange={() => !alreadyOwned && setSelectedBadgeId(badge.badge_template_id)}
                                                        style={{ accentColor: '#7c3aed', width: 16, height: 16, flexShrink: 0 }}
                                                    />
                                                    {/* Icon */}
                                                    {badge.icon_url ? (
                                                        <img src={badge.icon_url} alt={badge.name}
                                                            style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{
                                                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                                            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#7c3aed', fontSize: 18
                                                        }}>
                                                            <i className="fa-solid fa-medal" />
                                                        </div>
                                                    )}
                                                    {/* Info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontWeight: 700, fontSize: 14,
                                                            color: alreadyOwned ? '#6b7280' : '#111827',
                                                            marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6
                                                        }}>
                                                            {badge.name}
                                                            {/* "Đã có" tag */}
                                                            {alreadyOwned && (
                                                                <span style={{
                                                                    fontSize: 11, fontWeight: 600,
                                                                    background: '#d1fae5', color: '#065f46',
                                                                    padding: '1px 8px', borderRadius: 20,
                                                                    border: '1px solid #a7f3d0'
                                                                }}>
                                                                    <i className="fa-solid fa-check" style={{ marginRight: 3 }} />Đã có
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {badge.description}
                                                        </div>
                                                    </div>
                                                    {/* Points */}
                                                    <span style={{
                                                        fontSize: 12, fontWeight: 700, color: '#92400e',
                                                        background: '#fef3c7', border: '1px solid #f59e0b',
                                                        padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0
                                                    }}>
                                                        <i className="fa-solid fa-star" style={{ marginRight: 3, color: '#d97706' }} />
                                                        {badge.points_required?.toLocaleString('vi-VN')} đ
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                                        <button className="reward-btn-cancel" onClick={onClose} disabled={assigning}>
                                            Hủy
                                        </button>
                                        <button
                                            className="reward-btn-submit"
                                            onClick={handleAssign}
                                            disabled={!selectedBadgeId || assigning}
                                        >
                                            {assigning
                                                ? <><i className="fa-solid fa-spinner fa-spin" /> Đang thêm...</>
                                                : <><i className="fa-solid fa-plus" /> Thêm huy hiệu</>
                                            }
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignBadgeModal;
