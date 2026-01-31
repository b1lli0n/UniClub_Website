import StatusBadge from '../events/StatusBadge';
import '../../styles/EventHeader.css';

const EventHeader = ({ title, status, onBack, onEdit, canEdit }) => {
    return (
        <>
            <header className="myclub-header">
                <h1 className="myclub-title">Chi tiết sự kiện</h1>
            </header>

            <div className="event-header-actions">
                <button className="card-button" onClick={onBack}>
                    ← Quay lại
                </button>
                {canEdit && (
                    <button className="card-button" onClick={onEdit}>
                        ✏️ Chỉnh sửa
                    </button>
                )}
            </div>

            <div className="event-header-main">
                <h2 className="event-header-title">
                    {title}
                </h2>
                <StatusBadge status={status} />
            </div>
        </>
    );
};

export default EventHeader;
