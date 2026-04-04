import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllUsers } from '../api/userApi';
import { sendInvitation } from '../api/invitationApi';

function SendClubInvitation({ clubId, onSuccess }) {
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
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
                const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách user';
                setStatus(msg);
                toast.error(msg);
            }
        }
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Đang gửi...');
        setLoading(true);
        try {
            const trimmedMessage = message.trim();
            const response = await sendInvitation({
                clubId,
                userId,
                message: trimmedMessage,
            });
            const successMessage = response?.data?.message || response?.message || 'Gửi lời mời thành công!';
            setStatus(successMessage);
            toast.success(successMessage);
            setUserId('');
            setMessage('');
            if (onSuccess) onSuccess();
        } catch (err) {
            const serverMessage = err?.response?.data?.message || err?.message || 'Gửi lời mời thất bại';
            if (err?.response?.status === 409) {
                setStatus(serverMessage);
            } else {
                setStatus(serverMessage);
            }
            toast.error(serverMessage);
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
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Nhập lời nhắn mời thành viên (tuỳ chọn)..."
            />
            <button type="submit" disabled={loading || !userId}>
                {loading ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
            {status && <div className="invite-status">{status}</div>}
        </form>
    );
}

export default SendClubInvitation;
