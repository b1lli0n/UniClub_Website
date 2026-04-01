import React, { useEffect, useState } from 'react';
import { getInvitationDetail } from '../api/invitationApi';

function InvitationDetail({ invitationId, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!invitationId) return;
        setLoading(true);
        getInvitationDetail(invitationId)
            .then(res => setDetail(res.data.data))
            .catch(() => setDetail(null))
            .finally(() => setLoading(false));
    }, [invitationId]);

    if (!invitationId) return null;
    if (loading) return <div>Đang tải chi tiết...</div>;
    if (!detail) return <div>Không tìm thấy lời mời</div>;

    return (
        <div className="invitation-detail-section">
            <h3>Chi tiết lời mời</h3>
            <p><b>Người được mời:</b> {detail.user_id?.fullName} ({detail.user_id?.email})</p>
            <p><b>Trạng thái:</b> {detail.status}</p>
            <p><b>Ngày gửi:</b> {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : ''}</p>
            <p><b>Người gửi:</b> {detail.requested_by?.fullName}</p>
            <p><b>Lời nhắn:</b> {detail.message}</p>
            <button onClick={onClose}>Đóng</button>
        </div>
    );
}

export default InvitationDetail;
