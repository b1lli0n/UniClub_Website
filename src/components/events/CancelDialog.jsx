import '../../styles/CancelDialog.css';

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
        <div className="cancel-dialog-overlay">
            <div className="glass-card cancel-dialog-card">
                <h3 className="cancel-dialog-title">
                    Xác nhận hủy sự kiện
                </h3>
                <p className="cancel-dialog-text">
                    Bạn có chắc chắn muốn hủy sự kiện "{eventTitle}"?
                    Thông báo sẽ được gửi đến {registrationsCount} người đã đăng ký.
                </p>

                <div className="cancel-dialog-field">
                    <label className="cancel-dialog-label">
                        Lý do hủy (tùy chọn)
                    </label>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => onChangeReason(e.target.value)}
                        placeholder="Nhập lý do hủy sự kiện..."
                        rows="3"
                        className="cancel-dialog-textarea"
                    />
                </div>

                <div className="cancel-dialog-actions">
                    <button
                        onClick={onClose}
                        disabled={updating}
                        className="cancel-dialog-cancel"
                    >
                        Giữ sự kiện
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={updating}
                        className="cancel-dialog-confirm"
                    >
                        {updating ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelDialog;
