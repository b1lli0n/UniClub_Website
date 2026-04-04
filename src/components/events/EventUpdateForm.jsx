import '../../styles/CreateEvent.css';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  AlignLeft, 
  Type, 
  FileText, 
  Settings,
  Tags,
  CheckCircle,
  Save
} from 'lucide-react';

export function EventUpdateForm({ formData, onChange, onSubmit, updating, onBack, eventTitle }) {
    return (
        <div className="glass-card-premium create-event-main-card">
            <div className="create-event-card-inner">
                <div className="form-section-header">
                    <Settings className="section-icon" />
                    <h3>Chỉnh sửa: {eventTitle}</h3>
                </div>

                <form onSubmit={onSubmit} className="create-event-form">
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
                                placeholder="Nhập tên sự kiện"
                                value={formData.title}
                                onChange={onChange}
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
                                placeholder="Nhập mô tả chi tiết về sự kiện"
                                rows={3}
                                value={formData.description}
                                onChange={onChange}
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
                                placeholder="Nhập nội dung chi tiết về sự kiện"
                                rows={6}
                                value={formData.content}
                                onChange={onChange}
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
                                    placeholder="Lĩnh vực..."
                                    value={formData.category}
                                    onChange={onChange}
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
                                    placeholder="Địa điểm tổ chức..."
                                    value={formData.location}
                                    onChange={onChange}
                                    className="input-modern"
                                    required
                                />
                            </div>
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
                                    onChange={onChange}
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
                                    onChange={onChange}
                                    className="input-modern"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity and Status */}
                    <div className="form-row-modern">
                        <div className="form-group-modern">
                            <label className="label-modern">Sức chứa</label>
                            <div className="input-with-icon">
                                <Users className="field-icon" size={18} />
                                <input
                                    type="number"
                                    name="capacity"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={onChange}
                                    className="input-modern"
                                />
                            </div>
                        </div>

                        <div className="form-group-modern">
                            <label className="label-modern">Công bố</label>
                            <div className="input-with-icon">
                                <Settings className="field-icon" size={18} />
                                <select
                                    name="progressStatus"
                                    value={formData.progressStatus}
                                    onChange={onChange}
                                    className="select-modern"
                                >
                                    <option value={0}>Nháp (Lưu trữ)</option>
                                    <option value={1}>Công bố (Hiển thị ngay)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="form-actions-premium">
                        <button
                            type="button"
                            onClick={onBack}
                            className="btn-cancel-glass"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="btn-submit-premium"
                        >
                            {updating ? (
                                <span className="loading-content">
                                    <div className="mini-spinner"></div>
                                    Đang lưu...
                                </span>
                            ) : (
                                <span className="loading-content">
                                    <Save size={18} />
                                    Lưu thay đổi
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EventUpdateForm;
