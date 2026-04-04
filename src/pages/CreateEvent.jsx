import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateEvent.css';
import '../styles/Events.css';
import { unmapEvent } from '../services/dataMappers';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  AlignLeft, 
  Type, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  Tags
} from 'lucide-react';

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
        navigate('/clubEvent');
      }, 2000);
    } catch (err) {
      console.error('❌ Create event error:', err);
      setError(err.message || 'Tạo sự kiện thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page-wrapper">
      <div className="create-event-container">
        <header className="create-event-header">
          <div className="header-badge-premium">Dành cho Leader</div>
          <h1 className="page-main-title">Tạo sự kiện mới</h1>
          <p className="page-subtitle">Sắp xếp các hoạt động thú vị cho câu lạc bộ của bạn</p>
        </header>

        {/* Back button */}
        <div className="create-event-nav">
          <button className="btn-back-soft" onClick={() => navigate('/clubEvent')}>
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
        </div>

        <div className="glass-card-premium create-event-main-card">
          <div className="create-event-card-inner">
            <div className="form-section-header">
              <Plus className="section-icon" />
              <h3>Chi tiết sự kiện</h3>
            </div>

            {success && (
              <div className="toast-success-custom">
                <CheckCircle size={20} />
                <span>Bạn đã tạo sự kiện thành công! Đang quay lại...</span>
              </div>
            )}

            {error && (
              <div className="toast-error-custom">
                <div className="error-icon">!</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-event-form">
              {/* Title */}
              <div className="form-group-modern">
                <label className="label-modern">
                  Tên sự kiện <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Type className="field-icon" size={18} />
                  <input
                    type="text"
                    name="title"
                    placeholder="Ví dụ: Workshop Kỹ năng Giao tiếp 2024"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group-modern">
                <label className="label-modern">
                  Mô tả ngắn <span className="req">*</span>
                </label>
                <div className="input-with-icon align-start">
                  <FileText className="field-icon" size={18} />
                  <textarea
                    name="description"
                    placeholder="Mô tả tóm tắt về sự kiện (hiển thị ở thẻ bên ngoài)"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea-modern"
                    required
                  />
                </div>
              </div>

              {/* Content */}
              <div className="form-group-modern">
                <label className="label-modern">
                  Nội dung chi tiết <span className="req">*</span>
                </label>
                <div className="input-with-icon align-start">
                  <AlignLeft className="field-icon" size={18} />
                  <textarea
                    name="content"
                    placeholder="Nội dung chi tiết, lịch trình, và thông tin diễn giả..."
                    rows={6}
                    value={formData.content}
                    onChange={handleChange}
                    className="textarea-modern"
                    required
                  />
                </div>
              </div>

              <div className="form-row-modern">
                {/* Category */}
                <div className="form-group-modern">
                  <label className="label-modern">
                    Lĩnh vực <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Tags className="field-icon" size={18} />
                    <input
                      type="text"
                      name="category"
                      placeholder="Giải trí, Kỹ thuật..."
                      value={formData.category}
                      onChange={handleChange}
                      className="input-modern"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="form-group-modern">
                  <label className="label-modern">
                    Địa điểm <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <MapPin className="field-icon" size={18} />
                    <input
                      type="text"
                      name="location"
                      placeholder="Phòng A101, Hội trường..."
                      value={formData.location}
                      onChange={handleChange}
                      className="input-modern"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Public Toggle */}
              <div className="form-group-modern">
                <div className="toggle-container-modern">
                  <div className="toggle-text">
                    <span className="toggle-title">Chế độ hiển thị</span>
                    <span className="toggle-desc">Cho phép thành viên CLB khác và khách vãng lai xem sự kiện</span>
                  </div>
                  <label className="premium-switch">
                    <input
                      type="checkbox"
                      name="public"
                      checked={formData.public}
                      onChange={handleChange}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>
              </div>

              {/* Start and End Time */}
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label className="label-modern">
                    Bắt đầu <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Calendar className="field-icon" size={18} />
                    <input
                      type="datetime-local"
                      name="startAt"
                      value={formData.startAt}
                      onChange={handleChange}
                      className="input-modern"
                      required
                    />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">
                    Kết thúc <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Calendar className="field-icon" size={18} />
                    <input
                      type="datetime-local"
                      name="endAt"
                      value={formData.endAt}
                      onChange={handleChange}
                      className="input-modern"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Capacity and Status */}
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label className="label-modern">Sức chứa tối đa</label>
                  <div className="input-with-icon">
                    <Users className="field-icon" size={18} />
                    <input
                      type="number"
                      name="capacity"
                      min={1}
                      value={formData.capacity}
                      onChange={handleChange}
                      className="input-modern"
                    />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Trạng thái công bố</label>
                  <div className="input-with-icon">
                    <Settings className="field-icon" size={18} />
                    <select
                      name="progressStatus"
                      value={formData.progressStatus}
                      onChange={handleChange}
                      className="select-modern"
                    >
                      <option value={0}>Nháp (Chưa công bố)</option>
                      <option value={1}>Chính thức (Công bố ngay)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Media URLs */}
              <div className="form-group-modern">
                <label className="label-modern">Hình ảnh tiêu đề (URL)</label>
                <div className="input-with-icon">
                  <ImageIcon className="field-icon" size={18} />
                  <input
                    type="text"
                    name="mediaUrls"
                    placeholder="Dán link ảnh tại đây..."
                    value={formData.mediaUrls.join(', ')}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="form-actions-premium">
                <button
                  type="button"
                  onClick={() => navigate('/clubEvent')}
                  className="btn-cancel-glass"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-premium"
                >
                  {loading ? (
                    <span className="loading-content">
                      <div className="mini-spinner"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    <>Tạo sự kiện ngay</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}