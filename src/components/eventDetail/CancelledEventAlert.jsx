import '../../styles/CancelledEventAlert.css';

const CancelledEventAlert = ({ canceledAt, cancelReason, formatDateTime }) => {
    return (
        <div className="glass-card cancelled-event">
            <h3 className="cancelled-event-title">
                ⚠️ Sự kiện đã bị hủy
            </h3>
            <div className="cancelled-event-grid">
                <div>
                    <p className="cancelled-event-label">Thời gian hủy</p>
                    <p className="cancelled-event-value">{formatDateTime(canceledAt)}</p>
                </div>
                {cancelReason && (
                    <div>
                        <p className="cancelled-event-label">Lý do</p>
                        <p className="cancelled-event-value">{cancelReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CancelledEventAlert;
