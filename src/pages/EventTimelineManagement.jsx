import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventTimeline, getCurrentEventTimeline, createTimelineItem, updateTimelineItem } from '../api/eventTimelineApi';
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

  useEffect(() => {
    if (!id) {
      toast.error('Không tìm thấy sự kiện');
      navigate(-1);
      return;
    }
    
    fetchTimeline();
    
    // Poll current timeline mỗi 20 giây
    const pollInterval = setInterval(() => {
      fetchCurrentTimeline();
    }, 20000);

    // Fetch current timeline ngay lúc mount
    fetchCurrentTimeline();

    return () => clearInterval(pollInterval);
  }, [id, navigate]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const data = await getEventTimeline(id);
      console.log('Raw timeline data:', data);
      console.log('typeof data:', typeof data);
      console.log('data keys:', Object.keys(data));
      const sortedTimeline = Array.isArray(data?.timelines) 
        ? data.timelines.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        : [];
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
  };

  const fetchCurrentTimeline = async () => {
    try {
      const data = await getCurrentEventTimeline(id);
      setCurrentTimeline(data?.current_timeline || null);
    } catch (err) {
      console.error('Error fetching current timeline:', err);
    }
  };

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

  const handleCreateTimeline = async (formData) => {
    try {
      setFormLoading(true);
      const response = await createTimelineItem(id, formData);
      console.log('Create timeline response:', response);
      toast.success('Tạo mốc timeline thành công!');
      setShowForm(false);
      // Refresh timeline
      fetchTimeline();
    } catch (err) {
      console.error('Error creating timeline:', err);
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes('must be within event')) {
        toast.error('Mốc thời gian timeline phải nằm trong thời gian sự kiện');
      } else {
        toast.error(errorMessage || 'Không thể tạo mốc timeline');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTimeline = async (formData) => {
    if (!selectedItem?._id) {
      toast.error('Không tìm thấy mốc timeline để cập nhật');
      return;
    }

    try {
      setFormLoading(true);
      const response = await updateTimelineItem(selectedItem._id, formData);
      console.log('Update timeline response:', response);
      toast.success('Cập nhật mốc timeline thành công!');
      setShowForm(false);
      setSelectedItem(null);
      // Refresh timeline
      fetchTimeline();
    } catch (err) {
      console.error('Error updating timeline:', err);
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes('must be within event')) {
        toast.error('Mốc thời gian timeline phải nằm trong thời gian sự kiện');
      } else {
        toast.error(errorMessage || 'Không thể cập nhật mốc timeline');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditForm = (item) => {
    setSelectedItem(item);
    setShowForm(true);
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
