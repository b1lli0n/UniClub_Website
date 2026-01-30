import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';
import { unmapEvent } from '../services/dataMappers';

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        startAt: '',
        endAt: '',
        capacity: 30,
        status: 'draft',
        progressStatus: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // TODO: lấy từ auth/context
    const clubId = '69776c80120c12cc18c813bc';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc2YzgwMTIwYzEyY2MxOGM4MTNiOSIsImlhdCI6MTc2OTYyMjQ5Nn0.799v8HXXSCiVdjVlhZPr8cK-kygJfUDso4nxJrQFqsg';

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            return 'Vui lòng nhập tên sự kiện';
        }
        if (!formData.startAt) {
            return 'Vui lòng chọn thời gian bắt đầu';
        }
        if (!formData.endAt) {
            return 'Vui lòng chọn thời gian kết thúc';
        }
        if (new Date(formData.startAt) >= new Date(formData.endAt)) {
            return 'Thời gian bắt đầu phải trước thời gian kết thúc';
        }
        if (formData.capacity < 1) {
            return 'Sức chứa phải lớn hơn 0';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError('');
            // Map FE format to BE format before sending
            const beData = unmapEvent(formData);
            const data = await createEvent(clubId, token, beData);
            // Success - navigate to events page
            navigate('/events');
        } catch (err) {
            setError(err.message || 'Tạo sự kiện thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <header className="myclub-header">
                    <h1 className="myclub-title">Tạo sự kiện</h1>
                </header>

                {/* Back button */}
                <div style={{ marginBottom: '24px' }}>
                    <button className="card-button" onClick={() => navigate('/events')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ← Quay lại
                    </button>
                </div>

                {/* Form Card */}
                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', color: 'var(--candy-text)' }}>
                            Tạo sự kiện mới
                        </h2>

                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(254, 226, 226, 0.8)',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                color: '#991b1b',
                                marginBottom: '24px',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Title */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    color: 'var(--candy-text)'
                                }}>
                                    Tên sự kiện <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên sự kiện"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        background: 'rgba(255,255,255,0.9)',
                                        fontSize: '0.875rem',
                                        color: 'var(--candy-text)',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    color: 'var(--candy-text)'
                                }}>
                                    Mô tả
                                </label>
                                <textarea
                                    placeholder="Nhập mô tả chi tiết về sự kiện"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        background: 'rgba(255,255,255,0.9)',
                                        fontSize: '0.875rem',
                                        color: 'var(--candy-text)',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    color: 'var(--candy-text)'
                                }}>
                                    Địa điểm
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập địa điểm tổ chức"
                                    value={formData.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        background: 'rgba(255,255,255,0.9)',
                                        fontSize: '0.875rem',
                                        color: 'var(--candy-text)',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Start and End Time */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: 'var(--candy-text)'
                                    }}>
                                        Thời gian bắt đầu <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startAt}
                                        onChange={(e) => handleChange('startAt', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            background: 'rgba(255,255,255,0.9)',
                                            fontSize: '0.875rem',
                                            color: 'var(--candy-text)',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: 'var(--candy-text)'
                                    }}>
                                        Thời gian kết thúc <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endAt}
                                        onChange={(e) => handleChange('endAt', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            background: 'rgba(255,255,255,0.9)',
                                            fontSize: '0.875rem',
                                            color: 'var(--candy-text)',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Capacity and Status */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: 'var(--candy-text)'
                                    }}>
                                        Sức chứa
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={formData.capacity}
                                        onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            background: 'rgba(255,255,255,0.9)',
                                            fontSize: '0.875rem',
                                            color: 'var(--candy-text)',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: 'var(--candy-text)'
                                    }}>
                                        Trạng thái
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            background: 'rgba(255,255,255,0.9)',
                                            fontSize: '0.875rem',
                                            color: 'var(--candy-text)',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="draft">Draft (Nháp)</option>
                                        <option value="published">Published (Công khai)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/events')}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        background: 'rgba(255,255,255,0.9)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--candy-text)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="card-button"
                                    style={{
                                        padding: '10px 20px',
                                        opacity: loading ? 0.6 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? '⏳ Đang tạo...' : 'Tạo sự kiện'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}