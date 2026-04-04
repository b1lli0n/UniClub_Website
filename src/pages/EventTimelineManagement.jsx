import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventTimeline, getCurrentEventTimeline, createTimelineItem, updateTimelineItem, deleteTimelineItem } from '../api/eventTimelineApi';
import { getEventsByClub } from '../api/clubApi';
import EventTimelineForm from '../components/eventDetail/EventTimelineForm';
import { toast } from 'react-toastify';
import '../styles/EventTimelineManagement.css';

export default function EventTimelineManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [currentTimeline, setCurrentTimeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [eventTimeRange, setEventTimeRange] = useState({
    start: null,
    end: null,
    title: ''
  });

  const clubId = localStorage.getItem('clubId');

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEventTimeline(id);
      console.log('Raw timeline data:', data);
      console.log('typeof data:', typeof data);
      console.log('data keys:', Object.keys(data));
      const sortedTimeline = Array.isArray(data?.timelines) 
        ? data.timelines.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        : [];
      const eventFromResponse = data?.event || data?.event_info || data?.eventData || null;
      if (eventFromResponse) {
        setEventTimeRange({
          start: eventFromResponse.start_time || eventFromResponse.startAt || eventFromResponse.start_at || null,
          end: eventFromResponse.end_time || eventFromResponse.endAt || eventFromResponse.end_at || null,
          title: eventFromResponse.title || eventFromResponse.name || ''
        });
      }
        // console.log('Fetched timeline data:', sortedTimeline);
      setTimeline(sortedTimeline);
      setError('');
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError(err.message || 'Không thể tải timeline sự kiện');
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEventTimeRange = useCallback(async () => {
    if (!clubId || !id) return;
    try {
      const response = await getEventsByClub(clubId);
      const eventsData = response?.data || response?.events || response || [];
      const foundEvent = Array.isArray(eventsData)
        ? eventsData.find((event) => event._id === id || event.id === id)
        : null;

      if (foundEvent) {
        setEventTimeRange((prev) => ({
          start: prev.start || foundEvent.start_time || foundEvent.startAt || foundEvent.start_at || null,
          end: prev.end || foundEvent.end_time || foundEvent.endAt || foundEvent.end_at || null,
          title: prev.title || foundEvent.title || foundEvent.name || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching event range:', err);
    }
  }, [clubId, id]);

  const fetchCurrentTimeline = useCallback(async () => {
    try {
      const data = await getCurrentEventTimeline(id);
      setCurrentTimeline(data?.current_timeline || null);
    } catch (err) {
      console.error('Error fetching current timeline:', err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      toast.error('Không tìm thấy sự kiện');
      navigate(-1);
      return;
    }
    
    fetchTimeline();
    fetchEventTimeRange();
    
    // Poll current timeline mỗi 20 giây
    const pollInterval = setInterval(() => {
      fetchCurrentTimeline();
    }, 20000);

    // Fetch current timeline ngay lúc mount
    fetchCurrentTimeline();

    return () => clearInterval(pollInterval);
  }, [id, navigate, fetchTimeline, fetchCurrentTimeline, fetchEventTimeRange]);

  const parseDateTime = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const raw = String(value).trim();
    if (!raw) return null;

    // Handle dd/mm/yyyy hh:mm if backend sends localized text.
    const vnMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
    if (vnMatch) {
      const [, dd, mm, yyyy, hh = '00', min = '00'] = vnMatch;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatTime = (value) => {
    const date = parseDateTime(value);
    if (!date) return '--';

    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
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

  const handleCreateTimeline = async (formData) => {
    try {
      setFormLoading(true);
      const response = await createTimelineItem(id, formData);
      console.log('Create timeline response:', response);
      toast.success('Tạo mốc thời gian thành công!');
      setShowForm(false);
      // Refresh timeline
      fetchTimeline();
    } catch (err) {
      console.error('Error creating timeline:', err);
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes('must be within event')) {
        toast.error('Mốc thời gian phải nằm trong thời gian sự kiện');
      } else {
        toast.error(errorMessage || 'Không thể tạo mốc thời gian');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTimeline = async (formData) => {
    if (!selectedItem?._id) {
      toast.error('Không tìm thấy mốc thời gian để cập nhật');
      return;
    }

    try {
      setFormLoading(true);
      const response = await updateTimelineItem(selectedItem._id, formData);
      console.log('Update timeline response:', response);
      toast.success('Cập nhật mốc thời gian thành công!');
      setShowForm(false);
      setSelectedItem(null);
      // Refresh timeline
      fetchTimeline();
    } catch (err) {
      console.error('Error updating timeline:', err);
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes('must be within event')) {
        toast.error('Mốc thời gian phải nằm trong thời gian sự kiện');
      } else {
        toast.error(errorMessage || 'Không thể cập nhật mốc thời gian');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditForm = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDeleteTimeline = async (item) => {
    if (!item?._id) {
      toast.error('Không tìm thấy timeline để xóa');
      return;
    }

    const confirmed = window.confirm(`Bạn có chắc muốn xóa mốc thời gian "${item.title}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      await deleteTimelineItem(item._id);
      toast.success('Xóa mốc thời gian thành công!');

      setTimeline((prev) => prev.filter((t) => t._id !== item._id));
      if (currentTimeline?._id === item._id) {
        setCurrentTimeline(null);
      }
      if (selectedItem?._id === item._id) {
        setSelectedItem(null);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error deleting timeline:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage || 'Không thể xóa mốc thời gian');
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <div className="timeline-management-page">
        <div className="timeline-management-header">
          <button className="timeline-back-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h1>Timeline Sự Kiện</h1>
        </div>
        <div className="timeline-error-container">
          <p className="timeline-error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-management-page">
      <div className="timeline-management-header">
        <button className="timeline-back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <h1>Timeline Sự Kiện</h1>
        <div className="timeline-header-actions">
          {currentTimeline && <span className="timeline-live-indicator">● Đang diễn ra</span>}
          <button 
            className="timeline-create-btn"
            onClick={() => setShowForm(true)}
            title="Tạo mốc timeline mới"
          >
            ➕ Tạo mốc
          </button>
        </div>
      </div>

      <div className="timeline-management-content">
        {(eventTimeRange.start || eventTimeRange.end) && (
          <div className="timeline-event-range-card">
            <div className="timeline-event-range-title">
              Thời gian sự kiện{eventTimeRange.title ? `: ${eventTimeRange.title}` : ''}
            </div>
            <div className="timeline-event-range-grid">
              <div className="timeline-event-range-item">
                <span className="timeline-event-range-label">Bắt đầu sự kiện</span>
                <span className="timeline-event-range-value">{formatTime(eventTimeRange.start)}</span>
              </div>
              <div className="timeline-event-range-item">
                <span className="timeline-event-range-label">Kết thúc sự kiện</span>
                <span className="timeline-event-range-value">{formatTime(eventTimeRange.end)}</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="timeline-loading-container">
            <p className="timeline-loading-text">Đang tải timeline...</p>
          </div>
        ) : timeline.length === 0 ? (
          <div className="timeline-empty-container">
            <p className="timeline-empty-text">Chưa có timeline cho sự kiện này</p>
          </div>
        ) : (
          <div className="timeline-vertical">
            {timeline.map((item, index) => {
              const isActive = currentTimeline?._id === item._id;
              const statusColor = getStatusColor(item.runtime_state);
              
              return (
                <div key={item._id} className={`timeline-item-vertical ${isActive ? 'active' : ''}`}>
                  <div className="timeline-marker">
                    <div 
                      className="timeline-dot-circle" 
                      style={{ 
                        background: item.runtime_state === 'active' 
                          ? `radial-gradient(circle, ${statusColor}, ${statusColor}99)`
                          : statusColor,
                        boxShadow: isActive ? `0 0 20px ${statusColor}` : `0 0 0 4px rgba(102, 126, 234, 0.2)`
                      }}
                      title={item.title}
                    />
                    {index < timeline.length - 1 && (
                      <div className="timeline-line" />
                    )}
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div>
                        <div className="timeline-status" style={{ color: statusColor }}>
                          {getStatusLabel(item.runtime_state)}
                        </div>
                        <div className="timeline-card-title">{item.title}</div>
                      </div>
                      <div className="timeline-card-actions">
                        {isActive && <span className="timeline-active-badge">ĐANG DIỄN RA</span>}
                        <button 
                          className="timeline-edit-btn"
                          onClick={() => handleOpenEditForm(item)}
                          title="Chỉnh sửa mốc timeline"
                        >
                          ✏️
                        </button>
                        <button
                          className="timeline-delete-btn"
                          onClick={() => handleDeleteTimeline(item)}
                          title="Xóa mốc timeline"
                          disabled={deletingId === item._id}
                        >
                          {deletingId === item._id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </div>

                    <div className="timeline-card-body">
                      <div className="timeline-time-info">
                        <div className="timeline-time-item">
                          <span className="timeline-time-label">Bắt đầu:</span>
                          <span className="timeline-time-value">{formatTime(item.start_time)}</span>
                        </div>
                        <div className="timeline-time-item">
                          <span className="timeline-time-label">Kết thúc:</span>
                          <span className="timeline-time-value">{formatTime(item.end_time)}</span>
                        </div>
                      </div>

                      {item.description && (
                        <div className="timeline-card-description">
                          {item.description}
                        </div>
                      )}

                      {item.action_type && (
                        <div className="timeline-card-meta">
                          <span className="timeline-meta-tag">
                            Loại hành động: <strong>{item.action_type?.name || item.action_type}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <EventTimelineForm
          eventId={id}
          initialData={selectedItem}
          onSubmit={selectedItem ? handleEditTimeline : handleCreateTimeline}
          onCancel={() => {
            setShowForm(false);
            setSelectedItem(null);
          }}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}
