import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/UpdateEvent.css';
import '../styles/CreateEvent.css';
import { ArrowLeft, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { unmapEvent } from '../services/dataMappers';
import StatusBadge from '../components/events/StatusBadge';
import { EventUpdateForm } from '../components/events/EventUpdateForm';
import { DangerZoneCard } from '../components/events/DangerZoneCard';
import { CancelDialog } from '../components/events/CancelDialog';
import api from '../api/api';

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
        public: true,
        progressStatus: 0
    });
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const clubId = localStorage.getItem('clubId');

    useEffect(() => {
        const loadEvent = async () => {
            if (!clubId) {
                setError('Không tìm thấy Club ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('📄 Loading event:', eventId, 'for club:', clubId);

                const response = await fetch(
                    `http://localhost:5000/api/clubs/${clubId}/events/${eventId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Không thể tải sự kiện');
                }

                const data = await response.json();
                console.log('✅ Event loaded:', data);

                // Handle different response formats
                let eventData = data.event || data;

                setEvent(eventData);
                setRegistrationsCount(eventData.registrations?.length || 0);
                setFormData({
                    title: eventData.title,
                    description: eventData.description || '',
                    content: eventData.content || '',
                    category: eventData.category || '',
                    location: eventData.location || '',
                    startAt: eventData.start_time ? eventData.start_time.slice(0, 16) : '',
                    endAt: eventData.end_time ? eventData.end_time.slice(0, 16) : '',
                    capacity: eventData.capacity || 0,
                    mediaUrls: eventData.media_urls || [],
                    public: eventData.is_public !== undefined ? eventData.is_public : true,
                    progressStatus: eventData.progress_status || 0
                });
                setError('');
            } catch (err) {
                console.error('❌ Load event error:', err);
                setError(err.message || 'Không thể tải sự kiện');
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [eventId, clubId]);

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

            console.log('📝 Updating event:', eventId);

            const beData = unmapEvent(formData);
            console.log('📄 BE data:', beData);

            const response = await fetch(
                `http://localhost:5000/api/clubs/${clubId}/events/${eventId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(beData)
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Cập nhật thất bại');
            }

            const data = await response.json();
            console.log('✅ Event updated:', data);
            setEvent(data.event || data);
            setMessage('Cập nhật thành công!');
            setTimeout(() => {
                setMessage('');
                navigate(`/clubEvent/${eventId}`);
            }, 1200);
        } catch (err) {
            console.error('❌ Update error:', err);
            setError(err.message || 'Cập nhật thất bại');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEvent = async () => {
        try {
            setUpdating(true);
            setError('');

            console.log('🚫 Canceling event:', eventId);

            const response = await api.patch(
                `/clubs/${clubId}/events/${eventId}/cancel`,
                { reason: cancelReason }
            );

            const data = response.data;
            console.log('✅ Event canceled:', data);
            setEvent(data.event || data);
            const notificationsSent = data.notificationsSent || 0;
            setMessage(`Đã hủy sự kiện. Thông báo đã gửi: ${notificationsSent}`);
            toast.success(`Đã hủy sự kiện thành công. Thông báo đã gửi: ${notificationsSent}`);
            setShowCancelDialog(false);
            setCancelReason('');
            setTimeout(() => {
                setMessage('');
                navigate('/events');
            }, 1500);
        } catch (err) {
            console.error('❌ Cancel error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Hủy sự kiện thất bại';
            setError(errorMessage);
            toast.error(errorMessage);
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
                        Đang tải...
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
                        <button className="card-button" onClick={() => navigate('/clubEvent ')}>
                            ← Quay lại danh sách
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (event.status === 'canceled') {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card update-event-notfound-card">
                        <div className="update-event-notfound-icon">🚫</div>
                        <h3 className="update-event-notfound-title">
                            Sự kiện đã bị hủy
                        </h3>
                        <p className="update-event-notfound-text">
                            Trạng thái hiện tại không cho phép chỉnh sửa thông tin.
                        </p>
                        <button className="card-button" onClick={() => navigate(`/clubEvent/${eventId}`)}>
                            ← Quay lại chi tiết
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-event-page-wrapper">
            <div className="create-event-container">
                <header className="create-event-header">
                    <div className="header-badge-premium">Quản lý sự kiện</div>
                    <h1 className="page-main-title">Chỉnh sửa sự kiện</h1>
                    <p className="page-subtitle">Cập nhật thông tin để thu hút nhiều thành viên hơn</p>
                </header>

                <div className="create-event-nav">
                    <button className="btn-back-soft" onClick={() => navigate(`/clubEvent/${eventId}`)}>
                        <ArrowLeft size={18} />
                        <span>Quay lại</span>
                    </button>
                </div>

                {message && (
                    <div className="toast-success-custom">
                        <CheckCircle size={20} />
                        <span>{message}</span>
                    </div>
                )}
                {error && event && (
                    <div className="toast-error-custom">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="glass-card-premium update-event-status-card-modern">
                    <div className="status-label-wrap">
                        <Settings size={18} className="status-icon" />
                        <span className="update-event-status-label">
                            Trạng thái hiện tại:
                        </span>
                    </div>
                    <StatusBadge status={event.status} />
                </div>

                <EventUpdateForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleUpdate}
                    updating={updating}
                    onBack={() => navigate(`/clubEvent/${eventId}`)}
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