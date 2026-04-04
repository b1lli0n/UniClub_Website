import StatusBadge from '../events/StatusBadge';
import '../../styles/EventDetail.css';
import { ArrowLeft, Calendar } from 'lucide-react';

const getProgressStatusLabel = (progressStatus) => {
    const value = String(progressStatus ?? '').toLowerCase();
    if (value === '0' || value === 'draft') return 'Nháp';
    if (value === '1' || value === 'completed') return 'Hoàn thành';
    return 'N/A';
};

const EventHeader = ({ title, status, progressStatus, onBack }) => {
    return (
        <div className="event-detail-header-premium">
            <div className="header-nav-row">
                <button className="btn-back-soft" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Quay lại</span>
                </button>
            </div>

            <div className="header-main-title-row">
                <div className="title-text-wrap">
                    <div className="header-badge-premium highlight">
                        <Calendar size={14} />
                        Chi tiết sự kiện
                    </div>
                    <h1 className="event-title-xl">{title}</h1>
                </div>
                <div className="header-status-wrap">
                    <StatusBadge status={status} />
                    {progressStatus !== undefined && progressStatus !== null && (
                        <span className="event-progress-badge">
                            Tiến độ: {getProgressStatusLabel(progressStatus)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventHeader;
