import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateEvent.css';
import '../styles/Events.css';
import { unmapEvent } from '../services/dataMappers';

export default function CreateEventPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    location: '',
    startAt: '',
    endAt: '',
    capacity: 30,
    mediaUrls: [],
    public: true,
    progressStatus: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const clubId = localStorage.getItem('clubId');
  const isValidClubId = (value) => (
    value && value !== 'null' && value !== 'undefined'
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity'
        ? parseInt(value) || 1
        : name === 'progressStatus'
          ? parseInt(value)
          : name === 'public'
            ? checked
            : name === 'mediaUrls'
              ? value.split(',').map(item => item.trim()).filter(Boolean)
              : value
    }));
    setError('');
  };

  const validateForm = () => {
    const missingFields = [];

    if (!formData.title.trim()) {
      missingFields.push('Tên sự kiện');
    }
    if (!formData.description.trim()) {
      missingFields.push('Mô tả');
    }
    if (!formData.content.trim()) {
      missingFields.push('Nội dung chi tiết');
    }
    if (!formData.category.trim()) {
      missingFields.push('Công loại');
    }
    if (!formData.location.trim()) {
      missingFields.push('Địa điểm');
    }
    if (!formData.startAt) {
      missingFields.push('Thời gian bắt đầu');
    }
    if (!formData.endAt) {
      missingFields.push('Thời gian kết thúc');
    }

    if (missingFields.length > 0) {
      return `Vui lòng nhập đầy đủ thông tin các trường: ${missingFields.join(', ')}`;
    }

    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      return 'Thời gian bắt đầu phải trước thời gian kết thúc';
    }
    if (formData.capacity < 1) {
      return 'Sức chứa phải lớn hơn 0';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isValidClubId(clubId)) {
      setError('Không tìm thấy Club ID hợp lệ. Vui lòng quay lại Dashboard và chọn CLB.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('📝 Creating event for club:', clubId);

      // Create payload with BE required fields
      const payload = unmapEvent(formData);
      // Add club_id after unmapEvent to ensure it's included
      payload.club_id = clubId;

      console.log('📄 Payload sent to BE:', JSON.stringify(payload, null, 2));

      const endpoints = [
        `http://localhost:5000/api/clubs/${clubId}/events`,
        `http://localhost:5000/api/clubs/${clubId}/events/create`,
        `http://localhost:5000/api/clubs/${clubId}/event`,
        'http://localhost:5000/api/events',
        'http://localhost:5000/api/events/create'
      ];

      let response = null;
      let lastMessage = 'Tạo sự kiện thất bại';

      for (const endpoint of endpoints) {
        console.log('➡️ Try create event:', endpoint);
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break;
        }

        let errorJson = null;
        try {
          errorJson = await response.json();
        } catch (e) {
          errorJson = null;
        }

        lastMessage = errorJson?.message || lastMessage;

        if (response.status !== 404 && !lastMessage.toLowerCase().includes('route')) {
          throw new Error(lastMessage);
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastMessage || 'Tạo sự kiện thất bại');
      }

      const data = await response.json();
      console.log('✅ Event created:', data);

      // Show success message
      setSuccess(true);
      setError('');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } catch (err) {
      console.error('❌ Create event error:', err);
      setError(err.message || 'Tạo sự kiện thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-overlay" />
      <div className="myclub-container">
        <header className="myclub-header">
          <h1 className="myclub-title">createClubEvent</h1>
        </header>

        {/* Back button */}
        <div className="create-event-back">
          <button className="card-button create-event-back-button clubevent-primary-btn" onClick={() => navigate('/clubEvent')}>
            ← Quay lại
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-card create-event-card">
          <div className="create-event-card-inner">
            <h2 className="create-event-title">
              Tạo sự kiện mới
            </h2>

            {success && (
              <div className="create-event-success">
                ✅ Tạo sự kiện thành công! Đang chuyển hướng...
              </div>
            )}

            {error && (
              <div className="create-event-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-event-form">
              {/* Title */}
              <div>
                <label className="create-event-label">
                  Tên sự kiện <span className="create-event-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Nhập tên sự kiện"
                  value={formData.title}
                  onChange={handleChange}
                  className="create-event-input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="create-event-label">
                  Mô tả <span className="create-event-required">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Nhập mô tả chi tiết về sự kiện"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="create-event-textarea"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="create-event-label">
                  Nội dung chi tiết <span className="create-event-required">*</span>
                </label>
                <textarea
                  name="content"
                  placeholder="Nhập nội dung chi tiết về sự kiện"
                  rows={5}
                  value={formData.content}
                  onChange={handleChange}
                  className="create-event-textarea"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="create-event-label">
                  Công loại <span className="create-event-required">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ví dụ: Giải trí, Kỹ thuật, Thể thao, ..."
                  value={formData.category}
                  onChange={handleChange}
                  className="create-event-input"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="create-event-label">
                  Địa điểm <span className="create-event-required">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Nhập địa điểm tổ chức"
                  value={formData.location}
                  onChange={handleChange}
                  className="create-event-input"
                  required
                />
              </div>

              {/* Public */}
              <div className="create-event-checkbox">
                <label className="create-event-label">
                  Công khai
                </label>
                <label className="create-event-toggle">
                  <input
                    type="checkbox"
                    name="public"
                    checked={formData.public}
                    onChange={handleChange}
                  />
                  <span className="create-event-toggle-label">Cho phép mọi người xem</span>
                </label>
              </div>

              {/* Start and End Time */}
              <div className="create-event-grid">
                <div>
                  <label className="create-event-label">
                    Thời gian bắt đầu <span className="create-event-required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startAt"
                    value={formData.startAt}
                    onChange={handleChange}
                    className="create-event-input"
                    required
                  />
                </div>

                <div>
                  <label className="create-event-label">
                    Thời gian kết thúc <span className="create-event-required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endAt"
                    value={formData.endAt}
                    onChange={handleChange}
                    className="create-event-input"
                    required
                  />
                </div>
              </div>

              {/* Capacity and Status */}
              <div className="create-event-grid">
                <div>
                  <label className="create-event-label">
                    Sức chứa
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    min={1}
                    value={formData.capacity}
                    onChange={handleChange}
                    className="create-event-input"
                  />
                </div>

                <div>
                  <label className="create-event-label">
                    Tài liệu
                  </label>
                  <select
                    name="progressStatus"
                    value={formData.progressStatus}
                    onChange={handleChange}
                    className="create-event-select"
                  >
                    <option value={0}>Draft (Nháp)</option>
                    <option value={1}>Completed (Hoàn tất)</option>
                  </select>
                </div>
              </div>

              {/* Media URLs */}
              <div>
                <label className="create-event-label">
                  Media URLs
                </label>
                <input
                  type="text"
                  name="mediaUrls"
                  placeholder="Nhập URL, cách nhau bằng dấu phẩy"
                  value={formData.mediaUrls.join(', ')}
                  onChange={handleChange}
                  className="create-event-input"
                />
              </div>

              {/* Action buttons */}
              <div className="create-event-actions">
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="create-event-cancel"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="card-button create-event-submit"
                >
                  {loading ? '⏳ Đang tạo...' : 'Tạo sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}