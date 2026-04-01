import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { approveJoinRequest, getJoinRequests, rejectJoinRequest } from '../api/clubApi';
import SendClubInvitation from '../components/SendClubInvitation';
import '../styles/Memberships.css';

function Memberships() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState('');
    const navigate = useNavigate();
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
                const response = await getJoinRequests(clubId);

                // Handle different response formats
                let members = [];
                if (Array.isArray(response)) {
                    members = response;
                } else if (response.data && Array.isArray(response.data)) {
                    members = response.data;
                } else if (response.memberships && Array.isArray(response.memberships)) {
                    members = response.memberships;
                } else if (response.members && Array.isArray(response.members)) {
                    members = response.members;
                }

                // Map to FE format
                const mapped = members.map(member => ({
                    membershipId: member._id || member.id,
                    user: {
                        userId: member.user_id?._id || member.user_id || member.user?._id || member.user,
                        name: member.user_id?.fullName || member.user?.fullName || member.user_id?.email?.split('@')[0] || member.user?.email?.split('@')[0] || 'Unknown',
                        email: member.user_id?.email || member.user?.email || 'No email'
                    },
                    status: member.status === 0 || member.status === 'pending'
                        ? 'pending'
                        : member.status === 1 || member.status === 'approved'
                            ? 'approved'
                            : member.status === 2 || member.status === 'rejected'
                                ? 'rejected'
                                : member.status === 3 || member.status === 'canceled' || member.status === 'cancelled'
                                    ? 'cancelled'
                                    : 'unknown',
                    role: member.role,
                    requestedAt: member.createdAt || member.joined_at || new Date().toISOString()
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

    const handleApprove = async (membershipId) => {
        if (!membershipId) return;
        try {
            setActionLoadingId(`approve-${membershipId}`);
            await approveJoinRequest(clubId, membershipId, { role: 0 });
            setMemberships((prev) =>
                prev.map((item) =>
                    item.membershipId === membershipId ? { ...item, status: 'approved' } : item
                )
            );
        } catch (err) {
            alert(err?.message || 'Không thể duyệt thành viên');
        } finally {
            setActionLoadingId('');
        }
    };

    const handleReject = async (membershipId) => {
        if (!membershipId) return;
        try {
            setActionLoadingId(`reject-${membershipId}`);
            await rejectJoinRequest(clubId, membershipId);
            setMemberships((prev) =>
                prev.map((item) =>
                    item.membershipId === membershipId ? { ...item, status: 'rejected' } : item
                )
            );
        } catch (err) {
            alert(err?.message || 'Không thể từ chối thành viên');
        } finally {
            setActionLoadingId('');
        }
    };

    if (loading) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card memberships-loading-card">
                        <div className="memberships-spinner" />
                        <p className="memberships-loading-text">
                            Đang tải danh sách thành viên...
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

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ xử lý';
            case 'approved':
                return 'Chấp nhận';
            case 'rejected':
                return 'Từ chối';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getRoleLabel = (role) => {
        if (typeof role === 'string') {
            const normalizedRole = role.toLowerCase();
            if (normalizedRole.includes('leader') && normalizedRole.includes('sub')) return 'Sub-leader';
            if (normalizedRole.includes('leader')) return 'Leader';
            if (normalizedRole.includes('secret')) return 'Secretary';
            if (normalizedRole.includes('treasurer')) return 'Treasurer';
            if (normalizedRole.includes('member')) return 'Member';
        }

        const roleNumber = Number(role);
        switch (roleNumber) {
            case 1:
                return 'Leader';
            case 2:
                return 'Sub-leader';
            case 3:
                return 'Secretary';
            case 4:
                return 'Treasurer';
            default:
                return 'Member';
        }
    };

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <header className="myclub-header">
                    <h1 className="myclub-title">Duyệt thành viên CLB</h1>
                    <div className="memberships-header-actions">
                        <button
                            type="button"
                            className="memberships-invite-list-button"
                            onClick={() => navigate(`/clubs/${clubId}/invitations`)}
                            title="Xem danh sách lời mời"
                        >
                            Danh sách lời mời
                        </button>
                        <button
                            type="button"
                            className="memberships-invite-button"
                            onClick={() => setShowInviteModal(true)}
                            title="Mời thành viên mới"
                        >
                            Mời thành viên
                        </button>
                    </div>
                </header>

                {memberships.length > 0 ? (
                    <div className="memberships-list">
                        {memberships.map((request) => {
                            const isPending = request.status === 'pending';
                            const isApproving = actionLoadingId === `approve-${request.membershipId}`;
                            const isRejecting = actionLoadingId === `reject-${request.membershipId}`;
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
                                            Tham gia lúc: {new Date(request.requestedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    <div className="memberships-actions">
                                        <span className={`memberships-status-badge status-${request.status}`}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                        {isPending ? (
                                            <div className="memberships-action-buttons">
                                                <button
                                                    type="button"
                                                    className="memberships-approve"
                                                    onClick={() => handleApprove(request.membershipId)}
                                                    disabled={isApproving || isRejecting}
                                                >
                                                    {isApproving ? 'Đang duyệt...' : 'Duyệt'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="memberships-reject"
                                                    onClick={() => handleReject(request.membershipId)}
                                                    disabled={isApproving || isRejecting}
                                                >
                                                    {isRejecting ? 'Đang xử lý...' : 'Từ chối'}
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="memberships-status-badge">
                                                {getRoleLabel(request.role)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card memberships-empty">
                        <p className="memberships-empty-text">
                            Chưa có yêu cầu tham gia nào
                        </p>
                    </div>
                )}

                {showInviteModal && (
                    <div
                        className="memberships-modal-backdrop"
                        onClick={() => setShowInviteModal(false)}
                        role="presentation"
                    >
                        <div
                            className="glass-card memberships-invite-modal"
                            onClick={(event) => event.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Mời thành viên"
                        >
                            <div className="memberships-invite-modal-header">
                                <h2 className="memberships-invite-modal-title">Mời thành viên mới</h2>
                                <button
                                    type="button"
                                    className="memberships-modal-close"
                                    onClick={() => setShowInviteModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>

                            <SendClubInvitation
                                clubId={clubId}
                                onSuccess={() => setShowInviteModal(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Memberships;
