import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
// import { isRegistered, registerEvent, unregisterEvent } from '../data/eventLocalStore';
// import '../styles/RegistrationModal.css';

const RegistrationModal = ({ show, onHide, onChanged, eventId, eventTitle }) => {
    const [registered, setRegistered] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (eventId) {
            setRegistered(isRegistered(eventId));
        }
    }, [eventId, show]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (eventId) {
            registerEvent(eventId);
            setRegistered(true);
            onChanged && onChanged();
            setTimeout(() => {
                onHide();
            }, 1500);
        }
    };

    const handleUnregister = () => {
        if (eventId) {
            unregisterEvent(eventId);
            setRegistered(false);
            onChanged && onChanged();
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered className="registration-modal">
            <Modal.Header closeButton>
                <Modal.Title className="registration-modal-title">
                    {registered ? 'Đã đăng ký' : 'Đăng ký sự kiện'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="registration-event-name">{eventTitle}</p>

                {registered ? (
                    <div className="registration-success">
                        <div className="success-icon">✓</div>
                        <p className="success-text">Bạn đã đăng ký thành công!</p>
                        <p className="success-sub">Chúng tôi sẽ gửi thông tin chi tiết qua email.</p>
                    </div>
                ) : (
                    <Form onSubmit={handleRegister}>
                        <Form.Group className="mb-3">
                            <Form.Label className="registration-label">Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Mai An Tiêm"
                                className="registration-input"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="registration-label">Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                className="registration-input"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="registration-label">Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0912 345 678"
                                className="registration-input"
                            />
                        </Form.Group>
                        <Button type="submit" className="registration-submit-btn">
                            Xác nhận đăng ký
                        </Button>
                    </Form>
                )}
            </Modal.Body>
            {registered && (
                <Modal.Footer>
                    <Button
                        variant="outline-danger"
                        onClick={handleUnregister}
                        className="registration-cancel-btn"
                    >
                        Hủy đăng ký
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default RegistrationModal;
