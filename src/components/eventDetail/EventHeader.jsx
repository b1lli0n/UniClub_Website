import StatusBadge from '../events/StatusBadge';
import '../../styles/EventDetail.css';
import { ArrowLeft, Edit, Calendar } from 'lucide-react';

const EventHeader = ({ title, status, onBack, onEdit, canEdit }) => {
    return (
        <div className="event-detail-header-premium">
            <div className="header-nav-row">
                <button className="btn-back-soft" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Quay lại</span>
                </button>
                
                <div className="header-actions-right">
                    {canEdit && (
                        <button className="btn-edit-premium" onClick={onEdit}>
                            <Edit size={16} />
                            <span>Chỉnh sửa</span>
                        </button>
                    )}
                </div>
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
                </div>
            </div>
        </div>
    );
};

export default EventHeader;
