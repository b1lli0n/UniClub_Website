import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../api/userApi';
import axios from 'axios';

function SendClubInvitation({ clubId }) {
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getAllUsers();
                setUsers(data);
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
            await axios.post('/api/invitations/invite', {
                clubId,
                userId,
                message,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            setStatus('Gửi lời mời thành công!');
            setUserId('');
            setMessage('');
        } catch (err) {
            setStatus('Gửi thất bại: ' + (err.response?.data?.message || err.message));
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
            <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Lời nhắn (tùy chọn)"
            />
            <button type="submit" disabled={loading || !userId}>
                {loading ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
            {status && <div className="invite-status">{status}</div>}
        </form>
    );
}

export default SendClubInvitation;
