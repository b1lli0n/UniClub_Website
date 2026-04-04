import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { approveJoinRequest, getJoinRequests, rejectJoinRequest } from '../api/clubApi';
import '../styles/Memberships.css';

function Memberships() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectModal, setRejectModal] = useState({
        open: false,
        membershipId: '',
        userName: '',
        reason: ''
    });
    const [rejectModalError, setRejectModalError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();
    const { id } = useParams();
    const clubId = id;

    const normalizeStatus = (status) => {
        if (status === 0 || status === '0' || status === 'pending') return 0;
        if (status === 1 || status === '1' || status === 'approved') return 1;
        if (status === 2 || status === '2' || status === 'rejected') return 2;
        if (status === 3 || status === '3' || status === 'canceled' || status === 'cancelled') return 3;
        return 0;
    };


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
                    status: normalizeStatus(member.status),
                    role: member.role,
                    requestedAt: member.createdAt || member.joined_at || new Date().toISOString(),
                    requestReason: member.reason || member.requestReason || member.request_reason || '',
                    rejectReason: member.rejectReason || member.rejectedReason || member.reject_reason || member.rejectionReason || '',
                    raw: member
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
                    item.membershipId === membershipId ? { ...item, status: 1 } : item
                )
            );
        } catch (err) {
            alert(err?.message || 'Không thể duyệt thành viên');
        } finally {
            setActionLoadingId('');
        }
    };

    const handleReject = async (membershipId, reason) => {
        if (!membershipId) return;
        try {
            setActionLoadingId(`reject-${membershipId}`);
            await rejectJoinRequest(clubId, membershipId, { reason });
            setMemberships((prev) =>
                prev.map((item) =>
                    item.membershipId === membershipId ? { ...item, status: 2, rejectReason: reason } : item
                )
            );
        } catch (err) {
            alert(err?.message || 'Không thể từ chối thành viên');
        } finally {
            setActionLoadingId('');
        }
    };

    const openDetailModal = (request) => {
        setSelectedRequest(request);
    };

    const closeDetailModal = () => {
        setSelectedRequest(null);
    };

    const openRejectModal = (request) => {
        setRejectModalError('');
        setRejectModal({
            open: true,
            membershipId: request.membershipId,
            userName: request.user?.name || 'thành viên này',
            reason: ''
        });
    };

    const closeRejectModal = () => {
        if (actionLoadingId.startsWith('reject-')) return;
        setRejectModalError('');
        setRejectModal({
            open: false,
            membershipId: '',
            userName: '',
            reason: ''
        });
    };

    const submitRejectModal = async () => {
        const reasonText = rejectModal.reason.trim();
        if (!reasonText) {
            setRejectModalError('Vui lòng nhập lý do từ chối.');
            return;
        }

        await handleReject(rejectModal.membershipId, reasonText);
        setRejectModal({
            open: false,
            membershipId: '',
            userName: '',
            reason: ''
        });
        setRejectModalError('');
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
        const normalizedStatus = normalizeStatus(status);
        switch (status) {
            case 0:
            case '0':
            case 'pending':
                return 'Chờ duyệt';
            case 1:
            case '1':
            case 'approved':
                return 'Đã duyệt';
            case 2:
            case '2':
            case 'rejected':
                return 'Từ chối';
            case 3:
            case '3':
            case 'canceled':
            case 'cancelled':
                return 'Đã hủy';
            default:
                switch (normalizedStatus) {
                    case 0:
                        return 'Chờ duyệt';
                    case 1:
                        return 'Đã duyệt';
                    case 2:
                        return 'Từ chối';
                    case 3:
                        return 'Đã hủy';
                    default:
                        return status;
                }
        }
    };

    const getStatusClassName = (status) => `status-${normalizeStatus(status)}`;

    const filteredMemberships = statusFilter === 'all'
        ? memberships
        : memberships.filter((request) => String(request.status) === String(statusFilter));

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
                        <label className="memberships-filter-wrap">
                            <span className="memberships-filter-label">Lọc trạng thái</span>
                            <select
                                className="memberships-filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="0">Chờ duyệt</option>
                                <option value="1">Đã duyệt</option>
                                <option value="2">Từ chối</option>
                                <option value="3">Đã hủy</option>
                            </select>
                        </label>
                        <button
                            type="button"
                            className="memberships-invite-list-button"
                            onClick={() => navigate(`/clubs/manager/${clubId}/invitations`)}
                            title="Xem danh sách lời mời"
                        >
                            Danh sách lời mời
                        </button>
                    </div>
                </header>

                {filteredMemberships.length > 0 ? (
                    <div className="memberships-list">
                        {filteredMemberships.map((request) => {
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
                                        <button
                                            type="button"
                                            className="memberships-view-detail"
                                            onClick={() => openDetailModal(request)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>

                                    <div className="memberships-actions">
                                        <span className={`memberships-status-badge ${getStatusClassName(request.status)}`}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                        {normalizeStatus(request.status) === 0 ? (
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
                                                    onClick={() => openRejectModal(request)}
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
                            {statusFilter === 'all'
                                ? 'Chưa có yêu cầu tham gia nào'
                                : 'Không có yêu cầu nào khớp bộ lọc này'}
                        </p>
                    </div>
                )}

                {selectedRequest ? (
                    <div className="memberships-modal-backdrop" onClick={closeDetailModal}>
                        <div className="memberships-detail-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="memberships-detail-modal-header">
                                <h3 className="memberships-detail-modal-title">Chi tiết yêu cầu tham gia</h3>
                                <button type="button" className="memberships-modal-close" onClick={closeDetailModal}>
                                    Đóng
                                </button>
                            </div>

                            <div className="memberships-detail-grid">
                                <div className="memberships-detail-item">
                                    <span className="memberships-detail-label">Họ tên</span>
                                    <span className="memberships-detail-value">{selectedRequest.user?.name || 'N/A'}</span>
                                </div>
                                <div className="memberships-detail-item">
                                    <span className="memberships-detail-label">Email</span>
                                    <span className="memberships-detail-value">{selectedRequest.user?.email || 'N/A'}</span>
                                </div>
                                <div className="memberships-detail-item">
                                    <span className="memberships-detail-label">Trạng thái</span>
                                    <span className="memberships-detail-value">{getStatusLabel(selectedRequest.status)}</span>
                                </div>
                                <div className="memberships-detail-item">
                                    <span className="memberships-detail-label">Vai trò</span>
                                    <span className="memberships-detail-value">{getRoleLabel(selectedRequest.role)}</span>
                                </div>
                                <div className="memberships-detail-item">
                                    <span className="memberships-detail-label">Thời gian gửi</span>
                                    <span className="memberships-detail-value">{new Date(selectedRequest.requestedAt).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="memberships-detail-item memberships-detail-item-full">
                                    <span className="memberships-detail-label">Lý do tham gia</span>
                                    <span className="memberships-detail-value">{selectedRequest.requestReason || 'Chưa có thông tin'}</span>
                                </div>
                                {selectedRequest.rejectReason ? (
                                    <div className="memberships-detail-item memberships-detail-item-full">
                                        <span className="memberships-detail-label">Lý do bị từ chối</span>
                                        <span className="memberships-detail-value memberships-detail-reject-reason">{selectedRequest.rejectReason}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}

                {rejectModal.open ? (
                    <div className="memberships-modal-backdrop" onClick={closeRejectModal}>
                        <div className="memberships-reject-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="memberships-detail-modal-header">
                                <h3 className="memberships-detail-modal-title">Từ chối yêu cầu</h3>
                                <button
                                    type="button"
                                    className="memberships-modal-close"
                                    onClick={closeRejectModal}
                                    disabled={actionLoadingId.startsWith('reject-')}
                                >
                                    Đóng
                                </button>
                            </div>

                            <p className="memberships-reject-help-text">
                                Nhập lý do từ chối cho {rejectModal.userName}.
                            </p>

                            <textarea
                                className="memberships-reject-textarea"
                                value={rejectModal.reason}
                                onChange={(e) => {
                                    setRejectModal((prev) => ({ ...prev, reason: e.target.value }));
                                    if (rejectModalError) setRejectModalError('');
                                }}
                                placeholder="Ví dụ: Hiện tại CLB đã đủ số lượng thành viên..."
                                rows={4}
                            />

                            {rejectModalError ? <p className="memberships-reject-error">{rejectModalError}</p> : null}

                            <div className="memberships-reject-actions">
                                <button
                                    type="button"
                                    className="memberships-reject-cancel"
                                    onClick={closeRejectModal}
                                    disabled={actionLoadingId.startsWith('reject-')}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="memberships-reject-confirm"
                                    onClick={submitRejectModal}
                                    disabled={actionLoadingId.startsWith('reject-')}
                                >
                                    {actionLoadingId.startsWith('reject-') ? 'Đang gửi...' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

            </div>
        </div>
    );
}

export default Memberships;
