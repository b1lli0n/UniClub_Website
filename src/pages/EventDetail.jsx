import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getEventsByClub } from '../api/clubApi';
import EventHeader from '../components/eventDetail/EventHeader';
import EventInfoCard from '../components/eventDetail/EventInfoCard';
import CancelledEventAlert from '../components/eventDetail/CancelledEventAlert';
import api from '../api/api';
import '../styles/EventDetail.css';
import { 
  ArrowLeft, 
  Settings, 
  Calendar, 
    Edit,
  Trash2, 
  XCircle, 
  AlertTriangle,
  Send,
  Sparkles
} from 'lucide-react';

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [canceling, setCanceling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Get clubId from localStorage
    const clubId = localStorage.getItem('clubId');

    // Check if current user is leader/organizer
    const isOrganizer = true; // TODO: Check from user role in club

    useEffect(() => {
        const loadDetail = async () => {
            if (!clubId) {
                setError('Không tìm thấy clubId. Vui lòng quay lại Dashboard.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getEventsByClub(clubId);
                console.log('✅ Events response:', response);
                const eventsData = response?.data || response?.events || response || [];

                // Find event by ID
                const foundEvent = Array.isArray(eventsData) ? eventsData.find(e => e._id === eventId || e.id === eventId) : null;

                if (foundEvent) {
                    setEvent(foundEvent);
                    setError('');
                } else {
                    setError('Sự kiện không tồn tại');
                }
            } catch (err) {
                console.error('❌ Failed to load event detail:', err);
                setError(err.message || 'Không thể tải chi tiết sự kiện');
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [eventId, clubId]);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCancelWholeEvent = async () => {
        if (!cancelReason.trim()) {
            toast.warning('Vui lòng nhập lý do hủy sự kiện');
            return;
        }

        try {
            setCanceling(true);
            await api.patch(
                `/clubs/${clubId}/events/${eventId}/cancel`,
                { reason: cancelReason }
            );

            toast.success('Hủy sự kiện thành công!');
            setShowCancelDialog(false);
            // Reload event data
            window.location.reload();
        } catch (err) {
            console.error('❌ Cancel event error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Không thể hủy sự kiện';
            toast.error(errorMessage);
        } finally {
            setCanceling(false);
        }
    };

    if (loading) {
        return (
            <div className="event-detail-page-wrapper">
                <div className="event-detail-container">
                    <div className="glass-card-premium loading-placeholder-premium">
                        <div className="mini-spinner-large"></div>
                        <p>Đang tải thông tin sự kiện...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-detail-page-wrapper">
                <div className="event-detail-container">
                    <div className="glass-card-premium error-placeholder-premium">
                        <XCircle size={48} className="error-icon-red" />
                        <h3 className="error-title-modern">{error}</h3>
                        <button className="btn-back-soft mt-4" onClick={() => navigate(-1)}>
                            <ArrowLeft size={18} />
                            <span>Quay lại</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-detail-page-wrapper">
                <div className="event-detail-container">
                    <div className="glass-card-premium error-placeholder-premium">
                        <AlertTriangle size={48} className="icon-warning-orange" />
                        <h3 className="error-title-modern">Không tìm thấy sự kiện</h3>
                        <p className="error-desc-modern">Sự kiện này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
                        <button className="btn-back-soft mt-4" onClick={() => navigate(`/clubEvent`)}>
                            <ArrowLeft size={18} />
                            <span>Quay lại</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="event-detail-page-wrapper">
            <div className="event-detail-container">
                <EventHeader
                    title={event.title}
                    status={event.status}
                    progressStatus={event.progress_status}
                    onBack={() => navigate(-1)}
                />

                <div className="event-detail-content-row">
                    <EventInfoCard
                        event={event}
                        registrationsCount={event.registrations?.length || 0}
                        formatDateTime={formatDateTime}
                    />
                </div>

                <div className="event-action-center-premium">
                    <div className="action-center-inner">
                        <div className="action-text-wrap">
                            <Sparkles size={20} className="action-icon-pink" />
                            <div className="action-labels">
                                <p className="action-title-main">Trung tâm điều phối</p>
                                <p className="action-subtitle-main">Đăng ký tham gia hoặc quản lý tiến độ sự kiện</p>
                            </div>
                        </div>

                        <div className="action-buttons-group">
                            <button
                                className="btn-secondary-glass"
                                onClick={() => navigate(`/clubEvent/${eventId}/event-timeline-management`)}
                            >
                                <Calendar size={18} />
                                <span>Xem lịch trình</span>
                            </button>

                            {event.status !== 'canceled' && (
                                <button
                                    className="btn-edit-premium"
                                    onClick={() => navigate(`/clubEvent/${eventId}/update`)}
                                >
                                    <Edit size={16} />
                                    <span>Chỉnh sửa</span>
                                </button>
                            )}

                            {isOrganizer && event.status !== 'canceled' && (
                                <button
                                    className="btn-danger-solid-premium"
                                    onClick={() => setShowCancelDialog(true)}
                                >
                                    <Trash2 size={18} />
                                    <span>Hủy sự kiện</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {showCancelDialog && (
                    <div className="modal-overlay-premium" onClick={() => setShowCancelDialog(false)}>
                        <div className="glass-card-premium modal-content-modern" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-premium">
                                <AlertTriangle size={24} className="icon-warning-orange" />
                                <h3>Xác nhận hủy sự kiện</h3>
                                <button className="btn-close-glass" onClick={() => setShowCancelDialog(false)}>
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="modal-body-premium">
                                <p className="modal-warning-text">
                                    Bạn có chắc chắn muốn hủy sự kiện <strong>"{event.title}"</strong>? 
                                    Hành động này sẽ gửi thông báo đến tất cả thành viên đã đăng ký và không thể hoàn tác.
                                </p>

                                <div className="form-group-modern mt-6">
                                    <label className="label-modern">Lý do hủy sự kiện <span className="req">*</span></label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Vui lòng nhập lý do cụ thể..."
                                        rows={4}
                                        className="textarea-modern"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer-premium">
                                <button className="btn-cancel-glass" onClick={() => setShowCancelDialog(false)}>
                                    Hủy bỏ
                                </button>
                                <button
                                    className="btn-danger-solid-premium"
                                    onClick={handleCancelWholeEvent}
                                    disabled={canceling || !cancelReason.trim()}
                                >
                                    {canceling ? (
                                        <div className="mini-spinner"></div>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Xác nhận & Gửi thông báo</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {event.status === 'canceled' && event.canceledAt && (
                    <CancelledEventAlert
                        canceledAt={event.canceledAt}
                        cancelReason={event.cancelReason}
                        formatDateTime={formatDateTime}
                    />
                )}
            </div>
        </div>
    );
}