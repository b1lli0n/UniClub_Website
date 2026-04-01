import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    cancelInvitation,
    getClubInvitations,
    getInvitationDetail,
    resendInvitation,
} from '../api/invitationApi';
import '../styles/InvitationListPage.css';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'approved', label: 'Đã chấp nhận' },
    { value: 'rejected', label: 'Đã từ chối' },
    { value: 'canceled', label: 'Đã hủy' },
    { value: 'all', label: 'Tất cả' },
];

const getInvitationId = (invite) => invite?._id || invite?.id || invite?.invitationId || '';

const parseInvitations = (response) => {
    const payload = response?.data;
    const candidates = [
        payload?.data,
        payload?.invitations,
        payload?.items,
        payload,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
        if (Array.isArray(candidate?.data)) return candidate.data;
        if (Array.isArray(candidate?.invitations)) return candidate.invitations;
        if (Array.isArray(candidate?.items)) return candidate.items;
    }

    return [];
};

const parseInvitationDetail = (response) => {
    const payload = response?.data;
    return payload?.data || payload?.invitation || payload || null;
};

const normalizeStatus = (status) => {
    if (status === 0 || status === '0' || status === 'pending') return 'pending';
    if (status === 1 || status === '1' || status === 'approved') return 'approved';
    if (status === 2 || status === '2' || status === 'rejected') return 'rejected';
    if (status === 3 || status === '3' || status === 'canceled' || status === 'cancelled') return 'canceled';
    return String(status || '').toLowerCase();
};

const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
        case 'pending':
            return 'Chờ xử lý';
        case 'approved':
            return 'Đã chấp nhận';
        case 'rejected':
            return 'Đã từ chối';
        case 'canceled':
            return 'Đã hủy';
        default:
            return 'Không xác định';
    }
};

function InvitationListPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const clubId = id;

    const [status, setStatus] = useState('pending');
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedId, setSelectedId] = useState('');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState('');
    const [recentlyCanceledIds, setRecentlyCanceledIds] = useState([]);

    useEffect(() => {
        const fetchInvitations = async () => {
            if (!clubId) return;
            setLoading(true);
            setError('');
            try {
                const response = await getClubInvitations({ clubId, page: 1, limit: 50 });
                const list = parseInvitations(response);
                setInvitations(Array.isArray(list) ? list : []);
            } catch (err) {
                setInvitations([]);
                setError(err?.response?.data?.message || 'Không thể tải danh sách lời mời');
            } finally {
                setLoading(false);
            }
        };

        fetchInvitations();
    }, [clubId]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!selectedId) {
                setSelectedDetail(null);
                return;
            }

            setDetailLoading(true);
            try {
                const response = await getInvitationDetail(selectedId);
                setSelectedDetail(parseInvitationDetail(response));
            } catch {
                setSelectedDetail(null);
            } finally {
                setDetailLoading(false);
            }
        };

        fetchDetail();
    }, [selectedId]);

    const filteredInvitations = useMemo(() => {
        if (status === 'all') return invitations;
        return invitations.filter((invite) => normalizeStatus(invite?.status) === status);
    }, [invitations, status]);

    const statusCounts = useMemo(() => {
        const counts = {
            all: invitations.length,
            pending: 0,
            approved: 0,
            rejected: 0,
            canceled: 0,
        };

        invitations.forEach((invite) => {
            const normalized = normalizeStatus(invite?.status);
            if (Object.prototype.hasOwnProperty.call(counts, normalized)) {
                counts[normalized] += 1;
            }
        });

        return counts;
    }, [invitations]);

    const refreshList = async () => {
        const response = await getClubInvitations({ clubId, page: 1, limit: 50 });
        const list = parseInvitations(response);
        setInvitations(Array.isArray(list) ? list : []);
    };

    const handleCancel = async (invite) => {
        const invitationId = getInvitationId(invite);
        if (!invitationId) return;
        if (!window.confirm('Bạn chắc chắn muốn hủy lời mời này?')) return;

        setActionLoadingId(invitationId);
        try {
            await cancelInvitation(invitationId, clubId);
            setRecentlyCanceledIds((prev) => (prev.includes(invitationId) ? prev : [...prev, invitationId]));
            await refreshList();
            if (selectedId === invitationId) {
                const detailResponse = await getInvitationDetail(invitationId);
                setSelectedDetail(parseInvitationDetail(detailResponse));
            }
        } catch (err) {
            alert(err?.response?.data?.message || 'Hủy lời mời thất bại');
        } finally {
            setActionLoadingId('');
        }
    };

    const handleResend = async (invite) => {
        const invitationId = getInvitationId(invite);
        if (!invitationId) return;

        const isCanceledLocally = recentlyCanceledIds.includes(invitationId);
        const currentStatus = isCanceledLocally ? 'canceled' : normalizeStatus(invite?.status);
        if (currentStatus !== 'pending') {
            alert('Chỉ có thể gửi lại lời mời đang chờ xử lý. Lời mời đã hủy không thể gửi lại.');
            return;
        }

        setActionLoadingId(invitationId);
        try {
            await resendInvitation(invitationId, clubId);
            await refreshList();
            alert('Đã gửi lại lời mời');
        } catch (err) {
            alert(err?.response?.data?.message || 'Gửi lại lời mời thất bại');
        } finally {
            setActionLoadingId('');
        }
    };

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <header className="myclub-header invitation-page-header">
                    <div>
                        <h1 className="myclub-title">Danh sách lời mời</h1>
                        <p className="invitation-page-subtitle">Theo dõi, lọc và xử lý lời mời thành viên tại một nơi</p>
                    </div>
                    <button
                        type="button"
                        className="invitation-back-btn"
                        onClick={() => navigate(`/clubs/${clubId}/members`)}
                    >
                        Quay về duyệt thành viên
                    </button>
                </header>

                <div className="glass-card invitation-page-card">
                    <div className="invitation-page-toolbar">
                        <label htmlFor="invite-status-filter">Lọc theo trạng thái</label>
                        <select
                            id="invite-status-filter"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="invitation-status-cards">
                        <div className="invitation-status-card">
                            <span>Tổng lời mời</span>
                            <strong>{statusCounts.all}</strong>
                        </div>
                        <div className="invitation-status-card pending">
                            <span>Chờ xử lý</span>
                            <strong>{statusCounts.pending}</strong>
                        </div>
                        <div className="invitation-status-card approved">
                            <span>Đã chấp nhận</span>
                            <strong>{statusCounts.approved}</strong>
                        </div>
                        <div className="invitation-status-card rejected">
                            <span>Đã từ chối</span>
                            <strong>{statusCounts.rejected + statusCounts.canceled}</strong>
                        </div>
                    </div>

                    {error && <p className="invitation-page-error">{error}</p>}

                    <div className="invitation-page-layout">
                        <div className="invitation-list-panel">
                            {loading ? (
                                <p className="invitation-page-empty">Đang tải danh sách lời mời...</p>
                            ) : filteredInvitations.length === 0 ? (
                                <p className="invitation-page-empty">Không có lời mời nào</p>
                            ) : (
                                <ul className="invitation-page-list">
                                    {filteredInvitations.map((invite) => {
                                        const invitationId = getInvitationId(invite);
                                        const isCanceledLocally = recentlyCanceledIds.includes(invitationId);
                                        const currentStatus = isCanceledLocally ? 'canceled' : normalizeStatus(invite.status);
                                        const isPending = currentStatus === 'pending';
                                        const canResend = isPending && !isCanceledLocally;
                                        const isActionLoading = actionLoadingId === invitationId;
                                        const invitedUser = invite?.user_id;

                                        return (
                                            <li
                                                key={invitationId}
                                                className={`invitation-page-item ${selectedId === invitationId ? 'active' : ''}`}
                                                onClick={() => setSelectedId(invitationId)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') setSelectedId(invitationId);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="invitation-item-main">
                                                    <p className="invitation-item-name">
                                                        {invitedUser?.fullName || invitedUser?.email || 'Người dùng'}
                                                    </p>
                                                    <p className="invitation-item-email">{invitedUser?.email || 'Không có email'}</p>
                                                    <p className="invitation-item-time">
                                                        {invite?.createdAt
                                                            ? new Date(invite.createdAt).toLocaleString('vi-VN')
                                                            : 'Không có thời gian'}
                                                    </p>
                                                </div>
                                                <span className={`invitation-item-status status-${currentStatus}`}>
                                                    {getStatusLabel(invite.status)}
                                                </span>
                                                <div className="invitation-item-actions">
                                                    <button
                                                        type="button"
                                                        className="invitation-action resend"
                                                        disabled={isActionLoading || !canResend}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleResend(invite);
                                                        }}
                                                    >
                                                        Gửi lại
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="invitation-action cancel"
                                                        disabled={isActionLoading || !isPending}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleCancel(invite);
                                                        }}
                                                    >
                                                        Hủy lời mời
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="invitation-detail-panel">
                            {!selectedId ? (
                                <p className="invitation-page-empty">Chọn một lời mời để xem chi tiết</p>
                            ) : detailLoading ? (
                                <p className="invitation-page-empty">Đang tải chi tiết...</p>
                            ) : !selectedDetail ? (
                                <p className="invitation-page-empty">Không tìm thấy chi tiết lời mời</p>
                            ) : (
                                <div className="invitation-detail-content">
                                    <h3>Chi tiết lời mời</h3>
                                    <p><strong>Người được mời:</strong> {selectedDetail?.user_id?.fullName || selectedDetail?.user_id?.email || '-'}</p>
                                    <p><strong>Email:</strong> {selectedDetail?.user_id?.email || '-'}</p>
                                    <p><strong>Trạng thái:</strong> <span className={`invitation-inline-status status-${normalizeStatus(selectedDetail?.status)}`}>{getStatusLabel(selectedDetail?.status)}</span></p>
                                    <p><strong>Người gửi:</strong> {selectedDetail?.requested_by?.fullName || selectedDetail?.requested_by?.email || '-'}</p>
                                    <p>
                                        <strong>Thời gian gửi:</strong>{' '}
                                        {selectedDetail?.createdAt
                                            ? new Date(selectedDetail.createdAt).toLocaleString('vi-VN')
                                            : '-'}
                                    </p>
                                    {selectedDetail?.responsed_at && (
                                        <p>
                                            <strong>Thời gian phản hồi:</strong>{' '}
                                            {new Date(selectedDetail.responsed_at).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvitationListPage;
