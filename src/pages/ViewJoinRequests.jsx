import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getUserJoinRequests, cancelJoinRequest } from '../api/userApi';
import '../styles/ViewJoinRequests.css';

const ViewJoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add body class for styling
  useEffect(() => {
    document.body.classList.add('joinreques ts-body');
    return () => {
      document.body.classList.remove('joinrequests-body');
    };
  }, []);

  // Fetch user's join requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await getUserJoinRequests();
        console.log('Raw response from API:', response);
        console.log('Response type:', typeof response);
        console.log('Is Array?:', Array.isArray(response));
        
        let allRequests = [];
        
        // Try different ways to extract the array from response
        if (Array.isArray(response)) {
          // Response is directly an array
          allRequests = response;
          console.log('Got array directly from response');
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            // response.data is an array
            allRequests = response.data;
            console.log('Got array from response.data');
          } else if (Array.isArray(response.data.data)) {
            // response.data.data is an array
            allRequests = response.data.data;
            console.log('Got array from response.data.data');
          } else if (Array.isArray(response.data.requests)) {
            // response.data.requests is an array
            allRequests = response.data.requests;
            console.log('Got array from response.data.requests');
          }
        } else if (Array.isArray(response?.requests)) {
          // response.requests is an array (from your attachment)
          allRequests = response.requests;
          console.log('Got array from response.requests');
        }
        
        console.log('All requests extracted:', allRequests);
        console.log('All requests is array?:', Array.isArray(allRequests));
        
        // Filter only pending requests (status = 0)
        const pendingRequests = allRequests.filter(req => req.status === 0);
        console.log('Pending requests after filter:', pendingRequests);
        
        setRequests(pendingRequests);
        
        if (pendingRequests.length === 0 && !loading) {
          console.log('No pending requests found');
          toast.info('Bạn không có yêu cầu tham gia nào đang chờ phê duyệt');
        }
      } catch (error) {
        console.error('Error fetching join requests:', error);
        toast.error(error?.message || 'Không thể tải danh sách yêu cầu');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Format status text
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Chờ phê duyệt';
      case 1:
        return 'Đã phê duyệt';
      case 2:
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  // Format status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 0:
        return 'status-pending';
      case 1:
        return 'status-approved';
      case 2:
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  };

  // Handle cancel request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy yêu cầu này?')) {
      return;
    }

    setCanceling(requestId);
    try {
      await cancelJoinRequest(requestId);
      setRequests(requests.filter(req => req._id !== requestId));
      toast.success('Đã hủy yêu cầu tham gia');
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error(error?.message || 'Không thể hủy yêu cầu');
    } finally {
      setCanceling(null);
    }
  };

  return (
    <div className="joinrequests-container">
      <Container className="py-4">
        {/* Header */}
        <section className="joinrequests-header">
          <h1 className="joinrequests-title">Yêu cầu tham gia đang chờ</h1>
          <p className="joinrequests-subtitle">
            Danh sách các yêu cầu tham gia câu lạc bộ đang chờ phê duyệt
          </p>
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
        {!loading && requests.length === 0 && (
          <section className="joinrequests-section">
            <div className="glass-panel joinrequests-empty">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">Không có yêu cầu nào</h3>
              <p className="empty-message">
                Bạn không có yêu cầu tham gia câu lạc bộ nào đang chờ phê duyệt.
              </p>
            </div>
          </section>
        )}

        {/* Requests List */}
        {!loading && requests.length > 0 && (
          <section className="joinrequests-section">
            <div className="joinrequests-list">
              {requests.map((request) => (
                <div key={request._id} className="joinrequests-card glass-panel">
                  {/* Club Info and Status */}
                  <div className="joinrequests-card-header">
                    <div className="joinrequests-club-info">
                      <h3 className="joinrequests-club-name">
                        {request.club_id?.name || 'Câu lạc bộ'}
                      </h3>
                      {request.club_id?.category && (
                        <span className="joinrequests-club-category">
                          {request.club_id?.category}
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
                    <button
                      className="btn-cancel-request"
                      onClick={() => handleCancelRequest(request._id)}
                      disabled={canceling === request._id}
                    >
                      {canceling === request._id ? 'Đang hủy...' : 'Hủy yêu cầu'}
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <div className="joinrequests-status-indicator">
                    {request.status === 0 && (
                      <div className="status-icon status-pending-icon">⏳</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default ViewJoinRequests;
