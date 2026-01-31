import { useEffect, useState } from 'react';
import { fetchJoinRequests } from '../services/api';
import { mapMembership } from '../services/dataMappers';
import '../styles/Memberships.css';

function Memberships() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // TODO: lấy từ auth/context
    const clubId = localStorage.getItem('clubId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadMemberships = async () => {
            try {
                setLoading(true);
                const data = await fetchJoinRequests(clubId, token);
                const mappedRequests = data.map(mapMembership);
                setMemberships(mappedRequests);
                setError('');
            } catch (err) {
                setError(err.message || 'Không thể kết nối đến server');
            } finally {
                setLoading(false);
            }
        };
        loadMemberships();
    }, []);

    if (loading) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card memberships-loading-card">
                        <div className="memberships-spinner" />
                        <p className="memberships-loading-text">
                            Đang tải yêu cầu tham gia...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card memberships-error-card">
                        <div className="memberships-error-icon">⚠️</div>
                        <h3 className="memberships-error-title">
                            Không thể tải dữ liệu
                        </h3>
                        <p className="memberships-error-text">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="memberships-retry-button"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleApprove = (membershipId) => {
        console.log('Approve:', membershipId);
        setMemberships(memberships.map(req =>
            req.membershipId === membershipId ? { ...req, status: 'approved' } : req
        ));
    };

    const handleReject = (membershipId) => {
        console.log('Reject:', membershipId);
        setMemberships(memberships.map(req =>
            req.membershipId === membershipId ? { ...req, status: 'rejected' } : req
        ));
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ xử lý';
            case 'approved':
                return 'Chấp nhận';
            case 'rejected':
                return 'Từ chối';
            default:
                return status;
        }
    };

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <header className="myclub-header">
                    <h1 className="myclub-title">Yêu cầu tham gia</h1>
                </header>

                {memberships.length > 0 ? (
                    <div className="memberships-list">
                        {memberships.map((request) => {
                            return (
                                <div
                                    key={request.membershipId}
                                    className="glass-card memberships-item"
                                >
                                    <div className="memberships-item-content">
                                        <div className="memberships-user">
                                            <div className="memberships-avatar">
                                                {request.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="memberships-user-name">
                                                    {request.user.name}
                                                </h3>
                                                <p className="memberships-user-email">
                                                    {request.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="memberships-requested-at">
                                            Gửi lúc: {new Date(request.requestedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    <div className="memberships-actions">
                                        <span className={`memberships-status-badge status-${request.status}`}>
                                            {getStatusLabel(request.status)}
                                        </span>

                                        <div className="memberships-action-buttons">
                                            <button
                                                onClick={() => handleApprove(request.membershipId)}
                                                className="memberships-approve"
                                            >
                                                Chấp nhận
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.membershipId)}
                                                className="memberships-reject"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card memberships-empty">
                        <p className="memberships-empty-text">
                            Không có yêu cầu tham gia nào
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Memberships;
