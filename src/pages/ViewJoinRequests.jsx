import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { getUserJoinRequests, cancelJoinRequest } from '../api/userApi';
import { getReceivedInvitations, respondReceivedInvitation } from '../api/invitationApi';
import '../styles/ViewJoinRequests.css';

const ViewJoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailRequest, setDetailRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [invitationActionLoading, setInvitationActionLoading] = useState('');
  // Không cần pendingCancelId nữa

  const parseArrayPayload = (response, keys = []) => {
    if (Array.isArray(response)) return response;
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;

    if (Array.isArray(payload?.data)) return payload.data;
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
      if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    }
    return [];
  };

  const normalizeStatus = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
      if (trimmed === 'pending') return 0;
      if (trimmed === 'approved') return 1;
      if (trimmed === 'rejected') return 2;
      if (trimmed === 'canceled' || trimmed === 'cancelled') return 3;
    }
    return null;
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add body class for styling
  useEffect(() => {
    document.body.classList.add('joinrequests-body');
    return () => {
      document.body.classList.remove('joinrequests-body');
    };
  }, []);

  // Fetch user's join requests
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestRes, inviteRes] = await Promise.allSettled([
          getUserJoinRequests(),
          getReceivedInvitations(),
        ]);

        if (requestRes.status === 'fulfilled') {
          setRequests(parseArrayPayload(requestRes.value, ['requests']));
        } else {
          setRequests([]);
          toast.error(requestRes.reason?.message || 'Không thể tải danh sách yêu cầu');
        }

        if (inviteRes.status === 'fulfilled') {
          setInvitations(parseArrayPayload(inviteRes.value, ['invitations', 'items']));
        } else {
          setInvitations([]);
          toast.error(inviteRes.reason?.response?.data?.message || inviteRes.reason?.message || 'Không thể tải danh sách lời mời');
        }
      } catch (error) {
        console.error('Error fetching join requests:', error);
        toast.error(error?.message || 'Không thể tải danh sách yêu cầu');
        setRequests([]);
        setInvitations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format status text
  const getStatusText = (status) => {
    const normalized = normalizeStatus(status);
    switch (status) {
      case 0:
        return 'Chờ phê duyệt';
      case 1:
        return 'Đã phê duyệt';
      case 2:
        return 'Bị từ chối';
      case 3:
        return 'Đã hủy';
      default:
        switch (normalized) {
          case 0:
            return 'Chờ phê duyệt';
          case 1:
            return 'Đã phê duyệt';
          case 2:
            return 'Bị từ chối';
          case 3:
            return 'Đã hủy';
          default:
            return 'Không xác định';
        }
    }
  };

  // Format status badge color
  const getStatusBadgeClass = (status) => {
    const normalized = normalizeStatus(status);
    switch (status) {
      case 0:
        return 'status-pending';
      case 1:
        return 'status-approved';
      case 2:
        return 'status-rejected';
      case 3:
        return 'status-cancelled';
      default:
        switch (normalized) {
          case 0:
            return 'status-pending';
          case 1:
            return 'status-approved';
          case 2:
            return 'status-rejected';
          case 3:
            return 'status-cancelled';
          default:
            return 'status-unknown';
        }
    }
  };

  const getRequestTypeText = (type) => {
    const typeValue = Number(type);
    if (typeValue === 0) return 'Yêu cầu tham gia';
    if (typeValue === 1) return 'Lời mời';
    return 'Không xác định';
  };

  const getInvitationId = (invite) => invite?._id || invite?.id || invite?.invitationId || '';

  const getInvitationClubId = (invite) => invite?.club_id?._id || invite?.club_id || invite?.club?.id || invite?.clubId || '';

  const getUserDisplayName = (user) => {
    if (!user) return 'N/A';
    if (typeof user === 'string') return user;
    return user.fullName || user.full_name || user.name || user.email || user.username || user._id || user.id || 'N/A';
  };

  const currentItems = activeTab === 'requests' ? requests : invitations;

  const filteredRequests = currentItems.filter((request) => {
    if (statusFilter === 'all') return true;
    return normalizeStatus(request?.status) === Number(statusFilter);
  });

  // Handle cancel request with react-confirm-alert
  const handleCancelRequest = (requestId) => {
    confirmAlert({
      title: 'Xác nhận hủy yêu cầu',
      message: 'Bạn chắc chắn muốn hủy yêu cầu này?',
      buttons: [
        {
          label: 'Xác nhận',
          onClick: async () => {
            setCanceling(requestId);
            try {
              await cancelJoinRequest(requestId);
              setRequests((prev) => prev.filter((req) => req._id !== requestId));
              toast.success('Đã hủy yêu cầu tham gia');
            } catch (error) {
              console.error('Error canceling request:', error);
              toast.error(error?.message || 'Không thể hủy yêu cầu');
            } finally {
              setCanceling(null);
            }
          }
        },
        {
          label: 'Hủy',
          onClick: () => {}
        }
      ],
      closeOnClickOutside: false,
      closeOnEscape: true,
    });
  };

  const handleInvitationResponse = async (invite, nextStatus) => {
    const invitationId = getInvitationId(invite);
    const clubId = getInvitationClubId(invite);

    if (!invitationId) {
      toast.error('Không tìm thấy mã lời mời');
      return;
    }

    if (!clubId) {
      toast.error('Không tìm thấy câu lạc bộ của lời mời');
      return;
    }

    const actionKey = `${invitationId}-${nextStatus}`;
    setInvitationActionLoading(actionKey);

    try {
      const res = await respondReceivedInvitation(invitationId, clubId, nextStatus);
      const serverMessage = res?.data?.message || res?.message;

      setInvitations((prev) =>
        prev.map((item) =>
          getInvitationId(item) === invitationId
            ? { ...item, status: nextStatus, responsed_at: new Date().toISOString() }
            : item
        )
      );

      setDetailRequest((prev) =>
        prev && getInvitationId(prev) === invitationId
          ? { ...prev, status: nextStatus, responsed_at: new Date().toISOString() }
          : prev
      );

      toast.success(serverMessage || (nextStatus === 1 ? 'Đã chấp nhận lời mời' : 'Đã từ chối lời mời'));
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Xử lý lời mời thất bại');
    } finally {
      setInvitationActionLoading('');
    }
  };

  return (
    <div className="joinrequests-container">
      <Container className="py-4">
        {/* Header */}
        <section className="joinrequests-header">
          <h1 className="joinrequests-title">Yêu cầu & lời mời của tôi</h1>
          <p className="joinrequests-subtitle">
            Chuyển tab để xem yêu cầu tham gia đã gửi hoặc lời mời nhận từ câu lạc bộ
          </p>
          <div className="joinrequests-tab-switch" role="tablist" aria-label="Loại danh sách">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'requests'}
              className={`joinrequests-tab-btn ${activeTab === 'requests' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('requests');
                setDetailRequest(null);
              }}
            >
              Yêu cầu đã gửi ({requests.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'invitations'}
              className={`joinrequests-tab-btn ${activeTab === 'invitations' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('invitations');
                setDetailRequest(null);
              }}
            >
              Lời mời đã nhận ({invitations.length})
            </button>
          </div>
          <div className="joinrequests-filter-wrap">
            <label className="joinrequests-filter-label" htmlFor="joinrequests-status-filter">
              Lọc theo trạng thái
            </label>
            <select
              id="joinrequests-status-filter"
              className="joinrequests-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="0">Chờ phê duyệt</option>
              <option value="1">Đã phê duyệt</option>
              <option value="2">Bị từ chối</option>
              <option value="3">Đã hủy</option>
            </select>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="joinrequests-section">
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="joinrequests-label">Đang tải...</p>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <section className="joinrequests-section">
            <div className="glass-panel joinrequests-empty">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">
                {activeTab === 'requests' ? 'Không có yêu cầu nào' : 'Không có lời mời nào'}
              </h3>
              <p className="empty-message">
                Không có yêu cầu phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          </section>
        )}

        {/* Requests List */}
        {!loading && filteredRequests.length > 0 && (
          <section className="joinrequests-section">
            <div className="joinrequests-list">
              {filteredRequests.map((request) => (
                <div key={request._id || request.id} className="joinrequests-card glass-panel">
                  {/* Club Info and Status */}
                  <div className="joinrequests-card-header">
                    <div className="joinrequests-club-info">
                      <h3 className="joinrequests-club-name">
                        {request.club_id?.name || request.club?.name || 'Câu lạc bộ'}
                      </h3>
                      {(request.club_id?.category || request.club?.category) && (
                        <span className="joinrequests-club-category">
                          {request.club_id?.category || request.club?.category}
                        </span>
                      )}
                    </div>
                    <div className={`joinrequests-status ${getStatusBadgeClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="joinrequests-card-body">
                    <div className="joinrequests-detail-row">
                      <span className="joinrequests-label">Ngày gửi</span>
                      <span className="joinrequests-value">
                        {new Date(request.createdAt || request.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {request.role && (
                      <div className="joinrequests-detail-row">
                        <span className="joinrequests-label">Vai trò</span>
                        <span className="joinrequests-value">
                          {request.role === 'member' ? 'Thành viên' : request.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="joinrequests-card-footer">
                    {activeTab === 'requests' && (
                      <button
                        className="btn-cancel-request"
                        onClick={() => handleCancelRequest(request._id)}
                        disabled={normalizeStatus(request.status) !== 0 || canceling === request._id}
                      >
                        {canceling === request._id ? 'Đang hủy...' : normalizeStatus(request.status) === 0 ? 'Hủy yêu cầu' : 'Không thể hủy'}
                      </button>
                    )}
                    <button
                      className="btn-view-detail"
                      onClick={() => setDetailRequest(request)}
                    >
                      Xem chi tiết
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <div className="joinrequests-status-indicator">
                    {normalizeStatus(request.status) === 0 && (
                      <div className="status-icon status-pending-icon">⏳</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {detailRequest && (
          <div className="joinrequests-detail-modal-backdrop" onClick={() => setDetailRequest(null)}>
            <div className="joinrequests-detail-modal glass-panel" onClick={(e) => e.stopPropagation()}>
              <div className="joinrequests-detail-modal-head">
                <h3>Chi tiết yêu cầu</h3>
                <button type="button" className="joinrequests-detail-close" onClick={() => setDetailRequest(null)}>
                  Đóng
                </button>
              </div>

              <div className="joinrequests-detail-grid">
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Mã yêu cầu</span>
                  <span className="joinrequests-value">{detailRequest._id || detailRequest.id || 'N/A'}</span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Loại</span>
                  <span className="joinrequests-value">{getRequestTypeText(detailRequest.type)}</span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Trạng thái</span>
                  <span className={`joinrequests-status ${getStatusBadgeClass(detailRequest.status)}`}>
                    {getStatusText(detailRequest.status)}
                  </span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Câu lạc bộ</span>
                  <span className="joinrequests-value">{detailRequest.club_id?.name || detailRequest.club?.name || 'Câu lạc bộ'}</span>
                </div>
                <div className="joinrequests-detail-item joinrequests-detail-item--full">
                  <span className="joinrequests-label">Nội dung</span>
                  <span className="joinrequests-value">{detailRequest.message || 'Không có nội dung'}</span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Người gửi</span>
                  <span className="joinrequests-value">{getUserDisplayName(detailRequest.requested_by)}</span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Người phản hồi</span>
                  <span className="joinrequests-value">{getUserDisplayName(detailRequest.responsed_by?.fullName) === 'N/A' ? 'Chưa có' : getUserDisplayName(detailRequest.responsed_by)}</span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Ngày gửi</span>
                  <span className="joinrequests-value">
                    {detailRequest.createdAt || detailRequest.created_at
                      ? new Date(detailRequest.createdAt || detailRequest.created_at).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                <div className="joinrequests-detail-item">
                  <span className="joinrequests-label">Thời điểm phản hồi</span>
                  <span className="joinrequests-value">
                    {detailRequest.responsed_at
                      ? new Date(detailRequest.responsed_at).toLocaleString('vi-VN')
                      : 'Chưa phản hồi'}
                  </span>
                </div>
              </div>

              {activeTab === 'invitations' && normalizeStatus(detailRequest.status) === 0 && (
                <div className="joinrequests-detail-actions">
                  <button
                    type="button"
                    className="btn-invite-accept"
                    disabled={invitationActionLoading === `${getInvitationId(detailRequest)}-1`}
                    onClick={() => handleInvitationResponse(detailRequest, 1)}
                  >
                    {invitationActionLoading === `${getInvitationId(detailRequest)}-1` ? 'Đang chấp nhận...' : 'Chấp nhận'}
                  </button>
                  <button
                    type="button"
                    className="btn-invite-reject"
                    disabled={invitationActionLoading === `${getInvitationId(detailRequest)}-2`}
                    onClick={() => handleInvitationResponse(detailRequest, 2)}
                  >
                    {invitationActionLoading === `${getInvitationId(detailRequest)}-2` ? 'Đang từ chối...' : 'Từ chối'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ViewJoinRequests;
