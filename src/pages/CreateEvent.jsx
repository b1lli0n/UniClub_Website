import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';
import '../styles/CreateEvent.css';
import { unmapEvent } from '../services/dataMappers';

export default function CreateEventPage() {
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
    status: 'draft',
    progressStatus: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TODO: lấy từ auth/context
  const clubId = localStorage.getItem('clubId');
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 1 : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return 'Vui lòng nhập tên sự kiện';
    }
    if (!formData.startAt) {
      return 'Vui lòng chọn thời gian bắt đầu';
    }
    if (!formData.endAt) {
      return 'Vui lòng chọn thời gian kết thúc';
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
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Map FE format to BE format before sending
      const beData = unmapEvent(formData);
      const data = await createEvent(clubId, token, beData);
      // Success - navigate to events page
      navigate('/events');
    } catch (err) {
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
          <h1 className="myclub-title">Tạo sự kiện</h1>
        </header>

        {/* Back button */}
        <div className="create-event-back">
          <button className="card-button create-event-back-button" onClick={() => navigate('/events')}>
            ← Quay lại
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-card create-event-card">
          <div className="create-event-card-inner">
            <h2 className="create-event-title">
              Tạo sự kiện mới
            </h2>

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
                />
              </div>

              {/* Description */}
              <div>
                <label className="create-event-label">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  placeholder="Nhập mô tả chi tiết về sự kiện"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="create-event-textarea"
                />
              </div>

              {/* Content */}
              <div>
                <label className="create-event-label">
                  Nội dung chi tiết
                </label>
                <textarea
                  name="content"
                  placeholder="Nhập nội dung chi tiết về sự kiện"
                  rows={5}
                  value={formData.content}
                  onChange={handleChange}
                  className="create-event-textarea"
                />
              </div>

              {/* Category */}
              <div>
                <label className="create-event-label">
                  Thể loại
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ví dụ: Kỹ thuật, Kinh doanh, Thể thao, ..."
                  value={formData.category}
                  onChange={handleChange}
                  className="create-event-input"
                />
              </div>

              {/* Location */}
              <div>
                <label className="create-event-label">
                  Địa điểm
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Nhập địa điểm tổ chức"
                  value={formData.location}
                  onChange={handleChange}
                  className="create-event-input"
                />
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
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="create-event-select"
                  >
                    <option value="draft">Draft (Nháp)</option>
                    <option value="published">Published (Công khai)</option>
                  </select>
                </div>
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