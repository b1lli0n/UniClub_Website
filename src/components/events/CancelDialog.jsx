export function CancelDialog({
    open,
    eventTitle,
    registrationsCount,
    cancelReason,
    onChangeReason,
    onClose,
    onConfirm,
    updating
}) {
    if (!open) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-card" style={{
                width: '90%',
                maxWidth: '500px',
                padding: '32px',
                animation: 'slideIn 0.3s ease'
            }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
                    Xác nhận hủy sự kiện
                </h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '24px' }}>
                    Bạn có chắc chắn muốn hủy sự kiện "{eventTitle}"?
                    Thông báo sẽ được gửi đến {registrationsCount} người đã đăng ký.
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: 'var(--candy-text)'
                    }}>
                        Lý do hủy (tùy chọn)
                    </label>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => onChangeReason(e.target.value)}
                        placeholder="Nhập lý do hủy sự kiện..."
                        rows="3"
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
                            fontFamily: 'Poppins, sans-serif'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        disabled={updating}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '2px solid rgba(162, 210, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            color: 'var(--candy-text)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: updating ? 'not-allowed' : 'pointer',
                            opacity: updating ? 0.6 : 1
                        }}
                    >
                        Giữ sự kiện
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={updating}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#dc2626',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: updating ? 'not-allowed' : 'pointer',
                            opacity: updating ? 0.6 : 1
                        }}
                    >
                        {updating ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelDialog;
