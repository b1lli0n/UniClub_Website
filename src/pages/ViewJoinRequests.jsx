import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getMyJoinRequests, getJoinRequestDetail, cancelJoinRequest } from '../api/clubAPI';

const ViewJoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Lấy tất cả requests của user hiện tại
      const response = await getMyJoinRequests();
      console.log('📋 My Requests response:', response);
      
      let requestsList = [];
      if (Array.isArray(response)) {
        requestsList = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        requestsList = response.data;
      } else if (response && response.requests && Array.isArray(response.requests)) {
        requestsList = response.requests;
      }
      
      setRequests(requestsList);
      if (requestsList.length === 0) {
        toast.info('Bạn chưa gửi yêu cầu tham gia club nào');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('❌ Lỗi khi lấy danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (request) => {
    setDetailLoading(true);
    try {
      // Lấy chi tiết request
      const response = await getJoinRequestDetail(request.clubId || request.club_id, request._id);
      console.log('📄 Request detail:', response);
      setSelectedRequest(response);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      toast.error('❌ Lỗi khi lấy chi tiết yêu cầu');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelRequest = async (request) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy yêu cầu này?')) {
      return;
    }

    try {
      await cancelJoinRequest(request.clubId || request.club_id, request._id);
      toast.success('✅ Đã hủy yêu cầu');
      // Refresh danh sách
      setShowDetailModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error('❌ Lỗi khi hủy yêu cầu');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', text: '⏳ Chờ xử lý' },
      approved: { variant: 'success', text: '✅ Đã chấp thuận' },
      rejected: { variant: 'danger', text: '❌ Bị từ chối' }
    };
    const statusInfo = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">📬 Yêu Cầu Tham Gia Club</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      ) : requests.length === 0 ? (
        <Alert variant="info">
          <strong>Không có yêu cầu nào</strong> - Bạn chưa gửi yêu cầu tham gia club nào
        </Alert>
      ) : (
        <div className="row">
          {requests.map((request) => (
            <div key={request._id} className="col-md-6 col-lg-4 mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-start">
                    <span>{request.clubName || request.club?.name || 'Club không rõ'}</span>
                  </Card.Title>

                  <div className="mb-3">
                    {getStatusBadge(request.status || 'pending')}
                  </div>

                  <Card.Text>
                    <small className="text-muted">
                      📅 Gửi lúc: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </Card.Text>

                  {request.message && (
                    <Card.Text>
                      <strong>Tin nhắn:</strong> {request.message}
                    </Card.Text>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewDetail(request)}
                    >
                      Xem Chi Tiết
                    </Button>
                    {request.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelRequest(request)}
                      >
                        Hủy Yêu Cầu
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi Tiết */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi Tiết Yêu Cầu Tham Gia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
            </div>
          ) : selectedRequest ? (
            <div>
              <div className="mb-3">
                <h5>Club: {selectedRequest.clubName || selectedRequest.club?.name || 'Club không rõ'}</h5>
              </div>

              <div className="mb-3">
                <strong>Trạng Thái:</strong> <br />
                {getStatusBadge(selectedRequest.status || 'pending')}
              </div>

              <div className="mb-3">
                <strong>Ngày Gửi:</strong> <br />
                {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
              </div>

              {selectedRequest.message && (
                <div className="mb-3">
                  <strong>Tin Nhắn:</strong> <br />
                  <p>{selectedRequest.message}</p>
                </div>
              )}

              {selectedRequest.responseMessage && (
                <div className="mb-3">
                  <strong>Phản Hồi:</strong> <br />
                  <Alert variant={selectedRequest.status === 'approved' ? 'success' : 'danger'}>
                    {selectedRequest.responseMessage}
                  </Alert>
                </div>
              )}

              {selectedRequest.respondedAt && (
                <div className="mb-3">
                  <strong>Ngày Phản Hồi:</strong> <br />
                  {new Date(selectedRequest.respondedAt).toLocaleString('vi-VN')}
                </div>
              )}

              {selectedRequest.respondedBy && (
                <div className="mb-3">
                  <strong>Phản Hồi Bởi:</strong> <br />
                  {selectedRequest.respondedBy.name || 'Admin'}
                </div>
              )}
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {selectedRequest && selectedRequest.status === 'pending' && (
            <Button
              variant="danger"
              onClick={() => handleCancelRequest(selectedRequest)}
            >
              Hủy Yêu Cầu
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ViewJoinRequests;
