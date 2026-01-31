import '../../styles/EmptyEventState.css';

const EmptyEventState = ({ onCreateEvent }) => {
    return (
        <div className="glass-card empty-event">
            <div className="empty-event-icon">
                +
            </div>
            <h3 className="empty-event-title">
                Không có sự kiện nào
            </h3>
            <p className="empty-event-text">
                Tạo sự kiện đầu tiên của bạn ngay bây giờ
            </p>
            <button
                className="card-button"
                onClick={onCreateEvent}
            >
                + Tạo sự kiện
            </button>
        </div>
    );
};

export default EmptyEventState;
