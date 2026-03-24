import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getActionTypes } from '../../api/actionTypesAPI';
import '../../styles/EventTimelineForm.css';

export default function EventTimelineForm({ 
  eventId, 
  onSubmit, 
  onCancel, 
  initialData = null,
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    action_type: ''
  });

  const [errors, setErrors] = useState({});
  const [actionTypes, setActionTypes] = useState([]);
  const [loadingActionTypes, setLoadingActionTypes] = useState(false);

  useEffect(() => {
    fetchActionTypes();
  }, []);

  const fetchActionTypes = async () => {
    try {
      setLoadingActionTypes(true);
      const data = await getActionTypes();
      const typesArray = Array.isArray(data) ? data : data?.data || [];
      setActionTypes(typesArray);
    } catch (err) {
      console.error('Error fetching action types:', err);
      toast.error('Không thể tải danh sách loại hành động');
    } finally {
      setLoadingActionTypes(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        start_time: initialData.start_time ? formatDateTimeForInput(initialData.start_time) : '',
        end_time: initialData.end_time ? formatDateTimeForInput(initialData.end_time) : '',
        action_type: initialData.action_type || ''
      });
    }
  }, [initialData]);

  const formatDateTimeForInput = (isoDateTime) => {
    if (!isoDateTime) return '';
    try {
      const date = new Date(isoDateTime);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Thời gian bắt đầu là bắt buộc';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Thời gian kết thúc là bắt buộc';
    }

    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);

      if (startTime >= endTime) {
        newErrors.end_time = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time:formData.end_time
      };

      // Thêm action_type_id nếu được chọn
      if (formData.action_type) {
        submitData.action_type_id = formData.action_type;
      }

      console.log('📤 Submitting form data:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="timeline-form-overlay">
      <div className="timeline-form-container">
        <div className="timeline-form-header">
          <h2>
            {initialData ? 'Chỉnh sửa mốc timeline' : 'Tạo mốc timeline mới'}
          </h2>
          <button 
            className="timeline-form-close" 
            onClick={onCancel}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="timeline-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Tiêu đề <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề mốc timeline"
              className={`form-input ${errors.title ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả (không bắt buộc)"
              rows="4"
              className="form-textarea"
              disabled={isLoading}
            />
          </div>

          {/* Start Time */}
          <div className="form-group">
            <label htmlFor="start_time" className="form-label">
              Thời gian bắt đầu <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className={`form-input ${errors.start_time ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.start_time && <span className="form-error">{errors.start_time}</span>}
          </div>

          {/* End Time */}
          <div className="form-group">
            <label htmlFor="end_time" className="form-label">
              Thời gian kết thúc <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className={`form-input ${errors.end_time ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.end_time && <span className="form-error">{errors.end_time}</span>}
          </div>

          {/* Action Type */}
          <div className="form-group">
            <label htmlFor="action_type" className="form-label">
              Loại hành động
            </label>
            <select
              id="action_type"
              name="action_type"
              value={formData.action_type}
              onChange={handleInputChange}
              className="form-input"
              disabled={isLoading || loadingActionTypes}
            >
              <option value="">-- Chọn loại hành động --</option>
              {actionTypes.map(type => (
                <option key={type._id || type.id} value={type._id || type.id}>
                  {type.name || type.title}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
