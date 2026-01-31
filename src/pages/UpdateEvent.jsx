import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, updateEvent, cancelEvent } from '../services/api';
import '../styles/UpdateEvent.css';
import { unmapEvent } from '../services/dataMappers';
import StatusBadge from '../components/events/StatusBadge';
import { EventUpdateForm } from '../components/events/EventUpdateForm';
import { DangerZoneCard } from '../components/events/DangerZoneCard';
import { CancelDialog } from '../components/events/CancelDialog';

function UpdateEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrationsCount, setRegistrationsCount] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        location: '',
        startAt: '',
        endAt: '',
        capacity: 0,
        mediaUrls: [],
        status: 'draft',
        progressStatus: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // TODO: lấy từ auth/context
    const clubId = localStorage.getItem('clubId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const data = await getEventDetail(clubId, eventId, token);
                setEvent(data.event);
                setRegistrationsCount(data.registrationsCount || 0);
                setFormData({
                    title: data.event.title,
                    description: data.event.description || '',
                    content: data.event.content || '',
                    category: data.event.category || '',
                    location: data.event.location || '',
                    startAt: data.event.startAt.slice(0, 16),
                    endAt: data.event.endAt.slice(0, 16),
                    capacity: data.event.capacity,
                    mediaUrls: data.event.mediaUrls || [],
                    status: data.event.status,
                    progressStatus: data.event.progressStatus || 'draft'
                });
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load event');
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [eventId, clubId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) return 'Vui lòng nhập tên sự kiện';
        if (!formData.startAt || !formData.endAt) return 'Vui lòng chọn thời gian';
        if (new Date(formData.startAt) >= new Date(formData.endAt)) return 'Thời gian bắt đầu phải trước thời gian kết thúc';
        if (formData.capacity < 1) return 'Sức chứa phải lớn hơn 0';
        return '';
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setUpdating(true);
            setError('');
            // Map FE format to BE format
            const beData = unmapEvent(formData);
            const data = await updateEvent(clubId, eventId, token, beData);
            setEvent(data.event);
            setMessage('Cập nhật thành công!');
            setTimeout(() => {
                setMessage('');
                navigate(`/events/${eventId}`);
            }, 1200);
        } catch (err) {
            setError(err.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEvent = async () => {
        try {
            setUpdating(true);
            setError('');
            const data = await cancelEvent(clubId, eventId, token, { reason: cancelReason });
            setEvent(data.event);
            setMessage(`Đã hủy sự kiện. Thông báo đã gửi: ${data.notificationsSent || 0}`);
            setShowCancelDialog(false);
            setCancelReason('');
            setTimeout(() => {
                setMessage('');
                navigate('/events');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Cancel failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card update-event-loading-card">
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card update-event-error-card">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card update-event-notfound-card">
                        <div className="update-event-notfound-icon">⚠️</div>
                        <h3 className="update-event-notfound-title">
                            Không tìm thấy sự kiện
                        </h3>
                        <p className="update-event-notfound-text">
                            Sự kiện này không tồn tại hoặc đã bị xóa
                        </p>
                        <button className="card-button" onClick={() => navigate('/events')}>
                            ← Quay lại danh sách
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
                    <h1 className="myclub-title">Chỉnh sửa sự kiện</h1>
                </header>

                <div className="update-event-back">
                    <button className="card-button" onClick={() => navigate(`/events/${eventId}`)}>
                        ← Quay lại
                    </button>
                </div>

                {message && (
                    <div className="glass-card update-event-message-card">
                        <p className="update-event-message-text">✓ {message}</p>
                    </div>
                )}
                {error && event && (
                    <div className="glass-card update-event-error-alert">
                        <p className="update-event-error-text">⚠ {error}</p>
                    </div>
                )}

                <div className="glass-card update-event-status-card">
                    <span className="update-event-status-label">
                        Trạng thái hiện tại:
                    </span>
                    <StatusBadge status={event.status} />
                </div>

                <EventUpdateForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleUpdate}
                    updating={updating}
                    onBack={() => navigate(`/events/${eventId}`)}
                    eventTitle={event.title}
                />

                {event.status !== 'canceled' && (
                    <DangerZoneCard
                        registrationsCount={registrationsCount}
                        onOpenDialog={() => setShowCancelDialog(true)}
                    />
                )}

                <CancelDialog
                    open={showCancelDialog}
                    eventTitle={event.title}
                    registrationsCount={registrationsCount}
                    cancelReason={cancelReason}
                    onChangeReason={setCancelReason}
                    onClose={() => setShowCancelDialog(false)}
                    onConfirm={handleCancelEvent}
                    updating={updating}
                />
            </div>
        </div>
    );
}

export default UpdateEventPage;
