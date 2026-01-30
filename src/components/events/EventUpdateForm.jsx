export function EventUpdateForm({ formData, onChange, onSubmit, updating, onBack, eventTitle }) {
    return (
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>
                Chỉnh sửa: {eventTitle}
            </h2>

            <form onSubmit={onSubmit} style={{ display: 'grid', gap: '24px' }}>
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
                        name="title"
                        value={formData.title}
                        onChange={onChange}
                        placeholder="Nhập tên sự kiện"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(162, 210, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '1rem',
                            color: 'var(--candy-text)',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
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
                        Mô tả
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        placeholder="Nhập mô tả chi tiết về sự kiện"
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(162, 210, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '1rem',
                            color: 'var(--candy-text)',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'Poppins, sans-serif',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
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
                        Địa điểm
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={onChange}
                        placeholder="Nhập địa điểm tổ chức"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '2px solid rgba(162, 210, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '1rem',
                            color: 'var(--candy-text)',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                            name="startAt"
                            value={formData.startAt}
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid rgba(162, 210, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '1rem',
                                color: 'var(--candy-text)',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
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
                            name="endAt"
                            value={formData.endAt}
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid rgba(162, 210, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '1rem',
                                color: 'var(--candy-text)',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                            name="capacity"
                            min="1"
                            value={formData.capacity}
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid rgba(162, 210, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '1rem',
                                color: 'var(--candy-text)',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
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
                            name="status"
                            value={formData.status}
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid rgba(162, 210, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '1rem',
                                color: 'var(--candy-text)',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--candy-skyblue)')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)')}
                        >
                            <option value="draft">Draft (Nháp)</option>
                            <option value="published">Published (Công khai)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
                    <button
                        type="button"
                        onClick={onBack}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '2px solid rgba(162, 210, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            color: 'var(--candy-text)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = 'var(--candy-skyblue)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(162, 210, 255, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={updating}
                        className="card-button"
                        style={{
                            opacity: updating ? 0.6 : 1,
                            cursor: updating ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EventUpdateForm;
