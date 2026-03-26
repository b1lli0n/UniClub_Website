import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJoinRequests } from '../api/clubApi';
import '../styles/Memberships.css';

function Memberships() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const clubId = id;

    useEffect(() => {
        const loadMemberships = async () => {
            if (!clubId) {
                setError('Không tìm thấy Club ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('📄 Loading join requests for club:', clubId);
                const response = await getJoinRequests(clubId);
                console.log('✅ Join requests response:', response);

                // Handle different response formats
                let requests = [];
                if (Array.isArray(response)) {
                    requests = response;
                } else if (response.data && Array.isArray(response.data)) {
                    requests = response.data;
                } else if (response.memberships && Array.isArray(response.memberships)) {
                    requests = response.memberships;
                }

                // Map to FE format
                const mapped = requests.map(req => ({
                    membershipId: req._id || req.id,
                    user: {
                        userId: req.user_id?._id || req.user_id,
                        name: req.user_id?.fullName || req.user_id?.email?.split('@')[0] || 'Unknown',
                        email: req.user_id?.email || 'No email'
                    },
                    status: req.status === 0 ? 'pending' : req.status === 1 ? 'approved' : req.status === 2 ? 'rejected' : 'unknown',
                    requestedAt: req.joined_at || new Date().toISOString()
                }));

                setMemberships(mapped);
                setError('');
            } catch (err) {
                console.error('❌ Load memberships error:', err);
                setError(err.message || 'Không thể kết nối đến server');
            } finally {
                setLoading(false);
            }
        };
        loadMemberships();
    }, [clubId]);

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

    const handleApprove = async (membershipId) => {
        try {
            console.log('📝 Approving membership:', membershipId);
            const response = await fetch(
                `http://localhost:5000/api/clubs/${clubId}/memberships/${membershipId}/approve`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: 0 }) // Default role: Member
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Approve failed');
            }

            console.log('✅ Approved successfully');
            // Update UI
            setMemberships(memberships.map(req =>
                req.membershipId === membershipId ? { ...req, status: 'approved' } : req
            ));
            alert('Đã chấp nhận thành viên!');
        } catch (err) {
            console.error('❌ Approve error:', err);
            alert(err.message || 'Không thể chấp nhận thành viên');
        }
    };

    const handleReject = async (membershipId) => {
        try {
            console.log('📝 Rejecting membership:', membershipId);
            const response = await fetch(
                `http://localhost:5000/api/clubs/${clubId}/memberships/${membershipId}/reject`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Reject failed');
            }

            console.log('✅ Rejected successfully');
            // Update UI
            setMemberships(memberships.map(req =>
                req.membershipId === membershipId ? { ...req, status: 'rejected' } : req
            ));
            alert('Đã từ chối thành viên!');
        } catch (err) {
            console.error('❌ Reject error:', err);
            alert(err.message || 'Không thể từ chối thành viên');
        }
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
