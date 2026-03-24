import '../../styles/EventDetail.css';
import { MapPin, Users, Calendar, User, Info, AlignLeft } from 'lucide-react';

const InfoItem = ({ icon: Icon, label, value, subValue, className }) => (
    <div className={`event-info-item-modern ${className || ''}`}>
        <div className="info-icon-wrapper-premium">
            <Icon size={20} />
        </div>
        <div className="info-content-wrap">
            <p className="info-label-modern">{label}</p>
            <p className="info-value-modern">{value}</p>
            {subValue && <p className="info-subvalue-modern">{subValue}</p>}
        </div>
    </div>
);

const EventInfoCard = ({ event, registrationsCount, formatDateTime }) => {
    const startTime = event.start_time || event.startAt || event.start_at;
    const endTime = event.end_time || event.endAt || event.end_at;
    const registrationDisplay = typeof registrationsCount === 'number' ? registrationsCount : (event.registrations?.length || 0);

    return (
        <div className="glass-card-premium event-main-info-container">
            <div className="event-detail-grid">
                {/* Left side: Description and Content */}
                <div className="event-detail-main-content">
                    <div className="content-section-premium">
                        <div className="section-header-wrap">
                            <Info size={18} className="section-icon-pink" />
                            <h3 className="section-title-premium">Mô tả sự kiện</h3>
                        </div>
                        <p className="description-text-premium">
                            {event.description || 'Không có mô tả chi tiết cho sự kiện này.'}
                        </p>
                    </div>

                    {event.content && (
                        <div className="content-section-premium mt-4">
                            <div className="section-header-wrap">
                                <AlignLeft size={18} className="section-icon-pink" />
                                <h3 className="section-title-premium">Nội dung chi tiết</h3>
                            </div>
                            <div className="rich-content-premium">
                                {event.content}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Event Metadata */}
                <div className="event-detail-sidebar">
                    <div className="sidebar-section-premium">
                        <div className="section-header-wrap mb-4">
                            <h3 className="section-title-premium">Chi tiết bổ sung</h3>
                        </div>
                        
                        <div className="metadata-stack-premium">
                            <InfoItem
                                icon={MapPin}
                                label="Địa điểm"
                                value={event.location || 'Chưa xác định'}
                                className="mb-4"
                            />
                            <InfoItem
                                icon={Calendar}
                                label="Thời gian bắt đầu"
                                value={formatDateTime(startTime)}
                                className="mb-4"
                            />
                            <InfoItem
                                icon={Calendar}
                                label="Thời gian kết thúc"
                                value={formatDateTime(endTime)}
                                className="mb-4"
                            />
                            <InfoItem
                                icon={Users}
                                label="Sức chứa & Đăng ký"
                                value={`${registrationDisplay} / ${event.capacity || 'Không giới hạn'}`}
                                subValue="Thành viên tham gia"
                            />
                        </div>

                        {event.createdBy && (
                            <div className="creator-card-premium mt-6">
                                <p className="creator-label">Người tổ chức</p>
                                <div className="creator-info-wrap">
                                    <div className="creator-avatar-placeholder">
                                        <User size={20} />
                                    </div>
                                    <div className="creator-text">
                                        <p className="creator-name">{event.createdBy.name}</p>
                                        <p className="creator-email">{event.createdBy.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventInfoCard;
