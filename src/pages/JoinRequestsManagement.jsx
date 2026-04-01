import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJoinRequests } from '../api/clubApi';
import '../styles/Memberships.css';

function JoinRequestsManagement() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const clubId = id;

    useEffect(() => {
        const loadMemberships = async () => {
            if (!clubId) {
                setError('Khong tim thay Club ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getJoinRequests(clubId);

                let requests = [];
                if (Array.isArray(response)) {
                    requests = response;
                } else if (response.data && Array.isArray(response.data)) {
                    requests = response.data;
                } else if (response.memberships && Array.isArray(response.memberships)) {
                    requests = response.memberships;
                }

                const mapped = requests.map((req) => ({
                    membershipId: req._id || req.id,
                    user: {
                        userId: req.user_id?._id || req.user_id,
                        name: req.user_id?.fullName || req.user_id?.email?.split('@')[0] || 'Unknown',
                        email: req.user_id?.email || 'No email'
                    },
                    status: req.status === 0 ? 'pending' : req.status === 1 ? 'approved' : req.status === 2 ? 'rejected' : 'unknown',
                    requestedAt: req.joined_at || req.createdAt || new Date().toISOString()
                }));

                setMemberships(mapped);
                setError('');
            } catch (err) {
                setError(err.message || 'Khong the ket noi den server');
            } finally {
                setLoading(false);
            }
        };

        loadMemberships();
    }, [clubId]);

    const handleApprove = async (membershipId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/clubs/${clubId}/memberships/${membershipId}/approve`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: 0 })
                }
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || 'Approve failed');
            }

            setMemberships((prev) =>
                prev.map((req) => (req.membershipId === membershipId ? { ...req, status: 'approved' } : req))
            );
            alert('Da chap nhan thanh vien!');
        } catch (err) {
            alert(err.message || 'Khong the chap nhan thanh vien');
        }
    };

    const handleReject = async (membershipId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/clubs/${clubId}/memberships/${membershipId}/reject`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || 'Reject failed');
            }

            setMemberships((prev) =>
                prev.map((req) => (req.membershipId === membershipId ? { ...req, status: 'rejected' } : req))
            );
            alert('Da tu choi thanh vien!');
        } catch (err) {
            alert(err.message || 'Khong the tu choi thanh vien');
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Cho xu ly';
            case 'approved':
                return 'Chap nhan';
            case 'rejected':
                return 'Tu choi';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card memberships-loading-card">
                        <div className="memberships-spinner" />
                        <p className="memberships-loading-text">Dang tai yeu cau tham gia...</p>
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
                        <div className="memberships-error-icon">!</div>
                        <h3 className="memberships-error-title">Khong the tai du lieu</h3>
                        <p className="memberships-error-text">{error}</p>
                        <button onClick={() => window.location.reload()} className="memberships-retry-button">
                            Thu lai
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <header className="myclub-header">
                    <h1 className="myclub-title">Duyet thanh vien</h1>
                </header>

                {memberships.length > 0 ? (
                    <div className="memberships-list">
                        {memberships.map((request) => (
                            <div key={request.membershipId} className="glass-card memberships-item">
                                <div className="memberships-item-content">
                                    <div className="memberships-user">
                                        <div className="memberships-avatar">
                                            {request.user.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="memberships-user-name">{request.user.name}</h3>
                                            <p className="memberships-user-email">{request.user.email}</p>
                                        </div>
                                    </div>
                                    <p className="memberships-requested-at">
                                        Gui luc: {new Date(request.requestedAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>

                                <div className="memberships-actions">
                                    <span className={`memberships-status-badge status-${request.status}`}>
                                        {getStatusLabel(request.status)}
                                    </span>

                                    {request.status === 'pending' ? (
                                        <div className="memberships-action-buttons">
                                            <button
                                                onClick={() => handleApprove(request.membershipId)}
                                                className="memberships-approve"
                                            >
                                                Chap nhan
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.membershipId)}
                                                className="memberships-reject"
                                            >
                                                Tu choi
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card memberships-empty">
                        <p className="memberships-empty-text">Khong co yeu cau tham gia nao</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JoinRequestsManagement;
