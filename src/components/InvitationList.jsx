import React, { useEffect, useState } from 'react';
import CancelInvitationButton from './CancelInvitationButton';
import { useAuth } from '../context/AuthContext';
import { getClubInvitations } from '../api/invitationApi';

function InvitationList({ clubId }) {
    const [invitations, setInvitations] = useState([]);
    const [status, setStatus] = useState('pending');
    const [loading, setLoading] = useState(false);
    const { user, userRole } = useAuth();

    useEffect(() => {
        const fetchInvitations = async () => {
            setLoading(true);
            try {
                const res = await getClubInvitations({ clubId, status, page: 1, limit: 10 });
                setInvitations(res.data.data);
            } catch (err) {
                setInvitations([]);
            }
            setLoading(false);
        };
        if (clubId) fetchInvitations();
    }, [clubId, status]);

    return (
        <div className="invitation-list-section">
            <h3>Danh sách lời mời</h3>
            <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="pending">Chờ xử lý</option>
                <option value="approved">Đã chấp nhận</option>
                <option value="rejected">Đã từ chối</option>
                <option value="canceled">Đã hủy</option>
            </select>
            {loading ? <div>Đang tải...</div> : (
                <table className="invitation-table">
                    <thead>
                        <tr>
                            <th>Người được mời</th>
                            <th>Email</th>
                            <th>Trạng thái</th>
                            <th>Ngày gửi</th>
                            <th>Người gửi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations && invitations.length > 0 ? invitations.map(invite => {
                            const canCancel = userRole === 3 || (user && invite.requested_by && (user._id === invite.requested_by._id || user.id === invite.requested_by._id));
                            return (
                                <tr key={invite._id}>
                                    <td>{invite.user_id?.fullName || invite.user_id?.email}</td>
                                    <td>{invite.user_id?.email}</td>
                                    <td>{invite.status}</td>
                                    <td>{invite.createdAt ? new Date(invite.createdAt).toLocaleString('vi-VN') : ''}</td>
                                    <td>{invite.requested_by?.fullName || invite.requested_by?.email}</td>
                                    <td>
                                        {invite.status === 'pending' && canCancel && (
                                            <CancelInvitationButton
                                                invitationId={invite._id}
                                                clubId={clubId}
                                                onSuccess={() => {
                                                    // reload list after cancel
                                                    setInvitations(invites => invites.map(i => i._id === invite._id ? { ...i, status: 'canceled' } : i));
                                                }}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="6">Không có lời mời nào</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default InvitationList;
