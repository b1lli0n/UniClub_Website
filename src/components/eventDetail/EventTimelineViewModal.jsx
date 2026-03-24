import React, { useState, useEffect } from 'react';
import { getEventTimeline, getCurrentEventTimeline } from '../../api/eventTimelineApi';
import '../../styles/EventTimelineModal.css';

export default function EventTimelineModal({ eventId, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [currentTimeline, setCurrentTimeline] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await getEventTimeline(eventId);
        const sortedTimeline = Array.isArray(data) 
          ? data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          : Array.isArray(data?.data)
          ? data.data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          : [];
        setTimeline(sortedTimeline);
      } catch (err) {
        console.error('Error fetching timeline:', err);
        setTimeline([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentTimeline = async () => {
      try {
        const data = await getCurrentEventTimeline(eventId);
        setCurrentTimeline(data?.current_timeline || null);
      } catch (err) {
        console.error('Error fetching current timeline:', err);
      }
    };
    
    fetchTimeline();
    
    // Poll current timeline mỗi 20 giây
    const pollInterval = setInterval(() => {
      fetchCurrentTimeline();
    }, 20000);

    // Fetch current timeline ngay lúc mount
    fetchCurrentTimeline();

    return () => clearInterval(pollInterval);
  }, [eventId]);

  const formatTime = (isoDatetime) => {
    if (!isoDatetime) return '--';
    try {
      const date = new Date(isoDatetime);
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoDatetime;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#FFAFCC';
      case 'done':
        return '#A2A2A2';
      case 'upcoming':
      default:
        return '#A2D2FF';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang diễn ra';
      case 'done':
        return 'Đã kết thúc';
      case 'upcoming':
      default:
        return 'Sắp tới';
    }
  };

  return (
    <div className="timeline-modal-overlay" onClick={onClose}>
      <div className="timeline-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="timeline-modal-header">
          <h2>Timeline Sự Kiện</h2>
          <button 
            className="timeline-modal-close" 
            onClick={onClose}
            title="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="timeline-modal-content">
          {loading ? (
            <div className="timeline-modal-loading">Đang tải timeline...</div>
          ) : timeline.length === 0 ? (
            <div className="timeline-modal-empty">Chưa có timeline cho sự kiện này</div>
          ) : (
            <div className="timeline-modal-list">
              {timeline.map((item) => {
                const isActive = currentTimeline?._id === item._id;
                const statusColor = getStatusColor(item.runtime_state);
                
                return (
                  <div key={item._id} className={`timeline-modal-item ${isActive ? 'active' : ''}`}>
                    <div className="timeline-modal-dot">
                      <div 
                        className="timeline-modal-dot-inner"
                        style={{ 
                          background: item.runtime_state === 'active' 
                            ? `radial-gradient(circle, ${statusColor}, ${statusColor}99)`
                            : statusColor,
                          boxShadow: isActive ? `0 0 20px ${statusColor}` : `0 0 0 4px rgba(255, 175, 204, 0.2)`
                        }}
                      />
                    </div>

                    <div className="timeline-modal-item-content">
                      <div className="timeline-modal-status" style={{ color: statusColor }}>
                        {getStatusLabel(item.runtime_state)}
                      </div>
                      <div className="timeline-modal-title">{item.title}</div>
                      <div className="timeline-modal-time">
                        <div>📍 Bắt đầu: {formatTime(item.start_time)}</div>
                        <div>📍 Kết thúc: {formatTime(item.end_time)}</div>
                      </div>
                      {item.description && (
                        <div className="timeline-modal-description">{item.description}</div>
                      )}
                      {item.action_type && (
                        <div className="timeline-modal-action">
                          🏷️ <strong>{item.action_type?.name || item.action_type}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
