import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import eventApi from '../../api/eventApi';
import { getCurrentUser } from '../../api/authApi';
import { updateProfile } from '../../api/userApi';
import { isValidPhoneNumber } from '../../lib/utils';
import '../../styles/RegistrationModal.css';

// Default avatar logic if needed
const DefaultAvatar = () => (
    <div className="reg-avatar-placeholder">
        <i className="fa-solid fa-user"></i>
    </div>
);

const RegistrationModal = ({ show, onHide, onChanged, eventId, eventTitle, eventImage, isRegistered }) => {
    const [registered, setRegistered] = useState(isRegistered || false);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: null
    });

    useEffect(() => {
        if (isRegistered !== undefined) {
            setRegistered(isRegistered);
        }
        if (show) {
            const user = getCurrentUser();
            if (user) {
                setFormData({
                    name: user.fullName || user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    avatar: user.avatar || null
                });
            }
            setIsEditing(false); // Reset to view mode when opening
        }
    }, [isRegistered, show]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const user = getCurrentUser();
            const userId = user?._id || user?.id || user?.user_id;
            if (!userId) {
                toast.error("Bạn cần đăng nhập để đăng ký!");
                setLoading(false);
                return;
            }

            // If in edit mode, update profile first
            if (isEditing) {
                const phoneTrim = String(formData.phone || '').trim();
                if (phoneTrim && !isValidPhoneNumber(phoneTrim)) {
                    toast.error('Số điện thoại không hợp lệ (10 số, đầu số 03/05/07/08/09)');
                    setLoading(false);
                    return;
                }

                try {
                    await updateProfile({
                        fullName: formData.name,
                        phone: phoneTrim,
                        // email is usually read-only or requires verify, depend on backend
                    });
                    // Update local storage user just in case
                    const updatedUser = { ...user, fullName: formData.name, phone: phoneTrim };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } catch (updateErr) {
                    console.error("Failed to update profile", updateErr);
                    // Decide if we should block registration or just warn
                    // For now, continue but warn
                    // toast.warning("Cập nhật thông tin thất bại, nhưng vẫn đang tiến hành đăng ký...");
                }
            }

            await eventApi.registerForEvent(eventId, userId);
            toast.success("Đăng ký thành công!");
            setRegistered(true);
            if (onChanged) onChanged();

            // Auto close after success
            setTimeout(() => {
                onHide();
            }, 1500);

        } catch (error) {
            console.error("Registration error:", error);
            const msg = error.response?.data?.message || "Đăng ký thất bại.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleUnregister = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const user = getCurrentUser();
            const userId = user?._id || user?.id || user?.user_id;

            if (!userId) {
                toast.error("Bạn cần đăng nhập!");
                setLoading(false);
                return;
            }

            await eventApi.cancelRegistration(eventId, userId);
            toast.info("Đã hủy đăng ký.");
            setRegistered(false);
            if (onChanged) onChanged();
            onHide();

        } catch (error) {
            console.error("Unregister error:", error);
            const msg = error.response?.data?.message || "Hủy đăng ký thất bại.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered dialogClassName="custom-registration-modal">
            <div className="reg-modal-header">
                <h5 className="reg-modal-title">
                    {registered ? 'Thông tin đăng ký' : 'Đăng ký tham gia sự kiện'}
                </h5>
                <button className="reg-close-btn" onClick={onHide}>&times;</button>
            </div>

            <div className="reg-modal-body">
                {/* Event Image Banner */}
                <div className="reg-image-wrapper">
                    <img 
                        src={eventImage 
                            ? (eventImage.startsWith('http') ? eventImage : `http://localhost:5000${eventImage}`) 
                            : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
                        alt={eventTitle} 
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop";
                        }} 
                    />
                </div>

                <div className="reg-event-title">{eventTitle}</div>

                {(registered || isRegistered) ? (
                    <div className="reg-success-message">
                        <div style={{ fontSize: '3rem', color: '#28a745', marginBottom: '1rem' }}>✓</div>
                        <h5>Đã đăng ký thành công</h5>

                        {/* Show info even when registered */}
                        <div className="reg-user-card" style={{ marginTop: '20px' }}>
                            <div className="reg-user-avatar">
                                {formData.avatar ? <img src={formData.avatar} alt="User" /> : <DefaultAvatar />}
                            </div>
                            <div className="reg-user-info">
                                <div className="reg-info-row">
                                    <span className="reg-info-label">Họ và tên:</span>
                                    {formData.name}
                                </div>
                                <div className="reg-info-row">
                                    <span className="reg-info-label">Số điện thoại:</span>
                                    {formData.phone || "---"}
                                </div>
                            </div>
                        </div>

                        <button className="reg-cancel-btn" onClick={handleUnregister} disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "Hủy đăng ký"}
                        </button>
                    </div>
                ) : (
                    <>
                        {isEditing ? (
                            <div className="reg-edit-form">
                                <div className="reg-form-group">
                                    <label className="reg-form-label">Họ và tên</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="reg-form-input"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="reg-form-group">
                                    <label className="reg-form-label">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="reg-form-input"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        maxLength={10}
                                    />
                                </div>
                                <div className="reg-form-group">
                                    <label className="reg-form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="reg-form-input"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled // Usually email is locked
                                        style={{ backgroundColor: '#e9ecef' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* View Mode (Card) */
                            <div className="reg-user-card">
                                <div className="reg-user-avatar">
                                    {formData.avatar ? <img src={formData.avatar} alt="User" /> : <DefaultAvatar />}
                                </div>
                                <div className="reg-user-info">
                                    <div className="reg-info-header">
                                        <h6 className="reg-info-title">Thông tin của bạn</h6>
                                        <i
                                            className="fa-solid fa-pencil reg-edit-icon"
                                            title="Chỉnh sửa thông tin"
                                            onClick={() => setIsEditing(true)}
                                        ></i>
                                    </div>
                                    <div className="reg-info-row">
                                        <span className="reg-info-label">Họ và tên:</span>
                                        {formData.name}
                                    </div>
                                    <div className="reg-info-row">
                                        <span className="reg-info-label">Số điện thoại:</span>
                                        {formData.phone || "---"}
                                    </div>
                                    <div className="reg-info-row">
                                        <span className="reg-info-label">Email:</span>
                                        {formData.email}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button className="reg-submit-btn" onClick={handleRegister} disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner size="sm" animation="border" style={{ marginRight: '5px' }} />
                                    Đang xử lý...
                                </>
                            ) : "Đăng ký"}
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default RegistrationModal;
