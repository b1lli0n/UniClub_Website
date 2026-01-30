import { useEffect, useState } from 'react';
import { fetchJoinRequests } from '../services/api';
import { mapMembership } from '../services/dataMappers';

function Memberships() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // TODO: lấy từ auth/context
    const clubId = '69776c80120c12cc18c813bc';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc2YzgwMTIwYzEyY2MxOGM4MTNiOSIsImlhdCI6MTc2OTYyMjQ5Nn0.799v8HXXSCiVdjVlhZPr8cK-kygJfUDso4nxJrQFqsg';

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
                    <div className="glass-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            border: '4px solid #CDB4DB',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ fontSize: '1rem', color: 'var(--candy-text)', opacity: 0.7 }}>
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
                    <div className="glass-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--candy-text)' }}>
                            Không thể tải dữ liệu
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--candy-text)', opacity: 0.7, marginBottom: '24px' }}>
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '10px 24px',
                                background: '#CDB4DB',
                                color: '#4A4A6A',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'rgba(245, 158, 11, 0.1)';
            case 'approved':
                return 'rgba(34, 197, 94, 0.1)';
            case 'rejected':
                return 'rgba(239, 68, 68, 0.1)';
            default:
                return 'rgba(0, 0, 0, 0.05)';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return { bg: '#CDB4DB', text: '#4A4A6A' };
            case 'approved':
                return { bg: '#BDE0FE', text: '#4A4A6A' };
            case 'rejected':
                return { bg: '#FFAFCC', text: '#4A4A6A' };
            default:
                return { bg: '#BDE0FE', text: '#4A4A6A' };
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {memberships.map((request) => {
                            const statusColor = getStatusColor(request.status);
                            const badgeColor = getStatusBadgeColor(request.status);
                            return (
                                <div
                                    key={request.membershipId}
                                    className="glass-card"
                                    style={{
                                        padding: '20px',
                                        background: '#FFFFFF',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: 'var(--candy-hotpink)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem'
                                            }}>
                                                {request.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--candy-text)' }}>
                                                    {request.user.name}
                                                </h3>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--candy-text)', opacity: 0.6 }}>
                                                    {request.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ margin: '8px 0 0 60px', fontSize: '0.8rem', color: 'var(--candy-text)', opacity: 0.5 }}>
                                            Gửi lúc: {new Date(request.requestedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            background: badgeColor.bg,
                                            color: badgeColor.text,
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>
                                            {getStatusLabel(request.status)}
                                        </span>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleApprove(request.membershipId)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#BDE0FE',
                                                    color: '#4A4A6A',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Chấp nhận
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.membershipId)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#FFAFCC',
                                                    color: '#4A4A6A',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}
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
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--candy-text)', opacity: 0.6 }}>
                            Không có yêu cầu tham gia nào
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Memberships;
