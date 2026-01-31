import '../../styles/EventUpdateForm.css';

export function EventUpdateForm({ formData, onChange, onSubmit, updating, onBack, eventTitle }) {
    return (
        <div className="glass-card event-update-form">
            <h2 className="event-update-title">
                Chỉnh sửa: {eventTitle}
            </h2>

            <form onSubmit={onSubmit} className="event-update-grid">
                <div>
                    <label className="event-update-label">
                        Tên sự kiện <span className="event-update-required">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={onChange}
                        placeholder="Nhập tên sự kiện"
                        className="event-update-input"
                    />
                </div>

                <div>
                    <label className="event-update-label">
                        Mô tả
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        placeholder="Nhập mô tả chi tiết về sự kiện"
                        rows="4"
                        className="event-update-textarea"
                    />
                </div>

                <div>
                    <label className="event-update-label">
                        Nội dung chi tiết
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={onChange}
                        placeholder="Nhập nội dung chi tiết về sự kiện"
                        rows="5"
                        className="event-update-textarea"
                    />
                </div>

                <div>
                    <label className="event-update-label">
                        Thể loại
                    </label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={onChange}
                        placeholder="Ví dụ: Kỹ thuật, Kinh doanh, Thể thao, ..."
                        className="event-update-input"
                    />
                </div>

                <div>
                    <label className="event-update-label">
                        Địa điểm
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={onChange}
                        placeholder="Nhập địa điểm tổ chức"
                        className="event-update-input"
                    />
                </div>

                <div className="event-update-grid-2">
                    <div>
                        <label className="event-update-label">
                            Thời gian bắt đầu <span className="event-update-required">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="startAt"
                            value={formData.startAt}
                            onChange={onChange}
                            className="event-update-input"
                        />
                    </div>

                    <div>
                        <label className="event-update-label">
                            Thời gian kết thúc <span className="event-update-required">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="endAt"
                            value={formData.endAt}
                            onChange={onChange}
                            className="event-update-input"
                        />
                    </div>
                </div>

                <div className="event-update-grid-2">
                    <div>
                        <label className="event-update-label">
                            Sức chứa
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            min="1"
                            value={formData.capacity}
                            onChange={onChange}
                            className="event-update-input"
                        />
                    </div>

                    <div>
                        <label className="event-update-label">
                            Trạng thái
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={onChange}
                            className="event-update-select"
                        >
                            <option value="draft">Draft (Nháp)</option>
                            <option value="published">Published (Công khai)</option>
                        </select>
                    </div>
                </div>

                <div className="event-update-actions">
                    <button
                        type="button"
                        onClick={onBack}
                        className="event-update-cancel"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={updating}
                        className="card-button event-update-submit"
                    >
                        {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EventUpdateForm;
