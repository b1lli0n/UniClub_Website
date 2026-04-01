import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../api/userApi';
import { sendInvitation } from '../api/invitationApi';

function SendClubInvitation({ clubId, onSuccess }) {
    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getAllUsers();
                // API trả {message, users: [...]}
                const userList = data?.users || data || [];
                setUsers(Array.isArray(userList) ? userList : []);
            } catch (err) {
                setStatus('Không thể tải danh sách user');
            }
        }
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Đang gửi...');
        setLoading(true);
        try {
            await sendInvitation({
                clubId,
                userId,
            });
            setStatus('Gửi lời mời thành công!');
            setUserId('');
            if (onSuccess) onSuccess();
        } catch (err) {
            if (err?.response?.status === 409) {
                setStatus('Gửi thất bại: Người dùng đã có lời mời pending.');
            } else {
                setStatus('Gửi thất bại: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="send-invite-form">
            <h3>Mời thành viên mới</h3>
            <select value={userId} onChange={e => setUserId(e.target.value)} required>
                <option value="">Chọn thành viên...</option>
                {users.map(user => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                        {user.fullName || user.email}
                    </option>
                ))}
            </select>
            <button type="submit" disabled={loading || !userId}>
                {loading ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
            {status && <div className="invite-status">{status}</div>}
        </form>
    );
}

export default SendClubInvitation;
